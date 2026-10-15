/* Mason kit (MK): grafický jazyk Jacka Masona jako znovupoužitelné komponenty
 *
 * Postaveno z měření po snímcích v ~/Documents/inspirace-reels/_rozbor/<id>/ZARIZENI.md.
 * Výchozí hodnoty každé komponenty = změřený originál (u každé je odkaz na zařízení a snímky),
 * takže replika 1:1 je volání bez parametrů a Beyond verze jen mění téma (CSS proměnné) a obsah.
 *
 * Jednotky: časy v sekundách, délky ve SNÍMCÍCH (30 fps), rozměry v px kompozice nebo jako
 * podíl výšky H (MK.h(0.2) = 20 % výšky), aby šlo totéž použít na 16:9 i 9:16.
 * Seek safe: jen tweeny a tl.set na jedné pozastavené timeline, žádný Math.random ani rAF.
 *
 * Systém v jedné větě (Ben C5, Fred C4, Georgios C6): jedna křivka, exponenciální doběh
 * (každý snímek zbývá k ze zbývající vzdálenosti, k 0,65 až 0,85), mění se jen délka a k.
 * Před střihem krátký ease in (odjezd). Nikdy lineárně, přestřel jen u popu UI objektů.
 */
(function () {
  // snímková frekvence kompozice (repliky Georgiose běží na 23,976), délky ve snímcích se přepočítají
  let FPS = 30;
  const F = (n) => n / FPS;
  let W = 1080, H = 1920;

  function init(root) {
    W = root.offsetWidth || +root.dataset.width || W;
    H = root.offsetHeight || +root.dataset.height || H;
    if (root.dataset.fps) FPS = root.dataset.fps == 24 ? 24000 / 1001 : +root.dataset.fps;
    MK.W = W; MK.H = H; MK.FPS = FPS;
  }
  const h = (x) => x * H; // podíl výšky na px
  const w = (x) => x * W;

  /* ---------- KŘIVKY ---------- */

  // exponenciální doběh: po f snímcích zbývá k^f vzdálenosti, normováno na n snímků
  function expOut(k, n) {
    const kn = Math.pow(k, n);
    return (p) => (p >= 1 ? 1 : (1 - Math.pow(k, p * n)) / (1 - kn));
  }
  // zrcadlo: odjezd před střihem (pád, zmenšení), zrychluje
  function expIn(k, n) {
    const o = expOut(k, n);
    return (p) => 1 - o(1 - p);
  }
  // nízký framerate: křivka se obnoví jen každý krok-tý snímek (2 = 15 fps, 3 = 10 fps)
  function kroky(ease, n, krok) {
    if (!krok || krok <= 1) return ease;
    return (p) => (p >= 1 ? 1 : ease(Math.floor((p * n) / krok) * krok / n));
  }
  /* Změřené křivky z motionmaxxing (Tejas Makwana, Apache 2.0, viz jadro/NOTICE): 12 tvarů nafitovaných
   * na 53 profesionálních filmech snímek po snímku. Název jde dát do o.ease kteréhokoli tw (i komponent), délka
   * se pak bere z DELKY, když n chybí. Kdy co: nástup textu a panelů softLand 12, hlavní nástup snapSettle 11,
   * odjezd do střihu accelExit 13 (končí v plné rychlosti), švih whip 7 až 8, drift a počítadla cruise,
   * průhlednost a rozostření softInOut, jemný přestřel popOver nejvýš jednou za scénu. */
  const powerOut = (p) => (t) => 1 - Math.pow(1 - t, p), powerIn = (p) => (t) => Math.pow(t, p);
  const expoOut = (k) => { const d = 1 - Math.exp(-k); return (t) => (1 - Math.exp(-k * t)) / d; };
  const snapRamp = (wt, tau) => { const n = wt * (1 - Math.exp(-1 / tau)) + (1 - wt); return (t) => (wt * (1 - Math.exp(-t / tau)) + (1 - wt) * t) / n; };
  const snapOver = (A, ta, td) => { const f = (t) => (1 + A * Math.exp(-t / td)) * (1 - Math.exp(-t / ta)); const n = f(1); return (t) => f(t) / n; };
  const pruzina = (c, om) => { const f = (t) => 1 - Math.exp(-c * t) * (Math.cos(om * t) + (c / om) * Math.sin(om * t)); const n = f(1); return (t) => f(t) / n; };
  const smoothP = (p) => (t) => { const a = Math.pow(t, p), b = Math.pow(1 - t, p); return a / (a + b); };
  const hlid = (f) => (t) => (t <= 0 ? 0 : t >= 1 ? 1 : f(t));
  const KRIVKY = {
    crashIn: hlid(snapOver(2.0, 0.19, 0.218)), popOver: hlid(pruzina(2.67, 4.36)), bounceHard: hlid(pruzina(1.34, 5.07)),
    snapSettle: hlid(snapRamp(0.942, 0.118)), softLand: hlid(expoOut(3.41)), whip: hlid(powerOut(2.52)), glide: hlid(powerOut(1.7)),
    cruise: hlid((t) => t), softInOut: hlid(smoothP(1.42)), gentleIn: hlid(powerIn(2.07)), accelExit: hlid(powerIn(2.6)), crashOut: hlid(powerIn(3.97)),
  };
  const DELKY = { crashIn: 10, popOver: 15, bounceHard: 22, snapSettle: 11, softLand: 12, whip: 7, glide: 10, cruise: 9, softInOut: 9, gentleIn: 9, accelExit: 13, crashOut: 17 };
  const krivka = (e) => (typeof e === "string" ? KRIVKY[e] || gsap.parseEase(e) : e);

  // jeden tween ve snímcích: výchozí exp doběh (k), nebo pojmenovaná křivka o.ease ("softLand", "accelExit"...)
  function tw(tl, el, z, kam, t, n, o = {}) {
    if (n == null) n = DELKY[o.ease] || 12;
    const base = o.ease ? krivka(o.ease) : o.vjezd ? expIn(o.k || 0.8, n) : expOut(o.k || 0.8, n);
    tl.fromTo(el, z, { ...kam, duration: F(n), ease: kroky(base, n, o.krok), immediateRender: false }, t);
  }

  /* ---------- PLYNULÉ NÁSTUPY A ODJEZDY (pravidla motionmaxxing: motion.md R1.4 až R1.8, R3.1 až R3.6) ----------
   * Nástup se pohybuje, průhlednost je jen pomocník 4 až 6 sn. (0,2 > 1). Nic nevyrůstá z nuly: velké věci
   * přijedou zmenšením z 1,25x, ostatní posunem 3 až 7 % výšky. Odjezd zrychluje a končí v plné rychlosti na střihu.
   * z: "dole" | "nahore" | "vlevo" | "vpravo" | "velky", posun v px (výchozí 5 % výšky), n snímků, ease. */
  const SMER = { dole: ["y", 1], nahore: ["y", -1], vlevo: ["x", -1], vpravo: ["x", 1] };
  function prijezd(tl, el, t, o = {}) {
    const ease = o.ease || (o.z === "velky" ? "snapSettle" : "softLand"), n = o.n || DELKY[ease];
    ukaz(tl, el, t);
    if (o.z === "velky") tw(tl, el, { scale: o.od || 1.25 }, { scale: 1 }, t, n, { ease });
    else { const [osa, zn] = SMER[o.z || "dole"]; tw(tl, el, { [osa]: zn * (o.posun || h(0.05)) }, { [osa]: 0 }, t, n, { ease }); }
    if (o.pruhlednost !== false) tw(tl, el, { opacity: 0.2 }, { opacity: 1 }, t, o.fade || 5, { ease: "cruise" });
  }
  function odjezd(tl, el, t, o = {}) {
    const ease = o.ease || "accelExit", n = o.n || DELKY[ease];
    if (o.z === "male") tw(tl, el, { scale: 1 }, { scale: o.na || 0.6 }, t, n, { ease });
    else { const [osa, zn] = SMER[o.z || "vlevo"]; tw(tl, el, { [osa]: 0 }, { [osa]: zn * (o.posun || (osa === "x" ? w(1.1) : h(1.1))) }, t, n, { ease }); }
    skryj(tl, el, t + F(n));
  }
  // švih mezi scénami bez záblesku a bez rozmazání: stará odjede (accelExit), nová přijede ve stejném směru (whip), střih v plné rychlosti
  function svih(tl, stara, nova, t, o = {}) {
    const [osa, zn] = SMER[o.smer || "vlevo"], d = osa === "x" ? W : H, nOut = o.nOdjezd || 6, nIn = o.nPrijezd || 8;
    tw(tl, stara, { [osa]: 0 }, { [osa]: zn * d * 0.6 }, t - F(nOut), nOut, { ease: "accelExit" });
    skryj(tl, stara, t); ukaz(tl, nova, t);
    tw(tl, nova, { [osa]: -zn * d * 0.4 }, { [osa]: 0 }, t, nIn, { ease: "whip" });
  }
  // kamera: skok v jednom snímku (poměr 0,56 až 0,77) a dojezd softLand 9 až 18 sn. (R6.3), např. odhalení nebo přerámování
  function kameraSkok(tl, el, t, o = {}) {
    const od = o.od || 1.45, kam = o.kam || 1, po = kam + (od - kam) * (o.zbytek || 0.12), n = o.n || 15;
    nastav(tl, el, { scale: od }, Math.max(0, t - F(1)));
    nastav(tl, el, { scale: po }, t);
    tw(tl, el, { scale: po }, { scale: kam }, t, n, { ease: "softLand" });
  }
  // přesná tabulka z měření: hodnota v každém snímku (pro repliky 1:1)
  function tabulka(tl, el, t0, vlastnost, hodnoty, jednotka = "") {
    hodnoty.forEach((v, i) => v != null && tl.set(el, { [vlastnost]: jednotka ? v + jednotka : v }, t0 + F(i)));
  }

  // pomalý pohyb po nástupu, aby obraz nikdy nestál (rozbor: 1 až 4 px za snímek, Dda: každá vrstva driftuje)
  function drift(tl, el, t, sekund, o = {}) {
    if (sekund <= 0) return;
    const n = Math.round(sekund * FPS);
    tl.to(el, { x: o.x || 0, y: o.y == null ? -12 : o.y, scale: o.scale || 1.03, rotation: o.rotation, duration: sekund, ease: kroky(gsap.parseEase("none"), n, o.krok || 1) }, t);
  }
  // tl.set na čase 0 se při seeku na první snímek nevykreslí, proto se nula zapíše i rovnou do DOM (výchozí stav)
  function nastav(tl, el, v, t) { if (t <= 1e-6) gsap.set(el, v); tl.set(el, v, Math.max(0, t)); }
  function ukaz(tl, el, t) { nastav(tl, el, { visibility: "visible" }, t); }
  function skryj(tl, el, t) { nastav(tl, el, { visibility: "hidden" }, t); }
  // celá skupina pryč tvrdým střihem (děti mají visibility visible na sobě, proto display)
  function strih(tl, el, t) { tl.set(el, { display: "none" }, t); }

  function div(rodic, trida, html) {
    const d = document.createElement("div");
    if (trida) d.className = trida;
    if (html != null) d.innerHTML = html;
    rodic.appendChild(d);
    return d;
  }
  function stred(el, x, y) {
    gsap.set(el, { left: x, top: y, xPercent: -50, yPercent: -50 });
  }

  /* ---------- R1 KARTA S ÚCHYTY A MONTÁŽÍ (Ben Z1 f1 až f45) ----------
   * Fotka jako objekt v editoru: ostré rohy, bez stínu, 4 čtverce akcentu v rozích (výběrový rámeček).
   * Hook: karta se plynule zmenšuje (exp doběh k 0,81, pak ease in posledních 8 sn.), střed stojí,
   * fotky se mění tvrdě na trojky (hodně = montáž), úchyty za 25 sn. ztmavnou do akcentu.
   */
  function karta(rodic, o = {}) {
    const el = div(rodic, "mk-karta");
    const sirka = o.w || h(0.672), vyska = o.h || sirka / (o.pomer || 0.93);
    gsap.set(el, { width: sirka, height: vyska, rotation: o.rot == null ? 4 : o.rot, visibility: "hidden" });
    stred(el, o.x == null ? W / 2 : o.x, o.y == null ? h(0.475) : o.y);
    const obsah = div(el, "mk-karta-obsah");
    const snimky = (o.obsah || []).map((src, i) => {
      const s = document.createElement(/\.(mp4|webm|mov)$/i.test(src) ? "video" : "img");
      s.src = src; s.className = "mk-karta-snimek"; if (s.tagName === "VIDEO") { s.muted = true; s.playsInline = true; }
      if (i) s.style.visibility = "hidden";
      obsah.appendChild(s);
      return s;
    });
    const uchyty = [];
    if (o.uchyty !== false) {
      const pad = o.pad || 1; // one post karta: rám 1,227x větší než fotka
      const ram = div(el, "mk-karta-ram");
      gsap.set(ram, { width: sirka * pad, height: vyska * pad, left: (sirka - sirka * pad) / 2, top: (vyska - vyska * pad) / 2 });
      ["lh", "ph", "ld", "pd"].forEach((r) => uchyty.push(div(ram, "mk-uchyt " + r)));
      const vel = o.uchyt || h(0.022);
      gsap.set(uchyty, { width: vel, height: vel, marginLeft: -vel / 2, marginTop: -vel / 2 });
    }
    return { el, obsah, snimky, uchyty, w: sirka, h: vyska };
  }
  // montáž: tvrdé střihy obsahu v daných snímcích od t0 (Ben hook: 3, 6, 9, 12, 15, 18)
  function montaz(tl, k, t0, snimkyStrihu) {
    snimkyStrihu.forEach((sn, i) => {
      const t = t0 + F(sn);
      tl.set(k.snimky[i], { visibility: "hidden" }, t);
      if (k.snimky[i + 1]) tl.set(k.snimky[i + 1], { visibility: "visible" }, t);
    });
  }
  // hook zoom: měřítko z `od` do 1 exp doběhem za n snímků, pak ease in zmenšení `konec` za m snímků
  // změřená šířka hook karty po snímcích (Ben f1 až f45, poměr k f37 = 681 px), lineárně dopočtené mezery
  const ZOOM_HOOK = (() => {
    const b = { 1: 1132, 2: 1017, 3: 946, 4: 903, 5: 871, 8: 811, 10: 788, 13: 758, 16: 739, 19: 724, 25: 704, 31: 693, 37: 681, 40: 671, 43: 654, 44: 646, 45: 635 };
    const ks = Object.keys(b).map(Number), out = [];
    for (let f = 1; f <= 45; f++) {
      const a = ks.filter((x) => x <= f).pop(), c = ks.find((x) => x >= f);
      out.push((a === c ? b[a] : b[a] + ((b[c] - b[a]) * (f - a)) / (c - a)) / 681);
    }
    return out;
  })();
  function kartaZoom(tl, k, t0, o = {}) {
    const n = o.n || 37, m = o.m || 8;
    ukaz(tl, k.el, t0);
    if (o.tabulka) {
      const cil = o.tabulka === true ? ZOOM_HOOK : o.tabulka;
      tabulka(tl, o.skupina || k.el, t0, "scale", cil);
      if (k.uchyty.length) tw(tl, k.uchyty, { opacity: 0.55 }, { opacity: 1 }, t0, 25, { k: 0.88 });
      return;
    }
    tw(tl, k.el, { scale: o.od || 1.63 }, { scale: 1 }, t0, n, { k: o.k || 0.81 });
    if (o.konec) tw(tl, k.el, { scale: 1 }, { scale: o.konec }, t0 + F(n), m, { vjezd: true, k: 0.8 });
    if (k.uchyty.length) tw(tl, k.uchyty, { opacity: 0.55 }, { opacity: 1 }, t0, 25, { k: 0.88 });
  }

  /* ---------- R5 PSACÍ POLE (Ben Z2) ----------
   * Bílý box se roztáhne ze středu (exp rozjezd, max rychlost ve 7. sn., pak doběh ×0,67),
   * text je v rozvržení hotový od začátku a odhaluje se po slovech (fade 4 až 5 sn.)
   * nebo po písmenech (každé 2,2 sn., fade 3 sn.). Je to "vyplňování formuláře": fakt se zapisuje.
   */
  function psaciPole(rodic, text, o = {}) {
    const el = div(rodic, "mk-pole" + (o.tmave ? " tmave" : ""));
    if (o.pozadi != null) el.style.background = o.pozadi;   // "none" bez boxu (text přímo na podkladu)
    const vyska = o.h || h(0.08);
    gsap.set(el, { height: vyska, width: o.w || h(0.557), fontSize: (o.cap || h(0.067)) / 0.72, visibility: "hidden" });
    stred(el, o.x == null ? W / 2 : o.x, o.y == null ? h(0.611) : o.y);
    const t = div(el, "mk-pole-text");
    if (o.zarovnani === "vlevo") t.classList.add("vlevo");
    const casti = (o.poPismenech ? [...text] : text.split(" ")).map((s, i, a) => {
      const sp = document.createElement("span");
      sp.textContent = o.poPismenech ? (s === " " ? " " : s) : s + (i < a.length - 1 ? " " : "");
      t.appendChild(sp);
      return sp;
    });
    return { el, text: t, casti };
  }
  // šířka boxu (podíl finální) po snímcích, změřeno Ben f6 až f23
  const POLE_HOOK = [0.013, 0.027, 0.045, 0.073, 0.113, 0.17, 0.26, 0.403, 0.597, 0.74, 0.828, 0.887, 0.927, 0.953, 0.973, 0.987, 0.993, 1];
  function psani(tl, p, t0, o = {}) {
    ukaz(tl, p.el, t0);
    const sirky = o.sirky || POLE_HOOK;
    // odkud se pole otevírá: ze středu (Ben holder f285) nebo zleva (Ben hook f6, BEN je vidět dřív než FRANCIS)
    const klip = o.zleva ? (s) => `inset(0 ${(1 - s) * 100}% 0 0)` : (s) => `inset(0 ${((1 - s) / 2) * 100}% 0 ${((1 - s) / 2) * 100}%)`;
    tabulka(tl, p.el, t0, "clipPath", sirky.map(klip));
    tl.set(p.casti, { opacity: 0 }, t0);
    const starty = o.starty || p.casti.map((_, i) => (o.prvni == null ? 7 : o.prvni) + i * (o.rozestup || 2.2));
    p.casti.forEach((c, i) => tw(tl, c, { opacity: o.od == null ? 0.35 : o.od }, { opacity: 1 }, t0 + F(starty[i]), o.fade || 3, { k: 0.7 }));
  }

  /* ---------- R5 ŠTÍTEK PADÁ SHORA (Ben Z3 NETWORK f766 až f785, DISTRIBUTION f1151) ----------
   * Černý box, akcentní verzálky, přijde shora exp doběhem (k 0,8, 19 sn.), pak plove dolů
   * a odchází pádem s ease in (12 sn.). Pád shora = nový bod, pád dolů = odchod.
   */
  function stitek(rodic, text, o = {}) {
    const el = div(rodic, "mk-stitek" + (o.svetly ? " svetly" : ""), text);
    gsap.set(el, { height: o.h || h(0.173), fontSize: (o.cap || h(0.12)) / 0.72, visibility: "hidden" });
    if (o.w) gsap.set(el, { width: o.w });
    gsap.set(el, { left: o.x == null ? W / 2 : o.x, top: o.y == null ? h(0.5145) : o.y, xPercent: -50, yPercent: -50 });   // y = střed štítku
    return el;
  }
  function padShora(tl, el, t, o = {}) {
    ukaz(tl, el, t);
    tw(tl, el, { y: -(o.z || h(0.3)) }, { y: 0 }, t, o.n || 19, { k: o.k || 0.8 });
  }
  function padDolu(tl, el, t, o = {}) {
    tw(tl, el, { y: 0 }, { y: o.o || h(0.25) }, t, o.n || 12, { vjezd: true, k: o.k || 0.8 });
  }
  // stažení před střihem (NETWORK: šířka -8 % za 11 sn. ease in)
  function stazeni(tl, el, t, o = {}) {
    tw(tl, el, { scale: 1 }, { scale: o.na || 0.92 }, t, o.n || 11, { vjezd: true, k: 0.82 });
  }

  /* ---------- R4 SQUASH PÁS (Ben Z4 f46 až f80) ----------
   * Fotka přes celý snímek se zmáčkne na úzký pás: výška = 0,26 + 0,742 * e^(-0,195 t),
   * pak ease in kolaps; logo uprostřed se zmenší jen o 12 %. Peníze + značka jedním úderem.
   */
  function pas(rodic, o = {}) {
    const el = div(rodic, "mk-pas");
    if (o.obrazek) { const i = document.createElement("img"); i.src = o.obrazek; el.appendChild(i); }
    const logo = div(el, "mk-pas-logo", o.logo || "");
    gsap.set(el, { top: o.y == null ? h(0.495) : o.y, yPercent: -50, height: H, visibility: "hidden" });
    return { el, logo };
  }
  function pasNastup(tl, p, t, o = {}) {
    ukaz(tl, p.el, t);
    const n = o.n || 35, vysky = [];
    for (let f = 0; f < n; f++) {
      let v = 0.26 + 0.742 * Math.exp(-0.195 * f);
      if (f > 24) v -= [0.007, 0.016, 0.026, 0.037, 0.053, 0.073, 0.091, 0.111, 0.13, 0.15][f - 25] || 0.15;
      vysky.push(v * H);
    }
    tabulka(tl, p.el, t, "height", vysky, "px");
    tw(tl, p.logo, { scale: 1 }, { scale: 0.88 }, t, 14, { k: 0.8 });
  }

  /* ---------- R3 TITULEK NA HRUDI A SERIF JAKO DRUHÝ HLAS (Ben Z5, Z6) ----------
   * Běžné slovo: cap 6,3 % H, tvrdá výměna bez pohybu. Klíčové slovo 1,55x a vjede zleva
   * (posun 157 px na 1078, k 0,84, 26 sn.). Serif kurzíva minusky = komentář: slova po 7 sn.,
   * každé zespodu 30 px a z poloviny krytí za 7 sn., pootočené -5°.
   */
  function hrudTitulky(tl, kontejner, slova, o = {}) {
    const els = slova.map((s, i) => {
      const e = div(kontejner, "mk-hrud" + (s.klic ? " klic" : ""), s.text);
      gsap.set(e, { visibility: "hidden", fontSize: (o.cap || h(0.063)) / 0.72 * (s.klic ? 1.55 : 1) });
      const konec = s.konec != null ? s.konec : slova[i + 1] ? slova[i + 1].t : s.t + 1;
      ukaz(tl, e, s.t);
      if (s.klic) tw(tl, e, { x: -h(0.146) }, { x: 0 }, s.t, 26, { k: 0.84 });
      skryj(tl, e, konec);
      return e;
    });
    return els;
  }
  function serifSlova(tl, kontejner, slova, o = {}) {
    return slova.map((s) => {
      const e = div(kontejner, "mk-serif", s.text);
      gsap.set(e, { visibility: "hidden", rotation: o.rot == null ? -5 : o.rot });
      if (s.x != null) gsap.set(e, { left: s.x });
      ukaz(tl, e, s.t);
      tw(tl, e, { y: o.posun || h(0.028), opacity: 0.5 }, { y: 0, opacity: 1 }, s.t, 7, { k: 0.72 });
      if (s.konec) skryj(tl, e, s.konec);
      return e;
    });
  }

  /* ---------- R4 OBŘÍ SLOVO (Ben Z7) ----------
   * Klíčové slovo přes 54 až 90 % šířky, cap 20 % H, za objektem (u Jacka za hlavou rotoscope,
   * u nás za kartou, protože pozadí nikdy nevystřihujeme). Čtyři příchody:
   * strih (tvrdě plné), zespodu (270 px, k 0,7, 16 sn.), fade (z 50 % k 0,85 za 17 sn. a 57 px nahoru),
   * prolinani (6 sn. přes sebe). Odchod: pád dolů 54 px s ease in za 15 sn.
   */
  function hero(tl, el, t, o = {}) {
    const typ = o.prichod || "strih";
    ukaz(tl, el, t);
    if (typ === "zespodu") tw(tl, el, { y: o.posun || h(0.25) }, { y: 0 }, t, 16, { k: 0.7 });
    if (typ === "fade") {
      tw(tl, el, { opacity: 0.45 }, { opacity: 1 }, t, 20, { k: 0.85 });
      tw(tl, el, { y: h(0.053) }, { y: 0 }, t, 11, { k: 0.82 });
    }
    if (typ === "prolinani") tw(tl, el, { opacity: 0 }, { opacity: 1 }, t, 6, { ease: (p) => p });
    if (o.konec != null) {
      if (o.odchod === "pad") tw(tl, el, { y: 0 }, { y: h(0.05) }, o.konec - F(15), 15, { vjezd: true, k: 0.82 });
      skryj(tl, el, o.konec);
    }
  }

  /* ---------- R10 POP UI OBJEKTU ----------
   * Ben Z8 (bublina Broke f162 až f182): měřítko 0,61 > 1 za 6 sn., rotace švihne z +15° do -18°,
   * střed vyjede 115 px (na 1078) nahoru, v 7. sn. snap za jeden snímek na -3° a +36 px, pak klid.
   * Znaménko a síla švihu se mezi objekty mění (±8° až ±18°).
   */
  const SNAP = {
    s: [0.62, 0.84, 0.94, 0.985, 1.0, 1.01, 1.02, 1.02, 1.01, 1.0, 1.0],
    r: [15.4, 4.5, -5.8, -16.4, -18.5, -18.1, -16.1, -3.1, -1.3, -0.6, 0],
    y: [0.106, 0.07, 0.037, 0.006, 0, -0.001, 0.005, 0.039, 0.045, 0.05, 0.054],
  };
  function popSnap(tl, el, t, o = {}) {
    const sila = o.sila == null ? 1 : o.sila; // záporná = opačný švih
    ukaz(tl, el, t);
    SNAP.s.forEach((s, i) => tl.set(el, { scale: s, rotation: SNAP.r[i] * sila, y: (SNAP.y[i] - 0.054) * H * (o.zdvih || 1) }, t + F(i)));
  }
  /* Georgios Z10 (chat pilulka f243): 0,62 > 1,56 > 0,955 > 1,04 > 1, vrchol ve 3. sn., ustálení 10 sn.
   * Pop je klíčová animace, ne pružina: hodnoty po snímcích */
  const POP_G = [0.62, 1.28, 1.48, 1.56, 1.52, 1.4, 1.26, 1.12, 1.02, 0.97, 0.955, 0.965, 0.995, 1.025, 1.04, 1.04, 1.03, 1.015, 1.0];
  function pop(tl, el, t, o = {}) {
    ukaz(tl, el, t);
    const sila = o.sila == null ? 1 : o.sila;
    POP_G.forEach((s, i) => tl.set(el, { scale: 1 + (s - 1) * sila }, t + F(i * (o.krok || 1))));
  }

  /* ---------- R7 KOSOČTVERCE 1 2 3 (Ben Z9 f682 až f714) ----------
   * Superelipsa p = 0,8 (konkávní strany), bílá číslice 47 % výšky tvaru. Pop z 51 % do 100 %
   * bez přestřelu (k 0,72, 14 sn.), zpoždění 7 a 17 sn., pak všechny ease in na 88 % před střihem.
   */
  function kosoctverec(rodic, cislo, o = {}) {
    const vel = o.vel || h(0.392);
    const el = div(rodic, "mk-kosoctverec");
    const p = 0.8, N = 96, R = 50;
    let d = "";
    for (let i = 0; i <= N; i++) {
      const a = (i / N) * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
      const x = 50 + R * Math.sign(c) * Math.pow(Math.abs(c), 2 / p), y = 50 + R * Math.sign(s) * Math.pow(Math.abs(s), 2 / p);
      d += (i ? "L" : "M") + x.toFixed(2) + " " + y.toFixed(2);
    }
    el.innerHTML = `<svg viewBox="0 0 100 100"><path d="${d}Z"/></svg><span>${cislo}</span>`;
    gsap.set(el, { width: vel, height: vel, fontSize: vel * 0.47 / 0.72, visibility: "hidden" });
    stred(el, o.x, o.y == null ? h(0.498) : o.y);
    return el;
  }
  function kosoctverceNastup(tl, els, t, o = {}) {
    const zp = o.zpozdeni || [0, 7, 17];
    els.forEach((el, i) => {
      ukaz(tl, el, t + F(zp[i]));
      tw(tl, el, { scale: 0.51 }, { scale: 1 }, t + F(zp[i]), 14, { k: 0.72 });
    });
    if (o.konec) tl.to(els, { scale: o.na || 0.877, duration: F(o.n || 10), ease: expIn(0.8, o.n || 10) }, o.konec - F(o.n || 10));
  }


  /* ---------- R2 POČÍTADLO (Fred Z1 f13 až f61, Shelby A4, Georgios Z5) ----------
   * Hodnota jen z řeči, nikdy nepřestřelí. Fred: na dvojky, ease out expo 36 sn. (přírůstek 2,5k > 0,4k na krok),
   * Georgios a IG profily: každý snímek jako tachometr. format(v) vrací text.
   */
  function pocitadlo(tl, el, t, od, kam, n, o = {}) {
    const krok = o.krok || 2, fmt = o.format || ((v) => Math.round(v).toLocaleString("en-US"));
    const ease = o.ease || expOut(o.k || 0.9, n);
    for (let f = 0; f <= n; f += krok) tl.set(el, { textContent: fmt(od + (kam - od) * ease(f / n)) }, t + F(f));
    tl.set(el, { textContent: fmt(kam) }, t + F(n));
  }
  const dolary = (v) => "$" + Math.round(v).toLocaleString("en-US");

  /* ---------- R3 SLOVA Z ROZMAZÁNÍ (Fred Z2 f1032 až f1079, nejčastější prvek, 14 scén) ----------
   * Každé slovo: krytí 0,4 > 1, měřítko 0,9 > 1,07 > 1, blur 10 > 0 px za 12 sn., ustálení 24 sn.,
   * vše na TROJKY (10 fps). Řádek se po každém slově znovu vycentruje skokem (flex).
   * Barva nese roli: černá = jak to dělají všichni, akcent kurzíva = jak to dělá on.
   */
  const ROZM = [[0.4, 0.9, 10], [0.7, 1.04, 6], [1, 1.07, 2], [1, 1.06, 0], [1, 1.045, 0], [1, 1.03, 0], [1, 1.02, 0], [1, 1.01, 0], [1, 1, 0]];
  function slovaRozmazane(tl, radek, slova, o = {}) {
    const krok = o.krok || 3;
    return slova.map((s) => {
      const e = document.createElement("span");
      e.className = "mk-rslovo" + (s.akcent ? " akcent" : "");
      e.textContent = s.text;
      radek.appendChild(e);
      tl.set(e, { display: "none" }, 0);
      tl.set(e, { display: "inline-block" }, s.t);
      ROZM.forEach(([op, sc, bl], i) => tl.set(e, { opacity: op, scale: sc, filter: `blur(${bl}px)` }, s.t + F(i * krok)));
      if (s.konec != null) tl.set(e, { display: "none" }, s.konec);
      return e;
    });
  }

  /* ---------- ŘÁDEK SLOV ZESPODU (Tim 4. 10. 2026: místo zvětšování z rozmazání slovo přijede zespodu) ----------
   * slovo zabírá místo od začátku (visibility), takže řádek neposkakuje; nástup 4 snímky na dvojky, y 0,4 em > 0, bez dojezdu */
  function slovaZespodu(tl, radek, slova, o = {}) {
    const n = o.n || 4, krok = o.krok || 2;
    return slova.map((s) => {
      const e = document.createElement("span");
      e.className = "mk-rslovo" + (s.akcent ? " akcent" : "");
      e.textContent = s.text; e.style.display = "inline-block"; e.style.visibility = "hidden";
      radek.appendChild(e);
      tl.set(e, { visibility: "visible" }, s.t);
      tw(tl, e, { y: "0.4em", opacity: 0.3 }, { y: 0, opacity: 1 }, s.t, n, { k: 0.5, krok });
      if (s.konec != null) tl.set(e, { visibility: "hidden" }, s.konec);
      return e;
    });
  }

  /* ---------- R7 ČÍSLO BODU #N (Fred Z12) ----------
   * Rituál: číslo vždy 12 sn. po střihu, první slovo řádku 14 až 26 sn. po čísle.
   * Číslo 33 % H, maska zdola (plné do 30 % výšky glyfu, pak do ztracena), krytí 0,15 > 1 a měřítko 0,8 > 1
   * ease out expo za 15 sn., pak drift doleva 0,55 % W za snímek po celou scénu.
   * Řádek verzálek: slovo dorůstá s překmitem 6 % za 12 sn., jedničky.
   */
  function cisloBodu(tl, el, t, o = {}) {
    ukaz(tl, el, t);
    tw(tl, el, { opacity: 0.15, scale: 0.8 }, { opacity: 1, scale: 1 }, t, 15, { k: 0.78 });
    // drift doleva: rychlý doběh (Fred #1 f705 až f716 -0,37 % W za snímek), pak pomalu do konce scény
    if (o.konec) {
      tw(tl, el, { x: 0 }, { x: -w(o.drift || 0.09) }, t, 24, { k: 0.9 });
      tl.to(el, { x: -w(o.drift || 0.09) - w(0.001) * (o.konec - t - F(24)) * FPS, duration: o.konec - t - F(24), ease: "none" }, t + F(24));
    }
  }
  const DORUST = [0.82, 0.9, 0.96, 1.01, 1.04, 1.06, 1.06, 1.05, 1.035, 1.02, 1.01, 1.005, 1];
  function radekSlov(tl, slova) {
    slova.forEach((s) => {
      ukaz(tl, s.el, s.t);
      DORUST.forEach((v, i) => tl.set(s.el, { scale: v, opacity: Math.min(1, 0.35 + i * 0.22) }, s.t + F(i)));
    });
  }

  /* ---------- R5 PILULKA Z OKRAJE A OBLOUK (Fred Z10 f339 až f433) ----------
   * Pruh ukotvený na okraji obrazu (vlevo nebo vpravo), roste ease out expo 26 sn. (první krok 5 % W),
   * druhý pruh vjede z druhé strany 24 sn. Oblouk: tlustá čára akcentu, vystřelí ve dvou fázích
   * (20 % délky za 3 sn., pauza 10 sn., zbytek za 9 sn.). Dvě čísla = dva pruhy, oblouk je spojí.
   */
  // pruh vyjíždí zpoza okraje posunem (text jede s ním), ne odkrytím
  function pruhZOkraje(tl, el, t, o = {}) {
    ukaz(tl, el, t);
    const sirka = el.offsetWidth || w(0.507);
    tw(tl, el, { x: o.zprava ? sirka : -sirka }, { x: 0 }, t, o.n || 26, { k: o.k || 0.82 });
  }
  function pruhVjezd(tl, el, t, o = {}) {
    ukaz(tl, el, t);
    tw(tl, el, { x: o.z || w(0.507) }, { x: 0 }, t, o.n || 24, { k: o.k || 0.83 });
  }
  function obloukDvakrat(tl, path, t, o = {}) {
    ukaz(tl, path, t);
    tl.set(path, { strokeDasharray: "1 1", strokeDashoffset: 1 }, t);
    tw(tl, path, { strokeDashoffset: 1 }, { strokeDashoffset: 0.8 }, t, 3, { k: 0.6 });
    tw(tl, path, { strokeDashoffset: 0.8 }, { strokeDashoffset: 0 }, t + F(o.pauza || 12), 9, { k: 0.72 });
  }

  /* ---------- R5 STACK PILULEK (Fred Z15 f2544 až f2568) ----------
   * Pilulky pod sebou po 5 sn., každá z 1,25x a rozmazání (8 sn.) do 1,0 ease out 25 sn.
   * Pilulka je štítek na člověku (před ním), text je prostředí (za ním).
   */
  function pilulkaStack(tl, els, t, o = {}) {
    els.forEach((el, i) => {
      const ti = t + F(i * (o.rozestup || 5));
      ukaz(tl, el, ti);
      tw(tl, el, { scale: o.z || 1.25 }, { scale: 1 }, ti, 25, { k: 0.84 });
      tw(tl, el, { filter: "blur(8px)", opacity: 0.4 }, { filter: "blur(0px)", opacity: 1 }, ti, 8, { k: 0.7 });
    });
  }

  /* ---------- R1 JMENOVKA PŘES MONTÁŽ (Fred Z6 f245 až f334) ----------
   * Jméno drží, svět za ním se mění (12 záběrů po 8 a 6 sn., match cut na obličej).
   * Slova po 2 sn.: blur 12 > 0, krytí 0,4 > 1, druhé slovo zespodu 4 % H.
   */
  function jmenovka(tl, els, t, o = {}) {
    els.forEach((el, i) => {
      const ti = t + F(i * (o.rozestup || 4));
      ukaz(tl, el, ti);
      [[0.4, 12, i ? 0.04 : 0.01], [0.85, 4, i ? 0.012 : 0.003], [1, 0, 0]].forEach(([op, bl, y], j) =>
        tl.set(el, { opacity: op, filter: `blur(${bl}px)`, y: y * H }, ti + F(j * 2)));
    });
  }

  /* ---------- R1 SHLUK FOTEK (Fred Z4 f130 až f186) ----------
   * Miniatury vyskočí najednou bez interpolace, pak skupina roste 0,55 > 1 a rozestoupí se (40 sn. ease out).
   */
  function shluk(tl, els, t, o = {}) {
    ukaz(tl, els, t);
    els.forEach((el) => {
      const dx = +el.dataset.dx || 0, dy = +el.dataset.dy || 0;
      tw(tl, el, { scale: 0.55, x: -dx * 0.45, y: -dy * 0.45 }, { scale: 1, x: 0, y: 0 }, t + F(o.zpozdeni || 9), o.n || 40, { k: 0.88 });
    });
  }

  /* ---------- R7 ČTVERCE 1 2 3 (Fred Z14 f566 až f650) ----------
   * Akcentní obdélníky s obrysovou číslicí, každý +5 sn. a fade z papíru do akcentu za 8 sn.,
   * skupina driftuje 0,43 % W za snímek a na konci ji panorama odveze.
   */
  function ctverceNastup(tl, els, t, o = {}) {
    els.forEach((el, i) => {
      const ti = t + F(i * (o.rozestup || 5.5));
      ukaz(tl, el, ti);
      tw(tl, el, { opacity: 0 }, { opacity: 1 }, ti, 8, { k: 0.75 });
    });
  }


  /* ---------- R10 ŠTÍTEK S PŘEKMITEM (Ddl 9 telefon + štítky f337, Dda A9) ----------
   * Start 0,6, za 1 sn. 1,24, vrchol 1,62 ve 4. sn., klid za dalších 7 až 12 sn. Štítky se hromadí, nikdy neodchází.
   * sila 1 = první štítek (1,62), 0,6 = další (1,35).
   */
  const STITEK_POP = [0.6, 1.24, 1.46, 1.57, 1.62, 1.55, 1.46, 1.33, 1.2, 1.1, 1.03, 1.0];
  function stitekPop(tl, el, t, o = {}) {
    const sila = o.sila == null ? 1 : o.sila;
    ukaz(tl, el, t);
    STITEK_POP.forEach((v, i) => tl.set(el, { scale: v <= 1 ? v : 1 + (v - 1) * sila }, t + F(i)));
  }

  /* ---------- R3 DUCHOVÁ VĚTA (Georgios Z13 f391 až f446) ----------
   * Celá věta je vidět předem na 30 % (plán) a rozsvěcuje se slovo po slově podle řeči (3 sn.).
   * Divák vidí strukturu dřív, než ji slyší. Nic jiného se nehýbe.
   */
  function duchVeta(tl, els, casy, o = {}) {
    tl.set(els, { opacity: o.duch || 0.3, visibility: "visible" }, o.od == null ? casy[0] - F(6) : o.od);
    els.forEach((e, i) => tw(tl, e, { opacity: o.duch || 0.3 }, { opacity: 1 }, casy[i], o.n || 3, { k: 0.6 }));
  }

  /* ---------- R6 PROFIL S TIKAJÍCÍM POČÍTADLEM (Georgios Z18, Shelby A5, Ben Z11) ----------
   * Profil jako UI objekt (ne screenshot): avatar, jméno, čísla. Počet sledujících tiká každý snímek
   * (Georgios 9K > 260K za 21 sn.) nebo po 3 sn. (Shelby). Pak TVRDÝ střih do předem zvětšené verze
   * (2,2x až 3,3x na číslo), okolí rozmazané 3 px. Zoom se neanimuje, je to přepnutí.
   */
  function profilZoom(tl, el, t, o = {}) {
    tl.set(el, { scale: o.na || 2.2, transformOrigin: o.origin || "30% 30%" }, t);
    if (o.drift) tl.to(el, { x: o.drift, duration: o.delka || 1.2, ease: "none" }, t);
  }
  const tisice = (v) => (v >= 1000000 ? (v / 1000000).toFixed(1).replace(".0", "") + "M" : Math.round(v / 1000) + "K");

  /* ---------- R1 VĚJÍŘ KARET (Ddq 1 f1 až f37) ----------
   * Pět svislých karet vlétne zleva po 2 sn. se směrovým rozmazáním (motion blur klesá s rychlostí),
   * usadí se do vějíře (rotace -14 -8 0 7 13°, krajní níž), drží, pak se za 4 sn. slijí do jedné (zrychluje).
   */
  function vejirNastup(tl, els, t, o = {}) {
    const rot = o.rot || [-14, -8, 0, 7, 13];
    els.forEach((e, i) => {
      const ti = t + F(i * (o.rozestup || 2));
      ukaz(tl, e, ti);
      tw(tl, e, { x: -(o.z || w(0.6)), rotation: rot[i] - 25, filter: "blur(18px)" }, { x: 0, rotation: rot[i], filter: "blur(0px)" }, ti, 9, { k: 0.7 });
    });
  }
  function vejirSlit(tl, els, t, o = {}) {
    els.forEach((e) => tl.to(e, { x: -(+e.dataset.dx || 0), y: -(+e.dataset.dy || 0), rotation: 0, duration: F(4), ease: expIn(0.6, 4) }, t));
  }

  /* ---------- R2 PILULKA S POČÍTADLEM (Ddq 2 f37 až f60) ----------
   * Pilulka přes kartu (61 % W), roste od středu scaleX 0,53 > 1 za 9 sn., číslo každý snímek power3.out 20 sn.
   */
  function pilulkaPocitadlo(tl, pil, cislo, t, kam, o = {}) {
    ukaz(tl, pil, t);
    tw(tl, pil, { scaleX: 0.53 }, { scaleX: 1 }, t, 9, { k: 0.72 });
    pocitadlo(tl, cislo, t, o.od == null ? kam * 0.3 : o.od, kam, o.n || 20, { krok: 1, ease: gsap.parseEase("power3.out"), format: o.format });
  }

  /* ---------- R9 ZMENŠENÍ KARTY STRANOU (Ddq 3 f60 až f75) ----------
   * Karta s obsahem uvolní místo textu: měřítko 0,757 a posun, 15 sn., pomalý rozjezd 3 sn., strmý střed, dlouhý ocas.
   */
  const POSUN_DDQ = (p) => [0, 0.016, 0.04, 0.11, 0.24, 0.44, 0.62, 0.74, 0.82, 0.87, 0.92, 0.945, 0.97, 0.98, 0.995, 1][Math.min(15, Math.round(p * 15))];
  function uvolni(tl, el, t, kam, o = {}) {
    tl.to(el, { ...kam, duration: F(o.n || 15), ease: POSUN_DDQ }, t);
  }

  /* ---------- R8 TRYCHTÝŘ Z PÁSŮ (Ddq 7 f300 až f318) ----------
   * Tři lichoběžníky, TOF propadne a odrazí se (22 px), MOF vyjede zpoza TOF, BOF zpoza MOF s překmitem 26 px,
   * stavba 9 sn., usazení 8 sn. Pak se zmenší (ease out), aby se vešla orbita lidí.
   */
  function trychtyrStavba(tl, pasy, t) {
    const [a, b, c] = pasy, H0 = h(0.06);
    ukaz(tl, a, t);
    MK.tabulka(tl, a, t, "y", [-H0, 0, 6, 0, 0].map((v) => v), "px");
    ukaz(tl, b, t + F(4));
    tw(tl, b, { y: -h(0.035) }, { y: 0 }, t + F(4), 3, { k: 0.6 });
    ukaz(tl, c, t + F(7));
    MK.tabulka(tl, c, t + F(7), "y", [-h(0.02), 0, h(0.0135), h(0.0135), h(0.0094), h(0.0026), 0, -h(0.0016), -h(0.002), -h(0.0005), 0], "px");
  }

  /* ---------- R8 ORBITA LIDÍ (Ddq 9 f374 až f520, Dda A7) ----------
   * Avatary vyletí po jednom z jednoho bodu nad středem (po 2 sn.), rozvinou se po směru hodin
   * do rovnoměrného kruhu a dál se zpomaleně otáčejí (expo out, poslední pohyb 5° za 40 sn.). Lidé = publikum.
   */
  function orbita(tl, pivot, avatary, t, o = {}) {
    const n = avatary.length, r = o.r || w(0.306), uhel = 360 / n;
    avatary.forEach((a, i) => {
      gsap.set(a, { left: "50%", top: "50%", xPercent: -50, yPercent: -50 });
      const ti = t + F(i * (o.rozestup || 2));
      ukaz(tl, a, ti);
      // rozvinutí: každý avatar jede po kruhu ze startu -90° na svou pozici
      const kam = -90 + i * uhel;
      const obj = { u: -90 };
      tl.fromTo(obj, { u: -90 }, { u: kam + (o.dotoc || 60), duration: F(o.n || 60), ease: expOut(0.93, o.n || 60), immediateRender: false,
        onUpdate: () => gsap.set(a, { x: r * Math.cos((obj.u * Math.PI) / 180), y: r * Math.sin((obj.u * Math.PI) / 180) }) }, ti);
    });
  }

  /* ---------- R9 B-ROLL DO KARTY (Ddl 4 f13 až f25) ----------
   * Záběr přes celý snímek se zmenší do karty s papírovým okrajem (inset 7,2 %), expo 12 sn. Signál "tohle je rámec".
   */
  function brollDoKarty(tl, el, t, o = {}) {
    const ins = o.inset || 0.072;
    tw(tl, el, { clipPath: "inset(0% 0% 0% 0% round 0px)" }, { clipPath: `inset(${ins * 100 * (W / H)}% ${ins * 100}% ${ins * 100 * (W / H)}% ${ins * 100}% round ${h(0.007)}px)` }, t, o.n || 12, { k: 0.8 });
  }

  /* ---------- R9 ZOOM BUMP (Ddl 19 f241, f301, f1472) ----------
   * Umělý střih v jedné nahrávce: +9 % za 8 sn. expo, pak dojezd +0,2 % za snímek. Zoom out -8 % za 12 sn.
   * Návrat z B-rollu: start 1,11 a za 40 sn. do 1,0.
   */
  function zoomBump(tl, el, t, o = {}) {
    const z = o.z == null ? 1 : o.z, o2 = o.o == null ? 0.09 : o.o;
    tw(tl, el, { scale: z }, { scale: z * (1 + o2) }, t, o2 > 0 ? 8 : 12, { k: 0.72 });
    if (o.dojezd !== false) tl.to(el, { scale: z * (1 + o2) * (1 + 0.002 * (o.drzeni || 30)), duration: F(o.drzeni || 30), ease: "none" }, t + F(8));
  }
  function navratZBrollu(tl, el, t, o = {}) {
    tw(tl, el, { scale: o.od || 1.11 }, { scale: 1 }, t, o.n || 40, { k: 0.9 });
  }

  /* ---------- R8 KRESLENÁ ŠIPKA (Georgios Z20, Ddq 8) ----------
   * Akcentní háček z objektu k popisku, kreslí se 7 sn. ease out, popisek naskočí po šipce.
   */
  function kresli(tl, path, t, o = {}) {
    ukaz(tl, path, t);
    tl.set(path, { strokeDasharray: "1 1" }, t);
    tw(tl, path, { strokeDashoffset: 1 }, { strokeDashoffset: 0 }, t, o.n || 7, { k: o.k || 0.7 });
  }

  /* ---------- R8 UZLY KOLEM SEZNAMU (Georgios Z15 f696 až f770) ----------
   * Uzel (pilulka) pop 0,5 > 1,2 > 1 a po 1 až 3 sn. se ke středu nakreslí spojnice (6 sn.). Rozestup 4 až 6 sn.
   */
  function uzel(tl, el, cara, t) {
    ukaz(tl, el, t);
    [[0.5], [0.95], [1.2], [1.12], [1.02], [0.98], [1]].forEach(([v], i) => tl.set(el, { scale: v }, t + F(i)));
    if (cara) kresli(tl, cara, t + F(2), { n: 6 });
  }

  /* ---------- R1 TRIPTYCH 1 3 2 (Shelby A6 f496 až f502) ----------
   * Tři svislé karty přes celou výšku, každá naskočí v jednom snímku po 3 sn. v pořadí, jak je řečník říká,
   * bílá číslice 19 % H uprostřed. Stejný podpis se pak vrací u každého bodu.
   */
  function triptych(tl, karty, t, o = {}) {
    (o.poradi || [0, 1, 2]).forEach((ix, i) => ukaz(tl, karty[ix], t + F(i * (o.rozestup || 3))));
    if (o.konec != null) karty.forEach((k) => { skryj(tl, k, o.konec); k.querySelectorAll("video").forEach((v) => skryj(tl, v, o.konec)); });
  }

  /* ---------- R2 SCRAMBLE ČÍSLA (Shelby A4 f259 až f274) ----------
   * Znaky se přepisují po 3 sn. (6 stavů), zprava se zamykají na správnou hodnotu, scaleX jitter ±4 % každý snímek.
   */
  function scramble(tl, el, t, cil, o = {}) {
    const r = rng(o.seed || 7), zn = "$%&-0123456789.,";
    const stavy = o.stavy || 6;
    for (let s = 0; s < stavy; s++) {
      const zamceno = Math.round((s / (stavy - 1)) * cil.length);
      let txt = "";
      for (let i = 0; i < cil.length; i++) txt += i >= cil.length - zamceno || /[,.$]/.test(cil[i]) && s > 2 ? cil[i] : zn[Math.floor(r() * zn.length)];
      tl.set(el, { textContent: txt }, t + F(s * 3));
    }
    tl.set(el, { textContent: cil }, t + F(stavy * 3 - 3));
    for (let f = 0; f < stavy * 3; f++) tl.set(el, { scaleX: f < stavy * 3 - 3 ? 0.96 + r() * 0.08 : 1 }, t + F(f));
  }
  function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }


  /* ---------- R6 PROFIL JAKO UI OBJEKT (Georgios Z7, Z18, Shelby A5, Ben Z11) ----------
   * Postavený profil, ne screenshot: avatar s kroužkem, jméno, příspěvky / sledující / sleduje, bio, tlačítka.
   * vrací { el, sledujici } pro počítadlo. tmavy: #181B20 jako u Georgiose, jinak světlý.
   */
  function profil(rodic, o = {}) {
    const el = div(rodic, "mk-profil" + (o.tmavy ? " tmavy" : ""));
    el.innerHTML = `<div class="mk-pr-hlava"><div class="mk-pr-avatar"><img src="${o.avatar || ""}" alt=""></div>
      <div class="mk-pr-info"><div class="mk-pr-jmeno">${o.jmeno || ""}<span class="mk-pr-overeno"></span></div>
      <div class="mk-pr-cisla"><span><b>${o.prispevky || ""}</b> ${o.lPrispevky || "posts"}</span><span><b class="mk-pr-sled">${o.sledujici || ""}</b> ${o.lSledujici || "followers"}</span><span><b>${o.sleduje || ""}</b> ${o.lSleduje || "following"}</span></div>
      <div class="mk-pr-bio">${o.bio || ""}</div></div></div>
      <div class="mk-pr-tlacitka"><div class="mk-pr-btn hlavni">${o.tlacitko || "Follow"}</div><div class="mk-pr-btn">${o.tlacitko2 || "Message"}</div></div>`;
    return { el, sledujici: el.querySelector(".mk-pr-sled") };
  }
  /* nájezd karty z boku (Georgios Z7 f104 až f129): krytí lineárně 9 sn., pozice expo 25 sn. (dvě oddělené křivky) */
  function najezd(tl, el, t, o = {}) {
    ukaz(tl, el, t);
    tw(tl, el, { opacity: 0 }, { opacity: 1 }, t, o.nFade || 9, { ease: (p) => p });
    tw(tl, el, { x: o.z == null ? w(0.22) : o.z }, { x: 0 }, t, o.n || 25, { k: o.k || 0.86 });
  }

  window.MK = { slovaZespodu, F, FPS, init, h, w, expOut, expIn, kroky, tw, tabulka, drift, ukaz, skryj, strih, div, stred,
    karta, montaz, kartaZoom, ZOOM_HOOK, psaciPole, psani, POLE_HOOK, stitek, padShora, padDolu, stazeni, pas, pasNastup,
    hrudTitulky, serifSlova, pocitadlo, dolary, slovaRozmazane, cisloBodu, radekSlov, pruhZOkraje, pruhVjezd, obloukDvakrat, pilulkaStack, jmenovka, shluk, ctverceNastup, stitekPop, duchVeta, profil, najezd, profilZoom, tisice, vejirNastup, vejirSlit, pilulkaPocitadlo, uvolni, trychtyrStavba, orbita, brollDoKarty, zoomBump, navratZBrollu, kresli, uzel, triptych, scramble, KRIVKY, DELKY, krivka, prijezd, odjezd, svih, kameraSkok, nastav, rng, hero, popSnap, pop, kosoctverec, kosoctverceNastup, W, H };
})();
