// Reel H39 (1039) — Pick one · style B (kinetic type + drawn objects) · voiced. C16 (follow-up of H30): "what do the neighbours hear from you?".
// Slot "2026-11-26 20" (Thursday 20:00 → Pick one).
// Cover (black): "מה השכנים / שומעים מכם?" + your flat as four numbered white tiles (1 speaker / 2 phone at night /
// 3 washing machine / 4 nothing, footsteps), the floor slab under them and blue sound waves going down to the flat below.
// Hook "עכשיו, / הצד שלכם." while notes float, the phone buzzes, the drum spins and the waves drop through the floor ->
// prompt pill "כתבו מספר. בכנות." at 2.8 s -> one beat per tile (it lifts and turns blue, the others dim, only its waves) -> wordmark.
const DUR=14.0;
const COVER_END=0.4,P0=2.8,B0=5.5,E0=13.4;
const BT=[B0,7.0,9.0,11.0,E0];          // beat starts (4 beats) and end
const SCENES=[['a',0,B0],['b',B0,DUR]];
Tt.style.zIndex=50;

/* ---------- small static wordmark (white on black), frame 0 until the brand ending ---------- */
const wm=$(`left:0;top:280px;width:1080px;display:flex;justify-content:center;z-index:70`,WORDMARK);
wm.querySelector('svg').style.cssText='width:200px;height:auto;display:block';wm.querySelectorAll('path').forEach(p=>p.setAttribute('fill','#fff'));
at(wm,0,E0,{anim:'none',fo:0});

/* ---------- your flat: four numbered tiles (400 x 190), RTL: 1 top-right, 2 top-left, 3 bottom-right, 4 bottom-left ---------- */
const TW=400,TH=190,COLX=[570,110],ROWY=[700,920];
const POS=[[0,0],[1,0],[0,1],[1,1]].map(([c,r])=>({x:COLX[c],y:ROWY[r],cx:COLX[c]+TW/2}));
const OPTS=[
  {n:'1',label:['מוזיקה'],l1:'מוזיקה.',sub:'הבס עובר הכי טוב.',say:'מוזיקה.'},
  {n:'2',label:['שיחות','בלילה'],l1:'שיחות בלילה.',sub:'על רמקול.',say:'שיחות בלילה.'},
  {n:'3',label:['כביסה','בחצות'],l1:'כביסה בחצות.',sub:'בסחיטה, כל הבניין יודע.',say:'כביסה בחצות.'},
  {n:'4',label:['כלום'],l1:'כלום.',sub:'רק הצעדים.',say:'כלום, רק צעדים'}];
const ICON=[
  ()=>`<rect x="30" y="12" width="76" height="108" rx="12" fill="#fff" stroke="${INK}" stroke-width="7"/>
     <circle cx="68" cy="42" r="12" fill="none" stroke="${INK}" stroke-width="6"/><circle cx="68" cy="86" r="22" fill="none" stroke="${INK}" stroke-width="7"/>
     <circle class="cone" cx="68" cy="86" r="8" fill="${BLUE}"/>
     ${[0,1].map(k=>`<g class="nt${k}"><ellipse cx="0" cy="14" rx="9" ry="7" fill="${BLUE}" transform="rotate(-20 0 14)"/><path d="M8 12 V-14 Q16 -9 19 1" fill="none" stroke="${BLUE}" stroke-width="5" stroke-linecap="round"/></g>`).join('')}`,
  ()=>`<g class="ph"><rect x="40" y="12" width="56" height="106" rx="12" fill="#fff" stroke="${INK}" stroke-width="7"/>
     <rect x="50" y="28" width="36" height="62" rx="4" fill="${SOFT}"/><circle cx="68" cy="104" r="5" fill="${INK}"/></g>
     ${[0,1].map(k=>`<path class="pa${k}" d="M${24-k*14} ${44-k*10} Q${12-k*14} 65 ${24-k*14} ${86+k*10}" fill="none" stroke="${BLUE}" stroke-width="6" stroke-linecap="round"/>`).join('')}
     <path d="M118 16 A16 16 0 1 0 128 42 A12 12 0 1 1 118 16Z" fill="${INK}"/>`,
  ()=>`<rect x="14" y="10" width="108" height="112" rx="12" fill="#fff" stroke="${INK}" stroke-width="7"/>
     <path d="M14 34 H122" stroke="${INK}" stroke-width="6"/><circle cx="36" cy="22" r="5" fill="${INK}"/><circle cx="54" cy="22" r="5" fill="${BLUE}"/>
     <circle cx="68" cy="78" r="32" fill="${SOFT}" stroke="${INK}" stroke-width="7"/>
     <g class="dr" style="transform-origin:68px 78px"><path d="M50 72 Q60 60 72 70 Q84 80 86 90" fill="none" stroke="${BLUE}" stroke-width="7" stroke-linecap="round"/><circle cx="58" cy="90" r="6" fill="${INK}"/></g>`,
  ()=>`${[[34,70,-12],[74,40,12]].map(([x,y,r],k)=>`<g class="fp${k}" transform="rotate(${r} ${x} ${y})"><ellipse cx="${x}" cy="${y}" rx="15" ry="24" fill="${INK}"/><ellipse cx="${x}" cy="${y+36}" rx="11" ry="12" fill="${INK}"/></g>`).join('')}`];
