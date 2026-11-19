// Reel 30 — red flags ep.3: "השלט" (16 vs 28 on the AC remote). Standalone episode.
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
day(['יום שלישי.'],1.8,6.4);
day(['השלט אחד.','הדירה אחת.'],6.4,9.2,{sfx:'dun',cols:['#fff','#8FB1F7']});

// the thermostat presses: [time, degrees]
const PR=[[2.2,22],[3.0,16],[3.8,28],[4.4,16],[4.9,28],[5.3,16],[5.6,28],[5.9,16],[6.1,28],[6.3,16],[6.45,28],[6.6,16],[6.75,28]];
for(let t=6.9,v=16;t<9.3;t+=.15,v=v===16?28:16)PR.push([t,v]);
const tempAt=(t)=>{let v=22;for(const [a,d] of PR)if(t>=a)v=d;return v};
PR.slice(1,9).forEach(([a])=>ev(a,'pin'));

// characters: A wants 16 (hot-blooded), B wants 28 (always cold)
character(`left:50px;top:900px;`,340,1.8,END_A,(l)=>{const t=l+1.8;const v=tempAt(t);const k=Math.max(talkAt(l,[0.6],1.3));
  return{hair:'short',shirt:BLUE,brow:v===28?'angry':'flat',eyes:v===28?'narrow':'closed',look:1,mouth:k>=0?'talk':v===28?'wavy':'smirk',talk:k,sweat:v===28&&t>4}},{fo:0});
character(`left:690px;top:900px;`,340,1.8,END_A,(l)=>{const t=l+1.8;const v=tempAt(t);const k=talkAt(l,[1.8],1.3);
  return{hair:'bun',shirt:'#fff',brow:v===16?'sad':'flat',eyes:v===16?'narrow':'closed',look:-1,mouth:k>=0?'talk':v===16?'wavy':'smirk',talk:k,twitch:v===16&&t>4&&Math.floor(t*8)%2===0}},{fo:0});

// the thermostat device on the counter
const dev=$(`left:390px;top:1010px;width:300px;height:290px`);let lastV=-1;
at(dev,1.8,END_A,{anim:'none',fo:0,up:(l,t)=>{const v=tempAt(t);const k=Math.floor(t*10);const key=v+'_'+(t>6.9?k:0);if(key===lastV)return;lastV=key;
  const cold=v===16,hot=v===28;const lbl=cold?'קר':hot?'חם':'נוח';
  dev.innerHTML=`<svg viewBox="0 0 300 290" width="300" height="290" style="overflow:visible"><rect x="20" y="10" width="260" height="270" rx="40" fill="#fff" stroke="${INK}" stroke-width="8"/><rect x="48" y="38" width="204" height="150" rx="22" fill="${cold?SOFT:'#fff'}" stroke="${INK}" stroke-width="5"/>
  <text x="150" y="150" text-anchor="middle" font-family="F" font-weight="600" font-size="108" fill="${cold?BLUE:INK}" direction="ltr">${v}°</text>
  <text x="150" y="226" text-anchor="middle" font-family="R" font-weight="700" font-size="40" fill="${cold?BLUE:INK}">${lbl}</text>
  <circle cx="90" cy="252" r="12" fill="${BLUE}"/><circle cx="210" cy="252" r="12" fill="${INK}"/></svg>`}});

at($(`left:60px;top:1300px;width:960px;height:220px;background:#fff;border-top:7px solid ${INK};border-radius:0 0 60px 60px`),1.8,END_A,{anim:'none',fo:0});

bubble(690,'16. זה בריא.','l',{tone:'blue',tail:'down',tailX:150,a:2.4,b:4.2,at:{fo:0}});
bubble(850,'28. זה חורף.','r',{tone:'ink',tail:'down',tailX:150,a:3.5,b:5.6,at:{fo:0}});
bubble(690,'...מי שינה?','r',{tone:'ink',weight:700,tail:'down',tailX:150,a:7.2,b:END_A,at:{fo:0}});
bubble(850,'לא אני.','l',{tone:'blue',weight:700,tail:'down',tailX:150,a:8.2,b:END_A,at:{fo:0}});
caption(1620,['דגל אדום.'],9.25,END_A,{fs:110,c:RED,sfx:'thud',anim:'stamp',fo:0});
at($(`left:0;top:1830px;width:1080px;text-align:center;font:500 38px/1.2 R;color:#8C8C8C;white-space:nowrap`,'הדמויות והמצבים בדיוניים'),1.8,END_A,{anim:'none',fo:0});

/* ---------- the blue flag ---------- */
wipe(10.4,'דגל כחול:');
wordmark(11.5,DUR);
FEAT.matchX(11.55,14.4,['שעות שינה','שקט','ניקיון']);
feat(14.4,16.2,`${hl(380,'לפני שמתווכחים')}${hl(510,'על המזגן.',BLUE)}${sub(690,'בודקים התאמה.')}`);
FEAT.free(16.2,17.8);
endCard(17.8,DUR);

function render(t){runItems(t);turtleWhite(t,11.55,[11.55,14.4,16.2],17.8)}
window.render=render;window.EVENTS=EVENTS;window.SCENES=SCENES;window.DUR=DUR;render(0);
