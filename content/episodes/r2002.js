// Turtle squad (personality turtles, homie/brand/mascot/personalities). Self-contained: uses only lib.js primitives.
const PT={"neat": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"20 -10 400 320\" width=\"100%\" height=\"100%\" role=\"img\" fill=\"#FFFFFF\" stroke=\"#111111\" stroke-width=\"7\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n\n<ellipse cx=\"204\" cy=\"264\" rx=\"150\" ry=\"9\" fill=\"#111111\" opacity=\"0.08\" stroke=\"none\"/>\n<path d=\"M92 206 Q62 204 56 182 Q78 186 96 196 Z\"/>\n<rect x=\"152\" y=\"216\" width=\"38\" height=\"42\" rx=\"16\" fill=\"#DDE4F1\"/>\n<rect x=\"222\" y=\"216\" width=\"38\" height=\"42\" rx=\"16\" fill=\"#DDE4F1\"/>\n<rect x=\"106\" y=\"210\" width=\"46\" height=\"50\" rx=\"19\"/>\n<path d=\"M118 258 v-8 M129 260 v-9 M140 258 v-8\" stroke-width=\"4\"/>\n<rect x=\"256\" y=\"210\" width=\"46\" height=\"50\" rx=\"19\"/>\n<path d=\"M268 258 v-8 M279 260 v-9 M290 258 v-8\" stroke-width=\"4\"/>\n<ellipse cx=\"318\" cy=\"196\" rx=\"29\" ry=\"20\" transform=\"rotate(-40 318 196)\"/>\n<path d=\"M312 188 Q320 194 322 204 M322 180 Q330 186 332 195\" fill=\"none\" stroke-width=\"3\" opacity=\"0.55\"/>\n<rect x=\"246\" y=\"68\" width=\"24\" height=\"50\" fill=\"#2563EB\"/>\n<path d=\"M240 68 H276\"/>\n<path d=\"M96 202 V134 L200 60 L304 134 V202 Z\" fill=\"#2563EB\"/>\n<path d=\"M82 140 L200 56 L318 140\" fill=\"none\"/>\n<path d=\"M170 100 q10 10 20 0 q10 10 20 0 q10 10 20 0 M150 120 q10 10 20 0 q10 10 20 0 q10 10 20 0 q10 10 20 0 q10 10 20 0\" fill=\"none\" stroke-width=\"4\" opacity=\"0.5\"/>\n<path d=\"M104 142 H296\" fill=\"none\" stroke-width=\"4\" opacity=\"0.5\"/>\n<path d=\"M128 122 L164 96\" fill=\"none\" stroke=\"#FFFFFF\" stroke-width=\"7\" opacity=\"0.5\"/>\n\n<rect x=\"78\" y=\"194\" width=\"244\" height=\"30\" rx=\"15\"/>\n<path d=\"M128 199 V219 M158 199 V219 M242 199 V219 M272 199 V219\" stroke-width=\"3\" opacity=\"0.45\"/>\n<path d=\"M184 194 V166 a16 16 0 0 1 32 0 V194\" fill=\"#FFFFFF\"/>\n<path d=\"M192 190 V168 a8 8 0 0 1 16 0 V190\" fill=\"none\" stroke-width=\"3\" opacity=\"0.4\"/>\n<circle cx=\"208\" cy=\"178\" r=\"2.5\" fill=\"#111111\" stroke=\"none\"/>\n<rect x=\"118\" y=\"152\" width=\"30\" height=\"30\" rx=\"6\" fill=\"#EAF1FF\"/>\n<path d=\"M133 152 V182 M118 167 H148\" stroke-width=\"4\"/>\n<rect x=\"252\" y=\"152\" width=\"30\" height=\"30\" rx=\"6\" fill=\"#EAF1FF\"/>\n<path d=\"M267 152 V182 M252 167 H282\" stroke-width=\"4\"/>\n<circle cx=\"348\" cy=\"160\" r=\"46\"/>\n<circle cx=\"322\" cy=\"142\" r=\"3.5\" fill=\"#C9D3E6\" stroke=\"none\"/>\n<circle cx=\"334\" cy=\"133\" r=\"3\" fill=\"#C9D3E6\" stroke=\"none\"/>\n<circle cx=\"317\" cy=\"157\" r=\"2.5\" fill=\"#C9D3E6\" stroke=\"none\"/>\n<circle cx=\"388\" cy=\"163\" r=\"1.8\" fill=\"#111111\" stroke=\"none\"/>\n<circle cx=\"338\" cy=\"178\" r=\"9\" fill=\"#BFD3FA\" stroke=\"none\"/>\n<circle cx=\"362\" cy=\"156\" r=\"13\" fill=\"#111111\" stroke=\"none\"/><circle cx=\"366\" cy=\"151\" r=\"4.5\" fill=\"#FFFFFF\" stroke=\"none\"/><circle cx=\"357\" cy=\"161\" r=\"2\" fill=\"#FFFFFF\" stroke=\"none\"/><circle cx=\"362\" cy=\"156\" r=\"19\" fill=\"none\" stroke-width=\"5\"/><path d=\"M343 152 L314 146\" fill=\"none\" stroke-width=\"4\"/><path d=\"M364 184 Q374 190 384 182\" fill=\"none\" stroke-width=\"5\"/><path d=\"M330 120 Q348 104 372 116\" fill=\"none\" stroke-width=\"5\"/>\n<path d=\"M70 108 Q70 120 82 120 Q70 120 70 132 Q70 120 58 120 Q70 120 70 108 Z\" fill=\"#FFFFFF\" stroke=\"#111111\" stroke-width=\"3\"/><path d=\"M340 83 Q340 92 349 92 Q340 92 340 101 Q340 92 331 92 Q340 92 340 83 Z\" fill=\"#FFFFFF\" stroke=\"#111111\" stroke-width=\"3\"/><path d=\"M150 30 Q150 40 160 40 Q150 40 150 50 Q150 40 140 40 Q150 40 150 30 Z\" fill=\"#FFFFFF\" stroke=\"#111111\" stroke-width=\"3\"/><path d=\"M60 161 Q60 168 67 168 Q60 168 60 175 Q60 168 53 168 Q60 168 60 161 Z\" fill=\"#FFFFFF\" stroke=\"#111111\" stroke-width=\"3\"/>\n<rect x=\"340\" y=\"226\" width=\"22\" height=\"32\" rx=\"6\" fill=\"#8FB1F7\" stroke-width=\"5\"/><path d=\"M344 226 V214 H360 L370 218\" fill=\"#FFFFFF\" stroke-width=\"5\"/><path d=\"M378 210 l7 -4 M380 218 l8 0 M378 226 l7 4\" stroke-width=\"3\" opacity=\"0.6\"/>\n</svg>"};
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

