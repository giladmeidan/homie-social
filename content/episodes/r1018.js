// Reel H18 (1018) — homie in action · clean editorial: "this chat is locked." A chat card with two locks: one opens when you like the room, the other when the people renting it like your request. Two likes -> the chat opens. One like? You wait. -> FEAT.mutual.
const DUR=21.6;
const SCENES=[['a',0,11.6],['b',11.6,DUR]];
Tt.style.zIndex=50;
const LINEC='#D6DEEA',GREY='#9AA1AC';

/* ---------- pieces ---------- */
const heartP=(c)=>`<path d="M0 12 C0 -4 22 -4 22 10 C22 -4 44 -4 44 12 C44 28 22 38 22 42 C22 38 0 28 0 12Z" fill="${c}"/>`;
// padlock badge: .sh = shackle group (animated open), .bd = body
const lockSVG=(sz)=>`<svg width="${sz}" height="${sz}" viewBox="0 0 160 160" style="display:block;overflow:visible">
  <circle class="lc" cx="80" cy="80" r="74" fill="#fff" stroke="${INK}" stroke-width="7"/>
  <g class="sh"><path d="M56 78 V58 A24 24 0 0 1 104 58 V78" fill="none" stroke="${INK}" stroke-width="12" stroke-linecap="round"/></g>
  <rect class="bd" x="42" y="74" width="76" height="56" rx="14" fill="${INK}"/>
  <circle cx="80" cy="98" r="7" fill="#fff"/><rect x="77" y="100" width="6" height="16" rx="3" fill="#fff"/></svg>`;
// k: 0 closed -> 1 open (shackle lifts and swings), blue when open
function setLock(el,k){const sh=el.querySelector('.sh');const lift=-20*outBack(clamp(k*1.4));const rot=-38*inOut(seg(k,.35,.65));
  sh.setAttribute('transform',`translate(0 ${lift}) rotate(${rot} 104 78)`);const on=k>.3;
  sh.querySelector('path').setAttribute('stroke',on?BLUE:INK);el.querySelector('.bd').setAttribute('fill',on?BLUE:INK);
  const lc=el.querySelector('.lc');lc.setAttribute('stroke',on?BLUE:INK);lc.setAttribute('fill',on?SOFT:'#fff')}

/* chat card: two locks on the top edge (RTL: "you" on the right, "them" on the left) */
const chatHTML=()=>`<div style="position:absolute;left:0;top:0;width:760px;height:540px;box-sizing:border-box;border-radius:48px;background:#fff;border:6px solid ${INK};box-shadow:0 24px 56px rgba(17,17,17,.10)"></div>
  <div class="w" style="position:absolute;left:0;width:760px;top:104px;text-align:center;font:700 34px/1 R;color:${MUTED};direction:rtl">צ׳אט · חדר בדירת שותפים · רמת גן</div>
  <div style="position:absolute;left:40px;right:40px;top:158px;height:4px;background:${LINEC}"></div>
  <div class="lkL" style="position:absolute;left:115px;top:-80px">${lockSVG(150)}</div>
  <div class="lkR" style="position:absolute;left:495px;top:-80px">${lockSVG(150)}</div>
  <div class="locked">
    <div style="position:absolute;left:70px;top:210px;width:420px;height:70px;border-radius:35px;background:#EEF1F5"></div>
    <div style="position:absolute;right:70px;top:300px;width:360px;height:70px;border-radius:35px;background:#EEF1F5"></div>
    <div class="w" style="position:absolute;left:0;width:760px;top:420px;text-align:center;font:700 44px/1 R;color:${GREY}">עדיין סגור</div></div>
  <div class="msgs" style="opacity:0">
    <div class="m1 w" style="position:absolute;left:44px;top:200px;max-width:560px;background:${SOFT};border-radius:36px 36px 36px 8px;padding:22px 34px;font:500 46px/1.2 R;color:${INK};direction:rtl">היי! גם אצלנו לייק.</div>
    <div class="m2 w" style="position:absolute;right:44px;top:330px;max-width:560px;background:${BLUE};border-radius:36px 36px 8px 36px;padding:22px 34px;font:500 46px/1.2 R;color:#fff;direction:rtl">מעולה. מתי אפשר לבוא?</div></div>`;

