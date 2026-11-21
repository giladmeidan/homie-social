// Turtle squad (personality turtles, homie/brand/mascot/personalities). Self-contained: uses only lib.js primitives.
const PT={"matcha": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"20 -10 400 320\" width=\"100%\" height=\"100%\" role=\"img\" fill=\"#FFFFFF\" stroke=\"#111111\" stroke-width=\"7\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n\n<ellipse cx=\"204\" cy=\"264\" rx=\"150\" ry=\"9\" fill=\"#111111\" opacity=\"0.08\" stroke=\"none\"/>\n<path d=\"M92 206 Q62 204 56 182 Q78 186 96 196 Z\"/>\n<rect x=\"152\" y=\"216\" width=\"38\" height=\"42\" rx=\"16\" fill=\"#E3EFCF\"/>\n<rect x=\"222\" y=\"216\" width=\"38\" height=\"42\" rx=\"16\" fill=\"#E3EFCF\"/>\n<rect x=\"106\" y=\"210\" width=\"46\" height=\"50\" rx=\"19\"/>\n<path d=\"M118 258 v-8 M129 260 v-9 M140 258 v-8\" stroke-width=\"4\"/>\n<rect x=\"256\" y=\"210\" width=\"46\" height=\"50\" rx=\"19\"/>\n<path d=\"M268 258 v-8 M279 260 v-9 M290 258 v-8\" stroke-width=\"4\"/>\n<ellipse cx=\"318\" cy=\"196\" rx=\"29\" ry=\"20\" transform=\"rotate(-40 318 196)\"/>\n<path d=\"M312 188 Q320 194 322 204 M322 180 Q330 186 332 195\" fill=\"none\" stroke-width=\"3\" opacity=\"0.55\"/>\n<rect x=\"246\" y=\"68\" width=\"24\" height=\"50\" fill=\"#8DB85A\"/>\n<path d=\"M240 68 H276\"/>\n<path d=\"M96 202 V134 L200 60 L304 134 V202 Z\" fill=\"#8DB85A\"/>\n<path d=\"M82 140 L200 56 L318 140\" fill=\"none\"/>\n<path d=\"M170 100 q10 10 20 0 q10 10 20 0 q10 10 20 0 M150 120 q10 10 20 0 q10 10 20 0 q10 10 20 0 q10 10 20 0 q10 10 20 0\" fill=\"none\" stroke-width=\"4\" opacity=\"0.5\"/>\n<path d=\"M104 142 H296\" fill=\"none\" stroke-width=\"4\" opacity=\"0.5\"/>\n<path d=\"M128 122 L164 96\" fill=\"none\" stroke=\"#FFFFFF\" stroke-width=\"7\" opacity=\"0.5\"/>\n\n<rect x=\"78\" y=\"194\" width=\"244\" height=\"30\" rx=\"15\"/>\n<path d=\"M128 199 V219 M158 199 V219 M242 199 V219 M272 199 V219\" stroke-width=\"3\" opacity=\"0.45\"/>\n<path d=\"M184 194 V166 a16 16 0 0 1 32 0 V194\" fill=\"#FFFFFF\"/>\n<path d=\"M192 190 V168 a8 8 0 0 1 16 0 V190\" fill=\"none\" stroke-width=\"3\" opacity=\"0.4\"/>\n<circle cx=\"208\" cy=\"178\" r=\"2.5\" fill=\"#111111\" stroke=\"none\"/>\n<rect x=\"118\" y=\"152\" width=\"30\" height=\"30\" rx=\"6\" fill=\"#F2F8E6\"/>\n<path d=\"M133 152 V182 M118 167 H148\" stroke-width=\"4\"/>\n<rect x=\"252\" y=\"152\" width=\"30\" height=\"30\" rx=\"6\" fill=\"#F2F8E6\"/>\n<path d=\"M267 152 V182 M252 167 H282\" stroke-width=\"4\"/>\n<circle cx=\"348\" cy=\"160\" r=\"46\"/>\n<circle cx=\"322\" cy=\"142\" r=\"3.5\" fill=\"#C9D3E6\" stroke=\"none\"/>\n<circle cx=\"334\" cy=\"133\" r=\"3\" fill=\"#C9D3E6\" stroke=\"none\"/>\n<circle cx=\"317\" cy=\"157\" r=\"2.5\" fill=\"#C9D3E6\" stroke=\"none\"/>\n<circle cx=\"388\" cy=\"163\" r=\"1.8\" fill=\"#111111\" stroke=\"none\"/>\n<circle cx=\"338\" cy=\"178\" r=\"9\" fill=\"#F9B4C8\" stroke=\"none\"/>\n<path d=\"M350 156 Q362 168 374 156\" fill=\"none\" stroke-width=\"6\"/><path d=\"M352 160 l-6 5 M358 164 l-3 7 M366 164 l2 7\" fill=\"none\" stroke-width=\"3.5\"/><path d=\"M364 184 Q374 190 384 182\" fill=\"none\" stroke-width=\"5\"/>\n<path d=\"M344 112 C326 92 310 108 322 122 C330 128 340 120 344 112 Z\" fill=\"#F9A8C4\" stroke-width=\"5\"/><path d=\"M344 112 C356 88 378 98 370 116 C364 124 352 120 344 112 Z\" fill=\"#F9A8C4\" stroke-width=\"5\"/><path d=\"M340 116 l-10 22 M348 116 l6 22\" fill=\"none\" stroke-width=\"5\"/><circle cx=\"344\" cy=\"113\" r=\"6\" fill=\"#F9A8C4\" stroke-width=\"4\"/><path d=\"M60 96 c-5 -7 -14 -2 -9 5 l9 9 l9 -9 c5 -7 -4 -12 -9 -5 Z\" fill=\"#F9A8C4\" stroke-width=\"3\"/><path d=\"M150 34 c-4 -5 -10 -1 -7 4 l7 7 l7 -7 c3 -5 -3 -9 -7 -4 Z\" fill=\"#8DB85A\" stroke-width=\"3\"/>\n<path d=\"M376 196 L392 160\" fill=\"none\" stroke=\"#111111\" stroke-width=\"9\"/><path d=\"M376 196 L392 160\" fill=\"none\" stroke=\"#F9A8C4\" stroke-width=\"4\"/><path d=\"M338 204 H388 L382 260 H344 Z\" fill=\"#F2F8E6\" stroke-width=\"5\"/><path d=\"M341 228 H385 L382 260 H344 Z\" fill=\"#8DB85A\" stroke=\"none\"/><path d=\"M340 216 H386 L385 228 H341 Z\" fill=\"#FFFFFF\" stroke=\"none\"/><rect x=\"348\" y=\"232\" width=\"9\" height=\"9\" rx=\"2\" fill=\"#FFFFFF\" stroke-width=\"2.5\" opacity=\"0.8\"/><rect x=\"364\" y=\"240\" width=\"9\" height=\"9\" rx=\"2\" fill=\"#FFFFFF\" stroke-width=\"2.5\" opacity=\"0.8\"/><path d=\"M338 204 H388 L382 260 H344 Z\" fill=\"none\" stroke-width=\"5\"/><path d=\"M334 204 H392\" fill=\"none\" stroke-width=\"6\"/>\n</svg>"};
// pt(name,a,b,fn,o): one personality turtle. fn(l,t) -> {x,y,s,rot,sx,sy}; (x,y) = where its feet stand (stage px), s = scale (1 = 640px wide).
const PT_W=640,PT_H=512,PT_FOOT=(272/320)*PT_H,PT_CX=((222-20)/400)*PT_W;
const ptAt=(x,y,s,vx,vy)=>[x+s*((vx-20)/400*PT_W-PT_CX),y+s*((vy+10)/320*PT_H-PT_FOOT)];
function pt(name,a,b,fn,o={}){const outer=$(`left:0;top:0;width:${PT_W}px;height:${PT_H}px;transform-origin:0 0;z-index:${o.z||20}`);
  const inner=$(`left:0;top:0;width:${PT_W}px;height:${PT_H}px;transform-origin:${PT_CX}px ${PT_FOOT}px`,PT[name],outer);
  return at(outer,a,b,Object.assign({anim:'none',fo:.1,up:(l,t)=>{const p=fn(l,t);const s=p.s??1;
    outer.style.transform=`translate(${p.x}px,${p.y}px) scale(${s}) translate(${-PT_CX}px,${-PT_FOOT}px)`;
    inner.style.transform=`rotate(${p.rot||0}deg) scale(${p.sx||1},${p.sy||1})`}},o))}
