// Reel H29 (1029) — Renting smart story · style B · voiced. S7: before you send money for a flat (cut to one moment, two tip beats).
// Cover (white): "שולחים כסף / על דירה?" + a drawn transfer form (למי / סכום / פירוט, empty) and a finger over "שליחה".
// Hook: the finger hovers, the form shakes -> "רגע. / לפני שליחה." -> prompt "שמרו לפני ההעברה." at 2.6 s
// -> beat 1: the name types into "למי" and matches the lease card ("משלמים רק / למי שבחוזה.")
// -> beat 2: "פירוט" types "שכר דירה · דצמבר" ("ובפירוט: / על מה הכסף."), the finger taps, "נשלח" -> prompt again -> wordmark.
const DUR=13.0;
const COVER_END=0.4,P0=2.6,B1=5.4,B2=8.7,SEND=10.9,E0=11.9,WM=12.1;
const SCENES=[['a',0,B1],['b',B1,DUR]];
Tt.style.zIndex=50;
const GREY='#8C8C8C',LINEC='#D6DCE6';

/* ---------- small static wordmark, frame 0 until the brand ending takes over ---------- */
const smallWM=()=>{const m=$(`left:0;top:280px;width:1080px;display:flex;justify-content:center;z-index:70`,WORDMARK);
  m.querySelector('svg').style.cssText='width:200px;height:auto;display:block';return m};
at(smallWM(),0,WM,{anim:'none',fo:0});

/* ---------- the transfer form (demo, no real bank), 800 x 560 ---------- */
const row=(cls,label,top,val='',ph='')=>`<div style="position:absolute;right:34px;top:${top}px;width:732px;height:100px;direction:rtl">
  <div class="w" style="position:absolute;right:0;top:0;width:130px;font:700 42px/100px R;color:${INK}">${label}</div>
  <div class="${cls} box" style="position:absolute;left:0;top:6px;width:580px;height:88px;border-radius:22px;border:4px solid ${LINEC};box-sizing:border-box;background:#fff">
    <div class="val w" style="position:absolute;right:24px;top:0;font:500 42px/80px R;color:${INK};white-space:nowrap">${val}</div>
    <div class="ph w" style="position:absolute;right:24px;top:0;font:500 40px/80px R;color:#B7BDC8;white-space:nowrap">${ph}</div>
    <div class="cur" style="position:absolute;top:18px;width:5px;height:46px;background:${BLUE};display:none"></div></div></div>`;
const formHTML=`<div style="position:absolute;left:0;top:0;width:800px;height:560px;border-radius:40px;background:#fff;border:6px solid ${INK};box-sizing:border-box;direction:rtl">
  <div style="position:absolute;right:34px;top:26px;display:flex;align-items:center;gap:18px">
    <svg width="58" height="58" viewBox="0 0 58 58"><circle cx="29" cy="29" r="27" fill="${SOFT}"/><path d="M15 23 H41 L34 16 M43 35 H17 L24 42" stroke="${BLUE}" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
    <div class="w" style="font:700 50px/1 R;color:${INK}">העברה</div></div>
  ${row('to','למי',104,'','שם המקבל')}
  ${row('amt','סכום',214,'<span style="direction:ltr;unicode-bidi:isolate">₪ ••••</span>','')}
  ${row('note','פירוט',324,'','על מה ההעברה?')}
  <div class="btn" style="position:absolute;left:34px;top:440px;width:732px;height:96px;border-radius:48px;background:${BLUE};display:flex;justify-content:center;align-items:center;gap:16px">
    <svg class="ok" width="46" height="46" viewBox="0 0 46 46" style="display:none"><path d="M8 24 L19 35 L38 12" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
    <div class="bt w" style="font:700 48px/1 R;color:#fff">שליחה</div></div>
</div>`;
const fingerSVG=`<svg width="150" height="190" viewBox="0 0 150 190"><path d="M58 18 Q58 4 72 4 Q86 4 86 18 V86 Q96 74 110 80 Q122 86 118 100 L112 150 Q108 184 72 184 Q40 184 30 156 L12 112 Q6 96 20 92 Q32 90 40 104 L58 128 Z" fill="#fff" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/><path d="M86 86 V112 M100 92 V116" stroke="${INK}" stroke-width="5" stroke-linecap="round"/></svg>`;
const FX=140,FY=740;   // form position

