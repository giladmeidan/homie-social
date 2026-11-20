// Reel H10 (1010) — The city · "יום המעבר, ב-8 פריימים" (idea C3). Style A, photo-strip frames on black.
// Moving day as 8 numbered snapshots (shutter flash per frame): boxes → stuck lift → 4th floor on foot →
// every box says "שונות" → where's the charger → no table, a floor → the first pizza at home. Then "frame 0".
const DUR=22.6;
const T0=1.6,STEP=1.45,NF=8,TW=T0+STEP*(NF-1)+1.95; // wipe at 13.7
const SCENES=[['a',0,TW],['b',TW,DUR]];
Tt.style.zIndex=50;
const END_A=TW+0.55;
window.AUDIO={dur:DUR,seed:1010,sections:[[0,T0,'MIN',.11,0,0],[T0,TW,'DET',.12,1,0],[TW,DUR,'FC',.18,1,1]],ticks:[T0,TW-.1]};

/* ---------- A: the frames ---------- */
bg(INK,0,END_A);
caption(700,['יום המעבר.','ב-8 פריימים.'],0.05,T0,{fs:128,cols:['#fff',NAMEC],sfx:'thud',dy:60,fo:.08});

// drawing helpers (picture area 780 x 800, floor at y=700)
const S=(w,h,inner)=>`<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" style="position:absolute;left:0;top:0;overflow:visible">${inner}</svg>`;
const floor=`<path d="M0 700 H780" stroke="${INK}" stroke-width="7"/>`;
const box=(x,y,w,h,label,fs=40,tape=BLUE)=>`<g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="#fff" stroke="${INK}" stroke-width="7"/>
 <rect x="${x+w/2-16}" y="${y+3}" width="32" height="${h*.32}" fill="${tape}"/>
 ${label?`<text x="${x+w/2}" y="${y+h*.72}" text-anchor="middle" font-family="F" font-weight="600" font-size="${fs}" fill="${INK}">${label}</text>`:''}</g>`;
const chr=(left,top,w,o)=>`<div style="position:absolute;left:${left}px;top:${top}px">${charSVG(Object.assign({w},o))}</div>`;
const heart=(x,y,s,c=BLUE)=>`<path transform="translate(${x} ${y}) scale(${s})" d="M0 12 C0 -4 22 -4 22 10 C22 -4 44 -4 44 12 C44 28 22 38 22 42 C22 38 0 28 0 12Z" fill="${c}"/>`;
const ME={hair:'curly',shirt:BLUE};

