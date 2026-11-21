// Reel H20 (1020) — homie in action · clean editorial, voiced, Pitch: "guess how many messages to book one viewing."
// A drawn phone buzzes with a scheduling ping-pong (the unread badge counts up to 12, still no time) -> the screen flips to
// homie's free-slot picker, a finger taps 19:30, "the viewing is set" -> comment prompt: how many did it take you? 1/2/3.
const DUR=15.6;
const SCENES=[['a',0,5.7],['b',5.7,10.1],['c',10.1,DUR]];
Tt.style.zIndex=50;
const LINEC='#D6DEEA',GREY='#9AA1AC',CHATBG='#F3F5F8';

/* ---------- timing ---------- */
const COVER_END=0.4,H0=COVER_END,M0=0.45,MSTEP=0.33,NOTIME=4.2,FLIP=5.7,TAP=7.3,BOOK=8.1,SET=8.35,ASK=10.1,E0=14.0;

/* ---------- the chat ping-pong (demo, fictional) ---------- */
const MSGS=[['r','היי, אפשר לבוא לראות?'],['l','בטח! מתי נוח?'],['r','מחר בשש?'],['l','בשש קשה. שבע וחצי?'],
 ['r','בשבע וחצי אני בעבודה.'],['l','אז ראשון?'],['r','ראשון בבוקר?'],['l','בבוקר אני לא פה.'],['r','ערב?'],
 ['l','בערב כבר יש מישהו.'],['r','שני?'],['l','שני? נדבר.']];
const mT=i=>M0+i*MSTEP;
const bubHTML=(side,txt)=>`<div class="w" style="position:absolute;${side==='r'?'right:22px':'left:22px'};top:0;height:76px;padding:0 30px;border-radius:${side==='r'?'34px 34px 8px 34px':'34px 34px 34px 8px'};background:${side==='r'?BLUE:'#fff'};color:${side==='r'?'#fff':INK};${side==='l'?`border:3px solid ${LINEC};`:''}font:500 38px/76px R;direction:rtl">${txt}</div>`;

