/* Elaine kit (window.EK): komponenty z reelu DdmDn6_A8wu (elaineempalmado), změřené po snímcích, rozbor v
 * ~/Documents/inspirace-reels/_rozbor/DdmDn6_A8wu/ZARIZENI.md. Styl: béžová deska, tmavě zelená typografie, drobné bílé titulky
 * na hrudi mluvčí a jedno krémové serifové slovo za větu. Barvy přes proměnné --ek-* (elaine-kit.css), délky ve snímcích (30 fps).
 * Potřebuje MK (mason-kit.js) kvůli MK.F, MK.div, MK.rng.
 */
(function () {
  const F = (n) => n / 30;
  const lerp = (a, b, q) => a + (b - a) * q;
  const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const mix = (a, b, q) => { const A = hex(a), B = hex(b); return "#" + A.map((x, i) => Math.round(lerp(x, B[i], q)).toString(16).padStart(2, "0")).join(""); };
  // tabulka hodnot po snímcích, mezi zadanými snímky lineárně
  // barvy motivu z CSS proměnných --ek-* (elaine-kit.css); motiv Beyond = třída .ek-beyond na předkovi
  const v = (el, jm, z) => { const x = el && getComputedStyle(el).getPropertyValue("--ek-" + jm).trim(); return x || z; };
  const tab = (body) => (f) => { if (f <= body[0][0]) return body[0][1]; for (let i = 1; i < body.length; i++) if (f <= body[i][0]) { const [f0, v0] = body[i - 1], [f1, v1] = body[i]; return lerp(v0, v1, (f - f0) / (f1 - f0)); } return body[body.length - 1][1]; };

  /* Z4 slovo na desce: vyjede o 29 px zdola, rozmazané 8 px, průhledné a šedozelené, za 18 sn. na místě (měřeno "he" f443 až f461) */
  const Z4_Y = [29, 26, 23, 21, 17, 15, 13, 12, 10, 8, 6, 5, 4, 3, 2, 1, 1, 0];
  const Z4_BLUR = [8, 6.5, 5, 4, 3, 2.2, 1.5, 0.8, 0.3, 0];
  const Z4_O = [0.19, 0.53, 0.65, 0.8, 0.85, 0.9, 0.93, 0.96, 0.98, 0.99, 1];
  function slovoDesky(tl, el, t, o = {}) {
    const z = o.barvaOd || v(el, "ink-od", "#8d9684"), k = o.barva || getComputedStyle(el).color || v(el, "ink", "#193326"), sk = o.mira || 1;
    tl.set(el, { visibility: "hidden" }, 0); tl.set(el, { visibility: "visible" }, t);
    for (let i = 0; i < 18; i++) tl.set(el, { y: Z4_Y[i] * sk, filter: `blur(${Z4_BLUR[Math.min(i, 9)]}px)`, opacity: Z4_O[Math.min(i, 10)], color: i >= 12 ? k : mix(z, toHex(k), i / 12) }, t + F(i));
  }
  function toHex(c) { if (c.startsWith("#")) return c.length === 4 ? "#" + [1, 2, 3].map((i) => c[i] + c[i]).join("") : c; const m = c.match(/\d+/g); return m ? "#" + m.slice(0, 3).map((x) => (+x).toString(16).padStart(2, "0")).join("") : "#193326"; }
  // titulek z řádků: [[[slovo, čas, styl], ...], ...], styl "i" serif kurzíva, "s" serif tučné, "v" větší; vrací kontejner
  function titulekDesky(tl, rodic, radky, o = {}) {
    const k = MK.div(rodic, "ek-tit", ""); if (o.styl) Object.assign(k.style, o.styl);
    radky.forEach((r) => {
      const d = document.createElement("div"); d.className = "ek-tit-radek"; k.appendChild(d);
      r.forEach(([w, t, st]) => { const s = document.createElement("span"); s.textContent = w; if (st) s.className = "ek-" + st; d.appendChild(s); slovoDesky(tl, s, t, { barva: o.barva }); });
    });
    tl.set(k, { visibility: "visible" }, 0);
    return k;
  }

  /* Z5 karta s číslem bodu: z barvy desky do --ek-cislo za 30 sn. (9 kroků, u Elaine béžová > zelená), měřítko 1,08 > 1 a posun 55 px nahoru exp dojezdem (21 sn.) */
  const Z5_BARVY = ["#c0bca5", "#a8aa94", "#84907b", "#637c66", "#4f6953", "#3b5944", "#2f4c3a", "#1f3c2b", "#193326"];
  const Z5_Y = [45, 36, 30, 25, 21, 18, 15, 13, 11, 9, 7, 6, 5, 4, 3, 3, 2, 1, 1, 0, 0].map((v) => (v / 45) * 55);
  function cisloKarty(tl, el, t, o = {}) {
    tl.set(el, { visibility: "hidden" }, 0); tl.set(el, { visibility: "visible" }, t);
    const od = v(el, "cislo-od", null), na = v(el, "cislo", null), barvy = od && na ? Z5_BARVY.map((_, j) => mix(toHex(od), toHex(na), j / 8)) : Z5_BARVY;
    for (let i = 0; i < 30; i++) {
      const p = { color: barvy[Math.min(8, Math.floor((i * 9) / 30))] };
      if (i < 21) Object.assign(p, { y: Z5_Y[i] * (o.mira || 1), scale: 1 + 0.08 * (Z5_Y[i] / 55) });
      tl.set(el, p, t + F(i));
    }
  }
  /* Z5 push-in celé skupiny 1 > 1,25 za 39 sn. (měřeno top #1: 320 > 266, nepravidelně rychlejší na začátku) */
  const Z5_PUSH = tab([[0, 0], [6, 0.093], [9, 0.278], [12, 0.5], [15, 0.648], [18, 0.759], [21, 0.833], [24, 0.87], [27, 0.926], [30, 0.944], [33, 0.963], [36, 0.981], [39, 1]]);
  function pushIn(tl, el, t, o = {}) {
    const od = o.od || 1, na = o.na || 1.25, n = o.n || 39;
    tl.set(el, { transformOrigin: o.origin || "50% 52%" }, t);
    for (let i = 0; i <= n; i++) tl.set(el, { scale: lerp(od, na, Z5_PUSH((i * 39) / n)) }, t + F(i));
  }

  /* Z6 pulz desky: béžová se za 3 sn. zvedne o +10 až +14 a za 6 sn. vrátí (vydechnutí na střihu) */
  function pulz(tl, deska, t, o = {}) {
    const z = toHex(o.z || v(deska, "deska", "#ebdfcf")), na = toHex(o.na || v(deska, "deska-pulz", "#f3f0e1"));
    [0.45, 0.85, 1, 0.8, 0.6, 0.4, 0.22, 0.08, 0].forEach((q, i) => tl.set(deska, { backgroundColor: mix(z, na, q) }, t + F(i)));
  }

  /* Z3 titulky na hrudi: drobné bílé 62 px na středu hrudi, mění se tvrdě; serifové krémové slovo naskočí za 5 sn.
   * skupiny: [{ s: "every offer owner", t, konec, y }, { serif: "needs", t, konec, y }] */
  function hrud(tl, rodic, skupiny, o = {}) {
    skupiny.forEach((g) => {
      const e = MK.div(rodic, g.serif ? "ek-hrud-serif" : "ek-hrud", g.serif || g.s);
      if (g.y != null) e.style.top = g.y + "px"; if (g.x != null) { e.style.left = g.x + "px"; e.style.transform = "translateX(-50%)"; }
      if (g.vel) e.style.fontSize = g.vel + "px";
      tl.set(e, { visibility: "hidden" }, 0); tl.set(e, { visibility: "visible" }, g.t);
      if (g.serif) [0, 0.04, 0.25, 0.58, 0.94, 1].forEach((q, i) => tl.set(e, { opacity: q }, g.t + F(i)));
      if (g.zesedi) [0.4, 0.55, 0.7, 0.85, 1].forEach((q, i) => tl.set(e, { opacity: q }, g.t + F(i)));
      tl.set(e, { visibility: "hidden" }, g.konec);
    });
  }

  /* Z7 tři zelené karty 1 2 3 v pravé horní čtvrtině: fade 5 sn. + 8 px shora, po 5 až 6 sn., odchod všech za 2 sn. */
  function zeleneKarty(tl, rodic, t, konec, o = {}) {
    const x = o.x || [1128, 1395, 1648], y = o.y || 263, casy = o.casy || [0, 5, 11];
    const karty = x.map((xx, i) => { const k = MK.div(rodic, "ek-zk", String(i + 1)); Object.assign(k.style, { left: xx + "px", top: y + "px" }); return k; });
    karty.forEach((k, i) => {
      tl.set(k, { visibility: "hidden" }, 0); const tt = t + F(casy[i]); tl.set(k, { visibility: "visible" }, tt);
      [[0.15, -8], [0.4, -6], [0.75, -3], [1, -1], [1, 0]].forEach(([op, dy], j) => tl.set(k, { opacity: op, y: dy }, tt + F(j)));
      [[0.6], [0.25], [0]].forEach(([op], j) => tl.set(k, { opacity: op }, konec + F(j)));
    });
    return karty;
  }

  /* Z9 reely z rozmazání: blur 25 px a šedá, za 12 sn. ostré a barevné */
  function zRozmazani(tl, els, t, o = {}) {
    const n = o.n || 12;
    for (let i = 0; i <= n; i++) { const q = 1 - Math.pow(1 - i / n, 2.2); tl.set(els, { filter: `blur(${(25 * (1 - q)).toFixed(2)}px) saturate(${q.toFixed(2)})` }, t + F(i)); }
  }

  /* Z11 skluz pásu: posuny v px za snímek (měřené tabulky), vrací konečný posun */
  const SKLUZ_A = [-19, -16, -14, -12, -10, -8, -6, -5, -3, 0];
  const SKLUZ_B = [-7, -16, -27, -39, -54, -70, -88, -104, -115, -120, -119, -114, -106, -96, -87, -60, -30, 0];
  function skluz(tl, el, t, kroky, x0 = 0) { let x = x0; kroky.forEach((d, i) => { x += d; tl.set(el, { x }, t + F(i + 1)); }); return x; }

  /* Z14 trychtýř: tři pásy, ikonky lidí, čára z pravého okraje a štítek. Vrací { el, vrstvy: [{ lide, cara, stitek }] } */
  function trychtyr(rodic, o = {}) {
    const W = 560, H = 420, ns = "http://www.w3.org/2000/svg";
    const el = MK.div(rodic, "ek-tr", "");
    const svg = document.createElementNS(ns, "svg"); svg.setAttribute("width", W + 640); svg.setAttribute("height", H + 40); svg.setAttribute("viewBox", `0 0 ${W + 640} ${H + 40}`); svg.style.overflow = "visible"; el.appendChild(svg);
    const pasy = [[0, 140, v(rodic, "pas1", "#6b826e"), 7], [140, 280, v(rodic, "pas2", "#3c5b46"), 4], [280, 420, v(rodic, "pas3", "#1c3629"), 2]], cc = v(rodic, "cara", "#111");
    const sir = (y) => W - (y / H) * (W - 150);
    const vrstvy = pasy.map(([y0, y1, c, n], i) => {
      const g = document.createElementNS(ns, "g"); svg.appendChild(g);
      const x0 = (W - sir(y0)) / 2, x1 = (W - sir(y1)) / 2;
      const p = document.createElementNS(ns, "path"); p.setAttribute("d", `M${x0} ${y0 + 3} L${W - x0} ${y0 + 3} L${W - x1} ${y1 - 3} L${x1} ${y1 - 3}Z`); p.setAttribute("fill", c); g.appendChild(p);
      const lide = document.createElementNS(ns, "g"); g.appendChild(lide);
      const cy = (y0 + y1) / 2, krok = 38;
      for (let k = 0; k < n; k++) { const cx = W / 2 + (k - (n - 1) / 2) * krok; lide.insertAdjacentHTML("beforeend", `<g transform="translate(${cx} ${cy})" fill="${v(rodic, "lide", "#fff")}"><circle cx="0" cy="-9" r="6.5"/><path d="M-11 13 C-11 1 -6 -2 0 -2 C6 -2 11 1 11 13Z"/></g>`); }
      const xr = W - (x0 + x1) / 2 - 8, cara = document.createElementNS(ns, "line");
      cara.setAttribute("x1", xr); cara.setAttribute("y1", cy); cara.setAttribute("x2", xr); cara.setAttribute("y2", cy); cara.setAttribute("stroke", cc); cara.setAttribute("stroke-width", "1.5"); g.appendChild(cara);
      const dot = document.createElementNS(ns, "circle"); dot.setAttribute("cx", xr); dot.setAttribute("cy", cy); dot.setAttribute("r", 4); dot.setAttribute("fill", "none"); dot.setAttribute("stroke", cc); dot.setAttribute("stroke-width", "1.5"); g.appendChild(dot);
      const xk = o.konce ? o.konce[i] : W + 240 - (i === 2 ? 60 : 0);
      const st = MK.div(el, "ek-tr-stitek", (o.stitky || ["low-ticket", "mid-ticket", "high-ticket"])[i]); Object.assign(st.style, { left: xk + 12 + "px", top: cy - 16 + "px" });
      return { lide: [...lide.children], cara, dot, stitek: st, xKonec: xk, xr };
    });
    return { el, vrstvy };
  }
  function trychtyrVrstva(tl, v, t, tStitek) {
    v.lide.forEach((l, i) => { tl.set(l, { opacity: 0 }, 0); [0.3, 0.7, 1].forEach((q, j) => tl.set(l, { opacity: q }, t + F(j + Math.floor(i / 3)))); });
    tl.set([v.cara, v.dot], { opacity: 0 }, 0); tl.set([v.cara, v.dot], { opacity: 1 }, t + F(2));
    for (let i = 1; i <= 4; i++) tl.set(v.cara, { attr: { x2: v.xr + ((v.xKonec - v.xr) * i) / 4 } }, t + F(2 + i));
    tl.set(v.stitek, { visibility: "hidden" }, 0); tl.set(v.stitek, { visibility: "visible" }, tStitek);
    const ink = toHex(getComputedStyle(v.stitek).getPropertyValue("--ek-cara").trim() || "#111111");
    [[0.7, 0.4], [0.55, 0.6], [0.35, 0.8], [0.2, 0.9], [0.08, 1], [0, 1]].forEach(([m, q], i) => tl.set(v.stitek, { color: mix(ink, "#d0d0cc", m), opacity: q }, tStitek + F(i)));
  }

  window.EK = { F, mix, tab, slovoDesky, titulekDesky, cisloKarty, pushIn, pulz, hrud, zeleneKarty, zRozmazani, skluz, SKLUZ_A, SKLUZ_B, trychtyr, trychtyrVrstva };
})();
