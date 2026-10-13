// Heaton celý v Lumitris stylu (Beyond verze), 4:3 1440x1080, 24 fps
// Část 1 (0 až 16,7 s) je heaton15.mjs, tady navazuje zbytek těla, dvě citace s originálním zvukem a CTA.
// Časy v plánu: t = čas ve stopě vyprávění (slova_TELO.json), vt(t) = čas ve videu po vložení citací.
import cast1 from "./heaton15.mjs";

const FPS = 24, W = 1440, H = 1080;
const R = "$BR_REELY/podnikatele/heaton/";   // starý reel Heaton; priprav.py si $BR_REELY rozbalí, jiné umístění přepsat tady
const K = R + "zdroj/klipy/", N = R + "zdroj/nalez/", AM = R + "assets/media/";
// citace vložené do vyprávění: [čas ve vyprávění, délka v s]
const VL = [[43.98, 3.70], [81.48, 3.05]];
const vt = (t) => t + VL.filter(([a]) => t >= a).reduce((s, [, d]) => s + d, 0);
const F = (t) => Math.round(vt(t) * FPS);
const wf = (t) => F(t) + 2;
const I = (j) => `assets/img/${j}.jpg`;
// vlogy s vypálenými titulky dole: přiblížit 1,25x od horního okraje, titulky vypadnou ze záběru
const BEZ_TIT = "scale=-2:1350,crop=1440:1080:(iw-1440)/2:0";

const priprava = { klipy: [], fotky: [], vyrezy: [], nalepky: [], zvuky: [] };
const foto = (j, src) => { if (!priprava.fotky.some((f) => f[0] === j)) priprava.fotky.push([j, src]); return I(j); };

// řádek slov ve slotech: [text, t, slot, třída]
const radek = (y, slova, o = {}) => ({ typ: "radek", y, s: o.s ?? 80, styl: o.styl ?? "sans tucne", barva: o.barva, odchod: o.odchod, stredy: o.stredy, sloty: o.sloty, f1: o.f1,
  slova: slova.map(([w, t, sl, c]) => [w, typeof t === "string" ? +t : wf(t), sl, c]) });
const jedno = (w, t, o = {}) => radek(o.y ?? 900, [[w, t, 0, o.c]], { ...o, stredy: o.stredy ?? [0.5] });
const box = (text, t, x, y, o = {}) => ({ typ: "box", text, f: wf(t), x, y, s: o.s ?? 88, barva: o.barva ?? "cervena", styl: o.styl });
const stitek = (a, ta, b, tb, x, y) => ({ typ: "stitek", x, y, s: 70, casti: [[a, "sans", wf(ta)], [b, "serif", wf(tb)]] });
const obri = (text, t, o = {}) => ({ typ: "obri", text, f: wf(t), n: o.n ?? 2, s: o.s ?? 360, sy: o.sy ?? 3, vypln: o.vypln, styl: o.styl });
const blok = (x, y, radky) => ({ typ: "blok", x, y, radky: radky.map(([w, t, sz, st, b]) => [w, wf(t), sz, st, b]) });

