// Reel H31 (1031) — Roommate moment · style A (illustrated story) · unvoiced, loops. Idea L10 cut to one moment:
// a roommate's kind gesture that misfires: they turned the boiler on for you. In August.
// Cover (white): "הדליקו לכם / את הדוד. / באוגוסט." + the boiler switch lit blue, the note "הדלקתי לך." and a blazing sun
// in the window. Hook "מישהו דאג לכם." (the switch clicks on, the note drops, the sun's rays turn) -> prompt pill
// "תייגו שותפים כאלה." at 1.4 s -> "בחוץ: חמסין." -> shower beat "המים? / רותחים." (steam, sweating roommate)
// -> you switch it off and leave a note "תודה. / כיביתי." -> it clicks on again: "הדלקתי לך. / שוב." (the loop) -> wordmark.
const DUR=10.6;
const COVER_END=0.4,P0=1.4,P1=3.4,S2=3.0,S3=5.0,S4=7.2,S5=8.6,E0=9.6;
const SCENES=[['a',0,S3],['b',S3,DUR]];
Tt.style.zIndex=50;
const GREY='#8C8C8C';

/* ---------- small static wordmark, frame 0 until the brand ending ---------- */
const smallWM=$(`left:0;top:280px;width:1080px;display:flex;justify-content:center;z-index:70`,WORDMARK);
smallWM.querySelector('svg').style.cssText='width:200px;height:auto;display:block';
smallWM.querySelectorAll('path').forEach(p=>p.setAttribute('fill',INK));
at(smallWM,0,E0,{anim:'none',fo:0});

/* ---------- the wall: window with the sun, the boiler switch, the note (900 x 560) ---------- */
const noteHTML=(lines,rot=5,w=200)=>`<div style="width:${w}px;height:190px;border-radius:10px;background:${SOFT};border:4px solid ${BLUE};transform:rotate(${rot}deg);box-shadow:0 12px 26px rgba(17,17,17,.12);display:flex;flex-direction:column;justify-content:center;align-items:center">
  ${lines.map((l,i)=>`<div class="w" style="font:600 46px/1.15 F;color:${i===lines.length-1?BLUE:BL2};direction:rtl">${l}</div>`).join('')}</div>`;
function wallSVG(o={}){const on=o.on??1,rot=o.rot||0,sun=o.sun??1,heat=o.heat||0,t=o.t||0;
  const rays=Array.from({length:10},(_,i)=>{const a=(i*36+rot)*Math.PI/180,r1=106*sun,r2=(146+12*Math.sin(t*6+i))*sun;
    return `<line x1="${210+Math.cos(a)*r1}" y1="${260+Math.sin(a)*r1}" x2="${210+Math.cos(a)*r2}" y2="${260+Math.sin(a)*r2}" stroke="${BLUE}" stroke-width="10" stroke-linecap="round"/>`}).join('');
  const waves=heat>0?[0,1,2].map(k=>{const p=((t*.9+k/3)%1);const y=500-p*180;
    return `<path d="M${80+k*110} ${y} q12 -16 0 -32 q-12 -16 0 -32" fill="none" stroke="${PALE}" stroke-width="8" stroke-linecap="round" opacity="${(1-p)*heat}"/>`}).join(''):'';
  return `<svg viewBox="0 0 900 640" width="900" height="640" style="overflow:visible;display:block">
   <defs><clipPath id="win${o.id||0}"><rect x="24" y="44" width="372" height="442" rx="14"/></clipPath></defs>
   <rect x="20" y="40" width="380" height="450" rx="18" fill="#fff" stroke="${INK}" stroke-width="9"/>
   <g clip-path="url(#win${o.id||0})">${rays}<circle cx="210" cy="260" r="${86*sun}" fill="${BLUE}"/>${waves}</g>
   <path d="M210 40 V490 M20 300 H400" stroke="${INK}" stroke-width="7" opacity=".55"/>
   <rect x="450" y="60" width="250" height="400" rx="40" fill="#fff" stroke="${INK}" stroke-width="9"/>
   <text x="575" y="138" text-anchor="middle" font-family="F" font-weight="600" font-size="64" fill="${INK}">דוד</text>
   <rect x="505" y="165" width="140" height="190" rx="24" fill="#fff" stroke="${INK}" stroke-width="8"/>
   <path d="M511 260 H639" stroke="${INK}" stroke-width="5"/>
   <rect x="512" y="${on?172:266}" width="126" height="84" rx="18" fill="${on?BLUE:SOFT}"/>
   <circle cx="575" cy="412" r="${on?38:0}" fill="${BLUE}" opacity=".22"/>
   <circle cx="575" cy="412" r="19" fill="${on?BLUE:'#fff'}" stroke="${INK}" stroke-width="5"/>
   <line x1="0" y1="620" x2="900" y2="620" stroke="${INK}" stroke-width="8" stroke-linecap="round"/></svg>`}

