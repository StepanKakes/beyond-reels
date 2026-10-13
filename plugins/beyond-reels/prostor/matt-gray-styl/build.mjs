// node build.mjs a  ->  src/ukazka-a.html se slovy vloženými ze assets/media/slova_A.json zapíše jako index.html
// projekt má mít jen jeden kořenový index.html, proto se ukázky přepínají buildem
import fs from "node:fs";
const k = (process.argv[2] || "a").toLowerCase();
let h = fs.readFileSync(`src/ukazka-${k}.html`, "utf8");
h = h.replace(/\/\*SLOVA:(\w+)\*\//g, (_, x) => fs.readFileSync(`assets/media/slova_${x}.json`, "utf8").replace(/\s+/g, " "));
fs.writeFileSync("index.html", h);
console.log(`index.html = ukázka ${k}`);
