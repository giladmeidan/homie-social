// Reel H21 (1021) — the city · kinetic type, voiced, Comment: "the Friday market list vs. what came home".
// A paper list (tomatoes, bread, eggs) swings in -> a tote fills with flowers, warm hummus, three kinds of olives, halva
// -> "and the tomatoes?" "forgot." -> comment prompt: what always ends up in your bag? 1/2/3/4.
const DUR=13.9;
const SCENES=[['a',0,7.6],['b',7.6,DUR]];
Tt.style.zIndex=50;

/* ---------- timing ---------- */
const COVER_END=0.4,H0=COVER_END,B2=3.2,B3=7.6,ASK=9.4,ASK2=11.3,E0=13.0;
const DROPS=[3.6,4.4,5.2,6.0];   // flowers, hummus, olives, halva

/* ---------- the tote bag, line-drawn. items: which groups are in ----------
   viewBox 600x660; items are drawn first, the bag body (filled with the background) covers their lower part */
function bagSVG(stroke,fill,o={}){
  const it=o.items??4;
  const flowers=`<g class="i0" stroke="${stroke}" stroke-width="7" fill="none" stroke-linecap="round">
    <path d="M250 330 Q236 200 196 92 M262 330 Q262 190 270 58 M276 330 Q300 210 344 106 M258 230 Q228 210 214 176 M270 200 Q300 186 312 160"/>
    ${[[196,92],[270,58],[344,106]].map(([x,y])=>`<g transform="translate(${x} ${y})">${[0,72,144,216,288].map(a=>`<ellipse cx="0" cy="-24" rx="15" ry="24" fill="${BLUE}" stroke="${BLUE}" stroke-width="2" transform="rotate(${a})"/>`).join('')}<circle r="13" fill="${fill}" stroke="${stroke}" stroke-width="5"/></g>`).join('')}</g>`;
  const hummus=`<g class="i1" stroke="${stroke}" stroke-width="7" stroke-linejoin="round" stroke-linecap="round">
    <path d="M420 330 L428 236 L524 236 L532 330 Z" fill="${fill}"/><path d="M414 236 L538 236" stroke-width="9"/>
    <path d="M452 206 q6 -16 0 -30 M478 202 q6 -16 0 -30 M504 206 q6 -16 0 -30" stroke="${BLUE}" stroke-width="6" fill="none"/></g>`;
  const jar=(x,h)=>`<rect x="${x}" y="${330-h}" width="62" height="${h}" rx="12" fill="${fill}" stroke="${stroke}" stroke-width="7"/><rect x="${x+6}" y="${318-h}" width="50" height="18" rx="5" fill="${stroke}"/>
    <circle cx="${x+20}" cy="${348-h+30}" r="9" fill="${stroke}"/><circle cx="${x+40}" cy="${348-h+48}" r="9" fill="${stroke}"/><circle cx="${x+24}" cy="${348-h+66}" r="9" fill="${stroke}"/>`;
  const olives=`<g class="i2">${jar(84,150)}${jar(152,128)}${jar(220,104)}</g>`;
  const halva=`<g class="i3" stroke="${stroke}" stroke-width="7" stroke-linejoin="round"><path d="M330 330 L372 200 L414 330 Z" fill="${fill}"/>
    <path d="M352 270 L392 270 M344 300 L402 300" stroke-width="4" opacity=".6"/></g>`;
  return `<svg viewBox="0 0 600 660" width="${o.w||600}" height="${(o.w||600)*660/600}" style="overflow:visible">
   <path d="M196 300 Q196 170 300 170 Q404 170 404 300" fill="none" stroke="${stroke}" stroke-width="12" stroke-linecap="round"/>
   <g class="items">${[olives,flowers,halva,hummus].slice(0,it).join('')}</g>
   <path d="M70 300 L530 300 L494 640 L106 640 Z" fill="${fill}" stroke="${stroke}" stroke-width="10" stroke-linejoin="round"/>
   <path d="M150 300 L150 340 M450 300 L450 340" stroke="${stroke}" stroke-width="8" stroke-linecap="round"/>
   <circle cx="300" cy="470" r="64" fill="none" stroke="${BLUE}" stroke-width="10"/><path d="M270 470 L292 492 L334 446" stroke="${BLUE}" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`}

