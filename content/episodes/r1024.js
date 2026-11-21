// Reel H24 (1024) — the city · editorial (style C), voiced, Comment: "same rent, three flats, each with its catch".
// Second replacement for the 18:00 slot (H21 off target, H22 cringe). Dry and specific: three listing cards, same rent,
// 1 a huge room 40 minutes from work / 2 ten minutes from everything, a tiny room / 3 a street balcony, no AC.
// Each card gets one beat, then the question: which would you take? 1, 2 or 3. Plain wordmark, no tag.
const DUR=14.0;
const SCENES=[['a',0,6.6],['b',6.6,DUR]];

/* ---------- timing ---------- */
const COVER_END=0.4,H0=COVER_END,B0=3.0,BL=2.2,ASK=B0+3*BL,E0=13.2;   // ASK = 9.6
const IN=[0.45,0.62,0.79];             // the three cards land

/* ---------- line icons (one per flat, real objects) ---------- */
const bedBig=c=>`<svg viewBox="0 0 150 110" width="150" height="110" fill="none" stroke="${c}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">
  <path d="M10 92 V22 M10 62 H140 V92 M10 76 H140"/><rect x="18" y="40" width="40" height="22" rx="8"/><path d="M62 62 V46 H140 V62"/></svg>`;
const bedTight=c=>`<svg viewBox="0 0 150 110" width="150" height="110" fill="none" stroke="${c}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">
  <path d="M20 8 V102 M130 8 V102" stroke-width="9"/><path d="M26 92 V40 M26 66 H124 V92 M26 78 H124"/><rect x="32" y="48" width="30" height="18" rx="6"/></svg>`;
const balc=c=>`<svg viewBox="0 0 150 110" width="150" height="110" fill="none" stroke="${c}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="112" cy="26" r="16"/><path d="M8 60 H142 M8 102 H142"/>${[0,1,2,3,4,5].map(i=>`<path d="M${18+i*23} 60 V102"/>`).join('')}</svg>`;

/* ---------- the three listing cards (same rent, no prices) ---------- */
const FLATS=[
  {t:'חדר ענק.',up:'נכנסים ארון, שולחן וספה.',dn:'40 דקות לעבודה. לכל כיוון.',ic:bedBig},
  {t:'חדר זעיר.',up:'10 דקות ברגל מכל דבר.',dn:'המיטה נוגעת בשני הקירות.',ic:bedTight},
  {t:'מרפסת לרחוב.',up:'קפה בחוץ כל בוקר.',dn:'אין מזגן. גם לא באוגוסט.',ic:balc}];
const CW=840,CH=236;
function cardHTML(f,i,hot){
  return `<div style="position:relative;width:${CW}px;height:${CH}px;border-radius:26px;border:5px solid ${hot?BLUE:INK};background:#fff;direction:rtl;box-sizing:border-box">
   <div class="w" style="position:absolute;right:26px;top:24px;width:74px;height:74px;border-radius:50%;background:${hot?BLUE:INK};color:#fff;text-align:center;font:700 46px/74px R">${i+1}</div>
   <div class="w" style="position:absolute;right:122px;top:20px;font:600 60px/1.2 F;color:${INK}">${f.t}</div>
   <div class="w" style="position:absolute;right:122px;top:104px;font:500 40px/1.2 R;color:${INK}"><span style="color:${BLUE};font-weight:700">✓</span> ${f.up}</div>
   <div class="w" style="position:absolute;right:122px;top:158px;font:500 40px/1.2 R;color:${MUTED}"><span style="color:${INK};font-weight:700">✗</span> ${f.dn}</div>
   <div style="position:absolute;left:24px;top:62px">${f.ic(hot?BLUE:INK)}</div>
   <div class="w" style="position:absolute;left:28px;top:20px;font:700 26px/1 R;color:${MUTED};letter-spacing:1px">אותו מחיר</div>
  </div>`}

