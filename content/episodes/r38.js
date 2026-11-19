// Reel 38 — owner POV: the hare arrives first ("still relevant?"), the turtle arrives matched
const DUR=21.8;
const SCENES=[['a',0,10.4],['b',10.4,DUR]];
Tt.style.zIndex=50;
const END_A=10.95;
bg(INK,0,END_A);
caption(130,['מי מגיע ראשון','לבעלת הדירה?'],0.1,END_A,{fs:104,cols:['#fff','#8FB1F7'],fo:0});

// owner (right), expression follows the story
character(`left:700px;top:560px;`,300,0.6,END_A,(l,t)=>{
  if(t<2.0)return{hair:'long',shirt:'#fff',brow:'up',eyes:'open',mouth:'smile',look:-1};
  if(t<4.4)return{hair:'long',shirt:'#fff',brow:'sad',eyes:'open',mouth:'flat',sweat:t>3.4,look:-1};
  if(t<5.8)return{hair:'long',shirt:'#fff',brow:'sus',eyes:'narrow',mouth:'flat',look:-1};
  if(t<7.6)return{hair:'long',shirt:'#fff',brow:'up',eyes:'wide',mouth:'o',look:-1};
  return{hair:'long',shirt:'#fff',brow:'up',eyes:'open',mouth:'grin',hearts:true,look:-1}},{fo:0});

// original hare (flat line style), faces right
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
at(hare,1.0,END_A,{anim:'none',fo:0,up:(l,t)=>{
  let x=-380,y=1214;
  if(t<2.0)x=-380;
  else if(t<3.2){const p=outCubic(seg(t,2.0,1.2));x=-380+p*(500+380);y-=Math.abs(Math.sin(t*15))*30}
  else if(t<5.0){x=500}
  else if(t<5.7){const p=seg(t,5.0,.7);x=500-p*p*1000;y-=Math.sin(p*Math.PI)*120}
  else x=-500;
  hare.style.transform=`translate(${x}px,${y}px)`}});

at($(`left:60px;top:1520px;width:960px;height:8px;background:#3A3A3A`),1.0,END_A,{anim:'none',fo:0});
bubble(1030,'עדיין רלוונטי?','l',{tone:'white',a:3.3,b:5.0,at:{fo:.1},sfx:'boing'});
bubble(640,'ומה התקציב שלך?','l',{tone:'soft',name:'בעלת הדירה',a:4.0,b:5.8,at:{fo:.1}});
bubble(1000,'ציון התאמה 92%.','l',{tone:'white',a:6.8,b:END_A,at:{fo:0},sfx:'ding'});
bubble(1130,'תקציב, אזור, תאריך כניסה.','l',{tone:'soft',a:7.4,b:END_A,at:{fo:0},fs:48});
caption(1640,['הארנב הגיע ראשון.','הצב הגיע מתאים.'],8.6,END_A,{fs:68,cols:['#fff','#8FB1F7'],fo:0,sfx:'dun'});
at($(`left:0;top:1840px;width:1080px;text-align:center;font:500 38px/1.2 R;color:#8C8C8C;white-space:nowrap`,'הדמויות בדיוניות'),0.8,END_A,{anim:'none',fo:0});

wipe(10.4,'אצלנו מי שמתאים.');
wordmark(11.5,DUR);
FEAT.applicants(11.55,13.5);
FEAT.matchX(13.5,15.6,['תקציב','אזור','תאריך כניסה'],'כל מועמד','עם הסיבות.');
FEAT.tours(15.6,17.8);
endCard(17.8,DUR);

function render(t){runItems(t);
  if(t<10.9){
    if(t<5.2){turtle(null)}else{
    const p=outCubic(seg(t,5.4,2.4));const walking=p<1&&t>=5.4;
    const x=-250+p*(500+250);const y=1500-(walking?Math.abs(Math.sin(t*7))*14:0);
    turtle({x,y,s:1.15,pose:t>=7.4?'celebrate':'base',rot:walking?Math.sin(t*7)*1.5:0})}}
  else turtleWhite(t,11.55,[11.55,13.5,15.6],17.8)}
window.AUDIO={dur:DUR,seed:38,sections:[[0,10.4,'DET',.12,1,0],[10.4,DUR,'POP',.19,1,1]],ticks:[0,0]};
window.render=render;window.EVENTS=EVENTS;window.SCENES=SCENES;window.DUR=DUR;render(0);
