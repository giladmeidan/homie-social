// Reel H11 (1011) — renting smart · kinetic type: a "perfect" ad keeps getting better -> too perfect -> three signs of a fake ad (too-good price, money before a viewing, won't talk) -> one sign is enough to stop -> see it first, pay after.
const DUR=23.2;
const SCENES=[['a',0,12.0],['b',12.0,DUR]];
Tt.style.zIndex=50;
const W=(top,txt,c,a,b,o={})=>at($('left:0;top:0;width:1080px;height:100px;',sub(top,txt,c)),a,b,Object.assign({anim:'up',dy:24,fo:.08,sfx:'swish'},o));
const CHK=`<svg width="62" height="62" viewBox="0 0 34 34" style="flex:none"><path d="M6 18 L14 26 L28 9" stroke="${BLUE}" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const NOTE=(a,b,c='#9CA3AF')=>at($(`left:0;top:1800px;width:1080px;text-align:center;font:500 34px/1 R;color:${c}`,'המודעה והציטוטים בדיוניים'),a,b,{anim:'none',fo:.08});

/* ---------- hook (black): the perfect ad keeps getting better ---------- */
const HE=4.4;
bg(INK,0,HE);
caption(300,['דירה מושלמת.'],0.05,HE,{fs:140,c:'#fff',fo:.1,sfx:'thud'});
const AD=['מרפסת עם נוף.','משופצת מהיסוד.','מחיר שלא רואים באזור.','פנויה מחר בבוקר.'];
AD.forEach((t,i)=>{const a=0.55+i*0.42;
  at($(`left:0;top:${600+i*130}px;width:1080px;display:flex;justify-content:center;align-items:center;gap:22px;direction:rtl;font:500 72px/1.1 R;color:#fff`,`${CHK}<span class="w">${t}</span>`),a,HE,{anim:'pop',dy:30,s0:.8,fo:.1,sfx:'ding',v:1+i*.12})});
caption(1250,['…יותר מדי','מושלמת.'],2.6,HE,{fs:116,cols:[NAMEC,NAMEC],fo:.1,sfx:'thud',anim:'stamp',dur:.25});
NOTE(0,HE,'#6B7280');

/* ---------- turn (white): three signs ---------- */
const T0=HE,T1=6.0;
bg('#fff',T0,T1);
caption(640,['מודעה מזויפת?'],T0+.05,T1,{fs:128,c:INK,fo:.08,sfx:'pop2'});
caption(840,['שלושה סימנים.'],T0+.55,T1,{fs:128,c:BLUE,fo:.08,sfx:'pop'});

/* ---------- the three signs ---------- */
function sign(n,a,b,dark,quote,big,line){
  const fg=dark?'#fff':INK, cardBg=dark?DARK2:SOFT, qc=dark?'#E5E7EB':INK, sc=dark?'#C9C9C9':MUTED;
  bg(dark?INK:'#fff',a,b);
  at($(`left:0;top:280px;width:1080px;display:flex;justify-content:center`,`<div class="w" style="height:96px;padding:0 44px;border-radius:48px;background:${dark?BLUE:INK};color:#fff;font:700 52px/96px R">סימן ${n}</div>`),a+.02,b,{anim:'pop',fo:.08,sfx:'pop'});
  const qs=Array.isArray(quote)?quote:[quote];
  const q=$(`left:90px;top:460px;width:900px;min-height:200px;border-radius:44px;background:${cardBg};display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:40px 50px;box-sizing:border-box`,
    qs.map((t,k)=>`<div style="position:relative;display:inline-block"><div class="w" style="font:500 62px/1.25 R;color:${qc};text-align:center;white-space:nowrap">${k===0?'״':''}${t}${k===qs.length-1?'״':''}</div><div class="st" style="position:absolute;right:-14px;left:-14px;top:50%;height:10px;margin-top:-5px;border-radius:5px;background:${BLUE};transform-origin:100% 50%;transform:scaleX(0)"></div></div>`).join(''));
  ev(a+1.35,'swish');
  at(q,a+.3,b,{anim:'pop',dy:40,s0:.9,fo:.08,sfx:'msg',up:(l)=>{q.querySelectorAll('.st').forEach((e,k)=>{e.style.transform=`scaleX(${outCubic(seg(l,1.05+k*.2,.3))})`})}});
  caption(860,big,a+1.5,b,{fs:124,cols:[fg,BLUE],fo:.08,sfx:'thud'});
  W(1200,line,sc,a+2.0,b);
}
const S1=T1,S2=9.4,S3=12.8,S4=16.2;
sign(1,S1,S2,true,'מחיר שלא רואים באזור.',['המחיר','מושלם מדי.'],'זול מכל השאר? שואלים למה.');
sign(2,S2,S3,false,['תעבירו דמי רצינות,','ואשלח קוד לדלת.'],['כסף','לפני סיור.'],'לא מעבירים כסף לפני שרואים.');
sign(3,S3,S4,true,'אני לא בארץ. רק הודעות.',['לא מוכנים','לדבר.'],'בלי שיחה ובלי סיור? בלי דירה.');
NOTE(S1,S4);

/* ---------- payoff (white): one is enough ---------- */
const P1=18.6;
bg('#fff',S4,P1);
const pills=$(`left:0;top:300px;width:1080px;display:flex;justify-content:center;gap:24px;direction:rtl`,[1,2,3].map(i=>`<div class="pl" style="width:96px;height:96px;border-radius:50%;background:${PALE};color:${BL2};font:700 52px/96px R;text-align:center;direction:ltr">${i}</div>`).join(''));
at(pills,S4+.05,P1,{anim:'pop',fo:.08,sfx:'pop',up:(l)=>{[...pills.children].forEach((c,i)=>{const on=i===0&&l>=.95;c.style.background=on?BLUE:(l>=.95?'#EEF1F6':PALE);c.style.color=on?'#fff':(l>=.95?'#C4C9D2':BL2);c.style.transform=on?`scale(${1+.15*Math.sin(seg(l,.95,.3)*Math.PI)})`:''})}});
ev(S4+1.0,'ding',1.2);
caption(560,['לא צריך שלושה.'],S4+.35,P1,{fs:112,c:INK,fo:.08,sfx:'thud'});
caption(720,['מספיק אחד','כדי לעצור.'],S4+1.0,P1,{fs:124,cols:[BLUE,INK],fo:.08,sfx:'pop2'});
caption(1120,['רואים בעיניים.','ורק אז משלמים.'],S4+1.7,P1,{fs:84,cols:[INK,MUTED],fo:.08,sfx:'swish',anim:'up',dy:30});

/* ---------- wipe + homie ---------- */
wipe(P1,null);
wordmark(P1+.9,DUR);
endCard(P1+1.0,DUR,'רואים לפני שמשלמים.');

function render(t){runItems(t);
  if(t<P1+.9)turtle(null); else turtleWhite(t,P1+.95,[],P1+1.8)}
window.AUDIO={dur:DUR,seed:1011,sections:[[0,HE,'FC',.13,0,1],[HE,S4,'DET',.12,1,0],[S4,DUR,'POP',.19,1,1]],ticks:[T1,S3]};
window.render=render;window.EVENTS=EVENTS;window.SCENES=SCENES;window.DUR=DUR;render(0);
