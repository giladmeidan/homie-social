// Reel H42 (1042) — Feature / promo (promo) · style E (app demo) · voiced. P7: free for both sides, as a comment poll. Slot 2026-11-28 13.
// Cover (white): "בלי דמי תיווך. / על מה זה ילך?" + a drawn phone with a booked viewing (demo), a meter card "משלמים: להומי ₪0 · למתווך ₪0"
//   and three numbered options already on screen (1 ספה / 2 הובלה / 3 הפיצה הראשונה).
// Hook "בלי מתווך. / בחינם." while the listing photos slide and the options bob -> prompt pill "על מה? / מספר בתגובות." at 3.0 s
// -> the finger likes the listing (+₪0 flies to the meter) -> mutual like -> chat -> picks a slot (+₪0) ("לייק. צ׳אט. סיור. / ₪0.")
// -> the phone turns to the owner side: publish a listing, free (+₪0) ("חינם. / לשני הצדדים.") -> endCard (1.4 s).
const DUR=13.4;
const COVER_END=0.4,P0=3.0,B2=5.8,B3=9.2,E0=12.0;
const SCENES=[['a',0,B2],['b',B2,B3],['c',B3,DUR]];
Tt.style.zIndex=50;
const GREY='#8C8C8C';
const N=(s)=>`<span style="direction:ltr;unicode-bidi:isolate">${s}</span>`;
const Z='₪0';

/* ---------- small static wordmark, frame 0 to the end ---------- */
const smallWM=()=>{const m=$(`left:0;top:280px;width:1080px;display:flex;justify-content:center;z-index:70`,WORDMARK);
  m.querySelector('svg').style.cssText='width:200px;height:auto;display:block';return m};
at(smallWM(),0,E0,{anim:'none',fo:0});

/* ---------- layout ---------- */
const PHX=100,PHY=650,PS=.82;          // phone (460 x 940 outer) at stage, scaled
const SW=432,SH=912;                   // phone screen
const CX=535,CW=445;                   // right column (meter + options)
const MY=650,MH=300;                   // meter card
const OY=[990,1135,1280],OH=124;       // option cards
const OPTS=['ספה','הובלה','הפיצה הראשונה'];
const scrX=(x)=>PHX+(14+x)*PS, scrY=(y)=>PHY+(14+y)*PS;   // screen -> stage
const AMT=[[CX+40,MY+118],[CX+40,MY+208]];                 // stage centre of the two ₪0 amounts (left side of the card)

