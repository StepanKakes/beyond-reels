# Metriky písem Nathan kitu (line-height 1, letter-spacing v em) pro přesné umístění textu
# hn = Helvetica Neue Bold (-0,04 em velká, -0,03 em malá), kond = HN Bold verzálky, skript = Instrument Serif Italic
from PIL import ImageFont
import os
KOREN = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PISMA = {"hn": ("assets/fonts/HN-Bold.ttf", 0, -0.04), "male": ("assets/fonts/HN-Bold.ttf", 0, -0.03),
         # naše písma (Štěpán 12. 10.): verzálky nadpisů Helvetica Neue Bold místo Antonu, pointa Instrument Serif Italic místo Snell
         "kond": ("assets/fonts/HN-Bold.ttf", 0, -0.035), "skript": ("assets/fonts/InstrumentSerif-Italic.ttf", 0, -0.01)}
_c = {}


def font(druh, s):
    k = (druh, round(s, 1))
    if k not in _c:
        p, ix, _ = PISMA[druh]
        _c[k] = ImageFont.truetype(p if os.path.isabs(p) else os.path.join(KOREN, p), max(1, int(round(s))), index=ix)
    return _c[k]


def inkoust(text, druh="hn", s=100):
    """inkoust v souřadnicích boxu (line-height 1): x0, y0, x1, y1, šířka postupu"""
    if druh == "kond":
        text = text.upper()
    f = font(druh, s)
    ls = PISMA[druh][2] * s
    asc, desc = f.getmetrics()
    base = (s - (asc + desc)) / 2 + asc
    x, x0, y0, x1, y1 = 0, 1e9, 1e9, -1e9, -1e9
    for ch in text:
        if ch != " ":
            l, t, r, b = f.getbbox(ch, anchor="ls")
            x0, x1, y0, y1 = min(x0, x + l), max(x1, x + r), min(y0, base + t), max(y1, base + b)
        x += f.getlength(ch) + ls
    return x0, y0, x1, y1, x


def na_sirku(text, sirka, druh="hn", smin=110, smax=270):
    """fit to width (R4): velikost, aby inkoust měl danou šířku, v mezích"""
    a = inkoust(text, druh, 100)
    return max(smin, min(smax, 100 * sirka / max(1, a[2] - a[0])))
