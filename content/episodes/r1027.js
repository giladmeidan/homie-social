// Reel H27 (1027) — Feature / promo · style C · voiced. P5: a listing never stays up forever (expires after 90 days).
// Cover (black): "כתבתם לדירה / שכבר מושכרת?" + an old listing card stamped "מושכרת" and an unanswered message.
// Hook: the message pops, nobody answers, the card's age keeps counting -> prompt "שמרו לחיפוש הבא." by 2.6 s
// -> white: on homie a fresh listing counts its days 1->90 and comes down -> "בלי מודעות מלפני שנה." (fresh cards) -> endCard.
const DUR=12.9;
const COVER_END=0.4,P0=2.4,B2=4.6,B3=8.9,E0=11.5;
const SCENES=[['a',0,B2],['b',B2,DUR]];
Tt.style.zIndex=50;
const GREY='#8C8C8C',LINEC='#D6DCE6';

/* ---------- small static wordmark, frame 0 to the end (white on black, ink on white) ---------- */
const smallWM=(fill)=>{const m=$(`left:0;top:275px;width:1080px;display:flex;justify-content:center;z-index:70`,WORDMARK.replace('fill="#111111"',`fill="${fill}"`));
  m.querySelector('svg').style.cssText='width:200px;height:auto;display:block';return m};
at(smallWM('#fff'),0,B2,{anim:'none',fo:0});
at(smallWM(INK),B2,DUR,{anim:'none',fo:0});

/* ---------- a listing card (demo data), 800 x 430 ---------- */
const photoSVG=`<svg viewBox="0 0 752 220" width="752" height="220"><rect x="0" y="0" width="752" height="220" rx="22" fill="#EEF3FB"/>
 <rect x="470" y="34" width="170" height="130" rx="8" fill="#fff" stroke="${INK}" stroke-width="6"/><path d="M555 34 V164 M470 99 H640" stroke="${INK}" stroke-width="5"/>
 <path d="M90 186 V128 H330 V186" fill="none" stroke="${INK}" stroke-width="6"/><rect x="104" y="108" width="80" height="30" rx="12" fill="#fff" stroke="${INK}" stroke-width="5"/>
 <path d="M60 192 H700" stroke="${INK}" stroke-width="6" stroke-linecap="round"/><circle class="lamp" cx="395" cy="70" r="20" fill="${BLUE}"/><path d="M395 18 V50" stroke="${INK}" stroke-width="4"/></svg>`;
const cardHTML=(o={})=>`<div style="position:absolute;left:0;top:0;width:800px;height:430px;border-radius:36px;background:#fff;border:5px solid ${INK};box-sizing:border-box;direction:rtl">
  <div class="ph" style="position:absolute;left:19px;top:19px;width:752px;height:220px">${photoSVG}</div>
  <div class="w" style="position:absolute;right:30px;top:258px;font:700 52px/1.2 R;color:${INK}">חדר בדירת שותפים</div>
  <div class="w" style="position:absolute;right:30px;top:330px;font:500 42px/1.2 R;color:${MUTED}">רמת גן</div>
  <div class="age w" style="position:absolute;left:26px;top:328px;height:66px;padding:0 26px;border-radius:33px;background:${o.agebg||SOFT};font:700 36px/66px R;color:${o.agec||BL2}">${o.age||'עלתה היום'}</div>
  ${o.stamp?`<div class="stamp w" style="position:absolute;left:210px;top:70px;padding:6px 34px;border:9px solid ${BLUE};border-radius:20px;background:rgba(255,255,255,.92);font:600 96px/1.1 F;color:${BLUE};transform:rotate(-10deg)">מושכרת</div>`:''}
</div>`;
const msgHTML=`<div class="w" style="position:absolute;right:0;top:0;height:96px;padding:0 40px;border-radius:48px 48px 10px 48px;background:${BLUE};color:#fff;font:500 48px/96px R;direction:rtl;white-space:nowrap">הדירה עוד פנויה?</div>`;

/* ---------- COVER (black): frame 0, fully drawn ---------- */
const cov=$(`left:0;top:0;width:1080px;height:1920px;background:${INK};z-index:60`,`
  ${hl(395,'כתבתם לדירה','#fff',112)}${hl(522,'שכבר מושכרת?',NAMEC,112)}
  <div style="position:absolute;left:140px;top:715px;width:800px;height:430px">${cardHTML({stamp:true,age:'עלתה לפני חצי שנה',agebg:'#EDEDED',agec:MUTED})}</div>
  <div style="position:absolute;left:140px;top:1185px;width:800px;height:96px">${msgHTML}</div>
  <div class="w" style="position:absolute;left:140px;width:800px;top:1296px;text-align:right;font:500 36px/1.2 R;color:#9A9A9A;direction:rtl">נשלח לפני שבוע · אין תשובה</div>`);