/* ---------- COVER: frame 0 is the cover (the three cards, final state), held until COVER_END ---------- */
const cov=$(`left:0;top:0;width:1080px;height:1920px;background:#fff;z-index:60`,`
  ${hl(390,'אותו מחיר.',INK,120)}${hl(530,'איזו לוקחים?',BLUE,120)}
  ${FLATS.map((f,i)=>`<div style="position:absolute;left:120px;top:${740+i*218}px;transform:scale(.86);transform-origin:50% 0">${cardHTML(f,i,false)}</div>`).join('')}`);
at(cov,0,COVER_END,{anim:'none',fo:0});
window.COVER={t:0.2,title:'אותו מחיר. איזו לוקחים?'};

/* ---------- the cards: fly in, then one beat each (active card lifts, the others dim) ---------- */
bg('#fff',0,E0);
const CY=[600,860,1120];
const cards=FLATS.map((f,i)=>{const el=$(`left:${(1080-CW)/2}px;top:${CY[i]}px;width:${CW}px;height:${CH}px;transform-origin:50% 50%`,cardHTML(f,i,false));
  const hot=$(`left:0;top:0;width:${CW}px;height:${CH}px`,cardHTML(f,i,true),el);
  at(el,H0,E0,{anim:'none',fo:0,up:(l,t)=>{
    const k=outBack(seg(t,IN[i],.34)), x=(1-k)*(i%2?-1100:1100);
    const a=B0+i*BL, act=t>=a&&t<a+BL, inBeat=t>=B0&&t<ASK;
    const lift=act?outCubic(seg(t,a,.3)):0;
    el.style.transform=`translateX(${x}px) scale(${1+.06*lift}) rotate(${act?Math.sin((t-a)*5)*.4:0}deg)`;
    el.style.opacity=t<IN[i]?0:(inBeat&&!act?.28:1);
    hot.style.display=act?'block':'none'}});
  return el});
IN.forEach(t=>ev(t,'swish',.7));

/* ---------- hook ---------- */
caption(300,['לכל אחת','יש קאץ׳.'],H0,B0,{say:'לכל אחת יש קאץ׳.',fs:108,cols:[INK,BLUE],fo:0,dur:.2,sfx:'thud'});

/* ---------- one beat per flat ---------- */
const LINES=[['ענק.','ורחוק.'],['קרוב.','וזעיר.'],['מרפסת.','בלי מזגן.']];
LINES.forEach((ln,i)=>{const a=B0+i*BL;
  caption(300,ln,a+.05,a+BL,{say:ln.join(' ').replace('מרפסת. ','מרפסת, '),fs:112,cols:[INK,BLUE],fo:.06,anim:'up',dy:24,sfx:i?'pop2':'whoosh',v:.8})});

/* ---------- engagement prompt (Comment) ---------- */
caption(300,['איזו','לוקחים?'],ASK+.05,E0,{say:'איזו לוקחים? בתגובות.',fs:108,cols:[INK,BLUE],fo:.08,sfx:'thud'});
at($(`left:0;top:1390px;width:1080px;text-align:center;font:700 66px/1.1 R;color:${INK};direction:rtl`,`<span dir="ltr" style="unicode-bidi:isolate">1 / 2 / 3</span> <span style="color:${BLUE}">בתגובות.</span>`),ASK+.6,E0,{dy:20,fo:.08,sfx:'pop',v:.7});
at($(`left:0;top:1826px;width:1080px;text-align:center;white-space:nowrap`,`<span style="display:inline-block;padding:4px 18px;border-radius:20px;background:#fff;font:500 34px/1.2 R;color:#8C8C8C">דירות לדוגמה</span>`),H0,E0,{anim:'none',fo:.1});

/* ---------- plain wordmark ---------- */
bg('#fff',E0,DUR);
wordmark(E0,DUR);

function render(t){runItems(t)}
window.AUDIO={dur:DUR,seed:1024,sections:[[0,B0,'DET',.13,1,0],[B0,ASK,'FC',.14,1,1],[ASK,DUR,'MIN',.13,0,1]],ticks:[3.0,9.6]};
window.STRETCH=1.0;
window.VOICE={duck:0.7};   // narration = the say marks above
window.render=render;window.EVENTS=EVENTS;window.SCENES=SCENES;window.DUR=DUR;render(0);
