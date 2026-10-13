"""DSP pro voice_v4: potlačení pozdního dozvuku, mastering (nulový posun: nulofázový EQ, gain obálky bez zpoždění,
limiter s výhledem, který se aplikuje na stejné vzorky). Vše mono 48 kHz, délka výstupu = délka vstupu."""
import re, subprocess, numpy as np, soundfile as sf, scipy.signal as sg
from scipy.ndimage import uniform_filter, minimum_filter1d, uniform_filter1d

SR = 48000

# ---------- potlačení pozdního dozvuku (Lebart, jednokanálově) ----------
def late_suppress(x, sr=SR, t60=0.45, tl=0.05, alpha=1.6, gmin=0.18, nper=1024, hop=256, smooth_f=5, smooth_t=3):
    f, t, Y = sg.stft(x, sr, window='hann', nperseg=nper, noverlap=nper - hop, boundary='zeros', padded=True)
    P = np.abs(Y) ** 2
    Ps = uniform_filter(P, size=(3, 3), mode='nearest')
    d = int(round(tl / (hop / sr)))
    decay = np.exp(-2 * (3 * np.log(10) / t60) * tl)
    L = np.zeros_like(Ps); L[:, d:] = decay * Ps[:, :-d]
    G = np.maximum(1 - alpha * L / (Ps + 1e-12), gmin)
    G = uniform_filter(G, size=(smooth_f, smooth_t), mode='nearest')
    return sg.istft(Y * G, sr, window='hann', nperseg=nper, noverlap=nper - hop, boundary=True)[1][:len(x)]

# ---------- nulofázový parametrický EQ ----------
def _peq_sos(f0, gain_db, q, sr=SR):
    A = 10 ** (gain_db / 40); w0 = 2 * np.pi * f0 / sr; al = np.sin(w0) / (2 * q); c = np.cos(w0)
    b = [1 + al * A, -2 * c, 1 - al * A]; a = [1 + al / A, -2 * c, 1 - al / A]
    return np.array([[b[0] / a[0], b[1] / a[0], b[2] / a[0], 1, a[1] / a[0], a[2] / a[0]]])
def _shelf_sos(f0, gain_db, kind, sr=SR, S=0.8):
    A = 10 ** (gain_db / 40); w0 = 2 * np.pi * f0 / sr; c = np.cos(w0); s = np.sin(w0)
    al = s / 2 * np.sqrt((A + 1 / A) * (1 / S - 1) + 2); r = 2 * np.sqrt(A) * al
    if kind == 'low':
        b = [A * ((A + 1) - (A - 1) * c + r), 2 * A * ((A - 1) - (A + 1) * c), A * ((A + 1) - (A - 1) * c - r)]
        a = [(A + 1) + (A - 1) * c + r, -2 * ((A - 1) + (A + 1) * c), (A + 1) + (A - 1) * c - r]
    else:
        b = [A * ((A + 1) + (A - 1) * c + r), -2 * A * ((A - 1) + (A + 1) * c), A * ((A + 1) + (A - 1) * c - r)]
        a = [(A + 1) - (A - 1) * c + r, 2 * ((A - 1) - (A + 1) * c), (A + 1) - (A - 1) * c - r]
    return np.array([[b[0] / a[0], b[1] / a[0], b[2] / a[0], 1, a[1] / a[0], a[2] / a[0]]])
def zp_eq(x, bands, hp=None):
    """bands: [('peq',f,gain_dB,Q) | ('low',f,gain) | ('high',f,gain)]. Nulofázově: filtfilt = |H|^2, proto gain/2."""
    y = x
    if hp: y = sg.sosfiltfilt(sg.butter(2, hp, 'hp', fs=SR, output='sos'), y)
    for b in bands:
        if b[0] == 'peq': sos = _peq_sos(b[1], b[2] / 2, b[3])
        else: sos = _shelf_sos(b[1], b[2] / 2, b[0])
        y = sg.sosfiltfilt(sos, y)
    return y

# ---------- obálkové zpracování (rámce 2 ms, gain se interpoluje na vzorky) ----------
FR = 96
def _frame_db(x):
    n = len(x) // FR; p = (x[:n * FR].reshape(n, FR) ** 2).mean(1) + 1e-12
    return 10 * np.log10(p)
def _apply_gain_db(x, g_db):
    n = len(g_db); t_f = (np.arange(n) + 0.5) * FR; g = np.interp(np.arange(len(x)), t_f, g_db)
    return x * 10 ** (g / 20)
