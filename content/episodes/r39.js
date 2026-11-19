// Reel 39 — the race: searching everywhere vs. using homie (match score -> mutual like -> tour)
const DUR=21.8;
const SCENES=[['a',0,10.4],['b',10.4,DUR]];
Tt.style.zIndex=50;
const END_A=10.95;
bg(INK,0,END_A);
caption(130,['מי מגיע ראשון','לדירה?'],0.1,END_A,{fs:108,cols:['#fff','#8FB1F7'],fo:0});

const lab=(top,txt,a,c)=>at($(`left:0;top:${top}px;width:1080px;text-align:center;font:700 46px/1 R;color:${c}`,txt),a,END_A,{anim:'fade',fo:0});
lab(440,'מחפש בכל מקום',0.8,'#8C8C8C');
lab(935,'עם הומי',0.8,NAMEC);
at($(`left:70px;top:860px;width:940px;height:8px;background:#3A3A3A`),0.8,END_A,{anim:'none',fo:0});
at($(`left:70px;top:1390px;width:940px;height:8px;background:#3A3A3A`),0.8,END_A,{anim:'none',fo:0});
const flag=(top)=>at($(`left:960px;top:${top}px;width:44px;height:400px;background:repeating-conic-gradient(#fff 0 25%,${INK} 0 50%) 0 0/44px 44px;border-radius:6px`),0.8,END_A,{anim:'none',fo:0});
flag(500);flag(985);

// searcher (top lane)
const S=character(`left:70px;top:530px;`,250,0.8,END_A,(l,t)=>{
  let x=70;
  if(t>=1.8&&t<2.8)x=70+outCubic(seg(t,1.8,1))*230;
  else if(t>=2.8&&t<4.0)x=300-seg(t,2.8,1.2)*150;
  else if(t>=4.0&&t<5.0)x=150+outCubic(seg(t,4.0,1))*190;
  else if(t>=5.0&&t<6.4)x=340-seg(t,5.0,1.4)*200;
  else if(t>=6.4)x=140+Math.sin((t-6.4)*1.2)*20;
  S.style.left=x+'px';S.style.top=(530+(t>1.8&&t<6.4?Math.abs(Math.sin(t*9))*-10:0))+'px';
  return{hair:'curly',shirt:'#fff',brow:t>3?'sad':'up',eyes:t>5?'roll':t>3?'wide':'open',mouth:t>6?'wavy':t>3?'flat':'smile',sweat:t>3.5,look:1}},{fo:0});
const board=(txt,a,b)=>at($(`left:600px;top:560px;width:300px;padding:26px 0;border-radius:36px;background:#fff;color:${INK};font:700 48px/1.2 R;text-align:center;direction:rtl`,txt),a,b,{anim:'pop',s0:.6,dur:.3,fo:.08,sfx:'dun'});
board('"כבר הושכר."',2.8,4.3);board('מודעה מ-2021.',4.4,6.0);board('"נחזור אליך."',6.1,END_A);

// homie runner (bottom lane)
const H=character(`left:70px;top:1070px;`,250,0.8,END_A,(l,t)=>{
  let x=70;
  if(t>=1.8)x=70+outCubic(seg(t,1.8,4.6))*660;
  const run=t>1.8&&t<6.4;
  H.style.left=x+'px';H.style.top=(1070+(run?-Math.abs(Math.sin(t*9))*14:0)-(t>=6.4?Math.abs(Math.sin((t-6.4)*8))*30:0))+'px';
  const win=t>=6.4;
  return{hair:'short',shirt:BLUE,brow:'up',eyes:'open',mouth:win?'grin':'smile',hearts:win,look:1}},{fo:0});
const chip=(txt,a,b)=>at($(`left:0;top:1000px;width:1080px;text-align:center`,`<span class="w" style="display:inline-block;padding:18px 40px;border-radius:44px;background:${SOFT};color:${BL2};font:700 46px/1.2 R">${txt}</span>`),a,b,{anim:'pop',s0:.7,dur:.28,fo:.08,sfx:'ding'});
chip('ציון התאמה 94%',2.2,3.9);chip('לייק הדדי. נפתח צ׳אט.',4.0,5.5);chip('סיור: חמישי 18:30',5.6,END_A);
bubble(1450,'מצא שותפים.','r',{tone:'soft',a:6.6,b:END_A,at:{fo:0},sfx:'boing'});
caption(1655,['הוא כבר בסיור.','הוא עדיין בקבוצות.'],8.6,END_A,{fs:66,cols:['#fff','#8FB1F7'],fo:0,sfx:'dun'});
at($(`left:0;top:1840px;width:1080px;text-align:center;font:500 38px/1.2 R;color:#8C8C8C;white-space:nowrap`,'הדמויות והמצבים בדיוניים'),0.8,END_A,{anim:'none',fo:0});

wipe(10.4,'אצלנו קו הסיום קרוב.');
wordmark(11.5,DUR);
FEAT.matchX(11.55,13.9,['תקציב','אזור','תאריך כניסה']);
FEAT.mutual(13.9,15.9);
FEAT.tours(15.9,17.8);
endCard(17.8,DUR);
function render(t){runItems(t);if(t<11.5)turtle(null);else turtleWhite(t,11.55,[11.55,13.9,15.9],17.8)}
window.AUDIO={dur:DUR,seed:39,sections:[[0,10.4,'POP',.14,1,0],[10.4,DUR,'POP',.19,1,1]],ticks:[0,0]};
window.render=render;window.EVENTS=EVENTS;window.SCENES=SCENES;window.DUR=DUR;render(0);
