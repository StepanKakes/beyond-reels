# Beyond nové komponenty (BN), originální, z Jackova myšlení

`js/beyond-nove.js`, styly v `mason-kit.css` (sekce Beyond nové). Ukázka všech pěti: `src/nove.html` > `renders/nove-v1.mp4`. Použité v reelu Dalen (`src/dalen.html`).

| Komponenta | API | Kdy | Proč je to Jack, i když to nikdy neudělal |
|---|---|---|---|
| N1 týdenní pás | `tydenniPas(rodic,{nahledy,dny})`, `tydenniPasNastup(tl,p,t,{konec,jizda,rozestupy})` | "každý týden", pravidelnost, konzistence | doslovný objekt (kalendář), hromadí se, zrychluje (6 > 3 sn.), náhled dopadá pop se švihem jako bublina |
| N2 popis pod videem | `popisVidea(rodic,{video,nazev,kanal,odberatele,avatar,meta,veta,odkaz})`, `popisPsani(tl,p,[{t,konec}],{zvyraz,odkaz})` | "v popisu", "jedna věta", CTA v obsahu | psaní v rytmu řeči jako Benovo pole, zvýrazňovač je nové sloveso pohybu (červený pruh roste zleva 10 sn.) |
| N3 tečková mapa | `mapaTecek(rodic,{w,start,cile})`, `mapaNastup(tl,m,t,{oblouky,rozestup})` | dosah, země, trhy, doručení | tečky ve 4 vlnách na trojky, oblouky po 2 sn., cíl zčervená, až do něj oblouk dorazí (stav barvou) |
| N4 váhy | `vahy(rodic,{levy,pravy,popisL,popisP})`, `vahyNastup(tl,v,tL,tP,{naklon,od})` | poměr, "dává vs. bere", cena vs. hodnota | doslovný předmět, blok padá shora, rameno švihne přes cíl a snapne (Benova bublina jako rotace) |
| N5 lavina zpráv | `lavina(rodic,{pocet,zpravy,jmena,popis})`, `lavinaNastup(tl,l,t,{pilulka,pocitadloOd,kam,n,vyskaKarty})` | "tisíce zpráv", poptávka, reakce | hodně = zrychlit (8 > 2 sn.), stoh se zahušťuje, počítadlo tachometr v pilulce |
| duotone | `BN.duotone(root,{id,tma,svetlo})`, pak `style="filter:url(#bn-duo)"` | cizí B-roll přes celý snímek | Benův hnědý duotone v barvách Beyond (černá > teplý papír), červená pak svítí jen tam, kde má |

Velikosti v reelu 1080x1920: týdenní pás šířka 1020 od y 470, popis videa šířka 1000 od y 330, mapa šířka 980 od y 760, váhy 860x620 od y 860, lavina 960x1040 od y 450. Všechno drž v zóně textu 250 až 1490 px a vlevo od 1020 px.

Další nápady stejnou metodou (zatím nepostavené): žebříček (pořadí jako schody, nový stupeň padá shora), účtenka (tržby se tisknou po řádcích, součet tiká), mapa cesty zákazníka (body na čáře se rozsvěcují barvou), srovnání před a po (dvě karty, mezi nimi šipka se kreslí, horší zešedne).

## Z reelu Dalen (4. 10. 2026, Tim schválil ve v15)

Vzor celé kompozice: `reels/podnikatele/dalen/src/telo.html` a `intro.html`. Knihovna: sdílené jádro `$BR_PROSTOR/jadro` (`js/beyond-nove.js` BN, `js/mason-kit.js` MK), styly v `jadro/mason-kit.css`.

- `MK.slovaZespodu(tl, radek, slova)`: řádek slov, slovo přijede zespodu za 4 snímky na dvojky, místo drží od začátku (řádek neposkakuje). Tim nechce zvětšování z rozmazání (`slovaRozmazane`).
- `BN.titulkyZeSlov(slova, { bez, strihy, klipy, konec, vlastni, zlom })`: titulky po 1 až 3 slovech ze zarovnaných slov, zlom na interpunkci a na střihu scény, nikdy nenaskočí před střihem. Vykreslit třídou `.bn-tit` (styl Vince: bílé 96 px se stínem), `.tma` jen na papíře. Ruční výběr frází vynechával slova.
- `BN.imBubliny(tl, rodic, zpravy, { t, snimky, stred, zakaz })`: modré iMessage bubliny dokola kolem osoby, nepřekrývají se, skoro najednou s malými prodlevami. Zvuk: hluboká kapka (`sfx-knihovna/zvuky/53 pop floral water droplet hlubsi.wav`).
- `BN.igMrizka(rodic, { avatar, uzivatel, prispevky, sledujici, reels })`: IG profil se skutečnými obálkami reels a zhlédnutími místo šipek a čar.
- `BN.maskaZaPostavou(tl, prefix, t0, pocet, konec)`: velký nápis za postavou (masky MatAnyone2 po snímcích), nápis schovat, když masky dojdou.
- `BN.lcd(kont, { bezFiltru: true })`: LCD přes celou scénu bez posunu kanálů (s posunem měly natočené karty zubaté hrany).
- Velké červené slovo místo pilulky (VYPRODÁNO jako 100 MILIONOVOU), počítadla s tikem klávesy na každou změnu čísla (`32 tuk mixkit key single hlubsi.wav`).
- Nástupy obecně 4 až 6 snímků na dvojky, k 0,5, bez překmitu a bez driftu po dosednutí.
