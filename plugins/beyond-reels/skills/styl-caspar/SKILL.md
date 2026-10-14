---
name: styl-caspar
description: Caspar styl reelů Beyond (podle Caspara Tremletta) v HyperFrames: řečí vedený příběh s hodně B-rollem, typografie jako hlavní nástroj důrazu (malé serifové spojky a obří slovo v jedné sestavě, jedno červené slovo, slova kolem hlavy, schody, slovo za hlavou), papírové a červené karty po 2 snímcích, okno s výměnou záběrů, klip zmenšený do rámečku. Použij spolu se skillem reel, když někdo řekne "caspar", "jako Caspar Tremlett" nebo chce talking head insight či klientský příběh, kde nese důraz typografie.
---

# Styl Caspar (Beyond)

Postup výroby (brief, střih, zvuk, revize) je ve skillu `reel`, tady je jazyk a stroj stylu. Nejdřív `$BR_PLUGIN/vkus/pravidla.md`.
Projekt: `$BR_PROSTOR/caspar-styl`, nový reel `zsh $BR_PLUGIN/scripts/novy_reel.sh caspar <nazev>`.
Gramatika a co nepřebíráme: `reference/STYL.md`. API komponent: `reference/komponenty.md`.
Rozbor originálu po snímcích: `$BR_INSPIRACE/caspar/_rozbor/DebbKfoAPPe/SHOTLOG.md` a `ROZBOR.md` (zatím jen jeden reel, konstanty ověřit na dalších).

**Kdy:** talking head insight a klientský příběh, 4:3 1920x1440 30 fps. Hodně řeči (kolem 180 slov za minutu) a obraz ji doslovně dokresluje.

## Gramatika v kostce

- Řeč vede. Střih padá těsně před první slovo věty (hrana do ticha podle hlasitosti), každá věta začíná novým obrazem.
- Podíl jako originál: A-roll kolem 20 až 30 % (jen když Tim kouká do kamery), zbytek B-roll lidí z příběhu a karty se slovem.
- Důraz nese typografie, ne efekt: 4 úrovně velikosti (drobná 4 %, základní 5,6 %, velká 9 %, obří 14,5 % výšky jako výška verzálek),
  Helvetica Neue Bold verzálkami, Casparovy minusky = Instrument Serif rovný (osobní, tišší hlas), jedno červené slovo na záběr.
- Rytmus vlnou: držák, zrychlení, držák. Energii dělají výměny slov uvnitř záběru po 4 až 12 snímcích, ne krátké záběry (záběr aspoň 1,7 s).
- Karty a text na kartách se hýbou po 2 snímcích (`krok: 2`), titulky a sestavy přes záběr plynule.
- Běžná řeč jde titulky Beyond (`BN.titulkyZeSlov` + `CK.titulky`), klíčové věty jako sestava a tam titulek vynech (`bez`). Cíl kolem jedné sestavy na 4 až 6 s.

## Komponenty (`window.CK`, `js/caspar-kit.js`)

| ID | volání | co |
|---|---|---|
| C4 C5 | `CK.sestava(tl, rodic, radky, o)` | dvouúrovňová sestava, slova přibývají s řečí, `akcent`, `serif`, `tma` |
| C17 | `CK.rozhozena(tl, rodic, slova, o)` | slova na jedné výšce, hlava v mezeře |
| C18 | `CK.schody(tl, rodic, radky, o)` | řádky po diagonále vedle hlavy |
| C15 | `CK.vymena(tl, slovo, novy, t, o)` | výměna slova bez resetu sestavy, jde řetězit |
| C2 | `CK.kartaSlova(tl, rodic, radky, t0, t1, o)` | papírová karta slovo po slovu, zoom out, odjezd nahoru |
| C3 | `CK.kartaAkcent(tl, rodic, text, t0, t1, o)` | červená (nebo černá) karta s obřím slovem přes šířku |
| C1 | `CK.okno(tl, rodic, media, t0, t1, o)` | okno na papíře, záběry se mění uvnitř, náhrada Casparova sprintu |
| C8 | `CK.ramecek(tl, rodic, zaber, t, t1, o)` | klip se zmenší do rámečku vlevo, vpravo místo na sestavu |
| C9 | `CK.vlozka(...)`, `CK.punch(...)`, `CK.jmenovka(...)` | vložený klip, punch-in 1,13, červená jmenovka |
| C10 | `CK.oblicejBox(tl, rodic, box, radky, t0, t1)` | červený rámeček kolem obličeje a text po slovech |
| C11 | `CK.pullBack(tl, el, t0, t1, o)` | pomalý odjezd kamery 3 až 6 % na statickém záběru |
| C12 | `CK.svih(tl, stara, nova, t)` | švih jádra bez záblesku, titulky stojí |
| C7 | `CK.zaHlavou(tl, rodic, text, t0, t1, o)` | obří slovo za hlavou pod maskami z `tools/maska_za_osobou.py` |
| C13 | `CK.vsun(tl, rodic, media, t, o)` | skutečné miniatury přijedou do karty |

Ukázky: `src/ukazka.html` (22 s reelu Heaton v Caspar stylu), `src/komponenty.html` (showcase všech komponent, úseky v `plany/komponenty.json`).
Build: `node build.mjs <nazev>` (src/<nazev>.html > index.html, `/*SLOVA*/` a `{{T(i)}}` ze `assets/media/slova_<nazev>.json`,
`<!--MASKY:slozka:prefix-->` a `/*POCET:slozka*/` z masek).

## Postup

1. Brief a scénář podle skillu `reel`. Ke každé větě rozhodni: A-roll s titulky, A-roll se sestavou (C4, C17, C18, C7), karta (C2, C3), B-roll (okno C1, rámeček C8, plný záběr).
2. Polohu obličeje změř po snímcích (Vision) dřív, než rozmístíš sestavy. Tim má obličej kolem x 50 %, y 41 až 48 %, výška hlavy 30 až 36 %:
   sestavy pod bradou od y 0,78, slova kolem hlavy v pásech do x 0,33 a od 0,66, schody od x 0,02 velikostí 0,04.
3. Slovo za hlavou: masky `$PY $BR_PROSTOR/tools/maska_za_osobou.py`, slovo vysoko (y 0,15, výška 0,2), ať prostřední písmena nezmizí za hlavou.
4. Zvuk `tools/mix.py`: klik na slova vypisovaná po jednom, sub na červenou kartu a obří slovo, závěrka na okno, švih na přesun.
5. Storyboard ke schválení, render, `kontrola_renderu.py`, agent `overovac`, revizní stránka.

## Zákazy (navíc k pravidlům)

- Žádný sprint plnými záběry pod 1,7 s, žádný černobílý grade, bílé prolnutí ani šedý průsvitný nástup (C14), žádná logo karta na konci (C16).
- Text ve 3D na okně nebo podlaze (C6) jen na B-rollu se statickou kamerou a po schválení.
- Bílé titulky ani bílé sestavy přes Timovo bílé triko: přes triko `tma` (tmavé s aurou), jinak posunout.
- Značky jen logem (`{ el: img }` v sestavě), nikdy názvem v textu. Jména lidí na jmenovce ano.
