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
do `beo-motion/hyperframes/vkus/verdikty.md`.

## Instalace (každý Mac s Apple čipem)

1. Repo `beo-motion` naklonuj do `~/Documents/GitHub/beo-motion` (sdílený prostor: jádro kitů, styly, B-rolly, hudba, SFX, nástroje).
2. V Claude Code:
   ```
   /plugin marketplace add <github-uzivatel>/beyond-reels
   /plugin install beyond-reels@beyond
   ```
3. Jednou spusť setup (Homebrew musí být nainstalovaný):
   ```bash
   zsh ~/.claude/plugins/marketplaces/beyond/plugins/beyond-reels/scripts/setup.sh
   ```
   Nainstaluje ffmpeg, node, uv, yt-dlp a whisper, Python prostředí (zvuk, zarovnání slov, DeepFilterNet3), vytáhne Helvetica Neue
   ze systému tvého Macu (písmo se nesmí šířit, proto ho plugin ani repo nenese), stáhne model pro přepisy a zapíše cesty
   do `~/.config/beyond-reels/env.sh`. Kontrola bez instalace: `setup.sh --kontrola`.
4. Revizní stránka: https://claude.ai/artifact/NCnPwTFvfcjDD8PfuyNQH2, o přístup s úpravami požádej Štěpána.

## Aktualizace

`/plugin` > Marketplaces > beyond > Update, a `git pull` v `beo-motion`. Po aktualizaci pluginu klidně znovu `setup.sh`, nic nerozbije.

## Pravidla repozitáře

- Nový styl přidává `/novy-styl` sem jako `skills/styl-<jmeno>` a kit do `beo-motion/hyperframes/<jmeno>-styl`. Zvyš verzi v `plugin.json`.
- Křivky pohybu v jádře vycházejí z motionmaxxing (Apache 2.0, viz `beo-motion/hyperframes/jadro/NOTICE`).
- Žádné soubory Helvetica Neue, žádné API klíče, žádná média reelů.
