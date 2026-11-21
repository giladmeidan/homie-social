// Turtle squad (personality turtles, homie/brand/mascot/personalities). Self-contained: uses only lib.js primitives.
const PT={"party": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"20 -10 400 320\" width=\"100%\" height=\"100%\" role=\"img\" fill=\"#FFFFFF\" stroke=\"#111111\" stroke-width=\"7\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n\n<ellipse cx=\"204\" cy=\"264\" rx=\"150\" ry=\"9\" fill=\"#111111\" opacity=\"0.08\" stroke=\"none\"/>\n<path d=\"M92 206 Q62 204 56 182 Q78 186 96 196 Z\"/>\n<rect x=\"152\" y=\"216\" width=\"38\" height=\"42\" rx=\"16\" fill=\"#F9DCE7\"/>\n<rect x=\"222\" y=\"216\" width=\"38\" height=\"42\" rx=\"16\" fill=\"#F9DCE7\"/>\n<rect x=\"106\" y=\"210\" width=\"46\" height=\"50\" rx=\"19\"/>\n<path d=\"M118 258 v-8 M129 260 v-9 M140 258 v-8\" stroke-width=\"4\"/>\n<rect x=\"256\" y=\"210\" width=\"46\" height=\"50\" rx=\"19\"/>\n<path d=\"M268 258 v-8 M279 260 v-9 M290 258 v-8\" stroke-width=\"4\"/>\n<ellipse cx=\"318\" cy=\"196\" rx=\"29\" ry=\"20\" transform=\"rotate(-40 318 196)\"/>\n<path d=\"M312 188 Q320 194 322 204 M322 180 Q330 186 332 195\" fill=\"none\" stroke-width=\"3\" opacity=\"0.55\"/>\n<rect x=\"246\" y=\"68\" width=\"24\" height=\"50\" fill=\"#E64980\"/>\n<path d=\"M240 68 H276\"/>\n<path d=\"M96 202 V134 L200 60 L304 134 V202 Z\" fill=\"#E64980\"/>\n<path d=\"M82 140 L200 56 L318 140\" fill=\"none\"/>\n<path d=\"M170 100 q10 10 20 0 q10 10 20 0 q10 10 20 0 M150 120 q10 10 20 0 q10 10 20 0 q10 10 20 0 q10 10 20 0 q10 10 20 0\" fill=\"none\" stroke-width=\"4\" opacity=\"0.5\"/>\n<path d=\"M104 142 H296\" fill=\"none\" stroke-width=\"4\" opacity=\"0.5\"/>\n<path d=\"M128 122 L164 96\" fill=\"none\" stroke=\"#FFFFFF\" stroke-width=\"7\" opacity=\"0.5\"/>\n\n<rect x=\"78\" y=\"194\" width=\"244\" height=\"30\" rx=\"15\"/>\n<path d=\"M128 199 V219 M158 199 V219 M242 199 V219 M272 199 V219\" stroke-width=\"3\" opacity=\"0.45\"/>\n<path d=\"M184 194 V166 a16 16 0 0 1 32 0 V194\" fill=\"#FFFFFF\"/>\n<path d=\"M192 190 V168 a8 8 0 0 1 16 0 V190\" fill=\"none\" stroke-width=\"3\" opacity=\"0.4\"/>\n<circle cx=\"208\" cy=\"178\" r=\"2.5\" fill=\"#111111\" stroke=\"none\"/>\n<rect x=\"118\" y=\"152\" width=\"30\" height=\"30\" rx=\"6\" fill=\"#FFF3B0\"/>\n<path d=\"M133 152 V182 M118 167 H148\" stroke-width=\"4\"/>\n<rect x=\"252\" y=\"152\" width=\"30\" height=\"30\" rx=\"6\" fill=\"#FFF3B0\"/>\n<path d=\"M267 152 V182 M252 167 H282\" stroke-width=\"4\"/>\n<circle cx=\"348\" cy=\"160\" r=\"46\"/>\n<circle cx=\"322\" cy=\"142\" r=\"3.5\" fill=\"#C9D3E6\" stroke=\"none\"/>\n<circle cx=\"334\" cy=\"133\" r=\"3\" fill=\"#C9D3E6\" stroke=\"none\"/>\n<circle cx=\"317\" cy=\"157\" r=\"2.5\" fill=\"#C9D3E6\" stroke=\"none\"/>\n<circle cx=\"388\" cy=\"163\" r=\"1.8\" fill=\"#111111\" stroke=\"none\"/>\n<circle cx=\"338\" cy=\"178\" r=\"9\" fill=\"#FBC2D8\" stroke=\"none\"/>\n<path d=\"M350 158 Q362 144 374 158\" fill=\"none\" stroke-width=\"6\"/><path d=\"M352 176 Q370 210 390 174 Z\" fill=\"#111111\" stroke-width=\"5\"/><ellipse cx=\"372\" cy=\"192\" rx=\"8\" ry=\"5\" fill=\"#F472B6\" stroke=\"none\"/>\n<path d=\"M326 124 L346 58 L374 118 Z\" fill=\"#FACC15\" stroke-width=\"6\"/><path d=\"M333 102 L362 92 M338 84 L354 79\" fill=\"none\" stroke=\"#E64980\" stroke-width=\"5\"/><circle cx=\"346\" cy=\"54\" r=\"9\" fill=\"#2563EB\" stroke-width=\"5\"/><circle cx=\"110\" cy=\"120\" r=\"6\" fill=\"#FACC15\" stroke-width=\"3\"/><circle cx=\"140\" cy=\"98\" r=\"6\" fill=\"#22C55E\" stroke-width=\"3\"/><circle cx=\"170\" cy=\"77\" r=\"6\" fill=\"#2563EB\" stroke-width=\"3\"/><circle cx=\"230\" cy=\"77\" r=\"6\" fill=\"#FACC15\" stroke-width=\"3\"/><circle cx=\"260\" cy=\"98\" r=\"6\" fill=\"#22C55E\" stroke-width=\"3\"/><circle cx=\"290\" cy=\"120\" r=\"6\" fill=\"#2563EB\" stroke-width=\"3\"/><rect x=\"60\" y=\"70\" width=\"9\" height=\"5\" rx=\"2\" transform=\"rotate(30 60 70)\" fill=\"#FACC15\" stroke=\"none\"/><rect x=\"120\" y=\"30\" width=\"9\" height=\"5\" rx=\"2\" transform=\"rotate(-20 120 30)\" fill=\"#22C55E\" stroke=\"none\"/><rect x=\"300\" y=\"20\" width=\"9\" height=\"5\" rx=\"2\" transform=\"rotate(45 300 20)\" fill=\"#2563EB\" stroke=\"none\"/><rect x=\"390\" y=\"70\" width=\"9\" height=\"5\" rx=\"2\" transform=\"rotate(-35 390 70)\" fill=\"#FACC15\" stroke=\"none\"/><rect x=\"40\" y=\"150\" width=\"9\" height=\"5\" rx=\"2\" transform=\"rotate(60 40 150)\" fill=\"#E64980\" stroke=\"none\"/><rect x=\"170\" y=\"20\" width=\"9\" height=\"5\" rx=\"2\" transform=\"rotate(10 170 20)\" fill=\"#E64980\" stroke=\"none\"/><rect x=\"410\" y=\"120\" width=\"9\" height=\"5\" rx=\"2\" transform=\"rotate(20 410 120)\" fill=\"#22C55E\" stroke=\"none\"/><rect x=\"330\" y=\"50\" width=\"9\" height=\"5\" rx=\"2\" transform=\"rotate(-60 330 50)\" fill=\"#E64980\" stroke=\"none\"/>\n\n</svg>"};
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

