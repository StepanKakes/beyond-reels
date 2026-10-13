# Generátor Nathan videa: scénář (klauze + obraz) -> návrh plánu (plany/<nazev>_navrh.json)
# python3 nastroje/generator.py scenare/heaton.json [--seed 7]
#
# Scénář určí obraz každé klauze: "th" (Tim do kamery), seznam záběrů, nebo nic (typografická karta).
# Generátor dodá styl podle rozboru (SHOTLOG R1 až R29, VARIANTY.md): střih na první slovo klauze, jedno velké slovo
# přes šířku s exponenciálním dojezdem, malá slova zigzag kolem něj, bliknutí, bloky, karaoke, výměna slov, schody se
# skriptem, kondenzované nadpisy, škrtnutí negace, počítadlo, řada let, snap zoom, záblesky, letterbox na startu.
# Všechny volby jdou přes RNG se semínkem a přes rozpočty, osy stylu se losují jednou za video (PROFIL).
import json, math, os, random, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pismo import inkoust, na_sirku
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../lumitris-styl/nastroje'))   # sdílená banka záběrů (prostor/lumitris-styl/nastroje/banka.py)
from banka import Banka

KOREN = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FPS, W, H = 30, 1920, 1080
f_ = lambda t: int(round(t * FPS))
STOP = set("a i v ve s se z ze k ke na o u do po od za je to ten ta že by si mu ho jak jako ale tak už jen jenom tím který která které kterým ke má mít".split())
NEGACE = re.compile(r"^(ne\w*|žádn\w*|nikdy|nic)$", re.I)


def cisty(w):
    return re.sub(r"[.;:]+$", "", w)


def nacti(cesta):
    return json.load(open(cesta if os.path.isabs(cesta) else os.path.join(KOREN, cesta)))


