// Reel 29 — apartment chat ep.2 (series 7, ongoing plot): Maya is moving out.
const DUR=21.9;
const SCENES=[['a',0,11.6],['b',11.6,DUR]];
Tt.style.zIndex=50;
const END_A=12.2;

bg(INK,0,END_A);
caption(150,['קבוצת הדירה.'],0.1,END_A,{fs:104,fo:0});
caption(262,['פרק 2'],0.3,END_A,{fs:56,c:'#8FB1F7',fo:0});

const P={fo:0};
bubble(340,'חברים, אני עוברת דירה.','l',{name:'מאיה',tone:'blue',weight:700,a:0.9,b:END_A,at:P});
bubble(540,'בגלל הפסטה?!','r',{name:'נועם',a:2.5,b:END_A,at:P,sfx:'thud'});
bubble(740,'אמרתי שהיה טעים.','l',{name:'דור',a:4.0,b:END_A,at:P});
bubble(940,'אני סוגרת עד סוף החודש.','l',{name:'מאיה',tone:'blue',weight:700,a:5.6,b:END_A,at:P,sfx:'thud'});
bubble(1140,'...נמצא מישהו חדש.','r',{name:'דור',a:7.3,b:END_A,at:P,sfx:'boing'});

// the turtle reads along (one turtle per frame, on a soft panel)
at($(`left:600px;top:1330px;width:420px;height:300px;border-radius:44px;background:${SOFT}`),8.6,11.5,{anim:'pop',s0:.6,dur:.3,fo:.1,sfx:'pop'});
at($(`left:600px;top:1350px;width:420px;text-align:center;font:700 34px/1.2 R;color:${BL2};white-space:nowrap`,'הצב · נקרא'),8.9,11.5,{anim:'fade',fo:.1,dur:.2});
caption(1630,['יש חדר פנוי.','צריך התאמה.'],9.6,11.5,{fs:78,cols:['#fff','#8FB1F7'],fo:.1,sfx:'dun'});
at($(`left:0;top:1840px;width:1080px;text-align:center;font:500 38px/1.2 R;color:#8C8C8C;white-space:nowrap`,'השיחה והדמויות בדיוניות'),0.8,END_A,{anim:'none',fo:0});

/* ---------- wipe + homie ---------- */
wipe(11.6,'מפרסמים חדר.');
wordmark(12.65,DUR);
FEAT.noBrokers(12.7,14.5);
FEAT.applicants(14.5,16.3);
FEAT.free(16.3,17.9);
endCard(17.9,DUR,'קבוצת הדירה · פרק 3 בקרוב.');

function render(t){runItems(t);
  if(t>=8.7&&t<11.5){const l=t-8.7;const e=outBack(seg(l,0,.45));turtle({x:810,y:1600+(1-e)*120,s:.78*Math.max(.01,e),pose:'search',rot:Math.sin(t*3)*1.5})}
  else if(t<12.6)turtle(null);
  else turtleWhite(t,12.65,[12.7,14.5,16.3],17.9)}
window.render=render;window.EVENTS=EVENTS;window.SCENES=SCENES;window.DUR=DUR;render(0);
