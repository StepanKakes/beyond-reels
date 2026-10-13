#!/usr/bin/env python3
"""Kontrola renderu bez prohlížení obrázků: Mac přes Apple Vision přečte text a najde obličeje snímek po snímku,
skript z toho vyvodí chyby, Claude čte jen textový výsledek.

  $PY kontrola_renderu.py renders/reel-v3.mp4 [--krok 0.25] [--od 0] [--do 9999] [--texty src/texty.txt] [--json out.json]

Hlásí:
  OBLIČEJ   text leží přes obličej (pravidlo: titulek ani štítek nikdy přes obličej)
  OKRAJ     text se dotýká okraje snímku, nejspíš je uříznutý
  PŘES      dva texty se překrývají
  NEJISTÝ   text, který Vision čte s nízkou jistotou (rozmazaný, nečitelný, příliš malý)
  CHYBÍ     řádek ze souboru --texty, který se v renderu nenašel (překlep nebo vypadlé slovo)
a vypíše časovou osu textů, aby šly přečíst překlepy. Pozor: OCR občas ztratí diakritiku, překlep vždy ověř ve zdroji.
Výchozí hlídá jen text vyšší než 2,5 % snímku (titulky, nadpisy, štítky), --vse i drobné UI.
Snímky pro kontrolu očima zůstanou ve složce _kontrola vedle videa (jen když je hlášení potřeba vidět)."""
import argparse, json, os, re, shutil, subprocess, sys, unicodedata
from pathlib import Path

TU = Path(__file__).resolve().parent
BIN = Path.home() / ".cache/beyond-reels/bin/vision_snimky"


def vision(soubory):
    if not BIN.exists():
        BIN.parent.mkdir(parents=True, exist_ok=True)
        subprocess.run(["swiftc", "-O", str(TU / "vision_snimky.swift"), "-o", str(BIN)], check=True)
    out = []
    for i in range(0, len(soubory), 40):   # po dávkách, ať jeden proces nedrží stovky obrázků
        out += json.loads(subprocess.run([str(BIN), *soubory[i:i + 40]], capture_output=True, check=True).stdout)
    return out


def prunik(a, b):
    x0, y0 = max(a[0], b[0]), max(a[1], b[1]); x1, y1 = min(a[0] + a[2], b[0] + b[2]), min(a[1] + a[3], b[1] + b[3])
    return max(0, x1 - x0) * max(0, y1 - y0)