/* ---------- COVER (white): frame 0, fully drawn ---------- */
const cov=$(`left:0;top:0;width:1080px;height:1920px;background:#fff;z-index:60`,`
  ${hl(410,'שולחים כסף',INK,124)}${hl(545,'על דירה?',BLUE,124)}
  <div style="position:absolute;left:${FX}px;top:${FY}px;width:800px;height:560px">${formHTML}</div>
  <div style="position:absolute;left:590px;top:1222px;width:150px;height:190px;transform:scale(.8);transform-origin:72px 4px">${fingerSVG}</div>`);
at(cov,0,COVER_END,{anim:'none',fo:0});
window.COVER={t:0.2,title:'שולחים כסף על דירה?'};

/* ---------- the live form + finger (whole reel) ---------- */
bg('#fff',0,DUR);
const form=$(`left:${FX}px;top:${FY}px;width:800px;height:560px`,formHTML);
const q=s=>form.querySelector(s);
const typeInto=(cls,text,t,t0,dur)=>{const n=Math.round(text.length*clamp((t-t0)/dur));const box=q('.'+cls);
  box.querySelector('.val').textContent=text.slice(0,n);box.querySelector('.ph').style.display=n>0?'none':'block';
  const cur=box.querySelector('.cur');const typing=t>=t0-.3&&t<t0+dur+.5;cur.style.display=typing&&Math.floor(t*4)%2===0?'block':'none';
  const w=box.querySelector('.val').getBoundingClientRect().width;cur.style.right=(30+(n>0?w:0))+'px';
  box.style.borderColor=typing||(t>=t0&&n===text.length&&t<t0+dur+1.2)?BLUE:LINEC};
const T1=B1+.35,T2=B2+.35;    // typing starts
at(form,COVER_END,DUR,{anim:'none',fo:0,up:(l,t)=>{
  // hook: the form shakes once, as if someone hesitates
  const sh=t>0.9&&t<1.3?Math.sin((t-.9)*55)*7:0;form.style.transform=`translateX(${sh}px)`;
  typeInto('to','נ. לוי',t,T1,0.7);
  typeInto('note','שכר דירה · דצמבר',t,T2,1.1);
  const sent=t>=SEND+.12;q('.ok').style.display=sent?'block':'none';q('.bt').textContent=sent?'נשלח':'שליחה';
  q('.btn').style.background=sent?INK:BLUE;
  q('.btn').style.transform=`scale(${t>=SEND&&t<SEND+.25?1-.06*Math.sin((t-SEND)/.25*Math.PI):1})`}});
[0,1,2,3,4,5].forEach(i=>ev(T1+i*.12,'pin',.35));
[0,1,2,3,4,5,6,7,8].forEach(i=>ev(T2+i*.12,'pin',.3));
ev(SEND,'pop');ev(SEND+.15,'ding',1.2);

// finger: hovers over "שליחה" (moving from the first frame after the cover), drifts back and forth, taps at SEND
const finger=$(`left:0;top:0;width:150px;height:190px;z-index:8`,fingerSVG);
at(finger,COVER_END,DUR,{anim:'none',fo:0,up:(l,t)=>{
  let x=590+Math.sin(t*3.2)*34,y=1222+Math.sin(t*5.1)*12,o=1;
  // drops out of view while the fields fill, comes back up to tap, then leaves
  const away=seg(t,B1-.1,.35)*(1-seg(t,SEND-.75,.35));y+=away*700;
  if(t>=SEND-.4){x=590;if(t>=SEND&&t<SEND+.2)y+=22*Math.sin((t-SEND)/.2*Math.PI)}
  y+=seg(t,SEND+.45,.35)*700;
  finger.style.transform=`translate(${x}px,${y}px) scale(.8)`;finger.style.transformOrigin='72px 4px'}});

/* ---------- hook ---------- */
caption(410,['רגע.','לפני שליחה.'],COVER_END,B1,{say:'רגע, לפני שליחה',fs:124,cols:[INK,BLUE],fo:.1,sfx:'thud'});

/* ---------- the prompt (by 3 s), under the form ---------- */
const promptHTML=(fs=88)=>`<div style="position:absolute;left:90px;top:0;width:900px;height:140px;border-radius:70px;background:#fff;border:5px solid ${INK};box-sizing:border-box;display:flex;align-items:center;justify-content:center;gap:26px;direction:rtl">
  <svg width="50" height="66" viewBox="0 0 54 70"><path d="M6 4 H48 V64 L27 48 L6 64 Z" fill="${BLUE}"/></svg>
  <div class="w" style="font:600 ${fs}px/1 F;color:${INK}">שמרו לפני ההעברה.</div></div>`;
