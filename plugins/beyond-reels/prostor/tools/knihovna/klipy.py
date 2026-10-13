# Rozřeže ukázkové video stylu na klipy komponent pro záložku Knihovna na revizní stránce.
# python3 -I tools/knihovna/klipy.py <video> <seznam.json> <vystupni_slozka>
# seznam.json: {"fps": 24, "sirka": 720, "polozky": [{"id": "lumi-kolaz", "od": 44, "do": 72}, ...]}
# od a do jsou snímky videa. Ke každé položce vznikne <id>.mp4 (bez zvuku, smyčka) a <id>.jpg (prostřední snímek).
import json, subprocess, sys
from pathlib import Path

video, seznam, vys = sys.argv[1:4]
cfg = json.load(open(seznam))
fps, sirka = cfg.get("fps", 30), cfg.get("sirka", 720)
Path(vys).mkdir(parents=True, exist_ok=True)
for p in cfg["polozky"]:
    od, delka = p["od"] / fps, (p["do"] - p["od"]) / fps
    cil = Path(vys) / p["id"]
    sc = f"scale={sirka}:-2"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{od:.4f}", "-i", video, "-t", f"{delka:.4f}", "-an", "-vf", sc,
                    "-c:v", "libx264", "-crf", "25", "-preset", "slow", "-pix_fmt", "yuv420p", "-movflags", "+faststart", f"{cil}.mp4"], check=True)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{od + delka / 2:.4f}", "-i", video, "-frames:v", "1", "-vf", sc, "-q:v", "4", f"{cil}.jpg"], check=True)
    print(p["id"], f"{delka:.2f} s", f"{(Path(f'{cil}.mp4').stat().st_size) // 1024} kB")
