---
name: styl-soowei
description: SooWei styl Beyond (podle YouTube intra SooWei Goha) v HyperFrames, formát 16:9 pro YouTube: tvrdé střihy, zoom out záběru i textu přes střih, jméno po písmenech s doostřením, titulky po slovech v pevném rozložení, fráze s tvrdou výměnou a červeným boxem, počítadlo, triptych harmonika, kalendář, karta s kolejnicí kroků, papír zleva s nadpisem kapitoly. Zvuky podle výběru Štěpána. Použij spolu se skillem reel, když někdo chce YouTube edit nebo intro videa, řekne "soowei", "jako SooWei" nebo chce klidný čistý 16:9 edit.
---

# Styl SooWei (Beyond, YouTube 16:9)

Postup výroby (brief, střih, zvuk, revize) je ve skillu `reel`, tady je jazyk a stroj stylu. Nejdřív `$BR_PLUGIN/vkus/pravidla.md`.
Projekt: `$BR_PROSTOR/soowei-styl`, nové video `zsh $BR_PLUGIN/scripts/novy_reel.sh soowei <nazev>`.
Gramatika a co nepřebíráme: `reference/STYL.md`. API komponent: `reference/komponenty.md`.
Rozbor originálu po snímcích (intro 0 až 27 s, recepty SW1 až SW14): `$BR_INSPIRACE/soowei/_rozbor/GR2vYzl5n34/SHOTLOG.md` a `ROZBOR.md`.

**Kdy:** YouTube video nebo jeho intro, 16:9 1920x1080 30 fps. Hodí se na úvod (kdo jsem, co jsem dokázal, co ve videu bude)
a na začátky kapitol (papír s nadpisem). Zatím rozebrané jen intro jednoho videa, tělo videa stavěj stejným jazykem střídměji.

## Gramatika v kostce

- Každý střih tvrdý, žádný švih, prolnutí ani záblesk. Plynulost dělá zoom out záběru, který začíná hned po střihu (SW1), a střih v pauze řeči.
- Text je součást záběru: komponenty kreslí do kontejneru záběru (`SW.zaber`), takže se zmenšuje se zoomem.
- Text vždy na středu x, bez podkladu, obrysu i stínu, o 25 až 30 % větší než originál (Štěpán 15. 10.). Dva nástupy změřené po snímcích: titulky na B-rollu v místě průhledností s doostřením z blur 14 px; podtitul, důrazová slova, nadpis a štítky karty vyjedou odspodu `SW.vyjed` (0,43 em expo.out 0,7 s, gaussovský blur 8 px doostří dřív, než slovo dosedne). Fráze bez důrazu naskočí tvrdě.
- Dvě fáze intra: rychlé B-rolly 1,3 až 2,4 s (záběr = myšlenka = titulek), pak delší záběry 4,5 až 6 s s pomalým zoomem.
- Důraz velikostí (Medium 6,9 % > Bold 9,1 %), váhou a červeným boxem, ne animací.
- Zvuk: hlas (studio_hlas) a SFX podle výběru Štěpána 15. 10. 2026 (originál je bez SFX), mix `tools/mix.py`, -14 LUFS.
  Upravené zvuky jsou v `prostor/soowei-styl/zdroj/sfx`, časy a hlasitosti v `zdroj/mix_ukazka.json`:
  boom na první snímek (-25), jméno 5 jemných tiků po 0,1 s (-36), podtitul klik2 (-31), střih na B-roll závěrka s náběhem
  posunutým na střih (-28), počítadlo tikání o 5 půltónů hlubší jen dokud počítá (-35), triptych riser, který končí s dojezdem panelů, bez cinknutí (-30),
  klik1 (-30) jen když slova naskakují po jednom (titulky na B-rollech, důrazové fráze), fráze naskočená celá najednou má jeden klik, červený box hluboký whoosh s vrcholem na dojezdu boxu (-27), karta nízký kick (-26),
  nadpis a kolejnice závěrka (-28), papír hluboký whoosh (-26). Důraz, slovo titulku, jednotka a tah fixkou bez zvuku.
  Výběr zvuků se dělá na stránce https://claude.ai/artifact/7nNtyN7BVMRSdFk7L17b1D (databáze `prirazeni`).
