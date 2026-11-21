// Reel H23 (1023) — the city · kinetic type (style B), voiced, Comment: "which floor would you rent?".
// A line-drawn building; a blue dot climbs the stairwell floor by floor -> four floors, what each one means for the flat
// (ground, 2nd, 4th without a lift, the roof) -> comment prompt: which floor would you rent? 1/2/3/4.
const DUR=14.4;
const SCENES=[['a',0,6.6],['b',6.6,DUR]];
Tt.style.zIndex=50;

/* ---------- timing ---------- */
const COVER_END=0.4,H0=COVER_END,F0=2.7,FL=2.15,ASK=F0+4*FL,E0=13.9;   // ASK = 11.3 (beats widened so the real voice fits)
const OPTS=[0,2,4,5];                       // levels shown: ground, 2nd, 4th, roof
/* ---------- the building: levels 0..4 + roof (5). viewBox 600x780 ---------- */
const LY=l=>l===5?40:620-l*120;             // top y of a level band (roof band 40-140)
function buildingSVG(stroke,fill,o={}){
  const act=o.act??-1,badges=o.badges;
  let s=`<svg viewBox="0 0 600 780" width="${o.w||600}" height="${(o.w||600)*1.3}" style="overflow:visible">`;
  // active band
  s+=`<rect class="band" x="40" y="${act>=0?LY(act):-999}" width="420" height="${act===5?100:120}" fill="${BLUE}"/>`;
  // roof structure (water tank + door) and parapet
  s+=`<rect x="110" y="60" width="120" height="80" fill="none" stroke="${stroke}" stroke-width="8"/><path d="M300 140 V86 H350 V140" fill="none" stroke="${stroke}" stroke-width="8"/>`;
  s+=`<path d="M40 140 H560" stroke="${stroke}" stroke-width="10"/>`;
  // facade + stairwell
  s+=`<rect x="40" y="140" width="520" height="600" fill="none" stroke="${stroke}" stroke-width="10"/>`;
  s+=`<path d="M460 140 V740" stroke="${stroke}" stroke-width="8"/>`;
  for(let l=0;l<5;l++){const y=LY(l);
    if(l>0)s+=`<path d="M40 ${y+120} H460" stroke="${stroke}" stroke-width="5" opacity=".5"/>`;
    const wf=act===l?'#fff':'none',ws=act===l?'#fff':stroke;
    s+=`<rect x="90" y="${y+30}" width="110" height="64" rx="6" fill="${wf}" stroke="${ws}" stroke-width="7"/><rect x="290" y="${y+30}" width="110" height="64" rx="6" fill="${wf}" stroke="${ws}" stroke-width="7"/>`;
    // stair zigzag
    s+=`<path d="M470 ${y+112} L550 ${y+60} L470 ${y+8}" fill="none" stroke="${stroke}" stroke-width="5" opacity=".6"/>`}
  s+=`<path d="M220 740 V660 H280 V740" fill="none" stroke="${stroke}" stroke-width="8"/><path d="M10 740 H590" stroke="${stroke}" stroke-width="12" stroke-linecap="round"/>`;
  if(badges)OPTS.forEach((l,i)=>{const y=l===5?90:LY(l)+60;
    s+=`<circle cx="-14" cy="${y}" r="34" fill="${BLUE}"/><text x="-14" y="${y+14}" text-anchor="middle" font-family="R" font-weight="700" font-size="40" fill="#fff">${i+1}</text>`});
  s+=`<circle class="dot" cx="510" cy="720" r="20" fill="${BLUE}" stroke="${fill}" stroke-width="5"/></svg>`;
  return s}
const dotXY=lv=>{const l=Math.max(0,lv);if(l>=5)return [380,120];const y=LY(Math.floor(l))+100-(l%1)*120;return [510+Math.sin(l*Math.PI)*28,y]};

/* ---------- COVER (black): frame 0, fully drawn ---------- */
const cov=$(`left:0;top:0;width:1080px;height:1920px;background:${INK};z-index:60`,`
  ${hl(390,'איזו קומה','#fff',118)}${hl(525,'הייתם שוכרים?',NAMEC,118)}
  <div style="position:absolute;left:280px;top:690px;width:520px">${buildingSVG('#fff',INK,{w:520,badges:true})}</div>`);
at(cov,0,COVER_END,{anim:'none',fo:0});
window.COVER={t:0.2,title:'איזו קומה הייתם שוכרים?'};

/* ---------- hook (black): the dot climbs the stairwell, floor counter ---------- */
bg(INK,0,F0);
caption(250,['לפני החוזה,','ספרו מדרגות.'],H0,F0,{say:'לפני החוזה, ספרו מדרגות.',fs:104,cols:['#fff',NAMEC],fo:.1,sfx:'pop'});
const b1=$(`left:300px;top:640px;width:480px`,buildingSVG('#fff',INK,{w:480}));
const cnt=$(`left:90px;top:900px;width:200px;text-align:center`,`<div class="w" style="font:600 46px/1 R;color:#aaa">קומה</div><div class="c w" style="font:700 170px/1.1 R;color:#fff">0</div>`);
at(b1,H0,F0,{anim:'none',fo:.1,up:(l)=>{const lv=Math.min(4,outCubic(seg(l,.1,2.0))*4.2);const [x,y]=dotXY(lv);
  const d=b1.querySelector('.dot');d.setAttribute('cx',x);d.setAttribute('cy',y)}});
