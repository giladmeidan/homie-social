// Reel H15 (1015) — the city · kinetic type: "which city are you?" A three-round pick-one game (א / ב / ג) for Tel Aviv, Ramat Gan and Givatayim -> the reveal (most א = Tel Aviv ...) -> mixed? they're right next to each other -> pick the city with your heart, roommates by match.
const DUR=23.2;
const SCENES=[['a',0,12.8],['b',12.8,DUR]];
Tt.style.zIndex=50;

/* ---------- answer pill: letter badge on the right (RTL), text ---------- */
const PILL=(letter,txt,dark,sel=false)=>{const bgc=sel?BLUE:(dark?DARK2:'#fff'),bd=sel?BLUE:(dark?'#3A3A3A':PALE),tc=sel?'#fff':(dark?'#fff':INK);
  return `<div class="w" style="display:flex;align-items:center;gap:30px;width:840px;height:136px;box-sizing:border-box;padding:0 22px 0 40px;border-radius:68px;background:${bgc};border:5px solid ${bd};direction:rtl">
  <div style="flex:none;width:96px;height:96px;border-radius:50%;background:${sel?'#fff':BLUE};color:${sel?BLUE:'#fff'};font:600 60px/96px F;text-align:center">${letter}</div>
  <div style="font:500 56px/1 R;color:${tc};white-space:nowrap">${txt}</div></div>`};
const L=['א','ב','ג'];

/* ---------- COVER: frame 0 is the cover, fully drawn, held until COVER_END ---------- */
const COVER_END=0.7;
const cov=$(`left:0;top:0;width:1080px;height:1920px;background:${INK};z-index:60`,`
  ${hl(395,'איזו עיר',`#fff`,150)}${hl(555,'אתם?',NAMEC,150)}
  ${sub(745,'תל אביב · רמת גן · גבעתיים','#C9C9C9')}
  <div style="position:absolute;left:120px;top:870px;width:840px;display:flex;flex-direction:column;gap:26px">
   ${PILL('א','ריצה עד הים.',true)}${PILL('ב','פיקניק בפארק הגדול.',true)}${PILL('ג','קפה בפינה, בלי למהר.',true)}</div>`);
at(cov,0,COVER_END,{anim:'none',fo:0});
window.COVER={t:0.3,title:'איזו עיר אתם?'};

/* ---------- hook (black): three rounds, pick fast ---------- */
const HE=2.6;
bg(INK,0,HE);
caption(560,['שלושה סיבובים.'],COVER_END,HE,{fs:128,c:'#fff',fo:.1,sfx:'thud'});
caption(720,['תבחרו מהר.'],COVER_END+.35,HE,{fs:128,c:NAMEC,fo:.1,sfx:'pop2'});
caption(960,['א, ב או ג. בלי לחשוב.'],COVER_END+.8,HE,{fs:62,c:'#C9C9C9',fo:.1,sfx:'swish',anim:'up',dy:24});

/* ---------- one round ---------- */
function round(n,a,b,dark,q,opts){
  bg(dark?INK:'#fff',a,b);
  at($(`left:0;top:330px;width:1080px;display:flex;justify-content:center`,`<div class="w" style="height:84px;padding:0 40px;border-radius:42px;background:${dark?DARK2:SOFT};color:${dark?NAMEC:BL2};font:700 46px/84px R;direction:rtl">סיבוב ${n} / 3</div>`),a,b,{anim:'pop',dy:20,fo:.08});
  caption(480,[q],a+.05,b,{fs:124,c:dark?'#fff':INK,fo:.08,sfx:'thud'});
  opts.forEach((o,i)=>{const t=a+.55+i*.3;
    at($(`left:120px;top:${720+i*168}px;width:840px;height:136px`,PILL(L[i],o,dark)),t,b,{anim:'pop',dy:40,s0:.85,fo:.08,sfx:'pop',v:1+i*.1})});
  // timer bar drains while you pick
  const T0=a+1.4,T1=b-.25;
  const bar=$(`left:190px;top:1270px;width:700px;height:22px;border-radius:11px;background:${dark?'#2E2E2E':SOFT};overflow:hidden`,`<div class="f" style="position:absolute;right:0;top:0;height:22px;width:700px;border-radius:11px;background:${BLUE}"></div>`);
  at(bar,T0-.2,b,{anim:'fade',fo:.08,up:(l,t)=>{bar.querySelector('.f').style.width=(700*(1-clamp((t-T0)/(T1-T0))))+'px'}});
  for(let k=T0+.4;k<T1-.05;k+=.5)ev(k,'pin',.7);
  ev(T1,'ding',1.2);
}
const R1=HE,R2=6.0,R3=9.4,RV=12.8;
round(1,R1,R2,false,'בוקר שבת:',['ריצה עד הים.','פיקניק בפארק הגדול.','קפה בפינה, בלי למהר.']);
round(2,R2,R3,true,'מהחלון רואים:',['פס דק של ים.','מגדלים בשקיעה.','עץ ענק ומרפסות.']);
round(3,R3,RV,false,'ערב שישי:',['יוצאים. מאוחר.','ארוחה גדולה אצל חברים.','ספה, סרט, ושכנים עם עוגה.']);

/* ---------- the reveal (black) ---------- */
const MX=16.0;
bg(INK,RV,MX);
caption(330,['אז איפה','אתם גרים?'],RV+.05,MX,{fs:112,cols:['#fff','#fff'],fo:.08,sfx:'thud'});
[['א','תל אביב.'],['ב','רמת גן.'],['ג','גבעתיים.']].forEach(([l,c],i)=>{const t=RV+.8+i*.55;
  at($(`left:0;top:${700+i*170}px;width:1080px;text-align:center;font:600 104px/1.1 F;color:#fff;white-space:nowrap;direction:rtl`,`רוב ${l}׳? <span style="color:${NAMEC}">${c}</span>`),t,MX,{anim:'pop',dy:50,fo:.08,sfx:'ding',v:1+i*.15})});
caption(1290,['בשביל הכיף. אין תשובה לא נכונה.'],RV+2.4,MX,{fs:50,c:'#9CA3AF',fo:.08,anim:'fade'});

/* ---------- mixed? (white) ---------- */
const FE=18.4;
bg('#fff',MX,FE);
caption(400,['יצא לכם','מעורבב?'],MX+.05,FE,{fs:128,cols:[INK,INK],fo:.08,sfx:'thud'});
caption(720,['גם טוב. הן ממש צמודות.'],MX+.6,FE,{fs:64,c:MUTED,fo:.08,sfx:'swish',anim:'up',dy:24});
caption(960,['עיר בוחרים בלב.','שותפים, לפי התאמה.'],MX+1.15,FE,{fs:96,cols:[INK,BLUE],fo:.08,sfx:'pop2'});

/* ---------- feature + homie ---------- */
const P1=20.4;
FEAT.matchX(FE,P1,['אזור','תקציב','שקט']);
wipe(P1,null);
wordmark(P1+.9,DUR);
endCard(P1+1.0,DUR,'קודם עיר. אחר כך שותפים.');

function render(t){runItems(t);
  if(t<P1+.9)turtle(null); else turtleWhite(t,P1+.95,[],P1+1.8)}
window.AUDIO={dur:DUR,seed:1015,sections:[[0,HE,'CG',.13,0,1],[HE,RV,'POP',.16,1,1],[RV,FE,'DET',.12,1,0],[FE,DUR,'POP',.18,1,1]],ticks:[HE,RV]};
window.STRETCH=1.12;
window.render=render;window.EVENTS=EVENTS;window.SCENES=SCENES;window.DUR=DUR;render(0);
