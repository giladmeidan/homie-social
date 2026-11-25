// Reel H36 (1036) — Pick one · style B (kinetic type + drawn objects) · voiced. C13 cut for v2: "which street would you live above?".
// Replaces the rejected H35 in slot "2026-11-25 13".
// Cover (white): "מעל איזה רחוב / הייתם גרים?" + three tall numbered cards, the same bedroom window above three streets
// (1 a main road with a bus / 2 a quiet street with trees / 3 a bar with a lit sign and music notes).
// Hook "החלון / שלכם." while the bus drives, the trees sway and the notes float up -> prompt pill "1, 2 או 3? בתגובות."
// at 1.9 s -> one beat per street on black (that card lifts and turns blue, the others dim) -> white ask -> wordmark.
const DUR=14.0;
const COVER_END=0.4,P0=2.1,B0=5.0,BL=2.3,ASK=B0+3*BL,E0=13.4;   // ASK = 11.9
const SCENES=[['a',0,B0],['b',B0,DUR]];
Tt.style.zIndex=50;
const dark=t=>t>=B0&&t<ASK;

/* ---------- small static wordmark, frame 0 until the brand ending ---------- */
const smallWM=(fill)=>{const m=$(`left:0;top:280px;width:1080px;display:flex;justify-content:center;z-index:70`,WORDMARK);
  m.querySelector('svg').style.cssText='width:200px;height:auto;display:block';m.querySelectorAll('path').forEach(p=>p.setAttribute('fill',fill));return m};
const wm=smallWM(INK);
at(wm,0,E0,{anim:'none',fo:0,up:(l,t)=>{const c=dark(t)?'#fff':INK;wm.querySelectorAll('path').forEach(p=>p.setAttribute('fill',c))}});

/* ---------- three cards: the same window above three streets (290 x 520 each) ---------- */
const CW=290,CH=520,TOP=730;
const LEFT=[720,395,70];   // RTL: 1 right, 2 middle, 3 left
const STREETS=[
  {n:'1',label:'ראשי',l1:'ראשי.',l2:'אוטובוס בשש.',say:'ראשי. אוטובוס'},
  {n:'2',label:'שקט',l1:'שקט.',l2:'ורחוק מהכול.',say:'שקט, ורחוק'},
  {n:'3',label:'מעל בר',l1:'מעל בר.',l2:'רועש עד שתיים.',say:'בר, עד שתיים'}];
// façade + window (shared), then the street part (y 360-520) per card
const facade=(c)=>`<rect x="0" y="0" width="${CW}" height="350" fill="#fff"/>
  <path d="M0 40 H${CW}" stroke="${PALE}" stroke-width="5"/>
  <rect x="70" y="90" width="150" height="150" rx="10" fill="${SOFT}" stroke="${c}" stroke-width="7"/>
  <path d="M145 90 V240 M70 165 H220" stroke="${c}" stroke-width="5"/>
  <rect class="cur" x="74" y="94" width="34" height="142" fill="${PALE}"/>
  <rect x="58" y="240" width="174" height="16" rx="6" fill="${c}"/>`;
