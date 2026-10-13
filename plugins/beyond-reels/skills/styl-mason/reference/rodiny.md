# Rodiny komponent: Mason kit (MK) a Beyond nové (BN)

Sdílené jádro `$BR_PROSTOR/jadro` (do projektu ho dá `tools/jadro.sh`, verze v `jadro/VERZE`, přehled `tools/jadro.sh --stav`):
- `js/mason-kit.js` = `window.MK`, repliky Jackových zařízení, výchozí hodnoty = změřený originál
- `js/beyond-nove.js` = `window.BN`, originální komponenty pro Beyond (viz `nove.md`) a realistické UI: `igProfil` (Android IG 1:1), `igDesktop` (tmavý web IG s počítadlem), `ytKarta` (YouTube watch page 1:1), `pisRealne` (psaní s kurzorem), `vyber` (modrý výběr textu), `lcd` (obal UI jako displej), `imBubliny`, `igMrizka`, `titulkyZeSlov` (titulky ze zarovnaných slov), `maskaZaPostavou` (text za lidmi)
- `js/elaine-kit.js` = `window.EK` + `elaine-kit.css`: béžová deska, slovo z rozmazání, karta s číslem bodu, push-in skupiny, titulky na hrudi, zelené karty 1 2 3, skluz pásu
- `pripadovka-kit.css` (boxy, okno prohlížeče, značky; JS z PK se už nepoužívá, viz konec souboru)
- `nastroje/postfx.py` + `fx/*.json` v reelech: radiální blur, záře, fisheye po renderu, viz `efekty.md`
- `mason-kit.css` = vzhled přes proměnné `--mk-*` (téma Beyond z `beyond-kit.css`), `tema-jack.css` v jack-styl je téma repliky, do Beyond videí nikdy
- starší `beyond-kit.js` (`BK`) v jádře není, zůstává jen v jack-styl pro staré ukázky C a D

Základ MK: `MK.init(root)` (čte šířku, výšku a fps kompozice), časy v s, délky ve snímcích, `MK.h(0.2)` = 20 % výšky.
Křivky: změřené z motionmaxxing `MK.KRIVKY` (softLand, snapSettle, glide, whip, accelExit, crashOut, cruise, softInOut, gentleIn, popOver, crashIn, bounceHard) s délkami `MK.DELKY`;
`MK.tw(tl, el, z, kam, t, n, { ease: "softLand" })` (n může chybět), starší exp doběh `MK.expOut(k, n)` a `MK.expIn`, `MK.kroky(ease, n, krok)` (dvojky, trojky), `MK.tabulka` pro přesné repliky.
Plynulé pohyby: `MK.prijezd(tl, el, t, { z: "dole"|"nahore"|"vlevo"|"vpravo"|"velky" })`, `MK.odjezd(tl, el, t, { z, n })`,
`MK.svih(tl, stara, nova, t, { smer })` (švih bez záblesku, nová přijede ve stejném směru), `MK.kameraSkok(tl, el, t, { od, kam, n })`.
`MK.nastav(tl, el, vlastnosti, t)` = tl.set, který funguje i na čase 0 (ukaz a skryj ho používají).
Štítek: `MK.stitek(rodic, text, { y })` má y = střed štítku. `MK.psaciPole(..., { pozadi: "none" })` bez bílého boxu. `MK.triptych(..., { konec })` umí odejít.
Pomocné: `MK.ukaz`, `MK.skryj`, `MK.strih` (display none, pro celé skupiny), `MK.drift`, `MK.div`, `MK.stred`.

**Past, kterou jsem si prošel:** prvky mají `visibility: visible` na sobě, takže skrytý rodič je nepřebije. Scény přepínej přes `display` (`MK.strih` nebo vlastní `scena()`), ne visibility.
**Past 2:** video vložené JavaScriptem renderer nenajde (zamrzne nebo černá). Každé `<video>` musí být v HTML s `id`, `class="clip"`, `data-start`, `data-duration`, `data-track-index`; komponenta si ho převezme (`BN.popisVidea({ video })`).
**Past 4:** `tl.set` přesně na čas snímku (`(f - 1) / 30`) render zachytí o snímek později. V replikách počítej `T = (f) => (f - 1) / fps - 0.001`.
**Past 5:** renderer si u každého `<video class="clip">` sám zapíná `visibility` podle `data-start`, takže kartu s videem skrytou přes visibility uvidíš už od startu klipu. Karty s videem přepínej přes `display` (Shelby řada karet, 1 3 2).
**Past 3:** překrývající se tweeny téže vlastnosti dělej `fromTo` s explicitními hodnotami (render seekuje ve více workerech).

