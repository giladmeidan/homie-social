// Reel H35 (1035) — Pick one · style C (clean editorial) · voiced. C11 cut for v2: "what has to be two minutes from home?".
// Cover (black): "מה חייב להיות / שתי דקות מהבית?" + a white line-drawn street map, a blue home pin with a dashed
// two-minute ring, and four numbered places outside it (1 supermarket / 2 station / 3 park / 4 the sea).
// Hook "רק אחד / נכנס לעיגול." while the ring ripples and a blue dot walks its edge -> prompt pill
// "מספר אחד. בתגובות." at 1.9 s -> one beat per place on white (that place slides into the ring and turns blue,
// the others dim) -> black ask -> wordmark.
const DUR=14.0;
const COVER_END=0.4,P0=1.9,B0=4.3,BL=1.9,ASK=B0+4*BL,E0=13.4;   // ASK = 11.9
const SCENES=[['a',0,B0],['b',B0,DUR]];
Tt.style.zIndex=50;
const dark=t=>t<B0||(t>=ASK&&t<E0);

/* ---------- small static wordmark, frame 0 until the brand ending ---------- */
const smallWM=(fill)=>{const m=$(`left:0;top:280px;width:1080px;display:flex;justify-content:center;z-index:70`,WORDMARK);
  m.querySelector('svg').style.cssText='width:200px;height:auto;display:block';m.querySelectorAll('path').forEach(p=>p.setAttribute('fill',fill));return m};
const wm=smallWM('#fff');
at(wm,0,E0,{anim:'none',fo:0,up:(l,t)=>{const c=dark(t)?'#fff':INK;wm.querySelectorAll('path').forEach(p=>p.setAttribute('fill',c))}});

/* ---------- line icons (100 x 100) ---------- */
const ICON={
  cart:c=>`<path d="M8 20 H24 L34 64 H80 L90 32 H30" fill="none" stroke="${c}" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"/>
    <circle cx="40" cy="80" r="8" fill="${c}"/><circle cx="74" cy="80" r="8" fill="${c}"/>`,
  bus:c=>`<rect x="16" y="12" width="68" height="66" rx="12" fill="#fff" stroke="${c}" stroke-width="7"/>
    <rect x="26" y="24" width="48" height="24" rx="4" fill="${c}"/><circle cx="32" cy="64" r="5" fill="${c}"/><circle cx="68" cy="64" r="5" fill="${c}"/>
    <path d="M28 78 V90 M72 78 V90" stroke="${c}" stroke-width="8" stroke-linecap="round"/>`,
  tree:c=>`<circle cx="50" cy="38" r="28" fill="#fff" stroke="${c}" stroke-width="7"/><circle cx="34" cy="52" r="16" fill="#fff" stroke="${c}" stroke-width="7"/>
    <circle cx="66" cy="52" r="16" fill="#fff" stroke="${c}" stroke-width="7"/><path d="M50 56 V92 M36 92 H64" stroke="${c}" stroke-width="7" stroke-linecap="round"/>`,
  sea:c=>`${[30,52,74].map(y=>`<path d="M8 ${y} Q20 ${y-12} 32 ${y} T56 ${y} T80 ${y} T96 ${y-6}" fill="none" stroke="${c}" stroke-width="7" stroke-linecap="round"/>`).join('')}`};
const PLACES=[
  {n:'1',label:'סופר',ic:'cart',l1:'סופר.',l2:'בלי לתכנן קניות.',say:'סופר, בלי לתכנן'},
  {n:'2',label:'תחנה',ic:'bus',l1:'תחנה.',l2:'בלי רכב.',say:'תחנה, בלי רכב'},
  {n:'3',label:'פארק',ic:'tree',l1:'פארק.',l2:'ירוק מתחת לבית.',say:'פארק מתחת לבית'},
  {n:'4',label:'הים',ic:'sea',l1:'הים.',l2:'וזהו.',say:'הים, וזהו'}];
// map panel (global coords)
const MX=90,MY=650,MW=900,MH=690,PX=540,PY=990,R=150;
const POS=[[815,760],[265,760],[815,1160],[265,1160]];   // centres; RTL order: 1 top right, 2 top left, 3, 4
const CD=136;   // chip circle diameter
function chipHTML(p,i){
  return `<div class="ch c${i}" style="position:absolute;left:${POS[i][0]-MX-100}px;top:${POS[i][1]-MY-CD/2}px;width:200px;height:220px;direction:rtl;transform-origin:100px ${CD/2}px">
  <div class="cc" style="position:absolute;left:${100-CD/2}px;top:0;width:${CD}px;height:${CD}px;border-radius:50%;background:#fff;border:6px solid ${INK};box-sizing:border-box">
   <svg style="position:absolute;left:12px;top:12px" width="100" height="100" viewBox="0 0 100 100">${ICON[p.ic](INK)}</svg></div>
  <div class="w" style="position:absolute;left:${100+CD/2-50}px;top:-12px;width:58px;height:58px;border-radius:50%;background:${BLUE};color:#fff;text-align:center;font:700 40px/58px R">${p.n}</div>
  <div class="lb w" style="position:absolute;left:0;right:0;top:${CD+6}px;text-align:center;font:700 50px/62px R;color:${INK}">${p.label}</div></div>`}
