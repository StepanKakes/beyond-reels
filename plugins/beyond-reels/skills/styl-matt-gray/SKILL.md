---
name: styl-matt-gray
description: Edit reelů ve stylu Matta Graye (@matthgray) v barvách Beyond, v HyperFrames. Použij, když Tim řekne "matt gray", "matt", "Matt Gray styl", "jako matthgray", nebo chce reel se split obrazovkou (bílá mřížka s minimalistickým diagramem nahoře, webka v boxu dole), framework vysvětlený diagramem, který se skládá synchronně s řečí, nebo talking head s malými bílými titulky a krátkými B-rolly. Obsahuje, jak editor přemýšlí, změřený katalog technik, knihovnu MG (matt-kit) a výrobní postup. Pro Jacka Masona je styl-mason, pro Noskeho styl-noske, přehled v beyond-reels.
---

# Beyond reels ve stylu Matta Graye

> **Zvuk hlasu (Tim 4. 10. 2026, platí pro každý reel):** jen čistá stopa z kamery bez filtrů, střih po celých snímcích zdroje, `studio_hlas.py` ve výchozím režimu, intro a tělo jedním během, mix jako Noske funnel (hlas -5,5 dB, hudba -24 dB RMS se sidechainem -6 dB, -14 LUFS). Vzor `reels/podnikatele/dalen/nastroje/studio_spolecne.py` a `zvuk_telo.py`. Starší pokyny ke zvuku níže tímto nahrazuje.

> **AI fotky (Tim 5. 10. 2026, platí pro každý reel):** generovat jen jedním modelem, Seedream v4 edit (`fal-ai/bytedance/seedream/v4/edit`), nikdy dva modely najednou a nikdy nano banana. Vždy jen 2 až 3 generace (`num_images` 2 až 3), každá jiná (oblečení, póza, výraz). Reference tváře 2 až 3 výřezy z jeho videí nebo už schválená fotka. Studiový portrét od stehen nahoru, vyplňuje obraz, bez glow, pak birefnet bez pozadí. Volání přes `reels/_nastroje/fal.py`. Cena asi 0,03 USD za fotku.

Matt vysvětluje systém. Video je tabule, na kterou se kreslí přesně to, co zrovna říká, a mezi tím je čistý talking head. Žádné efekty pro efekt, klid, čistota, jeden akcent. Cíl není kopírovat jeho videa, ale vysvětlovat Timovy frameworky stejným jazykem.

Projekt a knihovna: `$BR_PROSTOR/matt-gray-styl`
- `js/matt-kit.js` komponenty (window.MG), `matt-kit.css` tokeny a vzhled
- `src/ukazka-*.html` kompozice, `node build.mjs a` z nich udělá `index.html` (slova přes `/*SLOVA:X*/` z `assets/media/slova_X.json`)
- Hotová ukázka: `src/ukazka-a.html` (Timův záznam z ukázky C, 25 s), render `renders/ukazka-a.mp4`
- Rozbor originálů: `$BR_INSPIRACE/matt-gray/_rozbor/<id>/SHOTLOG.md`, videa a přepisy v `_raw`

Než začneš stavět, přečti `reference/katalog.md` (změřené recepty) a `reference/komponenty.md` (API a pasti).

## Jak editor přemýšlí

