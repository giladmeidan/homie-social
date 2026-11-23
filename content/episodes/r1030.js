// Reel H30 (1030) — Pick one · style C (clean editorial) · voiced. C10 cut for v2: "which wall would you take?".
// Cover (black): "איזה קיר / אתם לוקחים?" + four numbered wall cards, each with what comes through it
// (1 piano at 7 am / 2 a dog alone all day / 3 renovation "two more months" / 4 a baby, awake at night).
// Hook "הקיר דק." while blue sound waves pulse through every wall -> prompt pill "בחרו מספר בתגובות" at 1.6 s
// -> one beat per wall on white (the card lifts and turns blue, the others dim) -> black ask -> wordmark.
const DUR=14.0;
const COVER_END=0.4,P0=1.6,B0=3.9,BL=1.95,ASK=B0+4*BL,E0=13.3;   // ASK = 11.7
const SCENES=[['a',0,B0],['b',B0,DUR]];
Tt.style.zIndex=50;
const GREY='#8C8C8C';
const dark=t=>t<B0||(t>=ASK&&t<E0);

/* ---------- small static wordmark, frame 0 until the brand ending ---------- */
const smallWM=(fill)=>{const m=$(`left:0;top:280px;width:1080px;display:flex;justify-content:center;z-index:70`,WORDMARK);
  m.querySelector('svg').style.cssText='width:200px;height:auto;display:block';m.querySelectorAll('path').forEach(p=>p.setAttribute('fill',fill));return m};
const wm=smallWM(INK);
at(wm,0,E0,{anim:'none',fo:0,up:(l,t)=>{const c=dark(t)?'#fff':INK;wm.querySelectorAll('path').forEach(p=>p.setAttribute('fill',c))}});

/* ---------- line icons (150 x 150) ---------- */
const ICON={
  piano:c=>`<rect x="10" y="38" width="130" height="84" rx="8" fill="#fff" stroke="${c}" stroke-width="7"/>
    <path d="M36 38 V122 M62 38 V122 M88 38 V122 M114 38 V122" stroke="${c}" stroke-width="5"/>
    <rect x="28" y="38" width="16" height="48" fill="${c}"/><rect x="54" y="38" width="16" height="48" fill="${c}"/><rect x="106" y="38" width="16" height="48" fill="${c}"/>`,
  paw:c=>`<ellipse cx="75" cy="100" rx="36" ry="30" fill="${c}"/><ellipse cx="32" cy="64" rx="13" ry="17" fill="${c}"/>
    <ellipse cx="58" cy="40" rx="13" ry="18" fill="${c}"/><ellipse cx="92" cy="40" rx="13" ry="18" fill="${c}"/><ellipse cx="118" cy="64" rx="13" ry="17" fill="${c}"/>`,
  drill:c=>`<path d="M22 46 H104 Q118 46 118 60 V72 Q118 86 104 86 H66 L58 130 H34 L42 86 H22 Q12 86 12 74 V58 Q12 46 22 46 Z" fill="#fff" stroke="${c}" stroke-width="7" stroke-linejoin="round"/>
    <path d="M118 66 H146" stroke="${c}" stroke-width="7" stroke-linecap="round"/><path d="M128 58 L134 74 M138 58 L144 74" stroke="${c}" stroke-width="4"/>`,
  bottle:c=>`<path d="M64 12 Q75 2 86 12 L88 30 H62 Z" fill="${c}"/><rect x="54" y="30" width="42" height="14" rx="4" fill="${c}"/>
    <rect x="50" y="44" width="50" height="96" rx="16" fill="#fff" stroke="${c}" stroke-width="7"/>
    <path d="M50 76 H70 M50 98 H70 M50 120 H70" stroke="${c}" stroke-width="5"/>`};
const WALLS=[
  {n:'1',label:'פסנתר',ic:'piano',l1:'פסנתר.',l2:'בשבע בבוקר.',say:'פסנתר בשבע בבוקר'},
  {n:'2',label:'כלב',ic:'paw',l1:'כלב.',l2:'כל היום לבד.',say:'כלב, כל היום לבד'},
  {n:'3',label:'שיפוץ',ic:'drill',l1:'שיפוץ.',l2:'״רק חודשיים.״',say:'שיפוץ. רק חודשיים'},
  {n:'4',label:'תינוק',ic:'bottle',l1:'תינוק.',l2:'ער בלילה.',say:'תינוק, ער בלילה'}];
const CW=430,CH=280;
const POS=[[560,720],[90,720],[560,1020],[90,1020]];   // RTL reading order: 1 top right, 2 top left, 3, 4
// one wall card: the neighbour's sound on the left, a brick wall, blue waves coming through, number badge
function cardHTML(w,i){
  const bricks=[0,1,2,3,4,5].map(r=>`<path d="M0 ${r*28} H44" stroke="${INK}" stroke-width="3"/><path d="M${r%2?22:11} ${r*28} V${r*28+28}" stroke="${INK}" stroke-width="3"/>`).join('');
  return `<div class="card c${i}" style="position:absolute;left:0;top:0;width:${CW}px;height:${CH}px;border-radius:30px;background:#fff;border:6px solid ${INK};box-sizing:border-box;direction:rtl;transform-origin:50% 50%">
  <svg style="position:absolute;left:18px;top:20px" width="150" height="150" viewBox="0 0 150 150">${ICON[w.ic](INK)}</svg>
  <svg style="position:absolute;left:170px;top:14px" width="44" height="168" viewBox="0 0 44 168"><rect x="0" y="0" width="44" height="168" fill="${SOFT}" stroke="${INK}" stroke-width="5"/>${bricks}</svg>
  <svg class="wv" style="position:absolute;left:224px;top:26px;overflow:visible" width="90" height="140" viewBox="0 0 90 140">
    ${[0,1,2].map(k=>`<path class="a${k}" d="M${10+k*26} ${30-k*12} Q${34+k*30} 70 ${10+k*26} ${110+k*12}" fill="none" stroke="${BLUE}" stroke-width="9" stroke-linecap="round" opacity="${[.95,.6,.3][k]}"/>`).join('')}</svg>
  <div class="w" style="position:absolute;right:20px;top:20px;width:80px;height:80px;border-radius:50%;background:${BLUE};color:#fff;text-align:center;font:700 54px/80px R">${w.n}</div>
  <div class="lb w" style="position:absolute;left:0;right:0;top:196px;text-align:center;font:700 52px/66px R;color:${INK}">${w.label}</div></div>`}
