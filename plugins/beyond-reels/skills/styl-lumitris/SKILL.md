---
name: styl-lumitris
description: Edit reelů ve stylu agentury Lumitris (@content.lumitris) v barvách Beyond, v HyperFrames, formát 4:3. Použij, když Štěpán nebo Tim řekne "lumitris", "lumi", "Lumitris styl", "jako content.lumitris", nebo chce rychlý dokumentární edit s vyprávěním, slovy po jednom rozloženými přes obraz, koláží fotek bez rámečků, glitch obdélníky v negativu, archivem, filmovými metaforami, AI koláží a trhaným taktem 12 fps. Platí i s A-rollem (mluvící hlava do kamery). Obsahuje DNA stylu změřenou po snímcích ze 4 reelů, katalog komponent, pravidla obměn (žádné dva reely stejné), zapojení mluvící hlavy, zvuk a výrobní postup. Pro Jacka Masona je styl-mason, Noske styl-noske, Matt Gray styl-matt-gray, postup výroby ve skillu reel.
---

# Lumitris styl (Beyond verze)

Projekt: `$BR_PROSTOR/lumitris-styl/v2` (kit v2 ve 4:3: `js/lumi2.js`, `lumi2.css`, `stavba.mjs`, plány `plany/*.mjs`, `nastroje/priprav.py`, `takt.py`, `zvuk.py`). Starý kit 1728x720 o složku výš je jen archiv.
Rozbory po snímcích (zdroj pravdy pro čísla, při stavbě komponenty si přečti příslušný bod 10):

| reel | typ | rozbor |
|---|---|---|
| DeUmXBotjIH | rozbor značky s tezí, 2,4:1, 30 fps | `$BR_INSPIRACE/lumitris/_rozbor/DeUmXBotjIH/POHYB.md`, SHOTLOG.md |
| Dd6N1CUyLN4 | reklama na problém zakladatele ("Later") | `_rozbor/Dd6N1CUyLN4/ROZBOR.md`, SHOTLOG.md, POHYB.json |
| DdsCmfXS5Hs | anekdota o osobě (Buffett), citace originálu | `_rozbor/DdsCmfXS5Hs/ROZBOR.md` |
| DdeSJ7OhjxY | showreel na hudbu | `_rozbor/DdeSJ7OhjxY/ROZBOR.md` |
| 5 videí hrubě | souhrn struktur a os | `_rozbor/VARIANTY.md` (pozor, místy se mýlí, hloubkové rozbory mají přednost) |
| náš první pokus | proč heaton nevypadal jako Lumitris | `_rozbor/AUDIT_NASE.md` |

Rozhodnutí Štěpána 12. 10. 2026: **formát 4:3** (1440x1080), **akcenty červená #FF0E00 s bílým textem** (místo kobaltu) a **krémová #EDE6DC s černým textem** (místo limetky), písma **Helvetica Neue** (grotesk) a **Instrument Serif Italic** (serif). Do stylu patří i náš **A-roll**. Každý reel je jiný: stejný jazyk, nikdy stejné komponenty, struktura ani scénář.

## 1. Jak editor přemýšlí

Video je souvislé vyprávění jedním hlasem a obraz mu nikdy nestačí jen "ilustrovat". Každé jméno, číslo, místo a firma dostane do 0,5 s skutečný obraz (fotka, logo, archiv, dokument), abstraktní slova dostanou metaforu (film, stock, AI koláž). Nový obraz zhruba každá 2 až 3 slova. Každá delší fráze má jednu větší událost (koláž, okno, dokument, obří slovo). Řemeslo je v tom, že všechno je tvrdé a přesné: nic neklouže, slova naskočí, karty naskočí, kamera udělá jeden krátký tah s dlouhým dojezdem a stojí. Trhanost nedělají křivky, ale snížený takt celého obrazu.

Naivní verze dělá pravý opak a proto heaton neprošel: plynulých 30 fps, pomalé lineární Ken Burns zoomy na všem, karty s bílým rámečkem a stínem, slova s fade a posunem, švih na každém střihu, hudba schovaná pod hlasem, obraz jen z vlogů jednoho člověka.

