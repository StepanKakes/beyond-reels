/* Nathan kit: motion jazyk reelů Nathana Nazaretha, renderer plánu videa
 * Deterministické a seek safe: jen tl.set a tweeny na jedné pozastavené timeline, žádný Math.random ani rAF
 * Časy v plánu jsou SNÍMKY při plan.fps, souřadnice v návrhovém prostoru 1920x1080.
 * Polohy a velikosti textu počítá generátor z metrik písma (nastroje/pismo.py), kit jen staví a animuje.
 * Média vyrábí build.mjs staticky. Recepty R1 až R29: $BR_INSPIRACE/nathan/_rozbor/DeK988mxoYq/SHOTLOG.md
 */
(function () {
  const W = 1920, H = 1080;
  let FPS = 30;
  const s = (f) => f / FPS;
  // bez odloženého prvního vykreslení: lazy tween zapíše hodnotu až na konci ticku, po seeku by snímek nesl starou hodnotu
  gsap.defaults({ lazy: false });
  const $ = (id) => document.getElementById(id);
  const ukaz = (tl, el, f) => tl.set(el, { visibility: "visible" }, s(f));
  const skryj = (tl, el, f) => tl.set(el, { visibility: "hidden" }, s(f));
  const tau = (t) => (t * 6.93) / FPS; // exponenciální doběh s časovou konstantou t snímků = expo.out o této délce
  // DOJEZD jako v originálu (POHYB.md B.1): x = D * exp(-t / tau), tau = 0,3 x doba držení, nikdy nedojede (3 až 5 % zbývá)
  const dojezd = (n, ta) => (p) => 1 - Math.exp((-p * n) / ta);
  const krivka = (e, n) => (typeof e === "string" && e.startsWith("exp:") ? dojezd(n, parseFloat(e.slice(4))) : e);

  function prvek(tag, cls, rodic, text) {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    if (text != null) el.textContent = text;
    rodic.appendChild(el);
    return el;
  }

  function vzhled(el, t) {
    el.style.fontSize = (t.s ?? 56) + "px";
    if (t.barva) el.classList.add(t.barva);
    if (t.font === "kond") el.classList.add("kond");
    if (t.font === "skript") el.classList.add("skript");
    if (t.rozdil) el.classList.add("rozdil");
    if (t.stin) el.classList.add("stin");
  }

  // ukotvení řádku: stred = střed x, vlevo = levý okraj x, vpravo = pravý okraj x (zigzag kolem velkého slova)
  function kotva(el, t) {
    const zar = t.zarovnani || "stred";
    if (zar === "stred") Object.assign(el.style, { left: t.x - 3000 + "px", width: "6000px", textAlign: "center" });
    else if (zar === "vlevo") Object.assign(el.style, { left: t.x + "px", textAlign: "left" });
    else Object.assign(el.style, { left: t.x - 6000 + "px", width: "6000px", textAlign: "right" });
    el.style.top = t.y + "px";
  }

  const TEXTY = {
    /* MALÝ ŘÁDEK (R8): slova tvrdě naskakují, řádek se při každém slově okamžitě přecentruje
     * karaoke (R9): celá fráze na 40 %, mluvené slovo 100 %; padani (R10): nové slovo o 38 px výš a klesne za 9 snímků */
    rada(tl, t, vrstva) {
      const el = prvek("div", "nz-t male nz-rada", vrstva);
      vzhled(el, t); kotva(el, t);
      const sp = t.slova.map((w, i) => {
        const x = prvek("span", "nz-s", el, w.text);
        if (i < t.slova.length - 1) prvek("span", "nz-s", el, " ");
        return x;
      });
      const mezery = [...el.querySelectorAll(".nz-s")].filter((x) => x.textContent === " ");
      const f0 = t.slova[0].f;
      ukaz(tl, el, f0);
      if (t.karaoke) {
        t.slova.forEach((w, i) => {
          tl.set(sp[i], { opacity: 0.55 }, 0);
          tl.set(sp[i], { opacity: 1 }, s(w.f));
          if (t.slova[i + 1]) tl.set(sp[i], { opacity: 0.55 }, s(t.slova[i + 1].f));
        });
      } else {
        [...sp, ...mezery].forEach((x) => tl.set(x, { display: "none" }, 0));
        t.slova.forEach((w, i) => {
          tl.set(sp[i], { display: "inline-block" }, s(w.f));
          if (i && mezery[i - 1]) tl.set(mezery[i - 1], { display: "inline-block" }, s(w.f));
          // padání: 104 až 177 px, všechna slova dosednou s koncem fráze (tau 0,35 x čas do konce)
          if (t.padani) {
            const n = Math.max(4, t.f1 - w.f);
            tl.fromTo(sp[i], { y: -(t.padD ?? 140) }, { y: 0, duration: s(n), ease: dojezd(n, 0.35 * n) }, s(w.f));
          }
        });
      }
      skryj(tl, el, t.f1);
      return el;
    },

    /* VELKÉ SLOVO (R4): plné a ostré od prvního snímku, posunuté o D a exponenciálně dojede (tau 4 až 12 snímků)
     * blink (R6) 2 mezery po 1 snímku, bloky (R5) 3 snímky před nástupem, blur (R7), skrt (R25) se hýbe se slovem */
    velke(tl, t, vrstva) {
      const el = prvek("div", "nz-t", vrstva, t.text);
      vzhled(el, t);
      Object.assign(el.style, { left: t.x + "px", top: t.y + "px" });
      const f = t.f;
      (t.bloky || []).forEach(([x, y, w, h]) => {
        const b = prvek("div", "nz-blok", vrstva);
        Object.assign(b.style, { left: x + "px", top: y + "px", width: w + "px", height: h + "px" });
        ukaz(tl, b, f - 3); skryj(tl, b, f);
      });
      if (t.skrt) {
        const [x, y, w] = t.skrt;
        const c = prvek("div", "nz-skrt", el);
        Object.assign(c.style, { left: x + "px", top: y + "px", width: w + "px" });
      }
      ukaz(tl, el, f);
      const D = t.D ?? 180;
      const osa = t.smer === "vpravo" ? "x" : "y";
      const od = t.smer === "nahoru" ? -Math.abs(D) : Math.abs(D);
      const drz = Math.max(4, (t.f1 ?? f + 30) - f);
      tl.fromTo(el, { [osa]: od }, { [osa]: 0, duration: s(drz), ease: dojezd(drz, t.tau ?? 0.3 * drz) }, s(f));
      if (t.blur) tl.fromTo(el, { filter: "blur(10px)" }, { filter: "blur(0px)", duration: s(9), ease: "power2.out" }, s(f));
      if (t.blink != null) {
        const d = t.blink;
        skryj(tl, el, f + d); ukaz(tl, el, f + d + 1); skryj(tl, el, f + d + 2); ukaz(tl, el, f + d + 3);
      }
      if (t.zoom) tl.fromTo(el, { scale: t.zoom[0] }, { scale: t.zoom[1], duration: s(t.f1 - f), ease: "none" }, s(f));
      skryj(tl, el, t.f1);
      return el;
    },

    /* VÝMĚNA SLOV (R11): jedno slovo na místě, další ho tvrdě nahradí */
    swap(tl, t, vrstva) {
      const el = prvek("div", "nz-t", vrstva, t.slova[0].text);
      vzhled(el, t); kotva(el, t);
      ukaz(tl, el, t.slova[0].f);
      t.slova.forEach((w) => tl.set(el, { textContent: w.text }, s(w.f)));
      skryj(tl, el, t.f1);
      return el;
    },

    /* SCHODY (R15): slova po jednom, každé o dy níž a dx vpravo */
    schody(tl, t, vrstva) {
      t.slova.forEach((w, i) => {
        const el = prvek("div", "nz-t male", vrstva, w.text);
        vzhled(el, t);
        const [x, y] = t.pozice ? t.pozice[i] : [t.x + i * (t.dx ?? 88), t.y + i * (t.dy ?? 35)];
        Object.assign(el.style, { left: x + "px", top: y + "px" });
        ukaz(tl, el, w.f); skryj(tl, el, t.f1);
      });
    },

    /* POČÍTADLO (R13): lineární hodnota po snímcích, české tisíce mezerou, blur in 12 px za 13 snímků */
    pocitadlo(tl, t, vrstva) {
      const el = prvek("div", "nz-t", vrstva);
      vzhled(el, t);
      Object.assign(el.style, { left: t.x - 3000 + "px", width: "6000px", textAlign: "center", top: t.y + "px", fontVariantNumeric: "tabular-nums" });
      const fmt = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + (t.pripona || "");
      for (let f = t.f; f < t.f1; f++) {
        const k = Math.min(1, (f - t.f) / Math.max(1, (t.fDo ?? t.f1) - t.f));
        tl.set(el, { textContent: fmt(t.od + (t.do - t.od) * k) }, s(f));
      }
      ukaz(tl, el, t.f);
      tl.fromTo(el, { filter: "blur(12px)" }, { filter: "blur(0px)", duration: s(13), ease: "power1.out" }, s(t.f));
      skryj(tl, el, t.f1);
      return el;
    },

    /* ŘADA LET (R12): roky zprava doleva s doběhem, okraje maskou, tenká čára pod nimi */
    roky(tl, t, vrstva) {
      const el = prvek("div", "nz-roky", vrstva);
      const rada = prvek("div", "rada", el);
      const n = Math.abs(t.do - t.od) + 1, krok = t.krok ?? 490;
      for (let i = 0; i < n; i++) {
        const r = prvek("div", "rok", rada, String(t.od + (t.do > t.od ? i : -i)));
        Object.assign(r.style, { left: W / 2 + i * krok + "px", top: t.y + "px" });
      }
      const c = prvek("div", "cara", el);
      c.style.top = t.y + 130 + "px";
      ukaz(tl, el, t.f);
      tl.fromTo(rada, { x: 0 }, { x: -(n - 1) * krok, duration: s(t.fDo - t.f), ease: "power1.out" }, s(t.f));
      skryj(tl, el, t.f1);
    },

    /* ČERVENÝ ŠTÍTEK (R14): obdélník přes oči, skript přes něj zvlášť jako velke */
    stitek(tl, t, vrstva) {
      const el = prvek("div", "nz-stitek", vrstva);
      Object.assign(el.style, { left: t.x + "px", top: t.y + "px", width: t.w + "px", height: t.h + "px" });
      ukaz(tl, el, t.f); skryj(tl, el, t.f1);
    },
  };

  /* KONCEPTY */
  const KONCEPTY = {
    /* DIAGRAM přes celé video: střed a prázdné větve se nakreslí jednou, při každém návratu se doplní další větev
     * useky = kdy je diagram v obraze, kresli = snímek kreslení čar (11 až 15 snímků, R23), plneni = snímek každé větve */
    diagram(tl, k, i) {
      const el = $("k" + i);
      // dítě s visibility: visible prosvítá skrytým rodičem, proto úseky přes krytí rodiče (uzly drží svou viditelnost)
      tl.set(el, { opacity: 0 }, 0);
      ukaz(tl, el, k.useky[0][0]);
      k.useky.forEach(([f0, f1]) => { tl.set(el, { opacity: 1 }, s(f0)); tl.set(el, { opacity: 0 }, s(f1)); });
      const stred = $(`k${i}u0`);
      const fs = k.stred_f ?? k.kresli - 3;
      ukaz(tl, stred, fs);
      tl.fromTo(stred, { y: 5 }, { y: 0, duration: s(4), ease: "power1.out" }, s(fs));
      k.vetve.forEach((v, j) => {
        const c = $(`k${i}c${j}`), p = $(`k${i}p${j}`), u = $(`k${i}u${j + 1}`);
        tl.set(c, { strokeDasharray: "1 1", strokeDashoffset: 1 }, 0);
        tl.fromTo(c, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: s(13), ease: "power2.out", immediateRender: false }, s(k.kresli + j * 3));
        ukaz(tl, p, k.kresli + 10 + j * 3);
        const f = k.plneni[j];
        if (f != null) {
          skryj(tl, p, f); ukaz(tl, u, f);
          tl.fromTo(u, { y: 5 }, { y: 0, duration: s(4), ease: "power1.out" }, s(f));
        }
      });
    },
    /* SEDÍCÍ POSTAVA (R19, Nathan #16): AI fotka bez pozadí, velké slovo za hlavou naskočí a stojí, malá slova nad a pod
     * naskakují po jednom; celá skupina snap zoom ven (1,31 na 1,0, expo.out kolem 59 snímků = tau 8,9) */
    sedi(tl, k, i) {
      const el = $("k" + i), obr = $(`k${i}o`);
      // krytí rodiče místo visibility: viditelné dítě by skrytým rodičem prosvítalo
      tl.set(el, { opacity: 0 }, 0); tl.set(el, { opacity: 1 }, s(k.f0)); tl.set(el, { opacity: 0 }, s(k.f1));
      const w = prvek("div", "nz-t akcent", el, k.slovo.text);
      el.insertBefore(w, obr);
      Object.assign(w.style, { left: k.slovo.x + "px", top: k.slovo.y + "px", fontSize: k.slovo.s + "px" });
      ukaz(tl, w, k.slovo.f); skryj(tl, w, k.f1);
      if (k.nad.slova.length) TEXTY.rada(tl, { ...k.nad, typ: "rada", f1: k.f1, barva: "akcent" }, el);
      if (k.pod.slova.length) TEXTY.rada(tl, { ...k.pod, typ: "rada", f1: k.f1, barva: "akcent" }, el);
      const [a, b, n] = k.zoom;
      tl.fromTo(el, { scale: a }, { scale: b, duration: s(n), ease: "expo.out", immediateRender: false }, s(k.f0));
    },
    /* KOMENTÁŘ: karta vjede zespodu s exponenciálním doběhem (R4), text se píše po písmenech s kurzorem */
    komentar(tl, k, i) {
      const el = $("k" + i), txt = $(`k${i}t`);
      ukaz(tl, el, k.f);
      tl.set(el, { xPercent: -50, yPercent: -50 }, 0);
      tl.fromTo(el, { y: 200 }, { y: 0, duration: tau(9), ease: "expo.out" }, s(k.f));
      const ps = [...k.text].map((ch) => prvek("span", "nz-s", txt, ch));
      const kur = prvek("span", "k", txt);
      ps.forEach((p, j) => { tl.set(p, { display: "none" }, 0); tl.set(p, { display: "inline-block" }, s(k.casy[j])); });
      skryj(tl, kur, k.f); ukaz(tl, kur, k.casy[0] - 2);
      skryj(tl, el, k.f1); skryj(tl, kur, k.f1);
    },
  };

  const NZ = {
    s, W, H,
    postav(plan) {
      FPS = plan.fps || 30;
      const tl = gsap.timeline({ paused: true });
      const jev = $("jeviste");
      jev.style.transform = `scale(${(plan.w || W) / W})`;

      (plan.zabery || []).forEach((z, i) => {
        if (z.plocha) { const el = $("zp" + i); ukaz(tl, el, z.f0); skryj(tl, el, z.f1); return; }
        const med = $("z" + i);
        // nájezdy po úsecích: snap zoom (R16, expo.out) i pomalý dojezd talking head (R17, lineárně)
        (z.zoomy || []).forEach(([f0, f1, a, b, ease = "none", trvani]) => {
          // fromTo s pevným startem: renderer skáče po snímcích mimo pořadí a lazy start tl.to by si zapamatoval cizí měřítko
          const n = trvani ?? f1 - f0;
          tl.fromTo(med, { scale: a }, { scale: b, duration: s(n), ease: krivka(ease, n), immediateRender: false }, s(f0));
          if (n < f1 - f0) tl.set(med, { scale: b }, s(f0 + n));
          tl.set(med, { scale: 1 }, s(f1));
        });
      });

      const tv = $("texty");
      (plan.texty || []).forEach((t) => {
        const fn = TEXTY[t.typ];
        if (!fn) throw new Error("neznámý typ textu " + t.typ);
        fn(tl, t, tv);
      });

      (plan.koncepty || []).forEach((k, i) => KONCEPTY[k.typ](tl, k, i));

      // záblesk (R2): 1 snímek bílé přes celý obraz, volitelně doznívání
      const zb = $("zablesk");
      (plan.zablesky || []).forEach((z) => {
        const [f, kryti = 0.9, dozvuk] = Array.isArray(z) ? z : [z];
        tl.set(zb, { opacity: kryti }, s(f));
        (dozvuk || []).forEach((a, k) => tl.set(zb, { opacity: a }, s(f + 1 + k)));
        tl.set(zb, { opacity: 0 }, s(f + 1 + (dozvuk ? dozvuk.length : 0)));
      });

      // letterbox (POHYB.md A.4): 376 px, první snímek skok o 38 px, pak exp tau 19 z 358 px, do 57 dotaženo na nulu
      if (plan.letterbox) {
        for (let f = 0; f <= 57; f++) {
          let v = f === 0 ? 376 : 358 * Math.exp(-f / 19);
          if (f > 45) v = 358 * Math.exp(-45 / 19) * (57 - f) / 12;
          tl.set(["#pruhNahore", "#pruhDole"], { height: Math.round(v) }, s(f));
        }
      }

      tl.set({}, {}, s(plan.delka + 1));
      // všechno o půl snímku dřív: žádný začátek animace nepadne přesně na vzorkovaný snímek. Renderer skáče po snímcích
      // i dozadu a GSAP při návratu přesně na start tweenu vrátí hodnotu před ním (první snímek zoomu měl staré měřítko)
      tl.shiftChildren(-0.5 / FPS, false, 0.75 / FPS);   // prvky na snímku 0 zůstávají, záporný start by GSAP srovnal zpět
      return tl;
    },
  };
  window.NZ = NZ;
})();
