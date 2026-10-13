# Knihovna SFX pro hyperframes

Sdílené zvukové efekty pro všechny reely (plugin beyond-reels, `$BR_PROSTOR/sfx`) (jack-styl, noske-styl, matt-gray-styl, beo-explainer, ...).
Seznam zvuků, délky a k čemu slouží je v `katalog.json`. Nový zvuk = soubor sem + záznam do katalogu.
Použití v projektu: zkopíruj do `assets/sfx/` projektu (render bere soubory z projektu) a míchej skriptem (`jack-styl/nastroje/zvuk_c.py`, `zvuk_shelby.py`).

## zaklad/
Timem schválená sada (2.10.2026): klik1 a klik2 střídat na slova víceslovných vět (-30 dB), klik4 na nástupy prvků,
závěrka na obrázky a záběry, sub na velký moment. Nikdy klik3 (classic click) ani tuk (dřevěný ťuk).

## shelby/
Vytažené z reelu Shelby Sapp (DcPOpApRdra): hudba oddělená jako smyčka 115 BPM, efekty jako zbytek, nejčistší výskyt každého typu.
`mapa.json` = všech 116 výskytů v originále (čas, snímek, vzorek, hlasitost vůči hlasu), podle ní `jack-styl/nastroje/zvuk_shelby.py` staví 1:1 stopu.

Jak Shelby střihač zvuky používá (medián hlasitosti vůči RMS hlasu):
| zvuk | kolikrát za 97 s | kdy | hlasitost |
|---|---|---|---|
| svih1, svih2 | 45 | skoro každý střih a přesun karty, švih stránky | -10 dB |
| pop1, pop2 | 32 | slovo nebo prvek naskočí (titulky moderátora, pilulky, karty) | -11 dB |
| dopad1, dopad2 | 14 | tvrdý střih na nové téma, obří slovo | -12 dB |
| sub1 | 4 | velký moment (3 miliony, NEXT CONTENT) | -10 dB |
| najezd1 | 5 | před velkým odhalením, nahlas nad hlasem | +10 dB |
| zaverka1 | 4 | fotka nebo screenshot dosedne | -16 dB |
| cink1 | 6 | číslo, notifikace, DM | -14 dB |
| klik1, klik2 | 4 | klik v UI (YouTube, IG) | -15 dB |
| psani1 | 2 | psaní textu | -10 dB |

Rytmus: 116 zvuků za 97 s, tedy zhruba jeden každých 0,8 s

Tim 4.10.2026: jemné kliky a krátké shutter švihy dávat na texty a prvky hojně, ale vždy na změnu stavu prvku (naskočí, dosedne, změní se, přesune). U Shelby jsou, jen v extrakci byly moc tiché a odfiltrovaly se

## deith/
DEITH_SFX z Timovy hudby (5.10.2026, soubory pod 5 MB; ohnivý zvuk 57 MB, ptáci, noční ambient a jezero vynechány). Na načítání čísel Tim vybral `Display Digits 3.wav` (3,5 s, v Steven reelu jako assets/sfx/digits.wav, ořezaný na délku počítadla).
