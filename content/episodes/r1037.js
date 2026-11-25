// Reel H37 (1037) — Experiment (b): a v2 remake of H26 "הצב עובר דירה" (idea X1, parent T3). Style A, unvoiced, loops.
// Test: the same joke as H26, rebuilt to plan v2: the whole versus in frame 0 (black cover, white panel with the box
// tower and the turtle side by side, "יום 7" vs "0:01"), a split-screen race instead of two sequential halves, the
// share prompt on screen at 1.5 s, 9.2 s instead of 11.6 s. Twist kept: what takes the turtle a week? finding where to.
const DUR=9.2;
const COVER_END=0.4,P0=1.5,R1=2.5,TW=3.7,LP=6.0,E0=8.4;
const SCENES=[['a',0,TW],['b',TW,DUR]];
Tt.style.zIndex=50;

/* ---------- geometry: RTL, "אתם" (the tower) on the right, "הצב" on the left ---------- */
const FLOOR=1230,TX=780,TUX=290,TUS=1.05;

/* ---------- small static wordmark, frame 0 until the brand ending ---------- */
const wm=$(`left:0;top:280px;width:1080px;display:flex;justify-content:center;z-index:70`,WORDMARK);
wm.querySelector('svg').style.cssText='width:200px;height:auto;display:block';
at(wm,0,E0,{anim:'none',fo:0,up:(l,t)=>{const c=t<COVER_END?'#fff':INK;wm.querySelectorAll('path').forEach(p=>p.setAttribute('fill',c))}});

/* ---------- a cardboard box (line drawing, blue tape, label) ---------- */
const boxSVG=(w,h,label)=>`<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" style="overflow:visible">
 <rect x="4" y="4" width="${w-8}" height="${h-8}" rx="9" fill="#fff" stroke="${INK}" stroke-width="7"/>
 <rect x="${w/2-17}" y="4" width="34" height="${h*0.42}" fill="${BLUE}"/>
 <line x1="4" y1="${h*0.42}" x2="${w-4}" y2="${h*0.42}" stroke="${INK}" stroke-width="4" opacity=".55"/>
 <text x="${w*0.27}" y="${h*0.78}" text-anchor="middle" font-family="R" font-weight="700" font-size="27" fill="${INK}">${label}</text>
</svg>`;
// bottom first: width, height, x offset, tilt, label
const BOXES=[[250,108,0,-1.5,'מטבח'],[226,100,10,2,'ספרים'],[240,98,-8,-2,'בגדים'],[212,94,12,2.5,'כבלים'],[220,90,-4,-3,'סלון'],[190,86,8,3,'שבירים']];
const restY=[];{let y=FLOOR;BOXES.forEach(([w,bh])=>{y-=bh-5;restY.push(y)})}
const towerHTML=()=>BOXES.map(([w,bh,dx,r,lb],i)=>`<div style="position:absolute;left:${TX-w/2+dx}px;top:${restY[i]}px;width:${w}px;height:${bh}px;transform:rotate(${r}deg)">${boxSVG(w,bh,lb)}</div>`).join('');
const floorHTML=`<div style="position:absolute;left:70px;top:${FLOOR-4}px;width:940px;height:10px;border-radius:5px;background:${INK}"></div>`;
const divHTML=`<div style="position:absolute;left:538px;top:720px;width:4px;height:${FLOOR-720}px;background:${PALE};border-radius:2px"></div>`;
const counterHTML=(x,txt,c,cls='')=>`<div class="${cls} w" style="position:absolute;left:${x-200}px;top:${FLOOR+22}px;width:400px;text-align:center;font:700 84px/1 R;color:${c};direction:rtl">${txt}</div>`;
const turtleHTML=(pose)=>`<div style="position:absolute;left:${TUX-204*TUS}px;top:${FLOOR-262*TUS}px;width:400px;height:300px;transform:scale(${TUS});transform-origin:0 0">${TURTLES[pose]}</div>`;