at($(`left:0;top:1375px;width:1080px;height:140px;z-index:9`,promptHTML()),P0,B1,{say:'תשמרו לפני ההעברה.',dy:40,s0:.85,fo:.15,sfx:'pop2'});
window.PROMPT={t:2.6,text:'שמרו לפני ההעברה.'};

/* ---------- beat 1: the name on the transfer = the name on the lease ---------- */
caption(410,['משלמים רק','למי שבחוזה.'],B1,B2,{say:'משלמים רק למי שבחוזה.',fs:124,cols:[INK,BLUE],fo:.1,sfx:'whoosh'});
const lease=$(`left:140px;top:1370px;width:800px;height:130px;z-index:9`,`<div style="position:absolute;left:0;top:0;width:800px;height:130px;border-radius:30px;background:${SOFT};border:4px solid ${BLUE};box-sizing:border-box;direction:rtl">
  <svg style="position:absolute;right:26px;top:24px" width="66" height="82" viewBox="0 0 66 82"><path d="M6 4 H44 L60 20 V78 H6 Z" fill="#fff" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/><path d="M16 34 H50 M16 48 H50 M16 62 H38" stroke="${INK}" stroke-width="4" stroke-linecap="round"/></svg>
  <div class="w" style="position:absolute;right:112px;top:0;font:500 44px/124px R;color:${INK}">חוזה · המשכירים: <b style="font-weight:700">נ. לוי</b></div>
  <svg class="chk" style="position:absolute;left:30px;top:30px" width="70" height="70" viewBox="0 0 70 70"><circle cx="35" cy="35" r="33" fill="${BLUE}"/><path d="M19 36 L30 47 L51 24" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="50" stroke-dashoffset="50"/></svg></div>`);
at(lease,B1+.1,B2,{anim:'up',dy:60,fo:.15,sfx:'pop',up:(l,t)=>{lease.querySelector('.chk path').setAttribute('stroke-dashoffset',50*(1-outCubic(seg(t,T1+.85,.3))))}});
ev(T1+.85,'ding',1.1);
// a blue link from "למי" down to the lease card once the names match
const link=$(`left:112px;top:890px;width:10px;height:470px;z-index:7`,`<div class="bar" style="position:absolute;left:0;top:0;width:10px;height:470px;background:${BLUE};border-radius:5px;transform-origin:50% 0"></div>`);
at(link,T1+.75,B2,{anim:'none',fo:.15,up:(l)=>{link.querySelector('.bar').style.transform=`scaleY(${outCubic(seg(l,0,.3))})`}});

/* ---------- beat 2: write what the money is for ---------- */
caption(410,['ובפירוט:','על מה הכסף.'],B2,E0,{say:'וכותבים על מה הכסף.',fs:124,cols:[INK,BLUE],fo:.1,sfx:'whoosh2'});
at($(`left:0;top:1390px;width:1080px;text-align:center;z-index:9`,`<div class="w" style="font:500 50px/1.25 R;color:${MUTED}">שכר דירה? פיקדון? שיהיה כתוב.</div>`),B2+.5,E0,{anim:'up',dy:30,fo:.12});

/* ---------- the prompt again + brand ending ---------- */
at($(`left:0;top:1375px;width:1080px;height:140px;z-index:9`,promptHTML(84)),E0,DUR,{anim:'up',dy:30,fo:0,sfx:'pop2',v:.6});
wordmark(WM,DUR);

/* ---------- footnote ---------- */
at($(`left:0;top:1560px;width:1080px;text-align:center`,`<div class="w" style="font:500 34px/1.2 R;color:${GREY}">דוגמה. טיפים כלליים, לא ייעוץ משפטי.</div>`),COVER_END,DUR,{anim:'none',fo:0});

function render(t){runItems(t);turtle(null)}
window.BEATS={payoff:B1,outro:E0};
window.AUDIO={dur:DUR,seed:1029,sections:[[0,B1,'DET',.13,1,0],[B1,E0,'POP',.15,0,1],[E0,DUR,'MIN',.15,1,1]],ticks:[0.4,2.6]};
window.STRETCH=1.0;
window.VOICE={duck:0.7};   // narration = the say marks above
window.render=render;window.EVENTS=EVENTS;window.SCENES=SCENES;window.DUR=DUR;render(0);
