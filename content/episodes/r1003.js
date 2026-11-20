// Reel H3 (1003) — the city · kinetic type: "כמה זה תל אביב?" in three (affectionate, non-statistical) numbers -> one number that matters: 0 brokers.
const DUR=19.6;
const SCENES=[['a',0,11.6],['b',11.6,DUR]];
Tt.style.zIndex=50;

/* ---------- hook (black, question) ---------- */
bg(INK,0,1.6);
caption(640,['כמה זה','תל אביב?'],0.05,1.6,{fs:150,cols:['#fff',NAMEC],fo:.1,sfx:'thud'});
at($('left:0;top:0;width:1080px;height:100px;',sub(1010,'בשלושה מספרים.','#9CA3AF')),0.5,1.6,{anim:'fade',fo:.1});

/* ---------- three numbers ---------- */
const BIG=(c)=>`left:0;top:330px;width:1080px;height:640px;text-align:center;font:600 620px/640px F;color:${c};direction:ltr;unicode-bidi:isolate`;
const tag=(txt,c,a,b)=>at($(`left:0;top:200px;width:1080px;text-align:center;font:500 46px/1.2 R;color:${c};white-space:nowrap`,txt),a,b,{anim:'fade',fo:.08});
// beat 1 (white): parking counts down to 0
bg('#fff',1.6,5.0);
tag('תל אביב · 1/3','#8C8C8C',1.6,5.0);
const n1=$(BIG(BLUE),'9');
at(n1,1.6,5.0,{anim:'pop',s0:.8,dur:.25,fo:.08,up:(l)=>{n1.textContent=String(Math.max(0,9-Math.floor(l/.07)))}});
for(let k=0;k<9;k++)ev(1.6+k*.07,'pin',1);
caption(1030,['חניות פנויות.'],2.35,5.0,{fs:124,c:INK,fo:.08,sfx:'thud'});
at($('left:0;top:0;width:1080px;height:100px;',sub(1220,'ברחוב שלכם. עכשיו.')),3.05,5.0,{anim:'up',dy:24,fo:.08,sfx:'swish'});

// beat 2 (black): one sea
bg(INK,5.0,8.3);
tag('תל אביב · 2/3','#9CA3AF',5.0,8.3);
at($(BIG('#fff'),'1'),5.05,8.3,{anim:'stamp',dur:.3,fo:.08,sfx:'thud'});
caption(1030,['ים.'],5.6,8.3,{fs:140,c:NAMEC,fo:.08,sfx:'pop'});
at($('left:0;top:0;width:1080px;height:100px;',sub(1230,'ו״נלך מחר״. כל יום.','#C9C9C9')),6.3,8.3,{anim:'up',dy:24,fo:.08,sfx:'swish'});

// beat 3 (white): cafes count up 1-2-3
bg('#fff',8.3,11.6);
tag('תל אביב · 3/3','#8C8C8C',8.3,11.6);
const n3=$(BIG(BLUE),'1');
at(n3,8.3,11.6,{anim:'pop',s0:.8,dur:.25,fo:.08,up:(l)=>{n3.textContent=String(Math.min(3,1+Math.floor(l/.22)))}});
[0,.22,.44].forEach((d,i)=>ev(8.3+d,'pop',1+i*.15));
caption(1030,['בתי קפה בבלוק.'],8.95,11.6,{fs:118,c:INK,fo:.08,sfx:'thud'});
at($('left:0;top:0;width:1080px;height:100px;',sub(1220,'ובכולם יודעים מה אתם שותים.')),9.7,11.6,{anim:'up',dy:24,fo:.08,sfx:'swish'});

/* ---------- the number that matters (black) ---------- */
bg(INK,11.6,14.2);
caption(300,['ומספר אחד','שחשוב באמת:'],11.65,14.2,{fs:96,c:'#fff',fo:.05,sfx:'thud'});
at($(`left:0;top:560px;width:1080px;height:600px;text-align:center;font:600 560px/600px F;color:${NAMEC};direction:ltr;unicode-bidi:isolate`,'0'),12.25,14.2,{anim:'stamp',dur:.3,fo:.05,sfx:'thud'});
caption(1190,['מתווכים.'],12.6,14.2,{fs:140,c:'#fff',fo:.05,sfx:'pop'});
at($('left:0;top:0;width:1080px;height:100px;',sub(1390,'ב-homie מפרסמים רק אנשים פרטיים.','#C9C9C9')),13.05,14.2,{anim:'up',dy:24,fo:.05,sfx:'swish'});

/* ---------- wipe + homie ---------- */
wipe(14.2,'ובכל הארץ.');
wordmark(15.4,DUR);
endCard(15.5,DUR,'דירה בעיר. בלי מתווך.');

function render(t){runItems(t);
  if(t<15.4)turtle(null); else turtleWhite(t,15.45,[],16.3)}
window.AUDIO={dur:DUR,seed:1003,sections:[[0,1.6,'DET',.12,1,0],[1.6,11.6,'CG',.13,1,1],[11.6,14.2,'DET',.12,1,0],[14.2,DUR,'POP',.19,1,1]],ticks:[11.6,14.2]};
window.render=render;window.EVENTS=EVENTS;window.SCENES=SCENES;window.DUR=DUR;render(0);
