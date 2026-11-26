// Reel H38 (1038) — Pain point · style C · voiced. N4: "ספרו קצת על עצמכם" (the same intro paragraph, pasted again and again). Slot 2026-11-26 13.
// Cover (white): "אותה פסקה, / פעם עשרים." + a pile of identical intro messages (top one readable, "×20"),
//   "ניקיון" circled in blue and the reply bubble "ומה עם ניקיון?".
// Hook: copies of the message land on the pile (×16 -> ×20) -> "קצת עליי. / שוב." -> prompt "שלחו למי / שמחפשים." at 2.8 s
// -> typing dots -> reply "ומה עם ניקיון?" while "ניקיון" in the paragraph lights blue
// -> "בהומי, הציון / מראה למה." the pile turns into one demo match card (86%, ✓ניקיון ✓שקט בלילה ✓בלי עישון) -> wordmark.
const DUR=11.9;
const COVER_END=0.5,P0=2.8,B2=5.7,B3=8.0,WM=11.1;
const SCENES=[['a',0,B3],['b',B3,DUR]];
Tt.style.zIndex=50;
const GREY='#8C8C8C';

/* ---------- small static wordmark (frame 0 to the brand ending) ---------- */
const smallWM=()=>{const m=$(`left:0;top:280px;width:1080px;display:flex;justify-content:center;z-index:70`,WORDMARK);
  m.querySelector('svg').style.cssText='width:200px;height:auto;display:block';return m};
at(smallWM(),0,WM,{anim:'none',fo:0});

/* ---------- the intro message card, 780 x 470 ---------- */
const CX=150,CY=745,CW=780,CH=470;
const cardHTML=(n,hi)=>`<div style="position:absolute;left:0;top:0;width:${CW}px;height:${CH}px;background:#fff;border:6px solid ${INK};border-radius:34px;box-sizing:border-box;direction:rtl">
  <div class="w" style="position:absolute;right:40px;top:30px;font:500 36px/1 R;color:${GREY}">הודעה · חדר בדירת שותפים</div>
  <div class="cnt w" style="position:absolute;left:30px;top:22px;padding:0 22px;height:58px;border-radius:29px;background:${BLUE};color:#fff;font:700 40px/58px R;direction:ltr">×${n}</div>
  <div class="w" style="position:absolute;right:40px;top:100px;font:700 58px/1 R;color:${INK}">היי! קצת עליי:</div>
  <div class="w" style="position:absolute;right:40px;top:180px;width:700px;font:500 50px/1.36 R;color:${INK};text-align:right">
    עבודה מהבית.<br>
    <span class="nk" style="display:inline-block;padding:0 14px;margin:0 -14px;border-radius:40px;border:5px solid ${hi?BLUE:'transparent'};color:${hi?BLUE:INK};line-height:1.2">ניקיון</span>? חשוב לי.<br>
    שקט בלילה.<br>בלי עישון. בלי חיות.</div></div>`;
const backHTML=(rot,dx,dy)=>`<div style="position:absolute;left:${dx}px;top:${dy}px;width:${CW}px;height:${CH}px;background:#fff;border:6px solid ${INK};border-radius:34px;box-sizing:border-box;transform:rotate(${rot}deg)">
  <div style="position:absolute;right:40px;top:110px;width:360px;height:22px;border-radius:11px;background:#E4E4E4"></div>
  <div style="position:absolute;right:40px;top:180px;width:520px;height:18px;border-radius:9px;background:#EDEDED"></div>
  <div style="position:absolute;right:40px;top:248px;width:440px;height:18px;border-radius:9px;background:#EDEDED"></div></div>`;
const pileHTML=`${backHTML(-5,-14,26)}${backHTML(4,18,14)}${backHTML(-1.6,4,-10)}`;
const bubbleHTML=`<div style="position:absolute;left:0;top:0;padding:18px 44px 22px;background:${INK};border-radius:44px 44px 44px 10px;color:#fff;font:600 72px/1.1 F;direction:rtl;white-space:nowrap">ומה עם ניקיון?</div>`;

