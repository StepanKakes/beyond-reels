"""Studio hlas: z hlasu z kamery nebo lavalieru udělá čistý, vyrovnaný a hluboký zvuk podle reference (Matt Gray).
Pro všechna Beyond videa. Řetězec:
 1. DeepFilterNet3 (AI odstranění šumu a ruchu, stejný princip jako Adobe Podcast Enhance)
 2. zářezy na zbylé tóny (bzučení) změřené v tichu
 3. EQ podle reference: dlouhodobé spektrum řeči se dorovná na spektrum reference (lineární fáze, max ±9 dB)
 4. vyrovnání hlasitosti slovo od slova (pomalé AGC jen na řeči, ticho se nezesiluje)
 5. dvoustupňová komprese, jemná saturace (hloubka), de-esser
 6. hlasitost -14 LUFS a true peak -1,5 dBTP
Použití: $PY studio_hlas.py (PY z ~/.config/beyond-reels/env.sh) vstup.wav vystup.wav [reference.wav] [--sucho]
--podcast (výchozí volba pro nahrávky z místnosti): WPE proti dozvuku + DF3, bez přefiltrování, viz studio()
--sucho pro nahrávky s ozvěnou místnosti (Tim 3.10.2026: "zní jako na hajzlu"): potlačení pozdního dozvuku, k DF3 40 % syrového
hlasu nad 1 kHz (souhlásky), mírnější vyrovnání a expandér po kompresi. Raný dozvuk 50 až 150 ms po slově z 28 na 35,5 dB
(jack-styl/nastroje/dozvuk.py) a whisper slyší slova lépe než u standardu (ten polykal "Vsadil", "Hotovo")
Bez reference se použije uložený profil profil_matt.npy (z ref/matt.wav)."""
import sys,os,subprocess,numpy as np,soundfile as sf,scipy.signal as sg
from scipy.ndimage import uniform_filter1d,maximum_filter1d
sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','zvuk')); import v4_dsp as D, wpe as W   # dřív webinar-reels/scripts, teď ve sdíleném prostoru
import tempfile
SR=48000; TU=os.path.dirname(os.path.abspath(__file__)); TMP=tempfile.mkdtemp(prefix='studio_hlas_')   # dočasné soubory mimo plugin
# venv s DeepFilterNet3 (Python 3.11, torch 2.0.1): ze setup.sh pluginu beyond-reels, jinak starý z webinar-reels
_BR=os.path.expanduser('~/.cache/beyond-reels'); _STARY='/Users/stepankakes/Documents/GitHub/webinar-reels/work/venv_df/bin/python'
DFPY=os.environ.get('BR_DFPY') or (f'{_BR}/venv_df/bin/python' if os.path.exists(f'{_BR}/venv_df/bin/python') else _STARY)
DFS=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','zvuk','v4_df3.py')
def load(p):
    r=subprocess.run(['ffmpeg','-v','error','-i',p,'-ac','1','-ar',str(SR),'-f','f32le','-'],capture_output=True); return np.frombuffer(r.stdout,np.float32).astype(float)