const tick=(s=26,c=BLUE)=>`<svg width="${s}" height="${s}" viewBox="0 0 34 34" style="vertical-align:middle"><path d="M6 18 L14 26 L28 9" stroke="${c}" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const meterHTML=()=>`<div style="position:absolute;left:0;top:0;width:${CW}px;height:${MH}px;background:#fff;border:5px solid ${INK};border-radius:34px;box-sizing:border-box;direction:rtl">
  <div class="w" style="position:absolute;right:34px;top:26px;font:700 40px/1 R;color:${MUTED}">משלמים:</div>
  ${['להומי','למתווך'].map((l,i)=>`<div class="mrow" style="position:absolute;left:18px;right:18px;top:${84+i*90}px;height:78px;border-radius:22px">
    <div class="w" style="position:absolute;right:18px;top:0;font:600 50px/78px F;color:${INK}">${l}</div>
    <div class="amt w" style="position:absolute;left:18px;top:0;font:600 64px/78px F;color:${BLUE}">${N(Z)}</div></div>`).join('')}</div>`;
const optHTML=(i)=>`<div style="position:absolute;left:0;top:0;width:${CW}px;height:${OH}px;background:#fff;border:4px solid ${PALE};border-radius:30px;box-sizing:border-box;display:flex;align-items:center;gap:22px;padding-right:20px;direction:rtl">
  <div class="w" style="flex:none;width:80px;height:80px;border-radius:40px;background:${BLUE};color:#fff;font:700 50px/80px R;text-align:center">${i+1}</div>
  <div class="w" style="font:600 ${i===2?46:54}px/1 F;color:${INK};white-space:nowrap">${OPTS[i]}</div></div>`;

/* ---------- phone screens (HTML strings, reused in the cover) ---------- */
const statusBar=(c=INK)=>`<div class="w" style="position:absolute;left:34px;top:20px;font:700 22px/1 R;color:${c};direction:ltr">9:41</div><div style="position:absolute;left:156px;top:14px;width:120px;height:32px;border-radius:16px;background:${INK}"></div>`;
const T=(x,y,txt,font,c=INK,extra='')=>`<div class="w" style="position:absolute;left:${x}px;top:${y}px;font:${font};color:${c};${extra}">${txt}</div>`;
const TR=(y,txt,font,c=INK)=>`<div class="w" style="position:absolute;right:28px;top:${y}px;font:${font};color:${c};text-align:right">${txt}</div>`;
const room=(k)=>{const w=[`<rect x="250" y="70" width="130" height="150" rx="6" fill="#fff" stroke="${PALE}" stroke-width="8"/><path d="M315 70 V220 M250 145 H380" stroke="${PALE}" stroke-width="6"/><rect x="40" y="200" width="200" height="70" rx="12" fill="#fff" stroke="${INK}" stroke-width="5"/><rect x="52" y="182" width="60" height="30" rx="10" fill="${PALE}" stroke="${INK}" stroke-width="4"/>`,
  `<rect x="60" y="80" width="150" height="180" rx="6" fill="#fff" stroke="${INK}" stroke-width="5"/><circle cx="190" cy="172" r="7" fill="${INK}"/><rect x="270" y="150" width="110" height="120" rx="10" fill="#fff" stroke="${INK}" stroke-width="5"/><path d="M270 190 H380" stroke="${INK}" stroke-width="4"/><circle cx="325" cy="110" r="26" fill="${BLUE}"/>`,
  `<rect x="40" y="60" width="350" height="120" rx="10" fill="#fff" stroke="${PALE}" stroke-width="8"/><path d="M215 60 V180" stroke="${PALE}" stroke-width="6"/><rect x="90" y="210" width="250" height="60" rx="14" fill="${BLUE}"/><rect x="110" y="196" width="80" height="30" rx="10" fill="#fff" stroke="${INK}" stroke-width="4"/>`][k];
  return `<svg width="${SW}" height="320" viewBox="0 0 ${SW} 320" style="position:absolute;left:${k*SW}px;top:0"><rect width="${SW}" height="320" fill="${SOFT}"/>${w}<path d="M0 278 H${SW}" stroke="${PALE}" stroke-width="4"/></svg>`};
const listingHTML=`<div class="car" style="position:absolute;left:0;top:0;width:${SW*3}px;height:320px">${room(0)}${room(1)}${room(2)}</div>
  <div style="position:absolute;left:0;top:290px;width:${SW}px;display:flex;justify-content:center;gap:10px">${[0,1,2].map(i=>`<i class="dot" style="display:block;width:14px;height:14px;border-radius:7px;background:#fff"></i>`).join('')}</div>
  ${statusBar()}
  ${TR(346,'חדר בדירת שותפים','600 36px/1 F')}${TR(398,'רמת גן · כניסה בינואר','500 24px/1 R',MUTED)}
  <div class="w" style="position:absolute;right:28px;top:450px;height:58px;padding:0 24px;border-radius:29px;background:${SOFT};color:${BL2};font:700 28px/58px R">התאמה ${N('88%')}</div>
  <div style="position:absolute;right:28px;top:530px;display:flex;gap:10px;direction:rtl">${['תקציב','אזור','שקט'].map(t=>`<div class="w" style="height:50px;padding:0 16px;border-radius:25px;border:3px solid ${BLUE};color:${BL2};font:700 22px/44px R">${tick(18)} ${t}</div>`).join('')}</div>
  ${TR(612,`${N('6')} כבר הגישו`,'700 26px/1 R')}
  <div class="w" style="position:absolute;right:28px;top:668px;font:600 28px/1 R;color:${INK}">מפרסמים: <span style="color:${BL2}">בעלת הדירה</span></div>
  <div class="like w" style="position:absolute;left:28px;top:800px;width:376px;height:80px;border-radius:40px;border:4px solid ${BLUE};color:${BLUE};font:700 30px/72px R;text-align:center">אהבתי</div>`;
const mutualHTML=`${statusBar('#fff')}
  <svg width="${SW}" height="${SH}" style="position:absolute;left:0;top:0">
   <g class="av1"><circle cx="0" cy="0" r="70" fill="#fff"/><circle cx="0" cy="-14" r="22" fill="${INK}"/><path d="M-38 42 Q-38 4 0 4 Q38 4 38 42Z" fill="${INK}"/></g>
   <g class="av2"><circle cx="0" cy="0" r="70" fill="#fff"/><circle cx="0" cy="-14" r="22" fill="${BL2}"/><path d="M-38 42 Q-38 4 0 4 Q38 4 38 42Z" fill="${BL2}"/></g>
   <path class="hrt" d="M0 12 C0 -4 22 -4 22 10 C22 -4 44 -4 44 12 C44 28 22 38 22 42 C22 38 0 28 0 12Z" fill="#fff"/></svg>
  ${T(0,560,'זה הדדי!','600 58px/1 F','#fff','width:432px;text-align:center')}${T(0,636,'הצ׳אט נפתח','500 28px/1 R',PALE,'width:432px;text-align:center')}`;
const SLOTS=['18:00','18:30','19:00'];
const chatHTML=(done)=>`${statusBar()}
  <div style="position:absolute;left:0;top:56px;width:${SW}px;height:96px;border-bottom:3px solid ${SOFT}"></div>
  <svg width="64" height="64" style="position:absolute;right:28px;top:72px"><circle cx="32" cy="32" r="30" fill="${SOFT}"/><circle cx="32" cy="26" r="11" fill="${BL2}"/><path d="M14 52 Q14 36 32 36 Q50 36 50 52Z" fill="${BL2}"/></svg>
  ${T(0,80,'בעלת הדירה','700 28px/1 R',INK,'right:106px;left:auto')}${T(0,116,'חדר ברמת גן','500 20px/1 R',MUTED,'right:106px;left:auto')}
  <div class="b1 w" style="position:absolute;right:24px;top:186px;padding:16px 24px;border-radius:28px;background:${SOFT};font:500 26px/1.2 R;color:${INK}">היי! מתי נוח לבוא?</div>
  <div class="card" style="position:absolute;left:24px;top:280px;width:384px;height:170px;border-radius:28px;border:3px solid ${PALE};background:#fff">
   ${T(0,22,'סיור · יום שלישי','700 26px/1 R',INK,'width:384px;text-align:center')}
   ${SLOTS.map((s,i)=>`<div class="sl w" data-i="${i}" style="position:absolute;left:${256-i*124}px;top:78px;width:112px;height:62px;border-radius:20px;border:3px solid ${done&&i===1?BLUE:PALE};background:${done&&i===1?BLUE:'#fff'};color:${done&&i===1?'#fff':INK};font:700 26px/56px R;text-align:center;direction:ltr">${s}</div>`).join('')}
  </div>
  <div class="ok w" style="position:absolute;left:56px;top:486px;width:320px;height:66px;border-radius:33px;background:${INK};color:#fff;font:700 26px/66px R;text-align:center;opacity:${done?1:0}">${tick(22,'#fff')} הסיור נקבע · ${N('18:30')}</div>`;
const ownerHTML=`${statusBar()}
  ${TR(84,'מפרסמים חדר','600 40px/1 F')}${TR(140,'הצד של בעלי הדירה','500 24px/1 R',MUTED)}
  <div style="position:absolute;left:28px;top:200px;width:376px;height:300px;border-radius:28px;border:3px solid ${PALE};overflow:hidden">
   <svg width="376" height="170" viewBox="0 0 376 170" style="position:absolute;left:0;top:0"><rect width="376" height="170" fill="${SOFT}"/><rect x="210" y="30" width="110" height="110" rx="6" fill="#fff" stroke="${PALE}" stroke-width="7"/><path d="M265 30 V140 M210 85 H320" stroke="${PALE}" stroke-width="5"/><rect x="40" y="96" width="150" height="54" rx="10" fill="#fff" stroke="${INK}" stroke-width="4"/></svg>
   ${TR(190,'חדר · רמת גן','700 28px/1 R')}${TR(236,'כניסה בינואר','500 22px/1 R',MUTED)}</div>
  <div style="position:absolute;left:28px;top:530px;width:376px;height:76px;border-radius:24px;background:${SOFT}">
   <div class="w" style="position:absolute;right:22px;top:0;font:600 28px/76px R;color:${INK}">פרסום מודעה</div>
   <div class="w" style="position:absolute;left:22px;top:0;font:700 30px/76px R;color:${BL2}">חינם</div></div>
  ${TR(636,'עד 3 מודעות','500 24px/1 R',MUTED)}
  <div class="pub w" style="position:absolute;left:28px;top:800px;width:376px;height:80px;border-radius:40px;background:${INK};color:#fff;font:700 30px/80px R;text-align:center">פרסום</div>`;

const phoneShell=(inner)=>`<div style="position:absolute;left:0;top:0;width:460px;height:940px;border-radius:66px;background:${INK};box-shadow:0 30px 60px rgba(17,17,17,.16)">
  <div style="position:absolute;left:14px;top:14px;width:${SW}px;height:${SH}px;border-radius:54px;background:#fff;overflow:hidden">${inner}</div></div>`;

/* ---------- COVER (white): frame 0, fully drawn ---------- */
const cov=$(`left:0;top:0;width:1080px;height:1920px;background:#fff;z-index:60`,`
  <div style="position:absolute;left:0;top:280px;width:1080px;display:flex;justify-content:center">${WORDMARK.replace('<svg ','<svg style="width:200px;height:auto" ')}</div>
  ${hl(392,'בלי דמי תיווך.',INK,108)}${hl(514,'על מה זה ילך?',BLUE,108)}
  <div style="position:absolute;left:${PHX}px;top:${PHY}px;width:460px;height:940px;transform:scale(${PS});transform-origin:0 0">${phoneShell(chatHTML(true))}</div>
  <div style="position:absolute;left:${CX}px;top:${MY}px">${meterHTML()}</div>
  ${OY.map((y,i)=>`<div style="position:absolute;left:${CX}px;top:${y}px">${optHTML(i)}</div>`).join('')}
  <div class="w" style="position:absolute;left:0;top:1650px;width:1080px;text-align:center;font:500 34px/1.2 R;color:${GREY}">הדגמה. הנתונים והדמויות לדוגמה.</div>`);
at(cov,0,COVER_END,{anim:'none',fo:0});
window.COVER={t:0.2,title:'בלי דמי תיווך. על מה זה ילך?'};

bg('#fff',0,DUR);

/* ---------- the live scene ---------- */
const phone=$(`left:${PHX}px;top:${PHY}px;width:460px;height:940px;border-radius:66px;background:${INK};box-shadow:0 30px 60px rgba(17,17,17,.16);z-index:5;transform-origin:0 0`);
at(phone,COVER_END,E0,{anim:'none',fo:.2});
const scr=$(`left:14px;top:14px;width:${SW}px;height:${SH}px;border-radius:54px;background:#fff;overflow:hidden`,'',phone);
const S=(html,bgc='#fff')=>$(`left:0;top:0;width:${SW}px;height:${SH}px;background:${bgc};overflow:hidden`,html,scr);
function screen(a,b,html,bgc){const el=S(html,bgc);if(a>COVER_END)ev(a,'swish',.6);
  return at(el,a,b,{anim:'none',fo:0,up:(l)=>{el.style.transform=a>COVER_END?`translateX(${-(1-outCubic(seg(l,0,.3)))*SW}px)`:''}})}
