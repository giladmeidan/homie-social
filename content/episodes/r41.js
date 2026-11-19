// Reel 41 — red flags #4: "השותף הפנטום" (pays rent, never seen; only traces). Standalone episode.
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
day(['יום שני.'],4.0,4.65,{sfx:'pin'});
day(['יום שלישי.'],4.7,5.35,{sfx:'pin'});
day(['יום רביעי.'],5.4,6.05,{sfx:'pin'});
day(['יום חמישי.'],6.1,6.75,{sfx:'pin'});
day(['שבוע שלם.','בלי שירה.'],6.8,9.15,{sfx:'dun',cols:['#fff','#8FB1F7']});

// characters: A (blue, smug) and B (white, suspicious)
character(`left:50px;top:900px;`,340,1.8,END_A,(l)=>{const t=l+1.8;const k=Math.max(talkAt(l,[0.5],1.3),talkAt(l,[6.6],1.1));const smug=t>4.2;
  return{hair:'short',shirt:BLUE,brow:smug?'flat':'up',eyes:smug?'closed':'open',look:1,mouth:k>=0?'talk':smug?'smirk':'smile',talk:k}},{fo:0});
character(`left:690px;top:900px;`,340,1.8,END_A,(l)=>{const t=l+1.8;const k=talkAt(l,[5.8],1.3);
  return{hair:'bun',shirt:'#fff',brow:'sus',eyes:t>7.2?'wide':'narrow',look:-1,mouth:k>=0?'talk':'flat',talk:k,sweat:t>6.4}},{fo:0});

// the traces of the phantom roommate appear on the counter, one per day
const TR=[4.0,4.7,5.4,6.1];
TR.forEach(t=>ev(t,'thud',1));
const sh=(x,y)=>`<g transform="translate(${x} ${y})"><path d="M-36 0 V-34 Q-36 -46 -24 -46 H-8 Q0 -28 22 -22 Q40 -18 40 -4 V0 Z" fill="#fff" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/><rect x="-38" y="-6" width="80" height="10" rx="5" fill="${BLUE}"/></g>`;
const mg=(x,y)=>`<g transform="translate(${x} ${y}) scale(.6)"><rect x="-52" y="-70" width="104" height="70" rx="16" fill="#fff" stroke="${INK}" stroke-width="8"/><path d="M52 -52 q34 4 0 34" fill="none" stroke="${INK}" stroke-width="8" stroke-linecap="round"/><rect x="-30" y="-54" width="60" height="10" rx="5" fill="${BLUE}"/></g>`;
const um=(x,y)=>`<g transform="translate(${x} ${y})"><path d="M-40 -56 Q0 -112 40 -56 Z" fill="${BLUE}" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/><path d="M0 -56 V-6 Q0 6 -13 4" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round"/></g>`;
const co=(x,y)=>`<g transform="translate(${x} ${y})"><path d="M-28 -92 L-12 -104 H12 L28 -92 L44 -50 L26 -42 V0 H-26 V-42 L-44 -50Z" fill="#fff" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/><path d="M0 -104 V0" stroke="${INK}" stroke-width="4"/></g>`;
const ICONS=[sh,mg,um,co];
const traces=$(`left:390px;top:1010px;width:300px;height:290px`);
let lastN=-1;
at(traces,1.8,END_A,{anim:'none',fo:0,up:(l,t)=>{const n=TR.filter(x=>t>=x).length;if(n===lastN)return;lastN=n;
  traces.innerHTML=`<svg viewBox="0 0 300 290" width="300" height="290" style="overflow:visible">${ICONS.slice(0,n).map((f,i)=>f(45+i*70,288)).join('')}</svg>`}});

// counter strip
at($(`left:60px;top:1300px;width:960px;height:220px;background:#fff;border-top:7px solid ${INK};border-radius:0 0 60px 60px`),1.8,END_A,{anim:'none',fo:0});

bubble(690,'שירה משלמת. נראה אותה מחר.','l',{tone:'blue',tail:'down',tailX:150,a:2.3,b:6.4,at:{fo:0},fs:52});
bubble(850,'...מי גר פה בעצם?','r',{tone:'ink',weight:700,tail:'down',tailX:150,a:7.6,b:END_A,at:{fo:0}});
bubble(690,'היא פה. מרגישים אותה.','l',{tone:'blue',weight:700,tail:'down',tailX:150,a:8.4,b:END_A,at:{fo:0},fs:52});
caption(1620,['דגל אדום.'],9.25,END_A,{fs:110,c:RED,sfx:'thud',anim:'stamp',fo:0});
at($(`left:0;top:1830px;width:1080px;text-align:center;font:500 38px/1.2 R;color:#8C8C8C;white-space:nowrap`,'הדמויות והמצבים בדיוניים'),1.8,END_A,{anim:'none',fo:0});

/* ---------- the blue flag ---------- */
wipe(10.4,'דגל כחול:');
wordmark(11.5,DUR);
FEAT.matchX(11.55,14.4,['שעות שינה','אורחים','שקט']);
feat(14.4,16.2,`${hl(380,'לדעת עם מי')}${hl(510,'גרים.',BLUE)}${sub(690,'לפני החוזה, לא אחריו.')}`);
FEAT.free(16.2,17.8);
endCard(17.8,DUR);

function render(t){runItems(t);turtleWhite(t,11.55,[11.55,14.4,16.2],17.8)}
window.AUDIO={dur:DUR,seed:41,sections:[[0,10.4,'DET',.12,1,0],[10.4,DUR,'POP',.19,1,1]],ticks:[0,0]};
window.render=render;window.EVENTS=EVENTS;window.SCENES=SCENES;window.DUR=DUR;render(0);