## 2. DNA: co platí v každém reelu (pevné)

### Takt a pohyb
1. **Render 24 fps, celý kompozit posterizovaný** (pozadí, text, boxy, glitche dohromady): většina reelu na **12 fps** (každý obraz drží 2 snímky, fáze se resetuje na každém střihu). Na **24 fps** jen úseky, kde se má dýchat nebo číst UI: čítače, okna aplikací, montáže, CTA, pointa s mluvící hlavou. Místy 8 fps (dávka fotek po 3 snímcích) nebo 6 fps na 15 až 20 snímků. Freezy 15 až 23 snímků jsou v pořádku. Cíl: 31 až 36 % snímků jsou kopie.
2. **Žádný plošný Ken Burns.** Polovina záběrů stojí (pohyb jen ze zdroje). Digitální tahy jsou krátké, velké a s křivkou, max jeden na 3 záběry:
   - nájezd do střihu: 1,00 na 1,10 až 1,34, ease in t^2 až t^2,5, 8 až 45 snímků, končí střihem (1 až 2x za reel)
   - S křivka: 1,00 na 1,20, power3.inOut, 14 snímků
   - dojezd: ease out s dlouhým koncem (expo.out 10 snímků, nebo 50 % dráhy za 4 až 8 snímků a 90 % za 10 až 18)
   - oddálení z detailu: 2,75 na 1,00, 4 snímky stojí, pak 50 % za 16 a 90 % za 30 snímků, prvních 10 snímků rozmazání pohybem
   - skok měřítka x1,2 až 1,6 za 1 snímek na úder
   - okno roste skokem bez animace (šířka 46, 62, 77 % na slovech)
3. Pohyb se nikdy nevrací zpátky uvnitř záběru (žádný reset měřítka). Klidné zdroje mají přednost před roztřesenými vlogy.

### Text
4. **Slovo naskočí celé za 1 snímek**, bez fade, posunu a měřítka. Je 0,5 až 3,5 snímku za hlasem. Žádné titulky v klasickém smyslu, jen 1 až 5 slov.
5. **Řádek ve slotech přes šířku na y 44 až 53 %.** Ve 4:3 nejvýš 3 až 4 sloty: středy 18 / 50 / 82 % pro 3 slova, 15 / 38 / 61 / 85 % pro 4. Řádek drží přes střihy, dokud neskončí fráze, pak se celý vymění nebo rozostří (gauss 0 na 6 px za 1 snímek, drží 3). Krajní sloty smějí být lehce rozostřené.
6. Velikost: běžné slovo 7 až 9 % výšky (em), výška verzálky 4,5 až 6 %. Barva #FCFAFC, kolem slov jemná bílá záře (sigma 9 px, 30 až 40 px dosah), ne stín. Na světlém pozadí tmavě šedá. Ve druhé půlce smí text zešednout na #A0A0A0.
7. **Vede Helvetica Neue Bold** (Štěpán 12. 10. 2026: „víc Helvetica Bold, top“). Vyprávění v řádcích je grotesk Bold, velikost 74 až 92 px; serif jen jako akcent (jedna fráze za scénu nanejvýš, jméno ve štítku, číslo v čítači). Grotesk Helvetica Neue Medium až Bold s prostrkáním -3 až -4 %. Serif Instrument Serif Italic, nikdy uměle ztučnit (`font-synthesis: none`). Helvetica nikdy kurzívou. Výměna řezu na pointovém slově: grotesk na serif o 20 až 25 % větší, tvrdě po 3 snímcích.
8. **Obří slovo** jen 1 až 2 snímky: svisle natažené (scaleY 3 až 4x) na 70 až 100 % výšky, výplň bílá se září, nebo okno do invertovaného či příštího obrazu, pak skok na malé nebo pryč. Jen obsahová slova, aspoň 3 písmena.
9. **Psaní po písmenech** jen pro bloky (ne pro vyprávění): v 12 fps krocích, první krok 5 až 10 znaků, pak 1 až 2 znaky na krok, nejnovější znak tlumený.