function tileHTML(o,i){const p=POS[i];
  return `<div class="tl t${i}" style="position:absolute;left:${p.x}px;top:${p.y}px;width:${TW}px;height:${TH}px;transform-origin:50% 50%;direction:rtl">
   <div class="fr" style="position:absolute;inset:0;border-radius:30px;background:#fff;border:6px solid #fff;box-sizing:border-box"></div>
   <svg style="position:absolute;right:42px;top:28px;overflow:visible" width="136" height="136" viewBox="0 0 136 136">${ICON[i]()}</svg>
   <div class="w" style="position:absolute;right:196px;left:16px;top:0;height:${TH}px;display:flex;flex-direction:column;justify-content:center;text-align:right;font:700 ${o.label.length>1?54:60}px/1.08 R;color:${INK}">${o.label.map(x=>`<div>${x}</div>`).join('')}</div>
   <div style="position:absolute;right:-16px;top:-20px;width:72px;height:72px;border-radius:50%;background:${BLUE};color:#fff;text-align:center;font:700 48px/72px R;border:5px solid ${INK}">${o.n}</div></div>`}
// floor slab (bricks) and the flat below with a hanging lamp; waves drop from the active tile's column
const SLAB=1138,SH=48;
const slabHTML=()=>`<svg style="position:absolute;left:0;top:0;overflow:visible" width="1080" height="1920">
  <rect x="90" y="${SLAB}" width="900" height="${SH}" fill="#fff"/>
  <clipPath id="slabc"><rect x="90" y="${SLAB}" width="900" height="${SH}"/></clipPath>
  <g clip-path="url(#slabc)">${[0,1].map(r=>Array.from({length:13},(_,k)=>`<rect x="${90+k*80-(r?40:0)}" y="${SLAB+r*24}" width="80" height="24" fill="none" stroke="${INK}" stroke-width="4"/>`).join('')).join('')}</g>
  ${[0,1,2,3].map(i=>[0,1,2].map(k=>`<path class="wv wv${i}_${k}" d="" fill="none" stroke="${BLUE}" stroke-width="9" stroke-linecap="round"/>`).join('')).join('')}
  <g class="lamp"><path d="M540 ${SLAB+SH} V${SLAB+SH+64}" stroke="#fff" stroke-width="5"/>
   <path d="M500 ${SLAB+SH+110} L520 ${SLAB+SH+64} H560 L580 ${SLAB+SH+110}Z" fill="#fff"/><circle cx="540" cy="${SLAB+SH+116}" r="9" fill="${PALE}"/></g>
  </svg>`;
const sceneHTML=()=>slabHTML()+OPTS.map(tileHTML).join('');
const GAIN=[1,1,1,.45];   // "nothing" still leaks a little: footsteps
function animate(root,t,act){
  let swing=0;
  OPTS.forEach((o,i)=>{const c=root.querySelector('.t'+i);const on=act===i;const k=on?outBack(seg(t,BT[i],.35)):0;
    c.style.transform=`scale(${1+.08*k})`;c.style.opacity=act<0||on?1:.28;
    c.querySelector('.fr').style.borderColor=on?BLUE:'#fff';c.querySelector('.fr').style.borderWidth=on?'12px':'6px';
    const g=(act<0?1:(on?1.6:0))*GAIN[i];const sp=on?1.6:1;
    if(i===0){[0,1].forEach(k2=>{const p=((t*.7*sp+k2/2)%1+1)%1;const n=c.querySelector('.nt'+k2);
        n.setAttribute('transform',`translate(${4+k2*104+Math.sin(p*6+k2)*6} ${54-p*70})`);n.setAttribute('opacity',p<.8?1:(1-p)/.2)});
      c.querySelector('.cone').setAttribute('r',8+3*Math.abs(Math.sin(t*12*sp)))}
    if(i===1){c.querySelector('.ph').setAttribute('transform',`translate(${Math.sin(t*40)*(Math.sin(t*3)>0?3:0)} 0)`);
      [0,1].forEach(k2=>c.querySelector('.pa'+k2).setAttribute('opacity',Math.sin(t*6*sp-k2)>0?1:.2))}
    if(i===2){c.querySelector('.dr').style.transform=`rotate(${t*(on?620:360)}deg)`}
    if(i===3){[0,1].forEach(k2=>c.querySelector('.fp'+k2).setAttribute('opacity',Math.sin(t*4*sp+k2*Math.PI)>0?1:.25))}
    // waves: three arcs dropping from the slab under this tile's column
    const cx=POS[i].cx+(i>1?0:0);
    [0,1,2].forEach(k2=>{const w=root.querySelector(`.wv${i}_${k2}`);
      if(g<=0){w.setAttribute('d','');return}
      const p=((t*(.9+i*.13)+k2/3+i*.21)%1+1)%1;const r=(30+p*120)*Math.min(1.2,.7+g*.3);const y=SLAB+SH+14+p*60;
      w.setAttribute('d',`M${cx-r} ${y} Q${cx} ${y+r*.55} ${cx+r} ${y}`);w.setAttribute('opacity',(1-p)*Math.min(1,g));
      w.setAttribute('stroke-width',i===3?6:9)});
    swing+=g*(i===3?.5:1)});
  root.querySelector('.lamp').setAttribute('transform',`rotate(${Math.sin(t*5)*Math.min(9,2+swing*2.2)} 540 ${SLAB+SH})`)}
