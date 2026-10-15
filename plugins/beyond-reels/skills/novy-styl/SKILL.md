---
name: novy-styl
description: Naučí plugin nový styl reelů z odkazů na videa tvůrce (Instagram, YouTube, TikTok). Stáhne a přepíše reely, rozebere je snímek po snímku, sepíše gramatiku stylu, postaví kit komponent na sdíleném jádře, ukázku na našem záběru k revizi a nový skill styl-<jmeno>. Použij, když někdo napíše /novy-styl, "nauč se styl", "chci reely jako <tvůrce>", "přidej styl", nebo pošle několik odkazů na reely jednoho tvůrce.
---

# /novy-styl: z odkazů na reely k novému stylu

Každý příkaz v Bash začni `source ~/.config/beyond-reels/env.sh &&` (chybí-li, `zsh <plugin>/scripts/setup.sh`).
Před návrhy přečti `$BR_PLUGIN/vkus/pravidla.md`: z cizího stylu bereme řemeslo (rytmus, kompozici, pohyb), ne věci, které máme zakázané.
Vzory hotových stylů: `$BR_PROSTOR/lumitris-styl/v2` (nejnovější postup s plány), `caspar-styl` a `soowei-styl` (kit na jádře, 16:9), `noske-styl`, `matt-gray-styl`, `nathan-styl`, rozbory v `$BR_INSPIRACE/<jmeno>/_rozbor`.

## 1. Zadání

Zeptej se (AskUserQuestion a volný text): jméno tvůrce a krátký název stylu (bez diakritiky, např. `nathan`), 3 až 6 odkazů na reely,
co přesně se na nich líbí (střih, typografie, B-rolly, zvuk), na jaký typ našich reelů to má sloužit, formát (výchozí 4:3 1920x1440 30 fps, YouTube 16:9 1920x1080 podle vzoru `soowei-styl`). Jde naučit i jen úsek videa
(třeba intro YouTube videa): stáhni jen ten kus `yt-dlp --download-sections "*0-30"` do `_raw/<id>/video.mp4` a pak `stahni.sh`, video už nestahuje znovu.

## 2. Stáhnout a přepsat

`IG_VIDEA=$BR_INSPIRACE/<jmeno>/_raw bash $BR_PLUGIN/scripts/stahni.sh "<odkaz>"` pro každý odkaz (video, info.json, přepis se
časy, mřížka snímků). Delší video s timeoutem 600000 ms. Přepisy shrň do `$BR_INSPIRACE/<jmeno>/PREPISY.md`.

## 3. Rozbor po snímcích (agenti, levnější model, souběžně po videích)

Na každé video jeden agent `beyond-reels:rozbor` (Sonnet), všechny najednou na pozadí. Začínají od `souhrn.txt` a `strihy.jpg`,
které vyrobil `stahni.sh` (střihy, tempo, text v obraze přes Apple Vision), a teprve pak jdou na snímky.

Každý agent pro jedno video zapíše do `$BR_INSPIRACE/<jmeno>/_rozbor/<id>/`:
- `SHOTLOG.md`: každý záběr s časem od do (snímky), co je v obraze, kompozice, typografie (písmo, velikost jako % výšky, barva),
  nástup a odchod (kolik snímků, křivka, směr), přechod do dalšího záběru, zvuk (SFX, hudba, ticho).
- `ROZBOR.md`: rytmus (délky záběrů, medián, rozptyl), podíl A-rollu, B-rollu a grafiky, opakující se zařízení (devices) s ID a snímky,
  titulky, barvy (vzorkované hex), zvuk.
Snímky vybírat ffmpegem (`select` po snímcích), měřit čísla, ne odhadovat. Do hlavního kontextu jen souhrn.

## 4. Gramatika stylu

`$BR_INSPIRACE/<jmeno>/_rozbor/STYL.md`: konstanty (co je v každém videu stejné) a variace, slovník zařízení s ID, měřené hodnoty,
jak editor přemýšlí (proč tam co je), a **Beyond verze**: naše barvy (#F4F2EE, #111, #FF0E00), naše písma (Helvetica Neue Bold,
Instrument Serif rovný), naše pravidla z `pravidla.md`. Co ze stylu nepřebíráme a proč. Ukaž shrnutí a nech schválit.

## 5. Kit na sdíleném jádře

Projekt `$BR_PROSTOR/<jmeno>-styl/` (struktura jako `nathan-styl`: `js/<jmeno>-kit.js`, `<jmeno>-kit.css`, `src/`, `build.mjs`, `vendor/`):
- jádro přes `zsh $BR_PROSTOR/tools/jadro.sh $BR_PROSTOR/<jmeno>-styl` a kit nad ním (`window.<ZKRATKA>`), pohyb přes `MK.tw` a `MK.KRIVKY`,
  výchozí hodnoty komponent = změřený originál, téma Beyond přes CSS proměnné
- každá komponenta s komentářem: co dělá, odkud je (ID zařízení, snímky), parametry, pasti
- ukázkový showcase `src/komponenty.html` se všemi komponentami za sebou ve 4:3 (pro knihovnu)

## 6. Ukázka a revize

1. Ukázkový reel 15 až 30 s na našem záběru (brief jako u `/reel`, zvuk standardem `tools/mix.py`), storyboard, render.
2. Nahrát na revizní stránku (skill `revize`) ukázku i showcase. Komponenty vyříznout do knihovny (`tools/knihovna/klipy.py`,
   kolekce `komponenty` se stylem `<jmeno>`, stav `k_revizi`), aby je tým mohl schvalovat a komentovat.
3. Opravy podle komentářů, verdikty do kolekce `verdikty` na revizní stránce.

## 7. Nový skill a zapojení do pluginu

V klonu repozitáře pluginu (výchozí `~/Documents/GitHub/beyond-reels`, jinak se zeptej) vytvoř
`plugins/beyond-reels/skills/styl-<jmeno>/SKILL.md` podle vzoru `styl-nathan` (kdy ho použít, projekt a kit, gramatika v kostce,
komponenty a API, postup, zákazy) a `reference/` s podrobnostmi. `novy_reel.sh` vezme jakýkoli `$BR_PROSTOR/<jmeno>-styl` sám.
Přidej styl do tabulky v `skills/reel/SKILL.md` (otázka Styl) a do README. Zvyš verzi v `plugin.json`, commit, a řekni týmu,
ať si plugin aktualizuje (`/plugin` > Marketplaces > beyond > Update). Commit a push jen se souhlasem.
