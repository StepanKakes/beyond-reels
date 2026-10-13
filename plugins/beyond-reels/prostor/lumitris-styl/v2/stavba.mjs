// node stavba.mjs <plan>  ->  plany/<plan>.mjs zapíše jako index.html a plany/<plan>.json (pro takt a zvuk)
// Média a glitche musí být v HTML staticky (HyperFrames je čte při načtení), animace dělá js/lumi2.js
import fs from "node:fs";

const jmeno = process.argv[2] || "heaton15";
const plan = (await import(`./plany/${jmeno}.mjs?${Date.now()}`)).default;
const FPS = 24, W = 1440, H = 1080;
const sek = (f) => +(f / FPS).toFixed(4);
const esc = (x) => String(x).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
const jeVideo = (src) => /\.(mp4|mov|webm)$/i.test(src);
const px = (o) => Object.entries(o).filter(([, v]) => v != null).map(([k, v]) => `${k}: ${typeof v === "number" ? v + "px" : v}`).join("; ");

let stopa = 10;
function medium(src, f0, f1, ms = 0, cls = "", id = "") {
  if (!id) id = "m" + stopa;
  if (jeVideo(src)) return `<video ${id ? `id="${id}" ` : ""}class="clip ${cls}" src="${esc(src)}" muted playsinline data-start="${sek(f0)}" data-duration="${sek(f1 - f0)}" data-track-index="${stopa++}" data-media-start="${ms}"></video>`;
  stopa++;
  return `<img ${id ? `id="${id}" ` : ""}class="${cls}" src="${esc(src)}" alt="">`;
}

if (!plan.takt) plan.takt = plan.sceny.map((sc) => [sc.f0, sc.f1, sc.takt ?? 2]);
const sceny = plan.sceny.map((sc, i) => {
  const vnitrek = [];
  const venku = [];
  if (sc.src) vnitrek.push(medium(sc.src, sc.f0, sc.f1, sc.ms, `plne g-${sc.grade ?? "tlum"}`));
  (sc.karty || []).forEach((k, j) => {
    const st = px({ left: k.x, top: k.y, width: k.w, height: k.h, "z-index": k.z });
    vnitrek.push(`<div class="karta ${k.mekka ? "mekka" : ""} ${k.okraj ? "okraj" : ""} ${k.cista ? "cista" : ""}" id="sc${i}k${j}" style="${st}">${medium(k.src, Math.max(sc.f0, k.f - 1), sc.f1, k.ms ?? 0, `g-${k.grade ?? "tlum"}`)}</div>`);
  });
  (sc.okna || []).forEach((o, j) => {
    const st = px({ left: o.cx - o.w / 2, top: o.cy - o.h / 2, width: o.w, height: o.h });
    vnitrek.push(`<div class="okno" id="sc${i}o${j}" style="${st}">${medium(o.src, sc.f0, sc.f1, o.ms ?? 0, `g-${o.grade ?? "tlum"}`)}</div>`);
  });
  if (sc.yt) {
    const y = sc.yt;
    const rady = y.rady.map((r, j) => `<div class="rad" id="sc${i}yt${j}"><img src="${esc(r.av)}" alt=""><div><div class="jm">${esc(r.jmeno)}<span class="kdy">${esc(r.kdy ?? "")}</span></div><div class="tx">${esc(r.text)}</div><div class="lk">&#128077;&#xFE0E; ${r.likes ?? ""}</div></div></div>`).join("");
    venku.push(`<div class="yt" style="${px({ left: y.x, top: y.y, width: y.w })}">${rady}</div>`);
  }
  if (sc.pole) {
    const p = sc.pole;
    venku.push(`<div class="pole" style="${px({ left: p.x, top: p.y, width: p.w })}">${p.av ? `<img src="${esc(p.av)}" alt="">` : `<div style="width: 76px; height: 76px; border-radius: 50%; background: #3A3A3A; flex: none"></div>`}<div class="vstup" id="sc${i}pole"><span class="ph" id="sc${i}ph">${esc(p.placeholder ?? "Přidat komentář…")}</span></div></div>`);
  }
  if (sc.zavorky) vnitrek.push(`<div class="zav" id="sc${i}zav"><i></i><i></i><i></i><i></i></div>`);
  if (sc.serie) {
    const imgs = sc.serie.obrazy.map((src, j) => `<img id="sc${i}ser${j}" class="g-${sc.serie.grade ?? "tlum"}" src="${esc(src)}" alt="" style="visibility: hidden">`).join("");
    vnitrek.push(`<div class="karta" id="sc${i}ser">${imgs}</div>`);
  }
  if (sc.vyrez) {
    const v = sc.vyrez;
    if (v.pruh !== false) venku.push(`<div class="pruh"></div>`);
    vnitrek.push(`<div class="postava" id="sc${i}stin" style="${px({ left: v.x, top: v.y, width: v.w })}"><img src="${esc(v.stinSrc)}" alt=""></div>`);
    vnitrek.push(`<div class="postava" id="sc${i}post" style="${px({ left: v.x, top: v.y, width: v.w })}"><img src="${esc(v.src)}" alt=""></div>`);
  }
  const cls = sc.typ === "platno" ? `platno ${sc.svetle ? "svetle" : ""}` : sc.typ === "vyrez" ? `na-barve ${sc.pozadi ?? ""}` : "";
  return `<div class="sc ${cls}" id="sc${i}">${venku.filter((v) => v.startsWith('<div class="pruh"')).join("")}<div class="kam" id="sc${i}kam">${vnitrek.join("\n          ")}</div>${venku.filter((v) => !v.startsWith('<div class="pruh"')).join("")}</div>`;
}).join("\n        ");

