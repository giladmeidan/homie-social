// Reel 47 — sample: "הצבים של הומי" — three turtle characters (owner / sleepy / student), one turtle per frame, cut between them.
const DUR=24.8;
const SCENES=[['a',0,16.4],['b',16.4,DUR]];
Tt.style.zIndex=50;
const END_S=16.9;

// ---- accessories drawn in the turtle's own 400x300 coordinate space (never flipped) ----
const accEl=(svg)=>{const d=$('left:0;top:0;width:400px;height:300px;',svg,Tt);d.style.display='none';return d};
const ACC={
 owner:accEl(`<svg viewBox="0 0 400 300" width="400" height="300" style="overflow:visible"><path d="M316 130 Q340 84 388 112 L392 130 Q352 118 316 138 Z" fill="${INK}" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/><path d="M308 138 Q352 120 400 134" fill="none" stroke="${INK}" stroke-width="9" stroke-linecap="round"/><circle cx="352" cy="108" r="6" fill="#fff"/><circle cx="344" cy="238" r="11" fill="#fff" stroke="${INK}" stroke-width="6"/><path d="M344 249 V274 M344 262 h12 M344 270 h9" stroke="${INK}" stroke-width="6" stroke-linecap="round" fill="none"/></svg>`),
 sleepy:accEl(`<svg viewBox="0 0 400 300" width="400" height="300" style="overflow:visible"><path d="M98 136 L134 114 M98 136 L110 168 M98 136 L132 142 M104 146 Q118 130 134 124 M102 158 Q114 148 124 152" fill="none" stroke="#8C8C8C" stroke-width="3" stroke-linecap="round"/><path d="M316 126 Q336 80 394 98 Q372 108 368 134 Z" fill="#fff" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/><circle cx="395" cy="98" r="10" fill="${BLUE}" stroke="${INK}" stroke-width="4"/></svg>`),
 student:accEl(`<svg viewBox="0 0 400 300" width="400" height="300" style="overflow:visible"><rect x="40" y="138" width="58" height="92" rx="20" fill="${INK}"/><rect x="52" y="182" width="34" height="34" rx="9" fill="${BLUE}"/><path d="M58 138 Q69 118 80 138" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round"/></svg>`)
};

/* ---------- intro (dark) ---------- */
bg(INK,0,2.0);
caption(740,['הכירו את','הצבים.'],0.1,2.0,{fs:130,cols:['#fff','#8FB1F7'],fo:.1,sfx:'thud'});

/* ---------- three white scenes ---------- */
const P={fo:0};
const sceneTitle=(a,b,name,role)=>{
  caption(260,[name],a,b,{c:INK,fs:108,fo:.1,sfx:'pop'});
  at($('left:0;top:0;width:1080px;height:200px;',sub(430,role)),a+.2,b,{anim:'fade',fo:.1});
};
const L=(top,txt,a,b,o={})=>bubble(top,txt,'l',Object.assign({tone:'soft',a,b,at:P},o));
const R=(top,txt,a,b,o={})=>bubble(top,txt,'r',Object.assign({tone:'ink',a,b,at:P,tail:'down',tailX:180},o));

// 1. the owner
sceneTitle(2.0,6.9,'בעלת הבית.','בוקר. 08:00.');
L(560,'עדיין רלוונטי?',2.7,6.9);
L(740,'עדיין רלוונטי?',3.4,6.9);
L(920,'עדיין רלוונטי??',4.1,6.9);
R(1090,'כן. קודם ציון התאמה.',5.2,6.9,{sfx:'boing'});

// 2. the sleepy one
sceneTitle(6.9,11.8,'הצב הישנוני.','מודעה מ-2021.');
L(560,'המודעה עדיין זמינה?',7.6,11.8);
R(740,'חמש דקות...',8.5,11.8,{tail:null});
L(920,'היא מ-2021.',9.4,11.8);
R(1090,'אחרי 90 יום היא פגה. אני לא.',10.4,11.8,{fs:50,sfx:'boing'});

// 3. the student
sceneTitle(11.8,16.9,'הסטודנט.','תקציב וחלומות.');
R(560,'התקציב שלי 7,000.',12.5,16.9,{tail:null});
L(740,'הדירה: 7,900.',13.4,16.9);
L(920,'ציון התאמה: המחיר מעל התקציב.',14.2,16.9,{fs:48});
R(1090,'לפחות ידעתי מראש.',15.4,16.9,{sfx:'boing'});
at($('left:0;top:1860px;width:1080px;text-align:center;font:500 36px/1.2 R;color:#8C8C8C;white-space:nowrap','הדמויות והמצבים בדיוניים'),2.0,END_S,{anim:'none',fo:0});

/* ---------- wipe + homie ---------- */
wipe(16.4,'בית לכולם.');
wordmark(17.5,DUR);
FEAT.matchX(17.55,19.9,['תקציב','אזור','תאריך כניסה']);
feat(19.9,21.6,`${hl(380,'לכל צב')}${hl(510,'יש בית.',BLUE)}${sub(690,'גם לכם.')}`);
FEAT.free(21.6,23.0);
endCard(23.0,DUR,'הצבים חוזרים בקרוב.');

const SC=[[2.0,6.9,'base','owner'],[6.9,11.8,'sleep','sleepy'],[11.8,END_S,'hello','student']];
function render(t){runItems(t);
  let cur=null;for(const s of SC)if(t>=s[0]&&t<s[1])cur=s;
  for(const k in ACC)ACC[k].style.display=(cur&&cur[3]===k)?'block':'none';
  if(cur){const e=outBack(seg(t,cur[0]+.15,.5));const bob=Math.sin(t*5)*4;
    turtle({x:540,y:1760+(1-e)*520+bob,s:1.9,pose:cur[2],rot:cur[2]==='sleep'?0:Math.sin(t*3)*1.2})}
  else if(t<17.5)turtle(null);
  else turtleWhite(t,17.55,[17.55,19.9,21.6],23.0)}
window.AUDIO={dur:DUR,seed:47,sections:[[0,16.4,'POP',.14,1,0],[16.4,DUR,'POP',.19,1,1]],ticks:[0,0]};
window.render=render;window.EVENTS=EVENTS;window.SCENES=SCENES;window.DUR=DUR;render(0);
