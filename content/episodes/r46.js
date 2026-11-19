// Reel 46 v2 — apartment chat ep.4: Yuval's first day, the pasta (direct continuation of ep.3 / r31)
const DUR=22.1;
const SCENES=[['a',0,11.6],['b',11.6,DUR]];
Tt.style.zIndex=50;
const END_A=12.2;

bg(INK,0,END_A);
caption(150,['קבוצת הדירה.'],0.1,END_A,{fs:104,fo:0});

const P={fo:0};
caption(262,['פרק 4'],0.3,END_A,{fs:56,c:'#8FB1F7',fo:0});
bubble(340,'הגעתי! שמתי פסטה במקרר. שלי.','l',{name:'יובל',tone:'soft',a:0.9,b:END_A,at:P});
bubble(540,'הכלל שלי: לא אוכלים ממה שלא שלכם.','r',{name:'דור',a:2.7,b:END_A,at:P,sfx:'boing',fs:52});
bubble(740,'דור. הקופסה של יובל ריקה.','l',{name:'מאיה',tone:'blue',weight:700,a:4.6,b:END_A,at:P,sfx:'thud'});
bubble(940,'לא אני.','r',{name:'נועם',a:6.5,b:END_A,at:P});
bubble(1140,'רק טעמתי.','r',{name:'דור',a:8.0,b:END_A,at:P,sfx:'boing'});

// the turtle reads along
at($(`left:600px;top:1330px;width:420px;height:300px;border-radius:44px;background:${SOFT}`),9.0,11.5,{anim:'pop',s0:.6,dur:.3,fo:.1,sfx:'pop'});
at($(`left:600px;top:1350px;width:420px;text-align:center;font:700 34px/1.2 R;color:${BL2};white-space:nowrap`,'הצב · נקרא'),9.3,11.5,{anim:'fade',fo:.1,dur:.2});
caption(1630,['יום ראשון ביחד.','הכלל החזיק שעה.'],9.8,11.5,{fs:78,cols:['#fff','#8FB1F7'],fo:.1,sfx:'dun'});
at($(`left:0;top:1840px;width:1080px;text-align:center;font:500 38px/1.2 R;color:#8C8C8C;white-space:nowrap`,'השיחה והדמויות בדיוניות'),0.8,END_A,{anim:'none',fo:0});

/* ---------- wipe + homie ---------- */
wipe(11.6,'התאמה קודם.');
wordmark(12.65,DUR);
FEAT.match(12.7,14.6);
FEAT.mutual(14.6,16.6);
FEAT.free(16.6,18.0);
endCard(18.0,DUR,'קבוצת הדירה · פרק 5 בקרוב.');

function render(t){runItems(t);
  if(t>=9.1&&t<11.5){const l=t-9.1;const e=outBack(seg(l,0,.45));turtle({x:810,y:1600+(1-e)*120,s:.78*Math.max(.01,e),pose:'search',rot:Math.sin(t*3)*1.5})}
  else if(t<12.6)turtle(null);
  else turtleWhite(t,12.65,[12.7,14.6,16.6],18.0)}
window.AUDIO={dur:DUR,seed:46,sections:[[0,11.6,'DET',.11,1,0],[11.6,DUR,'POP',.19,1,1]],ticks:[0,0]};
window.render=render;window.EVENTS=EVENTS;window.SCENES=SCENES;window.DUR=DUR;render(0);