/* ---------- COVER (white): frame 0, fully drawn ---------- */
const cov=$(`left:0;top:0;width:1080px;height:1920px;background:#fff;z-index:60`,`
  ${hl(400,'הדליקו לכם',INK,112)}${hl(520,'את הדוד.',INK,112)}${hl(646,'באוגוסט.',BLUE,124)}
  <div style="position:absolute;left:90px;top:790px">${wallSVG({on:1,rot:8,sun:1.12,heat:1,t:.3,id:9})}</div>
  <div style="position:absolute;left:790px;top:840px">${noteHTML(['הדלקתי','לך.'],5)}</div>`);
at(cov,0,COVER_END,{anim:'none',fo:0});
window.COVER={t:0.2,title:'הדליקו לכם את הדוד. באוגוסט.'};

bg('#fff',0,DUR);

/* ---------- the live wall (scene a, and back in the ending) ---------- */
const onAt=t=>(t>=0.6&&t<S4+.5)||t>=S5+.15;          // clicks on, you switch it off, it clicks on again
const wall=$(`left:90px;top:760px;width:900px;height:640px`);let lastW='';
const wallUp=(l,t)=>{const k=t<S2?seg(t,COVER_END,.5):1;const hot=t>=S2?1+.18*outBack(seg(t,S2,.4)):1;
  const s=wallSVG({on:onAt(t),rot:t*40,sun:(.9+.1*k)*hot,heat:t>=S2?1:.5,t,id:1});if(s!==lastW){wall.innerHTML=s;lastW=s}
  const sh=t>=S2&&t<S3?Math.sin(t*40)*3:0;wall.style.transform=`translateX(${sh}px)`};
at(wall,COVER_END,S3,{anim:'none',fo:.1,up:wallUp});
const wall2=$(`left:90px;top:760px;width:900px;height:640px`);let lastW2='';
at(wall2,S4,E0,{anim:'up',dy:30,fo:0,up:(l,t)=>{const s=wallSVG({on:onAt(t),rot:t*40,sun:1.1,heat:1,t,id:2});if(s!==lastW2){wall2.innerHTML=s;lastW2=s}}});
ev(0.6,'pin',1.2);ev(S4+.5,'pin',1.1);ev(S5+.15,'pin',1.3);

// the note: drops in after the click, swings
const note1=$(`left:790px;top:800px;transform-origin:50% 0`,noteHTML(['הדלקתי','לך.'],5));
at(note1,0.9,S3,{anim:'none',fo:.1,sfx:'swish',up:(l)=>{const d=outBack(seg(l,0,.35));note1.style.transform=`translateY(${(1-d)*-220}px) rotate(${Math.sin(l*5)*6*Math.exp(-l*1.2)}deg)`;note1.style.opacity=clamp(l*4)}});

/* ---------- hook + beats ---------- */
caption(400,['מישהו דאג לכם.'],COVER_END,S2,{fs:112,c:INK,fo:.08,sfx:'thud'});
caption(400,['בחוץ: חמסין.'],S2,S3,{fs:118,c:BLUE,fo:.08,sfx:'pop2'});

/* ---------- the prompt (by 3 s), between the line and the wall ---------- */
const promptHTML=`<div style="position:absolute;left:90px;top:0;width:900px;height:136px;border-radius:68px;background:#fff;border:5px solid ${INK};box-sizing:border-box;display:flex;align-items:center;justify-content:center;direction:rtl">
  <div class="w" style="font:600 90px/1 F;color:${INK}">תייגו <span style="color:${BLUE}">שותפים כאלה.</span></div></div>`;