// a hop: returns y offset (negative = up) and squash for local time l, period per, height h
const hop=(l,per=.6,h=60)=>{const j=(l%per)/per;return{dy:-Math.sin(j*Math.PI)*h,sq:(j<.08||j>.94)?1:0}};
const enter=(l,d=.45)=>(1-outBack(seg(l,0,d)))*500;   // slide-up offset for an entrance
const pill=(txt,bgc=INK,fg='#fff')=>`<div style="display:flex;justify-content:center"><div class="w" style="height:84px;padding:0 40px;border-radius:42px;background:${bgc};color:${fg};font:700 46px/84px R">${txt}</div></div>`;
const ltr=(s)=>`<span style="direction:ltr;unicode-bidi:isolate">${s}</span>`;
function footnote(a,b,c='#8C8C8C'){return at($(`left:0;top:1830px;width:1080px;text-align:center;font:500 38px/1.2 R;color:${c};white-space:nowrap`,'הדמויות והמצבים בדיוניים'),a,b,{anim:'none',fo:0})}
// confetti rain over a time range (party / end moments)
function rain(a,b,seed,cols,n=26,top=0){const r=rng(seed);for(let i=0;i<n;i++){const x=r()*1080,sp=500+r()*600,d0=r()*1.2,w=12+r()*14,h=22+r()*18,rot=r()*720-360,c=cols[i%cols.length];
  const d=$(`left:0;top:0;width:${w}px;height:${h}px;border-radius:4px;background:${c};z-index:5`);
  at(d,a,b,{anim:'none',fo:.2,up:(l)=>{const k=l+d0;const y=top-60+((k*sp)%(1920-top+120));d.style.transform=`translate(${x+Math.sin(k*3+i)*30}px,${y}px) rotate(${rot*k}deg)`}})}}