/* ---------- COVER (white): frame 0, fully drawn ---------- */
const cov=$(`left:0;top:0;width:1080px;height:1920px;background:#fff;z-index:60`,`
  <div style="position:absolute;left:0;top:280px;width:1080px;display:flex;justify-content:center">${WORDMARK.replace('<svg ','<svg style="width:200px;height:auto" ')}</div>
  ${hl(430,'אותה פסקה,',INK,122)}${hl(565,'פעם עשרים.',BLUE,122)}
  <div style="position:absolute;left:${CX}px;top:${CY}px;width:${CW}px;height:${CH}px">${pileHTML}<div style="position:absolute;left:0;top:0">${cardHTML(20,true)}</div></div>
  <div style="position:absolute;left:110px;top:1250px">${bubbleHTML}</div>`);
at(cov,0,COVER_END,{anim:'none',fo:0});
window.COVER={t:0.25,title:'אותה פסקה, פעם עשרים.'};

bg('#fff',0,DUR);

/* ---------- the pile: copies keep landing (motion right after the cover) ---------- */
const PASTES=[0.62,1.17,1.72,2.27];
const pile=$(`left:${CX}px;top:${CY}px;width:${CW}px;height:${CH}px;z-index:4`,pileHTML+`<div class="top" style="position:absolute;left:0;top:0">${cardHTML(16,false)}</div>`);
const topC=pile.querySelector('.top');
for(const p of PASTES)ev(p,'pop',.7);
at(pile,COVER_END,B3+.35,{anim:'none',fo:.3,up:(l,t)=>{
  let n=16,drop=0;for(const p of PASTES){if(t>=p){n++;const k=seg(t,p,.28);if(k<1)drop=1-outCubic(k)}}
  topC.querySelector('.cnt').textContent='×'+n;
  topC.style.transform=`translateY(${-drop*420}px) rotate(${drop*-3}deg)`;
  // beat 2: "ניקיון" lights blue and the card shakes once
  const hi=t>=B2;const nk=topC.querySelector('.nk');nk.style.borderColor=hi?BLUE:'transparent';nk.style.color=hi?BLUE:INK;
  const sh=t>=B2&&t<B2+.4?Math.sin((t-B2)*60)*6*(1-(t-B2)/.4):0;
  const bob=t>2.5&&t<B2?Math.sin(t*3)*5:0;
  // beat 3: the pile folds away
  const g=outCubic(seg(t,B3,.35));
  pile.style.transform=`translate(${sh}px,${bob}px) scale(${1-g*.35})`;pile.style.opacity=String(1-g)}});

/* ---------- hook ---------- */
caption(432,['קצת עליי.','שוב.'],COVER_END,B3,{say:'קצת עליי. שוב.',fs:124,cols:[INK,BLUE],fo:.15,sfx:'thud'});

/* ---------- the prompt (by 3 s) ---------- */
const promptHTML=`<div style="position:absolute;left:110px;top:0;width:860px;height:220px;border-radius:60px;background:${SOFT};border:5px solid ${INK};box-sizing:border-box;display:flex;align-items:center;justify-content:center;gap:34px;direction:rtl">
  <div style="width:84px;height:84px;border-radius:42px;background:${BLUE};display:flex;align-items:center;justify-content:center">
    <svg width="46" height="46" viewBox="0 0 46 46"><path d="M40 6 L6 20 L19 25 L24 40 Z" fill="#fff"/><path d="M40 6 L19 25" stroke="${BLUE}" stroke-width="3"/></svg></div>
  <div class="w" style="font:600 90px/1.02 F;color:${INK};text-align:center">שלחו למי<br>שמחפשים.</div></div>`;
at($(`left:0;top:1385px;width:1080px;height:220px;z-index:9`,promptHTML),P0,B3,{say:'תשלחו למי שמחפשים.',dy:40,s0:.85,fo:.2,sfx:'pop2'});
window.PROMPT={t:2.8,text:'שלחו למי שמחפשים.'};

/* ---------- beat 2: the other side types... and asks what is already written ---------- */
const dots=$(`left:110px;top:1250px;width:220px;height:110px;z-index:8`,`<div style="position:absolute;left:0;top:0;width:200px;height:104px;background:${INK};border-radius:44px 44px 44px 10px;display:flex;align-items:center;justify-content:center;gap:18px">
  <i class="d" style="width:22px;height:22px;border-radius:11px;background:#fff;display:block"></i><i class="d" style="width:22px;height:22px;border-radius:11px;background:#fff;display:block"></i><i class="d" style="width:22px;height:22px;border-radius:11px;background:#fff;display:block"></i></div>`);
