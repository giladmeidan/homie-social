// Reel H40 (1040) — Roommate moment · style A (illustrated) · unvoiced, loops. Idea L5 cut to one moment:
// the kitchen whiteboard "לפי שימוש". You start tallying a roommate's AC "just to be fair"; by day 5 they count your
// showers, by day 12 even opening the fridge is on the board, and at the end of the month the most lines are yours.
// Cover (white): "סופרים לכם / את המקלחות?" + the full board with your column ringed blue.
// Hook "״רק שיהיה הוגן.״" (the blue marker draws the first lines under נ׳) -> prompt pill "שלחו למי שסופרים." at 1.4 s
// -> "יום 5: גם המקלחת." -> "יום 12: גם המקרר." -> "הכי הרבה קווים? / …אתם." (your column lights, you sweat)
// -> a sponge wipes the board, "חודש הבא: / שווה בשווה." and one new line under נ׳ (the loop) -> wordmark.
const DUR=10.4;
const COVER_END=0.4,P0=1.4,P1=4.6,B2=2.6,B3=4.6,B4=6.6,B5=8.6,ER0=8.7,ER1=9.15,E0=9.6;
const SCENES=[['a',0,B4],['b',B4,DUR]];
Tt.style.zIndex=50;
const GREY='#8C8C8C',LINEC='#D6DEEA';

/* ---------- small static wordmark, frame 0 until the brand ending ---------- */
const smallWM=$(`left:0;top:280px;width:1080px;display:flex;justify-content:center;z-index:70`,WORDMARK);
smallWM.querySelector('svg').style.cssText='width:200px;height:auto;display:block';
smallWM.querySelectorAll('path').forEach(p=>p.setAttribute('fill',INK));
at(smallWM,0,E0,{anim:'none',fo:0});

/* ---------- the board (860 x 570 svg) ---------- */
const ROWS=['מזגן','מקלחת','תנור','קומקום','פתיחת מקרר'];
const ROWY=[208,282,356,430,504];
const COLX=[500,330,160];            // אתם · נ׳ · ד׳ (RTL: אתם next to the labels)
const COLN=['אתם','נ׳','ד׳'];
const FINAL=[[3,9,2],[11,4,5],[6,1,3],[12,3,4],[10,5,6]];   // demo tallies; your column wins
const ROWT=[0.4,2.7,4.7,4.9,5.1];    // when each row is written on the board

// draw events [time,row,col]: who adds a line where (deterministic)
const DRAW=[];
const addN=(r,c,n,a,b)=>{for(let i=0;i<n;i++)DRAW.push([a+(b-a)*(n===1?0:i/(n-1)),r,c])};
addN(0,1,6,0.55,2.35);                              // you count נ׳'s AC
addN(1,0,7,2.8,4.35);addN(1,1,2,3.1,4.0);addN(0,1,2,3.4,4.2);addN(1,2,2,3.6,4.45);   // day 5: they count your showers
addN(2,0,6,4.8,6.3);addN(2,1,1,5.0,5.0);addN(2,2,3,5.2,6.1);
addN(3,0,12,4.95,6.45);addN(3,1,3,5.3,6.2);addN(3,2,4,5.1,6.3);
addN(4,0,10,5.2,6.5);addN(4,1,5,5.4,6.4);addN(4,2,6,5.3,6.5);
addN(0,0,3,5.6,6.2);addN(0,1,1,5.9,5.9);addN(0,2,2,5.7,6.35);
DRAW.sort((x,y)=>x[0]-y[0]);
const LOOP_T=9.3;                                    // after the wipe: one new line under נ׳

function tallySVG(n,cx,cy,col,hot){if(n<=0)return '';const full=Math.floor(n/5),rem=n%5;
  const w=full*62+(rem?rem*12-12:0)-(full&&!rem?14:0);let x0=cx-Math.max(w,0)/2,s='';
  for(let i=0;i<n;i++){const g=Math.floor(i/5),j=i%5,gx=x0+g*62;const c=(hot&&i===n-1)?BLUE:col;
    s+= j<4?`<line x1="${gx+j*12}" y1="${cy-22}" x2="${gx+j*12}" y2="${cy+22}" stroke="${c}" stroke-width="6" stroke-linecap="round"/>`
           :`<line x1="${gx-8}" y1="${cy+16}" x2="${gx+44}" y2="${cy-16}" stroke="${c}" stroke-width="6" stroke-linecap="round"/>`}
  return s}