// scény části 2: t = začátek (čas vyprávění) nebo f = začátek ve snímcích (citace); f1 = začátek další scény
const S = [
  // KAPITOLA 1: kontakty
  { t: 16.62, typ: "platno", texty: [blok(300, 360, [["zaprvé", 16.74, 60, "sans", "seda"]]), obri("KONTAKTY", 17.10, { s: 300 }), box("kontakty", 17.10 + 0.09, 300, 440, { s: 150, barva: "krem" })] },
  { t: 17.84, klip: [K + "jYUcsLdrm3M.mp4", 424.0, BEZ_TIT], texty: [radek(880, [["George", 17.84, 0], ["tvorbu", 18.96, 1], ["spojuje", 19.38, 2]])] },
  { t: 19.74, typ: "platno", tah: [1.0, 1.1, 1, 30, "dojezd"],
    karty: [["portret_cbum_1", 120, 120, 380, 214, 19.82, 6], ["portret_will_2", 960, 110, 360, 203, 19.82 + 0.12, 6], ["portret_ross_1", 860, 560, 420, 236, 19.82 + 0.25, 2],
      ["portret_michael_1", 150, 590, 400, 225, 19.82 + 0.37, 2], ["portret_cbum_2", 470, 300, 500, 281, 20.24, 0]].map(([j, x, y, w, h, t, b], n) =>
      ({ src: foto(j, N + j + ".jpg"), x, y, w, h, f: wf(t), blur: b, neg: n % 2 ? 0 : 1, z: b ? 1 : 4 })),
    texty: [radek(900, [["běžný", 20.70, 0], ["podnikatel", 21.04, 1], ["nikdy", 21.56, 2]], { f1: wf(21.82) }), box("nedostane", 21.82, 470, 860, { s: 96 })] },
  { t: 22.50, typ: "platno", karty: [{ src: "assets/media/k_bumstead.mp4", klip: [AM + "kv/bumstead.mp4", 0.4, "vyska"], x: 250, y: 140, w: 560, h: 760, f: F(22.50), mekka: true }],
    texty: [blok(860, 560, [["natáčel s", 22.50, 56, "sans", "seda"]]), stitek("Chris", 23.00, "Bumstead", 23.36, 860, 640)] },
  { t: 23.96, typ: "platno", tah: [1.0, 1.14, 0, 40, "s"],
    karty: ["Db3qmxyPKZ6", "DbGhoqgRVOZ", "DbKkFfbOS-j", "DblcaHaMiUs", "DcWnccKva2E", "DcYn6NYxlDm", "DcwA01lRTHy", "DdO4t7DRK1u", "DdY7OVjROdY", "Ddyr7vrR6lF"].map((j, n) =>
      ({ src: foto("ig_" + j, AM + "igr/" + j + ".jpg"), x: 105 + (n % 5) * 252, y: 110 + Math.floor(n / 5) * 440, w: 222, h: 395, f: F(23.96) + 1 + n * 2, neg: n % 3 === 0 ? 1 : 0 })),
    texty: [radek(540, [["dalšími", 24.66, 0], ["zajímavými", 25.06, 1], ["lidmi", 25.58, 2]], { s: 84 })] },
  { t: 26.00, typ: "vyrez", pozadi: "svetla", vyrez: { jm: "goodge", src: R + "zdroj/vys/goodge_cut.png", sirka: 560, typ: "rastr", x: 440, y: 190, w: 560, pan: [220, 0, 2, 16], stin: [26, 14], pruh: false },
    texty: [radek(135, [["ultra", 26.10, 0], ["endurance", 26.36, 1], ["běžcem", 26.74, 2]], { barva: "tmava" }), stitek("Will", 27.14, "Goodge", 27.40, 110, 905)] },
  { t: 27.78, foto: ["portret_ross_2", N + "portret_ross_2.jpg"], tah: [1.0, 1.2, 0, 24, "najezd"], texty: [stitek("Ross", 28.00, "MacKay", 28.30, 760, 720)] },
  { t: 28.80, klip: [AM + "c_cadence.mp4", 3.0],
    karty: [{ src: foto("logo_cadence_1", N + "logo_cadence_1.jpg"), x: 900, y: 110, w: 440, h: 248, f: wf(29.72), neg: 2 }],
    texty: [radek(900, [["Společně", 28.80, 0], ["založili", 29.24, 1]]), box("Cadence", 29.72, 960, 860, { s: 84 })] },
  { t: 30.28, typ: "platno", tah: [1.0, 1.22, 2, 40, "s"],
    karty: ["logo_247_1", "logo_cadence_2", "logo_owners_1", "logo_represent_2", "logo_247_2", "logo_owners_3", "logo_cadence_3", "logo_represent_1", "logo_247_3", "logo_owners_2", "produkt_3", "logo_cadence_1"].map((j, n) =>
      ({ src: foto(j, N + j + ".jpg"), x: 60 + (n % 4) * 335, y: 150 + Math.floor(n / 4) * 265, w: 315, h: 245, f: F(30.28) + 1 + n * 2, neg: n % 4 === 1 ? 1 : 0 })),
    texty: [box("partnerství", 31.70, 420, 470, { s: 104 }), radek(990, [["ostatními", 32.54, 0], ["značkami", 33.00, 2]])] },
  { t: 33.52, klip: [K + "VofeFR5LnZ4.mp4", 21.8], texty: [radek(880, [["jinak", 34.08, 0], ["těžko", 34.34, 1], ["dostával", 34.60, 2]])] },
  { t: 35.30, klip: [K + "h5brRENzsOU.mp4", 21.8], grade: "cb", tah: [1.0, 1.3, 0, 34, "najezd"],
    texty: [radek(470, [["roste", 35.58, 0], ["byznys", 35.98, 1], ["dál", 36.30, 2]]), obri("DÁL", 36.30, { vypln: "inverze", s: 420 })] },
  // KAPITOLA 2: prodej
  { t: 36.74, typ: "platno", svetle: true,
    texty: [blok(300, 300, [["zadruhé", 36.74, 60, "sans", "tmava"]]), box("prodej", 37.12, 300, 380, { s: 160 }),
      radek(800, [["nevypadá", 37.86, 0], ["jako", 38.36, 1], ["prodej", 38.56, 2, "serif"]], { barva: "tmava", s: 84 })] },
  { t: 39.06, klip: [K + "9fGr_fZTKHY.mp4", 1278.0], texty: [radek(900, [["obsahu", 39.16, 0], ["ukazuje", 39.60, 1], ["trénink", 40.02, 2]])] },
  { t: 40.60, klip: [K + "9fGr_fZTKHY.mp4", 618.0], texty: [jedno("práci", 40.60, { s: 92 })] },
  { t: 41.24, klip: [K + "clFvSb8W9es.mp4", 770.0], texty: [jedno("zákulisí", 41.24, { s: 92 })] },
  { t: 42.16, klip: [K + "9fGr_fZTKHY.mp4", 668.0], texty: [radek(780, [["mezi tím", 42.24, 0], ["na sobě", 42.82, 1]]), box("novou kolekci", 43.18, 380, 860, { s: 88 })] },
  // CITACE 1: George, originální zvuk, 24 fps, barvy
  { f: Math.round(43.98 * FPS), klip: [AM + "c_teplaky.mp4", 1.27], grade: "barva", takt: 1, citace: { soubor: "q_teplaky", src: AM + "c_teplaky.mp4", od: 1.27, do: 4.97 },
    texty: [["nová", 3], ["teplákovka", 14], ["na zimu,", 34], ["ještě", 54], ["nevyšla", 64]].map(([w, d], n, a) =>
      radek(930, [[w, String(Math.round(43.98 * FPS) + d), 0]], { stredy: [0.5], styl: "sans", s: 90, f1: n < a.length - 1 ? Math.round(43.98 * FPS) + a[n + 1][1] : undefined })) },
  { t: 44.12, typ: "platno", texty: [{ ...blok(280, 360, [["žádný", 44.44, 60, "sans", "seda"], ["nucený", 44.82, 130, "sans tucne"], ["marketing", 45.20, 130, "sans tucne"]]), radkovani: 1.12 }] },
  { t: 45.72, typ: "platno", svetle: true, tah: [1.0, 1.1, 0, 30, "dojezd"],
    karty: [{ src: foto("produkt_3", N + "produkt_3.jpg"), x: 80, y: 160, w: 420, h: 236, f: F(45.72) + 1, blur: 7 },
      { src: foto("produkt_5", N + "produkt_5.jpg"), x: 950, y: 600, w: 420, h: 236, f: F(45.72) + 4, blur: 7, neg: 1 },
      { src: "assets/img/george_v_nalepka.png", nalepka: ["george_v", R + "zdroj/vys/george_cut.png", 860], x: 420, y: 100, w: 600, h: 880, f: wf(46.86), cista: true, z: 5 }],
    texty: [radek(860, [["prodává", 45.72, 0], ["jenom", 46.20, 1], ["tím", 46.46, 2]], { barva: "tmava", f1: wf(46.86) }),
      radek(860, [["nosí", 46.86, 0], ["vlastní", 47.36, 1], ["oblečení", 47.78, 2]], { barva: "tmava" })] },
  { t: 48.44, typ: "platno", posun: [120, 0, -160, 0, 0, 62, "s"],
    karty: ["DcwA01lRTHy", "DdY7OVjROdY", "DblcaHaMiUs", "Ddyr7vrR6lF", "DcYn6NYxlDm"].map((j, n) =>
      ({ src: foto("ig_" + j, AM + "igr/" + j + ".jpg"), x: 40 + n * 300, y: [140, 260, 90, 300, 180][n], w: [230, 300, 250, 210, 270][n], h: [409, 533, 444, 373, 480][n], f: F(48.44) + 1 + n * 3, blur: [6, 0, 3, 8, 0][n], neg: n === 1 ? 2 : 0, z: [1, 5, 3, 1, 4][n] })),
    texty: [radek(950, [["přetvořil", 49.18, 0], ["marketing", 49.60, 1], ["kolekcí", 50.38, 2]])] },
  { t: 51.08, klip: [K + "9fGr_fZTKHY.mp4", 831.0], texty: [radek(880, [["naprosto", 51.18, 0], ["přirozenou", 51.72, 1], ["věc", 52.40, 2]])] },
  { t: 52.92, klip: [K + "9dwCvRL7n3M.mp4", 3.0], grade: "cb",
    yt: { x: 720, y: 170, w: 640, rady: [
      { av: foto("av_drallday13", AM + "kom/drallday13.jpg"), jmeno: "@drallday13", kdy: "před 3 měsíci", text: "What's the Inside out tee you're wearing? Looks sick", likes: 2, f: wf(53.0) },
      { av: foto("av_akamdapapash", AM + "kom/akamdapapash.jpg"), jmeno: "@akamdapapash", kdy: "před měsícem", text: "The camo is fire!!", likes: 2, f: wf(53.26) },
      { av: foto("av_bewareeverything", AM + "kom/bewareeverything.jpg"), jmeno: "@bewareeverything", kdy: "před měsícem", text: "Need that new 247 collab bad", likes: 3, f: wf(53.6) }] },
    texty: [radek(980, [["lidé", 53.36, 0], ["zajímají", 53.68, 1]], { stredy: [0.16, 0.42] })] },
  { t: 54.30, klip: [K + "jYUcsLdrm3M.mp4", 509.6, BEZ_TIT], texty: [radek(880, [["nic", 54.42, 0], ["nemusí", 54.62, 1], ["tlačit", 54.94, 2]])] },
  { t: 55.34, klip: [K + "SAmqCxYgrUw.mp4", 556.0], texty: [radek(900, [["osobnost", 55.62, 0], ["prodává", 56.62, 1], ["sama", 57.14, 2, "serif"]])] },
  // KAPITOLA 3: autorita
  { t: 57.66, typ: "platno",
    texty: [jedno("zatřetí", 57.76, { y: 380, styl: "sans", barva: "seda", s: 60, f1: F(59.18) }), jedno("autorita", 58.42, { y: 540, s: 200, f1: wf(58.42) + 3 }),
      jedno("autorita", String(wf(58.42) + 3), { y: 540, s: 250, styl: "serif" }), obri("AUTORITA", 58.42 - 0.09, { s: 280, n: 2 })] },
  { t: 59.18, tim: 59.18, texty: [radek(430, [["Tady", 59.18, 0], ["nejzajímavější", 59.52, 1]], { stredy: [0.16, 0.6], s: 96 })] },
  { t: 60.20, klip: [AM + "c_diy.mp4", 1.0, BEZ_TIT], texty: [radek(880, [["všechno", 60.58, 0], ["natáčí", 60.96, 1]]), obri("DIY", 61.52, { vypln: "inverze", s: 520, sy: 2.4 }), box("DIY", 61.52 + 0.09, 1010, 830, { s: 100, barva: "krem" })] },
  { t: 62.20, klip: [K + "VofeFR5LnZ4.mp4", 1983.4], grade: "cb", texty: [radek(470, [["žádnou", 62.78, 0], ["velkou", 63.06, 1], ["produkci", 63.36, 2]])] },
  { t: 63.82, klip: [K + "jYUcsLdrm3M.mp4", 550.0, BEZ_TIT], texty: [radek(880, [["Někdy", 63.82, 0], ["z ruky", 64.48, 2]])] },
  { t: 65.12, klip: [K + "VofeFR5LnZ4.mp4", 2050.3], texty: [radek(880, [["někdy", 65.12, 0], ["kameramana", 65.68, 2]])] },
  { t: 66.32, typ: "platno", texty: [jedno("To je všechno.", 66.32, { y: 540, s: 130, styl: "serif" })] },
  { t: 66.88, klip: [AM + "c_bumstead.mp4", 0.2], texty: [radek(880, [["humorem", 67.30, 0], ["zábavu", 68.06, 2]])] },
  { t: 68.84, typ: "platno",
    karty: [{ src: foto("tvar_43", R + "zdroj/tvare_g/3.png"), x: 110, y: 230, w: 560, h: 560, f: F(68.84) + 1, neg: 1 },
      { src: "assets/media/k_firma.mp4", klip: [AM + "c_ross.mp4", 2.0], x: 770, y: 230, w: 560, h: 560, f: wf(71.40), neg: 1 }],
    texty: [radek(150, [["zároveň", 69.06, 0], ["dává", 69.76, 2]]), box("stejnou prioritu", 70.12, 400, 860, { s: 96 })] },
  { t: 71.94, typ: "platno", karty: [{ src: "assets/media/k_tim_mekka.mp4", tim: 71.94, x: 180, y: 0, w: 1080, h: 1080, f: F(71.94), mekka: true, grade: "puvodni" }], bezGrade: true,
    texty: [radek(560, [["moc", 72.48, 0], ["dobře", 72.70, 1], ["uvědomuje", 73.02, 2]], { s: 90 })] },
  { t: 73.84, typ: "platno",
    serie: { obrazy: ["DdO4t7DRK1u", "Db3qmxyPKZ6", "DcWnccKva2E", "DbKkFfbOS-j", "DdY7OVjROdY", "Ddyr7vrR6lF", "DblcaHaMiUs", "DbGhoqgRVOZ", "DcYn6NYxlDm", "DcwA01lRTHy", "DdO4t7DRK1u", "Db3qmxyPKZ6", "DcWnccKva2E", "DbKkFfbOS-j", "DdY7OVjROdY", "Ddyr7vrR6lF", "DblcaHaMiUs", "DbGhoqgRVOZ", "DcYn6NYxlDm", "DcwA01lRTHy", "DdO4t7DRK1u"].map((j) => foto("ig_" + j, AM + "igr/" + j + ".jpg")),
      f: F(73.84) + 1, krok: 2, h0: 820, h1: 820, cx: 720, cy: 540, pomer: 0.5625 },
    texty: [radek(540, [["osobní", 74.72, 0], ["profil", 75.12, 1], ["přináší", 75.46, 2]], { s: 90 })] },
  { t: 76.30, foto: ["logo_247_1", N + "logo_247_1.jpg"], tah: [1.0, 1.25, 0, 58, "najezd"],
    texty: [radek(880, [["sub brand", 76.66, 0], ["Representu", 77.28, 1]], { f1: wf(77.86) }), obri("247", 77.86, { styl: "serif", s: 560, sy: 1.8 }), jedno("247", String(wf(77.86) + 2), { y: 540, s: 260 })] },
  { t: 78.76, typ: "vyrez", pozadi: "krem", vyrez: { jm: "george_v", src: R + "zdroj/vys/george_cut.png", sirka: 520, typ: "rastr", x: 600, y: 160, w: 520, pan: [-200, 0, 2, 16], stin: [-26, 14] },
    texty: [radek(150, [["stojí", 78.76, 0], ["na jeho", 79.00, 1]], { barva: "tmava", stredy: [0.2, 0.5] }), box("jménu", 79.30, 180, 820, { s: 120 })] },
  { t: 79.80, klip: [K + "9dwCvRL7n3M.mp4", 796.0, BEZ_TIT], texty: [radek(880, [["ukazoval", 80.34, 0], ["jak", 80.80, 1], ["trénuje", 80.98, 2]])] },
  // CITACE 2: George, originální zvuk
  { f: Math.round((81.48 + 3.70) * FPS), klip: [AM + "c_leader.mp4", 4.30, "crop=1108:832:406:124,scale=1440:1080"], grade: "barva", takt: 1,
    citace: { soubor: "q_leader", src: AM + "c_leader.mp4", od: 4.30, do: 7.35 },
    texty: [["dělám to,", 2], ["protože", 16], ["jsem", 28], ["lídr", 36], ["té značky", 50]].map(([w, d], n, a) => {
      const f0 = Math.round((81.48 + 3.70) * FPS);
      return radek(930, [[w, String(f0 + d), 0]], { stredy: [0.5], styl: "sans", s: 90, f1: n < a.length - 1 ? f0 + a[n + 1][1] : undefined });
    }) },
  { t: 81.60, typ: "platno", tah: [1.0, 1.08, 0, 28, "dojezd"], bezGrade: true,
    karty: [{ src: foto("tvar_44", R + "zdroj/tvare_g/4.png"), x: 70, y: 200, w: 300, h: 400, f: F(81.60) + 1, blur: 6 },
      { src: foto("tvar_46", R + "zdroj/tvare_g/6.webp"), x: 1080, y: 520, w: 300, h: 400, f: F(81.60) + 3, blur: 6 },
      { src: "assets/media/k_tim_karta.mp4", tim: 81.60, x: 420, y: 210, w: 600, h: 450, f: F(81.60), grade: "puvodni", z: 5 }],
    texty: [radek(880, [["sleduju", 81.80, 0], ["už dlouho", 82.08, 1], ["vím", 82.64, 2]])] },
  { t: 82.78, tim: 82.78, texty: [radek(430, [["jedinej", 82.90, 0], ["důvod", 83.24, 1], ["koupil", 83.94, 2]], { s: 96 })] },
  { t: 84.26, foto: ["logo_represent_1", N + "logo_represent_1.jpg"], tah: [1.0, 1.18, 0, 20, "najezd"], texty: [jedno("Represent", 84.26, { y: 880, s: 110 })] },
  { t: 85.12, typ: "platno", svetle: true,
    karty: [{ src: "assets/img/george_v_nalepka.png", x: 60, y: 90, w: 660, h: 900, f: wf(85.32), cista: true },
      { src: "assets/img/michael_v_nalepka.png", nalepka: ["michael_v", R + "zdroj/vys/michael_cut.png", 860], x: 720, y: 90, w: 660, h: 900, f: wf(85.60), cista: true }],
    texty: [stitek("George", 85.32, "Heaton", 85.32 + 0.09, 140, 880), stitek("Michael", 85.60, "Heaton", 85.60 + 0.09, 800, 880)] },
  // POINTA: Tim velký detail, tvář vpravo, jedno slovo vlevo v úrovni očí, 24 fps, hudba dolů
  { t: 86.48, tim: 86.48, timVf: "scale=2160:1620,crop=1440:1080:144:60", takt: 1, tah: [1.0, 1.07, 0, 144, "lin"], pointa: true,
    texty: [["firmu", 87.08], ["osobní profil", 88.24], ["komunitu", 90.16], ["známosti", 91.02], ["obchod", 92.10]].map(([w, t], n, a) =>
      ({ typ: "radek", y: 400, s: 92, styl: "sans", stredy: [0.27], slova: [[w, wf(t), 0]], f1: n < a.length - 1 ? wf(a[n + 1][1]) : undefined })) },
  // CTA: pole komentáře, psaní “HEATON”
  { t: 92.48, typ: "platno", takt: 1, pole: { x: 170, y: 430, w: 1100, text: "“HEATON”", f: wf(93.42), krok: 2, s: 110 },
    texty: [radek(300, [["napiš", 92.48, 0], ["do komentáře", 92.76, 1]], { stredy: [0.24, 0.62] }), radek(820, [["pošlu", 94.38, 0], ["návod", 94.86, 2, "serif"]])] },
];

