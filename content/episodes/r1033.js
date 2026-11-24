// Reel H33 (1033) — Pain point · style C · voiced. N3: "סליחה, כבר נסגר" (you arrive at a viewing and it is already taken). Replaces H32 (rejected) in slot 2026-11-24 13.
// Cover (white): "הגעתם לסיור. / כבר נסגר." + a line-drawn door with a taped note "נסגר הבוקר. / סליחה!".
// Hook: the note flutters -> "״אה, היא / נסגרה הבוקר.״" -> prompt "תייגו את מי / שעברו את זה." at 2.4 s
// -> "וכל הדרך, / בשביל פתק." a dotted blue route draws to the door
// -> "בהומי רואים / כמה כבר הגישו." the note turns into a live count (demo) -> wordmark.
const DUR=11.8;
const COVER_END=0.4,P0=2.4,B2=5.5,B3=8.1,WM=11.1;
const SCENES=[['a',0,B3],['b',B3,DUR]];
Tt.style.zIndex=50;
const GREY='#8C8C8C';

/* ---------- small static wordmark ---------- */
const smallWM=()=>{const m=$(`left:0;top:280px;width:1080px;display:flex;justify-content:center;z-index:70`,WORDMARK);
  m.querySelector('svg').style.cssText='width:200px;height:auto;display:block';return m};
at(smallWM(),0,WM,{anim:'none',fo:0});

/* ---------- the door (line drawing), 420 x 640 ---------- */
const DX=330,DY=700;
const doorSVG=`<svg width="420" height="640" viewBox="0 0 420 640">
  <rect x="10" y="10" width="400" height="630" rx="8" fill="#fff" stroke="${INK}" stroke-width="8"/>
  <rect x="50" y="50" width="320" height="250" rx="6" fill="none" stroke="${INK}" stroke-width="5"/>
  <rect x="50" y="340" width="320" height="250" rx="6" fill="none" stroke="${INK}" stroke-width="5"/>
  <circle cx="352" cy="330" r="16" fill="${INK}"/>
  <rect x="166" y="24" width="88" height="40" rx="8" fill="${SOFT}" stroke="${INK}" stroke-width="4"/>
  <text x="210" y="54" text-anchor="middle" font-family="R" font-weight="700" font-size="30" fill="${INK}">4</text></svg>`;
const noteHTML=`<div style="position:absolute;left:0;top:0;width:300px;height:190px;background:#fff;border:5px solid ${INK};border-radius:10px;box-sizing:border-box;direction:rtl">
  <div style="position:absolute;left:110px;top:-22px;width:80px;height:36px;background:${BLUE};opacity:.85;border-radius:4px"></div>
  <div class="txt w" style="position:absolute;left:0;top:34px;width:300px;text-align:center;font:600 46px/1.15 F;color:${INK}">נסגר הבוקר.<br>סליחה!</div></div>`;

/* ---------- COVER (white): frame 0, fully drawn ---------- */
const cov=$(`left:0;top:0;width:1080px;height:1920px;background:#fff;z-index:60`,`
  <div style="position:absolute;left:0;top:280px;width:1080px;display:flex;justify-content:center">${WORDMARK.replace('<svg ','<svg style="width:200px;height:auto" ')}</div>
  ${hl(395,'הגעתם לסיור.',INK,124)}${hl(530,'כבר נסגר.',BLUE,124)}
  <div style="position:absolute;left:0;top:${DY+640}px;width:1080px;height:6px;background:${INK}"></div>
  <div style="position:absolute;left:${DX}px;top:${DY}px">${doorSVG}</div>
  <div style="position:absolute;left:${DX+60}px;top:${DY+150}px;width:300px;height:190px;transform:rotate(-5deg)">${noteHTML}</div>`);
at(cov,0,COVER_END,{anim:'none',fo:0});
window.COVER={t:0.2,title:'הגעתם לסיור. כבר נסגר.'};

bg('#fff',0,DUR);

/* ---------- floor + door (whole reel) ---------- */
const scene=$(`left:0;top:0;width:1080px;height:1920px;z-index:3`,`
  <div style="position:absolute;left:0;top:${DY+640}px;width:1080px;height:6px;background:${INK}"></div>
  <div class="door" style="position:absolute;left:${DX}px;top:${DY}px">${doorSVG}</div>`);
at(scene,COVER_END,DUR,{anim:'none',fo:0,up:(l,t)=>{
  // beat 3: the door slides right and fades a little, to make room for the count
  const k=outCubic(seg(t,B3+.1,.5));scene.querySelector('.door').style.transform=`translateX(${k*190}px)`;
  scene.querySelector('.door').style.opacity=String(1-.75*k)}});

/* ---------- the note: flutters, then becomes the live count ---------- */
const note=$(`left:${DX+60}px;top:${DY+150}px;width:300px;height:190px;z-index:6`,noteHTML);
const countHTML=`<div class="cnt" style="position:absolute;left:0;top:0;width:620px;height:300px;background:#fff;border:6px solid ${BLUE};border-radius:36px;box-sizing:border-box;direction:rtl;display:none">
  <div class="w" style="position:absolute;right:36px;top:30px;font:500 40px/1 R;color:${MUTED}">חדר בדירת שותפים · רמת גן</div>
  <div class="w" style="position:absolute;right:36px;top:130px;font:700 64px/1 R;color:${INK}">כבר הגישו:</div>
  <div class="num w" style="position:absolute;left:50px;top:95px;font:600 160px/1 F;color:${BLUE};direction:ltr">0</div>
</div>`;
const cnt=$(`left:120px;top:800px;width:620px;height:300px;z-index:7`,countHTML);
at(note,COVER_END,DUR,{anim:'none',fo:0,up:(l,t)=>{
  const flap=t<B3?Math.sin(t*6.5)*4-5:-5;
  const big=outCubic(seg(t,B2+.2,.5))*(t<B3?1:1);
  const gone=seg(t,B3+.1,.3);
  note.style.transformOrigin='50% 0';
  note.style.transform=`rotate(${flap}deg) scale(${(1+big*.35)*(1-gone)})`;
  note.style.opacity=String(1-gone)}});
