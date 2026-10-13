"""Standardní mix reelu Beyond (schválený u Dalena 4. 10. 2026, platí pro všechny styly):
studio hlas bez dalšího vyrovnání -5,5 dB, hudba -24 dB RMS se sidechainem -6 dB (obálka s podržením 0,8 s),
pod citacemi cizích klipů hudba -10 dB a jejich originální zvuk srovnaný na úroveň hlasu, SFX navrch, celek -14 LUFS / -1,5 dBTP.

$PY $BR_PROSTOR/tools/mix.py mix.json
mix.json (časy v sekundách reelu):
{
  "delka": 45.2,
  "hlas": "zdroj/hlas_studio.wav",                 výstup studio_hlas.py, čas 0 = začátek reelu
  "klipy": [{"od": 30.5, "do": 32.4, "zdroj": "assets/media/telo.mp4"}],   citace: zvuk z tohoto souboru ve stejném čase
  "hudba": {"soubor": "hudba/she-will-instrumental.wav" (z $BR_HUDBA, výběr v katalog.json), "od": 0, "uroven_z": 15, "krivka": [[0, 0], [20, -4]]},
  "sfx": [[1.2, "zaverka", -28], [2.0, "klik1", -31]],   název z sfx/zaklad nebo cesta k wav, hlasitost v dB
  "sfx_slozka": "sfx/zaklad",                       relativně k prostoru pluginu (BR_PROSTOR), když název není cesta
  "vystup": "assets/media/mix.wav"
}
uroven_z: z kolika prvních sekund hudby se měří RMS (refrén nesmí srovnat celý song), krivka: ruční úpravy hudby v dB.
Konvence hlasitostí SFX jako v reelech Dalen a Heaton: kliky +3 dB, svihF -8 dB, vše +6 dB nad zapsanou hodnotu."""
import json, os, subprocess, sys, numpy as np, soundfile as sf
from scipy.ndimage import maximum_filter1d
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'zvuk')); import v4_dsp as D

SR = 48000; db = lambda x: 10 ** (x / 20)
PROSTOR = os.environ.get('BR_PROSTOR') or os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def load(p, af=None):
    r = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '1', '-ar', str(SR)] + (['-af', af] if af else []) + ['-f', 'f32le', '-'], capture_output=True, check=True)
    return np.frombuffer(r.stdout, np.float32).astype(float)
def cesta(p):   # absolutní, relativní k projektu, "hudba/<soubor>" z balíku médií (BR_HUDBA), jinak z prostoru pluginu
    if os.path.isabs(p) or os.path.exists(p): return p
    if p.startswith('hudba/') and os.environ.get('BR_HUDBA'): return os.path.join(os.environ['BR_HUDBA'], p[6:])
    return os.path.join(PROSTOR, p)

c = json.load(open(sys.argv[1])); N = int(c['delka'] * SR)
fit = lambda x: np.pad(x, (0, max(0, N - len(x))))[:N]

# hlas a citace
v = fit(load(c['hlas']))
rms = lambda x: np.sqrt(np.mean(x[np.abs(x) > 0.01] ** 2)) if np.any(np.abs(x) > 0.01) else 1.0
for k in c.get('klipy', []):
    a, b = int(k['od'] * SR), int(k['do'] * SR); z = fit(load(k['zdroj'], 'highpass=f=80'))
    v[a:b] = z[a:b] / rms(z[a:b]) * rms(v) * 0.9
v = v * db(-5.5)

# SFX
sfx = np.zeros(N); slozka = cesta(c.get('sfx_slozka', 'sfx/zaklad'))
for t, n, g in c.get('sfx', []):
    p = n if n.endswith('.wav') else os.path.join(slozka, n + '.wav')
    if n.startswith('klik'): g += 3
    if n == 'svihF': g -= 8
    x = load(p); x = x / np.abs(x).max() * db(-1 + g + 12); i = max(0, int(t * SR)); x = x[:N - i]; sfx[i:i + len(x)] += x

# hudba se sidechainem
h = c.get('hudba')
m = np.zeros(N)
if h:
    cela = load(cesta(h['soubor'])); o = int(h.get('od', 0) * SR)
    ref = cela[o:o + int(h.get('uroven_z', 15) * SR)]
    m = fit(cela[o:]) / np.sqrt((ref ** 2).mean()) * db(-24)
    if h.get('krivka'): k = np.array(h['krivka'], float); m = m * db(np.interp(np.arange(N) / SR, k[:, 0], k[:, 1]))
    env = maximum_filter1d(np.convolve(np.abs(v), np.ones(int(0.05 * SR)) / int(0.05 * SR), 'same'), int(0.8 * SR))
    duck = np.where(env > 0.02, db(-6), 1.0)
    for k in c.get('klipy', []): duck[int(k['od'] * SR):int(k['do'] * SR)] = db(-10)
    duck = np.convolve(duck, np.ones(int(0.8 * SR)) / int(0.8 * SR), 'same')
    fade = np.ones(N); fade[-int(0.8 * SR):] = np.linspace(1, 0, int(0.8 * SR))
    m = m * duck * fade

y, I, tp = D.to_loudness(m + sfx + v, -14.0, -1.5)
os.makedirs(os.path.dirname(c['vystup']) or '.', exist_ok=True)
sf.write(c['vystup'], np.stack([y, y], 1).astype(np.float32), SR, subtype='PCM_24')
print('mix', c['vystup'], 'LUFS', round(I, 1), 'TP', round(tp, 1), 'SFX', len(c.get('sfx', [])))
