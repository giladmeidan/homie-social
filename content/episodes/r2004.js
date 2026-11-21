// Turtle squad (personality turtles, homie/brand/mascot/personalities). Self-contained: uses only lib.js primitives.
const PT={"night": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"20 -10 400 320\" width=\"100%\" height=\"100%\" role=\"img\" fill=\"#FFFFFF\" stroke=\"#111111\" stroke-width=\"7\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n\n<ellipse cx=\"204\" cy=\"264\" rx=\"150\" ry=\"9\" fill=\"#111111\" opacity=\"0.08\" stroke=\"none\"/>\n<path d=\"M92 206 Q62 204 56 182 Q78 186 96 196 Z\"/>\n<rect x=\"152\" y=\"216\" width=\"38\" height=\"42\" rx=\"16\" fill=\"#DCDBF3\"/>\n<rect x=\"222\" y=\"216\" width=\"38\" height=\"42\" rx=\"16\" fill=\"#DCDBF3\"/>\n<rect x=\"106\" y=\"210\" width=\"46\" height=\"50\" rx=\"19\"/>\n<path d=\"M118 258 v-8 M129 260 v-9 M140 258 v-8\" stroke-width=\"4\"/>\n<rect x=\"256\" y=\"210\" width=\"46\" height=\"50\" rx=\"19\"/>\n<path d=\"M268 258 v-8 M279 260 v-9 M290 258 v-8\" stroke-width=\"4\"/>\n<ellipse cx=\"318\" cy=\"196\" rx=\"29\" ry=\"20\" transform=\"rotate(-40 318 196)\"/>\n<path d=\"M312 188 Q320 194 322 204 M322 180 Q330 186 332 195\" fill=\"none\" stroke-width=\"3\" opacity=\"0.55\"/>\n<rect x=\"246\" y=\"68\" width=\"24\" height=\"50\" fill=\"#312E81\"/>\n<path d=\"M240 68 H276\"/>\n<path d=\"M96 202 V134 L200 60 L304 134 V202 Z\" fill=\"#312E81\"/>\n<path d=\"M82 140 L200 56 L318 140\" fill=\"none\"/>\n<path d=\"M170 100 q10 10 20 0 q10 10 20 0 q10 10 20 0 M150 120 q10 10 20 0 q10 10 20 0 q10 10 20 0 q10 10 20 0 q10 10 20 0\" fill=\"none\" stroke-width=\"4\" opacity=\"0.5\"/>\n<path d=\"M104 142 H296\" fill=\"none\" stroke-width=\"4\" opacity=\"0.5\"/>\n<path d=\"M128 122 L164 96\" fill=\"none\" stroke=\"#FFFFFF\" stroke-width=\"7\" opacity=\"0.5\"/>\n\n<rect x=\"78\" y=\"194\" width=\"244\" height=\"30\" rx=\"15\"/>\n<path d=\"M128 199 V219 M158 199 V219 M242 199 V219 M272 199 V219\" stroke-width=\"3\" opacity=\"0.45\"/>\n<path d=\"M184 194 V166 a16 16 0 0 1 32 0 V194\" fill=\"#FDE68A\"/>\n<path d=\"M192 190 V168 a8 8 0 0 1 16 0 V190\" fill=\"none\" stroke-width=\"3\" opacity=\"0.4\"/>\n<circle cx=\"208\" cy=\"178\" r=\"2.5\" fill=\"#111111\" stroke=\"none\"/>\n<rect x=\"118\" y=\"152\" width=\"30\" height=\"30\" rx=\"6\" fill=\"#FDE68A\"/>\n<path d=\"M133 152 V182 M118 167 H148\" stroke-width=\"4\"/>\n<rect x=\"252\" y=\"152\" width=\"30\" height=\"30\" rx=\"6\" fill=\"#FDE68A\"/>\n<path d=\"M267 152 V182 M252 167 H282\" stroke-width=\"4\"/>\n<circle cx=\"348\" cy=\"160\" r=\"46\"/>\n<circle cx=\"322\" cy=\"142\" r=\"3.5\" fill=\"#C9D3E6\" stroke=\"none\"/>\n<circle cx=\"334\" cy=\"133\" r=\"3\" fill=\"#C9D3E6\" stroke=\"none\"/>\n<circle cx=\"317\" cy=\"157\" r=\"2.5\" fill=\"#C9D3E6\" stroke=\"none\"/>\n<circle cx=\"388\" cy=\"163\" r=\"1.8\" fill=\"#111111\" stroke=\"none\"/>\n<circle cx=\"338\" cy=\"178\" r=\"9\" fill=\"#C7C4F5\" stroke=\"none\"/>\n<circle cx=\"364\" cy=\"158\" r=\"13\" fill=\"#111111\" stroke=\"none\"/><circle cx=\"368\" cy=\"153\" r=\"4.5\" fill=\"#FFFFFF\" stroke=\"none\"/><circle cx=\"359\" cy=\"163\" r=\"2\" fill=\"#FFFFFF\" stroke=\"none\"/><path d=\"M349 154 Q364 138 379 154 Z\" fill=\"#FFFFFF\" stroke=\"none\"/><path d=\"M349 154 L379 154\" fill=\"none\" stroke-width=\"5\"/><path d=\"M354 176 Q364 180 372 174\" fill=\"none\" stroke-width=\"3\" opacity=\"0.4\"/><path d=\"M366 190 L384 186\" fill=\"none\" stroke-width=\"5\"/>\n<path d=\"M318 150 Q336 96 386 118\" fill=\"none\" stroke-width=\"9\"/><rect x=\"304\" y=\"138\" width=\"24\" height=\"34\" rx=\"10\" fill=\"#111111\"/><path d=\"M92 30 a18 18 0 1 0 16 25 a14 14 0 1 1 -16 -25 Z\" fill=\"#FDE68A\" stroke-width=\"4\"/><path d=\"M150 17 Q150 24 157 24 Q150 24 150 31 Q150 24 143 24 Q150 24 150 17 Z\" fill=\"#FDE68A\" stroke=\"#111111\" stroke-width=\"3\"/><path d=\"M46 70 Q46 76 52 76 Q46 76 46 82 Q46 76 40 76 Q46 76 46 70 Z\" fill=\"#FDE68A\" stroke=\"#111111\" stroke-width=\"3\"/><path d=\"M64 102 Q64 110 72 110 Q64 110 64 118 Q64 110 56 110 Q64 110 64 102 Z\" fill=\"#FDE68A\" stroke=\"#111111\" stroke-width=\"3\"/><rect x=\"290\" y=\"228\" width=\"26\" height=\"28\" rx=\"6\" fill=\"#FFFFFF\" stroke-width=\"5\"/><path d=\"M316 236 q10 0 10 8 q0 8 -10 8\" fill=\"none\" stroke-width=\"4\"/><path d=\"M298 220 q-4 -8 2 -14 M308 220 q-4 -8 2 -14\" fill=\"none\" stroke-width=\"3\" opacity=\"0.5\"/>\n\n</svg>"};
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