// phone: body 520x1040, screen 480x1000 (inset 20), rounded; returns element with .chat/.slots/.done layers
const phoneHTML=()=>`<div style="position:absolute;left:0;top:0;width:520px;height:1040px;border-radius:78px;background:${INK}"></div>
 <div class="scr" style="position:absolute;left:20px;top:20px;width:480px;height:1000px;border-radius:60px;background:#fff;overflow:hidden">
  <div style="position:absolute;left:190px;top:22px;width:100px;height:30px;border-radius:15px;background:${INK}"></div>
  <div class="chat" style="position:absolute;left:0;top:0;width:480px;height:1000px;background:${CHATBG}">
   <div style="position:absolute;left:0;top:0;width:480px;height:170px;background:#fff;border-bottom:3px solid ${LINEC}"></div>
   <div style="position:absolute;right:28px;top:78px;width:68px;height:68px;border-radius:50%;background:${PALE}"></div>
   <div class="w" style="position:absolute;right:112px;top:80px;font:700 36px/1 R;color:${INK};direction:rtl">בעלי הדירה</div>
   <div class="w" style="position:absolute;right:112px;top:124px;font:500 28px/1 R;color:${MUTED};direction:rtl">חדר בדירת שותפים · תל אביב</div>
   <div class="list" style="position:absolute;left:0;top:190px;width:480px;height:690px;overflow:hidden">
    ${MSGS.map(([s,x],i)=>`<div class="b${i}" style="position:absolute;left:0;top:0;width:480px;height:76px">${bubHTML(s,x)}</div>`).join('')}
    <div class="typing" style="position:absolute;left:22px;top:0;width:130px;height:66px;border-radius:33px;background:#fff;border:3px solid ${LINEC}">
     <div class="d0" style="position:absolute;left:28px;top:24px;width:16px;height:16px;border-radius:50%;background:${GREY}"></div>
     <div class="d1" style="position:absolute;left:56px;top:24px;width:16px;height:16px;border-radius:50%;background:${GREY}"></div>
     <div class="d2" style="position:absolute;left:84px;top:24px;width:16px;height:16px;border-radius:50%;background:${GREY}"></div></div>
   </div>
   <div style="position:absolute;left:22px;top:900px;width:436px;height:72px;border-radius:36px;background:#fff;border:3px solid ${LINEC}"></div>
  </div>
  <div class="slots" style="position:absolute;left:0;top:0;width:480px;height:1000px;background:#fff">
   <div class="w" style="position:absolute;right:30px;top:84px;font:700 30px/1 R;color:${MUTED};direction:rtl">סיור · חדר בדירת שותפים</div>
   <div class="w" style="position:absolute;right:30px;top:132px;font:700 46px/1 R;color:${INK};direction:rtl">בחרו שעה פנויה</div>
   <div style="position:absolute;left:30px;top:214px;width:420px;height:64px;display:flex;gap:14px;direction:rtl">
    ${['היום','מחר','ראשון'].map((d,i)=>`<div class="w" style="flex:1;height:64px;border-radius:32px;text-align:center;font:700 32px/58px R;${i===1?`background:${INK};color:#fff;border:3px solid ${INK}`:`background:#fff;color:${MUTED};border:3px solid ${LINEC}`}">${d}</div>`).join('')}</div>
   ${[['17:00',0],['18:00',1],['18:30',1],['19:30',1],['20:00',0],['20:30',1]].map(([tm,free],i)=>{const col=i%2,row=Math.floor(i/2);
     return `<div class="s${i}" style="position:absolute;${col===0?'right':'left'}:30px;top:${318+row*134}px;width:200px;height:110px;border-radius:28px;text-align:center;direction:ltr;${free?`background:#fff;border:4px solid ${PALE};color:${BL2}`:`background:#F1F2F4;border:4px solid #F1F2F4;color:#B8BDC6`}">
      <div class="w" style="font:700 44px/1 R;margin-top:${free?30:18}px;${free?'':'text-decoration:line-through'}">${tm}</div>${free?'':`<div class="w" style="font:500 24px/1 R;margin-top:8px;direction:rtl">תפוס</div>`}</div>`}).join('')}
   <div class="btn w" style="position:absolute;left:30px;top:880px;width:420px;height:88px;border-radius:44px;background:${PALE};color:#fff;text-align:center;font:700 40px/88px R;direction:rtl">קבעו סיור</div>
  </div>
  <div class="done" style="position:absolute;left:0;top:0;width:480px;height:1000px;background:#fff">
   <div style="position:absolute;left:120px;top:250px;width:240px;height:240px"><svg viewBox="0 0 240 240" width="240" height="240">
    <circle cx="120" cy="120" r="108" fill="${BLUE}"/><path class="chk" d="M70 124 L104 158 L172 88" stroke="#fff" stroke-width="22" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="150" stroke-dashoffset="0"/></svg></div>
   <div class="w" style="position:absolute;left:0;width:480px;top:550px;text-align:center;font:700 52px/1 R;color:${INK};direction:rtl">הסיור נקבע</div>
   <div class="w" style="position:absolute;left:0;width:480px;top:630px;text-align:center;font:700 44px/1 R;color:${BLUE};direction:rtl">מחר · 19:30</div>
   <div class="w" style="position:absolute;left:0;width:480px;top:700px;text-align:center;font:500 30px/1 R;color:${MUTED};direction:rtl">מתוך השעות הפנויות</div>
  </div>
 </div>
 <div class="badge w" style="position:absolute;left:-70px;top:-60px;width:170px;height:170px;border-radius:50%;background:${BLUE};border:10px solid #fff;color:#fff;text-align:center;font:700 82px/150px R;direction:ltr">0</div>`;

// lay out the chat for time t (n = bubbles shown); newest at the bottom, list scrolls up
const GAP=98,LISTH=690;
function layChat(ph,t,full){
  let n=0;for(let i=0;i<MSGS.length;i++)if(full||t>=mT(i))n=i+1;
  const typing=full||t>=mT(MSGS.length-1)+.35;
  const rows=n+(typing?1:0);
  const scroll=Math.max(0,rows*GAP-LISTH+20);
  for(let i=0;i<MSGS.length;i++){const b=ph.querySelector('.b'+i);if(i>=n){b.style.display='none';continue}b.style.display='block';
    const k=full?1:seg(t,mT(i),.18);const e=outBack(k);
    b.style.transform=`translateY(${i*GAP-scroll+(1-e)*30}px) scale(${.85+.15*e})`;b.style.opacity=clamp(k*3);b.style.transformOrigin=MSGS[i][0]==='r'?'100% 100%':'0 100%'}
  const ty=ph.querySelector('.typing');ty.style.display=typing?'block':'none';ty.style.transform=`translateY(${n*GAP-scroll}px)`;
  [0,1,2].forEach(j=>{ty.querySelector('.d'+j).style.transform=`translateY(${-Math.max(0,Math.sin(t*9-j*.9))*10}px)`});
  const bd=ph.querySelector('.badge');bd.textContent=String(n);
  return n}