| Rodina | Funkce | Změřený originál (snímky pro porovnání) | Kdy použít |
|---|---|---|---|
| R1 karta s úchyty a montáží | `karta(rodic,{x,y,w,pomer,rot,obsah,uchyt,pad})`, `kartaZoom(tl,k,t,{tabulka:true,skupina})`, `montaz(tl,k,t,[3,6,9...])`, `ZOOM_HOOK` | Ben Z1 f1 až f45: rotace 4°, úchyty 24 px, šířka 1132 > 635 px, fotky na trojky | hook "kdo to je", důkaz "hodně" |
| R1 jmenovka přes montáž | `jmenovka(tl,[el1,el2],t,{rozestup})` + montáž z `nastroje/montaz.py` | Fred Z6 f245 až f334: 12 záběrů 8,8,6..., jméno drží | představení člověka |
| R1 shluk, vějíř, triptych | `shluk`, `vejirNastup`, `vejirSlit`, `triptych` | Fred Z4, Ddq 1 (5 karet po 2 sn. s motion blurem), Shelby A6 (1 3 2 po 3 sn.) | objem obsahu, tři místa |
| R2 počítadlo | `pocitadlo(tl,el,t,od,kam,n,{krok,ease,format})`, `dolary`, `tisice`, `scramble`, `pilulkaPocitadlo` | Fred Z1 (dvojky, sine out), Georgios Z5 (každý snímek, lineárně), Shelby A4 (scramble po 3 sn.), Ddq 2 (power3 20 sn.) | každé vyslovené číslo |
| R3 typografie slov | `hrudTitulky`, `serifSlova`, `slovaRozmazane(tl,radek,[{text,t,akcent}],{krok:3})`, `duchVeta` | Ben Z5/Z6 (klíč 1,55x vjede zleva, serif po 7 sn.), Fred Z2 (blur 10 > 0, 0,9 > 1,07 > 1 na trojky), Georgios Z13 (30 % > 100 %) | věty, kontrast "všichni vs. on" |
| R4 obří slovo, squash pás | `hero(tl,el,t,{prichod:'strih'|'zespodu'|'fade'|'prolinani',konec,odchod:'pad'})`, `pas`, `pasNastup` | Ben Z7 (cap 20 % H, 4 příchody), Ben Z4 (0,26 + 0,742 e^(-0,195t)) | téma, seznam, značka firmy |
| R5 box, štítek, pilulka | `psaciPole`+`psani({zleva,starty,fade})`, `stitek`+`padShora`/`padDolu`/`stazeni`, `pruhZOkraje`, `pruhVjezd`, `obloukDvakrat`, `pilulkaStack` | Ben Z2 (pole po písmenech 2,2 sn.), Ben Z3 (pád k 0,8 19 sn.), Fred Z10 (pruh 26 sn., oblouk ve 2 fázích), Fred Z15 (1,25 > 1, po 5 sn.) | jméno, číslo, ohlášení bodu, CTA |
| R6 profil UI | `profil(rodic,{tmavy,jmeno,avatar,...})`, `najezd`, `profilZoom` | Georgios Z7 (krytí 9 sn., pozice 25 sn.), Z18 (tikání každý snímek, tvrdý střih na 2,2x) | počet sledujících, identita |
| R7 podpis bodu | `cisloBodu(tl,el,t,{konec,drift})`, `radekSlov`, `kosoctverec`+`kosoctverceNastup`, `ctverceNastup` | Fred Z12 (#N 12 sn. po střihu, maska zdola, 0,15 > 1 za 15 sn.), Ben Z9 (superelipsa p 0,8, 51 > 100 % bez přestřelu) | "zaprvé, zadruhé, nakonec", slib tří věcí |
| R8 rostoucí diagram | `trychtyrStavba`, `orbita`, `uzel`, `kresli` | Ddq 7 (propad a překmit 26 px), Ddq 9 (avatary po 2 sn., expo rotace), Georgios Z15 (pop + spojnice 6 sn.), Z20 (šipka 7 sn.) | systém, publikum, vztahy |
| R9 B-roll | `brollDoKarty`, `zoomBump`, `navratZBrollu`, `uvolni`, `BN.duotone` | Ddl 4 (inset 7,2 % za 12 sn.), Ddl 19 (+9 % za 8 sn.), Ddq 3 (sigmoida 15 sn.), Ben Z15 (duotone) | cizí záběry do systému |
| R10 pop UI (jen UI objekty, nikdy štítky a texty) | `popSnap(tl,el,t,{sila,zdvih})`, `pop(tl,el,t,{sila})`, `stitekPop` zakázán | Ben Z8 (švih +15° > -18°, snap v 7. sn.), Georgios Z10, Ddl 9 (0,6 > 1,62 > 1) | bubliny, štítky, logo |

## Repliky (důkaz, že komponenty sedí 1:1)

Kompozice `src/r-*.html`, rendery `renders/replika/`, porovnání `replika/`:
- `r-ben-hook` (Ben f1 až f80): úchyty karty odchylka 3 % bboxu, výška pásu 2,4 %
- `r-ben-prvky`: kosočtverce 1,3 %, serif in his garage velikost 0,9 %, NETWORK, bublina Broke, TALENT INVESTORS DEAL FLOW, why?, A VANITY
- `r-fred-hook` (v2, 4. 10.): plocha macOS z fal edit, duch čísla f13 až f20, tvrdý střih f23, rámeček 1224 > 497 px na dvojky, číslice na 2 % (číslo HN Bold 450 px, proklad -0,07 em)
- `r-fred`: hook s počítadlem a kartou (v1, nahrazený r-fred-hook), jmenovka, pruhy s obloukem, čtverce 1 2 3, #1 s řádkem, slova z rozmazání, stack pilulek
- `r-georgios-cele` (77 s, 33 scén) a `r-shelby-cele` (97 s, 33 scén): celá videa na původní časové ose s původním zvukem, srovnávací videa `renders/replika/srovnani-*.mp4` (originál nahoře, replika dole). Postup na celé video: rozbor A + časy slov whisperem (`whisper-cli -ml 1 -oj`), náhradní záběry `montaz.py` s Jackovými délkami střihů, scéna = `display` přepínač, vše statické `<video>` v HTML
- `r-ddq` (svisle): vějíř, pilulka 5,000, uvolnění karty, trychtýř, orbita
- `r-elaine-cele` (73 s, 30 fps, reel DdmDn6_A8wu): mluvčí jako souvislý záběr přes celý obraz, desky EK, IG, karusel, YouTube vjezd, trychtýř
- `r-georgios` (23,976 fps): $250M, tmavá IG karta, chat pop LIFESTYLE/BUSINESSES, duchová věta, IG profil s tikáním a zoomem
Jak replikovat další zařízení: `replikace.md`.

## Co z originálu do Beyond nepřenášet (Tim)
glitch přechody (Fred Z8, Shelby A7), strobo (Dda A4, Shelby A9), pixelový oheň (Ddq 2), vystřižený mluvčí (rotoscope) u Timovy webky. Náhrada: tvrdý střih, rozmazání do ostrého, slovo za kartou místo za hlavou.
Od 4. 10. 2026 naopak patří do Beyond stylu radiální blur, záře, fisheye a LCD vzhled UI (viz `efekty.md`).

## PK, případovka kit (z reelu Vince Nijhof, 4.10.2026, schválené ve v23)

Doplněk k MK pro případové studie: `js/pripadovka-kit.js` (window.PK) a `pripadovka-kit.css`. Vzor použití je `src/vince.html` (tam jsou stejné věci ještě napsané přímo v kompozici).

- `const P = PK.init(tl, MK)`, pak `P.sc(id, t0, t1)` scéna přes display, `P.vis/P.hid` prvky přes visibility
- `P.slova("#x span", časy)` kinetický text na hlas (`.kt`, scéna s třídou `.sc.pap`, jinak prosvítá A-roll)
- `P.blik(fl, t)` bílý záblesk přes `.pk-fl`, `P.puls(el, t, 1.08)` puls na dvojky, `P.ztlum(els, t)`, `P.popis(el, t)`
- `P.klip(karta, t0, t1)` karta s citací (`.pk-klip`) vyjede zdola a driftuje; titulky v ní `.tit.klip` s tmavým podkladem; video na konci se zmrazeným snímkem, ať karta nekončí černou
- CSS: `.pk-web` okno prohlížeče se screenshotem (adresa v `--url`), `.pk-box` červené boxy bodů pod Timovou kartou ve výzvě, `.pk-mbx`/`.pk-mbl` malé boxy čísel s popisky přes A-roll, `.pk-znacka` čtverec v barvě značky s piktogramem
- Zvuk případovky: `nastroje/zvuk_vince.py` (jen `hyperframes/sfx/zaklad`, Deep Whoosh s vrcholem na střih, kick a boom jen na velké příjezdy), hlas `nastroje/hlas_vince.py` + `tools/studio-hlas/studio_hlas.py`
- Past: HyperFrames Studio přebije vis/hid vlastním data-start, texty se v editoru neanimují, render je správně
