// Reel H22 (1022) — the city · editorial (style C), voiced, Comment: "the notice board in the building's entrance".
// A lobby notice board fills with three warm neighbour notes (found key, leftover food, birthday cake) -> the camera
// zooms into each note -> comment prompt: which note hangs in your building? 1/2/3, or 4 "no board, a group".
const DUR=14.0;
const SCENES=[['a',0,7.2],['b',7.2,DUR]];
Tt.style.zIndex=50;

/* ---------- timing ---------- */
const COVER_END=0.4,H0=COVER_END,N0=2.8,NL=2.2,ASK=N0+3*NL,ASK2=11.6,E0=13.0;   // ASK = 9.4
const PIN=[0.55,0.85,1.15];          // the three notes fly onto the board

/* ---------- line icons ---------- */
const keyIcon=c=>`<svg viewBox="0 0 120 60" width="120" height="60"><circle cx="24" cy="30" r="16" fill="none" stroke="${c}" stroke-width="7"/>
  <path d="M40 30 H108 M92 30 V46 M78 30 V42" stroke="${c}" stroke-width="7" stroke-linecap="round" fill="none"/></svg>`;
const potIcon=c=>`<svg viewBox="0 0 120 80" width="120" height="80"><path d="M18 36 H102 L96 74 H24 Z" fill="none" stroke="${c}" stroke-width="7" stroke-linejoin="round"/>
  <path d="M12 36 H108 M8 46 H18 M102 46 H112" stroke="${c}" stroke-width="7" stroke-linecap="round"/>
  <path d="M44 26 q6 -10 0 -20 M60 24 q6 -10 0 -20 M76 26 q6 -10 0 -20" stroke="${c}" stroke-width="5" fill="none" stroke-linecap="round"/></svg>`;
const cakeIcon=c=>`<svg viewBox="0 0 120 84" width="120" height="84"><rect x="16" y="40" width="88" height="38" rx="8" fill="none" stroke="${c}" stroke-width="7"/>
  <path d="M16 56 Q38 48 60 56 Q82 64 104 56" fill="none" stroke="${c}" stroke-width="6"/>
  <path d="M44 40 V22 M60 40 V18 M76 40 V22" stroke="${c}" stroke-width="6" stroke-linecap="round"/>
  <circle cx="44" cy="14" r="5" fill="${c}"/><circle cx="60" cy="10" r="5" fill="${c}"/><circle cx="76" cy="14" r="5" fill="${c}"/></svg>`;

/* ---------- the notice board (840x640, notes in board coordinates) ---------- */
const NOTES=[
  {x:52,y:96,w:350,h:240,r:-4,l1:'נמצא מפתח',l2:'עם מחזיק צב.',ic:keyIcon,say:'נמצא מפתח עם מחזיק צב.'},
  {x:438,y:82,w:350,h:240,r:3,l1:'נשאר אוכל.',l2:'דפקו בדלת.',ic:potIcon,say:'נשאר אוכל? דפקו בדלת.'},
  {x:236,y:368,w:370,h:240,r:-2,l1:'יום הולדת.',l2:'בואו לעוגה.',ic:cakeIcon,say:'יום הולדת? בואו לעוגה.'}];
function noteHTML(n,i){
  return `<div class="n${i}" style="position:absolute;left:${n.x}px;top:${n.y}px;width:${n.w}px;height:${n.h}px;transform:rotate(${n.r}deg);transform-origin:50% 0">
   <div style="position:absolute;inset:0;background:#fff;border:4px solid ${INK};border-radius:10px;box-shadow:0 10px 0 rgba(17,17,17,.08)"></div>
   <div style="position:absolute;left:${n.w/2-17}px;top:-17px;width:34px;height:34px;border-radius:50%;background:${BLUE};border:4px solid ${INK};box-sizing:border-box"></div>
   <div class="w" style="position:absolute;right:22px;top:18px;width:54px;height:54px;border-radius:50%;background:${INK};color:#fff;text-align:center;font:700 34px/54px R">${i+1}</div>
   <div class="w" style="position:absolute;right:24px;left:24px;top:84px;text-align:right;direction:rtl;font:600 46px/1.15 F;color:${INK}">${n.l1}<br><span style="color:${BLUE}">${n.l2}</span></div>
   <div style="position:absolute;left:22px;top:18px">${n.ic(INK)}</div>
  </div>`}
