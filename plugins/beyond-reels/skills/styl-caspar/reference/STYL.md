# Styl Caspar (podle Caspara Tremletta, @caspartremlett)

Zdroj: jeden reel DebbKfoAPPe (48,3 s, 16:9, 30 fps), rozbor po snímcích v `DebbKfoAPPe/SHOTLOG.md` a `ROZBOR.md`.
Z jednoho videa nejde oddělit konstanty od náhody, níže „konstanty“ = co se v tom videu drží celou dobu. Až přibudou další reely, ověřit.
Použití u nás: talking head insight a klientský příběh, formát 4:3 1920x1440 30 fps.

## Jak editor přemýšlí

Video je řečí vedený příběh (181 slov za minutu), obraz ho dokresluje doslovně: když mluví o Davidovi, je tam David, když o deadlinech, je tam
ten moment. A-roll je jen 21 %, zbytek nesou B-rolly lidí z příběhu (57 %) a čisté karty se slovem (18 %). Typografie je hlavní nástroj
důrazu: místo zvuku a efektů řídí pozornost velikostí slova, jednou barvou a tím, kde slovo v prostoru stojí (za hlavou, na okně, na podlaze).
Střih padá těsně před první slovo věty, takže každá věta začíná novým obrazem. Rytmus je vlna: držák, krátký sprint, držák.

## Konstanty (měřené)

| co | hodnota |
|---|---|
| záběr | průměr i medián 1,30 s, rozptyl 0,83 s, 6 záběrů pod 0,3 s, 5 nad 2 s |
| střih | tvrdý, 0,05 až 0,19 s před první slovo věty, titulek naskočí ~0,2 s po střihu |
| podíl | A-roll 21 %, B-roll 57 %, karty 18 %, klip v rámečku 4 % |
| písmo | jedna neo-grotesk rodina: Bold verzálky (~80 % času), Medium minusky, úzký Bold na kartách |
| velikosti (výška verzálek / H) | drobná 3,6 až 4,5 %, základní 5,6 %, velká 7,5 až 11 %, obří 13 až 15,4 % |
| pozice základního titulku | x 50 %, y 43 až 50 % (hrudník, pod obličejem) |
| slov najednou | 1 až 3, nejvýš 5, nové slovo každých 4 až 12 snímků podle řeči (±3 sn.) |
| barvy | bílá #FCFCFC, černá karta #000001, akcent oranžová #FB6B01 až #FB5A00, jen na jedno slovo nebo jeden tvar |
| karty | animované po 2 snímcích (15 fps), titulky přes záběr plynule 30 fps |
| zvuk | -14,1 LUFS, LRA 1,7 LU, tichý basový podklad, jen nízké sub údery na 7 místech (karta, pop-in, logo), žádné whooshe |

## Systém titulků

- **Verzálky** nesou děj a tvrzení. **Minusky** jsou osobní, plynulý hlas („i haven't“, „that couldn't stay consistent“, „Your story“).
- Dvě úrovně v jedné sestavě: drobné spojky a obří klíčové slovo (C4).
- Zvýraznění: jedno barevné slovo, skok velikosti, šedá průsvitnost vedlejších slov, umístění za subjekt nebo do scény.
- Nástup tvrdý nebo 4 sn. fade, důrazová slova šedý nástup 8 až 13 sn. Odchod skoro vždy se střihem.

## Slovník zařízení