const delka = Math.round(vt(95.2) * FPS);
const zacatek = (s) => s.f ?? F(s.t);
const sceny2 = S.map((s, n) => {
  const f0 = zacatek(s), f1 = n < S.length - 1 ? zacatek(S[n + 1]) : delka;
  const sc = { ...s, f0, f1, typ: s.typ ?? "zaber" };
  const jm = `k${n}`;
  const nsn = f1 - f0 + 4;
  if (s.klip) { priprava.klipy.push([jm, s.klip[0], s.klip[1], nsn, s.klip[2] ?? "stred"]); sc.src = `assets/media/${jm}.mp4`; sc.grade = s.grade ?? "tlum"; }
  if (s.tim != null) { priprava.klipy.push([jm, AM + "tim_telo.mp4", s.tim, nsn, s.timVf ?? "scale=1440:1080"]); sc.src = `assets/media/${jm}.mp4`; sc.grade = "puvodni"; sc.bezGrade = true; }
  if (s.foto) sc.src = foto(...s.foto), sc.grade = s.grade ?? "tlum";
  (s.karty || []).forEach((k, j) => {
    if (k.klip) { const kj = `${jm}c${j}`; priprava.klipy.push([kj, k.klip[0], k.klip[1], nsn, k.klip[2] ?? "stred"]); k.src = `assets/media/${kj}.mp4`; }
    if (k.tim != null) { const kj = `${jm}c${j}`; priprava.klipy.push([kj, AM + "tim_telo.mp4", k.tim, nsn, "scale=1440:1080"]); k.src = `assets/media/${kj}.mp4`; }
    if (k.nalepka) priprava.nalepky.push(k.nalepka);
  });
  if (s.vyrez) {
    const v = s.vyrez;
    if (!priprava.vyrezy.some((x) => x[0] === v.jm)) priprava.vyrezy.push([v.jm, v.src, v.sirka]);
    sc.vyrez = { ...v, src: `assets/img/${v.jm}_${v.typ ?? "tisk"}.png`, stinSrc: `assets/img/${v.jm}_stin.png` };
  }
  if (s.citace) priprava.zvuky.push([s.citace.soubor, s.citace.src, s.citace.od, s.citace.do]);
  sc.texty = (s.texty || []).map((t) => ({ ...t, f1: t.f1 ?? f1 }));
  return sc;
});

