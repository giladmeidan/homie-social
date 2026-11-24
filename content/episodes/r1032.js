// Reel H32 (1032) — Pain point · style B · voiced. N1: "בלי תיווך*" (a "no broker" ad with an asterisk).
// Cover (black): "״בלי תיווך״. / כמעט." + a white listing card (demo) with a big "בלי תיווך*" and the small line "*דמי טיפול" circled in blue.
// Hook: the card, the asterisk spins -> "בלי תיווך. / ממש בגדול." -> prompt "שלחו למי / שמחפשים דירה." at 2.4 s
// -> "ואז, / הכוכבית." the asterisk flies down to the small print, which grows and gets a blue ring
// -> white: "בהומי, רק / אנשים פרטיים." the asterisk and the small print are wiped off the card -> prompt again -> wordmark.
const DUR=11.2;
const COVER_END=0.4,P0=2.4,B2=5.4,B3=7.4,E0=10.4,WM=10.4;
const SCENES=[['a',0,B3],['b',B3,DUR]];
Tt.style.zIndex=50;
const GREY='#8C8C8C';

/* ---------- small static wordmark (white on black, then ink on white) ---------- */
const smallWM=(c)=>{const m=$(`left:0;top:280px;width:1080px;display:flex;justify-content:center;z-index:70`,WORDMARK);
  const s=m.querySelector('svg');s.style.cssText='width:200px;height:auto;display:block';s.querySelectorAll('[fill]').forEach(p=>p.setAttribute('fill',c));return m};
at(smallWM('#fff'),0,B3,{anim:'none',fo:0});
at(smallWM(INK),B3,WM,{anim:'none',fo:0});

/* ---------- the listing card (demo data), 820 x 600 ---------- */
const CX=130,CY=730;
const starSVG=(sz,c=BLUE)=>`<svg width="${sz}" height="${sz}" viewBox="-50 -50 100 100"><g stroke="${c}" stroke-width="16" stroke-linecap="round"><path d="M0 -40 V40"/><path d="M-34.6 -20 L34.6 20"/><path d="M-34.6 20 L34.6 -20"/></g></svg>`;
const cardHTML=(ring)=>`<div style="position:absolute;left:0;top:0;width:820px;height:600px;border-radius:44px;background:#fff;overflow:hidden;direction:rtl">
  <div style="position:absolute;left:0;top:0;width:820px;height:230px;background:${SOFT}">
    <svg style="position:absolute;left:250px;top:30px" width="320" height="200" viewBox="0 0 320 200"><path d="M40 200 V60 H150 V200 M170 200 V20 H280 V200" fill="#fff" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
      <g fill="${PALE}" stroke="${INK}" stroke-width="4"><rect x="62" y="84" width="30" height="30"/><rect x="104" y="84" width="30" height="30"/><rect x="62" y="134" width="30" height="30"/><rect x="104" y="134" width="30" height="30"/>
      <rect x="192" y="44" width="30" height="30"/><rect x="234" y="44" width="30" height="30"/><rect x="192" y="94" width="30" height="30"/><rect x="234" y="94" width="30" height="30"/><rect x="192" y="144" width="30" height="30"/><rect x="234" y="144" width="30" height="30"/></g></svg>
    <div class="w" style="position:absolute;right:30px;top:26px;padding:10px 26px;border-radius:30px;background:#fff;font:700 34px/1 R;color:${INK}">מודעה</div></div>
  <div class="w" style="position:absolute;right:44px;top:256px;font:500 42px/1 R;color:${MUTED}">חדר בדירת שותפים · גבעתיים</div>
  <div style="position:absolute;right:40px;top:330px;height:130px;display:flex;align-items:flex-start;direction:rtl">
    <div class="w" style="font:600 116px/1.05 F;color:${INK}">בלי תיווך</div>
    <div class="ast" style="width:64px;height:64px;margin-right:6px;margin-top:6px">${starSVG(64)}</div></div>
  <div class="fine" style="position:absolute;left:40px;top:500px;height:70px;padding:0 22px;border-radius:35px;${ring?`border:5px solid ${BLUE};`:'border:5px solid transparent;'}box-sizing:border-box;display:flex;align-items:center">
    <div class="w" style="font:500 36px/1 R;color:${GREY}">*דמי טיפול</div></div>
</div>`;

/* ---------- COVER (black): frame 0, fully drawn ---------- */
const cov=$(`left:0;top:0;width:1080px;height:1920px;background:${INK};z-index:60`,`
  <div style="position:absolute;left:0;top:280px;width:1080px;display:flex;justify-content:center">${WORDMARK.replace(/#111111/g,'#fff').replace('<svg ','<svg style="width:200px;height:auto" ')}</div>
  ${hl(400,'״בלי תיווך״.','#fff',124)}${hl(535,'כמעט.',BLUE,124)}
  <div style="position:absolute;left:${CX}px;top:${CY}px;width:820px;height:600px">${cardHTML(true)}</div>`);
at(cov,0,COVER_END,{anim:'none',fo:0});
window.COVER={t:0.2,title:'״בלי תיווך״. כמעט.'};

/* ---------- backgrounds ---------- */
bg(INK,0,B3);
bg('#fff',B3,DUR);