// Turtle squad 02 · המסודר — "GRWM לראיון שותפים". Four prep steps, then the match score, then a happy tear.
const DUR=19.4;
const SCENES=[['a',0,9.2],['b',9.2,14.6],['c',14.6,DUR]];

/* ---------- COVER ---------- */
const COVER_END=0.7;
const spark=(x,y,s,c='#fff')=>`<svg style="position:absolute;left:${x-s}px;top:${y-s}px;overflow:visible" width="${2*s}" height="${2*s}" viewBox="${-s} ${-s} ${2*s} ${2*s}"><path d="M0 ${-s} Q0 0 ${s} 0 Q0 0 0 ${s} Q0 0 ${-s} 0 Q0 0 0 ${-s} Z" fill="${c}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/></svg>`;
const cov=$(`left:0;top:0;width:1080px;height:1920px;background:#fff;z-index:60`,`
  ${hl(360,ltr('GRWM'),INK,150)}${hl(530,'לראיון שותפים.',BLUE,118)}
  <div style="position:absolute;left:${540-PT_CX}px;top:${1430-PT_FOOT}px;width:${PT_W}px;height:${PT_H}px">${PT.neat}</div>
  ${spark(160,900,34)}${spark(930,860,28)}${spark(880,1250,22)}`);
at(cov,0,COVER_END,{anim:'none',fo:0});
window.COVER={t:0.3,title:'GRWM לראיון שותפים'};

/* ---------- A · four steps ---------- */
const A0=COVER_END,B0=9.2,S=[0.8,2.9,5.0,7.1];
bg('#fff',A0,B0+.01);
footnote(A0,14.6);
at($(`left:0;top:200px;width:1080px`,pill(ltr('GRWM'))),A0,B0,{dy:-20,s0:.6,fo:.08});
const TX=540,TY=1720,TS=1.0;
pt('neat',A0,B0,(l,t)=>{const k=t-S[3];const h=k>0?hop(k,.55,45):{dy:0,sq:0};
  return{x:TX,y:TY+h.dy,s:TS,sx:h.sq?1.06:1,sy:h.sq?.92:1,rot:t>S[1]&&t<S[2]?Math.sin(t*20)*1.5:0}});
const steps=[['שלב 1:','מבריק את הגג.'],['שלב 2:','מרסס. ליתר ביטחון.'],['שלב 3:','מדפיס חוקי בית.'],['שלב 4:','מתרגל חיוך.']];
steps.forEach(([a1,a2],i)=>{const a=S[i],b=i<3?S[i+1]:B0;
  caption(330,[a1],a,b,{fs:80,c:MUTED,fo:.08,sfx:'pin'});
  caption(430,[a2],a+.2,b,{fs:108,c:INK,fo:.08,sfx:'pop'});});
// 1 · sparkles pop around the roof
[[230,1000,40],[860,960,34],[330,1180,26],[770,1160,30],[540,840,24]].forEach(([x,y,s],i)=>{
  at($(`left:0;top:0`,spark(x,y,s)),S[0]+.5+i*.2,S[1],{anim:'stamp',dur:.25,fo:.08,sfx:'ding',v:1+i*.08})});
