// Reel H9 (1009) — homie in action · clean editorial: "spot the difference". Two listings, same match score, opposite reasons. The reasons are what decide.
const DUR=21.0;
const SCENES=[['a',0,14.2],['b',14.2,DUR]];
Tt.style.zIndex=50;
const LINEC='#D6DEEA';

bg('#fff',0,DUR);

/* ---------- hook: spot the difference ---------- */
const CEND=14.2;
caption(170,['מצאו את'],0.05,CEND,{fs:118,c:INK,fo:.2,sfx:'pop'});
caption(300,['ההבדל.'],0.3,CEND,{fs:118,c:BLUE,fo:.2,sfx:'pop2'});

/* ---------- two listing cards ---------- */
const ok=`<svg width="50" height="50" viewBox="0 0 50 50"><circle cx="25" cy="25" r="23" fill="${BLUE}"/><path d="M14 26 L22 34 L37 17" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const no=`<svg width="50" height="50" viewBox="0 0 50 50"><circle cx="25" cy="25" r="21" fill="#fff" stroke="#B8BEC8" stroke-width="4"/><path d="M16 25 H34" stroke="#9AA1AC" stroke-width="5" stroke-linecap="round"/></svg>`;
const CARDS=[
 {x:560,label:'מודעה א׳',rows:[[1,'תקציב'],[1,'אזור'],[0,'שעות שינה']]},
 {x:90, label:'מודעה ב׳',rows:[[1,'שעות שינה'],[1,'ניקיון'],[0,'תקציב']]}
];
const R0=5.0,RSTEP=.75;            // reasons start, step between rows
const LIT=[[10.5,12.3],[12.3,14.0]]; // card 0 lit, then card 1 lit
CARDS.forEach((c,ci)=>{
  const rows=c.rows.map(([g,txt],ri)=>`<div class="row" style="position:absolute;right:36px;top:${560+ri*84}px;height:60px;display:flex;align-items:center;gap:18px;direction:rtl;opacity:0">
     ${g?ok:no}<div class="w" style="font:${g?700:500} 44px/1 R;color:${g?INK:'#9AA1AC'}">${txt}</div></div>`).join('');
  const el=$(`left:${c.x}px;top:510px;width:430px;height:830px;border-radius:40px;background:#fff;border:4px solid ${LINEC};box-shadow:0 22px 56px rgba(17,17,17,.09);overflow:hidden`,`
   <div class="w" style="position:absolute;left:0;width:422px;top:34px;text-align:center;font:700 34px/1 R;color:${MUTED}">${c.label}</div>
   <div class="ring" style="position:absolute;left:96px;top:92px;width:230px;height:230px">${ringHTML(230,24)}</div>
   <div class="w" style="position:absolute;left:0;width:422px;top:340px;text-align:center;font:700 36px/1 R;color:${BL2}">התאמה</div>
   <div class="w" style="position:absolute;left:0;width:422px;top:405px;text-align:center;font:600 40px/1 F;color:${INK}">חדר בדירת שותפים</div>
   <div class="w" style="position:absolute;left:0;width:422px;top:460px;text-align:center;font:500 34px/1 R;color:${MUTED}">גבעתיים</div>
   <div style="position:absolute;left:36px;right:36px;top:525px;height:4px;background:${LINEC}"></div>
   <div class="why w" style="position:absolute;left:111px;top:600px;width:200px;height:84px;border-radius:42px;border:4px solid ${BLUE};color:${BL2};font:700 44px/76px R;text-align:center;opacity:0">למה?</div>
   ${rows}`);
  const a=0.35+ci*.18;
  at(el,a,CEND,{anim:'up',dy:140,dur:.42,fo:.2,sfx:ci?'whoosh2':'whoosh',up:(l,t)=>{
    const p=outCubic(seg(t,1.5,1.6));setRing(el.querySelector('.ring'),.82*p,Math.round(82*p)+'%');
    const w=el.querySelector('.why');const wa=seg(t,3.6,.3),wb=seg(t,R0-.15,.2);w.style.opacity=clamp(wa*3)*(1-wb);
    w.style.transform=`scale(${.7+.3*outBack(wa)-(t>4.4&&t<4.75?.08*Math.sin(seg(t,4.4,.35)*Math.PI):0)})`;
    [...el.querySelectorAll('.row')].forEach((r,ri)=>{const k=seg(t,R0+ci*.35+ri*RSTEP*2,.3);r.style.opacity=clamp(k*3);r.style.transform=`translateX(${(1-outBack(k))*-40}px)`});
    const on=t>=LIT[ci][0]&&t<LIT[ci][1],other=t>=LIT[1-ci][0]&&t<LIT[1-ci][1];
    el.style.borderColor=on?BLUE:LINEC;el.style.borderWidth=on?'7px':'4px';
    if(other)el.style.opacity=(el.style.opacity||1)*.4;
    el.style.transform+=on?' scale(1.03)':'';
  }});
});
ev(3.1,'ding',1.15);ev(3.12,'ding',1.0);
ev(3.6,'pop');ev(4.45,'pin');
for(let ri=0;ri<3;ri++)for(let ci=0;ci<2;ci++)ev(R0+ci*.35+ri*RSTEP*2,ri===2?'pin':'ding',ri===2?1:1+ri*.12);

/* ---------- lines under the cards ---------- */
caption(1440,['אותו ציון.'],2.9,4.9,{fs:84,c:INK,fo:.15,anim:'up',dy:26});
caption(1550,['אז למה?'],3.6,4.9,{fs:84,c:BLUE,fo:.15,anim:'up',dy:26});
caption(1440,['אותו מספר.'],8.6,10.4,{fs:84,c:INK,fo:.15,anim:'up',dy:26,sfx:'swish'});
caption(1550,['סיבות הפוכות.'],8.9,10.4,{fs:84,c:BLUE,fo:.15,anim:'up',dy:26});
caption(1440,['חשוב לכם התקציב?'],10.5,12.3,{fs:80,c:INK,fo:.12,anim:'up',dy:26,sfx:'pop2'});
caption(1550,['מודעה א׳.'],10.8,12.3,{fs:80,c:BLUE,fo:.12,anim:'up',dy:26});
caption(1440,['ישנים מוקדם?'],12.3,14.0,{fs:80,c:INK,fo:.12,anim:'up',dy:26,sfx:'pop2'});
caption(1550,['מודעה ב׳.'],12.6,14.0,{fs:80,c:BLUE,fo:.12,anim:'up',dy:26});
at($('left:0;top:1845px;width:1080px;text-align:center;font:500 34px/1.2 R;color:#8C8C8C;white-space:nowrap','מודעות ונתונים להדגמה'),0.4,CEND,{anim:'none',fo:.2});

/* ---------- payoff ---------- */
const P0=14.2,P1=16.7;
caption(640,['ציון בלי סיבות'],P0+.05,P1,{fs:104,c:INK,fo:.15,sfx:'whoosh'});
caption(790,['זה סתם מספר.'],P0+.45,P1,{fs:104,c:BLUE,fo:.15,sfx:'pop2'});
caption(1010,['הסיבות אומרות'],P0+1.1,P1,{fs:68,c:MUTED,fo:.15,anim:'up',dy:24});
caption(1100,['מה מתאים דווקא לכם.'],P0+1.35,P1,{fs:68,c:MUTED,fo:.15,anim:'up',dy:24});

/* ---------- homie ---------- */
wordmark(P1,DUR);
const fin=$('left:0;top:380px;width:1080px;height:900px;',`${hl(250,'כל ציון התאמה')}${hl(390,'בא עם הסיבות.',BLUE)}${sub(560,'בשוק הדירות והשותפים.')}`);
at(fin,P1+.05,18.7,{dy:90,s0:.92,dur:.4,sfx:'pop2'});
ev(P1+.5,'ding',1.2);
endCard(18.7,DUR,'הציון מסביר את עצמו.');

function render(t){runItems(t);turtleWhite(t,P1+.05,[18.7],18.95)}
window.AUDIO={dur:DUR,seed:1009,sections:[[0,5.0,'CG',.14,0,0],[5.0,14.2,'DET',.13,1,1],[14.2,DUR,'POP',.19,1,1]],ticks:[1.5,3.1]};
window.render=render;window.EVENTS=EVENTS;window.SCENES=SCENES;window.DUR=DUR;render(0);
