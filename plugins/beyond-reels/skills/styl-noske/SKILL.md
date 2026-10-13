---
name: styl-noske
description: Edit reelů ve stylu Toma Noskeho (@tomnoske) v barvách Beyond, v HyperFrames. Použij, když Tim řekne "noske", "nosek", "Noske styl", "jako Tom Noske", nebo chce klidný filmový talking head reel s titulky po jednom slově, typografickými kartami na #111111, rozostřeným číslem jako duchem, obrysovými pilulkami a vlastními B-rolly. Obsahuje změřená pravidla z 6 reelů, knihovnu NK (noske-kit) a výrobní postup od výběru pokusů přes střih ticha po render. Pro styl Jacka Masona je skill styl-mason.
---

# Beyond reels ve stylu Toma Noskeho

> **Zvuk hlasu (Tim 4. 10. 2026, platí pro každý reel):** jen čistá stopa z kamery bez filtrů, střih po celých snímcích zdroje, `studio_hlas.py` ve výchozím režimu, intro a tělo jedním během, mix jako Noske funnel (hlas -5,5 dB, hudba -24 dB RMS se sidechainem -6 dB, -14 LUFS). Vzor `reels/podnikatele/dalen/nastroje/studio_spolecne.py` a `zvuk_telo.py`. Starší pokyny ke zvuku níže tímto nahrazuje.

> **AI fotky (Tim 5. 10. 2026, platí pro každý reel):** generovat jen jedním modelem, Seedream v4 edit (`fal-ai/bytedance/seedream/v4/edit`), nikdy dva modely najednou a nikdy nano banana. Vždy jen 2 až 3 generace (`num_images` 2 až 3), každá jiná (oblečení, póza, výraz). Reference tváře 2 až 3 výřezy z jeho videí nebo už schválená fotka. Studiový portrét od stehen nahoru, vyplňuje obraz, bez glow, pak birefnet bez pozadí. Volání přes `reels/_nastroje/fal.py`. Cena asi 0,03 USD za fotku.

Noske je opak Masona: žádné vaření, žádný nízký framerate, žádné ikony na každé slovo. Filmový talking head, tvrdé střihy, jedno slovo titulku a občas čistá typografická karta. Síla je v rytmu a v tom, co vynechá.

Projekt a knihovna: `$BR_PROSTOR/noske-styl`
- `js/noske-kit.js` komponenty (window.NK), `noske-kit.css` tokeny a vzhled
- `src/ukazka-*.html` kompozice, `node build.mjs try` z nich udělá `index.html` (slova vloží z `assets/media/slova_TRY.json`)
- `zdroj/strih.py` výběr pokusů a střih ticha, `nastroje/zarovnej.py` časy slov, `nastroje/zvuk_try.py` hlas, hudba, SFX
- B-rolly: `$BR_BROLLS`, co v nich je: `B-rolls/KATALOG.md`. **Používej je vždy**
- Rozbor originálů: `$BR_INSPIRACE/nosek/_rozbor/<id>/SHOTLOG.md`, přepisy v `nosek/_raw/*.txt`

Před stavbou si přečti `reference/komponenty.md` (API a pasti).

## Barvy Beyond místo jeho

| jeho | naše | kde |
|---|---|---|
| tmavě zelená #101A1A, #1C3836 | `--tma` #111111 | grafické karty |
| krémová karta #EFECE2 | `--papir` #EFEBE4 | světlá karta (pointa, výzva) |
| titulky #E8D9CC, #E0C5AF | `--krem` #EDE6DC | text na videu i na tmavé kartě |
| červená jen u počítačky peněz | `--cervena` #FF0E00 | max jeden detail na reel (uvozovky výzvy) |

Font Helvetica Neue Bold, proklad -4 %, velká slova -5 %. Pointa (jeho serif) je **Instrument Serif Italic** (`assets/fonts/InstrumentSerif-Italic.ttf`, třída `.nk-kurziva`). **Helvetica nikdy kurzívou** (Tim 2.10.2026). Serif vždy normální řez, ani na kartě s tučnými slovy ho nesmí prohlížeč uměle ztučnit.
**Grade videa neměnit** (Tim, 2.10.2026). Jeho teal-orange s vinětou je jen volitelná třída `.nk-grade`, když o ni Tim řekne.

## Schválený look (Tim 2.10.2026: "takhle vypadá Noske styl", reel ClaudeTry v6)

