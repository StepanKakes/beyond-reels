# Banka záběrů: výběr skutečných video úseků z katalogu ZABERY.json, každý úsek zdroje jen jednou za video
# Sdílí ji Lumitris i Nathan (nathan-styl importuje přes cestu)
#
# Dotazy ve scénáři (pole "obraz" fráze, "okna"):
#   "klip:ID@t"        kotva: úsek od času t (když je obsazený, nejbližší volné místo v témže záběru, pak jinde v klipu)
#   "klip:ID@a-b"      kotva na rozsah, vybere se volné místo uvnitř
#   "hledej:slova"     slova i štítky z katalogu (car rolls_royce "owners club"), skóre podle shody, los semínkem
#   "img:..." a jiné   projdou beze změny (jen pro okna, nikdy na plný rám)
import json, os, re, subprocess
import numpy as np

# Cesty ke katalogu záběrů a ke zdrojovým klipům patří konkrétnímu reelu: dodá je scénář (zdroje.klip = vzor s {} pro ID klipu,
# volitelně zdroje.zabery = cesta k ZABERY.json, jinak ZABERY.json vedle klipů), nebo proměnné BR_ZABERY_KLIPY a BR_ZABERY_KATALOG.
# Volá se nastav(...) před Banka(...).
KATALOG = os.environ.get("BR_ZABERY_KATALOG")
ZDROJ = os.environ.get("BR_ZABERY_KLIPY")
KONTROLA = None


def nastav(klip=None, katalog=None):
    global KATALOG, ZDROJ, KONTROLA
    ZDROJ = os.path.expanduser(klip) if klip else ZDROJ
    KATALOG = os.path.expanduser(katalog) if katalog else (KATALOG or (os.path.join(os.path.dirname(ZDROJ), "ZABERY.json") if ZDROJ else None))
    if not ZDROJ or not KATALOG or not os.path.exists(KATALOG):
        raise SystemExit("banka: chybí katalog záběrů. Do scénáře dej zdroje.klip (vzor cesty s {} pro ID klipu, vedle klipů leží ZABERY.json) "
                         "a případně zdroje.zabery, nebo nastav BR_ZABERY_KLIPY a BR_ZABERY_KATALOG. Hledáno: " + str(KATALOG))
    KONTROLA = os.path.join(os.path.dirname(KATALOG), "kontrola_zaberu.json")


SPATNE = {"captions", "talking_head", "interviewer", "black_fade", "title_card", "low_quality", "vertical_letterboxed",
          "still_image_looking", "screen_recording", "static", "logo_overlay"}
BEZ_KLIPU = {"MXcMmrwUBkA_60"}
SPATNE_KOTVA = SPATNE - {"talking_head"}
OKRAJ = 0.25     # od hrany střihu ve zdroji, ať do záběru neprobleskne sousední
SCENA = 120.0    # okolí použitého úseku v klipu, které hledání nebere (vlog drží jednu scénu minuty)
MEZERA = 0.6     # dva úseky z téhož místa zdroje nesmí být blíž, jinak to vypadá jako opakování


STOP_POPIS = set("a an the of in on at with and to from by for his her their its is are near into over under while two three one man men woman women person people george shot close up closeup wide view frame background camera".split())
MAX_KLIP = 6     # nejvýš tolik záběrů z jednoho klipu za video


def obsah(popis):
    return {w for w in re.findall(r"[a-z0-9]+", popis.lower()) if w not in STOP_POPIS and len(w) > 2}


def podobnost(a, b):
    return len(a & b) / max(1, min(len(a), len(b)))


def otisk(klip, t):
    """otisk obrazu: barevný histogram 6x6x6 a zmenšenina 16x9 s nulovým průměrem (stejné místo a úhel = vysoká shoda)"""
    raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{t:.2f}", "-i", ZDROJ.format(klip), "-frames:v", "1", "-vf", "scale=48:27",
                          "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], capture_output=True).stdout
    if len(raw) != 48 * 27 * 3:
        return None
    a = np.frombuffer(raw, np.uint8).reshape(27, 48, 3)
    q = (a // 43).reshape(-1, 3)
    hist = np.bincount(q[:, 0] * 36 + q[:, 1] * 6 + q[:, 2], minlength=216).astype(float)
    g = a.mean(2).reshape(9, 3, 16, 3).mean((1, 3)).ravel()
    g = g - g.mean()
    return [(hist / hist.sum()).round(4).tolist(), (g / (np.linalg.norm(g) + 1e-9)).round(4).tolist()]


def shoda(a, b):
    h = np.minimum(np.array(a[0]), np.array(b[0])).sum()
    k = float(np.dot(a[1], b[1]))
    # změřeno na náhodných párech katalogu: 0,1 % falešných shod, víc nejde, otisk jiný úhel téže scény nepozná
    return h > 0.8 and k > 0.5 or k > 0.9


def snimek(klip, t, w=96, h=54):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{t:.2f}", "-i", ZDROJ.format(klip), "-frames:v", "1", "-vf", f"scale={w}:{h}",
                          "-f", "rawvideo", "-pix_fmt", "gray", "-"], capture_output=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(h, w).astype(float) if len(raw) == w * h else None


