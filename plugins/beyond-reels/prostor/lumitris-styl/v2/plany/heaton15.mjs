// Heaton v Lumitris stylu, prvních 16,7 s těla (po "které jinak nezíská"), 4:3 1440x1080, 24 fps
// Recept (POUZITO.md): případovka osoby, hook studený úvod se jménem, vypráví serif, glitch negativ + šedé desky,
// tmavé plátno, červený box, podpis čítač + výřez na barvě + závorky, A-roll A1 sloty přes tvář + A8 okno se skoky
const W = 1440, H = 1080;
const wf = (t) => Math.round(t * 24) + 2;   // slovo naskočí 2 snímky za hlasem (Lumitris medián +0,5 až +3,4)
const M = "assets/media/", I = "assets/img/";

export default {
  delka: 400,
  // takt celého kompozitu: [od, do, držení] 2 = 12 fps, 3 = 8 fps, 1 = 24 fps (UI, čítač, okno s ústy)
  takt: [[0, 72, 2], [72, 113, 1], [113, 203, 2], [203, 221, 3], [221, 301, 2], [301, 350, 1], [350, 400, 2]],
  sceny: [
    // S0 hook: George v rozhovoru v levé třetině, nájezd 1,06 S křivkou 28 snímků, pak zmrazení (klip je zmrazený od 28)
    { typ: "zaber", f0: 0, f1: 44, src: M + "george_rozhovor.mp4", grade: "tlum", tah: [1.0, 1.06, 0, 28, "s"] },
    // S1 Represent: koláž karet bez rámečků ve 3 hloubkách, kamera dojede 1,16 expo.out
    { typ: "platno", f0: 44, f1: 72, tah: [1.0, 1.09, 1, 27, "dojezd"], posun: [0, 0, -18, 8, 1, 27, "dojezd"],
      karty: [
        { src: I + "produkt_2.jpg", x: 150, y: 150, w: 420, h: 236, f: 46, neg: 2, blur: 6 },
        { src: I + "produkt_5.jpg", x: 880, y: 130, w: 430, h: 242, f: 49, blur: 6 },
        { src: I + "produkt_3.jpg", x: 900, y: 560, w: 420, h: 236, f: 52, neg: 1, blur: 2 },
        { src: I + "logo_represent_2.jpg", x: 130, y: 570, w: 440, h: 248, f: 55, blur: 2 },
        { src: I + "logo_represent_1.jpg", x: 380, y: 290, w: 680, h: 382, f: wf(2.52), neg: 2, z: 5 },
      ] },
    // S2 čítač 3 miliardy na plátně, 24 fps, červený box výběru
    { typ: "platno", f0: 72, f1: 113 },
    // S3 LA, nájezd do střihu t^2,5, karta penthouse naskočí v negativu
    { typ: "zaber", f0: 113, f1: 148, src: M + "la.mp4", grade: "tlum", tah: [1.0, 1.24, 0, 35, "najezd"],
      karty: [{ src: I + "penthouse.jpg", x: 460, y: 620, w: 520, h: 293, f: wf(5.70), neg: 2, grade: "barva" }] },
    // S4 Rolls Royce: barevný výřez s tiskovým rastrem na světle šedém studiu s mřížkou (Štěpán: nepřebarvovat, print nechat, bez červeného pozadí), pan ease out k 3, šedá kopie siluety
    { typ: "vyrez", f0: 148, f1: 188, pozadi: "svetla",
      vyrez: { src: I + "rolls_tisk.png", stinSrc: I + "rolls_stin.png", x: 170, y: 230, w: 1180, pan: [-240, 0, 2, 16], stin: [28, 16], pruh: false } },
    // S5 14 let: série portrétů, nový obraz každé 3 snímky (8 fps), karta roste 470 na 900
    { typ: "platno", f0: 188, f1: 230,
      serie: { obrazy: [I + "portret_george_4.jpg", I + "portret_george_1.jpg", I + "nataci_3.jpg", I + "nataci_4.jpg", I + "nataci_2.jpg", I + "portret_george_3.jpg", I + "portret_george_4.jpg"],
        f: 203, krok: 3, h0: 470, h1: 900, cx: 720, cy: 540, pomer: 0.8 } },
    // S6 obsah jako priorita: studio ČB, S křivka 1,20 za 14 snímků
    { typ: "zaber", f0: 230, f1: 286, src: M + "studio.mp4", grade: "cb", tah: [1.0, 1.2, 18, 32, "s"] },
    // S7 A-roll A1: Tim v původních barvách (naše záběry se nepřebarvují), slova kolem hlavy, obří PROČ přes obličej 1 snímek
    { typ: "zaber", f0: 286, f1: 301, src: M + "tim_proc.mp4", grade: "puvodni", bezGrade: true },
    // S8 A-roll A8: Tim v okně na plátně, okno roste skokem 46, 62, 77 % šířky na slovech
    { typ: "platno", f0: 301, f1: 350, bezGrade: true,
      okna: [{ src: M + "tim_okno.mp4", grade: "puvodni", cx: 720, cy: 470, w: 662, h: 497, skoky: [[301, 662], [wf(13.40), 893], [wf(14.20), 1109]] }] },
    // S9 3 věci: rohové závorky se rozšíří S křivkou z jedné karty na tři
    { typ: "platno", f0: 350, f1: 400,
      zavorky: { f: 351, cx: 720, cy: 470, h: 430, w0: 380, rust: [[wf(14.88), 22, 380, 1130]] },
      karty: [
        { src: I + "nataci_1.jpg", x: 570, y: 275, w: 300, h: 390, f: wf(14.66), neg: 1 },
        { src: I + "nataci_2.jpg", x: 240, y: 275, w: 300, h: 390, f: wf(14.88) + 6, neg: 1 },
        { src: I + "nataci_4.jpg", x: 900, y: 275, w: 300, h: 390, f: wf(14.88) + 10, neg: 1 },
      ] },
  ],
  texty: [
    // S0 štítek jména a grotesk blok vpravo (DdsC K1), obří BOMBY na 2 snímky
    { typ: "stitek", x: 760, y: 700, s: 72, f1: 44, casti: [["George", "sans", wf(0.24)], ["Heaton", "serif", wf(0.58)]] },
    { typ: "blok", x: 760, y: 250, f1: 44, radky: [["jede", wf(1.14), 58, "sans", "seda"], ["bomby", wf(1.44) + 2, 170, "sans tucne"]] },
    { typ: "obri", text: "BOMBY", f: wf(1.44), n: 2, s: 330, sy: 3.1 },
    // S1 řádek pod koláží
    { typ: "radek", y: 935, s: 77, styl: "sans tucne", f1: 72, slova: [["Jeho", wf(1.88), 0], ["značka", wf(2.14), 1], ["Represent", wf(2.52), 2]] },
    // S2 čítač do 3, obří 3 na 2 snímky, miliardy, box korun ročně
    { typ: "citac", x: 720, y: 420, s: 360, f1: 113, kroky: [[74, "0"], [75, "0,5"], [77, "1,1"], [78, "1,6"], [79, "2,2"], [80, "2,7"], [wf(3.28), "3"]] },
    { typ: "obri", text: "3", f: wf(3.28), n: 2, s: 640, sy: 1.7, styl: "serif" },
    { typ: "radek", y: 745, s: 92, styl: "sans tucne", f1: 113, stredy: [0.5], slova: [["miliardy", wf(3.62), 0]] },
    { typ: "box", text: "korun ročně", x: 455, y: 830, s: 88, f: wf(4.10), f1: 113 },
    // S3 LA
    { typ: "radek", y: 470, s: 83, styl: "sans tucne", f1: 148, slova: [["v LA", wf(4.76), 0], ["vlastní", wf(5.28), 1], ["penthouse", wf(5.70), 2]] },
    // S4 Rolls Royce štítek, řádek nahoře, obří CASH s inverzí
    { typ: "stitek", x: 110, y: 905, s: 72, f1: 188, casti: [["Rolls", "sans", wf(6.28)], ["Royce", "serif", wf(6.60)]] },
    { typ: "radek", y: 135, s: 77, styl: "sans tucne", barva: "tmava", f1: 188, slova: [["si kupuje", wf(6.90), 0], ["v cashi", wf(7.36), 2]] },
    { typ: "obri", text: "CASH", f: wf(7.36), n: 2, s: 400, sy: 2.8, vypln: "inverze" },
    // S5 14 let přes sérii
    { typ: "radek", y: 540, s: 108, f1: 230, odchod: "rozostreni", slova: [["A přesto", wf(7.86), 0], ["po 14", wf(8.64), 1], ["letech", wf(9.20), 2]] },
    // S6 dva řádky nad stolem, priorita v červeném boxu
    { typ: "radek", y: 300, s: 80, styl: "sans tucne", f1: wf(10.72), odchod: "rozostreni", slova: [["George", wf(9.64), 0], ["tajně", wf(10.02), 1], ["udělal", wf(10.40), 2]] },
    { typ: "radek", y: 300, s: 80, styl: "sans tucne", f1: 286, slova: [["z obsahu", wf(10.72), 0], ["svou", wf(11.14), 1]] },
    { typ: "box", text: "prioritu", x: 935, y: 248, s: 100, f: wf(11.36), f1: 286 },
    // S7 Ale proč přes tvář
    { typ: "radek", y: 470, s: 104, styl: "sans tucne", f1: 301, slova: [["Ale", wf(11.96), 0], ["proč?", wf(12.14) + 1, 1]] },
    { typ: "obri", text: "PROČ", f: wf(12.14), n: 1, s: 360, sy: 3.4, vypln: "inverze" },
    // S8 řádky pod oknem
    { typ: "radek", y: 975, s: 74, styl: "sans tucne", f1: wf(13.40), slova: [["Protože", wf(12.60), 0], ["ví,", wf(13.04), 1], ["že", wf(13.26), 2]] },
    { typ: "radek", y: 975, s: 74, styl: "sans tucne", f1: 350, slova: [["osobní", wf(13.40), 0], ["značka", wf(13.76), 1], ["odemyká", wf(14.20), 2]] },
    // S9 3 věci
    { typ: "radek", y: 150, s: 83, styl: "sans tucne", f1: 400, stredy: [0.5], slova: [["3 věci", wf(14.66), 0]] },
    { typ: "radek", y: 840, s: 80, styl: "sans tucne", f1: 400, slova: [["které", wf(15.54), 0], ["jinak", wf(15.76), 1], ["nezíská", wf(15.98), 2]] },
  ],
  // glitch: obdélník s negativem příštího záběru nebo šedé desky, start 2 až 3 snímky před střihem
  // blok [x, y, w, h, druh, posun startu, délka, obrázek]
  glitche: [
    { f: 41, n: 3, druh: "neg", img: I + "logo_represent_1.jpg", bloky: [[160, 110, 560, 330], [820, 640, 440, 250, "seda1", 1, 2]] },
    { f: 69, n: 3, bloky: [[0, 690, 1440, 150, "seda2"], [300, 180, 400, 280, "seda1", 1, 2]] },
    { f: 110, n: 3, druh: "neg", img: I + "la_0.jpg", bloky: [[0, 0, 1440, 380], [620, 640, 700, 300, "neg", 1, 2]] },
    { f: 145, n: 3, bloky: [[0, 330, 1440, 270, "seda1"], [120, 700, 520, 210, "seda2", 1, 2]] },
    { f: 185, n: 3, druh: "neg", img: I + "portret_george_1.jpg", bloky: [[0, 200, 900, 500], [1000, 620, 440, 300, "neg", 1, 2]] },
    { f: 227, n: 3, druh: "neg", img: I + "studio_0.jpg", bloky: [[0, 0, 700, 1080], [900, 300, 540, 400, "neg", 1, 2]] },
    { f: 283, n: 3, druh: "neg", img: I + "tim_proc_0.jpg", bloky: [[300, 0, 840, 500], [0, 700, 600, 380, "neg", 1, 2]] },
    { f: 298, n: 3, bloky: [[0, 0, 1440, 230, "seda1"], [0, 850, 1440, 230, "seda2", 1, 2]] },
    { f: 347, n: 3, druh: "neg", img: I + "nataci_1.jpg", bloky: [[0, 300, 1440, 420], [200, 20, 520, 250, "neg", 1, 2]] },
  ],
  zablesky: [[72, 1, 0.8]],
  // zvuk (nastroje/zvuk.py): sub odhalení s vrcholem na střihu, praskání u glitchů
  zvuk: { hlas: "hlas", od: 0, do: 16.6, suby: [72, 350], boom: [], hudba: "the-game-hate-it-or-love-it-instrumental.wav", hudbaOd: 86, roztah: "tik" },
};