- Podíl jako originál: A-roll kolem 35 %, B-roll s titulkem 27 %, grafika 38 %.

## Komponenty (`window.SW`, `js/soowei-kit.js`)

| ID | volání | co |
|---|---|---|
| | `SW.zaber(tl, rodic, media, t, t1)` | kontejner záběru (klip + jeho texty), tvrdě zapnout a vypnout |
| SW1 | `SW.zoomVen(tl, el, t, {typ})` | zoom out `hook` 1,55 s doostřením, `pomaly` 1,15, `kalendar`, `karta` |
| SW2 | `SW.jmeno(tl, rodic, "Jméno", t)` | jméno po písmenech v náhodném pořadí (jen lidé, značky logem) |
| SW3 | `SW.podtitul(tl, rodic, text, t)` | podtitul Instrument Serif pod jménem |
| SW4 | `SW.titulek(tl, rodic, [{w, t}], {px, y})` | titulek po slovech v pevném rozložení, `{el: img}` = logo |
| SW5 SW6 | `SW.fraze(tl, rodic, [{slova, duraz, t0, t1}], {tma, y})` | fráze s tvrdou výměnou, důraz, `box: true` = červený box |
| SW7 | `SW.pocitadlo(tl, rodic, t, {do, za, tZa})` | expo počítadlo s rozmazáním pohybem, jednotka serifem |
| SW8 | `SW.triptych(tl, rodic, [{media, text}] x2, zaber, t)` | harmonika tří panelů, aktuální záběr je třetí |
| SW9 | `SW.klouzani(tl, video, t, {zaklad})` | jemný posun B-rollu |
| SW10 | `SW.kalendar(tl, rodic, t, t1, {karty, tVyber})` | týden, karty naskočí, vybrané zčervenají |
| SW11 | `SW.karta(tl, rodic, video, t, t1, {nadpis, kroky})` | karta 1:1 po snímcích (KARTA.md): skupina nadpis + karta + kolejnice se zmenší z 1,675 s doostřením, kroky `{text, nadpis, t}` přepnou dokument, nadpis a uzel, popisky vyjedou odspodu |
| SW12 SW13 | `SW.papir(tl, rodic, zaber, t, {nadpis, tah1, tah2})` | papír zleva tlačí záběr, nadpis kapitoly, dva tahy fixkou |

Ukázky: `src/ukazka.html` (začátek reelu Heaton jako YouTube intro), `src/komponenty.html` (showcase, úseky v `plany/komponenty.json`).
Build: `node build.mjs <nazev>` (stejný jako u Caspara: `/*SLOVA*/` a `{{T(i)}}` ze `assets/media/slova_<nazev>.json`).

## Postup

1. Brief a scénář podle skillu `reel` (formát YouTube 16:9). Ke každé větě: B-roll s titulkem (SW4, SW7, SW8), A-roll s frázemi (SW5),
   grafika (SW10, SW11), začátek kapitoly (SW12).
2. A-roll 16:9: zdroj 4:3 se ořízne na střed (`object-fit: cover`), obličej pak bývá kolem y 43 %. Fráze dej pod bradu (y 0,72 až 0,78),
   přes světlé triko `tma: true`.
3. B-rolly zkontroluj na vypálený text a cizí grafiku (Vision v `kontrola_renderu.py`) a na skok záběru uvnitř. Cizí text výřezem
   (`object-position` + `klouzani` se `zaklad`) nebo jiný záběr, titulek nikdy přes ceduli nebo nápis v záběru.
4. Storyboard ke schválení, render, `kontrola_renderu.py`, agent `overovac`, revizní stránka.

## Zákazy (navíc k pravidlům)

- Žádné švihy, prolínačky ani záblesky, SFX jen podle výběru výše. Žádná kurzíva (podtitul je Instrument Serif rovný), žádné ručně psané písmo (nadpis na papíře Helvetica Bold).
- Zlato, teal and orange grade originálu nepřebíráme, záběry negradujeme.
- Bílý titulek ne přes bílé triko ani světlou stěnu, posuň ho nebo `tma`.
