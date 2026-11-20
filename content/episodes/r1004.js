// Reel H4 (1004) — renting smart · clean editorial: the electricity bill lands, three ways to split it, the payoff is agreeing before moving in.
const DUR=21.0;
const SCENES=[['a',0,15.6],['b',15.6,DUR]];
Tt.style.zIndex=50;
const LINEC='#D6DEEA';

bg('#fff',0,DUR);

/* ---------- hook: a scene, the bill lands ---------- */
const H1=2.3;
caption(250,['חשבון החשמל'],0.05,H1,{fs:120,c:INK,fo:.15,sfx:'pop'});
caption(395,['הגיע.'],0.35,H1,{fs:120,c:BLUE,fo:.15,sfx:'pop2'});
const bill=$(`left:240px;top:640px;width:600px;height:760px;border-radius:36px;background:#fff;border:4px solid ${LINEC};box-shadow:0 24px 60px rgba(17,17,17,.10)`,`
 <div style="position:absolute;left:230px;top:60px;width:140px;height:140px;border-radius:50%;background:${SOFT}">
  <svg viewBox="0 0 140 140" width="140" height="140"><path d="M78 22 L40 78 H66 L58 118 L100 58 H74 Z" fill="${BLUE}"/></svg></div>
 <div class="w" style="position:absolute;left:0;width:600px;top:235px;text-align:center;font:600 60px/1 F;color:${INK}">חשבון חשמל</div>
 ${[330,390,450].map((y,i)=>`<div style="position:absolute;right:70px;top:${y}px;width:${[460,380,420][i]}px;height:22px;border-radius:11px;background:#EEF1F6"></div>`).join('')}
 <div style="position:absolute;left:70px;right:70px;top:530px;height:4px;background:${LINEC}"></div>
 <div class="w" style="position:absolute;right:70px;top:575px;font:700 48px/1 R;color:${INK}">לתשלום:</div>
 <div style="position:absolute;left:70px;top:572px;width:190px;height:56px;border-radius:28px;background:${INK}"></div>
 <div class="w" style="position:absolute;left:0;width:600px;top:670px;text-align:center;font:500 36px/1 R;color:${MUTED}">לחלק בין שלושה חדרים</div>`);
ev(0.18,'thud');
at(bill,0.1,H1,{anim:'pop',dy:-260,s0:.85,dur:.38,fo:.15,rot:-2});
caption(1500,['ואיך מחלקים?'],1.15,H1,{fs:96,c:INK,fo:.15,sfx:'swish'});

