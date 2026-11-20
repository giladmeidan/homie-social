// Reel H12 (1012) — for owners · clean editorial: a ringing phone, frozen mid-ring. Before answering, the match reasons already answer the usual questions; the one gap is what the call is for.
const DUR=22.0;
const SCENES=[['a',0,14.6],['b',14.6,DUR]];
Tt.style.zIndex=50;
const LINEC='#D6DEEA',GREY='#9AA1AC';
const AEND=14.6;

bg('#fff',0,DUR);

/* ---------- phone ---------- */
const handset=(c)=>`<svg width="64" height="64" viewBox="0 0 64 64"><path d="M18 8 L26 8 L30 22 L24 27 Q30 38 37 40 L42 34 L56 38 L56 46 Q56 56 46 56 Q14 52 8 18 Q8 8 18 8Z" fill="${c}"/></svg>`;
const ok=`<svg width="48" height="48" viewBox="0 0 50 50"><circle cx="25" cy="25" r="23" fill="${BLUE}"/><path d="M14 26 L22 34 L37 17" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const no=`<svg width="48" height="48" viewBox="0 0 50 50"><circle cx="25" cy="25" r="21" fill="#fff" stroke="#B8BEC8" stroke-width="4"/><path d="M16 25 H34" stroke="${GREY}" stroke-width="5" stroke-linecap="round"/></svg>`;
const ROWS=[[1,'תקציב'],[1,'אזור'],[1,'ניקיון'],[0,'שעות שינה']];
const RT=[5.6,6.4,7.2,8.0];              // reason rows appear (each answers one question)
const rowsHTML=ROWS.map(([g,txt],i)=>`<div class="row" style="position:absolute;right:34px;left:34px;top:${420+i*96}px;height:76px;border-radius:38px;display:flex;align-items:center;gap:18px;padding:0 18px;direction:rtl;opacity:0">
  ${g?ok:no}<div class="w" style="font:${g?700:500} 44px/1 R;color:${g?INK:GREY}">${txt}</div></div>`).join('');
const phone=$(`left:270px;top:470px;width:540px;height:940px;border-radius:72px;background:#fff;border:10px solid ${INK};box-shadow:0 26px 60px rgba(17,17,17,.12);overflow:hidden;transform-origin:50% 0`,`
 <div style="position:absolute;left:190px;top:22px;width:140px;height:30px;border-radius:15px;background:${INK}"></div>
 <div class="cs" style="position:absolute;left:0;top:0;width:520px;height:920px">
   <div style="position:absolute;left:170px;top:120px;width:180px;height:180px;border-radius:50%;background:${SOFT};overflow:hidden"><svg viewBox="0 0 180 180" width="180" height="180">${person(90,112,52,PALE)}</svg></div>
   <div class="lab w" style="position:absolute;left:0;width:520px;top:345px;text-align:center;font:500 34px/1 R;color:${MUTED}">שיחה נכנסת</div>
   <div class="w" style="position:absolute;left:0;width:520px;top:400px;text-align:center;font:600 62px/1 F;color:${INK}">פנייה לחדר</div>
   <div class="w" style="position:absolute;left:0;width:520px;top:488px;text-align:center;font:500 32px/1 R;color:${MUTED}">חדר בדירת שותפים · רמת גן</div>
   <div style="position:absolute;left:70px;top:720px;width:130px;height:130px;border-radius:50%;background:${INK};display:flex;align-items:center;justify-content:center"><div style="transform:rotate(135deg);display:flex">${handset('#fff')}</div></div>
   <div class="ans" style="position:absolute;left:320px;top:720px;width:130px;height:130px;border-radius:50%;background:${BLUE};display:flex;align-items:center;justify-content:center">${handset('#fff')}</div>
 </div>
 <div class="ap" style="position:absolute;left:0;top:0;width:520px;height:920px;opacity:0">
   <div class="w" style="position:absolute;left:0;width:520px;top:78px;text-align:center;font:700 34px/1 R;color:${MUTED}">פנייה לחדר</div>
   <div class="ring" style="position:absolute;left:160px;top:120px;width:200px;height:200px">${ringHTML(200,22)}</div>
   <div class="w" style="position:absolute;left:0;width:520px;top:336px;text-align:center;font:700 34px/1 R;color:${BL2}">התאמה</div>
   <div style="position:absolute;left:34px;right:34px;top:392px;height:4px;background:${LINEC}"></div>
   ${rowsHTML}
   <div class="gap w" style="position:absolute;left:0;width:520px;top:820px;text-align:center;font:700 36px/1 R;color:${BLUE};opacity:0">את זה שואלים בשיחה</div>
 </div>`);
const RING=[[0.05,1.3],[12.9,13.35]];
at(phone,0,AEND,{anim:'none',fo:.2,up:(l,t)=>{
  let rot=0;for(const [a,b] of RING)if(t>=a&&t<b)rot=Math.sin((t-a)*48)*2.4;
  const dim=1-.78*seg(t,1.9,.25)*(1-seg(t,5.0,.35));phone.style.opacity=(phone.style.opacity||1)*dim;
  phone.style.transform=`scale(1.18) rotate(${rot}deg)`;
  const toAp=seg(t,5.1,.35),back=seg(t,12.4,.35);const apOn=toAp*(1-back);
  phone.querySelector('.ap').style.opacity=apOn;phone.querySelector('.cs').style.opacity=1-apOn;
  setRing(phone.querySelector('.ring'),.76*outCubic(seg(t,5.25,1.0)),Math.round(76*outCubic(seg(t,5.25,1.0)))+'%');
  [...phone.querySelectorAll('.row')].forEach((r,i)=>{const k=seg(t,RT[i],.3);r.style.opacity=clamp(k*3);r.style.transform=`translateX(${(1-outBack(k))*-40}px)`;
    const hi=i===3&&t>=9.7;r.style.border=hi?`5px solid ${BLUE}`:'5px solid transparent';r.style.background=hi?SOFT:'transparent'});
  phone.querySelector('.gap').style.opacity=clamp(seg(t,10.1,.3)*3);
  phone.querySelector('.lab').textContent=t>=13.0?'בשיחה':'שיחה נכנסת';
  const ans=phone.querySelector('.ans');const pk=seg(t,12.95,.3);ans.style.transform=`scale(${1+Math.sin(pk*Math.PI)*.18})`;ans.style.background=t>=13.1?BL2:BLUE;
}});
// ringing
[0.08,0.2,0.62,0.74].forEach((d,i)=>ev(d,'ding',i%2?1.5:1.35));
ev(1.3,'pin');ev(12.95,'pop2');

/* ---------- freeze badge ---------- */
const pause=$(`left:796px;top:412px;width:124px;height:124px;border-radius:50%;background:${BLUE};box-shadow:0 10px 26px rgba(37,99,235,.35)`,`
 <div class="pz" style="position:absolute;left:0;top:0;width:124px;height:124px"><div style="position:absolute;left:38px;top:34px;width:16px;height:56px;border-radius:5px;background:#fff"></div><div style="position:absolute;left:70px;top:34px;width:16px;height:56px;border-radius:5px;background:#fff"></div></div>
 <div class="pl" style="position:absolute;left:0;top:0;width:124px;height:124px;display:none"><svg width="124" height="124" viewBox="0 0 124 124"><path d="M48 34 L92 62 L48 90Z" fill="#fff"/></svg></div>`);
at(pause,1.3,13.4,{s0:.3,dur:.3,fo:.2,up:(l,t)=>{const p=t>=12.6;pause.querySelector('.pz').style.display=p?'none':'block';pause.querySelector('.pl').style.display=p?'block':'none'}});
pause.style.zIndex=20;

/* ---------- the usual questions (over the dimmed phone) ---------- */
const QS=['מה התקציב?','למה דווקא האזור הזה?','ומה עם ניקיון?','ישנים מוקדם?'];
const QT=[2.0,2.6,3.2,3.8],QX=[70,-70,60,-60];
QS.forEach((q,i)=>{const el=$(`left:0;top:${640+i*170}px;width:1080px;display:flex;justify-content:center`,`<div class="w" style="direction:rtl;background:#fff;border:5px solid ${INK};border-radius:46px;padding:22px 44px;font:500 54px/1.1 R;color:${INK};box-shadow:0 12px 30px rgba(17,17,17,.08)">${q}</div>`);
  el.style.zIndex=10;
  at(el,QT[i],5.35,{dy:30,s0:.55,fo:.2,sfx:'msg',up:(l,t)=>{const k=inOut(seg(t,4.95+i*.05,.35));el.style.transform+=` translateX(${QX[i]*(1-k)}px) translateY(${k*(1000-(640+i*170))}px) scale(${1-.6*k})`}})});
for(let i=0;i<4;i++)ev(RT[i],i===3?'pin':'ding',i===3?1:1+i*.1);

/* ---------- headlines ---------- */
caption(170,['רגע לפני'],0.05,1.6,{fs:118,c:INK,fo:.15,sfx:'pop'});
caption(300,['שעונים.'],0.3,1.6,{fs:118,c:BLUE,fo:.15});
caption(175,['מה שתמיד'],1.65,5.0,{fs:92,c:INK,fo:.15,anim:'up',dy:26,sfx:'swish'});
caption(290,['שואלים בשיחה:'],1.85,5.0,{fs:92,c:BLUE,fo:.15,anim:'up',dy:26});
caption(175,['והתשובות?'],5.05,9.6,{fs:92,c:INK,fo:.15,anim:'up',dy:26,sfx:'whoosh'});
caption(290,['כבר על המסך.'],5.3,9.6,{fs:92,c:BLUE,fo:.15,anim:'up',dy:26});
caption(175,['שלוש מתאימות.'],9.65,12.5,{fs:92,c:INK,fo:.15,anim:'up',dy:26,sfx:'pop2'});
caption(290,['על אחת מדברים.'],9.95,12.5,{fs:92,c:BLUE,fo:.15,anim:'up',dy:26});
caption(1690,['שיחה על מה שחשוב.'],10.4,12.5,{fs:62,c:MUTED,fo:.15,anim:'up',dy:22});
caption(220,['עכשיו עונים.'],12.6,AEND,{fs:118,c:INK,fo:.2,sfx:'pop'});
at($('left:0;top:1845px;width:1080px;text-align:center;font:500 34px/1.2 R;color:#8C8C8C;white-space:nowrap','הפנייה והנתונים להדגמה'),0.4,AEND,{anim:'none',fo:.2});

/* ---------- payoff ---------- */
const P0=AEND,P1=17.0;
caption(560,['הציון לא'],P0+.05,P1,{fs:104,c:INK,fo:.15,sfx:'whoosh'});
caption(690,['מחליף שיחה.'],P0+.3,P1,{fs:104,c:INK,fo:.15});
caption(920,['הוא אומר'],P0+.9,P1,{fs:104,c:BLUE,fo:.15,sfx:'pop2'});
caption(1050,['על מה לדבר.'],P0+1.15,P1,{fs:104,c:BLUE,fo:.15});

/* ---------- homie ---------- */
const E0=19.2;
wordmark(P1,DUR);
const fin=$('left:0;top:380px;width:1080px;height:900px;',`${hl(250,'רואים מי מתאים')}${hl(390,'לפני שמדברים.',BLUE)}${sub(560,'לבעלי דירות וחדרים.')}`);
at(fin,P1+.05,E0,{dy:90,s0:.92,dur:.4,sfx:'pop2'});
ev(P1+.5,'ding',1.2);
endCard(E0,DUR,'מכירים לפני שמדברים.');

function render(t){runItems(t);turtleWhite(t,P1+.05,[E0],E0+.25)}
window.AUDIO={dur:DUR,seed:1012,sections:[[0,5.1,'MIN',.13,0,0],[5.1,AEND,'CG',.14,1,0],[AEND,DUR,'FC',.19,1,1]],ticks:[1.3,5.0]};
window.render=render;window.EVENTS=EVENTS;window.SCENES=SCENES;window.DUR=DUR;render(0);
