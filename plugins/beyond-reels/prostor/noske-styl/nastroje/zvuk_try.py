"""Hlas, hudba a SFX pro reel ClaudeTry -> assets/media/hlas_TRY.wav, hudba_TRY.wav, sfx_TRY.wav (48 kHz stereo)
Noske sám má jen hlas a tichý podkres, Tim chce vždy hudbu a SFX: hudba nízko pod hlasem, SFX řídké a tlumené.
SFX podle Tima (2.10.2026): jednotlivá slova titulků bez zvuku. Mouse hard click (klik1/klik2) na slova víceslovných nápisů,
mouse clicks (klik4) na nástupy prvků, závěrka na záběry (B-roll, karta). Nikdy classic click (klik3) ani dřevěný ťuk.
Spouštět: $PY nastroje/zvuk_try.py   (z kořene noske-styl)"""
import json,subprocess,sys,numpy as np,soundfile as sf
import os; PROSTOR=os.environ.get('BR_PROSTOR') or os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..')); HUDBA=os.environ.get('BR_HUDBA') or os.path.join(PROSTOR,'hudba')
sys.path.insert(0,os.path.join(PROSTOR,'tools','zvuk')); import v4_dsp as D
SR=48000; W=json.load(open('assets/media/slova_TRY.json')); VIDEO=W['delka']; KONEC=VIDEO+0.6
S=W['slova']; T=lambda i:S[i]['t']; F=lambda n:n/25
ST=json.load(open('zdroj/strih.json')); U=lambda i:ST[i]['od']
def load(p):
    r=subprocess.run(['ffmpeg','-v','error','-i',p,'-ac','1','-ar',str(SR),'-f','f32le','-'],capture_output=True); return np.frombuffer(r.stdout,np.float32).astype(float)
def db(x): return 10**(x/20)
N=int(KONEC*SR)
E=[(0.0,'sub',-20)]                                                             # úvodní ťuk do zoomu
E+=[(t,'zaverka',-30) for t in (U(2),U(3),T(60)-F(1),U(10),U(11),U(16),U(22))]        # B-roll záběry
E+=[(t,'zaverka',-30) for t in (T(11)-F(1),T(57)-F(1),T(72)-F(1),T(107)-F(1),T(139)-F(1),U(18),U(27),T(250)-F(1),T(269)-F(1),U(35))]  # karty
E+=[(T(11)+F(i*6),'klik4',-30) for i in range(3)]                               # pásy trychtýře naskočí
E+=[(T(108),'klik1',-30),(T(169),'klik1',-30)]                                  # rozsvítí se fáze
E+=[(T(254),'klik4',-30)]                                                       # první dvě fáze zhasnou
E+=[(T(72)+F(r*2),'klik4',-32) for r in range(3)]                               # řady lidí
E+=[(T(77),'klik1',-30)]                                                        # zůstanou jen někteří
E+=[(T(119)-F(2),'klik4',-28),(T(121)-F(2),'klik4',-28)]                        # sklo YouTube, e-mail
for k,t in enumerate([T(139)-F(1),T(141)-F(1),T(143)-F(1),T(144)-F(1),T(145)-F(1)]): E.append((t,'klik1' if k%2==0 else 'klik2',-30))   # rozhozená slova
for k,t in enumerate([U(27),T(238)-F(1),T(239)-F(1),T(240)-F(1)]): E.append((t,'klik1' if k%2==0 else 'klik2',-30))
for k,t in enumerate([T(59)-F(1),T(270)-F(1)]): E.append((t,'klik2',-30))      # výměna slova pod kotvou
E+=[(T(295)-F(1),'klik1',-28),(T(299)-F(1),'klik2',-28)]                        # výzva
# vrstvené sestavy: víceslovný kicker a řádky schodů = mouse hard click na slova, velké slovo samo bez zvuku
# Tim 3.10.: zvuk vždy u grafik a u každého nápisu s víc slovy naráz, včetně velkého slova sestavy
KICK=[(0,2),(19,23),(36,39),(40,44),(82,87),(191,195),(244,245)]; SCH=[3,6,259,261,262]
k=0
for a,b in KICK:
    for i in range(a,b+1): E.append((T(i)-F(1),'klik1' if k%2==0 else 'klik2',-30)); k+=1
