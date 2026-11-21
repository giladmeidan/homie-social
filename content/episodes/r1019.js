// Reel H19 (1019) — the city · kinetic type: "one balcony, five jobs". A Tel Aviv balcony's CV: storage, laundry dryer,
// phone booth, garden, roommates' meeting room -> "and job number 6?" -> "to sit on it. at sunset." -> want to see it at sunset? pick a viewing slot.
const DUR=23.4;
const SCENES=[['a',0,11.6],['b',11.6,DUR]];
Tt.style.zIndex=50;

/* ---------- the balcony, line-drawn. hi = list of items drawn in blue ---------- */
// items: bike, rack, stool, plant, chair, table, sun
function balcony(stroke,hi=[],o={}){
  const H=k=>hi.includes(k)?BLUE:stroke, W=k=>hi.includes(k)?9:6;
  const sunY=o.sunY??118, showSun=o.sun!==false;
  return `<svg viewBox="0 0 860 520" width="900" height="544" fill="none" stroke-linecap="round" stroke-linejoin="round">
  ${showSun?`<circle cx="150" cy="${sunY}" r="62" fill="${hi.includes('sun')?BLUE:'none'}" stroke="${H('sun')}" stroke-width="${W('sun')}"/>`:''}
  <!-- the door to the flat -->
  <rect x="690" y="40" width="140" height="430" rx="10" stroke="${stroke}" stroke-width="5" opacity=".55"/>
  <line x1="760" y1="40" x2="760" y2="470" stroke="${stroke}" stroke-width="4" opacity=".55"/>
  <!-- bike -->
  <g stroke="${H('bike')}" stroke-width="${W('bike')}">
   <circle cx="80" cy="410" r="52"/><circle cx="240" cy="410" r="52"/>
   <path d="M80 410 L130 330 L215 330 L240 410 M130 330 L160 410 L215 330 M120 310 L145 310 M215 330 L222 300 L250 300"/></g>
  <!-- drying rack with laundry -->
  <g stroke="${H('rack')}" stroke-width="${W('rack')}">
   <path d="M300 470 L340 250 L380 470 M380 470 L420 250 L460 470 M330 300 L430 300 M322 345 L440 345"/>
   <path d="M345 300 L345 345 L372 345 L372 300 M395 345 L395 395 L428 395 L428 345"/></g>
  <!-- plant -->
  <g stroke="${H('plant')}" stroke-width="${W('plant')}">
   <path d="M500 470 L492 415 L560 415 L552 470 Z M526 415 L526 360 M526 380 Q496 360 494 330 Q522 342 526 370 M526 372 Q556 350 560 318 Q532 330 526 362"/></g>
  <!-- chair -->
  <g stroke="${H('chair')}" stroke-width="${W('chair')}">
   <path d="M590 470 L598 390 L668 390 L676 470 M598 390 L590 300 M668 390 L676 300 M590 300 L676 300 M592 345 L674 345"/></g>
  <!-- crate (second seat) -->
  <g stroke="${H('table')}" stroke-width="${W('table')}">
   <rect x="705" y="398" width="86" height="72" rx="6"/><path d="M705 398 L791 470 M791 398 L705 470"/></g>
  <!-- railing in front -->
  <g stroke="${stroke}" stroke-width="4" opacity=".45">
   <line x1="10" y1="330" x2="850" y2="330"/>${Array.from({length:15},(_,i)=>`<line x1="${30+i*57}" y1="330" x2="${30+i*57}" y2="470"/>`).join('')}</g>
  <line x1="0" y1="472" x2="860" y2="472" stroke="${stroke}" stroke-width="7"/>
  </svg>`}

/* ---------- small pill ---------- */
const PILL=(txt,dark)=>`<div class="w" style="height:84px;padding:0 40px;border-radius:42px;background:${dark?DARK2:SOFT};color:${dark?NAMEC:BL2};font:700 46px/84px R;direction:rtl">${txt}</div>`;
const pillAt=(txt,dark,a,b)=>at($(`left:0;top:330px;width:1080px;display:flex;justify-content:center`,PILL(txt,dark)),a,b,{anim:'pop',dy:20,fo:.08});
const drawAt=(dark,hi,a,b,o={})=>{const el=$(`left:90px;top:${o.top||820}px;width:900px;height:544px`,balcony(dark?'#fff':INK,hi,o));return at(el,a,b,Object.assign({anim:'none',fo:.08},o.at||{}))};

/* ---------- COVER: frame 0 is the cover, fully drawn, held until COVER_END ---------- */
const COVER_END=0.7;
const cov=$(`left:0;top:0;width:1080px;height:1920px;background:${INK};z-index:60`,`
  ${hl(400,'מרפסת אחת.','#fff',144)}${hl(560,'חמש משרות.',NAMEC,144)}
  <div style="position:absolute;left:90px;top:790px">${balcony('#fff',['chair','sun'])}</div>`);
