---
name: reel
description: Průvodce výrobou reelu Beyond od surového videa po render na revizní stránce. Použij, když někdo z týmu chce udělat reel, edit, případovku, rozbor podnikatele, klientský příběh nebo motion grafiku do reelu, napíše /reel, "udělej reel", "střihni to", "jako mason / noske / matt gray / lumitris / nathan / caspar / soowei", chce YouTube edit nebo intro videa, nebo pošle video a chce z něj reel nebo YouTube video. Zeptá se na styl a brief, navrhne ke každé větě víc směrů z naší knihovny komponent, po schválení postaví kompozici v HyperFrames se sdíleným jádrem, zvukem podle standardu a nahraje render k revizi s komentáři.
---

# /reel: od videa k revizi

Každý příkaz v Bash začni `source ~/.config/beyond-reels/env.sh &&`. Když soubor chybí, spusť
`zsh <složka pluginu>/scripts/setup.sh` (složka pluginu = dvě úrovně nad tímto SKILL.md) a pokračuj.
Proměnné: `$BR_PROSTOR` (sdílený prostor beo-motion/hyperframes), `$PY` (Python), `hf` (funkce, HyperFrames v pevné verzi),
`$BR_WHISPER` (model přepisů), `$BR_PLUGIN` (plugin).

Než cokoli navrhneš, přečti `$BR_PLUGIN/vkus/pravidla.md` a verdikty týmu (ArtifactData `list` kolekce `verdikty` na revizní stránce, odkaz ve skillu `revize`). Platí bez připomínání.
Ve zvoleném stylu pak jeho skill (`styl-mason`, `styl-noske`, `styl-matt-gray`, `styl-lumitris`, `styl-nathan`, `styl-caspar`, `styl-soowei`).

Jak pracovat a dělit práci mezi agenty a modely: `$BR_PLUGIN/vkus/prace.md` (přečti na začátku). Krátce: Mac měří první
(`souhrn_videa.py`, `kontrola_renderu.py`, whisper, ebur128), oči deleguj agentovi `beyond-reels:overovac` (Sonnet) a rozbory
referencí agentovi `beyond-reels:rozbor` (Sonnet), hledání vestavěnému Explore (Haiku). Kód kompozice, texty a návrhy piš sám.
Zvuk nikdy nepřehrávej nahlas.

## 1. Brief (vždy, i když něco zaznělo v zadání)

Jedním voláním AskUserQuestion se zeptej na to, co ze zadání neplyne:
- **Styl:** Mason (papír, červená, grafika na každou frázi, případovky), Noske (filmový talking head, typografické karty),
  Matt Gray (mřížka s diagramem nahoře, webka dole), Lumitris (rychlý dokumentární edit 4:3), Nathan (klidný, velké slovo za hlavou, B-roll v oknech),
  Caspar (řečí vedený příběh, důraz typografií, karty a B-rolly lidí z příběhu),
  SooWei (YouTube 16:9: čisté tvrdé střihy se zoomem, titulky po slovech, počítadlo, karta s kroky, papír s kapitolou, jen hlas)
- **Formát** (jen když neplyne ze stylu, AskUserQuestion bere nejvýš 4 otázky, jinak volným textem): reel 4:3 1920x1440,
  nebo YouTube 16:9 1920x1080 (SooWei je vždy 16:9, ostatní styly výchozí 4:3)
- **Typ:** rozbor cizího byznysu, klientský příběh, vlastní framework, talking head insight
- **Délka:** do 45 s, 45 až 90 s, delší
- **Konec:** CTA slovo (“START”, “AUDIT”...), odkaz v bio, bez CTA

Pak volným textem: cesta ke zdrojovému videu (nebo víc pokusů), o kom nebo o čem to je, odkazy na jeho videa a profil
(citace, komentáře, logo), hook nápad, co určitě ukázat nebo neukazovat. Zapiš `brief.json` do projektu:
`{styl, format, typ, delka, cta, zdroje: [...], tema, osoba, odkazy: [...], hook, poznamky}`.

## 2. Projekt

`zsh $BR_PLUGIN/scripts/novy_reel.sh <styl> <nazev>` vytvoří `$BR_REELY/<nazev>` (u Masona se šablonou `src/reel.html`
a sdíleným jádrem kitů, `tools/jadro.sh --stav` ukáže verze). Brief ulož do projektu. Pracovní soubory zdroje do `zdroj/`.

## 3. Text a střih

1. Přepis: `whisper-cli -m $BR_WHISPER -l cs -ml 1 -ojf -f zdroj/zvuk.wav` (zvuk z videa jako 16 kHz mono). Whisper komolí jména, ověř je z briefu.
2. Scénář: vyber nejlepší pokusy, ticho a přemýšlení pryč. Délku řeš výběrem, nikdy vystřižením vět ze středu myšlenky. Citace celé.
3. Střih: `zdroj/kusy.json` = [{od, do, zdroj}] v sekundách zdroje. Hrany na celé snímky zdroje (25 fps) do nejtiššího místa,
   pak `$PY $BR_PROSTOR/tools/kontrola_strihu.py ZDROJ zdroj/kusy.json`, opakuj, dokud nehlásí 0 podezřelých hran.
   Úseky, kde se Tim nedívá do kamery, si poznač (pokryjí se B-rollem nebo grafikou).
