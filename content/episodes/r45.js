// Reel 45 — red flags #4: "רק דקה במקלחת" (07:00 -> 07:50). Standalone episode.
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
const day=(lines,a,b,o={})=>caption(330,lines,a,b,Object.assign({fs:110,fo:.05},o));
day(['07:00.'],1.8,4.35);
day(['07:20.'],4.4,6.75,{sfx:'pin'});
day(['07:50.'],6.8,9.15,{sfx:'dun',c:'#8FB1F7'});

// minutes on the clock
const mins=(t)=>t<2.2?0:t<4.4?20*seg(t,2.2,2.2):t<6.8?20:Math.min(50,20+30*seg(t,6.8,1.5));

// the bathroom door (left), steam grows with the minutes; clock in the middle
const door=$(`left:95px;top:925px;width:250px;height:375px`);let lastS=-1;
at(door,1.8,END_A,{anim:'none',fo:0,up:(l,t)=>{const s=Math.floor(mins(t)/5);if(s===lastS)return;lastS=s;
  const cl=[[60,70,34],[120,40,40],[180,76,36],[90,16,30],[150,6,30],[40,30,26],[200,30,26],[125,-24,34],[70,-30,28],[180,-18,30]].slice(0,Math.min(10,s));
  door.innerHTML=`<svg viewBox="0 0 250 375" width="250" height="375" style="overflow:visible"><rect x="10" y="70" width="230" height="300" rx="16" fill="#fff" stroke="${INK}" stroke-width="8"/><rect x="40" y="100" width="170" height="90" rx="10" fill="${SOFT}" stroke="${INK}" stroke-width="5"/><circle cx="205" cy="250" r="10" fill="${BLUE}"/>${cl.map(([x,y,r])=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${SOFT}" stroke="${PALE}" stroke-width="5"/>`).join('')}</svg>`}});
const clock=$(`left:420px;top:960px;width:200px;height:200px`);
at(clock,1.8,END_A,{anim:'none',fo:0,up:(l,t)=>{const m=mins(t);const a=m*6,h=(7*30+m*.5);
  clock.innerHTML=`<svg viewBox="0 0 200 200" width="200" height="200"><circle cx="100" cy="100" r="92" fill="#fff" stroke="${INK}" stroke-width="8"/>${[0,90,180,270].map(r=>`<path d="M100 14 V28" stroke="${INK}" stroke-width="6" stroke-linecap="round" transform="rotate(${r} 100 100)"/>`).join('')}<path d="M100 100 V54" stroke="${INK}" stroke-width="9" stroke-linecap="round" transform="rotate(${h} 100 100)"/><path d="M100 100 V30" stroke="${BLUE}" stroke-width="7" stroke-linecap="round" transform="rotate(${a} 100 100)"/><circle cx="100" cy="100" r="9" fill="${INK}"/></svg>`}});
[2.2,4.4,6.8].forEach(t=>ev(t,'pin'));

// B waits outside with a towel
at($(`left:735px;top:1195px;width:250px;height:105px;border-radius:24px;background:#fff;border:7px solid ${INK}`,`<div style="position:absolute;left:0;top:34px;width:236px;height:14px;background:${BLUE}"></div>`),1.8,END_A,{anim:'none',fo:0});
character(`left:690px;top:900px;`,340,1.8,END_A,(l)=>{const t=l+1.8;const k=talkAt(l,[1.6,3.8],1.1);const late=t>6.8;
  return{hair:'bun',shirt:'#fff',brow:late?'angry':'sus',eyes:late?'wide':'narrow',look:-1,mouth:k>=0?'talk':late?'frown':'flat',talk:k,sweat:t>5}},{fo:0});
at($(`left:60px;top:1300px;width:960px;height:220px;background:#fff;border-top:7px solid ${INK};border-radius:0 0 60px 60px`),1.8,END_A,{anim:'none',fo:0});

bubble(690,'רק דקה במקלחת.','l',{tone:'blue',tail:'down',tailX:150,a:2.3,b:4.8,at:{fo:0}});
bubble(850,'דקה, נכון?','r',{tone:'ink',tail:'down',tailX:150,a:3.4,b:5.8,at:{fo:0}});
bubble(690,'כמעט סיימתי.','l',{tone:'blue',tail:'down',tailX:150,a:4.8,b:7.2,at:{fo:0}});
bubble(850,'המגבת שלי כבר יבשה.','r',{tone:'ink',tail:'down',tailX:150,a:5.8,b:END_A,at:{fo:0},fs:52});
bubble(690,'אני לא יוצא עד שהמים נגמרים.','l',{tone:'blue',weight:700,tail:'down',tailX:150,a:7.2,b:END_A,at:{fo:0},fs:50});
caption(1620,['דגל אדום.'],9.25,END_A,{fs:110,c:RED,sfx:'thud',anim:'stamp',fo:0});
at($(`left:0;top:1830px;width:1080px;text-align:center;font:500 38px/1.2 R;color:#8C8C8C;white-space:nowrap`,'הדמויות והמצבים בדיוניים'),1.8,END_A,{anim:'none',fo:0});

/* ---------- the blue flag ---------- */
wipe(10.4,'דגל כחול:');
wordmark(11.5,DUR);
FEAT.matchX(11.55,14.4,['שעות שינה','ניקיון','תקציב']);
feat(14.4,16.2,`${hl(380,'מי מתעורר מתי?')}${hl(510,'שואלים לפני.',BLUE)}${sub(690,'לא מול הדלת.')}`);
FEAT.free(16.2,17.8);
endCard(17.8,DUR);

function render(t){runItems(t);turtleWhite(t,11.55,[11.55,14.4,16.2],17.8)}
window.AUDIO={dur:DUR,seed:45,sections:[[0,10.4,'DET',.12,1,0],[10.4,DUR,'POP',.19,1,1]],ticks:[0,0]};
window.render=render;window.EVENTS=EVENTS;window.SCENES=SCENES;window.DUR=DUR;render(0);