at(cov,0,COVER_END,{anim:'none',fo:0});
window.COVER={t:0.2,title:'כתבתם לדירה שכבר מושכרת?'};

/* ---------- hook (black): message sent, no answer, the card keeps ageing ---------- */
bg(INK,0,B2);
caption(395,['שלחתם.','אין תשובה.'],COVER_END,B2,{say:'שלחתם. אין תשובה.',fs:112,cols:['#fff',NAMEC],fo:.1,sfx:'pop'});
const c1=$(`left:140px;top:715px;width:800px;height:430px`,cardHTML({stamp:true,age:'עלתה לפני 120 ימים',agebg:'#EDEDED',agec:MUTED}));
const st1=c1.querySelector('.stamp');
at(c1,COVER_END,B2,{anim:'none',fo:.12,up:(l,t)=>{
  const days=Math.round(120+94*outCubic(seg(t,0.45,2.6)));
  c1.querySelector('.age').textContent=`עלתה לפני ${days} ימים`;
  c1.querySelector('.ph').style.filter=`grayscale(${clamp((t-.4)/2)}) opacity(${1-.35*clamp((t-.4)/2)})`;
  const k=seg(t,1.55,.3),e=outBack(k);st1.style.opacity=k>0?1:0;st1.style.transform=`rotate(-10deg) scale(${1.6-.6*e})`;
  c1.style.transform=`translateX(${t>1.55&&t<1.8?Math.sin((t-1.55)*60)*8:0}px)`}});
ev(1.55,'thud');
const msg=$(`left:140px;top:1185px;width:800px;height:96px`,msgHTML);
at(msg,0.55,P0,{dy:30,s0:.8,fo:.15,sfx:'msg'});
const dots=$(`left:140px;top:1296px;width:180px;height:56px;border-radius:28px;background:#2E2E2E;display:flex;justify-content:center;align-items:center;gap:12px`,
  [0,1,2].map(i=>`<div class="d" style="width:16px;height:16px;border-radius:8px;background:#BDBDBD"></div>`).join(''));
at(dots,0.95,1.5,{anim:'fade',fo:.1,up:(l)=>{[...dots.querySelectorAll('.d')].forEach((d,i)=>{d.style.transform=`translateY(${Math.sin(l*12-i*.9)*6}px)`})}});
at($(`left:140px;top:1296px;width:800px;text-align:right;direction:rtl`,`<div class="w" style="font:500 36px/1.2 R;color:#9A9A9A">נשלח לפני שבוע · אין תשובה</div>`),1.6,P0,{anim:'fade',fo:.15});

/* ---------- the prompt (by 2.6 s) ---------- */
const promptHTML=(fs=92)=>`<div style="position:absolute;left:90px;top:0;width:900px;height:150px;border-radius:75px;background:#fff;border:5px solid ${INK};box-sizing:border-box;display:flex;align-items:center;justify-content:center;gap:26px;direction:rtl">
  <svg width="54" height="70" viewBox="0 0 54 70"><path d="M6 4 H48 V64 L27 48 L6 64 Z" fill="${BLUE}"/></svg>
  <div class="w" style="font:600 ${fs}px/1 F;color:${INK}">שמרו לחיפוש הבא.</div></div>`;
at($(`left:0;top:1195px;width:1080px;height:150px`,promptHTML()),P0,B2,{say:'שמרו לחיפוש הבא.',dy:40,s0:.85,fo:.15,sfx:'pop2'});
window.PROMPT={t:2.4,text:'שמרו לחיפוש הבא.'};

/* ---------- beat 2 (white): on homie a listing counts its days and comes down at 90 ---------- */
bg('#fff',B2,E0);
caption(395,['בהומי, מודעה','יורדת אחרי 90 יום.'],B2+.05,B3,{say:'בהומי, מודעה יורדת אחרי תשעים יום.',fs:100,cols:[INK,BLUE],fo:.1,sfx:'whoosh'});
const c2=$(`left:140px;top:760px;width:800px;height:430px;transform-origin:50% 50%`,cardHTML({age:'עלתה היום'}));
const ring=$(`left:70px;top:640px;width:230px;height:230px;z-index:5`,ringHTML(230,22));
const D0=B2+.5,D1=B2+3.0;     // days 1 -> 90
const dayAt=t=>Math.max(1,Math.round(1+89*inOut(seg(t,D0,D1-D0))));
at(c2,B2+.1,B3,{dy:70,s0:.9,fo:.15,up:(l,t)=>{const d=dayAt(t);
  c2.querySelector('.age').textContent=d<=1?'עלתה היום':(d>=90?'ירדה':(d===2?'עלתה לפני יומיים':`עלתה לפני ${d} ימים`));
  const off=seg(t,D1+.15,.45),e=inOut(off);c2.style.opacity=1-e;c2.style.transform=`translateY(${e*80}px) scale(${1-.12*e}) rotate(${-4*e}deg)`;
  c2.querySelector('.ph').style.filter=`grayscale(${(d-1)/89})`}});