// Turtle squad 04 · חיית הלילה — "Night routine של שותף". 23:00 → 01:00 → 03:00 → 03:12 books a viewing without calling anyone.
const DUR=20.0;
const SCENES=[['a',0,10.0],['b',10.0,13.4],['c',13.4,DUR]];
const MOON='#FDE68A';

/* ---------- COVER ---------- */
const COVER_END=0.7;
const r0=rng(44);let stars0='';for(let i=0;i<26;i++){const x=40+r0()*1000,y=60+r0()*1800,s=3+r0()*5;stars0+=`<div style="position:absolute;left:${x}px;top:${y}px;width:${s*2}px;height:${s*2}px;border-radius:50%;background:${MOON};opacity:${.4+r0()*.6}"></div>`}
const cov=$(`left:0;top:0;width:1080px;height:1920px;background:${INK};z-index:60`,`${stars0}
  ${hl(380,ltr('Night routine'),'#fff',128)}${hl(530,'של שותף.',BLUE,128)}
  <div style="position:absolute;left:${540-PT_CX}px;top:${1450-PT_FOOT}px;width:${PT_W}px;height:${PT_H}px">${PT.night}</div>`);
at(cov,0,COVER_END,{anim:'none',fo:0});
window.COVER={t:0.3,title:'Night routine של שותף'};

