# SooWei kit: API komponent

Soubor `prostor/soowei-styl/js/soowei-kit.js` (`window.SW`), téma `soowei-kit.css` (proměnné `--sw-*`). Před první komponentou
`MK.init(root)` (jádro `js/mason-kit.js`). Časy v sekundách, délky ve snímcích při 30 fps, `SW.R(n)` převede snímky originálu (25 fps).
Velikosti písma jako podíl výšky snímku (1080), polohy `y` jako podíl výšky, vždy na středu x.

## Záběr a pohyb kamery
- `SW.zaber(tl, rodic, media, t, t1)` vrátí kontejner `.sw-zaber` s klipem. Texty záběru kresli do něj, aby se zmenšovaly se zoomem.
- `SW.zoomVen(tl, el, t, o)`: `typ` `hook` (1,55 > 1 za 34 sn. power3.out, doostření 14 px a jas 0,88 > 1,03 > 1), `pomaly` (1,15 za 128 sn. power2.inOut),
  `kalendar` (1,36 za 125 sn.), `karta` (1,67 za 29 sn.), nebo vlastní `od`, `n`, `ease`, `ostri`.
- `SW.klouzani(tl, video, t, o)`: posun `dx` 0,032 šířky, `dy` -0,022 výšky, `s` 1,005 za `n` 30 sn. power2.out, `zaklad` zvětšení (výchozí 1,04, kvůli okrajům).
  Na videu, ne na kontejneru (kontejner posouvá triptych a papír).

## Text
- `SW.jmeno(tl, rodic, "George Heaton", t, {px 0.119, y 0.57, seed, t1})`: písmena v náhodném pořadí ze semínka, 2,4 sn. průhlednost, 7 sn. doostření 12 px.
- `SW.podtitul(tl, rodic, text, t, {px 0.05, y 0.665})`: Instrument Serif, všechna slova naráz 6 sn.
- `SW.titulek(tl, rodic, [{w, t} | {el: img, t}], {px 0.087, y 0.49, tma, t1})`: věta v jednom řádku, slova se odkrývají snímek před `t`.
- `SW.fraze(tl, rodic, [{slova, duraz, t0, t1}], {px 0.069, pxDuraz 0.091, y 0.59, tma, t1})`: běžná fráze naskočí celá, důrazová po slovech Bold,
  slovo s `box: true` dostane červený box (wipe zleva 12 sn.). `t0` a `t1` se dopočítají ze slov a další fráze.
- `SW.pocitadlo(tl, rodic, t, {do, n 20, k 0.183, za, tZa, pred, des, px 0.12, y 0.5, t1})`: hodnota po snímcích (span na snímek), české mezery po tisících,
  rozmazání pohybem SVG filtrem, `za` (jednotka) Instrument Serif naskočí v `tZa`.

## Grafika
- `SW.triptych(tl, rodic, [{media, text, x, y}, {...}], zaber, t, {px 0.068, t1})`: panel 1 roste do třetiny 13 sn. power2.in, panel 2 do dvou třetin 18 sn. power3.out,
  `zaber` (aktuální kontejner) se posune o třetinu. Text panelu s `\n` na dva řádky. Panel je 640 x 1080: videa 4:3 se neořežou svisle, pozor na vypálený text.
- `SW.kalendar(tl, rodic, t, t1, {dny, dnes, od 8, do 19, karty: [{den, od, do, text, cas, vyber}], tVyber})`.
- `SW.karta(tl, rodic, video, t, t1, {nadpis, kroky: [{text, nadpis, t}], seed})`: krok bez `t` je jen popisek na kolejnici.
- `SW.papir(tl, rodic, zaber, t, {nadpis, sirka 0.5, posun 0.2, tah1, tah2, t1})`: šířka papíru i posun záběru jedou po změřené tabulce originálu (48 sn.).
- `SW.popisek(tl, rodic, text, t0, t1)`: jen showcase.

## Pasti
- `.sw-text` je skrytý, dokud ho komponenta nezapne; v panelu triptychu dědí viditelnost panelu.
- Box pod slovem má `z-index: -1` v `isolation: isolate`, linter HyperFrames to i tak hlásí jako varování (neškodí).
- `toLocaleString` v renderu nemá české ICU, počítadlo formátuje samo.
- B-rollové stopy z jiných reelů (např. `b_zac.mp4` z Heatona) mají místy Timův A-roll, černou nebo vypálené titulky. Před použitím kontaktní arch.