/* ---------- the paper list ---------- */
function noteHTML(o={}){const rows=['עגבניות','לחם','ביצים'];
  return `<div style="position:absolute;left:0;top:0;width:560px;height:600px;background:#fff;border-radius:18px;box-shadow:0 18px 40px rgba(0,0,0,.35)">
   <div style="position:absolute;left:250px;top:-22px;width:60px;height:60px;border-radius:50%;background:${BLUE}"></div>
   <div class="w" style="position:absolute;right:56px;top:66px;font:700 46px/1 R;color:${MUTED};direction:rtl">לשוק, שישי:</div>
   <div style="position:absolute;left:56px;right:56px;top:136px;height:4px;background:#E4E7EC"></div>
   ${rows.map((r,i)=>`<div class="r${i}" style="position:absolute;right:56px;top:${190+i*130}px;width:448px;height:100px;direction:rtl">
     <div class="bx" style="position:absolute;right:0;top:14px;width:70px;height:70px;border-radius:14px;border:7px solid ${INK};box-sizing:border-box"></div>
     <div class="w" style="position:absolute;right:104px;top:0;font:600 82px/100px F;color:${INK}">${r}</div></div>`).join('')}
   <div class="ring" style="position:absolute;right:30px;top:178px;width:126px;height:126px;border-radius:50%;border:9px solid ${BLUE};box-sizing:border-box;opacity:0"></div>
  </div>`}

/* ---------- COVER: frame 0 is the cover, fully drawn, held until COVER_END ---------- */
const cov=$(`left:0;top:0;width:1080px;height:1920px;background:${INK};z-index:60`,`
  ${hl(395,'יצאתם לעגבניות.','#fff',112)}${hl(530,'חזרתם עם…',NAMEC,112)}
  <div style="position:absolute;left:240px;top:700px;width:600px">${bagSVG('#fff',INK)}</div>`);
at(cov,0,COVER_END,{anim:'none',fo:0});
window.COVER={t:0.2,title:'יצאתם לעגבניות. חזרתם עם…'};

/* ---------- hook (black): the list swings in ---------- */
bg(INK,0,B2);
caption(250,['אם אתם יוצאים','לשוק עם רשימה…'],H0,B2,{say:'אם אתם יוצאים לשוק עם רשימה…',fs:104,cols:['#fff',NAMEC],fo:.1,sfx:'pop'});
const note1=$(`left:260px;top:720px;width:560px;height:600px;transform-origin:50% 0`,noteHTML());
at(note1,H0,B2,{anim:'none',fo:.12,sfx:'thud',up:(l)=>{
  const drop=outBack(seg(l,0,.35));const sw=Math.sin(l*5.2)*9*Math.exp(-l*0.9)+Math.sin(l*2.1)*1.6;
  note1.style.transform=`translateY(${(1-drop)*-260}px) rotate(${sw}deg)`;
  [0,1,2].forEach(i=>{const r=note1.querySelector('.r'+i);const k=seg(l,.35+i*.4,.22);r.style.opacity=k;r.style.transform=`translateX(${(1-outCubic(k))*-40}px)`})}});
[0,1,2].forEach(i=>ev(H0+.35+i*.4,'swish',.8));

/* ---------- what came home (white): the tote fills ---------- */
bg('#fff',B2,B3);
caption(250,['וחוזרים הביתה עם:'],B2+.05,B3,{say:'וחוזרים עם פרחים, חומוס, זיתים וחלווה.',fs:104,c:INK,fo:.1,sfx:'whoosh'});
const bag=$(`left:240px;top:520px;width:600px;height:660px;transform-origin:50% 0`,bagSVG(INK,'#fff'));
at(bag,B2,B3,{anim:'pop',dy:60,s0:.85,fo:.1,up:(l,t)=>{
  let rot=Math.sin(l*3)*1.2;
  DROPS.forEach((d,i)=>{const k=t-d;if(k>0&&k<1.1)rot+=Math.sin(k*11)*4*Math.exp(-k*3.5);
    const g=bag.querySelector('.i'+i);const e=seg(t,d,.38);g.style.display=e>0?'block':'none';
    g.setAttribute('transform',`translate(0 ${-(1-outCubic(e))*520})`)});
  bag.style.transform=`rotate(${rot}deg)`}});
