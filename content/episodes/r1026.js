// Reel H26 (1026) — The turtle · "הצב עובר דירה" (idea T3). Style A, white room, Share reel (unvoiced, loops).
// Versus hook: we pack a flat for a week (a box tower builds, day counter 1->7) vs the turtle: packed in one second
// (the house is already on its back). Twist: what takes the turtle a week? finding where to. Share prompt, wordmark.
const DUR=11.6;
const SCENES=[['a',0,5.4],['b',5.4,DUR]];
Tt.style.zIndex=50;

/* ---------- timing ---------- */
const COVER_END=0.4,S1=COVER_END,S2=3.2,S3=5.4,S4=7.0,S5=8.8,E0=10.8;
const FLOOR=1450;

/* ---------- a cardboard box (line drawing, blue tape, label) ---------- */
const boxSVG=(w,h,label)=>`<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" style="overflow:visible">
 <rect x="4" y="4" width="${w-8}" height="${h-8}" rx="10" fill="#fff" stroke="${INK}" stroke-width="8"/>
 <rect x="${w/2-22}" y="4" width="44" height="${h*0.42}" fill="${BLUE}"/>
 <line x1="4" y1="${h*0.42}" x2="${w-4}" y2="${h*0.42}" stroke="${INK}" stroke-width="5" opacity=".55"/>
 <text x="${w*0.27}" y="${h*0.76}" text-anchor="middle" font-family="R" font-weight="700" font-size="34" fill="${INK}">${label}</text>
</svg>`;
// the tower (bottom first): width, height, x offset, tilt
const BOXES=[[340,150,0,-1.5,'מטבח'],[310,140,14,2,'ספרים'],[330,135,-10,-2,'בגדים'],[290,130,18,2.5,'כבלים'],[300,125,-6,-3,'סלון'],[260,120,12,3,'שבירים']];
const towerHTML=(n)=>{let h='',y=FLOOR;BOXES.slice(0,n).forEach(([w,bh,dx,r,lb])=>{y-=bh-6;
  h+=`<div style="position:absolute;left:${300-w/2+dx}px;top:${y}px;width:${w}px;height:${bh}px;transform:rotate(${r}deg)">${boxSVG(w,bh,lb)}</div>`});return h};
const floorLine=`<div style="position:absolute;left:70px;top:${FLOOR-4}px;width:940px;height:10px;border-radius:5px;background:${INK}"></div>`;

/* ---------- COVER (white): frame 0, fully drawn ---------- */
const cov=$(`left:0;top:0;width:1080px;height:1920px;background:#fff;z-index:60`,`
  ${hl(400,'כמה זמן לוקח',INK,112)}${hl(530,'לכם לארוז?',BLUE,124)}
  <div style="position:absolute;left:0;top:0;width:1080px;height:1920px;transform:translateX(240px) scale(.92);transform-origin:300px ${FLOOR}px">${towerHTML(6)}</div>
  ${floorLine}`);
at(cov,0,COVER_END,{anim:'none',fo:0});
window.COVER={t:0.2,title:'כמה זמן לוקח לכם לארוז?'};

/* ---------- the room (white, whole reel) ---------- */
bg('#fff',0,DUR);
at($(`left:0;top:0;width:1080px;height:1920px`,floorLine),0,E0,{anim:'none',fo:0});

/* ---------- the tower: one box per day, falls in, wobbles; dims when the turtle arrives ---------- */
const DROPS=[S1-.25,0.85,1.3,1.75,2.2,2.6];          // box 0 is already falling at the first frame after the cover
const tower=$(`left:0;top:0;width:1080px;height:1920px;transform-origin:300px ${FLOOR}px`);
const tbx=[];BOXES.forEach(([w,bh,dx,r,lb],i)=>{const d=$(`left:${300-w/2+dx}px;top:0;width:${w}px;height:${bh}px`,boxSVG(w,bh,lb),tower);tbx.push(d)});
const restY=[];{let y=FLOOR;BOXES.forEach(([w,bh])=>{y-=bh-6;restY.push(y)})}
at(tower,0,E0,{anim:'none',fo:0,up:(l,t)=>{
  BOXES.forEach(([w,bh,dx,r],i)=>{const d=tbx[i];const k=seg(t,DROPS[i],.42);
    // a 7th day re-drop of the top box near the end, so the last beat leads back into the first (loop)
    let kk=k;if(i===5&&t>=S5+.3)kk=seg(t,S5+.3,.42);
    if(kk<=0){d.style.display='none';return}d.style.display='block';
    const fall=kk<.7?Math.pow(kk/.7,2):1;const bounce=kk>=.7?Math.sin((kk-.7)/.3*Math.PI)*14:0;
    d.style.top=(restY[i]-(1-fall)*900-bounce)+'px';d.style.transform=`rotate(${r*(kk<1?2.4-1.4*kk:1)}deg)`});
  const lastDrop=Math.max(...DROPS.filter(x=>x<=t),-9);const wob=Math.exp(-(t-lastDrop)*3)*Math.sin((t-lastDrop)*16)*2.2;
  tower.style.transform=`translateX(${t<S2?0:-70*outCubic(seg(t,S2,.4))}px) rotate(${wob+Math.sin(t*2.1)*.6}deg)`;
  tower.style.opacity=t<S2?1:1-.62*seg(t,S2,.4)}});
