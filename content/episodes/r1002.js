// Reel H2 (1002) — renting smart · clean editorial: a draft lease card, four things to check before signing, then sign.
const DUR=20.6;
const SCENES=[['a',0,14.4],['b',14.4,DUR]];
Tt.style.zIndex=50;
const LINEC='#D6DEEA';

/* ---------- hook: bold claim on white ---------- */
bg('#fff',0,DUR);
caption(640,['חותמים מהר.'],0.05,1.8,{fs:132,c:INK,fo:.15,sfx:'pop'});
caption(800,['קוראים לאט.'],0.6,1.8,{fs:132,c:BLUE,fo:.15,sfx:'pop2'});
const sig0=$('left:290px;top:1010px;width:500px;height:120px',`<svg viewBox="0 0 500 120" width="500" height="120"><path class="s" d="M20 80 C60 20 90 20 100 70 C110 110 140 40 170 60 C200 80 210 30 250 50 C290 70 300 90 340 60 C370 40 400 70 480 55" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round" stroke-dasharray="700" stroke-dashoffset="700"/></svg>`);
at(sig0,0.2,1.8,{anim:'none',fo:.15,up:(l)=>{sig0.querySelector('.s').setAttribute('stroke-dashoffset',700*(1-outCubic(seg(l,0,.5))))}});

/* ---------- the lease card ---------- */
const A0=1.8,END=14.4;
caption(150,['לפני שחותמים:'],A0,END,{fs:92,c:INK,fo:.15,anim:'up',dy:30});
at($(`left:120px;top:300px;width:840px;height:1250px;border-radius:36px;background:#fff;border:4px solid ${LINEC};box-shadow:0 24px 60px rgba(17,17,17,.08)`),A0,END,{anim:'up',dy:80,dur:.45,fo:.15,sfx:'whoosh2'});
at($(`left:120px;top:345px;width:840px;text-align:center;font:600 64px/1.1 F;color:${INK};white-space:nowrap`,'חוזה שכירות'),A0+.1,END,{anim:'fade',fo:.15});
at($(`left:470px;top:432px;width:140px;height:48px;border-radius:24px;background:${SOFT};color:${BL2};font:700 30px/48px R;text-align:center`,'טיוטה'),A0+.2,END,{anim:'fade',fo:.15});
at($(`left:180px;top:505px;width:720px;height:4px;background:${LINEC}`),A0+.2,END,{anim:'fade',fo:.15});

const ROWS=[
 ['כמה זמן?','תאריך התחלה. תאריך סיום.'],
 ['ומה אחרי?','אפשר להאריך? זה כתוב?'],
 ['מי מתקן מה?','דוד, מזגן, נזילה. בכתב.'],
 ['הפיקדון.','כמה, באיזו צורה, ומתי חוזר.']
];
const R0=2.2,STEP=2.5,RT=530,RH=205;
ROWS.forEach(([t1,t2],i)=>{const a=R0+i*STEP,top=RT+i*RH;
  const hi=$(`left:150px;top:${top}px;width:780px;height:180px;border-radius:28px;background:${SOFT}`);
  at(hi,a,END,{anim:'fade',fo:.15,up:(l)=>{hi.style.opacity=(l<STEP?1:0)*clamp(l*4)}});
  const row=$(`left:150px;top:${top}px;width:780px;height:180px`,`
   <div class="w" style="position:absolute;right:150px;top:30px;font:700 62px/1.15 R;color:${INK};text-align:right">${t1}</div>
   <div class="w" style="position:absolute;right:150px;top:108px;font:500 42px/1.15 R;color:${MUTED};text-align:right">${t2}</div>
   <div class="box" style="position:absolute;right:42px;top:52px;width:76px;height:76px;border-radius:20px;border:5px solid ${BLUE};background:#fff">
    <svg viewBox="0 0 76 76" width="66" height="66" style="position:absolute;left:0;top:0"><path class="ck" d="M18 38 L32 52 L58 24" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="70" stroke-dashoffset="70"/></svg></div>`);
  ev(a+1.6,'ding',1+i*.08);
  at(row,a,END,{anim:'up',dy:30,fo:.15,sfx:'swish',up:(l)=>{const k=seg(l,1.6,.25);const bx=row.querySelector('.box');bx.style.background=k>0?BLUE:'#fff';row.querySelector('.ck').setAttribute('stroke-dashoffset',70*(1-outCubic(k)))}});
});
// signature line
const S1=R0+4*STEP+.1;
at($(`left:150px;top:1360px;width:780px;height:150px`,`<div class="w" style="position:absolute;right:30px;top:48px;font:700 46px/1 R;color:${INK}">חתימה:</div><div style="position:absolute;left:40px;right:220px;top:110px;height:4px;background:${INK}"></div>`),S1,END,{anim:'fade',fo:.15});
const sig=$('left:220px;top:1360px;width:500px;height:120px',`<svg viewBox="0 0 500 120" width="500" height="120"><path class="s" d="M20 80 C60 20 90 20 100 70 C110 110 140 40 170 60 C200 80 210 30 250 50 C290 70 300 90 340 60 C370 40 400 70 480 55" fill="none" stroke="${BLUE}" stroke-width="7" stroke-linecap="round" stroke-dasharray="700" stroke-dashoffset="700"/></svg>`);
at(sig,S1+.3,END,{anim:'none',fo:.15,sfx:'whoosh',up:(l)=>{sig.querySelector('.s').setAttribute('stroke-dashoffset',700*(1-outCubic(seg(l,0,.7))))}});
caption(1610,['עכשיו חותמים.'],S1+1.0,END,{fs:96,c:BLUE,fo:.15,sfx:'pop2'});
at($('left:0;top:1845px;width:1080px;text-align:center;font:500 34px/1.2 R;color:#8C8C8C;white-space:nowrap','טיפים כלליים. לא ייעוץ משפטי.'),A0,END,{anim:'none',fo:.15});

/* ---------- homie ---------- */
wordmark(14.4,DUR);
FEAT.noBrokers(14.45,17.0,'מדברים ישר עם מי שמשכירים.');
endCard(17.0,DUR,'קוראים לפני שחותמים.');

function render(t){runItems(t);
  if(t<17.0)turtle(null); else turtleWhite(t,17.0,[],17.25)}
window.AUDIO={dur:DUR,seed:1002,sections:[[0,14.4,'MIN',.15,1,0],[14.4,DUR,'FC',.20,1,1]],ticks:[0,0]};
window.render=render;window.EVENTS=EVENTS;window.SCENES=SCENES;window.DUR=DUR;render(0);
