// node build.mjs a  ->  src/ukazka-a.html se slovy vloženými ze assets/media/slova_A.json zapíše jako index.html
// projekt má mít jen jeden kořenový index.html, proto se ukázky přepínají buildem
import fs from "node:fs";
const k = (process.argv[2] || "a").toLowerCase();
let h = fs.readFileSync(`src/ukazka-${k}.html`, "utf8");
h = h.replace(/\/\*SLOVA:(\w+)\*\//g, (_, x) => fs.readFileSync(`assets/media/slova_${x}.json`, "utf8").replace(/\s+/g, " "));
// {{výraz}} v atributech: U(i) začátek úseku střihu, T(i) čas slova, F(n) snímky (25 fps)
const sl = h.match(/\/\*SLOVA:(\w+)\*\//);
const strihSoubor = fs.existsSync(`zdroj/strih_${k.toUpperCase()}.json`) ? `zdroj/strih_${k.toUpperCase()}.json` : "zdroj/strih.json";
if (fs.existsSync(strihSoubor)) {
  const ST = JSON.parse(fs.readFileSync(strihSoubor, "utf8"));
  const SL = JSON.parse(fs.readFileSync(`assets/media/slova_${k.toUpperCase()}.json`, "utf8"));
  const U = (i) => ST[i].od, T = (i) => SL.slova[i].t, F = (n) => n / 25, D = SL.delka;
  h = h.replace(/\{\{([^}]+)\}\}/g, (_, x) => String(Math.round(Function("U", "T", "F", "D", "return " + x)(U, T, F, D) * 1000) / 1000));
  h = h.replace("/*STRIH*/", JSON.stringify(ST));
}
fs.writeFileSync("index.html", h);
console.log(`index.html = ukázka ${k}`);