/* ---------- COVER: frame 0 is the cover, fully drawn, held until COVER_END ---------- */
const COVER_END=0.7;
const covChat=$(`left:160px;top:800px;width:760px;height:540px;transform:scale(1.12);transform-origin:50% 0`,chatHTML());
covChat.querySelector('.locked').style.display='none';covChat.querySelector('.msgs').style.opacity=1;
setLock(covChat.querySelector('.lkL'),1);setLock(covChat.querySelector('.lkR'),1);
const cov=$(`left:0;top:0;width:1080px;height:1920px;background:#fff;z-index:60`,`
  ${hl(400,'צ׳אט שנפתח',INK,132)}${hl(560,'רק בשניים.',BLUE,132)}`);
cov.appendChild(covChat);covChat.style.left='160px';
at(cov,0,COVER_END,{anim:'none',fo:0});
window.COVER={t:0.3,title:'צ׳אט שנפתח רק בשניים.'};

bg('#fff',0,DUR);

/* ---------- timing ---------- */
const H0=COVER_END,B1=3.6,B2=7.6,OPEN=11.6,ONE=15.0,P1=17.6,E0=19.4;
const L1=5.3,L2=9.3;                    // right lock (you) opens / left lock (them) opens

/* ---------- the chat card (stays from the hook to the open chat) ---------- */
const chat=$(`left:160px;top:960px;width:760px;height:540px;transform-origin:50% 0`,chatHTML());
at(chat,H0,ONE,{anim:'none',fo:.2,up:(l,t)=>{
  setLock(chat.querySelector('.lkR'),seg(t,L1,.45));setLock(chat.querySelector('.lkL'),seg(t,L2,.45));
  // shake while locked, on the hook
  let dx=0;if(t>1.3&&t<1.75)dx=Math.sin((t-1.3)*60)*10;
  const up=inOut(seg(t,OPEN,.5));chat.style.transform=`translate(${dx}px,${-300*up}px) scale(${1+.12*up})`;
  const m=seg(t,OPEN+.35,.3);chat.querySelector('.locked').style.opacity=1-m;chat.querySelector('.msgs').style.opacity=m;
  const m1=chat.querySelector('.m1'),m2=chat.querySelector('.m2');
  const k1=seg(t,OPEN+.7,.3),k2=seg(t,OPEN+1.6,.3);
  m1.style.opacity=clamp(k1*3);m1.style.transform=`scale(${.6+.4*outBack(k1)})`;m1.style.transformOrigin='0 100%';
  m2.style.opacity=clamp(k2*3);m2.style.transform=`scale(${.6+.4*outBack(k2)})`;m2.style.transformOrigin='100% 100%';
  // labels under the locks
  chat.querySelector('.lbR').style.opacity=1-up;chat.querySelector('.lbL').style.opacity=1-up;
  chat.querySelector('.lbR').style.color=t>=L1+.2?BLUE:INK;chat.querySelector('.lbL').style.color=t>=L2+.2?BLUE:INK;
}});
chat.insertAdjacentHTML('beforeend',`<div class="lbR w" style="position:absolute;left:470px;width:200px;top:-140px;text-align:center;font:700 40px/1 R;direction:rtl">אתם</div>
  <div class="lbL w" style="position:absolute;left:40px;width:300px;top:-140px;text-align:center;font:700 40px/1 R;direction:rtl">מי שמפרסמים</div>`);
ev(1.3,'thud');ev(OPEN+.7,'msg');ev(OPEN+1.6,'msg');

