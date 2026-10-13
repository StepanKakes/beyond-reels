# Lumitris mix v Beyond verzi. Od 13. 10. 2026 výchozí STANDARD Beyond (Štěpán: srovnat se standardem): hlas ze studio_hlas -5,5 dB,
# hudba -24 dB RMS se sidechainem -6 dB (podržení 0,8 s), pod citacemi -10 dB, -14 LUFS / -1,5 dBTP. Původní Lumitris mix
# (hudba 7 LU pod hlasem bez duckingu) jen s "mix": "lumitris" v plánu.
# sub odhalení nabíhá 9 snímků před střihem s vrcholem na střihu, krátké digitální praskání nad 6 kHz u glitchů 21 dB pod hlasem.
# Štěpán 12. 10. 2026: kdykoli něco naskočí, skočí nebo se rychle mění fotky, dostane to zvuk z knihovny sfx/zaklad
# (slova klik1 a klik2 střídavě, prvky klik4, fotky a karty závěrka, obří slovo pop, okno kick, přesuny svih_vitr, čísla cisla).
# Časy se srovnají na mřížku taktu, aby zvuk seděl se snímkem, kdy se věc opravdu ukáže. Výstup -14,6 LUFS, limiter.
# python3 -I nastroje/zvuk.py heaton15   (z lumitris-styl/v2)
import json, os, re, subprocess, sys
import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt

SR = 48000
FPS = 24
jmeno = sys.argv[1]
plan = json.load(open(f"plany/{jmeno}.json"))
z = plan["zvuk"]
# zvuk roztahování (závorky, okno, box): cog | gears | tik | klik, z argumentu nebo z plánu
ROZTAH = sys.argv[2] if len(sys.argv) > 2 else z.get("roztah", "tik")
VYSTUP = sys.argv[3] if len(sys.argv) > 3 else f"assets/media/{jmeno}_mix.wav"
if len(sys.argv) > 4:   # výběr hudby: soubor z hudba/, začátek se najde sám (úsek kolem 75. percentilu hlasitosti)
    z = {**z, "hudba": sys.argv[4], "hudbaOd": None}
ROOT = os.environ.get("BR_PROSTOR") or os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", ".."))
HUDBA = os.environ.get("BR_HUDBA") or f"{ROOT}/hudba"    # knihovna hudby (wav + katalog.json)
HLAS = z.get("hlasSoubor")   # zvuk.hlasSoubor v plánu = výstup studio_hlas (studiový hlas reelu)
if not HLAS or not os.path.exists(os.path.expanduser(HLAS)):
    sys.exit("zvuk.py: v plánu chybí zvuk.hlasSoubor (cesta k studiovému hlasu reelu) nebo soubor neexistuje: " + str(HLAS))
HLAS = os.path.expanduser(HLAS)
STANDARD = z.get("mix", "standard") != "lumitris"
delka = plan["delka"] / FPS
N = int(delka * SR)


def nacti(cesta, od=0.0, do=None):
    x, sr = sf.read(cesta, always_2d=True)
    if sr != SR:
        raise SystemExit(f"{cesta}: čekám {SR} Hz, je {sr}")
    x = x[int(od * SR): int(do * SR) if do else None]
    if x.shape[1] == 1:
        x = np.repeat(x, 2, axis=1)
    return x[:, :2]


def lufs(x):
    sf.write("/tmp/_lumi_mer.wav", x, SR)
    r = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", "/tmp/_lumi_mer.wav", "-af", "ebur128", "-f", "null", "-"], capture_output=True, text=True).stderr
    return float(re.findall(r"I:\s+(-?[\d.]+) LUFS", r)[-1])


def rms_db(x):
    return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-9)


def polozit(stopa, zvuk, t):
    i = int(round(t * SR))
    if i < 0:
        zvuk, i = zvuk[-i:], 0
    k = min(len(zvuk), N - i)
    if k > 0:
        stopa[i:i + k] += zvuk[:k]


def sub_odhaleni(nabeh_snimku=9, dozvuk=2.4):
    """Sinus 110 > 55 Hz, náběh na vrchol přesně na střihu, pak dlouhý dozvuk (Dd6, DdsC K21)."""
    n0 = int(nabeh_snimku / FPS * SR)
    n1 = int(dozvuk * SR)
    t = np.arange(n0 + n1) / SR
    f = 55 + 55 * np.exp(-np.maximum(0, t - n0 / SR) * 2.2)
    f[:n0] = 110
    faze = 2 * np.pi * np.cumsum(f) / SR
    obal = np.concatenate([np.linspace(0, 1, n0) ** 2.2, np.exp(-np.arange(n1) / SR * 1.9)])
    x = np.sin(faze) * obal + 0.25 * np.sin(2 * faze) * obal
    return np.repeat(x[:, None], 2, axis=1), n0 / SR