const gridHTML=()=>WALLS.map((w,i)=>`<div style="position:absolute;left:${POS[i][0]}px;top:${POS[i][1]}px;width:${CW}px;height:${CH}px">${cardHTML(w,i)}</div>`).join('');

/* ---------- COVER (black): frame 0, fully drawn ---------- */
const cov=$(`left:0;top:0;width:1080px;height:1920px;background:${INK};z-index:60`,`
  ${hl(400,'איזה קיר','#fff',118)}${hl(530,'אתם לוקחים?',NAMEC,118)}${gridHTML()}`);
at(cov,0,COVER_END,{anim:'none',fo:0});
window.COVER={t:0.2,title:'איזה קיר אתם לוקחים?'};

/* ---------- backgrounds ---------- */
bg(INK,0,B0);bg('#fff',B0,ASK);bg(INK,ASK,E0);bg('#fff',E0,DUR);

/* ---------- the live grid (moving from the first frame after the cover) ---------- */
const grid=$(`left:0;top:0;width:1080px;height:1920px`,gridHTML());
at(grid,COVER_END,E0,{anim:'none',fo:0,up:(l,t)=>{
  const act=t>=B0&&t<ASK?Math.min(3,Math.floor((t-B0)/BL)):-1;
  WALLS.forEach((w,i)=>{const c=grid.querySelector('.c'+i);const on=act===i;
    const t0=B0+i*BL;const k=on?outBack(seg(t,t0,.3)):0;
    // hook: each wall "rings" in turn so motion starts right after the cover
    const ring=t<B0?Math.max(0,Math.sin(clamp((t-COVER_END-i*.45)/.4)*Math.PI))*.04:0;
    c.style.transform=`scale(${1+ring+.06*k})`;
    c.style.opacity=act<0||on?1:.28;
    c.style.borderColor=on?BLUE:INK;c.style.borderWidth=on?'9px':'6px';
    c.querySelector('.lb').style.color=on?BLUE:INK;
    const sp=on?3.2:1.6,amp=on?1.25:1;
    [0,1,2].forEach(k2=>{const p=((t*sp-k2*.28+i*.17)%1+1)%1;const a=c.querySelector('.a'+k2);
      a.setAttribute('opacity',(1-p)*.95);a.setAttribute('transform',`translate(${p*14*amp} 0)`)})})}});
[0.55,0.95,1.35,1.75].forEach(t=>ev(t,'pin',.7));

/* ---------- hook ---------- */
caption(430,['הקיר דק.'],COVER_END,B0,{say:'הקיר דק.',fs:150,c:'#fff',fo:.1,sfx:'thud'});

/* ---------- the prompt (by 3 s), under the grid, stays to the ask ---------- */
const promptHTML=`<div style="position:absolute;left:90px;top:0;width:900px;height:136px;border-radius:68px;background:#fff;border:5px solid ${INK};box-sizing:border-box;display:flex;align-items:center;justify-content:center;direction:rtl">
  <div class="w" style="font:600 90px/1 F;color:${INK}">בחרו מספר <span style="color:${BLUE}">בתגובות</span></div></div>`;
const pr=$(`left:0;top:1334px;width:1080px;height:136px;z-index:9`,promptHTML);
at(pr,P0,E0,{say:'בחרו מספר בתגובות',dy:40,s0:.85,fo:.15,sfx:'pop2',
  up:(l,t)=>{const k=t>=ASK?Math.sin(clamp((t-ASK-.2)/.4)*Math.PI)*.06:0;pr.style.transform=`scale(${1+k})`}});
window.PROMPT={t:1.6,text:'בחרו מספר בתגובות'};

/* ---------- one beat per wall (white) ---------- */
WALLS.forEach((w,i)=>{const t0=B0+i*BL;
  caption(400,[w.l1,w.l2],t0+.05,t0+BL,{say:w.say,fs:118,cols:[INK,BLUE],fo:.08,sfx:i?'pop2':'whoosh',v:.8})});

/* ---------- the ask (black) ---------- */
caption(400,['אז איזה קיר','אתם לוקחים?'],ASK+.05,E0,{say:'אז איזה קיר?',fs:118,cols:['#fff',NAMEC],fo:.1,sfx:'whoosh2'});
ev(ASK+.2,'pop',.7);

/* ---------- brand ending ---------- */
wordmark(E0,DUR);

function render(t){runItems(t);turtle(null)}
window.BEATS={payoff:B0,outro:ASK};
window.AUDIO={dur:DUR,seed:1030,sections:[[0,B0,'CG',.13,0,1],[B0,ASK,'FC',.15,1,0],[ASK,DUR,'POP',.15,1,1]],ticks:[0.4,1.6]};
window.STRETCH=1.0;
window.VOICE={duck:0.7};   // narration = the say marks above
window.render=render;window.EVENTS=EVENTS;window.SCENES=SCENES;window.DUR=DUR;render(0);
