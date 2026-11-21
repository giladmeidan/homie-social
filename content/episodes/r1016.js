// Reel H16 (1016) — renting smart · clean editorial: "what's included in the rent?" A sorting game: five bill cards (ארנונה, ועד בית, מים, אינטרנט, חשמל) and three columns (כלול / לא כלול / לשאול). Every confident guess bounces back to "לשאול" -> the fullest column is "ask" -> ask before, not on the first bill.
const DUR=21.6;
const SCENES=[['a',0,3.0],['b',3.0,12.4],['c',12.4,DUR]];
Tt.style.zIndex=50;
const LINEC='#D6DEEA',GREY='#9AA1AC';

/* ---------- the board: three columns (RTL: כלול on the right, לשאול on the left) ---------- */
const COLS=['כלול','לא כלול','לשאול'];
const COLX=[600,310,20];               // board-local x of each column (width 280)
const CARDS=['ארנונה','ועד בית','מים','אינטרנט','חשמל'];
const slot=(c,k)=>({x:COLX[c]+15,y:140+k*118});
const DECK={x:325,y:850};
const qBadge=`<div class="qb" style="position:absolute;left:12px;top:26px;width:46px;height:46px;border-radius:50%;background:${BLUE};color:#fff;font:600 34px/46px F;text-align:center">?</div>`;
const cardHTML=(txt,ask)=>`<div class="cd" style="position:absolute;left:0;top:0;width:250px;height:100px;box-sizing:border-box;border-radius:22px;background:${ask?SOFT:'#fff'};border:4px solid ${ask?BLUE:INK};box-shadow:0 10px 24px rgba(17,17,17,.08)">
  <div class="w" style="position:absolute;right:18px;top:0;font:700 41px/92px R;color:${ask?BL2:INK};direction:rtl;white-space:nowrap">${txt}</div>${ask?qBadge:''}</div>`;
const colHTML=(hiAsk)=>COLS.map((c,i)=>{const ask=i===2,hi=ask&&hiAsk;return `
  <div class="col" style="position:absolute;left:${COLX[i]}px;top:0;width:280px;height:790px">
   <div class="w" style="height:96px;border-radius:48px;background:${ask?BLUE:(i===0?INK:'#fff')};border:4px solid ${ask?BLUE:INK};box-sizing:border-box;color:${ask||i===0?'#fff':INK};font:700 46px/88px R;text-align:center;direction:rtl">${c}</div>
   <div class="cb" style="position:absolute;left:0;top:120px;width:280px;height:670px;box-sizing:border-box;border-radius:30px;border:4px dashed ${hi?BLUE:LINEC};background:${hi?SOFT:'transparent'}"></div></div>`}).join('');

/* ---------- COVER: frame 0 is the cover, fully drawn, held until COVER_END ---------- */
const COVER_END=0.7;
const covBoard=`<div style="position:absolute;left:189px;top:770px;width:900px;height:790px;transform:scale(.78);transform-origin:0 0">${colHTML(true)}
  ${CARDS.map((c,k)=>{const s=slot(2,k);return `<div style="position:absolute;left:${s.x}px;top:${s.y}px">${cardHTML(c,true)}</div>`}).join('')}</div>`;
const cov=$(`left:0;top:0;width:1080px;height:1920px;background:#fff;z-index:60`,`
  ${hl(400,'מה כלול',INK,140)}${hl(560,'בשכר הדירה?',BLUE,128)}
  ${covBoard}`);
at(cov,0,COVER_END,{anim:'none',fo:0});
window.COVER={t:0.3,title:'מה כלול בשכר הדירה?'};

bg('#fff',0,DUR);

/* ---------- hook: five bills, three columns, let's sort ---------- */
caption(170,['חמישה חשבונות.'],COVER_END,3.0,{fs:110,c:INK,fo:.1,sfx:'thud'});
caption(310,['שלוש עמודות.'],COVER_END+.3,3.0,{fs:110,c:BLUE,fo:.1,sfx:'pop2'});
caption(1420,['בואו נמיין. מהר.'],COVER_END+1.0,3.0,{fs:60,c:MUTED,fo:.1,anim:'up',dy:20});

/* ---------- the live board ---------- */
const BA=COVER_END+.45,BB=15.2;
const S=[3.0,4.9,6.8,8.7,10.6];        // card starts
const WRONG=[1,0,1,0,-1];              // first (confident) column; -1 = straight to לשאול
const FINAL=12.4;
const board=$(`left:90px;top:520px;width:900px;height:1000px`,`<div class="cols">${colHTML(false)}</div>
  ${CARDS.map((c,i)=>`<div class="cw" style="position:absolute;left:0;top:0;opacity:0"><div class="pl">${cardHTML(c,false)}</div><div class="pa" style="position:absolute;left:0;top:0;opacity:0">${cardHTML(c,true)}</div></div>`).join('')}`);
