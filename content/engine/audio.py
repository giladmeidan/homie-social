# usage: python3 audio.py r19  -> audio/r19.wav   (music + SFX timed from r19_events.json)
import numpy as np, json, sys, os
from scipy.io import wavfile
from scipy.signal import butter, lfilter
reel=sys.argv[1]; SR=44100
CFGS={
 'r19':dict(dur=23.6,seed=19,sections=[(0,5.2,'CG',.13,0,0),(5.2,10.4,'DET',.12,1,0),(10.4,23.6,'POP',.19,1,1)],ticks=(5.2,10.4)),
 'r20':dict(dur=25.4,seed=20,sections=[(0,6.2,'FC',.13,0,0),(6.2,11.95,'MIN',.12,0,0),(11.95,25.4,'POP',.19,1,1)],ticks=(8.6,11.95)),
 'r22':dict(dur=21.8,seed=22,sections=[(0,10.4,'DET',.12,1,0),(10.4,21.8,'POP',.19,1,1)],ticks=(1.8,10.4)),
 'r23':dict(dur=21.0,seed=23,sections=[(0,6.2,'FC',.13,0,0),(6.2,10.5,'MIN',.12,0,0),(10.5,21.0,'POP',.19,1,1)],ticks=(3.0,10.5)),
 'r24':dict(dur=22.2,seed=24,sections=[(0,8.7,'CG',.13,0,0),(8.7,22.2,'POP',.19,1,1)],ticks=(0,0)),
 'r25':dict(dur=20.8,seed=25,sections=[(0,11.6,'DET',.11,1,0),(11.6,20.8,'POP',.19,1,1)],ticks=(0,0)),
 'r26':dict(dur=21.8,seed=26,sections=[(0,10.4,'DET',.12,1,0),(10.4,21.8,'POP',.19,1,1)],ticks=(0,0)),
 'r27':dict(dur=22.4,seed=27,sections=[(0,11.5,'FC',.13,0,0),(11.5,22.4,'POP',.19,1,1)],ticks=(0,0)),
 'r28':dict(dur=22.2,seed=28,sections=[(0,8.7,'CG',.13,0,0),(8.7,22.2,'POP',.19,1,1)],ticks=(0,0)),
 'r29':dict(dur=21.9,seed=29,sections=[(0,11.6,'DET',.11,1,0),(11.6,21.9,'POP',.19,1,1)],ticks=(0,0)),
 'r30':dict(dur=21.8,seed=30,sections=[(0,10.4,'DET',.12,1,0),(10.4,21.8,'POP',.19,1,1)],ticks=(0,0)),
 'r31':dict(dur=22.1,seed=31,sections=[(0,11.6,'DET',.11,1,0),(11.6,22.1,'POP',.19,1,1)],ticks=(0,0)),
}
if reel in CFGS: CFG=CFGS[reel]
else:  # self-contained episode: the episode js defines window.AUDIO, render.py dumps it to <reel>_cfg.json
    _c=json.load(open(f'{reel}_cfg.json')); CFG=dict(dur=_c['dur'],seed=_c.get('seed',1),sections=[tuple(s) for s in _c['sections']],ticks=tuple(_c.get('ticks',(0,0))))
DUR=CFG['dur'];N=int(SR*DUR);rs=np.random.RandomState(CFG['seed']);out=np.zeros(N)
def add(sig,t,g=1.0):
    i=int(t*SR)
    if i>=N or i<0: return
    j=min(N,i+len(sig)); out[i:j]+=sig[:j-i]*g
def env(n,a=0.003,d=6.0):
    x=np.arange(n)/SR; e=np.exp(-d*x); k=int(a*SR)
    if k>0: e[:k]*=np.linspace(0,1,k)
    return e
def pluck(f,dur=0.5,d=7.0):
    n=int(dur*SR);x=np.arange(n)/SR
    s=np.sin(2*np.pi*f*x)+0.45*np.sin(2*np.pi*2*f*x)*np.exp(-9*x)+0.2*np.sin(2*np.pi*3.01*f*x)*np.exp(-14*x)
    return s*env(n,0.004,d)
