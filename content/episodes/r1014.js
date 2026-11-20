// Reel H14 (1014) — renting smart · clean editorial: a question from a year ahead ("was this scratch here when you moved in?"), answered by three move-in-day habits: photograph every room, the meters, test every key, then send it all in one message.
const DUR=23.0;
const SCENES=[['a',0,8.0],['b',8.0,15.6],['c',15.6,DUR]];
Tt.style.zIndex=50;
const LINEC='#D6DEEA',GREY='#9AA1AC',WALL='#F4F6FA';
const ok=(s=48)=>`<svg width="${s}" height="${s}" viewBox="0 0 50 50"><circle cx="25" cy="25" r="23" fill="${BLUE}"/><path d="M14 26 L22 34 L37 17" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const wallSVG=(w,scr=1)=>`<svg viewBox="0 0 800 480" width="${w}" height="${w*.6}"><rect width="800" height="480" fill="${WALL}"/><rect y="418" width="800" height="62" fill="#E3E8F0"/>
 <rect x="90" y="80" width="240" height="180" rx="6" fill="#fff" stroke="${INK}" stroke-width="7"/><line x1="210" y1="80" x2="210" y2="260" stroke="${INK}" stroke-width="5"/>
 <rect x="530" y="96" width="190" height="322" rx="6" fill="#fff" stroke="${INK}" stroke-width="7"/><circle cx="556" cy="270" r="9" fill="${INK}"/>
 <path d="M300 352 l30 -16 l22 12 l34 -20 l26 12" stroke="${INK}" stroke-width="${6*scr}" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const AEND=15.6;

bg('#fff',0,DUR);

/* ---------- hook: a question from a year ahead ---------- */
caption(170,['בעוד שנה,'],0.05,3.1,{fs:118,c:INK,fo:.15,sfx:'pop'});
caption(305,['מישהו ישאל:'],0.3,3.1,{fs:118,c:BLUE,fo:.15});
const hookCard=$(`left:110px;top:560px;width:860px;height:640px;border-radius:44px;background:#fff;border:4px solid ${LINEC};overflow:hidden`,`
 <div style="position:absolute;left:30px;top:30px">${wallSVG(800)}</div>
 <div class="hi" style="position:absolute;left:290px;top:210px;width:200px;height:140px;border-radius:50%;border:7px solid ${BLUE};opacity:0"></div>`);
at(hookCard,0.55,3.1,{dy:40,s0:.94,fo:.2,up:(l)=>{const k=seg(l,.5,.3);const h=hookCard.querySelector('.hi');h.style.opacity=k;h.style.transform=`scale(${1.3-.3*outBack(k)})`}});
const q1=$(`left:0;top:1260px;width:1080px;display:flex;justify-content:center`,`<div class="w" style="direction:rtl;background:#fff;border:5px solid ${INK};border-radius:50px;padding:26px 48px;font:500 58px/1.15 R;color:${INK};box-shadow:0 12px 30px rgba(17,17,17,.08)">״השריטה הזאת? הייתה כשנכנסתם?״</div>`);
at(q1,1.15,3.1,{dy:30,s0:.6,fo:.2,sfx:'msg'});
caption(1470,['…הייתה?'],2.0,3.1,{fs:72,c:MUTED,fo:.2,anim:'up',dy:20});

/* ---------- the answer starts on move-in day ---------- */
caption(560,['התשובה'],3.15,4.6,{fs:112,c:INK,fo:.15,sfx:'whoosh'});
caption(700,['מתחילה'],3.35,4.6,{fs:112,c:INK,fo:.15});
caption(840,['ביום הכניסה.'],3.55,4.6,{fs:112,c:BLUE,fo:.15,sfx:'pop2'});
caption(1060,['שלושה הרגלים. לפני הארגזים.'],3.9,4.6,{fs:56,c:MUTED,fo:.15,anim:'up',dy:20});

/* ---------- progress pills (stay through the steps) ---------- */
const S0=4.6,S1=7.7,S2=10.6,S3=13.4;   // step starts; S3 = send
const DONE=[7.3,10.2,13.0];
const PILLS=['חדרים','מונים','מפתחות'];
const pills=$(`left:0;top:1600px;width:1080px;display:flex;justify-content:center;gap:22px;direction:rtl`,PILLS.map(p=>`<div class="pl w" style="height:84px;padding:0 34px;border-radius:42px;border:4px solid ${LINEC};font:700 42px/76px R;color:${GREY};display:flex;align-items:center;gap:12px"><span class="ic" style="display:none">${ok(40)}</span>${p}</div>`).join(''));
at(pills,S0,AEND,{anim:'up',dy:30,fo:.2,up:(l,t)=>{[...pills.querySelectorAll('.pl')].forEach((p,i)=>{const done=t>=DONE[i],cur=!done&&t>=[S0,S1,S2][i];
  p.style.borderColor=done?BLUE:(cur?INK:LINEC);p.style.color=done?BL2:(cur?INK:GREY);p.style.background=done?SOFT:'#fff';p.querySelector('.ic').style.display=done?'block':'none'})}});