class Video:
    def __init__(self, sc, seed):
        self.sc, self.r = sc, random.Random(seed)
        r = self.r
        self.P = dict(
            male=r.choice([52, 54, 56, 58]),                       # malé slovo 56 px (5,2 % výšky)
            sloupec=r.choice([700, 740, 760]),                     # cílová šířka velkého slova na talking head
            th_x=r.randint(1440, 1520),                            # střed sloupce vedle Tima
            tau=(r.choice([5, 6, 7]), r.choice([9, 10, 12])),      # rozsah časové konstanty dojezdu
            # Štěpán 12. 10. (v2): "furt se něco mění, bliká, zoomuje, nepřehledné" -> klidnější verze stylu:
            # bliknutí jen pár za video, bez bloků, delší záběry, skoro bez snap zoomů, B-rolly i v oknech na naší ploše
            blink=r.uniform(0.25, 0.4),                            # podíl z kandidátů (jen slova držená 30+ snímků, rozestup 10 s)
            bloky=0.0,
            okno=r.uniform(0.35, 0.5),                             # podíl B-roll klauzí v okně (16:9 nebo čtverec) na ploše
            karaoke=r.uniform(0.08, 0.2),
            swap=0.0,
            kond=r.uniform(0.06, 0.15),
            snap=r.uniform(0.06, 0.1),                             # podíl záběrů se snap zoomem (jemný, dlouhý dojezd)
            zablesk=r.uniform(0.04, 0.07),                         # záblesk na střihu se změnou typu, nejvýš 2
            karta_prvni=r.choice(["svetla", "tmava"]),          # bez červeného přechodu (Štěpán 12. 10.), tmavá #111
            letterbox=r.random() < 0.6,
        )
        self.texty, self.zabery, self.zvuky, self.zablesky, self.koncepty = [], [], [], [], []
        self.posl_blink = self.posl_blok = -999
        self.posl_okno, self.strana_klauze, self.karta_akt = False, None, None

    def mapuj_cas(self):
        cit = sorted(self.sc.get("citace", []), key=lambda c: c["t"])
        self.cit = cit
        self.K = lambda b: b + sum(c["do"] - c["od"] for c in cit if b >= c["t"] - 1e-6)
        S = [dict(w) for w in nacti(self.sc["slova"])["slova"]]
        # nástupy slov ze zvuku (nastroje/nastupy.py), přepis je u pětiny slov o 80 až 145 ms pozdě
        cn = os.path.join(KOREN, f"plany/{self.sc['nazev']}_nastupy.json")
        if os.path.exists(cn):
            for w, t in zip(S, json.load(open(cn))):
                w["t"] = min(t, w["e"] - 0.04)
        self.slova = [dict(w=w["w"], t=self.K(w["t"]), e=max(self.K(w["e"]), self.K(w["t"]) + 0.08), b=w["t"]) for w in S]
        self.konec_reci = self.K(S[-1]["e"])

    # ---------- texty ----------
    def sirka_male(self, txt):
        return inkoust(txt, "male", self.P["male"])[4]

    def rada(self, idx, f1, x, y, zarovnani="stred", barva=None, karaoke=False, padani=False):
        # slovo naskočí 1 snímek před tím, než je slyšet (SHOTLOG 1.4), bez náhodného rozptylu
        sl = [dict(text=cisty(self.slova[i]["w"]), f=f_(self.slova[i]["t"]) - 1) for i in idx if cisty(self.slova[i]["w"])]
        if not sl:
            return None
        if karaoke:
            for w in sl[1:]:
                pass
        # celý řádek musí zůstat v obraze s okrajem 80 px (karaoke u Tima vpravo přetékalo)
        sirka = sum(self.sirka_male(w["text"]) for w in sl) + self.sirka_male(" ") * (len(sl) - 1)
        lo, hi = 80, W - 80
        if zarovnani == "stred":
            x = min(max(x, lo + sirka / 2), hi - sirka / 2)
        elif zarovnani == "vpravo":
            x = min(max(x, lo + sirka), hi)
        else:
            x = min(max(x, lo), hi - sirka)
        t = dict(typ="rada", slova=sl, f1=f1, x=round(x), y=round(y), s=self.P["male"], zarovnani=zarovnani, karaoke=karaoke, padani=padani)
        if karaoke:
            t["slova"][0]["f"] = sl[0]["f"]
        if barva:
            t["barva"] = barva
        self.texty.append(t)
        return t

    def velke(self, i, f1, cx, cy, sirka, druh="hn", barva=None, text=None, skrt=False, smer=None):
        """velké slovo fit to width, vjezd s exponenciálním doběhem; vrací inkoust v souřadnicích obrazu"""
        r, P = self.r, self.P
        txt = text or cisty(self.slova[i]["w"])
        s = na_sirku(txt, sirka, druh, 110 if druh != "kond" else 120, 270 if druh == "hn" else 330)
        ink = inkoust(txt, druh, s)
        x = cx - (ink[0] + ink[2]) / 2
        y = cy - (ink[1] + ink[3]) / 2
        f = f_(self.slova[i]["t"]) - 1
        # směr jako v originálu: 22 z 25 zespodu, 2 shora, 1 zprava (SHOTLOG 1.5)
        smer = smer or r.choices(["dol", "nahoru", "vpravo"], [0.86, 0.09, 0.05])[0]
        # D roste s dobou držení (POHYB.md B.1): do 20 snímků 104 až 157 px, od 35 snímků 173 až 234 px
        drz = f1 - f
        k = min(1, max(0, (drz - 20) / 15))
        # klidnější dojezd: kratší dráha a slovo do 20 snímků stojí (Štěpán: "pomalu tam ani není a hned zmizí")
        D = round(r.uniform(60, 90) * (1 - k) + r.uniform(90, 120) * k)
        # tau 0,3 x držení, ale nejvýš 12 snímků jako "ad costs" (58 snímků držení): u slov držených 2 až 4 s
        # se jinak slovo plazilo celou dobu (kritika 12. 10.), v originálu je po 36 až 40 snímcích dojeté pod 5 px
        t = dict(typ="velke", text=txt, f=f, f1=f1, x=round(x), y=round(y), s=round(s, 1), font=druh, smer=smer, D=D,
                 tau=round(r.uniform(4.5, 6), 1))
        if barva:
            t["barva"] = barva
        # bliknutí jen u slova, které po něm ještě chvíli stojí, a ne dvě hned po sobě (kritika: někdy moc bliká)
        if drz >= 30 and f - self.posl_blink >= 300 and r.random() < P["blink"]:
            t["blink"] = r.randint(1, min(6, drz - 12))
            self.posl_blink = f
        if r.random() < 0.08:
            t["blur"] = True
        if skrt:
            # červená čára 8 px přes spodní půlku x výšky, přesah 30 px na každé straně (R25)
            t["skrt"] = [round(ink[0] - 30), round(ink[3] - (ink[3] - ink[1]) * 0.42), round(ink[2] - ink[0] + 60)]
        self.texty.append(t)
        return t, (x + ink[0], y + ink[1], x + ink[2], y + ink[3])

    def klauze_text(self, idx, f_konec, typ, strana=None, barva=None):
        """jedno velké slovo na klauzi, malá slova zigzag: před ním nad a vlevo, za ním pod a vpravo (R4, R5, 4.1)"""
        r, P = self.r, self.P
        obs = [i for i in idx if cisty(self.slova[i]["w"]).lower().strip(",") not in STOP]
        cisla = [i for i in idx if re.search(r"\d", self.slova[i]["w"])]
        duraz = self.fr.get("duraz")
        if duraz is not None:
            v = idx[0] + duraz
        elif cisla:
            v = cisla[-1]
        elif obs:
            # klíčové slovo je poslední důležité slovo klauze (přízvuk), u dlouhých klauzí nejdelší
            v = obs[-1] if r.random() < 0.6 else max(obs, key=lambda i: len(self.slova[i]["w"]))
        else:
            v = idx[-1]
        # velké slovo musí stát aspoň 12 snímků ("vím," vydrželo 3 snímky a jen probliklo)
        if f_konec - f_(self.slova[v]["t"]) < 24:
            drzi = [i for i in (obs or idx) if f_konec - f_(self.slova[i]["t"]) >= 24]
            if drzi:
                v = drzi[-1]
        # druhé slovo do velkého, když je velké slovo krátké a číslo nebo přídavné jméno s podstatným (3 miliardy)
        dvoj = cisla and v + 1 in idx and v == cisla[-1]
        pred = [i for i in idx if i < v]
        po = [i for i in idx if i > v + (1 if dvoj else 0)]
        if typ == "th":
            cx, sirka = P["th_x"], P["sloupec"] + r.randint(-40, 40)
        elif typ == "karta":
            cx, sirka = 960 + r.randint(-60, 60), r.randint(620, 980)
        elif self.strana_klauze and strana:
            # vedle okna s B-rollem: užší sloupec ve volné části plochy
            cx, sirka = (r.randint(400, 440) if strana == "vlevo" else r.randint(1480, 1520)), r.randint(380, 560)
        else:
            cx = {"vlevo": r.randint(480, 640), "vpravo": r.randint(1280, 1440), None: 960}[strana]
            sirka = r.randint(480, 760) if strana else r.randint(620, 900)
        cy = 543 + r.randint(-70, 50)
        if f_konec - f_(self.slova[v]["t"]) < 20:
            # krátká klauze: žádné velké slovo, které by jen problesklo, jen malý řádek
            x = cx if typ != "th" else P["th_x"]
            return self.rada(idx, f_konec, x, 520, barva=barva)
        txt = " ".join(cisty(self.slova[i]["w"]) for i in ([v, v + 1] if dvoj else [v]))
        neg = bool(self.fr.get("skrt")) and not dvoj   # škrtnutí jen u odmítnutí, které scénář označí (paid courses, bullshit)
        f_v = f_(self.slova[v]["t"])
        hold_konec = f_konec
        # nad slovem stojí řádek: slovo přijede zespodu, ať jím neprojede
        t, ink = self.velke(v, hold_konec, cx, cy, sirka, barva=barva or ("akcent" if typ == "karta" and self.karta_akt == "tmava" else None),
                            text=txt, skrt=neg and r.random() < 0.8, smer="dol" if pred else None)
        sm = P["male"]
        if pred:
            # malý řádek nad velkým slovem, zarovnaný na jeho levý okraj; někdy se před nástupem změní v bloky
            # řádek nad velkým slovem zůstává až do konce klauze, text se skládá do jednoho shluku jako u Nathana
            # (Štěpán 12. 10.: "jemu to přijíždí k sobě a tvoří vícero titulek u sebe, mnohem blíž")
            y_pred = ink[1] - 16 - sm * 0.86
            rr = self.rada(pred, f_konec, ink[0], y_pred, "vlevo", barva)
            if rr and r.random() < P["bloky"] and f_v - rr["slova"][0]["f"] > 6 and "blink" not in t and f_v - self.posl_blok > 90:
                self.posl_blok = f_v
                rr["f1"] = t["f"] - 3
                bl, x = [], ink[0]
                for w in rr["slova"]:
                    sw = self.sirka_male(w["text"])
                    bl.append([round(x), round(y_pred + sm * 0.04), round(sw - 1), round(sm * 1.07)])
                    x += sw + self.sirka_male(" ")
                t["bloky"] = bl
        if po:
            # velké slovo v té chvíli ještě dojíždí (nikdy nedosedne), řádek pod ním musí být pod jeho okamžitou polohou
            f_po = f_(self.slova[po[0]]["t"])
            drz = max(4, t["f1"] - t["f"])
            zbytek = t["D"] * math.exp(-max(0, f_po - t["f"]) / t["tau"]) if t.get("smer", "dol") == "dol" else 0
            self.rada(po, f_konec, ink[2], ink[3] + 16 + zbytek, "vpravo", barva)
        return t

    def diagram_klauze(self, n, dg, idx, f0, f1):
        """vlastní koncept: diagram osobní značky se třemi větvemi, které se plní při návratech (Zaprvé, Zadruhé, Zatřetí)"""
        if not self.koncepty or self.koncepty[0]["typ"] != "diagram":
            k = dict(typ="diagram", useky=[], plneni=[None] * len(dg["vetve"]),
                     stred=dict(x=960, y=150, **dg["stred"]),
                     vetve=[dict(x=x, y=600, **v) for x, v in zip([480, 960, 1440], dg["vetve"])])
            self.koncepty.insert(0, k)
        k = self.koncepty[0]
        self.zaber("karta", None, f0, f1, karta="svetla")
        k["useky"].append([f0, f1])
        najdi = lambda txt: next((i for i in idx if cisty(self.slova[i]["w"]).strip(",").lower().startswith(txt)), idx[-1])
        if n == dg["fraze"]:
            k["kresli"] = f_(self.slova[najdi(dg.get("kresli_slovo", "odemyk"))]["t"])
            # střed diagramu naskočí se slovy o něm (osobní značka), slova před ním malým řádkem dole, ať karta není prázdná
            ist = najdi(dg["stred"]["popisek"].split()[0][:5].lower())
            k["stred_f"] = min(k["kresli"] - 3, f_(self.slova[ist]["t"]) - 1)
            if ist > idx[0]:
                self.rada([i for i in idx if i < ist], k["stred_f"], 960, 900, barva="akcent")
        else:
            j = dg["vetve_fraze"].index(n)
            fz = f_(self.slova[najdi(dg["vetve"][j]["popisek"][:5].lower())]["t"]) - 1
            k["plneni"][j] = fz
            # pořadové slovo (Zaprvé) jako malý řádek nahoře vlevo od středu
            self.rada([i for i in idx if cisty(self.slova[i]["w"]).strip(",").lower() != dg["vetve"][j]["popisek"]][:2], f1, 960, 980, barva="akcent")

    # ---------- pohyb talking head a zvuk (POHYB.md A.3, D) ----------
    def sedi_klauze(self, ko, idx, f0, f1):
        """AI fotka sedícího člověka na světlé kartě (R19, Nathan #16 "I was one of those people"): velké červené slovo
        verzálkami za hlavou (inkoust 6 až 30 % výšky postavy, hlava zakryje písmeno), malá slova před ním nad, za ním pod"""
        r, sm = self.r, self.P["male"]
        self.zaber("karta", None, f0, f1, karta="svetla")
        iv = idx[0] + ko["slovo"]
        txt = cisty(self.slova[iv]["w"]).strip(",").upper()
        s = na_sirku(txt, ko.get("sirka", 1000), "hn", 110, 220)
        ink = inkoust(txt, "hn", s)
        mh = ko.get("vyska", 560)
        mw, my = mh * ko["pomer"], ko.get("y", 250)
        x = 960 - (ink[0] + ink[2]) / 2
        # střed inkoustu ve výšce hlavy: hlava zakryje kus jednoho písmene, ramena by zakryla dvě (kontrola 12. 10.)
        y = my + mh * ko.get("vyska_slova", 0.09) - (ink[1] + ink[3]) / 2
        slova = lambda ii: [dict(text=cisty(self.slova[i]["w"]), f=f_(self.slova[i]["t"]) - 1) for i in ii if cisty(self.slova[i]["w"])]
        self.koncepty.append(dict(typ="sedi", f0=f0, f1=f1, img=ko["img"], obr=[round(960 - mw / 2), my, round(mw), mh],
                                  slovo=dict(text=txt, f=f_(self.slova[iv]["t"]) - 1, x=round(x), y=round(y), s=round(s, 1)),
                                  nad=dict(slova=slova([i for i in idx if i < iv]), x=round(x + ink[0]), y=round(y + ink[1] - 30 - sm * 0.86), s=sm, zarovnani="vlevo"),
                                  pod=dict(slova=slova([i for i in idx if i > iv]), x=960, y=my + mh + 40, s=sm, zarovnani="stred"),
                                  zoom=[round(r.uniform(1.24, 1.34), 3), 1.0, r.randint(50, 62)]))

    def th_pohyb(self):
        """TH: lineární drift 0,038 až 0,068 % za snímek; na velkých slovech punch 4 až 5 % snímek po nástupu slova,
        dojezd tau 0,3 x držení, další velké slovo ho vrací; segmenty jdou do priprav jako zoomy"""
        r = self.r
        velka = sorted((t["f"], t["f1"]) for t in self.texty if t["typ"] == "velke")
        for z in [z for z in self.zabery if z["typ"] == "th"]:
            d = z.pop("drift", 0.0005)
            body = [(f, f1) for f, f1 in velka if z["f0"] + 6 <= f < z["f1"] - 6]
            body = []   # bez punch zoomů na Timovi, jen pomalý drift (klidnější verze)
            seg, sk, f = [], 1.0, z["f0"]
            smer = 1 if d < 0 else -1      # punch jde proti driftu
            for k, (fv, fv1) in enumerate(body):
                if fv + 1 > f:
                    b = sk * (1 + d * (fv + 1 - f))
                    seg.append([f, fv + 1, round(sk, 4), round(b, 4), "none"]); sk, f = b, fv + 1
                drz = max(6, fv1 - fv)
                cil = sk * (1 + smer * r.uniform(0.04, 0.05))
                konec = min(z["f1"] + 1, body[k + 1][0] + 1 if k + 1 < len(body) else z["f1"] + 1)
                seg.append([f, konec, round(sk, 4), round(cil, 4), f"exp:{0.3 * drz:.1f}"])
                sk, f, smer = cil, konec, -smer
            if f < z["f1"] + 1:
                seg.append([f, z["f1"] + 1, round(sk, 4), round(max(0.9, sk * (1 + d * (z["f1"] + 1 - f))), 4), "none"])
            # měřítko pod 1 by ukázalo okraje: celé segmenty vydělit minimem (drift ven = začít přiblížený)
            mn = min(min(s_[2], s_[3]) for s_ in seg)
            if mn < 1:
                for s_ in seg:
                    s_[2], s_[3] = round(s_[2] / mn, 4), round(s_[3] / mn, 4)
            z["zoomy"] = seg

    def zvuk_plan(self, delka):
        """žádný zvuk na textu; 3 až 5 sub dopadů na velké momenty (střih se snap zoomem nebo velkým slovem),
        vzdušný švih do jednoho záblesku, 2 vypnutí hudby na důrazné větě a sub návrat na dalším střihu"""
        r = self.r
        self.zvuky = []
        stri = sorted(z["f0"] for z in self.zabery if z["f0"] > 2)
        snapy = [z["f0"] for z in self.zabery if z.get("zoom") and z["zoom"][2] in ("circ.out", "expo.out")]
        velka = {t["f"] for t in self.texty if t["typ"] == "velke"}
        kand = [c for c in stri if c in snapy or any(0 <= v - c <= 2 for v in velka)]
        r.shuffle(kand)
        suby = sorted(set([stri[0]] + kand[:r.randint(2, 4)]))
        for c in suby:
            self.zvuky.append(dict(t=(c + r.choice([1, 2, 3])) / FPS, jm="boom", rel=r.uniform(-1, 3), od=0.0, delka=0.6, pitch=-7, lp=150, fadeout=0.15, pasmo_hlasu=True))
        if self.zablesky:
            fz = r.choice(self.zablesky)
            fz = fz[0] if isinstance(fz, list) else fz
            self.zvuky.append(dict(t=(fz - 4) / FPS, jm="svih_vitr", rel=-29, hp=2500, delka=0.55, fadeout=0.2))
        # vypnutí hudby: 0,9 až 2,2 s od nástupu důrazné klauze (karta nebo velké slovo), návrat sub dopadem na dalším střihu
        self.ticho = []
        moznosti = [c for c in stri if 150 < c < delka - 200 and any(0 <= v - c <= 3 for v in velka)]
        r.shuffle(moznosti)
        for c in sorted(moznosti[:2]):
            t0 = (c + 7) / FPS
            dalsi = [x for x in stri if x > c + 27]
            t1 = min(t0 + r.uniform(0.9, 2.2), (dalsi[0] / FPS) if dalsi else t0 + 2)
            self.ticho.append([round(t0, 3), round(t1, 3)])
            self.zvuky.append(dict(t=t1, jm="boom", rel=-6, od=0.0, delka=1.3, pitch=-5, lp=150, fadein=0.9, fadeout=0.3, pasmo_hlasu=True))

    # ---------- obraz ----------
    def rozres_obraz(self):
        """dotazy na obraz -> skutečné úseky videa z katalogu (sdílená banka s Lumitris), každý úsek zdroje jen jednou"""
        zd = self.sc.get('zdroje', {})
        b = Banka(random.Random(self.r.random()), katalog=zd.get('zabery'), klip=zd.get('klip'))   # cesty ke klipům ze scénáře
        for c in self.cit:
            if c.get("zdroj"):
                klip, _, ab = c["zdroj"].partition("@")
                a, _, bb = ab.partition("-")
                b.zaber(klip, float(a), float(bb))
        zab = sorted([z for z in self.zabery if z["typ"] == "broll" and not z.get("citace")], key=lambda z: z["f0"])
        for z in zab:
            dotaz = z["ref"] if not z["ref"].startswith("img:") else "hledej:george_face"
            z["ref"], _ = b.vezmi(dotaz, (z["f1"] - z["f0"] + 1) / FPS + 0.1)
            z["opak"] = 0
        print("banka:", b.zprava(), file=sys.stderr)

    def odvraty(self, f0, f1, i0):
        """snímky klauze, kdy Tim nekouká do kamery (pohled.json je v čase hlasu bez citací), jako úseky k překrytí;
        None, když nekouká víc než polovinu klauze"""
        pohled = self.sc.get("pohled", [])
        off = self.K(self.slova[i0]["b"]) - self.slova[i0]["b"]
        kouka = lambda f: any(a <= f / FPS - off <= b and v for a, b, v in pohled)
        useky, zac = [], None
        for f in range(f0, f1 + 2):
            ne = f <= f1 and not kouka(f)
            if ne and zac is None:
                zac = f
            elif not ne and zac is not None:
                useky.append([max(f0, zac - 2), min(f1, f + 1)]); zac = None
        sloz = []
        for a, b in useky:
            if sloz and a - sloz[-1][1] < 12:
                sloz[-1][1] = b
            else:
                sloz.append([a, b])
        for u in sloz:
            if u[0] - f0 < 10:
                u[0] = f0
            if f1 - u[1] < 10:
                u[1] = f1
            if u[1] - u[0] < 11:         # překrytí kratší než 12 snímků by bliklo, protáhnout (u konce klauze dozadu)
                u[1] = min(f1, u[0] + 11)
                u[0] = max(f0, u[1] - 11)
        if sum(b - a + 1 for a, b in sloz) > 0.5 * (f1 - f0 + 1):
            return None
        return [(a, b) for a, b in sloz]

    def zaber(self, typ, ref, f0, f1, opak=0, karta=None):
        z = dict(typ=typ, ref=ref, f0=f0, f1=f1, opak=opak)
        if karta:
            z["plocha"] = karta
        self.zabery.append(z)
        return z

    def sluc_klauze(self):
        """krátké klauze (pod 1 s) spojit s další, ať text jen neproblikne (Štěpán 12. 10.: "objeví se a hned zmizí");
        jen se stejným druhem obrazu a bez zvláštních technik, indexy diagramu, komentáře a citací se přečíslují"""
        F, S = self.sc["fraze"], self.slova
        dg, km = self.sc.get("diagram"), self.sc.get("komentar")
        chranene = set()
        if dg:
            chranene |= {dg["fraze"], *dg["vetve_fraze"]}
        if km:
            chranene.add(km["fraze"])
        pred = {c.get("pred") for c in self.cit}
        zac, i = [], 0
        for f in F:
            zac.append(i); i += len(f["text"].split())
        zac.append(len(S))
        zvl = ("sedi", "roky", "pocitadlo", "skrt")
        druh = lambda f: "th" if f.get("obraz") == "th" else ("br" if isinstance(f.get("obraz"), list) else "karta")
        nove, mapa, n = [], {}, 0
        while n < len(F):
            f = dict(F[n]); mapa[n] = len(nove)
            while n + 1 < len(F):
                t1 = S[zac[n + 1]]["t"] if zac[n + 1] < len(S) else 1e9
                kratka = t1 - S[zac[n] if f is F[n] else zac[n]]["t"] < 1.3 or (S[zac[n + 2]]["t"] if zac[n + 2] < len(S) else 1e9) - t1 < 1.3
                g = F[n + 1]
                if not (kratka and druh(f) == druh(g) and n not in chranene and n + 1 not in chranene and n + 1 not in pred
                        and not any(k in f or k in g for k in zvl) and len((f["text"] + " " + g["text"]).split()) <= 9):
                    break
                if g.get("duraz") is not None:
                    f["duraz"] = len(f["text"].split()) + g["duraz"]
                f["text"] = f["text"] + " " + g["text"]
                if isinstance(f.get("obraz"), list):
                    f["obraz"] = f["obraz"] + g["obraz"]
                if g.get("kryt"):
                    f["kryt"] = (f.get("kryt") or []) + g["kryt"]
                n += 1; mapa[n] = len(nove)
            nove.append(f); n += 1
        if dg:
            dg["fraze"], dg["vetve_fraze"] = mapa[dg["fraze"]], [mapa[x] for x in dg["vetve_fraze"]]
        if km:
            km["fraze"] = mapa[km["fraze"]]
        for c in self.cit:
            if c.get("pred") is not None:
                c["pred"] = mapa[c["pred"]]
        print("klauze:", len(F), "->", len(nove), file=sys.stderr)
        self.sc["fraze"] = nove

    def postav(self):
        self.mapuj_cas()
        self.sluc_klauze()
        r, P = self.r, self.P
        pohled = self.sc.get("pohled", [])
        kouka = lambda b0, b1: any(a <= b0 + 0.05 and b1 - 0.05 <= b and v for a, b, v in pohled)
        karta = P["karta_prvni"]
        hledej, typ_posl = 0, None
        rozp = dict(kond=2, swap=2, karaoke=2, schody=2, pocitadlo=1, roky=1)
        for n, fr in enumerate(self.sc["fraze"]):
            self.fr = fr
            self.strana_klauze = None
            i0 = hledej
            i1 = i0 + len(fr["text"].split()) - 1
            hledej = i1 + 1
            t0 = self.slova[i0]["t"] if n else 0.0
            t1 = self.slova[hledej]["t"] if hledej < len(self.slova) else self.konec_reci + 0.25
            # klauze před citací končí, kde citace začíná (jinak její slovo leželo přes klip citace)
            for c in self.cit:
                if c.get("pred") == n + 1:
                    t1 = min(t1, self.K(c["t"]) - (c["do"] - c["od"]))
            idx = list(range(i0, i1 + 1))
            for c in self.cit:
                if c.get("pred") == n:
                    cf0, cf1 = f_(self.K(c["t"]) - (c["do"] - c["od"])), f_(self.K(c["t"]))
                    self.zaber("broll", c["ref"], cf0 - 1, cf1 - 1).update(citace=True, vf=c.get("vf"))
                    # citace je jen čistý klip, Heaton mluví celou dobu, bez našeho textu (Štěpán 12. 10.)
                    t0 = self.K(c["t"])
            f0, f1 = f_(t0) - (1 if n else 0), f_(t1) - 1
            obraz = fr.get("obraz")
            b0, b1 = self.slova[i0]["b"], self.slova[i1]["b"] + 0.3
            # KONCEPTY přebírají klauzi celou (obraz i text)
            dg = self.sc.get("diagram")
            if dg and (n == dg["fraze"] or n in dg["vetve_fraze"]):
                self.diagram_klauze(n, dg, idx, f0, f1)
                typ_posl = "karta"
                continue
            if fr.get("sedi"):
                self.sedi_klauze(fr["sedi"], idx, f0, f1)
                typ_posl = "karta"
                continue
            km = self.sc.get("komentar")
            if km and n == km["fraze"]:
                self.zaber("karta", None, f0, f1, karta="tmava")
                iv = idx[0] + km["slovo"]
                fz = f_(self.slova[iv]["t"])
                self.koncepty.append(dict(typ="komentar", f=f0 + 2, f1=f1, text=km["text"], jm=km.get("jm", "ty"),
                                          casy=[fz + round(k * 1.6) for k in range(len(km["text"]))]))
                self.rada([i for i in idx if i < iv], f1, 960, 300)
                typ_posl = "karta"
                continue
            # typ obrazu klauze: Tim jen když kouká do kamery, karta pro abstraktní věty bez záběru
            odvraty = self.odvraty(f0, f1, i0) if obraz == "th" else []
            if obraz == "th" and odvraty is not None:
                typ = "th"
            elif obraz == "th" and fr.get("kryt"):
                typ, obraz = "broll", fr["kryt"]
            elif obraz and obraz != "th":
                typ = "broll"
            else:
                typ = "karta"
            # střih na první slovo klauze, záběrů je víc jen u dlouhých B-roll klauzí (montáž důkazů)
            if typ == "th":
                # A-roll i u klauze, kde Tim na chvíli uhne pohledem: ten kus překryje B-roll, text zůstane ve sloupci vedle Tima
                kryt, hrany, k = fr.get("kryt") or ["hledej:george_face"], [], 0
                for a, b in odvraty:
                    hrany.append(("th", f0 if not hrany else hrany[-1][2] + 1, a - 1))
                    hrany.append(("kryt", a, b))
                hrany.append(("th", f0 if not hrany else hrany[-1][2] + 1, f1))
                for druh, a, b in hrany:
                    if b < a:
                        continue
                    if druh == "th":
                        z = self.zaber("th", None, a, b)
                        z["drift"] = r.choice([-1, 1]) * r.uniform(0.00038, 0.00068)   # za snímek, punch na velkých slovech v plan()
                    else:
                        z = self.zaber("broll", kryt[k % len(kryt)], a, b)
                        d = r.uniform(0.0004, 0.0016) * (b - a + 1)
                        z["zoom"] = [1.0, round(1 + d, 4), "none"] if r.random() < 0.5 else [round(1 + d, 4), 1.0, "none"]
                        k += 1
                barva_t = None
            elif typ == "karta":
                self.zaber("karta", None, f0, f1, karta=karta)
                barva_t = "akcent" if karta == "svetla" else None
                self.karta_akt = karta
                karta = "tmava" if karta == "svetla" else "svetla"
            else:
                refs = obraz
                # klidný střih: záběr aspoň kolem 1,7 s, ne montáž po vteřině
                m = max(1, min(len(refs), round((t1 - t0) / 1.7)))
                hrany = [f0] + [f0 + round((f1 - f0) * k / m) for k in range(1, m)] + [f1]
                # B-roll v okně na naší ploše (červená nebo tmavá), text na druhé straně; okno vyjede zespodu
                okno = None
                if r.random() < P["okno"] and not self.posl_okno:
                    strana = r.choice(["vlevo", "vpravo"])
                    okno = dict(tvar=r.choice(["16:9", "16:9", "1:1"]), strana="vpravo" if strana == "vlevo" else "vlevo",
                                pozadi=r.choice(["svetla", "tmava"]))
                    self.strana_klauze = strana
                self.posl_okno = okno is not None
                for k in range(m):
                    z = self.zaber("broll", refs[k % len(refs)], hrany[k] if k == 0 else hrany[k] + 1, hrany[k + 1], opak=k // len(refs))
                    n_z = z["f1"] - z["f0"] + 1
                    if okno:
                        z["okno"] = dict(okno, vyjezd=(k == 0))
                        d = r.uniform(0.0003, 0.0006) * n_z
                        z["zoom"] = [1.0, round(1 + d, 4), "none"]
                    elif r.random() < P["snap"]:
                        # jemný snap: 6 až 12 %, dlouhý plynulý dojezd
                        mag = r.uniform(0.06, 0.12)
                        z["zoom"] = [round(1 + mag, 3), 1.0, "expo.out", r.randint(45, 70)]
                    else:
                        # pomalý plynulý drift 0,04 až 0,09 % za snímek, směr náhodně
                        d = r.uniform(0.0004, 0.0009) * n_z
                        z["zoom"] = [1.0, round(1 + d, 4), "none"] if r.random() < 0.6 else [round(1 + d, 4), 1.0, "none"]
                    if fr.get("cb"):
                        z["cb"] = True
                barva_t = None
            if typ != typ_posl and n and len(self.zablesky) < 2 and (not self.zablesky or f0 - self.zablesky[-1][0] > 600) and r.random() < P["zablesk"] * 3:
                self.zablesky.append([f0 + 1, round(r.uniform(0.69, 0.89), 2)])
            typ_posl = typ

            # text klauze: zvláštní techniky podle obsahu a rozpočtu, jinak velké slovo se zigzagem
            slova_txt = [cisty(self.slova[i]["w"]).strip(",") for i in idx]
            if fr.get("roky") and rozp["roky"]:
                rozp["roky"] -= 1
                od, do = fr["roky"]
                self.texty.append(dict(typ="roky", od=od, do=do, f=f0 + 1, fDo=min(f1, f0 + 27), f1=f1, y=437))
                self.rada([i for i in idx if not re.search(r"\d", self.slova[i]["w"])], f1, 960, 600)
            elif fr.get("pocitadlo") and rozp["pocitadlo"]:
                rozp["pocitadlo"] -= 1
                p = fr["pocitadlo"]
                fz = f_(self.slova[i0 + p["slovo"]]["t"]) - 2
                self.texty.append(dict(typ="pocitadlo", od=0, do=p["do"], pripona=p.get("pripona", ""), f=fz, fDo=fz + p.get("snimku", 26), f1=f1, x=960 if typ != "th" else P["th_x"], y=450, s=128))
                ost = [i for i in idx if i < i0 + p["slovo"] or i > i0 + p["slovo"] + 1]
                self.rada(ost, f1, 960 if typ != "th" else P["th_x"], 610, barva=barva_t)
            elif typ == "karta" and slova_txt[0].lower() in ("protože", "ale", "jenže", "zadruhé", "zaprvé", "zatřetí") and rozp["schody"] and len(idx) >= 3:
                # skript na začátku klauze, zbytek po jednom slovu schodem pod ním (R15)
                rozp["schody"] -= 1
                t, ink = self.velke(i0, f1, 960 + r.randint(-120, 40), 470, r.randint(560, 760), druh="skript", barva=barva_t, smer="dol")
                t.update(D=58, tau=8)
                t.pop("blink", None)
                sl = [dict(text=cisty(self.slova[i]["w"]), f=f_(self.slova[i]["t"]) - 1) for i in idx[1:]]
                # každý schod o šířku předchozího slova vpravo a o 40 px níž, ať se česká delší slova nepřekrývají
                zbytek = 58 * math.exp(-max(0, sl[0]["f"] - t["f"]) / 8) if sl else 0   # skript ještě dojíždí
                poz, x, y = [], ink[0] + r.randint(60, 160), max(ink[3] + 24, t["y"] + t["s"] + 4) + zbytek
                for w in sl:
                    poz.append([round(x), round(y)])
                    x += self.sirka_male(w["text"]) + r.randint(14, 30)
                    y += r.randint(38, 46)
                self.texty.append(dict(typ="schody", slova=sl, f1=f1, pozice=poz, s=P["male"], **({"barva": barva_t} if barva_t else {})))
            elif typ == "broll" and rozp["kond"] and r.random() < P["kond"] * 2 and 2 <= len([s for s in slova_txt if s.lower() not in STOP]) <= 4:
                # kondenzovaný nadpis přes horní třetinu (R "PRACTICALLY OVERNIGHT"), dva řádky
                rozp["kond"] -= 1
                obs = [i for i in idx if cisty(self.slova[i]["w"]).lower().strip(",") not in STOP]
                pul = (len(obs) + 1) // 2
                y_dalsi = None
                for k, cast in enumerate([obs[:pul], obs[pul:]]):
                    if not cast:
                        continue
                    txt = " ".join(cisty(self.slova[i]["w"]).strip(",") for i in cast).upper()
                    if self.strana_klauze:
                        # vedle okna: nadpis jen ve volné části plochy
                        kx, ks = (440, r.randint(560, 680)) if self.strana_klauze == "vlevo" else (1480, r.randint(560, 680))
                    else:
                        kx, ks = 1000, r.randint(980, 1180)
                    tt, ik = self.velke(cast[0], f1, kx, 180, ks, druh="kond", text=txt)
                    if y_dalsi is not None:
                        # druhý řádek těsně pod inkoustem prvního (OVERNIGHT pod PRACTICALLY), ať se nepřekrývají
                        tt["y"] += round(y_dalsi - ik[1])
                    y_dalsi = (ik[3] if y_dalsi is None else y_dalsi) + 26
                    tt.pop("blink", None)
            elif typ == "broll" and rozp["swap"] and r.random() < P["swap"] * 2 and len(idx) >= 4:
                rozp["swap"] -= 1
                sl = [dict(text=cisty(self.slova[i]["w"]), f=f_(self.slova[i]["t"]) - 1) for i in idx]
                self.texty.append(dict(typ="swap", slova=sl, f1=f1, x=960, y=470, s=r.choice([120, 140, 160])))
            elif typ == "th" and rozp["karaoke"] and r.random() < P["karaoke"] * 2 and 3 <= len(idx) <= 7:
                rozp["karaoke"] -= 1
                rr = self.rada(idx, f1, P["th_x"], 520, karaoke=True)
                for w in rr["slova"]:
                    pass
                rr["slova"][0]["f"] = f0 + 1
            else:
                strana = None if typ != "broll" else (self.strana_klauze or r.choice(["vlevo", "vpravo", None]))
                self.klauze_text(idx, f1, typ, strana, barva_t)

        konec = f_(self.konec_reci) + 6
        # konec (R29): plochý šedý snímek, pak 15 snímků černé při dozvuku
        self.zabery.append(dict(typ="karta", ref=None, f0=konec, f1=konec + 1, plocha="seda"))
        self.zabery.append(dict(typ="karta", ref=None, f0=konec + 1, f1=konec + 16, plocha="cerna"))
        return konec + 16

    def plan(self):
        delka = self.postav()
        self.rozres_obraz()
        self.th_pohyb()
        self.zvuk_plan(delka)
        return dict(fps=FPS, w=W, h=H, delka=delka, profil=self.P, zabery=self.zabery, texty=sorted(self.texty, key=lambda t: t.get("f", t.get("slova", [{"f": 0}])[0]["f"])),
                    zvuky=sorted(self.zvuky, key=lambda z: z["t"]), ticho=self.ticho, zablesky=self.zablesky, koncepty=self.koncepty, letterbox={"snimku": 57} if self.P["letterbox"] else None, citace=self.cit,
                    konec_reci=f_(self.konec_reci))


if __name__ == "__main__":
    sc = nacti(sys.argv[1])
    seed = int(sys.argv[sys.argv.index("--seed") + 1]) if "--seed" in sys.argv else sc.get("seed", 1)
    v = Video(sc, seed)
    p = v.plan()
    json.dump(p, open(os.path.join(KOREN, f"plany/{sc['nazev']}_navrh.json"), "w"), ensure_ascii=False, indent=1)
    from collections import Counter
    print(sc["nazev"], "seed", seed, "délka", round(p["delka"] / FPS, 2), "s, záběrů", len(p["zabery"]), "textů", len(p["texty"]),
          "typy", dict(Counter(z["typ"] for z in p["zabery"])), "texty", dict(Counter(t["typ"] for t in p["texty"])), "záblesků", len(p["zablesky"]))
