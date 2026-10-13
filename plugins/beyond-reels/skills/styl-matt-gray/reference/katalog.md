# Katalog technik Matta Graye (změřeno)

Snímky jsou snímky originálu při 23,976 fps (v kitu `MG.M(n)`), px na 1080x1920. Plný záznam: `$BR_INSPIRACE/matt-gray/_rozbor/<id>/SHOTLOG.md`.

Videa:
- **Ddm6if9RbJT** (82 s) systems grid: framework, split režim, nadpisy sekcí, uzel s větvemi, kruh s paprsky, 6 x 5 = 30, kalendář, orbit sociálních sítí, náhled playbooku
- **Ddpmzt8M_TG** (66 s) Loom + Claude: hook s podkladem, karty s webkou a vlnou nahrávání, štítky s linkami, zářící ikona, dokument, strom, trychtýř, CTA "Comment Calm"
- **DdusbPlRYxW** (60 s) distribuce: bez splitu, pyramida přes talking head, přeškrtnutí, 44 % B-roll, seznam po slovech, velké slovo maskou

## Globálně

| | Ddm6 | Ddpm | Ddus |
|---|---|---|---|
| střihů | 28 | 21 | 31 |
| medián záběru | 2,7 s | 2,7 s | 1,5 s |
| podíl A (split) | 38 % | asi 45 % | 0 |
| B-roll | 15 %, 6 záběrů po 1,5 až 2,8 s | krátké, 0,7 až 2,5 s | 44 %, 20 záběrů po 0,6 až 1,8 s |
| přechody | jen tvrdé střihy | jen tvrdé | jen tvrdé, 26 z 31 do ±3 sn. od začátku slova |

Pohyb je plynulý (každý snímek se mění), žádný low framerate.

## Rozložení split režimu
- Pozadí #FDFDFD, grafika y 0 až 1291
- Box webky x 31 až 1019, y 1291 až 1920, horní rohy 14 až 22 px, bez rámečku a stínu, video statické (Matt nechává hlavu přečnívat maskou, u nás NE)
- Mřížka: rozteč 72,7 px, svislé čáry na x = 539 + k·72,7, barva #E1E0E2, měkká linka, horních ~240 px prázdných, plná síla od y ~600, k bokům mizí
- Hook karta s videem x 89 až 990, y 604 až 1110, rohy 48 px. Webcam karty 276 x 384, mezera 1 buňka
- Diagram: čáry 3 až 4 px černé, uzel obrysový box, štítky 347 x 160 (Ddpm) nebo menší ve stromu

## Typografie
- Neo grotesk Helvetica Neue Bold, proklad −0,03 až −0,05 em
- Hook: lehký řádek ~100 px (cap 72), hlavní slovo Bold verzálky až 163 px (SYSTEMISE cap 117, šířka 828)
- Nadpis sekce: šedá kurzívní číslice 287 px #575458, THE / FUNCTIONS 100 px verzálky
- Štítky ExtraBold verzálky, uvnitř volitelně 3 linky 4 px
- Titulky Bold ~72 px (cap 50 až 52), bílé, bez stínu, střed y ~1202 (Ddm6, Ddpm) nebo základna y 1360 (Ddus)
- CTA: "Comment" 72 px, "‘Calm’" ~145 px akcent, tvrdý střih 1 snímek před řečí

## Recepty

**R1 Vyjeď (text).** offset ~1 em zdola, (1−t)³ za 8 sn. (SYSTEM: 112, 73, 46, 27, 14, 6, 1 px), krytí 6, 13, 24, 38, 56, 78, 99 %, svislý blur σy 24 až 29 px na prvních 3 sn., σx 0. Malá slova 5 sn. Stagger slov 1 až 3 sn., řádků 3 až 6. Předbíhá řeč o 3 až 6 sn. Slovo se může rozdělit na tokeny ("RECORDI" + "NG"). `MG.vyjed`, `MG.nadpis`

**R2 Podklad za řádkem.** wipe zleva 841 px za 23 sn. (52 px/sn. dolů na 4), power4 out, startuje po dojetí textu řádku. `MG.podklad`

**R3 Nadpis sekce.** oblouk (kružnice R ~635, vrchol x 177 y 640, linka 3 až 4 px) se kreslí 6 sn., pak tečka ~40 px, číslo a dva řádky (R1). Drží 11 až 19 sn., odchod 4 sn. nahoru o 25 px s fade. `MG.sekce`

**R4 Větve a štítky.** čára z uzlu ven 8 až 10 sn., štítek wipe zleva 5 až 6 sn. (rohy ~6 px), text uvnitř vyjede s maskou 0 až 2 sn. po slově, stagger 1 až 2 sn. Font štítku se zmenšuje, aby se vešel. `MG.kresli`, `MG.stitek`