for i in SCH: E.append((T(i)-F(1),'klik1' if k%2==0 else 'klik2',-30)); k+=1
E+=[(T(57)-F(1),'klik1',-30),(T(269)-F(1),'klik1',-30),(U(35),'klik2',-30)]     # první slovo pod kotvou, řádek výzvy
# dvojslovné titulky ("a oni", "to zaprvé") naskočí najednou = bez zvuku. Klik jen když se nápis vypisuje slovo po slově (Tim 3.10.)

sfx=np.zeros(N)
for t,n,g in E:
    g+=5                                                                        # Tim 3.10.: SFX víc nahlas
    if n.startswith('klik'): g+=3                                               # Tim 2.10.: kliky lehce víc nahlas
    x=load(f'assets/sfx/{n}.wav'); x=x/np.abs(x).max()*db(-1+g+6); i=int(t*SR); x=x[:N-i]; sfx[i:i+len(x)]+=x
# hlas: studiový řetězec (tools/studio-hlas: odšumění, EQ podle Matta Graye, vyrovnání, komprese), už na -14 LUFS
v=load('assets/media/hlas_studio.wav')
v=np.pad(v,(0,N-len(v)))[:N]*db(-5.5)
# hudba: kus s plným groovem, sidechain na hlas
m=load(os.path.join(HUDBA,'timeless.wav'))   # stopa timeless.wav musí ležet v BR_HUDBA
H=int(0.05*SR); e=np.sqrt((m[:len(m)//H*H].reshape(-1,H)**2).mean(1)); start=int(np.argmax(np.convolve(e>np.percentile(e,60),np.ones(40),'same')[:int(60/0.05)]))*H
m=np.tile(m[start:],3)[:N]; m=m/np.sqrt((m**2).mean())*db(-24)
# ducking bez pumpování: obálka s podržením 0,8 s, náběh i návrat 0,8 s, takže hudba mezi slovy neskáče
from scipy.ndimage import maximum_filter1d
env=maximum_filter1d(np.convolve(np.abs(v),np.ones(int(0.05*SR))/int(0.05*SR),'same'),int(0.8*SR)); duck=np.where(env>0.02,db(-6),1.0)
duck=np.convolve(duck,np.ones(int(0.8*SR))/int(0.8*SR),'same')
g=np.ones(N); g[int(VIDEO*SR):]=db(6); g=np.convolve(g,np.ones(int(0.2*SR))/int(0.2*SR),'same')
fade=np.ones(N); fade[:int(0.25*SR)]=np.linspace(0,1,int(0.25*SR)); fade[-int(1.2*SR):]=np.linspace(1,0,int(1.2*SR))**2
m=m*duck*g*fade
for name,x in [('hudba_TRY',m),('sfx_TRY',sfx),('hlas_TRY',v)]:
    sf.write(f'assets/media/{name}.wav',np.stack([x,x],1).clip(-1,1).astype(np.float32),SR,subtype='PCM_16')
mix=m+sfx+v; print('špička: hlas',round(20*np.log10(np.abs(v).max()),1),'hudba',round(20*np.log10(np.abs(m).max()),1),'sfx',round(20*np.log10(np.abs(sfx).max()),1),'mix',round(20*np.log10(np.abs(mix).max()),1))
# finální mix pro vložení do renderu (render HyperFrames hlasitost nesrovná): -14 LUFS, -1 dBTP
y,I,tp=D.to_loudness(mix,-14.0,-1.2); sf.write('assets/media/mix_TRY.wav',np.stack([y,y],1).astype(np.float32),SR,subtype='PCM_24'); print('mix LUFS',I,'TP',tp)