function boardSVG(o){const t=o.t,cover=!!o.cover;
  // counts at time t
  const cnt=ROWS.map(()=>[0,0,0]);let last=null,lastT=-9;
  if(cover){FINAL.forEach((r,i)=>r.forEach((v,j)=>cnt[i][j]=v))}
  else{for(const [et,r,c] of DRAW){if(et<=t){cnt[r][c]++;last=[r,c];lastT=et}}}
  const sweep=cover?2000:((t<ER0||t>=ER1)?2000:860-860*clamp((t-ER0)/(ER1-ER0)));     // eraser x (board coords)
  const wiped=!cover&&t>=ER1;
  if(wiped){for(let i=0;i<ROWS.length;i++)cnt[i]=[0,0,0];if(t>=LOOP_T){cnt[0][1]=1;last=[0,1];lastT=LOOP_T}}
  const ring=cover||(t>=B4+.6&&t<ER0);
  let s=`<svg viewBox="0 0 860 600" width="860" height="600" style="overflow:visible;display:block">
   <rect x="10" y="10" width="840" height="560" rx="28" fill="#fff" stroke="${INK}" stroke-width="9"/>
   <rect x="380" y="560" width="100" height="22" rx="8" fill="${INK}"/>
   <text x="430" y="76" text-anchor="middle" font-family="F" font-weight="600" font-size="54" fill="${INK}">לפי שימוש</text>
   <line x1="40" y1="100" x2="820" y2="100" stroke="${INK}" stroke-width="5"/>`;
  if(ring)s+=`<rect x="${COLX[0]-82}" y="112" width="164" height="436" rx="26" fill="${SOFT}" stroke="${BLUE}" stroke-width="7"/>`;
  COLN.forEach((nm,j)=>{s+=`<text x="${COLX[j]}" y="150" text-anchor="middle" font-family="F" font-weight="600" font-size="46" fill="${j===0?BLUE:INK}">${nm}</text>`});
  s+=`<line x1="40" y1="170" x2="820" y2="170" stroke="${LINEC}" stroke-width="4"/>`;
  [415,245].forEach(x=>{s+=`<line x1="${x}" y1="112" x2="${x}" y2="548" stroke="${LINEC}" stroke-width="4"/>`});
  s+=`<line x1="590" y1="112" x2="590" y2="548" stroke="${LINEC}" stroke-width="4"/>`;
  ROWS.forEach((nm,i)=>{const vis=cover||(t>=ROWT[i]&&(i===0||!wiped)&&(i===0||sweep>700||t<ER0));if(!vis)return;
    const k=cover?1:clamp((t-ROWT[i])/.25);
    s+=`<text x="${818}" y="${ROWY[i]+14}" text-anchor="start" font-family="R" font-weight="700" font-size="40" fill="${INK}" opacity="${k}">${nm}</text>`;
    COLX.forEach((cx,j)=>{if(cx+70>sweep)return;s+=tallySVG(cnt[i][j],cx,ROWY[i],INK,!cover&&last&&last[0]===i&&last[1]===j&&t-lastT<.35)})});
  // the marker (rests on the tray in the cover, follows the last line while drawing)
  if(!cover&&sweep>=2000&&last){const [r,c]=last;const n=cnt[r][c];const g=Math.floor((n-1)/5),j=(n-1)%5;
    const bob=Math.sin(t*30)*4*(t-lastT<.3?1:0);const mx=COLX[c]-30+g*62+j*12+10,my=ROWY[r]+30+bob;
    s+=`<g transform="translate(${mx} ${my}) rotate(208)"><rect x="-14" y="-118" width="28" height="104" rx="9" fill="${BLUE}" stroke="${INK}" stroke-width="5"/><path d="M-10 -14 L0 6 L10 -14Z" fill="${INK}"/><rect x="-14" y="-140" width="28" height="26" rx="6" fill="${INK}"/></g>`}
  else if(!cover&&sweep>=2000){s+=`<g transform="translate(330 238) rotate(208)"><rect x="-14" y="-118" width="28" height="104" rx="9" fill="${BLUE}" stroke="${INK}" stroke-width="5"/><path d="M-10 -14 L0 6 L10 -14Z" fill="${INK}"/><rect x="-14" y="-140" width="28" height="26" rx="6" fill="${INK}"/></g>`}
  else if(cover){s+=`<g transform="translate(520 571) rotate(90)"><rect x="-14" y="-118" width="28" height="104" rx="9" fill="${BLUE}" stroke="${INK}" stroke-width="5"/><path d="M-10 -14 L0 6 L10 -14Z" fill="${INK}"/><rect x="-14" y="-140" width="28" height="26" rx="6" fill="${INK}"/></g>`}
  // the sponge
  if(!cover&&t>=ER0&&t<ER1){const sx=Math.max(sweep,40),sy=330+Math.sin(t*26)*150;
    s+=`<g transform="translate(${sx} ${sy})"><rect x="-70" y="-48" width="140" height="96" rx="20" fill="${INK}"/><rect x="-70" y="16" width="140" height="32" rx="12" fill="${PALE}"/></g>`}
  return s+`</svg>`}

