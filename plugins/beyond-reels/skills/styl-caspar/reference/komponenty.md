# Caspar kit: API a pasti

Kit `js/caspar-kit.js` (`window.CK`) stojí na sdíleném jádře (`js/mason-kit.js`, `MK`). Stránka načte gsap, mason-kit, beyond-nove a caspar-kit,
pak `MK.init(root)` a jednu pozastavenou timeline. Časy v sekundách, délky ve snímcích (30 fps), velikosti jako výška verzálek v podílu výšky snímku
(`CK.UROVNE`: d 0,04, z 0,056, v 0,09, o 0,145, nebo číslo). Polohy jako podíl (do 1,5) nebo px.

Média (video, img) musí být v HTML staticky s `id` (jinak je renderer zmrazí), komponenty je jen přesunou do svého kontejneru.
Schovej je v `<div id="sklad" style="display:none">`.

## Text

- `sestava(tl, rodic, radky, o)`: `radky = [[{w, t, u, akcent, serif, nastup, el}]]`. `nastup`: `tvrdy` (výchozí pro d, z), `mekky` (softLand 12, pro v),
  `velky` (snapSettle 11 z 1,25x, pro o). `el` = logo jako položka (výška verzálek své úrovně). `o`: `x, y` (0,5 / 0,48), `t1` (tvrdý konec),
  `odjezd` (`nahore`, `vlevo`: accelExit 13 do t1), `tma`, `vlevo`, `krok`. Vrací `{el, slova}`.
  Past: rozložení stojí od začátku (slova jen zviditelní), takže řádek je široký jako celý text, i když slova přibývají.
- `rozhozena(tl, rodic, slova, o)`: `o.mezera = [x0, x1]` kde je hlava, `o.vlevo` kolik slov nalevo, `o.y`.
- `schody(tl, rodic, radky, o)`: `o.x, o.y` levý horní roh, `o.dx` krok doprava, `o.dy` (výchozí 1,05 velikosti písma, kvůli háčkům).
- `vymena(tl, slovo, novy, t, o)`: prolnutí 2 + 2 sn. (nejdřív odejde staré) nebo `tvrde`, `akcent` pro nové slovo. Jde volat opakovaně. Šířku řádku drží první text,
  u malých serifových řádků dávej `tvrde`, prolnutí dvou slov přes sebe je jinak vidět.
- `titulky(tl, kontejner, kousky, o)`: kousky z `BN.titulkyZeSlov(slova, {bez, strihy, vlastni})`, `o.tma(t)` vrací true, kde má být tmavý titulek
  (papír, bílé triko). Poloha `--ck-titulky-y` (70 %).
- `obri(rodic, text, o)`: SVG text natažený přes `textLength` na přesnou šířku, výška pevná. Nezávisí na načtení písma.

## Karty a okna

- `kartaSlova(tl, rodic, radky, t0, t1, o)`: papír, slova po jednom tmavá, celek z 1,42x na 1 softLand po 2 snímcích, odjezd nahoru 13 sn.
- `kartaAkcent(tl, rodic, text, t0, t1, o)`: `o.karta` (`akcent`, `cerna`), `o.nad` serifový řádek nad slovem a `o.tNad`, `o.y`, `o.vyska`.
  Vrací `{el}`, do `el` jde přidat vlastní sestavu (dovětek pod číslem).
- `okno(tl, rodic, media, t0, t1, o)`: papír a okno `o.w` (0,5) s poměrem `o.pomer`, víc médií se střídá po `o.krok` s.
  Jedno video s vlastními střihy uvnitř je nejjednodušší (střihy stopy dělají výměnu).
- `ramecek(tl, rodic, zaber, t, t1, o)`: obal záběru `.ck-zaber` se zmenší na `o.na` (0,595) se středem `o.x` (0,335), pod ním papír `o.z`.
  Další video ve stejném obalu (absolutně) = výměna uvnitř rámečku.
- `vlozka(tl, rodic, media, t, t1, o)`: okno `o.w`, `o.pomer`, `o.x`, `o.y`, `o.aroll` dostane punch, `o.jmeno` jmenovku.
- `vsun(tl, rodic, media, t, o)`: řada miniatur přijede zdola do karty po 3 sn.

## Kamera a švih

- `pullBack(tl, el, t0, t1, {od: 1.06})`, `punch(tl, el, t, {na: 1.13})`: zpět z punche jen střihem (`MK.nastav(tl, el, {scale: 1}, t)`).
- `svih(tl, stara, nova, t, {smer})`: přes `MK.svih`. Masky a slova za hlavou ukonči před švihem, jinak zůstanou stát, zatímco záběr odjíždí.
- `zaHlavou(tl, rodic, text, t0, t1, {prefix, pocet, y, vyska, sirka})`: masky začínají v t0 (stejné `--od` jako u `maska_za_osobou.py`).

## Pasti

- Skupinu se zviditelněnými dětmi ukončuj přes display (`MK.strih`), samotné `visibility: hidden` na rodiči děti neschová. Komponenty to dělají samy.
- Masky za hlavou mají jen tolik snímků, kolik se jich vyrobilo (`--od` až `--do`), slovo zmizí s poslední maskou.
- `hf check` hlásí `content_overlap` u těsně skládaných řádků. Rozhoduje snímek (overovac), ne hláška.
- Diakritika verzálek (Ě, Ž, Ý) potřebuje řádkování 1,1, proto ho sestava má.