function boardHTML(){
  return `<div style="position:absolute;left:0;top:0;width:840px;height:640px;background:${SOFT};border:10px solid ${INK};border-radius:26px;box-sizing:border-box"></div>
   <div class="w" style="position:absolute;left:0;width:840px;top:22px;text-align:center;font:700 34px/1 R;color:${INK};letter-spacing:1px">לוח מודעות · הבניין</div>
   ${NOTES.map(noteHTML).join('')}`}

/* ---------- COVER: frame 0 is the cover, fully drawn, held until COVER_END ---------- */
const cov=$(`left:0;top:0;width:1080px;height:1920px;background:#fff;z-index:60`,`
  ${hl(395,'הלוח בכניסה',INK,118)}${hl(530,'יודע הכול.',BLUE,118)}
  <div style="position:absolute;left:120px;top:730px;width:840px;height:640px">${boardHTML()}</div>`);
at(cov,0,COVER_END,{anim:'none',fo:0});
window.COVER={t:0.2,title:'הלוח בכניסה יודע הכול.'};

/* ---------- the board: notes fly in, then the camera zooms into each note ---------- */
bg('#fff',0,ASK);
const BX=120,BY=640;
const board=$(`left:${BX}px;top:${BY}px;width:840px;height:640px;transform-origin:0 0`,boardHTML());
const cam=i=>{if(i<0)return {s:1,tx:0,ty:0};const n=NOTES[i];const s=2.15,cx=n.x+n.w/2,cy=n.y+n.h/2;
  return {s,tx:540-BX-s*cx,ty:1010-BY-s*cy}};
at(board,H0,ASK,{anim:'none',fo:.15,up:(l,t)=>{
  // notes fly in from above with a flutter
  NOTES.forEach((n,i)=>{const el=board.querySelector('.n'+i);const k=seg(t,PIN[i],.32);el.style.opacity=k>0?1:0;
    const sw=t>PIN[i]?Math.sin((t-PIN[i])*9)*7*Math.exp(-(t-PIN[i])*2.6):0;
    el.style.transform=`translate(${(1-outCubic(k))*(i%2?260:-260)}px,${(1-outCubic(k))*-700}px) rotate(${n.r+sw}deg)`});
  // camera: board -> note 0 -> note 1 -> note 2
  let a=cam(-1),b=cam(-1),p=0;
  for(let i=0;i<3;i++){const t0=N0+i*NL;if(t>=t0){a=cam(i-1);b=cam(i);p=inOut(seg(t,t0,.45))}}
  const s=a.s+(b.s-a.s)*p,tx=a.tx+(b.tx-a.tx)*p,ty=a.ty+(b.ty-a.ty)*p;
  board.style.transform=`translate(${tx}px,${ty}px) scale(${s})`;
  // the active note lifts a little
  NOTES.forEach((n,i)=>{const el=board.querySelector('.n'+i);const t0=N0+i*NL;
    if(t>=t0&&t<t0+NL){const w=Math.sin((t-t0)*3)*1.2;el.style.transform=`rotate(${n.r+w}deg) scale(${1+.03*outBack(seg(t,t0+.35,.3))})`}})}});
PIN.forEach((p,i)=>{ev(p,'swish',.8);ev(p+.3,'thud',.9)});

// a white band keeps the top clean while the camera is zoomed in (note 3 pushes the board up)
at($(`left:0;top:0;width:1080px;height:440px;background:linear-gradient(#fff 0,#fff 380px,rgba(255,255,255,0) 440px)`),N0,ASK,{anim:'none',fo:.15});

