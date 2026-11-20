// Reel H6 (1006) — homie in action · clean editorial: "signs that people already applied before you" (a list that builds), then the listing that simply shows the exact number.
const DUR=21.0;
const SCENES=[['a',0,16.0],['b',16.0,DUR]];
Tt.style.zIndex=50;
const LINEC='#D6DEEA';

bg('#fff',0,DUR);

/* ---------- hook: "סימנים ש…" ---------- */
const L0=0.05,LEND=11.2;
caption(200,['סימנים שכבר'],L0,LEND,{fs:116,c:INK,fo:.2,sfx:'pop'});
caption(335,['הגישו לפניכם:'],0.4,LEND,{fs:116,c:BLUE,fo:.2,sfx:'pop2'});

/* ---------- the list builds row by row ---------- */
const SIGNS=[
 {a:1.9, l1:'התור לסיור',       l2:'מתחיל בחדר המדרגות.'},
 {a:4.9, l1:'על "עדיין רלוונטי?"', l2:'עונים אחרי שבוע.'},
 {a:7.9, l1:'בסיור קוראים לכם',  l2:'"זה עם החולצה הכחולה?"'}
];
SIGNS.forEach((s,i)=>{const top=650+i*400;
  const row=$(`left:90px;top:${top}px;width:900px;height:330px`,`
   <div style="position:absolute;right:0;top:18px;width:96px;height:96px;border-radius:50%;background:${SOFT};color:${BL2};font:700 54px/96px R;text-align:center;direction:ltr">${i+1}</div>
   <div class="w" style="position:absolute;right:130px;top:10px;font:600 76px/1.1 F;color:${INK}">${s.l1}</div>
   <div class="w" style="position:absolute;right:130px;top:112px;font:500 60px/1.15 R;color:${i===2?BLUE:MUTED}">${s.l2}</div>
   <div class="ln" style="position:absolute;right:0;top:250px;height:4px;background:${LINEC};width:0"></div>`);
  at(row,s.a,LEND,{anim:'up',dy:50,dur:.38,fo:.2,sfx:i===2?'pop2':'pop',up:(l)=>{row.querySelector('.ln').style.width=(900*outCubic(seg(l,.3,.6)))+'px'}});
  ev(s.a+.55,'pin');
});
at($('left:0;top:1845px;width:1080px;text-align:center;font:500 34px/1.2 R;color:#8C8C8C;white-space:nowrap','המצבים בדיוניים · נתוני הדגמה'),1.9,16.0,{anim:'none',fo:.15});

/* ---------- payoff: just see the number ---------- */
const P0=LEND,P1=16.0;
caption(210,['או שפשוט'],P0+.05,P1,{fs:104,c:INK,fo:.15,sfx:'swish'});
caption(330,['רואים את המספר.'],P0+.35,P1,{fs:104,c:BLUE,fo:.15,sfx:'pop2'});
const N=12;
const cnt=(l)=>Math.round(N*outCubic(seg(l,.7,1.4)));
const card=$(`left:150px;top:560px;width:780px;height:820px;border-radius:40px;background:#fff;border:4px solid ${LINEC};box-shadow:0 24px 60px rgba(17,17,17,.10);overflow:hidden`,`
 <div style="position:absolute;left:0;top:0;width:780px;height:300px;background:${SOFT}">
  <svg viewBox="0 0 780 300" width="780" height="300">
   <rect x="250" y="70" width="280" height="190" rx="10" fill="#fff" stroke="${PALE}" stroke-width="8"/>
   <path d="M230 80 L390 10 L550 80" fill="none" stroke="${PALE}" stroke-width="10" stroke-linejoin="round" stroke-linecap="round"/>
   <rect x="290" y="110" width="80" height="70" rx="6" fill="${PALE}"/><rect x="410" y="110" width="80" height="70" rx="6" fill="${PALE}"/>
   <rect x="360" y="195" width="60" height="65" rx="6" fill="${PALE}"/></svg></div>
 <div class="w" style="position:absolute;right:50px;top:335px;font:600 62px/1.1 F;color:${INK}">חדר בדירת שותפים</div>
 <div class="w" style="position:absolute;right:50px;top:420px;font:500 44px/1.1 R;color:${MUTED}">גבעתיים · כניסה בחודש הבא</div>
 <div style="position:absolute;left:50px;right:50px;top:505px;height:4px;background:${LINEC}"></div>
 <div class="w" style="position:absolute;right:50px;top:580px;font:700 52px/1.1 R;color:${INK}">כבר הגישו:</div>
 <div class="num" style="position:absolute;left:50px;top:545px;width:220px;height:130px;border-radius:65px;background:${BLUE};color:#fff;font:700 84px/130px R;text-align:center;direction:ltr"></div>
 <div class="w" style="position:absolute;right:50px;top:700px;font:500 40px/1.1 R;color:${MUTED}">מעודכן בכל הגשה</div>`);
for(let k=1;k<=6;k++)ev(P0+.6+.7+k*.22,'pin');
ev(P0+.6+2.15,'ding',1.2);
at(card,P0+.6,P1,{anim:'up',dy:120,dur:.45,fo:.15,sfx:'whoosh2',up:(l)=>{const el=card.querySelector('.num');el.textContent=cnt(l);
  const k=seg(l,2.1,.3);el.style.transform=`scale(${1+Math.sin(k*Math.PI)*.12})`}});
caption(1450,['יודעים מול מה עומדים,'],P0+2.6,P1,{fs:62,c:INK,fo:.15,anim:'up',dy:24});
caption(1540,['עוד לפני שכותבים.'],P0+2.9,P1,{fs:62,c:BLUE,fo:.15,anim:'up',dy:24});

/* ---------- homie ---------- */
wordmark(P1,DUR);
FEAT.applicants(P1+.05,18.3);
endCard(18.3,DUR,'יודעים כמה. לפני שמגישים.');

function render(t){runItems(t);turtleWhite(t,P1+.05,[18.3],18.55)}
window.AUDIO={dur:DUR,seed:1006,sections:[[0,1.9,'FC',.14,0,1],[1.9,16.0,'MIN',.13,1,0],[16.0,DUR,'FC',.19,1,1]],ticks:[1.9,11.2]};
window.render=render;window.EVENTS=EVENTS;window.SCENES=SCENES;window.DUR=DUR;render(0);
