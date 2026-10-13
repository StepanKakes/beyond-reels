# Replikace zařízení 1:1 (metoda, nástroje)

Cíl: naučit se nové zařízení tak, aby komponenta s výchozími parametry dala stejný obraz jako originál ve stejných snímcích. Pak teprve téma Beyond.

## Postup
1. **Rozbor** (agent na levnějším modelu): zadání `$BR_INSPIRACE/_rozbor/_zadani/zadani.md`, výstup `ZARIZENI.md` s tabulkou hodnot po snímcích a pásy `hd/pas_*.jpg`. Čísla z rozboru ověř okem na pásu, někdy jsou v jiné soustavě (Ben NETWORK: rozbor 461 px, ve skutečnosti 255).
2. **Podklady z originálu**: logo z pásu (bílé pixely na alfu), pozadí s vymazanou kartou, bankovka přes `cv2.inpaint`. Obsah fotek nahraď vlastními, porovnává se geometrie a čas.
3. **Kompozice repliky** `src/r-<nazev>.html` na původní časové ose: `T(f) = (f - 1) / fps`, rozměr originálu (1920x1080 nebo 1080x1920), `<link rel="stylesheet" href="tema-jack.css">`, u 23,976 fps `data-fps="24"` a render `--fps 24000/1001`.
4. **Render** `node build.mjs r-<nazev> && npx --yes hyperframes@0.8.105 render . --output renders/replika/r-<nazev>.mp4 --workers 3 --quiet` (krátké repliky trvají 5 až 15 s).
5. **Porovnání**
   - `python3 nastroje/porovnej.py ORIG.mp4 OD DO REPLIKA.mp4 OD2 --vyrez x0,y0,x1,y1 --barva D7460D --ven replika/x` měří u obou stejnou maskou (barva prvku) bbox, plochu a barvu v každém snímku, vypíše průměrnou a maximální odchylku a uloží pás originál nad replikou
   - `python3 nastroje/dvojice.py ORIG.mp4 REPLIKA.mp4 30,52,262 --ven replika/x.jpg` mřížka dvojic ve vybraných snímcích (víc scén najednou)
   - Cíl: odchylka bboxu do 3 % a stejný snímek nástupu. Obrázky prohlížej zmenšené, šetři kontext
6. **Iteruj** jen čísla v komponentě (výchozí hodnoty), ne v kompozici. Měřená křivka, kterou exp doběh nevystihne, patří do tabulky (`ZOOM_HOOK`, `POLE_HOOK`, `POP_G`, `STITEK_POP`, `SNAP`).

## Nástroje na cizí materiál (případové studie)
- `nastroje/zabery.py videa... --ven zdroj/x/zabery.json` index záběrů (střihy, obličej, jas, ostrost) + arch náhledů. Potřebuje OpenCV s Haar kaskádou: `$BR_MATANYONE_PY`
- `nastroje/montaz.py --zabery ... --id 12,40 --delky 8,8,6 --pomer 0.5625 --sirka 1080 --ven x.mp4` montáž s výřezem na obličej (match cut), nebo `--video X --casy 30,161` bez indexu
- `nastroje/fal.py MODEL '{json}' --ven cesta` fal.ai (klíč z beo-web/.env.local, Tim povolil): `openai/gpt-image-2` (obrázky; průhlednost neumí, generuj na pozadí "hex FBF9FC" a dej `mix-blend-mode: multiply`), `fal-ai/elevenlabs/tts/multilingual-v2` (čeština), `fal-ai/minimax/voice-clone` + `fal-ai/minimax/speech-02-hd` (klon hlasu)
- Pozor na vypálené titulky v cizích vlozích: vyber záběry bez nich (arch `zabery_vse.jpg`)
