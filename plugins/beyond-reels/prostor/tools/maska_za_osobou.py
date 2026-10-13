"""Masky lidí po snímcích pro text ZA osobou (obří slovo za běžci, za Timem, za Georgem).
První snímek: Apple Vision (maska_osoby.swift, bez klíče), pak MatAnyone2 přes celý záběr na polovičním rozlišení,
alfa se zvětší na plné. Výstup: <slozka>/000.webp ... RGBA (záběr + alfa), v kompozici se kladou nad text
(BN.maskaZaPostavou nebo smyčka jako ve vzory/dalen-telo.html). Text skrýt, jakmile masky dojdou.

$PY $BR_PROSTOR/tools/maska_za_osobou.py zaber.mp4 assets/media/za_beh [--od 0.0] [--do 3.6] [--maska prvni.png]
Potřebuje MatAnyone2: zsh <plugin>/scripts/setup.sh --matanyone"""
import argparse, os, shutil, subprocess, sys, tempfile
from PIL import Image

ap = argparse.ArgumentParser(); ap.add_argument('video'); ap.add_argument('slozka')
ap.add_argument('--od', type=float, default=0.0); ap.add_argument('--do', type=float); ap.add_argument('--maska')
a = ap.parse_args()
MA = os.environ.get('BR_MATANYONE') or os.path.expanduser('~/.cache/beyond-reels/MatAnyone2')
if not os.path.exists(f'{MA}/.venv/bin/python'): sys.exit('MatAnyone2 chybí: zsh <plugin>/scripts/setup.sh --matanyone')
TU = os.path.dirname(os.path.abspath(__file__)); t = tempfile.mkdtemp(prefix='maska_')
for d in ('fr', 'fm'): os.makedirs(f'{t}/{d}')
rozsah = ['-ss', str(a.od)] + (['-t', str(a.do - a.od)] if a.do else [])
subprocess.run(['ffmpeg', '-v', 'error', *rozsah, '-i', a.video, '-start_number', '0', f'{t}/fr/%04d.png'], check=True)
subprocess.run(['ffmpeg', '-v', 'error', '-i', f'{t}/fr/%04d.png', '-vf', 'scale=iw/2:-2', '-start_number', '0', f'{t}/fm/%04d.png'], check=True)
if a.maska: Image.open(a.maska).convert('L').save(f'{t}/m0.png')
else: subprocess.run(['swift', f'{TU}/maska_osoby.swift', f'{t}/fm/0000.png', f'{t}/m0.png'], check=True)
m0 = Image.open(f'{t}/m0.png').convert('L').point(lambda x: 255 if x > 127 else 0).resize(Image.open(f'{t}/fm/0000.png').size)
m0.save(f'{t}/maska0.png')
subprocess.run([f'{MA}/.venv/bin/python', 'inference_matanyone2.py', '-i', f'{t}/fm', '-m', f'{t}/maska0.png', '-o', f'{t}/out',
                '-e', '5', '-d', '5', '-w', '20', '--save_image'], cwd=MA, check=True, capture_output=True)
os.makedirs(a.slozka, exist_ok=True); n = len(os.listdir(f'{t}/fr'))
for i in range(n):
    fr = Image.open(f'{t}/fr/{i:04d}.png').convert('RGB')
    fr.putalpha(Image.open(f'{t}/out/fm/pha/{i:04d}.png').convert('L').resize(fr.size, Image.LANCZOS))
    fr.save(f'{a.slozka}/{i:03d}.webp', 'WEBP', quality=88)
shutil.rmtree(t); print(a.slozka, n, 'masek')