class Banka:
    def __init__(self, rng, katalog=None, spatne=SPATNE, klip=None):
        if klip or katalog or not KONTROLA:
            nastav(klip, katalog)
        self.r = rng
        vse = json.load(open(KATALOG))
        self.vse = vse
        self.dobre = [z for z in vse if z["klip"] not in BEZ_KLIPU and not set(z["vlajky"]) & spatne and z["do"] - z["od"] >= 0.8]
        self.obsazeno = {}           # klip -> [(od, do)]
        self.posledni = None         # (klip, i) posledního výběru, sousední záběry nesmí být z téhož záběru zdroje
        from collections import Counter
        self.df = Counter(w for z in vse for w in obsah(z["popis"]))
        self.slova_pouzita = Counter()  # specifické slovo popisu (kabriolet, stadion, fronta) smí být nejvýš ve 2 záběrech
        self.obsahy = []             # obsah popisu použitých záběrů: podobný popis = stejná scéna, i v jiném klipu
        self.na_klip = {}
        self.pouzite = set()         # (klip, i) záběrů katalogu: každý záběr zdroje jen jednou za video (jinak 4x tentýž maraton)
        self.kontrola = json.load(open(KONTROLA)) if os.path.exists(KONTROLA) else {}
        self.otisky_soubor = KONTROLA.replace("kontrola_zaberu", "otisky_zaberu")
        self.otisky = json.load(open(self.otisky_soubor)) if os.path.exists(self.otisky_soubor) else {}
        self.pouzite_otisky = []

    def otisk(self, z):
        k = f"{z['klip']}#{z['i']}"
        if k not in self.otisky:
            self.otisky[k] = otisk(z["klip"], (z["od"] + z["do"]) / 2)
            json.dump(self.otisky, open(self.otisky_soubor, "w"))
        return self.otisky[k]

    def zdravy(self, z):
        """záběr bez černých pruhů po stranách a nahoře, ne statická fotka uvnitř videa; výsledek se pamatuje"""
        k = f"{z['klip']}#{z['i']}"
        if k not in self.kontrola:
            d = z["do"] - z["od"]
            sn = [snimek(z["klip"], z["od"] + d * x, 192, 108) for x in (0.15, 0.5, 0.85)]
            if any(s is None for s in sn):
                self.kontrola[k] = False
            else:
                s = sn[1]
                stred = s[:, 40:152].mean()
                okraj = max(s[:, :10].mean(), s[:, -10:].mean())
                pruhy = okraj < 6 and stred > okraj + 10                      # pillarbox i u tmavého záběru
                pruhy_v = max(s[:8].mean(), s[-8:].mean()) < 5 and stred > 15
                staticky = max(np.abs(sn[0] - sn[1]).mean(), np.abs(sn[1] - sn[2]).mean()) < 3.0
                lap = np.abs(s[1:-1, 1:-1] * 4 - s[:-2, 1:-1] - s[2:, 1:-1] - s[1:-1, :-2] - s[1:-1, 2:]).mean()
                rozmazany = lap < 2.2
                self.kontrola[k] = not (pruhy or pruhy_v or staticky or rozmazany)
            json.dump(self.kontrola, open(KONTROLA, "w"))
        return self.kontrola[k]

    # ---------- obsazenost ----------
    def volno(self, klip, a, b):
        return all(b + MEZERA <= x or a >= y + MEZERA for x, y in self.obsazeno.get(klip, []))

    def zaber(self, klip, a, b):
        self.obsazeno.setdefault(klip, []).append((a, b))

    def misto(self, z, d, od=None):
        """první volné místo délky d uvnitř záběru z katalogu (od času od, když je dán), jinak None"""
        lo, hi = z["od"] + OKRAJ, z["do"] - OKRAJ
        if hi - lo < d or (z["klip"], z["i"]) in self.pouzite or not self.zdravy(z):
            return None
        start = max(lo, od) if od is not None else lo
        kroky = [start + k * 0.2 for k in range(int((hi - d - start) / 0.2) + 1)]
        if od is not None:   # kotva: nejdřív od kotvy dopředu, pak zpátky
            kroky += [start - k * 0.2 for k in range(1, int((start - lo) / 0.2) + 1)]
        for t in kroky:
            if lo <= t and t + d <= hi and self.volno(z["klip"], t, t + d):
                return t
        return None

    def zaber_v(self, klip, t):
        for z in self.vse:
            if z["klip"] == klip and z["od"] <= t < z["do"]:
                return z
        return None

    # ---------- výběr ----------
    def skore(self, z, slova):
        txt = z["popis"].lower()
        s = 0.0
        for w in slova:
            if w in z["tagy"]:
                s += 2
            elif w.replace("_", " ") in txt:
                s += 3
        if s == 0:
            return 0
        s += min(z["pohyb"], 0.6) * 2 - (1.5 if "dark" in z["vlajky"] else 0) - (1 if "george_talking_head" in z["tagy"] else 0)
        return s + self.r.random() * 1.5

    def vezmi(self, dotaz, d):
        """vrátí (ref, od) pro úsek délky d sekund, úsek zapíše jako obsazený"""
        druh, _, zb = dotaz.partition(":")
        if druh == "klip":
            klip, _, t = zb.partition("@")
            a, _, b = t.partition("-")
            a = float(a or 0)
            z = self.zaber_v(klip, a)
            if z and not set(z["vlajky"]) & SPATNE_KOTVA:
                t0 = self.misto(z, d, a)
                if t0 is not None:
                    return self._ber(z, t0, d)
            # kotva obsazená, krátká nebo vadná: hledání podle jejích štítků a popisu, ne sousední záběr téhož klipu
            return self.vezmi("hledej:" + " ".join((z or {}).get("tagy", ["george_face"])), d)
        if druh == "hledej":
            slova = [w.strip('"').lower() for w in re.findall(r'"[^"]+"|\S+', zb)]
            poradi = sorted(self.dobre, key=lambda x: -self.skore(x, slova))
            for x in poradi:
                if self.skore(x, slova) <= 0:
                    break
                if self.posledni and self.posledni[0] == x["klip"]:
                    continue   # sousední záběry nikdy z téhož klipu
                if any(abs(x["od"] - a) < SCENA or abs(x["do"] - b) < SCENA for a, b in self.obsazeno.get(x["klip"], [])):
                    continue   # okolí použitého místa je tatáž scéna (maraton, palmy), hledání ji nebere
                if self.na_klip.get(x["klip"], 0) >= MAX_KLIP:
                    continue
                if self.stejna_scena(x):
                    continue
                t0 = self.misto(x, d)
                if t0 is not None:
                    return self._ber(x, t0, d)
            # nic nesedí: jakýkoli volný záběr s Georgem, pak cokoli volného
            for slova2 in (["george_face"], ["clothing", "la", "city"], []):
                for x in sorted(self.dobre, key=lambda x: -self.skore(x, slova2)):
                    if (slova2 and (self.stejna_scena(x) or (self.posledni and self.posledni[0] == x["klip"])
                                    or self.na_klip.get(x["klip"], 0) >= MAX_KLIP)):
                        continue
                    t0 = self.misto(x, d)
                    if t0 is not None:
                        return self._ber(x, t0, d)
            raise RuntimeError(f"banka je vyčerpaná pro {dotaz} ({d:.2f} s)")
        return dotaz, None

    def stejna_scena(self, x):
        """kabriolet, stadion, fronta z výšky: stejná scéna podle popisu nebo podle obrazu, i v jiném klipu"""
        o = self.otisk(x)
        if o and any(shoda(o, u) for u in self.pouzite_otisky):
            return True
        ob = obsah(x["popis"])
        if any(podobnost(ob, o) >= 0.5 for o in self.obsahy):
            return True
        return any(self.df[w] <= 70 and self.slova_pouzita[w] >= 2 for w in ob)

    def _ber(self, z, t0, d):
        self.zaber(z["klip"], t0, t0 + d)
        self.posledni = (z["klip"], z["i"])
        self.pouzite.add((z["klip"], z["i"]))
        self.obsahy.append(obsah(z["popis"]))
        o = self.otisk(z)
        if o:
            self.pouzite_otisky.append(o)
        self.slova_pouzita.update(obsah(z["popis"]))
        self.na_klip[z["klip"]] = self.na_klip.get(z["klip"], 0) + 1
        if z.get("setup") is not None:   # stejné nastavení kamery v jiném záběru je pro oko totéž
            self.pouzite.update((x["klip"], x["i"]) for x in self.vse if x["klip"] == z["klip"] and x.get("setup") == z.get("setup"))
        return f"klip:{z['klip']}@{t0:.2f}", z

    def zprava(self):
        n = sum(len(v) for v in self.obsazeno.values())
        return f"{n} úseků z {len(self.obsazeno)} klipů"
