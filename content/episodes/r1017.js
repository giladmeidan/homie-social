// Reel H17 (1017) — Roommate life · "מחוות קטנות" (idea L3). Style A, POV hook.
// POV: coming home after a long day and finding three small things a roommate did without a word:
// the boiler already on, the laundry from the machine folded, the parcel from the lobby already upstairs.
// Next morning the other roommate finds the boiler on, with a note: "תורי." -> match score -> end card.
const DUR=23.0;
const SCENES=[['a',0,6.4],['b',6.4,15.0],['c',15.0,DUR]];
Tt.style.zIndex=50;
const LINEC='#D6DEEA';

/* ---------- drawings (800x520 boxes) ---------- */
const boilerSVG=(on=1)=>`<svg viewBox="0 0 800 520" width="800" height="520" style="overflow:visible;display:block">
  <rect x="250" y="40" width="300" height="420" rx="44" fill="#fff" stroke="${INK}" stroke-width="8"/>
  <text x="400" y="118" text-anchor="middle" font-family="F" font-weight="600" font-size="62" fill="${INK}">דוד</text>
  <rect x="320" y="150" width="160" height="210" rx="26" fill="#fff" stroke="${INK}" stroke-width="7"/>
  <path d="M326 255 L474 255" stroke="${INK}" stroke-width="5"/>
  <rect x="328" y="${on?158:260}" width="144" height="94" rx="20" fill="${SOFT}"/>
  <circle class="halo" cx="400" cy="410" r="36" fill="${BLUE}" opacity="${on?.22:0}"/>
  <circle cx="400" cy="410" r="19" fill="${on?BLUE:'#fff'}" stroke="${INK}" stroke-width="5"/></svg>`;
const laundrySVG=()=>`<svg viewBox="0 0 800 520" width="800" height="520" style="overflow:visible;display:block">
  <rect x="660" y="170" width="56" height="300" rx="14" fill="#fff" stroke="${INK}" stroke-width="7"/>
  <rect x="70" y="330" width="620" height="110" rx="22" fill="#fff" stroke="${INK}" stroke-width="8"/>
  <path d="M100 440 L100 490 M660 440 L660 490" stroke="${INK}" stroke-width="8" stroke-linecap="round"/>
  <ellipse cx="575" cy="310" rx="70" ry="34" fill="#fff" stroke="${INK}" stroke-width="7"/>
  <rect x="230" y="276" width="240" height="56" rx="14" fill="${BLUE}" stroke="${INK}" stroke-width="6"/>
  <rect x="240" y="222" width="220" height="56" rx="14" fill="#fff" stroke="${INK}" stroke-width="6"/>
  <rect x="250" y="168" width="200" height="56" rx="14" fill="${PALE}" stroke="${INK}" stroke-width="6"/>
  <rect x="262" y="118" width="176" height="52" rx="14" fill="#fff" stroke="${INK}" stroke-width="6"/>
  <path d="M300 144 L400 144" stroke="${LINEC}" stroke-width="6" stroke-linecap="round"/></svg>`;
const parcelSVG=()=>`<svg viewBox="0 0 800 520" width="800" height="520" style="overflow:visible;display:block">
  <rect x="500" y="20" width="240" height="460" rx="10" fill="#fff" stroke="${INK}" stroke-width="8"/>
  <circle cx="530" cy="270" r="14" fill="${INK}"/>
  <path d="M40 480 L760 480" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>
  <path d="M150 250 L200 200 L470 200 L420 250 Z" fill="#fff" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>
  <rect x="150" y="250" width="270" height="230" fill="#fff" stroke="${INK}" stroke-width="7"/>
  <path d="M420 250 L470 200 L470 430 L420 480 Z" fill="#fff" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>
  <rect x="268" y="250" width="34" height="230" fill="${BLUE}"/><path d="M262 250 L312 200 L346 200 L296 250 Z" fill="${BLUE}"/>
  <rect x="180" y="300" width="70" height="44" rx="6" fill="#fff" stroke="${INK}" stroke-width="5"/></svg>`;