/* ---------- action cards: the like on the room, then the like on your request ---------- */
const actHTML=(title,line,icon)=>`<div style="position:absolute;left:0;top:0;width:820px;height:250px;box-sizing:border-box;border-radius:40px;background:#fff;border:5px solid ${INK};box-shadow:0 16px 40px rgba(17,17,17,.08)"></div>
  <div style="position:absolute;right:34px;top:35px;width:180px;height:180px;border-radius:30px;background:${SOFT};overflow:hidden">${icon}</div>
  <div class="w" style="position:absolute;right:244px;top:62px;font:700 48px/1 R;color:${INK};direction:rtl;white-space:nowrap">${title}</div>
  <div class="w" style="position:absolute;right:244px;top:140px;font:500 38px/1 R;color:${MUTED};direction:rtl;white-space:nowrap">${line}</div>
  <div class="hb" style="position:absolute;left:40px;top:60px;width:130px;height:130px;border-radius:50%;border:5px solid ${INK};box-sizing:border-box;background:#fff">
    <svg width="130" height="130" viewBox="0 0 130 130" style="position:absolute;left:-5px;top:-5px"><g class="hp" transform="translate(37 42) scale(1.27)">${heartP('#fff')}</g><g transform="translate(37 42) scale(1.27)"><path d="M0 12 C0 -4 22 -4 22 10 C22 -4 44 -4 44 12 C44 28 22 38 22 42 C22 38 0 28 0 12Z" fill="none" stroke="${INK}" stroke-width="4" class="ho"/></g></svg></div>`;
const roomIcon=`<svg viewBox="0 0 180 180" width="180" height="180"><path d="M40 92 L90 50 L140 92 V140 H40Z" fill="#fff" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/><rect x="78" y="104" width="24" height="36" fill="${BLUE}"/></svg>`;
const youIcon=`<svg viewBox="0 0 180 180" width="180" height="180">${person(90,112,52,PALE)}</svg>`;
// flying heart from the card's button to a lock
function actCard(a,b,tap,title,line,icon,to){
  const el=$(`left:130px;top:480px;width:820px;height:250px`,actHTML(title,line,icon));
  at(el,a,b,{dy:40,s0:.9,fo:.2,up:(l,t)=>{const k=seg(t,tap,.12);const hb=el.querySelector('.hb');
    el.querySelector('.hp path').setAttribute('fill',k>0?BLUE:'#fff');el.querySelector('.ho').setAttribute('stroke',k>0?BLUE:INK);
    hb.style.borderColor=k>0?BLUE:INK;hb.style.background=k>0?SOFT:'#fff';hb.style.transform=`scale(${1+Math.sin(seg(t,tap,.3)*Math.PI)*.18})`}});
  ev(tap,'pop');
  // fly: from the heart button (x 130+40+65, y 520+60+65) to the lock (to.x,to.y)
  const fx=235,fy=605;
  const flyH=$(`left:0;top:0;width:60px;height:60px;z-index:30`,`<svg width="60" height="60" viewBox="-4 -4 52 52">${heartP(BLUE)}</svg>`);
  at(flyH,tap+.15,tap+.8,{anim:'none',fo:0,up:(l,t)=>{const k=inOut(seg(t,tap+.15,.6));
    const x=fx+(to.x-fx)*k,y=fy+(to.y-fy)*k-Math.sin(k*Math.PI)*120;
    flyH.style.transform=`translate(${x-30}px,${y-30}px) scale(${1.3-.3*k})`;flyH.style.opacity=1-seg(k,.85,.15)}});
  ev(tap+.2,'swish')}
// lock centres on screen: right lock 160+495+75=730, left lock 160+115+75=350, y 960-80+75=955
actCard(B1+.1,B2,4.6,'חדר בדירת שותפים','רמת גן · פנוי מינואר',roomIcon,{x:730,y:955});
actCard(B2+.1,OPEN,8.6,'הפנייה שלכם','נשלחה. מחכה ללייק.',youIcon,{x:350,y:955});
ev(L1+.05,'ding',1.2);ev(L2+.05,'ding',1.35);

