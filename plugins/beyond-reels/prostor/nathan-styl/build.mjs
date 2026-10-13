// node build.mjs <plan> [--jentext]  ->  plany/<plan>.json zapíše jako index.html
// Plán popisuje celé video (záběry, okna, texty, glitche, zvuk) ve snímcích a v návrhovém prostoru 1728x720.
// Média musí být v HTML staticky (HyperFrames je čte při načtení), proto je vyrábí build, animace dělá js/nathan-kit.js.
// --jentext: bez médií na černé, pro měření shody textu s originálem
import fs from "node:fs";

const jmeno = process.argv[2] || "replika";
const jenText = process.argv.includes("--jentext");
const plan = JSON.parse(fs.readFileSync(`plany/${jmeno}.json`, "utf8"));
const fps = plan.fps || 30;
const W = plan.w || 1920, H = plan.h || 1080;
const sek = (f) => +(f / fps).toFixed(4);
const esc = (x) => String(x).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
const jeVideo = (src) => /\.(mp4|mov|webm|m4v)$/i.test(src);

let stopa = 10;
const media = (src, f0, f1, ms, id, extra = "") => {
  const casy = `data-start="${sek(f0)}" data-duration="${sek(f1 - f0)}" data-track-index="${stopa++}"`;
  if (jeVideo(src)) return `<video id="${id}" class="clip" src="${esc(src)}" muted playsinline ${casy} data-media-start="${+(ms || 0).toFixed(4)}" ${extra}></video>`;
  return `<img id="${id}" class="clip" src="${esc(src)}" ${casy} ${extra}>`;
};

const zabery = (plan.zabery || []).map((z, i) => {
  if (z.plocha) return `<div id="zp${i}" class="nz-plocha ${z.plocha}"></div>`;
  if (jenText) return `<div id="zw${i}"></div><div id="z${i}"></div>`;
  const styl = z.fit || z.pozice ? ` style="${z.fit ? `object-fit: ${z.fit};` : ""}${z.pozice ? `object-position: ${z.pozice};` : ""}${z.filtr ? `filter: ${z.filtr};` : ""}"` : (z.filtr ? ` style="filter: ${z.filtr}"` : "");
  return `<div id="zw${i}" class="nz-zaber">${media(z.src, z.f0, z.f1, z.ms, "z" + i, styl)}</div>`;
}).join("\n        ");

const okna = (plan.okna || []).map((o, i) => {
  const st = `left: ${o.x}px; top: ${o.y}px; width: ${o.w}px; height: ${o.h}px;${o.rot ? ` rotate: ${o.rot}deg;` : ""}${o.z ? ` z-index: ${o.z};` : ""}`;
  if (jenText) return `<div id="ow${i}"></div>`;
  const styl = o.pozice || o.filtr ? ` style="${o.pozice ? `object-position: ${o.pozice};` : ""}${o.filtr ? `filter: ${o.filtr};` : ""}"` : "";
  return `<div id="ow${i}" class="nz-okno" style="${st}">${media(o.src, o.f0, o.f1, o.ms, "o" + i, styl)}</div>`;
}).join("\n        ");

const zvuk = jenText ? "" : (plan.zvuk || []).map((a, i) =>
  `<audio id="a${i}" src="${esc(a.src)}" data-start="${sek(a.f0 || 0)}" data-duration="${sek(a.f1 ?? plan.delka)}" data-media-start="${a.ms || 0}" data-track-index="${i + 1}" data-volume="${a.hlasitost ?? 1}"></audio>`
).join("\n      ");

// koncepty: vlastní scény (diagram, komentář), markup staticky, ať se ikony načtou před renderem
const ikona = (jm) => `<img src="assets/ikony/${jm}.svg" alt="">`;
const koncepty = (plan.koncepty || []).map((k, i) => {
  if (k.typ === "diagram") {
    const uzly = [k.stred, ...k.vetve];
    const cary = k.vetve.map((v, j) => `<path id="k${i}c${j}" pathLength="1" d="M ${k.stred.x} ${k.stred.y + 230} C ${k.stred.x} ${(k.stred.y + v.y) / 2 + 140}, ${v.x} ${(k.stred.y + v.y) / 2}, ${v.x} ${v.y - 30}"></path>`).join("");
    const prazdne = k.vetve.map((v, j) => `<div id="k${i}p${j}" class="nz-uzel prazdny" style="left:${v.x}px; top:${v.y}px"><div class="kruh"></div></div>`).join("");
    const plne = uzly.map((u, j) => `<div id="k${i}u${j}" class="nz-uzel" style="left:${u.x}px; top:${u.y}px">${ikona(u.ikona)}<div class="pop">${esc(u.popisek)}</div></div>`).join("");
    return `<div id="k${i}" class="nz-diagram"><svg class="cary" viewBox="0 0 1920 1080">${cary}</svg>${prazdne}${plne}</div>`;
  }
  if (k.typ === "sedi") {
    const [x, y, w, h] = k.obr;
    return `<div id="k${i}" class="nz-sedi"><img id="k${i}o" src="${esc(k.img)}" alt="" style="left:${x}px; top:${y}px; width:${w}px; height:${h}px"></div>`;
  }
  if (k.typ === "komentar") {
    return `<div id="k${i}" class="nz-komentar"><div class="av"></div><div class="obsah"><div class="jm">${esc(k.jm || "ty")}</div><div class="txt" id="k${i}t"></div></div>${ikona("heart-bold")}</div>`;
  }
  return "";
}).join("\n        ");
const vz = plan.vodoznak;
const znak = (v) => `${v.logo ? `<img src="${esc(v.logo)}" alt="">` : ""}<div><div class="r1">${esc(v.r1 || "")}</div><div class="r2">${esc(v.r2 || "")}</div></div>`;

const html = `<!DOCTYPE html>
<html lang="cs">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=${W}, height=${H}">
    <title>Nathan styl: ${esc(jmeno)}</title>
    <script src="vendor/gsap.min.js"></script>
    <script src="js/nathan-kit.js"></script>
    <link rel="stylesheet" href="nathan-kit.css">
    <style>body { margin: 0; background: var(--nz-cerna); } #root { width: ${W}px; height: ${H}px; }</style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-width="${W}" data-height="${H}" data-fps="${fps}" data-duration="${sek(plan.delka)}">
      ${zvuk}
      <div id="jeviste">
        ${zabery}
        ${okna}
        <div id="glitche" class="nz-vrstva"></div>
        <div id="koncepty" class="nz-vrstva">${jenText ? "" : koncepty}</div>
        <div id="texty" class="nz-vrstva"></div>
        <div id="zablesk" class="nz-zablesk"></div>
        ${plan.letterbox ? `<div id="pruhNahore" class="nz-pruh" style="top: 0"></div><div id="pruhDole" class="nz-pruh" style="bottom: 0"></div>` : ""}
      </div>
    </div>
    <script>
      window.__timelines = window.__timelines || {};
      window.__timelines["main"] = NZ.postav(${JSON.stringify({ ...plan, zabery: (plan.zabery || []).map((z) => (jenText && !z.plocha ? { ...z, zoom: null, posun: null, pruh: null } : z)), okna: jenText ? [] : plan.okna, glitche: jenText ? [] : plan.glitche })});
    </script>
  </body>
</html>
`;
fs.writeFileSync("index.html", html);
console.log(`index.html = ${jmeno}${jenText ? " (jen text)" : ""}, ${sek(plan.delka)} s, ${(plan.texty || []).length} textů`);