// a sticky note (light blue paper), Hebrew in Fredoka
const noteHTML=(lines,rot=5)=>`<div style="width:230px;height:200px;border-radius:10px;background:${SOFT};border:4px solid ${BLUE};transform:rotate(${rot}deg);box-shadow:0 12px 26px rgba(17,17,17,.12);display:flex;flex-direction:column;justify-content:center;align-items:center">
  ${lines.map((l,i)=>`<div class="w" style="font:600 50px/1.15 F;color:${i===lines.length-1?BLUE:BL2};direction:rtl">${l}</div>`).join('')}</div>`;
const pill=(txt)=>`<div style="display:flex;justify-content:center"><div class="w" style="height:78px;padding:0 36px;border-radius:39px;background:${INK};color:#fff;font:700 42px/78px R">${txt}</div></div>`;
const frac=(n)=>`מחווה <span style="direction:ltr;unicode-bidi:isolate">${n} / 3</span>`;

/* ---------- COVER: frame 0 is the cover, fully drawn, held until COVER_END ---------- */
const COVER_END=0.7;
const cov=$(`left:0;top:0;width:1080px;height:1920px;background:${INK};z-index:60`,`
  ${hl(400,'מחוות קטנות','#fff',132)}${hl(550,'של שותפים.',BLUE,132)}
  <div style="position:absolute;left:100px;top:790px">${boilerSVG(1)}</div>
  <div style="position:absolute;left:640px;top:830px">${noteHTML(['הדלקתי','לך.'],6)}</div>`);
at(cov,0,COVER_END,{anim:'none',fo:0});
window.COVER={t:0.3,title:'מחוות קטנות של שותפים'};

bg('#fff',COVER_END,15.0);
at($(`left:0;top:1830px;width:1080px;text-align:center;font:500 38px/1.2 R;color:#8C8C8C;white-space:nowrap`,'הדמויות והמצבים בדיוניים'),COVER_END,15.0,{anim:'none',fo:0});

/* ---------- hook: POV, home after a long day ---------- */
const H0=COVER_END,G1=3.2,G2=6.4,G3=9.6,M0=12.6,W0=15.0;
at($(`left:0;top:190px;width:1080px`,pill('<span style="direction:ltr;unicode-bidi:isolate">POV</span>')),H0,G1,{dy:-20,s0:.6,fo:.08,sfx:'pop'});
caption(300,['חוזרים הביתה'],H0+.15,G1,{fs:110,c:INK,fo:.08,sfx:'thud'});
caption(430,['אחרי יום ארוך.'],H0+.45,G1,{fs:110,c:BLUE,fo:.08});
// the front door swings open
const door=$(`left:290px;top:640px;width:500px;height:560px`);
at(door,H0+.1,G1,{anim:'none',fo:.08,up:(l)=>{const k=inOut(seg(l,.3,.6));
  door.innerHTML=`<svg viewBox="0 0 500 560" width="500" height="560" style="overflow:visible"><rect x="60" y="20" width="380" height="540" fill="${INK}"/>
   <rect x="60" y="20" width="380" height="540" fill="none" stroke="${INK}" stroke-width="10"/>
   <g transform="translate(440 0) scale(${1-.72*k} 1) translate(-440 0)"><rect x="60" y="20" width="380" height="540" fill="#fff" stroke="${INK}" stroke-width="8"/><circle cx="110" cy="300" r="16" fill="${INK}"/></g></svg>`}});
ev(H0+.45,'swish');
// the tired roommate (A) steps in
character(`left:380px;top:1180px;`,320,H0+.5,G1,(l)=>({hair:'short',shirt:BLUE,brow:'sad',eyes:'narrow',mouth:'flat',look:0}),{fo:.08,dy:80});