### Fotky a karty
10. **Karty nemají rámeček, stín, rádius ani rotaci** (výjimka: šedá koláž s natočením 3 až 8°). Naskočí tvrdě na místě, první 1 až 2 snímky často v negativu nebo azurovém duotónu. Rozestupy 3 až 20 snímků, nepravidelně. Pohyb dodá až kamera celé skupiny. Hloubku dělá rozostření (3 roviny: 0 / 4 / 10 px) a velikost, ne stín. Měkká hrana karty 30 až 40 px je povolená.
11. **Výřezy postav** (fotky a AI fotky bez pozadí) mají dvě podoby, nikdy hladký bílý offset obrys:
    - nálepka: hranatý polygonový obrys jako stříhaný papír, 1 až 5 % výšky, tmavý #2D2C34 nebo v barvě akcentu, na světle šedé #E0DEE1, 3D let s rozostřením
    - výřez na barvě: postava ČB s jemným rastrem 6 px, za ní sytá barva (u nás červená nebo krémová) s hrubým rastrem 21 px nebo mřížkou, svislý pruh doplňkové barvy u okraje, za postavou smí být šedá posunutá kopie siluety
    - **naše a klientovy předměty a lidi** (Štěpán 12. 10. 2026 u Rolls Royce): původní barvy s tiskovým rastrem přes ně (`<jmeno>_tisk.png` z `priprav.py`), pozadí světle šedé studio s mřížkou (`pozadi: "svetla"`, bez pruhu), ne červené. Texty ve scéně tmavé
12. Portréty v sérii: jedna karta uprostřed, nový obraz každé 2 až 3 snímky, karta roste (výška 44 na 87 %). Jen portréty v rohových závorkách smějí mít bílý okraj 3 až 5 px a tiskový rastr.
13. Archivní fotky v druhé půlce klidně úplně stojí (freeze), ČB.

