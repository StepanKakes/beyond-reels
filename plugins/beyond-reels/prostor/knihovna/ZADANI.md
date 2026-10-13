# Knihovna Mason z produkce

Cíl: z hotových reelů vytáhnout každou grafickou komponentu (motion prvek, efekt, UI objekt, typografický vzor), kterou jsme opravdu použili, a vyříznout ji jako klip pro revizi.

Pravidla
- Zdroj je vždy finální render 4:3 (1920x1440, 30 fps). Časy od a do jsou snímky v tomhle renderu.
- Jedna položka = jedna komponenta v jednom reelu. Když se stejná věc v reelu opakuje, vezmi nejlepší výskyt (nejčistší, nejdelší, bez rušení) a do `vyskyty` napiš časy ostatních.
- Nebrat obyčejný talking head bez grafiky. Titulky a jejich styl jsou jedna položka na reel.
- Klip má obsahovat celý průběh komponenty: nástup, držení, odchod. Typicky 1,5 až 6 s.
- `komponenta` je sdílený klíč napříč reely, aby šly sloučit stejné věci. Použij slovník níže, nový klíč přidej jen když nic nesedí (malá písmena, spojovník).
- `kod`: odkud komponenta pochází: funkce kitu (např. `BN.ytKarta`, `MK.pocitadlo`) nebo vlastní kód v kompozici (`src/telo.html:120`, třída `.yt-...`). Vlastní inline věci jsou důležité, to jsou naše komponenty.
- Texty česky, bez emoji, bez pomlček, bez teček na konci.

Slovník klíčů (rozšiřuj podle potřeby)
yt-karta, yt-mrizka, yt-komentare, ig-profil, ig-mrizka, ig-desktop, im-bubliny, hoste-2x2, prilet-reelu, match-cut-zhlednuti,
karta-bodu, karty-123, cislo-bodu, karta-uprostred, obri-slovo, slova-za-osobou, ai-vyrez, mason-filtr, lcd, duotone,
pocitadlo, pilulka-pocitadlo, profil-zoom, najezd, montaz, vejir, psani, pis-realne, vyber, titulky, slova-zespodu,
zoom-bump, sipka, stitek, citace-stitek, mbx-cisla, popis-klip, broll-okno, koláž, logo-zaber, ekonomie-graf

Výstup
1. `_knihovna/prod/<reel>.json`:
{"styl":"mason","fps":30,"sirka":720,"pomer":"4/3","video":"<cesta k renderu>","reel":"<reel>","polozky":[
 {"id":"mason-<komponenta>-<reel>","komponenta":"yt-karta","od":123,"do":210,"nazev":"YouTube karta","popis":"co dělá a kdy ji použít, 1 až 2 věty","kod":"BN.ytKarta / src/telo.html:88","vyskyty":"0:12, 0:47","kvalita":1}
]}
kvalita: 1 = vzorová ukázka, 2 = dobrá, 3 = slabší.
2. Klipy: `python3 -I tools/knihovna/klipy.py <render> _knihovna/prod/<reel>.json reels/revize/media/knihovna/prod/<reel>` (spouštěj z ~/Documents/GitHub/beo-motion/hyperframes).
3. Ověř hranice: pro každou položku si vytáhni 3 snímky (začátek, střed, konec) ffmpegem a podívej se, jestli komponenta sedí celá. Obrázky nechej u sebe.

Neměň nic v reels ani jack-styl kromě zápisu do `reels/revize/media/knihovna/prod/` a `_knihovna/prod/`. Nic nerenderuj. Nikdy nepřehrávej zvuk nahlas.
