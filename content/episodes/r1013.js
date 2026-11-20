// Reel H13 (1013) — roommate life · kinetic type: "give us one fridge shelf and we'll tell you who the roommates are" -> four shelf types (tidy, sauces, empty, Sunday meal-prep) -> four shelves, one fridge -> the shelf doesn't matter, what's outside the fridge does -> match on that first.
const DUR=24.2;
const SCENES=[['a',0,11.2],['b',11.2,DUR]];
Tt.style.zIndex=50;

/* ---------- drawn shelf items (origin = bottom centre) ---------- */
const BOX=(w,h,f,S,lid,txt='')=>`<rect x="${-w/2}" y="${-h}" width="${w}" height="${h}" rx="16" fill="${f}" stroke="${S}" stroke-width="7"/><path d="M${-w/2+4} ${-h+24} H${w/2-4}" stroke="${lid}" stroke-width="9"/>${txt?`<text x="0" y="${-h/2+26}" text-anchor="middle" font-family="R" font-weight="700" font-size="46" fill="${S}">${txt}</text>`:''}`;
const BOTTLE=(h,f,S,cap)=>{const bh=h*.72;return `<rect x="-14" y="${-h}" width="28" height="${h-bh+6}" fill="${f}" stroke="${S}" stroke-width="6"/><rect x="-19" y="${-h-16}" width="38" height="20" rx="5" fill="${cap}" stroke="${S}" stroke-width="5"/><rect x="-32" y="${-bh}" width="64" height="${bh}" rx="18" fill="${f}" stroke="${S}" stroke-width="7"/>`};
const LEMON=(S)=>`<path d="M-62 0 A62 62 0 0 1 62 0 Z" fill="#fff" stroke="${S}" stroke-width="7"/><path d="M-42 0 A42 42 0 0 1 42 0" fill="none" stroke="${PALE}" stroke-width="6"/><path d="M0 0 V-40 M0 0 L-30 -28 M0 0 L30 -28" stroke="${PALE}" stroke-width="5" stroke-linecap="round"/>`;

// shelf sets: [x, svg] in a 860 x 340 frame, floor at y=300
const SET={
  tidy:(S,F)=>[150,320,500,680].map(x=>[x,BOX(150,112,F,S,BLUE)]),
  sauce:(S,F)=>[[110,170,BLUE,S],[200,220,F,BLUE],[290,150,S,BLUE],[380,200,PALE,S],[470,240,F,S],[560,160,BLUE,S],[650,210,PALE,BLUE]].map(([x,h,f,c])=>[x,BOTTLE(h,f,S,c)]),
  empty:(S,F)=>[[230,LEMON(S)],[640,BOTTLE(230,PALE,S,'#fff')]],
  prep:(S,F)=>[[570,BOX(170,104,F,S,BLUE,'א׳')],[380,BOX(170,104,F,S,BLUE,'ב׳')],[190,BOX(170,104,F,S,BLUE,'ג׳')],[475,`<g transform="translate(0 -108)">${BOX(170,104,F,S,BLUE,'ד׳')}</g>`],[285,`<g transform="translate(0 -108)">${BOX(170,104,F,S,BLUE,'ה׳')}</g>`]],
};
function shelfSVG(kind,S,F,frameF){const items=SET[kind](S,F);
  return `<svg viewBox="0 0 860 340" width="860" height="340" style="overflow:visible"><rect x="4" y="4" width="852" height="332" rx="40" fill="${frameF}" stroke="${S}" stroke-width="8"/><path d="M30 300 H830" stroke="${S}" stroke-width="8" stroke-linecap="round"/>
  ${items.map(([x,svg],i)=>`<g class="it" data-x="${x}" transform="translate(${x} 300) scale(0)">${svg}</g>`).join('')}</svg>`}
// a shelf whose items pop in one by one
function shelf(top,kind,a,b,dark,step=.22,t0=.3){const S=dark?'#fff':INK,F=dark?DARK2:SOFT,FR=dark?'#1A1A1A':'#fff';
  const el=$(`left:110px;top:${top}px;width:860px;height:340px`,shelfSVG(kind,S,F,FR));
  const n=SET[kind](S,F).length;for(let i=0;i<n;i++)ev(a+t0+i*step,'pin',1+i*.06);
  return at(el,a,b,{anim:'pop',dy:40,s0:.9,fo:.08,up:(l)=>{el.querySelectorAll('.it').forEach((g,i)=>{const e=outBack(seg(l,t0+i*step,.25));g.setAttribute('transform',`translate(${g.dataset.x} 300) scale(${Math.max(0,e)})`)})}})}
const COUNT=(n,a,b,dark)=>at($(`left:0;top:320px;width:1080px;text-align:center;font:700 50px/1 R;color:${dark?NAMEC:BLUE};direction:ltr`,`${n} / 4`),a,b,{anim:'pop',fo:.08});

/* ---------- hook (black): one shelf, and we'll tell you ---------- */
const HE=2.8;
bg(INK,0,HE);
caption(330,['מדף אחד','במקרר.'],0.05,HE,{fs:132,c:'#fff',fo:.1,sfx:'thud'});
caption(1240,['ונגיד לכם','מי השותפים.'],0.75,HE,{fs:112,cols:['#fff',NAMEC],fo:.1,sfx:'pop2'});
const emp=$(`left:110px;top:780px;width:860px;height:340px`,`<svg viewBox="0 0 860 340" width="860" height="340"><rect x="4" y="4" width="852" height="332" rx="40" fill="#1A1A1A" stroke="#fff" stroke-width="8"/><path d="M30 300 H830" stroke="#fff" stroke-width="8" stroke-linecap="round"/><circle class="q" cx="430" cy="170" r="70" fill="${BLUE}"/><text class="q" x="430" y="198" text-anchor="middle" font-family="F" font-weight="600" font-size="96" fill="#fff">?</text></svg>`);
at(emp,0.35,HE,{anim:'pop',dy:30,s0:.9,fo:.1,sfx:'pop',up:(l)=>{const s=1+.06*Math.sin(l*6);emp.querySelectorAll('.q').forEach(q=>q.setAttribute('transform',`translate(430 170) scale(${s}) translate(-430 -170)`))}});