/* ---------- COVER (black, white panel with the race already finished): frame 0 ---------- */
const cov=$(`left:0;top:0;width:1080px;height:1920px;background:${INK};z-index:60`,`
  ${hl(400,'אתם: שבוע.','#fff',112)}${hl(522,'הצב: שנייה.',NAMEC,112)}
  <div style="position:absolute;left:50px;top:665px;width:980px;height:735px;border-radius:44px;background:#fff;overflow:hidden">
   <div style="position:absolute;left:-50px;top:-665px;width:1080px;height:1920px">
    ${divHTML}${towerHTML()}${turtleHTML('celebrate')}${floorHTML}
    ${counterHTML(TX,'יום 7',INK)}${counterHTML(TUX,'0:01',BLUE)}
   </div></div>`);
at(cov,0,COVER_END,{anim:'none',fo:0});
window.COVER={t:0.2,title:'אתם: שבוע. הצב: שנייה.'};

/* ---------- the room (white, whole reel) ---------- */
bg('#fff',0,DUR);
at($(`left:0;top:0;width:1080px;height:1920px`,floorHTML),0,E0,{anim:'none',fo:0});
const dv=$(`left:0;top:0;width:1080px;height:1920px`,divHTML);
at(dv,0,TW,{anim:'none',fo:.3});

/* ---------- the tower: one box per day, falls in, wobbles; dims during the twist, back for the loop ---------- */
const DROPS=[0.12,0.55,0.9,1.25,1.6,1.95];         // box 0 is already falling at the first frame after the cover
const REDROP=LP+.15;                               // day 8: the top box drops again (the loop)
const tower=$(`left:0;top:0;width:1080px;height:1920px;transform-origin:${TX}px ${FLOOR}px`);
const tbx=BOXES.map(([w,bh,dx,r,lb])=>$(`left:${TX-w/2+dx}px;top:0;width:${w}px;height:${bh}px`,boxSVG(w,bh,lb),tower));
const landed=t=>DROPS.filter(x=>t>=x+.3).length;
at(tower,0,E0,{anim:'none',fo:0,up:(l,t)=>{
  BOXES.forEach(([w,bh,dx,r],i)=>{const d=tbx[i];let k=seg(t,DROPS[i],.42);
    if(i===5&&t>=REDROP)k=seg(t,REDROP,.42);
    if(k<=0){d.style.display='none';return}d.style.display='block';
    const fall=k<.7?Math.pow(k/.7,2):1;const bounce=k>=.7?Math.sin((k-.7)/.3*Math.PI)*12:0;
    d.style.top=(restY[i]-(1-fall)*820-bounce)+'px';d.style.transform=`rotate(${r*(k<1?2.4-1.4*k:1)}deg)`});
  const last=Math.max(...[...DROPS,REDROP].filter(x=>x+.3<=t),-9)+.3;const wob=Math.exp(-(t-last)*3)*Math.sin((t-last)*16)*2;
  tower.style.transform=`rotate(${wob+Math.sin(t*2.1)*.5}deg)`;
  tower.style.opacity=t<TW?1:t<LP?1-.7*seg(t,TW,.3):.3+.7*seg(t,LP,.3)}});
DROPS.forEach((d,i)=>ev(Math.max(d+.3,COVER_END+.02),'thud',.5+i*.05));
ev(REDROP+.3,'thud',.8);

/* ---------- counters under each side: days for us, a timer for the turtle ---------- */
const day=$(`left:0;top:0;width:1080px;height:1920px`,counterHTML(TX,'יום 1',INK,'dn'));
at(day,COVER_END,E0,{anim:'none',fo:0,up:(l,t)=>{const el=day.querySelector('.dn');
  const n=t>=REDROP+.3?8:Math.min(7,Math.max(1,landed(t)+(t>=2.3?1:0)));el.textContent='יום '+n;
  const ts=[...DROPS.map(x=>x+.3),2.3,REDROP+.3].filter(x=>x<=t);const k=seg(t,ts.length?ts[ts.length-1]:0,.18);
  el.style.transform=`scale(${1+(1-k)*.14})`;el.style.color=n===8?BLUE:INK;el.style.opacity=t>=TW&&t<LP?.35:1}});
const TICK=1.25;
const tmr=$(`left:0;top:0;width:1080px;height:1920px`,counterHTML(TUX,'0:00',INK,'tn'));
at(tmr,COVER_END,E0,{anim:'none',fo:0,up:(l,t)=>{const el=tmr.querySelector('.tn');const on=t>=TICK;
  el.textContent=on?'0:01':'0:00';el.style.color=on?BLUE:INK;el.style.transform=`scale(${1+(on?(1-seg(t,TICK,.25))*.2:0)})`}});