const LIKE_T=4.9,MUT_A=5.9,CHAT_A=6.9,SLOT_T=8.0,OK_T=8.3,PUB_T=10.0;
const sA=screen(COVER_END,MUT_A+.3,listingHTML);
const sB=screen(MUT_A,CHAT_A+.3,mutualHTML,BLUE);
const sC=screen(CHAT_A,B3+.3,chatHTML(false));
const sD=screen(B3,E0,ownerHTML);
ev(MUT_A+.45,'ding',1.1);ev(OK_T,'ding',1.2);ev(PUB_T+.3,'ding',1.3);

const meter=$(`left:${CX}px;top:${MY}px;width:${CW}px;height:${MH}px;z-index:6`,meterHTML());
at(meter,COVER_END,E0,{anim:'none',fo:.2});
const mrows=[...meter.querySelectorAll('.mrow')];
const opts=OY.map((y,i)=>{const o=$(`left:${CX}px;top:${y}px;width:${CW}px;height:${OH}px;z-index:6`,optHTML(i));at(o,COVER_END,E0,{anim:'none',fo:.2});return o});

/* +₪0 chips that fly from each tap to the meter */
const FLY=[[LIKE_T,216,840,1],[MUT_A+.4,216,560,0],[SLOT_T,194,390,1],[PUB_T,216,840,0]];
const flies=FLY.map(()=>{const f=$(`left:0;top:0;height:70px;padding:0 22px;border-radius:35px;background:${BLUE};color:#fff;font:600 44px/70px F;z-index:20;direction:ltr;white-space:nowrap`,'+₪0');return f});
FLY.forEach(([t],i)=>{ev(t+.05,'pop',.8);ev(t+.65,'pin',.9);at(flies[i],t+.05,t+.7,{anim:'none',fo:0})});