// 2 · spray mist from the bottle nozzle
const [NX,NY]=ptAt(TX,TY,TS,372,214);
for(let i=0;i<9;i++){const d=$(`left:0;top:0;width:34px;height:34px;border-radius:50%;background:${PALE};z-index:25`);
  at(d,S[1]+.4+i*.12,S[2],{anim:'none',fo:.15,up:(l)=>{const k=clamp(l/1.1);d.style.opacity=1-k;
    d.style.transform=`translate(${NX+k*170+((i*37)%50)}px,${NY-k*120-((i*53)%80)}px) scale(${.5+k*1.6})`}})}
[S[1]+.4,S[1]+.8,S[1]+1.2].forEach(t=>ev(t,'swish'));
// 3 · house rules card
const rules=['1. כוס בכיור = עבירה.','2. נעליים בכניסה.','3. מוזיקה? באוזניות.'];
const card=$(`left:150px;top:600px;width:780px;height:560px;background:#fff;border:7px solid ${INK};border-radius:36px;box-shadow:0 18px 0 ${PALE}`,`
  <div class="w" style="position:absolute;left:0;top:44px;width:780px;text-align:center;font:600 72px/1 F;color:${BLUE}">חוקי הבית</div>
  ${rules.map((r,i)=>`<div class="rl w" style="position:absolute;right:60px;top:${170+i*118}px;font:500 58px/1.2 R;color:${INK};opacity:0">${r}</div>`).join('')}`);
at(card,S[2]+.25,S[3],{dy:80,s0:.85,fo:.08,sfx:'swish',up:(l,t,el)=>{el.querySelectorAll('.rl').forEach((r,i)=>{const p=seg(l,.5+i*.4,.25);r.style.opacity=p;r.style.transform=`translateX(${(1-outCubic(p))*-40}px)`})}});
[S[2]+.75,S[2]+1.15,S[2]+1.55].forEach(t=>ev(t,'pin'));
// 4 · smile practice: "10/10"
at($(`left:0;top:760px;width:1080px;text-align:center;font:700 150px/1 R;color:${BLUE};direction:ltr`,'<div class="w">10/10</div>'),S[3]+.5,B0,{anim:'stamp',dur:.3,fo:.08,sfx:'thud'});

/* ---------- B · he arrives: match score, then a tear ---------- */
const M0=B0+.2,T0=12.6;
bg('#fff',B0,14.6);
at($(`left:0;top:220px;width:1080px`,pill('ואז הוא מגיע:')),B0,T0,{dy:-20,s0:.6,fo:.08,sfx:'pin'});
FEAT.matchX(M0,T0,['ניקיון','שקט','חשבונות']);
pt('neat',B0,T0,(l,t)=>({x:540,y:1800-(t>M0&&t<M0+.4?Math.sin((t-M0)/.4*Math.PI)*50:0),s:.75}));
caption(360,['גם הוא','שוטף כלים מיד.'],T0+.05,14.6,{fs:120,cols:[INK,BLUE],sfx:'pop2',fo:.05});
pt('neat',T0,14.6,(l,t)=>({x:540,y:1740,s:1.0,rot:Math.sin(t*3)*1.5}));
const [EX,EY]=ptAt(540,1740,1.0,372,168);
const tear=$(`left:0;top:0;width:30px;height:42px;z-index:30`,`<svg viewBox="0 0 30 42" width="30" height="42"><path d="M15 2 Q2 22 6 32 Q15 44 24 32 Q28 22 15 2Z" fill="#7DD3FC" stroke="${INK}" stroke-width="4"/></svg>`);
at(tear,T0+.6,14.6,{anim:'none',fo:.05,up:(l)=>{const k=(l%1.0);tear.style.opacity=k<.85?1:0;tear.style.transform=`translate(${EX+6}px,${EY+k*k*120}px)`}});
ev(T0+.6,'ding',.8);

/* ---------- C · brand ---------- */
const W0=14.6,E0=W0+1.3;
wipe(W0,'סוף סוף.');
wordmark(E0,DUR);
endCard(E0+.1,DUR,'מסודרים מראש.');
pt('neat',E0+.3,DUR,(l)=>{const h=hop(l,.65,120);return{x:540,y:1800+h.dy+enter(l,.35),s:.68,sx:h.sq?1.08:1,sy:h.sq?.9:1}},{fo:0});

function render(t){runItems(t)}
window.AUDIO={dur:DUR,seed:2002,sections:[[0,B0,'FC',.13,0,0],[B0,W0,'CG',.14,1,0],[W0,DUR,'POP',.19,1,1]],ticks:[0,0]};
window.STRETCH=1.12;
window.render=render;window.EVENTS=EVENTS;window.SCENES=SCENES;window.DUR=DUR;render(0);