/* ---------- COVER: frame 0 is the cover, fully drawn, held until COVER_END ---------- */
const covPh=$(`left:280px;top:668px;width:520px;height:1040px;transform:scale(.70);transform-origin:50% 0`,phoneHTML());
covPh.querySelector('.slots').style.display='none';covPh.querySelector('.done').style.display='none';layChat(covPh,0,true);
const cov=$(`left:0;top:0;width:1080px;height:1920px;background:#fff;z-index:60`,`
  ${hl(395,'כמה הודעות',INK,118)}${hl(530,'עד סיור אחד?',BLUE,118)}`);
cov.appendChild(covPh);
at(cov,0,COVER_END,{anim:'none',fo:0});
window.COVER={t:0.2,title:'כמה הודעות עד סיור אחד?'};

bg('#fff',0,DUR);

/* ---------- the phone (hook -> picker -> booked) ---------- */
const ph=$(`left:280px;top:450px;width:520px;height:1040px;transform-origin:50% 50%`,phoneHTML());
const finger=$(`left:0;top:0;width:120px;height:120px;z-index:20`,`<div class="rip" style="position:absolute;left:-30px;top:-30px;width:180px;height:180px;border-radius:50%;border:8px solid ${BLUE};opacity:0"></div>
 <div style="position:absolute;left:20px;top:20px;width:80px;height:80px;border-radius:50%;background:rgba(17,17,17,.82);border:6px solid #fff;box-shadow:0 10px 30px rgba(0,0,0,.25)"></div>`);
at(ph,H0,ASK,{anim:'none',fo:.25,up:(l,t)=>{
  // buzz on each new message (hook)
  let dx=0,rot=0;for(let i=0;i<MSGS.length;i++){const k=t-mT(i);if(k>=0&&k<.14){dx=Math.sin(k*90)*7;rot=Math.sin(k*70)*.8}}
  // flip to the slot picker
  const fl=seg(t,FLIP,.5);const sq=Math.sin(fl*Math.PI);
  ph.style.transform=`translateX(${dx}px) rotate(${rot}deg) scaleX(${1-.5*sq})`;
  const toSlots=fl>=.5;
  ph.querySelector('.chat').style.display=toSlots?'none':'block';
  ph.querySelector('.slots').style.display=toSlots&&t<SET?'block':'none';
  ph.querySelector('.done').style.display=t>=SET?'block':'none';
  layChat(ph,t,false);
  const bd=ph.querySelector('.badge');const bk=seg(t,FLIP,.25);
  let pulse=0;for(let i=0;i<MSGS.length;i++){const k=t-mT(i);if(k>=0&&k<.2)pulse=Math.sin(k/.2*Math.PI)*.18}
  bd.style.transform=`scale(${(1+pulse)*(1-bk)})`;bd.style.opacity=1-bk;
  // slot tap
  const s3=ph.querySelector('.s3');const on=t>=TAP;s3.style.background=on?BLUE:'#fff';s3.style.color=on?'#fff':BL2;s3.style.borderColor=on?BLUE:PALE;
  s3.style.transform=`scale(${1+Math.sin(seg(t,TAP,.3)*Math.PI)*.1})`;
  const btn=ph.querySelector('.btn');btn.style.background=t>=TAP+.15?BLUE:PALE;btn.style.transform=`scale(${1-Math.sin(seg(t,BOOK,.25)*Math.PI)*.06})`;
  // booked: check draws, card pops
  const dn=ph.querySelector('.done');const dk=seg(t,SET,.35);dn.style.transform=`scale(${.9+.1*outBack(dk)})`;dn.style.opacity=clamp(dk*3);
  ph.querySelector('.done .chk').setAttribute('stroke-dashoffset',150*(1-outCubic(seg(t,SET+.15,.3))));
}});
MSGS.forEach((m,i)=>ev(mT(i),i%2?'pop':'msg',i%2?.55:.8));
ev(FLIP,'whoosh');ev(TAP,'pop');ev(BOOK,'pop');ev(SET+.15,'ding',1.25);

