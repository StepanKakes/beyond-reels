/* Caspar kit (CK): styl reelů podle Caspara Tremletta (@caspartremlett) v jazyce Beyond
 *
 * Rozbor: ~/Documents/inspirace-reels/caspar/_rozbor/STYL.md, po snímcích DebbKfoAPPe/SHOTLOG.md a ROZBOR.md.
 * Každá komponenta nese ID zařízení (C1 až C18) a snímky originálu, výchozí hodnoty = změřený originál
 * přepočtený na 4:3 a upravený pravidly Beyond (vkus/pravidla.md). Téma je v caspar-kit.css.
 *
 * Stojí na sdíleném jádře: MK (js/mason-kit.js) musí být načtené a MK.init(root) zavolané před první komponentou.
 * Pohyb jen přes MK.tw a pojmenované křivky MK.KRIVKY (softLand, snapSettle, accelExit, whip, cruise).
 * Jednotky: časy v sekundách, délky ve snímcích (30 fps), velikost písma jako výška verzálek v podílu výšky snímku.
 * Média (video, img) musí být v HTML staticky, komponenty je jen přesunou do svého kontejneru.
 * Seek safe: jen tweeny a set na jedné pozastavené timeline.
 *
 * Systém v jedné větě: řeč vede, střih padá před první slovo věty, důraz nese velikost a jedna červená, ne efekt.
 */