| ID | zařízení | kde (s) |
|---|---|---|
| C1 | jeden titulek stojí přes 6 rychlých střihů selfie klipů (po 4 až 6 sn.) | 4,50 až 5,60 |
| C2 | bílá karta, slova po jednom, pomalý zoom out (8,1 > 5,7 % H), odjezd nahoru ease-in | 2,43 až 4,13 |
| C3 | barevná karta s úzkým bílým slovem, nájezd zdola ease-out | 4,13 / 41,03 |
| C4 | dvouúrovňový titulek: drobné spojky + obří slovo 13 až 15 % H | celé video |
| C5 | jedno barevné slovo ve větě | celé video |
| C6 | text přilepený do scény ve 3D (okno, podlaha) | 7,27 / 30,63 |
| C7 | text nebo UI kolaž za hlavou | 0 / 6,0 / 28,5 |
| C8 | klip se zmenší do rámečku (59,5 % šířky) na bílé, text vedle | 10,27 až 12,93 |
| C9 | pop-in vloženého klipu + punch-in A-rollu +13 % za 12 sn., barevné jméno | 14,1 |
| C10 | barevný rámeček kolem obličeje na černobílém záběru, text po slovech vedle | 20,43 až 21,77 |
| C11 | pomalý pull-back o 3 až 9 % lineárně na statických záběrech | 5,6 / 19,0 |
| C12 | whip pan s blurem 10 sn., titulek přibitý k obrazovce | 24,03 až 24,37 |
| C13 | kartičky (UI, miniatury) vsunuté do barevné karty nebo za řečníka | 0 / 41,1 |
| C14 | šedý průsvitný nástup důrazového slova 8 až 13 sn. | 1,0 / 16,2 |
| C15 | výměna slova bez resetu sestavy (překryv 4 sn. nebo tvrdě) | 38,9 / 45,6 |
| C16 | logo teaser za hlavou s tečkovanými vodítky, pak logo karta | 36,67 |
| C17 | slova rozházená na jedné výšce, hlava v mezeře | 19,0 |
| C18 | schodový titulek po diagonále | 40,0 |

## Beyond verze

- **Barvy:** oranžová > naše #FF0E00, bílá karta > papír #F4F2EE, černá #111. Červená jen na jedno slovo nebo tvar v záběru.
- **Písmo:** verzálky a obří slova Helvetica Neue Bold. Úzký Bold na kartách (C3) nahradí Helvetica Neue Bold roztažená na výšku (naše obří slovo).
  Casparovy **minusky jako osobní hlas převezmou Instrument Serif rovný** (druhý hlas), Medium nemáme.
- **Titulky:** běžná řeč jde naším standardem (BN.titulkyZeSlov, bez verzálek, pod obličejem). Casparova typografie (C4, C5, C17, C18)
  nastupuje jen na klíčové věty jako grafika a tam titulek mizí (slovo velké v obraze = nemusí být v titulku). Cíl: 1 sestava na 4 až 6 s.
- **Rytmus:** bereme střih před první slovo věty (hrana do ticha podle hlasitosti) a vlnu držák / zrychlení. Energii nedělají krátké
  záběry, ale výměny slov uvnitř záběru po 4 až 12 sn. a změna kompozice karty. Záběr aspoň 1,7 s, s lidmi 2 s.
- **Formát 4:3:** základní poloha y 62 až 68 % (pod obličejem, měřit po snímcích), obří slovo za hlavou (maska_za_osobou).
- **Pohyb:** C2 zoom out = MK drift po křivce, odjezd accelExit 13 sn.; C3 nájezd softLand 12 sn.; C9 punch-in max 1,13 softLand 12 sn.;
  C11 pomalý pull-back 3 až 6 % lineárně; C12 švih whip 7 až 8 sn. bez záblesku; karty po 2 snímcích (krokově) jako originál.
- **Zvuk:** standard mix.py. SFX jen hluboký úder (sub) ze `sfx/zaklad` na kartu, pop-in a výměnu slova, klik na slova po jednom.

## Co nepřebíráme a proč

- **C1 sprint 6 střihů po 0,15 s:** porušuje klid (záběr aspoň 1,7 s) a blíží se stroboskopu. Náhrada: titulek stojí, za ním se
  v jednom okně na papíře vymění 3 fotky po 0,6 s (ke schválení).
- **C10 černobílý grade a bílé prolnutí:** grade neměníme. Rámeček kolem obličeje červený na barevném záběru ano, bez odbarvení.
- **C14 šedý průsvitný nástup:** blízko zakázaného naskočení průhledností. Důrazové slovo jen softLand 12 sn.
- **C6 text ve 3D na okně a podlaze:** potřebuje tracking scény, náš A-roll je statický. Případně jen na B-rollu se statickou kamerou.
- **C16 logo karta na konci:** zakázaný závěrečný titulní snímek. Logo teaser za hlavou uprostřed videa smí.
- **Anglické texty, emoji, tečky na konci, pomlčky:** jako vždy ne.