at(dots,4.0,B2,{dy:20,s0:.8,fo:0,sfx:'msg',v:.5,up:(l,t)=>{dots.querySelectorAll('.d').forEach((d,i)=>{d.style.transform=`translateY(${Math.sin(t*9-i*.9)*8}px)`})}});
at($(`left:110px;top:1250px;z-index:8`,bubbleHTML),B2,B3,{say:'ומה עם ניקיון?',dy:30,s0:.8,fo:.25,sfx:'boing'});

/* ---------- beat 3: how it goes on homie (one small demo element) ---------- */
caption(432,['בהומי, הציון','מראה למה.'],B3,WM,{say:'בהומי, הציון מראה למה.',fs:118,cols:[INK,BLUE],fo:.1,sfx:'whoosh2'});
const chip=(txt,on)=>`<div class="ch w" style="display:flex;align-items:center;gap:16px;height:76px;padding:0 28px;border-radius:38px;background:${on?BLUE:SOFT};color:${on?'#fff':INK};font:700 44px/1 R;direction:rtl;margin-bottom:22px;width:max-content">
  <span style="font:700 44px/1 R">✓</span>${txt}</div>`;
const match=$(`left:${CX}px;top:765px;width:${CW}px;height:430px;z-index:6`,`<div style="position:absolute;left:0;top:0;width:${CW}px;height:430px;background:#fff;border:6px solid ${BLUE};border-radius:36px;box-sizing:border-box;direction:rtl">
  <div class="w" style="position:absolute;right:40px;top:32px;font:500 38px/1 R;color:${GREY}">חדר בדירת שותפים · גבעתיים</div>
  <div style="position:absolute;right:40px;top:110px">${chip('ניקיון',true)}${chip('שקט בלילה',false)}${chip('בלי עישון',false)}</div>
  <div class="rg0" style="position:absolute;left:44px;top:100px;width:270px;height:270px">${ringHTML(270,28)}</div>
  <div class="w" style="position:absolute;left:44px;top:380px;width:270px;text-align:center;font:500 34px/1 R;color:${MUTED}">התאמה</div></div>`);
const rg0=match.querySelector('.rg0');const chips=[...match.querySelectorAll('.ch')];
at(match,B3+.2,DUR,{anim:'pop',dur:.38,s0:.7,dy:60,fo:0,up:(l,t)=>{
  const k=outCubic(seg(t,B3+.4,1.0));setRing(rg0,.86*k,Math.round(86*k)+'%');
  chips.forEach((c,i)=>{const e=outBack(seg(t,B3+.55+i*.3,.3));c.style.opacity=String(clamp(e*2));c.style.transform=`translateX(${(1-e)*-60}px)`})}});
[0,1,2].forEach(i=>ev(B3+.55+i*.3,'pin',.45));
at($(`left:0;top:1235px;width:1080px;text-align:center;z-index:9`,`<div class="w" style="font:500 56px/1.25 R;color:${MUTED}">עוד לפני ההודעה.</div>`),B3+1.3,WM,{anim:'up',dy:30,fo:.12});

/* ---------- prompt again + brand ending ---------- */
at($(`left:0;top:1385px;width:1080px;height:220px;z-index:9`,promptHTML),WM,DUR,{anim:'up',dy:30,fo:0,sfx:'pop2',v:.6});
wordmark(WM,DUR);

/* ---------- footnote ---------- */
at($(`left:0;top:1650px;width:1080px;text-align:center`,`<div class="w" style="font:500 34px/1.2 R;color:${GREY}">הדמויות והמצבים בדיוניים. נתוני הדגמה.</div>`),COVER_END,DUR,{anim:'none',fo:0});

function render(t){runItems(t);turtle(null)}
window.BEATS={payoff:B3,outro:WM};
window.AUDIO={dur:DUR,seed:1038,sections:[[0,B3,'POP',.15,0,1],[B3,DUR,'FC',.17,1,1]],ticks:[0.5,2.8]};
window.STRETCH=1.0;
window.VOICE={duck:0.7};   // narration = the say marks above
window.render=render;window.EVENTS=EVENTS;window.SCENES=SCENES;window.DUR=DUR;render(0);
