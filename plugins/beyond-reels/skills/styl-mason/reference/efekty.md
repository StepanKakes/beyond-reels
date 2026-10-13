# Beyond efekty: radiální blur, záře, fisheye, LCD (Tim 4. 10. 2026)

Tim: tyhle efekty jsou náš Beyond styl, přidávají profesionalitu a posouvají videa na jiný level. Platí pro všechna Beyond videa.
Pořád zakázané: strobo, glitch přechody, pixelový oheň, rotoscope Timovy webky.

## Jak se dělají

CSS radiální blur ani fisheye neumí, proto běží **po renderu** jako adjustment vrstvy v AE:
`$BR_MATANYONE_PY nastroje/postfx.py render-raw.mp4 fx/<kompozice>.json vystup.mp4`
- plán efektů je JSON vedle kompozice (`fx/*.json`), časy v sekundách, parametry číslo nebo klíče `[[t, v], ...]` (`{"k": [...], "ease": "out"}` pro dojezd)
- `oblast: [x, y, w, h]` + `mekkost` omezí efekt na kus obrazu (záře jen na UI kartě)
- ve Studiu efekty nejsou vidět, kontroluj až výstup postfx; render se jmenuje `*-raw.mp4`, finál bez přípony
- typy: `radial` (zoom blur, ostrý střed), `zare` (bloom), `zvednuti` (zvednuté černé), `fisheye`, `barva` (expozice, saturace, tint), `blur`, `pohyb` (směrový motion blur), `kanaly` (barevný lem), `vinetace`, `zablesk`, `zrno`

LCD vzhled UI (subpixely, mřížka pixelů, hloubka ostrosti, šednutí rohů) je v DOM: `BN.lcd(kontejner, { roztec, rozmazani, polomer, sila })`, takže je vidět i ve Studiu.

## Kdy co (změřeno u Jacka, Shelby a Georgiose)

| Moment | Efekt | Hodnoty, od kterých začít |
|---|---|---|
| UGC záběry lidí (selfie, story, karty s videi) | `blur` 2 až 3 px + `radial` 0,045 až 0,075 (ostry 0,06 až 0,12) + `zare` prah 110 až 140, polomer 36 až 46 + `zvednuti` černé 22 až 30 | Shelby intro f1 až f24, karty 1 3 2 |
| IG profil, počítadlo followerů | `radial` se středem na čísle 0,05, po tvrdém střihu do detailu 0,06 až 0,1 (ostry 0,12 až 0,16) + `zare` prah 165 polomer 22 + `vinetace` 0,3 | Shelby f376 až f438, Georgios f1091 až f1148, f1741 až f1812 (tam na konci silný blur 0,13) |
| Obří slovo přes mřížku náhledů | první snímek `barva` expozice 2,1 > 1 za 3 sn., `fisheye` 0,13 (na výšku reelu 0,07), `radial` 0,02, `zare` prah 200, `kanaly` 2,5, `vinetace` 0,4 | Shelby NEXT CONTENT f1291 až f1386 |
| Zvětšené UI (YouTube, prohlížeč) | `zare` prah 185 polomer 18 síla 0,6 + `kanaly` 2 + při 3x zoomu `blur` 1,6 | Shelby YouTube f1565 až f1848 |
| Rychlý pohyb (švih, skluz, nájezd) | `pohyb` 60 až 110 px po dobu pohybu, úhel podle směru | Shelby řada karet f74, švih stránky f2303 |
| Střih do nové scény | `zablesk` bílý 0,35 až 0,55 na 1 až 3 snímky nebo pulz desky | Shelby f218, Elaine pulz desky |

## Pravidla, aby to nebylo moc

1. Efekt má důvod: záře tam, kde je světlo nebo číslo, radiální blur tam, kde je pohyb nebo kam má jít oko. Ne plošně přes celé video
2. Ostrý střed vždy na tom, co se čte (číslo, slovo, titulek). Text, který se má přečíst, nikdy pod silným blurem
3. Bílá plocha Beyond papíru musí zůstat bílá: `zvednuti` bez kontrastu, `zare` s vysokým prahem nebo v `oblast`
4. Na výšku (1080 x 1920) jsou fisheye a radiální blur silnější, ber zhruba polovinu hodnot
5. Kontrola: snímky výstupu vedle sebe s originálem nebo předchozí verzí (`nastroje/dvojice.py`, `mrizka.py`)

## Ukázka
`src/efekty.html` + `fx/efekty.json` > `renders/efekty.mp4`: IG profil v LCD obalu se září a radiálním blurem na čísle, náš měkký přechod
(maska s 220 px měkkou hranou místo Jackovy pixelové hrany), YouTube karta s realistickým psaním titulku a popisu, fisheye mřížka se serifovým slovem.

## Zvuk (SFX) a komponenty v barvách Beyond
- Sdílená knihovna `$BR_PROSTOR/sfx/` (README + katalog.json): `zaklad/` Timova schválená sada, `shelby/` vzorky vytažené ze Shelby
  s `mapa.json` (116 výskytů, hlasitost vůči hlasu). Tabulka kdy co je v `sfx/README.md`, 1:1 stopa byla v jack-styl (zvuk_shelby.py), není součástí pluginu
- Komponenty Elaine (EK) v Beyond: třída `ek-beyond` na scéně nebo #root (papír, černá, červená, HN + Instrument Serif), ukázka `src/elaine-beyond.html`
