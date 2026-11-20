// Shared engine for story reels 19–20: timeline items, characters, chat bubbles, features, end card, turtle.
const INK='#111111',BLUE='#2563EB',SOFT='#EAF1FF',BL2='#1E40AF',MUTED='#57534E',PALE='#C9D9FA',BLUSH='#BFD3FA',DARK2='#232323',NAMEC='#8FB1F7';
const stage=document.getElementById('stage');
const $=(css,html='',p=stage)=>{const d=document.createElement('div');d.style.cssText='position:absolute;'+css;d.innerHTML=html;p.appendChild(d);d.dataset.d=d.style.display||'block';return d};
const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
const seg=(t,a,d)=>clamp((t-a)/d);
const outCubic=x=>1-Math.pow(1-x,3);
const outBack=x=>{const c1=1.70158,c3=c1+1;return 1+c3*Math.pow(x-1,3)+c1*Math.pow(x-1,2)};
const inOut=x=>x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;
const show=(el,on)=>{el.style.display=on?(el.dataset.d||'block'):'none'};
function rng(s){return()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const EVENTS=[];const ev=(t,k,v=1)=>EVENTS.push({t,k,v});

/* ---------- timeline items ---------- */
const ITEMS=[];
/* voiceover: any item with o.say is read aloud by voice.py when the episode sets window.VOICE.
   say:true reads the element's own text; say:'...' reads that text (e.g. a number spelled out). */
const SAY=[];window.SAY=SAY;const _txt=(h)=>String(h).replace(/<[^>]*>/g,' ').replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim();
function at(el,a,b,o={}){const it=Object.assign({anim:'pop',dur:.32,dy:40,s0:.7,fo:.15},o,{el,a,b});ITEMS.push(it);if(o.sfx)ev(a,o.sfx,o.v||1);
  if(o.say){const txt=o.say===true?_txt(el.innerHTML):_txt(o.say);if(txt)SAY.push([a,b,txt])}
  el.style.display='none';return el}
function runItems(t){for(const it of ITEMS){const on=t>=it.a&&t<it.b;show(it.el,on);if(!on)continue;const l=t-it.a;const p=seg(l,0,it.dur);
  const e=it.anim==='fade'?outCubic(p):outBack(p);const f=it.fo>0?1-seg(t,it.b-it.fo,it.fo):1;let tr='';
  if(it.anim==='pop')tr=`translateY(${(1-e)*it.dy}px) scale(${it.s0+(1-it.s0)*e})`;
  else if(it.anim==='up')tr=`translateY(${(1-e)*it.dy}px)`;
  else if(it.anim==='stamp')tr=`scale(${1+(1-e)*.6})`;
  if(it.rot)tr+=` rotate(${it.rot}deg)`;
  it.el.style.opacity=(it.anim==='none'?1:clamp(p*3))*f;it.el.style.transform=tr;if(it.up)it.up(l,t,it.el)}}
const bg=(color,a,b)=>at($(`left:0;top:0;width:1080px;height:1920px;background:${color}`),a,b,{anim:'none',fo:0});

/* ---------- text ---------- */
const hl=(top,txt,c=INK,fs=124)=>`<div class="w" style="position:absolute;left:0;width:1080px;top:${top}px;text-align:center;font:600 ${fs}px/1.05 F;color:${c}">${txt}</div>`;
const sub=(top,txt,c=MUTED)=>`<div class="w" style="position:absolute;left:0;width:1080px;top:${top}px;text-align:center;font:500 60px/1.1 R;color:${c}">${txt}</div>`;
function caption(top,lines,a,b,o={}){const el=$(`left:0;top:${top}px;width:1080px;text-align:center;font:600 ${o.fs||110}px/1.12 F;color:${o.c||'#fff'}`,lines.map((l,i)=>`<div class="w" style="color:${(o.cols&&o.cols[i])||o.c||'#fff'}">${l}</div>`).join(''));return at(el,a,b,Object.assign({dy:40,sfx:o.sfx},o))}

/* ---------- chat bubble ----------
   side: 'r' | 'l' | 'c'. name: optional sender label. tone: 'white'|'blue'|'ink'|'soft'. tail: 'down'|'side'|null */
function bubble(top,text,side,o={}){const tone=o.tone||'white';
  const bgc={white:'#fff',blue:BLUE,ink:INK,soft:SOFT}[tone],fg={white:INK,blue:'#fff',ink:'#fff',soft:INK}[tone];
  const nameC=tone==='white'||tone==='soft'?BLUE:NAMEC;
  const jc={r:'flex-end',l:'flex-start',c:'center'}[side];
  const tailX=o.tailX??70;
  const tail=o.tail==='down'?`<div style="position:absolute;width:40px;height:40px;background:${bgc};transform:rotate(45deg);bottom:-16px;${side==='l'?'left':'right'}:${tailX}px;border-radius:6px"></div>`
            :o.tail===null||o.tail===false?'':`<div style="position:absolute;width:34px;height:34px;background:${bgc};transform:rotate(45deg);top:30px;${side==='l'?'left':'right'}:-10px;border-radius:5px"></div>`;
  const ticks=o.ticks?`<svg width="54" height="30" viewBox="0 0 54 30" style="display:inline-block;margin-right:14px;vertical-align:middle"><path d="M4 16 L12 24 L26 8 M22 20 L26 24 L42 8" stroke="${o.ticksC||'#9CA3AF'}" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`:'';
  const html=`<div style="position:relative;direction:rtl;background:${bgc};color:${fg};border-radius:44px;padding:${o.name?'20px':'26px'} 44px 26px;max-width:960px;${o.border?`border:5px solid ${INK};`:''}">
    ${o.name?`<div class="w" style="font:700 38px/1.2 R;color:${nameC};margin-bottom:6px">${o.name}</div>`:''}
    <div class="w" style="font:${o.weight||500} ${o.fs||58}px/1.2 R">${text}${ticks}</div>${tail}</div>`;
  const el=$(`left:0;top:${top}px;width:1080px;padding:0 ${o.pad??60}px;display:flex;justify-content:${jc};direction:ltr;transform-origin:${side==='l'?'15%':side==='r'?'85%':'50%'} 50%`,html);
  return at(el,o.a,o.b,Object.assign({dy:30,s0:.55,sfx:o.sfx??'msg'},o.at||{}))}

/* ---------- characters (flat line style like the turtle: white fill, ink stroke) ---------- */
function charSVG(o){const w=o.w||300;const lk=(o.look||0)*9,lu=(o.lookY||0)*7;const sh=o.shirt||BLUE;let back='',hair='';
  switch(o.hair){
   case 'short':hair=`<path d="M58 150 Q52 52 150 50 Q248 52 242 150 Q228 104 186 98 Q150 118 104 100 Q70 112 58 150Z" fill="${INK}"/>`;break;
   case 'curly':hair=[[72,122,30],[98,84,34],[142,66,36],[190,70,34],[226,98,32],[238,136,24],[64,152,20]].map(([x,y,r])=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${INK}"/>`).join('');break;
   case 'long':back=`<path d="M50 150 Q48 48 150 46 Q252 48 250 150 L266 318 Q150 336 34 318Z" fill="${INK}"/>`;hair=`<path d="M58 150 Q60 56 150 54 Q240 56 242 150 Q206 90 150 94 Q98 90 58 150Z" fill="${INK}"/>`;break;
   case 'bun':hair=`<circle cx="150" cy="38" r="34" fill="${INK}"/><path d="M58 146 Q56 58 150 56 Q244 58 242 146 Q222 96 150 94 Q78 96 58 146Z" fill="${INK}"/>`;break;
   case 'bald':hair=`<path d="M57 168 Q54 122 76 100 Q74 132 82 156Z M243 168 Q246 122 224 100 Q226 132 218 156Z" fill="${INK}"/>`;break;
   case 'side':hair=`<path d="M58 152 Q50 50 160 50 Q250 56 244 146 Q236 110 210 96 Q140 104 96 92 Q70 110 58 152Z" fill="${INK}"/>`;break;}
  const E=(cx,cy)=>{switch(o.eyes||'open'){
   case 'wide':return `<circle cx="${cx}" cy="${cy}" r="21" fill="#fff" stroke="${INK}" stroke-width="6"/><circle cx="${cx+lk*.9}" cy="${cy+lu}" r="9" fill="${INK}"/>`;
   case 'narrow':return `<circle cx="${cx+lk}" cy="${cy+4}" r="11" fill="${INK}"/><rect x="${cx-24}" y="${cy-26}" width="48" height="26" fill="#fff"/><path d="M${cx-19} ${cy} H${cx+19}" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>`;
   case 'closed':return `<path d="M${cx-15} ${cy+4} Q${cx} ${cy-12} ${cx+15} ${cy+4}" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>`;
   case 'shut':return `<path d="M${cx-15} ${cy} H${cx+15}" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>`;
   case 'roll':return `<circle cx="${cx}" cy="${cy}" r="21" fill="#fff" stroke="${INK}" stroke-width="6"/><circle cx="${cx+3}" cy="${cy-11}" r="8" fill="${INK}"/>`;
   default:return `<circle cx="${cx+lk}" cy="${cy+lu}" r="12" fill="${INK}"/><circle cx="${cx+lk+4}" cy="${cy+lu-4}" r="4" fill="#fff"/>`;}};
  const BR={flat:[[92,122,132,122],[168,122,208,122]],up:[[92,110,132,102],[168,102,208,110]],angry:[[92,112,134,130],[166,130,208,112]],
    sus:[[92,118,134,132],[168,104,208,112]],sad:[[92,130,132,114],[168,114,208,130]]}[o.brow||'flat'];
  const brows=BR.map(([a,b,c,d])=>`<path d="M${a} ${b} L${c} ${d}" stroke="${INK}" stroke-width="8" stroke-linecap="round"/>`).join('');
  const tk=o.talk??0;
  const M={smile:`<path d="M120 204 Q150 232 180 204" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>`,
    grin:`<path d="M110 198 Q150 254 190 198 Z" fill="${INK}" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/><path d="M128 218 Q150 236 172 218" fill="none" stroke="${BLUSH}" stroke-width="7" stroke-linecap="round"/>`,
    flat:`<path d="M128 214 H172" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>`,
    o:`<ellipse cx="150" cy="218" rx="13" ry="17" fill="${INK}"/>`,
    frown:`<path d="M124 224 Q150 200 176 224" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>`,
    smirk:`<path d="M124 214 Q160 224 182 200" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>`,
    wavy:`<path d="M120 216 q8 -8 15 0 q8 8 15 0 q8 -8 15 0 q8 8 15 0" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>`,
    talk:`<ellipse cx="150" cy="214" rx="${18-4*tk}" ry="${4+14*tk}" fill="${INK}"/>`}[o.mouth||'smile'];
  const glasses=o.glasses?`<circle cx="112" cy="160" r="28" fill="none" stroke="${INK}" stroke-width="6"/><circle cx="188" cy="160" r="28" fill="none" stroke="${INK}" stroke-width="6"/><path d="M140 158 H160 M84 156 L58 148 M216 156 L242 148" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>`:'';
  const blush=o.blush===false?'':`<circle cx="92" cy="194" r="13" fill="${BLUSH}"/><circle cx="208" cy="194" r="13" fill="${BLUSH}"/>`;
  const sweat=o.sweat?`<path d="M252 92 Q266 116 260 126 Q252 136 244 126 Q238 116 252 92Z" fill="${PALE}" stroke="${INK}" stroke-width="5"/>`:'';
  const twitch=o.twitch?`<path d="M216 140 l14 -10 M220 160 l18 0 M216 178 l14 10" stroke="${BLUE}" stroke-width="6" stroke-linecap="round"/>`:'';
  const hearts=o.hearts?[[70,70],[232,58]].map(([x,y])=>`<path transform="translate(${x} ${y}) scale(1.4)" d="M0 6 C0 -2 10 -2 10 5 C10 -2 20 -2 20 6 C20 13 10 18 10 20 C10 18 0 13 0 6Z" fill="${BLUE}"/>`).join(''):'';
  return `<svg viewBox="0 0 300 380" width="${w}" height="${w*380/300}" style="overflow:visible;display:block">${back}
   <path d="M30 382 Q34 262 150 258 Q266 262 270 382Z" fill="${sh}" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>
   <circle cx="58" cy="168" r="17" fill="#fff" stroke="${INK}" stroke-width="7"/><circle cx="242" cy="168" r="17" fill="#fff" stroke="${INK}" stroke-width="7"/>
   <circle cx="150" cy="158" r="96" fill="#fff" stroke="${INK}" stroke-width="7"/>${hair}${blush}${brows}${E(112,160)}${E(188,160)}${glasses}${M}${sweat}${twitch}${hearts}</svg>`}
// A character on screen whose look is a function of local time: fn(l,t) -> options
function character(css,w,a,b,fn,o={}){const el=$(css);let last='';
  return at(el,a,b,Object.assign({dy:60,s0:.8,up:(l,t)=>{const s=charSVG(Object.assign({w},fn(l,t)));if(s!==last){el.innerHTML=s;last=s}}},o))}
const talkAt=(l,starts,len=1.0)=>{for(const s of starts){const k=l-s;if(k>=0&&k<len)return .5+.5*Math.sin(k*28)}return -1};

/* ---------- turtle (real brand SVGs, never flipped or recoloured) ---------- */
const Tt=$('left:0;top:0;width:400px;height:300px;transform-origin:0 0;');Tt.style.display='none';
const poseEl={};for(const k of Object.keys(TURTLES))poseEl[k]=$('left:0;top:0;width:400px;height:300px;',TURTLES[k],Tt);
let curPose='';
function turtle(o){if(!o){show(Tt,false);return}show(Tt,true);const sx=o.sx??1,sy=o.sy??1;
  Tt.style.transform=`translate(${o.x}px,${o.y}px) scale(${o.s*sx},${o.s*sy}) translate(-204px,-262px) rotate(${o.rot??0}deg)`;
  if(o.pose!==curPose){for(const k in poseEl)poseEl[k].style.display=k===o.pose?'block':'none';curPose=o.pose}}

/* ---------- brand scenes ---------- */
function wipe(t0,label){
  const c1=$(`left:440px;top:860px;width:200px;height:200px;border-radius:50%;background:${BLUE}`);
  at(c1,t0,t0+1.3,{anim:'none',fo:0,sfx:'whoosh',up:(l)=>{c1.style.transform=`scale(${12*inOut(seg(l,0,.55))})`}});
  if(label)caption(820,[label],t0+.25,t0+1.05,{fs:124,sfx:'pop'});
  const c2=$(`left:440px;top:1400px;width:200px;height:200px;border-radius:50%;background:#fff`);
  at(c2,t0+.7,t0+1.6,{anim:'none',fo:0,sfx:'whoosh2',up:(l)=>{c2.style.transform=`scale(${17*inOut(seg(l,0,.5))})`}});
  return t0+1.2}
function wordmark(a,b){const m=$(`left:0;top:215px;width:1080px;display:flex;justify-content:center;`,WORDMARK);m.querySelector('svg').style.cssText='width:300px;height:auto;display:block';return at(m,a,b,{dy:-30,s0:.6,dur:.4,fo:0})}
const person=(cx,cy,r,fill)=>`<circle cx="${cx}" cy="${cy-r*.9}" r="${r*.55}" fill="${fill}"/><path d="M${cx-r} ${cy+r*.9} Q${cx-r} ${cy-r*.05} ${cx} ${cy-r*.05} Q${cx+r} ${cy-r*.05} ${cx+r} ${cy+r*.9} Z" fill="${fill}"/>`;
const FEAT={};
function feat(a,b,html,up){const el=$('left:0;top:380px;width:1080px;height:900px;',html);ev(a,'pop2');return at(el,a,b,{dy:90,s0:.92,dur:.4,up:up?(l)=>up(l,el):null})}
FEAT.noBrokers=(a,b,line2='רק אנשים פרטיים.')=>feat(a,b,`
<div style="position:absolute;left:375px;top:0;width:330px;height:330px"><svg viewBox="0 0 360 360" width="330" height="330" style="overflow:visible">
<circle cx="180" cy="180" r="160" fill="#fff" stroke="${INK}" stroke-width="8"/>${person(180,200,86,INK)}<path d="M180 204 L168 224 L180 264 L192 224 Z" fill="#fff"/>
<circle class="ring" cx="180" cy="180" r="172" fill="none" stroke="${BLUE}" stroke-width="22" stroke-dasharray="1081" stroke-dashoffset="1081" transform="rotate(-90 180 180)"/>
<line class="slash" x1="70" y1="70" x2="290" y2="290" stroke="${BLUE}" stroke-width="26" stroke-linecap="round" stroke-dasharray="312" stroke-dashoffset="312"/></svg></div>
${hl(370,'בלי מתווכים.')}${sub(540,line2)}`,(l,el)=>{el.querySelector('.ring').setAttribute('stroke-dashoffset',1081*(1-outCubic(seg(l,.25,.35))));el.querySelector('.slash').setAttribute('stroke-dashoffset',312*(1-outCubic(seg(l,.5,.3))))});
FEAT.match=(a,b)=>{const chip=(txt)=>`<div class="chip w" style="height:84px;padding:0 30px 0 34px;border-radius:42px;background:#fff;border:3px solid ${BLUE};color:${BL2};font:700 44px/78px R;display:flex;align-items:center;gap:14px;opacity:0"><svg width="34" height="34" viewBox="0 0 34 34"><path d="M6 18 L14 26 L28 9" stroke="${BLUE}" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>${txt}</div>`;
 [0.55,0.75,0.95].forEach(d=>ev(a+d,'ding',1+d*0.2));
 return feat(a,b,`<div style="position:absolute;left:400px;top:0;width:280px;height:280px"><svg viewBox="0 0 300 300" width="280" height="280"><circle cx="150" cy="150" r="120" fill="#fff" stroke="${PALE}" stroke-width="30"/>
<circle class="ring" cx="150" cy="150" r="120" fill="none" stroke="${BLUE}" stroke-width="30" stroke-linecap="round" stroke-dasharray="754" stroke-dashoffset="754" transform="rotate(-90 150 150)"/>
<path class="chk" d="M104 152 L138 186 L200 116" stroke="${BLUE}" stroke-width="26" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="160" stroke-dashoffset="160"/></svg></div>
<div style="position:absolute;left:0;top:310px;width:1080px;display:flex;justify-content:center;gap:22px">${chip('תקציב')}${chip('אזור')}${chip('תאריך כניסה')}</div>
${hl(430,'ציון התאמה')}${hl(560,'עם הסיבות.',BLUE)}`,(l,el)=>{el.querySelector('.ring').setAttribute('stroke-dashoffset',754*(1-.92*outCubic(seg(l,.1,.55))));
  el.querySelector('.chk').setAttribute('stroke-dashoffset',160*(1-outCubic(seg(l,.5,.25))));
  [...el.querySelectorAll('.chip')].forEach((c,i)=>{const p=seg(l,.55+i*.2,.28),e=outBack(p);c.style.opacity=clamp(p*3);c.style.transform=`translateY(${(1-e)*40}px) scale(${.6+.4*e})`})})};
FEAT.tours=(a,b)=>{const times=['10:00','12:30','17:00','18:30','19:00','20:00'];ev(a+.9,'ding',1.2);
 const cells=times.map((tm,i)=>`<div class="slot w" style="width:190px;height:96px;border-radius:24px;border:4px solid ${i===3?BLUE:PALE};color:${i===3?BL2:MUTED};font:700 44px/88px R;text-align:center;direction:ltr">${tm}</div>`).join('');
 return feat(a,b,`<div style="position:absolute;left:225px;top:20px;width:630px;display:flex;flex-wrap:wrap;gap:30px 30px;justify-content:center">${cells}</div>
 ${hl(370,'סיור? בוחרים שעה.')}${sub(540,'מתוך השעות הפנויות.')}`,(l,el)=>{const s=el.querySelectorAll('.slot')[3];const k=seg(l,.9,.15);s.style.background=k>0?BLUE:'#fff';s.style.color=k>0?'#fff':BL2;s.style.transform=`scale(${1+Math.sin(seg(l,.9,.3)*Math.PI)*.12})`})};
FEAT.applicants=(a,b)=>{[0.5,0.7,0.9,1.1].forEach(d=>ev(a+d,'ding',0.9+d*0.3));
 return feat(a,b,`<div style="position:absolute;left:150px;top:30px;width:780px;height:240px"><svg viewBox="0 0 780 240" width="780" height="240">${[0,1,2,3,4].map(i=>`<g class="p${i}">${person(650-i*130,140,52,PALE)}</g>`).join('')}</svg></div>
${hl(340,'רואים כמה')}${hl(470,'כבר הגישו.',BLUE)}${sub(640,'בלי לנחש.')}`,(l,el)=>{for(let i=0;i<5;i++){const g=el.querySelector('.p'+i);const on=i<4&&l>=.5+i*.2;g.querySelectorAll('circle,path').forEach(n=>n.setAttribute('fill',on?BLUE:PALE));const e=outBack(seg(l,.5+i*.2,.25));g.setAttribute('transform',on?`translate(0,${-(Math.sin(e*Math.PI))*14})`:'')}})};
FEAT.mutual=(a,b)=>{ev(a+.75,'ding',1.1);ev(a+1.0,'pop');
 const heart=(c)=>`<path d="M0 12 C0 -4 22 -4 22 10 C22 -4 44 -4 44 12 C44 28 22 38 22 42 C22 38 0 28 0 12Z" fill="${c}"/>`;
 return feat(a,b,`<div style="position:absolute;left:190px;top:0;width:700px;height:320px"><svg viewBox="0 0 700 320" width="700" height="320" style="overflow:visible">
  <g transform="translate(560 0)"><circle cx="0" cy="160" r="96" fill="#fff" stroke="${INK}" stroke-width="8"/>${person(0,180,52,INK)}</g>
  <g transform="translate(140 0)"><circle cx="0" cy="160" r="96" fill="#fff" stroke="${INK}" stroke-width="8"/>${person(0,180,52,INK)}</g>
  <g class="hR" transform="translate(470 110)">${heart(BLUE)}</g><g class="hL" transform="translate(186 110)">${heart(BLUE)}</g>
  <g class="chat" opacity="0"><rect x="270" y="110" width="160" height="104" rx="34" fill="${BLUE}"/><path d="M300 210 L292 242 L326 212Z" fill="${BLUE}"/><circle cx="315" cy="162" r="10" fill="#fff"/><circle cx="350" cy="162" r="10" fill="#fff"/><circle cx="385" cy="162" r="10" fill="#fff"/></g></svg></div>
  ${hl(370,'לייק הדדי')}${hl(500,'פותח צ׳אט.',BLUE)}${sub(670,'בשוק השותפים.')}`,(l,el)=>{const k=inOut(seg(l,.3,.45));
   el.querySelector('.hR').setAttribute('transform',`translate(${470-k*144} ${110}) scale(${1-.2*seg(l,.75,.1)})`);el.querySelector('.hL').setAttribute('transform',`translate(${186+k*144} ${110}) scale(${1-.2*seg(l,.75,.1)})`);
   const c=seg(l,.8,.2);el.querySelector('.hR').setAttribute('opacity',1-c);el.querySelector('.hL').setAttribute('opacity',1-c);const ch=el.querySelector('.chat');ch.setAttribute('opacity',c);ch.setAttribute('transform',`translate(350 162) scale(${.4+.6*outBack(c)}) translate(-350 -162)`)})};
FEAT.free=(a,b)=>feat(a,b,`<div style="position:absolute;left:390px;top:10px;width:300px;height:300px;border-radius:50%;background:${BLUE};color:#fff;text-align:center;font:700 130px/300px R;direction:ltr;unicode-bidi:isolate">₪0</div>${hl(370,'וחינם.')}${sub(540,'לשני הצדדים.')}`);
function endCard(a,b,tag='בכל הארץ'){const el=$('left:0;top:360px;width:1080px;height:900px;',`${hl(0,'הצטרפו',BLUE,150)}${hl(165,'לרשימת ההמתנה.',INK,108)}
 <div style="position:absolute;left:190px;top:390px;width:700px;height:130px;border-radius:65px;background:${INK};color:#fff;font:700 54px/130px R;text-align:center">הקישור בביו</div>${sub(580,tag)}`);
 ev(a,'pop2');ev(a+.5,'ding',1.3);ev(a+.15,'boing');ev(a+.75,'boing');
 const conf=[];const rc=rng(5);for(let i=0;i<12;i++){const c=[INK,BLUE,BLUSH,'#9DBBFF'][i%4];const d=$(`left:0;top:0;width:${14+rc()*14}px;height:${24+rc()*20}px;border-radius:4px;background:${c}`);conf.push({d,a:rc()*Math.PI-Math.PI,v:380+rc()*520,spin:rc()*900-450});at(d,a+.1,a+1.7,{anim:'none',fo:0})}
 at(el,a,b,{anim:'up',dy:70,dur:.4,fo:0,up:(l)=>{conf.forEach(c=>{const k=l-.1;const x=540+Math.cos(c.a)*c.v*k*.9,y=1330+Math.sin(c.a)*c.v*k+.5*900*k*k*.6;c.d.style.opacity=1-seg(k,1.1,.5);c.d.style.transform=`translate(${x}px,${y}px) rotate(${c.spin*k}deg)`})}})}
// turtle at the bottom of the white scenes: hops on feature changes, celebrates at the end card
function turtleWhite(t,t0,hops,tEnd){if(t<t0){turtle(null);return}const enter=seg(t,t0,.55);let y=1745+(1-outBack(enter))*700;
  hops.forEach(h=>{const l=t-h-.05;if(l>0&&l<.4)y-=Math.sin(l/.4*Math.PI)*55});let sx=1,sy=1,pose='hello';
  if(t>=tEnd&&t<tEnd+1.3){const j=((t-tEnd)%.65)/.65;y-=Math.sin(j*Math.PI)*190;if(j<.1||j>.92){sy=.88;sx=1.1}pose='celebrate'}
  turtle({x:540,y,s:2.3,pose,sx,sy,rot:pose==='hello'?Math.sin(t*9)*1.2:0})}

/* ---------- extra features for reels 22-25 ---------- */
FEAT.matchX=(a,b,chips,l1='ציון התאמה',l2='עם הסיבות.')=>{const chip=(txt)=>`<div class="chip w" style="height:84px;padding:0 30px 0 34px;border-radius:42px;background:#fff;border:3px solid ${BLUE};color:${BL2};font:700 44px/78px R;display:flex;align-items:center;gap:14px;opacity:0"><svg width="34" height="34" viewBox="0 0 34 34"><path d="M6 18 L14 26 L28 9" stroke="${BLUE}" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>${txt}</div>`;
 [0.55,0.75,0.95].forEach(d=>ev(a+d,'ding',1+d*0.2));
 return feat(a,b,`<div style="position:absolute;left:400px;top:0;width:280px;height:280px"><svg viewBox="0 0 300 300" width="280" height="280"><circle cx="150" cy="150" r="120" fill="#fff" stroke="${PALE}" stroke-width="30"/>
<circle class="ring" cx="150" cy="150" r="120" fill="none" stroke="${BLUE}" stroke-width="30" stroke-linecap="round" stroke-dasharray="754" stroke-dashoffset="754" transform="rotate(-90 150 150)"/>
<path class="chk" d="M104 152 L138 186 L200 116" stroke="${BLUE}" stroke-width="26" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="160" stroke-dashoffset="160"/></svg></div>
<div style="position:absolute;left:0;top:310px;width:1080px;display:flex;justify-content:center;gap:22px">${chips.map(chip).join('')}</div>
${hl(430,l1)}${hl(560,l2,BLUE)}`,(l,el)=>{el.querySelector('.ring').setAttribute('stroke-dashoffset',754*(1-.92*outCubic(seg(l,.1,.55))));
  el.querySelector('.chk').setAttribute('stroke-dashoffset',160*(1-outCubic(seg(l,.5,.25))));
  [...el.querySelectorAll('.chip')].forEach((c,i)=>{const p=seg(l,.55+i*.2,.28),e=outBack(p);c.style.opacity=clamp(p*3);c.style.transform=`translateY(${(1-e)*40}px) scale(${.6+.4*e})`})})};
FEAT.expire=(a,b)=>{[0.9,1.1].forEach(d=>ev(a+d,'ding',1+d*0.15));
 return feat(a,b,`<div style="position:absolute;left:400px;top:0;width:280px;height:280px"><svg viewBox="0 0 300 300" width="280" height="280"><circle cx="150" cy="150" r="120" fill="#fff" stroke="${PALE}" stroke-width="30"/>
<circle class="ring" cx="150" cy="150" r="120" fill="none" stroke="${BLUE}" stroke-width="30" stroke-linecap="round" stroke-dasharray="754" stroke-dashoffset="754" transform="rotate(-90 150 150)"/></svg>
<div class="num w" style="position:absolute;left:0;top:0;width:280px;text-align:center;font:700 112px/280px R;color:${INK};direction:ltr">0</div></div>
${hl(370,'אחרי 90 יום')}${hl(500,'המודעה פגה.',BLUE)}${sub(670,'בלי מודעות רפאים.')}`,(l,el)=>{const p=outCubic(seg(l,.15,.85));el.querySelector('.ring').setAttribute('stroke-dashoffset',754*(1-p));el.querySelector('.num').textContent=Math.round(90*p)})};

/* ---------- helpers for reels 32–36 ---------- */
const ringHTML=(sz,stroke=26)=>{const r=(sz-stroke)/2,c=(2*Math.PI*r).toFixed(1);return `<svg viewBox="0 0 ${sz} ${sz}" width="${sz}" height="${sz}"><circle cx="${sz/2}" cy="${sz/2}" r="${r}" fill="#fff" stroke="${PALE}" stroke-width="${stroke}"/><circle class="rg" cx="${sz/2}" cy="${sz/2}" r="${r}" fill="none" stroke="${BLUE}" stroke-width="${stroke}" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c}" transform="rotate(-90 ${sz/2} ${sz/2})"/></svg><div class="rn w" style="position:absolute;left:0;top:0;width:${sz}px;text-align:center;font:700 ${Math.round(sz*.34)}px/${sz}px R;color:${INK};direction:ltr"></div>`};
const setRing=(el,p,text)=>{const rg=el.querySelector('.rg');const c=parseFloat(rg.getAttribute('stroke-dasharray'));rg.setAttribute('stroke-dashoffset',c*(1-p));el.querySelector('.rn').textContent=text};
const AMBER='#B45309';