DONE.forEach((d,i)=>ev(d,'ding',1+i*.12));

const stepHead=(n,txt,a,b)=>{caption(150,[`<span style="color:${BLUE}">${n}</span>`],a,b,{fs:72,c:BLUE,fo:.15,sfx:'pop'});caption(250,[txt],a+.12,b,{fs:96,c:INK,fo:.15,anim:'up',dy:26})};
const flash=(t)=>{const f=$(`left:0;top:0;width:1080px;height:1920px;background:#fff`);f.style.zIndex=40;at(f,t,t+.35,{anim:'none',fo:.3});ev(t,'pin',1);ev(t+.02,'swish')};
const vf=(css)=>{const c=(r)=>`<div style="position:absolute;width:70px;height:70px;${r}"></div>`;const s=`border-color:${BLUE};border-style:solid;border-width:0`;
  return $(css,c(`right:0;top:0;${s};border-top-width:9px;border-right-width:9px;border-top-right-radius:18px`)+c(`left:0;top:0;${s};border-top-width:9px;border-left-width:9px;border-top-left-radius:18px`)+c(`right:0;bottom:0;${s};border-bottom-width:9px;border-right-width:9px;border-bottom-right-radius:18px`)+c(`left:0;bottom:0;${s};border-bottom-width:9px;border-left-width:9px;border-bottom-left-radius:18px`))};

/* ---------- step 1: every room ---------- */
stepHead('1','מצלמים כל חדר.',S0,S1);
const c1=$(`left:110px;top:440px;width:860px;height:900px;border-radius:44px;background:#fff;border:4px solid ${LINEC};overflow:hidden`,`
 <div style="position:absolute;left:30px;top:30px">${wallSVG(800)}</div>
 <div class="th" style="position:absolute;left:30px;right:30px;top:560px;display:flex;gap:22px;direction:rtl">${['סלון','מטבח','חדר'].map(r=>`<div class="tb" style="flex:1;height:300px;border-radius:24px;background:${WALL};border:3px solid ${LINEC};position:relative;opacity:0">
   <div style="position:absolute;left:18px;right:18px;top:20px;height:170px;border-radius:14px;background:#E3E8F0"></div>
   <div class="w" style="position:absolute;right:20px;top:208px;font:700 36px/1 R;color:${INK}">${r}</div>
   <div class="w" style="position:absolute;right:20px;top:254px;font:500 28px/1 R;color:${BLUE}">יום הכניסה</div></div>`).join('')}</div>`);
at(c1,S0+.1,S1,{dy:40,s0:.95,fo:.2,up:(l)=>{[...c1.querySelectorAll('.tb')].forEach((b,i)=>{const k=seg(l,1.45+i*.35,.3);b.style.opacity=clamp(k*3);b.style.transform=`translateY(${(1-outBack(k))*50}px)`})}});
[1.45,1.8,2.15].forEach(d=>ev(S0+d,'pin',1));
const vf1=vf(`left:290px;top:600px;width:500px;height:380px`);vf1.style.zIndex=30;
at(vf1,S0+.45,S0+1.25,{s0:1.25,dur:.35,fo:.1});
flash(S0+1.2);
caption(1400,['גם את השריטות. גם בתוך הארון.'],S0+1.5,S1,{fs:54,c:MUTED,fo:.15,anim:'up',dy:20});

/* ---------- step 2: the meters ---------- */
stepHead('2','מצלמים את המונים.',S1,S2);
const DIG='04718';
const c2=$(`left:110px;top:440px;width:860px;height:900px;border-radius:44px;background:#fff;border:4px solid ${LINEC};overflow:hidden`,`
 <div style="position:absolute;left:130px;top:70px;width:600px;height:500px;border-radius:36px;background:${WALL};border:6px solid ${INK}">
  <div class="w" style="position:absolute;left:0;width:588px;top:50px;text-align:center;font:700 44px/1 R;color:${INK}">מונה</div>
  <div style="position:absolute;left:44px;top:140px;width:500px;height:150px;display:flex;gap:14px;direction:ltr">${DIG.split('').map(()=>`<div class="dg" style="flex:1;border-radius:16px;background:${INK};color:#fff;font:700 96px/150px R;text-align:center">0</div>`).join('')}</div>
  <div style="position:absolute;left:220px;top:350px;width:148px;height:100px;border-radius:50px 50px 0 0;border:6px solid ${INK};border-bottom:none"></div>
  <div class="nd" style="position:absolute;left:290px;top:356px;width:8px;height:90px;background:${BLUE};transform-origin:50% 100%"></div>
 </div>
 <div style="position:absolute;left:0;right:0;top:640px;display:flex;justify-content:center;gap:22px;direction:rtl">${['חשמל','מים','גז'].map(m=>`<div class="mc w" style="height:96px;padding:0 36px;border-radius:48px;border:4px solid ${LINEC};font:700 46px/88px R;color:${GREY};display:flex;align-items:center;gap:14px"><span class="mi" style="display:none">${ok(44)}</span>${m}</div>`).join('')}</div>`);