const STREET=[
  c=>`<rect x="0" y="350" width="${CW}" height="170" fill="#fff"/><path d="M0 368 H${CW}" stroke="${c}" stroke-width="6"/>
     <path d="M0 470 H${CW}" stroke="${PALE}" stroke-width="6" stroke-dasharray="26 18"/>
     <g class="mv"><rect x="0" y="388" width="200" height="86" rx="16" fill="${BLUE}" stroke="${c}" stroke-width="5"/>
      ${[16,64,112].map(x=>`<rect x="${x}" y="402" width="38" height="30" rx="5" fill="#fff"/>`).join('')}
      <rect x="160" y="402" width="28" height="56" rx="4" fill="#fff"/>
      <circle cx="44" cy="478" r="15" fill="${INK}"/><circle cx="160" cy="478" r="15" fill="${INK}"/></g>`,
  c=>`<rect x="0" y="350" width="${CW}" height="170" fill="#fff"/><path d="M0 368 H${CW}" stroke="${c}" stroke-width="6"/>
     ${[60,215].map((x,k)=>`<g class="tr${k}" style="transform-origin:${x}px 500px"><path d="M${x} 500 V430" stroke="${c}" stroke-width="9" stroke-linecap="round"/>
      <circle cx="${x}" cy="418" r="34" fill="#fff" stroke="${c}" stroke-width="7"/><circle cx="${x-20}" cy="434" r="20" fill="#fff" stroke="${c}" stroke-width="7"/><circle cx="${x+20}" cy="434" r="20" fill="#fff" stroke="${c}" stroke-width="7"/></g>`).join('')}
     <path d="M110 478 H180 M118 478 V500 M172 478 V500" stroke="${c}" stroke-width="7" stroke-linecap="round"/>`,
  c=>`<rect x="0" y="350" width="${CW}" height="170" fill="#fff"/><path d="M0 368 H${CW}" stroke="${c}" stroke-width="6"/>
     <rect x="30" y="384" width="230" height="130" rx="8" fill="#fff" stroke="${c}" stroke-width="6"/>
     <rect class="sign" x="70" y="398" width="150" height="56" rx="12" fill="${BLUE}"/>
     <text x="145" y="438" text-anchor="middle" font-family="R" font-weight="700" font-size="38" fill="#fff">בר</text>
     <rect x="120" y="466" width="50" height="48" fill="${SOFT}" stroke="${c}" stroke-width="5"/>
     ${[0,1,2].map(k=>`<g class="nt${k}"><ellipse cx="0" cy="18" rx="12" ry="9" fill="${BLUE}" transform="rotate(-20 0 18)"/><path d="M10 16 V-16 Q20 -10 24 2" fill="none" stroke="${BLUE}" stroke-width="6" stroke-linecap="round"/></g>`).join('')}`];
function cardHTML(s,i){
  return `<div class="cd c${i}" style="position:absolute;left:${LEFT[i]}px;top:${TOP}px;width:${CW}px;height:${CH+80}px;direction:rtl;transform-origin:50% 50%">
  <div class="fr" style="position:absolute;left:0;top:0;width:${CW}px;height:${CH}px;border-radius:30px;border:7px solid ${INK};box-sizing:border-box;overflow:hidden;background:#fff">
   <svg style="position:absolute;left:-7px;top:-7px;overflow:visible" width="${CW}" height="${CH}">${facade(INK)}${STREET[i](INK)}</svg></div>
  <div class="w" style="position:absolute;right:-14px;top:-18px;width:76px;height:76px;border-radius:50%;background:${BLUE};color:#fff;text-align:center;font:700 50px/76px R;border:5px solid #fff">${s.n}</div>
  <div class="lb w" style="position:absolute;left:-20px;right:-20px;top:${CH+10}px;text-align:center;font:700 54px/66px R;color:${INK}">${s.label}</div></div>`}
const cardsHTML=()=>STREETS.map(cardHTML).join('');
function animate(root,t,act){
  STREETS.forEach((s,i)=>{const c=root.querySelector('.c'+i);const on=act===i;
    const t0=B0+i*BL;const k=on?outBack(seg(t,t0,.35)):0;
    c.style.transform=`scale(${1+.07*k})`;
    c.style.opacity=act<0||on?1:.3;
    c.querySelector('.fr').style.borderColor=on?BLUE:INK;c.querySelector('.fr').style.borderWidth=on?'10px':'7px';
    c.querySelector('.lb').style.color=act>=0?(on?NAMEC:'#fff'):INK;
    const sp=on?1.8:1;
    if(i===0){const p=((t*.55*sp)%1+1)%1;c.querySelector('.mv').setAttribute('transform',`translate(${CW+20-p*(CW+240)} 0)`);
      c.querySelector('.cur').setAttribute('transform',`translate(${Math.sin(t*30)*(p>.3&&p<.8?2:0)} 0)`)}
    if(i===1){[0,1].forEach(k2=>{c.querySelector('.tr'+k2).style.transform=`rotate(${Math.sin(t*2.2*sp+k2)*4}deg)`})}
    if(i===2){c.querySelector('.sign').setAttribute('opacity',Math.sin(t*9*sp)>-.3?1:.45);
      [0,1,2].forEach(k2=>{const p=((t*.6*sp+k2/3)%1+1)%1;const n=c.querySelector('.nt'+k2);
        n.setAttribute('transform',`translate(${70+k2*70+Math.sin(p*7+k2)*14} ${380-p*150})`);n.setAttribute('opacity',p<.85?1:(1-p)/.15)})}})}

