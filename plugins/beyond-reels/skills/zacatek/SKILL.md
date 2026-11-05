---
name: zacatek
description: První spuštění pluginu beyond-reels. Ověří instalaci, nastaví značku (barvy a písma), vlastní pravidla a zkušebně otevře revizní stránku. Použij, když někdo napíše /zacatek, "jak začít", "nastav mi reely", "nastav značku", "změň barvy reelů", "dosaď moje písmo", nebo když ještě neexistuje `~/.config/beyond-reels/env.sh`.
---

# /zacatek: nastavení na první reel

Provázej krok za krokem, česky a stručně. Ptej se jen na to, co nejde zjistit. Nic z toho se nemusí dělat znovu.

## 1. Instalace

Když chybí `~/.config/beyond-reels/env.sh`, spusť `zsh <složka pluginu>/scripts/setup.sh` (složka pluginu = dvě úrovně nad tímto SKILL.md) na pozadí a řekni,
že to trvá kolem deseti minut a stahuje Python prostředí a model pro přepisy. Když chybí Homebrew, ukaž instalaci z https://brew.sh a počkej.
Pak `zsh <složka pluginu>/scripts/setup.sh --kontrola` musí hlásit, že nic nechybí.

Každý další příkaz začni `source ~/.config/beyond-reels/env.sh &&`.

## 2. Značka

Zeptej se (AskUserQuestion, s možností nechat výchozí):
- **Barvy:** akcent (jedna výrazná barva), papír (světlé pozadí), tmavá (tmavé pozadí). Výchozí jsou červená `#FF0E00`, `#F4F2EE` a `#111111`. Umí to i z odkazu na web nebo z loga, když ho pošle: změř barvy, navrhni je a nech potvrdit.
- **Písma:** hlavní (tučný řez, nese titulky a nadpisy) a druhé (pointy). Soubory `.ttf` nebo `.otf`. Výchozí jsou Helvetica Neue ze systému a Instrument Serif. Uživatel musí mít právo písmo používat.

Zapiš `$BR_MOJE/znacka.json` (nepovinné položky vynech):
```json
{ "barvy": { "akcent": "#2B59FF", "papir": "#F7F5F0", "tmava": "#0E0E10" }, "pisma": { "hlavni": "/cesta/Bold.ttf", "druhe": "/cesta/Serif.ttf" } }
```
Dosadí se samo do každého nového projektu (`tools/znacka.mjs`). Hotové reely se nemění. Do rozdělaného projektu: `node $BR_PROSTOR/tools/znacka.mjs <projekt>`.
Pozor: kontroluj kontrast akcentu vůči papíru i tmavé, ať je text čitelný, a řekni, když je slabý.

## 3. Vlastní pravidla

Zeptej se volným textem, co se mu na reelech nelíbí nebo co musí mít (třeba CTA, jazyk v obraze, zakázané efekty). Zapiš do `$BR_MOJE/vkus.md`.
Tahle pravidla mají přednost před `$BR_PLUGIN/vkus/pravidla.md`. Nic nevymýšlej, prázdné je v pořádku.

## 4. Hudba a B-rolly

Plugin hudbu ani záběry nenese, patří je vlastní, s právem je použít. Ukaž, kam patří:
- `$BR_HUDBA`: soubory `.wav` plus záznam v `katalog.json`: `{"stopy": [{"id", "soubor", "nazev", "zdroj", "delka_s", "bpm", "poznamka"}]}`. Když je přidá, doplň záznamy sám (`delka_s` a `bpm` změř přes librosa).
- `$BR_BROLLS`: záběry a `KATALOG.md`. Když je přidá, popiš je sám: `$PY $BR_PROSTOR/tools/souhrn_videa.py <video>`, a zapiš čas od a do, co je v obraze.
Bez nich reel vznikne taky, jen bez hudby a bez cizích záběrů.

## 5. Revizní stránka

`revize start --otevri` otevře http://localhost:4747. Stránka je zatím prázdná, první reel se na ni nahraje sám. Řekni, jak se používá: táhnutím ve videu označí místo a napíše k němu poznámku, Claude si komentáře přečte.

## 6. Co dál

Navrhni první krok a skonči:
- `/beyond-reels:reel`, když má video
- `/beyond-reels:novy-styl`, když chce styl podle tvůrce, který se mu líbí

Návod je v `docs/NAVOD.md` v repozitáři pluginu.
