// Reel 36 — call for stories: "שלחו לנו את סיפור הדירה הגרוע שלכם"
const DUR=21.8;
const SCENES=[['a',0,10.4],['b',10.4,DUR]];
Tt.style.zIndex=50;
const END_A=10.95;
bg(INK,0,END_A);
caption(130,['סיפור הדירה','הכי גרוע שלכם?'],0.1,END_A,{fs:104,cols:['#fff','#8FB1F7'],fo:0});
bubble(470,'מקרר אחד, ארבעה שותפים.','r',{a:1.4,b:END_A,at:{fo:0}});
bubble(640,'סיור עם עוד שישה אנשים.','l',{tone:'soft',a:2.9,b:END_A,at:{fo:0}});
bubble(810,'"נחזור אליך." עד היום.','r',{a:4.4,b:END_A,at:{fo:0},sfx:'boing'});
at($(`left:230px;top:1000px;width:620px;height:430px;border-radius:56px;background:${SOFT}`),5.8,END_A,{anim:'pop',s0:.6,dur:.3,fo:0,sfx:'pop'});
at($(`left:230px;top:1020px;width:620px;text-align:center;font:700 38px/1.2 R;color:${BL2};white-space:nowrap`,'הצב · אוסף'),6.1,END_A,{anim:'fade',fo:0,dur:.2});
caption(1490,['כתבו בתגובות.','הכי טובים — בפרק הבא.'],6.8,END_A,{fs:76,cols:['#fff','#8FB1F7'],fo:0,sfx:'dun'});
at($(`left:0;top:1840px;width:1080px;text-align:center;font:500 38px/1.2 R;color:#8C8C8C;white-space:nowrap`,'הדוגמאות בדיוניות'),0.8,END_A,{anim:'none',fo:0});

wipe(10.4,'בינתיים:');
wordmark(11.5,DUR);
FEAT.noBrokers(11.55,13.4);
FEAT.matchX(13.4,15.6,['תקציב','אזור','תאריך כניסה']);
feat(15.6,17.2,`${hl(380,'פחות סיפורים.')}${hl(510,'יותר מפתחות.',BLUE)}`);
endCard(17.2,DUR,'סיפורים? בתגובות.');

function render(t){runItems(t);
  if(t>=5.9&&t<10.9){const e=outBack(seg(t,5.9,.45));turtle({x:540,y:1385+(1-e)*160,s:1.05*Math.max(.01,e),pose:'search',rot:Math.sin(t*3)*1.5})}
  else if(t<11.5)turtle(null);
  else turtleWhite(t,11.55,[11.55,13.4,15.6],17.2)}
window.AUDIO={dur:DUR,seed:36,sections:[[0,10.4,'CG',.13,0,0],[10.4,DUR,'POP',.19,1,1]],ticks:[0,0]};
window.render=render;window.EVENTS=EVENTS;window.SCENES=SCENES;window.DUR=DUR;render(0);