/* ---------- COVER (white): frame 0, fully drawn ---------- */
const cov=$(`left:0;top:0;width:1080px;height:1920px;background:#fff;z-index:60`,`
  ${hl(400,'סופרים לכם',INK,118)}${hl(530,'את המקלחות?',BLUE,118)}
  <div style="position:absolute;left:110px;top:740px">${boardSVG({t:0,cover:1})}</div>`);
at(cov,0,COVER_END,{anim:'none',fo:0});
window.COVER={t:0.2,title:'סופרים לכם את המקלחות?'};

bg('#fff',0,DUR);

/* ---------- the live board ---------- */
const board=$(`left:110px;top:790px;width:860px;height:600px`);let lastB='';
at(board,COVER_END,E0,{anim:'none',fo:0,up:(l,t)=>{const s=boardSVG({t:Math.round(t*30)/30});if(s!==lastB){board.innerHTML=s;lastB=s}
  const sh=t>=B4+.6&&t<B4+.9?Math.sin(t*60)*5:0;board.style.transform=`translateX(${sh}px)`}});
// a tick for every line drawn in the first beat, fewer once everyone is counting
DRAW.forEach(([et],i)=>{if(et<B3?true:i%3===0)ev(et,'pin',et<B3?1.1:.7)});
ev(ER0,'whoosh');ev(LOOP_T,'pin',1.2);

/* ---------- you, under the board ---------- */
character(`left:410px;top:1395px;z-index:2;`,260,COVER_END,E0,(l,t)=>{
  if(t<B2)return {hair:'side',shirt:BLUE,brow:'flat',eyes:'narrow',mouth:'smirk',look:-1,lookY:-1};
  if(t<B4+.6)return {hair:'side',shirt:BLUE,brow:'sus',eyes:'open',mouth:'flat',look:-1,lookY:-1};
  if(t<ER0)return {hair:'side',shirt:BLUE,brow:'up',eyes:'wide',mouth:'o',sweat:true,look:0,lookY:-1};
  return {hair:'side',shirt:BLUE,brow:'flat',eyes:'closed',mouth:'smile',look:0,lookY:-1}},{fo:0,anim:'none'});

/* ---------- hook + beats ---------- */
caption(400,['״רק שיהיה הוגן.״'],COVER_END,B2,{fs:108,c:INK,fo:.08,sfx:'thud'});
caption(400,[`יום 5: <span style="color:${BLUE}">גם המקלחת.</span>`],B2,B3,{fs:108,c:INK,fo:.08,sfx:'pop2'});
caption(400,[`יום 12: <span style="color:${BLUE}">גם המקרר.</span>`],B3,B4,{fs:108,c:INK,fo:.08,sfx:'pop2'});
caption(400,['הכי הרבה קווים?'],B4,B5,{fs:108,c:INK,fo:.08,sfx:'swish'});
caption(525,['…אתם.'],B4+.6,B5,{fs:128,c:BLUE,fo:.08,sfx:'boing',anim:'stamp'});
caption(400,['חודש הבא:'],B5,E0,{fs:108,c:INK,fo:.06,sfx:'swish'});
caption(525,['שווה בשווה.'],B5+.25,E0,{fs:112,c:BLUE,fo:.06,sfx:'pop'});

/* ---------- the prompt (by 3 s) ---------- */
const promptHTML=`<div style="position:absolute;left:120px;top:0;width:840px;height:136px;border-radius:68px;background:#fff;border:5px solid ${INK};box-sizing:border-box;display:flex;align-items:center;justify-content:center;direction:rtl">
  <div class="w" style="font:600 92px/1 F;color:${INK}">שלחו <span style="color:${BLUE}">למי שסופרים.</span></div></div>`;
const pr=$(`left:0;top:540px;width:1080px;height:136px;z-index:9`,promptHTML);
at(pr,P0,P1,{dy:40,s0:.85,fo:.15,sfx:'pop2'});
window.PROMPT={t:1.4,text:'שלחו למי שסופרים.'};

at($(`left:0;top:1800px;width:1080px;text-align:center;font:500 38px/1.2 R;color:${GREY};white-space:nowrap`,'<span class="w">הדמויות והמצבים בדיוניים</span>'),COVER_END,E0,{anim:'none',fo:0});

/* ---------- brand ending ---------- */
wordmark(E0,DUR);

function render(t){runItems(t);turtle(null)}
window.BEATS={payoff:B4,outro:B5};
window.AUDIO={dur:DUR,seed:1040,sections:[[0,B4,'POP',.13,1,0],[B4,DUR,'FC',.15,0,1]],ticks:[0.4,1.4]};
window.STRETCH=1.0;
window.render=render;window.EVENTS=EVENTS;window.SCENES=SCENES;window.DUR=DUR;render(0);