1. **Dva režimy, přepínané tvrdým střihem na slovo.** A = split: nahoře bílá plocha s mřížkou a diagramem (y 0 až 1291), dole webka v boxu se zaoblenými rohy. B = celá obrazovka: talking head nebo B-roll s malým bílým titulkem. Ve videu o frameworku je A asi 40 % času, B-roll 15 %, zbytek talking head. Ve videu bez frameworku (Ddus) žádné A, grafika jde přímo přes talking head a B-roll je 44 % času.
2. **Diagram se skládá s řečí a nemizí.** Uzel, větve, štítky přibývají na slova. Když přijde B úsek, diagram pod ním dál žije a po návratu pokračuje ve stavu, kde skončil, a rozvíjí se (nová vrstva, zvýraznění, další štítek).
3. **Grafický text předbíhá řeč o 3 až 6 snímků, titulky jdou se slovem** (+1 snímek). Grafika připravuje, titulek potvrzuje.
4. **Jeden pohyb pro text: vyjeď zdola s pohybovým blurem.** Slovo vyjede o ~1 em zespodu, krytí 0 > 1, svislý blur jen na prvních snímcích, 8 snímků (malá slova 5), křivka (1−t)³. Stagger mezi slovy 1 až 3 snímky. Žádné pop, žádné rotace, žádné písmenkové psaní.
5. **Titulky jsou tiché.** Bílé, tučné, smíšená velká a malá, ~72 px, střed y 1202 (na hrudi), 1 až 2 slova, tvrdý střih bez animace, bez barvy a bez zvýraznění. V režimu A titulky nikdy nejsou. Když je na obraze grafický text, titulek ustoupí.
6. **Obraz nikdy nestojí, ale nic neskáče.** Talking head má pomalý lineární zoom (push in +15 % za 2 s, nebo pull out), každý střih ho resetuje. Svět grafiky pomalu plave. Box s webkou v režimu A stojí.
7. **B-roll je krátký a doslovný.** 0,6 až 2,5 s, ilustruje slovo ("easy way" = gauč, "the area" = detail obličeje), má titulky, jemný push in. Bývá 1 až 2 záběry, nebo 3 až 5 záběrů za sebou jako montáž.
8. **Jeden akcent, tvrdé obrysy, žádné stíny.** Bílá #FDFDFD, černá, akcent. Štítky jsou plné dlaždice s 2px černým obrysem a rohy 8 px. Čáry 3,5 px černé. Mřížka 72,7 px, měkká, nahoře prázdná a k okrajům mizí.
9. **Rozostření jen jako stopa pohybu.** Blur se objevuje jen při nástupu (svislý u textu, kulatý 12 px u karet z ducha). Nikdy statický blur, nikdy blur přechod.
10. **Všechny přechody jsou tvrdé střihy.** Žádný whip, fade ani zoom přechod. Plynulost dělá pohyb uvnitř záběru.

## Barvy

Matt má limetku #D4F443 s černým textem. Beyond verze má akcent `--mg-akcent` červenou #FF0E00 s bílým textem (stejně jako Jackův styl v barvách Beyond). Když Tim bude chtít limetku jako v originále, stačí třída `.mg-limetka` na `#root`. Color grade footage se nemění.

## Co v Beyond verzi jinak než Matt

- **Žádné vystřižení postavy.** Matt nechává hlavu vyčnívat přes hranu boxu (maska kolem postavy). Tim nechce odstranění pozadí, box je vždy celý obdélník
- **Žádné přeškrtnutí.** Matt škrtá FUNNEL, ADS, CLOSER červeným vřetenem. U nás `MG.zhasni`: slovo zešedne na barvu ducha, konec padá na zvuk slova
- **Titulky nejsou verzálky.** Matt má titulky smíšeně, to držíme. Verzálky jen v grafice (štítky, nadpisy)

## Šablony

- **Framework (Ddm6, Ddpm):** hook v A (dva až tři řádky: lehký řádek, tučný řádek, řádek s podkladem), pak B, pak nadpis sekce `1 NÁZEV`, diagram se skládá, B-roll, návrat do diagramu s novou vrstvou, `2 NÁZEV`, souhrn (6 x 5 = 30), CTA v B ("Napiš X" velkým akcentem) a náhled lead magnetu jako popup v A
- **Názorový reel (Ddus):** talking head přes celý obraz, nahoře na hrudi hlavička (akcentový pruh s textem) a obrysová pyramida, pruhy se mění na slova (`pruhNaSlovo`), staré odpovědi zhasnou, nahoře nová odpověď. Pak hodně B-rollu s titulky, seznam po slovech (`seznam`), velké akcentové slovo maskou zleva (`maskaZleva`). Konec opakuje hook, video je smyčka

## Postup výroby

