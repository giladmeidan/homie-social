// Turtle squad (personality turtles, homie/brand/mascot/personalities). Self-contained: uses only lib.js primitives.
const PT={"chill": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"20 -10 400 320\" width=\"100%\" height=\"100%\" role=\"img\" fill=\"#FFFFFF\" stroke=\"#111111\" stroke-width=\"7\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n\n<ellipse cx=\"204\" cy=\"264\" rx=\"150\" ry=\"9\" fill=\"#111111\" opacity=\"0.08\" stroke=\"none\"/>\n<path d=\"M92 206 Q62 204 56 182 Q78 186 96 196 Z\"/>\n<rect x=\"152\" y=\"216\" width=\"38\" height=\"42\" rx=\"16\" fill=\"#D5EEDD\"/>\n<rect x=\"222\" y=\"216\" width=\"38\" height=\"42\" rx=\"16\" fill=\"#D5EEDD\"/>\n<rect x=\"106\" y=\"210\" width=\"46\" height=\"50\" rx=\"19\"/>\n<path d=\"M118 258 v-8 M129 260 v-9 M140 258 v-8\" stroke-width=\"4\"/>\n<rect x=\"256\" y=\"210\" width=\"46\" height=\"50\" rx=\"19\"/>\n<path d=\"M268 258 v-8 M279 260 v-9 M290 258 v-8\" stroke-width=\"4\"/>\n<ellipse cx=\"318\" cy=\"196\" rx=\"29\" ry=\"20\" transform=\"rotate(-40 318 196)\"/>\n<path d=\"M312 188 Q320 194 322 204 M322 180 Q330 186 332 195\" fill=\"none\" stroke-width=\"3\" opacity=\"0.55\"/>\n<rect x=\"246\" y=\"68\" width=\"24\" height=\"50\" fill=\"#C97B4A\"/>\n<path d=\"M240 68 H276\"/>\n<path d=\"M96 202 V134 L200 60 L304 134 V202 Z\" fill=\"#2F9E6E\"/>\n<path d=\"M82 140 L200 56 L318 140\" fill=\"none\"/>\n<path d=\"M170 100 q10 10 20 0 q10 10 20 0 q10 10 20 0 M150 120 q10 10 20 0 q10 10 20 0 q10 10 20 0 q10 10 20 0 q10 10 20 0\" fill=\"none\" stroke-width=\"4\" opacity=\"0.5\"/>\n<path d=\"M104 142 H296\" fill=\"none\" stroke-width=\"4\" opacity=\"0.5\"/>\n<path d=\"M128 122 L164 96\" fill=\"none\" stroke=\"#FFFFFF\" stroke-width=\"7\" opacity=\"0.5\"/>\n\n<rect x=\"78\" y=\"194\" width=\"244\" height=\"30\" rx=\"15\"/>\n<path d=\"M128 199 V219 M158 199 V219 M242 199 V219 M272 199 V219\" stroke-width=\"3\" opacity=\"0.45\"/>\n<path d=\"M184 194 V166 a16 16 0 0 1 32 0 V194\" fill=\"#FFFFFF\"/>\n<path d=\"M192 190 V168 a8 8 0 0 1 16 0 V190\" fill=\"none\" stroke-width=\"3\" opacity=\"0.4\"/>\n<circle cx=\"208\" cy=\"178\" r=\"2.5\" fill=\"#111111\" stroke=\"none\"/>\n<rect x=\"118\" y=\"152\" width=\"30\" height=\"30\" rx=\"6\" fill=\"#E9F7EF\"/>\n<path d=\"M133 152 V182 M118 167 H148\" stroke-width=\"4\"/>\n<rect x=\"252\" y=\"152\" width=\"30\" height=\"30\" rx=\"6\" fill=\"#E9F7EF\"/>\n<path d=\"M267 152 V182 M252 167 H282\" stroke-width=\"4\"/>\n<circle cx=\"348\" cy=\"160\" r=\"46\"/>\n<circle cx=\"322\" cy=\"142\" r=\"3.5\" fill=\"#C9D3E6\" stroke=\"none\"/>\n<circle cx=\"334\" cy=\"133\" r=\"3\" fill=\"#C9D3E6\" stroke=\"none\"/>\n<circle cx=\"317\" cy=\"157\" r=\"2.5\" fill=\"#C9D3E6\" stroke=\"none\"/>\n<circle cx=\"388\" cy=\"163\" r=\"1.8\" fill=\"#111111\" stroke=\"none\"/>\n<circle cx=\"338\" cy=\"178\" r=\"9\" fill=\"#B8E6CC\" stroke=\"none\"/>\n<path d=\"M306 150 Q322 148 338 150\" fill=\"none\" stroke-width=\"5\"/><rect x=\"338\" y=\"142\" width=\"44\" height=\"24\" rx=\"11\" fill=\"#111111\"/><path d=\"M346 148 L356 148\" stroke=\"#FFFFFF\" stroke-width=\"4\" opacity=\"0.7\"/><path d=\"M360 184 Q372 192 386 180\" fill=\"none\" stroke-width=\"5\"/>\n<path d=\"M258 66 Q252 40 236 30\" fill=\"none\" stroke=\"#1F7A52\" stroke-width=\"5\"/><path d=\"M258 66 Q262 38 282 26\" fill=\"none\" stroke=\"#1F7A52\" stroke-width=\"5\"/><ellipse cx=\"232\" cy=\"30\" rx=\"14\" ry=\"8\" transform=\"rotate(-25 232 30)\" fill=\"#3FB97E\" stroke-width=\"4\"/><ellipse cx=\"286\" cy=\"24\" rx=\"15\" ry=\"8\" transform=\"rotate(20 286 24)\" fill=\"#3FB97E\" stroke-width=\"4\"/><ellipse cx=\"256\" cy=\"38\" rx=\"7\" ry=\"13\" fill=\"#3FB97E\" stroke-width=\"4\"/>\n\n</svg>"};
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

