/* SooWei kit (SW): YouTube intro 16:9 podle SooWei Goha (@sooweigoh) v jazyce Beyond
 *
 * Rozbor: ~/Documents/inspirace-reels/soowei/_rozbor/STYL.md, po snímcích GR2vYzl5n34/SHOTLOG.md a ROZBOR.md (recepty SW1 až SW14).
 * Velikosti textu o 25 až 30 % větší než originál a bez stínu (Štěpán 15. 10. 2026).
 * Originál běží na 25 fps, tady 30 fps: snímky originálu x 1,2. Výchozí hodnoty = změřený originál při 1920x1080,
 * barvy a písma Beyond (soowei-kit.css), rozhodnutí Štěpána 15. 10. 2026: blur při nástupu 1:1, bez SFX.
 *
 * Stojí na sdíleném jádře: MK (js/mason-kit.js) načtené a MK.init(root) zavolané před první komponentou.
 * Pohyb přes MK.tw (pojmenované křivky MK.KRIVKY nebo GSAP ease), změřené průběhy přes MK.tabulka.
 * Jednotky: časy v sekundách, délky ve snímcích (30 fps), rozměry jako podíl výšky (y, velikost) nebo šířky (x).
 * Média (video, img) musí být v HTML staticky, komponenty je jen přesunou do svého kontejneru.
 * Seek safe: jen tweeny a set na jedné pozastavené timeline, náhoda jen ze semínka (MK.rng).
 *
 * Systém v jedné větě: každý střih tvrdý, plynulost dělá zoom out přetékající přes střih, text je součást záběru
 * (zmenšuje se s ním), naskočí průhledností s doostřením bez posunu a důraz nese velikost, váha a červený box.
 */
