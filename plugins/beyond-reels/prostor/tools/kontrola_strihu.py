"""Kontrola hran střihu hlasu podle průběhu hlasitosti (Tim 12. 10. 2026: whisper nikdy není na 100 %, slova se nesmí usekávat).
Pro každou hranu kusu změří hlasitost 30 ms na hraně proti hlasitosti řeči okolo. Hrana v řeči = slovo je useknuté.
U podezřelé hrany najde nejtišší místo do 0,15 s a navrhne posun.

Použití (platí pro každý reel):
  python3 tools/kontrola_strihu.py ZDROJ.mp4 zdroj/kusy.json            # kusy.json: [{"text", "kusy": [[od, do], ...]}, ...]
  python3 tools/kontrola_strihu.py ZDROJ.mp4 '[[12.9, 16.96], [17.7, 20.62]]'
Návratový kód 1, když je nějaká hrana podezřelá. Střih pak oprav a spusť znovu, dokud neprojde."""
import json, subprocess, sys, numpy as np

SR, KROK = 16000, 0.005

def hlasitost(src):
    r = subprocess.run(['ffmpeg', '-v', 'error', '-i', src, '-vn', '-ac', '1', '-ar', str(SR), '-af', 'highpass=f=120,lowpass=f=6000', '-f', 'f32le', '-'], capture_output=True)
    a = np.frombuffer(r.stdout, np.float32).astype(float)
    h = int(KROK * SR)
    return 20 * np.log10(np.sqrt(np.convolve(a ** 2, np.ones(h) / h, 'same'))[::h] + 1e-9)

def kontrola(src, kusy, rozdil=16.0):
    db = hlasitost(src); i = lambda t: int(round(t / KROK)); spatne = 0
    for od, do, txt in kusy:
        okoli = db[max(0, i(od) - 200):i(do) + 200]
        rec = np.percentile(okoli, 95)
        for nazev, t, sm in (('začátek', od, 1), ('konec', do, -1)):
            # 30 ms uvnitř kusu u hrany
            u = db[i(t):i(t) + 6] if sm > 0 else db[i(t) - 6:i(t)]
            hl = float(np.max(u)) if len(u) else -99
            # řeč těsně u hrany (60 ms dovnitř) = useknuté slovo; jen zvýšená hrana bez řeči u ní je nádech nebo šum
            u2 = db[i(t):i(t) + 12] if sm > 0 else db[i(t) - 12:i(t)]
            blizko = float(np.max(u2)) if len(u2) else -99
            ok = hl < rec - rozdil or blizko < rec - 10
            radek = f'{"ok " if ok else "!! "} {nazev:7s} {t:8.3f}  hrana {hl:6.1f} dB, 60 ms {blizko:6.1f} dB, řeč {rec:6.1f} dB  {txt[:50]}'
            if not ok:
                spatne += 1
                w = db[i(t) - 30:i(t) + 30]; k = int(np.argmin(w))
                radek += f'\n      nejtišší místo {round(t + (k - 30) * KROK, 3)} s ({w[k]:.1f} dB), poslechni a posuň hranu tam'
            print(radek)
    print('hran podezřelých:', spatne)
    return spatne

if __name__ == '__main__':
    src, arg = sys.argv[1], sys.argv[2]
    if arg.endswith('.json'):
        kusy = [(x, y, p.get('text', '')) for p in json.load(open(arg)) for x, y in p['kusy']]
    else:
        kusy = [(x, y, '') for x, y in json.loads(arg)]
    sys.exit(1 if kontrola(src, kusy) else 0)