/* ---------- A · the routine ---------- */
const A0=COVER_END,B0=10.0,S=[0.8,3.0,5.2,7.4];
bg(INK,A0,B0);
const stars=$(`left:0;top:0;width:1080px;height:1920px`,stars0);
at(stars,A0,B0,{anim:'none',fo:0,up:(l,t,el)=>{el.querySelectorAll('div').forEach((d,i)=>{d.style.opacity=.35+.65*Math.abs(Math.sin(t*1.3+i))})}});
footnote(A0,13.4,'#6B6B6B');
const mug=`<svg viewBox="0 0 300 300" width="300" height="300"><path d="M110 70 q-14 -22 4 -40 M150 70 q-14 -22 4 -40" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".6"/><rect x="70" y="90" width="150" height="170" rx="26" fill="#fff" stroke="${INK}" stroke-width="9"/><path d="M220 130 q50 0 50 40 q0 40 -50 40" fill="none" stroke="#fff" stroke-width="16"/><rect x="70" y="90" width="150" height="40" rx="12" fill="#6B4226"/></svg>`;
const pad=`<svg viewBox="0 0 400 260" width="400" height="260"><path d="M60 70 Q40 70 30 120 L10 210 Q5 240 40 240 Q60 240 90 190 L310 190 Q340 240 360 240 Q395 240 390 210 L370 120 Q360 70 340 70 Z" fill="#fff" stroke="${INK}" stroke-width="9" stroke-linejoin="round"/><path d="M90 110 v50 M65 135 h50" stroke="${INK}" stroke-width="12" stroke-linecap="round"/><circle cx="290" cy="115" r="13" fill="${BLUE}"/><circle cx="320" cy="145" r="13" fill="#E64980"/><circle cx="260" cy="145" r="13" fill="#22C55E"/><circle cx="290" cy="175" r="13" fill="${MOON}"/></svg>`;
const fridge=`<svg viewBox="0 0 420 470" width="420" height="470" style="overflow:visible"><path d="M120 20 L-20 -10 L-20 480 L120 450" fill="${MOON}" opacity=".25"/><rect x="120" y="10" width="260" height="450" rx="24" fill="#FFFBEA" stroke="#fff" stroke-width="9"/><path d="M140 160 H360 M140 300 H360" stroke="#ddd" stroke-width="7"/><rect x="160" y="100" width="60" height="56" rx="10" fill="#E64980"/><rect x="240" y="80" width="40" height="76" rx="10" fill="#22C55E"/><circle cx="200" cy="260" r="30" fill="#FACC15"/><rect x="270" y="236" width="70" height="60" rx="8" fill="${BLUE}"/><rect x="170" y="370" width="150" height="70" rx="10" fill="#F08C2E"/></svg>`;
const phone=`<svg viewBox="0 0 300 470" width="300" height="470" style="overflow:visible"><circle cx="150" cy="235" r="230" fill="${BLUE}" opacity=".18"/><rect x="40" y="10" width="220" height="450" rx="36" fill="#fff" stroke="#fff" stroke-width="9"/><rect x="40" y="10" width="220" height="450" rx="36" fill="none" stroke="${INK}" stroke-width="5"/><text x="150" y="90" text-anchor="middle" font-family="R" font-weight="700" font-size="34" fill="${INK}">סיור</text><rect x="70" y="120" width="160" height="56" rx="14" fill="#fff" stroke="${PALE}" stroke-width="5"/><text x="150" y="159" text-anchor="middle" font-family="R" font-weight="700" font-size="30" fill="${MUTED}">17:00</text><rect x="70" y="192" width="160" height="56" rx="14" fill="${BLUE}"/><text x="150" y="231" text-anchor="middle" font-family="R" font-weight="700" font-size="30" fill="#fff">18:30</text><rect x="70" y="264" width="160" height="56" rx="14" fill="#fff" stroke="${PALE}" stroke-width="5"/><text x="150" y="303" text-anchor="middle" font-family="R" font-weight="700" font-size="30" fill="${MUTED}">19:00</text><path d="M118 378 L140 400 L184 350" fill="none" stroke="#22C55E" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const BEATS=[['23:00','קפה שני.',mug,390],['01:00','עוד סיבוב אחד.',pad,340],['03:00','אני והמקרר.',fridge,330],['03:12','קובע סיור לדירה.',phone,390]];
BEATS.forEach(([clk,line,svg,px],i)=>{const a=S[i],b=i<3?S[i+1]:B0;
  at($(`left:0;top:200px;width:1080px;text-align:center;font:700 130px/1 R;color:${MOON};direction:ltr`,`<div class="w">${clk}</div>`),a,b,{anim:'stamp',dur:.22,fo:.06,sfx:'pin'});
  caption(370,[line],a+.2,b,{fs:100,c:'#fff',fo:.06,sfx:'pop'});
  at($(`left:${px}px;top:560px`,svg),a+.35,b,{dy:60,s0:.8,fo:.06,sfx:i===3?'ding':'swish'});});
pt('night',A0,B0,(l,t)=>{const yawn=t>S[2]&&t<S[3];return{x:540,y:1770,s:.95,rot:yawn?Math.sin(t*2)*4:Math.sin(t*1.3)*1.5}});

/* ---------- B · the trick: pick a free slot ---------- */
const M0=B0+.2;
bg('#fff',B0,13.4);
at($(`left:0;top:220px;width:1080px`,pill('הטריק:')),B0,13.4,{dy:-20,s0:.6,fo:.08,sfx:'pin'});
FEAT.tours(M0,13.4);
pt('night',B0,13.4,(l,t)=>({x:540,y:1800-(t>M0+.9&&t<M0+1.3?Math.sin((t-M0-.9)/.4*Math.PI)*50:0),s:.75}));

/* ---------- C · payoff + brand ---------- */
const W0=15.4,E0=W0+1.3;
bg(INK,13.4,W0+.2);
caption(380,['אף אחד לא צריך','לענות לי','בשלוש בלילה.'],13.45,W0,{fs:108,cols:['#fff','#fff',BLUE],sfx:'pop2',fo:.05});
pt('night',13.4,W0,(l,t)=>({x:540,y:1770,s:.95,rot:Math.sin(t*1.3)*2}));
wipe(W0,'לילה טוב.');
wordmark(E0,DUR);
endCard(E0+.1,DUR,'גם בשלוש בלילה.');
pt('night',E0+.3,DUR,(l)=>{const h=hop(l,.7,100);return{x:540,y:1800+h.dy+enter(l,.35),s:.68,sx:h.sq?1.08:1,sy:h.sq?.9:1}},{fo:0});

function render(t){runItems(t)}
window.AUDIO={dur:DUR,seed:2004,sections:[[0,B0,'MIN',.12,0,0],[B0,W0,'FC',.13,1,0],[W0,DUR,'POP',.19,1,1]],ticks:[0.8,B0]};
window.STRETCH=1.12;
window.render=render;window.EVENTS=EVENTS;window.SCENES=SCENES;window.DUR=DUR;render(0);
