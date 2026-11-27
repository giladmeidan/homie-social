// Reel H41 (1041) — Feature / promo (owner feature) · style C · voiced. O3: "הסיור נקבע בשעה שנוחה לכם". Slot 2026-11-27 20.
// Cover (black): "שבעה סיורים. / שבע שעות." + the owner's paper week planner, every day with a viewing at a different,
//   scribbled hour (one moved and rewritten), "כשמשכירים חדר."
// Hook: the hours keep getting scribbled in, one per day -> "כל אחד / בשעה אחרת." -> prompt "שלחו למי / שמשכירים." at 3.0 s
// -> "אפשר להזיז?" one hour is struck and rewritten
// -> white: the planner is wiped; only two evenings keep slot chips (your hours) and viewings land in them ("בהומי, בוחרים / מהשעות שלכם.")
// -> "ושאר השבוע? / שלכם." the other days light up as free -> endCard (1.4 s).
const DUR=13.8;
const COVER_END=0.4,P0=3.0,B2=6.0,B3=9.95,E0=12.4;
const SCENES=[['a',0,B2],['b',B2,DUR]];
Tt.style.zIndex=50;
const GREY='#8C8C8C';

/* ---------- small static wordmark, frame 0 to the end (white on black, ink on white) ---------- */
const smallWM=(fill)=>{const m=$(`left:0;top:280px;width:1080px;display:flex;justify-content:center;z-index:70`,WORDMARK.replace('fill="#111111"',`fill="${fill}"`));
  m.querySelector('svg').style.cssText='width:200px;height:auto;display:block';return m};
at(smallWM('#fff'),0,B2,{anim:'none',fo:0});
at(smallWM(INK),B2,DUR,{anim:'none',fo:0});

/* ---------- the owner's week planner, 780 x 640 ---------- */
const PX=150,PY=700,PW=780,PH=640,RH=74,R0=96;
const DAYS=['ראשון','שני','שלישי','רביעי','חמישי','שישי','שבת'];
const HOURS=['07:30','22:45','13:10','06:50','21:30','14:00','09:15'];
const ROT=[-3,2,-1.5,3,-2,1.5,-2.5];
const MOVED=2,NEWH='16:40';           // Tuesday: "אפשר להזיז?" -> struck and rewritten
const SLOTDAYS=[2,4];                  // homie: only Tuesday and Thursday evening keep slots
const SLOTS=['18:00','18:30','19:00'];
const scrib=(h,i,cls='sc')=>`<span class="${cls} w" style="display:inline-block;font:700 54px/1 R;color:${BLUE};direction:ltr;transform:rotate(${ROT[i]}deg);white-space:nowrap">${h}</span>`;
const plannerHTML=(full)=>`<div style="position:absolute;left:0;top:0;width:${PW}px;height:${PH}px;background:#fff;border:6px solid ${INK};border-radius:34px;box-sizing:border-box;direction:rtl;overflow:hidden">
  <div class="w" style="position:absolute;right:40px;top:30px;font:700 44px/1 R;color:${INK}">השבוע · סיורים לחדר</div>
  <div style="position:absolute;left:30px;right:30px;top:${R0-12}px;height:4px;background:${INK}"></div>
  ${DAYS.map((d,i)=>`<div class="row" style="position:absolute;left:24px;right:24px;top:${R0+i*RH}px;height:${RH}px;border-radius:18px">
    <div class="w" style="position:absolute;right:16px;top:0;font:500 44px/${RH}px R;color:${INK}">${d}</div>
    <div style="position:absolute;left:0;right:0;bottom:0;height:2px;background:#E4E4E4"></div>
    <div class="cell" style="position:absolute;left:24px;top:0;width:500px;height:${RH}px;display:flex;align-items:center;justify-content:flex-end;gap:18px;direction:rtl">
      ${i===MOVED?`<span class="old" style="position:relative;display:inline-block">${scrib(HOURS[i],i,'sc')}<i class="strike" style="position:absolute;left:-8px;right:-8px;top:24px;height:7px;background:${INK};border-radius:4px;transform:rotate(-8deg) scaleX(${full?1:0});transform-origin:right"></i></span>${scrib(NEWH,i,'nw')}`:scrib(HOURS[i],i)}
    </div>
    <div class="slots" style="position:absolute;left:24px;top:9px;display:none;gap:14px;direction:ltr">
      ${SLOTDAYS.includes(i)?SLOTS.map(s=>`<div class="slot w" style="width:150px;height:56px;border-radius:16px;border:4px solid ${BLUE};color:${BL2};font:700 36px/50px R;text-align:center;box-sizing:border-box">${s}</div>`).join(''):''}
    </div>
    <div class="free w" style="position:absolute;left:40px;top:0;font:500 40px/${RH}px R;color:${GREY};display:none">${SLOTDAYS.includes(i)?'':'—'}</div>
  </div>`).join('')}</div>`;

