# Příprava médií z návrhu generátoru -> plany/<nazev>.json pro build.mjs
# python3 nastroje/priprav.py scenare/heaton.json
# Všechny záběry (Tim, B-roll, citace) do jednoho videa assets/media/<nazev>_podklad.mp4 (1920x1080, 30 fps).
# Typografické karty kreslí kit jako CSS přechody nad podkladem (plochy), podklad je pod nimi černý.
import json, math, os, subprocess, sys
KOREN = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sc = json.load(open(sys.argv[1]))
nazev = sc["nazev"]
navrh = json.load(open(os.path.join(KOREN, f"plany/{nazev}_navrh.json")))
W, H, FPS = navrh["w"], navrh["h"], 30
TMP = f"/tmp/nathan_{nazev}"
os.makedirs(TMP, exist_ok=True)
cit = sorted(navrh.get("citace", []), key=lambda c: c["t"])


def telo(t):
    """čas kompozice -> čas Timova záznamu těla (citace v záznamu nejsou)"""
    for c in reversed(cit):
        konec = c["t"] + sum(x["do"] - x["od"] for x in cit if x["t"] <= c["t"])
        if t >= konec:
            return t - sum(x["do"] - x["od"] for x in cit if x["t"] <= c["t"])
    return t


def ff(*a):
    subprocess.run(["ffmpeg", "-v", "error", "-y", *a], check=True)


def zdroj(ref):
    druh, zb = ref.split(":", 1)
    jm, _, t = zb.partition("@")
    p = sc["zdroje"][druh].format(jm)
    return (p if os.path.isabs(p) else os.path.join(KOREN, p)), float(t or 0)


def plocha_png(druh):
    """pozadí okna: naše červená (tmavší nahoře) nebo tmavá #111111"""
    cil = f"{TMP}/plocha_{druh}.png"
    if not os.path.exists(cil):
        from PIL import Image
        import numpy as np
        if druh == "cervena":
            a, b = np.array([0xB3, 0x0A, 0x00]), np.array([0xFF, 0x4A, 0x33])
            k = np.linspace(0, 1, H)[:, None, None]
            Image.fromarray(np.broadcast_to(a + (b - a) * k, (H, W, 3)).astype(np.uint8)).save(cil)
        elif druh == "svetla":
            Image.new("RGB", (W, H), (0xF4, 0xF1, 0xF0)).save(cil)
        else:
            Image.new("RGB", (W, H), (17, 17, 17)).save(cil)
    return cil


def maska_png(w, h, r=24):
    cil = f"{TMP}/maska_{w}x{h}.png"
    if not os.path.exists(cil):
        from PIL import Image, ImageDraw
        m = Image.new("L", (w, h), 0)
        ImageDraw.Draw(m).rounded_rectangle([0, 0, w - 1, h - 1], r, fill=255)
        m.save(cil)
    return cil


def okno(z, src, t, pred, n, o):
    """B-roll zmenšený do okna (16:9 nebo čtverec) se zaoblenými rohy na naší ploše; první záběr klauze okno
    vysune zespodu exponenciálním dojezdem (tau 5 snímků), další záběry jen vymění obsah na místě"""
    ok = z["okno"]
    w, h = (1000, 562) if ok["tvar"] == "16:9" else (640, 640)
    x = W - 90 - w if ok["strana"] == "vpravo" else 90
    y = (H - h) // 2
    yv = f"{y}+140*exp(-n/5)" if ok.get("vyjezd") else str(y)   # n = číslo snímku, t po -ss nezačínalo nulou
    vstup = ["-loop", "1", "-framerate", str(FPS), "-i", src] if src.endswith((".jpg", ".png")) else ["-ss", f"{t:.3f}", "-i", src]
    fc = (f"[1:v]{pred}scale={w}:{h}:force_original_aspect_ratio=increase,crop={w}:{h},fps={FPS},setpts=PTS-STARTPTS,format=rgba[c];"
          f"[2:v]format=gray,setpts=PTS-STARTPTS[m];[c][m]alphamerge[cm];[0:v]fps={FPS},setpts=PTS-STARTPTS,format=rgba[b];"
          f"[b][cm]overlay=x={x}:y='{yv}':eval=frame:shortest=0,format=yuv420p")
    ff("-loop", "1", "-framerate", str(FPS), "-i", plocha_png(ok["pozadi"]), *vstup, "-loop", "1", "-i", maska_png(w, h),
       "-an", "-filter_complex", fc, "-frames:v", str(n), "-c:v", "libx264", "-crf", "16", "-pix_fmt", "yuv420p", o)


