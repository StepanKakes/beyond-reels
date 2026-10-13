---
name: styl-mason
description: Mason styl reelů Beyond (podle Jacka Masona, @longevitypenguin) v HyperFrames 4:3: papír, černá a jedna červená, grafika na každou frázi, případové studie cizího byznysu, klientské příběhy a frameworky, titulky ze slov, obří slova za osobou, karty s videi, počítadla, citace na štítku. Použij spolu se skillem reel, když někdo řekne "mason", "jako Jack", "případovka", "rozbor podnikatele", nebo chce reel jako Dalen, Heaton, Steven či Vince.
---

# Styl Mason (Beyond)

Mluvíme Jackovým vizuálním jazykem o našich tématech, nekopírujeme jeho videa. Postup výroby je ve skillu `reel`,
tady je jazyk stylu. Nejdřív `$BR_PLUGIN/vkus/pravidla.md` a `$BR_PROSTOR/vkus/verdikty.md`.

## Projekt a komponenty

- Nový reel: `zsh $BR_PLUGIN/scripts/novy_reel.sh mason <nazev>`, šablona `src/reel.html`, jádro kitů v `js/` (MK, BN, EK).
- API a pasti komponent: `reference/rodiny.md` (MK po rodinách R1 až R10, BN, EK, křivky a plynulé pohyby), nové Beyond komponenty `reference/nove.md`.
- Hotové reely jako vzor: `$BR_PROSTOR/reels/podnikatele/dalen/src/telo.html` (nejvíc vychytané), `heaton/src/zac.html`
  a `intro-g4.html` (hook), `steven/src/telo.html`, `$BR_PROSTOR/jack-styl/src/vince.html` (případovka 4:3). Ber z nich řešení, ne celé scény.
- Knihovna komponent z těchto reelů s ukázkami: revizní stránka, záložka Knihovna, styl Mason (`$BR_PROSTOR/_knihovna/prod/*.json` s popisy a voláním).
- Efekty po renderu (radiální blur, fisheye, záře jen podle pravidel): `reference/efekty.md`.

## Jak editor přemýšlí (celé v `reference/mysleni.md`)

1. Každá fráze má vizuální nosič a nic nestojí déle než kolem 2 s: titulek, velké slovo za osobou, číslo, štítek, karta s videem, profil, B-roll.
   Nová informace = nový typ nosiče.
2. Ilustrace je doslovná. Číslo je počítadlo, profil je profil, firma je záběr s logem.
3. Jeden akcent: papír, černá, bílá a červená #FF0E00 na to jedno, co znamená nejvíc.
4. Struktura je vidět dřív, než ji slyšíš: slib tří věcí, rituál bodu (#1 s názvem bodu pod číslem, stejně u každého bodu).
5. Dva rytmy: mluvčí a titulky na plných 30 fps, grafika na dvojky (`krok: 2`) nebo trojky. Pohyb přitom po plynulých křivkách z jádra.
6. Prvky se rozvíjejí, nemizí. Diagram nebo karta drží a přibývá k nim.
7. Velikost je rytmus: drobné spojky, obří klíčová slova (12 až 26 % výšky, verzálky přes skoro celou šířku).
8. Důkaz místo tvrzení: skutečné komentáře, skutečná videa v kartách, počítadlo u čísla, citace člověka.

## Struktura reelu (celé v `reference/struktura.md`)

Formáty: rozbor cizího byznysu, klientský příběh, vlastní framework, talking head insight. Hook do 1,5 s hustý (kdo, co dokázal, kontrast),
nastavení, slib tří věcí, body s rituálem, citace, CTA s “SLOVEM” na konci. Hustota až do konce.

## Typické nosiče a čím je obměnit

| Věta | Nosič v knihovně | Obměna |
|---|---|---|
| kdo to je | montáž tváří, jméno se šipkou zleva, karta s jeho videem | AI foto od pasu na bílém se slovem za hlavou |
| číslo | počítadlo (do 14 sn.), obří číslo za lidmi, boxy 1 2 3 | dvě počítadla proti sobě, štítek s číslem přes záběr |
| obsah a dosah | YouTube mřížka, IG profil 1:1, skutečné komentáře | okna videí najíždějí, karta s videem a slova po stranách |
| značka | záběr s logem, logo | koláž produktových záběrů |
| bod 1 2 3 | #N s názvem pod číslem, karty 1 2 3 | čísla jako boxy přes A-roll |
| citace | klip na celé ploše, český titulek na černém štítku přes jeho titulky | klip v kartě vedle Tima |
| pointa | obří slovo verzálkami za osobou (masky MatAnyone2) | slovo, které se protočí a dosedne |

## Zvláštnosti stylu

- Text za osobou: masky po snímcích (`BN.maskaZaPostavou`, výroba v `reference/nove.md` a `$BR_PROSTOR/reels/podnikatele/heaton/nastroje/za_osobou.py`).
  Nápis skrýt, jakmile masky dojdou.
- Low framerate jen na grafiku (krok 2), kamera a zoomy plynule po křivce, punch-in max 1,15.
- Titulky: šablona je dělá samy, u Tima nikdy přes obličej (u hlavy až od 500 a do 1420 px, pod bradou 1050).
- Bezpečná zóna 4:3: text ne do krajních 60 px, důležité ne do horních 120 px.
- Z originálu nepřenášet: glitch přechody, strobo, pixelový oheň, vystřiženého mluvčího.
