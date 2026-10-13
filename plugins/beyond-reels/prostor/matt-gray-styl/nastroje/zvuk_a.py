"""Hlas, hudba a SFX pro ukázku A -> assets/media/hlas_A.wav, hudba_A.wav, sfx_A.wav a finální mix_A.wav (48 kHz)
Stejný řetězec jako Noske reel (noske-styl/nastroje/zvuk_try.py): studiový hlas o 5,5 dB pod masterem,
hudba Timeless -24 dB se sidechainem -6 dB s podržením 0,8 s, řídké SFX, master -14 LUFS / -1 dBTP.
SFX podle Tima (2.10.2026): titulky bez zvuku, mouse hard click (klik1/klik2) na slova víceslovných nápisů,
mouse clicks (klik4) na nástupy prvků, závěrka na B-roll, nikdy classic click (klik3) ani dřevěný ťuk. Kliky o 3 dB výš.
Hlas předem: ../tools/studio-hlas/studio_hlas.py assets/media/hlas_raw.wav assets/media/hlas_studio.wav
Spouštět: $PY nastroje/zvuk_a.py   (z kořene matt-gray-styl)"""
import json,subprocess,sys,numpy as np,soundfile as sf
import os; PROSTOR=os.environ.get('BR_PROSTOR') or os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..')); HUDBA=os.environ.get('BR_HUDBA') or os.path.join(PROSTOR,'hudba')
sys.path.insert(0,os.path.join(PROSTOR,'tools','zvuk')); import v4_dsp as D
SR=48000; KONEC=24.86
S=json.load(open('assets/media/slova_C.json'))['slova']; T=lambda i:S[i]['t']
M=lambda n:n/23.976; PRED=M(5)                                                  # snímky originálu, grafika předbíhá řeč
def load(p):
    r=subprocess.run(['ffmpeg','-v','error','-i',p,'-ac','1','-ar',str(SR),'-f','f32le','-'],capture_output=True); return np.frombuffer(r.stdout,np.float32).astype(float)
def db(x): return 10**(x/20)
N=int(KONEC*SR)
E=[]
E+=[(T(23)-M(1),'zaverka',-30),(T(42)-M(1),'zaverka',-30)]                       # B-roll telefony, pláž
for k,i in enumerate([0,1,2,3,4,5,6]): E.append((max(0.02,T(i)-PRED),'klik1' if k%2==0 else 'klik2',-30))     # hook po slovech
for k,i in enumerate(range(55,65)): E.append((T(i)-PRED,'klik1' if k%2==0 else 'klik2',-30))                  # závěrečná věta
E+=[(T(15)-M(2),'klik4',-30)]                                                   # uzel Tvůj obsah
E+=[(T(i)-M(2),'klik4',-30) for i in (18,19,20)]                                # štítky fází
E+=[(T(i)-M(1),'klik1',-30) for i in (37,38,40)]                                # fáze se rozsvítí
E+=[(T(41)+M(3),'klik4',-30)]                                                   # štítek Výzva

sfx=np.zeros(N)
for t,n,g in E:
    if n.startswith('klik'): g+=3                                               # Tim 2.10.: kliky lehce víc nahlas
    x=load(f'assets/sfx/{n}.wav'); x=x/np.abs(x).max()*db(-1+g+6); i=int(t*SR); x=x[:N-i]; sfx[i:i+len(x)]+=x
v=load('assets/media/hlas_studio.wav')
v=np.pad(v,(0,max(0,N-len(v))))[:N]*db(-5.5)
m=load(os.path.join(HUDBA,'timeless.wav'))   # stopa timeless.wav musí ležet v BR_HUDBA
H=int(0.05*SR); e=np.sqrt((m[:len(m)//H*H].reshape(-1,H)**2).mean(1)); start=int(np.argmax(np.convolve(e>np.percentile(e,60),np.ones(40),'same')[:int(60/0.05)]))*H
m=np.tile(m[start:],3)[:N]; m=m/np.sqrt((m**2).mean())*db(-24)
from scipy.ndimage import maximum_filter1d
env=maximum_filter1d(np.convolve(np.abs(v),np.ones(int(0.05*SR))/int(0.05*SR),'same'),int(0.8*SR)); duck=np.where(env>0.02,db(-6),1.0)
duck=np.convolve(duck,np.ones(int(0.8*SR))/int(0.8*SR),'same')
fade=np.ones(N); fade[:int(0.25*SR)]=np.linspace(0,1,int(0.25*SR)); fade[-int(1.2*SR):]=np.linspace(1,0,int(1.2*SR))**2
m=m*duck*fade
for name,x in [('hudba_A',m),('sfx_A',sfx),('hlas_A',v)]:
    sf.write(f'assets/media/{name}.wav',np.stack([x,x],1).clip(-1,1).astype(np.float32),SR,subtype='PCM_16')
mix=m+sfx+v; print('špička: hlas',round(20*np.log10(np.abs(v).max()),1),'hudba',round(20*np.log10(np.abs(m).max()),1),'sfx',round(20*np.log10(np.abs(sfx).max()),1),'mix',round(20*np.log10(np.abs(mix).max()),1))
y,I,tp=D.to_loudness(mix,-14.0,-1.2); sf.write('assets/media/mix_A.wav',np.stack([y,y],1).astype(np.float32),SR,subtype='PCM_24'); print('mix LUFS',I,'TP',tp)
