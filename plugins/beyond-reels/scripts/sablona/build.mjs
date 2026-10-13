// node build.mjs [reel]  ->  src/reel.html se slovy vloženými ze assets/media/slova_X.json zapíše jako index.html
// projekt má mít jen jeden kořenový index.html, proto se ukázky přepínají buildem
import fs from "node:fs";
const k = (process.argv[2] || "reel").toLowerCase();
const zdroj = fs.existsSync(`src/${k}.html`) ? `src/${k}.html` : `src/ukazka-${k}.html`;
let h = fs.readFileSync(zdroj, "utf8");
h = h.replace(/\/\*SLOVA:(\w+)\*\//g, (_, x) => fs.readFileSync(`assets/media/slova_${x}.json`, "utf8").replace(/\s+/g, " "));
// {{výraz}} v atributech: T(i) čas slova, F(n) snímky (30 fps), D délka sestřihu, K klipy ({beh: [od, do], ...})
const sl = h.match(/\{\{/) && fs.existsSync(`assets/media/slova_${k.toUpperCase()}.json`) ? JSON.parse(fs.readFileSync(`assets/media/slova_${k.toUpperCase()}.json`, "utf8")) : null;
if (sl) {
  const T = (i) => sl.slova[i].t, E = (i) => sl.slova[i].e, F = (n) => n / 30, D = sl.delka, K = sl.klipy || {};
  h = h.replace(/\{\{([^}]+)\}\}/g, (_, x) => String(Math.round(Function("T", "E", "F", "D", "K", "return " + x)(T, E, F, D, K) * 1000) / 1000));
}
fs.writeFileSync("index.html", h);
console.log(`index.html = ${zdroj}`);
