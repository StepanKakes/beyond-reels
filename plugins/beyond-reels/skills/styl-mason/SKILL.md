---
name: styl-mason
description: Mason styl reelů Beyond (podle Jacka Masona, @longevitypenguin) v HyperFrames 4:3: papír, černá a jedna červená, grafika na každou frázi, případové studie cizího byznysu, klientské příběhy a frameworky, titulky ze slov, obří slova za osobou, karty s videi, počítadla, citace na štítku. Použij spolu se skillem reel, když někdo řekne "mason", "jako Jack", "případovka", "rozbor podnikatele", nebo chce reel jako Dalen, Heaton, Steven či Vince.
---

# Styl Mason (Beyond)

Mluvíme Jackovým vizuálním jazykem o našich tématech, nekopírujeme jeho videa. Postup výroby je ve skillu `reel`,
tady je jazyk stylu. Nejdřív `$BR_PLUGIN/vkus/pravidla.md` a kolekce `verdikty` na revizní stránce.

## Projekt a komponenty

- Nový reel: `zsh $BR_PLUGIN/scripts/novy_reel.sh mason <nazev>`, šablona `src/reel.html`, jádro kitů v `js/` (MK, BN, EK).
- API a pasti komponent: `reference/rodiny.md` (MK po rodinách R1 až R10, BN, EK, křivky a plynulé pohyby), nové Beyond komponenty `reference/nove.md`.
- Hotové reely jako vzor: `$BR_PROSTOR/vzory/dalen-telo.html` (nejvíc vychytané), `vzory/heaton-telo.html`
  a `vzory/heaton-hook.html` (hook), `vzory/steven-telo.html`, `vzory/vince.html` (případovka 4:3). Ber z nich řešení, ne celé scény.
- Knihovna komponent z těchto reelů s ukázkami: revizní stránka, záložka Knihovna, styl Mason (`$BR_PROSTOR/knihovna/*.json` s popisy a voláním).
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
| citace | klip na celé ploše, český titulek na černém štítku přes jeho titulky | klip v kartě vedle mluvčího |
| pointa | obří slovo verzálkami za osobou (masky MatAnyone2) | slovo, které se protočí a dosedne |

## Zvláštnosti stylu

- Montáž fotek (Shelby: bílá, karty po 2 sn. a každá větší, bílá): VŽDY s filtry v postfx po celou dobu montáže, u každé montáže v každém hooku,
  nejen v prvním intru: `blur` 3 px, `radial` síla 0,075 a ostrý 0,06, `zare` práh 110, poloměr 46, síla 0,85, `zvednuti` černé 30
  (vzor greg `fx/intro-f.json` 0,033 až 0,399 s). Bez nich montáž působí syrově (Štěpán 17.11.2026, opakovaně zapomenuté).
- Jeden vizuál jen jednou: když varianty hooku jdou k jednomu tělu, nepoužívej v nich znovu nosič, který už je v jiném intru nebo v těle
  (bubliny, YouTube mřížka, IG profil). Každý hook má vlastní nápad.
- Tim v talking head A-rollu je VŽDY bez postfx: žádné zrno, záře, zvednutí, vinětace, radial, záblesk ani barevný lem přes jeho záběr,
  ani přes průhledné scény se slovem za ním. Efekty jen na B-roll a grafiku. Úseky, kde je Tim vidět, změř po snímcích z kompozice
  (žádná neprůhledná `.sc`) a efekty v `fx/*.json` na nich rozděl (Štěpán 17.11.2026).
- Text za osobou: masky po snímcích (`BN.maskaZaPostavou`, výroba v `reference/nove.md` a `$BR_PROSTOR/tools/maska_za_osobou.py`).
  Nápis skrýt, jakmile masky dojdou.
  **Pozadí za výřezem nikdy jako `<video>`, vždy jako sekvence snímků ze stejného klipu**, přepínaná stejnými časy jako výřez
  (`BN.maskaZaPostavou` zavolat dvakrát se stejným `t0`: snímky pozadí `.jpg` a nad slovem výřezy `.png`).
  Proč: renderer si snímky `<video>` vytahuje sám a `data-start` zarovnává jinak než `tl.set` výřezů, takže video bývá o snímek
  napřed nebo pozadu. U zdroje 25 fps převedeného na 30 se navíc každý 5. snímek opakuje, posun se proto v čase mění a při pohybu
  hlavy je vidět dvojitý obrys a ujetý ořez (Ben 15. 11.: STATUS, 18 mld i karty 1 2 3). Snímky pozadí vytáhni stejným filtrem
  jako výřezy (`scale=1920:1440:force_original_aspect_ratio=increase,crop=1920:1440,fps=30`, stejné `-ss`) a před stavbou ověř
  zarovnání: průměrný rozdíl barev výřezu a pozadí na alfě > 200 musí mít minimum na posunu 0 (posuny -2 až 2 snímky).
- Low framerate jen na grafiku (krok 2), kamera a zoomy plynule po křivce, punch-in max 1,15.
- Titulky: šablona je dělá samy, u mluvčího nikdy přes obličej (u hlavy až od 500 a do 1420 px, pod bradou 1050).
- Bezpečná zóna 4:3: text ne do krajních 60 px, důležité ne do horních 120 px.
- Z originálu nepřenášet: glitch přechody, strobo, pixelový oheň, vystřiženého mluvčího.