/* ---------- hook ---------- */
caption(250,['השכנים?','תקראו את הלוח.'],H0,N0,{say:'השכנים? תקראו את הלוח.',fs:106,cols:[INK,BLUE],fo:.12,sfx:'pop'});

/* ---------- the three notes (voice reads each note as the camera lands on it) ---------- */
NOTES.forEach((n,i)=>{const t0=N0+i*NL;
  at($(`left:0;top:300px;width:1080px;display:flex;justify-content:center`,
    `<div class="w" style="padding:14px 40px;border-radius:50px;background:${INK};color:#fff;font:700 54px/1 R;direction:rtl">פתק ${i+1} מתוך 3</div>`),
    t0+.05,t0+NL,{dy:-24,s0:.85,fo:.1,sfx:i?'pop2':'whoosh',v:.8,say:n.say})});

at($(`left:0;top:1826px;width:1080px;text-align:center;white-space:nowrap`,`<span style="display:inline-block;padding:4px 18px;border-radius:20px;background:#fff;font:500 36px/1.2 R;color:#8C8C8C">הפתקים והשכנים בדיוניים</span>`),H0,ASK,{anim:'none',fo:.1});

/* ---------- engagement prompt (Comment) ---------- */
bg('#fff',ASK,E0);
caption(250,['איזה פתק','תלוי אצלכם?'],ASK+.05,E0,{say:'איזה פתק תלוי אצלכם?',fs:110,cols:[INK,BLUE],fo:.12,sfx:'whoosh'});
const opt=(n,txt,ic)=>`<div style="position:relative;width:780px;height:124px;margin:0 auto;border-radius:22px;border:5px solid ${INK};background:#fff;direction:rtl">
  <div class="w" style="position:absolute;right:18px;top:14px;width:86px;height:86px;border-radius:50%;background:${BLUE};color:#fff;text-align:center;font:700 54px/86px R">${n}</div>
  <div class="w" style="position:absolute;right:130px;top:0;font:700 56px/114px R;color:${INK}">${txt}</div>
  <div style="position:absolute;left:26px;top:${ic?24:0}px;transform:scale(.8);transform-origin:0 0">${ic?ic(INK):''}</div></div>`;
[['1','מפתח שנמצא',keyIcon],['2','אוכל שנשאר',potIcon],['3','הזמנה לעוגה',cakeIcon],['4','אין לוח. יש קבוצה.',null]].forEach(([n,x,ic],i)=>{
  at($(`left:0;top:${580+i*156}px;width:1080px`,opt(n,x,ic)),ASK+.4+i*.2,E0,{dy:30,s0:.85,fo:.12,sfx:'pop',v:.7})});
caption(1250,['ענו במספר','בתגובות.'],ASK2,E0,{say:'ענו במספר בתגובות.',fs:96,cols:[INK,BLUE],fo:.12,anim:'up',dy:24,sfx:'pop2'});

/* ---------- homie (short) ---------- */
bg('#fff',E0,DUR);
wordmark(E0,DUR);
at($(`left:0;top:760px;width:1080px;text-align:center;font:600 70px/1.1 F;color:${INK}`,'שכנים טובים, חצי דירה.'),E0+.1,DUR,{anim:'up',dy:30,fo:0});

function render(t){runItems(t);turtleWhite(t,E0+.05,[],E0+.35)}
window.AUDIO={dur:DUR,seed:1022,sections:[[0,N0,'MIN',.13,0,1],[N0,ASK,'FC',.14,1,1],[ASK,DUR,'DET',.16,1,0]],ticks:[0.5,2.8]};
window.STRETCH=1.0;
window.VOICE={duck:0.7};   // narration = the say marks above
window.render=render;window.EVENTS=EVENTS;window.SCENES=SCENES;window.DUR=DUR;render(0);
