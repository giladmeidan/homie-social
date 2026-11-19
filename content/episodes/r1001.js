// Reel H1 (1001) — renting smart · kinetic type: "5 שאלות לסיור בדירה" -> the sixth question homie removes (tour time slots).
const DUR=20.0;
const SCENES=[['a',0,13.6],['b',13.6,DUR]];
Tt.style.zIndex=50;

/* ---------- hook (black) ---------- */
bg(INK,0,1.6);
caption(690,['5 שאלות','לסיור בדירה.'],0.05,1.6,{fs:140,cols:['#fff',NAMEC],fo:.1,sfx:'thud'});
at($('left:0;top:0;width:1080px;height:100px;',sub(1060,'לפני שמתאהבים בנוף.','#9CA3AF')),0.45,1.6,{anim:'fade',fo:.1});

/* ---------- the five questions (white) ---------- */
bg('#fff',1.6,11.6);
const Q=[
 [['כמה זמן','המים מתחממים?'],'פותחים את הברז. עכשיו.'],
 [['איך הדירה','נשמעת בערב?'],'רעש לא רואים בתמונות.'],
 [['מי גר','מעל ומתחת?'],'השכנים באים עם הדירה.'],
 [['מה כלול','בשכירות?'],'ועד בית? מזגן? מקרר?'],
 [['מתי באמת','אפשר להיכנס?'],'״בערך״ זה לא תאריך.']
];
const T0=1.6,STEP=2.0;
Q.forEach(([lines,why],i)=>{const a=T0+i*STEP,b=a+STEP;
  at($(`left:430px;top:380px;width:220px;height:220px;border-radius:50%;background:${BLUE};color:#fff;text-align:center;font:600 150px/220px F;direction:ltr`,String(i+1)),a,b,{s0:.4,dur:.35,fo:.08,sfx:'pop2'});
  caption(700,lines,a+.15,b,{fs:118,c:INK,cols:[INK,BLUE],fo:.08});
  at($('left:0;top:0;width:1080px;height:100px;',sub(1050,why)),a+.6,b,{anim:'up',dy:24,fo:.08,sfx:'swish'});
});
// progress dots that fill as the list builds
const dots=$('left:0;top:1390px;width:1080px;display:flex;justify-content:center;gap:36px;direction:ltr',[0,1,2,3,4].map(i=>`<div class="d" style="width:44px;height:44px;border-radius:50%;border:5px solid ${BLUE};background:#fff"></div>`).join(''));
at(dots,1.6,11.6,{anim:'none',fo:.1,up:(l,t)=>{[...dots.querySelectorAll('.d')].forEach((d,i)=>{const on=t>=T0+(4-i)*STEP+.1;d.style.background=on?BLUE:'#fff'})}});
at($('left:0;top:1520px;width:1080px;text-align:center;font:500 44px/1.2 R;color:#8C8C8C;white-space:nowrap','שומרים בצד. שואלים בסיור.'),1.9,11.6,{anim:'fade',fo:.1});

/* ---------- the sixth question (black) ---------- */
bg(INK,11.6,13.6);
caption(600,['ואת השאלה'],11.65,13.6,{fs:104,c:'#fff',fo:.05,sfx:'thud'});
caption(780,['״מתי נוח לבוא?״'],12.0,13.6,{fs:118,c:'#fff',fo:.05,sfx:'pop'});
const strike=$(`left:150px;top:838px;width:780px;height:14px;border-radius:7px;background:${BLUE};transform-origin:100% 50%`);
at(strike,12.55,13.6,{anim:'none',fo:.05,sfx:'swish',up:(l)=>{strike.style.transform=`scaleX(${outCubic(seg(l,0,.25))})`}});
caption(1000,['כבר לא צריך.'],12.75,13.6,{fs:112,c:NAMEC,fo:.05});

/* ---------- wipe + homie ---------- */
wipe(13.6,'קיצור דרך.');
wordmark(14.8,DUR);
FEAT.tours(14.85,17.3);
endCard(17.3,DUR,'שמרו את הרשימה לסיור הבא.');

function render(t){runItems(t);
  if(t<14.8)turtle(null); else turtleWhite(t,14.85,[14.85],17.3)}
window.AUDIO={dur:DUR,seed:1001,sections:[[0,1.6,'MIN',.12,0,0],[1.6,11.6,'FC',.13,1,1],[11.6,13.6,'MIN',.12,1,0],[13.6,DUR,'POP',.19,1,1]],ticks:[1.6,11.6]};
window.render=render;window.EVENTS=EVENTS;window.SCENES=SCENES;window.DUR=DUR;render(0);