const pr=$(`left:0;top:560px;width:1080px;height:136px;z-index:9`,promptHTML);
at(pr,P0,P1,{dy:40,s0:.85,fo:.15,sfx:'pop2'});
window.PROMPT={t:1.4,text:'תייגו שותפים כאלה.'};
const pr2=$(`left:0;top:560px;width:1080px;height:136px;z-index:9`,promptHTML);
at(pr2,S5+.3,E0,{dy:30,s0:.9,fo:0,sfx:'pop'});

/* ---------- scene b: the shower ---------- */
const showerSVG=(t)=>{const steam=[0,1,2,3,4].map(k=>{const p=((t*.55+k/5)%1);const x=170+((k*97)%360)+Math.sin(t*2+k)*20;
    return `<circle cx="${x}" cy="${520-p*460}" r="${46+p*50}" fill="${PALE}" opacity="${(1-p)*.75}"/>`}).join('');
  const drops=Array.from({length:9},(_,i)=>{const p=((t*2.2+i/9)%1);const x=250+i*22;return `<line x1="${x}" y1="${130+p*300}" x2="${x}" y2="${160+p*300}" stroke="${BLUE}" stroke-width="7" stroke-linecap="round" opacity="${1-p*.6}"/>`}).join('');
  return `<svg viewBox="0 0 700 600" width="700" height="600" style="overflow:visible;display:block">
   <path d="M600 600 V40 Q600 10 570 10 H360 V60" fill="none" stroke="${INK}" stroke-width="10" stroke-linecap="round"/>
   <path d="M260 60 H460 L420 110 H300 Z" fill="#fff" stroke="${INK}" stroke-width="8" stroke-linejoin="round"/>
   ${drops}${steam}</svg>`};
const shower=$(`left:190px;top:700px;width:700px;height:600px;z-index:3`);
at(shower,S3,S4,{anim:'up',dy:30,fo:.08,up:(l,t)=>{shower.innerHTML=showerSVG(t)}});
character(`left:390px;top:960px;z-index:2;`,300,S3+.1,S4,(l)=>({hair:'curly',shirt:'#fff',brow:l<.6?'flat':'up',eyes:l<.6?'closed':'wide',mouth:l<.6?'smile':'o',sweat:l>.6,look:0,lookY:-1}),{fo:.08,sfx:'whoosh',dy:40,s0:.95});
caption(400,['המים?'],S3+.05,S4,{fs:118,c:INK,fo:.08,sfx:'swish'});
caption(530,['רותחים.'],S3+.6,S4,{fs:130,c:BLUE,fo:.08,sfx:'boing',anim:'stamp'});
at($(`left:0;top:1800px;width:1080px;text-align:center;font:500 38px/1.2 R;color:${GREY};white-space:nowrap`,'<span class="w">הדמויות והמצבים בדיוניים</span>'),COVER_END,E0,{anim:'none',fo:0});

/* ---------- you switch it off, leave a note. it clicks on again (the loop) ---------- */
caption(400,['תודה. באמת.'],S4+.05,S5,{fs:112,c:INK,fo:.08,sfx:'thud'});
const note2=$(`left:790px;top:800px`,noteHTML(['תודה.','כיביתי.'],-4));
at(note2,S4+.7,S5,{anim:'stamp',dur:.3,fo:.06,sfx:'swish'});
caption(400,['…שוב.'],S5+.05,E0,{fs:130,c:BLUE,fo:.06,sfx:'pop2'});
const note3=$(`left:790px;top:800px`,noteHTML(['הדלקתי','לך. שוב.'],6));
at(note3,S5+.25,E0,{anim:'stamp',dur:.3,fo:0,sfx:'swish'});

/* ---------- brand ending ---------- */
wordmark(E0,DUR);

function render(t){runItems(t);turtle(null)}
window.BEATS={payoff:S3,outro:S5};
window.AUDIO={dur:DUR,seed:1031,sections:[[0,S3,'MIN',.13,0,1],[S3,DUR,'DET',.15,1,1]],ticks:[0.4,1.4]};
window.STRETCH=1.0;
window.render=render;window.EVENTS=EVENTS;window.SCENES=SCENES;window.DUR=DUR;render(0);