def _smooth_gain(target, att, rel):
    ta = np.exp(-1 / (att * SR / FR)); tr = np.exp(-1 / (rel * SR / FR)); g = np.zeros(len(target)); s = 0.0
    for i, v in enumerate(target):
        c = ta if v < s else tr      # gain jde dolů = útok
        s = c * s + (1 - c) * v; g[i] = s
    return g
def compress(x, thr_db=-20, ratio=2.2, att=0.008, rel=0.14, knee=4):
    L = _frame_db(x); over = L - thr_db
    red = np.where(over <= -knee / 2, 0, np.where(over >= knee / 2, over * (1 - 1 / ratio), (over + knee / 2) ** 2 / (2 * knee) * (1 - 1 / ratio)))
    g = _smooth_gain(-red, att, rel)
    return _apply_gain_db(x, g)
def expand(x, thr_db, ratio=1.6, range_db=12, att=0.004, rel=0.12):
    """Jemný downward expander: zkracuje ocasy dozvuku v mezerách."""
    L = _frame_db(x); under = np.minimum(L - thr_db, 0)
    g = np.maximum(under * (ratio - 1), -range_db)
    g = _smooth_gain(g, att, rel)
    return _apply_gain_db(x, g)
def deess(x, lo=5500, hi=9500, ratio=3.5, above_db=-3):
    bp = sg.butter(4, [lo, hi], 'bp', fs=SR, output='sos'); sib = sg.sosfiltfilt(bp, x)
    Ls = _frame_db(sib); Lb = _frame_db(x)
    act = Lb > Lb.max() - 35
    thr = np.percentile(Ls[act], 90) + above_db
    red = np.maximum(Ls - thr, 0) * (1 - 1 / ratio)
    g = _smooth_gain(-red, 0.002, 0.03)
    gs = np.interp(np.arange(len(x)), (np.arange(len(g)) + 0.5) * FR, g)
    return x - sib * (1 - 10 ** (gs / 20))

# ---------- hlasitost a limiter ----------
def lufs_tp(x):
    xc = np.clip(x, -1, 1); sf.write('/tmp/_v4_m.wav', np.stack([xc, xc], 1), SR, subtype='FLOAT')  # dual mono stereo, jako výsledný soubor
    m = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', '/tmp/_v4_m.wav', '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
    return float(re.findall(r'I:\s+(-?[\d.]+) LUFS', m)[-1]), float(re.findall(r'Peak:\s+(-?[\d.]+) dBFS', m)[-1])
def limit(x, ceiling_db, look=0.004):
    c = 10 ** (ceiling_db / 20); L = int(look * SR)
    g = np.minimum(1, c / (np.abs(x) + 1e-12))
    g = minimum_filter1d(g, size=2 * L + 1, mode='nearest')
    g = uniform_filter1d(g, size=L + 1, mode='nearest')
    return x * g
def to_loudness(x, target=-14.0, tp_max=-1.5):
    ceil = tp_max - 0.3; y = x
    for _ in range(14):
        I, tp = lufs_tp(y)
        if abs(I - target) < 0.03 and tp <= tp_max: return y, I, tp
        if tp > tp_max: ceil -= (tp - tp_max) + 0.02
        y = limit(y * 10 ** ((target - I) / 20), ceil)
    I, tp = lufs_tp(y)
    return y, I, tp

# ---------- mastering ----------
EQ_DEEP = [('peq', 115, 5.3, 0.9), ('peq', 175, 1.8, 1.2), ('low', 70, 1.0), ('peq', 350, -5.5, 0.7), ('peq', 620, -2.5, 1.0),
           ('peq', 3200, 2.4, 0.9), ('peq', 5000, 1.8, 1.0), ('high', 10000, 1.0)]
def _speech_db(y):
    Lf = _frame_db(y); ref = Lf[Lf > Lf.max() - 30]
    return 10 * np.log10((10 ** (ref / 10)).mean())
def master(x, eq=EQ_DEEP, hp=62, comp=(4, 2.3, 0.008, 0.14), exp=(7, 2.2, 16), ds=True, target=-14.0, tp_max=-1.5):
    """comp = (práh pod úrovní řeči dB, ratio, útok s, uvolnění s); exp = (odstup dB pod řečí, ratio, range dB).
    Pořadí: EQ, kompresor, expander (zkrátí ocasy, které kompresor vytáhl), de-esser, hlasitost + limiter."""
    y = zp_eq(x, eq, hp)
    if comp: y = compress(y, thr_db=_speech_db(y) - comp[0], ratio=comp[1], att=comp[2], rel=comp[3])
    if exp is not None: y = expand(y, _speech_db(y) - exp[0], ratio=exp[1], range_db=exp[2])
    if ds: y = deess(y)
    return to_loudness(y, target, tp_max)