/* finger (inside the screen) */
const finger=$(`left:0;top:0;width:64px;height:64px;border-radius:32px;background:rgba(17,17,17,.26);border:4px solid #fff;box-shadow:0 4px 12px rgba(17,17,17,.2);display:none;z-index:9`,'',scr);
const ripple=$(`left:0;top:0;width:64px;height:64px;border-radius:32px;border:5px solid ${BLUE};display:none;z-index:9`,'',scr);
const TAPS=[[LIKE_T,216,840],[SLOT_T,194,390],[PUB_T,216,840]];
TAPS.forEach(([t])=>ev(t,'pin',.7));

/* ---------- captions (top) + the prompt ---------- */
caption(392,['בלי מתווך.','בחינם.'],COVER_END,P0,{say:'בלי מתווך. בחינם.',fs:108,cols:[INK,BLUE],fo:.12,sfx:'thud'});
const promptHTML=`<div style="position:absolute;left:110px;top:0;width:860px;height:224px;border-radius:60px;background:${SOFT};border:5px solid ${INK};box-sizing:border-box;display:flex;align-items:center;justify-content:center;gap:30px;direction:rtl">
  <div style="flex:none;width:84px;height:84px;border-radius:42px;background:${BLUE};display:flex;align-items:center;justify-content:center">
   <svg width="48" height="48" viewBox="0 0 48 48"><path d="M8 8 H40 Q44 8 44 12 V30 Q44 34 40 34 H22 L12 42 V34 H8 Q4 34 4 30 V12 Q4 8 8 8Z" fill="#fff"/></svg></div>
  <div class="w" style="font:600 92px/1.0 F;color:${INK};text-align:center">על מה?<br>מספר בתגובות.</div></div>`;
