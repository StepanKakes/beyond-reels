#!/usr/bin/env python3
"""Textové shrnutí videa, než se Claude podívá na jediný obrázek: délka, rozměr, střihy, hlasitost, tempo řeči,
první věta, text v obraze (Apple Vision) a přehled snímků podle střihů (jeden snímek po každém střihu).

  $PY souhrn_videa.py video.mp4 [--prepis prepis.srt] [--prah 0.3] [--vystup slozka]

Zapíše do složky videa (nebo --vystup) souhrn.txt a strihy.jpg. strihy.jpg otevírej, až když text nestačí."""
import argparse, json, re, subprocess
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent))
from kontrola_renderu import vision, norm   # noqa: E402


def sh(*a):
    return subprocess.run(a, capture_output=True, text=True)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("video"); ap.add_argument("--prepis"); ap.add_argument("--prah", type=float, default=0.3); ap.add_argument("--vystup")
    a = ap.parse_args()
    v = Path(a.video).resolve(); out = Path(a.vystup or v.parent); out.mkdir(parents=True, exist_ok=True)
    info = json.loads(sh("ffprobe", "-v", "error", "-show_entries", "format=duration:stream=width,height,r_frame_rate,codec_type", "-of", "json", str(v)).stdout)
    vs = next(s for s in info["streams"] if s["codec_type"] == "video"); delka = float(info["format"]["duration"])
    n, d = vs["r_frame_rate"].split("/"); fps = float(n) / float(d)
    # střihy
    e = sh("ffmpeg", "-hide_banner", "-i", str(v), "-vf", f"select='gt(scene,{a.prah})',showinfo", "-an", "-f", "null", "-").stderr
    strihy = [round(float(x), 2) for x in re.findall(r"pts_time:([\d.]+)", e)]
    # hlasitost
    l = sh("ffmpeg", "-hide_banner", "-nostats", "-i", str(v), "-af", "ebur128=peak=true", "-f", "null", "-").stderr
    lufs = re.findall(r"I:\s+(-?[\d.]+) LUFS", l); tp = re.findall(r"Peak:\s+(-?[\d.]+) dBFS", l)
    # řeč
    slova, prvni = 0, ""
    if a.prepis and Path(a.prepis).exists():
        txt = [r for r in Path(a.prepis).read_text().splitlines() if r.strip() and not r.strip().isdigit() and "-->" not in r]
        slova = sum(len(r.split()) for r in txt); prvni = txt[0].strip() if txt else ""
    # snímek kousek po každém střihu (a první snímek)
    casy = [0.3] + [min(delka - 0.05, s + 0.2) for s in strihy]
    if len(casy) < 9: casy = sorted(set(round(x, 2) for x in casy + [delka * (i + 0.5) / 9 for i in range(9)]))   # jeden záběr: doplnit rovnoměrně
    tmp = out / "_strihy"; tmp.mkdir(exist_ok=True)
    soubory = []
    for i, t in enumerate(casy):
        f = tmp / f"s{i:03d}.jpg"
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(t), "-i", str(v), "-frames:v", "1", "-vf", "scale=360:-2", str(f)], check=True); soubory.append(str(f))
    data = vision(soubory)
    texty = []
    for t, d in zip(casy, data):
        for x in d.get("texty", []):
            if len(x["t"]) > 2 and x["jistota"] >= 0.5 and norm(x["t"]) not in {norm(y) for _, y in texty}: texty.append((t, x["t"]))
    obliceje = sum(1 for d in data if d.get("obliceje"))
    # přehled podle střihů, max 30 snímků po 6 v řadě
    vyber = soubory[:30]
    subprocess.run(["ffmpeg", "-v", "error", "-y", *sum([["-i", f] for f in vyber], []), "-filter_complex",
                    "".join(f"[{i}]scale=360:-2,setsar=1,pad=360:ih:0:0[a{i}];" for i in range(len(vyber))) +
                    "".join(f"[a{i}]" for i in range(len(vyber))) + f"xstack=inputs={len(vyber)}:layout=" +
                    "|".join(f"{(i % 6) * 360}_{'+'.join(['h0'] * (i // 6)) or 0}" for i in range(len(vyber))) + ":fill=white",
                    str(out / "strihy.jpg")], check=False) if len(vyber) > 1 else None
    delky = [round(b - a_, 2) for a_, b in zip([0] + strihy, strihy + [delka])]
    radky = [f"VIDEO {v.name}: {delka:.1f} s, {vs['width']}x{vs['height']}, {fps:.0f} fps",
             f"střihy: {len(strihy)} (prah {a.prah}), průměrný záběr {delka / (len(strihy) + 1):.2f} s, nejkratší {min(delky):.2f} s, nejdelší {max(delky):.2f} s",
             f"časy střihů: {', '.join(str(s) for s in strihy[:40])}{' ...' if len(strihy) > 40 else ''}",
             f"hlasitost: {lufs[-1] if lufs else '?'} LUFS, vrchol {tp[-1] if tp else '?'} dBFS"]
    if slova: radky.append(f"řeč: {slova} slov, {slova / delka * 60:.0f} slov za minutu, první věta: {prvni}")
    radky.append(f"obličej v {obliceje} z {len(data)} záběrů")
    radky.append("text v obraze (čas, text):"); radky += [f"  {t:6.2f}  {s}" for t, s in texty[:40]]
    radky.append(f"přehled podle střihů: {out / 'strihy.jpg'} ({len(vyber)} snímků)")
    (out / "souhrn.txt").write_text("\n".join(radky) + "\n"); print("\n".join(radky))


if __name__ == "__main__":
    main()
