#!/usr/bin/env node
// Lokální revizní stránka reelů. Žádné závislosti, jen Node. Poslouchá výhradně na 127.0.0.1.
// Data: $BR_REVIZE_DATA/db/<kolekce>/<id>.json (dá se číst i rukou) a $BR_REVIZE_DATA/media/<soubor>.
// Spouští a ovládá ho revize.mjs, ručně není potřeba.
import http from "node:http";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const KOREN = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.BR_REVIZE_PORT || 4747);
const DATA = process.env.BR_REVIZE_DATA || path.join(os.homedir(), "Documents/beyond-reely/_moje/revize");
const DB = path.join(DATA, "db");
const MEDIA = path.join(DATA, "media");
fs.mkdirSync(DB, { recursive: true });
fs.mkdirSync(MEDIA, { recursive: true });

const ID = /^[\p{L}\p{N}][\p{L}\p{N}._-]{0,150}$/u;
const TYPY = { ".mp4": "video/mp4", ".mov": "video/quicktime", ".webm": "video/webm", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".gif": "image/gif", ".wav": "audio/wav", ".mp3": "audio/mpeg" };
const HOSTY = new Set([`localhost:${PORT}`, `127.0.0.1:${PORT}`]);
const posluchaci = new Set();

const chyba = (kod, zprava) => Object.assign(new Error(zprava), { kod });
const slozka = (kolekce) => {
  if (!ID.test(kolekce)) throw chyba(400, "Neplatný název kolekce");
  return path.join(DB, kolekce);
};
const soubor = (kolekce, id) => {
  if (!ID.test(id)) throw chyba(400, "Neplatné id dokumentu");
  return path.join(slozka(kolekce), id + ".json");
};
const nacti = (f) => { try { return JSON.parse(fs.readFileSync(f, "utf8")); } catch (e) { if (e.code === "ENOENT") return null; throw e; } };
const zapis = (kolekce, id, data) => {
  fs.mkdirSync(slozka(kolekce), { recursive: true });
  const f = soubor(kolekce, id), tmp = `${f}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 1));
  fs.renameSync(tmp, f);
  ohlas(kolekce);
};
const ohlas = (kolekce) => { for (const r of posluchaci) r.write(`event: zmena\ndata: ${JSON.stringify(kolekce)}\n\n`); };
const seznam = (kolekce, filtr) => {
  const d = slozka(kolekce);
  if (!fs.existsSync(d)) return [];
  const out = [];
  for (const n of fs.readdirSync(d)) {
    if (!n.endsWith(".json")) continue;
    const x = nacti(path.join(d, n));
    if (!x) continue;
    if (Object.entries(filtr).every(([k, v]) => String(x[k]) === v)) out.push({ id: n.slice(0, -5), ...x });
  }
  return out;
};

const tridej = (res, kod, data) => {
  res.writeHead(kod, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  res.end(JSON.stringify(data));
};
const telo = (req) => new Promise((ok, ne) => {
  const kusy = []; let n = 0;
  req.on("data", (k) => { n += k.length; if (n > 20e6) { ne(chyba(413, "Dokument je moc velký")); req.destroy(); } else kusy.push(k); });
  req.on("end", () => { try { ok(JSON.parse(Buffer.concat(kusy).toString("utf8") || "{}")); } catch (e) { ne(chyba(400, "Tělo není platný JSON")); } });
  req.on("error", ne);
});

function nahraj(req, res, url) {
  const puvodni = path.basename(url.searchParams.get("nazev") || "soubor");
  const pripona = path.extname(puvodni).toLowerCase();
  if (!TYPY[pripona]) throw chyba(415, `Nepodporovaný typ souboru ${pripona}`);
  const cisty = path.basename(puvodni, path.extname(puvodni)).normalize("NFD").replace(/[^A-Za-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "soubor";
  const jmeno = `${cisty}-${crypto.randomBytes(4).toString("hex")}${pripona}`;
  const cil = path.join(MEDIA, jmeno), tmp = cil + ".tmp";
  const w = fs.createWriteStream(tmp);
  req.pipe(w);
  w.on("finish", () => { fs.renameSync(tmp, cil); tridej(res, 200, { url: `/media/${jmeno}` }); });
  w.on("error", () => { fs.rmSync(tmp, { force: true }); tridej(res, 500, { chyba: "Soubor se nepodařilo uložit" }); });
  req.on("aborted", () => { w.destroy(); fs.rmSync(tmp, { force: true }); });
}

function posliSoubor(req, res, f, typ) {
  let st;
  try { st = fs.statSync(f); } catch (e) { throw chyba(404, "Soubor nenalezen"); }
  const zaklad = { "Content-Type": typ, "Accept-Ranges": "bytes", "Cache-Control": "no-cache" };
  const r = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || "");
  if (r && (r[1] || r[2])) {
    const od = r[1] ? Number(r[1]) : Math.max(0, st.size - Number(r[2]));
    const po = r[1] && r[2] ? Math.min(Number(r[2]), st.size - 1) : st.size - 1;
    if (od > po || od >= st.size) { res.writeHead(416, { "Content-Range": `bytes */${st.size}` }); return res.end(); }
    res.writeHead(206, { ...zaklad, "Content-Length": po - od + 1, "Content-Range": `bytes ${od}-${po}/${st.size}` });
    return fs.createReadStream(f, { start: od, end: po }).pipe(res);
  }
  res.writeHead(200, { ...zaklad, "Content-Length": st.size });
  fs.createReadStream(f).pipe(res);
}

async function obsluz(req, res) {
  // Ochrana proti cizím webům: DNS rebinding (Host) a zápisy z jiného původu (Origin).
  if (!HOSTY.has(req.headers.host || "")) throw chyba(403, "Povolený je jen localhost");
  const puvod = req.headers.origin;
  if (puvod && !HOSTY.has(puvod.replace(/^https?:\/\//, ""))) throw chyba(403, "Cizí původ");

  const url = new URL(req.url, `http://localhost:${PORT}`);
  const cesta = url.pathname.split("/").filter(Boolean).map(decodeURIComponent);
  const m = req.method;

  if (m === "GET" && !cesta.length) return posliSoubor(req, res, path.join(KOREN, "revize.html"), "text/html; charset=utf-8");
  if (cesta[0] === "media" && cesta.length === 2 && m === "GET") {
    const n = path.basename(cesta[1]);
    return posliSoubor(req, res, path.join(MEDIA, n), TYPY[path.extname(n).toLowerCase()] || "application/octet-stream");
  }
  if (cesta[0] !== "api") throw chyba(404, "Nenalezeno");

  if (cesta[1] === "zdravi") return tridej(res, 200, { ok: true, koren: KOREN, data: DATA, pid: process.pid });
  if (cesta[1] === "kdo") return tridej(res, 200, { id: os.userInfo().username });
  if (cesta[1] === "zmeny") {
    res.writeHead(200, { "Content-Type": "text/event-stream", "Cache-Control": "no-store", Connection: "keep-alive" });
    res.write(": spojeno\n\n");
    posluchaci.add(res);
    req.on("close", () => posluchaci.delete(res));
    return;
  }
  if (cesta[1] === "media" && m === "POST") return nahraj(req, res, url);

  if (cesta[1] === "db" && cesta[2]) {
    const [, , kolekce, id] = cesta;
    if (cesta.length === 3) {
      if (m === "GET") return tridej(res, 200, seznam(kolekce, Object.fromEntries(url.searchParams)));
      if (m === "POST") {
        const d = await telo(req);
        const nove = crypto.randomUUID();
        zapis(kolekce, nove, d);
        return tridej(res, 200, { id: nove });
      }
    }
    if (cesta.length === 4) {
      const f = soubor(kolekce, id);
      if (m === "GET") {
        const x = nacti(f);
        if (!x) throw chyba(404, "Dokument neexistuje");
        return tridej(res, 200, { id, ...x });
      }
      if (m === "PUT") { zapis(kolekce, id, await telo(req)); return tridej(res, 200, { id }); }
      if (m === "PATCH") {
        const novy = await telo(req);
        const x = nacti(f);
        if (!x) throw chyba(404, "Dokument neexistuje");
        zapis(kolekce, id, { ...x, ...novy });
        return tridej(res, 200, { id });
      }
      if (m === "DELETE") { fs.rmSync(f, { force: true }); ohlas(kolekce); return tridej(res, 200, { id }); }
    }
  }
  throw chyba(404, "Nenalezeno");
}

const server = http.createServer((req, res) => {
  obsluz(req, res).catch((e) => {
    if (res.headersSent) return res.end();
    tridej(res, e.kod || 500, { chyba: e.kod ? e.message : "Chyba serveru" });
    if (!e.kod) console.error(e);
  });
});
// Spojení se změnami drží otevřené, ať se proxy ani prohlížeč nerozhodnou ho zavřít.
setInterval(() => { for (const r of posluchaci) r.write(": ping\n\n"); }, 25000).unref();
server.on("error", (e) => { console.error(e.code === "EADDRINUSE" ? `Port ${PORT} je obsazený, nastav jiný přes BR_REVIZE_PORT` : e); process.exit(1); });
server.listen(PORT, "127.0.0.1", () => console.log(`Revize běží na http://localhost:${PORT}, data v ${DATA}`));