const MT=[S1+1.4,S1+1.85,S1+2.3];
at(c2,S1+.1,S2,{dy:40,s0:.95,fo:.2,up:(l,t)=>{const k=outCubic(seg(t,S1+.3,.8));[...c2.querySelectorAll('.dg')].forEach((d,i)=>{const fin=+DIG[i];d.textContent=k>=1?fin:Math.floor((fin+k*20+i*3)%10)});
  c2.querySelector('.nd').style.transform=`rotate(${-60+120*k}deg)`;
  [...c2.querySelectorAll('.mc')].forEach((c,i)=>{const on=t>=MT[i];c.style.borderColor=on?BLUE:LINEC;c.style.color=on?BL2:GREY;c.style.background=on?SOFT:'#fff';c.querySelector('.mi').style.display=on?'block':'none'})}});
MT.forEach(m=>ev(m,'pin',1));
const vf2=vf(`left:220px;top:490px;width:640px;height:560px`);vf2.style.zIndex=30;
at(vf2,S1+.6,S1+1.25,{s0:1.2,dur:.3,fo:.1});
flash(S1+1.2);
caption(1400,['ככה יודעים מאיפה מתחילים לשלם.'],S1+1.5,S2,{fs:54,c:MUTED,fo:.15,anim:'up',dy:20});

/* ---------- step 3: every key ---------- */
stepHead('3','בודקים כל מפתח.',S2,S3);
const keySVG=`<svg width="130" height="320" viewBox="0 0 130 320"><circle cx="65" cy="56" r="42" fill="none" stroke="${INK}" stroke-width="13"/><rect x="56" y="96" width="18" height="190" rx="7" fill="${INK}"/><rect x="72" y="220" width="34" height="16" rx="3" fill="${INK}"/><rect x="72" y="256" width="24" height="16" rx="3" fill="${INK}"/></svg>`;
const KEYS=['דלת','תיבת דואר','החדר'];const KT=[S2+.8,S2+1.4,S2+2.0];
const c3=$(`left:110px;top:440px;width:860px;height:900px;border-radius:44px;background:#fff;border:4px solid ${LINEC};overflow:hidden`,`
 <div style="position:absolute;left:90px;right:90px;top:120px;height:14px;border-radius:7px;background:${GREY}"></div>
 <div style="position:absolute;left:40px;right:40px;top:170px;display:flex;justify-content:space-around;direction:rtl">${KEYS.map(k=>`<div class="ky" style="width:220px;position:relative;transform-origin:50% 0">
   <div style="display:flex;justify-content:center">${keySVG}</div>
   <div class="kl w" style="margin-top:26px;text-align:center;font:700 44px/1 R;color:${GREY}">${k}</div>
   <div class="kc" style="display:flex;justify-content:center;margin-top:22px;opacity:0">${ok(64)}</div></div>`).join('')}</div>`);
at(c3,S2+.1,S3,{dy:40,s0:.95,fo:.2,up:(l,t)=>{[...c3.querySelectorAll('.ky')].forEach((k,i)=>{const sw=Math.sin((t-S2)*3+i)*4*(1-seg(t,KT[i],.3));const turn=seg(t,KT[i]-.35,.35);
  k.style.transform=`rotate(${sw}deg)`;k.querySelector('svg').style.transform=`scaleX(${1-1.6*Math.sin(turn*Math.PI)*.5})`;
  const on=t>=KT[i];k.querySelector('.kl').style.color=on?INK:GREY;const c=k.querySelector('.kc');c.style.opacity=on?1:0;c.style.transform=`scale(${on?outBack(seg(t,KT[i],.3)):0})`})}});
KT.forEach(k=>{ev(k-.3,'swish');ev(k,'pin',1)});
caption(1400,['כל מפתח, בדלת שלו. לפני שהולכים.'],S2+1.0,S3,{fs:54,c:MUTED,fo:.15,anim:'up',dy:20});

