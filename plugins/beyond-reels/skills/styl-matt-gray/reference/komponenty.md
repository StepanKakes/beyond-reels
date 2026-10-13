# Komponenty MG (matt-kit) a pasti

Soubor `matt-gray-styl/js/matt-kit.js`, vše na jedné pozastavené timeline `tl`, časy v sekundách, délky ve snímcích ORIGINÁLU (23,976 fps). `MG.M(n)` převede snímky na sekundy. Kompozice běží na 30 fps. Seek safe: žádný Math.random, žádné rAF.

| Funkce | Co dělá | Recept |
|---|---|---|
| `vyjed(tl, el, t, {snimku, od, blur})` | vyjede o `od` em zdola, krytí, svislý blur přes SVG filtr | R1 |
| `slova(el)` | rozdělí text na `.mg-slovo` (místo rezervované od začátku) | |
| `nadpis(tl, el, casy, {stagger, snimku})` | slova vyjedou na časy (pole) nebo se staggerem | R1 |
| `podklad(tl, obal, t, {snimku})` | akcentový podklad zleva s vlastní kopií textu v barvě akcent-text | R2 |
| `kresli(tl, path, t, {snimku, ease, obracene})` | čára přes dash | R4 |
| `stitek(tl, el, t, {snimku, textPo})` | wipe zleva + text vyjede s maskou | R4 |
| `stitekZdola(tl, el, t, {y})` | rise 90 px za 8 sn. | R5 |
| `karta(tl, el, t, {snimku, y})` | duch zespodu: y, krytí 0,35, blur 12 | R6 |
| `presun(tl, el, t, kam, {snimku, ease})` | pan a zmenšení | R7 |
| `vjezd(tl, el, t, {x, snimku})` | vjezd tabulky zprava | R8 |
| `pulz(tl, el, t, {scale, snimku})` | důraz 1,15 tam a zpět | R9 |
| `skoky(tl, el, t, pozice, {snimku})` | tvrdé skoky zvýraznění | R9 |
| `sekce(tl, el, t, konec)` | nadpis sekce: oblouk, tečka, číslo, řádky, odchod | R3 |
| `svet(tl, el, t0, t1, {od, kam})` | drift celého světa grafiky | R10 |
| `zoom(tl, el, t0, t1, od, kam, {origin})` | lineární zoom talking headu nebo B-rollu | R11 |
| `titulky(tl, kontejner, slova, skupiny, {text, konce, trida})` | tvrdé titulky po skupinách, `konce` = konec poslední skupiny úseku | R12 |
| `rezim(tl, el, t0, t1)` | celoobrazová vrstva přes opacity | |
| `pruhNaSlovo(tl, el, t, {snimku})` | pyramida: pruh se maže, slovo se odhaluje | R13 |
| `zhasni(tl, el, t, {snimku})` | místo přeškrtnutí: slovo zešedne | R14 |
| `seznam(tl, el, casy)` | seznam po slovech, šedý náběh | R15 |
| `maskaZleva(tl, el, t, {snimku, hrana})` | velké slovo měkkou maskou | R16 |
| `popup(tl, el, t)` | lead magnet s překmitem a push in | R17 |
| `token(nazev)` | skutečná hodnota CSS tokenu (GSAP neumí tweenovat `var()`) | |
| `ukaz`, `skryj` | tl.set visibility | |

CSS třídy: `.mg-plocha`, `.mg-limetka` (přepne akcent na Mattovu limetku), `.mg-svet`, `.mg-mrizka`, `.mg-box`, `.mg-full`, `.mg-text`, `.mg-radek`, `.mg-lehky`, `.mg-tucny`, `.mg-podklad-obal` + `.mg-podklad`, `.mg-titulky(.stin)`, `.mg-titulek(.velky)`, `.mg-stitek(.linky|.zhasly|.bez-obrysu)` + `.mg-stitek-text`, `.mg-uzel`, `.mg-karta(.akcent)`, `.mg-svg`, `.mg-sekce` (`.tecka`, `.cislo`, `.nazev`, oblouk jako `path`), `.mg-bunka-zvyr`, `.mg-pruh` (`.vypln`, `.slovo`), `.mg-hlavicka`, `.mg-nahled`.

## Pasti (narazil jsem na ně)

- **Celoobrazová vrstva přes opacity, ne visibility.** Runtime dává `<video class="clip">` `visibility: visible` a to přebije skrytého rodiče, vrstva pak kryje všechno. Proto `.mg-full` startuje na `opacity: 0` a `MG.rezim` přepíná opacity
- **Scény grafiky přes `display`**, ne visibility, ze stejného důvodu (děti mají `visible` na sobě)
- **Stejné video dvakrát** (box i celá obrazovka) = varování duplicate media. Pro celou obrazovku vyrob vlastní výřez 9:16
- **Záměrné překrytí** (diagram pod celoobrazovým záběrem) označ `data-layout-allow-occlusion` na scéně a prvcích s textem, zoom videa `data-layout-allow-overflow` na `#full`, jinak check hlásí error
- **Podklad pod textem nefunguje se změnou barvy textu** (text zbělá dřív, než ho podklad přejede). Proto podklad nese vlastní kopii textu a odhaluje se clip-path. Check hlásí `negative_z_index` jen jako varování, neřeš
- **Jeden kořenový index.html**, ukázky v `src/`, `node build.mjs a`
- **check a snapshot** berou jen `index.html`. `snapshot --at ... --no-end`
