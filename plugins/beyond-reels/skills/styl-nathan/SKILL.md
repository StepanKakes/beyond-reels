---
name: styl-nathan
description: Nathan styl reelů Beyond (podle Nathana Nazaretha) v HyperFrames: klidný talking head s A-rollem do kamery, jedno velké slovo přes šířku s měkkým dojezdem, malá slova kolem, B-rolly v oknech na červené nebo tmavé ploše, AI postava se slovem za hlavou, citace čistým klipem. Video se generuje ze scénáře (klauze a obraz) generátorem. Použij spolu se skillem reel, když někdo řekne "nathan", "jako Nathan Nazareth" nebo chce klidný reel s velkými slovy a B-rolly v oknech.
---

# Styl Nathan (Beyond)

Postup výroby (brief, střih, zvuk, revize) je ve skillu `reel`, tady je jazyk a stroj stylu. Nejdřív `$BR_PLUGIN/vkus/pravidla.md`.
Projekt: `$BR_PROSTOR/nathan-styl`, nový reel `zsh $BR_PLUGIN/scripts/novy_reel.sh nathan <nazev>`.
Rozbor originálu (recepty R1 až R29, měřený pohyb): `$BR_INSPIRACE/nathan/_rozbor/DeK988mxoYq/SHOTLOG.md` a `POHYB.md`, varianty `_rozbor/varianty/`.

**Formát:** stroj stylu je zatím postavený v 16:9 (návrhový prostor 1920x1080). Ostatní reely děláme 4:3, takže před prvním
Nathan reelem pro tým se zeptej, jestli převést generátor a kit na 1920x1440, nebo nechat 16:9.

## Stroj

1. **Scénář** `scenare/<nazev>.json`: `nazev`, `seed`, `hlas` (výstup studio_hlas), `slova` (zarovnaná slova), `zdroje` (šablony cest ke klipům a obrázkům),
   `citace`, `pohled` (úseky [od, do, 1 = dívá se do kamery]), `hudba`, `fraze`: [{text, obraz: ["th"] | ["klip:<id>@<s>", "hledej:<co>"] | [], duraz}].
   Obraz klauze: `th` = Tim do kamery, seznam záběrů, nebo nic (typografická karta).
2. `zsh nastroje/vyrob.sh scenare/<nazev>.json [seed] [render]`: nástupy (`nastupy.py`), generátor (`generator.py`, styl ze SHOTLOG přes
   rozpočty a semínko), média (`priprav.py`), zvuk (`zvuk.py`), `node build.mjs <nazev>`, check, render se zvukem.
3. Jiné semínko = jiná varianta stejného scénáře. Ke schválení dej 2 až 3 semínka jako storyboard (snímky v klíčových větách).
4. Kit `js/nathan-kit.js` (`window.NZ`) jen staví a animuje plán, polohy textu počítá generátor z metrik písma (`nastroje/pismo.py`).

## Jazyk stylu (Štěpán 12. 10. 2026, platí vždy)

- Akcent naše červená #FF0E00 místo Nathanovy modré, i modrá karta je červená, rohy světlé karty teple šedé.
- Víc A-rollu, když se Tim dívá do objektivu (cíl kolem 22 % jako originál), krátké uhnutí pohledem překrýt B-rollem (`odvraty()` v generátoru).
- AI postava sedí, za hlavou velké slovo (Seedream v4 edit, výřez BiRefNet, koncept `sedi`, `nastroje/gen_sedi.py`).
- **Klid:** záběr aspoň 1,7 s, snap zoom jen výjimečně a jemně, bez punchů na Timovi, bliknutí textu 2 až 3 za video, bez bílých bloků,
  záblesky nejvýš 2. Velké slovo jen když stojí aspoň 20 snímků, dojezd nejvýš 20 snímků (tau 0,3 x držení, strop).
- Jen naše písma: Helvetica Neue Bold (i verzálky) a Instrument Serif v rovném řezu. Texty se nepřekrývají, přes pestrý B-roll jemný stín.
- B-rolly klidně zmenšené do oken (16:9 nebo čtverec) na červené nebo tmavé ploše, vyjedou zespodu.
- Citace: jen čistý klip, kde mluví celou dobu, bez našeho překladu, hrany do ticha.
- Zvuk standardem Beyond (`zvuk.py` drží hlas -5,5 dB, hudbu -24 dB se sidechainem); SFX z `$BR_PROSTOR/sfx/zaklad`.
