/* Matt kit: motion jazyk podle rozboru Matta Graye (@matthgray) v barvách Beyond
 * Deterministické a seek safe: jen tweeny a tl.set na jedné pozastavené timeline, žádný Math.random ani rAF
 * Časy v sekundách, délky animací ve SNÍMCÍCH ORIGINÁLU (23,976 fps), protože tak je styl změřený.
 * Kompozice sama běží na 30 fps, M(n) převádí jeho snímky na sekundy.
 * Návod a čísla: skill beyond-reels-matt-gray, rozbor $BR_INSPIRACE/matt-gray/_rozbor
 */
(function () {
  const FPS_ORIG = 23.976;
  const M = (n) => n / FPS_ORIG;

  // hodnota tokenu z :root (GSAP neumí tweenovat var(), proto vždy skutečná barva)
  const token = (n) => getComputedStyle(document.getElementById("root") || document.documentElement).getPropertyValue(n).trim();
  const ukaz = (tl, el, t) => tl.set(el, { visibility: "visible" }, t);
  const skryj = (tl, el, t) => tl.set(el, { visibility: "hidden" }, t);

  /* SVISLÝ POHYBOVÝ BLUR: jen svisle (změřeno sigma_x 0 až 3, sigma_y 24 až 29 px na prvních 3 snímcích).
   * CSS blur je kulatý, proto každému prvku vlastní SVG filtr s feGaussianBlur "0 N"
   */
  let defs = null, citac = 0;
  function filtr() {
    if (!defs) {
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("width", "0"); svg.setAttribute("height", "0");
      svg.style.position = "absolute";
      defs = document.createElementNS(svg.namespaceURI, "defs");
      svg.appendChild(defs);
      (document.getElementById("root") || document.body).appendChild(svg);
    }
    const id = "mgmb" + citac++;
    const f = document.createElementNS(defs.namespaceURI, "filter");
    f.setAttribute("id", id);
    f.setAttribute("x", "-20%"); f.setAttribute("y", "-60%"); f.setAttribute("width", "140%"); f.setAttribute("height", "220%");
    const g = document.createElementNS(defs.namespaceURI, "feGaussianBlur");
    g.setAttribute("stdDeviation", "0 0");
    f.appendChild(g);
    defs.appendChild(f);
    return { id, g };
  }

  /* VYJEĎ (základní nástup textu, SYSTEMISE f8 až f14): slovo vyjede zdola o ~1 em,
   * offset (1-t)^3 za 8 snímků, krytí 0 > 1, svislý blur 26 > 0 za první 4 snímky.
   * Malá slova 5 snímků. Ostatní recepty na něm stojí
   */
  function vyjed(tl, el, t, o = {}) {
    const sn = o.snimku || 8;
    const od = o.od == null ? 1 : o.od; // v em velikosti písma prvku
    const px = od * parseFloat(getComputedStyle(el).fontSize || 100);
    const { id, g } = filtr();
    tl.set(el, { visibility: "visible", filter: `url(#${id})` }, t);
    tl.fromTo(el, { y: px, opacity: 0 }, { y: 0, opacity: 1, duration: M(sn), ease: "power3.out", immediateRender: false }, t);
    tl.fromTo(g, { attr: { stdDeviation: `0 ${o.blur == null ? 26 : o.blur}` } }, { attr: { stdDeviation: "0 0" }, duration: M(Math.max(3, Math.round(sn / 2))), ease: "power2.out", immediateRender: false }, t);
    tl.set(el, { filter: "none" }, t + M(sn));
  }

  /* SLOVA: rozdělí text prvku na .mg-slovo (místo v layoutu je rezervované od začátku, jako u Matta).
   * Vnořené prvky (např. .mg-podklad-obal) zůstanou, rozdělí se jen jejich text
   */
  function slova(el) {
    const out = [];
    const projdi = (uzel) => {
      [...uzel.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const casti = n.textContent.split(/(\s+)/).filter((s) => s.length);
          const frag = document.createDocumentFragment();
          casti.forEach((s) => {
            if (/^\s+$/.test(s)) { const m = document.createElement("span"); m.className = "mg-mezera"; frag.appendChild(m); return; }
            const sp = document.createElement("span");
            sp.className = "mg-slovo"; sp.textContent = s;
            frag.appendChild(sp); out.push(sp);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && !n.classList.contains("mg-podklad")) projdi(n);
      });
    };
    projdi(el);
    return out;
  }

  /* NADPIS: slova vyjedou postupně. casy = pole časů pro každé slovo (na řeč, 3 až 6 snímků předem),
   * nebo jedno číslo t a stagger o.stagger snímků (mezi slovy 2, mezi řádky přidej o.radek)
   */
  function nadpis(tl, el, casy, o = {}) {
    const sl = el._mgSlova || (el._mgSlova = slova(el));
    ukaz(tl, el, Array.isArray(casy) ? casy[0] : casy);
    sl.forEach((s, i) => {
      const t = Array.isArray(casy) ? casy[Math.min(i, casy.length - 1)] : casy + M((o.stagger || 2) * i);
      const sn = o.snimku || (s.textContent.length <= 3 ? 5 : 8);
      vyjed(tl, s, t, { snimku: sn, od: o.od });
    });
    return sl;
  }

  /* PODKLAD (ONE SCREEN RECORDING, f22 až f45): akcentový obdélník za řádkem se rozjede zleva
   * za 23 snímků, power4.out, startuje až po dojetí textu řádku. Text přepne barvu, když ho podklad přejede
   */
  function podklad(tl, obal, t, o = {}) {
    const p = obal.querySelector(".mg-podklad");
    // kopie stejné struktury (slova i mezery), aby bílý text seděl přesně na černém
    if (!p.childNodes.length) [...obal.childNodes].forEach((n) => { if (n !== p) p.appendChild(n.cloneNode(true)); });
    p.querySelectorAll(".mg-slovo").forEach((x) => { x.style.visibility = "inherit"; x.className = "mg-slovo-kopie"; });
    tl.fromTo(p, { clipPath: "inset(0% 100% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: M(o.snimku || 23), ease: "power4.out", immediateRender: false }, t);
  }

  /* KRESLI ČÁRU (diagram, větve z uzlu): z uzlu ven za 8 až 10 snímků, power2.out */
  function kresli(tl, path, t, o = {}) {
    const d = path.getTotalLength ? path.getTotalLength() : 1000;
    tl.set(path, { strokeDasharray: d, strokeDashoffset: d, visibility: "visible" }, 0);
    tl.fromTo(path, { strokeDashoffset: o.obracene ? -d : d }, { strokeDashoffset: 0, duration: M(o.snimku || 9), ease: o.ease || "power2.out", immediateRender: false }, t);
  }

  /* ŠTÍTEK (HIRING, PRICING...): dlaždice se odhalí wipem zleva za 6 snímků,
   * text uvnitř vyjede s maskou 1 snímek po startu (0 až 2 snímky po slově). Stagger mezi štítky 1 až 2 sn. ve skupině, 6 až 10 sn. na řeč
   */
  function stitek(tl, el, t, o = {}) {
    ukaz(tl, el, t);
    tl.fromTo(el, { clipPath: "inset(0% 100% 0% 0% round 8px)" }, { clipPath: "inset(0% 0% 0% 0% round 8px)", duration: M(o.snimku || 6), ease: "power2.out", immediateRender: false }, t);
    const txt = el.querySelector(".mg-stitek-text");
    if (txt) vyjed(tl, txt, t + M(o.textPo == null ? 1 : o.textPo), { snimku: 6, od: 0.9, blur: 14 });
  }

  /* VYSTOUPÁNÍ ŠTÍTKU (Ddpm R4): štítek vyjede o 80 až 100 px za 8 snímků, krytí za 6 */
  function stitekZdola(tl, el, t, o = {}) {
    ukaz(tl, el, t);
    tl.fromTo(el, { y: o.y || 90, opacity: 0 }, { y: 0, opacity: 1, duration: M(8), ease: "expo.out", immediateRender: false }, t);
  }

  /* KARTA, DUCH ZESPODU (Ddpm R3, ONE SYSTEM): y +200 > 0, krytí 0,35 > 1, blur 12 > 0, expo.out
   * Malé karty 8 snímků, široké 16, velká karta 22. Stagger 9 až 10 snímků
   */
  function karta(tl, el, t, o = {}) {
    const sn = o.snimku || 16;
    ukaz(tl, el, t);
    tl.fromTo(el, { y: o.y || 200, opacity: 0.35, filter: "blur(12px)" },
      { y: 0, opacity: 1, filter: "blur(0px)", duration: M(sn), ease: "expo.out", immediateRender: false }, t);
    tl.set(el, { filter: "none" }, t + M(sn));
  }

  /* VJEZD ZE STRANY (mřížka a kalendář f..., Ddpm R5): translateX 780 > 0 za 13 snímků expo.out,
   * dozvuk: zmenšení a drift 32 px za 8 snímků
   */
  function vjezd(tl, el, t, o = {}) {
    ukaz(tl, el, t);
    tl.fromTo(el, { x: o.x == null ? 780 : o.x }, { x: 0, duration: M(o.snimku || 13), ease: "expo.out", immediateRender: false }, t);
  }

  /* PŘESUN (karta ONE SYSTEM po nástupu: zmenšení na 0,69 a posun o 363 px za 20 snímků) */
  function presun(tl, el, t, kam, o = {}) {
    tl.to(el, { ...kam, duration: M(o.snimku || 20), ease: o.ease || "power2.inOut" }, t);
  }

  /* PULZ (štítky ve sloupci na důraz): scale 1,15 tam a zpět za 4 snímky */
  function pulz(tl, el, t, o = {}) {
    tl.to(el, { scale: o.scale || 1.15, duration: M(o.snimku || 2), ease: "power2.out" }, t);
    tl.to(el, { scale: 1, duration: M(o.snimku || 2), ease: "power2.in" }, t + M(o.snimku || 2));
  }

  /* SKOKY (zvýrazněná buňka v kalendáři): tvrdě 4 snímky na pozici, bez tweenu.
   * pozice = [{left, top, width, height}, ...]
   */
  function skoky(tl, el, t, pozice, o = {}) {
    ukaz(tl, el, t);
    pozice.forEach((p, i) => tl.set(el, p, t + M((o.snimku || 4) * i)));
  }

  /* NADPIS SEKCE (1 THE FUNCTIONS): oblouk se kreslí 6 sn., pak tečka, číslo a dva řádky (vyjeď),
   * drží 11 až 19 sn. nebo do konce, odchod 4 sn.: nahoru o 25 px a zmizí
   */
  function sekce(tl, el, t, konec) {
    ukaz(tl, el, t);
    const oblouk = el.querySelector("path");
    if (oblouk) kresli(tl, oblouk, t, { snimku: 6, ease: "power2.inOut" });
    const tecka = el.querySelector(".tecka");
    if (tecka) {
      ukaz(tl, tecka, t + M(5));
      tl.fromTo(tecka, { scale: 0 }, { scale: 1, duration: M(5), ease: "back.out(2)", immediateRender: false }, t + M(5));
    }
    const cislo = el.querySelector(".cislo");
    if (cislo) vyjed(tl, cislo, t + M(6), { snimku: 9, od: 0.4 });
    el.querySelectorAll(".nazev").forEach((n, i) => nadpis(tl, n, t + M(8 + i * 3), { stagger: 2 }));
    if (konec != null) {
      tl.to(el, { y: -25, opacity: 0, duration: M(4), ease: "power2.in" }, konec - M(4));
      skryj(tl, el, konec);
    }
  }

  /* ZOOM HLAVY v celoobrazovém režimu: lineární drift +15 až 17 % za 38 až 59 sn.
   * (nebo pull out), každý střih zoom resetuje. Na jump cutu skok o x1,22 až 1,33 nebo x0,84 až 0,87
   */
  function zoom(tl, el, t0, t1, od, kam, o = {}) {
    tl.fromTo(el, { scale: od }, { scale: kam, duration: t1 - t0, ease: "none", immediateRender: false, transformOrigin: o.origin || "50% 35%" }, t0);
  }

  /* TITULKY v celoobrazovém režimu: tvrdý střih bez animace, 1 až 3 slova (typicky 1 až 2),
   * naskočí +1 snímek po začátku slova, drží do další skupiny. Nikdy v split režimu
   * slova = [{w, t, e}], skupiny = [[od, do], ...] indexy, o.konce = {index skupiny: čas}
   */
  function titulky(tl, kontejner, slova, skupiny, o = {}) {
    const zp = o.zpozdeni == null ? M(1) : o.zpozdeni;
    skupiny.forEach(([a, b], i) => {
      const d = document.createElement("div");
      d.className = "mg-titulek" + (o.trida ? " " + o.trida : "");
      d.textContent = (o.text && o.text[i]) || slova.slice(a, b + 1).map((s) => s.w).join(" ").replace(/[.,]$/, "");
      kontejner.appendChild(d);
      const t = slova[a].t + zp;
      const dalsi = skupiny[i + 1] ? slova[skupiny[i + 1][0]].t + zp : slova[b].e + 0.35;
      const konec = (o.konce && o.konce[i] != null) ? o.konce[i] : dalsi;
      ukaz(tl, d, t);
      skryj(tl, d, konec);
    });
  }

  /* REŽIM: celoobrazová vrstva (talking head nebo B-roll) zakryje split mezi t0 a t1, tvrdý střih.
   * Přes opacity, ne visibility: runtime dává videu visibility visible a to by skrytého rodiče přebilo
   */
  function rezim(tl, el, t0, t1) { tl.set(el, { opacity: 1 }, t0); tl.set(el, { opacity: 0 }, t1); }

  /* POPUP lead magnetu (Ddpm R11): 0,8 > 1,066 > 1 za 9 sn., pak push in 1 > 1,09 za 30 sn. */
  function popup(tl, el, t) {
    ukaz(tl, el, t);
    tl.fromTo(el, { scale: 0.8, opacity: 0 }, { scale: 1.066, opacity: 1, duration: M(5), ease: "power2.out", immediateRender: false }, t);
    tl.to(el, { scale: 1, duration: M(4), ease: "power2.inOut" }, t + M(5));
    tl.to(el, { scale: 1.09, duration: M(30), ease: "none" }, t + M(9));
  }

  /* SVĚT (Ddpm R6): grafika nikdy nestojí, celý svět i s mřížkou plave (y), střídmě */
  function svet(tl, el, t0, t1, o = {}) {
    tl.fromTo(el, { y: o.od || 0 }, { y: o.kam == null ? -40 : o.kam, duration: t1 - t0, ease: "none", immediateRender: false }, t0);
  }

  /* PRUH NA SLOVO (pyramida Ddus: FUNNEL, ADS, CLOSER): akcentový pruh se zleva maže a stejnou
   * tvrdou maskou se odhaluje slovo, lineárně 41 až 44 px za snímek, 6 až 9 snímků, dohraje do zvuku slova.
   * el = .mg-pruh s dětmi .vypln a .slovo
   */
  function pruhNaSlovo(tl, el, t, o = {}) {
    const sn = o.snimku || 8;
    const vypln = el.querySelector(".vypln"), slovo = el.querySelector(".slovo");
    ukaz(tl, slovo, t);
    tl.fromTo(vypln, { clipPath: "inset(0% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 100%)", duration: M(sn), ease: "none", immediateRender: false }, t);
    tl.fromTo(slovo, { clipPath: "inset(0% 100% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: M(sn), ease: "none", immediateRender: false }, t);
  }

  /* ZHASNI (místo jeho červeného přeškrtnutí, Beyond přeškrtnutí nepoužívá): slovo ztratí barvu
   * na šedou ducha za 6 snímků. Konec padá na zvuk slova, stejně jako u Matta konec tahu
   */
  function zhasni(tl, el, t, o = {}) {
    tl.to(el, { color: token("--mg-duch"), opacity: o.opacity || 1, duration: M(o.snimku || 6), ease: "power2.out" }, t);
  }

  /* ODHALENÍ MASKOU (velké slovo Distribution): měkká hrana ~260 px jede zleva ~95 px za snímek,
   * 11 snímků lineárně, bez blur
   */
  function maskaZleva(tl, el, t, o = {}) {
    const sn = o.snimku || 11, hrana = o.hrana || 260;
    ukaz(tl, el, t);
    const set = (p) => `linear-gradient(90deg, #000 ${p - hrana}px, transparent ${p}px)`;
    const stav = { p: 0 };
    const w = el.offsetWidth || 1000;
    tl.fromTo(stav, { p: 0 }, { p: w + hrana, duration: M(sn), ease: "none", immediateRender: false,
      onUpdate: () => { el.style.webkitMaskImage = el.style.maskImage = set(stav.p); } }, t);
    tl.set(el, { webkitMaskImage: "none", maskImage: "none" }, t + M(sn));
  }

  /* SEZNAM PO SLOVECH (Ddus -Ads get cheaper): každé slovo 8 snímků, vyjede z +109 px power3.out,
   * krytí 56 % > 100 % za 5 sn. (nejdřív šedé), blur 3 px > 0. První slovo řádku na řeč, další předbíhají 3 až 6 sn.
   * casy = pole časů slov přes všechny řádky
   */
  function seznam(tl, el, casy) {
    const sl = el._mgSlova || (el._mgSlova = slova(el));
    ukaz(tl, el, casy[0]);
    sl.forEach((s, i) => {
      const t = casy[Math.min(i, casy.length - 1)];
      ukaz(tl, s, t);
      tl.fromTo(s, { y: 109, opacity: 0.56, filter: "blur(3px)" }, { y: 0, opacity: 1, filter: "blur(0px)", duration: M(8), ease: "power3.out", immediateRender: false }, t);
      tl.set(s, { filter: "none" }, t + M(8));
    });
    return sl;
  }

  window.MG = { M, token, FPS_ORIG, ukaz, skryj, vyjed, slova, nadpis, podklad, kresli, stitek, stitekZdola, karta, vjezd, presun, pulz, skoky, sekce, zoom, titulky, rezim, popup, svet, pruhNaSlovo, zhasni, maskaZleva, seznam };
})();