// Turtle squad 05 · המאצ'ה — "that girl מחפשת שותפה". Perfect morning → the new roommate put regular milk in her matcha → match score.
const DUR=20.4;
const SCENES=[['a',0,8.0],['b',8.0,10.8],['c',10.8,DUR]];
const MATCHA='#F2F8E6',PINK='#F9A8C4';

/* ---------- COVER ---------- */
const COVER_END=0.7;
const heart=(x,y,s,c=PINK)=>`<svg style="position:absolute;left:${x}px;top:${y}px;overflow:visible" width="${s}" height="${s}" viewBox="0 0 44 44"><path d="M22 40 C6 28 0 20 4 11 C8 3 18 3 22 11 C26 3 36 3 40 11 C44 20 38 28 22 40Z" fill="${c}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/></svg>`;
const cov=$(`left:0;top:0;width:1080px;height:1920px;background:${MATCHA};z-index:60`,`
  ${hl(370,ltr('that girl'),INK,150)}${hl(540,'מחפשת שותפה.',BLUE,118)}
  <div style="position:absolute;left:${540-PT_CX}px;top:${1450-PT_FOOT}px;width:${PT_W}px;height:${PT_H}px">${PT.matcha}</div>
  ${heart(170,880,70)}${heart(860,940,56,'#8DB85A')}${heart(900,1180,40)}`);
at(cov,0,COVER_END,{anim:'none',fo:0});
window.COVER={t:0.3,title:'that girl מחפשת שותפה'};

/* ---------- A · the perfect morning ---------- */
const A0=COVER_END,B0=8.0,S=[0.8,2.5,4.2,5.9];
bg(MATCHA,A0,B0);
footnote(A0,15.6);
const mat=`<svg viewBox="0 0 700 120" width="700" height="120"><rect x="10" y="30" width="680" height="60" rx="30" fill="${PINK}" stroke="${INK}" stroke-width="8"/><path d="M600 30 v60" stroke="${INK}" stroke-width="5" opacity=".4"/></svg>`;
const book=`<svg viewBox="0 0 320 260" width="320" height="260"><rect x="30" y="20" width="260" height="220" rx="18" fill="#fff" stroke="${INK}" stroke-width="8"/><rect x="30" y="20" width="44" height="220" rx="12" fill="#8DB85A" stroke="${INK}" stroke-width="8"/><path d="M110 80 h140 M110 120 h120 M110 160 h140 M110 200 h80" stroke="${PALE}" stroke-width="9" stroke-linecap="round"/><path d="M230 196 c-6 -8 -16 -2 -10 6 l10 10 l10 -10 c6 -8 -4 -14 -10 -6Z" fill="${PINK}"/></svg>`;
const phone=`<svg viewBox="0 0 260 400" width="260" height="400" style="overflow:visible"><rect x="20" y="10" width="220" height="380" rx="36" fill="#fff" stroke="${INK}" stroke-width="8"/><circle cx="130" cy="150" r="66" fill="${SOFT}" stroke="${BLUE}" stroke-width="7"/><path d="M130 196 C98 172 88 156 94 140 C100 124 120 124 130 140 C140 124 160 124 166 140 C172 156 162 172 130 196Z" fill="${BLUE}"/><rect x="60" y="260" width="140" height="56" rx="28" fill="${BLUE}"/><text x="130" y="298" text-anchor="middle" font-family="R" font-weight="700" font-size="32" fill="#fff">צ׳אט</text></svg>`;
const BEATS=[['07:00','מאצ׳ה.',null],['07:05','פילאטיס.',`<div style="position:absolute;left:190px;top:1690px">${mat}</div>`],['07:10','ג׳ורנלינג.',`<div style="position:absolute;left:380px;top:640px">${book}</div>`],['07:11','מצאה שותפה.',`<div style="position:absolute;left:410px;top:600px">${phone}</div>`]];
BEATS.forEach(([clk,line,prop],i)=>{const a=S[i],b=i<3?S[i+1]:B0;
  at($(`left:0;top:200px;width:1080px`,pill(ltr(clk),'#fff',INK)),a,b,{anim:'stamp',dur:.22,fo:.06,sfx:'pin'});
  caption(340,[line],a+.15,b,{fs:118,c:i===3?BLUE:INK,fo:.06,sfx:i===3?'ding':'pop'});
  if(prop)at($(`left:0;top:0;width:1080px;height:1920px`,prop),a+.3,b,{anim:'fade',dur:.25,fo:.06,sfx:'swish'});});