DROPS.forEach((d,i)=>ev(d+.36,i===0?'pop':'thud',.9));
const LABELS=[['פרחים.',NAMEC],['חומוס חם.',INK],['שלושה סוגי זיתים.',INK],['חלווה. רק לטעום.',BLUE]];
LABELS.forEach(([x,c],i)=>caption(1260,[x],DROPS[i]+.2,i<3?DROPS[i+1]+.2:B3,{say:false,fs:96,c:c===NAMEC?BLUE:c,fo:.08,anim:'up',dy:30}));

/* ---------- the twist (black): and the tomatoes? ---------- */
bg(INK,B3,ASK);
caption(250,['ועגבניות?'],B3+.05,ASK,{say:true,fs:130,c:NAMEC,fo:.1,sfx:'dun'});
const note2=$(`left:260px;top:560px;width:560px;height:600px;transform-origin:50% 0`,noteHTML());
at(note2,B3,ASK,{anim:'pop',dy:50,s0:.9,fo:.1,up:(l)=>{
  note2.style.transform=`rotate(${Math.sin(l*4)*3}deg)`;
  const r=note2.querySelector('.r0');r.style.transform=`translateX(${Math.sin(seg(l,.35,.5)*Math.PI*6)*14}px)`;
  const ring=note2.querySelector('.ring');const k=seg(l,.3,.3);ring.style.opacity=k;ring.style.transform=`scale(${1.3-.3*outBack(k)})`}});
caption(1260,['שכחנו.'],B3+.85,ASK,{say:true,fs:140,c:'#fff',fo:.1,sfx:'boing'});

/* ---------- engagement prompt (Comment) ---------- */
bg('#fff',ASK,E0);
caption(250,['מה תמיד נכנס','לשקית?'],ASK+.05,E0,{say:'מה תמיד נכנס לשקית?',fs:110,cols:[INK,BLUE],fo:.12,sfx:'whoosh'});
const opt=(n,txt)=>`<div style="position:relative;width:760px;height:120px;margin:0 auto;border-radius:60px;border:5px solid ${INK};background:#fff;direction:rtl">
  <div class="w" style="position:absolute;right:16px;top:12px;width:86px;height:86px;border-radius:50%;background:${BLUE};color:#fff;text-align:center;font:700 54px/86px R">${n}</div>
  <div class="w" style="position:absolute;right:130px;top:0;font:700 56px/110px R;color:${INK}">${txt}</div></div>`;
[['1','פרחים'],['2','משהו חם מהדוכן'],['3','עוד זיתים'],['4','רק מה שברשימה']].forEach(([n,x],i)=>{
  at($(`left:0;top:${560+i*148}px;width:1080px`,opt(n,x)),ASK+.45+i*.22,E0,{dy:30,s0:.85,fo:.12,sfx:'pop',v:.7})});
caption(1190,['כתבו מספר','בתגובות.'],ASK2,E0,{say:'כתבו מספר בתגובות.',fs:96,cols:[INK,BLUE],fo:.12,anim:'up',dy:24,sfx:'pop2'});

/* ---------- homie (short) ---------- */
bg('#fff',E0,DUR);
wordmark(E0,DUR);
at($(`left:0;top:760px;width:1080px;text-align:center;font:600 70px/1.1 F;color:${INK}`,'ועגבניות, בפעם הבאה.'),E0+.1,DUR,{anim:'up',dy:30,fo:0});

function render(t){runItems(t);turtleWhite(t,E0+.05,[],E0+.35)}
window.AUDIO={dur:DUR,seed:1021,sections:[[0,B2,'CG',.13,0,1],[B2,B3,'DET',.14,1,1],[B3,ASK,'MIN',.13,1,0],[ASK,DUR,'POP',.17,1,1]],ticks:[0.4,3.2]};
window.STRETCH=1.0;
window.VOICE={duck:0.7};   // narration = the say marks above
window.render=render;window.EVENTS=EVENTS;window.SCENES=SCENES;window.DUR=DUR;render(0);