at(cov,0,COVER_END,{anim:'none',fo:0});
window.COVER={t:0.3,title:'מרפסת אחת. חמש משרות.'};

/* ---------- hook (black): the balcony's CV ---------- */
const HE=2.8;
bg(INK,0,HE);
caption(400,['קורות החיים'],COVER_END,HE,{fs:128,c:'#fff',fo:.1,sfx:'thud'});
caption(555,['של מרפסת.'],COVER_END+.3,HE,{fs:128,c:NAMEC,fo:.1,sfx:'pop2'});
caption(730,['קטנה. עם נוף לבניין ממול.'],COVER_END+.75,HE,{fs:56,c:'#C9C9C9',fo:.1,sfx:'swish',anim:'up',dy:24});
drawAt(true,[],COVER_END,HE,{top:860,sun:false});

/* ---------- five jobs ---------- */
const JOBS=[
  ['מחסן.','אופניים, קרטונים, ומאוורר מהקיץ.',['bike']],
  ['מייבש כביסה.','בקיץ: שעה. בחורף: נראה.',['rack']],
  ['חדר שיחות.','השיחות שלא עושים בסלון.',['chair']],
  ['גינה.','עציץ אחד. עדיין בחיים.',['plant']],
  ['חדר ישיבות.','פה מחליטים מי מוריד את הזבל.',['chair','table']],
];
const JD=2.2;
JOBS.forEach(([title,line,hi],i)=>{const a=HE+i*JD,b=a+JD,dark=i%2===1;
  bg(dark?INK:'#fff',a,b);
  pillAt(`משרה ${i+1} / 5`,dark,a,b);
  caption(450,[title],a+.05,b,{fs:132,c:dark?'#fff':INK,fo:.08,sfx:'thud'});
  caption(630,[line],a+.45,b,{fs:56,c:dark?'#C9C9C9':MUTED,fo:.08,anim:'up',dy:24,sfx:'swish'});
  // dim drawing first, then the job's item lights up blue
  drawAt(dark,[],a,a+.75,{sun:false});
  drawAt(dark,hi,a+.75,b,{sun:false,at:{anim:'pop',s0:.97,dy:8,dur:.25,sfx:'ding',v:.9+i*.1}});
});

/* ---------- twist (black): job number 6 ---------- */
const TW=HE+5*JD;            // 13.8
const PY=16.6;
bg(INK,TW,PY);
caption(380,['ומשרה מספר 6?'],TW+.05,TW+.95,{fs:116,c:'#fff',fo:.06,sfx:'thud'});
caption(380,['לשבת בה.'],TW+.95,PY,{fs:150,c:NAMEC,fo:.08,sfx:'pop2'});
caption(590,['בשקיעה. בלי לעשות כלום.'],TW+1.4,PY,{fs:58,c:'#C9C9C9',fo:.08,anim:'up',dy:24,sfx:'swish'});
const sunset=$(`left:90px;top:820px;width:900px;height:544px`,'');
at(sunset,TW+.95,PY,{anim:'none',fo:.08,sfx:'ding',up:(l)=>{const y=60+outCubic(seg(l,0,1.4))*58;sunset.innerHTML=balcony('#fff',['chair','sun'],{sunY:y})}});

/* ---------- payoff (white) ---------- */
const FE=18.4;
bg('#fff',PY,DUR);
caption(470,['רוצים לראות אותה','בשקיעה?'],PY+.05,FE,{fs:118,cols:[INK,BLUE],fo:.08,sfx:'thud'});
drawAt(false,['chair','sun'],PY+.3,FE,{top:930,sunY:118,at:{anim:'up',dy:30,fo:.08}});
caption(780,['באים בשעה שמתאימה לכם.'],PY+.6,FE,{fs:60,c:MUTED,fo:.08,anim:'up',dy:24,sfx:'swish'});

/* ---------- feature + homie ---------- */
const P1=20.4;
FEAT.tours(FE,P1);
wipe(P1,null);
wordmark(P1+.9,DUR);
endCard(P1+1.0,DUR,'רואים את המרפסת בשקיעה.');

function render(t){runItems(t);
  if(t<P1+.9)turtle(null); else turtleWhite(t,P1+.95,[],P1+1.8)}
window.AUDIO={dur:DUR,seed:1019,sections:[[0,HE,'DET',.12,0,1],[HE,TW,'POP',.16,1,1],[TW,FE,'MIN',.13,1,0],[FE,DUR,'FC',.17,1,1]],ticks:[HE,TW]};
window.STRETCH=1.12;
window.render=render;window.EVENTS=EVENTS;window.SCENES=SCENES;window.DUR=DUR;render(0);
