// Ukázka komponent Lumitris v2: scény Heatona s popisky + nálepka a outro navíc
import heaton from "./heaton15.mjs";
const I = "assets/img/";
const p = structuredClone(heaton);
p.delka = 520;
p.takt = [...p.takt, [400, 460, 2], [460, 520, 1]];
p.sceny.push(
  { typ: "platno", svetle: true, f0: 400, f1: 460, tah: [1.0, 1.12, 0, 30, "dojezd"],
    karty: [
      { src: I + "produkt_3.jpg", x: 120, y: 180, w: 420, h: 236, f: 402, blur: 7 },
      { src: I + "nataci_1.jpg", x: 920, y: 620, w: 400, h: 225, f: 406, blur: 7, neg: 1 },
      { src: I + "george_st_nalepka.png", x: 520, y: 120, w: 400, h: 830, f: 410, cista: true, z: 5 },
    ] },
  { typ: "cerna", f0: 460, f1: 520 },
);
p.texty.push(
  { typ: "radek", y: 540, s: 104, f1: 460, barva: "tmava", slova: [["stejný styl", 414, 0], ["jiný", 420, 2]] },
  { typ: "outro", f: 464, f1: 520 },
);
p.bezVodoznaku = [[460, 521]];
p.popisky = [
  [0, 44, "<b>Studený úvod</b> nájezd 1,06 S křivkou, zmrazení, štítek grotesk + serif<small>obří slovo 2 snímky, svisle natažené 3x</small>"],
  [44, 72, "<b>Koláž karet ve 3D</b> bez rámečků, 3 hloubky rozostření, první snímky v negativu<small>kamera dojezd expo.out, takt 12 fps</small>"],
  [72, 113, "<b>Čítač a box výběru</b> kroky po 1 až 2 snímcích, box roste zleva po 2 snímcích<small>takt 24 fps, sub odhalení s vrcholem na střihu</small>"],
  [113, 148, "<b>Nájezd do střihu</b> 1,00 na 1,24 se zrychlením, karta naskočí v negativu<small>řádek slov ve slotech 18, 50 a 82 % šířky</small>"],
  [148, 188, "<b>Výřez na barvě</b> ČB tiskový rastr 6 px, červená s mřížkou, šedá kopie siluety<small>pan s dojezdem, obří slovo s inverzí</small>"],
  [188, 230, "<b>Série karet</b> nový obraz každé 3 snímky, karta roste<small>takt 8 fps, odchod řádku rozostřením</small>"],
  [230, 286, "<b>S křivka</b> 1,20 za 14 snímků, ČB záběr, červený box<small>glitch: negativ příštího záběru 2 snímky před střihem</small>"],
  [286, 301, "<b>A-roll: slova přes tvář</b> ČB, obří slovo přes obličej 1 snímek<small>takt 12 fps</small>"],
  [301, 350, "<b>A-roll: okno se skoky</b> šířka 46, 62, 77 % na slovech, bez animace<small>takt 24 fps, aby byla vidět ústa</small>"],
  [350, 400, "<b>Rohové závorky</b> rozšíření S křivkou za 22 snímků, karty v negativu<small>takt 12 fps</small>"],
  [400, 460, "<b>Nálepka</b> výřez postavy s hranatým obrysem jako stříhaný papír<small>světlé plátno, karty v hloubce rozostřené</small>"],
  [460, 520, "<b>Outro</b> znak 3x blikne po 1 snímku, zmenší se 1,19 na 1,00<small>bez vodoznaku</small>"],
];
export default p;