at($(`left:0;top:392px;width:1080px;height:224px;z-index:9`,promptHTML),P0,B2,{say:'על מה? תכתבו מספר.',dy:30,s0:.85,fo:.15,sfx:'pop2'});
window.PROMPT={t:3.0,text:'על מה? מספר בתגובות.'};
caption(392,['לייק. צ׳אט. סיור.',N(Z)+'.'],B2,B3,{say:'לייק, צ\'אט, סיור. אפס.',fs:108,cols:[INK,BLUE],fo:.12,sfx:'whoosh2'});
caption(392,['חינם.','לשני הצדדים.'],B3,E0,{say:'חינם, לשני הצדדים.',fs:108,cols:[BLUE,INK],fo:.12,sfx:'pop'});

/* ---------- brand ending (feature: endCard, at most 1.5 s) ---------- */
endCard(E0,DUR,'בלי מתווכים. בחינם. בכל הארץ.');

/* ---------- footnote ---------- */
at($(`left:0;top:1650px;width:1080px;text-align:center`,`<div class="w" style="font:500 34px/1.2 R;color:${GREY}">הדגמה. הנתונים והדמויות לדוגמה.</div>`),COVER_END,E0,{anim:'none',fo:0});

/* ---------- per-frame state ---------- */
function update(t){
  // A: photo carousel slides from the first frame after the cover
  const ci=t<1.5?0:t<2.7?1:t<3.9?2:t<5.1?0:1;const cp=[1.5,2.7,3.9,5.1].filter(x=>t>=x).pop();
  const prev=t<1.5?0:[0,1,2,0][[1.5,2.7,3.9,5.1].indexOf(cp)];
  const k=cp?outCubic(seg(t,cp,.4)):1;const from=cp?prev:0,to=ci;
  sA.querySelector('.car').style.transform=`translateX(${-(from+(to-from)*k)*SW}px)`;
  sA.querySelectorAll('.dot').forEach((d,i)=>{d.style.background=i===ci?BLUE:'#fff'});
  const lk=sA.querySelector('.like'),lo=t>=LIKE_T;lk.style.background=lo?BLUE:'#fff';lk.style.color=lo?'#fff':BLUE;lk.innerHTML=lo?`${tick(26,'#fff')} אהבת`:'אהבתי';
  lk.style.transform=`scale(${1+Math.sin(seg(t,LIKE_T,.3)*Math.PI)*.08})`;
  // B: avatars meet, heart pops
  const m=inOut(seg(t,MUT_A+.1,.5));sB.querySelector('.av1').setAttribute('transform',`translate(${70+m*70} 380)`);sB.querySelector('.av2').setAttribute('transform',`translate(${362-m*70} 380)`);
  const h=outBack(seg(t,MUT_A+.45,.3));sB.querySelector('.hrt').setAttribute('transform',`translate(194 ${250-h*20}) scale(${h})`);
  // C: chat bubble, slot pick, booked
  [['.b1',CHAT_A+.3],['.card',CHAT_A+.6]].forEach(([s,tt])=>{const el=sC.querySelector(s);const q=seg(t,tt,.25);el.style.opacity=q;el.style.transform=`translateY(${(1-outCubic(q))*20}px)`});
  sC.querySelectorAll('.sl').forEach(c=>{const on=c.dataset.i==='1'&&t>=SLOT_T;c.style.background=on?BLUE:'#fff';c.style.color=on?'#fff':INK;c.style.borderColor=on?BLUE:PALE});
  const okq=seg(t,OK_T,.3);const okel=sC.querySelector('.ok');okel.style.opacity=okq;okel.style.transform=`scale(${.6+.4*outBack(okq)})`;
  // D: publish
  const pb=sD.querySelector('.pub'),po=t>=PUB_T;pb.style.background=po?BLUE:INK;pb.innerHTML=po?`${tick(26,'#fff')} פורסם`:'פרסום';
  pb.style.transform=`scale(${1+Math.sin(seg(t,PUB_T,.3)*Math.PI)*.08})`;
  // phone: a gentle float
  phone.style.transform=`translateY(${Math.sin(t*2.1)*6}px) scale(${PS})`;
  // finger
  let f=null;for(const [tt,x,y] of TAPS){if(t>=tt-.6&&t<tt+.3){const q=inOut(seg(t,tt-.6,.6));f={x:x+70*(1-q),y:y+150*(1-q),d:t>=tt&&t<tt+.15};break}}
  if(f){show(finger,true);finger.style.transform=`translate(${f.x-32}px,${f.y-32}px) scale(${f.d?.85:1})`}else show(finger,false);
  const rp=TAPS.find(([tt])=>t>=tt&&t<tt+.4);if(rp){show(ripple,true);const q=seg(t,rp[0],.4);ripple.style.opacity=1-q;ripple.style.transform=`translate(${rp[1]-32}px,${rp[2]-32}px) scale(${1+q*1.4})`}else show(ripple,false);
  // +₪0 chips fly to the meter
  FLY.forEach(([tt,x,y,row],i)=>{const q=inOut(seg(t,tt+.05,.6));const sx=scrX(x),sy=scrY(y),[ex,ey]=AMT[row];
    const fx=sx+(ex-sx)*q,fy=sy+(ey-sy)*q-Math.sin(q*Math.PI)*140;flies[i].style.transform=`translate(${fx-60}px,${fy-35}px) scale(${1-.25*q})`});
  // meter rows flash when a chip lands; the amounts never move
  mrows.forEach((r,i)=>{let g=0;FLY.forEach(([tt,,,row])=>{if(row===i)g=Math.max(g,Math.sin(seg(t,tt+.62,.45)*Math.PI))});
    r.style.background=g>0?`rgba(234,241,255,${g})`:'transparent';r.querySelector('.amt').style.transform=`scale(${1+g*.18})`});
  // options bob gently (offset per card); a pulse in turn while the prompt is up and before the end card
  opts.forEach((o,i)=>{const p=Math.max(Math.sin(seg(t,P0+.3+i*.35,.35)*Math.PI),Math.sin(seg(t,10.6+i*.3,.35)*Math.PI));
    o.style.transform=`translateY(${Math.sin(t*2.6+i*1.3)*5}px) scale(${1+p*.06})`;o.firstElementChild.style.borderColor=p>.05?BLUE:PALE});
}

function render(t){runItems(t);update(t);turtle(null)}
window.BEATS={payoff:B2,outro:E0};
window.AUDIO={dur:DUR,seed:1042,sections:[[0,B2,'POP',.24,1,0],[B2,DUR,'DET',.26,0,1]],ticks:[0.4,3.0]};
window.STRETCH=1.0;
window.VOICE={duck:0.7};   // narration = the say marks above
window.render=render;window.EVENTS=EVENTS;window.SCENES=SCENES;window.DUR=DUR;render(0);
