// Reel 34 — owner POV: 42 messages every morning vs an organised applicant list
const DUR=21.8;
const SCENES=[['a',0,10.4],['b',10.4,DUR]];
Tt.style.zIndex=50;
const END_A=10.95;
bg(INK,0,END_A);
caption(130,['בעלת דירה.','08:00.'],0.1,END_A,{fs:104,cols:['#fff','#8FB1F7'],fo:0});

const cnt=(t)=>t<1.2?0:Math.min(42,Math.round(42*outCubic(seg(t,1.2,6.2))));
character(`left:110px;top:820px;`,380,0.6,END_A,(l,t)=>{const n=cnt(t);
  return{hair:'long',shirt:'#fff',eyes:n>12?'wide':'open',brow:n>25?'sad':'up',mouth:n>30?'o':n>10?'flat':'smile',sweat:n>20,twitch:n>34&&Math.floor(t*8)%2===0,look:-1}},{fo:0});
// message badge counting up
const badge=$(`left:640px;top:860px;width:300px;height:300px;border-radius:50%;background:${BLUE};color:#fff;text-align:center;font:700 150px/300px R;direction:ltr`);
at(badge,0.9,END_A,{anim:'pop',s0:.6,dur:.35,fo:0,sfx:'pop',up:(l,t)=>{badge.textContent=cnt(t);badge.style.transform+=` scale(${1+.05*Math.sin(t*16)*(cnt(t)<42?1:0)})`}});
at($(`left:610px;top:1180px;width:360px;text-align:center;font:700 44px/1.2 R;color:${NAMEC};white-space:nowrap`,'הודעות חדשות'),1.0,END_A,{anim:'fade',fo:0});
for(let k=1;k<=14;k++)ev(1.3+k*.35,'pin');
const msgs=[['r',390,'עדיין רלוונטי?',1.4],['l',500,'כמה זה?',2.2],['r',610,'אפשר לראות?',3.0],['l',1270,'יש חניה?',3.8],['r',1370,'עדיין רלוונטי?',4.6],['l',1470,'שלום??',5.4]];
msgs.forEach(([s,top,txt,a])=>bubble(top,txt,s,{a,b:END_A,at:{fo:0},tone:s==='r'?'white':'soft',fs:52}));
caption(1620,['42 פעמים:','"עדיין רלוונטי?"'],7.2,END_A,{fs:72,cols:['#fff','#8FB1F7'],fo:0,sfx:'dun'});
at($(`left:0;top:1840px;width:1080px;text-align:center;font:500 38px/1.2 R;color:#8C8C8C;white-space:nowrap`,'הדמויות והמצבים בדיוניים'),0.8,END_A,{anim:'none',fo:0});

wipe(10.4,'ועכשיו בסדר.');
wordmark(11.5,DUR);
FEAT.applicants(11.55,13.6);
FEAT.matchX(13.6,15.8,['תאריך כניסה','חיות מחמד','משך חוזה'],'כל מועמד','עם הסיבות.');
feat(15.8,17.6,`${hl(380,'אתם פותחים שעות.')}${hl(510,'הם בוחרים.',BLUE)}${sub(690,'בלי "מתי נוח לך?"')}`);
endCard(17.6,DUR);

function render(t){runItems(t);turtleWhite(t,11.55,[11.55,13.6,15.8],17.6)}
window.AUDIO={dur:DUR,seed:34,sections:[[0,10.4,'DET',.12,1,0],[10.4,DUR,'POP',.19,1,1]],ticks:[0,0]};
window.render=render;window.EVENTS=EVENTS;window.SCENES=SCENES;window.DUR=DUR;render(0);