// část 1: takty podle heaton15 (čítač a okno 24 fps, série 8 fps)
const TAKT1 = [2, 2, 1, 2, 2, 3, 2, 2, 1, 2];
const sceny1 = cast1.sceny.map((sc, n) => ({ ...sc, takt: TAKT1[n] }));
sceny1[sceny1.length - 1].f1 = sceny2[0].f0;

// glitche mezi scénami části 2: negativ příští scény nebo šedé desky, 2 až 3 snímky před střihem, ne u citací, pointy a CTA
let semeno = 7;
const nahoda = () => ((semeno = (semeno * 16807) % 2147483647) / 2147483647);
const obrazScény = (sc) => sc.src?.endsWith(".mp4") ? sc.src.replace("assets/media/", "assets/img/").replace(".mp4", "_0.jpg")
  : sc.src ?? sc.karty?.find((k) => k.src.endsWith(".jpg"))?.src;
const glitche2 = [];
sceny2.forEach((sc, n) => {
  const dalsi = sceny2[n + 1];
  if (!dalsi || sc.citace || dalsi.citace || sc.pointa || dalsi.pointa || nahoda() < 0.18) return;
  const img = obrazScény(dalsi);
  const neg = img && nahoda() < 0.68;
  const b = () => { const w = 300 + nahoda() * 900, h = 160 + nahoda() * 420; return [Math.round(nahoda() * (W - w)), Math.round(nahoda() * (H - h)), Math.round(w), Math.round(h)]; };
  const n2 = 1 + (nahoda() < 0.6 ? 1 : 0);
  const bloky = [];
  for (let j = 0; j < n2; j++) bloky.push([...b(), neg ? "neg" : (j ? "seda2" : "seda1"), j, j ? 2 : 3]);
  glitche2.push({ f: sc.f1 - 3, n: 3, druh: neg ? "neg" : undefined, img: neg ? img : undefined, bloky });
});

const sceny = [...sceny1, ...sceny2];
const pointa = sceny2.find((s) => s.pointa);
export default {
  delka,
  sceny,
  texty: [...cast1.texty, ...sceny2.flatMap((s) => s.texty)],
  glitche: [...cast1.glitche, ...glitche2],
  zablesky: cast1.zablesky,
  priprava,
  zvuk: {
    od: 0, do: 95.2, suby: [72, 350, F(36.74), F(57.66), pointa.f0], hudba: "the-game-hate-it-or-love-it-instrumental.wav", hudbaOd: 86, roztah: "tik",
    vlozky: sceny2.filter((s) => s.citace).map((s, n) => ({ t: VL[n][0], f: s.f0, n: Math.round(VL[n][1] * FPS), soubor: `assets/media/${s.citace.soubor}.wav` })),
    ztlum: [...sceny2.filter((s) => s.citace).map((s) => [s.f0, s.f1, -10]), [pointa.f0, pointa.f1, -9]],
  },
};