/* ---------- headlines ---------- */
caption(170,['הצ׳אט הזה'],H0,B1,{fs:110,c:INK,fo:.12,sfx:'pop'});
caption(300,['נעול.'],H0+.3,B1,{fs:120,c:BLUE,fo:.12});
caption(1580,['יש לו שני מנעולים.'],H0+1.1,B1,{fs:62,c:MUTED,fo:.12,anim:'up',dy:20});
caption(170,['מנעול ראשון:'],B1,B2,{fs:104,c:INK,fo:.12,anim:'up',dy:26,sfx:'whoosh'});
caption(300,['אתם.'],B1+.3,B2,{fs:116,c:BLUE,fo:.12,anim:'up',dy:26});
caption(1580,['לייק על החדר.'],L1+.1,B2,{fs:62,c:MUTED,fo:.12,anim:'up',dy:20});
caption(170,['מנעול שני:'],B2,OPEN,{fs:104,c:INK,fo:.12,anim:'up',dy:26,sfx:'whoosh'});
caption(300,['מי שמפרסמים.'],B2+.3,OPEN,{fs:110,c:BLUE,fo:.12,anim:'up',dy:26});
caption(1580,['לייק על הפנייה שלכם.'],L2+.1,OPEN,{fs:62,c:MUTED,fo:.12,anim:'up',dy:20});
caption(170,['שני לייקים.'],OPEN,ONE,{fs:110,c:INK,fo:.12,sfx:'pop2'});
caption(300,['הצ׳אט פתוח.'],OPEN+.3,ONE,{fs:116,c:BLUE,fo:.12});

/* ---------- one like? ---------- */
const one=$(`left:0;top:600px;width:1080px;height:300px`,`<div class="a" style="position:absolute;left:600px;top:0">${lockSVG(220)}</div><div class="b" style="position:absolute;left:260px;top:0">${lockSVG(220)}</div>`);
at(one,ONE+.05,P1,{dy:40,s0:.85,fo:.2,up:(l,t)=>{setLock(one.querySelector('.a'),1);setLock(one.querySelector('.b'),0);
  let dx=0;const s=ONE+.9;if(t>s&&t<s+.45)dx=Math.sin((t-s)*60)*9;one.querySelector('.b').style.transform=`translateX(${dx}px)`}});
ev(ONE+.9,'thud',.8);
caption(170,['לייק אחד?'],ONE,P1,{fs:116,c:INK,fo:.15,sfx:'whoosh'});
caption(310,['מחכים.'],ONE+.45,P1,{fs:120,c:BLUE,fo:.15,sfx:'pop'});
caption(1000,['צ׳אט נפתח רק'],ONE+1.0,P1,{fs:76,c:INK,fo:.15,anim:'up',dy:20});
caption(1095,['כששני הצדדים רוצים.'],ONE+1.15,P1,{fs:76,c:INK,fo:.15,anim:'up',dy:20});

at($('left:0;top:1845px;width:1080px;text-align:center;font:500 34px/1.2 R;color:#8C8C8C;white-space:nowrap','הדגמה. הנתונים והדמויות לדוגמה.'),H0,P1,{anim:'none',fo:.2});

/* ---------- homie ---------- */
wordmark(P1,DUR);
FEAT.mutual(P1,E0);
endCard(E0,DUR,'שני לייקים. צ׳אט אחד.');

function render(t){runItems(t);turtleWhite(t,P1+.05,[E0],E0+.25)}
window.AUDIO={dur:DUR,seed:1018,sections:[[0,B1,'CG',.12,0,1],[B1,OPEN,'FC',.15,1,0],[OPEN,P1,'MIN',.14,1,0],[P1,DUR,'POP',.19,1,1]],ticks:[3.6,11.2]};
window.STRETCH=1.12;
window.render=render;window.EVENTS=EVENTS;window.SCENES=SCENES;window.DUR=DUR;render(0);