Referenční kompozice: `noske-styl/src/ukazka-try.html`, render `renders/try_v6n.mp4`. Drž tyhle hodnoty:
- titulky krémové #EDE6DC, na středu (x přesně střed, bez posunu za postavou), y 63 %, velikosti s 52 / m 72 / l 104 / xl 132 VERZÁLKY
- jemný stín pod písmem vždy (`0 1px 12px` 32 %), na B-rollu `0 1px 14px` 42 %. Kontrast má přednost před čistotou
- hook: kicker přiletí (`NK.hookNastup`), vrstva titulků se zaostří (`NK.zaostreniVrstvy` sila 0,7, kratce), pak schody
- 6 až 9 vrstvených sestav na 90 s (`NK.sestava`), jinak jedno slovo
- trychtýř a podobná schémata z obrysových pilulek přes celou kartu na středu (`NK.trychtyr`), titulky přes karty nikdy
- zoom 1,0 / 1,15 od horního okraje, B-roll 20 %, karty 25 %, konec na výzvě bez titulního snímku

- **Prvek se ukáže až ve výchozím stavu animace** (tl.set se stavem letu ve stejném snímku jako visibility), jinak 1 až 2 snímky stojí v normální velikosti a pak poskočí
- **Křivky vždy S (sine.inOut) nebo in/out (power2/power3/expo), nikdy lineární.** Při rozmazání před zmizením se text nikdy nezvětšuje (Tim 2.10.)

## Jak editor přemýšlí (změřeno na 6 reelech, 25 fps)

