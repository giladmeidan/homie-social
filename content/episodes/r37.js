// Reel 37 — "המרוץ על הדירה": the hare vs the turtle race to be the first applicant
const DUR=21.8;
const SCENES=[['a',0,10.4],['b',10.4,DUR]];
Tt.style.zIndex=50;
const END_A=10.95;
bg(INK,0,END_A);
caption(130,['המרוץ על','הדירה.'],0.1,END_A,{fs:112,cols:['#fff','#8FB1F7'],fo:0});

// original hare (flat line style, white fill, ink stroke), faces right
const hareSVG=(sleep)=>`<svg viewBox="0 0 300 260" width="330" height="286" style="overflow:visible;display:block">
 <path d="M150 90 Q120 -10 150 -20 Q176 -14 176 90Z" fill="#fff" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>
 <path d="M186 92 Q196 -2 226 4 Q248 14 218 98Z" fill="#fff" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>
 <ellipse cx="120" cy="190" rx="100" ry="58" fill="#fff" stroke="${INK}" stroke-width="7"/>
 <circle cx="40" cy="168" r="26" fill="#fff" stroke="${INK}" stroke-width="7"/>
 <circle cx="200" cy="132" r="64" fill="#fff" stroke="${INK}" stroke-width="7"/>
 ${sleep?`<path d="M206 124 Q222 110 238 124" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>`:`<circle cx="222" cy="122" r="11" fill="${INK}"/><circle cx="226" cy="118" r="3.5" fill="#fff"/>`}
 <circle cx="196" cy="152" r="11" fill="${BLUSH}"/><circle cx="262" cy="140" r="9" fill="${INK}"/>
 <path d="M60 232 L60 252 H100 M150 238 L150 252 H196" fill="none" stroke="${INK}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const hare=$('left:0;top:0;width:330px;height:286px;transform-origin:0 0');
hare.innerHTML=hareSVG(false);let hareSleep=false;
at(hare,1.0,END_A,{anim:'none',fo:0,up:(l,t)=>{
  let x=130,y=830,rot=0;
  if(t<2.4){x=130}
  else if(t<3.7){const p=outCubic(seg(t,2.4,1.3));x=130+p*330;y-=Math.abs(Math.sin(t*14))*28;rot=-4}
  else{x=460}
  const sl=t>=5.0;if(sl!==hareSleep){hare.innerHTML=hareSVG(sl);hareSleep=sl}
  hare.style.transform=`translate(${x}px,${y}px) rotate(${rot}deg)`}});

// track: two lanes + finish line + the listing waiting at the end
at($(`left:80px;top:1130px;width:920px;height:8px;background:#3A3A3A`),1.0,END_A,{anim:'none',fo:0});
const flag=$(`left:930px;top:680px;width:50px;height:700px;background:repeating-conic-gradient(#fff 0 25%,${INK} 0 50%) 0 0/50px 50px;border-radius:8px`);
at(flag,1.0,END_A,{anim:'up',dy:0,fo:0});
const houseIcon=`<svg viewBox="0 0 200 140" width="150" height="105"><path d="M20 70 L100 12 L180 70 V132 H20Z" fill="#fff" stroke="${INK}" stroke-width="8" stroke-linejoin="round"/><rect x="82" y="84" width="36" height="48" rx="6" fill="${BLUE}"/></svg>`;
at($(`left:770px;top:520px;width:230px;text-align:center;font:700 40px/1.2 R;color:${NAMEC};white-space:nowrap`,`מודעה חדשה${houseIcon}`),1.0,END_A,{anim:'pop',s0:.7,fo:0,sfx:'pop'});
at($(`left:70px;top:760px;width:200px;text-align:left;font:700 40px/1 R;color:#8C8C8C`,'ארנב'),1.2,END_A,{anim:'fade',fo:0});
at($(`left:70px;top:1230px;width:200px;text-align:left;font:700 40px/1 R;color:#8C8C8C`,'צב'),1.2,END_A,{anim:'fade',fo:0});

bubble(560,'יש זמן.','l',{tone:'white',a:3.9,b:END_A,at:{fo:0},sfx:'boing'});
at($(`left:480px;top:700px;font:700 90px/1 F;color:${NAMEC};direction:ltr;letter-spacing:6px`,'Zzz'),5.2,END_A,{anim:'fade',fo:0});
bubble(560,'עוד פוסט אחד...','l',{tone:'white',a:6.8,b:END_A,at:{fo:0}});
bubble(1490,'ציון התאמה 92%. מגיש.','r',{tone:'soft',name:'הצב',a:3.0,b:END_A,at:{fo:0},fs:50});
at($(`left:0;top:1840px;width:1080px;text-align:center;font:500 38px/1.2 R;color:#8C8C8C;white-space:nowrap`,'הדמויות בדיוניות'),0.8,END_A,{anim:'none',fo:0});
caption(1655,['הצב הגיש ראשון.','הארנב עדיין גולל.'],8.6,END_A,{fs:64,cols:['#fff','#8FB1F7'],fo:0,sfx:'dun'});

wipe(10.4,'אצלנו לא רצים.');
wordmark(11.5,DUR);
FEAT.applicants(11.55,13.5);
feat(13.5,15.3,`${hl(380,'בעלי דירות?')}${hl(510,'רואים מי הגיש.',BLUE)}${sub(690,'ובדיוק כמה.')}`);
feat(15.3,17.8,`${hl(380,'לא הכי מהיר.')}${hl(510,'הכי מתאים.',BLUE)}${sub(690,'ציון התאמה עם הסיבות.')}`);
endCard(17.8,DUR);

function render(t){runItems(t);
  if(t<10.9){
    if(t<1.0){turtle(null)}else{
    const p=seg(t,3.0,5.4);let x=190+p*560;const walking=t>=3.0&&t<8.4&&p<1;
    const done=t>=8.4;let y=1425-(walking?Math.abs(Math.sin(t*7))*14:0);
    const e=outBack(seg(t,1.0,.45));
    turtle({x,y:y+(1-e)*500,s:1.15,pose:done?'celebrate':(t<3?'hello':'base'),rot:walking?Math.sin(t*7)*1.5:0})}}
  else turtleWhite(t,11.55,[11.55,13.5,15.3],17.8)}
window.AUDIO={dur:DUR,seed:37,sections:[[0,10.4,'CG',.13,0,0],[10.4,DUR,'POP',.19,1,1]],ticks:[0,0]};
window.render=render;window.EVENTS=EVENTS;window.SCENES=SCENES;window.DUR=DUR;render(0);