### Obraz a přechody
14. **Grade:** tlumený, sytost barevných záběrů nízká, 25 až 37 % snímků ČB, černá zvednutá na 13/255, světla stlačená k 185 až 230. Viněta (rohy ku středu 0,6 až 0,8). Obraz měkčí než digitální 4K (lehké změkčení). Pozadí grafických scén tmavý grafit s radiálním kuželem (střed #2F2F2F, rohy #0D0D0D), občas světlé studio s vinětou na 6 až 12 % času. Zrno skoro žádné.
15. **Glitch blok** je hlavní přechod, 20 až 45 za minutu: ostrý obdélník 2 až 35 % plochy, 1 až 4 snímky, nejčastěji začíná 2 snímky před střihem. Rodiny: (a) negativ příštího záběru, (b) šedé desky #8F8F93 a #DDDDE2, (c) bílý blok invertující text pod sebou, (d) černý, (e) vložená karta jiného obrazu. **V jednom reelu převládá jedna rodina.** Chromatická aberace a RGB posun nejsou.
16. **Žádný vodoznak ani "Produced by"** (Štěpán 12. 10. 2026). Outro karta jen se slovním znakem, nebo tvrdý střih.
17. Outro karta: černá, logo 27 % šířky uprostřed, 3x blikne po 1 snímku, zmenší se 1,19 na 1,00 expo.out 30 až 32 snímků, sub úder na střihu, 2,3 až 2,8 s. Nebo tvrdý střih na pointě bez outra.

### Zvuk (standard Beyond, od 13. 10. 2026)
18. Hlas jako vždy přes `studio_hlas.py` (čistá stopa z kamery, standard Beyond).
19. **Mix je standard Beyond** (Štěpán 13. 10. 2026: srovnat se standardem): hlas ze `studio_hlas.py` -5,5 dB, hudba -24 dB RMS se sidechainem -6 dB a podržením 0,8 s, pod citacemi -10 dB, celek -14 LUFS / -1,5 dBTP. `nastroje/zvuk.py` to dělá ve výchozím režimu, cesta k hlasu v plánu `zvuk.hlasSoubor`. Původní Lumitris mix (hudba 7 LU pod hlasem bez duckingu) jen na výslovné přání přes `"mix": "lumitris"` v `zvuk`. Hudba může během příběhu růst přes `ztlum` s kladnými i zápornými dB.
20. **SFX z knihovny `hyperframes/sfx/zaklad` na každou změnu stavu** (Štěpán 12. 10. 2026, Lumitris to má tišší, my ne): slova v řádku klik1 a klik2 střídavě, prvky a štítky klik4, fotka nebo karta naskočí a každá výměna v sérii závěrka (střídat s klik4 při rychlých výměnách), obří slovo pop, dosednutí výřezu kick, přesun výřezu svih_vitr tiše, čítač cisla. **Roztahování** (závorky, skok okna, růst boxu) má mechanické cvakání kolečka: `zvuk.roztah` v plánu = `cog` (deith/cog-wheel), `gears` (deith/Gears), `tik` (řehtačka z tiknutí hodin po 2 snímcích, výš a výš), `klik` (řehtačka z klik2); Štěpán vybírá z `renders/vyber_roztah.mp4`. Časy srovnat na mřížku taktu, ve stejném snímku jen jeden zvuk. Dělá to `nastroje/zvuk.py` automaticky z plánu. K tomu z Lumitris:
    - sub odhalení: nabíhá 7 až 10 snímků před velkým střihem, vrchol na střihu, dozvuk 1,5 až 3,5 s (110 na 55 až 60 Hz), 3 až 4x za reel; pod větou před tím basy stoupají
    - boom 2 až 4 snímky před bílou kartou nebo zábleskem
    - glitch: krátké digitální praskání jen nad 1,5 kHz (10 až 16 kHz), 3 snímky, 21 dB pod hlasem
    - outro drop
    - psaní, boxy, karty a slova zvuk nemají
21. Střihy se neřídí dobami hudby, ale slovy (výjimka showreel na hudbu: velké události na kopák, střihy na hi haty).


## 3. Mluvící hlava (A-roll)

**Naše záběry (A-roll) a předměty klienta se nikdy nepřebarvují** (Štěpán 12. 10. 2026): žádné ČB, rastr ani tlumení, v plánu `grade: "puvodni"` a `bezGrade: true` (vypne celkový grade). ČB a rastr jen pro cizí archiv, stock a film.

Originály mají tváře v 17 % času a vždy zpracované, nikdy obyčejný talking head přes celý obraz se slovy pod bradou. Pro nás A-roll **25 až 35 % času**, kusy **0,4 až 1,3 s** (výjimka pointa 5 až 8 s), mezi kusy aspoň 2 až 3 záběry doplňkového obrazu, dovnitř a ven tvrdý střih nebo glitch (nikdy prolínačka), hlas souvislý přes všechny střihy. V jednom reelu použij 2 až 3 způsoby, ne všechny:

| způsob | kdy | specifikace |
|---|---|---|
| A1 sloty přes tvář | věty k divákovi ("ty") | střední celek v původních barvách, slova ve slotech kolem hlavy, prostřední padne na obličej, pointové slovo obří přes obličej 1 snímek, 12 fps, 16 až 30 snímků |
| A2 pointa v detailu | konec, 1 za reel nejvýš | velký detail, tvář v pravé polovině (střed 65 až 70 % W, oči 35 až 40 % H), barva, 24 fps, nájezd 1,00 na 1,07 přes celou délku, jedno slovo grotesk 9 % H vlevo v úrovni očí, bez glitche uvnitř, hudba -16 LU pod hlas, 5 až 8 s, ven tvrdě na outro se sub |
| A3 studený úvod se zmrazením | hook | polocelek, postava v levé třetině, grotesk blok vpravo nahoře (malé slovo nad velkým číslem), nájezd 1,06 za 28 snímků, zmrazení a jméno po slovech |
| A4 karta v koláži | hook, přechod k tématu | A-roll jako karta 35 až 45 % šířky mezi 4 až 6 kartami v různé hloubce, pan 200 až 300 px ease out za 20 až 25 snímků, nebo se karta zvětší na celý obraz 2,95x za 28 snímků a pokračuje na 24 fps |
| A5 poslední karta série | hook | série fotek po 5 snímcích, poslední je naše hlava a drží 10 až 20 snímků |
| A6 měkká karta přes výšku | střed videa | 75 % šířky, okraje maskou do černa, barvy původní, slova přes bradu y 48 až 52 % |
| A7 výřez na barvě | představení, klíčová věta | MatAnyone výřez v původních barvách, červená s hrubým rastrem, pan 230 px ease out, štítek jména (grotesk + serif) |
| A8 kruh nebo okno | představení, delší myšlenka | kruh 36 až 40 % výšky na tmavém plátně, nebo obdélník 46 % šířky se skoky 62 a 77 % na slovech |
| A9 prostřihy | silná krátká věta | 4 až 6 klipů po 5 snímcích z různých natáčení, serif přes obličej |
| A10 zmrazení a sloupec slov | přemostění | freeze, osoba vlevo, sloupec grotesku 5,8 % H vpravo, 20 až 25 snímků |

Ve 4:3 je víc místa nad hlavou: sloty dát do výšky očí (y 38 až 45 %), ne na bradu.

## 4. Katalog komponent

Sdílené (rozpoznatelnost stylu, většina v každém reelu): Takt12, SlotRadek, SlovoPop, ObriSlovo, VymenaRezu, RozostreniOdchod, Psani, GlitchBlok, KolazKaret3D, SkupinaKaretPop, DavkaFotek, TahKamery (nájezd do střihu, S křivka, dojezd, skok), OknoSkok, TmavaKarta s větou, SvetelnyPrechod (záblesk 2 sn, svit do bílé 4 kroky), ZablesekDoStrihu, Vodoznak, Outro, SubOdhaleni, TitulekCitace (originální zvuk po slovech, grotesk 8,5 až 9 % H v prázdném prostoru).

Podpisové (jedna až dvě na reel, jinak se styl opotřebuje):

| skupina | komponenty | zdroj specifikace |
|---|---|---|
| dokumenty | noviny se zvýrazňovačem (zoom 1,25 S křivka 54 sn, zvýrazňovač zleva 32 sn), certifikát otočením kolem osy 16 sn + 7 sn blikání negativ, složka s podpisem, tweet, email, faktura | DdsC K7, K9, K11 |
| typografie | BoxVyber (ostrý box roste zleva v 12 fps krocích 11, 20, 25, 28, 31, 32 % šířky, text se odkrývá s ním, u nás červená s bílou nebo krémová s černou), Marquee (šedý #676467 přes řádek 2 sn), BileDesky (shora a zdola S křivka 14 sn, černý pás 23 % s textem, strobo 7 sn), čítač (6 až 7 kroků, hodnota jako obří záblesk), blikající emoční slovo, sloupec slov, LED řádek (červená #E90001, rozmazání 2 px, záře 12 px + halo 250 px na 10 %) | Dd6 bod 10, DdeSJ LedRadek |
| koláže | rohové závorky s portréty (#DEDEDE 14 px, výměna po 2 sn, rozšíření S křivkou 26 sn), koláž video dlaždic se zvětšením 2,95x, stoh fotek v perspektivě, mřížka 3x3 s negativy, série karet, kolaž archivu v 3D letu (dolly 1,12x za 28 sn, ostření 16 sn), nálepky, zeď karet, video zeď monitorů | DdsC K2, K3, K12, K13, Dd6, DdeSJ |
| velké tahy | oddálení z detailu 2,75 na 1, výřez na barvě s panem, bílý záblesk s probleskujícími snímky | DdeSJ, DdsC K16 |
| CTA | notebook nebo telefon s webem či IG profilem (stoupá se zrychlením 12 sn, střih do obrazovky, scroll 25 až 33 px za snímek, freeze 23 sn) | Dd6 CTANotebook |
| metafory | AI koláž (ruce, mozek, oko, glóbus, mapa z teček), skicová metafora (sépiové skici 3 až 8 sn), filmová scéna 0,5 až 3 s | Dd6, DdsC K17 |

## 5. Obměny: jak zajistit, že 5 reelů nebude stejných

Každý reel má **recept** zapsaný v `lumitris-styl/scenare/<reel>.json` pod klíčem `recept` a zároveň řádek v `lumitris-styl/POUZITO.md`. Před novým reelem si POUZITO.md přečti a **nový recept se musí lišit od každého z posledních 3 reelů aspoň v 5 osách** a nesmí opakovat žádnou podpisovou komponentu z předchozího reelu.

| osa | možnosti |
|---|---|
| formát scénáře | reklama na problém (hook, kontext, zvrat, důkaz, pointa, nabídka, CTA), případovka osoby nebo firmy (původ, zrání, úspěch, zvrat, pointa s motivem z hooku), rozbor značky s tezí a 3 příklady, anekdota s citací originálu, showreel na hudbu |
| hook (5 až 9 s) | koláž archivních fotek, studený úvod A3, série karet A5, LED řádek na živém záběru, portréty v závorkách, rozhovor se siluetou, keynote nebo produkt |
| vedoucí písmo | serif nese vyprávění, nebo grotesk nese vyprávění |
| rozložení řádku | 3 sloty, 4 sloty, 2 kotvy vlevo a vpravo, řádek dole, sloupec |
| takt | kde je 12 fps blok (úvod, střed, konec) a kde 24 fps |
| glitch rodina | negativ, šedé desky, bílé invertující, desky v barvě značky |
| tón karet a pozadí | tmavá viněta, světle šedá, papír, sytá červená |
| akcent | červený box, krémový box, jen zvýrazňovač, žádný box |
| podpisová scéna | 1 až 2 z katalogu v bodě 4 |
| A-roll | 2 až 3 způsoby z bodu 3, jiná kombinace než minule |
| hlavní tah kamery | nájezd do střihu, S křivka, skokové okno, oddálení z detailu |
| výplň obřích slov | bílá se září, inverze, příští záběr, gradient |
| zakončení | outro karta, CTA mockup a outro, tvrdý střih na pointě, A2 pointa |
| hudba | nálada a tempo, kde stoupá, kde je break |

Scénář se nikdy nepřebírá: struktura je jen kostra, věty a obraz vznikají z tématu. Žádné dva reely nemají stejný hook ani stejné pořadí scén.

## 6. Materiál (kód nevyřeší, co chybí v materiálu)

- Obraz z jednoho zdroje (jen vlogy) styl zabije. Každý reel potřebuje mix: archiv osoby nebo tématu 25 až 55 %, film 9 až 15 %, stock 12 až 33 %, grafické scény 15 až 27 %, AI 2 až 11 %, plus náš A-roll 25 až 35 %.
- Před střihem projdi scénář a ke každému jménu, číslu a firmě urči doslovný obraz (fotka, logo, dokument, okno), k abstraktním slovům metaforu. Co chybí, dohledat nebo vygenerovat. Penalizovat záběry bez hlavního objektu (plechovky, konvice, tma).
- AI fotky podle pravidla beyond-reels: jen Seedream v4 edit, 2 až 3 generace, pak birefnet bez pozadí. V Lumitris stylu se používají jako **výřezy** (nálepka, výřez na barvě) a jako **AI koláže metafor**, ne jako fotka přes celý obraz.
- Fotky z `zdroj/nalez` a `zdroj/gen` patří do karet, koláží a výřezů, ne na plný rám.
- Hudba: tmavá filmová s basou i výškami. Když stopa nemá výšky, vybrat jinou, zesílení nepomůže.
- Délka 55 až 75 s (showreel 20 s).

## 6b. Kit v2 (jak se staví reel)

Plán je JS modul `plany/<reel>.mjs` (vzor `heaton15.mjs`, ukázka všech komponent `komponenty.mjs`), časy ve snímcích při 24 fps, slovo = `wf(t)` (čas hlasu + 2 snímky).
- `sceny`: `zaber` (video či fotka přes celý rám, `tah` kamery), `platno` (tmavé nebo `svetle`, v něm `karty`, `okna` se `skoky`, `zavorky` s `rust`, `serie`), `vyrez` (výřez na barvě s `pan`), `cerna`
- `texty`: `radek` (sloty), `blok` (grotesk blok), `obri`, `box`, `stitek`, `citac`, `outro`
- `glitche`: bloky `[x, y, w, h, druh, posun, délka, obrázek]`, druh `neg` (obrázek příštího záběru), `seda1`, `seda2`, `bila`
- `takt`: `[od, do, držení]` 2 = 12 fps, 3 = 8 fps, 1 = 24 fps; dělá ho `takt.py` nad hotovým renderem (plus změkčení a mux zvuku)
- `zvuk`: suby (snímky střihů), hudba a její začátek; `zvuk.py` syntetizuje sub s náběhem a praskání glitchů

```
python3 -I nastroje/priprav.py          # klipy 4:3 24 fps, fotky, výřezy s rastrem, nálepky
node stavba.mjs <reel>                   # index.html + plany/<reel>.json
npx --yes hyperframes@0.8.105 check . --no-contrast
$PY nastroje/zvuk.py <reel>
npx --yes hyperframes@0.8.105 render . --output renders/_<reel>_raw.mp4 --workers 3
python3 -I nastroje/takt.py <reel> renders/_<reel>_raw.mp4 renders/<reel>.mp4 assets/media/<reel>_mix.wav
```

Pasti: scény se skrývají přes `display` (dítě s `visibility: visible` by prosáklo ze skryté scény a skryté efekty zatěžují capture), každé video musí mít id (jinak v renderu zamrzne), blur ve filtrech médií nepoužívat (změkčení dělá takt.py), AI fotky na světlém pozadí vyřezávat GrabCutem (`priprav.py alfa_z_bileho`), ne zaplavením.

## 7. Výrobní postup

1. Scénář v češtině podle formátu z bodu 5, hlasem 2,8 až 3,6 slova/s skoro bez pauz. Navrhnout recept a zkontrolovat proti POUZITO.md.
2. Natočit nebo vybrat A-roll, hlas `studio_hlas.py`, střih ticha podle průběhu hlasitosti a `tools/kontrola_strihu.py` do 0 podezřelých hran.
3. Beat mapa: fráze, slova s časy, ke každé frázi obraz (doslovně, archiv, metafora, film, AI, A-roll) a událost.
4. Banka obrazů a výřezů (`nastroje/banka.py`), AI fotky, dokumenty a okna.
5. Plán (`nastroje/generator.py`), render 1440x1080 24 fps s posterizací, zvuk standardem Beyond (`nastroje/zvuk.py`).
6. Revizní stránka (Artifact NCnPwTFvfcjDD8PfuyNQH2), storyboard před finálním renderem, kontrola proti tomuto skillu bod po bodu.

## 8. Starý kit: co bylo špatně (AUDIT_NASE.md, v2 to řeší)

- formát 1728x720 30 fps na 1440x1080 24 fps, takt 12 fps celého kompozitu s resetem fáze na střihu; zdroje 23,976 fps nepřevádět přes `fps=30` v `priprav.py` `kus()`
- `zvuk.py`: standardní mix se sidechainem, švihy pryč nebo na 20 až 30 % střihů o 20 dB tišší, sub odhalení s náběhem 7 až 10 snímků
- chybí typy scén: karty, zeď, výřez (nálepka a na barvě), UI okno, loga, dokumenty, série karet, závorky; `generator.py` `postav()` jim dát rozpočet aspoň 1 scéna na 10 s
- hook: vynutit úvodní komponovaný obraz 3 až 5 s, nezačínat glitchem
- obří slova a štítky hustěji (obří slova cca 16 za minutu), obří jen obsahová slova aspoň 3 písmena
- grade: viněta, lehké změkčení, část záběrů ČB, zvednutá černá
- glitch: jedna rodina na reel, start 2 snímky před střihem, nikdy dvakrát na stejném snímku
- text: sloty, pop za 1 snímek, záře místo stínu, A-roll režimy z bodu 3
