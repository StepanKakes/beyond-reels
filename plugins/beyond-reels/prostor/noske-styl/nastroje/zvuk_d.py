"""Hlas, hudba a SFX pro reel dalsiProClaudise -> assets/media/hlas_D.wav, hudba_D.wav, sfx_D.wav (48 kHz stereo)
Noske sám má jen hlas a tichý podkres, Tim chce vždy hudbu a SFX: hudba nízko pod hlasem, SFX řídké a tlumené.
SFX podle Tima (2.10.2026): jednotlivá slova titulků bez zvuku. Mouse hard click (klik1/klik2) na slova víceslovných nápisů,
mouse clicks (klik4) na nástupy prvků, závěrka na záběry (B-roll, karta). Nikdy classic click (klik3) ani dřevěný ťuk.
Spouštět: $PY nastroje/zvuk_try.py   (z kořene noske-styl)"""
import json,subprocess,sys,numpy as np,soundfile as sf
import os; PROSTOR=os.environ.get('BR_PROSTOR') or os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..')); HUDBA=os.environ.get('BR_HUDBA') or os.path.join(PROSTOR,'hudba')
sys.path.insert(0,os.path.join(PROSTOR,'tools','zvuk')); import v4_dsp as D
SR=48000; W=json.load(open('assets/media/slova_D.json')); VIDEO=W['delka']; KONEC=VIDEO+0.6
S=W['slova']; T=lambda i:S[i]['t']; F=lambda n:n/25
ST=json.load(open('zdroj/strih_D.json')); U=lambda i:ST[i]['od']
def load(p):
    r=subprocess.run(['ffmpeg','-v','error','-i',p,'-ac','1','-ar',str(SR),'-f','f32le','-'],capture_output=True); return np.frombuffer(r.stdout,np.float32).astype(float)
def db(x): return 10**(x/20)
N=int(KONEC*SR)
E=[(0.0,'sub',-20)]                                                             # úvodní ťuk do zoomu
P=lambda i:T(i)-F(1)
E+=[(P(i),'zaverka',-30) for i in (21,38,121,129,161)]                          # B-roll záběry
E+=[(P(i),'zaverka',-30) for i in (54,60,100,147,172,222,225,243)]              # karty
k=0
def klik(t,g=-30):
    global k; E.append((t,'klik1' if k%2==0 else 'klik2',g)); k+=1
# víceslovné nápisy: mouse hard click na slova kickeru a řádky schodů, velké slovo samo bez zvuku
for a,b in [(0,5),(7,11),(18,19),(21,22),(24,28),(33,35),(47,52),(69,72),(74,74),(76,81),(84,88),(108,109),(119,120),(124,127),(135,140),(158,161),(163,165),(178,183),(191,195),(206,207),(209,212),(214,217),(237,241)]:
    for i in range(a,b+1): klik(P(i))
for i in (111,112,200,203): klik(P(i))
# karty: slova rozhozené a kotvy
for i in (60,62,63,64,67,68,100,102,103,222,223,224,243,244,245,246): klik(P(i))
for i in (54,57,58,147,154,172,175,230): klik(P(i))
sfx=np.zeros(N)
for t,n,g in E:
    g+=5                                                                        # Tim 3.10.: SFX víc nahlas
    if n.startswith('klik'): g+=3                                               # Tim 2.10.: kliky lehce víc nahlas
    x=load(f'assets/sfx/{n}.wav'); x=x/np.abs(x).max()*db(-1+g+6); i=int(t*SR); x=x[:N-i]; sfx[i:i+len(x)]+=x
# hlas: studiový řetězec (tools/studio-hlas: odšumění, EQ podle Matta Graye, vyrovnání, komprese), už na -14 LUFS
v=load('assets/media/hlas_studio_D.wav')
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
for name,x in [('hudba_D',m),('sfx_D',sfx),('hlas_D',v)]:
    sf.write(f'assets/media/{name}.wav',np.stack([x,x],1).clip(-1,1).astype(np.float32),SR,subtype='PCM_16')
mix=m+sfx+v; print('špička: hlas',round(20*np.log10(np.abs(v).max()),1),'hudba',round(20*np.log10(np.abs(m).max()),1),'sfx',round(20*np.log10(np.abs(sfx).max()),1),'mix',round(20*np.log10(np.abs(mix).max()),1))
# finální mix pro vložení do renderu (render HyperFrames hlasitost nesrovná): -14 LUFS, -1 dBTP
y,I,tp=D.to_loudness(mix,-14.0,-1.2); sf.write('assets/media/mix_D.wav',np.stack([y,y],1).astype(np.float32),SR,subtype='PCM_24'); print('mix LUFS',I,'TP',tp)
