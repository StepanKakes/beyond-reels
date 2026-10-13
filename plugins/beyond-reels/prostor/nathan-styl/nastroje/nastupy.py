"""Skutečné nástupy slov z průběhu hlasitosti hlasu (Štěpán 12. 10.: titulky nesedí přesně na to, kdy to řeknu).
Přepis má začátky slov u pětiny slov o 80 až 145 ms pozdě. Nástup = první místo 12 dB nad dolíkem před slovem,
hledá se 150 ms před až 150 ms po čase z přepisu; jinde zůstane čas přepisu. -> plany/<nazev>_nastupy.json
python nastroje/nastupy.py scenare/heaton.json"""
import json, os, sys
import numpy as np, soundfile as sf
KOREN = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sc = json.load(open(sys.argv[1]))
S = json.load(open(sc["slova"]))["slova"]
x, sr = sf.read(sc["hlas"])
x = x if x.ndim == 1 else x.mean(1)
h = int(0.005 * sr)
db = 20 * np.log10(np.sqrt(np.convolve(x ** 2, np.ones(4 * h) / (4 * h), "same"))[::h] + 1e-7)
dno = np.percentile(db, 5)
out, zmen = [], 0
for i, w in enumerate(S):
    t = w["t"]
    k = int(t / 0.005)
    lo0 = max(0, k - 30, int(S[i - 1]["t"] / 0.005) + 8 if i else 0)
    a = db[lo0:k + 30]
    if len(a) > 10:
        lo = int(np.argmin(a[:max(1, k - lo0 + 6)]))
        if a[lo] < dno + 14:
            r = np.argmax(a[lo:] > a[lo] + 12)
            if r:
                t2 = (lo0 + lo + r) * 0.005
                if abs(t2 - t) <= 0.15:
                    zmen += abs(t2 - t) > 0.03
                    t = t2
    out.append(round(t, 3))
json.dump(out, open(os.path.join(KOREN, f"plany/{sc['nazev']}_nastupy.json"), "w"))
print("nástupy slov:", len(out), "upraveno", zmen)