/* ---------- three gestures, nobody says a word ---------- */
const GEST=[
  {a:G1,b:G2,l1:'מישהו הדליק',l2:'לכם את הדוד.',svg:()=>boilerSVG(1),note:['הדלקתי','לך.'],nx:640,ny:680,rot:6},
  {a:G2,b:G3,l1:'הכביסה מהמכונה:',l2:'מקופלת.',svg:laundrySVG,note:['קיפלתי.'],nx:650,ny:640,rot:-5},
  {a:G3,b:M0,l1:'החבילה מהלובי:',l2:'כבר למעלה.',svg:parcelSVG,note:['חיכתה','למטה.'],nx:130,ny:650,rot:-6},
];
GEST.forEach((g,i)=>{
  at($(`left:0;top:190px;width:1080px`,pill(frac(i+1))),g.a,g.b,{dy:-20,s0:.6,fo:.08,sfx:'pin'});
  caption(300,[g.l1],g.a+.1,g.b,{fs:104,c:INK,fo:.08});
  caption(430,[g.l2],g.a+.55,g.b,{fs:104,c:BLUE,fo:.08,sfx:'pop'});
  at($(`left:140px;top:640px`,g.svg()),g.a+.15,g.b,{dy:50,s0:.85,fo:.08,sfx:i===0?'ding':'thud'});
  at($(`left:${g.nx}px;top:${g.ny}px`,noteHTML(g.note,g.rot)),g.a+1.2,g.b,{anim:'stamp',dur:.3,fo:.08,sfx:'swish'});
});
ev(G1+.15,'pin',1.2);
// A reacts: surprised at each gesture, then warmer and warmer
character(`left:70px;top:1190px;`,320,G1,M0,(l,t)=>{const k=[G1,G2,G3].filter(x=>t>=x).length-1;const since=t-[G1,G2,G3][k];
  const wow=since<.9;return{hair:'short',shirt:BLUE,brow:wow?'up':'flat',eyes:wow?'wide':(k===2?'closed':'open'),look:1,lookY:-1,
    mouth:wow?'o':(k===0?'smile':'grin'),hearts:k===2&&since>1.4}},{fo:.08,dy:40,s0:.95});

/* ---------- next morning: the other roommate finds the boiler on ---------- */
caption(300,['ולמחרת בבוקר,'],M0+.05,W0,{fs:104,c:INK,fo:.08,sfx:'whoosh'});
caption(430,['הדוד דלוק שוב.'],M0+.4,W0,{fs:104,c:BLUE,fo:.08,sfx:'pop'});
at($(`left:140px;top:640px`,boilerSVG(1)),M0+.1,W0,{dy:50,s0:.85,fo:.08,sfx:'ding'});
at($(`left:640px;top:680px`,noteHTML(['תורי.'],-4)),M0+1.0,W0,{anim:'stamp',dur:.3,fo:.08,sfx:'swish'});
character(`left:690px;top:1190px;`,320,M0+.2,W0,(l)=>({hair:'bun',shirt:'#fff',brow:l<.9?'up':'flat',eyes:l<.9?'shut':(l<1.6?'wide':'closed'),look:-1,lookY:-1,
  mouth:l<.9?'flat':(l<1.6?'o':'grin'),hearts:l>1.7}),{fo:.08,dy:60});
at($(`left:40px;top:1300px;width:640px;text-align:center;font:600 66px/1.1 F;color:${MUTED}`,'<div class="w">ככה זה מתחיל.</div>'),M0+1.6,W0,{anim:'up',dy:20,fo:.08,sfx:'ding'});

/* ---------- homie ---------- */
wipe(W0,'איך מוצאים כאלה?');
const F0=W0+1.2,P0=18.5,E0=20.4;
wordmark(F0,DUR);
FEAT.match(F0,P0);
feat(P0,E0,`${hl(380,'קודם מתאימים.')}${hl(510,'המחוות באות לבד.',BLUE)}${sub(690,'בשוק השותפים.')}`);
endCard(E0,DUR,'שותפים שמדליקים את הדוד.');

function render(t){runItems(t);turtleWhite(t,F0,[F0,P0],E0+.25)}
window.AUDIO={dur:DUR,seed:1017,sections:[[0,G1,'MIN',.12,0,0],[G1,W0,'CG',.14,1,0],[W0,DUR,'POP',.19,1,1]],ticks:[0,0]};
window.STRETCH=1.12;
window.render=render;window.EVENTS=EVENTS;window.SCENES=SCENES;window.DUR=DUR;render(0);
