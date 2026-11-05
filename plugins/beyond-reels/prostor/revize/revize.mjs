#!/usr/bin/env node
// Ovládání lokální revize. Server si podle potřeby spustí sám, takže stačí rovnou nahrávat nebo číst.
//   revize start [--otevri]          spustí server, s --otevri i prohlížeč
//   revize stop | stav | url
//   revize nahraj <soubor>...        nahraje video nebo obrázek, vypíše url (ta jde do dokumentu)
//   revize set <kolekce/id> <json|@soubor>     zapíše celý dokument
//   revize update <kolekce/id> <json|@soubor>  doplní pole do dokumentu
//   revize get <kolekce/id>
//   revize list <kolekce>
//   revize query <kolekce> pole=hodnota [pole=hodnota...]
//   revize smaz <kolekce/id>
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn, execFile } from "node:child_process";
import { fileURLToPath } from "node:url";

const KOREN = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.BR_REVIZE_PORT || 4747);
const DATA = process.env.BR_REVIZE_DATA || path.join(os.homedir(), "Documents/beyond-reely/_moje/revize");
const BASE = `http://127.0.0.1:${PORT}`;
const VEREJNA = `http://localhost:${PORT}`;
const PIDF = path.join(DATA, "server.pid");

const konec = (zprava) => { console.error(zprava); process.exit(1); };
const zdravi = async () => {
  try { const r = await fetch(`${BASE}/api/zdravi`, { signal: AbortSignal.timeout(1000) }); return r.ok ? await r.json() : { cizi: true }; }
  catch (e) { return null; }
};
const zastav = async (pid) => {
  try { process.kill(pid); } catch (e) { return; }
  for (let i = 0; i < 30; i++) { if (!(await zdravi())) return; await new Promise((r) => setTimeout(r, 100)); }
};
async function spust() {
  const z = await zdravi();
  if (z?.koren === KOREN) return z;
  if (z?.pid) await zastav(z.pid);          // běží starší verze pluginu, vymění se za aktuální
  else if (z?.cizi) konec(`Na portu ${PORT} běží něco jiného. Nastav jiný port: export BR_REVIZE_PORT=4748`);
  fs.mkdirSync(DATA, { recursive: true });
  const log = fs.openSync(path.join(DATA, "server.log"), "a");
  const d = spawn(process.execPath, [path.join(KOREN, "server.mjs")], { detached: true, stdio: ["ignore", log, log], env: { ...process.env, BR_REVIZE_DATA: DATA, BR_REVIZE_PORT: String(PORT) } });
  d.unref();
  fs.writeFileSync(PIDF, String(d.pid));
  for (let i = 0; i < 50; i++) {
    const h = await zdravi();
    if (h?.koren) return h;
    await new Promise((r) => setTimeout(r, 100));
  }
  konec(`Server se nespustil, viz ${path.join(DATA, "server.log")}`);
}
const volej = async (metoda, cesta, telo) => {
  await spust();
  const r = await fetch(BASE + cesta, { method: metoda, headers: telo ? { "Content-Type": "application/json" } : {}, body: telo ? JSON.stringify(telo) : undefined });
  const j = await r.json();
  if (!r.ok) konec(j.chyba || `HTTP ${r.status}`);
  return j;
};
const dok = (c) => {
  const i = (c || "").indexOf("/");
  if (i < 1 || i === c.length - 1) konec("Čekám kolekce/id, třeba reely/muj-reel-v1");
  return `/api/db/${encodeURIComponent(c.slice(0, i))}/${encodeURIComponent(c.slice(i + 1))}`;
};
const data = (a) => {
  if (!a) konec("Chybí JSON nebo @soubor");
  try { return JSON.parse(a.startsWith("@") ? fs.readFileSync(a.slice(1), "utf8") : a); }
  catch (e) { konec(`Neplatný JSON: ${e.message}`); }
};
const vypis = (x) => console.log(JSON.stringify(x, null, 1));

const [prikaz, ...a] = process.argv.slice(2);
switch (prikaz) {
  case "start": {
    await spust();
    console.log(VEREJNA);
    if (a.includes("--otevri")) execFile("open", [VEREJNA]);
    break;
  }
  case "stop": {
    const z = await zdravi();
    if (z?.pid) { await zastav(z.pid); console.log("Zastaveno"); } else console.log("Neběží");
    fs.rmSync(PIDF, { force: true });
    break;
  }
  case "stav": {
    const z = await zdravi();
    console.log(z?.pid ? `Běží na ${VEREJNA}, data v ${z.data}` : z?.cizi ? `Port ${PORT} drží jiný program` : "Neběží");
    break;
  }
  case "url": await spust(); console.log(VEREJNA); break;
  case "nahraj": {
    if (!a.length) konec("Čekám aspoň jeden soubor");
    await spust();
    for (const f of a) {
      if (!fs.existsSync(f)) konec(`Soubor ${f} neexistuje`);
      const st = fs.statSync(f);
      const r = await fetch(`${BASE}/api/media?nazev=${encodeURIComponent(path.basename(f))}`, { method: "POST", headers: { "Content-Length": String(st.size) }, body: fs.createReadStream(f), duplex: "half" });
      const j = await r.json();
      if (!r.ok) konec(j.chyba || `HTTP ${r.status}`);
      console.log(j.url);
    }
    break;
  }
  case "set": vypis(await volej("PUT", dok(a[0]), data(a[1]))); break;
  case "update": vypis(await volej("PATCH", dok(a[0]), data(a[1]))); break;
  case "get": vypis(await volej("GET", dok(a[0]))); break;
  case "smaz": vypis(await volej("DELETE", dok(a[0]))); break;
  case "list":
  case "query": {
    if (!a[0]) konec("Chybí název kolekce");
    const q = new URLSearchParams();
    for (const p of a.slice(1)) { const i = p.indexOf("="); if (i < 1) konec(`Filtr ${p} není pole=hodnota`); q.set(p.slice(0, i), p.slice(i + 1)); }
    vypis(await volej("GET", `/api/db/${encodeURIComponent(a[0])}${[...q].length ? "?" + q : ""}`));
    break;
  }
  default:
    console.log("Použití: revize start [--otevri] | stop | stav | url | nahraj <soubor>... | set|update <kolekce/id> <json|@soubor> | get|smaz <kolekce/id> | list <kolekce> | query <kolekce> pole=hodnota");
    process.exit(prikaz ? 1 : 0);
}