const stack=box(90,550,200,150,'מטבח')+box(290,550,200,150,'ספרים')+box(490,550,200,150,'בגדים')+box(190,400,200,150,'סלון')+box(390,400,200,150,'אמבטיה',36)+box(290,250,200,150,'עדין!');
const lamp=`<path d="M70 700 V430 M40 700 H100" stroke="${INK}" stroke-width="8" stroke-linecap="round"/><path d="M20 430 L120 430 L95 350 L45 350 Z" fill="#fff" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>`;
const plant=`<path d="M690 700 L670 610 L760 610 L740 700 Z" fill="#fff" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/><path d="M715 610 C700 540 660 520 640 500 M715 610 C720 540 750 520 770 480 M715 610 C712 560 715 520 715 470" stroke="${INK}" stroke-width="7" fill="none" stroke-linecap="round"/><ellipse cx="645" cy="500" rx="26" ry="14" fill="${BLUE}"/><ellipse cx="768" cy="482" rx="24" ry="13" fill="${BLUE}"/><ellipse cx="715" cy="466" rx="14" ry="24" fill="${BLUE}"/>`;
const pillow=`<path d="M150 700 Q140 640 200 640 L320 640 Q370 640 360 700 Z" fill="#fff" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>`;
const chair=`<path d="M560 700 V560 H650 V700 M560 620 H650 M650 560 V440" stroke="${INK}" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;

const FR=[
 {time:'08:00',txt:'הכול ארוז.',pic:S(780,800,floor+stack)},
 {time:'08:40',txt:'כמעט הכול.',pic:S(780,800,floor+stack.replace(/<g>/,'<g>'))+S(780,800,lamp+plant+`<g transform="translate(330 0)">${pillow}</g>`)},
 {time:'10:00',txt:'המעלית: תקועה.',pic:S(780,800,floor+`<rect x="70" y="160" width="330" height="540" fill="#fff" stroke="${INK}" stroke-width="8"/><path d="M235 160 V700" stroke="${INK}" stroke-width="7"/>
   <circle cx="235" cy="100" r="34" fill="#fff" stroke="${INK}" stroke-width="7"/><path d="M235 118 V82 M220 96 L235 82 L250 96" stroke="${INK}" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
   <g transform="rotate(-6 235 380)"><rect x="140" y="330" width="190" height="96" fill="#fff" stroke="${INK}" stroke-width="5"/><text x="235" y="393" text-anchor="middle" font-family="F" font-weight="600" font-size="46" fill="${INK}">תקועה</text></g>`)
   +chr(450,371,260,Object.assign({eyes:'wide',brow:'sad',mouth:'o',look:-1},ME))+S(780,800,box(470,560,220,140,'',40))},
 {time:'10:01',txt:'קומה רביעית. ברגל.',pic:S(780,800,`<path d="M0 700 ${[...Array(9)].map((_,i)=>`H${90*(i+1)} V${700-70*(i+1)}`).join(' ')}" stroke="${INK}" stroke-width="7" fill="none" stroke-linejoin="round"/>
   <rect x="40" y="60" width="150" height="150" rx="10" fill="#fff" stroke="${INK}" stroke-width="7"/><text x="115" y="170" text-anchor="middle" font-family="F" font-weight="600" font-size="110" fill="${BLUE}">4</text>`)
   +chr(200,186,240,Object.assign({eyes:'shut',brow:'sad',mouth:'wavy',sweat:true,look:1},ME))+S(780,800,box(210,375,200,120,'',40))},
 {time:'13:00',txt:'כל הארגזים: ״שונות״.',pic:S(780,800,floor+
   [[60,520,'שונות'],[290,520,'שונות'],[520,520,'שונות'],[60,340,'שונות 2'],[290,340,'שונות'],[520,340,'שונות!!'],[175,160,'שונות'],[405,160,'שונות?']].map(([x,y,l])=>box(x,y,200,180,l,42)).join(''))},
 {time:'16:00',txt:'איפה המטען?',pic:chr(250,250,280,Object.assign({eyes:'open',brow:'sus',mouth:'flat',look:1,lookY:1},ME))+S(780,800,floor+
   `<path d="M170 520 L110 440 M610 520 L670 440" stroke="${INK}" stroke-width="7" stroke-linecap="round"/><rect x="170" y="520" width="440" height="180" rx="6" fill="#fff" stroke="${INK}" stroke-width="7"/>
   <text x="640" y="200" text-anchor="middle" font-family="F" font-weight="600" font-size="190" fill="${BLUE}">?</text>
   <path d="M110 300 q30 -40 60 0 t60 0" stroke="${INK}" stroke-width="7" fill="none" stroke-linecap="round"/><rect x="60" y="180" width="70" height="40" rx="8" fill="#fff" stroke="${INK}" stroke-width="6" transform="rotate(-20 95 200)"/>`)},
 {time:'20:00',txt:'אין שולחן. יש רצפה.',pic:S(780,800,floor+`<rect x="460" y="90" width="240" height="240" fill="#fff" stroke="${INK}" stroke-width="7"/><path d="M580 90 V330 M460 210 H700" stroke="${INK}" stroke-width="6"/>
   <path d="M530 130 a34 34 0 1 0 34 52 a28 28 0 1 1 -34 -52Z" fill="${INK}"/>
   <path d="M200 700 L250 640 L560 640 L520 700 Z" fill="#fff" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/><text x="380" y="686" text-anchor="middle" font-family="F" font-weight="600" font-size="40" fill="${BLUE}">פיצה</text>`)},
 {time:'20:05',txt:'הפיצה הראשונה. בבית.',pic:chr(20,330,290,Object.assign({eyes:'closed',brow:'flat',mouth:'grin',look:1},ME))+chr(470,330,290,{hair:'bun',shirt:'#fff',eyes:'closed',brow:'flat',mouth:'grin',look:-1})
   +S(780,800,floor+`<path d="M250 700 L300 650 L480 650 L450 700 Z" fill="#fff" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>
   <path d="M330 690 L370 655 L400 690 Z M390 690 L425 655 L440 690 Z" fill="${BLUE}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>`+heart(354,200,2.4))},
];