NF=8192; F=np.fft.rfftfreq(NF,1/SR)
def ltas(x):
    """průměrné spektrum řeči (horních 45 % rámců podle energie), vyhlazené na 1/6 oktávy, v dB"""
    f,t,Z=sg.stft(x,SR,nperseg=NF,noverlap=NF*3//4); P=np.abs(Z)**2; e=P.sum(0); S=P[:,e>np.percentile(e,55)].mean(1)
    out=np.empty_like(S)
    for i,fc in enumerate(f):
        lo,hi=fc*2**(-1/12),fc*2**(1/12); m=(f>=lo)&(f<=hi); out[i]=S[m].mean() if m.any() else S[i]
    return 10*np.log10(out+1e-20)
def profil_ref(ref):
    p=f'{TU}/profil_{os.path.splitext(os.path.basename(ref))[0]}.npy'
    if not os.path.exists(p): np.save(p,ltas(load(ref)))
    return np.load(p)
def denoise(x):
    a=f'{TMP}/in.wav'; b=f'{TMP}/out.wav'; sf.write(a,x.astype(np.float32),SR,subtype='FLOAT')
    r=subprocess.run([DFPY,DFS,a,b],capture_output=True,text=True)
    if r.returncode: raise SystemExit(r.stderr[-600:])
    y,_=sf.read(b,dtype='float64'); os.remove(a); os.remove(b); return np.pad(y,(0,max(0,len(x)-len(y))))[:len(x)]
REPY='/Users/stepankakes/Documents/GitHub/webinar-reels/work/venv_re/bin/python'; RES='/Users/stepankakes/Documents/GitHub/webinar-reels/scripts/re_enhance.py'
def regeneruj(x,lambd=0.9):
    """Resemble Enhance: odšumí a přegeneruje hlas bez zabarvení místnosti (obdoba Adobe Podcast Enhance)"""
    a=f'{TMP}/in.wav'; b=f'{TMP}/out.wav'; sf.write(a,x.astype(np.float32),SR,subtype='FLOAT')
    r=subprocess.run([REPY,RES,a,b,str(lambd)],capture_output=True,text=True)
    if r.returncode: raise SystemExit(r.stderr[-600:])
    y=load(b); os.remove(a); os.remove(b); return np.pad(y,(0,max(0,len(x)-len(y))))[:len(x)]
def zarezy(x):
    """tóny, které v tichých místech vyčnívají nad okolí o víc než 6 dB, dostanou úzký zářez"""
    f,t,Z=sg.stft(x,SR,nperseg=NF,noverlap=NF//2); P=np.abs(Z)**2; e=P.sum(0); q=10*np.log10(P[:,e<np.percentile(e,10)].mean(1)+1e-20)
    vy=q-sg.medfilt(q,41); kand=[i for i in sg.find_peaks(vy,height=6,distance=6)[0] if 80<f[i]<8000]
    for i in kand:
        b,a=sg.iirnotch(f[i],Q=f[i]/6,fs=SR); x=sg.filtfilt(b,a,x)
    return x,[round(f[i]) for i in kand]
def eq_ref(x,ref_db,maxdb=9):
    d=ref_db-ltas(x); m=(F>1000)&(F<2000); d-=d[m].mean()            # tvar, ne hlasitost
    d[F<45]=d[np.argmin(abs(F-45))]; d[F>15000]=d[np.argmin(abs(F-15000))]
    d=np.clip(uniform_filter1d(d,9),-maxdb,maxdb)
    h=np.fft.irfft(10**(d/20)); h=np.roll(h,NF//2)*np.hanning(NF)       # lineární fáze
    return sg.fftconvolve(x,h,'same')
def vyrovnej(x,cil_db=None,rozsah=10):
    """AGC: hlasitost řeči v okně 350 ms se táhne k mediánu, útok 120 ms, návrat 500 ms, ticho drží poslední zesílení"""
    hop=int(0.01*SR); n=len(x)//hop; fr=x[:n*hop].reshape(n,hop)
    L=10*np.log10(uniform_filter1d((fr**2).mean(1),25)+1e-12)
    rec=L>np.percentile(L,98)-30; cil=np.median(L[rec]) if cil_db is None else cil_db
    g=np.clip(cil-L,-rozsah,rozsah); g[~rec]=np.nan
    i=np.where(~np.isnan(g))[0]; g=np.interp(np.arange(n),i,g[i])     # v tichu drž zesílení
    out=np.empty(n); s=g[0]
    for k in range(n):
        a=0.12 if g[k]<s else 0.035; s+=a*(g[k]-s); out[k]=s          # rychle dolů, pomalu nahoru
    gs=np.interp(np.arange(len(x)),(np.arange(n)+0.5)*hop,out)
    return x*10**(gs/20)
def sytost(x,drive=1.6,mix=0.25):
    y=np.tanh(drive*x/np.abs(x).max())/np.tanh(drive)*np.abs(x).max(); return (1-mix)*x+mix*y
def studio(x,ref_db,sucho=False,podcast=False,hi_mix=0.2):
    x=sg.sosfiltfilt(sg.butter(4,55,'hp',fs=SR,output='sos'),x)
    if podcast:
        # jako Adobe Podcast (Tim 3.10.2026: --sucho zní přefiltrovaně jako Zoom): dozvuk pryč přes WPE (lineární predikce, hlásky drží),
        # pak DF3 jednou, žádné spektrální potlačení dozvuku ani expandér, EQ na referenci až ±12 dB (hloubka), jemná komprese a sytost.
        # Resemble Enhance (regeneruj) zkoušen a zamítnut: češtinu komolí ("potřebuje soustředit" > "tě jako třeba zostředit")
        x=W.dereverb(x,taps=20,delay=3,size=1024,shift=256); x=denoise(x); x,tony=zarezy(x); x=eq_ref(x,ref_db,maxdb=12); x=vyrovnej(x,rozsah=8)
        sp=D._speech_db(x); x=D.compress(x,thr_db=sp-8,ratio=2.2,att=0.015,rel=0.25); x=D.compress(x,thr_db=sp-1,ratio=3.0,att=0.004,rel=0.08)
        x=sytost(x,drive=1.8,mix=0.3); x=D.deess(x); x=eq_ref(x,ref_db,maxdb=6)
        y,I,tp=D.to_loudness(x,-14.0,-1.5)
        return y,I,tp,tony
    if sucho:
        # DF3 polyká měkké nástupy (V, H, koncovky), proto se k suchému DF3 vrací 40 % syrového hlasu nad 1 kHz,
        # obojí po potlačení pozdního dozvuku. Vyrovnání jen ±6 dB, širší rozsah kazí přechody souhlásek
        ls=D.late_suppress(x,t60=0.5); x=D.late_suppress(denoise(x),t60=0.5)+0.4*sg.sosfiltfilt(sg.butter(4,1000,'hp',fs=SR,output='sos'),ls)
    else: x=denoise(x)
    x,tony=zarezy(x); x=eq_ref(x,ref_db)
    x=vyrovnej(x,rozsah=6 if sucho else 10)
    sp=D._speech_db(x); x=D.compress(x,thr_db=sp-6,ratio=2.0,att=0.012,rel=0.18); x=D.compress(x,thr_db=sp-2,ratio=4.0,att=0.003,rel=0.06)
    if sucho: x=D.expand(x,thr_db=sp-20,ratio=1.6,range_db=10)         # komprese vytáhne ocasy slov, expandér je stáhne zpět
    x=sytost(x); x=D.deess(x)
    x=eq_ref(x,ref_db,maxdb=6)                                        # druhé kolo: vrátí vzduch, který vzal odšumovač a de-esser
    y,I,tp=D.to_loudness(x,-14.0,-1.5)
    return y,I,tp,tony
if __name__=='__main__':
    a=[x for x in sys.argv[1:] if not x.startswith('--')]; sucho='--sucho' in sys.argv; podcast='--podcast' in sys.argv
    vst,vyst=a[0],a[1]; ref=a[2] if len(a)>2 else f'{TU}/matt.wav'   # bez reference se vezme uložený profil_matt.npy
    y,I,tp,tony=studio(load(vst),profil_ref(ref),sucho,podcast)
    sf.write(vyst,np.stack([y,y],1).astype(np.float32),SR,subtype='PCM_24')
    print('LUFS',I,'TP',tp,'zářezy Hz',tony)