/* ---------- COVER (black): frame 0, fully drawn ---------- */
const cov=$(`left:0;top:0;width:1080px;height:1920px;background:${INK};z-index:60`,`
  <div style="position:absolute;left:0;top:280px;width:1080px;display:flex;justify-content:center">${WORDMARK.replace('fill="#111111"','fill="#fff"').replace('<svg ','<svg style="width:200px;height:auto" ')}</div>
  ${hl(400,'שבעה סיורים.','#fff',118)}${hl(530,'שבע שעות.',BLUE,118)}
  <div style="position:absolute;left:${PX}px;top:${PY}px;width:${PW}px;height:${PH}px">${plannerHTML(true)}</div>
  ${sub(1385,'כשמשכירים חדר.',PALE)}`);
at(cov,0,COVER_END,{anim:'none',fo:0});
window.COVER={t:0.2,title:'שבעה סיורים. שבע שעות.'};

bg(INK,0,B2);bg('#fff',B2,DUR);

/* ---------- the planner (one element through both scenes) ---------- */
const WRITE=[0.45,0.9,1.35,1.8,2.25,2.7,3.15];   // the hours get scribbled in, one per day
const STRIKE=4.0,REWRITE=4.45,WIPE=B2+.05;
for(const w of WRITE)ev(w,'pin',.6);ev(STRIKE,'swish',.6);ev(REWRITE,'pin',.7);ev(WIPE,'whoosh',.7);
const pl=$(`left:${PX}px;top:${PY}px;width:${PW}px;height:${PH}px;z-index:4`,plannerHTML(false));
const rows=[...pl.querySelectorAll('.row')];
const scs=rows.map(r=>r.querySelector('.sc'));
const strike=pl.querySelector('.strike'),nw=pl.querySelector('.nw');
const SL=[...pl.querySelectorAll('.slot')];
const FILL=[6.75,7.3,7.85,8.4,8.95];   // viewings land in the slots (5 of 6)
FILL.forEach(f=>ev(f,'ding',1.05));
const SLORD=[0,3,1,4,2];               // fill order across the two days
at(pl,COVER_END,E0,{anim:'none',fo:.25,up:(l,t)=>{
  // scene a: write-on of each hour (a clip that opens right to left), bob of the card
  scs.forEach((s,i)=>{const k=outCubic(seg(t,WRITE[i],.32));s.style.clipPath=`inset(0 0 0 ${(1-k)*100}%)`});
  strike.style.transform=`rotate(-8deg) scaleX(${outCubic(seg(t,STRIKE,.25))})`;
  const k2=outCubic(seg(t,REWRITE,.32));nw.style.clipPath=`inset(0 0 0 ${(1-k2)*100}%)`;
  const sh=t>=STRIKE&&t<STRIKE+.4?Math.sin((t-STRIKE)*60)*6*(1-(t-STRIKE)/.4):0;
  const bob=t<B2?Math.sin(t*3.2)*5:0;
  pl.style.transform=`translate(${sh}px,${bob}px)`;
  // scene b: the eraser sweep clears the scribbles; slots appear on two evenings
  const w=seg(t,WIPE,.4);
  rows.forEach((r,i)=>{const cell=r.querySelector('.cell');cell.style.opacity=String(1-w);
    const sl=r.querySelector('.slots'),fr=r.querySelector('.free');
    show(sl,t>=WIPE+.3);sl.style.display=t>=WIPE+.3?'flex':'none';show(fr,t>=WIPE+.3);
    const a=outBack(seg(t,WIPE+.3+i*.05,.3));sl.style.opacity=fr.style.opacity=String(clamp(a*2));
    // beat 3: the rest of the week is yours
    const isSlot=SLOTDAYS.includes(i);const g=seg(t,B3+.2+i*.08,.3);
    r.style.background=!isSlot&&g>0?`rgba(234,241,255,${g})`:'transparent';
    if(!isSlot){fr.textContent=g>0?'שלכם':'—';fr.style.color=g>0?BLUE:GREY;fr.style.fontWeight=g>0?'700':'500'}});
  SLORD.forEach((si,n)=>{const s=SL[si];const on=t>=FILL[n];s.style.background=on?BLUE:'#fff';s.style.color=on?'#fff':BL2;
    s.textContent=on?'נקבע':SLOTS[si%3];s.style.transform=`scale(${1+Math.sin(seg(t,FILL[n],.3)*Math.PI)*.14})`})}});

