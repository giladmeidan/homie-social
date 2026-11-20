# episodes define window.AUDIO={dur,seed,sections:[[t0,t1,'DET'|'POP'|'FC'|'MIN'|'CG',gain,bass,hat],..],ticks:[a,b]} -> <reel>_cfg.json (used by audio.py)
# usage: python3 render.py r19            -> scenes/r19_<scene>.mp4 + r19_events.json
#        python3 render.py r19 --still 3.2 7.9   -> stills/r19_3.2.jpg ...
import subprocess, json, os, sys
from playwright.sync_api import sync_playwright
FPS=30
reel=sys.argv[1]; args=sys.argv[2:]
os.makedirs('scenes',exist_ok=True); os.makedirs('stills',exist_ok=True)
with sync_playwright() as p:
    b=p.chromium.launch()
    pg=b.new_page(viewport={'width':1080,'height':1920})
    pg.on('pageerror',lambda e:print('ERR',e))
    pg.goto('file://'+os.path.abspath('reel.html')+'?r='+reel)
    for f in ["600 100px F","500 50px R","700 50px R"]:
        pg.evaluate(f"document.fonts.load('{f}','שלום homie ₪0 92%')")
    pg.wait_for_timeout(800)
    # window.STRETCH (e.g. 1.12) plays the same reel slower: every time (frames, scenes, sound events,
    # music sections, voice lines) is scaled by it. 1 = as written.
    K=float(pg.evaluate("window.STRETCH||1"))
    if args and args[0]=='--still':
        for t in args[1:]:
            pg.evaluate(f"render({float(t)/K})"); pg.screenshot(path=f'stills/{reel}_{t}.jpg',type='jpeg',quality=85)
        b.close(); sys.exit()
    json.dump([dict(e,t=e['t']*K) for e in pg.evaluate("window.EVENTS")],open(f'{reel}_events.json','w'))
    _cfg=pg.evaluate("window.AUDIO||null")
    if _cfg is not None:
        _cfg['dur']=round(_cfg['dur']*K,3)
        _cfg['sections']=[[x[0]*K,x[1]*K]+list(x[2:]) for x in _cfg['sections']]
        if _cfg.get('ticks'): _cfg['ticks']=[x*K for x in _cfg['ticks']]
        json.dump(_cfg,open(f'{reel}_cfg.json','w'))
    _voice=pg.evaluate("window.VOICE||null")   # optional ElevenLabs voiceover, used by voice.py
    if _voice is not None:
        _voice['say']=[[a*K,b*K,x] for a,b,x in pg.evaluate("window.SAY||[]")]   # [start,end,text] of every item marked say
        if _voice.get('lines'): _voice['lines']=[[t*K,x] for t,x in _voice['lines']]
        json.dump(_voice,open(f'{reel}_voice.json','w'),ensure_ascii=False)
    for name,t0,t1 in pg.evaluate("window.SCENES"):
        if args and name not in args: continue
        n0,n1=round(t0*K*FPS),round(t1*K*FPS)
        tmp=f'scenes/{reel}_{name}.part.mp4'
        ff=subprocess.Popen(['ffmpeg','-y','-loglevel','error','-f','image2pipe','-framerate',str(FPS),'-c:v','mjpeg','-i','-','-c:v','libx264','-crf','18','-preset','veryfast','-pix_fmt','yuv420p','-r',str(FPS),tmp],stdin=subprocess.PIPE)
        for n in range(n0,n1):
            pg.evaluate(f"render({n/FPS/K})")
            ff.stdin.write(pg.screenshot(type='jpeg',quality=92))
        ff.stdin.close()
        if ff.wait()==0: os.rename(tmp,f'scenes/{reel}_{name}.mp4'); print('done',reel,name,n1-n0,flush=True)
        else: print('FAIL',name,flush=True)
    b.close()
