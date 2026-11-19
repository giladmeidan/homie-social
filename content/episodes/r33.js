// Reel 33 — "הדירה שאמרה לי לא": the 59% card says "over budget" before you fall in love
const DUR=21.8;
const SCENES=[['a',0,10.4],['b',10.4,DUR]];
Tt.style.zIndex=50;
const END_A=10.95;
bg(INK,0,END_A);
caption(150,['דירה מושלמת.'],0.1,END_A,{fs:120,fo:0});

// the "perfect" listing card
const houseIcon=`<svg viewBox="0 0 200 140" width="200" height="140"><path d="M20 70 L100 12 L180 70 V132 H20Z" fill="#fff" stroke="${INK}" stroke-width="8" stroke-linejoin="round"/><rect x="82" y="84" width="36" height="48" rx="6" fill="${BLUE}"/></svg>`;
at($(`left:90px;top:330px;width:900px;height:560px;border-radius:56px;background:#fff`,
 `<div style="position:absolute;left:36px;top:36px;width:828px;height:250px;border-radius:36px;background:${SOFT};display:flex;align-items:center;justify-content:center">${houseIcon}</div>
  <div class="w" style="position:absolute;left:0;width:900px;top:312px;text-align:center;font:600 76px/1 F;color:${INK};direction:ltr;unicode-bidi:isolate">₪7,900 / חודש</div>
  <div class="w" style="position:absolute;left:0;width:900px;top:410px;text-align:center;font:500 54px/1 R;color:${MUTED}">3 חדרים · מוארת · שקטה</div>`),0.6,END_A,{anim:'pop',s0:.9,dur:.35,fo:0,sfx:'pop'});
bubble(950,'היי, עדיין רלוונטית?','r',{a:2.5,b:END_A,at:{fo:0}});
bubble(1120,'כן! ₪7,900 לחודש.','l',{name:'בעלת הדירה',tone:'soft',a:4.1,b:END_A,at:{fo:0}});
bubble(1310,'התקציב שלי 7,000...','r',{a:5.8,b:END_A,at:{fo:0}});
bubble(1480,'אז לא.','l',{name:'בעלת הדירה',tone:'soft',weight:700,a:7.3,b:END_A,at:{fo:0},sfx:'thud'});
caption(1610,['יום שלם','בשביל "אז לא".'],8.6,END_A,{fs:72,cols:['#fff','#8FB1F7'],fo:0,sfx:'dun'});
at($(`left:0;top:1840px;width:1080px;text-align:center;font:500 38px/1.2 R;color:#8C8C8C;white-space:nowrap`,'הדמויות והמצבים בדיוניים'),0.8,END_A,{anim:'none',fo:0});

wipe(10.4,'אצלנו זה כתוב.');
wordmark(11.5,DUR);
// the real 59% card: three matches + an honest amber row
const rowOK=(t)=>`<div class="row w" style="height:84px;padding:0 30px;border-radius:42px;background:#fff;border:3px solid ${BLUE};color:${BL2};font:700 44px/78px R;display:flex;align-items:center;gap:16px;opacity:0;direction:rtl"><svg width="34" height="34" viewBox="0 0 34 34"><path d="M6 18 L14 26 L28 9" stroke="${BLUE}" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>${t}</div>`;
const rowWarn=(t)=>`<div class="row w" style="height:84px;padding:0 30px;border-radius:42px;background:#FFF7ED;border:3px solid ${AMBER};color:${AMBER};font:700 44px/78px R;display:flex;align-items:center;gap:16px;opacity:0;direction:rtl"><span style="font:700 46px/1 R">!</span>${t}</div>`;
[0.6,0.8,1.0].forEach(d=>ev(11.55+d,'ding',1+d*.2));ev(11.55+1.3,'dun');
feat(11.55,14.4,`<div class="rb" style="position:absolute;left:415px;top:0;width:250px;height:250px">${ringHTML(250,28)}</div>
 <div class="w" style="position:absolute;left:0;width:1080px;top:262px;text-align:center;font:700 46px/1 R;color:${MUTED}">התאמה חלקית</div>
 <div style="position:absolute;left:90px;top:350px;width:900px;display:flex;flex-direction:column;align-items:center;gap:20px">${rowOK('תאריך הכניסה תואם')}${rowOK('באזור שבחרתם')}${rowWarn('המחיר מעל התקציב')}</div>`,
 (l,el)=>{setRing(el.querySelector('.rb'),.59*outCubic(seg(l,.1,.55)),Math.round(59*outCubic(seg(l,.1,.55)))+'%');
  [...el.querySelectorAll('.row')].forEach((c,i)=>{const p=seg(l,.55+i*.25,.28),e=outBack(p);c.style.opacity=clamp(p*3);c.style.transform=`translateY(${(1-e)*40}px) scale(${.6+.4*e})`})});
feat(14.4,16.2,`${hl(380,'מה לא מתאים?')}${hl(510,'יודעים מראש.',BLUE)}${sub(690,'לפני שפונים.')}`);
FEAT.free(16.2,17.8);
endCard(17.8,DUR);

function render(t){runItems(t);turtleWhite(t,11.55,[11.55,14.4,16.2],17.8)}
window.AUDIO={dur:DUR,seed:33,sections:[[0,10.4,'DET',.12,1,0],[10.4,DUR,'POP',.19,1,1]],ticks:[0,0]};
window.render=render;window.EVENTS=EVENTS;window.SCENES=SCENES;window.DUR=DUR;render(0);
