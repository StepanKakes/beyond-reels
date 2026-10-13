"""DeepFilterNet3 (DF3) na mono wav 48 kHz. Spouští se v samostatném venv (Python 3.11, torch 2.0.1): work/venv_df.
Vytvoření: uv venv work/venv_df --python 3.11 && uv pip install --python work/venv_df/bin/python torch==2.0.1 torchaudio==2.0.2 'numpy<2' deepfilternet soundfile"""
import sys, numpy as np, soundfile as sf, torch, torchaudio
from df.enhance import enhance, init_df
inp, outp = sys.argv[1], sys.argv[2]
atten = float(sys.argv[3]) if len(sys.argv)>3 else None
model, df_state, _ = init_df()
sr = df_state.sr()
x, xsr = sf.read(inp, dtype='float32'); x = x if x.ndim==1 else x.mean(1)
t = torch.from_numpy(x)[None]
t = torchaudio.functional.resample(t, xsr, sr)
y = enhance(model, df_state, t, atten_lim_db=atten)
y = torchaudio.functional.resample(y, sr, xsr)
sf.write(outp, y[0].numpy(), xsr, subtype='FLOAT')
print('ok', sr, y.shape)
