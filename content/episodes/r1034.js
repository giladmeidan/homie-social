// Reel H34 (1034) — Roommate moment · style B (kinetic type + one drawn object) · unvoiced, loops. Idea L4 cut to one moment:
// Friday evening in a shared flat, nobody coordinated, and everyone brought a challah.
// Cover (white): "ערב שישי. / כולם הביאו / חלה." + the table with four challahs and two candles.
// Hook "״אני אביא / משהו קטן.״" (challah 1 drops onto the table, candles flicker) -> prompt pill "שלחו לשותפים / לפני שישי." at 1.4 s
// -> "19:02. עוד חלה." -> "19:05. עוד חלה." -> "19:09. …חלה." -> "יש חומוס? …לא." -> "שישי הבא:" the challahs turn into
// four bowls of hummus (the loop) + the prompt again -> wordmark.
const DUR=10.4;
const COVER_END=0.4,P0=1.4,P1=3.6,B2=2.3,B3=3.9,B4=5.5,B5=7.1,B6=8.6,E0=9.6;
const DROPS=[0.55,B2+.15,B3+.15,B4+.15];
const SCENES=[['a',0,B5],['b',B5,DUR]];
Tt.style.zIndex=50;
const GREY='#8C8C8C';

/* ---------- small static wordmark, frame 0 until the brand ending ---------- */
const smallWM=$(`left:0;top:280px;width:1080px;display:flex;justify-content:center;z-index:70`,WORDMARK);
smallWM.querySelector('svg').style.cssText='width:200px;height:auto;display:block';
smallWM.querySelectorAll('path').forEach(p=>p.setAttribute('fill',INK));
at(smallWM,0,E0,{anim:'none',fo:0});

/* ---------- the table (900 x 440): two candles, four slots ---------- */
const SLOTS=[[450,0],[255,0],[645,0],[450,-78]];   // the pile: centre, right, left, on top
function challahSVG(x,y,s=1,hi=0){   // a braided loaf, line style
  const c=hi?SOFT:'#fff';
  const bumps=[-54,-18,18,54].map((dx,i)=>`<ellipse cx="${dx}" cy="${i%2?-4:0}" rx="${i===0||i===3?34:40}" ry="${i===0||i===3?30:38}" fill="${c}" stroke="${INK}" stroke-width="7"/>`).join('');
  const lines=[-36,0,36].map(dx=>`<path d="M${dx-8} -26 Q${dx+10} 0 ${dx-8} 26" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`).join('');
  const seeds=[[-50,-14],[-22,-24],[10,-20],[40,-12],[-34,8],[26,6]].map(([a,b])=>`<ellipse cx="${a}" cy="${b}" rx="4" ry="2.5" fill="${BLUE}"/>`).join('');
  return `<g transform="translate(${x} ${y}) scale(${s})">${bumps}${lines}${seeds}</g>`}
