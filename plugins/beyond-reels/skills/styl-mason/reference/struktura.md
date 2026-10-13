---
name: styl-mason (reference/struktura.md)
description: Jak skládat Beyond reely v Jackově (Mason) stylu jako celek, ne jednotlivé grafiky. Formáty (rozbor cizího byznysu, klientský příběh, vlastní framework, talking head insight), anatomie hooku po snímcích, nastavení, slib tří věcí, rituál bodu, CTA, pravidla B-rollu, rytmus a poměry, scénář v češtině podle šablon, beat mapa a výroba případové studie o jiném člověku (rešerše, jeho fotky a vlogy, hlas, montáže). Použij, když Tim chce nový reel, případovou studii o podnikateli ("udělej reel o X"), scénář nebo hook, nebo když se ptá, jak má video stát. Grafiku samotnou řeší skill styl-mason.
---

> **AI fotky (Tim 5. 10. 2026, platí pro každý reel):** generovat jen jedním modelem, Seedream v4 edit (`fal-ai/bytedance/seedream/v4/edit`), nikdy dva modely najednou a nikdy nano banana. Vždy jen 2 až 3 generace (`num_images` 2 až 3), každá jiná (oblečení, póza, výraz). Reference tváře 2 až 3 výřezy z jeho videí nebo už schválená fotka. Studiový portrét od stehen nahoru, vyplňuje obraz, bez glow, pak birefnet bez pozadí. Volání přes `reels/_nastroje/fal.py`. Cena asi 0,03 USD za fotku.


# Struktura Beyond reelů (Mason styl)

Změřeno na 7 videích Jacka Masona (`$BR_INSPIRACE/_rozbor/<id>/ZARIZENI.md`, sekce B). Grafické komponenty a myšlení jsou ve skillu `styl-mason` (`reference/mysleni.md`, `reference/rodiny.md`). Vzor hotového reelu: `$BR_PROSTOR/vzory/dalen-telo.html`.

## 1. Vyber formát

| Formát | Jackova videa | Kostra | Délka |
|---|---|---|---|
| Rozbor cizího byznysu | Ben (Gymshark), Fred, Shelby | hook s číslem a tváří > kdo to je > paradox ("ale ne proto, že...") > slib tří věcí > 3 body > CTA | 60 až 100 s |
| Klientský příběh | Georgios | hook "tenhle X mě najal" > problém (kdy, co chybělo) > systém v krocích > výsledek čísly > (CTA) | 70 až 80 s |
| Vlastní framework a autorita | Top 50, 23 let 100k | hook číslo nebo "studoval jsem X" > 3 věci, které mají společné > každá s jedním diagramem > CTA s číslem | 70 až 90 s |
| Talking head insight | TOF MOF BOF | důkaz číslem > teze > jeden rostoucí diagram přes celé video > CTA | 35 až 45 s |

## 2. Hook (první 3 s) podle snímků

Pravidla ze všech sedmi hooků:
- **0,0 s** první snímek je největší kontrast videa (tmavá fotka v obří kartě na papíře, ostrá plocha macOS, obří číslo). Žádný úvodní titulek na prázdné ploše.
- **do 0,2 s** první změna (nová tvář, nový klip). Montáž na 3 sn. (10 fps) = "je jich hodně" (Ben 7 fotek, Fred 30 klipů na dvojky, Shelby 12 klipů na dvojky).
- **0,3 až 1 s** něco se píše nebo tiká: jméno v poli, počítadlo za kartou. Číslo z řeči je hlavní důkaz hooku.
- **1,5 s** první tvrdý zlom (squash pás se značkou, střih na bílou se slovem).
- **3 s** střih do druhé kapitoly s maximálním kontrastem (tmavé na bílé).
- Nikdy dvě sekundy bez nové informace. Hook je hustý, nastavení zpomalí.

## 3. Kostra případové studie po sekcích (Ben, Fred, Shelby)

