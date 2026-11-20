// Reel H7 (1007) — the city · kinetic type: Givatayim at 22:00. A clock and a sound (no words) -> quiet -> everything is close -> the same cashier -> "how did you find a flat here?" -> private people, free.
const DUR=21.0;
const SCENES=[['a',0,11.8],['b',11.8,DUR]];
Tt.style.zIndex=50;
const W=(top,txt,c,a,b,o={})=>at($('left:0;top:0;width:1080px;height:100px;',sub(top,txt,c)),a,b,Object.assign({anim:'up',dy:24,fo:.08,sfx:'swish'},o));

/* ---------- hook: a clock and a sound, no words ---------- */
bg(INK,0,2.3);
const clk=$(`left:0;top:600px;width:1080px;height:420px;text-align:center;font:600 330px/420px F;color:#fff;direction:ltr;unicode-bidi:isolate;letter-spacing:6px`,'21:59');
at(clk,0,2.3,{anim:'stamp',dur:.25,fo:.1,up:(l)=>{const on=l>=.75;clk.textContent=on?'22:00':'21:59';clk.style.color=on?NAMEC:'#fff'}});
[.05,.3,.55].forEach(d=>ev(d,'pin',1));ev(.75,'thud',1);
// a thin line that "goes quiet" (sound bar collapsing)
const bars=$(`left:340px;top:1120px;width:400px;height:120px;display:flex;align-items:center;justify-content:space-between;direction:ltr`,Array.from({length:9},()=>`<div style="width:22px;border-radius:11px;background:#fff;height:100px"></div>`).join(''));
at(bars,0,2.3,{anim:'none',fo:.1,up:(l)=>{const k=1-seg(l,.75,.6);[...bars.children].forEach((c,i)=>{const h=8+(k*(30+60*Math.abs(Math.sin(l*11+i*1.7))));c.style.height=h+'px';c.style.background=k<.05?'#555':'#fff'})}});
W(1320,'ושקט.','#9CA3AF',1.45,2.3,{sfx:null,anim:'fade'});

/* ---------- beat 1 (white): this is Givatayim ---------- */
bg('#fff',2.3,4.7);
caption(640,['ככה נשמע','ערב בגבעתיים.'],2.35,4.7,{fs:128,cols:[INK,BLUE],fo:.08,sfx:'thud'});
W(1030,'עשר בלילה, וכל הרחוב כבר בפיג׳מה.',MUTED,3.15,4.7);

/* ---------- beat 2 (black): everything is close ---------- */
bg(INK,4.7,8.5);
caption(300,['הכול קרוב.'],4.75,8.5,{fs:140,c:'#fff',fo:.08,sfx:'thud'});
const QA=(top,q,a,t)=>{at($(`left:0;top:${top}px;width:1080px;text-align:center;font:600 100px/1.1 F;color:#fff;white-space:nowrap`,`${q} <span style="color:${NAMEC}">${a}</span>`),t,8.5,{anim:'pop',dy:50,fo:.08,sfx:'pop',v:1})};
QA(640,'הסופר?','למטה.',5.4);
QA(820,'הקפה?','ממול.',6.15);
QA(1000,'הפארק?','בסוף הרחוב.',6.9);
W(1240,'ומה רחוק? רק הים. קצת.','#C9C9C9',7.6,8.5);

/* ---------- beat 3 (white): the same cashier ---------- */
bg('#fff',8.5,11.8);
caption(520,['ובסופר,','אותו קופאי.'],8.55,11.8,{fs:128,cols:[INK,INK],fo:.08,sfx:'thud'});
const tag=$(`left:240px;top:900px;width:600px;height:150px;border-radius:75px;background:${SOFT};color:${BL2};font:700 72px/150px R;text-align:center`,'״כמו תמיד?״');
at(tag,9.35,11.8,{anim:'pop',s0:.6,fo:.08,sfx:'ding',v:1.1});
W(1120,'עוד לפני ששמתם משהו על הדלפק.',MUTED,10.0,11.8);
at($('left:0;top:1800px;width:1080px;text-align:center;font:500 34px/1 R;color:#9CA3AF','הדמויות והמצבים בדיוניים'),8.5,11.8,{anim:'none',fo:.08});

/* ---------- beat 4 (black): the question ---------- */
bg(INK,11.8,14.6);
caption(560,['ואז שואלים אתכם:'],11.85,14.6,{fs:96,c:'#C9C9C9',fo:.06,sfx:'thud'});
caption(760,['איך מצאתם','פה דירה?'],12.45,14.6,{fs:140,cols:['#fff',NAMEC],fo:.06,sfx:'pop'});

/* ---------- payoff (white): private people, free ---------- */
bg('#fff',14.6,17.0);
caption(170,['ישר מאנשים פרטיים.'],14.65,17.0,{fs:96,c:INK,fo:.08,sfx:'thud'});
FEAT.free(15.1,17.0);

/* ---------- wipe + homie ---------- */
wipe(17.0,null);
wordmark(17.9,DUR);
endCard(18.0,DUR,'מוצאים שכונה. לא רק דירה.');

function render(t){runItems(t);
  if(t<17.9)turtle(null); else turtleWhite(t,17.95,[],18.8)}
window.AUDIO={dur:DUR,seed:1007,sections:[[2.3,11.8,'CG',.13,0,1],[11.8,14.6,'DET',.12,1,0],[14.6,DUR,'POP',.19,1,1]],ticks:[0,0]};
window.render=render;window.EVENTS=EVENTS;window.SCENES=SCENES;window.DUR=DUR;render(0);