def norm(s):
    s = unicodedata.normalize("NFKD", s.lower()); s = "".join(c for c in s if not unicodedata.combining(c))
    return re.sub(r"[^a-z0-9]+", " ", s).strip()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("video"); ap.add_argument("--krok", type=float, default=0.25)
    ap.add_argument("--od", type=float, default=0); ap.add_argument("--do", type=float, default=1e9)
    ap.add_argument("--texty", help="soubor s řádky, které mají být v obraze (titulky, nadpisy)")
    ap.add_argument("--json"); ap.add_argument("--sirka", type=int, default=1280)
    ap.add_argument("--min-vyska", type=float, default=0.025, help="hlídá jen text vyšší než tento podíl výšky snímku (titulky, nadpisy); drobný text UI ignoruje")
    ap.add_argument("--vse", action="store_true", help="hlídat i drobný text")
    a = ap.parse_args()
    v = Path(a.video).resolve()
    delka = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(v)], capture_output=True, text=True).stdout)
    tmp = v.parent / f"_kontrola_{v.stem}"; shutil.rmtree(tmp, ignore_errors=True); tmp.mkdir()
    od, do = a.od, min(a.do, delka)
    subprocess.run(["ffmpeg", "-v", "error", "-ss", str(od), "-t", str(do - od), "-i", str(v), "-vf", f"fps=1/{a.krok},scale={a.sirka}:-2", "-q:v", "3", str(tmp / "s%05d.jpg")], check=True)
    snimky = sorted(str(p) for p in tmp.glob("s*.jpg"))
    data = vision(snimky)
    cas = lambda i: round(od + i * a.krok, 2)

    hlaseni, osa = [], []
    for i, d in enumerate(data):
        t, w, h = cas(i), d.get("w", 1), d.get("h", 1)
        tx = [x for x in d.get("texty", []) if len(x["t"].strip()) > 1 and (a.vse or x["box"][3] >= a.min_vyska * h)]
        for x in tx:
            b = x["box"]
            for f in d.get("obliceje", []):
                if prunik(b, f) > 0.15 * min(b[2] * b[3], f[2] * f[3]): hlaseni.append((t, "OBLIČEJ", x["t"]))
            m = 0.006
            if b[0] < m * w or b[1] < m * h or b[0] + b[2] > (1 - m) * w or b[1] + b[3] > (1 - m) * h: hlaseni.append((t, "OKRAJ", x["t"]))
            if x["jistota"] < 0.31 and x["box"][3] >= 0.04 * h: hlaseni.append((t, "NEJISTÝ", f'{x["t"]} ({x["jistota"]})'))
        for j in range(len(tx)):
            for k in range(j + 1, len(tx)):
                p, q = tx[j]["box"], tx[k]["box"]
                if prunik(p, q) > 0.2 * min(p[2] * p[3], q[2] * q[3]): hlaseni.append((t, "PŘES", f'{tx[j]["t"]}  ×  {tx[k]["t"]}'))
        osa.append((t, [x["t"] for x in tx]))

    # časová osa: souvislé výskyty stejného textu spojit do úseků
    useky, otevrene = [], {}
    for t, texty in osa + [(osa[-1][0] + a.krok if osa else 0, [])]:
        klice = {norm(s): s for s in texty if norm(s)}
        for k in list(otevrene):
            if k not in klice: s, t0, t1 = otevrene.pop(k); useky.append((t0, t1, s))
        for k, s in klice.items():
            if k in otevrene: otevrene[k][2] = t
            else: otevrene[k] = [s, t, t]
    useky.sort()

    # zhuštění hlášení: stejný druh a text v po sobě jdoucích snímcích jako jeden úsek
    sh = []
    for t, druh, text in sorted(hlaseni, key=lambda x: (x[1], x[2], x[0])):
        if sh and sh[-1][2] == druh and sh[-1][3] == text and t - sh[-1][1] <= a.krok * 1.5: sh[-1][1] = t
        else: sh.append([t, t, druh, text])
    sh.sort()

    chybi = []
    if a.texty:
        vse = " ".join(norm(s) for _, _, s in useky)
        for r in Path(a.texty).read_text().splitlines():
            if norm(r) and norm(r) not in vse: chybi.append(r.strip())

    print(f"KONTROLA {v.name}: {delka:.1f} s, {len(snimky)} snímků po {a.krok} s, {sum(len(d.get('obliceje', [])) > 0 for d in data)} snímků s obličejem")
    if not sh and not chybi: print("Bez nálezů.")
    for t0, t1, druh, text in sh[:80]: print(f"{druh:8s} {t0:6.2f}{'' if t1 == t0 else f' až {t1:.2f}'} s  {text[:110]}")
    if len(sh) > 80: print(f"... a dalších {len(sh) - 80} hlášení (--json)")
    for r in chybi: print(f"CHYBÍ    {r}")
    print("\nTEXTY V OBRAZE (od, do, text):")
    for t0, t1, s in useky:
        if t1 - t0 >= a.krok or len(s) > 3: print(f"  {t0:6.2f} {t1:6.2f}  {s[:120]}")
    print(f"\nsnímky: {tmp}")
    if a.json: Path(a.json).write_text(json.dumps({"hlaseni": sh, "chybi": chybi, "useky": useky, "snimky": data}, ensure_ascii=False))
    sys.exit(1 if sh or chybi else 0)


if __name__ == "__main__":
    main()