// Turtle squad 01 · הרגוע — "מחפש דירה בלי התקף חרדה". Split screen: everyone panics (black) vs. the chill turtle (white).
const DUR=18.6;
const SCENES=[['a',0,6.6],['b',6.6,13.0],['c',13.0,DUR]];
const MINT='#E9F7EF';

/* ---------- COVER (frame 0) ---------- */
const COVER_END=0.7;
const cov=$(`left:0;top:0;width:1080px;height:1920px;background:${MINT};z-index:60`,`
  ${hl(380,'מחפש דירה',INK,132)}${hl(530,'בלי התקף חרדה.',BLUE,118)}
  <div style="position:absolute;left:${540-PT_CX}px;top:${1420-PT_FOOT}px;width:${PT_W}px;height:${PT_H}px">${PT.chill}</div>`);
at(cov,0,COVER_END,{anim:'none',fo:0});
window.COVER={t:0.3,title:'מחפש דירה בלי התקף חרדה'};

/* ---------- A · split: everyone vs. me ---------- */
const A0=COVER_END,B0=6.6;
bg('#fff',A0,13.0);
at($(`left:0;top:0;width:1080px;height:960px;background:${INK}`),A0,B0,{anim:'none',fo:0});
footnote(A0,14.6);
caption(190,['כולם:'],A0+.05,B0,{fs:96,c:'#fff',sfx:'pop',fo:.08});
const CH=[['עדיין רלוונטי??','r',1.15],['יש עוד 40 שרוצים לראות','l',1.75],['דמי תיווך: חודש שלם','r',2.35],['סליחה, כבר נשכרה.','l',2.95]];
CH.forEach(([txt,side,a],i)=>bubble(340+i*120,txt,side,{a,b:B0,fs:50,tone:i%2?'soft':'white',tail:false,
  at:{fo:.08,up:(l,t,el)=>{el.style.transform+=` translateX(${Math.sin(t*41+i)*5}px)`}}}));
// unread counter racing up
const cnt=$(`left:0;top:850px;width:1080px`);
at(cnt,1.2,B0,{dy:20,fo:.08,up:(l)=>{const n=Math.round(12+235*outCubic(seg(l,0,3.6)));
  cnt.innerHTML=pill(`${ltr(n)} הודעות שלא נקראו`,BLUE)}});
[1.6,2.2,2.8,3.4,4.0].forEach(t=>ev(t,'msg'));ev(4.6,'thud');
caption(1000,['אני:'],A0+.5,B0,{fs:96,c:INK,sfx:'pop',fo:.08});
caption(1120,['משקה את הצמח.'],2.4,B0,{fs:64,c:MUTED,fo:.08});
pt('chill',A0+.5,B0,(l,t)=>({x:540,y:1790+enter(l),s:1.0,rot:Math.sin(t*1.6)*2.5}));

/* ---------- B · the secret ---------- */
const F1=B0+.2,F2=9.9;
at($(`left:0;top:220px;width:1080px`,pill('הסוד שלי:')),B0,13.0,{dy:-20,s0:.6,sfx:'pin'});
FEAT.noBrokers(F1,F2,'רק אנשים פרטיים.');
FEAT.applicants(F2,13.0);
pt('chill',B0,13.0,(l,t)=>{const h=[F1,F2].map(x=>t-x).filter(k=>k>0&&k<.4)[0];
  return{x:540,y:1800-(h!==undefined?Math.sin(h/.4*Math.PI)*50:0),s:.78,rot:Math.sin(t*1.6)*2}});

/* ---------- C · payoff + brand ---------- */
const W0=14.6;
bg('#fff',13.0,W0+.2);
caption(470,['אז למה','שאלחץ?'],13.05,W0,{fs:140,cols:[INK,BLUE],sfx:'pop2',fo:.05});
pt('chill',13.0,W0,(l,t)=>({x:540,y:1790,s:1.0,rot:Math.sin(t*1.2)*3}));
wipe(W0,'נשימה עמוקה.');
const E0=W0+1.3;
wordmark(E0,DUR);
endCard(E0+.1,DUR,'רגועים. בכל הארץ.');
pt('chill',E0+.3,DUR,(l)=>{const h=hop(l,.65,120);return{x:540,y:1800+h.dy+enter(l,.35),s:.68,sx:h.sq?1.08:1,sy:h.sq?.9:1}},{fo:0});

function render(t){runItems(t)}
window.AUDIO={dur:DUR,seed:2001,sections:[[0,B0,'MIN',.12,0,0],[B0,W0,'CG',.14,1,0],[W0,DUR,'POP',.19,1,1]],ticks:[1.2,B0]};
window.STRETCH=1.12;
window.render=render;window.EVENTS=EVENTS;window.SCENES=SCENES;window.DUR=DUR;render(0);