def praskani(snimku=3, seed=0):
    """Krátké digitální praskání jen ve výškách (DdsC K15: +11 dB v 10 až 16 kHz, nic pod 1,5 kHz)."""
    rng = np.random.default_rng(seed)
    n = int(snimku / FPS * SR)
    sum_ = rng.standard_normal(n)
    hradlo = np.repeat(rng.random(n // 240 + 1) > 0.45, 240)[:n].astype(float)
    sos = butter(4, [6000, 16000], btype="band", fs=SR, output="sos")
    x = sosfilt(sos, sum_ * hradlo)
    x *= np.minimum(1, np.linspace(0, 6, n)) * np.minimum(1, np.linspace(6, 0, n))
    return np.stack([x, np.roll(x, 37)], axis=1)


# hlas: vyprávění se v místech citací rozdělí a citace (originální zvuk) se vloží mezi kusy
hlas = nacti(HLAS, z.get("od", 0), z.get("do", delka))
fade = int(0.05 * SR)
hlas[-fade:] *= np.linspace(1, 0, fade)[:, None]
H = np.zeros((N, 2))
C = np.zeros((N, 2))
vl = sorted(z.get("vlozky", []), key=lambda v: v["t"])
hranice = [z.get("od", 0)] + [v["t"] for v in vl] + [z.get("do", delka)]
posun = 0.0
for k in range(len(hranice) - 1):
    a_, b_ = hranice[k] - z.get("od", 0), hranice[k + 1] - z.get("od", 0)
    kus = hlas[int(a_ * SR): int(b_ * SR)].copy()
    m = min(len(kus), int(0.01 * SR))
    if m:
        kus[:m] *= np.linspace(0, 1, m)[:, None]
        kus[-m:] *= np.linspace(1, 0, m)[:, None]
    polozit(H, kus, a_ + posun)
    if k < len(vl):
        q = nacti(vl[k]["soubor"])
        m = int(0.03 * SR)
        q[:m] *= np.linspace(0, 1, m)[:, None]
        q[-m:] *= np.linspace(1, 0, m)[:, None]
        polozit(C, q, vl[k]["f"] / FPS)
        posun += vl[k]["n"] / FPS
lv = lufs(H)
hlas_rms = rms_db(H[np.abs(H).max(1) > 0.01])

# hudba 7 LU pod hlasem, bez duckingu, nasazení 0,25 s, konec 0,35 s
if z.get("hudbaOd") is None:
    cela = nacti(f"{HUDBA}/{z['hudba']}")
    e = (cela ** 2).mean(1)
    r = np.sqrt(e[: len(e) // SR * SR].reshape(-1, SR).mean(1))   # RMS po celých sekundách
    okna = [(od, r[od: od + int(delka) + 1].mean()) for od in range(10, max(11, len(r) - int(delka) - 2))]
    cil = np.percentile([v for _, v in okna], 75)
    z["hudbaOd"] = float(min(okna, key=lambda o: abs(o[1] - cil))[0])
    print("hudba od", z["hudbaOd"], "s")
hud = nacti(f"{HUDBA}/{z['hudba']}", z["hudbaOd"], z["hudbaOd"] + delka)
hud = hud[:N]
if STANDARD:
    hud *= 10 ** ((-24 - rms_db(hud[: int(15 * SR)])) / 20)
else:
    hud *= 10 ** ((lv - z.get("hudbaPod", 7) - lufs(hud)) / 20)
a, b = int(0.25 * SR), int(0.35 * SR)
hud[:a] *= np.linspace(0, 1, a)[:, None]
hud[-b:] *= np.linspace(1, 0, b)[:, None]
M = np.zeros((N, 2)); polozit(M, hud, 0)
# ztlumení hudby (pod citacemi a pointou s mluvící hlavou), náběhy 0,15 s
obal = np.ones(N)
for f0, f1, db in z.get("ztlum", []):
    a_, b_ = int(f0 / FPS * SR), int(f1 / FPS * SR)
    g = 10 ** (db / 20)
    r = int(0.15 * SR)
    obal[a_:b_] = np.minimum(obal[a_:b_], g)
    obal[max(0, a_ - r):a_] = np.minimum(obal[max(0, a_ - r):a_], np.linspace(1, g, a_ - max(0, a_ - r)))
    obal[b_:b_ + r] = np.minimum(obal[b_:b_ + r], np.linspace(g, 1, len(obal[b_:b_ + r])))
if STANDARD:   # sidechain jako ve všech reelech: obálka hlasu s podržením 0,8 s, pod hlasem -6 dB, pod citacemi -10 dB
    from scipy.ndimage import maximum_filter1d
    hm = np.abs(H).max(1); env = maximum_filter1d(np.convolve(hm, np.ones(int(0.05 * SR)) / int(0.05 * SR), "same"), int(0.8 * SR))
    duck = np.where(env > 0.02, 10 ** (-6 / 20), 1.0)
    cm = np.abs(C).max(1); duck[cm > 1e-4] = np.minimum(duck[cm > 1e-4], 10 ** (-10 / 20))
    obal = np.minimum(obal, np.convolve(duck, np.ones(int(0.8 * SR)) / int(0.8 * SR), "same"))
M *= obal[:, None]
# citace hlasitostí na úroveň vypravěče +3 LU (DdsC: citace o 3 až 4 LU hlasitější)
if np.abs(C).max() > 0:
    C *= 10 ** ((lv + (0 if STANDARD else 3) - lufs(C[np.abs(C).max(1) > 1e-4])) / 20)

# efekty
E = np.zeros((N, 2))
sub, nabeh = sub_odhaleni()
sub *= 10 ** ((hlas_rms - 3 - rms_db(sub[: int(0.6 * SR)])) / 20)
for f in z.get("suby", []):
    polozit(E, sub, f / FPS - nabeh)
for i, g in enumerate(plan.get("glitche", [])):
    p = praskani(g.get("n", 3), seed=i)
    p *= 10 ** ((hlas_rms - 21 - rms_db(p)) / 20)
    polozit(E, p, g["f"] / FPS)

# SFX z knihovny: (soubor, špička v dBFS před normalizací, kde je hlas kolem -13,5 LUFS)
SFX = f"{ROOT}/sfx/zaklad"
UROVEN = {"roztah": -23, "klik1": -24, "klik2": -24, "klik4": -21, "zaverka": -19, "pop": -17, "kick": -19, "svih_vitr": -30, "cisla": -21}
_cache = {}


def sfx(jm):
    if jm not in _cache:
        x = nacti(f"{SFX}/{jm}.wav")
        a = np.abs(x).max(1)
        nastup = int(np.argmax(a > a.max() * 0.1))
        x = x / a.max() * 10 ** (UROVEN[jm] / 20)
        _cache[jm] = (x, nastup / SR)
    return _cache[jm]


DEITH = f"{ROOT}/sfx/deith"


def _mp3(cesta):
    tmp = "/tmp/_lumi_sfx.wav"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", cesta, "-ar", str(SR), "-ac", "2", tmp], check=True)
    return nacti(tmp)


def roztah(snimku):
    """Mechanické cvakání po dobu roztažení (Štěpán: wheel clicking). Kroky po 2 snímcích sedí na takt 12 fps."""
    n = int(max(snimku, 3) / FPS * SR)
    if ROZTAH in ("cog", "gears"):
        x = _mp3(f"{DEITH}/cog-wheel-83386.mp3") if ROZTAH == "cog" else _mp3(f"{DEITH}/Gears.wav")
        x = x[int(0.05 * SR): int(0.05 * SR) + n].copy()
        f = min(len(x), int(0.05 * SR))
        x[-f:] *= np.linspace(1, 0, f)[:, None]
    else:
        if ROZTAH == "tik":
            src = _mp3(f"{DEITH}/Clock Ticking Sound Effect.mp3")
            a = np.abs(src).max(1)
            i = int(np.argmax(a > a.max() * 0.5)) - int(0.004 * SR)
            jeden = src[i: i + int(0.07 * SR)].copy()
        else:
            jeden = sfx("klik2")[0].copy()
        x = np.zeros((n + len(jeden) * 2, 2))
        kroku = max(2, snimku // 2)
        for k in range(kroku):
            # každý další cvak o kousek výš (zrychlené přehrání), jako kolečko, které se roztáčí
            rych = (1.35 if ROZTAH == "klik" else 1.0) * (1 + 0.035 * k)
            idx = np.arange(0, len(jeden) - 1, rych)
            c = np.stack([np.interp(idx, np.arange(len(jeden)), jeden[:, ch]) for ch in (0, 1)], axis=1)
            o = int(k * 2 / FPS * SR)
            x[o: o + len(c)] += c
    x = x / (np.abs(x).max() + 1e-9) * 10 ** (UROVEN["roztah"] / 20)
    return x


def q(f):
    """Snímek, kdy se událost opravdu ukáže po posterizaci taktu (držení d od začátku úseku)."""
    for f0, f1, d in plan.get("takt", []):
        if f0 <= f < f1:
            return f0 + -(-(f - f0) // d) * d
    return f


udalosti = []   # (snímek, zvuk)
for t in plan.get("texty", []):
    typ = t["typ"]
    if typ == "radek":
        if len(t["slova"]) == 1:
            udalosti.append((t["slova"][0][1], "klik4"))
        else:
            udalosti += [(w[1], "klik1" if j % 2 == 0 else "klik2") for j, w in enumerate(t["slova"])]
    elif typ == "blok":
        udalosti += [(r[1], "klik1" if j % 2 == 0 else "klik2") for j, r in enumerate(t["radky"])]
    elif typ == "stitek":
        udalosti += [(c[2], "klik4" if j == 0 else "klik1") for j, c in enumerate(t["casti"])]
    elif typ in ("box",):
        udalosti.append((t["f"], ("roztah", 2 * len(t.get("kroky", [0] * 6)))))
    elif typ == "obri":
        udalosti.append((t["f"], "pop"))
    elif typ == "citac":
        udalosti.append((t["kroky"][0][0], "cisla"))
    elif typ == "outro":
        udalosti.append((t["f"], "kick"))
for sc in plan["sceny"]:
    for k in sc.get("karty", []):
        udalosti.append((k["f"], "zaverka"))
    r = sc.get("serie")
    if r:
        udalosti += [(r["f"] + j * r["krok"], "zaverka" if j % 2 == 0 else "klik4") for j in range(len(r["obrazy"]))]
    for o in sc.get("okna", []):
        udalosti += [(f, ("roztah", 4)) for f, _ in o.get("skoky", []) if f > sc["f0"]]
    z_ = sc.get("zavorky")
    if z_:
        udalosti += [(f, ("roztah", d)) for f, d, *_ in z_.get("rust", [])]
    v = sc.get("vyrez")
    if v:
        udalosti.append((sc["f0"] + v["pan"][2], "svih_vitr"))
        udalosti.append((sc["f0"] + v["pan"][3], "kick"))

# ve stejném snímku jen jeden zvuk (přednost má výraznější)
PORADI = ["pop", "roztah", "kick", "zaverka", "cisla", "klik4", "svih_vitr", "klik1", "klik2"]
klic = lambda jm: jm[0] if isinstance(jm, tuple) else jm
po_snimku = {}
for f, jm in udalosti:
    f = q(f)
    if f not in po_snimku or PORADI.index(klic(jm)) < PORADI.index(klic(po_snimku[f])):
        po_snimku[f] = jm
for f, jm in sorted(po_snimku.items()):
    if isinstance(jm, tuple):
        polozit(E, roztah(jm[1]), f / FPS)
        continue
    x, nastup = sfx(jm)
    # švih má vrchol 0,4 s po začátku: vrchol na snímek, ostatní nástupem na snímek
    posun = 0.4 if jm == "svih_vitr" else nastup
    polozit(E, x, f / FPS - posun)
print(len(po_snimku), "SFX, roztah =", ROZTAH, ":", ", ".join(f"{f}:{klic(j)}" for f, j in sorted(po_snimku.items())))

if STANDARD: H, C = H * 10 ** (-5.5 / 20), C * 10 ** (-5.5 / 20)
mix = H + C + M + E
mix *= 10 ** (((-14.0 if STANDARD else -14.6) - lufs(mix)) / 20)
sf.write("/tmp/_lumi_mix.wav", mix, SR)
out = VYSTUP
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", "/tmp/_lumi_mix.wav", "-af", "alimiter=limit=" + ("0.84" if STANDARD else "0.89") + ":attack=1:release=60:level=disabled", "-ar", str(SR), out], check=True)
x, _ = sf.read(out, always_2d=True)
print(out, f"hlas {lv:.1f} LUFS, hudba {lv - z.get('hudbaPod', 7):.1f}, mix {lufs(x):.1f} LUFS, špička {20 * np.log10(np.abs(x).max()):.1f} dBFS")