(function () {
  const F = (n) => n / 30;
  const R = (n25) => n25 * 1.2;                         // snímky originálu (25 fps) na naše (30 fps)
  const px = (v) => (v <= 1.5 ? v * MK.H : v);          // podíl výšky nebo px
  const p3out = "power3.out", p2out = "power2.out";
  const tok = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();   // barva z tématu (soowei-kit.css)
  const pryc = (tl, el, t) => { MK.skryj(tl, el, t); MK.strih(tl, el, t); };

  // průhlednost a doostření, bez posunu (SW2, SW3, SW4): opacity za nOp sn., blur za nBl sn. power2.out
  function doostri(tl, el, t, o = {}) {
    const nOp = o.nOp ?? 4, nBl = o.nBl ?? 8.4, b = o.blur ?? 14;
    MK.tw(tl, el, { opacity: 0 }, { opacity: 1 }, t, nOp, { ease: "cruise" });
    if (b > 0) MK.tw(tl, el, { filter: `blur(${b}px)` }, { filter: "blur(0px)" }, t, nBl, { ease: p2out });
  }

  // text na středu x, svislý střed y (podíl výšky), velikost písma v px nebo podílu výšky
  function text(rodic, o = {}) {
    const el = MK.div(rodic, "sw-text" + (o.trida ? " " + o.trida : ""));
    el.style.fontSize = px(o.px ?? 0.087) + "px";
    el.style.top = MK.h(o.y ?? 0.49) + "px";
    el.style.transform = "translateY(-50%)";
    return el;
  }
  // rozdělí na spany slov (s mezerami), slovo s box: true dostane červený podklad (SW6)
  function slovaDo(el, slova) {
    const spany = []; let box = null;
    slova.forEach((s, i) => {
      if (i) (box && s.box ? box : el).appendChild(Object.assign(document.createElement("span"), { className: "mez" }));
      let cil = el;
      if (s.box) {
        if (!box) { box = MK.div(el, "sw-box"); box.appendChild(Object.assign(document.createElement("span"), { className: "pod" })); }
        cil = box;
      } else box = null;
      const sp = document.createElement("span");
      sp.className = "sl" + (cil === box ? " na" : "") + (s.akcent ? " akc" : "");
      if (s.el) { sp.appendChild(s.el); s.el.style.height = "0.72em"; s.el.style.width = "auto"; s.el.style.display = "block"; }   // logo místo názvu značky
      else sp.textContent = s.w;
      cil.appendChild(sp); spany.push(sp);
    });
    return spany;
  }

  /* SW1 ZOOM OUT ZÁBĚRU I TEXTU (S1 f0 až 28, varianty S6, S7, S8)
   * Celý kontejner záběru (klip i jeho texty) se zmenší z od na 1, rychlost nejvyšší hned po střihu. Ostření a jas jen u "ostri".
   * Varianty z měření: hook 1,55 za 34 sn. power3.out s doostřením 14 px za 26 sn. a jasem 0,88 > 1,03 > 1,
   *   A-roll "pomaly" 1,15 za 128 sn. power2.inOut, kalendář 1,36 za 125 sn., karta 1,67 za 29 sn. power3.out. */
  const ZOOMY = {
    hook: { od: 1.55, n: R(28), ease: p3out, ostri: true },
    pomaly: { od: 1.15, n: R(107), ease: "power2.inOut" },
    kalendar: { od: 1.36, n: R(104), ease: "power3.out" },
    karta: { od: 1.67, n: R(24), ease: p3out },
  };
  function zoomVen(tl, el, t, o = {}) {
    const z = { ...ZOOMY[o.typ || "hook"], ...o };
    MK.tw(tl, el, { scale: z.od }, { scale: 1 }, t, z.n, { ease: z.ease });
    if (z.ostri) {
      MK.tw(tl, el, { filter: "blur(14px) brightness(0.88)" }, { filter: "blur(0px) brightness(1.03)" }, t, R(12), { ease: p2out });
      MK.tw(tl, el, { filter: "blur(0px) brightness(1.03)" }, { filter: "blur(0px) brightness(1)" }, t + F(R(12)), R(16), { ease: "softInOut" });
    }
  }

  /* SW9 KLOUZÁNÍ B-ROLLU (S3 f67 až 92, S2)
   * Jemný posun záběru, aby B-roll nestál: +3,2 % šířky, -2,2 % výšky, scale 1,005 za 30 sn. power2.out (S2 jen +0,9 %). */
  function klouzani(tl, el, t, o = {}) {
    const dx = o.dx ?? 0.032, dy = o.dy ?? -0.022, s = (o.s ?? 1.005) * (o.zaklad ?? 1.04);
    MK.tw(tl, el, { x: 0, y: 0, scale: o.zaklad ?? 1.04 }, { x: MK.w(dx), y: MK.h(dy), scale: s }, t, o.n ?? R(25), { ease: p2out });
  }

  /* SW2 JMÉNO PO PÍSMENECH (S1 f2 až 14)
   * 128 px Medium (11,9 % výšky), střed y 57 %, tracking -0,035 em. Písmena v náhodném pořadí (semínko), každé průhlednost
   * za 2,4 sn. a doostření 12 px za 7 sn., starty rozložené přes 6 sn. (u delších jmen přes 1 sn. na písmeno),
   * jedno písmeno na konci na 1 sn. ztlumené na 50 % (originál W ve f10). Jméno člověka ano, značku nikdy (pravidla). */
  function jmeno(tl, rodic, slovo, t, o = {}) {
    const el = text(rodic, { px: o.px ?? 0.15, y: o.y ?? 0.56 });
    el.style.letterSpacing = "-0.035em";
    const pis = [...slovo].map((c) => {
      const sp = MK.div(el, c === " " ? "mez" : "pi"); if (c !== " ") sp.textContent = c; return sp;
    }).filter((s) => s.className === "pi");
    const rnd = MK.rng(o.seed ?? 7), poradi = pis.map((p, i) => [rnd(), i]).sort((a, b) => a[0] - b[0]).map((x) => x[1]);
    const rozpeti = Math.max(6, pis.length * 1.0);
    MK.ukaz(tl, el, t);
    poradi.forEach((i, k) => {
      const ts = t + F(2.4 + (rozpeti * k) / Math.max(1, pis.length - 1));
      MK.tw(tl, pis[i], { opacity: 0 }, { opacity: 1 }, ts, 2.4, { ease: "cruise" });
      MK.tw(tl, pis[i], { filter: "blur(12px)" }, { filter: "blur(0px)" }, ts, 7, { ease: p2out });
    });
    const bl = pis[poradi[Math.floor(pis.length / 2)]], tb = t + F(2.4 + rozpeti + 2.4);
    MK.nastav(tl, bl, { opacity: 0.5 }, tb); MK.nastav(tl, bl, { opacity: 1 }, tb + F(1));
    if (o.t1 != null) pryc(tl, el, o.t1);
    return el;
  }

  /* SW3 PODTITUL POD JMÉNEM (S1 f23 až 28)
   * Originál kurzíva 49 px, u nás Instrument Serif rovný o 18 % větší (menší výška písmen), střed y 66,5 % (originál 64,5 %, níž kvůli dolním dotažním jmen).
   * Všechna slova naráz: průhlednost a doostření 6 px za 6 sn., bez posunu. */
  function podtitul(tl, rodic, slovo, t, o = {}) {
    const el = text(rodic, { px: (o.px ?? 0.064) * 1.18, y: o.y ?? 0.685, trida: "serif" });
    el.textContent = slovo;
    MK.ukaz(tl, el, t); doostri(tl, el, t, { nOp: 6, nBl: 6, blur: 6 });
    if (o.t1 != null) pryc(tl, el, o.t1);
    return el;
  }

  /* SW4 TITULEK PO SLOVECH V PEVNÉM ROZLOŽENÍ (S2 f38 až 58, S4, S5)
   * Celá věta je v rozložení od začátku (nic se nepřeskupuje), slova se jen odkrývají snímek před svým časem w.t:
   * průhlednost za 3,6 sn. (krátká slova) až 7 sn. (dlouhá), doostření 14 px za 8,4 sn. power2.out.
   * Bold (originál Semibold 600) 94 px (8,7 %) u prvního B-rollu, 82 px (7,6 %) dál, střed y 49 %. Konec tvrdě se střihem. */
  function titulek(tl, rodic, slova, o = {}) {
    const el = text(rodic, { px: o.px ?? 0.11, y: o.y ?? 0.49, trida: "tucne" + (o.tma ? " tma" : "") });
    const spany = slovaDo(el, slova);
    MK.ukaz(tl, el, Math.max(0, slova[0].t - F(1)));
    slova.forEach((s, i) => doostri(tl, spany[i], Math.max(0, s.t - F(1)), { nOp: (s.w || "logo").length <= 4 ? 3.6 : s.w.length <= 8 ? 5 : 7 }));
    boxy(tl, el, slova);
    if (o.t1 != null) pryc(tl, el, o.t1);
    return el;
  }
  // SW6 červený box pod slovy: roste zleva 12 sn. power2.out od prvního slova v boxu, ostré rohy
  function boxy(tl, el, slova) {
    const prvni = slova.find((s) => s.box);
    el.querySelectorAll(".sw-box > .pod").forEach((pod) => MK.tw(tl, pod, { scaleX: 0 }, { scaleX: 1 }, Math.max(0, prvni.t - F(1)), 12, { ease: p2out }));
  }

  /* SW5 FRÁZE S TVRDOU VÝMĚNOU (S6 f215 až 339)
   * A-roll: celá fráze 2 až 4 slova naskočí v jednom snímku (bez prolnutí) a zmizí, když přijde další. Medium 74 px (6,9 %),
   * střed y 59 %. Důrazová fráze (duraz: true) 98 px Bold (9,1 %) a slova po jednom jako SW4. Slovo s box: true = SW6.
   * fraze: [{ slova: [{w, t, box}], t0, t1, duraz }], t0 výchozí = první slovo, t1 výchozí = začátek další fráze. */
  function fraze(tl, rodic, seznam, o = {}) {
    return seznam.map((f, k) => {
      const t0 = f.t0 ?? Math.max(0, f.slova[0].t - F(1)), t1 = f.t1 ?? (seznam[k + 1] ? (seznam[k + 1].t0 ?? seznam[k + 1].slova[0].t - F(1)) : o.t1);
      const duraz = f.duraz || f.slova.some((s) => s.box);
      const el = text(rodic, { px: duraz ? (o.pxDuraz ?? 0.12) : (o.px ?? 0.09), y: o.y ?? 0.59, trida: (duraz ? "tucne" : "") + (o.tma ? " tma" : "") });
      const spany = slovaDo(el, f.slova);
      MK.ukaz(tl, el, t0);
      if (duraz) f.slova.forEach((s, i) => doostri(tl, spany[i], Math.max(t0, s.t - F(1)), { nOp: 3.6 }));
      else spany.forEach((sp) => MK.nastav(tl, sp, { opacity: 1 }, t0));
      boxy(tl, el, f.slova.some((s) => s.box) ? f.slova : [{ t: 0 }]);
      if (t1 != null) pryc(tl, el, t1);
      return el;
    });
  }

  /* SW7 POČÍTADLO (S3 f69 až 100)
   * Bold 130 px (12 % výšky), střed y 50 %. Nástup průhlednost a doostření 3,6 sn., pak expo doběh z 0 na cílovou hodnotu
   * za 20 sn. (originál f70 až 87, po 3 sn. už 48,5 %), během počítání vodorovné rozmazání pohybem (SVG filtr, 12 px > 0).
   * Každý snímek má vlastní span (seek safe), čísla v české podobě s mezerami. Jednotka za číslem Instrument Serif,
   * naskočí v tZa posunem 6 px a průhledností za 8 sn. a místo pro ni je v rozložení od začátku (číslo neposkočí). */
  let filtry = null;
  function rozmazaniFiltry() {
    if (filtry) return filtry;
    const ns = "http://www.w3.org/2000/svg", svg = document.createElementNS(ns, "svg");
    svg.setAttribute("width", 0); svg.setAttribute("height", 0); svg.style.position = "absolute";
    filtry = [12, 9, 6, 3, 1.5].map((s, i) => {
      const f = document.createElementNS(ns, "filter"); f.id = "swmb" + i;
      f.setAttribute("x", "-20%"); f.setAttribute("width", "140%");
      const g = document.createElementNS(ns, "feGaussianBlur"); g.setAttribute("stdDeviation", `${s} 0`);
      f.appendChild(g); svg.appendChild(f); return `url(#swmb${i})`;
    });
    document.body.appendChild(svg);
    return filtry;
  }
  // české číslo s nezlomitelnou mezerou po tisících (toLocaleString v renderu nemá české ICU, úzká U+202F v HN chybí)
  const cesky = (v, des = 0) => { const [c, d] = Math.abs(v).toFixed(des).split("."); return (v < 0 ? "-" : "") + c.replace(/\B(?=(\d{3})+(?!\d))/g, "\u00A0") + (d ? "," + d : ""); };
  function pocitadlo(tl, rodic, t, o = {}) {
    const cil = o.do ?? 4000000, n = o.n ?? 20, k = o.k ?? 0.183, fl = rozmazaniFiltry();
    const el = text(rodic, { px: o.px ?? 0.15, y: o.y ?? 0.5, trida: "sw-cislo" + (o.tma ? " tma" : "") });
    const pred = o.pred ?? "", za = o.za ?? "";
    const cisla = MK.div(el, ""); cisla.style.display = "inline-grid";
    const kroky = [];
    for (let i = 0; i <= n; i++) {
      const v = i === n ? cil : cil * (1 - Math.exp(-k * i)) / (1 - Math.exp(-k * n));
      const sp = MK.div(cisla, ""); sp.style.gridArea = "1 / 1"; sp.style.visibility = "hidden";
      sp.textContent = pred + cesky(i === n ? cil : Math.round(v / (o.zaokrouhli ?? 1)) * (o.zaokrouhli ?? 1), o.des ?? 0);
      kroky.push(sp);
    }
    cisla.style.justifyItems = "center";
    let jed = null;
    if (za) { el.appendChild(Object.assign(document.createElement("span"), { className: "mez" })); jed = MK.div(el, "jed"); jed.textContent = za; jed.style.fontSize = "0.42em"; }
    MK.ukaz(tl, el, t);
    doostri(tl, el, t, { nOp: 3.6, nBl: 3.6, blur: 10 });
    const t0 = t + F(R(1));
    kroky.forEach((sp, i) => {
      MK.nastav(tl, sp, { visibility: "visible", filter: i < n - 3 ? fl[Math.min(fl.length - 1, Math.floor(i / 3))] : "none" }, t0 + F(i));
      if (i < n) MK.nastav(tl, sp, { visibility: "hidden" }, t0 + F(i + 1));
    });
    if (jed) {
      const tz = o.tZa ?? t0 + F(n + R(6));
      MK.tw(tl, jed, { opacity: 0, y: 6 }, { opacity: 1, y: 0 }, tz, R(7), { ease: p2out });
    }
    if (o.t1 != null) pryc(tl, el, o.t1);
    return el;
  }

  /* SW8 TRIPTYCH HARMONIKA (S5 f171 až 198)
   * Zleva přijede panel 1 (zrychluje, tvrdě stojí na třetině šířky, 13 sn.), hned za ním panel 2 (zpomaluje do dvou třetin,
   * 18 sn. power3.out). Aktuální záběr zbývá jako třetí panel: posune se tak, aby jeho střed i titulek seděly ve volném místě.
   * panely: [{ media: video|img, text: "3 miliardy" (nebo "řádek\nřádek"), x: 0..1 posun výřezu }], zaber = kontejner aktuálního záběru. */
  function triptych(tl, rodic, panely, zaber, t, o = {}) {
    const W = MK.W, tre = W / 3, n1 = R(11), n2 = R(15), t2 = t + F(n1);
    const prvky = panely.slice(0, 2).map((p, i) => {
      const el = MK.div(rodic, "sw-panel"); el.style.left = (i ? tre : 0) + "px"; el.style.width = "0px";
      el.appendChild(p.media); p.media.style.width = tre + "px"; p.media.style.left = "50%"; p.media.style.transform = "translateX(-50%)";
      p.media.style.objectPosition = `${(p.x ?? 0.5) * 100}% 50%`;
      if (p.text) {
        const tx = text(el, { px: o.px ?? 0.082, y: 0.49, trida: "tucne" }); tx.style.whiteSpace = "pre"; tx.style.lineHeight = "1.05";
        tx.style.left = "50%"; tx.style.right = "auto"; tx.style.width = tre + "px"; tx.style.marginLeft = -tre / 2 + "px"; tx.textContent = p.text;
      }
      return el;
    });
    // panel roste šířkou, obsah drží střed panelu (výřez cover se posouvá s ním)
    const roste = (el, t0, n, ease) => {
      MK.ukaz(tl, el, t0);
      MK.tw(tl, el, { width: 0 }, { width: tre }, t0, n, { ease });
    };
    roste(prvky[0], t, n1, "power2.in");
    roste(prvky[1], t2, n2, p3out);
    MK.tw(tl, zaber, { x: 0 }, { x: tre / 2 }, t, n1, { ease: "power2.in" });
    MK.tw(tl, zaber, { x: tre / 2 }, { x: tre }, t2, n2, { ease: p3out });
    if (o.t1 != null) prvky.forEach((el) => pryc(tl, el, o.t1));
    return prvky;
  }

  /* SW10 KALENDÁŘ (S7 f340 až 453)
   * Tmavý týden (7 dní, hodiny 8 až 19), karty naskočí průhledností za 4 sn. bez posunu po sloupcích zleva a shora,
   * první polovina po 1 sn., zbytek po 2 sn. Celé zoom out 1,36 > 1 za 125 sn. (SW1 kalendar) s doostřením 3 px za 7 sn.
   * V tVyber se vybrané karty (vyber: true) za 13 sn. zbarví do akcentu, ostatní ztlumí na 55 %. Dnešní den v červeném kruhu.
   * o.dny: ["Po 21", ...], o.dnes: index, o.karty: [{den, od, do, text, cas, vyber}] (hodiny jako čísla, 9.5 = 9:30). */
  function kalendar(tl, rodic, t, t1, o = {}) {
    const el = MK.div(rodic, "sw-kal"), ram = MK.div(el, "sw-kal-ram");
    const dny = o.dny || ["Po 21", "Út 22", "St 23", "Čt 24", "Pá 25", "So 26", "Ne 27"], h0 = o.od ?? 8, h1 = o.do ?? 19;
    const rw = MK.W * 0.725, rh = MK.H * 0.75, hlava = rh * 0.09, sl = rw / 7, hod = (rh - hlava) / (h1 - h0);
    dny.forEach((d, i) => {
      const hl = MK.div(ram, "sw-kal-hlava"); hl.style.left = i * sl + "px"; hl.style.width = sl + "px";
      const [a, b] = d.split(" "); hl.innerHTML = `${a} <b class="${i === (o.dnes ?? 3) ? "dnes" : ""}">${b}</b>`;
    });
    for (let h = h0; h <= h1; h++) {
      const y = hlava + (h - h0) * hod, c = MK.div(ram, "sw-kal-cara"); c.style.top = y + "px";
      if (h < h1) { const l = MK.div(ram, "sw-kal-hod"); l.style.top = y + 4 + "px"; l.textContent = `${h}:00`; }
    }
    const karty = (o.karty || []).slice().sort((a, b) => a.den - b.den || a.od - b.od).map((k) => {
      const c = MK.div(ram, "sw-kal-karta");
      Object.assign(c.style, { left: k.den * sl + 6 + "px", width: sl - 12 + "px", top: hlava + (k.od - h0) * hod + 3 + "px", height: (k.do - k.od) * hod - 6 + "px" });
      c.innerHTML = `${k.text}${k.cas ? `<i>${k.cas}</i>` : ""}`; c._k = k; return c;
    });
    MK.ukaz(tl, el, t);
    zoomVen(tl, el, t, { typ: "kalendar" });
    MK.tw(tl, el, { filter: "blur(3px)" }, { filter: "blur(0px)" }, t, R(6), { ease: p2out });
    const pul = Math.ceil(karty.length / 2);
    karty.forEach((c, i) => MK.tw(tl, c, { opacity: 0 }, { opacity: 1 }, t + F(R(2) + (i < pul ? i : pul + (i - pul) * 2)), 4, { ease: "cruise" }));
    if (o.tVyber != null) karty.forEach((c) => {
      if (c._k.vyber) MK.tw(tl, c, { backgroundColor: tok("--sw-karta"), color: tok("--sw-karta-text") },
        { backgroundColor: tok("--sw-akcent"), color: tok("--sw-bila") }, o.tVyber, R(11), { ease: "softInOut" });
      else MK.tw(tl, c, { opacity: 1 }, { opacity: 0.55 }, o.tVyber, R(11), { ease: "softInOut" });
    });
    if (t1 != null) pryc(tl, el, t1);
    return el;
  }

  /* SW11 KARTA S KOLEJNICÍ (S8 f453 až 599)
   * Šedé vinětované pozadí, karta 59,8 x 60 % (x 20,2 %, y 16,7 %), rohy 52 px, vlevo papír s rozmazanou osnovou dokumentu,
   * vpravo záběr (video). Vstup: karta vyplní obraz (1,67) a zmenší se za 29 sn. power3.out, rohy se zakulatí.
   * Nadpis 75 px Bold (7 %) sjede shora od 6 sn. za 14 sn., kolejnice vyjede zdola od 10 sn. za 11 sn. (power2.out).
   * Kroky: starý nadpis zmizí za 2,4 sn., nový naskočí průhledností za 12 sn. od +3,6 sn., dokument se vymění tvrdě,
   * aktivní uzel se zbarví za 6 sn., popisek pod ním po slovech.
   * o.kroky: [{ text: "kontakty", nadpis: "co jinak nezíská", t }] (t null = jen popisek na kolejnici bez aktivace) */
  function karta(tl, rodic, media, t, t1, o = {}) {
    const W = MK.W, H = MK.H, el = MK.div(rodic, "sw-sede");
    const kw = W * 0.598, kh = H * 0.6, kx = W * 0.202, ky = H * 0.167;
    const k = MK.div(el, "sw-karta"); Object.assign(k.style, { left: kx + "px", top: ky + "px", width: kw + "px", height: kh + "px" });
    const lev = MK.div(k, "pul"), prav = MK.div(k, "pul p"); prav.appendChild(media);
    const kroky = o.kroky || [], rnd = MK.rng(o.seed ?? 3);
    const doky = [null, ...kroky].map(() => {
      const d = MK.div(lev, "sw-dok"); d.style.visibility = "hidden";
      d.innerHTML = `<b class="h"></b>` + Array.from({ length: 11 }, () => `<b class="${rnd() < 0.18 ? "a" : ""}" style="width:${Math.round(55 + rnd() * 45)}%"></b>`).join("");
      return d;
    });
    const nad = (s) => { const n = MK.div(el, "sw-nadpis"); n.style.fontSize = H * 0.085 + "px"; n.style.top = H * 0.11 + "px"; n.style.transform = "translateY(-50%)"; n.textContent = s; return n; };
    const nadpisy = [nad(o.nadpis || ""), ...kroky.map((s) => nad(s.nadpis || o.nadpis || ""))];
    nadpisy.slice(1).forEach((n) => (n.style.opacity = 0));
    // kolejnice y 82,6 %, x 23,1 až 76,9 %, uzly 6,4 % výšky
    const kol = MK.div(el, "sw-kolej"), x0 = W * 0.231, x1 = W * 0.769, ky2 = H * 0.826, d = H * 0.064;
    Object.assign(kol.style, { left: x0 + "px", width: x1 - x0 + "px", top: ky2 + "px" }); MK.div(kol, "cara");
    const uzly = kroky.map((s, i) => {
      const x = kroky.length > 1 ? ((x1 - x0) * i) / (kroky.length - 1) : (x1 - x0) / 2;
      const u = MK.div(kol, "sw-uzel"); Object.assign(u.style, { left: x + "px", width: d + "px", height: d + "px" }); MK.div(u, "tecka");
      const p = MK.div(kol, "sw-uzel-pop"); Object.assign(p.style, { left: x + "px", top: d * 0.75 + "px", fontSize: H * 0.045 + "px" });
      const sl = slovaDo(p, s.text.split(" ").map((w) => ({ w })));
      return { u, sl };
    });
    MK.ukaz(tl, el, t);
    MK.nastav(tl, doky[0], { visibility: "visible" }, t);
    // vstup: karta 1,67 vyplní obraz (střed karty posunutý o 36 px nad středem snímku), rohy 0 > 52 px
    gsap.set(k, { transformOrigin: "50% 50%" });
    MK.tw(tl, k, { scale: 1.67, y: H * 0.5 - (ky + kh / 2), borderRadius: 0 }, { scale: 1, y: 0, borderRadius: 52 }, t, R(24), { ease: p3out });
    MK.tw(tl, nadpisy[0], { y: -110 }, { y: 0 }, t + F(R(5)), R(12), { ease: p2out });
    MK.tw(tl, kol, { y: 110 }, { y: 0 }, t + F(R(8)), R(9), { ease: p2out });
    uzly.forEach(({ sl }) => sl.forEach((s) => MK.nastav(tl, s, { opacity: 1 }, t)));
    kroky.forEach((s, i) => {
      if (s.t == null) return;
      const st = nadpisy[i], nv = nadpisy[i + 1];
      MK.tw(tl, st, { opacity: 1 }, { opacity: 0 }, s.t, 2.4, { ease: "cruise" });
      MK.tw(tl, nv, { opacity: 0.2, filter: "blur(4px)" }, { opacity: 1, filter: "blur(0px)" }, s.t + F(3.6), 12, { ease: "cruise" });
      MK.nastav(tl, doky[i], { visibility: "hidden" }, s.t); MK.nastav(tl, doky[i + 1], { visibility: "visible" }, s.t);
      MK.tw(tl, uzly[i].u.firstChild, { opacity: 0 }, { opacity: 1 }, s.t + F(R(2)), 6, { ease: "softInOut" });
      if (i > 0) MK.tw(tl, uzly[i - 1].u.firstChild, { opacity: 1 }, { opacity: 0 }, s.t + F(R(2)), 6, { ease: "softInOut" });
    });
    if (t1 != null) pryc(tl, el, t1);
    return el;
  }

  /* SW12 PAPÍR TLAČÍ KAMERU (S9 f600 až 639) a SW13 PODTRŽENÍ FIXKOU (f642 až 675)
   * Papír zleva přes celou výšku do půlky šířky po změřené křivce (tabulka po snímcích originálu, 48 sn.), záběr se zároveň
   * posune doprava o 20 % šířky stejnou křivkou. Nadpis je na papíře u jeho pravé hrany (přijede s ním), x 9,4 %, y 10,7 %,
   * výška verzálek 5,1 %. Originál psaný fixkou, u nás Helvetica Bold verzálkami (jen naše písma).
   * Podtržení: tah 1 přes 60 % nadpisu za 11 sn. power2.out, tah 2 přes celou šířku a kus dál, silnější, za 14 sn. */
  const PAPIR25 = [0, 0, 0.4, 0.9, 1.7, 2.8, 4.2, 5.9, 7.9, 10.2, 12.7, 15.3, 18.1, 20.9, 23.5, 26.1, 28.6, 30.9, 33.0, 34.9, 36.6, 38.3, 39.8,
    41.1, 42.3, 43.4, 44.4, 45.2, 46.0, 46.7, 47.3, 47.9, 48.4, 48.8, 49.1, 49.4, 49.6, 49.8, 49.9, 50, 50];
  function prubeh30(tab) {   // tabulka po snímcích 25 fps převzorkovaná na 30 fps, normovaná 0..1
    const n = Math.round((tab.length - 1) * 1.2), max = tab[tab.length - 1];
    return Array.from({ length: n + 1 }, (_, i) => { const x = i / 1.2, a = Math.floor(x), b = Math.min(tab.length - 1, a + 1); return (tab[a] + (tab[b] - tab[a]) * (x - a)) / max; });
  }
  function papir(tl, rodic, zaber, t, o = {}) {
    const W = MK.W, H = MK.H, el = MK.div(rodic, "sw-papir"), sir = W * (o.sirka ?? 0.5);
    const vnitrek = MK.div(el, ""); Object.assign(vnitrek.style, { position: "absolute", top: 0, bottom: 0, right: 0, width: sir + "px" });
    const nd = MK.div(vnitrek, "sw-ruka"); nd.textContent = o.nadpis || "";
    Object.assign(nd.style, { left: W * 0.094 + "px", top: H * 0.107 + "px", fontSize: (H * 0.066) / 0.714 + "px", transform: "translateY(-50%)" });
    const p = prubeh30(PAPIR25), posun = W * (o.posun ?? 0.2);
    MK.ukaz(tl, el, t);
    MK.tabulka(tl, el, t, "width", p.map((v) => v * sir), "px");
    if (zaber) MK.tabulka(tl, zaber, t, "x", p.map((v) => v * posun));
    const tah = o.tah1 ?? t + F(R(42)), tah2 = o.tah2 ?? t + F(R(64));
    podtrzeni(tl, vnitrek, nd, tah, tah2, o);
    if (o.t1 != null) pryc(tl, el, o.t1);
    return el;
  }
  // tahy jsou SVG v kontejneru pod nadpisem (šířky v % nadpisu, nezávislé na načtení písma), odkrývají se zleva ořezem
  function podtrzeni(tl, rodic, nad, t1, t2, o = {}) {
    const ns = "http://www.w3.org/2000/svg", H = MK.H, rnd = MK.rng(o.seed ?? 11);
    const tah = (od, kam, dy, sila, t, n) => {
      const ob = MK.div(nad, "");
      Object.assign(ob.style, { position: "absolute", left: od * 100 + "%", width: (kam - od) * 100 + "%", top: `calc(100% + ${H * 0.012 + dy}px)`, height: H * 0.03 + "px" });
      const svg = document.createElementNS(ns, "svg"); svg.setAttribute("viewBox", "0 0 100 10"); svg.setAttribute("preserveAspectRatio", "none");
      Object.assign(svg.style, { left: 0, top: 0, width: "100%", height: "100%" });
      const body = Array.from({ length: 7 }, (_, i) => [(i / 6) * 100, 3 + (i / 6) * 3 + (rnd() - 0.5) * 2]);
      const pth = document.createElementNS(ns, "path");
      pth.setAttribute("d", "M" + body.map((b) => b.map((v) => v.toFixed(2)).join(" ")).join(" L"));
      pth.setAttribute("stroke-width", sila); pth.setAttribute("vector-effect", "non-scaling-stroke");
      svg.appendChild(pth); ob.appendChild(svg);
      MK.nastav(tl, ob, { clipPath: "inset(-50% 100% -50% 0%)" }, 0);
      MK.tw(tl, ob, { clipPath: "inset(-50% 100% -50% 0%)" }, { clipPath: "inset(-50% 0% -50% 0%)" }, t, n, { ease: p2out });
    };
    tah(-0.01, 0.6, 0, H * 0.0056, t1, R(9));
    tah(-0.02, 1.08, H * 0.012, H * 0.0075, t2, R(12));
  }

  /* ZÁBĚR: kontejner pro klip a jeho texty, zapne se tvrdě v t a vypne v t1 (každý střih tvrdý) */
  function zaber(tl, rodic, media, t, t1) {
    const el = MK.div(rodic, "sw-zaber");
    if (media) el.appendChild(media);
    MK.ukaz(tl, el, t);
    if (t1 != null) pryc(tl, el, t1);
    return el;
  }

  // popisek komponenty jen pro showcase a knihovnu
  function popisek(tl, rodic, text, t0, t1) {
    const d = MK.div(rodic, "sw-popisek"); d.textContent = text;
    MK.ukaz(tl, d, t0); MK.skryj(tl, d, t1);
    return d;
  }

  window.SW = { F, R, ZOOMY, zaber, zoomVen, klouzani, jmeno, podtitul, titulek, fraze, pocitadlo, triptych, kalendar, karta, papir, podtrzeni, doostri, popisek };
})();