// finger: on screen 6.5 -> 9.0. Phone screen origin = (300,470). Slot s3 = left col (left:30), row 1 -> centre (300+30+100, 470+318+134+55)
const SX=430,SY=977,BX=540,BY=1394;
at(finger,6.5,9.0,{anim:'none',fo:.25,up:(l,t)=>{
  let x,y;const a=seg(t,6.5,.7),b=seg(t,TAP+.25,.45);
  x=760+(SX-760)*inOut(a);y=1560+(SY-1560)*inOut(a);
  x+= (BX-SX)*inOut(b);y+=(BY-SY)*inOut(b);
  const press=(t>=TAP-.05&&t<TAP+.12)||(t>=BOOK-.05&&t<BOOK+.12);
  finger.style.transform=`translate(${x-60}px,${y-60}px) scale(${press?.85:1})`;
  const r=finger.querySelector('.rip');const rk=Math.max(seg(t,TAP,.4)*(t<BOOK?1:0),seg(t,BOOK,.4));const rr=t>=BOOK?seg(t,BOOK,.4):seg(t,TAP,.4);
  r.style.opacity=rr>0&&rr<1?1-rr:0;r.style.transform=`scale(${.4+.8*rr})`}});

/* ---------- headlines (narration = the say marks) ---------- */
caption(170,['נחשו כמה הודעות'],H0+.05,NOTIME,{say:'נחשו כמה הודעות לוקח לקבוע סיור אחד.',fs:104,c:INK,fo:.12,sfx:'pop'});
caption(290,['עד סיור אחד.'],H0+.25,NOTIME,{say:false,fs:104,c:BLUE,fo:.12});
caption(170,['ועדיין'],NOTIME,FLIP,{say:'ועדיין אין שעה.',fs:108,c:INK,fo:.12,anim:'up',dy:26,sfx:'thud'});
caption(290,['אין שעה.'],NOTIME+.15,FLIP,{say:false,fs:108,c:BLUE,fo:.12,anim:'up',dy:26});
caption(170,['או שפשוט'],FLIP,SET-.05,{say:'או שפשוט בוחרים שעה פנויה.',fs:104,c:INK,fo:.12,anim:'up',dy:26});
caption(290,['בוחרים שעה פנויה.'],FLIP+.2,SET-.05,{say:false,fs:104,c:BLUE,fo:.12,anim:'up',dy:26});
caption(170,['נקבע.'],SET,ASK,{say:'נקבע. בלי פינג-פונג.',fs:110,c:INK,fo:.12,sfx:'pop2'});
caption(290,['בלי פינג-פונג.'],SET+.2,ASK,{say:false,fs:110,c:BLUE,fo:.12});

/* ---------- engagement prompt (Comment) ---------- */
caption(400,['ואצלכם?'],ASK+.05,E0,{say:'ואצלכם? אחת, שתיים או שלוש? בתגובות.',fs:120,c:INK,fo:.15,sfx:'whoosh'});
caption(535,['כמה הודעות?'],ASK+.25,E0,{say:false,fs:120,c:BLUE,fo:.15});
const opt=(n,txt)=>`<div style="position:relative;width:720px;height:120px;margin:0 auto 28px;border-radius:60px;border:5px solid ${INK};background:#fff;direction:rtl">
  <div class="w" style="position:absolute;right:16px;top:12px;width:86px;height:86px;border-radius:50%;background:${BLUE};color:#fff;text-align:center;font:700 54px/86px R">${n}</div>
  <div class="w" style="position:absolute;right:130px;top:0;font:700 56px/110px R;color:${INK}">${txt}</div></div>`;
[['1','עד 5 הודעות'],['2','6 עד 15'],['3','הפסקתי לספור']].forEach(([n,x],i)=>{
  at($(`left:0;top:${740+i*148}px;width:1080px`,opt(n,x)),ASK+.6+i*.25,E0,{dy:30,s0:.85,fo:.15,sfx:'pop'})});
caption(1200,['כתבו בתגובות.'],ASK+1.5,E0,{say:false,fs:96,c:INK,fo:.15,anim:'up',dy:24});

at($('left:0;top:1845px;width:1080px;text-align:center;font:500 34px/1.2 R;color:#8C8C8C;white-space:nowrap','הדגמה. הנתונים והדמויות לדוגמה.'),H0,ASK,{anim:'none',fo:.2});

/* ---------- homie ---------- */
wordmark(E0,DUR);
endCard(E0,DUR,'סיור, בלי פינג-פונג.');

function render(t){runItems(t);turtleWhite(t,E0+.05,[],E0+.3)}
window.AUDIO={dur:DUR,seed:1020,sections:[[0,FLIP,'FC',.13,0,1],[FLIP,ASK,'MIN',.13,1,0],[ASK,DUR,'POP',.17,1,1]],ticks:[0.5,4.6]};
window.STRETCH=1.12;
window.VOICE={duck:0.7};   // narration = the say marks above
window.render=render;window.EVENTS=EVENTS;window.SCENES=SCENES;window.DUR=DUR;render(0);