1. **Text a beat mapa.** Z přepisu napiš tabulku: úsek, čas od a do, režim (A, B talking head, B-roll), co je na obraze. Střih vždy na začátek slova. Diagram navrhni jako jednu věc, která roste přes celé video.
2. **Střih a hlas.** Stejně jako u Jacka (`jack-styl/zdroj/strih.py`, `strih_c.py` na ozvěnu), hlas -14 LUFS.
3. **Časy slov.** `nastroje/zarovnej.py hlas.wav text.txt slova.json` (forced alignment, `$PY`; obecná verze `$BR_PROSTOR/tools/zarovnej.py`).
4. **Materiál.** Webka do boxu 16:9 s `transform: scale(1.75)` na hlavu a ramena. Pro celou obrazovku udělej vlastní výřez 9:16 ffmpegem (`crop=405:720:...,scale=1080:1920`), ne stejný soubor dvakrát. B-rolly z `$BR_PROSTOR/B-rolls` (obsah v `KATALOG.md`), 4K ořez na 9:16 do `assets/broll`.
5. **Kompozice.** Zkopíruj `src/ukazka-a.html`. Scény grafiky přes `display`, celoobrazové vrstvy přes `MG.rezim` (opacity), titulky přes `MG.titulky` po úsecích s `konce`.
6. **Zvuk (stejně jako Noske reel).** Hlas vždy přes `$BR_PROSTOR/tools/studio-hlas/studio_hlas.py hlas_raw.wav hlas_studio.wav` (DeepFilterNet3, zářezy na bzučení, EQ podle Matta Graye, vyrovnání slovo od slova, komprese, -14 LUFS). Pak `nastroje/zvuk_a.py` (venv webinar-reels): hlas o 5,5 dB pod masterem, hudba Timeless -24 dB se sidechainem -6 dB s podržením 0,8 s, SFX řídké (klik1/klik2 střídat na slova víceslovných grafických nápisů, klik4 na nástupy uzlů a štítků, závěrka na B-roll, titulky bez zvuku, kliky +3 dB), master `mix_A.wav` -14 LUFS / -1 dBTP. Render hlasitost nesrovná, proto nakonec `ffmpeg -i renders/x.mp4 -i assets/media/mix_A.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -shortest renders/x-zvuk.mp4`. Matt sám má jen hlas (případně tichý podklad).
7. **Kontrola.** `node build.mjs a && npx --yes hyperframes@0.8.105 check . --no-contrast`, pak `snapshot --at ... --no-end`, poskládat do archu. Větší vizuální kontrolu dávej agentovi overovac.
8. **Render.** `npx --yes hyperframes@0.8.105 render . --output renders/x.mp4 --workers 3`.

## Jak vymýšlet nové věci v jeho stylu

Nový prvek je v pořádku, když splní všech pět:
- **Tvar:** obrysový box, plný štítek, čára, kruh, oblouk, mřížka, karta s videem. Bez stínů, bez přechodů, bez záře
- **Barva:** bílá, černá, akcent, bledý akcent pro zvýrazněnou buňku. Stav se mění barvou (zhasnutý štítek bílý, aktivní akcent)
- **Písmo:** Helvetica Neue, lehký řez pro uvozující řádek, Bold verzálky pro to hlavní, proklad −0,035 em. Velké šedé kurzívní číslo jen v nadpisu sekce
- **Pohyb:** vyjeď (text), duch zespodu (karty), wipe zleva (štítky, podklad), kresli (čáry), vjezd ze strany (velké tabulky), tvrdé skoky (zvýraznění). Nástup do 23 snímků, pak drží
- **Význam:** doslovně ukazuje strukturu toho, co zaznělo (6 funkcí = 6 štítků, 5 částí = 5 paprsků, 6 x 5 = 30 systémů)

## Tvrdá pravidla Beyond

- Webka nikdy vystřižená z pozadí, box je celý
- Barvy jen tokeny z `matt-kit.css`, žádné inline hex
- Jen Helvetica Neue (HN), žádný serif
- Čeština, žádné emoji, žádné pomlčky, bez tečky na konci, bez přeškrtnutí
- Texty mimo rohy a v bezpečné zóně IG (nahoře pod 200 px, dole nad 1650 px)
- Žádná záře, blikání ani glitch
- Nikdy nepřehrávat zvuk nahlas na Timově Macu