const glitche = (plan.glitche || []).map((g, i) => g.bloky.map((b, j) => {
  const [x, y, w, h, druh] = b;
  const d = druh ?? g.druh ?? "neg";
  const obr = d === "neg" ? `; background-image: url('${esc(b[7] ?? g.img)}'); background-size: ${W}px ${H}px; background-position: ${-x}px ${-y}px` : "";
  return `<div class="gl ${d}" id="gl${i}_${j}" style="${px({ left: x, top: y, width: w, height: h })}${obr}"></div>`;
}).join("")).join("\n        ");

const popisky = (plan.popisky || []).map(([, , html], i) => `<div class="popisek" id="pop${i}">${html}</div>`).join("\n        ");

const html = `<!DOCTYPE html>
<html lang="cs">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=${W}, height=${H}">
    <title>Lumitris v2: ${esc(jmeno)}</title>
    <script src="js/gsap.min.js"></script>
    <script src="js/lumi2.js"></script>
    <link rel="stylesheet" href="lumi2.css">
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-width="${W}" data-height="${H}" data-fps="${FPS}" data-duration="${sek(plan.delka)}">
        ${sceny}
        <div id="texty" style="position: absolute; inset: 0"></div>
        ${glitche}
        <div id="zablesk"></div>
        <div id="grade-cerna"></div>
        <div id="grade-svetla"></div>
        <div id="vineta"></div>
        ${plan.vodoznak !== true ? "" : `<div id="vodoznak"><div class="znak"></div><div><div class="r1">Produced by</div><div class="r2">Beyond</div></div></div>`}
        ${popisky}
    </div>
    <script>
      window.__timelines = window.__timelines || {};
      window.__timelines["main"] = LK2.postav(${JSON.stringify(plan)});
    </script>
  </body>
</html>
`;
fs.writeFileSync("index.html", html);
fs.writeFileSync(`plany/${jmeno}.json`, JSON.stringify(plan, null, 1));
console.log(`index.html = ${jmeno}, ${sek(plan.delka)} s, ${plan.sceny.length} scén, ${(plan.texty || []).length} textů, ${(plan.glitche || []).length} glitchů`);
