// node build.mjs <nazev>  ->  src/<nazev>.html zapíše jako index.html (projekt má jen jeden kořenový index.html)
// /*SLOVA*/ nahradí obsahem assets/media/slova_<nazev>.json (zarovnaná slova {slova: [{w, t, e}]})
// {{výraz}} v atributech: T(i) začátek slova i, E(i) konec slova i, F(n) snímky při 30 fps, D délka reelu ze slov
import fs from "node:fs";
const k = process.argv[2] || "komponenty";
let h = fs.readFileSync(`src/${k}.html`, "utf8");
const soubor = `assets/media/slova_${k}.json`;
if (fs.existsSync(soubor)) {
  const SL = JSON.parse(fs.readFileSync(soubor, "utf8"));
  const T = (i) => SL.slova[i].t, E = (i) => SL.slova[i].e, F = (n) => n / 30, D = SL.delka ?? SL.slova.at(-1).e + 0.6;
  h = h.replace(/\{\{([^}]+)\}\}/g, (_, x) => String(Math.round(Function("T", "E", "F", "D", "return " + x)(T, E, F, D) * 1000) / 1000));
  h = h.replace("/*SLOVA*/", JSON.stringify(SL.slova));
}
// <!--MASKY:slozka:prefix--> = img pro každý snímek masky z tools/maska_za_osobou.py (assets/media/<slozka>/000.webp ...)
h = h.replace(/<!--MASKY:([\w-]+):(\w+)-->/g, (_, sl, pre) => fs.readdirSync(`assets/media/${sl}`).filter((f) => /\.(webp|png)$/.test(f)).sort()
  .map((f, i) => `<img id="${pre}${i}" src="assets/media/${sl}/${f}" alt="">`).join(""));
h = h.replace(/\/\*POCET:([\w-]+)\*\//g, (_, sl) => String(fs.readdirSync(`assets/media/${sl}`).filter((f) => /\.(webp|png)$/.test(f)).length));
fs.writeFileSync("index.html", h);
console.log(`index.html = ${k}`);