at(cnt,H0,F0,{anim:'none',fo:.1,up:(l)=>{cnt.querySelector('.c').textContent=Math.min(4,Math.floor(outCubic(seg(l,.1,2.0))*4.2))}});
[0.75,1.05,1.4,1.85].forEach(t=>ev(t,'pin',.8));

/* ---------- four floors (white) ---------- */
bg('#fff',F0,ASK);
const FLOORS=[['קרקע.','כל הרחוב בחלון.','קרקע: רחוב בחלון.'],['קומה 2.','בדיוק באמצע.','שתיים: באמצע.'],
  ['קומה 4.','בלי מעלית. עם הקניות.','רביעית, בלי מעלית.'],['הגג.','נוף. ושמש על התקרה.','הגג: נוף וחום.']];
const b2=$(`left:250px;top:590px;width:560px`,buildingSVG(INK,'#fff',{w:560}));
at(b2,F0,ASK,{anim:'none',fo:.12,up:(l,t)=>{
  let i=Math.min(3,Math.floor((t-F0)/FL));const t0=F0+i*FL;
  const prev=i>0?OPTS[i-1]:0;const lv=prev+(OPTS[i]-prev)*inOut(seg(t,t0,.5));
  const [x,y]=dotXY(lv);const d=b2.querySelector('.dot');d.setAttribute('cx',x);d.setAttribute('cy',y);
  const band=b2.querySelector('.band');const L=OPTS[i];const k=seg(t,t0+.25,.25);
  band.setAttribute('y',LY(L));band.setAttribute('height',L===5?100:120);band.setAttribute('opacity',k)}});
FLOORS.forEach(([title,sb,say],i)=>{const t0=F0+i*FL;
  caption(250,[title],t0+.05,t0+FL,{say,fs:140,c:i%2?BLUE:INK,fo:.08,sfx:i?'pop2':'whoosh',v:.8});
  at($(`left:0;top:420px;width:1080px`,sub(0,sb)),t0+.2,t0+FL,{anim:'up',dy:20,fo:.08});
  at($(`left:90px;top:${590+(OPTS[i]===5?90:LY(OPTS[i])+60)*(560/600)-56}px;width:112px;height:112px;border-radius:50%;background:${BLUE};color:#fff;text-align:center;font:700 64px/112px R`,`${i+1}`),
    t0+.25,t0+FL,{dy:0,s0:.4,fo:.08})});

/* ---------- engagement prompt (Comment, black) ---------- */
bg(INK,ASK,E0);
caption(250,['איזו קומה','הייתם שוכרים?'],ASK+.05,E0,{say:'איזו קומה? בתגובות.',fs:110,cols:['#fff',NAMEC],fo:.12,sfx:'whoosh'});
const opt=(n,txt)=>`<div style="position:relative;width:760px;height:120px;margin:0 auto;border-radius:60px;background:#fff;direction:rtl">
  <div class="w" style="position:absolute;right:16px;top:17px;width:86px;height:86px;border-radius:50%;background:${BLUE};color:#fff;text-align:center;font:700 54px/86px R">${n}</div>
  <div class="w" style="position:absolute;right:130px;top:0;font:700 56px/120px R;color:${INK}">${txt}</div></div>`;
[['1','קרקע'],['2','קומה 2'],['3','קומה 4, בלי מעלית'],['4','הגג']].forEach(([n,x],i)=>{
  at($(`left:0;top:${560+i*150}px;width:1080px`,opt(n,x)),ASK+.4+i*.2,E0,{dy:30,s0:.85,fo:.12,sfx:'pop',v:.7})});
at($(`left:0;top:1190px;width:1080px`,hl(0,'המספר, בתגובות.',NAMEC,92)),ASK+1.6,E0,{anim:'up',dy:24,fo:.12,sfx:'pop2'});

/* ---------- homie (short) ---------- */
bg('#fff',E0,DUR);
wordmark(E0,DUR);
at($(`left:0;top:760px;width:1080px;text-align:center;font:600 70px/1.1 F;color:${INK}`,'דירה טובה, בקומה שלכם.'),E0+.05,DUR,{anim:'up',dy:30,fo:0});

function render(t){runItems(t);turtleWhite(t,E0+.05,[],E0+.3)}
window.AUDIO={dur:DUR,seed:1023,sections:[[0,F0,'CG',.13,0,1],[F0,ASK,'POP',.15,1,1],[ASK,DUR,'MIN',.14,1,0]],ticks:[0.4,2.7]};
window.STRETCH=1.0;
window.VOICE={duck:0.7};   // narration = the say marks above
window.render=render;window.EVENTS=EVENTS;window.SCENES=SCENES;window.DUR=DUR;render(0);
