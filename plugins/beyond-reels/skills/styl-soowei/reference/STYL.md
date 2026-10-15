# Styl SooWei (YouTube intro 16:9)

Zdroj: SooWei Goh, "exactly how i built a $4m/yr consulting business working 6 hours/day" (GR2vYzl5n34), jen intro 0 až 27 s.
Měření po snímcích: `GR2vYzl5n34/SHOTLOG.md` a `ROZBOR.md` (zařízení SW1 až SW14 s recepty). Zatím jedno video, konstanty ověřit na dalších.

## Konstanty
- Formát 16:9 1920x1080, originál 25 fps (u nás 30 fps, snímky x 1,2).
- Každý střih tvrdý. Plynulost dělá zoom out, který přetéká přes střih (rychlost nejvyšší hned po střihu), a střih v pauze řeči.
- Text je součást záběru: titulek leží v kontejneru s klipem a zmenšuje se s ním.
- Text vždy na středu x 50 %, bez podkladu a obrysu, jen měkký stín. Důraz velikostí, váhou a červeným boxem, ne animací.
- Nástup textu: průhlednost a doostření (blur 14 > 0 px) za 3 až 7 snímků, bez posunu, slova v pevném rozložení (nic se nepřeskupuje).
- Dvě fáze intra: rychlé B-rolly 1,3 až 2,4 s (jeden záběr = jedna myšlenka = jeden titulek), pak pomalé záběry 4,5 až 5,8 s, kde pohyb dělá zoom.
- Ticho: jen hlas, žádná hudba ani SFX, hlas sestříhaný do pauz 0,2 až 0,3 s.

## Slovník zařízení
| ID | co | kde (25 fps) |
|---|---|---|
| SW1 | zoom out klipu i textu spolu 1,55 > 1 za 28 sn. power3.out + doostření | f0 až 28, varianty S6, S7, S8 |
| SW2 | jméno po písmenech v náhodném pořadí, průhlednost + blur | f2 až 14 |
| SW3 | podtitul pod jménem naráz za 5 sn. | f23 až 28 |
| SW4 | titulek po slovech v pevném rozložení | S2, S4, S5 |
| SW5 | fráze 2 až 4 slova, tvrdá výměna, mezera 3 sn. | S6 |
| SW6 | červený box pod slovy, wipe zleva 10 sn. | f316 až 326 |
| SW7 | počítadlo expo out 0,68 s s vodorovným rozmazáním, jednotka naskočí potom | f70 až 93 |
| SW8 | triptych harmonika: panel 1 zrychlí a tvrdě stojí, panel 2 zpomalí | f171 až 198 |
| SW9 | jemné klouzání B-rollu 3 % šířky za 25 sn. | S2, S3 |
| SW10 | kalendář: karty po sloupcích po 1 sn., zoom out 1,36 > 1 za 104 sn., vybrané karty zbarví | f340 až 453 |
| SW11 | karta se zaoblením na šedé vinětě, nadpis shora, kolejnice kroků zdola, kroky se přepínají | f453 až 599 |
| SW12 | bílý papír zleva tlačí kameru po S křivce 40 sn. | f600 až 639 |
| SW13 | červené podtržení fixkou ve dvou tazích | f642 až 675 |
| SW14 | střih do pauzy hlasu | celé |

## Jak editor přemýšlí
Intro je přehled životopisu (kdo jsem, co jsem dokázal, na čem stojím) a hned slib systému. Každé tvrzení dostane jeden doslovný
obraz (konference, řečník, promoce, basketbal, kalendář), čísla se počítají, kroky systému se ukazují jako kolejnice.
Nic neřve: žádné zvuky, žádné švihy, jen čisté střihy a měkký dojezd kamery.

## Beyond verze (návrh ke schválení)
- Akcent #FF0E00 místo #E23030 a #CB0000, zlato kalendáře taky červená, šedé karty #111 / papír #F4F2EE.
- Písmo Helvetica Neue místo SF Pro: běžné titulky Medium, důraz Bold. Podtitul kurzívou nahrazen Instrument Serif rovným.
- Texty česky. Grade záběrů neměníme (pravidla), teal a orange nepřebíráme.
- Ručně psaný nadpis na papíře (SW12) nemáme písmo: Instrument Serif nebo Helvetica Bold, podtržení fixkou ponecháno.

## Rozhodnuto (Štěpán 15. 10. 2026)
- Blur při nástupu textu necháváme 1:1 (jen u nástupu, krátce).
- Zvuk: původně jen hlas, týž den Štěpán vybral SFX ke každé akci (seznam ve skillu).
- Text o 25 až 30 % větší než originál, bez stínu a aury.
- Beyond verze barev a písma, řemeslo a časování 1:1.
- Ukázka na Timově záběru ořezaném na 16:9.