/* ---------- and send it all in one message ---------- */
caption(170,['ושולחים הכול'],S3,AEND,{fs:96,c:INK,fo:.15,sfx:'whoosh'});
caption(290,['בהודעה אחת.'],S3+.2,AEND,{fs:96,c:BLUE,fo:.15});
const thumb=(ic)=>`<div style="width:190px;height:150px;border-radius:18px;background:${WALL};border:3px solid ${LINEC};display:flex;align-items:center;justify-content:center;overflow:hidden">${ic}</div>`;
const msg=$(`left:150px;top:560px;width:780px;border-radius:44px 44px 12px 44px;background:${SOFT};border:4px solid ${PALE};padding:34px 34px 26px`,`
 <div style="display:flex;gap:18px;justify-content:center;direction:rtl">${thumb(wallSVG(186))}${thumb(`<div style="display:flex;gap:6px;direction:ltr">${DIG.split('').map(d=>`<div style="width:26px;height:44px;border-radius:5px;background:${INK};color:#fff;font:700 28px/44px R;text-align:center">${d}</div>`).join('')}</div>`)}${thumb(`<div style="transform:scale(.38);transform-origin:50% 50%">${keySVG}</div>`)}</div>
 <div class="w" style="margin-top:26px;text-align:right;direction:rtl;font:500 46px/1.2 R;color:${INK}">יום הכניסה: חדרים, מונים, מפתחות.</div>
 <div class="w" style="margin-top:14px;text-align:left;direction:rtl;font:700 34px/1 R;color:${BLUE}">נשלח ✓✓</div>`);
at(msg,S3+.35,AEND,{dy:60,s0:.9,fo:.2,sfx:'msg'});
caption(1120,['לבעלי הדירה. עם תאריך.'],S3+.9,AEND,{fs:58,c:MUTED,fo:.15,anim:'up',dy:20});

at($('left:0;top:1845px;width:1080px;text-align:center;font:500 34px/1.2 R;color:#8C8C8C;white-space:nowrap','הדמויות והמצבים בדיוניים · טיפים כלליים'),0.4,AEND,{anim:'none',fo:.2});

/* ---------- payoff: a year later ---------- */
const P0=AEND,P1=19.4;
caption(170,['בעוד שנה.'],P0+.05,P1,{fs:104,c:INK,fo:.15,sfx:'pop'});
const qa=$(`left:0;top:420px;width:1080px;display:flex;justify-content:flex-end;padding:0 90px`,`<div class="w" style="direction:rtl;background:#fff;border:5px solid ${INK};border-radius:50px;padding:24px 44px;font:500 56px/1.15 R;color:${INK}">״השריטה הזאת?״</div>`);
at(qa,P0+.3,P1,{dy:30,s0:.6,fo:.2,sfx:'msg'});
const qb=$(`left:0;top:600px;width:1080px;display:flex;justify-content:flex-start;padding:0 90px`,`<div style="direction:rtl;background:${BLUE};border-radius:50px;padding:26px 30px 26px 44px;display:flex;align-items:center;gap:24px">
 <div class="w" style="font:700 56px/1.15 R;color:#fff">״הייתה. הנה התמונה.״</div>
 <div style="width:150px;height:96px;border-radius:14px;background:#fff;overflow:hidden">${wallSVG(160)}</div></div>`);
at(qb,P0+1.1,P1,{dy:30,s0:.6,fo:.2,sfx:'msg'});
ev(P0+1.4,'ding',1.2);
caption(1000,['מה שמצלמים בכניסה,'],P0+1.9,P1,{fs:84,c:INK,fo:.15,anim:'up',dy:26,sfx:'whoosh'});
caption(1120,['לא מתווכחים עליו'],P0+2.15,P1,{fs:84,c:BLUE,fo:.15,anim:'up',dy:26});
caption(1235,['ביציאה.'],P0+2.35,P1,{fs:84,c:BLUE,fo:.15,anim:'up',dy:26});

/* ---------- homie ---------- */
const E0=21.0;
wordmark(P1,DUR);
const fin=$('left:0;top:380px;width:1080px;height:900px;',`${hl(250,'דירה מאנשים פרטיים.',INK,100)}${hl(380,'ותמונות מהיום הראשון.',BLUE,92)}${sub(560,'דירות וחדרים, בלי מתווכים.')}`);
at(fin,P1+.05,E0,{dy:90,s0:.92,dur:.4,sfx:'pop2'});
ev(P1+.5,'ding',1.2);
endCard(E0,DUR,'יום הכניסה, בתמונות.');

function render(t){runItems(t);turtleWhite(t,P1+.05,[E0],E0+.25)}
window.AUDIO={dur:DUR,seed:1014,sections:[[0,3.1,'MIN',.13,0,0],[3.1,AEND,'FC',.15,1,0],[AEND,DUR,'POP',.18,1,1]],ticks:[4.6,13.4]};
window.render=render;window.EVENTS=EVENTS;window.SCENES=SCENES;window.DUR=DUR;render(0);
