/* Lumi kit v2: motion jazyk Lumitris v barvách Beyond, 4:3 1440x1080, 24 fps
 * Seek safe: jedna pozastavená timeline, jen tl.set a tweeny s pevným startem, žádný Math.random ani rAF
 * Časy v plánu jsou SNÍMKY při 24 fps. Takt (12 a 8 fps) dělá až nastroje/takt.py nad hotovým renderem,
 * tady se všechno animuje plynule, aby kroky padly na mřížku taktu.
 * DOM scén, karet, videí a glitchů staví staticky stavba.mjs, kit staví jen texty.
 * Pravidla: skill beyond-reels-lumitris
 */
(function () {
  const W = 1440, H = 1080, FPS = 24;
  const s = (f) => f / FPS;
  gsap.defaults({ lazy: false });
  const $ = (id) => document.getElementById(id);
  const ukaz = (tl, el, f) => tl.set(el, { visibility: "visible" }, s(f));
  const skryj = (tl, el, f) => tl.set(el, { visibility: "hidden" }, s(f));

  // změřené křivky (rozbory bod 3): dojezd = 50 % dráhy za 4 až 8 snímků a dlouhý konec, nájezd do střihu t^2,5
  const EASE = {
    dojezd: "expo.out",
    dojezdK3: (t) => 1 - Math.pow(1 - t, 3),
    najezd: (t) => Math.pow(t, 2.5),
    s: "power3.inOut",
    lin: "none",
  };
  const ease = (e) => (typeof e === "function" ? e : EASE[e] ?? e ?? "none");

  function prvek(tag, cls, rodic, text) {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    if (text != null) el.textContent = text;
    rodic.appendChild(el);
    return el;
  }

  // tah kamery: [z0, z1, od, do, ease] relativně k začátku scény
  function tah(tl, el, f0, t) {
    if (!t) return;
    const [z0, z1, od = 0, doF, e = "lin"] = t;
    tl.set(el, { scale: z0 }, s(f0));
    tl.fromTo(el, { scale: z0 }, { scale: z1, duration: s(doF - od), ease: ease(e), immediateRender: false }, s(f0 + od));
  }
  function posun(tl, el, f0, p) {
    if (!p) return;
    const [x0, y0, x1, y1, od = 0, doF, e = "lin"] = p;
    tl.set(el, { x: x0, y: y0 }, s(f0));
    tl.fromTo(el, { x: x0, y: y0 }, { x: x1, y: y1, duration: s(doF - od), ease: ease(e), immediateRender: false }, s(f0 + od));
  }

  function karty(tl, sc, i) {
    (sc.karty || []).forEach((k, j) => {
      const el = $(`sc${i}k${j}`);
      const blur = k.blur ? ` blur(${k.blur}px)` : "";
      ukaz(tl, el, k.f);
      if (k.skryt) skryj(tl, el, k.skryt);
      tl.set(el, { filter: blur ? blur.trim() : "none" }, 0);
      // první 1 až 2 snímky v negativu (DdsC K3, Dd6 KolazArchiv)
      if (k.neg) {
        tl.set(el, { filter: `invert(1) hue-rotate(180deg)${blur}` }, s(k.f));
        tl.set(el, { filter: blur ? blur.trim() : "none" }, s(k.f + k.neg));
      }
      // karta roste do celého rámu (DdsC K3: 2,95x za 28 snímků, rozjezd 6, dojezd 18)
      if (k.roste) {
        const [f, d, x, y, w, h] = k.roste;
        tl.fromTo(el, { left: k.x, top: k.y, width: k.w, height: k.h }, { left: x, top: y, width: w, height: h, duration: s(d), ease: "power2.inOut", immediateRender: false }, s(f));
      }
      if (k.posun) posun(tl, el, sc.f0, k.posun);
    });
  }

  function okna(tl, sc, i) {
    (sc.okna || []).forEach((o, j) => {
      const el = $(`sc${i}o${j}`);
      // okno roste skokem bez animace (Dd6 OknoSkok: šířka 46, 62, 77 %)
      (o.skoky || []).forEach(([f, w]) => {
        const h = w * (o.h / o.w);
        tl.set(el, { left: o.cx - w / 2, top: o.cy - h / 2, width: w, height: h }, s(f));
      });
    });
  }

  function zavorky(tl, sc, i) {
    const z = sc.zavorky;
    if (!z) return;
    const el = $(`sc${i}zav`);
    ukaz(tl, el, z.f);
    const pos = (w) => ({ left: z.cx - w / 2, top: z.cy - z.h / 2, width: w, height: z.h });
    tl.set(el, pos(z.w0), s(sc.f0));
    // rozšíření S křivkou (DdsC K2: 26 snímků)
    (z.rust || []).forEach(([f, d, w0, w1]) => tl.fromTo(el, pos(w0), { ...pos(w1), duration: s(d), ease: EASE.s, immediateRender: false }, s(f)));
  }

  function serie(tl, sc, i) {
    const r = sc.serie;
    if (!r) return;
    const el = $(`sc${i}ser`);
    ukaz(tl, el, r.f);
    const n = r.obrazy.length;
    const pomer = r.pomer ?? 0.75;
    for (let j = 0; j < n; j++) {
      const f = r.f + j * r.krok;
      const img = $(`sc${i}ser${j}`);
      tl.set(img, { visibility: "visible" }, s(f));
      if (j < n - 1) tl.set(img, { visibility: "hidden" }, s(f + r.krok));
      // karta roste s každým obrazem (Dd6 KartaRoste: výška 44 až 87 %)
      const h = r.h0 + (r.h1 - r.h0) * (n === 1 ? 1 : j / (n - 1));
      const w = h * pomer;
      tl.set(el, { left: r.cx - w / 2, top: r.cy - h / 2, width: w, height: h }, s(f));
    }
  }

  function vyrez(tl, sc, i) {
    const v = sc.vyrez;
    if (!v) return;
    const p = $(`sc${i}post`), st = $(`sc${i}stin`);
    // pan postavy ease out k 3 (DdeSJ VyrezNaBarve: 50 % za 4, 90 % za 10 snímků), stín jede pomaleji
    tl.fromTo(p, { x: v.pan[0] }, { x: v.pan[1], duration: s(v.pan[3] - v.pan[2]), ease: EASE.dojezdK3, immediateRender: false }, s(sc.f0 + v.pan[2]));
    tl.set(p, { x: v.pan[0] }, s(sc.f0));
    tl.fromTo(st, { x: v.pan[0] * 0.75 + v.stin[0], y: v.stin[1] }, { x: v.pan[1] * 0.75 + v.stin[0], y: v.stin[1], duration: s(v.pan[3] - v.pan[2]), ease: EASE.dojezdK3, immediateRender: false }, s(sc.f0 + v.pan[2]));
    tl.set(st, { x: v.pan[0] * 0.75 + v.stin[0], y: v.stin[1] }, s(sc.f0));
  }

  const TEXTY = {
    /* ŘÁDEK ve slotech přes šířku: slovo naskočí celé za 1 snímek, řádek drží do konce fráze, odchod rozostřením */
    radek(tl, t, v) {
      const n = t.sloty ?? 3;
      const st = t.stredy ?? { 2: [0.25, 0.75], 3: [0.18, 0.5, 0.82], 4: [0.15, 0.38, 0.61, 0.85] }[n];
      t.slova.forEach(([txt, f, slot, extra]) => {
        const el = prvek("div", `t stred ${t.styl ?? "serif"} ${t.barva ?? ""} ${extra ?? ""}`, v, txt);
        Object.assign(el.style, { left: st[slot] * W + "px", top: (t.y ?? 0.5 * H) + "px", fontSize: (t.s ?? 104) + "px" });
        if (t.rozmaz && (slot === 0 || slot === n - 1)) el.style.filter = `blur(${t.rozmaz}px)`;
        ukaz(tl, el, f);
        if (t.odchod === "rozostreni") {
          tl.set(el, { filter: "blur(6px)" }, s(t.f1 - 3));
          skryj(tl, el, t.f1);
        } else skryj(tl, el, t.f1);
      });
    },

    /* BLOK grotesku: řádky různých velikostí pod sebou (DdsC K1, K8), každý naskočí celý */
    blok(tl, t, v) {
      let y = t.y;
      t.radky.forEach(([txt, f, sz, styl, barva]) => {
        const el = prvek("div", `t ${styl ?? "sans"} ${barva ?? ""}`, v, txt);
        Object.assign(el.style, { left: t.x + "px", top: y + "px", fontSize: sz + "px" });
        if (t.vpravo) { el.style.left = "auto"; el.style.right = W - t.x + "px"; }
        y += sz * (t.radkovani ?? 0.98);
        ukaz(tl, el, f);
        skryj(tl, el, t.f1);
      });
    },

    /* OBŘÍ SLOVO 1 až 2 snímky, svisle natažené na 70 až 100 % výšky (Dd6 ObriSlovo) */
    obri(tl, t, v) {
      const el = prvek("div", `obri ${t.styl ?? "sans"} ${t.vypln ?? ""}`, v, t.text);
      el.style.fontSize = (t.s ?? 330) + "px";
      tl.set(el, { xPercent: -50, yPercent: -50, scaleY: t.sy ?? 3.2, scaleX: t.sx ?? 1 }, 0);
      ukaz(tl, el, t.f);
      skryj(tl, el, t.f + (t.n ?? 2));
    },

    /* BOX VÝBĚRU: ostrý obdélník roste zleva v krocích taktu, text se odkrývá s ním (Dd6 BoxVyber) */
    box(tl, t, v) {
      const el = prvek("div", `box ${t.barva ?? "cervena"} ${t.styl ?? "sans"}`, v, t.text);
      Object.assign(el.style, { left: t.x + "px", top: t.y + "px", fontSize: (t.s ?? 96) + "px" });
      const kroky = t.kroky ?? [0.34, 0.62, 0.78, 0.88, 0.96, 1];
      ukaz(tl, el, t.f);
      kroky.forEach((k, j) => tl.set(el, { clipPath: `inset(0 ${((1 - k) * 100).toFixed(1)}% 0 0)` }, s(t.f + j * (t.krok ?? 2))));
      skryj(tl, el, t.f1);
    },

    /* ŠTÍTEK JMÉNA: grotesk + serif v jednom řádku na tmavém boxu (DdeSJ MixRezuVeStitku) */
    stitek(tl, t, v) {
      const el = prvek("div", "stitek", v);
      Object.assign(el.style, { left: t.x + "px", top: t.y + "px", fontSize: (t.s ?? 64) + "px" });
      t.casti.forEach(([txt, styl, f]) => {
        const sp = prvek("span", styl, el, txt);
        tl.set(sp, { visibility: "visible" }, s(f));
      });
      ukaz(tl, el, t.casti[0][2]);
      skryj(tl, el, t.f1);
      el.querySelectorAll("span").forEach((sp) => skryj(tl, sp, t.f1));
    },

    /* OUTRO: znak 3x blikne po 1 snímku, pak se zmenší 1,19 na 1,00 expo.out 30 snímků (DdsC K23) */
    outro(tl, t, v) {
      const el = prvek("div", "outro", v);
      el.innerHTML = `<div class="znak"></div><div class="r2">${t.text ?? "Beyond"}</div>`;
      tl.set(el, { xPercent: -50, yPercent: -50, scale: 1.19 }, 0);
      [0, 2, 4].forEach((d) => { ukaz(tl, el, t.f + d); skryj(tl, el, t.f + d + 1); });
      ukaz(tl, el, t.f + 6);
      tl.fromTo(el, { scale: 1.19 }, { scale: 1, duration: s(30), ease: "expo.out", immediateRender: false }, s(t.f + 6));
      skryj(tl, el, t.f1);
    },

    /* ČÍTAČ: hodnota se mění v krocích po 1 až 2 snímcích (Dd6 Citac) */
    citac(tl, t, v) {
      const el = prvek("div", `t stred ${t.styl ?? "serif"}`, v, t.kroky[0][1]);
      Object.assign(el.style, { left: t.x + "px", top: t.y + "px", fontSize: (t.s ?? 300) + "px" });
      ukaz(tl, el, t.kroky[0][0]);
      t.kroky.forEach(([f, txt]) => tl.set(el, { textContent: txt }, s(f)));
      skryj(tl, el, t.f1);
    },
  };

  const LK2 = {
    W, H, FPS, s,
    postav(plan) {
      const tl = gsap.timeline({ paused: true });

      plan.sceny.forEach((sc, i) => {
        const el = $("sc" + i);
        tl.set(el, { display: "block" }, s(sc.f0));
        tl.set(el, { display: "none" }, s(sc.f1));
        // naše záběry (A-roll) a klientovy předměty se nepřebarvují: celkový grade se během scény vypne
        if (sc.bezGrade) ["grade-cerna", "grade-svetla", "vineta"].forEach((id) => { skryj(tl, $(id), sc.f0); ukaz(tl, $(id), sc.f1); });
        const kam = $(`sc${i}kam`);
        if (kam) { tah(tl, kam, sc.f0, sc.tah); posun(tl, kam, sc.f0, sc.posun); }
        karty(tl, sc, i);
        okna(tl, sc, i);
        zavorky(tl, sc, i);
        serie(tl, sc, i);
        vyrez(tl, sc, i);
        (sc.yt?.rady || []).forEach((r, j) => { ukaz(tl, $(`sc${i}yt${j}`), r.f); });
        if (sc.pole) {
          const p = sc.pole, ph = $(`sc${i}ph`), v = $(`sc${i}pole`);
          // psaní do pole: placeholder zmizí, písmena naskakují po krocích taktu, kurzor za nimi
          const t = document.createElement("div");
          t.className = "t sans tucne bez-zare";
          Object.assign(t.style, { left: "2px", bottom: "10px", fontSize: (p.s ?? 46) + "px", visibility: "visible" });
          v.appendChild(t);
          const k = document.createElement("span"); k.className = "kurzor";
          const ps = [...p.text].map((ch) => { const sp = document.createElement("span"); sp.textContent = ch; t.appendChild(sp); return sp; });
          t.appendChild(k);
          ps.forEach((sp) => tl.set(sp, { display: "none" }, 0));
          tl.set(k, { visibility: "hidden" }, 0);
          tl.set(k, { visibility: "visible" }, s(p.f - 4));
          skryj(tl, ph, p.f);
          ps.forEach((sp, j) => tl.set(sp, { display: "inline" }, s(p.f + j * (p.krok ?? 2))));
        }
      });

      // glitche: DOM je statický, tady jen zap a vyp
      (plan.glitche || []).forEach((g, i) => {
        g.bloky.forEach((b, j) => {
          const el = $(`gl${i}_${j}`);
          const f = g.f + (b[5] ?? 0);
          ukaz(tl, el, f);
          skryj(tl, el, f + (b[6] ?? g.n ?? 2));
        });
      });

      const v = $("texty");
      (plan.texty || []).forEach((t) => {
        const fn = TEXTY[t.typ];
        if (!fn) throw new Error("neznámý typ textu " + t.typ);
        fn(tl, t, v);
      });

      // záblesky: [f, n, sila]
      (plan.zablesky || []).forEach(([f, n, a]) => {
        tl.set("#zablesk", { opacity: a ?? 1 }, s(f));
        tl.set("#zablesk", { opacity: 0 }, s(f + n));
      });

      (plan.popisky || []).forEach(([f0, f1], i) => { ukaz(tl, $("pop" + i), f0); skryj(tl, $("pop" + i), f1); });

      const vz = $("vodoznak");
      if (vz && plan.bezVodoznaku) plan.bezVodoznaku.forEach(([a, b]) => { skryj(tl, vz, a); ukaz(tl, vz, b); });

      tl.set({}, {}, s(plan.delka + 1));
      // všechno o půl snímku dřív, aby žádná změna nepadla přesně na vzorkovaný snímek (renderer skáče i dozadu)
      tl.shiftChildren(-0.5 / FPS, false, 0.75 / FPS);
      return tl;
    },
  };
  window.LK2 = LK2;
})();
