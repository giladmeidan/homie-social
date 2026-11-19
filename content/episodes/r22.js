// Reel 22 — "דגל אדום: רק עד מחר" (direction 1: red flags of roommates). One skit, then the blue flag = match score with reasons.
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
day(['יום שני.'],1.8,3.95);
day(['יום שלישי.'],4.0,4.65,{sfx:'pin'});
day(['יום רביעי.'],4.7,5.35,{sfx:'pin'});
day(['יום חמישי.'],5.4,6.05,{sfx:'pin'});
day(['יום שישי.'],6.1,6.75,{sfx:'pin'});
day(['יום שני.','אבל הבא.'],6.8,9.15,{sfx:'dun',cols:['#fff','#8FB1F7']});

// characters
character(`left:50px;top:900px;`,340,1.8,END_A,(l)=>{const t=l+1.8;const k=Math.max(talkAt(l,[0.4,1.8],1.2),talkAt(l,[6.6],.9));const smug=t>4.2;
  return{hair:'short',shirt:BLUE,brow:smug?'flat':'up',eyes:smug?'closed':'open',look:1,mouth:k>=0?'talk':smug?'smirk':'smile',talk:k}},{fo:0});
character(`left:690px;top:900px;`,340,5.0,END_A,(l)=>{const t=l+5.0;const k=talkAt(l,[2.6],1.2);
  return{hair:'bun',shirt:'#fff',brow:'sus',eyes:t>7.4?'wide':'narrow',look:-1,mouth:k>=0?'talk':'flat',talk:k}},{fo:0});

// the mug pile (grows with the days)
const MUGS=[2.1,4.0,4.7,5.4,6.1,6.8,6.95];
MUGS.forEach(t=>ev(t,'thud',1));
const pile=$(`left:390px;top:938px;width:300px;height:400px`);
let lastN=-1;
at(pile,1.8,END_A,{anim:'none',fo:0,up:(l,t)=>{const n=MUGS.filter(x=>t>=x).length;if(n===lastN)return;lastN=n;const r=rng(7);let h='';
  for(let i=0;i<n;i++){const ox=(r()-.5)*54,rot=(r()-.5)*18,y=372-i*42;
   h+=`<g transform="translate(${150+ox} ${y}) rotate(${rot})"><rect x="-52" y="-70" width="104" height="70" rx="16" fill="#fff" stroke="${INK}" stroke-width="7"/><path d="M52 -52 q34 4 0 34" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round"/><rect x="-30" y="-54" width="60" height="10" rx="5" fill="${BLUE}"/></g>`}
  pile.innerHTML=`<svg viewBox="0 0 300 400" width="300" height="400" style="overflow:visible">${h}</svg>`}});

// counter strip
at($(`left:60px;top:1300px;width:960px;height:220px;background:#fff;border-top:7px solid ${INK};border-radius:0 0 60px 60px`),1.8,END_A,{anim:'none',fo:0});

// speech
bubble(690,'אני רק מניח את הכוס.','l',{tone:'blue',tail:'down',tailX:150,a:2.2,b:3.6,at:{fo:0}});
bubble(690,'עד מחר.','l',{tone:'blue',tail:'down',tailX:150,a:3.6,b:5.2,at:{fo:0},sfx:'msg'});
bubble(690,'...זו אותה כוס?','r',{tone:'ink',tail:'down',tailX:150,a:7.6,b:END_A,at:{fo:0}});
bubble(850,'מחר. מבטיח.','l',{tone:'blue',weight:700,tail:'down',tailX:150,a:8.4,b:END_A,at:{fo:0}});
caption(1620,['דגל אדום.'],9.25,END_A,{fs:110,c:RED,sfx:'thud',anim:'stamp',fo:0});
at($(`left:0;top:1830px;width:1080px;text-align:center;font:500 38px/1.2 R;color:#8C8C8C;white-space:nowrap`,'הדמויות והמצבים בדיוניים'),1.8,END_A,{anim:'none',fo:0});

/* ---------- B: the blue flag ---------- */
wipe(10.4,'דגל כחול:');
wordmark(11.5,DUR);
FEAT.matchX(11.55,14.4,['ניקיון','שעות שינה','אורחים']);
feat(14.4,16.2,`${hl(380,'עוד לפני')}${hl(510,'שעוברים לגור יחד.',BLUE)}${sub(690,'לא אחרי.')}`);
FEAT.free(16.2,17.8);
endCard(17.8,DUR);

function render(t){runItems(t);turtleWhite(t,11.55,[11.55,14.4,16.2],17.8)}
window.render=render;window.EVENTS=EVENTS;window.SCENES=SCENES;window.DUR=DUR;render(0);
