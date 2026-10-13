# Jak Claude pracuje na reelech (dělba práce, modely, šetření kontextu)

Hlavní kontext je drahý. Všechno, co do něj přijde, se platí v každém dalším kole znovu, obrázky nejvíc
(jeden snímek stojí tolik co stovky řádků textu). Proto platí tři zásady:

1. **Mac měří první.** Než se Claude podívá na obrázek, nechá lokální nástroje vyrobit text.
2. **Oči deleguj.** Prohlížení snímků, screenshotů a logů dělá subagent na levnějším modelu a vrací jen verdikt.
3. **Ruce si nech.** Scénář, texty pro lidi, design a kód kompozice píše hlavní Claude sám. Levnější modely drží
   pravidla stylu hůř (čeština bez pomlček a teček, tokeny, naše písma) a oprava by sežrala úsporu.

## Kdo dělá co

| Práce | Kdo | Model |
|---|---|---|
| plán, brief, scénář, výběr směrů, texty na obrazovce, kód kompozice, komunikace s člověkem | hlavní Claude | ten, co běží (Opus) |
| kontrola renderu, storyboardu, stránky: snímky, přechody, kurzor, hlasitost | agent `beyond-reels:overovac` | Sonnet |
| rozbor reference nebo stylu tvůrce snímek po snímku, katalog řemesla, rozbor zvuku | agent `beyond-reels:rozbor` | Sonnet |
| hledání v kódu, ve vzorech `prostor/vzory`, v knihovně komponent, v dlouhých souborech | vestavěný agent Explore | Haiku (rychlé dotazy), Sonnet (široké hledání) |
| mechanická dávka bez vkusu (převod souborů, hromadné přejmenování, extrakce snímků) | hlavní Claude rovnou v Bashi, nebo general-purpose agent | Sonnet |

Agenta volej s konkrétním zadáním: cesta k souboru, co přesně zkontrolovat, časy, které tě zajímají, a že má vrátit
jen text. Nezávislé úkoly pouštěj paralelně v jedné zprávě a na pozadí (`run_in_background`), mezitím pracuj dál.
Výsledek agenta je jeho názor, ne příkaz: ověř, co je podezřelé, a rozhodni sám.

## Mac měří první (nástroje v `prostor/tools`)

- `souhrn_videa.py video [--prepis srt]`: délka, střihy, hlasitost, tempo řeči, první věta, text v obraze, přehled podle
  střihů `strihy.jpg`. Spouští ho samo `scripts/stahni.sh`. Obrázek otevři, až když text nestačí.
- `kontrola_renderu.py render.mp4 [--texty soubor]`: Apple Vision přečte text a najde obličeje snímek po snímku a nahlásí
  text přes obličej, u okraje, přes text, nečitelný a chybějící titulky. První krok každé kontroly renderu, dřív než oči.
- `kontrola_strihu.py`: useknutá slova a hrany střihu podle průběhu hlasitosti.
- whisper (`$BR_WHISPER`), `zarovnej.py` pro časy slov, ffmpeg `ebur128` a `silencedetect` pro zvuk.
- `maska_osoby.swift` a MatAnyone2 pro masky lidí.

## Kdy obrázek v hlavním kontextu ano

- Výjimečně: když verdikt agenta nestačí k rozhodnutí o designu, nebo když navrhuješ vzhled a potřebuješ vidět
  předlohu (snímek appky, reference, storyboard). Pak jeden přehledový list ve zmenšení, ne jednotlivé snímky.
- Nikdy kvůli kontrole, která jde změřit (text, hlasitost, ticho, obličej, okraj).

## Další návyky

- Malé úpravy nedeleguj: když je zadání pro agenta stejně dlouhé jako provedení, udělej to rovnou.
- Velké soubory nečti celé: `grep`, pak Read s offsetem a limitem.
- Render a dlouhé výpočty pouštěj na pozadí. Na hotovou práci přijde upozornění, nečekej na ni smyčkou.
- Zvuk nikdy nepřehrávej nahlas, jen měř.
- Po uzavření tématu doporuč nové sezení nebo `/compact`, hlavně když je v kontextu hodně obrázků.