const lerp=(a,b,k)=>a+(b-a)*k;
at(board,BA,BB,{dy:50,s0:.95,fo:.15,up:(l,t)=>{
  const cws=[...board.querySelectorAll('.cw')];
  cws.forEach((w,i)=>{const s=S[i];if(t<s){w.style.opacity=0;return}
    const app=seg(t,s,.25);let x=DECK.x,y=DECK.y,sc=1.25*(.7+.3*outBack(app)),ask=0;
    if(WRONG[i]<0){const k=outCubic(seg(t,s+.45,.45));const e=slot(2,i);x=lerp(x,e.x,k);y=lerp(y,e.y,k);sc=lerp(sc,1,k);ask=k>=1?1:0}
    else{const k1=outCubic(seg(t,s+.45,.4));const w0=slot(WRONG[i],0);x=lerp(x,w0.x,k1);y=lerp(y,w0.y,k1);sc=lerp(sc,1,k1);
      if(t>s+1.0&&t<s+1.3)x+=Math.sin((t-s)*70)*9;
      const k2=inOut(seg(t,s+1.3,.4));const e=slot(2,i);x=lerp(x,e.x,k2);y=lerp(y,e.y,k2);ask=seg(t,s+1.55,.2)}
    w.style.opacity=clamp(app*3);w.style.transform=`translate(${x}px,${y}px) scale(${sc})`;w.style.transformOrigin='125px 50px';
    w.querySelector('.pa').style.opacity=ask;w.querySelector('.pl').style.opacity=1-ask});
  const hi=seg(t,FINAL+.2,.3);const cb=board.querySelectorAll('.cb')[2];cb.style.borderColor=hi>0?BLUE:LINEC;cb.style.background=hi>0?`rgba(234,241,255,${hi})`:'transparent';
  [0,1].forEach(c=>{board.querySelectorAll('.col')[c].style.opacity=1-.55*hi})}});
ev(BA,'swish');

/* per card: the confident thought, then the reality check */
const THOUGHT=['ארנונה? בטוח לא כלול.','ועד בית? כלול. נראה לי.','מים? ברור שלא כלול.','יש ראוטר. אז כלול.','חשמל?'];
const REAL=['…בטוח? תלוי בחוזה.','״נראה לי״ זה לא סעיף.','יש דירות שכן. יש שלא.','ראוטר זה לא חשבון.','ישר לשאול.'];
S.forEach((s,i)=>{const e=i<4?S[i+1]:FINAL;
  caption(170,[THOUGHT[i]],s+.05,e,{fs:i===4?110:88,c:INK,fo:.1,sfx:'pop'});
  caption(300,[REAL[i]],s+(WRONG[i]<0?.5:1.0),e,{fs:80,c:BLUE,fo:.1,anim:'up',dy:22});
  if(WRONG[i]>=0){ev(s+.85,'pin',1);ev(s+1.0,'boing',.8);ev(s+1.32,'swish');ev(s+1.72,'ding',1+i*.08)}
  else{ev(s+.5,'swish');ev(s+.92,'ding',1.35)}});

/* ---------- the fullest column ---------- */
caption(170,['העמודה הכי מלאה:'],FINAL,BB,{fs:96,c:INK,fo:.12,sfx:'whoosh'});
caption(300,['לשאול.'],FINAL+.3,BB,{fs:120,c:BLUE,fo:.12,sfx:'thud'});
caption(1420,['כל דירה, וחוזה משלה.'],FINAL+.9,BB,{fs:60,c:MUTED,fo:.12,anim:'up',dy:20});

at($('left:0;top:1845px;width:1080px;text-align:center;font:500 34px/1.2 R;color:#8C8C8C;white-space:nowrap','טיפים כלליים, לא ייעוץ משפטי'),COVER_END,17.2,{anim:'none',fo:.2});

/* ---------- payoff ---------- */
const P0=BB,P1=17.2;
const pay=$('left:0;top:380px;width:1080px;height:900px;',`${hl(160,'שואלים לפני,',INK,118)}${hl(300,'לא בחשבון',BLUE,118)}${hl(440,'הראשון.',BLUE,118)}${sub(620,'ומבקשים שיהיה כתוב.')}`);
at(pay,P0+.05,P1,{dy:80,s0:.92,dur:.4,sfx:'pop2'});
ev(P0+.6,'ding',1.2);

/* ---------- homie ---------- */
const E0=19.4;
wordmark(P1,DUR);
FEAT.noBrokers(P1,E0,'שואלים ישר את מי שמשכירים.');
endCard(E0,DUR,'מה כלול? שואלים קודם.');

function render(t){runItems(t);turtleWhite(t,P1+.05,[E0],E0+.25)}
window.AUDIO={dur:DUR,seed:1016,sections:[[0,3.0,'DET',.12,0,1],[3.0,FINAL,'FC',.15,1,0],[FINAL,P1,'MIN',.14,1,0],[P1,DUR,'POP',.19,1,1]],ticks:[3.0,12.2]};
window.STRETCH=1.12;
window.render=render;window.EVENTS=EVENTS;window.SCENES=SCENES;window.DUR=DUR;render(0);