at(cnt,B3+.25,DUR,{anim:'pop',dur:.35,s0:.6,fo:0,up:(l,t)=>{
  cnt.querySelector('.cnt').style.display='block';
  const n=Math.round(14*outCubic(seg(t,B3+.5,1.4)));cnt.querySelector('.num').textContent=String(n)}});
for(let i=0;i<14;i++)ev(B3+.5+1.4*(1-Math.cbrt(1-(i+1)/14)),'pin',.3);
ev(B2+.2,'boing',.8);

/* ---------- beat 2: the way there (dotted blue route to the door) ---------- */
const RD="M60 1600 C 200 1560, 160 1420, 300 1400 S 330 1346, 340 1330";
const route=$(`left:0;top:0;width:1080px;height:1920px;z-index:4`,`<svg width="1080" height="1920" viewBox="0 0 1080 1920">
  <defs><mask id="rm" maskUnits="userSpaceOnUse" x="0" y="0" width="1080" height="1920"><path class="mk" d="${RD}" fill="none" stroke="#fff" stroke-width="40"/></mask></defs>
  <path d="${RD}" mask="url(#rm)" fill="none" stroke="${BLUE}" stroke-width="12" stroke-linecap="round" stroke-dasharray="2 26"/>
  <circle class="dot" r="18" fill="${BLUE}"/></svg>`);
at(route,B2,B3+.2,{anim:'none',fo:.15,up:(l,t)=>{
  const m=route.querySelector('.mk');const L=m.getTotalLength();const k=outCubic(seg(t,B2+.1,1.2));
  m.setAttribute('stroke-dasharray',`${L} ${L}`);m.setAttribute('stroke-dashoffset',String(L*(1-k)));
  const pt=m.getPointAtLength(L*k);const d=route.querySelector('.dot');d.setAttribute('cx',pt.x);d.setAttribute('cy',pt.y)}});

/* ---------- hook ---------- */
caption(395,['״אה, היא','נסגרה הבוקר.״'],COVER_END,P0,{say:'אה, היא נסגרה הבוקר.',fs:124,cols:[INK,BLUE],fo:.1,sfx:'thud'});

/* ---------- the prompt (by 3 s) ---------- */
const promptHTML=`<div style="position:absolute;left:110px;top:0;width:860px;height:230px;border-radius:60px;background:${SOFT};border:5px solid ${INK};box-sizing:border-box;display:flex;align-items:center;justify-content:center;gap:30px;direction:rtl">
  <div class="w" style="width:76px;height:76px;border-radius:38px;background:${BLUE};color:#fff;font:700 52px/76px R;text-align:center">@</div>
  <div class="w" style="font:600 90px/1.02 F;color:${INK};text-align:center">תייגו את מי<br>שעברו את זה.</div></div>`;
at($(`left:0;top:1395px;width:1080px;height:230px;z-index:9`,promptHTML),P0,B2,{say:'תתייגו את מי שעברו את זה.',dy:40,s0:.85,fo:.15,sfx:'pop2'});
window.PROMPT={t:2.4,text:'תייגו את מי שעברו את זה.'};
caption(470,['״כבר נסגר.״'],P0,B2,{say:false,fs:80,c:INK,anim:'none',fo:.1});

/* ---------- beat 2 ---------- */
caption(395,['וכל הדרך,','בשביל פתק.'],B2,B3,{say:'וכל הדרך, בשביל פתק.',fs:124,cols:[INK,BLUE],fo:.1,sfx:'whoosh'});

/* ---------- beat 3: how it goes on homie ---------- */
caption(395,['בהומי רואים','כמה כבר הגישו.'],B3,WM,{say:'בהומי רואים כמה כבר הגישו.',fs:118,cols:[INK,BLUE],fo:.1,sfx:'whoosh2'});
at($(`left:0;top:1395px;width:1080px;text-align:center;z-index:9`,`<div class="w" style="font:500 56px/1.25 R;color:${MUTED}">עוד לפני שיוצאים מהבית.</div>`),B3+.9,WM,{anim:'up',dy:30,fo:.12});

/* ---------- prompt again + brand ending ---------- */
at($(`left:0;top:1395px;width:1080px;height:230px;z-index:9`,promptHTML),WM,DUR,{anim:'up',dy:30,fo:0,sfx:'pop2',v:.6});
wordmark(WM,DUR);

/* ---------- footnote ---------- */
at($(`left:0;top:1650px;width:1080px;text-align:center`,`<div class="w" style="font:500 34px/1.2 R;color:${GREY}">הדמויות והמצבים בדיוניים. נתוני הדגמה.</div>`),COVER_END,DUR,{anim:'none',fo:0});

function render(t){runItems(t);turtle(null)}
window.BEATS={payoff:B3,outro:WM};
window.AUDIO={dur:DUR,seed:1033,sections:[[0,B3,'DET',.13,1,0],[B3,DUR,'MIN',.15,0,1]],ticks:[0.4,2.4]};
window.STRETCH=1.0;
window.VOICE={duck:0.7};   // narration = the say marks above
window.render=render;window.EVENTS=EVENTS;window.SCENES=SCENES;window.DUR=DUR;render(0);