at(ring,B2+.3,B3,{dy:30,s0:.6,fo:.15,up:(l,t)=>{const d=dayAt(t);setRing(ring,d/90,d)}});
[0.9,1.5,2.1,2.6].forEach(d=>ev(B2+d,'pin',.6));ev(D1,'ding',1.2);ev(D1+.2,'whoosh2');
// a new listing slides in where the old one was
const c3=$(`left:140px;top:760px;width:800px;height:430px`,cardHTML({age:'עלתה היום'}));
at(c3,D1+.55,B3,{dy:0,s0:.9,fo:.15,sfx:'pop',up:(l)=>{const e=outCubic(seg(l,0,.4));c3.style.transform=`translateX(${(1-e)*-900}px)`}});

/* ---------- beat 3 (white): only fresh listings ---------- */
caption(395,['בלי מודעות','מלפני שנה.'],B3+.05,E0,{say:'בלי מודעות מלפני שנה.',fs:112,cols:[INK,BLUE],fo:.1,sfx:'pop'});
const rowHTML=(age)=>`<div style="position:absolute;left:0;top:0;width:800px;height:150px;border-radius:30px;background:#fff;border:5px solid ${INK};box-sizing:border-box;direction:rtl">
  <div style="position:absolute;right:18px;top:16px;width:150px;height:108px;border-radius:18px;background:#EEF3FB;overflow:hidden"><svg viewBox="0 0 150 108" width="150" height="108"><rect x="78" y="18" width="50" height="40" rx="4" fill="#fff" stroke="${INK}" stroke-width="4"/><path d="M103 18 V58 M78 38 H128" stroke="${INK}" stroke-width="3"/><path d="M18 90 V66 H62 V90 M10 92 H140" fill="none" stroke="${INK}" stroke-width="4"/></svg></div>
  <div class="w" style="position:absolute;right:192px;top:24px;font:700 38px/1.2 R;color:${INK}">חדר בדירת שותפים</div>
  <div class="w" style="position:absolute;right:192px;top:80px;font:500 34px/1.2 R;color:${MUTED}">רמת גן</div>
  <div class="w" style="position:absolute;left:22px;top:44px;height:58px;padding:0 22px;border-radius:29px;background:${SOFT};font:700 32px/58px R;color:${BL2}">${age}</div></div>`;
['עלתה היום','עלתה אתמול','עלתה השבוע'].forEach((age,i)=>{
  at($(`left:140px;top:${690+i*175}px;width:800px;height:150px`,rowHTML(age)),B3+.25+i*.22,E0,{dy:60,s0:.8,fo:.12,sfx:i?'pop2':'whoosh',v:.7})});
at($(`left:0;top:1260px;width:1080px;height:150px;z-index:6`,promptHTML(84)),B3+1.4,E0,{anim:'up',dy:30,fo:.12});

/* ---------- footnote ---------- */
at($(`left:0;top:1610px;width:1080px;text-align:center`,`<div class="w" style="font:500 34px/1.2 R;color:${GREY}">הדגמה. הנתונים והדמויות לדוגמה.</div>`),COVER_END,E0,{anim:'none',fo:0});

/* ---------- brand ending (feature: endCard, at most 1.5 s) ---------- */
bg('#fff',E0,DUR);
endCard(E0,DUR,'בכל הארץ. בחינם.');

function render(t){runItems(t);turtleWhite(t,E0+.05,[],99)}
window.BEATS={payoff:B2,outro:E0};
window.AUDIO={dur:DUR,seed:1027,sections:[[0,B2,'MIN',.13,0,1],[B2,E0,'CG',.15,1,1],[E0,DUR,'FC',.16,1,0]],ticks:[0.4,2.4]};
window.STRETCH=1.0;
window.VOICE={duck:0.7};   // narration = the say marks above
window.render=render;window.EVENTS=EVENTS;window.SCENES=SCENES;window.DUR=DUR;render(0);