1. **Hard cut na všem.** Ani jeden prolínačka, whip nebo zoom přechod. Záběr trvá v průměru 2,7 až 3,3 s.
2. **Poměr času:** talking head 52 až 60 %, B-roll 20 až 45 %, typografické karty 5 až 24 %.
3. **Jump cut = punch-in.** Na stejném záběru se střídá zoom 1,0 a 1,15 (Noske až 1,37, ale Timovi to usekává vlasy). Zoom vždy od horního okraje (`transform-origin: 50% 0%`), úvodní 1,25 → 1,0 za 40 sn. Mezi střihy drift +3 %. Proto střih ticha nevadí: každý střih je zároveň punch.
4. **Titulek je jedno slovo, na vhodných místech vrstvená sestava** (`NK.sestava`): kicker (malé slova přibývají nad velkým slovem, které se mění, poměr 2,6 až 2,8 : 1), pod (velké drží, malé pod ním), schody (řádky po diagonále, poslední klidně serifem, bez zvětšování). Sestava končí tvrdým střihem. Jinak (krátká spojka se slepí s dalším), drží 5 až 12 sn., výměna tvrdým střihem ve stejném snímku. Žádný stín, podklad, barva ani podtržení.
5. **Důraz nese jen velikost a verzálky.** Tři stupně (asi 1 : 1,4 : 2) a klíčové slovo 2,5 až 3,7× větší VERZÁLKAMI. Pointa kurzívou. Barvou se nezvýrazňuje nikdy.
6. **Titulek sedí na hrudi** (y 56 až 68 %), nikdy přes obličej, vodorovně na středu postavy.
7. **Typografická karta** (#111111 nebo papír): slova se tvrdě vyměňují nebo přibývají a rostou k pointě. Tři vzory: rozhozená slova v řadě přes šířku (jeho "need · less · think"), kotva (malý řádek drží, slovo pod ním se mění po 0,6 až 1,2 s), jedno obří slovo.
8. **Rozostření (změřeno, HOOK_BLUR_VRSTVY.md):** na vrstvě titulků, ne na slově: v hooku vrstva 9,4 → 4 px za 20 sn. a pak do ostra. Kicker v hooku přiletí z 2,4× a +200 px za 38 sn. power3.out s blur 2 → 0. Rozmazání před zmizením jen střídmě na konci bloku (`NK.rozmazatKonec`, 4 sn.). Jediná hra s ostrostí textu: obří číslo (99 %) naroste ostré, 6 sn. drží, pak se TVRDĚ rozostří (14 px, další snímek 25 px) a zůstane jako duch za titulky (12 px, krytí 0,3). Sklo karty (bílá 8 %, backdrop blur) naskočí z blur 6 px za 10 sn. Měkký nástup slova zespodu (DdU1) je volitelný režim `stoupani`.
9. **Grafika je minimální a doslovná.** Trychtýř je trychtýř (`NK.trychtyr`, pásy se zužují, popisek uvnitř), obrysové pilulky 2 px, plné krémové postavy (zhasnutí na 15 %), platforma nebo nástroj jako tmavý štítek s obrysovou ikonou vedle hlavy (`.nk-ikonka`), ne náhodně přes B-roll. Stav se mění krytím, nikdy září. Obří rozostřený duch čísla jen samostatně, nikdy pod jinou grafikou (v hooku pod trychtýřem působil rozbitě).
10. **B-roll je vlastní a doslovný**, 1,2 až 4,2 s, vstup na začátku klauze a návrat na konci věty, titulky běží přes něj dál krémové se stínem (`NK.naBrollu`). Tmavé titulky na fotce nikdy, byly nečitelné. Slovo "Arnold" dostane záběr přesně v okamžiku vyslovení.
11. **Hook:** text je na snímku 0, žádný úvod. **Konec:** výzva na papíru se slovem v červených uvozovkách obou nahoře “START”, drží 0,6 s a konec. **Žádný titulní snímek ani shrnující grafika na konci** (Tim 2.10.: nikdy).
12. **Zvuk:** u něj jen hlas. U nás vždy tichá hudba pod hlasem a řídké SFX (viz níže).

## Výroba

1. **Přepis** whisper-cli large v3 (`~/Library/Application Support/Dictum/models/ggml-large-v3.bin`, `-l cs -ojf`), vypiš segmenty s časy.
2. **Výběr pokusů:** Tim točí víc pokusů za sebou. Ber vždy poslední úplný a čistý pokus věty, nedokončené ("nemusíš na hovorech...") a přeřeky vyhoď. Pokud je pokus rozdělený (začátek dobře, konec znovu), slož ho z kusů. Výsledek zapiš do `KUSY` v `zdroj/strih.py` jako (od, do, přesný text).
3. **Střih:** nikdy neuseknout slovo. Každý kus se zarovnává i s okolními slovy z whisperu jako vycpávkou (bez ní zarovnávač zmáčkne poslední slovo do konce kusu, tak se uselo "metodou": ticho uvnitř slova je jen uzávěr hlásky). Pojistka: řez aspoň 0,04 s před prvním a za posledním slovem, zaokrouhlení na snímky ven od slova, kusy jdoucí ve zdroji po sobě mají společnou hranici a zoom tam neskáče. Kontrola po střihu: žádné slovo nesmí ležet přes hranici úseku. Hrany řezu se dotahují podle energie zvuku (konec až do dozvuku, začátek před nádech) a ohraničují časy sousedních slov z whisperu, řez jde do nejtiššího místa mezi nimi. Po střihu vždy spusť kontrolu energie na hranách. `strih.py` zarovná každý kus na slova (wav2vec2, `$PY`), rozdělí ho v pauzách nad 0,30 s (ticho a přemýšlení pryč), slovo dostane 0,09 s před a 0,14 s po, řezy jsou na celé snímky. Výstup: `kamera.mp4` (původní grade), `hlas_raw.wav`, `slova_X.json`, `zdroj/strih.json` (úseky = místa jump cutů).
4. **Pozice postavy** na úsek (tmavé tričko v pásu hrudi), posun titulků ±60 px.
5. **Plán:** projdi slova s indexy a pro každou větu vyber nosič: talking head (střídání zoomu), B-roll z KATALOG.md, nebo karta. Ilustrace musí doslovně sedět k tomu, co zaznělo.
6. **B-roll** vyřízni ffmpegem rovnou na formát (4:3: `crop=2880:2160,scale=1440:1080`, 25 fps), barvy nech.
7. **Hlas** vždy přes `$BR_PROSTOR/tools/studio-hlas/studio_hlas.py hlas_raw.wav hlas_studio.wav` (odšumění DeepFilterNet3, zářezy na bzučení, EQ podle Matta Graye, vyrovnání slovo od slova, komprese, -14 LUFS, LRA kolem 1,3). Pak `nastroje/zvuk_try.py` (hudba se sidechainem s podržením 0,8 s, SFX, finální `mix_TRY.wav`), `node build.mjs X`, `check . --no-contrast`, render `--workers 3` a nakonec do videa vložit `mix_TRY.wav` (`-map 0:v -map 1:a -c:v copy`), render hlasitost nesrovná.
8. **Ověření** deleguj agentovi overovac (snímky v klíčových časech), do hlavního kontextu jen verdikt.

## Pravidla od Tima (platí i tady)

- Nikdy remove-background, blikání, pixelový rozpad, glitch ani RGB split (Noske je má, my ne)
- Žádná záře kolem prvků, žádné náhodné prvky bez pokračování
- Text nikdy pod nakreslenými čarami, titulky nad kartami s grafikou
- Řeč klienta jako profilovka a citace v uvozovkách, nikdy bubliny zpráv
- SFX: mouse hard click (klik1/klik2 střídat) jen na slova víceslovných nápisů, jednotlivá slova titulků bez zvuku, mouse clicks (klik4) na nástupy prvků, závěrka na B-roll a karty, nikdy classic click (klik3) ani dřevěný ťuk. Kliky o 3 dB výš než ostatní SFX
- Hlas o 5,5 dB pod masterem -14 LUFS, hudba se sidechainem -6 dB, master -14 LUFS / -1 dBTP
- Vždy hudba a SFX, hlas studiový (studio_hlas.py), bez šumu a bez skákání hlasitosti
- Nikdy nepřehrávat zvuk nahlas na Timově Macu