| Sekce | Čas | Co zazní | Nosič (komponenta) |
|---|---|---|---|
| Hook | 0 až 3 s | "Tenhle X-letý [kdo] [výsledek s číslem]" | karta s úchyty a montáží, psací pole se jménem, počítadlo za kartou, squash pás se značkou |
| Paradox | 3 až 7 s | "A přitom [opak toho, co by čekal]" | věta z rozmazání + obří slovo za kartou |
| Zlom | 7 až 9 s | "Tady je přesně, jak to dělá" | filmový pás tváří s obřím JAK |
| Kdo to je | 9 až 15 s | jméno, odkud, firma, čísla | jmenovka přes montáž 12 záběrů (8 a 6 sn.), štítek, náhled webu, mapa, profil |
| Negace | 15 až 18 s | "Ale ne proto, že..." | objekt negace se ukáže a zešedne (mřížka lidí, karty), nikdy přeškrtnutí |
| Slib | 18 až 21 s | "Stojí to na třech věcech, které většina přehlíží" | kosočtverce 1 2 3 nebo čtverce 1 2 3 nebo triptych 1 3 2 |
| Bod 1, 2, 3 | po 8 až 25 s | "Zaprvé / Zadruhé / A nakonec" + příklad + důkaz | rituál bodu (#N 12 sn. po střihu, řádek dorůstá, serif pod ním) a pak 2 až 3 scény s jedním pojmem |
| CTA | 5 až 7 s | "Jestli chceš..., napiš do komentáře X a pošlu ti..." | černá, věta, pilulka se slovem v uvozovkách padá shora, náhled s pohledem do kamery |

**Rituál bodu je stejný u všech tří bodů** (Fred: číslo vždy přesně 12 sn. po střihu, první slovo 14 až 26 sn. po čísle). Délka bodu se mění podle počtu příkladů, rituál ne. Divák pozná strukturu dřív, než ji slyší.

## 4. B-roll

- Vždy **doslovný důkaz věty**, nikdy nálada (Ben: "Britain" = Londýn, "one employee" = barista). B-roll bez titulku nebo grafiky neexistuje.
- Délka 0,4 až 3 s. Výčet = slovo na záběr (BRITAIN'S, YOUNGEST, BILLIONAIRE po 13 sn.).
- Cizí materiál sjednotit: v kartě přirozené barvy, přes celý snímek duotone (`BN.duotone`, černá > teplý papír).
- Timova vlastní B-rolly: `$BR_BROLLS` (KATALOG.md), v Mason stylu do rámečku karty.
- Talking head bez střihu oživit zoom bumpem (+9 % za 8 sn.) a návratem z B-rollu (1,11 > 1 za 40 sn.).

## 5. Rytmus a poměry (cíle)

- Záběr: průměr 1,3 až 1,7 s, medián 1,0 až 1,5 s, hook a výčty pod 0,5 s, vysvětlení až 4,5 s.
- 2 až 6 textových událostí za sekundu, nic nestojí déle než 2 s bez změny.
- Poměr u případové studie: mluvčí nebo cizí člověk 35 až 50 %, plná grafika 25 až 35 %, B-roll 15 %, karty 7 %. Když mluvčí v obraze není (hlas přes materiál), drží rytmus grafika.
- Po husté pasáži jedna klidná scéna (jedno slovo na ploše).

## 6. Scénář česky (šablony z Jackových přepisů)

Hook: "Tenhle [věk]letý [kdo, odkud] [udělal co s číslem]. A přitom [paradox]. Tady je přesně, jak to dělá."
Nastavení: "[Jméno] [začátek příběhu]. Dnes [firma] [čísla]. Ale ne proto, že by [očekávaný důvod]. Stojí to na třech věcech, které většina podnikatelů úplně přehlíží."
Body: "Zaprvé, [teze ve 2 až 4 slovech]. [Konkrétní příklad]. [Důkaz číslem]." "Zadruhé, ..." "A nakonec, ..."
CTA: "Jestli chceš [výsledek], napiš do komentáře [SLOVO] a pošlu ti [co]."
Pravidla: každá věta má nosič v obraze, čísla jen ověřená (nejistá "podle něj"), národnost a fakta z rešerše, žádné tečky, pomlčky ani emoji v textech na obrazovce.

## 7. Beat mapa (než napíšeš první řádek kódu)

Po zarovnání hlasu (`nastroje/zarovnej.py hlas.wav text.txt slova.json`) udělej tabulku: index slova, čas, co zazní, nosič, komponenta, SFX. Každý řádek má nosič, jinak fráze vypadne. Scény se střídají tvrdým střihem jen na hranici myšlenky. Časy v kompozici piš jako `T(index)`, ne čísla.

## 8. Výroba případové studie o jiném člověku (postup z reelu Dalen, 4. 10. 2026)

1. **Rešerše agentem** (levnější model): fakta s URL a jistotou, 3 úhly ve formátu výše, fotky (portréty do kamery, YT náhledy přes `i.ytimg.com/vi/<id>/maxresdefault.jpg`, loga, web), klipy. Vše do `jack-styl/zdroj/<jmeno>/`. Ověř národnost a čísla, agent je umí poplést.
2. **Materiál**: `yt-dlp -f "bv*[height<=1080]" --no-audio` 4 až 6 vlogů, `nastroje/zabery.py` index záběrů a arch, výběr podle obličeje a bez vypálených titulků, `nastroje/dalen_media.py` jako vzor (stopky na obličej, klipy, montáže).
3. **AI grafika** přes `nastroje/fal.py openai/gpt-image-2` na pozadí hex FBF9FC (předmět místo ikony: balík = objednávky).
4. **Hlas**: ideálně Tim nahraje sám. Jinak klon jeho hlasu přes fal MiniMax (`fal-ai/minimax/voice-clone` z čisté nahrávky, pak `fal-ai/minimax/speech-02-hd` s `voice_id`, `language_boost: "Czech"`, speed 1,12) nebo ElevenLabs multilingual-v2. Kontrola výslovnosti whisperem, cizí jména foneticky v textu pro TTS (Ecomflow > Ekomflou).
5. **Kompozice** podle `src/dalen.html`, **zvuk** podle `nastroje/zvuk_dalen.py` (hudba She Will, SFX pravidla Tima, hlas na stejné aktivní úrovni jako reel D), **render** a kontrola mřížkou `nastroje/mrizka.py`, pak agent `overovac` na nezávislou kontrolu (oříznutí, safe zóna, prázdné snímky, synchron).

## Kontrola před odevzdáním
- text 250 až 1490 px na výšku, nic vpravo za 1020 px, CTA slovo v uvozovkách nahoře “SLOVO”
- žádné prázdné snímky, žádný prvek, který vyskočí a zmizí bez pokračování
- serif jen Instrument Serif v normálním řezu, Helvetica nikdy kurzívou, bez záře, bez glitch a strobo
- každé číslo z řeči má počítadlo, které skončí přesně na vyslovené hodnotě
