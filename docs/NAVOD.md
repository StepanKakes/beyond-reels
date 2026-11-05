# Návod: od instalace k vlastnímu stylu

Plugin dělá většinu práce sám a ptá se jen tam, kde se rozhoduje o vzhledu. Tvoje práce je dodat video, vybírat směry a psát komentáře.
Instalace je v [README](../README.md#instalace).

## 1. První nastavení, jednou

V Claude Code napiš:

```
/beyond-reels:zacatek
```

Claude ověří instalaci a zeptá se na:

- **Barvy:** jeden akcent, světlé a tmavé pozadí. Stačí poslat logo nebo web a barvy navrhne sám
- **Písma:** hlavní a druhé, jako soubory `.ttf` nebo `.otf`. Výchozí jsou Helvetica Neue a Instrument Serif
- **Tvoje pravidla:** co ve videech nikdy nechceš a co musí mít

Všechno se uloží do `~/Documents/beyond-reely/_moje`, kam aktualizace pluginu nesahá:

| Soubor nebo složka | Co v tom je |
|---|---|
| `znacka.json` | barvy a písma, dosadí se do každého nového reelu |
| `vkus.md` | tvoje pravidla, mají přednost před výchozími |
| `hudba/` | vlastní hudba a `katalog.json` |
| `B-rolls/` | vlastní záběry a `KATALOG.md` |
| `styly/` | tvoje vlastní styly |
| `revize/` | komentáře a videa z revizní stránky |

Hudbu a záběry nemusíš mít hned. Když je přidáš, řekni „popiš nové B-rolly a hudbu do katalogu“. Používej jen to, k čemu máš práva.

## 2. Jak vzniká reel

Napiš `/beyond-reels:reel` a dej cestu k videu. Klidně i víc pokusů za sebou, nejlepší vybere Claude. Dobré zadání říká, o čem video je a co v něm určitě má být:

> Udělej reel ve stylu noske z ~/Downloads/natoceni.mp4. Je o tom, jak jsme zdvojnásobili ceny. Na konci CTA slovo START.

Pak to jde takhle:

1. **Brief:** Claude se doptá na styl, typ, délku a konec
2. **Střih a hlas:** sám vybere pokusy, vyčistí hlas a spočítá časy slov
3. **Směry:** u důležitých vět ukáže dvě až tři varianty a ty vybíráš
4. **Storyboard:** statické snímky na revizní stránce, render až po tvém schválení
5. **Render a revize:** hotové video se objeví na `http://localhost:4747`

Tohle pořadí se vyplatí dodržet. Oprava ve storyboardu trvá chvíli, oprava po renderu mnohem déle.

## 3. Revizní stránka

Běží jen na tvém počítači, na `http://localhost:4747`. Otevřeš ji větou „otevři revizi“. Server se spouští sám, není potřeba nic hlídat.

- **Poznámka k času:** zastav video a napiš, co změnit
- **Místo v obraze:** táhni myší přes video a piš rovnou k tomu místu
- **Kresba:** zapni pero a dokresli, co myslíš
- **Oprava titulku:** přepiš přesné znění
- **Storyboard:** schval nebo okomentuj každý snímek

Až dopíšeš, řekni v Claude Code „přečti komentáře a oprav je“. Vzniká nová verze a u každého komentáře je odpověď, co se změnilo.
Co opakovaně schválíš nebo zamítneš, si Claude zapisuje a příště to ví sám.

Když revizi potřebuje vidět někdo další, pošli mu video. Stránka je dostupná jen z tvého Macu, a tím pádem i data z ní.

## 4. Vlastní styl

Tohle je nejsilnější část pluginu. Najdi tvůrce, jehož videa se ti líbí, a napiš:

```
/beyond-reels:novy-styl
```

**Co si připravit:**

- 3 až 6 odkazů na videa jednoho tvůrce (Instagram, YouTube, TikTok). Víc videí znamená lepší rozlišení toho, co je styl a co náhoda
- Krátká věta, co přesně se ti líbí: střih, typografie, B-rolly, zvuk
- Vlastní video na ukázku, 15 až 30 sekund mluvení stačí

**Co se pak děje:**

1. Claude videa stáhne na tvůj disk a přepíše je
2. Agenti je rozeberou snímek po snímku: délky záběrů, písma, pohyby a jejich křivky, přechody, zvuk
3. Sepíše **gramatiku stylu** a ukáže ti ji ke schválení. Tady se zastav a čti pozorně: co je konstanta, co přebírá a co vynechává
4. Postaví kit komponent v tvých barvách a písmech
5. Vyrobí ukázkový reel z tvého videa a dá ho na revizi
6. Podle tvých komentářů opravuje a nakonec uloží skill `styl-<jmeno>`

Hotový styl je do všech dalších reelů k dispozici jako ostatní: „udělej reel ve stylu <jmeno>“.

**Aby to dopadlo dobře:**

- Ber řemeslo, ne obsah. Rytmus, kompozice a pohyb se dají použít, cizí záběry, grafika ani logo ne
- Styl se ladí komentáři. Počítej se dvěma až třemi koly, než ti sedne. Pak už funguje sám
- Hodnoť první ukázku podle rytmu a kompozice, ne podle jednotlivých detailů. Ty se opraví snadno
- Styl nech vyrůst z několika videí. Když se opíráš jen o jedno, kopíruješ video a ne styl

Vlastní styly leží v `_moje/styly` a `~/.claude/skills`. Zálohuj je, aktualizace pluginu je nepřepíše.

## 5. Tipy, které šetří čas a náklady

- **Natáčej čistě.** Klopový mikrofon a klidná místnost pomůžou víc než jakákoli úprava. Plugin hlas vyčistí, ale neopraví všechno
- **Mluv do kamery.** Co nejde do objektivu, se musí překrýt grafikou nebo B-rollem
- **Pošli původní soubor** z kamery, ne video stažené z telefonu nebo ze sociální sítě
- **Komentuj konkrétně.** „Tenhle titulek o půl vteřiny později“ se opraví napoprvé, „nějaké mi to nepřijde“ ne
- **Začni krátkým reelem.** 30 sekund se ladí rychleji a spotřebuje mnohem méně limitu Claude Code. Delší videa nech až na druhé kolo
- **Nové téma, nové sezení.** Po hotovém reelu začni v novém okně, reely v kontextu zbytečně spotřebovávají limit

## 6. Když se něco pokazí

| Co vidíš | Co udělat |
|---|---|
| Chybí nástroj nebo cesta | řekni „zkontroluj instalaci“, nebo spusť `setup.sh --kontrola` |
| Revize se neotevře | řekni „otevři revizi“; když je port obsazený, Claude nastaví jiný |
| Render trvá dlouho nebo Mac topí | běžné u delších videí, zavři náročné aplikace; Claude umí renderovat jen změněný úsek |
| Reel má starou barvu nebo písmo | značka platí pro nové projekty, řekni „dosaď značku do tohoto projektu“ |
| Claude dělá něco, co nechceš | řekni mu to a dodej „zapiš si to do vkusu“, příště už to platí vždy |
| Instagram video nejde stáhnout | přihlas se k Instagramu v prohlížeči a zkus to znovu |

**Volitelné doplňky:** text za osobou potřebuje model MatAnyone2 (2,5 GB, `setup.sh --matanyone`). AI fotky a generované obrázky nejsou součástí pluginu, vyžadují vlastní účet u poskytovatele a klíč.

**Aktualizace:** `/plugin`, Marketplaces, beyond, Update, pak restart. Hotové reely se nezmění, každý má vlastní kopii kitu.