/* ---------- the live card (whole reel) ---------- */
const card=$(`left:${CX}px;top:${CY}px;width:820px;height:600px;z-index:5`,cardHTML(false));
const q=s=>card.querySelector(s);
at(card,COVER_END,DUR,{anim:'none',fo:0,up:(l,t)=>{
  // the card breathes and the asterisk spins from the first frame after the cover
  const bob=Math.sin(t*2.6)*6;card.style.transform=`translateY(${bob}px)`;
  const a=q('.ast');
  // beat 2: the asterisk leaves the headline and drops to the small print
  const fly=outCubic(seg(t,B2+.15,.55));
  // beat 3: it is wiped off (scale to 0)
  const gone=seg(t,B3+.5,.3);
  const pulse=t<B2?1+.12*Math.sin(t*7):1;
  a.style.transform=`translate(${-fly*460}px,${fly*150}px) rotate(${t*140}deg) scale(${pulse*(1+fly*.4)*(1-gone)})`;
  // the small print grows and gets a blue ring in beat 2, then is struck off in beat 3
  const f=q('.fine');const g=outBack(seg(t,B2+.6,.4));
  f.style.borderColor=t>=B2+.6&&t<B3+.5?BLUE:'transparent';
  f.style.transformOrigin='0 50%';f.style.transform=`scale(${1+g*.8})`;
  f.style.opacity=String(1-seg(t,B3+.5,.3));
  card.style.boxShadow=t>=B3?`0 0 0 6px ${INK}`:'none'}});
ev(B2+.7,'thud',1);ev(B3+.5,'swish',1);

/* ---------- hook ---------- */
caption(395,['״בלי תיווך״.','ממש בגדול.'],COVER_END,P0,{say:'בלי תיווך. ממש בגדול.',fs:124,cols:['#fff',BLUE],fo:.1,sfx:'thud'});

/* ---------- the prompt (by 3 s), under the card ---------- */
const promptHTML=(dark)=>`<div style="position:absolute;left:110px;top:0;width:860px;height:230px;border-radius:60px;background:${dark?'#fff':SOFT};border:5px solid ${dark?'#fff':INK};box-sizing:border-box;display:flex;align-items:center;justify-content:center;gap:30px;direction:rtl">
  <svg width="70" height="70" viewBox="0 0 70 70"><path d="M6 34 L64 8 L46 64 L34 40 Z" fill="${BLUE}"/><path d="M34 40 L64 8" stroke="#fff" stroke-width="4"/></svg>
  <div class="w" style="font:600 90px/1.02 F;color:${INK};text-align:center">שלחו למי<br>שמחפשים דירה.</div></div>`;
at($(`left:0;top:1355px;width:1080px;height:230px;z-index:9`,promptHTML(true)),P0,B2,{say:'תשלחו למי שמחפשים דירה.',dy:40,s0:.85,fo:.15,sfx:'pop2'});
window.PROMPT={t:2.4,text:'שלחו למי שמחפשים דירה.'};
// the hook words stay small above the card while the prompt is read
caption(480,['״בלי תיווך״.'],P0,B2,{say:false,fs:80,c:'#fff',anim:'none',fo:.1});

/* ---------- beat 2: the asterisk ---------- */
caption(395,['ואז,','הכוכבית.'],B2,B3,{say:'ואז, הכוכבית.',fs:124,cols:['#fff',BLUE],fo:.1,sfx:'whoosh'});
at($(`left:0;top:1385px;width:1080px;text-align:center;z-index:9`,`<div class="w" style="font:500 54px/1.25 R;color:${PALE}">בלי תיווך. רק עם דמי טיפול.</div>`),B2+.8,B3,{anim:'up',dy:30,fo:.12});

/* ---------- beat 3 (white): how it goes on homie ---------- */
caption(395,['בהומי, רק','אנשים פרטיים.'],B3,E0,{say:'בהומי, רק אנשים פרטיים.',fs:124,cols:[INK,BLUE],fo:.1,sfx:'whoosh2'});
at($(`left:0;top:1385px;width:1080px;text-align:center;z-index:9`,`<div class="w" style="font:500 56px/1.25 R;color:${MUTED}">בלי מתווכים. בלי כוכבית.</div>`),B3+.8,E0,{anim:'up',dy:30,fo:.12});

/* ---------- the prompt again + brand ending ---------- */
at($(`left:0;top:1355px;width:1080px;height:230px;z-index:9`,promptHTML(false)),E0,DUR,{anim:'up',dy:30,fo:0,sfx:'pop2',v:.6});
wordmark(WM,DUR);

/* ---------- footnote ---------- */
const fn=(c,a,b)=>at($(`left:0;top:1600px;width:1080px;text-align:center`,`<div class="w" style="font:500 34px/1.2 R;color:${c}">המודעה בדיונית. נתוני הדגמה.</div>`),a,b,{anim:'none',fo:0});
fn(GREY,COVER_END,B3);fn(GREY,B3,DUR);

function render(t){runItems(t);turtle(null)}
window.BEATS={payoff:B3,outro:E0};
window.AUDIO={dur:DUR,seed:1032,sections:[[0,B3,'FC',.13,0,1],[B3,DUR,'POP',.15,1,1]],ticks:[0.4,2.4]};
window.STRETCH=1.0;
window.VOICE={duck:0.7};   // narration = the say marks above
window.render=render;window.EVENTS=EVENTS;window.SCENES=SCENES;window.DUR=DUR;render(0);
