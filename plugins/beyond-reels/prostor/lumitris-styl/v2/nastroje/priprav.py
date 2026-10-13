# Příprava médií pro Lumitris v2 (4:3, 1440x1080, 24 fps): výřezy klipů, zmrazení, fotky karet, výřezy postav s rastrem a nálepky
# python3 -I nastroje/priprav.py   (spouštět z lumitris-styl/v2)
import os, subprocess
import cv2
import numpy as np

# zdrojové cesty (klipy, fotky, zvuky) bere z plánu (priprava.*), smí mít ~ i $BR_REELY; nic reelu v něm napevno není
cesta = lambda p: os.path.expandvars(os.path.expanduser(p))
OUT_M, OUT_I = "assets/media", "assets/img"
FPS = 24


def klip(jmeno, src, od, snimku, cropx=None, zmraz_od=None, scale=None):
    """Vyřízne klip do 1440x1080 24 fps. cropx = levý okraj výřezu 4:3 ze zdroje 1920x1080, zmraz_od = od kolikátého snímku držet."""
    vf = []
    if scale:
        vf.append(scale)
    elif cropx is not None:
        vf.append(f"crop=1440:1080:{cropx}:0")
    vf.append(f"fps={FPS}")
    if zmraz_od is not None:
        vf.append(f"trim=end_frame={zmraz_od},tpad=stop_mode=clone:stop={snimku - zmraz_od}")
    vf.append("setsar=1")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{od:.4f}", "-i", src, "-an", "-vf", ",".join(vf),
                    "-frames:v", str(snimku), "-c:v", "libx264", "-crf", "14", "-pix_fmt", "yuv420p", "-g", "12",
                    f"{OUT_M}/{jmeno}.mp4"], check=True)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", f"{OUT_M}/{jmeno}.mp4", "-frames:v", "1", "-q:v", "3",
                    f"{OUT_I}/{jmeno}_0.jpg"], check=True)


def foto(jmeno, src, maxd=1100):
    im = cv2.imread(src)
    s = maxd / max(im.shape[:2])
    if s < 1:
        im = cv2.resize(im, None, fx=s, fy=s, interpolation=cv2.INTER_AREA)
    cv2.imwrite(f"{OUT_I}/{jmeno}.jpg", im, [cv2.IMWRITE_JPEG_QUALITY, 90])


