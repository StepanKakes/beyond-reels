"""George Heaton sedí na stoličce (R19, Nathan #16 "I was one of those people"): Seedream v4 edit, 2 různé generace,
pak výřez BiRefNet, aby velké slovo mohlo ležet za hlavou. Reference tváře jen čtené ze složky s fotkami (--kand=CESTA nebo BR_KAND; v plánu Heaton to bylo zdroj/fotky/kand reelu)
-> assets/ai/sedi_<i>.png a sedi_<i>_cut.png. Spouštět z kořene nathan-styl: python3 nastroje/gen_sedi.py --kand=CESTA [gen] [cut]"""
import glob, os, sys, subprocess, urllib.request
BR_REELY = os.environ.get('BR_REELY')
if not BR_REELY:
    sys.exit('gen_sedi: nastav BR_REELY (source ~/.config/beyond-reels/env.sh), modul fal.py se hledá v $BR_REELY/_nastroje')
sys.path.insert(0, os.path.join(BR_REELY, '_nastroje')); import fal
_kand = [a.split('=', 1)[1] for a in sys.argv[1:] if a.startswith('--kand=')] or [os.environ.get('BR_KAND', '')]
if not _kand[0]:
    sys.exit('gen_sedi: chybí složka s referenčními fotkami, použij --kand=CESTA nebo BR_KAND')
KAND = os.path.expanduser(_kand[0])
REF = [f'{KAND}/{n}.jpg' for n in ('gNGOw9g3zjw_628', '9fGr_fZTKHY_530', '9fGr_fZTKHY_796')]
VZHLED = ('dark brown hair, very short skin fade on the sides with a short textured top and no fringe, '
          'neatly trimmed short dark beard close to the jawline (not long). ')
POZY = ['He sits relaxed on a simple tall wooden bar stool, one foot on the stool rung, the other foot on the floor, hands resting loosely on his thighs, '
        'calm confident half smile, oversized plain charcoal t-shirt, black trousers, white sneakers. ',
        'He sits on a simple low wooden stool, leaning slightly forward with forearms on his knees, hands loosely clasped, '
        'calm serious focused expression, plain heather grey hoodie, black sweatpants, black sneakers. ']
P = ('The same single man as in the reference photos (identical face, hair and facial hair), only one person in the image: {v}'
     'Professional studio photograph, soft even light. {p}Head upright, looking straight into the camera lens. '
     'Full body visible from head to shoes, small in the frame and centered, with generous empty space above his head and around him. '
     'Seamless plain very light off white studio backdrop (#FBF9FC) with nothing else in the frame, photorealistic, no text, no logos, no glow.')
akce = [a for a in sys.argv[1:] if not a.startswith('--')] or ['gen', 'cut']
if 'gen' in akce:
    ref = [fal.nahraj(f) for f in REF]
    for i, poza in enumerate(POZY):
        r = fal.spust('fal-ai/bytedance/seedream/v4/edit', {'prompt': P.format(v=VZHLED, p=poza), 'image_urls': ref,
                                                            'image_size': {'width': 2048, 'height': 2048}, 'num_images': 1})
        urllib.request.urlretrieve(next(fal.urls(r)), f'assets/ai/sedi_{i}.png'); print('hotovo', i)
if 'cut' in akce:
    for f in sorted(glob.glob('assets/ai/sedi_?.png')):
        c = fal.spust('fal-ai/birefnet', {'image_url': fal.nahraj(f), 'model': 'Portrait', 'output_format': 'png'})
        subprocess.run(['curl', '-s', '-o', f.replace('.png', '_cut.png'), next(fal.urls(c))], check=True); print('výřez', f)
