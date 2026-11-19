// Reel 26 — red flags ep.2: "כמה חברים" (the guests who keep arriving)
const DUR=21.8;
const SCENES=[['a',0,10.4],['b',10.4,DUR]];
Tt.style.zIndex=50;
const RED='#DC2626';
const END_A=10.95;

/* ---------- A: dark skit ---------- */
bg(INK,0,END_A);
const flagSVG=(w)=>`<svg viewBox="0 0 220 260" width="${w}" height="${w*260/220}" style="overflow:visible"><path d="M40 16 V250" stroke="#fff" stroke-width="14" stroke-linecap="round"/><path d="M48 24 Q100 2 140 26 T210 30 V122 Q166 146 130 122 T48 126 Z" fill="${RED}" stroke="#fff" stroke-width="8" stroke-linejoin="round"/></svg>`;
at($(`left:380px;top:480px;transform-origin:50% 100%`,flagSVG(320)),0.1,1.8,{dy:80,s0:.5,dur:.4,fo:.1,sfx:'pop',up:(l,t,el)=>{el.style.transform+=` rotate(${Math.sin(l*9)*5}deg)`}});
caption(900,['דגל אדום:'],0.3,1.8,{fs:150,sfx:'thud',fo:.1});

// the kitchen panel
at($(`left:60px;top:600px;width:960px;height:920px;border-radius:60px;background:#fff`),1.8,END_A,{anim:'pop',s0:.92,dur:.3,fo:0});

// day captions (top)
const day=(lines,a,b,o={})=>caption(330,lines,a,b,Object.assign({fs:100,fo:.05},o));
day(['יום רביעי. 20:00.'],1.8,5.0);
day(['יום רביעי. 23:40.'],5.0,9.3,{sfx:'dun'});

// the crowd (behind the characters)
const GT=Array.from({length:16},(_,i)=>5.0+i*.2);GT.forEach(t=>ev(t,'pop',1+((t*7)%5)/10));
const crowd=$(`left:0;top:0;width:1080px;height:1920px`);let lastN=-1;
at(crowd,1.8,END_A,{anim:'none',fo:0,up:(l,t)=>{const n=GT.filter(x=>t>=x).length;if(n===lastN)return;lastN=n;const r=rng(11);let h='';
  const rowY=[1250,1140,1030];
  for(let i=0;i<n;i++){const row=i%3,col=Math.floor(i/3);const x=150+col*150+(row%2)*70+(r()-.5)*30,y=rowY[row]+(r()-.5)*20;const v=i%4;
   const hair=v===0?`<path d="M-48 -4 Q-48 -50 0 -50 Q48 -50 48 -4 Q28 -28 0 -26 Q-28 -28 -48 -4Z" fill="${INK}"/>`:v===1?`<circle cx="0" cy="-54" r="20" fill="${INK}"/><path d="M-46 -6 Q-46 -46 0 -46 Q46 -46 46 -6 Q24 -24 0 -22 Q-24 -24 -46 -6Z" fill="${INK}"/>`:v===2?`<path d="M-28 -42 L0 -108 L28 -42Z" fill="${BLUE}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>`:`<path d="M-46 0 Q-50 -46 0 -48 Q50 -46 46 0 Q34 -22 0 -30 Q-34 -22 -46 0Z" fill="${INK}"/>`;
   h+=`<g transform="translate(${x} ${y})"><circle r="52" fill="#fff" stroke="${INK}" stroke-width="6"/>${hair}<circle cx="-18" cy="-2" r="7" fill="${INK}"/><circle cx="18" cy="-2" r="7" fill="${INK}"/><path d="M-16 20 Q0 34 16 20" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"/><circle cx="-34" cy="18" r="9" fill="${BLUSH}"/><circle cx="34" cy="18" r="9" fill="${BLUSH}"/></g>`}
  crowd.innerHTML=`<svg viewBox="0 0 1080 1920" width="1080" height="1920">${h}</svg>`}});

// characters
character(`left:50px;top:900px;`,340,1.8,END_A,(l)=>{const t=l+1.8;const k=Math.max(talkAt(l,[0.4,1.8],1.2),talkAt(l,[6.6],.9));const smug=t>4.2;
  return{hair:'short',shirt:BLUE,brow:smug?'flat':'up',eyes:smug?'closed':'open',look:1,mouth:k>=0?'talk':smug?'smirk':'smile',talk:k}},{fo:0});
character(`left:690px;top:900px;`,340,1.8,END_A,(l)=>{const t=l+1.8;const k=talkAt(l,[1.2,5.8],1.2);
  return{hair:'bun',shirt:'#fff',brow:t>5?'up':'sus',eyes:t>5?'wide':'narrow',look:-1,mouth:k>=0?'talk':t>5?'o':'flat',talk:k,sweat:t>6}},{fo:0});

// counter strip
at($(`left:60px;top:1300px;width:960px;height:220px;background:#fff;border-top:7px solid ${INK};border-radius:0 0 60px 60px`),1.8,END_A,{anim:'none',fo:0});

// speech
bubble(690,'יבואו כמה חברים.','l',{tone:'blue',tail:'down',tailX:150,a:2.2,b:3.6,at:{fo:0}});
bubble(690,'ממש כמה.','l',{tone:'blue',tail:'down',tailX:150,a:3.6,b:5.4,at:{fo:0},sfx:'msg'});
bubble(850,'...כמה?','r',{tone:'ink',tail:'down',tailX:150,a:3.0,b:5.4,at:{fo:0}});
bubble(690,'זה אירוע?','r',{tone:'ink',tail:'down',tailX:150,a:7.6,b:END_A,at:{fo:0}});
bubble(850,'...זה סתם ערב.','l',{tone:'blue',weight:700,tail:'down',tailX:150,a:8.4,b:END_A,at:{fo:0}});
caption(1620,['דגל אדום.'],9.25,END_A,{fs:110,c:RED,sfx:'thud',anim:'stamp',fo:0});
at($(`left:0;top:1830px;width:1080px;text-align:center;font:500 38px/1.2 R;color:#8C8C8C;white-space:nowrap`,'הדמויות והמצבים בדיוניים'),1.8,END_A,{anim:'none',fo:0});

/* ---------- B: the blue flag ---------- */
wipe(10.4,'דגל כחול:');
wordmark(11.5,DUR);
FEAT.matchX(11.55,14.4,['אורחים','שקט','שעות שינה']);
feat(14.4,16.2,`${hl(380,'מי מארח,')}${hl(510,'מי ישן.',BLUE)}${sub(690,'שמים הכול על השולחן.')}`);
FEAT.free(16.2,17.8);
endCard(17.8,DUR);

function render(t){runItems(t);turtleWhite(t,11.55,[11.55,14.4,16.2],17.8)}
window.render=render;window.EVENTS=EVENTS;window.SCENES=SCENES;window.DUR=DUR;render(0);