DROPS.forEach((d,i)=>ev(Math.max(d+.29,S1+.02),'thud',.55+i*.05));
ev(S5+.6,'thud',.8);

/* ---------- S1 hook: we pack for a week (day counter) ---------- */
caption(290,['אורזים דירה:'],S1,S2,{fs:108,c:INK,fo:.08,anim:'up',dy:20,sfx:'pop'});
const day=$(`left:620px;top:930px;width:360px;text-align:center`,`<div class="w" style="font:600 64px/1 R;color:${MUTED}">יום</div><div class="n w" style="font:700 230px/1.05 R;color:${BLUE};direction:ltr">1</div>`);
at(day,S1,S2,{anim:'none',fo:.1,up:(l,t)=>{const n=Math.max(1,DROPS.filter(x=>t>=x+.29).length+(t>=2.95?1:0));const el=day.querySelector('.n');
  el.textContent=Math.min(7,n);const k=seg(t,[...DROPS.map(x=>x+.29),2.95].filter(x=>x<=t).pop()??0,.18);el.style.transform=`scale(${1+(1-k)*.12})`}});
caption(420,['אנחנו: שבוע.'],2.95,S2,{fs:112,c:BLUE,fo:.08,sfx:'ding'});

/* ---------- S2: the turtle packs in one second ---------- */
caption(290,['הצב אורז:'],S2,S3,{fs:108,c:INK,fo:.08,anim:'up',dy:20,sfx:'swish'});
const timer=$(`left:600px;top:760px;width:400px;text-align:center;font:700 150px/1 R;color:${INK};direction:ltr`,'0:00');
at(timer,S2+.15,S3,{anim:'pop',fo:.08,up:(l,t)=>{timer.textContent=t>=4.25?'0:01':'0:00';timer.style.color=t>=4.25?BLUE:INK}});
ev(4.25,'ding',1.2);
caption(420,['שנייה.'],4.3,S3,{fs:150,c:BLUE,fo:.08,anim:'stamp',sfx:'thud'});

/* ---------- S3: the house is already on its back ---------- */
caption(290,['הבית?'],S3,S4,{fs:108,c:INK,fo:.08,anim:'up',dy:20,sfx:'pop'});
caption(420,['כבר על הגב.'],S3+.45,S4,{fs:124,c:BLUE,fo:.08,sfx:'pop2'});

/* ---------- S4: the twist ---------- */
caption(290,['ומה לוקח לו שבוע?'],S4,S5,{fs:96,c:INK,fo:.08,anim:'up',dy:20,sfx:'swish'});
caption(420,['למצוא לאן.'],S4+.6,S5,{fs:136,c:BLUE,fo:.08,sfx:'thud'});

/* ---------- S5: share prompt ---------- */
caption(290,['שלחו למי','שאורז כבר שבוע.'],S5,E0,{fs:100,cols:[INK,BLUE],fo:.1,sfx:'pop'});

/* ---------- end: short wordmark ---------- */
bg('#fff',E0,DUR);
wordmark(E0,DUR);
at($(`left:0;top:560px;width:1080px;text-align:center;font:500 60px/1.1 R;color:${MUTED}`,'יום מעבר. בהצלחה.'),E0+.15,DUR,{dy:20,fo:0});

/* ---------- turtle (one per frame, white background, with its house) ---------- */
function turtleR(t){
  if(t<S2||t>=E0){turtle(null);return}
  const S=1.25,X=745;let x=X,y=FLOOR,pose='hello',rot=0,sx=1,sy=1;
  const e=outBack(seg(t,S2,.5));x=X+(1-e)*500;                         // walks in from the right edge
  if(t<S2+.5)y-=Math.abs(Math.sin(seg(t,S2,.5)*Math.PI*3))*24;
  if(t>=4.05&&t<4.45){const q=seg(t,4.05,.4);sx=1+.14*Math.sin(q*Math.PI);sy=1-.12*Math.sin(q*Math.PI)}   // "packing": one squash
  if(t>=4.25&&t<S4){pose='celebrate';if(t<4.9)y-=Math.sin(seg(t,4.25,.65)*Math.PI)*90}
  if(t>=S3&&t<S4)rot=Math.sin(t*7)*2;
  if(t>=S4&&t<S5){pose='search';rot=Math.sin(t*3)*1.5}
  if(t>=S5){pose='sleep'}
  turtle({x,y,s:S,pose,rot,sx,sy});
}
function render(t){runItems(t);turtleR(t)}
window.AUDIO={dur:DUR,seed:1026,sections:[[0,S2,'DET',.13,1,0],[S2,S5,'FC',.15,1,1],[S5,DUR,'POP',.16,0,1]],ticks:[0.4,3.2]};
window.STRETCH=1.0;
window.render=render;window.EVENTS=EVENTS;window.SCENES=SCENES;window.DUR=DUR;render(0);
