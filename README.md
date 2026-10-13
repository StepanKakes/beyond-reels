# beyond-reels

Plugin pro Claude Code, se kterým tým Beyond dělá reely v HyperFrames od surového videa po render s revizí.

## Co umí

| Příkaz | Co dělá |
|---|---|
| `/beyond-reels:reel` | průvodce reelem: brief (styl, typ, délka, CTA), střih do ticha, studio hlas, plán se směry ke každé větě z naší knihovny, storyboard ke schválení, stavba, standardní mix, render a revize |
| `/beyond-reels:revize` | nahraje render nebo storyboard na revizní stránku, přečte a vyřídí komentáře, spravuje knihovnu komponent |
| `/beyond-reels:novy-styl` | naučí nový styl z odkazů na reely tvůrce: stažení, rozbor po snímcích, kit na jádře, ukázka, nový skill |
| `styl-mason`, `styl-noske`, `styl-matt-gray`, `styl-lumitris`, `styl-nathan` | jazyk jednotlivých stylů, načítají se samy podle zvoleného stylu |

Společný vkus (co Tim a Štěpán schválili a zamítli) je v `plugins/beyond-reels/vkus/pravidla.md`, nové verdikty z revizí přibývají
do kolekce `verdikty` v databázi revizní stránky.

## Instalace (každý Mac s Apple čipem)

1. Zip `beyond-reels-plugin.zip` rozbal do `~/Documents/beyond-reels-plugin` (nebo naklonuj repo, až bude na GitHubu) a v Claude Code:
   ```
   /plugin marketplace add ~/Documents/beyond-reels-plugin
   /plugin install beyond-reels@beyond
   ```
2. Balík médií `beyond-reels-media.zip` (hudba a B-rolly, asi 1 GB, posílá Štěpán) rozbal do `~/Documents/beyond-reels-media`.
3. Jednou spusť setup (Homebrew musí být nainstalovaný):
   ```bash
   zsh ~/Documents/beyond-reels-plugin/plugins/beyond-reels/scripts/setup.sh
   ```
   Nainstaluje ffmpeg, node, uv, yt-dlp a whisper, Python prostředí (zvuk, zarovnání slov, DeepFilterNet3), vytáhne Helvetica Neue
   ze systému tvého Macu (písmo se nesmí šířit, plugin ho nenese), stáhne model pro přepisy a zapíše cesty do `~/.config/beyond-reels/env.sh`.
   `--kontrola` jen ukáže, co chybí. `--matanyone` přidá masky lidí pro text za osobou (asi 2,5 GB).
4. Revizní stránka: https://claude.ai/artifact/NCnPwTFvfcjDD8PfuyNQH2, o přístup s úpravami požádej Štěpána.

Reely se zakládají v `~/Documents/beyond-reely/<nazev>`. Tahák pro tým: `docs/tahak.html`.

## Co je kde

- `plugins/beyond-reels/skills` průvodce a styly, `vkus/pravidla.md` společný vkus
- `plugins/beyond-reels/prostor` sdílený kód: `jadro` (kity MK, BN, EK s měřenými křivkami), `tools` (studio hlas, mix, zarovnání slov,
  kontrola střihu, masky lidí, knihovna), styly `noske-styl`, `matt-gray-styl`, `nathan-styl`, `lumitris-styl`, `sfx`, `knihovna` (popisy komponent), `vzory` (hotové kompozice)
- mimo plugin: média (`~/Documents/beyond-reels-media`), reely (`~/Documents/beyond-reely`), verdikty a komentáře v databázi revizní stránky

## Aktualizace

Nový zip rozbal přes starý (nebo `git pull`), pak `/plugin` > Marketplaces > beyond > Update. Cesty se po aktualizaci najdou samy, setup znovu jen když to plugin řekne.

## Pravidla repozitáře

- Nový styl přidává `/novy-styl` sem jako `skills/styl-<jmeno>` a kit do `prostor/<jmeno>-styl`. Zvyš verzi v `plugin.json`.
- Křivky pohybu v jádře vycházejí z motionmaxxing (Apache 2.0, viz `prostor/jadro/NOTICE`).
- Žádné soubory Helvetica Neue, žádné API klíče, žádná média reelů.