def kus(z, n, o):
    vf = f"scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},fps={FPS}"
    if z.get("cb"):
        vf += ",hue=s=0,eq=contrast=1.08"
    if z["typ"] == "karta" or z.get("plocha"):
        ff("-f", "lavfi", "-i", f"color=c=black:s={W}x{H}:r={FPS}", "-frames:v", str(n), "-c:v", "libx264", "-crf", "16", "-pix_fmt", "yuv420p", o)
    elif z["typ"] == "th":
        src = os.path.join(KOREN, sc["zdroje"]["th"])
        # konec záznamu těla: poslední snímek podržet, ať pod posledním slovem není černo
        ff("-ss", f"{telo(z['f0'] / FPS):.4f}", "-i", src, "-an", "-vf", vf + ",tpad=stop_mode=clone:stop_duration=3", "-frames:v", str(n), "-c:v", "libx264", "-crf", "16", "-pix_fmt", "yuv420p", o)
    else:
        src, t = zdroj(z["ref"])
        t += 1.6 * z.get("opak", 0)
        pred = (z["vf"] + ",") if z.get("vf") else ""
        if z.get("okno"):
            okno(z, src, t, pred, n, o)
            return
        if not z.get("citace"):
            vf += ",eq=brightness=-0.035:gamma=0.93"   # celoplošný B-roll o kus tmavší, ať je bílý text čitelný
        elif src.endswith((".jpg", ".png")):
            ff("-loop", "1", "-i", src, "-vf", pred + vf, "-frames:v", str(n), "-c:v", "libx264", "-crf", "16", "-pix_fmt", "yuv420p", o)
        else:
            ff("-ss", f"{t:.3f}", "-i", src, "-an", "-vf", pred + vf, "-frames:v", str(n), "-c:v", "libx264", "-crf", "16", "-pix_fmt", "yuv420p", o)


zab = sorted(navrh["zabery"], key=lambda z: z["f0"])
for k in range(len(zab) - 1):
    zab[k]["f1"] = zab[k + 1]["f0"] - 1
zab[0]["f0"] = 0
zab[-1]["f1"] = navrh["delka"] - 1
kusy, zoomy, plochy = [], [], []
for k, z in enumerate(zab):
    n = z["f1"] - z["f0"] + 1
    if n <= 0:
        continue
    o = f"{TMP}/k{k:03d}.mp4"
    kus(z, n, o)
    kusy.append(o)
    if z.get("plocha"):
        plochy.append(dict(plocha=z["plocha"], f0=z["f0"], f1=z["f1"] + 1))
    elif z.get("zoomy"):   # TH: drift a punch segmenty, poslední dotáhnout na skutečný konec záběru
        seg = [list(s) for s in z["zoomy"]]
        seg[-1][1] = z["f1"] + 1
        zoomy += [s for s in seg if s[1] > s[0]]
    elif z.get("zoom"):
        a, b, ease, *tr = z["zoom"]
        zoomy.append([z["f0"], z["f1"] + 1, a, b, ease] + tr)