const actAt=t=>{if(t<B0||t>=E0)return -1;for(let i=0;i<4;i++)if(t<BT[i+1])return i;return -1};

/* ---------- COVER (black): frame 0, fully drawn ---------- */
const cov=$(`left:0;top:0;width:1080px;height:1920px;background:${INK};z-index:60`,`
  ${hl(400,'מה השכנים','#fff',114)}${hl(530,'שומעים מכם?',BLUE,114)}${sceneHTML()}`);
animate(cov,1.15,-1);
at(cov,0,COVER_END,{anim:'none',fo:0});
window.COVER={t:0.2,title:'מה השכנים שומעים מכם?'};

/* ---------- background ---------- */
bg(INK,0,DUR);

/* ---------- the live scene (moving from the first frame after the cover) ---------- */
const scene=$(`left:0;top:0;width:1080px;height:1920px`,sceneHTML());
at(scene,COVER_END,E0,{anim:'none',fo:0,up:(l,t)=>animate(scene,t+.75,actAt(t))});
[0.55,1.0,1.45].forEach(t=>ev(t,'pin',.6));
OPTS.forEach((o,i)=>ev(BT[i]+.25,i===2?'boing':'pop',.5));

/* ---------- hook ---------- */
caption(400,['עכשיו,','הצד שלכם.'],COVER_END,B0,{say:'עכשיו, הצד שלכם',fs:118,cols:['#fff',BLUE],fo:.1,sfx:'thud'});

/* ---------- the prompt (by 3 s), under the scene, stays to the brand ending ---------- */
const promptHTML=`<div style="position:absolute;left:110px;top:0;width:860px;height:136px;border-radius:68px;background:#fff;box-sizing:border-box;display:flex;align-items:center;justify-content:center;direction:rtl">
  <div class="w" style="display:flex;direction:rtl;gap:24px;font:600 90px/1 F;color:${INK}"><div>כתבו מספר.</div><div style="color:${BLUE}">בכנות.</div></div></div>`;
const pr=$(`left:0;top:1350px;width:1080px;height:136px;z-index:9`,promptHTML);
at(pr,P0,E0,{say:'תכתבו מספר, בכנות',dy:40,s0:.85,fo:.15,sfx:'pop2',
  up:(l,t)=>{const k=t>=BT[3]?Math.sin(clamp((t-BT[3]-1.2)/.4)*Math.PI)*.06:0;pr.style.transform=`scale(${1+k})`}});
window.PROMPT={t:2.8,text:'כתבו מספר. בכנות.'};

/* ---------- one beat per tile ---------- */
OPTS.forEach((o,i)=>{const a=BT[i],b=BT[i+1];
  caption(410,[o.l1],a+.05,b,{say:o.say,fs:112,c:i===3?BLUE:'#fff',fo:.08,sfx:i?'pop2':'whoosh',v:.8});
  at($(`left:0;top:560px;width:1080px;text-align:center;font:500 60px/1.1 R;color:${NAMEC}`,`<div class="w">${o.sub}</div>`),a+.35,b,{dy:20,fo:.08})});

/* ---------- brand ending ---------- */
wordmark(E0,DUR);

function render(t){runItems(t);turtle(null)}
window.BEATS={payoff:B0,outro:BT[3]};
window.AUDIO={dur:DUR,seed:1039,sections:[[0,B0,'DET',.13,1,0],[B0,BT[3],'CG',.15,0,1],[BT[3],DUR,'MIN',.15,1,1]],ticks:[0.4,2.8]};
window.STRETCH=1.0;
window.VOICE={duck:0.7};   // narration = the say marks above
window.render=render;window.EVENTS=EVENTS;window.SCENES=SCENES;window.DUR=DUR;render(0);
