"""WPE odstranění dozvuku (lineární predikce, nekomolí hlásky jako generativní modely ani spektrální odečítání)"""
import numpy as np
from nara_wpe.wpe import wpe
from nara_wpe.utils import stft, istft
def dereverb(x,taps=10,delay=3,iters=3,size=512,shift=128):
    Y=stft(x[None],size=size,shift=shift).transpose(2,0,1)
    Z=wpe(Y,taps=taps,delay=delay,iterations=iters,statistics_mode='full').transpose(1,2,0)
    y=istft(Z,size=size,shift=shift)[0]; return np.pad(y,(0,max(0,len(x)-len(y))))[:len(x)]
