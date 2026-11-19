// Reel 35 — "ראיון לחדר": the owner interviews a candidate for 47 minutes; everything was already in the form
const DUR=21.8;
const SCENES=[['a',0,10.4],['b',10.4,DUR]];
Tt.style.zIndex=50;
const END_A=10.95;
bg(INK,0,END_A);
const day=(lines,a,b,o={})=>caption(330,lines,a,b,Object.assign({fs:100,fo:.05},o));
day(['ראיון לחדר.'],0.1,3.2);
day(['דקה 19.'],3.2,6.6);
day(['דקה 47.'],6.6,9.2,{cols:['#8FB1F7']});
at($(`left:60px;top:600px;width:960px;height:920px;border-radius:60px;background:#fff`),1.8,END_A,{anim:'pop',s0:.92,dur:.3,fo:0});
// owner (glasses, left) and candidate (right)
character(`left:50px;top:900px;`,340,1.8,END_A,(l)=>{const k=talkAt(l,[0.6,3.0,5.4],1.1);return{hair:'short',glasses:true,shirt:BLUE,brow:l>7?'sus':'flat',eyes:l>7?'narrow':'open',look:1,mouth:k>=0?'talk':l>7?'flat':'smile',talk:k}},{fo:0});
character(`left:690px;top:900px;`,340,1.8,END_A,(l)=>{const k=talkAt(l,[1.9,4.3,6.5],1.1);return{hair:'curly',shirt:'#fff',brow:l>7?'sad':'flat',eyes:l>7?'roll':'open',look:-1,mouth:k>=0?'talk':l>7?'wavy':'smile',talk:k,sweat:l>7}},{fo:0});
at($(`left:60px;top:1300px;width:960px;height:220px;background:#fff;border-top:7px solid ${INK};border-radius:0 0 60px 60px`),1.8,END_A,{anim:'none',fo:0});
bubble(690,'מעשנת?','l',{tone:'blue',tail:'down',tailX:150,a:2.4,b:4.0,at:{fo:0}});
bubble(850,'לא.','r',{tone:'ink',tail:'down',tailX:150,a:3.2,b:4.9,at:{fo:0}});
bubble(690,'חיות מחמד?','l',{tone:'blue',tail:'down',tailX:150,a:4.9,b:6.6,at:{fo:0}});
bubble(850,'חתול. כתוב בטופס.','r',{tone:'ink',tail:'down',tailX:150,a:5.7,b:7.2,at:{fo:0}});
bubble(690,'מתי נכנסת?','l',{tone:'blue',tail:'down',tailX:150,a:7.2,b:END_A,at:{fo:0}});
bubble(850,'...גם זה כתוב.','r',{tone:'ink',weight:700,tail:'down',tailX:150,a:8.0,b:END_A,at:{fo:0},sfx:'thud'});
caption(1620,['47 דקות.','הכול כבר היה כתוב.'],8.9,END_A,{fs:80,cols:['#fff','#8FB1F7'],fo:0,sfx:'dun'});
at($(`left:0;top:1830px;width:1080px;text-align:center;font:500 38px/1.2 R;color:#8C8C8C;white-space:nowrap`,'הדמויות והמצבים בדיוניים'),1.8,END_A,{anim:'none',fo:0});

wipe(10.4,'בלי ראיון.');
wordmark(11.5,DUR);
FEAT.matchX(11.55,14.4,['עישון','חיות מחמד','משך חוזה'],'רואים לפני','שמדברים.');
feat(14.4,16.2,`${hl(380,'ואז מדברים')}${hl(510,'רק עם מי שמתאים.',BLUE,100)}${sub(690,'והסיור נקבע בצ׳אט.')}`);
FEAT.free(16.2,17.8);
endCard(17.8,DUR);

function render(t){runItems(t);turtleWhite(t,11.55,[11.55,14.4,16.2],17.8)}
window.AUDIO={dur:DUR,seed:35,sections:[[0,10.4,'DET',.12,1,0],[10.4,DUR,'POP',.19,1,1]],ticks:[0,0]};
window.render=render;window.EVENTS=EVENTS;window.SCENES=SCENES;window.DUR=DUR;render(0);