4. Obraz `assets/media/aroll.mp4` (reel 1920x1440, YouTube 1920x1080 nebo 4:3 zdroj ořezaný v kompozici `object-fit: cover`; fps 30 až po spojení) a čistá stopa `zdroj/hlas_raw.wav` (PCM přímo ze zdroje, bez filtrů).
5. Hlas: `$PY $BR_PROSTOR/tools/studio-hlas/studio_hlas.py zdroj/hlas_raw.wav zdroj/hlas_studio.wav` (s ozvěnou místnosti `--podcast`).
6. Časy slov: oprav text (čísla jako číslice) a `$PY $BR_PROSTOR/tools/zarovnej.py zdroj/hlas_studio.wav zdroj/text.txt zdroj/slova.json`,
   pak `assets/media/slova_REEL.json` = `{"slova": [{"w","t","e"}], "delka": D}`. Po přestavbě ověř whisperem, že žádné slovo není useknuté.

## 4. Plán: směry ke každé větě (schvaluje člověk)

Napiš `PLAN.md` a ukaž ho jako tabulku. Pro každou větu: čas, věta, **váha** (1 spojka, 2 podpora, 3 pointa; trojek nejvýš
čtvrtina vět), nosič. Pro věty s váhou 2 a 3 nabídni **2 až 3 směry**:
- **A obměna z knihovny:** konkrétní komponenta z knihovny (`$BR_PROSTOR/knihovna/*.json` a karta na revizní stránce, záložka Knihovna) a co se na ní změní pro tuhle větu
- **B nová varianta:** nová věc inspirovaná knihovnou nebo jiným naším reelem (napiš, kterým)
- **C B-roll nebo záběr:** z `$BR_BROLLS/KATALOG.md`, jeho vlastní videa, logo značky

Pořadí hledání pro každou větu: komponenta z knihovny, B-roll z katalogu, teprve pak nový návrh. Nikdy koncept, který přebalí celou
pasáž do jedné metafory. Zeptej se, co vybírá (AskUserQuestion po větách s váhou 3, ostatní hromadně), a výběr zapiš do PLAN.md.

## 5. Storyboard (před renderem, vždy)

Postav kompozici jen staticky v klíčových časech vybraných směrů (`hf snapshot . --at t1,t2,...`), poskládej z nich storyboard
a nahraj ho na revizní stránku (skill `revize`, pole `storyboard`). Render až po schválení. Opravy zase jen snímky.

## 6. Stavba (Mason a obecně Beyond)

- `src/reel.html` ze šablony: scény jako `.sc` přepínané `sc("id", T(i), T(j))`, časy **jen přes slova** `T(i)` a `E(i)`, nikdy sekundy natvrdo.
- Komponenty z jádra (`js/mason-kit.js` MK, `js/beyond-nove.js` BN, `js/elaine-kit.js` EK), popis API ve skillu `styl-mason`.
- Pohyb přes změřené křivky: `MK.prijezd` (nástup posunem nebo z 1,25x), `MK.odjezd` (zrychluje do střihu), `MK.svih` (švih mezi scénami
  bez záblesku), `MK.kameraSkok`, v libovolném `MK.tw` stačí `{ ease: "softLand" }` a délka se doplní. Žádný pop z nuly.
- Titulky se tvoří samy (BN.titulkyZeSlov v šabloně). Do `BEZ` jen slova, která jsou ve stejnou chvíli velká v obraze.
- SFX zapisuj v kompozici u každé změny v obraze do pole a vypiš je (nebo veď paralelně `zdroj/sfx.json`), ať zvuk sedí na obraz.
- Zvuk: `zdroj/mix.json` podle hlavičky `$BR_PROSTOR/tools/mix.py` (hlas, citace, hudba z `$BR_HUDBA/katalog.json`, SFX) a
  `$PY $BR_PROSTOR/tools/mix.py zdroj/mix.json` > `assets/media/mix.wav`.
- `node build.mjs reel && hf check . --no-contrast` musí projít (font HN přes `var(--mk-sans)`, žádné záporné z-index).

## 7. Kontrola před revizí

1. Nejdřív měří Mac: `$PY $BR_PROSTOR/tools/kontrola_renderu.py renders/<nazev>-v<N>-final.mp4 --texty zdroj/titulky.txt`
   (text přes obličej, u okraje, přes text, nečitelný, chybějící titulky). Co hlásí, oprav. Teprve potom oči:
   rychlé náhledy jen změněných úseků (`hf snapshot`, kontaktní arch) prohlédne agent `beyond-reels:overovac` s tímto seznamem:
   titulky čitelné, ne přes obličej, ne tmavé přes tmavou plochu; nic přes obličej; text nepřekrývá text; značky logem;
   Tim jen při pohledu do kamery; žádný zakázaný prvek z `pravidla.md`; každá scéna má nosič.
2. Titulky: každé slovo mimo `BEZ` je v titulku a žádný titulek není kratší než 13 sn. (konzole hlásí kratší).
3. Render: `hf render . --output renders/<nazev>-v<N>.mp4 --workers 3`, jen plná kvalita. Při renderu úseku nastav délku kompozice
   a `HF_VIDEO_COVERAGE_THRESHOLD=0`.
4. Zvuk do videa: render ztratí asi 0,7 dB, proto nakonec vlož přesný mix
   `ffmpeg -i renders/<nazev>-v<N>.mp4 -i assets/media/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -shortest -movflags +faststart renders/<nazev>-v<N>-final.mp4`
   a ověř `-14 LUFS` (`ffmpeg -i ... -af ebur128=peak=true -f null -`). Na revizi i ven jde jen `-final`.

## 8. Revize a učení

Skill `revize`: kontrolní kopie na revizní stránku se scénami a titulky, odkaz do chatu. Po komentářích opravy, nová verze,
odpovědi u komentářů a zápis verdiktů do kolekce `verdikty` na revizní stránce (co schváleno nebo zamítnuto a proč). Hotový reel:
nové povedené komponenty navrhni do knihovny (skill `revize`, část Knihovna).
