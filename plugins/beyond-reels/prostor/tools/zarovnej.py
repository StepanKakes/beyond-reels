"""Forced alignment (wav2vec2 MMS CTC): zvuk + spravny text -> casy slov (~20 az 40 ms).
Pouziti: python zarovnej.py zvuk.wav text.txt vystup.json   (text: slova oddelena mezerou, cisla jako cislice)
Vyslovnost cisel a cizich slov v SPOK."""
import json,os,re,sys,unicodedata,numpy as np,torch,soundfile as sf,librosa
from transformers import Wav2Vec2ForCTC
MP='MahmoudAshraf/mms-300m-1130-forced-aligner'   # stáhne se při prvním běhu do ~/.cache/huggingface
SPOK={'200':['dveste'],'3':['tri'],'Ecomflow':['ikomflou'],'CTAčko':['citeacko'],'100':['sto'],'000':['tisic'],'5':['pet'],'7':['sedmi'],'A':['a'],'B':['be'],'C':['ce'],'followery':['folovery'],'followerů':['folovéru'],'byznys':['biznis'],'2014':['dva','tisice','ctrnact'],'coach':['kouc'],'430':['ctyri','sta','tricet'],'e-commerce':['ikomers'],'Nijhof':['nyhov'],'Vince':['vins'],'Nickem':['nikem'],'One':['uan'],'Kind':['kajnd'],'spadají':['spadeji'],'YouTubeovej':['jutubovej'],'Hormoziho':['hormoziho']}
wav,txt,out=sys.argv[1:4]; vocab=json.load(open(f'{MP}/vocab.json' if os.path.isdir(MP) else __import__('huggingface_hub').hf_hub_download(MP,'vocab.json')))  # model id -> vocab.json z HF cache
def rom(s):
    s=unicodedata.normalize('NFKD',s.lower()); s=''.join(c for c in s if not unicodedata.combining(c)); return re.sub(r"[^a-z']",'',s)
words=open(txt).read().split(); chars=[]; wid=[]
for i,w in enumerate(words):
    key=w.strip('.,?!:')
    toks=[rom(t) for t in SPOK.get(key,[key]) if rom(t)] or ['a']
    for t in toks:
        for ch in t: chars.append(vocab[ch]); wid.append(i)
audio,sr=sf.read(wav); audio=audio[:,0] if audio.ndim>1 else audio
a16=librosa.resample(audio.astype(np.float32),orig_sr=sr,target_sr=16000); a16=(a16-a16.mean())/(a16.std()+1e-7)
model=Wav2Vec2ForCTC.from_pretrained(MP).eval()
with torch.no_grad(): em=torch.log_softmax(model(torch.from_numpy(a16)[None]).logits[0],-1).numpy()
T=len(em); L=len(chars); S=2*L+1; lab=np.zeros(S,dtype=int); lab[1::2]=chars; NEG=-1e30
dp=np.full((T,S),NEG); bp=np.zeros((T,S),dtype=np.int8); dp[0,0]=em[0,0]; dp[0,1]=em[0,lab[1]]
allow2=np.zeros(S,dtype=bool); allow2[3::2]=lab[3::2]!=lab[1:-2:2]
for t in range(1,T):
    p=dp[t-1]; m1=np.concatenate([[NEG],p[:-1]]); m2=np.where(allow2,np.concatenate([[NEG,NEG],p[:-2]]),NEG)
    st=np.stack([p,m1,m2]); bp[t]=st.argmax(0); dp[t]=st.max(0)+em[t,lab]
s=S-1 if dp[-1,S-1]>dp[-1,S-2] else S-2; path=[0]*T
for t in range(T-1,-1,-1): path[t]=s; s=int(s-int(bp[t,s]))
cs=np.full(L,np.nan); ce=np.full(L,np.nan)
for t,s in enumerate(path):
    if s%2==1:
        ci=(s-1)//2
        if np.isnan(cs[ci]): cs[ci]=t*0.02
        ce[ci]=(t+1)*0.02
wid=np.array(wid); res=[]
for i,w in enumerate(words):
    idx=np.where(wid==i)[0]; res.append({'w':w,'t':round(float(cs[idx[0]]),3),'e':round(float(ce[idx[-1]]),3)})
json.dump({'slova':res,'delka':round(len(audio)/sr,3)},open(out,'w'),ensure_ascii=False,indent=0)
print(' '.join(f"{r['w']}@{r['t']:.2f}" for r in res))