def alfa_z_bileho(im):
    """AI fotka na světlém pozadí: GrabCut ze zarámování tmavých pixelů (objekt), výsledek vyhladit."""
    g = cv2.cvtColor(im, cv2.COLOR_BGR2GRAY)
    ys, xs = np.where(g < 120)
    p = 30
    rect = (max(0, xs.min() - p), max(0, ys.min() - p), min(g.shape[1] - 1, xs.max() + p) - max(0, xs.min() - p),
            min(g.shape[0] - 1, ys.max() + p) - max(0, ys.min() - p))
    s = 0.5
    mal = cv2.resize(im, None, fx=s, fy=s, interpolation=cv2.INTER_AREA)
    m = np.zeros(mal.shape[:2], np.uint8)
    bg, fg = np.zeros((1, 65), np.float64), np.zeros((1, 65), np.float64)
    cv2.grabCut(mal, m, tuple(int(v * s) for v in rect), bg, fg, 6, cv2.GC_INIT_WITH_RECT)
    a = np.where((m == cv2.GC_FGD) | (m == cv2.GC_PR_FGD), 255, 0).astype(np.uint8)
    a = cv2.resize(a, (g.shape[1], g.shape[0]), interpolation=cv2.INTER_LINEAR)
    kont, _ = cv2.findContours((a > 127).astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    a = np.zeros_like(g)
    cv2.drawContours(a, [max(kont, key=cv2.contourArea)], -1, 255, -1)
    return cv2.GaussianBlur(a, (5, 5), 0)


def rastr(g, bunka=6.4):
    """Tiskový rastr: tečky podle tmavosti v mřížce 45°, smíchané s tónem, aby zůstala kresba."""
    h, w = g.shape
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    u = (xx + yy) / np.sqrt(2) / bunka
    v = (xx - yy) / np.sqrt(2) / bunka
    d = np.sqrt((u - np.round(u)) ** 2 + (v - np.round(v)) ** 2)  # 0 střed tečky, 0,7 roh
    tm = 1 - g.astype(np.float32) / 255
    tecka = (d < np.sqrt(tm) * 0.62).astype(np.float32)
    ht = 255 * (1 - tecka)
    return np.clip(0.55 * ht + 0.45 * g, 0, 255).astype(np.uint8)


def vyrez_na_barvu(jmeno, src, sirka=1300, alfa=None):
    im = cv2.imread(src, cv2.IMREAD_UNCHANGED)
    if im.shape[2] == 4:
        a, im = im[:, :, 3], im[:, :, :3]
    else:
        a = alfa_z_bileho(im)
    ys, xs = np.where(a > 20)
    y0, y1, x0, x1 = ys.min(), ys.max(), xs.min(), xs.max()
    im, a = im[y0:y1, x0:x1], a[y0:y1, x0:x1]
    s = sirka / im.shape[1]
    im = cv2.resize(im, None, fx=s, fy=s, interpolation=cv2.INTER_AREA)
    a = cv2.resize(a, (im.shape[1], im.shape[0]), interpolation=cv2.INTER_AREA)
    g = cv2.cvtColor(im, cv2.COLOR_BGR2GRAY)
    g = cv2.convertScaleAbs(g, alpha=1.25, beta=-18)
    r = rastr(g)
    cv2.imwrite(f"{OUT_I}/{jmeno}_rastr.png", np.dstack([r, r, r, a]))
    # barevná verze bez rastru a barevný tisk (rastr přes původní barvy) pro předměty, které se nepřebarvují
    cv2.imwrite(f"{OUT_I}/{jmeno}_barva.png", np.dstack([im, a]))
    # rastr z kontrastní šedi jako u ČB verze, mezery mezi tečkami prosvětlené, aby tisk byl vidět i na tmavé karoserii
    ht = rastr(g).astype(np.float32)[:, :, None] / 255
    tisk = np.clip(im.astype(np.float32) * (0.55 + 0.45 * ht) + 46 * ht, 0, 255).astype(np.uint8)
    cv2.imwrite(f"{OUT_I}/{jmeno}_tisk.png", np.dstack([tisk, a]))
    # šedá posunutá kopie siluety za postavou
    st = np.full_like(r, 120)
    cv2.imwrite(f"{OUT_I}/{jmeno}_stin.png", np.dstack([st, st, st, (a * 0.85).astype(np.uint8)]))
    return im, a


def nalepka(jmeno, src, vyska=900, obrys=26, barva=(52, 44, 45)):
    """Nálepka: hranatý polygonový obrys jako stříhaný papír (Dd6 976), ne hladký offset."""
    im = cv2.imread(src, cv2.IMREAD_UNCHANGED)
    a, im = im[:, :, 3], im[:, :, :3]
    ys, xs = np.where(a > 20)
    im, a = im[ys.min():ys.max(), xs.min():xs.max()], a[ys.min():ys.max(), xs.min():xs.max()]
    s = vyska / im.shape[0]
    im = cv2.resize(im, None, fx=s, fy=s, interpolation=cv2.INTER_AREA)
    a = cv2.resize(a, (im.shape[1], im.shape[0]), interpolation=cv2.INTER_AREA)
    p = obrys + 10
    im = cv2.copyMakeBorder(im, p, p, p, p, cv2.BORDER_CONSTANT, value=0)
    a = cv2.copyMakeBorder(a, p, p, p, p, cv2.BORDER_CONSTANT, value=0)
    rozs = cv2.dilate((a > 40).astype(np.uint8) * 255, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (obrys * 2, obrys * 2)))
    kont, _ = cv2.findContours(rozs, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    kont = max(kont, key=cv2.contourArea)
    poly = cv2.approxPolyDP(kont, 9, True)
    plocha = np.zeros_like(a)
    cv2.fillPoly(plocha, [poly], 255)
    out = np.zeros((*a.shape, 4), np.uint8)
    out[:, :, :3] = barva
    out[:, :, 3] = plocha
    af = a[:, :, None] / 255.0
    out[:, :, :3] = (im * af + out[:, :, :3] * (1 - af)).astype(np.uint8)
    cv2.imwrite(f"{OUT_I}/{jmeno}_nalepka.png", out)


def klip2(jmeno, src, od, snimku, orez="stred", zmraz_od=None):
    """orez: "stred" (16:9 na 4:3 ze středu), číslo (levý okraj výřezu z 1920x1080), "vyska" (zachovat poměr, výška 1080), nebo vlastní vf"""
    if orez == "stred":
        vf = "scale=-2:1080,crop=1440:1080"
    elif isinstance(orez, (int, float)):
        vf = f"scale=1920:1080,crop=1440:1080:{orez}:0"
    elif orez == "vyska":
        vf = "scale=-2:1080"
    else:
        vf = orez
    klip(jmeno, src, od, snimku, scale=vf, zmraz_od=zmraz_od)


def zvuk_vyrez(jmeno, src, od, do):
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{od:.4f}", "-to", f"{do:.4f}", "-i", src, "-vn", "-ac", "2", "-ar", "48000",
                    f"{OUT_M}/{jmeno}.wav"], check=True)


if __name__ == "__main__":
    import json, sys
    os.makedirs(OUT_M, exist_ok=True)
    os.makedirs(OUT_I, exist_ok=True)
    znovu = "--znovu" in sys.argv
    plan = json.load(open(f"plany/{sys.argv[1]}.json"))
    pr = plan.get("priprava", {})
    hotovo = lambda cesta: os.path.exists(cesta) and not znovu
    for j, src, od, n, orez, *zm in pr.get("klipy", []):
        if not hotovo(f"{OUT_M}/{j}.mp4"):
            klip2(j, cesta(src), od, n, orez, zm[0] if zm else None)
    for j, src in pr.get("fotky", []):
        if not hotovo(f"{OUT_I}/{j}.jpg"):
            foto(j, cesta(src))
    for j, src, sirka in pr.get("vyrezy", []):
        if not hotovo(f"{OUT_I}/{j}_tisk.png"):
            vyrez_na_barvu(j, cesta(src), sirka=sirka)
    for j, src, vyska in pr.get("nalepky", []):
        if not hotovo(f"{OUT_I}/{j}_nalepka.png"):
            nalepka(j, cesta(src), vyska=vyska)
    for j, src, od, do in pr.get("zvuky", []):
        if not hotovo(f"{OUT_M}/{j}.wav"):
            zvuk_vyrez(j, cesta(src), od, do)
    print("hotovo", {k: len(v) for k, v in pr.items()})