/* ---------- COVER (white): frame 0, fully drawn ---------- */
const cov=$(`left:0;top:0;width:1080px;height:1920px;background:#fff;z-index:60`,`
  ${hl(400,'מעל איזה רחוב',INK,112)}${hl(530,'הייתם גרים?',BLUE,112)}${cardsHTML()}`);
animate(cov,1.3,-1);
at(cov,0,COVER_END,{anim:'none',fo:0});
window.COVER={t:0.2,title:'מעל איזה רחוב הייתם גרים?'};

/* ---------- backgrounds ---------- */
bg('#fff',0,B0);bg(INK,B0,ASK);bg('#fff',ASK,DUR);

/* ---------- the live cards (moving from the first frame after the cover) ---------- */
const cards=$(`left:0;top:0;width:1080px;height:1920px`,cardsHTML());
at(cards,COVER_END,E0,{anim:'none',fo:0,up:(l,t)=>{
  const act=t>=B0&&t<ASK?Math.min(2,Math.floor((t-B0)/BL)):-1;animate(cards,t+1.3,act)}});
[0.6,1.1,1.6].forEach(t=>ev(t,'pin',.7));
STREETS.forEach((s,i)=>ev(B0+i*BL+.3,'pop',.5));

/* ---------- hook ---------- */
caption(400,['החלון','שלכם.'],COVER_END,B0,{say:'החלון שלכם.',fs:118,cols:[INK,BLUE],fo:.1,sfx:'thud'});

/* ---------- the prompt (by 3 s), under the cards, stays to the brand ending ---------- */
const promptHTML=`<div style="position:absolute;left:90px;top:0;width:900px;height:136px;border-radius:68px;background:#fff;border:5px solid ${INK};box-sizing:border-box;display:flex;align-items:center;justify-content:center;direction:rtl">
  <div class="w" style="display:flex;direction:rtl;gap:22px;font:600 90px/1 F;color:${INK}">${['1,','2','או','3?'].map(x=>`<div style="direction:rtl">${x}</div>`).join('')}<div style="color:${BLUE}">בתגובות.</div></div></div>`;
const pr=$(`left:0;top:1360px;width:1080px;height:136px;z-index:9`,promptHTML);
at(pr,P0,E0,{say:'אחת, שתיים או שלוש?',dy:40,s0:.85,fo:.15,sfx:'pop2',
  up:(l,t)=>{const k=t>=ASK?Math.sin(clamp((t-ASK-.2)/.4)*Math.PI)*.06:0;pr.style.transform=`scale(${1+k})`}});
window.PROMPT={t:2.1,text:'1, 2 או 3? בתגובות.'};

/* ---------- one beat per street (black) ---------- */
STREETS.forEach((s,i)=>{const t0=B0+i*BL;
  caption(400,[s.l1,s.l2],t0+.05,t0+BL,{say:s.say,fs:104,cols:['#fff',NAMEC],fo:.08,sfx:i?'pop2':'whoosh',v:.8})});

/* ---------- the ask (white) ---------- */
caption(400,['אז מעל','איזה רחוב?'],ASK+.05,E0,{say:'אז איפה?',fs:118,cols:[INK,BLUE],fo:.1,sfx:'whoosh2'});
ev(ASK+.2,'pop',.7);

/* ---------- brand ending ---------- */
wordmark(E0,DUR);

function render(t){runItems(t);turtle(null)}
window.BEATS={payoff:B0,outro:ASK};
window.AUDIO={dur:DUR,seed:1036,sections:[[0,B0,'FC',.13,0,1],[B0,ASK,'POP',.15,1,0],[ASK,DUR,'MIN',.15,1,1]],ticks:[0.4,2.1]};
window.STRETCH=1.0;
window.VOICE={duck:0.7};   // narration = the say marks above
window.render=render;window.EVENTS=EVENTS;window.SCENES=SCENES;window.DUR=DUR;render(0);