def bp(sig,lo,hi): b,a=butter(2,[lo/(SR/2),hi/(SR/2)],'band');return lfilter(b,a,sig)
def lp(sig,f): b,a=butter(2,f/(SR/2),'low');return lfilter(b,a,sig)
midi=lambda m:440*2**((m-69)/12)
beat=0.6
C=(48,[60,64,67,72]);G=(43,[59,62,67,71]);Am=(45,[60,64,69,72]);F=(41,[60,65,69,72]);Amn=(45,[57,60,64,69]);Gm=(43,[59,62,67,71]);Ee=(40,[56,59,64,68])
PROG={'CG':[C,G],'FC':[F,C],'DET':[Amn,F,Amn,Ee],'MIN':[Amn,F,Amn,Gm],'POP':[C,G,Am,F]}
def section(t0,t1,prog,gain,bass,hat,staccato=False):
    t=t0;bar=0
    while t<t1-1e-6:
        root,tones=prog[bar%len(prog)];pat=[0,1,2,3,2,1,2,1]
        for k in range(8):
            tt=t+k*beat/2
            if tt>=t1: break
            add(pluck(midi(tones[pat[k]]),0.3 if staccato else 0.45,14 if staccato else 7),tt,gain*(1.0 if k%2==0 else .7))
            if hat and k%2==1: add(bp(rs.randn(int(.05*SR)),5000,12000)*env(int(.05*SR),.001,70),tt,0.10)
        if bass:
            for k in range(4):
                tt=t+k*beat
                if tt<t1: add(np.sin(2*np.pi*midi(root)*np.arange(int(.4*SR))/SR)*env(int(.4*SR),.005,5),tt,0.32)
        t+=4*beat;bar+=1
for (a,b,name,g,bass,hat) in CFG['sections']: section(a,b,PROG[name],g,bass,hat,staccato=name in('DET','MIN'))
a,b=CFG['ticks']
for k in range(int((b-a)/0.6)): add(bp(rs.randn(int(.03*SR)),2500,5000)*env(int(.03*SR),.001,120),a+k*0.6,0.10)
def sweep(f0,f1,dur,d=8,vib=0):
    n=int(dur*SR);x=np.arange(n)/SR;f=f0+(f1-f0)*(x/dur)
    ph=2*np.pi*np.cumsum(f)/SR+(vib*np.sin(2*np.pi*14*x) if vib else 0)
    return np.sin(ph)*env(n,.003,d)
def tone(f,dur,d=4):
    n=int(dur*SR);x=np.arange(n)/SR
    return (np.sin(2*np.pi*f*x)+.5*np.sin(2*np.pi*2*f*x)+.3*np.sin(2*np.pi*3*f*x))*env(n,.01,d)
for e in json.load(open(f'{reel}_events.json')):
    t,k,v=e['t'],e['k'],e['v']
    if k=='pop': add(sweep(380*v,880*v,.07,30),t,0.30)
    elif k=='msg': add(sweep(900,1300,.05,40),t,0.22);add(sweep(1300,1700,.05,40),t+.06,0.18)
    elif k=='pop2': add(sweep(520,1040,.09,26),t,0.30);add(sweep(780,1560,.09,30),t+0.05,0.16)
    elif k=='thud': add(sweep(150,45,.28,10),t,0.7);add(lp(rs.randn(int(.06*SR)),1500)*env(int(.06*SR),.001,50),t,0.4)
    elif k=='dun': add(lp(tone(midi(45),.35,5),900),t,0.45);add(lp(tone(midi(44),.9,3),900),t+.38,0.5)
    elif k=='swish':
        n=int(.18*SR);x=np.arange(n)/SR;add(bp(rs.randn(n),1200,7000)*np.sin(np.pi*x/.18)**2,t,0.30)
    elif k=='pin': add(bp(rs.randn(int(.03*SR)),800,4000)*env(int(.03*SR),.0005,90),t,0.45);add(sweep(700,500,.06,40),t,0.2)
    elif k in('whoosh','whoosh2'):
        d=.55 if k=='whoosh' else .5;n=int(d*SR);x=np.arange(n)/SR
        add(bp(rs.randn(n),300 if k=='whoosh' else 600,3500 if k=='whoosh' else 6000)*np.sin(np.pi*x/d)**2,t,0.55 if k=='whoosh' else .4)
    elif k=='ding':
        f=1318*v;n=int(.6*SR);x=np.arange(n)/SR
        add((np.sin(2*np.pi*f*x)+.3*np.sin(2*np.pi*2.76*f*x)*np.exp(-12*x))*env(n,.002,6),t,0.22)
    elif k=='boing': add(sweep(180,520,.28,7,vib=1.5),t,0.30)
fo=int(.7*SR);out[-fo:]*=np.linspace(1,0,fo)
out=out/np.max(np.abs(out))*0.89
os.makedirs('audio',exist_ok=True);wavfile.write(f'audio/{reel}.wav',SR,(out*32767).astype(np.int16));print('ok',reel)
