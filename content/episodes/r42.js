// Reel 42 — red flags #5: "המקרר המסומן" (every item has a name; the whole fridge ends up covered in notes). Standalone episode.
const DUR=21.8;
const SCENES=[['a',0,10.4],['b',10.4,DUR]];
Tt.style.zIndex=50;
const RED='#DC2626';
const END_A=10.95;

bg(INK,0,END_A);
const flagSVG=(w)=>`<svg viewBox="0 0 220 260" width="${w}" height="${w*260/220}" style="overflow:visible"><path d="M40 16 V250" stroke="#fff" stroke-width="14" stroke-linecap="round"/><path d="M48 24 Q100 2 140 26 T210 30 V122 Q166 146 130 122 T48 126 Z" fill="${RED}" stroke="#fff" stroke-width="8" stroke-linejoin="round"/></svg>`;
at($(`left:380px;top:480px;transform-origin:50% 100%`,flagSVG(320)),0.1,1.8,{dy:80,s0:.5,dur:.4,fo:.1,sfx:'pop',up:(l,t,el)=>{el.style.transform+=` rotate(${Math.sin(l*9)*5}deg)`}});
caption(900,['דגל אדום:'],0.3,1.8,{fs:150,sfx:'thud',fo:.1});

at($(`left:60px;top:600px;width:960px;height:920px;border-radius:60px;background:#fff`),1.8,END_A,{anim:'pop',s0:.92,dur:.3,fo:0});
const day=(lines,a,b,o={})=>caption(330,lines,a,b,Object.assign({fs:100,fo:.05},o));
day(['יום ראשון.'],1.8,3.95);
day(['יום שלישי.'],4.0,4.65,{sfx:'pin'});
day(['יום רביעי.'],4.7,5.35,{sfx:'pin'});
day(['יום חמישי.'],5.4,6.05,{sfx:'pin'});
day(['יום שישי.'],6.1,6.75,{sfx:'pin'});
day(['כל המקרר.','עם שם.'],6.8,9.15,{sfx:'dun',cols:['#fff','#8FB1F7']});

// characters
character(`left:50px;top:900px;`,340,1.8,END_A,(l)=>{const t=l+1.8;const k=Math.max(talkAt(l,[0.5,3.8],1.1),talkAt(l,[5.4],1.0));const smug=t>4.2;
  return{hair:'short',shirt:BLUE,brow:smug?'flat':'up',eyes:smug?'closed':'open',look:1,mouth:k>=0?'talk':smug?'smirk':'smile',talk:k}},{fo:0});
character(`left:690px;top:900px;`,340,1.8,END_A,(l)=>{const t=l+1.8;const k=Math.max(talkAt(l,[2.8,4.6],1.2));
  return{hair:'bun',shirt:'#fff',brow:'sus',eyes:t>7.4?'wide':'narrow',look:-1,mouth:k>=0?'talk':'flat',talk:k,sweat:t>6.6}},{fo:0});

// the fridge fills up with name notes
const NT=[[2.4,1],[4.0,3],[4.7,5],[5.4,8],[6.1,12],[6.8,18],[7.4,26]];
NT.forEach(([t])=>ev(t,'pin'));
const nAt=(t)=>{let n=0;for(const [a,c] of NT)if(t>=a)n=c;return n};
const fr=$(`left:405px;top:925px;width:270px;height:375px`);let lastN=-1;
at(fr,1.8,END_A,{anim:'none',fo:0,up:(l,t)=>{const n=nAt(t);if(n===lastN)return;lastN=n;const r=rng(11);let h='';
  for(let i=0;i<n;i++){let x,y,rot;
    if(i<18){x=24+(i%3)*76+(r()-.5)*8;y=32+Math.floor(i/3)*52+(r()-.5)*8;rot=(r()-.5)*14}
    else{x=24+r()*170;y=40+r()*270;rot=(r()-.5)*30}
    h+=`<g transform="translate(${x} ${y}) rotate(${rot} 30 20)"><rect width="62" height="42" rx="6" fill="${i%2?SOFT:'#fff'}" stroke="${BLUE}" stroke-width="4"/><path d="M10 14 H50 M10 28 H38" stroke="${INK}" stroke-width="5" stroke-linecap="round"/></g>`}
  fr.innerHTML=`<svg viewBox="0 0 270 375" width="270" height="375" style="overflow:visible"><rect x="6" y="4" width="258" height="368" rx="30" fill="#fff" stroke="${INK}" stroke-width="8"/><path d="M6 118 H264" stroke="${INK}" stroke-width="6"/><path d="M236 40 V86 M236 150 V230" stroke="${INK}" stroke-width="9" stroke-linecap="round"/>${h}</svg>`}});

at($(`left:60px;top:1300px;width:960px;height:220px;background:#fff;border-top:7px solid ${INK};border-radius:0 0 60px 60px`),1.8,END_A,{anim:'none',fo:0});

bubble(690,'רק פתק על החלב.','l',{tone:'blue',tail:'down',tailX:150,a:2.3,b:5.5,at:{fo:0}});
bubble(850,'זה הקטשופ של מי?','r',{tone:'ink',tail:'down',tailX:150,a:4.5,b:6.4,at:{fo:0}});
bubble(690,'שלי. כתוב.','l',{tone:'blue',tail:'down',tailX:150,a:5.5,b:7.2,at:{fo:0}});
bubble(850,'מי זה גל?','r',{tone:'ink',tail:'down',tailX:150,a:6.4,b:7.9,at:{fo:0}});
bubble(690,'החציל.','l',{tone:'blue',weight:700,tail:'down',tailX:150,a:7.2,b:END_A,at:{fo:0}});
bubble(850,'...זה מקרר, לא ארכיון.','r',{tone:'ink',weight:700,tail:'down',tailX:150,a:7.9,b:END_A,at:{fo:0},fs:52});
caption(1620,['דגל אדום.'],9.25,END_A,{fs:110,c:RED,sfx:'thud',anim:'stamp',fo:0});
at($(`left:0;top:1830px;width:1080px;text-align:center;font:500 38px/1.2 R;color:#8C8C8C;white-space:nowrap`,'הדמויות והמצבים בדיוניים'),1.8,END_A,{anim:'none',fo:0});

/* ---------- the blue flag ---------- */
wipe(10.4,'דגל כחול:');
wordmark(11.5,DUR);
FEAT.matchX(11.55,14.4,['ניקיון','אורחים','שקט']);
feat(14.4,16.2,`${hl(380,'מי אוכל מה?')}${hl(510,'מסכמים מראש.',BLUE,110)}${sub(690,'לא בפתקים.')}`);
FEAT.free(16.2,17.8);
endCard(17.8,DUR);

function render(t){runItems(t);turtleWhite(t,11.55,[11.55,14.4,16.2],17.8)}
window.AUDIO={dur:DUR,seed:42,sections:[[0,10.4,'DET',.12,1,0],[10.4,DUR,'POP',.19,1,1]],ticks:[0,0]};
window.render=render;window.EVENTS=EVENTS;window.SCENES=SCENES;window.DUR=DUR;render(0);
