# Takt celého kompozitu (rozbory bod 2): v úsecích se drží každý nový obraz 2 snímky (12 fps) nebo 3 (8 fps),
# fáze se resetuje na začátku úseku (na střihu). Text, karty, glitche i střihy tak padají na hrubší mřížku jako v originálu.
# Zároveň změkčení obrazu (originál je měkčí než digitální 4K) a mux se zvukem.
# python3 -I nastroje/takt.py heaton15 vstup.mp4 vystup.mp4 [zvuk.wav]
import json, subprocess, sys

jmeno, vst, vys = sys.argv[1:4]
zvuk = sys.argv[4] if len(sys.argv) > 4 else None
takt = json.load(open(f"plany/{jmeno}.json")).get("takt", [])
w, h = 1440, 1080
mapa = {}
for f0, f1, d in takt:
    for f in range(f0, f1):
        mapa[f] = f0 + ((f - f0) // d) * d

dek = subprocess.Popen(["ffmpeg", "-v", "error", "-i", vst, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE)
cmd = ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{w}x{h}", "-r", "24", "-i", "-"]
if zvuk:
    cmd += ["-i", zvuk]
cmd += ["-vf", "gblur=sigma=0.6", "-c:v", "libx264", "-crf", "15", "-preset", "medium", "-pix_fmt", "yuv420p", "-movflags", "+faststart"]
if zvuk:
    cmd += ["-map", "0:v", "-map", "1:a", "-c:a", "aac", "-b:a", "256k", "-shortest"]
enk = subprocess.Popen(cmd + [vys], stdin=subprocess.PIPE)
n = w * h * 3
drzeny, i, kopie = {}, 0, 0
while True:
    b = dek.stdout.read(n)
    if len(b) < n:
        break
    src = mapa.get(i, i)
    if src == i:
        drzeny[i] = b
        enk.stdin.write(b)
    else:
        enk.stdin.write(drzeny.get(src, b)); kopie += 1
    for k in [k for k in drzeny if k < i - 4]:
        del drzeny[k]
    i += 1
enk.stdin.close(); enk.wait()
print(vys, i, "snímků, drženo", kopie, f"({100 * kopie / max(1, i):.1f} %)")