**R5 Štítek zespodu (Ddpm).** rise 80 až 100 px za 8 sn., krytí za 6, stagger 6 až 10 sn. Nic neodchází, drží do střihu. `MG.stitekZdola`

**R6 Karta z ducha.** y +176 až +220 > 0, krytí 0,35 > 1, blur ~12 > 0, expo out. Malé karty 8 sn., široká 16, velká (ONE SYSTEM 306 x 442) 22 sn. o 327 px. Stagger 9 až 10 sn. `MG.karta`

**R7 Přesun karty.** po nástupu zmenšení na 0,69 a posun o 363 px za 20 sn., z karty pak roste strom. `MG.presun`

**R8 Vjezd tabulky.** translateX 780 > 0 za 13 sn. expo out, dozvuk zmenšení a drift 32 px za 8 sn. `MG.vjezd`

**R9 Zvýraznění.** bledá buňka skáče tvrdě 4 sn. na pozici (kalendář). Štítky ve sloupci pulzují scale 1,15 po 3 až 4 sn. `MG.skoky`, `MG.pulz`

**R10 Svět plave.** mřížka i prvky se hýbou jako celek, ~7 px/sn. při scrollu, odjezd ~35 px/sn. Klidný drift v kitu `MG.svet`

**R11 Zoom talking headu.** lineární drift +15 až 17 % za 38 až 59 sn., nebo pull out −16 až −21 % za 61 až 89 sn. (Ddus ease out s mocninou 1,4). Jump cut skočí ×1,22 až 1,33 nebo ×0,84 až 0,87. Některé záběry statické. `MG.zoom`

**R12 Titulky.** tvrdý střih, 1 až 3 slova (typicky 1 až 2), medián 6 až 7 sn., +1 sn. po začátku slova (P10 −2, P90 +4), bez animace, bez blur, bez zvýraznění. Jen v B. Grafický text vždy nahrazuje titulky. `MG.titulky`

**R13 Pruh na slovo (pyramida).** pruh se maže a slovo odhaluje stejnou tvrdou maskou zleva, lineárně 41 až 44 px/sn., 6 až 9 sn., dohraje do zvuku slova. Pyramida: špička (578, 1147), základna x 156 až 956 na y ~1786, bílý obrys 5 px, černá výplň, přes talking head. Hlavička: akcentový pruh x 144 až 964, y 1059 až 1107, text 38 px vlevo. `MG.pruhNaSlovo`

**R14 Přeškrtnutí (Matt) = zhasnutí (Beyond).** Matt: červené vřeteno 19 px uprostřed, hrotité, 325 px za 22 sn. ease in out, konec tahu na zvuk slova. U nás `MG.zhasni` (šedá za 6 sn.)

**R15 Seznam po slovech.** každé slovo 8 sn.: y +109 > 0 power3 out, krytí 56 > 100 % za 5 sn., blur 3 > 0 px. Stagger 3 až 5 sn., první slovo řádku na řeč, další předbíhají 3 až 6 sn., řádky po ~28 sn., rozteč 104 px, mizí střihem. `MG.seznam`

**R16 Velké slovo maskou.** akcentové slovo ~165 px, měkká hrana ~260 px jede ~95 px/sn., 11 sn. lineárně, bez blur. Následující slova naskočí tvrdě. `MG.maskaZleva`

**R17 Popup lead magnetu.** scale 0,8 > 1,066 > 1,0 za 9 sn., pak push in 1 > 1,09 za 30 sn. `MG.popup`

**R18 Orbit (Ddm6 1602 až 1661).** avatar uprostřed, 5 ikon naskakuje po 2 sn. na čárkovaném kruhu, kruh se otáčí 3 až 4 °/sn. s ease out, ikony zůstávají vzpřímené. Zatím není v kitu

**R19 Zářící ikona (Ddpm R7).** ikona 342 px, 12 paprsků, halo vykvete za 9 sn., paprsky se kolébají ±10°, ikona plave ±4 px. V Beyond verzi bez záře (Tim záři nechce), jen ikona a paprsky

**R20 Dokument (Ddpm R8).** svislá linka 2 px se kreslí shora dolů, akcentový scan pruh sjede přes dokument za ~25 sn.

## Zvuk
- Ddm6: tichý hudební podklad, 15 až 20 dB pod hlasem, v polovině videa sílí na 7 až 10 dB pod hlasem. SFX neprokázány
- Ddpm, Ddus: jen hlas, silně komprimovaný, −14 LUFS, true peak −4,5 dB. Žádná hudba ani SFX (IG mohl hudbu odříznout)

## Konec
- Ddm6 a Ddpm: CTA "Comment Calm" v B, náhled playbooku v A s popupem a pomalým zoomem, konec na talking headu bez end cardu
- Ddus: poslední věta opakuje hook, konec tvrdý na titulku, smyčka
