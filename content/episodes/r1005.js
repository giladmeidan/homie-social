// Reel H5 (1005) — Roommate life · "השבוע הראשון ביחד" (idea L1). Style A, white kitchen.
// Day 1 → 7 of two new roommates: two milk cartons slowly become one. Then mutual like.
const DUR=21.6;
const SCENES=[['a',0,12.4],['b',12.4,DUR]];
Tt.style.zIndex=50;
const END_A=12.95;
window.AUDIO={dur:DUR,seed:1005,sections:[[0,12.4,'CG',.13,0,1],[12.4,DUR,'POP',.19,1,1]],ticks:[0,0]};

/* ---------- A: the first week ---------- */
bg('#fff',0,END_A);
// day labels (top)
const day=(l1,l2,a,b,o={})=>caption(230,[l1,l2],a,b,Object.assign({fs:120,cols:[INK,BLUE],fo:.05},o));
day('יום 1.','שני חלבים.',0.05,3.9,{sfx:'thud',dy:60});
day('יום 3.','שני חלבים.',3.9,6.8,{sfx:'pin'});
day('יום 5.','שני חלבים.',6.8,9.6,{sfx:'pin'});
day('יום 7.','חלב אחד.',9.6,END_A,{sfx:'dun'});

// counter
at($(`left:60px;top:1450px;width:960px;height:280px;background:${SOFT};border-top:8px solid ${INK};border-radius:0 0 50px 50px`),0,END_A,{anim:'none',fo:0});

// characters (A left: blue shirt, B right: white shirt)
character(`left:40px;top:1030px;`,360,0.15,END_A,(l)=>{const t=l+0.15;
  const k=Math.max(talkAt(t,[1.7],1.0),talkAt(t,[4.3],1.1),talkAt(t,[7.2],1.0));
  const warm=t>3.9;
  return{hair:'curly',shirt:BLUE,brow:warm?'flat':'up',eyes:t>10.8?'closed':'open',look:1,mouth:k>=0?'talk':warm?(t>10.8?'grin':'smile'):'flat',talk:k}},{fo:0});
character(`left:680px;top:1030px;`,360,0.3,END_A,(l)=>{const t=l+0.3;
  const k=Math.max(talkAt(t,[2.7],1.1),talkAt(t,[5.4],0.9),talkAt(t,[8.2],0.8),talkAt(t,[10.3],1.0));
  const warm=t>5.2;
  return{hair:'long',shirt:'#fff',brow:warm?'flat':'up',eyes:'open',look:-1,mouth:k>=0?'talk':warm?(t>10.8?'grin':'smile'):'flat',talk:k}},{fo:0});

// milk cartons on the counter
const carton=(x,lbl)=>`<g transform="translate(${x} 0)"><path d="M-60 70 L-60 300 L60 300 L60 70 L30 20 L-30 20 Z" fill="#fff" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>
 <path d="M-30 20 L-30 0 L30 0 L30 20" fill="#fff" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/><path d="M-60 70 L60 70" stroke="${INK}" stroke-width="6"/>
 <rect x="-60" y="140" width="120" height="76" fill="${BLUE}"/><text x="0" y="192" text-anchor="middle" font-family="F" font-weight="600" font-size="46" fill="#fff">חלב</text>${lbl}</g>`;
const milk=$(`left:290px;top:1152px;width:500px;height:310px`);
ev(0.25,'thud',1);ev(0.55,'thud',1);ev(11.0,'ding',1.2);
at(milk,0.25,END_A,{anim:'none',fo:0,up:(l,t)=>{
  // two cartons until day 7, then they slide together and become one
  const m=inOut(seg(t,10.4,.6));const pop1=outBack(seg(t,.25,.3)),pop2=outBack(seg(t,.55,.3));
  const xL=185+m*65,xR=315-m*65;
  const s1=`<g transform="translate(0 ${(1-pop1)*60})" opacity="${clamp(pop1*3)}">${carton(xL,'')}</g>`;
  const s2=`<g transform="translate(0 ${(1-pop2)*60})" opacity="${clamp(pop2*3)*(1-seg(t,10.8,.2))}">${carton(xR,'')}</g>`;
  milk.innerHTML=`<svg viewBox="0 0 500 310" width="500" height="310" style="overflow:visible">${s2}${s1}</svg>`}});
// one small heart over the single carton
at($(`left:500px;top:1050px;width:80px;height:80px`,`<svg viewBox="0 0 44 44" width="80" height="80"><path d="M0 12 C0 -4 22 -4 22 10 C22 -4 44 -4 44 12 C44 28 22 38 22 42 C22 38 0 28 0 12Z" fill="${BLUE}"/></svg>`),11.05,END_A,{dy:30,s0:.3,fo:0,sfx:'pop'});

// speech (A = blue bubbles on the left, B = ink bubbles on the right)
const say=(top,txt,side,a,b,o={})=>bubble(top,txt,side,Object.assign({tone:side==='l'?'blue':'ink',tail:'down',tailX:120,a,b,at:{fo:0}},o));
say(650,'סליחה, זה שלך?','l',1.6,3.9);
say(820,'לא, שלי זה השני.','r',2.6,3.9);
say(650,'עשיתי קפה. בא לך?','l',4.2,6.8);
say(820,'שחור, בלי סוכר.','r',5.3,6.8);
say(820,'ידעתי.','l',6.0,6.8,{weight:700});
say(650,'נגמר לי החלב.','l',7.1,9.6);
say(820,'יש בשלי.','r',8.1,9.6,{weight:700});
say(820,'קניתי לנו.','r',10.2,END_A,{weight:700});
at($(`left:0;top:1830px;width:1080px;text-align:center;font:500 38px/1.2 R;color:#8C8C8C;white-space:nowrap`,'הדמויות והמצבים בדיוניים'),0.2,END_A,{anim:'none',fo:0});

/* ---------- B: how it started ---------- */
wipe(12.4,'איך זה התחיל?');
wordmark(13.6,DUR);
FEAT.mutual(13.65,16.5);
feat(16.5,18.6,`${hl(380,'קודם מתאימים.')}${hl(510,'אחר כך חלב אחד.',BLUE)}${sub(690,'בלי מתווכים. בחינם.')}`);
endCard(18.6,DUR,'מתחילים ממי שמתאים.');

function render(t){runItems(t);turtleWhite(t,13.65,[13.65,16.5],18.6)}
window.render=render;window.EVENTS=EVENTS;window.SCENES=SCENES;window.DUR=DUR;render(0);