// progress dots
const dots=$(`left:0;top:258px;width:1080px;display:flex;justify-content:center;gap:24px;direction:ltr`,[...Array(NF)].map(()=>`<div class="dt" style="width:28px;height:28px;border-radius:50%;border:4px solid ${NAMEC}"></div>`).join(''));
at(dots,T0,END_A,{anim:'none',fo:0,up:(l,t,el)=>{const cur=Math.min(NF-1,Math.floor((t-T0)/STEP));[...el.querySelectorAll('.dt')].forEach((d,i)=>{d.style.background=i<=cur?(i===cur?'#fff':NAMEC):'transparent';d.style.borderColor=i===cur?'#fff':NAMEC;d.style.transform=i===cur?'scale(1.25)':''})}});

FR.forEach((f,i)=>{const a=T0+STEP*i,b=i<NF-1?a+STEP:END_A;
  const el=$(`left:110px;top:370px;width:860px;height:1160px;background:#fff;border-radius:16px`,
   `<div style="position:absolute;left:40px;top:40px;width:780px;height:800px;background:${SOFT};overflow:hidden">${f.pic}</div>
    <div class="w" style="position:absolute;left:0;top:880px;width:860px;text-align:center;font:700 52px/1 R;color:${BLUE};direction:ltr">${f.time}</div>
    <div class="w" style="position:absolute;left:0;top:958px;width:860px;text-align:center;font:600 ${f.txt.length>16?68:80}px/1.1 F;color:${INK}">${f.txt}</div>
    <div class="w" style="position:absolute;left:40px;top:1090px;font:500 38px/1 R;color:#8C8C8C;direction:ltr">${i+1}/8</div>`);
  at(el,a,b,{anim:'pop',dy:50,s0:.95,dur:.28,fo:0,rot:i%2?1.4:-1.4,sfx:'swish'});ev(a,'pin',1.2)});
// shutter flash
const flash=$(`left:0;top:0;width:1080px;height:1920px;background:#fff`);
at(flash,T0,END_A,{anim:'none',fo:0,up:(l,t,el)=>{const k=(t-T0)%STEP;el.style.opacity=t<T0+STEP*NF&&k<.16?.55*(1-k/.16):0}});
at($(`left:0;top:1830px;width:1080px;text-align:center;font:500 38px/1.2 R;color:#8C8C8C;white-space:nowrap`,'הדמויות והמצבים בדיוניים'),T0,END_A,{anim:'none',fo:0});

/* ---------- B: frame 0 ---------- */
wipe(TW,'ופריים 0?');
wordmark(TW+1.2,DUR);
const F1=TW+1.25,F2=F1+2.15,EC=F2+1.95;
feat(F1,F2,`${hl(380,'פריים 0:')}${hl(510,'מוצאים דירה.',BLUE)}${sub(690,'ישר מאנשים פרטיים. בלי מתווכים.')}`);
feat(F2,EC,`${hl(380,'את המעלית')}${hl(510,'לא נתקן.',BLUE)}${sub(690,'את החיפוש, כן.')}`);
endCard(EC,DUR,'מתחילים מפריים 0.');

function render(t){runItems(t);turtleWhite(t,F1,[F1,F2],EC)}
window.render=render;window.EVENTS=EVENTS;window.SCENES=SCENES;window.DUR=DUR;render(0);