function mapHTML(){
  const streets=`<path d="M0 150 L${MW} 120 M0 330 L${MW} 300 M0 560 L${MW} 540 M190 0 L230 ${MH} M450 0 L450 ${MH} M700 0 L670 ${MH}" stroke="${PALE}" stroke-width="16" stroke-linecap="round" fill="none"/>`;
  const blocks=[[40,30,120,80],[260,20,150,70],[490,10,150,80],[740,30,120,60],[30,200,130,100],[740,360,130,110],[30,560,130,60],[740,560,130,60]]
    .map(([x,y,w,h])=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="${SOFT}"/>`).join('');
  return `<div style="position:absolute;left:${MX}px;top:${MY}px;width:${MW}px;height:${MH}px;border-radius:40px;background:#fff;border:6px solid ${INK};box-sizing:border-box;overflow:hidden">
   <svg style="position:absolute;left:-6px;top:-6px" width="${MW}" height="${MH}">${blocks}${streets}
    <g class="rip"><circle cx="${PX-MX}" cy="${PY-MY}" r="${R}" fill="none" stroke="${BLUE}" stroke-width="5" opacity="0"/></g>
    <circle class="ring" cx="${PX-MX}" cy="${PY-MY}" r="${R}" fill="${SOFT}" fill-opacity=".55" stroke="${BLUE}" stroke-width="7" stroke-dasharray="22 16"/>
    <path class="trail" d="" stroke="${BLUE}" stroke-width="7" stroke-dasharray="4 14" stroke-linecap="round" fill="none"/>
    <circle class="dot" cx="${PX-MX+R}" cy="${PY-MY}" r="14" fill="${BLUE}" stroke="#fff" stroke-width="5"/>
    <g transform="translate(${PX-MX} ${PY-MY}) scale(.72)"><path d="M0 0 C-34 -40 -40 -60 -40 -76 A40 40 0 0 1 40 -76 C40 -60 34 -40 0 0 Z" fill="${BLUE}" stroke="${INK}" stroke-width="5"/>
     <path d="M-18 -70 L0 -88 L18 -70 V-52 H-18 Z" fill="#fff"/></g>
    <rect x="${PX-MX-62}" y="${PY-MY+R-28}" width="124" height="50" rx="25" fill="${BLUE}"/>
    <text x="${PX-MX}" y="${PY-MY+R+9}" text-anchor="middle" font-family="R" font-weight="700" font-size="32" fill="#fff" direction="rtl">2 דק׳</text></svg>
   ${PLACES.map(chipHTML).join('')}</div>`}

/* ---------- COVER (black): frame 0, fully drawn ---------- */
const cov=$(`left:0;top:0;width:1080px;height:1920px;background:${INK};z-index:60`,`
  ${hl(400,'מה חייב להיות','#fff',112)}${hl(530,'שתי דקות מהבית?',NAMEC,112)}${mapHTML()}`);
at(cov,0,COVER_END,{anim:'none',fo:0});
window.COVER={t:0.2,title:'מה חייב להיות שתי דקות מהבית?'};

/* ---------- backgrounds ---------- */
bg(INK,0,B0);bg('#fff',B0,ASK);bg(INK,ASK,E0);bg('#fff',E0,DUR);

/* ---------- the live map (moving from the first frame after the cover) ---------- */
const map=$(`left:0;top:0;width:1080px;height:1920px`,mapHTML());
at(map,COVER_END,E0,{anim:'none',fo:0,up:(l,t)=>{
  const act=t>=B0&&t<ASK?Math.min(3,Math.floor((t-B0)/BL)):-1;
  // ripple out of the ring, all the time
  const rp=((t-COVER_END)/1.1%1+1)%1;const rc=map.querySelector('.rip circle');
  rc.setAttribute('r',R+rp*120);rc.setAttribute('opacity',(1-rp)*.7);
  // the walking dot goes round the two-minute edge
  const ang=(t-COVER_END)*1.6;const dot=map.querySelector('.dot');
  const ring=map.querySelector('.ring');ring.setAttribute('stroke-dashoffset',-t*40);
  let dx=PX-MX+R*Math.cos(ang),dy=PY-MY+R*Math.sin(ang);
  let trail='';
  PLACES.forEach((p,i)=>{const c=map.querySelector('.c'+i);const on=act===i;
    const t0=B0+i*BL;const k=on?outBack(seg(t,t0,.45)):0;
    // the chosen place slides into the ring, next to the home pin
    const vx=(PX-POS[i][0]),vy=(PY-POS[i][1]);const d=Math.hypot(vx,vy);const pull=(d-(R-2))/d;
    const bob=t<B0?Math.max(0,Math.sin(clamp((t-COVER_END-.3-i*.4)/.4)*Math.PI))*12:0;
    c.style.transform=`translate(${vx*pull*k}px,${vy*pull*k-bob}px) scale(${1+.08*k})`;
    c.style.opacity=act<0||on?1:.25;
    const cc=c.querySelector('.cc');cc.style.borderColor=on?BLUE:INK;cc.style.borderWidth=on?'9px':'6px';
    cc.querySelectorAll('path,circle,rect').forEach(n=>{if(n.getAttribute('stroke'))n.setAttribute('stroke',on?BLUE:INK);if(n.getAttribute('fill')&&n.getAttribute('fill')!=='#fff')n.setAttribute('fill',on?BLUE:INK)});
    c.querySelector('.lb').style.color=on?BLUE:INK;
    if(on){const e=seg(t,t0+.1,.5);dx=PX-MX+(POS[i][0]+vx*pull-PX)*e*.55;dy=PY-MY+(POS[i][1]+vy*pull-PY)*e*.55;
      trail=`M${PX-MX} ${PY-MY} L${dx} ${dy}`}});
  dot.setAttribute('cx',dx);dot.setAttribute('cy',dy);
  map.querySelector('.trail').setAttribute('d',trail)}});
[0.7,1.1,1.5,1.9].forEach(t=>ev(t,'pin',.7));
PLACES.forEach((p,i)=>ev(B0+i*BL+.35,'ding',.5));

/* ---------- hook ---------- */
caption(400,['רק אחד','נכנס לעיגול.'],COVER_END,B0,{say:'רק אחד נכנס.',fs:118,cols:['#fff',NAMEC],fo:.1,sfx:'thud'});

/* ---------- the prompt (by 3 s), under the map, stays to the brand ending ---------- */
const promptHTML=`<div style="position:absolute;left:70px;top:0;width:940px;height:136px;border-radius:68px;background:#fff;border:5px solid ${INK};box-sizing:border-box;display:flex;align-items:center;justify-content:center;direction:rtl">
  <div class="w" style="font:600 90px/1 F;color:${INK}">מספר אחד. <span style="color:${BLUE}">בתגובות.</span></div></div>`;
const pr=$(`left:0;top:1370px;width:1080px;height:136px;z-index:9`,promptHTML);
at(pr,P0,E0,{say:'מספר אחד. בתגובות.',dy:40,s0:.85,fo:.15,sfx:'pop2',
  up:(l,t)=>{const k=t>=ASK?Math.sin(clamp((t-ASK-.2)/.4)*Math.PI)*.06:0;pr.style.transform=`scale(${1+k})`}});
window.PROMPT={t:1.9,text:'מספר אחד. בתגובות.'};

/* ---------- one beat per place (white) ---------- */
PLACES.forEach((p,i)=>{const t0=B0+i*BL;
  caption(400,[p.l1,p.l2],t0+.05,t0+BL,{say:p.say,fs:112,cols:[INK,BLUE],fo:.08,sfx:i?'pop2':'whoosh',v:.8})});

/* ---------- the ask (black) ---------- */
caption(400,['אז מה','אתם לוקחים?'],ASK+.05,E0,{say:'מה לוקחים?',fs:118,cols:['#fff',NAMEC],fo:.1,sfx:'whoosh2'});
ev(ASK+.2,'pop',.7);

/* ---------- brand ending ---------- */
wordmark(E0,DUR);

function render(t){runItems(t);turtle(null)}
window.BEATS={payoff:B0,outro:ASK};
window.AUDIO={dur:DUR,seed:1035,sections:[[0,B0,'DET',.13,1,0],[B0,ASK,'MIN',.15,0,1],[ASK,DUR,'CG',.15,1,1]],ticks:[0.4,1.9]};
window.STRETCH=1.0;
window.VOICE={duck:0.7};   // narration = the say marks above
window.render=render;window.EVENTS=EVENTS;window.SCENES=SCENES;window.DUR=DUR;render(0);
