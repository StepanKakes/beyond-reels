#!/usr/bin/env node
// Dosadí značku do projektu reelu: barvy v CSS a písma v assets/fonts. Mění jen tenhle projekt, nikdy plugin.
//   node znacka.mjs <slozka-projektu> [znacka.json]
// Bez souboru se značkou (výchozí $BR_MOJE/znacka.json) nedělá nic, projekt zůstane v barvách Beyond.
//
// znacka.json:
// {
//   "barvy": { "akcent": "#FF0E00", "papir": "#F4F2EE", "tmava": "#111111" },
//   "pisma": { "hlavni": "/cesta/Bold.ttf", "druhe": "/cesta/Serif.ttf" }
// }
// Všechny položky jsou nepovinné. Kity čtou písma z pevných názvů souborů, proto se soubory přepíšou kopií pod těmi názvy.
import fs from "node:fs";
import path from "node:path";

const [projekt, vlastni] = process.argv.slice(2);
if (!projekt) { console.error("Použití: znacka.mjs <slozka-projektu> [znacka.json]"); process.exit(1); }
const moje = process.env.BR_MOJE;
const cesta = vlastni || (moje && path.join(moje, "znacka.json"));
if (!cesta || !fs.existsSync(cesta)) process.exit(0);
const z = JSON.parse(fs.readFileSync(cesta, "utf8"));

const HEX = /^#[0-9a-f]{6}$/i;
const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const PUVODNI = { akcent: "#FF0E00", papir: "#F4F2EE", tmava: "#111111" };
const nahrady = [];
for (const [klic, puvodni] of Object.entries(PUVODNI)) {
  const nova = z.barvy?.[klic];
  if (!nova) continue;
  if (!HEX.test(nova)) { console.error(`Barva ${klic} musí být #RRGGBB, ne ${nova}`); process.exit(1); }
  if (nova.toLowerCase() === puvodni.toLowerCase()) continue;
  nahrady.push([new RegExp(puvodni, "gi"), nova]);
  const [r, g, b] = rgb(puvodni), [nr, ng, nb] = rgb(nova);
  nahrady.push([new RegExp(`\\b${r},(\\s*)${g},(\\s*)${b}\\b`, "g"), `${nr},$1${ng},$2${nb}`]);
}
let zmenenych = 0;
const projdi = (d) => {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (["vendor", "node_modules", "renders", "snapshots", ".git"].includes(e.name)) continue;
    const p = path.join(d, e.name);
    if (e.isDirectory()) { projdi(p); continue; }
    if (!e.name.endsWith(".css")) continue;
    const puvodni = fs.readFileSync(p, "utf8");
    const novy = nahrady.reduce((t, [re, n]) => t.replace(re, n), puvodni);
    if (novy !== puvodni) { fs.writeFileSync(p, novy); zmenenych++; }
  }
};
if (nahrady.length) projdi(projekt);

const fonty = path.join(projekt, "assets/fonts");
const SLOTY = {
  hlavni: ["HN-Bold.ttf", "HN-BoldItalic.ttf", "HN-Medium.ttf", "HN-Regular.ttf"],
  druhe: ["InstrumentSerif-Regular.ttf", "InstrumentSerif-Italic.ttf"],
};
let pisem = 0;
for (const [klic, jmena] of Object.entries(SLOTY)) {
  const zdroj = z.pisma?.[klic];
  if (!zdroj) continue;
  const f = zdroj.replace(/^~(?=\/)/, process.env.HOME);
  if (!fs.existsSync(f)) { console.error(`Písmo ${klic} nenalezeno: ${f}`); process.exit(1); }
  fs.mkdirSync(fonty, { recursive: true });
  for (const j of jmena) fs.copyFileSync(f, path.join(fonty, j));
  pisem++;
}
console.log(`značka: ${zmenenych} CSS souborů, ${pisem} písem`);
