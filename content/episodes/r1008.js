// Reel H8 (1008) — The turtle · "הצב בודק דירה" (idea T1). Style A, white kitchen.
// The turtle measures a kitchen in turtle steps (counter ticks up), then the door (house fits) and its fridge shelf.
// Payoff: kitchens you measure in steps, roommates by match score.
const DUR=22.6;
const SCENES=[['a',0,12.0],['b',12.0,DUR]];
Tt.style.zIndex=50;
const END_A=12.55;
window.AUDIO={dur:DUR,seed:1008,sections:[[0,12.0,'MIN',.24,0,1],[12.0,DUR,'FC',.30,1,1]],ticks:[0,0]};

/* ---------- A: measuring the kitchen ---------- */
bg('#fff',0,END_A);

// kitchen line drawing (fridge left, counter + cabinets right, floor)
const KIT=`<svg viewBox="0 0 1080 800" width="1080" height="800" style="overflow:visible"><g transform="translate(1080 0) scale(-1 1)">
 <line x1="40" y1="700" x2="1040" y2="700" stroke="${INK}" stroke-width="8" stroke-linecap="round"/>
 <rect x="70" y="150" width="270" height="550" rx="26" fill="#fff" stroke="${INK}" stroke-width="8"/>
 <line x1="70" y1="330" x2="340" y2="330" stroke="${INK}" stroke-width="7"/>
 <line x1="300" y1="200" x2="300" y2="290" stroke="${INK}" stroke-width="8" stroke-linecap="round"/>
 <line x1="300" y1="380" x2="300" y2="470" stroke="${INK}" stroke-width="8" stroke-linecap="round"/>
 <rect class="shelf" x="96" y="500" width="218" height="22" rx="8" fill="${PALE}"/>
 <rect x="640" y="380" width="380" height="320" fill="${SOFT}" stroke="${INK}" stroke-width="8"/>
 <rect x="620" y="356" width="420" height="30" rx="10" fill="${INK}"/>
 <line x1="830" y1="386" x2="830" y2="700" stroke="${INK}" stroke-width="6"/>
 <line x1="790" y1="470" x2="790" y2="540" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>
 <line x1="870" y1="470" x2="870" y2="540" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>
 <path d="M700 356 L700 300 Q700 270 730 270 L760 270" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>
 <path d="M420 700 L420 250 L600 250 L600 700" fill="none" stroke="${INK}" stroke-width="8" stroke-linejoin="round"/>
 <circle cx="578" cy="480" r="9" fill="${INK}"/>
 <rect x="640" y="60" width="380" height="150" rx="16" fill="#fff" stroke="${INK}" stroke-width="7"/>
 <line x1="830" y1="60" x2="830" y2="210" stroke="${INK}" stroke-width="6"/>
</g></svg>`;
const kit=$(`left:0;top:1000px;width:1080px;height:800px`,KIT);
at(kit,0,END_A,{anim:'none',fo:0});

// step marks on the floor (blue dots appear one per step)
const STEPS=[];for(let i=0;i<12;i++)STEPS.push(0.55+i*0.38);
const dots=$(`left:0;top:0;width:1080px;height:1920px`);
at(dots,0,6.6,{anim:'none',fo:.2,up:(l,t)=>{let h='';STEPS.forEach((s,i)=>{if(t>=s){const x=150+i*26;h+=`<div style="position:absolute;left:${x-9}px;top:1716px;width:18px;height:18px;border-radius:50%;background:${BLUE}"></div>`}});dots.innerHTML=h}});
STEPS.forEach((s,i)=>ev(s,'pin',0.8+i*0.03));

// hook: label + live counter
caption(190,['המטבח, בצעדים:'],0.05,6.6,{fs:96,c:INK,fo:.1,sfx:'pop'});
const cnt=$(`left:0;top:330px;width:1080px;text-align:center;font:600 300px/1 F;color:${BLUE};direction:ltr`,'0');
at(cnt,0.25,6.6,{anim:'none',fo:.1,up:(l,t)=>{let n=0;STEPS.forEach(s=>{if(t>=s)n++});cnt.textContent=n;
  const last=STEPS[n-1]??-9;const k=seg(t,last,.18);cnt.style.transform=`scale(${1+(1-k)*.12*(n>0)})`}});