(function () {
  const F = (n) => n / 30;
  const VERZALKA = 0.714;   // výška verzálky Helvetica Neue Bold v em
  // úrovně z rozboru (výška verzálek / výška snímku): drobná 3,6 až 4,5 %, základní 5,6 %, velká 7,5 až 11 %, obří 13 až 15,4 %
  const UROVNE = { d: 0.04, z: 0.056, v: 0.09, o: 0.145 };
  const pismo = (u) => (MK.H * (UROVNE[u] ?? u)) / VERZALKA;
  const poz = (v, cela) => (v <= 1.5 ? v * cela : v);   // podíl nebo px
  const mezi = (t) => Math.max(0, t - F(1));             // snímek před slovem
  // konec skupiny: děti se zapnutou visibility by prosvítaly skrytým rodičem, proto i display none (jako MK.strih)
  const pryc = (tl, el, t) => { MK.skryj(tl, el, t); MK.strih(tl, el, t); };

  /* NÁSTUP SLOVA (C4, C14 v Beyond verzi)
   * "tvrdy": plné v jednom snímku (originál: základní slova tvrdě nebo fade 4 sn.)
   * "mekky": softLand 12 sn. zdola o 2 % výšky, průhlednost jen pomocník 5 sn. (náhrada šedého nástupu C14)
   * "velky": snapSettle 11 sn. z 1,25x (obří slova), nikdy z nuly, bez přestřelu
   * krok 2 = karty po 2 snímcích jako originál (sn. 73 až 124), přes záběr plynule (krok 1) */
  function nastup(tl, el, t, jak, krok = 1) {
    MK.ukaz(tl, el, t);
    if (jak === "mekky") {
      MK.tw(tl, el, { y: MK.h(0.02) }, { y: 0 }, t, 12, { ease: "softLand", krok });
      MK.tw(tl, el, { opacity: 0.2 }, { opacity: 1 }, t, 5, { ease: "cruise" });
    } else if (jak === "velky") {
      MK.tw(tl, el, { scale: 1.25 }, { scale: 1 }, t, 11, { ease: "snapSettle", krok });
      MK.tw(tl, el, { opacity: 0.2 }, { opacity: 1 }, t, 5, { ease: "cruise" });
    }
  }
  const vychoziNastup = (u) => (u === "o" ? "velky" : u === "v" ? "mekky" : "tvrdy");

  // položka sestavy: text, nebo s.el = logo (img ze statického HTML), vysoké jako verzálky své úrovně
  function slovo(rodic, s) {
    if (s.el) {
      const el = MK.div(rodic, "ck-sl ck-logo");
      el.style.fontSize = pismo(s.u || "z") + "px";   // mezery kolem loga stejné jako u slov (0,11 em)
      el.appendChild(s.el); s.el.style.height = MK.H * (UROVNE[s.u || "z"] ?? s.u) + "px";
      return el;
    }
    const el = MK.div(rodic, "ck-sl" + (s.akcent ? " akcent" : "") + (s.serif ? " serif" : ""));
    el.textContent = s.serif ? s.w : s.w.toUpperCase();
    // serif má menší výšku písmen, aby opticky seděl s verzálkami vedle, je o 18 % větší
    el.style.fontSize = pismo(s.u || "z") * (s.serif ? 1.18 : 1) + "px";
    return el;
  }
  function konec(tl, el, t1, o) {
    if (t1 == null) return;
    if (o.odjezd) MK.odjezd(tl, el, t1 - F(13), { z: o.odjezd });
    else MK.strih(tl, el, t1);
  }

  /* C4 + C5 DVOUÚROVŇOVÁ SESTAVA (celé video, např. "i haven't / POSTED" sn. 9, "LIKE YOU / HELPED ME" sn. 538)
   * Drobné spojky a obří klíčové slovo v jedné sestavě, slova přibývají s řečí, rozložení stojí od začátku (nic neposkakuje).
   * radky: [[{w, t, u: "d"|"z"|"v"|"o", akcent, serif, nastup}], ...]  akcent = jedno červené slovo (C5), serif = minusky (osobní hlas)
   * o: {x, y} střed (podíl nebo px, výchozí 0,5 / 0,48 jako originál), t1 konec (tvrdě se střihem), odjezd "nahore"|"vlevo",
   *    tma: tmavý text na papíře, vlevo: zarovnání doleva, krok
   * Past: verzálky dělá CSS z textu, serif slova piš minuskami. Nikdy přes obličej, y měř po snímcích. */
  function sestava(tl, rodic, radky, o = {}) {
    const el = MK.div(rodic, "ck-sestava" + (o.tma ? " tma" : "") + (o.vlevo ? " vlevo" : ""));
    const x = poz(o.x ?? 0.5, MK.W), y = poz(o.y ?? 0.48, MK.H);
    if (o.vlevo) gsap.set(el, { left: x, top: y, yPercent: -50 }); else MK.stred(el, x, y);
    const slova = [];
    radky.forEach((r) => {
      const rd = MK.div(el, "ck-radek");
      r.forEach((s) => {
        const sl = slovo(rd, s);
        nastup(tl, sl, mezi(s.t), s.nastup || vychoziNastup(s.u), o.krok);
        slova.push(sl);
      });
    });
    konec(tl, el, o.t1, o);
    return { el, slova };
  }

  /* C17 ROZHÁZENÁ SLOVA NA JEDNÉ VÝŠCE, hlava v mezeře ("HE SAID ONE THING" sn. 574 až 612, krok 290 px na 1916)
   * slova: [{w, t, u}], o: {y (0,5), mezera: [x0, x1] podíl šířky, kde je hlava, vlevo: kolik slov jde nalevo, t1}
   * Sloty se rozdělí rovnoměrně do pásů 0,07 až x0 a x1 až 0,93, každé slovo naskočí se svým slovem v řeči */
  function rozhozena(tl, rodic, slova, o = {}) {
    const [m0, m1] = o.mezera || [0.38, 0.62], nL = o.vlevo ?? Math.ceil(slova.length / 2), nP = slova.length - nL;
    const sloty = (a, b, n) => Array.from({ length: n }, (_, i) => a + ((b - a) * (i + 0.5)) / n);
    const xs = [...sloty(0.07, m0, nL), ...sloty(m1, 0.93, nP)];
    const el = MK.div(rodic, "ck-vrstva" + (o.tma ? " tma" : ""));
    const els = slova.map((s, i) => {
      const d = MK.div(el, "ck-volne");
      const sl = slovo(d, s);
      gsap.set(d, { left: xs[i] * MK.W, top: poz(o.y ?? 0.5, MK.H) });
      nastup(tl, sl, mezi(s.t), s.nastup || vychoziNastup(s.u), o.krok);
      return sl;
    });
    konec(tl, el, o.t1, o);
    return { el, slova: els };
  }

  /* C18 SCHODY PO DIAGONÁLE ("TELL THEIR STORIES" sn. 1200 až 1232): každý řádek o krok doprava a dolů
   * radky: [{w, t, u}], o: {x, y levý horní roh (0,12 / 0,3), dx (0,14 W), dy (výška řádku), t1} */
  function schody(tl, rodic, radky, o = {}) {
    const el = MK.div(rodic, "ck-vrstva" + (o.tma ? " tma" : ""));
    const x0 = poz(o.x ?? 0.12, MK.W), y0 = poz(o.y ?? 0.3, MK.H), dx = poz(o.dx ?? 0.14, MK.W);
    let y = y0;
    const els = radky.map((s, i) => {
      const d = MK.div(el, "ck-volne");
      const sl = slovo(d, s);
      d.style.transform = "none"; d.style.left = x0 + i * dx + "px"; d.style.top = y + "px";
      y += o.dy ? poz(o.dy, MK.H) : pismo(s.u || "v") * 1.05;   // verzálky s háčky potřebují mezeru
      MK.ukaz(tl, sl, mezi(s.t));
      MK.tw(tl, sl, { x: -MK.h(0.03) }, { x: 0 }, mezi(s.t), 12, { ease: "softLand", krok: o.krok });
      MK.tw(tl, sl, { opacity: 0.2 }, { opacity: 1 }, mezi(s.t), 5, { ease: "cruise" });
      return sl;
    });
    konec(tl, el, o.t1, o);
    return { el, slova: els };
  }

  /* C15 VÝMĚNA SLOVA BEZ RESETU SESTAVY (FOUNDERS > BUSINESSES sn. 1167 až 1171 překryvem, "story" > "momnt" tvrdě sn. 1368)
   * sl: span slova ze sestavy, novy: text, o: {tvrde: true, n: 4, akcent: true}. Jde volat opakovaně na stejné slovo.
   * Past: šířku řádku drží první text, delší nové slovo přesahuje na obě strany, nejdelší dej jako první. */
  function vymena(tl, sl, novy, t, o = {}) {
    if (!sl._vrstva) {
      const obal = document.createElement("span"); obal.textContent = sl.firstChild.textContent;
      sl.replaceChild(obal, sl.firstChild); sl._vrstva = obal;
    }
    const stara = sl._vrstva, n = MK.div(sl, "nove" + (o.akcent ? " ck-akcent" : ""));
    n.textContent = sl.classList.contains("serif") ? novy : novy.toUpperCase();
    sl._vrstva = n;
    if (o.tvrde) { MK.nastav(tl, stara, { opacity: 0 }, t); MK.nastav(tl, n, { opacity: 1 }, t); return n; }
    // nejdřív odejde staré, pak naskočí nové (2 + 2 sn.), dvě slova přes sebe by se slila
    const pul = Math.max(1, Math.round((o.n || 4) / 2));
    MK.tw(tl, stara, { opacity: 1 }, { opacity: 0 }, t, pul, { ease: "softInOut" });
    MK.tw(tl, n, { opacity: 0 }, { opacity: 1 }, t + F(pul), pul, { ease: "softInOut" });
    return n;
  }

  /* C2 PAPÍROVÁ KARTA SLOVO PO SLOVU (bílá karta sn. 73 až 124): slova přibývají, celek se plynule zmenšuje
   * z 8,1 na 5,7 % výšky (1,42x > 1), před střihem odjede nahoru zrychlením. Animace po 2 snímcích jako originál.
   * radky jako u sestavy (bez u = základní velikost), o: {od: 1.42, odjezd: true, krok: 2, y} */
  function kartaSlova(tl, rodic, radky, t0, t1, o = {}) {
    const k = MK.div(rodic, "ck-karta papir");
    MK.ukaz(tl, k, t0);
    const s = sestava(tl, k, radky.map((r) => r.map((w) => ({ u: "z", ...w }))), { tma: true, y: o.y ?? 0.5, krok: o.krok ?? 2 });
    const nOdjezd = o.odjezd === false ? 0 : 13, n = Math.max(6, Math.round((t1 - t0) * 30) - nOdjezd);
    MK.tw(tl, s.el, { scale: o.od || 1.42 }, { scale: 1 }, t0, n, { ease: "softLand", krok: o.krok ?? 2 });
    if (nOdjezd) MK.tw(tl, s.el, { y: 0 }, { y: -MK.h(0.75) }, t1 - F(nOdjezd), nOdjezd, { ease: "accelExit", krok: o.krok ?? 2 });
    pryc(tl, k, t1);
    return { el: k, sestava: s };
  }

  /* OBŘÍ SLOVO PŘES ŠÍŘKU: SVG text natažený na přesnou šířku (textLength), výška verzálek pevná,
   * takže dlouhé slovo je užší (Casparovo úzké písmo na kartách C3) a vše roztažené na výšku jako naše obří slovo.
   * Nezávisí na načtení písma při stavbě timeline (žádné měření DOM). */
  function obri(rodic, text, o = {}) {
    const sirka = poz(o.sirka ?? 0.86, MK.W), cap = MK.H * (o.vyska ?? 0.3), fs = cap / VERZALKA;
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "ck-obri"); svg.setAttribute("width", MK.W); svg.setAttribute("height", MK.H);
    const tx = document.createElementNS("http://www.w3.org/2000/svg", "text");
    tx.setAttribute("x", (MK.W - sirka) / 2); tx.setAttribute("y", poz(o.y ?? 0.5, MK.H) + cap / 2);
    tx.setAttribute("font-size", fs); tx.setAttribute("textLength", sirka); tx.setAttribute("lengthAdjust", "spacingAndGlyphs");
    if (o.barva) tx.style.fill = o.barva;
    tx.textContent = text.toUpperCase();
    svg.appendChild(tx); rodic.appendChild(svg);
    return { svg, text: tx };
  }

  /* C3 ČERVENÁ KARTA S OBŘÍM SLOVEM (BETTER sn. 124, PROPERLY sn. 1231): karta tvrdým střihem, slovo najede zdola
   * softLand 12 sn. po 2 snímcích. o: {nad: "malý řádek nad" (serif nebo drobná), barva karty "akcent"|"cerna", vyska, sirka} */
  function kartaAkcent(tl, rodic, text, t0, t1, o = {}) {
    const k = MK.div(rodic, "ck-karta " + (o.karta || "akcent"));
    MK.ukaz(tl, k, t0);
    const g = MK.div(k, "ck-vrstva");
    const ob = obri(g, text, { vyska: o.vyska ?? 0.3, sirka: o.sirka, y: o.y ?? 0.55 });
    MK.tw(tl, g, { y: MK.h(0.35) }, { y: 0 }, t0, 12, { ease: "softLand", krok: o.krok ?? 2 });
    if (o.nad) sestava(tl, k, [[{ w: o.nad, t: o.tNad ?? t0 + F(1), u: "d", serif: o.serifNad !== false }]], { y: (o.y ?? 0.55) - (o.vyska ?? 0.3) / 2 - 0.08 });
    pryc(tl, k, t1);
    return { el: k, obri: ob };
  }

  /* C1 V BEYOND VERZI: OKNO S VÝMĚNOU FOTEK (originál: 6 střihů po 4 až 6 sn. pod stojícím titulkem, sn. 135 až 168)
   * Náš klid nedovolí sprint plnými záběry, proto jedno okno na papíře a fotky se tvrdě mění po 0,6 s, titulek stojí nad ním.
   * media: existující img/video elementy, o: {w (0,5), pomer (4/3), x, y (0,46), krok (0,6 s)} */
  function okno(tl, rodic, media, t0, t1, o = {}) {
    const k = MK.div(rodic, "ck-karta papir");
    MK.ukaz(tl, k, t0);
    const w = poz(o.w ?? 0.5, MK.W), h = w / (o.pomer || 4 / 3);
    const ok = MK.div(k, "ck-okno");
    gsap.set(ok, { width: w, height: h });
    MK.stred(ok, poz(o.x ?? 0.5, MK.W), poz(o.y ?? 0.46, MK.H));
    media.forEach((m, i) => { ok.appendChild(m); MK.nastav(tl, m, { visibility: i ? "hidden" : "visible" }, 0); });
    MK.prijezd(tl, ok, t0, { z: "dole", posun: MK.h(0.06) });
    const krok = o.krok || 0.6;
    media.forEach((m, i) => {
      if (!i) return;
      const t = t0 + i * krok; if (t >= t1) return;
      MK.skryj(tl, media[i - 1], t); MK.ukaz(tl, m, t);
    });
    pryc(tl, k, t1);
    return { el: k, okno: ok };
  }

  /* C8 KLIP SE ZMENŠÍ DO RÁMEČKU NA PAPÍŘE (sn. 308 až 388): celoobrazový záběr se zmenší na 59,5 % šířky doleva,
   * vpravo zbude místo na sestavu. Originál tvrdým střihem, u nás plynule softLand 14 sn. (naše zoomy jen po křivce).
   * zaber: obal záběru (.ck-zaber), o: {na: 0.595, x: střed rámečku (0,335), y (0,5), z papíru pod záběrem} */
  function ramecek(tl, rodic, zaber, t, t1, o = {}) {
    const p = MK.div(rodic, "ck-papir-pod");
    p.style.zIndex = o.z ?? (+getComputedStyle(zaber).zIndex || 1) - 1;
    MK.ukaz(tl, p, t); MK.skryj(tl, p, t1);
    const na = o.na || 0.595;
    MK.nastav(tl, zaber, { transformOrigin: "50% 50%" }, t);
    MK.tw(tl, zaber, { scale: 1, x: 0, y: 0 }, { scale: na, x: poz(o.x ?? 0.335, MK.W) - MK.W / 2, y: poz(o.y ?? 0.5, MK.H) - MK.H / 2 }, t, o.n || 14, { ease: "softLand" });
    return { papir: p };
  }

  /* C9 VLOŽENÝ KLIP + PUNCH-IN A-ROLLU + ČERVENÉ JMÉNO (sn. 423 až 436: A-roll +13 % za 12 sn., klip naskočí, jméno oranžově)
   * okno přijede zvětšením z 1,25x (snapSettle 11, žádný pop z nuly), A-roll punch 1,13 od horního okraje softLand 12,
   * jmenovka zdola pod oknem. media: element klipu, o: {aroll, x (0,72), y (0,4), w (0,36), pomer (9/16), jmeno, tJmeno}
   * Past: zpátky z punche jen dalším střihem, nikdy rychlým odzoomováním. */
  function vlozka(tl, rodic, media, t, t1, o = {}) {
    const w = poz(o.w ?? 0.36, MK.W), h = w / (o.pomer || 9 / 16);
    const ok = MK.div(rodic, "ck-okno");
    gsap.set(ok, { width: w, height: h });
    MK.stred(ok, poz(o.x ?? 0.72, MK.W), poz(o.y ?? 0.42, MK.H));
    ok.appendChild(media);
    MK.prijezd(tl, ok, t, { z: "velky" });
    if (o.aroll) punch(tl, o.aroll, t, { na: o.punch });
    const st = o.jmeno ? jmenovka(tl, rodic, o.jmeno, poz(o.x ?? 0.72, MK.W), poz(o.y ?? 0.42, MK.H) + h / 2 - MK.h(0.03), o.tJmeno ?? t + F(6), null, { stred: true }) : null;
    if (t1 != null) { pryc(tl, ok, t1); if (st) pryc(tl, st, t1); }
    return { okno: ok, stitek: st };
  }

  /* C9b JMENOVKA: červený štítek s bílým jménem (originál oranžové jméno u vložky, sn. 430), jen jména lidí, nikdy značky.
   * x, y v px (levý horní roh, nebo střed vodorovně s o.stred), přijede zdola softLand 12 sn. */
  function jmenovka(tl, rodic, text, x, y, t, t1, o = {}) {
    const st = MK.div(rodic, "ck-stitek"); st.textContent = text; st.style.fontSize = pismo(o.u || "d") + "px";
    gsap.set(st, { left: x, top: y, xPercent: o.stred ? -50 : 0 });
    MK.prijezd(tl, st, t, { z: "dole", posun: MK.h(0.03) });
    if (t1 != null) MK.skryj(tl, st, t1);
    return st;
  }

  /* C9a PUNCH-IN: 1 > 1,13 za 12 sn. softLand, od horního okraje (pravidlo: max 1,15) */
  function punch(tl, el, t, o = {}) {
    MK.nastav(tl, el, { transformOrigin: "50% 0%" }, t);
    MK.tw(tl, el, { scale: o.od || 1 }, { scale: Math.min(1.15, o.na || 1.13) }, t, o.n || 12, { ease: "softLand" });
  }

  /* C10 ČERVENÝ RÁMEČEK KOLEM OBLIČEJE + TEXT PO SLOVECH VEDLE (sn. 613 až 653, "BUILD A COMPANY WITH ME" 5 % výšky)
   * Bez Casparova černobílého gradu a prolnutí (grade neměníme). box: {x, y, w, h} obličeje v px (změřit po snímcích),
   * radky: [{w, t}] do sloupce vpravo od rámečku, o: {tloustka (0,005 H), vlevo: text vlevo od rámečku} */
  function oblicejBox(tl, rodic, box, radky, t0, t1, o = {}) {
    const b = MK.div(rodic, "ck-box");
    gsap.set(b, { left: box.x, top: box.y, width: box.w, height: box.h, borderWidth: MK.h(o.tloustka || 0.005) });
    MK.ukaz(tl, b, t0);
    MK.tw(tl, b, { scale: 1.12 }, { scale: 1 }, t0, 12, { ease: "softLand" });
    MK.tw(tl, b, { opacity: 0.2 }, { opacity: 1 }, t0, 5, { ease: "cruise" });
    const s = sestava(tl, rodic, radky.map((r) => [{ u: "d", ...r }]), {
      vlevo: true, x: o.vlevo ? box.x - MK.w(0.25) : box.x + box.w + MK.w(0.03), y: box.y + box.h / 2, t1 });
    MK.skryj(tl, b, t1);
    return { box: b, sestava: s };
  }

  /* C11 POMALÝ PULL-BACK na statickém záběru (sn. 168 až 218 a 570 až 612: 3 až 9 % lineárně)
   * o: {od: 1.06} (u nás 3 až 6 %, ať se to nehádá s punch-inem) */
  function pullBack(tl, el, t0, t1, o = {}) {
    MK.nastav(tl, el, { transformOrigin: o.origin || "50% 30%" }, t0);
    tl.fromTo(el, { scale: o.od || 1.06 }, { scale: 1, duration: t1 - t0, ease: MK.KRIVKY.cruise, immediateRender: false }, t0);
  }

  /* C12 ŠVIH MEZI ZÁBĚRY (sn. 721 až 731, originál s rozmazáním 10 sn.): u nás švih jádra bez záblesku a rozmazání,
   * titulky jsou ve vlastní vrstvě, takže zůstanou přibité k obrazovce jako u Caspara. o: {smer: "vlevo"} */
  function svih(tl, stara, nova, t, o = {}) { MK.svih(tl, stara, nova, t, { smer: o.smer || "vlevo", nOdjezd: 6, nPrijezd: 8 }); }

  /* C7 SLOVO ZA HLAVOU (BIGGEST sn. 180, FOUNDER sn. 855): obří slovo pod vrstvou masek postavy
   * Masky: $PY $BR_PROSTOR/tools/maska_za_osobou.py zaber.mp4 assets/media/<slozka> --od A --do B, v HTML jako <img id="<prefix>N"> nad slovem.
   * o: {y (0,26), vyska (0,24), sirka (0,9), prefix, pocet} Past: slovo skrýt, jakmile masky dojdou (vrací se čas). */
  function zaHlavou(tl, rodic, text, t0, t1, o = {}) {
    const g = MK.div(rodic, "ck-vrstva");
    obri(g, text, { y: o.y ?? 0.26, vyska: o.vyska ?? 0.24, sirka: o.sirka ?? 0.9 });
    MK.nastav(tl, g, { visibility: "hidden" }, 0);
    MK.ukaz(tl, g, t0);
    MK.tw(tl, g, { y: MK.h(0.05) }, { y: 0 }, t0, 12, { ease: "softLand" });
    MK.tw(tl, g, { opacity: 0.2 }, { opacity: 1 }, t0, 5, { ease: "cruise" });
    const kon = o.prefix ? BN.maskaZaPostavou(tl, o.prefix, t0, o.pocet, t1) : t1;
    MK.skryj(tl, g, kon);
    return { el: g };
  }

  /* C13 KARTIČKY VSUNUTÉ DO KARTY (sn. 1233 až 1347 plovoucí miniatury, sn. 0 až 72 UI kolaž): skutečné miniatury
   * (reely, profily) přijedou zdola do řady, rozestup 3 sn., po 2 snímcích. media: img elementy, o: {y (0,5), w (0,2), pomer (9/16), mezera (0,025)} */
  function vsun(tl, rodic, media, t, o = {}) {
    const w = poz(o.w ?? 0.2, MK.W), h = w / (o.pomer || 9 / 16), mez = poz(o.mezera ?? 0.025, MK.W);
    const celkem = media.length * w + (media.length - 1) * mez, x0 = (MK.W - celkem) / 2;
    return media.map((m, i) => {
      const ok = MK.div(rodic, "ck-okno");
      gsap.set(ok, { width: w, height: h, left: x0 + i * (w + mez), top: poz(o.y ?? 0.5, MK.H) - h / 2 });
      ok.appendChild(m);
      MK.ukaz(tl, ok, t + F(3 * i));
      MK.tw(tl, ok, { y: MK.h(0.5) }, { y: 0 }, t + F(3 * i), 12, { ease: "softLand", krok: o.krok ?? 2 });
      return ok;
    });
  }

  /* TITULKY BEYOND z kousků BN.titulkyZeSlov: bílé Bold se stínem přes záběr, tmavé s aurou na papíře, bez verzálek.
   * Kde je totéž velké v obraze (sestava, karta), kousek vynech přes `bez` v BN.titulkyZeSlov.
   * o: {velikost (0,045 H), tma(t) > true na papíře} */
  function titulky(tl, kontejner, kousky, o = {}) {
    return kousky.map((k) => {
      const d = MK.div(kontejner, "ck-titulek" + (o.tma && o.tma(k.t0) ? " tma" : ""));
      d.textContent = k.text; d.style.fontSize = MK.H * (o.velikost || 0.045) + "px";
      MK.ukaz(tl, d, k.t0); MK.skryj(tl, d, k.t1);
      return d;
    });
  }

  // popisek komponenty jen pro showcase a knihovnu
  function popisek(tl, rodic, text, t0, t1) {
    const d = MK.div(rodic, "ck-popisek"); d.textContent = text;
    MK.ukaz(tl, d, t0); MK.skryj(tl, d, t1);
    return d;
  }

  window.CK = { F, UROVNE, pismo, sestava, rozhozena, schody, vymena, kartaSlova, obri, kartaAkcent, okno, ramecek, vlozka, jmenovka, punch,
    oblicejBox, pullBack, svih, zaHlavou, vsun, titulky, popisek };
})();