// Turtle squad 03 · המסיבות — "אם הסלון שלך לא נראה ככה בחמישי, אנחנו לא מתאימים." Countdown → party → mutual like.
const DUR=19.0;
const SCENES=[['a',0,7.6],['b',7.6,13.6],['c',13.6,DUR]];
const PARTY=['#FACC15','#22C55E',BLUE,'#E64980','#fff'];

/* ---------- COVER ---------- */
const COVER_END=0.7;
const r0=rng(33);let conf0='';for(let i=0;i<22;i++){const x=80+r0()*920,y=760+r0()*900;if(y>1150&&y<1500&&x>230&&x<850)continue;
  conf0+=`<div style="position:absolute;left:${x}px;top:${y}px;width:22px;height:12px;border-radius:3px;background:${PARTY[i%4]};transform:rotate(${r0()*180}deg)"></div>`}
const cov=$(`left:0;top:0;width:1080px;height:1920px;background:${INK};z-index:60`,`${conf0}
  ${hl(380,'הסלון שלי',`#fff`,132)}${hl(530,'בחמישי.',BLUE,132)}
  <div style="position:absolute;left:${540-PT_CX}px;top:${1460-PT_FOOT}px;width:${PT_W}px;height:${PT_H}px">${PT.party}</div>`);
at(cov,0,COVER_END,{anim:'none',fo:0});
window.COVER={t:0.3,title:'הסלון שלי בחמישי'};

/* ---------- A · countdown, then party ---------- */
const A0=COVER_END,P0=2.3,B0=7.6;
bg(INK,A0,B0);
footnote(A0,13.6,'#6B6B6B');
['3','2','1'].forEach((n,i)=>at($(`left:0;top:620px;width:1080px;text-align:center;font:700 420px/1 R;color:${i===2?BLUE:'#fff'}`,`<div class="w">${n}</div>`),.8+i*.5,1.3+i*.5,{anim:'stamp',dur:.2,fo:.05,sfx:'ding',v:1+i*.15}));
ev(P0,'boing');ev(P0+.05,'pop2');
// garland of bulbs flashing on the beat
const bulbs=[...Array(11)].map((_,i)=>{const x=60+i*96,y=170+Math.sin(i/10*Math.PI)*70;return `<div class="bl" style="position:absolute;left:${x}px;top:${y}px;width:46px;height:46px;border-radius:50%;border:6px solid ${INK};outline:4px solid #333"></div>`}).join('');
const gar=$(`left:0;top:0;width:1080px;height:340px`,`<svg width="1080" height="340" style="position:absolute;left:0;top:0"><path d="M40 170 Q540 330 1040 170" fill="none" stroke="#555" stroke-width="5"/></svg>${bulbs}`);
at(gar,P0,B0,{anim:'none',fo:.08,up:(l,t,el)=>{const b=Math.floor(l/.3);el.querySelectorAll('.bl').forEach((d,i)=>{d.style.background=PARTY[(i+b)%PARTY.length]})}});
rain(P0,B0,7,PARTY,30,300);
caption(400,['אם הסלון שלך','לא נראה ככה בחמישי,'],P0+.2,5.3,{fs:92,c:'#fff',fo:.08,sfx:'pop'});
caption(400,['אנחנו','לא מתאימים.'],5.3,B0,{fs:130,cols:['#fff',BLUE],fo:.08,sfx:'thud'});
pt('party',A0,B0,(l,t)=>{if(t<P0)return{x:540,y:1740,s:1.0};const h=hop(t-P0,.6,70);
  return{x:540,y:1740+h.dy,s:1.0,sx:h.sq?1.07:1,sy:h.sq?.9:1,rot:Math.sin((t-P0)/.6*Math.PI)*5}});

/* ---------- B · seriously: mutual like ---------- */
const M0=B0+.3,Q0=11.0;
bg('#fff',B0,13.6+.2);
at($(`left:0;top:220px;width:1080px`,pill('ועכשיו ברצינות:')),B0,Q0,{dy:-20,s0:.6,fo:.08,sfx:'pin'});
FEAT.mutual(M0,Q0);
caption(330,['מוצאים מישהו','שבא לחגוג.','לא מישהו','שבא להתלונן.'],Q0+.05,13.6,{fs:104,cols:[INK,BLUE,INK,MUTED],sfx:'pop2',fo:.05});
pt('party',B0,13.6,(l,t)=>{const h=hop(l,.6,30);return{x:540,y:1790+h.dy,s:.78}});

/* ---------- C · brand ---------- */
const W0=13.6,E0=W0+1.3;
wipe(W0,'מי בא?');
wordmark(E0,DUR);
endCard(E0+.1,DUR,'שותפים לחמישי.');
pt('party',E0+.3,DUR,(l)=>{const h=hop(l,.6,130);return{x:540,y:1800+h.dy+enter(l,.35),s:.68,sx:h.sq?1.08:1,sy:h.sq?.9:1,rot:Math.sin(l/.6*Math.PI)*5}},{fo:0});

function render(t){runItems(t)}
window.AUDIO={dur:DUR,seed:2003,sections:[[0,P0,'DET',.12,1,0],[P0,B0,'POP',.2,1,1],[B0,W0,'CG',.14,1,0],[W0,DUR,'POP',.19,1,1]],ticks:[0.8,P0]};
window.STRETCH=1.12;
window.render=render;window.EVENTS=EVENTS;window.SCENES=SCENES;window.DUR=DUR;render(0);