ev(TICK,'ding',1.2);

/* ---------- hook: the race (one line, at most 7 words) ---------- */
caption(400,['לארוז דירה.','מי מהר יותר?'],COVER_END,R1,{fs:110,cols:[INK,BLUE],fo:.08,sfx:'pop'});

/* ---------- the prompt (by 3 s), under the floor, stays to the brand ending ---------- */
const promptHTML=`<div style="position:absolute;left:120px;top:0;width:840px;height:136px;border-radius:68px;background:#fff;border:5px solid ${INK};box-sizing:border-box;display:flex;align-items:center;justify-content:center;direction:rtl">
  <div class="w" style="display:flex;direction:rtl;gap:20px;font:600 90px/1 F;color:${INK}"><div>שלחו למי</div><div style="color:${BLUE}">שאורזים.</div></div></div>`;
const pr=$(`left:0;top:1360px;width:1080px;height:136px;z-index:9`,promptHTML);
at(pr,P0,E0,{dy:40,s0:.85,fo:.15,sfx:'pop2',
  up:(l,t)=>{const k=t>=LP+.5?Math.sin(clamp((t-LP-.5)/.4)*Math.PI)*.07:0;pr.style.transform=`scale(${1+k})`}});
window.PROMPT={t:1.5,text:'שלחו למי שאורזים.'};

/* ---------- R1: why the turtle is done ---------- */
caption(400,['הבית?','כבר על הגב.'],R1,TW,{fs:112,cols:[INK,BLUE],fo:.08,anim:'up',dy:20,sfx:'swish'});

/* ---------- twist ---------- */
caption(400,['ומה לוקח לו שבוע?'],TW,LP,{fs:92,c:INK,fo:.08,anim:'up',dy:20,sfx:'whoosh'});
caption(515,['למצוא לאן.'],TW+.6,LP,{fs:132,c:BLUE,fo:.08,sfx:'thud'});

/* ---------- loop: meanwhile, at yours ---------- */
caption(400,['ואצלכם?','עוד ארגז.'],LP+.05,E0,{fs:112,cols:[INK,BLUE],fo:.1,sfx:'pop'});

/* ---------- brand ending (0.8 s) ---------- */
wordmark(E0,DUR);

/* ---------- turtle (one per frame, white background, with its house; inline in the cover) ---------- */
function turtleR(t){
  if(t<COVER_END||t>=E0){turtle(null);return}
  let x=TUX,y=FLOOR,pose='hello',rot=0,sx=1,sy=1;
  const e=outBack(seg(t,COVER_END,.5));x=TUX-(1-e)*480;                 // walks in from the left edge, facing the tower
  if(t<COVER_END+.5)y-=Math.abs(Math.sin(seg(t,COVER_END,.5)*Math.PI*3))*20;
  if(t>=1.0&&t<1.4){const q=seg(t,1.0,.4);sx=1+.14*Math.sin(q*Math.PI);sy=1-.12*Math.sin(q*Math.PI)}   // "packing": one squash
  if(t>=TICK&&t<TW){pose='celebrate';const j=((t-TICK)%.7)/.7;if(t<R1)y-=Math.sin(j*Math.PI)*70}
  if(t>=R1&&t<TW)rot=Math.sin(t*7)*2;
  if(t>=TW&&t<LP){pose='search';rot=Math.sin(t*3)*1.5}
  if(t>=LP){pose='sleep'}
  turtle({x,y,s:TUS,pose,rot,sx,sy});
}
function render(t){runItems(t);turtleR(t)}
window.BEATS={payoff:TW,outro:LP};
window.AUDIO={dur:DUR,seed:1037,sections:[[0,TW,'CG',.14,1,0],[TW,LP,'MIN',.14,0,1],[LP,DUR,'DET',.15,1,1]],ticks:[0.4,2.4]};
window.STRETCH=1.0;
window.render=render;window.EVENTS=EVENTS;window.SCENES=SCENES;window.DUR=DUR;render(0);