open(f"{TMP}/seznam.txt", "w").write("".join(f"file '{k}'\n" for k in kusy))
podklad = f"assets/media/{nazev}_podklad.mp4"
ff("-f", "concat", "-safe", "0", "-i", f"{TMP}/seznam.txt", "-c", "copy", os.path.join(KOREN, podklad))
# obličeje: velké slovo na B-rollu nesmí ležet přes tvář (kontrola 12. 10.: "nevypadá" přes ústa, "podnikatel" přes bradu);
# celá skupina klauze (velké slovo, řádky se stejným koncem, bloky) se posune svisle o nejmenší možný kus
import cv2
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pismo import inkoust
broll = [(z["f0"], z["f1"]) for z in zab if z["typ"] == "broll"]
broll_cele = [(z["f0"], z["f1"]) for z in zab if z["typ"] == "broll" and not z.get("okno")]
na_brollu = lambda f: any(a <= f <= b for a, b in broll)
zac_t = lambda t: t["f"] if "f" in t else t["slova"][0]["f"]
vzorky = lambda t: sorted({f for f in (zac_t(t) + 3, zac_t(t) + 8, (zac_t(t) + t["f1"]) // 2, t["f1"] - 2) if zac_t(t) <= f < t["f1"] and na_brollu(f)})
kandidati = [t for t in navrh["texty"] if t["typ"] in ("velke", "pocitadlo") and vzorky(t)]
kandidati += [t for t in navrh["texty"] if t["typ"] == "rada" and "x" in t and t.get("slova") and vzorky(t)]
snimky = sorted({f for t in kandidati for f in vzorky(t)})
cap = cv2.VideoCapture(os.path.join(KOREN, podklad))
cesty = {}
for f in snimky:
    cap.set(cv2.CAP_PROP_POS_FRAMES, f)
    ok, im = cap.read()
    if ok:
        cesty[f] = f"{TMP}/tv{f:05d}.jpg"
        cv2.imwrite(cesty[f], cv2.resize(im, (960, 540)))
cap.release()
# Apple Vision (nastroje/tvare.swift), najde i natočené tváře; box rozšířit o bradu a vousy
TVARE = os.path.join(KOREN, "nastroje/tvare")
if not os.path.exists(TVARE):   # binárka se do pluginu nevozí, přeloží se z tvare.swift (macOS, Xcode command line tools)
    subprocess.run(["swiftc", "-O", os.path.join(KOREN, "nastroje/tvare.swift"), "-o", TVARE], check=True)
nalez = json.loads(subprocess.run([TVARE, *cesty.values()], capture_output=True, text=True).stdout or "{}")
TV = {f: [(W * (x0 - 0.15 * (x1 - x0)), H * (y0 - 0.1 * (y1 - y0)), W * (x1 + 0.15 * (x1 - x0)), H * (y1 + 0.35 * (y1 - y0)))
          for x0, y0, x1, y1 in nalez.get(c, [])] for f, c in cesty.items()}
tvare = lambda f: TV.get(f, [])


def box(t, dojezd=False):
    if t["typ"] in ("velke", "pocitadlo"):
        if t["typ"] == "pocitadlo":
            txt = f"{t['do']:,}".replace(",", " ") + t.get("pripona", "")
            i = inkoust(txt, "hn", t["s"])
            x = t["x"] - (i[2] + i[0]) / 2
        else:
            i, x = inkoust(t["text"], t.get("font", "hn"), t["s"]), t["x"]
        b = [x + i[0], t["y"] + i[1], x + i[2], t["y"] + i[3]]
        if dojezd and t["typ"] == "velke":   # slovo první snímky ještě dojíždí, tedy leží níž (nebo výš)
            d = 0.5 * t.get("D", 150)
            if t.get("smer") == "nahoru":
                b[1] -= d
            elif t.get("smer") != "vpravo":
                b[3] += d
        return tuple(b)
    sir = sum(inkoust(w["text"], "male", t["s"])[4] for w in t["slova"]) + inkoust(" ", "male", t["s"])[4] * (len(t["slova"]) - 1)
    x0 = {"stred": t["x"] - sir / 2, "vpravo": t["x"] - sir}.get(t.get("zarovnani", "stred"), t["x"])
    return (x0, t["y"], x0 + sir, t["y"] + t["s"])


prekryv = lambda a, b: a[0] < b[2] and b[0] < a[2] and a[1] < b[3] and b[1] < a[3]
posunuto, hotove = 0, set()
for tv in kandidati:
    if id(tv) in hotove:
        continue
    tw = [b for f in vzorky(tv) for b in tvare(f)]
    # skupina klauze: všechna velká slova a řádky se stejným koncem (dva řádky verzálek musí jet spolu)
    skup = [tv] + [t for t in navrh["texty"] if t is not tv and t["typ"] in ("rada", "velke") and "x" in t and t.get("f1") in (tv["f1"], tv["f"])
                   and abs(zac_t(t) - zac_t(tv)) < 90] if tv["typ"] != "rada" else [tv]
    hotove.update(id(t) for t in skup)
    bx = [box(t, True) for t in skup]
    if not tw or not any(prekryv(b, f) for b in bx for f in tw):
        continue
    for dy in sorted(range(-480, 481, 20), key=abs):
        if min(b[1] for b in bx) + dy < 50 or max(b[3] for b in bx) + dy > H - 50:
            continue
        if not any(prekryv((b[0], b[1] + dy, b[2], b[3] + dy), f) for b in bx for f in tw):
            for t in skup:
                t["y"] += dy
                for b in t.get("bloky", []):
                    b[1] += dy
            posunuto += 1
            break
print("text mimo obličej:", posunuto, file=sys.stderr)

# překryvy textu (Štěpán 12. 10.: "fonty, co se překrývají"): malý řádek nebo schody odsunout od velkého slova o 24 px
def kusy_boxu(t):
    if t["typ"] == "schody":
        return [(x, y, x + inkoust(w["text"], "male", t["s"])[4], y + t["s"]) for w, (x, y) in zip(t["slova"], t["pozice"])]
    return [box(t, True)] if t["typ"] in ("velke", "rada", "pocitadlo") and "x" in t else []


zivot = lambda t: (t.get("f", t["slova"][0]["f"] if t.get("slova") else 0), t.get("f1", 0))


def box_v_case(a, f):
    """inkoust velkého slova ve snímku f včetně zbytku dojezdu"""
    b = list(box(a))
    if a["typ"] == "velke":
        off = a.get("D", 0) * math.exp(-max(0, f - a["f"]) / a.get("tau", 6))
        if a.get("smer") == "nahoru":
            b[1] -= off; b[3] -= off
        elif a.get("smer") == "vpravo":
            b[0] += off; b[2] += off
        else:
            b[1] += off; b[3] += off
    return tuple(b)


odsunuto = 0
for _ in range(3):
    for a in [t for t in navrh["texty"] if t["typ"] in ("velke", "pocitadlo")]:
        for b in navrh["texty"]:
            if b is a or b["typ"] not in ("rada", "schody", "velke") or (b["typ"] == "velke" and b["f"] <= a["f"]):
                continue
            (a0, a1), (b0, b1) = zivot(a), zivot(b)
            if b0 >= a1 or a0 >= b1:
                continue
            # řádek už stojí, když slovo přijede: hlídat celou dráhu; řádek přijde později: jen od svého nástupu
            A = box_v_case(a, max(a0, b0))
            for B in kusy_boxu(b):
                if prekryv(A, B):
                    dy = (A[3] + 16 - B[1]) if (B[1] + B[3]) / 2 >= (box(a)[1] + box(a)[3]) / 2 else (A[1] - 16 - B[3])
                    if b["typ"] == "schody":
                        b["pozice"] = [[x, y + dy] for x, y in b["pozice"]]
                    else:
                        b["y"] += dy
                    odsunuto += 1
                    break
print("odsunuté překryvy textu:", odsunuto, file=sys.stderr)

# čitelnost: bílé písmo na velmi světlém místě záběru (nebe, bílá zeď) přepne na modré jako u Nathana na světlé kartě
import numpy as np
sw, sh = 192, 108
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", os.path.join(KOREN, podklad), "-vf", f"scale={sw}:{sh}", "-f", "rawvideo", "-pix_fmt", "gray", "-"], capture_output=True).stdout
jas = np.frombuffer(raw, np.uint8).reshape(-1, sh, sw)
karty = [(z["f0"], z["f1"]) for z in zab if z.get("plocha")]
for tx in navrh["texty"]:
    if tx.get("barva") or tx["typ"] not in ("rada", "velke") or "x" not in tx:
        continue
    f0 = tx.get("f", tx["slova"][0]["f"] if tx.get("slova") else 0)
    f1 = min(len(jas), tx.get("f1", f0 + 30))
    if any(a <= f0 <= b for a, b in karty):
        continue
    bb = box(tx)
    bx0, bx1 = int(max(0, bb[0]) / W * sw), int(min(W, bb[2]) / W * sw)
    by0, by1 = int(max(0, bb[1]) / H * sh), int(min(H, bb[3]) / H * sh)
    p75 = [np.percentile(jas[k, by0:max(by0 + 1, by1), bx0:max(bx0 + 1, bx1)], 75) for k in range(f0, f1, 2)]
    # modrá na pestrém záběru vypadá špatně (kontrola 12. 10.): jen na skoro bílém pozadí, jinak bílá jako v originálu
    if tx.get("barva") == "akcent" and p75 and np.median(p75) < 120:
        tx.pop("barva")         # červená na tmavém splývá
    if p75 and np.median(p75) > 185:
        tx["barva"] = "akcent"
    elif any(a <= f0 <= b for a, b in broll_cele):
        tx["stin"] = True       # bílé přes pestrý celoplošný B-roll: jemný stín, ať je čitelné

plan = dict(fps=FPS, w=W, h=H, delka=navrh["delka"], zvuk=[dict(src=f"assets/media/{nazev}_mix.wav", f0=0)],
            zabery=[dict(src=podklad, f0=0, f1=navrh["delka"], ms=0, zoomy=zoomy)] + plochy,
            texty=navrh["texty"], zablesky=navrh["zablesky"], koncepty=navrh.get("koncepty", []), letterbox=navrh.get("letterbox"))
json.dump(plan, open(os.path.join(KOREN, f"plany/{nazev}.json"), "w"), ensure_ascii=False, indent=1)
print(podklad, len(kusy), "kusů,", len(plochy), "karet,", len(zoomy), "nájezdů")
