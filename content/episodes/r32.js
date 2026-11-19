// Reel 32 — "הצב נותן ציון התאמה": the turtle scores everyday things, then real listings
const DUR=21.8;
const SCENES=[['a',0,10.4],['b',10.4,DUR]];
Tt.style.zIndex=50;
const END_A=10.95;
caption(130,['הצב נותן','ציון התאמה.'],0.1,END_A,{fs:108,c:INK,cols:[INK,BLUE],fo:0});

const ITEMS_S=[
 ['קפה בבוקר',100,'התאמה מושלמת.',1.3],
 ['השכן שמקדח בשבת',12,'לא מתאים.',3.1],
 ['שותף שמשאיר כלים בכיור',31,'אפשר לדבר על זה.',4.9],
 ['מודעה בלי ציון',null,'אין לדעת.',6.7]];
const cards=ITEMS_S.map(([name,score,verdict,a],i)=>{
  const b=i<3?ITEMS_S[i+1][3]:END_A;
  const el=$(`left:90px;top:430px;width:900px;height:760px;border-radius:64px;background:${SOFT}`,
   `<div class="w" style="position:absolute;left:0;width:900px;top:48px;text-align:center;font:600 ${name.length>18?66:78}px/1.1 F;color:${INK}">${name}</div>
    <div class="rb" style="position:absolute;left:260px;top:170px;width:380px;height:380px">${ringHTML(380,34)}</div>
    <div class="w" style="position:absolute;left:0;width:900px;top:610px;text-align:center;font:700 60px/1 R;color:${score===null?MUTED:BL2}">${verdict}</div>`);
  at(el,a,b,{anim:'pop',s0:.9,dur:.3,fo:.08,sfx:'pop',up:(l)=>{const k=outCubic(seg(l,.2,.8));
    if(score===null){setRing(el.querySelector('.rb'),0,'?')}else setRing(el.querySelector('.rb'),score/100*k,Math.round(score*k)+'%')}});
  if(score!==null)ev(a+1.0,score>50?'ding':'dun');
  return el});

at($(`left:0;top:1830px;width:1080px;text-align:center;font:500 38px/1.2 R;color:#8C8C8C;white-space:nowrap`,'הציונים לצורך הבידור בלבד'),0.8,END_A,{anim:'none',fo:0});

wipe(10.4,'אצלנו יש.');
wordmark(11.5,DUR);
FEAT.matchX(11.55,14.4,['תקציב','אזור','תאריך כניסה'],'ציון התאמה','לכל מודעה.');
feat(14.4,16.2,`${hl(380,'גם לדירות.')}${hl(510,'גם לשותפים.',BLUE)}${sub(690,'עם הסיבות.')}`);
FEAT.free(16.2,17.8);
endCard(17.8,DUR);

function render(t){runItems(t);
  if(t<10.9){const hops=[1.3,3.1,4.9,6.7];let y=1810;hops.forEach(h=>{const l=t-h-.05;if(l>0&&l<.4)y-=Math.sin(l/.4*Math.PI)*60});
    const e=outBack(seg(t,0.5,.5));turtle({x:540,y:y+(1-e)*600,s:1.8,pose:t>6.7?'search':'hello',rot:Math.sin(t*5)*1.2})}
  else turtleWhite(t,11.55,[11.55,14.4,16.2],17.8)}
window.AUDIO={dur:DUR,seed:32,sections:[[0,10.4,'CG',.13,0,0],[10.4,DUR,'POP',.19,1,1]],ticks:[0,0]};
window.render=render;window.EVENTS=EVENTS;window.SCENES=SCENES;window.DUR=DUR;render(0);