caption(650,['צעדי צב.'],5.25,6.6,{fs:84,c:INK,fo:.1,sfx:'ding'});
at($(`left:0;top:760px;width:1080px;text-align:center;font:500 60px/1.1 R;color:${MUTED}`,'מטבח ענק.'),5.6,6.6,{dy:20,fo:.1});

// beat 2: the door
caption(190,['הדלת:'],6.6,9.3,{fs:96,c:INK,fo:.1,sfx:'swish'});
caption(330,['הבית נכנס.'],7.2,9.3,{fs:190,c:BLUE,fo:.1,sfx:'thud'});
at($(`left:0;top:570px;width:1080px;text-align:center;font:500 60px/1.1 R;color:${MUTED}`,'גם זה שעל הגב.'),7.8,9.3,{dy:20,fo:.1});
ev(7.9,'boing',1);

// beat 3: the fridge shelf
caption(190,['המדף שלי במקרר:'],9.3,END_A,{fs:96,c:INK,fo:0,sfx:'swish'});
caption(330,['חצי צעד.'],10.0,END_A,{fs:200,c:BLUE,fo:0,sfx:'thud'});
at($(`left:0;top:580px;width:1080px;text-align:center;font:500 60px/1.1 R;color:${MUTED}`,'מספיק לחסה אחת.'),10.6,END_A,{dy:20,fo:0});
// shelf glows blue while measured
const shelfHi=$(`left:766px;top:1500px;width:218px;height:22px;border-radius:8px;background:${BLUE}`);
at(shelfHi,10.0,END_A,{anim:'none',fo:0});

at($(`left:0;top:1830px;width:1080px;text-align:center;font:500 38px/1.2 R;color:#8C8C8C;white-space:nowrap`,'המידות בצעדי צב, לצורך הבידור בלבד'),0.3,END_A,{anim:'none',fo:0});

/* ---------- B: what you can't measure in steps ---------- */
wipe(12.0,'ושותפים?');
wordmark(13.15,DUR);
feat(13.2,15.1,`${hl(380,'את זה')}${hl(510,'לא מודדים בצעדים.',BLUE)}`);
FEAT.match(15.1,17.9);
feat(17.9,19.8,`${hl(380,'מטבח, בצעדים.')}${hl(510,'שותפים, בהתאמה.',BLUE)}${sub(690,'בלי מתווכים. בחינם.')}`);
endCard(19.8,DUR,'מודדים את מה שחשוב.');

/* ---------- turtle ---------- */
function turtleA(t){
  if(t>=11.95){turtle(null);return}
  const S=0.8,FLOOR=1700;
  let x,y=FLOOR,pose='hello',rot=0,sx=1,sy=1;
  // walk: starts near the counter (right), one step per STEPS tick, toward the fridge (left)
  const n=STEPS.filter(s=>t>=s).length;
  const lastS=STEPS[Math.max(0,n-1)];
  const stepP=n>0&&n<=12?seg(t,lastS,.3):0;
  const x0=150, dx=26;
  if(t<6.6){
    x=n===0?x0:x0-26+(n-1+inOut(stepP))*dx+26;
    if(n>0&&stepP<1)y-=Math.sin(stepP*Math.PI)*22;
    const e=outBack(seg(t,0,.45));y+=(1-e)*500;
    rot=Math.sin(t*9)*1.5;
    if(t>5.25)pose='celebrate';
  } else if(t<9.3){
    // to the doorway, squeeze test with the house
    const xs=x0+12*dx;const k=inOut(seg(t,6.6,.5));x=xs+k*(570-xs);pose=t>7.9?'celebrate':'hello';
    if(k<1)y-=Math.abs(Math.sin(k*Math.PI*3))*16;
    const q=seg(t,7.2,.6);if(q>0&&q<1){sx=1-.12*Math.sin(q*Math.PI);sy=1+.08*Math.sin(q*Math.PI)}
  } else {
    // on to the fridge, looking at its shelf
    const k=inOut(seg(t,9.3,.6));x=570+k*(640-570);pose='search';rot=Math.sin(t*4)*1;
    if(k<1)y-=Math.abs(Math.sin(k*Math.PI*3))*16;
  }
  turtle({x,y,s:S,pose,rot,sx,sy});
}
function render(t){runItems(t);if(t<12.0)turtleA(t);else turtleWhite(t,13.2,[13.2,15.1,17.9],19.8)}
window.render=render;window.EVENTS=EVENTS;window.SCENES=SCENES;window.DUR=DUR;render(0);
