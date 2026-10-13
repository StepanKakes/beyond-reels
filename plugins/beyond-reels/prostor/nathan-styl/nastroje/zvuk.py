# Zvuk Nathan videa podle Timova standardu: hlas (už studio_hlas) -5,5 dB, hudba -24 dB RMS se sidechainem -6 dB
# a podržením 0,8 s, SFX z návrhu generátoru (sub na obřích slovech, švih na glitchi, klik na štítku, závěrka na oknech),
# originální citace vložené do hlasu, úder a sub na outro, master -14 LUFS / -1,5 dBTP
# $PY nastroje/zvuk.py scenare/heaton.json
import json, os, subprocess, sys, numpy as np, soundfile as sf
from scipy.ndimage import maximum_filter1d
KOREN = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROSTOR = os.environ.get("BR_PROSTOR") or os.path.dirname(KOREN)
sys.path.insert(0, os.path.join(PROSTOR, "tools", "zvuk")); import v4_dsp as D

SFX = os.path.join(PROSTOR, "sfx", "zaklad", "{}.wav")
HUDBA = os.path.join(os.environ.get("BR_HUDBA") or os.path.join(PROSTOR, "hudba"), "{}.wav")
SR = 48000
db = lambda x: 10 ** (x / 20)


def nacti(p, od=None, delka=None, af=None):
    a = ["ffmpeg", "-v", "error"] + (["-ss", str(od)] if od is not None else []) + ["-i", p] + (["-t", str(delka)] if delka else [])
    a += ["-ac", "1", "-ar", str(SR)] + (["-af", af] if af else []) + ["-f", "f32le", "-"]
    return np.frombuffer(subprocess.run(a, capture_output=True).stdout, np.float32).copy()


sc = json.load(open(sys.argv[1]))
nazev = sc["nazev"]
navrh = json.load(open(os.path.join(KOREN, f"plany/{nazev}_navrh.json")))
N = int(navrh["delka"] / 30 * SR)

# hlas s citacemi: Tim pokračuje po citaci, citace srovnaná na hlasitost Tima o 1 dB níž, okraje 30 ms
v = nacti(sc["hlas"])
ref_rms = np.sqrt((v[int(10 * SR):int(40 * SR)] ** 2).mean())
out, b0 = [], 0.0
for c in sorted(sc.get("citace", []), key=lambda c: c["t"]):
    druh, zb = c["ref"].split(":", 1)
    src = sc["zdroje"][druh].format(zb.split("@")[0])
    out.append(v[int(b0 * SR):int(c["t"] * SR)])
    q = nacti(src, c["od"], c["do"] - c["od"], "highpass=f=90")
    q = np.pad(q, (0, max(0, int((c["do"] - c["od"]) * SR) - len(q))))[:int((c["do"] - c["od"]) * SR)]
    k = int(0.03 * SR); q[:k] *= np.linspace(0, 1, k); q[-k:] *= np.linspace(1, 0, k)
    q *= ref_rms / (np.sqrt((q ** 2).mean()) + 1e-9) * db(-1)
    out.append(q); b0 = c["t"]
out.append(v[int(b0 * SR):])
hlas = np.concatenate(out)
hlas = np.pad(hlas, (0, max(0, N - len(hlas))))[:N] * db(-5.5)

# hudba: tmavý podklad, -24 dB RMS, sidechain na hlas -6 dB s podržením 0,8 s, dojezd do outra
m = nacti(HUDBA.format(sc.get("hudba", "thom-yorke-dawn-chorus")), sc.get("hudba_od", 0))
m = np.pad(m, (0, max(0, N - len(m))))[:N]
m *= db(-24) / (np.sqrt((m[:int(20 * SR)] ** 2).mean()) + 1e-9)
env = maximum_filter1d(np.convolve(np.abs(hlas), np.ones(int(0.05 * SR)) / int(0.05 * SR), "same"), int(0.8 * SR))
duck = np.convolve(np.where(env > 0.02, db(-6), 1.0), np.ones(int(0.8 * SR)) / int(0.8 * SR), "same")
konec = int((navrh["outro"]["f0"] if navrh.get("outro") else navrh.get("konec_reci", navrh["delka"])) / 30 * SR)
fade = np.ones(N); fade[konec:] = np.linspace(1, 0, N - konec) if N > konec else 1
m = m * duck * fade

# vypnutí hudby (POHYB.md D.2): -16 dB s náběhem a doběhem 40 ms
for t0, t1 in navrh.get("ticho", []):
    g = np.ones(N); a, b = int(t0 * SR), min(N, int(t1 * SR)); k = int(0.04 * SR)
    g[a:b] = db(-16)
    g[max(0, a - k):a] = np.linspace(1, db(-16), a - max(0, a - k)); g[b:b + k] = np.linspace(db(-16), 1, len(g[b:b + k]))
    m = m * g

# SFX z návrhu (POHYB.md F): úroveň vůči hlasu (špička, nebo RMS u sub dopadů), zpracování filtrem ffmpeg
sfx = np.zeros(N)
zn = np.abs(hlas) > 0.01
spicka_hlasu = np.percentile(np.abs(hlas[zn]), 99.9) if zn.any() else 0.3
rms_hlasu = np.sqrt((hlas[zn] ** 2).mean()) if zn.any() else 0.05
for z in navrh["zvuky"]:
    af = []
    if z.get("pitch"):
        af.append(f"asetrate={SR}*{2 ** (z['pitch'] / 12):.5f},aresample={SR}")
    if z.get("hp"): af.append(f"highpass=f={z['hp']}")
    if z.get("lp"): af.append(f"lowpass=f={z['lp']}")
    if z.get("fadein"): af.append(f"afade=t=in:d={z['fadein']:.3f}")
    x = nacti(SFX.format(z["jm"]), z.get("od"), None, ",".join(af) or None)
    if z.get("delka"):
        x = x[:int(z["delka"] * SR)]
    if z.get("fadeout") and len(x):
        k = min(len(x), int(z["fadeout"] * SR)); x[-k:] *= np.linspace(1, 0, k)
    if z.get("pasmo_hlasu"):
        x = x / (np.sqrt((x ** 2).mean()) + 1e-9) * rms_hlasu * db(z["rel"])
    else:
        x = x / (np.abs(x).max() + 1e-9) * spicka_hlasu * db(z["rel"])
    i = max(0, int(z["t"] * SR)); x = x[:N - i]
    sfx[i:i + len(x)] += x

y, I, tp = D.to_loudness(hlas + m + sfx, -14.0, -1.5)
cil = os.path.join(KOREN, f"assets/media/{nazev}_mix.wav")
sf.write(cil, np.stack([y, y], 1).astype(np.float32), SR, subtype="PCM_24")
print(cil, "LUFS", round(I, 1), "TP", round(tp, 1), "délka", round(N / SR, 2), "SFX", len(navrh["zvuky"]))