/* ---------- three ways ---------- */
const M0=2.4,STEP=3.6,MEND=13.2;
caption(230,['שלוש דרכים לחלק:'],M0,MEND,{fs:88,c:INK,fo:.15,anim:'up',dy:30});
const SEGC=[BLUE,INK,PALE],SEGT=['#fff','#fff',INK];
const ROOMS=['חדר א׳','חדר ב׳','חדר ג׳'];
const METHODS=[
 {t:'שווה בשווה.',s:'פשוט וברור.',f:'מתאים כשהחדרים דומים.',w:[1,1,1]},
 {t:'לפי גודל החדר.',s:'החדר הגדול משלם יותר.',f:'מתאים כשיש חדר עם מרפסת.',w:[1.6,1,.7]},
 {t:'לפי שימוש.',s:'מי שמדליק מזגן כל הלילה,',f:'משלם על המזגן.',w:[.7,1.75,.85],ac:1}
];
const BW=840;
METHODS.forEach((m,i)=>{const a=M0+i*STEP,b=i<2?a+STEP:MEND;
  // number dot + name
  at($(`left:0;top:420px;width:1080px;display:flex;justify-content:center`,`<div style="width:96px;height:96px;border-radius:50%;background:${SOFT};color:${BL2};font:700 54px/96px R;text-align:center;direction:ltr">${i+1}</div>`),a,b,{anim:'pop',fo:.15,sfx:'pop'});
  caption(550,[m.t],a+.1,b,{fs:108,c:i===2?BLUE:INK,fo:.15,anim:'up',dy:30});
  // the bar
  const segs=m.w.map((_,k)=>`<div class="sg" style="position:absolute;top:0;height:230px;border-radius:32px;background:${SEGC[k]}"></div>`).join('');
  const labs=ROOMS.map((r,k)=>`<div class="lb" style="position:absolute;top:262px;width:200px;text-align:center">
     <svg viewBox="0 0 120 120" width="110" height="110" style="display:block;margin:0 auto">${person(60,66,40,k===0?BLUE:INK)}</svg>
     <div class="w" style="font:700 44px/1.2 R;color:${INK};margin-top:6px">${r}</div></div>`).join('');
  const ac=m.ac?`<div class="ac" style="position:absolute;top:-118px;width:200px;height:100px">
     <svg viewBox="0 0 200 100" width="200" height="100"><rect x="30" y="14" width="140" height="56" rx="16" fill="#fff" stroke="${INK}" stroke-width="6"/><path d="M50 52 H150" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
     <path class="air" d="M70 80 q6 10 0 18 M100 80 q6 10 0 18 M130 80 q6 10 0 18" stroke="${BLUE}" stroke-width="5" fill="none" stroke-linecap="round"/></svg></div>`:'';
  const bar=$(`left:120px;top:870px;width:${BW}px;height:560px;direction:ltr`,segs+labs+ac);
  ev(a+.5,'whoosh2');
  at(bar,a+.25,b,{anim:'fade',fo:.15,up:(l)=>{
    const k=outCubic(seg(l,.25,.7));const prev=i===0?[1,1,1]:METHODS[i-1].w;
    const w=prev.map((p,j)=>p+(m.w[j]-p)*(i===0?1:k));const sum=w.reduce((x,y)=>x+y,0);const gap=14;const avail=BW-gap*2;
    let x=0;const sg=bar.querySelectorAll('.sg'),lb=bar.querySelectorAll('.lb');
    // right to left order: room א on the right
    for(let j=0;j<3;j++){const ww=avail*w[j]/sum;const left=BW-x-ww;
      sg[j].style.left=left+'px';sg[j].style.width=ww+'px';
      if(i===0){sg[j].style.transform=`scaleY(${outBack(seg(l,.1+j*.12,.3))})`;sg[j].style.opacity=clamp(seg(l,.1+j*.12,.15))}
      lb[j].style.left=(left+ww/2-100)+'px';x+=ww+gap;
      if(m.ac&&j===1){const acEl=bar.querySelector('.ac');acEl.style.left=(left+ww/2-100)+'px';acEl.style.opacity=clamp(seg(l,.6,.2));
        bar.querySelector('.air').style.opacity=.4+.6*Math.abs(Math.sin(l*5))}}
  }});
  if(m.ac)ev(a+.9,'ding',1.1);
  caption(1360,[m.s],a+.9,b,{fs:62,c:INK,fo:.15,anim:'up',dy:24});
  caption(1455,[m.f],a+1.2,b,{fs:62,c:i===2?BLUE:MUTED,fo:.15,anim:'up',dy:24});
});
at($('left:0;top:1845px;width:1080px;text-align:center;font:500 34px/1.2 R;color:#8C8C8C;white-space:nowrap','טיפים כלליים לשותפים.'),M0,MEND,{anim:'none',fo:.15});

/* ---------- payoff ---------- */
const P0=MEND,P1=15.6;
caption(640,['אין דרך נכונה.'],P0+.05,P1,{fs:120,c:INK,fo:.15,sfx:'pop'});
caption(800,['יש דרך מוסכמת.'],P0+.55,P1,{fs:120,c:BLUE,fo:.15,sfx:'pop2'});
caption(1040,['מחליטים לפני שנכנסים,'],P0+1.1,P1,{fs:62,c:INK,fo:.15,anim:'up',dy:24});
caption(1130,['לא כשהחשבון כבר כאן.'],P0+1.35,P1,{fs:62,c:MUTED,fo:.15,anim:'up',dy:24});

/* ---------- homie ---------- */
wordmark(P1,DUR);
FEAT.matchX(P1+.05,18.2,['תקציב','ניקיון','שעות שינה']);
endCard(18.2,DUR,'מסכמים לפני שמשלמים.');

function render(t){runItems(t);
  if(t<18.2)turtle(null); else turtleWhite(t,18.2,[],18.45)}
window.AUDIO={dur:DUR,seed:1004,sections:[[0,2.4,'FC',.14,0,0],[2.4,15.6,'MIN',.14,1,1],[15.6,DUR,'POP',.19,1,1]],ticks:[2.4,13.2]};
window.render=render;window.EVENTS=EVENTS;window.SCENES=SCENES;window.DUR=DUR;render(0);
