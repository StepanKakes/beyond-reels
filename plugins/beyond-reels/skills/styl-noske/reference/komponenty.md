# NK (noske-kit): API a pasti

Načtení: `<script>window.NK_FPS = 25;</script>`, pak `vendor/gsap.min.js`, `js/noske-kit.js`, `noske-kit.css`. Délky jsou ve snímcích při NK_FPS, časy v sekundách. Vše na jedné pozastavené timeline `window.__timelines.main`.

| funkce | co dělá | zdroj měření |
|---|---|---|
| `NK.karta(tl, el, t0, t1)` | karta přes celý obraz, tvrdý střih (přepíná display) | všech 6 |
| `NK.uvod(tl, video, t, {od:1.5, snimku:40})` | úvodní zoom, který dosedne expo.out | Dd45 |
| `NK.punch(tl, video, t, scale)` / `NK.drift(tl, video, t0, t1, od, kam)` | skok zoomu na jump cutu a pomalý nájezd mezi | DdZ, DdckN |
| `NK.titulky(tl, kontejner, slova, {styl, vynech, x, nastup})` | jedno slovo, tvrdá výměna. `styl[i] = {v:'s'\|'m'\|'l'\|'xl', kurziva, nad}`, `vynech = [[t0,t1]]` pro karty se slovy, `x(t)` posun na hruď, `nastup:'stoupani'` měkký nástup zespodu | Dd45, DdU1 |
| `NK.rozhozena(tl, kontejner, [{text,x,y,v,t,kurziva}], t1)` | slova rozházená přes šířku, přibývají a rostou | Dd45 |
| `NK.kotva(tl, el, [{text,t}], t1)` | malý řádek drží (`.maly`), slovo pod ním (`.vymena`) se mění | DdSR |
| `NK.duch(tl, el, t, {rust, drzi, konec})` | obří číslo naroste, pak tvrdé rozostření a duch za titulky | DdfJ |
| `NK.pocitadlo(tl, el, t, od, kam, snimku)` | čísla po snímcích (90 → 99) | DdfJ |
| `NK.pilulka(tl, el, t, {zap})`, `NK.zapni`, `NK.ztlum(tl, el, t, kam)` | obrysová pilulka, stav krytím 0,4 / 1 / 0,15 za 3 sn. | Dd45 |
| `NK.sklo(tl, el, t)` | skleněná karta: fade 10 sn., +28 px, blur 6 → 0 | DdU1 |
| `NK.oddaleni(tl, el, t)` | věta z 1,7× na 1,0 za 14 sn. expo.out | DdfJ |
| `NK.redukce(tl, el, t, [indexy])` | z věty tvrdě vypadnou slova ("remove half the words") | DdfJ |
| `NK.trychtyr(el, popisky, {x,y,sirka,konec,vyska,mezera})` + `NK.pas(tl, pas, t, {od,kam})` | trychtýř z pásů, stav `NK.zapni`/`NK.ztlum` na `pas.oba` | Tim 2.10. |
| `NK.naBrollu(tl, titulky, t0, t1)` | krémové titulky se stínem přes B-roll | Tim 2.10. |
| `.nk-ikonka` + `NK.sklo` | tmavý štítek s obrysovou ikonou (YouTube, e-mail) vedle hlavy | Tim 2.10. |
| `NK.hookNastup(tl, el, t)` | hook: přiletí z 2,4x a +200 px, 38 sn. power3.out, blur 2 -> 0 | Dd45 |
| `NK.zaostreniVrstvy(tl, titulky, t, {sila, kratce})` | rozmazaná vrstva titulků se zaostří | DdU1 |
| `NK.rozmazatKonec(tl, el, t1)` | 4 sn. rozmazání před tvrdým střihem | Tim 2.10. |
| `NK.sestava(tl, titulky, slova, {typ:'kicker'\|'pod'\|'schody', a, b, radky, serifB, serifRadek, hook, rozmazat, konec})` | vrstvená sestava, vrací [t0, konec] do vynech | Dd45, DdZ, DdckN |
| `NK.postava(tl, el, t)` | plná krémová postava, fade 6 sn. | DdSR |
| `NK.broll(tl, el, t0, t1, {drift})` | B-roll, když není jako HyperFrames clip | všech 6 |

CSS třídy: `.nk-video` (+ `.nk-grade` jen na přání), `.nk-titulky`/`.nk-slovo`, `.nk-karta` (+ `.papir`), `.stred`, `.nk-rozhozena`, `.nk-kotva` s `.maly` a `.vymena`, `.nk-duch`, `.nk-pilulka`, `.nk-sklo` s `.hlavni`, `.vedlejsi`, `.hodnota`, `.nk-redukce`, `.nk-postava`, `.nk-kurziva`, `.nk-citace`.

## Pasti

- **Karty přepínat přes display, ne visibility.** Dítě s `visibility: visible` prosvítá skrytým rodičem. `NK.karta` to dělá sama, `.nk-karta` má v CSS `display: none`.
- **Posun titulků přes left/right, ne x.** `.nk-slovo` má v CSS `translateY(-50%)` a GSAP x by ho přepsal.
- **Sestava se centruje přes `gsap.set(yPercent: -50)`**, ne CSS translate, jinak ho drift přepíše.
- **build.mjs** nahrazuje `{{U(i)}}`, `{{T(i)}}`, `{{D}}` v atributech (časy B-rollů a délky z `zdroj/strih.json`), `/*STRIH*/` vloží úseky. Po přestřihu se nic nepřepisuje ručně.
- **Titulky nad kartami s grafikou** (`z-index: 8` na `.nk-titulky` v kompozici), karty se slovy patří do `vynech`.
- **Sklo potřebuje tmavé nebo pestré pozadí.** Na světlé zdi zmizí, dávej ho na noční B-roll nebo tmavou kartu.
- **Krémové titulky na světlém záběru** drž na tmavém tričku (pás hrudi). Velké verzálky přesahují, zkontroluj čitelnost na snímcích.
- `hyperframes check` hlásí překryv ducha a pilulek, ten je záměrný: `data-layout-allow-overlap` na ducha.
- B-roll jako `<video class="clip nk-video broll" data-start data-duration data-track-index>` (každý další na jiné stopě, ať se nepřekrývají), zvuk vypnutý.
- ffmpeg ve smyčce `while read` potřebuje `-nostdin`, jinak sní vstup a zkomolí názvy.
