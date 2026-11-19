// Reel 40 — hare (searching everywhere) vs the homie turtle on the same track
const DUR=21.8;
const SCENES=[['a',0,10.4],['b',10.4,DUR]];
Tt.style.zIndex=50;
const END_A=10.95;
bg(INK,0,END_A);
caption(120,['הארנב נגד הצב.','מי מגיע לדירה?'],0.1,END_A,{fs:96,cols:['#fff','#8FB1F7'],fo:0});
at($(`left:0;top:500px;width:1080px;text-align:center;font:600 46px/1.35 R;color:#B8B8B8`,`הארנב: מחפש בכל מקום<br><span style="color:${NAMEC}">הצב: משתמש בהומי</span>`),0.8,END_A,{anim:'fade',fo:0});

// one shared track with two lanes
at($(`left:50px;top:830px;width:960px;height:670px;border-radius:40px;background:#1C1C1C`),0.8,END_A,{anim:'none',fo:0});
at($(`left:70px;top:1176px;width:920px;height:0;border-top:6px dashed #3A3A3A`),0.8,END_A,{anim:'none',fo:0});
at($(`left:944px;top:830px;width:56px;height:670px;background:repeating-conic-gradient(#fff 0 25%,${INK} 0 50%) 0 0/56px 56px;border-radius:0 40px 40px 0`),0.8,END_A,{anim:'none',fo:0});
const houseIcon=`<svg viewBox="0 0 200 140" width="120" height="84"><path d="M20 70 L100 12 L180 70 V132 H20Z" fill="#fff" stroke="${INK}" stroke-width="8" stroke-linejoin="round"/><rect x="82" y="84" width="36" height="48" rx="6" fill="${BLUE}"/></svg>`;
at($(`left:880px;top:735px;width:170px;text-align:center`,houseIcon),0.8,END_A,{anim:'pop',s0:.6,fo:0,sfx:'pop'});

// original hare, faces right
const hareSVG=`<svg viewBox="0 0 300 260" width="330" height="286" style="overflow:visible;display:block">
 <path d="M150 90 Q120 -10 150 -20 Q176 -14 176 90Z" fill="#fff" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>
 <path d="M186 92 Q196 -2 226 4 Q248 14 218 98Z" fill="#fff" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>
 <ellipse cx="120" cy="190" rx="100" ry="58" fill="#fff" stroke="${INK}" stroke-width="7"/>
 <circle cx="40" cy="168" r="26" fill="#fff" stroke="${INK}" stroke-width="7"/>
 <circle cx="200" cy="132" r="64" fill="#fff" stroke="${INK}" stroke-width="7"/>
 <circle cx="222" cy="122" r="11" fill="${INK}"/><circle cx="226" cy="118" r="3.5" fill="#fff"/>
 <circle cx="196" cy="152" r="11" fill="${BLUSH}"/><circle cx="262" cy="140" r="9" fill="${INK}"/>
 <path d="M60 232 L60 252 H100 M150 238 L150 252 H196" fill="none" stroke="${INK}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const hare=$('left:0;top:0;width:330px;height:286px;transform-origin:0 0',hareSVG);
const hx=(t)=>{
  if(t<2.0)return 90;
  if(t<2.8)return 90+outCubic(seg(t,2.0,.8))*210;
  if(t<4.2)return 300-seg(t,3.0,1.2)*180;
  if(t<5.0)return 120+outCubic(seg(t,4.3,.7))*200;
  if(t<6.6)return 320-seg(t,5.2,1.4)*190;
  return 130+Math.sin((t-6.6)*1.4)*12};
at(hare,1.0,END_A,{anim:'none',fo:0,up:(l,t)=>{
  const hop=(t>2.0&&t<2.8)||(t>4.3&&t<5.0)?Math.abs(Math.sin(t*15))*30:0;
  hare.style.transform=`translate(${hx(t)}px,${1150-286-hop}px)`}});
const board=(txt,a,b)=>at($(`left:660px;top:880px;width:270px;padding:22px 0;border-radius:36px;background:#fff;color:${INK};font:700 44px/1.2 R;text-align:center;direction:rtl`,txt),a,b,{anim:'pop',s0:.6,dur:.3,fo:.08,sfx:'dun'});
board('"כבר הושכר."',2.8,4.4);board('מודעה מ-2021.',5.0,6.6);board('"נחזור אליך."',6.7,END_A);

// milestones for the turtle
const chip=(txt,a,b)=>at($(`left:0;top:700px;width:1080px;text-align:center`,`<span class="w" style="display:inline-block;padding:16px 36px;border-radius:44px;background:${SOFT};color:${BL2};font:700 44px/1.2 R">${txt}</span>`),a,b,{anim:'pop',s0:.7,dur:.28,fo:.08,sfx:'ding'});
chip('ציון התאמה 94%',2.2,4.0);chip('לייק הדדי. נפתח צ׳אט.',4.0,5.6);chip('סיור: חמישי 18:30',5.6,END_A);
bubble(1515,'מצאתי שותפים.','l',{tone:'soft',name:'הצב',a:7.0,b:END_A,at:{fo:0},sfx:'boing'});
caption(1705,['הצב כבר בסיור.','הארנב עדיין בקבוצות.'],8.6,END_A,{fs:60,cols:['#fff','#8FB1F7'],fo:0,sfx:'dun'});
at($(`left:0;top:1850px;width:1080px;text-align:center;font:500 36px/1.2 R;color:#8C8C8C;white-space:nowrap`,'הדמויות והמצבים בדיוניים'),0.8,END_A,{anim:'none',fo:0});

wipe(10.4,'אצלנו קו הסיום קרוב.');
wordmark(11.5,DUR);
FEAT.matchX(11.55,13.9,['תקציב','אזור','תאריך כניסה']);
FEAT.mutual(13.9,15.9);
FEAT.tours(15.9,17.8);
endCard(17.8,DUR);

function render(t){runItems(t);
  if(t<10.9){
    if(t<1.0)turtle(null);else{
    const e=outBack(seg(t,1.0,.45));
    const p=seg(t,1.8,4.8),k=p*p*(3-2*p);const x=190+k*540;
    const walking=t>=1.8&&p<1;
    turtle({x,y:1470-(walking?Math.abs(Math.sin(t*7))*14:0)+(1-e)*400,s:1.1,pose:p>=1?'celebrate':(t<1.8?'hello':'base'),rot:walking?Math.sin(t*7)*1.5:0})}}
  else turtleWhite(t,11.55,[11.55,13.9,15.9],17.8)}
window.AUDIO={dur:DUR,seed:40,sections:[[0,10.4,'POP',.14,1,0],[10.4,DUR,'POP',.19,1,1]],ticks:[0,0]};
window.render=render;window.EVENTS=EVENTS;window.SCENES=SCENES;window.DUR=DUR;render(0);