/* ---------- four shelf types ---------- */
function type(n,a,b,dark,kind,name,line){
  bg(dark?INK:'#fff',a,b);
  COUNT(n,a,b,dark);
  shelf(470,kind,a,b,dark);
  caption(980,[name],a+.9,b,{fs:132,c:dark?'#fff':INK,fo:.08,sfx:'thud'});
  caption(1200,line,a+1.35,b,{fs:66,cols:[dark?'#C9C9C9':MUTED,dark?NAMEC:BLUE],fo:.08,sfx:'swish',anim:'up',dy:24});
}
const A1=HE,A2=5.8,A3=8.6,A4=11.2,A5=14.2;
type(1,A1,A2,false,'tidy','המדף המסודר.',['הכול בקופסאות.','באותו גודל. בשורה.']);
type(2,A2,A3,true,'sauce','מדף הרטבים.',['שבעה רטבים.','ארוחה? אין.']);
type(3,A3,A4,false,'empty','המדף הריק.',['חצי לימון.','ובקבוק מים.']);
type(4,A4,A5,true,'prep','מדף יום ראשון.',['חמש קופסאות. אותו תבשיל.','עד חמישי.']);

/* ---------- four shelves, one fridge (white) ---------- */
const F1=16.9;
bg('#fff',A5,F1);
const mini=(kind,y)=>`<g transform="translate(70 ${y}) scale(.44)">${shelfSVG(kind,INK,SOFT,'#fff').replace(/<svg[^>]*>|<\/svg>/g,'').replace(/scale\(0\)/g,'scale(1)')}</g>`;
const fridge=$(`left:300px;top:250px;width:480px;height:1000px`,`<svg viewBox="0 0 520 1000" width="480" height="923" style="overflow:visible"><rect x="6" y="6" width="508" height="988" rx="54" fill="#fff" stroke="${INK}" stroke-width="10"/>
 <g class="sh" data-i="0">${mini('tidy',70)}</g><g class="sh" data-i="1">${mini('sauce',300)}</g><g class="sh" data-i="2">${mini('empty',530)}</g><g class="sh" data-i="3">${mini('prep',760)}</g></svg>`);
[0,1,2,3].forEach(i=>ev(A5+.25+i*.28,'pin',1+i*.1));
at(fridge,A5,F1,{anim:'pop',dy:60,s0:.92,fo:.08,sfx:'pop2',up:(l)=>{fridge.querySelectorAll('.sh').forEach((g,i)=>{const p=seg(l,.25+i*.28,.3);g.setAttribute('opacity',clamp(p*2));g.style.transform=`translateY(${(1-outCubic(p))*-40}px)`})}});
caption(1290,['ארבעה מדפים.','מקרר אחד.'],A5+1.3,F1,{fs:116,cols:[INK,BLUE],fo:.08,sfx:'thud'});
caption(1600,['ואיכשהו, זה עובד.'],A5+1.95,F1,{fs:66,c:MUTED,fo:.08,sfx:'swish',anim:'up',dy:24});

/* ---------- the turn (black): what matters is outside the fridge ---------- */
const P1=20.0;
bg(INK,F1,P1);
caption(330,['המדף','לא משנה.'],F1+.05,P1,{fs:124,cols:['#fff','#fff'],fo:.08,sfx:'thud'});
caption(640,['מה שמשנה:'],F1+.6,P1,{fs:84,c:NAMEC,fo:.08,sfx:'pop'});
['מי מנקה את המקרר.','מתי הולכים לישון.','מי מגיע לארוחה.'].forEach((t,i)=>{const a=F1+1.0+i*.38;
  at($(`left:0;top:${800+i*150}px;width:1080px;display:flex;justify-content:center`,`<div class="w" style="height:112px;padding:0 50px;border-radius:56px;background:${DARK2};border:4px solid ${BLUE};color:#fff;font:500 60px/104px R;white-space:nowrap">${t}</div>`),a,P1,{anim:'pop',dy:30,s0:.8,fo:.08,sfx:'ding',v:1+i*.12})});
caption(1360,['על זה','מתאימים מראש.'],F1+2.2,P1,{fs:104,cols:['#fff',NAMEC],fo:.08,sfx:'pop2'});

/* ---------- wipe + homie ---------- */
wipe(P1,null);
wordmark(P1+.9,DUR);
endCard(P1+1.0,DUR,'מתאימים על מה שחשוב.');

function render(t){runItems(t);
  if(t<P1+.9)turtle(null); else turtleWhite(t,P1+.95,[],P1+1.8)}
window.AUDIO={dur:DUR,seed:1013,sections:[[0,HE,'CG',.13,0,1],[HE,A5,'POP',.16,1,1],[A5,P1,'MIN',.12,1,0],[P1,DUR,'FC',.18,1,1]],ticks:[HE,A5]};
window.render=render;window.EVENTS=EVENTS;window.SCENES=SCENES;window.DUR=DUR;render(0);
