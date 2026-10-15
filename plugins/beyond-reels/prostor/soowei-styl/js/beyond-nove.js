/* Beyond nové komponenty: originální prvky postavené z Jackova způsobu myšlení, ne z jeho videí
 *
 * Každá splňuje jeho pravidla (rozbor C ve všech 7 videích):
 * 1. abstraktní pojem dostane doslovný objekt, 2. prvek se rozvíjí a hromadí, neodchází,
 * 3. hodně = zrychlit změny na 10 fps a pak zastavit, 4. jedna křivka (exp doběh), přestřel jen u UI popu,
 * 5. stav se mění barvou (akcent = aktivní), 6. nastupuje na slovo, ne mezi slovy.
 * A k tomu Beyond: papír, černá, jedna červená, Helvetica Bold a Instrument Serif jako druhý hlas, bez záře.
 *
 * Závisí na MK (mason-kit.js). Všechny vrací DOM a mají funkci nástupu, která bere časy slov.
 */
(function () {
  const MK = window.MK;
  const F = (n) => MK.F(n);
  const el = (rodic, trida, html) => MK.div(rodic, trida, html);

  /* ---------- N1 TÝDENNÍ PÁS (konzistence publikace) ----------
   * "Každý týden jedno video": řádky týdnů s 7 dny, do jednoho dne každého týdne dopadne náhled videa
   * (pop se švihem jako Benova bublina) a den zčervená. Řádky přibývají zrychleně (6, 5, 4, 3 sn.),
   * celý pás pak pomalu jede nahoru, jako by týdnů bylo nekonečno. Hodně = zrychlit.
   */
  function tydenniPas(rodic, o = {}) {
    const root = el(rodic, "bn-tyden");
    const dny = ["po", "út", "st", "čt", "pá", "so", "ne"];
    const hlava = el(root, "bn-tyden-hlava");
    dny.forEach((d) => el(hlava, "bn-tyden-den", d));
    const telo = el(root, "bn-tyden-telo");
    const radky = (o.nahledy || []).map((src, i) => {
      const r = el(telo, "bn-tyden-radek");
      el(r, "bn-tyden-cislo", `${i + 1}`);
      const bunky = dny.map(() => el(r, "bn-tyden-bunka"));
      const den = o.dny ? o.dny[i] : [1, 3, 0, 4, 2, 1, 3, 2][i % 8];
      const znacka = el(bunky[den], "bn-tyden-znacka");
      const nahled = el(bunky[den], "bn-tyden-nahled", `<img src="${src}" alt="">`);
      return { r, bunky, den, nahled, znacka };
    });
    return { root, hlava, telo, radky };
  }
  function tydenniPasNastup(tl, p, t, o = {}) {
    MK.ukaz(tl, p.root, t);
    MK.tw(tl, p.hlava, { opacity: 0.4 }, { opacity: 1 }, t, 3, { ease: (x) => x });
    const rozestupy = o.rozestupy || [7, 6, 5, 4, 3, 3, 3, 3];
    let ti = t + F(2);
    p.radky.forEach((r, i) => {
      MK.ukaz(tl, r.r, ti);
      MK.tw(tl, r.r, { opacity: 0.4 }, { opacity: 1 }, ti, 3, { ease: (x) => x });
      MK.popSnap(tl, r.nahled, ti + F(1), { sila: i % 2 ? -0.6 : 0.6, zdvih: 0.4 });
      MK.ukaz(tl, r.znacka, ti + F(2));
      ti += F(rozestupy[i] || 3);
    });
    // pás jede nahoru: týdnů je víc, než se vejde
    if (o.konec) tl.to(p.telo, { y: -(o.jizda || 0), duration: o.konec - t, ease: MK.kroky(MK.expIn(0.97, 60), 60, 2) }, t);
  }

  /* ---------- N2 POPIS POD VIDEEM (prodej schovaný v popisu) ----------
   * Přehrávač s videem, pod ním kanál a šedý box popisu. Věta se píše po písmenech v rytmu řeči
   * s červeným kurzorem, pak ji přejede zvýrazňovač (červený pruh pod textem roste zleva, ease out 10 sn.)
   * a vedle naskočí odkaz jako pilulka. Zvýrazňovač je nové sloveso: "tohle je to důležité".
   */
  function popisVidea(rodic, o = {}) {
    const root = el(rodic, "bn-yt");
    const prehravac = el(root, "bn-yt-prehravac");
    if (o.video) prehravac.appendChild(o.video);
    else if (o.klip) prehravac.innerHTML = `<video id="${o.id || "bnyt"}" src="${o.klip}" muted playsinline class="clip" data-start="${o.klipStart || 0}" data-duration="${o.klipDelka || 6}" data-track-index="${o.stopa || 5}"></video>`;
    else if (o.obrazek) prehravac.innerHTML = `<img src="${o.obrazek}" alt="">`;
    el(prehravac, "bn-yt-lista", '<i></i>');
    el(root, "bn-yt-nazev", o.nazev || "");
    el(root, "bn-yt-kanal", `<span class="bn-yt-av"><img src="${o.avatar || ""}" alt=""></span><b>${o.kanal || ""}</b><span>${o.odberatele || ""}</span>`);
    const popis = el(root, "bn-yt-popis");
    el(popis, "bn-yt-meta", o.meta || "");
    const radek = el(popis, "bn-yt-veta");
    const zvyr = el(radek, "bn-yt-zvyraz");
    const pismena = [...(o.veta || "")].map((c) => { const s = document.createElement("span"); s.textContent = c === " " ? " " : c; s.style.visibility = "hidden"; radek.appendChild(s); return s; });
    const kurzor = el(radek, "bn-yt-kurzor");
    const odkaz = el(popis, "bn-yt-odkaz", o.odkaz || "");
    return { root, prehravac, popis, radek, zvyr, pismena, kurzor, odkaz };
  }
  // psaní v rytmu řeči: slova [{t, konec}] rozdělí písmena rovnoměrně do času slova
  function popisPsani(tl, p, slova, o = {}) {
    const veta = p.pismena.map((s) => s.textContent);
    let i = 0;
    const casti = [];
    veta.join("").split(" ").forEach((w, wi) => { casti.push({ od: i, n: w.length }); i += w.length + 1; });
    MK.ukaz(tl, p.kurzor, slova[0].t - F(6));
    casti.forEach((c, wi) => {
      const s = slova[Math.min(wi, slova.length - 1)];
      const delka = Math.max(F(c.n), (s.konec || s.t + 0.25) - s.t);
      for (let k = 0; k < c.n; k++) MK.ukaz(tl, p.pismena[c.od + k], s.t + (delka * k) / c.n);
      if (p.pismena[c.od + c.n]) MK.ukaz(tl, p.pismena[c.od + c.n], s.t + delka);
    });
    // kurzor bliká jen když se nepíše: tady stačí, že po dopsání zmizí
    if (o.zvyraz) {
      MK.skryj(tl, p.kurzor, o.zvyraz);
      MK.ukaz(tl, p.zvyr, o.zvyraz);
      MK.tw(tl, p.zvyr, { scaleX: 0 }, { scaleX: 1 }, o.zvyraz, 10, { k: 0.75 });
    }
    if (o.odkaz) MK.stitekPop(tl, p.odkaz, o.odkaz, { sila: 0.5 });
  }

  /* ---------- N3 TEČKOVÁ MAPA DORUČENÍ (dosah firmy) ----------
   * Svět z teček (šedé), start v Hongkongu (červená tečka), oblouky se kreslí k cílům po 2 sn.
   * a cílová tečka zčervená, když do ní oblouk dorazí. Počet zemí tiká v pilulce. "100 zemí" = vidět, ne slyšet.
   */
  // hrubá mapa světa 64 x 30 (ekvidistantní), # = pevnina
  const SVET = [
    "................................................................",
    "..........#####.........................#####...................",
    "....#########.#####..........##.....##############..####........",
    "..##################.......####...######################.####...",
    "..##.###############.......##....#########################......",
    "......##############.........#..##########################......",
    ".......############...........######.######################.....",
    "........##########...........##############################.....",
    ".........#######.............#############.###########.##.......",
    "..........######.............#############..#########...#.......",
    "...........###..............###############..#######....##......",
    "............##.##............###############..####.....##.......",
    "..............####...........#############.....##....#..........",
    "...............#####..........##########.........#..###.........",
    "...............#######...........######...........#.####........",
    "................########..........#####..............###........",
    "................#########.........####.................#........",
    ".................#######..........####...........#.....###......",
    "..................#####...........###...........########........",
    "..................####............##............#########.......",
    "..................###..............#.............########.......",
    "..................##...............................####.....##..",
    "..................##........................................#...",
    "..................#.............................................",
    "................................................................",
  ];
  const CILE = { hk: [51, 9], ny: [18, 5], la: [9, 7], lon: [31, 3], ber: [34, 3], par: [31, 4], syd: [57, 19], sao: [21, 17], dub: [39, 8], tok: [55, 6], sin: [49, 12], tor: [17, 4], jnb: [36, 18], mex: [12, 9] };
  function mapaTecek(rodic, o = {}) {
    const sir = o.w || 940, kr = sir / 64, vys = SVET.length * kr;
    const root = el(rodic, "bn-mapa");
    root.style.width = sir + "px"; root.style.height = vys + "px";
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", `0 0 ${sir} ${vys}`); svg.classList.add("bn-mapa-svg");
    root.appendChild(svg);
    const tecky = [];
    SVET.forEach((r, y) => [...r].forEach((c, x) => {
      if (c !== "#") return;
      const k = document.createElementNS(svg.namespaceURI, "circle");
      k.setAttribute("cx", (x + 0.5) * kr); k.setAttribute("cy", (y + 0.5) * kr); k.setAttribute("r", kr * 0.36);
      k.classList.add("bn-mapa-tecka"); svg.appendChild(k); tecky.push(k);
    }));
    const bod = (n) => [(CILE[n][0] + 0.5) * kr, (CILE[n][1] + 0.5) * kr];
    const [hx, hy] = bod(o.start || "hk");
    const oblouky = (o.cile || ["lon", "ny", "syd", "la", "ber", "sao", "dub", "tok", "sin", "tor", "jnb", "mex", "par"]).map((n) => {
      const [x, y] = bod(n);
      const p = document.createElementNS(svg.namespaceURI, "path");
      const mx = (hx + x) / 2, my = Math.min(hy, y) - Math.abs(x - hx) * 0.28 - 20;
      p.setAttribute("d", `M${hx} ${hy} Q ${mx} ${my} ${x} ${y}`); p.setAttribute("pathLength", "1");
      p.classList.add("bn-mapa-oblouk"); svg.appendChild(p);
      const c = document.createElementNS(svg.namespaceURI, "circle");
      c.setAttribute("cx", x); c.setAttribute("cy", y); c.setAttribute("r", kr * 0.55); c.classList.add("bn-mapa-cil"); svg.appendChild(c);
      return { p, c };
    });
    const start = document.createElementNS(svg.namespaceURI, "circle");
    start.setAttribute("cx", hx); start.setAttribute("cy", hy); start.setAttribute("r", kr * 0.7); start.classList.add("bn-mapa-start"); svg.appendChild(start);
    return { root, tecky, oblouky, start };
  }
  function mapaNastup(tl, m, t, o = {}) {
    MK.ukaz(tl, m.root, t);
    // tečky naskočí ve 4 vlnách zleva doprava (trojky), ne všechny naráz
    const vlny = 4;
    m.tecky.forEach((k) => {
      const x = +k.getAttribute("cx") / (+m.root.style.width.replace("px", ""));
      tl.set(k, { opacity: 0 }, t);
      tl.set(k, { opacity: 1 }, t + F(Math.floor(x * vlny) * 3));
    });
    tl.set(m.start, { opacity: 0 }, t);
    MK.pop(tl, m.start, t + F(12), { sila: 0.5 });
    m.oblouky.forEach((a, i) => {
      const ti = (o.oblouky || t + F(16)) + F(i * (o.rozestup || 2));
      MK.kresli(tl, a.p, ti, { n: 8, k: 0.75 });
      tl.set(a.c, { opacity: 0 }, t);
      tl.set(a.c, { opacity: 1 }, ti + F(6));
    });
  }

  /* ---------- N4 VÁHY 100 / 1 (dávat vs brát) ----------
   * Rameno na trojúhelníku. Na levou misku dopadne velký červený blok (pád shora), rameno se nakloní
   * se švihem a dosedne (snap). Pak na pravou dopadne malý černý blok a váhy se skoro nehnou.
   * Divák vidí poměr dřív, než ho spočítá.
   */
  function vahy(rodic, o = {}) {
    const root = el(rodic, "bn-vahy");
    const rameno = el(root, "bn-vahy-rameno");
    const lm = el(rameno, "bn-vahy-miska l"), pm = el(rameno, "bn-vahy-miska p");
    const lb = el(lm, "bn-vahy-blok velky", `<b>${o.levy || "100 %"}</b><span>${o.popisL || "dává"}</span>`);
    const pb = el(pm, "bn-vahy-blok maly", `<b>${o.pravy || "1 %"}</b><span>${o.popisP || "bere"}</span>`);
    el(root, "bn-vahy-osa");
    gsap.set([lb, pb], { xPercent: -50 });
    return { root, rameno, lb, pb, lm, pm };
  }
  function vahyNastup(tl, v, tL, tP, o = {}) {
    const od = o.od == null ? tL - F(8) : o.od;
    MK.ukaz(tl, v.root, od);
    MK.tw(tl, v.root, { opacity: 0.4 }, { opacity: 1 }, od, 3, { ease: (x) => x });
    MK.padShora(tl, v.lb, tL, { z: 420, n: 10, k: 0.7 });
    // náklon: švih za 6 sn. přes cíl, snap zpět za 1 snímek, dojezd (jako Benova bublina, jen rotace)
    const n = o.naklon || 9;
    [[0], [n * 0.35], [n * 0.8], [n * 1.25], [n * 1.4], [n * 1.32], [n * 1.05], [n * 0.97], [n]].forEach(([r], i) => tl.set(v.rameno, { rotation: r }, tL + F(8 + i)));
    // misky drží svisle (protirotace)
    [[0], [n * 0.35], [n * 0.8], [n * 1.25], [n * 1.4], [n * 1.32], [n * 1.05], [n * 0.97], [n]].forEach(([r], i) => tl.set([v.lm, v.pm], { rotation: -r }, tL + F(8 + i)));
    MK.padShora(tl, v.pb, tP, { z: 300, n: 10, k: 0.7 });
    [[n], [n * 0.93], [n * 0.97], [n]].forEach(([r], i) => { tl.set(v.rameno, { rotation: r }, tP + F(9 + i)); tl.set([v.lm, v.pm], { rotation: -r }, tP + F(9 + i)); });
  }

  /* ---------- N5 LAVINA ZPRÁV (40 000 poděkování) ----------
   * Notifikace přijíždějí zespodu a tlačí starší nahoru, rozestup se zkracuje (8 > 2 sn.),
   * starší se zmenšují do stohu nahoře. Počítadlo v pilulce nad stohem tiká jako tachometr.
   * Jedna zpráva je obsah, sto zpráv je fakt.
   */
  function lavina(rodic, o = {}) {
    const root = el(rodic, "bn-lavina");
    const stoh = el(root, "bn-lavina-stoh");
    const texty = o.zpravy || ["díky za video", "děkuju", "tohle mi pomohlo", "díky Danieli", "konečně to dává smysl"];
    const jmena = o.jmena || ["anna", "tom", "lukas", "eva", "marek", "jana", "petr", "sara"];
    const karty = Array.from({ length: o.pocet || 14 }, (_, i) => el(stoh, "bn-zprava", `<span class="bn-zprava-av" style="--h:${(i * 47) % 360}"></span><div><b>${jmena[i % jmena.length]}</b><span>${texty[i % texty.length]}</span></div><i>teď</i>`));
    const pil = el(root, "bn-lavina-pilulka", `<b>0</b><span>${o.popis || "zpráv"}</span>`);
    gsap.set(pil, { xPercent: -50 });
    return { root, stoh, karty, pil, cislo: pil.querySelector("b") };
  }
  function lavinaNastup(tl, l, t, o = {}) {
    MK.ukaz(tl, l.root, t);
    const krok = o.vyskaKarty || 150;
    let ti = t, rozestup = 8;
    l.karty.forEach((k, i) => {
      MK.ukaz(tl, k, ti);
      MK.tw(tl, k, { y: krok * 1.6, opacity: 0.4 }, { y: 0, opacity: 1 }, ti, 6, { k: 0.65 });
      // všechny předchozí poskočí o jednu kartu nahoru a zmenší se (stoh se zahušťuje), fromTo kvůli seeku
      const stav = (h) => ({ y: -krok * Math.min(h, 4) - Math.max(0, h - 4) * 14, scale: Math.max(0.78, 1 - h * 0.035), opacity: h > 6 ? 0 : 1 });
      for (let j = 0; j < i; j++) {
        const h = i - j;
        tl.fromTo(l.karty[j], stav(h - 1), { ...stav(h), duration: F(5), ease: MK.expOut(0.65, 5), immediateRender: false }, ti);
      }
      ti += F(rozestup);
      rozestup = Math.max(2, rozestup - 1);
    });
    MK.stitekPop(tl, l.pil, o.pilulka || t, { sila: 0.5 });
    MK.pocitadlo(tl, l.cislo, o.pocitadloOd || t, 0, o.kam || 40000, o.n || 24, { krok: 1, ease: MK.expOut(0.86, o.n || 24), format: (v) => Math.round(v).toLocaleString("cs-CZ") });
  }

  /* ---------- DUOTONE B-rollu (Ben Z15 v barvách Beyond) ----------
   * Jack sjednotí cizí záběry hnědým duotonem. My černá > teplý papír: cizí materiál se stane naším,
   * červená pak svítí jen tam, kde má. SVG filtr, použití: style="filter:url(#bn-duo)"
   */
  function duotone(rodic, o = {}) {
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("width", "0"); svg.setAttribute("height", "0"); svg.style.position = "absolute";
    const t = (a, b) => `${a / 255} ${b / 255}`;
    const [s, l] = [o.tma || [17, 14, 14], o.svetlo || [236, 228, 222]];
    svg.innerHTML = `<filter id="${o.id || "bn-duo"}" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0.3 0.59 0.11 0 0 0.3 0.59 0.11 0 0 0.3 0.59 0.11 0 0 0 0 0 1 0"/>
      <feComponentTransfer><feFuncR type="table" tableValues="${t(s[0], l[0])}"/><feFuncG type="table" tableValues="${t(s[1], l[1])}"/><feFuncB type="table" tableValues="${t(s[2], l[2])}"/></feComponentTransfer></filter>`;
    rodic.appendChild(svg);
  }


  /* ---------- IG PROFIL 1:1 (Android, tmavý režim, podle Timova screenshotu danieldalen) ----------
   * Navrženo v nativních 1080 px šířky, volající škáluje (gsap.set(el, { scale })). Horní lišta se šipkou, zvonkem a menu,
   * avatar s duhovým kroužkem příběhu, jméno, tři čísla, bio, odkaz, modré Sledovat, šedé Zpráva, přidat osobu.
   * Bez "Sledováno uživateli..." a bez Close friends (osobní údaje diváka do videa nepatří).
   * o: { uzivatel, jmeno, avatar (url) nebo avatarCss (CSS pozadí), prispevky, sledujici, sleduje, bio, preklad, odkaz, svetly }
   * vrací { el, sledujici, tlacitko, avatar }
   */
  function igProfil(rodic, o = {}) {
    const el = document.createElement("div");
    el.className = "bn-ig" + (o.svetly ? " svetly" : "");
    const ik = {
      zpet: '<svg viewBox="0 0 64 64"><path d="M54 32H12M28 15L11 32l17 17" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      zvon: '<svg viewBox="0 0 64 64"><path d="M32 8c-10 0-17 7.5-17 18v10l-5 8h44l-5-8V26c0-10.5-7-18-17-18z" fill="none" stroke="currentColor" stroke-width="4.5" stroke-linejoin="round"/><path d="M25 50a7 7 0 0 0 14 0" fill="none" stroke="currentColor" stroke-width="4.5" stroke-linecap="round"/></svg>',
      menu: '<svg viewBox="0 0 64 64"><circle cx="32" cy="13" r="5" fill="currentColor"/><circle cx="32" cy="32" r="5" fill="currentColor"/><circle cx="32" cy="51" r="5" fill="currentColor"/></svg>',
      odkaz: '<svg viewBox="0 0 64 64"><path d="M27 37l10-10M24 29l-7 7a9 9 0 0 0 12.7 12.7l7-7M40 35l7-7A9 9 0 0 0 34.3 15.3l-7 7" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"/></svg>',
      osoba: '<svg viewBox="0 0 64 64"><circle cx="38" cy="22" r="10" fill="none" stroke="currentColor" stroke-width="4.5"/><path d="M20 52c2-10 9-15 18-15s16 5 18 15z" fill="none" stroke="currentColor" stroke-width="4.5" stroke-linejoin="round"/><path d="M8 26h14M15 19v14" stroke="currentColor" stroke-width="4.5" stroke-linecap="round"/></svg>',
    };
    const av = o.avatar ? `<img src="${o.avatar}" alt="">` : `<div class="bn-ig-avfill" style="background:${o.avatarCss || "radial-gradient(circle at 50% 50%, #FF9A2E 0%, #F86A12 42%, #EE4F0B 78%, #F06A1A 100%)"}"></div>`;
    el.innerHTML = `
      <div class="bn-ig-lista"><span class="bn-ig-ik zpet">${ik.zpet}</span><span class="bn-ig-user">${o.uzivatel || ""}</span><span class="bn-ig-ik zvon">${ik.zvon}</span><span class="bn-ig-ik menu">${ik.menu}</span></div>
      <div class="bn-ig-hlava"><div class="bn-ig-kruh"><div class="bn-ig-mezera"><div class="bn-ig-av">${av}</div></div></div>
        <div class="bn-ig-prava"><div class="bn-ig-jmeno">${o.jmeno || ""}</div>
          <div class="bn-ig-cisla"><div><b>${o.prispevky || "0"}</b><span>příspěvky</span></div><div><b class="bn-ig-sled">${o.sledujici || "0"}</b><span>sledující</span></div><div><b>${o.sleduje || "0"}</b><span>sleduji</span></div></div></div></div>
      <div class="bn-ig-bio">${o.bio || ""}</div>
      ${o.preklad ? '<div class="bn-ig-preklad">Zobrazit překlad</div>' : ""}
      ${o.odkaz ? `<div class="bn-ig-odkaz"><span class="bn-ig-ik">${ik.odkaz}</span>${o.odkaz}</div>` : ""}
      <div class="bn-ig-tlacitka"><div class="bn-ig-btn modre">Sledovat</div><div class="bn-ig-btn">Zpráva</div><div class="bn-ig-btn ctverec"><span class="bn-ig-ik">${ik.osoba}</span></div></div>`;
    rodic.appendChild(el);
    return { el, sledujici: el.querySelector(".bn-ig-sled"), tlacitko: el.querySelector(".bn-ig-btn.modre"), avatar: el.querySelector(".bn-ig-kruh") };
  }

  /* ---------- LCD obal: UI jako natočený displej (z hyperframes/lcd-text) ----------
   * Na kontejner s UI (IG profil, YouTube, prohlížeč) přidá: posun kanálů do stran (subpixely), mřížku pixelů,
   * hloubku ostrosti k okrajům, šednutí rohů a zrno. o: { roztec (px mřížky, 0 = bez), rozmazani (px), polomer (% ostrého středu), sila (0 až 1) }
   * Kontejner musí mít position absolute nebo relative a overflow hidden. Vrací { mrizka, ostrost, nastav(o) }
   */
  let lcdFiltr = false;
  // o.posun: vlastní posun kanálů v px (výchozí filtr 1,6 px dělá drobné písmo tučné), vytvoří samostatný filtr
  function lcdFiltrPosun(p) {
    const id = "bn-lcd-" + String(p).replace(".", "_");
    if (document.getElementById(id)) return id;
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "0"); svg.setAttribute("height", "0"); svg.style.position = "absolute";
    svg.innerHTML = `<filter id="${id}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
      <feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r"/><feOffset in="r" dx="${-p}" result="r2"/>
      <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="g"/>
      <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="b"/><feOffset in="b" dx="${p}" result="b2"/>
      <feComposite in="r2" in2="g" operator="arithmetic" k2="1" k3="1" result="rg"/><feComposite in="rg" in2="b2" operator="arithmetic" k2="1" k3="1"/></filter>`;
    document.body.appendChild(svg);
    return id;
  }
  function lcd(kont, o = {}) {
    if (!lcdFiltr) {
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("width", "0"); svg.setAttribute("height", "0"); svg.style.position = "absolute";
      svg.innerHTML = `<filter id="bn-lcd" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
        <feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r"/><feOffset in="r" dx="-1.6" result="r2"/>
        <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="g"/>
        <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="b"/><feOffset in="b" dx="1.6" result="b2"/>
        <feComposite in="r2" in2="g" operator="arithmetic" k2="1" k3="1" result="rg"/><feComposite in="rg" in2="b2" operator="arithmetic" k2="1" k3="1" result="rgb"/>
        <feGaussianBlur in="rgb" stdDeviation="0.6"/></filter>`;
      document.body.appendChild(svg); lcdFiltr = true;
    }
    const obsah = document.createElement("div"); obsah.className = "bn-lcd-obsah";
    while (kont.firstChild) obsah.appendChild(kont.firstChild);
    kont.appendChild(obsah); kont.classList.add("bn-lcd");
    if (o.bezFiltru) obsah.style.filter = "none"; // jen mřížka a vinětace, bez posunu kanálů (natočené karty pak nemají zubaté hrany)
    if (o.posun != null) { obsah.style.filter = `url(#${lcdFiltrPosun(o.posun)})`; obsah.style.inset = "0"; }
    const mrizka = document.createElement("div"); mrizka.className = "bn-lcd-mrizka";
    const ostrost = document.createElement("div"); ostrost.className = "bn-lcd-ostrost";
    const svetlo = document.createElement("div"); svetlo.className = "bn-lcd-svetlo";
    kont.append(mrizka, ostrost, svetlo);
    const nastav = (p) => {
      if (p.roztec != null) { mrizka.style.backgroundSize = `${p.roztec}px ${p.roztec}px`; mrizka.style.display = p.roztec ? "block" : "none"; }
      if (p.rozmazani != null) kont.style.setProperty("--lcd-rozmazani", p.rozmazani + "px");
      if (p.polomer != null) kont.style.setProperty("--lcd-polomer", p.polomer + "%");
      if (p.sila != null) { svetlo.style.opacity = p.sila; mrizka.style.opacity = p.sila; }
    };
    nastav({ roztec: 4, rozmazani: 6, polomer: 38, sila: 1, ...o });
    return { obsah, mrizka, ostrost, nastav };
  }


  /* ---------- YOUTUBE KARTA 1:1 (watch page, tmavý režim, podle Shelby A18 f1569 až f1660) ----------
   * Nativně 1550 px široká jako skutečný YouTube na desktopu (titulek 17 px, kanál 13 px, popis 11 px), kamera ji zvětšuje
   * transformem, takže písmo zůstává ostré i na 3,25x. Pod videem řada ikon, titulek, kanál s bílým Subscribe,
   * vpravo like, Share, Ask, Save, dole šedý box popisu (zhlédnutí, stáří, text, odkazy modře #3EA6FF).
   * o: { video (statický <video> z HTML) nebo obrazek, titulek, kanal, avatar, odberatele, meta, popis (HTML), bezPopisu, cz (české popisky), sirka }
   * vrací { el, prehravac, titulek, popis, vyska }
   */
  function ytKarta(rodic, o = {}) {
    const cz = !!o.cz, W = o.sirka || 1550, vV = o.vyskaVidea || Math.round(W * 0.57);
    const k = document.createElement("div"); k.className = "bn-ytk"; k.style.width = W + "px";
    const ik = (d, v = "0 0 24 24") => `<svg viewBox="${v}"><path d="${d}" fill="currentColor"/></svg>`;
    const I = {
      kamera: ik("M3 6h12a1 1 0 0 1 1 1v3l5-3v10l-5-3v3a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z"),
      nota: ik("M9 4l11-2v13.5a3 3 0 1 1-2-2.8V6.3L11 7.6v10a3 3 0 1 1-2-2.8z"),
      obraz: ik("M3 4h18v16H3zM5 6v10l4-4 3 3 3-4 4 5V6zm3 1.5a1.8 1.8 0 1 1 0 3.6 1.8 1.8 0 0 1 0-3.6z"),
      cc: ik("M2 5h20v14H2zm2 2v10h16V7zm2.5 2.5h4v1.6h-2.4v1.8h2.4v1.6h-4zm7 0h4v1.6h-2.4v1.8h2.4v1.6h-4z"),
      foto: ik("M8 4h8l1.5 2H21v14H3V6h3.5zm4 4a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9zm0 2a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5z"),
      palec: ik("M2 10h4v11H2zm6 11V10l5-8c1.5 0 2.5 1 2.2 2.6L14.5 9H21c1 0 1.8 1 1.6 2l-1.8 8c-.2 1.2-1.2 2-2.4 2z"),
      dolu: ik("M22 14h-4V3h4zm-6-11v11l-5 8c-1.5 0-2.5-1-2.2-2.6L9.5 15H3c-1 0-1.8-1-1.6-2l1.8-8C3.4 3.8 4.4 3 5.6 3z"),
      sdilet: ik("M14 5l8 7-8 7v-4c-6 0-9 2-12 6 1-6 4-11 12-12z"),
      ulozit: ik("M6 2h12v20l-6-4-6 4zm2 2v14l4-2.7 4 2.7V4z"),
    };
    const T = cz ? { sub: "Odebírat", sdilet: "Sdílet", zeptat: "Zeptat se", ulozit: "Uložit" } : { sub: "Subscribe", sdilet: "Share", zeptat: "Ask", ulozit: "Save" };
    k.innerHTML = `<div class="bn-ytk-video" style="height:${vV}px"></div>
      <div class="bn-ytk-ikony">${[I.kamera, I.nota, I.obraz, I.cc, I.foto].map((x) => `<span>${x}</span>`).join("")}</div>
      <div class="bn-ytk-titulek"><span class="bn-ytk-tt">${o.titulek || ""}</span></div>
      <div class="bn-ytk-radek"><span class="bn-ytk-av"><img src="${o.avatar || ""}" alt=""></span><span class="bn-ytk-kanal"><b>${o.kanal || ""}</b><i>${o.odberatele || ""}</i></span><span class="bn-ytk-sub">${T.sub}</span>
        <span class="bn-ytk-akce"><span class="bn-ytk-pil dvoj"><span>${I.palec}${o.likes || "3,4 tis."}</span><span>${I.dolu}</span></span><span class="bn-ytk-pil">${I.sdilet}${T.sdilet}</span><span class="bn-ytk-pil">✦ ${T.zeptat}</span><span class="bn-ytk-pil">${I.ulozit}${T.ulozit}</span><span class="bn-ytk-pil kul">···</span></span></div>
      ${o.bezPopisu ? "" : `<div class="bn-ytk-popis"><b class="bn-ytk-meta">${o.meta || ""}</b><div class="bn-ytk-text">${o.popis || ""}</div></div>`}`;
    rodic.appendChild(k);
    const prehravac = k.querySelector(".bn-ytk-video");
    if (o.video) prehravac.appendChild(o.video); else if (o.obrazek) prehravac.innerHTML = `<img src="${o.obrazek}" alt="">`;
    return { el: k, prehravac, titulek: k.querySelector(".bn-ytk-tt"), popis: k.querySelector(".bn-ytk-text"), meta: k.querySelector(".bn-ytk-meta"), vyskaVidea: vV };
  }

  /* realistické psaní do pole: znaky přibývají v nepravidelném rytmu (jako člověk), u mezer a čárek delší pauza,
   * kurzor svítí během psaní a po dopsání bliká po 0,53 s. Text jde přes textContent, takže zalomení dělá prohlížeč.
   * o: { zps (znaků za sekundu, 14 = rychlý písař), seed, kurzor (true), konecKurzoru (čas, kdy kurzor zmizí), zachovat (počáteční text) }
   * vrací čas dopsání */
  function pisRealne(tl, el, t, text, o = {}) {
    const r = MK.rng(o.seed || 7), zps = o.zps || 14, zac = o.zachovat || "";
    let kur = null;
    const tx = document.createElement("span"); tx.textContent = zac; el.textContent = ""; el.appendChild(tx);
    if (o.kurzor !== false) { kur = document.createElement("span"); kur.className = "bn-kurzor"; el.appendChild(kur); tl.set(kur, { opacity: 0 }, 0); tl.set(kur, { opacity: 1 }, t - 0.2); }
    tl.set(tx, { textContent: zac }, 0);
    let c = t;
    for (let i = 1; i <= text.length; i++) {
      const z = text[i - 1];
      c += (1 / zps) * (0.55 + r() * 0.9) * (z === " " ? 1.35 : /[,.]/.test(z) ? 2.4 : 1);
      tl.set(tx, { textContent: zac + text.slice(0, i) }, c);
    }
    if (kur) {
      const konec = o.konecKurzoru || c + 2.2;
      for (let b = c + 0.45, on = false; b < konec; b += 0.53, on = !on) tl.set(kur, { opacity: on ? 1 : 0 }, b);
      tl.set(kur, { opacity: 0 }, konec);
    }
    return c;
  }
  /* výběr textu jako v prohlížeči (modrá výplň za vybranou částí), roste po znacích zleva doprava */
  function vyber(tl, el, t, o = {}) {
    // modrý výběr textu jako v editoru: pozadí slova se roztáhne zleva (dřív span se z-index -1, ten mizel pod papírem)
    el.classList.add("bn-vyber");
    tl.fromTo(el, { backgroundSize: "0% 100%" }, { backgroundSize: "100% 100%", duration: o.delka || 0.45, ease: "power1.inOut", immediateRender: false }, t);
    gsap.set(el, { backgroundSize: "0% 100%" });
    return el;
  }


  /* ---------- IG PROFIL DESKTOP (Shelby A5, Georgios Z19 a Z31: tmavý web Instagram, počítadlo followerů, zoom a radiální blur) ----------
   * Rozložení změřené na 1920 x 1080: kroužek avataru 320 px se středem 500/447, jméno 43 px od x 707, čísla 28 px na y 383,
   * odkazy fialové, tlačítka Follow (modré) a Message pod tím. Radiální blur se středem na čísle a záři dělá postfx.
   * o: { uzivatel, jmeno, avatar, prispevky, sledujici, sleduje, radky (pole HTML řádků bia), odkaz, tlacitka, dx, dy (posun celku) }
   * vrací { el, sledujici }
   */
  function igDesktop(rodic, o = {}) {
    const el = document.createElement("div"); el.className = "bn-igd";
    const dx = o.dx || 0, dy = o.dy || 0;
    el.innerHTML = `<div class="bn-igd-kruh" style="left:${340 + dx}px; top:${287 + dy}px"><div><img src="${o.avatar || ""}" alt=""></div></div>
      <div class="bn-igd-jm" style="left:${707 + dx}px; top:${240 + dy}px">${o.uzivatel || ""}<span class="bn-igd-ov"></span><span class="bn-igd-tri">···</span></div>
      <div class="bn-igd-real" style="left:${707 + dx}px; top:${306 + dy}px">${o.jmeno || ""}</div>
      <div class="bn-igd-cisla" style="left:${707 + dx}px; top:${366 + dy}px"><span><b>${o.prispevky || ""}</b> posts</span><span><b class="bn-igd-sl">${o.sledujici || "0"}</b> followers</span><span><b>${o.sleduje || ""}</b> following</span></div>
      <div class="bn-igd-bio" style="left:${707 + dx}px; top:${438 + dy}px">${(o.radky || []).join("<br>")}${o.odkaz ? `<div class="bn-igd-odkaz">&#128279;&#xFE0E; ${o.odkaz}</div>` : ""}</div>
      ${o.tlacitka === false ? "" : `<div class="bn-igd-btn" style="left:${353 + dx}px; top:${739 + dy}px"><span class="modre">Follow</span><span>Message</span><span class="mal">+</span></div>`}`;
    rodic.appendChild(el);
    return { el, sledujici: el.querySelector(".bn-igd-sl") };
  }



  /* ---------- KOMPONENTY Z REELU DALEN (4. 10. 2026, Tim schválil ve v15) ----------
   * vzor celé kompozice: reels/podnikatele/dalen/src/telo.html */

  /* iMessage bubliny dokola kolem osoby: modrá, bílý text na jeden řádek, náhodný úhel a vzdálenost na elipse,
   * bez překryvu s ostatními ani s obdélníkem postavy, všechny skoro najednou s malými prodlevami, nástup 4 snímky na dvojky.
   * o: { t (čas první), snimky (pole prodlev ve snímcích), stred [x, y], rx, ry, zakaz [x0, y0, x1, y1], okraj [x0, y0, x1, y1], seed }
   * vrací pole prvků (časy pro SFX jsou t + snimky[i] / 30, zvuk: hluboká kapka) */
  function imBubliny(tl, rodic, zpravy, o = {}) {
    const F = (n) => n / 30, st = o.stred || [960, 760], rx = o.rx || 900, ry = o.ry || 640, zakaz = o.zakaz || [640, 330, 1280, 1440];
    const ok = o.okraj || [24, 190, 1896, 1290], sn = o.snimky || zpravy.map((_, i) => Math.round(i * 1.4)), r = MK.rng(o.seed || 19), polohy = [];
    const prekryv = (A, B, m) => A[0] < B[2] + m && A[2] + m > B[0] && A[1] < B[3] + m && A[3] + m > B[1];
    return zpravy.map((z, i) => {
      const w = z.length * 24 + 70, h = 98; let box = null;
      for (let p = 0; p < 4000 && !box; p++) {
        const u = r() * Math.PI * 2, k = 0.55 + r() * 0.5, cx = st[0] + Math.cos(u) * rx * k, cy = st[1] + Math.sin(u) * ry * k;
        const B = [cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2];
        if (B[0] < ok[0] || B[2] > ok[2] || B[1] < ok[1] || B[3] > ok[3]) continue;
        if (prekryv(B, zakaz, -40) || polohy.some((P) => prekryv(B, P, 26))) continue;
        box = B;
      }
      if (!box) box = [ok[0], ok[1] + i * 110, ok[0] + w, ok[1] + i * 110 + h];
      polohy.push(box);
      const e = MK.div(rodic, "bn-imb" + (box[0] + w / 2 < st[0] ? " l" : ""), z);
      e.style.left = Math.round(box[0]) + "px"; e.style.top = Math.round(box[1]) + "px";
      const t = o.t + F(sn[i]);
      tl.set(e, { visibility: "visible" }, t); MK.tw(tl, e, { scale: 0.6, opacity: 0.5 }, { scale: 1, opacity: 1 }, t, 4, { k: 0.5, krok: 2 });
      return e;
    });
  }

  /* IG profil s mřížkou reels (skutečné obálky a zhlédnutí), bílý panel, avatar s duhovým kroužkem.
   * o: { avatar, uzivatel, prispevky, sledujici, reels: [{ soubor, zhlednuti }], left, top, sirka }
   * vrací { el, dlazdice }; dlaždice skryté, nástup si řeší kompozice (vis + MK.tw scale 0.8 > 1 za 4 snímky na dvojky) */
  function igMrizka(rodic, o = {}) {
    const el = document.createElement("div"); el.className = "bn-igm";
    el.style.cssText = `left:${o.left ?? 900}px;top:${o.top ?? 190}px;width:${o.sirka || 900}px;`;
    el.innerHTML = `<div class="bn-igm-h"><img src="${o.avatar || ""}" alt=""><div><b>${o.uzivatel || ""}</b><span><i>${o.prispevky || ""}</i> příspěvků&nbsp;&nbsp;<i>${o.sledujici || ""}</i> sledujících</span></div></div><div class="bn-igm-g"></div>`;
    rodic.appendChild(el);
    const g = el.querySelector(".bn-igm-g");
    const dlazdice = (o.reels || []).map((r) => { const d = document.createElement("div"); d.className = "bn-igm-t"; d.innerHTML = `<img src="${r.soubor}" alt=""><span>&#9655; ${r.zhlednuti}</span>`; g.appendChild(d); return d; });
    return { el, dlazdice };
  }

  /* Titulky ze zarovnaných slov jako Vince Nijhof / Noske: po 1 až 3 slovech (max 20 znaků), zlom na interpunkci a na střihu scény,
   * nástup snímek před slovem, ale nikdy před střihem; konec na dalším titulku, na střihu, před klipem nebo konec slova + 0,3 s.
   * Barvu (tmavé na papíře) ať určí kompozice podle scény v čase t + 2 snímky. Ruční výběr frází vynechával slova (Tim).
   * o: { bez: [[i0, i1]], strihy: [časy], klipy: [časy začátků cizích klipů], konec, vlastni: RegExp, zlom: [indexy slov, kde začít nový titulek] }
   * vrací pole { text, t0, t1, a, b } */
  function titulkyZeSlov(slova, o = {}) {
    const F = (n) => n / 30, T = (i) => slova[i].t, bez = o.bez || [], strihy = o.strihy || [], klipy = o.klipy || [], zlom = o.zlom || [];
    const KONEC = o.konec ?? slova[slova.length - 1].e + 0.5, vlastni = o.vlastni || /^$/;
    const vyn = (i) => bez.some(([a, b]) => i >= a && i <= b), kousky = []; let kus = [];
    slova.forEach((w, i) => {
      if (vyn(i)) { if (kus.length) kousky.push(kus); kus = []; return; }
      if (kus.length && (zlom.includes(i) || strihy.some((x) => x > T(i - 1) + 0.05 && x <= T(i) + 0.05))) { kousky.push(kus); kus = []; }
      const delka = kus.map((j) => slova[j].w).join(" ").length + w.w.length;
      if (kus.length && (kus.length >= 3 || delka > 20)) { kousky.push(kus); kus = []; }
      kus.push(i);
      if (/[.,?!]$/.test(w.w)) { kousky.push(kus); kus = []; }
    });
    if (kus.length) kousky.push(kus);
    return kousky.map((k, n) => {
      const a = k[0], b = k[k.length - 1];
      let t0 = T(a) - F(1); const stz = strihy.find((x) => x > t0 && x <= t0 + F(3)); if (stz != null) t0 = stz;
      const dal = b + 1 < slova.length ? T(b + 1) : KONEC;
      const spoj = kousky[n + 1] && kousky[n + 1][0] === b + 1 && dal - slova[b].e < 0.6;
      let t1 = spoj ? dal - F(1) : Math.min(slova[b].e + 0.3, dal - F(1));
      const kl = klipy.find((x) => x > t0 && x < dal); if (kl != null) t1 = Math.min(t1, kl);
      const sx = strihy.filter((x) => x > t0 + F(3) && x < t1).sort((p, q) => p - q)[0]; if (sx != null) t1 = sx;
      let text = k.map((i) => slova[i].w.replace(/[.,!?]/g, "")).join(" ");
      if (!vlastni.test(text)) text = text.charAt(0).toLowerCase() + text.slice(1);
      return { text, t0, t1, a, b };
    });
  }

  /* Text za postavou: velký nápis pod vrstvou masek (RGBA webp po snímcích z MatAnyone2), každý snímek se zapne na 1/30 s.
   * Masky vyrobit: první snímek birefnet (fal) > maska, MatAnyone2 přes celý záběr, alfa zvětšit na plné rozlišení.
   * Nápis skrýt, jakmile masky dojdou, jinak přeskočí přes lidi (Tim). vrací čas konce masek */
  function maskaZaPostavou(tl, prefix, t0, pocet, konecScény) {
    let kon = t0;
    for (let k = 0; k < pocet; k++) { const t = t0 + k / 30; if (t >= konecScény) break; const e = document.getElementById(prefix + k); tl.set(e, { visibility: "visible" }, t); tl.set(e, { visibility: "hidden" }, Math.min(konecScény, t + 1 / 30)); kon = Math.min(konecScény, t + 1 / 30); }
    return kon;
  }

  window.BN = { tydenniPas, tydenniPasNastup, popisVidea, popisPsani, mapaTecek, mapaNastup, vahy, vahyNastup, lavina, lavinaNastup, duotone, igProfil, lcd, ytKarta, pisRealne, vyber, igDesktop, imBubliny, igMrizka, titulkyZeSlov, maskaZaPostavou };
})();