/* ---------- hook ---------- */
caption(400,['כל אחד','בשעה אחרת.'],COVER_END,B2,{say:'כל אחד בשעה אחרת',fs:118,cols:['#fff',BLUE],fo:.15,sfx:'thud'});

/* ---------- "אפשר להזיז?" (one of them moves the hour) ---------- */
const bubbleHTML=`<div style="position:absolute;left:0;top:0;padding:16px 40px 20px;background:#fff;border:5px solid ${INK};border-radius:44px 44px 10px 44px;color:${INK};font:600 60px/1.1 F;direction:rtl;white-space:nowrap">אפשר להזיז?</div>`;
at($(`left:560px;top:672px;z-index:8`,bubbleHTML),3.75,5.4,{dy:30,s0:.7,fo:.2,sfx:'msg',v:.6});

/* ---------- the prompt (on screen at 3.0 s) ---------- */
const promptHTML=(dark)=>`<div style="position:absolute;left:110px;top:0;width:860px;height:220px;border-radius:60px;background:${SOFT};border:5px solid ${dark?'#fff':INK};box-sizing:border-box;display:flex;align-items:center;justify-content:center;gap:34px;direction:rtl">
  <div style="width:84px;height:84px;border-radius:42px;background:${BLUE};display:flex;align-items:center;justify-content:center">
    <svg width="46" height="46" viewBox="0 0 46 46"><path d="M40 6 L6 20 L19 25 L24 40 Z" fill="#fff"/><path d="M40 6 L19 25" stroke="${BLUE}" stroke-width="3"/></svg></div>
  <div class="w" style="font:600 90px/1.02 F;color:${INK};text-align:center">שלחו למי<br>שמשכירים.</div></div>`;
at($(`left:0;top:1385px;width:1080px;height:220px;z-index:9`,promptHTML(true)),P0,B2,{say:'תשלחו למי שמשכירים',dy:40,s0:.85,fo:.2,sfx:'pop2'});
window.PROMPT={t:3.0,text:'שלחו למי שמשכירים.'};

/* ---------- beat 2: on homie they pick from your hours ---------- */
caption(400,['בהומי, בוחרים','מהשעות שלכם.'],B2,B3,{say:'בהומי בוחרים מהשעות שלכם',fs:112,cols:[INK,BLUE],fo:.1,sfx:'whoosh2'});
at($(`left:0;top:1390px;width:1080px;text-align:center;z-index:9`,`<div class="w" style="font:500 56px/1.25 R;color:${MUTED}">שעה פנויה. סיור נקבע.</div>`),6.9,B3,{anim:'up',dy:30,fo:.12});

/* ---------- beat 3: the rest of the week ---------- */
caption(400,['ושאר השבוע?','שלכם.'],B3,E0,{say:'ושאר השבוע? שלכם.',fs:118,cols:[INK,BLUE],fo:.15,sfx:'pop'});
at($(`left:0;top:1385px;width:1080px;height:220px;z-index:9`,promptHTML(false)),B3+.5,E0,{anim:'up',dy:30,fo:.15,sfx:'pop2',v:.5});

/* ---------- brand ending (feature: endCard, at most 1.5 s) ---------- */
endCard(E0,DUR,'לבעלי דירות וחדרים. בחינם.');

/* ---------- footnote ---------- */
at($(`left:0;top:1650px;width:1080px;text-align:center`,`<div class="w" style="font:500 34px/1.2 R;color:${GREY}">הדגמה. הנתונים לדוגמה.</div>`),COVER_END,E0,{anim:'none',fo:0});

function render(t){runItems(t);turtle(null)}
window.BEATS={payoff:B2,outro:E0};
window.AUDIO={dur:DUR,seed:1041,sections:[[0,B2,'CG',.24,0,1],[B2,DUR,'MIN',.26,1,1]],ticks:[0.4,3.0]};
window.STRETCH=1.0;
window.VOICE={duck:0.7};   // narration = the say marks above
window.render=render;window.EVENTS=EVENTS;window.SCENES=SCENES;window.DUR=DUR;render(0);
