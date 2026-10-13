/* Noske kit: motion jazyk podle rozboru 6 reelů Toma Noskeho (@tomnoske) v barvách Beyond
 * Seek safe: jen tweeny a tl.set na jedné pozastavené timeline, žádný Math.random ani rAF
 * Časy v sekundách, délky animací ve SNÍMCÍCH při NK.FPS (25, tak je styl změřený)
 * Změřená čísla a pravidla: skill beyond-reels-noske
 */
(function () {
  const FPS = window.NK_FPS || 25;
  const F = (n) => n / FPS;

  function ukaz(tl, cil, t) { tl.set(cil, { visibility: "visible" }, t); }
  function skryj(tl, cil, t) { tl.set(cil, { visibility: "hidden" }, t); }

  /* KARTA přes celý obraz: tvrdý střih dovnitř i ven, žádné prolínání (všech 6 reelů)
   * Přepíná display, ne visibility: děti s visibility visible by jinak prosvítaly skrytou kartou
   */
  function karta(tl, el, t0, t1) { tl.set(el, { display: "block" }, t0); if (t1 != null) tl.set(el, { display: "none" }, t1); }

  /* KAMERA
   * punch(): skok zoomu na střihu (jump cut 1,2 až 1,37x, jedna hodnota na reel, střídat s 1,0)
   * drift(): mezi střihy pomalý nájezd +2 až 4 % za záběr, lineárně, aby obraz nestál
   * uvod(): první záběr začne v 1,5x a dosedne na 1,0 za 40 sn. expo.out (Dd45)
   */
  function punch(tl, video, t, scale, o = {}) {
    tl.set(video, { scale, x: o.x || 0, y: o.y || 0 }, t);
  }
  function drift(tl, video, t0, t1, od, kam, o = {}) {
    tl.fromTo(video, { scale: od, x: o.x || 0, y: o.y || 0 }, { scale: kam, x: o.x || 0, y: o.y || 0, duration: t1 - t0, ease: "sine.inOut", immediateRender: false }, t0);
  }
  function uvod(tl, video, t, o = {}) {
    tl.fromTo(video, { scale: o.od || 1.5 }, { scale: o.kam || 1, duration: F(o.snimku || 40), ease: "expo.out", immediateRender: false }, t);
  }

  /* TITULKY PO SLOVECH
   * Jedno slovo (krátká spojka se slepí s dalším), drží do dalšího slova, výměna tvrdým střihem ve stejném snímku
   * nastup "tvrdy" (Dd45, DdZ, DdSR): plné hned v 1. snímku
   * nastup "stoupani" (DdU1): vyjede zespodu 40 px za 9 sn., z rozostření 7 px, pak plave nahoru ~2 px/sn.
   * o.styl[i] = {v: "s|m|l|xl", kurziva, nad: "malý řádek nad"}; o.vynech = [[t0, t1]] kde jsou karty
   * o.x(t) vrací vodorovný posun kontejneru (titulek sedí na hrudi, i když mluvčí stojí mimo střed)
   */
  function titulky(tl, kontejner, slova, o = {}) {
    const styl = o.styl || {};
    const vynech = o.vynech || [];
    const venku = (t) => vynech.some(([a, b]) => t >= a - 0.001 && t < b);
    const predstih = o.predstih == null ? F(1) : o.predstih;
    const skupiny = [];
    for (let i = 0; i < slova.length; i++) {
      const w = slova[i];
      const kratke = (w.w || "").replace(/[^\p{L}\p{N}]/gu, "").length <= 2;
      const dalsi = slova[i + 1];
      if (kratke && dalsi && !styl[i] && dalsi.t - w.e < 0.15 && !/[.,?!]$/.test(w.w)) { skupiny.push([i, i + 1]); i++; }
      else skupiny.push([i]);
    }
    skupiny.forEach((g, gi) => {
      const prvni = slova[g[0]], posl = slova[g[g.length - 1]];
      const t0 = Math.max(0, prvni.t - predstih);
      if (venku(prvni.t)) return;
      const nasl = skupiny[gi + 1] ? slova[skupiny[gi + 1][0]] : null;
      let t1 = nasl && nasl.t - posl.e < 0.6 ? nasl.t - predstih : posl.e + 0.35;
      vynech.forEach(([a]) => { if (a > t0 && a < t1) t1 = a; });
      const s = styl[g.find((i) => styl[i]) ?? g[0]] || {};
      const d = document.createElement("div");
      d.className = "nk-slovo " + (s.v || o.v || "m") + (s.kurziva ? " nk-kurziva" : "");
      const txt = g.map((i) => slova[i].w).join(" ").replace(/[.,?!:;]+$/g, "").replace(/[.,:;](?=\s)/g, "");
      if (s.nad) { const n = document.createElement("span"); n.className = "nad"; n.textContent = s.nad; d.appendChild(n); }
      d.appendChild(document.createTextNode(o.minusky === false ? txt : (s.v === "xl" ? txt : txt.toLowerCase())));
      kontejner.appendChild(d);
      if (o.x) { const dx = o.x(prvni.t); d.style.left = 60 + dx + "px"; d.style.right = 60 - dx + "px"; }
      ukaz(tl, d, t0);
      if ((o.nastup || "tvrdy") === "stoupani") {
        tl.fromTo(d, { yPercent: -50, y: 40, filter: "blur(7px)", opacity: 0.55 },
          { y: 0, filter: "blur(0px)", opacity: 1, duration: F(9), ease: "power3.out", immediateRender: false }, t0);
        tl.to(d, { y: -Math.min(60, (t1 - t0 - F(9)) * FPS * 2), duration: Math.max(0.01, t1 - t0 - F(9)), ease: "sine.inOut" }, t0 + F(9));
      }
      skryj(tl, d, t1);
    });
  }

  /* ROZHOZENÁ SLOVA na kartě (Dd45 "need . less . think"): slova v jedné řadě přes šířku, každé naskočí se svým slovem
   * a zůstane, velikost roste k pointě. polozky = [{text, x (0 až 1), v (px), t, y (px posun)}]
   */
  function rozhozena(tl, kontejner, polozky, t1) {
    polozky.forEach((p) => {
      const s = document.createElement("span");
      s.textContent = p.text;
      s.style.left = p.x * 100 + "%";
      s.style.top = (p.y || 0) + "px";
      s.style.fontSize = p.v + "px";
      if (p.kurziva) s.className = "nk-kurziva";
      kontejner.appendChild(s);
      ukaz(tl, s, p.t);
      if (t1 != null) skryj(tl, s, t1);
    });
  }

  /* KOTVA (DdSR "there's no" + INHERITANCE, BACKSTOP, NET): malý řádek drží, slovo pod ním se tvrdě vyměňuje po 0,6 až 1,2 s */
  function kotva(tl, el, slova, t1) {
    const box = el.querySelector(".vymena");
    slova.forEach((s, i) => {
      const sp = document.createElement("span");
      sp.textContent = s.text;
      if (s.kurziva) sp.className = "nk-kurziva";
      box.appendChild(sp);
      ukaz(tl, sp, s.t);
      skryj(tl, sp, slova[i + 1] ? slova[i + 1].t : t1);
    });
  }

  /* DUCH (DdfJ "99 %"): obří číslo naroste ostré (7 sn. krytí, zvedne se o 15 px, 12 sn. růst), drží 6 sn.,
   * pak se TVRDĚ rozostří (14 px / 0,45, další snímek 25 px / 0,15) a ustálí na 12 px / 0,3 jako duch za titulky
   */
  function duch(tl, el, t, o = {}) {
    ukaz(tl, el, t);
    tl.fromTo(el, { opacity: 0, y: 15, scale: 0.86, filter: "blur(0px)" }, { opacity: 1, y: 0, duration: F(7), ease: "power2.out", immediateRender: false }, t);
    tl.to(el, { scale: 1, duration: F(o.rust || 18), ease: "power2.out" }, t);
    const r = t + F((o.rust || 18) + (o.drzi || 6));
    tl.set(el, { filter: "blur(14px)", opacity: 0.45 }, r);
    tl.set(el, { filter: "blur(25px)", opacity: 0.15 }, r + F(1));
    tl.set(el, { filter: "blur(12px)", opacity: 0.3 }, r + F(2));
    if (o.konec != null) skryj(tl, el, o.konec);
    return r;
  }

  /* POČÍTADLO pro ducha: celá čísla, snímek po snímku (DdfJ 90 -> 99) */
  function pocitadlo(tl, el, t, od, kam, snimku, format) {
    const fmt = format || ((v) => String(v));
    for (let i = 0; i <= snimku; i++) {
      const v = Math.round(od + (kam - od) * gsap.parseEase("power2.out")(i / snimku));
      tl.set(el, { textContent: fmt(v) }, t + F(i));
    }
  }

  /* PILULKY s obrysem (Dd45 matice UNDER/OVER): naskočí neaktivní (40 %), aktivace zesvětlením za 3 sn., bez záře */
  function pilulka(tl, el, t, o = {}) {
    tl.set(el, { visibility: "visible", opacity: o.zap ? 1 : 0.4 }, t);
  }
  function zapni(tl, el, t) { tl.to(el, { opacity: 1, duration: F(3), ease: "power2.out" }, t); }
  function ztlum(tl, el, t, kam) { tl.to(el, { opacity: kam == null ? 0.4 : kam, duration: F(3), ease: "power2.inOut" }, t); }

  /* SKLO (DdU1 USER 1 / USER 2): fade 10 sn., stoupne 28 px, rozostření 6 -> 0 */
  function sklo(tl, el, t, o = {}) {
    ukaz(tl, el, t);
    tl.fromTo(el, { opacity: 0, y: 28, filter: "blur(6px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: F(o.snimku || 10), ease: "power2.out", immediateRender: false }, t);
  }

  /* ODDÁLENÍ VĚTY (DdfJ "too polished"): věta začne 1,7x a dosedne za 14 sn. expo.out, první 3 sn. rozmazaná pohybem */
  function oddaleni(tl, el, t, o = {}) {
    ukaz(tl, el, t);
    tl.fromTo(el, { scale: o.od || 1.7 }, { scale: 1, duration: F(14), ease: "expo.out", immediateRender: false }, t);
    tl.fromTo(el, { filter: "blur(10px)" }, { filter: "blur(0px)", duration: F(3), ease: "power2.out", immediateRender: false }, t);
  }

  /* REDUKCE (DdfJ "remove half the words"): z věty se tvrdým střihem vyhodí slova, zbytek se přeskládá */
  function redukce(tl, el, t, indexy) {
    const sp = el.querySelectorAll("span");
    indexy.forEach((i) => tl.set(sp[i], { display: "none" }, t));
  }

  /* POSTAVY (DdSR dvě ikony): krémová plná výplň, nástup krytím 6 sn., stav se mění krytím (zhasne na 15 %) */
  function postava(tl, el, t, o = {}) {
    ukaz(tl, el, t);
    tl.fromTo(el, { opacity: 0 }, { opacity: o.kam || 1, duration: F(o.snimku || 6), ease: "power2.out", immediateRender: false }, t);
  }

  /* B-ROLL: vlastní záběr přes celý obraz, tvrdý střih dovnitř i ven, 1,2 až 4,2 s, nástup na začátku klauze */
  function broll(tl, el, t0, t1, o = {}) {
    ukaz(tl, el, t0); skryj(tl, el, t1);
    if (o.drift) tl.fromTo(el, { scale: 1 }, { scale: 1 + o.drift, duration: t1 - t0, ease: "sine.inOut", immediateRender: false }, t0);
  }

  /* TITULKY PŘES B-ROLL: krémové se stínem pod písmem (tmavé na fotce byly nečitelné, Tim 2.10.) */
  function naBrollu(tl, kontejner, t0, t1) {
    tl.set(kontejner, { attr: { class: "nk-titulky na-brollu" } }, t0);
    tl.set(kontejner, { attr: { class: "nk-titulky" } }, t1);
  }

  /* TRYCHTÝŘ z pilulek (Tim 2.10.): přes celou kartu, na středu, obrysové pilulky Noskeho se zužují dolů,
   * popisek uvnitř pilulky. el = prázdný div .nk-trychtyr, o = {sirky: [px], vyska, mezera, y (střed sestavy)}
   * vrací pole pásů ({oba: [pilulka]}), nástup NK.pas, stav NK.zapni / NK.ztlum na pas.oba
   */
  function trychtyr(el, popisky, o = {}) {
    const sirky = o.sirky || [1120, 820, 520], h = o.vyska || 168, gap = o.mezera || 24;
    const H = popisky.length * h + (popisky.length - 1) * gap, y0 = (o.y || 540) - H / 2;
    return popisky.map((p, i) => {
      const d = document.createElement("div");
      d.className = "pilulka";
      d.style.width = sirky[i] + "px"; d.style.height = h + "px";
      d.style.top = y0 + i * (h + gap) + "px"; d.style.visibility = "hidden";
      d.textContent = p;
      el.appendChild(d);
      return { oba: [d] };
    });
  }
  /* pás naskočí zesvětlením z 40 % za 3 sn. (stav pak NK.zapni / NK.ztlum na pas.oba) */
  function pas(tl, p, t, o = {}) {
    tl.set(p.oba, { visibility: "visible", opacity: o.od == null ? 0.4 : o.od }, t);
    tl.to(p.oba, { opacity: o.kam == null ? 1 : o.kam, duration: F(3), ease: "power2.out" }, t + F(1));
  }

  /* HOOK NÁSTUP (Dd45 "remember"): přiletí z 2,4x zespodu, pohyb a měřítko 38 sn. power3.out (zpoždění 2 sn.),
   * krytí 0,75 -> 1 za 22 sn., rozmazání 2 px -> 0 za 12 sn., pak drift nahoru
   */
  function hookNastup(tl, el, t, o = {}) {
    const sn = o.snimku || 38, od = o.od || 2.4, y = o.y || 200;
    // výchozí stav letu nastavit ve stejném snímku, kdy se prvek ukáže (jinak 1 až 2 snímky stojí v normální velikosti a pak poskočí)
    tl.set(el, { visibility: "visible", scale: od, y, opacity: 0.75, filter: "blur(2px)" }, t);
    tl.to(el, { scale: 1, y: 0, duration: F(sn), ease: "power3.out" }, t);
    tl.to(el, { opacity: 1, duration: F(Math.min(22, sn)), ease: "power2.out" }, t);
    tl.to(el, { filter: "blur(0px)", duration: F(Math.min(12, sn)), ease: "power2.out" }, t);
  }

  /* ROZMAZANÁ VRSTVA (DdU1): blur je na celé vrstvě titulků, ne na slově. 9,4 px -> 4 za 20 sn., -> 0,8 za 70 sn., -> 0 */
  function zaostreniVrstvy(tl, el, t, o = {}) {
    const k = o.sila || 1;
    if (o.kratce) {   // krátký hook: první velké slovo musí být ostré dřív, než zmizí (za 14 sn. do ostra)
      tl.fromTo(el, { filter: `blur(${9.4 * k}px)` }, { filter: "blur(0px)", duration: F(14), ease: "power2.out", immediateRender: false }, t);
      return;
    }
    tl.fromTo(el, { filter: `blur(${9.4 * k}px)` }, { filter: `blur(${4 * k}px)`, duration: F(20), ease: "power2.out", immediateRender: false }, t);
    tl.to(el, { filter: `blur(${0.8 * k}px)`, duration: F(70), ease: "sine.inOut" }, t + F(20));
    tl.to(el, { filter: "blur(0px)", duration: F(20), ease: "sine.inOut" }, t + F(90));
  }

  /* ROZMAZÁNÍ PŘED ZMIZENÍM: 4 sn. blur 0 -> 10 px a krytí 1 -> 0,6, pak tvrdý střih. Text se přitom NIKDY nezvětšuje (Tim 2.10.)
   * KŘIVKY: nikdy lineární, vždy S křivka (sine.inOut) nebo in/out (power2, power3, expo), Tim 2.10. */
  function rozmazatKonec(tl, el, t1) {
    tl.fromTo(el, { filter: "blur(0px)", opacity: 1 }, { filter: "blur(10px)", opacity: 0.6, duration: F(4), ease: "power1.in", immediateRender: false }, t1 - F(4));
  }

  /* VRSTVENÁ SESTAVA titulků (místo výměny jednoho slova se skládá blok, Tim 2.10.)
   * typ "kicker": malý řádek A nahoře (slova přibývají, jak zazní), pod ním velké slovo B, které se tvrdě mění
   *   (remember + SCARED/UNDER, "the main mistake with" + WORKSHOPS). Poměr velikostí 2,6 až 2,8 : 1
   * typ "pod":    velké B nahoře drží, malý řádek A pod ním přibývá nebo se mění (MONTH, "the more" + people)
   * typ "schody": řádky po diagonále o 84 px níž a 90 px vedle, každý 0,5 -> 1 a +24 px za 20 sn., bez zvětšení na konci
   * o = {typ, a: [i0, i1], b: [j0, j1], radky: [[i0,i1], ...] (schody), konec, vymenaA, serifB, verzalkyA, hook, rozmazat, velA, velB}
   * vrací [t0, konec] pro vynech titulků
   */
  function sestava(tl, kontejner, slova, o = {}) {
    const txt = (i) => (slova[i].w || "").replace(/[.,?!:;]+$/g, "");
    const T0 = (i) => Math.max(0, slova[i].t - F(1));
    const blok = document.createElement("div"); blok.className = "nk-sestava " + (o.typ || "kicker");
    kontejner.appendChild(blok);
    gsap.set(blok, { yPercent: -50 });   // ne CSS translate: GSAP by ho při posunu přepsal
    const rozsah = (r) => { const a = []; if (r) for (let i = r[0]; i <= r[1]; i++) a.push(i); return a; };
    const ia = rozsah(o.a), ib = rozsah(o.b);
    const t0 = Math.min(...[...ia, ...ib, ...rozsah(o.radky && [o.radky[0][0], o.radky[o.radky.length - 1][1]])].map(T0));
    const konec = o.konec;
    tl.set(blok, { display: "block" }, t0); tl.set(blok, { display: "none" }, konec);
    tl.to(blok, { y: -(konec - t0) * FPS * 0.25, duration: konec - t0, ease: "sine.inOut" }, t0);   // drift 0,25 px/sn.
    if ((o.typ || "kicker") === "schody") {
      o.radky.forEach((r, k) => {
        const d = document.createElement("div"); d.className = "radek";
        d.textContent = rozsah(r).map(txt).join(" ");
        if (o.serifRadek === k) d.classList.add("nk-kurziva");
        d.style.marginLeft = (k - (o.radky.length - 1) / 2) * 180 + "px";
        blok.appendChild(d);
        const t = T0(r[0]);
        ukaz(tl, d, t);
        tl.fromTo(d, { opacity: 0.5, y: 24 }, { opacity: 1, y: 0, duration: F(20), ease: "power2.out", immediateRender: false }, t);
      });
    } else {
      const radA = document.createElement("div"); radA.className = "a" + (o.verzalkyA ? " verzalky" : "");
      const radB = document.createElement("div"); radB.className = "b" + (o.serifB ? " nk-kurziva" : "");
      if (o.velA) radA.style.fontSize = o.velA + "px";
      if (o.velB) radB.style.fontSize = o.velB + "px";
      if (o.typ === "pod") { blok.appendChild(radB); blok.appendChild(radA); } else { blok.appendChild(radA); blok.appendChild(radB); }
      ia.forEach((i, k) => {
        const sp = document.createElement("span"); sp.textContent = txt(i) + " ";
        radA.appendChild(sp);
        ukaz(tl, sp, T0(i));
        if (o.vymenaA && ia[k + 1] != null) tl.set(sp, { display: "none" }, T0(ia[k + 1]));
      });
      tl.set(radA, { visibility: "visible" }, t0);
      if (o.hook) hookNastup(tl, radA, T0(ia[0]), { snimku: o.hookSnimku, od: o.hookOd });
      else if (o.typ !== "pod") tl.fromTo(radA, { opacity: 0.4, y: 40 }, { opacity: 1, y: 0, duration: F(15), ease: "power2.out", immediateRender: false }, T0(ia[0]));
      ib.forEach((j, k) => {
        const sp = document.createElement("span"); sp.textContent = o.serifB || o.minuskyB ? txt(j).toLowerCase() : txt(j).toUpperCase();
        radB.appendChild(sp);
        ukaz(tl, sp, T0(j));
        if (ib[k + 1] != null) tl.set(sp, { display: "none" }, T0(ib[k + 1]));
      });
      // první velké slovo dosedne (Dd45 YOU): +90 px, 1,09x, krytí 0,47
      tl.fromTo(radB, { y: 90, scale: 1.09, opacity: 0.47 }, { y: 0, scale: 1, opacity: 1, duration: F(o.nastupB || 20), ease: "power3.out", immediateRender: false }, T0(ib[0]));
    }
    if (o.rozmazat) rozmazatKonec(tl, blok, konec);
    return [t0, konec];
  }

  window.NK = { hookNastup, zaostreniVrstvy, rozmazatKonec, sestava, naBrollu, trychtyr, pas, FPS, F, ukaz, skryj, karta, punch, drift, uvod, titulky, rozhozena, kotva, duch, pocitadlo, pilulka, zapni, ztlum, sklo, oddaleni, redukce, postava, broll };
})();