function bowlSVG(x,y,s=1){
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <path d="M-64 -6 Q-60 44 0 44 Q60 44 64 -6 Z" fill="#fff" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>
    <ellipse cx="0" cy="-8" rx="66" ry="16" fill="${SOFT}" stroke="${INK}" stroke-width="7"/>
    <path d="M-30 -10 Q0 -22 30 -10" fill="none" stroke="${BLUE}" stroke-width="6" stroke-linecap="round"/>
    <circle cx="0" cy="-12" r="6" fill="${BLUE}"/></g>`}
function tableSVG(o={}){const t=o.t||0;
  const flame=(cx,k)=>{const f=1+.12*Math.sin(t*13+k)+.06*Math.sin(t*29+k*2);
    return `<path d="M${cx} ${150-34*f} Q${cx+15} ${150-8} ${cx} ${150} Q${cx-15} ${150-8} ${cx} ${150-34*f} Z" fill="${BLUE}"/>`};
  const loaves=(o.loaves||[]).slice().sort((a,b)=>(a[0]===3)-(b[0]===3)).map(([i,dy,s,hi])=>challahSVG(SLOTS[i][0],250+SLOTS[i][1]+dy,s*1.12,hi)).join('');
  const BX=[195,365,535,705];const BY=[0,0,0,0];const bowls=(o.bowls||[]).map(([i,dy,s])=>bowlSVG(BX[i],258+BY[i]+dy,s*1.15)).join('');
  return `<svg viewBox="0 0 900 440" width="900" height="440" style="overflow:visible;display:block">
   ${flame(60,0)}${flame(840,1.7)}
   <rect x="48" y="156" width="24" height="120" rx="6" fill="#fff" stroke="${INK}" stroke-width="7"/>
   <rect x="828" y="156" width="24" height="120" rx="6" fill="#fff" stroke="${INK}" stroke-width="7"/>
   <path d="M36 290 H84 M816 290 H864" stroke="${INK}" stroke-width="9" stroke-linecap="round"/>
   ${loaves}${bowls}
   <rect x="10" y="296" width="880" height="26" rx="13" fill="#fff" stroke="${INK}" stroke-width="9"/>
   <path d="M90 322 V430 M810 322 V430" stroke="${INK}" stroke-width="10" stroke-linecap="round"/></svg>`}

/* ---------- COVER (white): frame 0, fully drawn ---------- */
const cov=$(`left:0;top:0;width:1080px;height:1920px;background:#fff;z-index:60`,`
  ${hl(410,'ערב שישי.',INK,112)}${hl(530,'כולם הביאו',INK,112)}${hl(652,'חלה.',BLUE,132)}
  <div style="position:absolute;left:90px;top:950px">${tableSVG({t:.3,loaves:[[0,0,1,0],[1,0,1,0],[2,0,1,0],[3,0,1,1]]})}</div>`);
at(cov,0,COVER_END,{anim:'none',fo:0});
window.COVER={t:0.2,title:'ערב שישי. כולם הביאו חלה.'};

bg('#fff',0,DUR);

/* ---------- the live table ---------- */
const table=$(`left:90px;top:950px;width:900px;height:440px`);let lastT='';
const tableUp=(l,t)=>{const loaves=[],bowls=[];
  if(t<B6){DROPS.forEach((d,i)=>{if(t<d)return;const k=seg(t,d,.42);const dy=(1-outBack(k))*-520;
      const wob=t>=B5?Math.sin(t*9+i*1.3)*4:0;loaves.push([i,dy+wob,1,i===DROPS.filter(x=>t>=x).length-1?1:0])})}
  else{const k=seg(t,B6,.35);if(k<1)DROPS.forEach((d,i)=>loaves.push([i,0,1-k,0]));
      DROPS.forEach((d,i)=>{const q=seg(t,B6+.12+i*.08,.3);if(q>0)bowls.push([i,0,outBack(q)])})}
  const s=tableSVG({t,loaves,bowls});if(s!==lastT){table.innerHTML=s;lastT=s}};
at(table,COVER_END,E0,{anim:'none',fo:0,up:tableUp});
DROPS.forEach((d,i)=>ev(d+.3,i===3?'boing':'thud',.8));
ev(B6+.15,'pop2');

/* ---------- hook + beats ---------- */
caption(410,['<span dir="rtl">״אני אביא</span>','<span dir="rtl">משהו קטן.״</span>'],COVER_END,B2,{fs:112,c:INK,fo:.08,sfx:'swish'});
caption(410,['19:02'],B2,B3,{fs:112,c:INK,fo:.08});
caption(540,['עוד חלה.'],B2+.3,B3,{fs:124,c:BLUE,fo:.08,anim:'stamp'});
caption(410,['19:05'],B3,B4,{fs:112,c:INK,fo:.08});
caption(540,['עוד חלה.'],B3+.3,B4,{fs:124,c:BLUE,fo:.08,anim:'stamp'});
caption(410,['19:09'],B4,B5,{fs:112,c:INK,fo:.08});
caption(540,['…חלה.'],B4+.3,B5,{fs:132,c:BLUE,fo:.08,anim:'stamp'});
caption(410,['יש חומוס?'],B5,B6,{fs:118,c:INK,fo:.08,sfx:'pop'});
caption(540,['…לא.'],B5+.6,B6,{fs:132,c:BLUE,fo:.08,sfx:'thud',anim:'stamp'});
caption(410,['שישי הבא:'],B6,E0,{fs:112,c:INK,fo:.08});

/* ---------- the prompt (by 3 s), between the lines and the table ---------- */
const promptHTML=`<div style="position:absolute;left:90px;top:0;width:900px;height:232px;border-radius:60px;background:#fff;border:5px solid ${INK};box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:center;direction:rtl">
  <div class="w" style="font:600 90px/1.08 F;color:${INK}">שלחו לשותפים</div><div class="w" style="font:600 90px/1.08 F;color:${BLUE}">לפני שישי.</div></div>`;
const pr=$(`left:0;top:690px;width:1080px;height:232px;z-index:9`,promptHTML);
at(pr,P0,P1,{dy:40,s0:.85,fo:.15,sfx:'pop2'});
window.PROMPT={t:1.4,text:'שלחו לשותפים לפני שישי.'};
const pr2=$(`left:0;top:690px;width:1080px;height:232px;z-index:9`,promptHTML);
at(pr2,B6+.4,E0,{dy:30,s0:.9,fo:0,sfx:'pop'});
at($(`left:0;top:1800px;width:1080px;text-align:center;font:500 38px/1.2 R;color:${GREY};white-space:nowrap`,'<span class="w">הדמויות והמצבים בדיוניים</span>'),COVER_END,E0,{anim:'none',fo:0});

/* ---------- brand ending ---------- */
wordmark(E0,DUR);

function render(t){runItems(t);turtle(null)}
window.BEATS={payoff:B5,outro:B6};
window.AUDIO={dur:DUR,seed:1034,sections:[[0,B5,'CG',.2,1,1],[B5,DUR,'POP',.22,1,1]],ticks:[0.4,1.4]};
window.STRETCH=1.0;
window.render=render;window.EVENTS=EVENTS;window.SCENES=SCENES;window.DUR=DUR;render(0);