[[230,860,70],[790,820,56],[860,1060,44]].forEach(([x,y,s],i)=>at($(`left:0;top:0`,heart(x,y,s)),S[3]+.5+i*.2,B0,{anim:'stamp',dur:.25,fo:.06,sfx:'boing'}));
pt('matcha',A0,B0,(l,t)=>{const k=[0,1,2,3].filter(i=>t>=S[i]).pop()??0;
  if(k===1)return{x:540,y:1740,s:1.0,sy:1+.06*Math.sin((t-S[1])*5),sx:1-.03*Math.sin((t-S[1])*5)};
  if(k===2)return{x:540,y:1740,s:1.0,rot:-3+Math.sin(t*2)*1.5};
  if(k===3){const h=hop(t-S[3],.55,55);return{x:540,y:1740+h.dy,s:1.0,sx:h.sq?1.06:1,sy:h.sq?.92:1}}
  return{x:540,y:1740,s:1.0,rot:Math.sin(t*1.5)*2}});

/* ---------- B · plot twist ---------- */
const C0=10.8;
bg(INK,B0,C0);
ev(B0,'dun');
bubble(400,'שמתי חלב רגיל במאצ׳ה שלך.','r',{a:B0+.35,b:C0,name:'השותפה החדשה',fs:56,at:{fo:.06}});
caption(720,['רגע.','מה?'],B0+1.1,C0,{fs:150,cols:['#fff',BLUE],sfx:'thud',fo:.06});
pt('matcha',B0,C0,(l,t)=>({x:540,y:1760,s:1.0,rot:l>1.1?Math.sin(t*45)*3:0}));

/* ---------- C · next time: match score ---------- */
const M0=C0+.2,Q0=14.0,W0=15.6,E0=W0+1.3;
bg('#fff',C0,W0+.2);
at($(`left:0;top:220px;width:1080px`,pill('בפעם הבאה:')),C0,Q0,{dy:-20,s0:.6,fo:.08,sfx:'pin'});
FEAT.matchX(M0,Q0,['מאצ׳ה','שקט בבוקר','ניקיון']);
pt('matcha',C0,Q0,(l,t)=>({x:540,y:1800-(t>M0&&t<M0+.4?Math.sin((t-M0)/.4*Math.PI)*50:0),s:.75}));
caption(420,['כדי לדעת מראש','על מה מסכימים.'],Q0+.05,W0,{fs:116,cols:[INK,BLUE],sfx:'pop2',fo:.05});
pt('matcha',Q0,W0,(l,t)=>({x:540,y:1760,s:1.0,rot:Math.sin(t*1.5)*2}));
wipe(W0,'בלי הפתעות.');
wordmark(E0,DUR);
endCard(E0+.1,DUR,'שותפות שמבינות מאצ׳ה.');
pt('matcha',E0+.3,DUR,(l)=>{const h=hop(l,.65,110);return{x:540,y:1800+h.dy+enter(l,.35),s:.68,sx:h.sq?1.08:1,sy:h.sq?.9:1}},{fo:0});

function render(t){runItems(t)}
window.AUDIO={dur:DUR,seed:2005,sections:[[0,B0,'FC',.13,0,0],[B0,C0,'DET',.11,1,0],[C0,W0,'CG',.14,1,0],[W0,DUR,'POP',.19,1,1]],ticks:[0,0]};
window.STRETCH=1.12;
window.render=render;window.EVENTS=EVENTS;window.SCENES=SCENES;window.DUR=DUR;render(0);
