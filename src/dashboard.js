// Server-rendered admin dashboard. No build step and no outside scripts: each page is one HTML string.
// Pages: Overview · Instagram · TikTok · a page per reel · System (health + activity log).

import { RANGES } from './insights.js';

// ---------------- formatting ----------------

const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const nf = new Intl.NumberFormat('en-US');
const cf = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });
const num = (v) => (typeof v === 'number' ? nf.format(Math.round(v)) : '–');
const compact = (v) => (typeof v === 'number' ? (Math.abs(v) >= 10000 ? cf.format(v) : nf.format(Math.round(v))) : '–');
const pct = (v) => (typeof v === 'number' ? `${(v * 100).toFixed(v < 0.1 ? 1 : 0)}%` : '–');
const secs = (v) => (typeof v === 'number' ? `${v.toFixed(1)}s` : '–');

const MIN = 60 * 1000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

function rel(iso, nowMs = Date.now()) {
  if (!iso) return '–';
  const d = nowMs - new Date(iso).getTime();
  if (d < MIN) return 'just now';
  if (d < HOUR) return `${Math.round(d / MIN)}m ago`;
  if (d < DAY) return `${Math.round(d / HOUR)}h ago`;
  if (d < 14 * DAY) return `${Math.round(d / DAY)}d ago`;
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}
function when(iso, timeZone) {
  if (!iso) return '–';
  return new Date(iso).toLocaleString('en-GB', { timeZone, day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

// ---------------- what each number means (shown on hover and in the glossary) ----------------

export const GLOSSARY = {
  views: ['Views', 'How many times the reel was played. One person watching twice counts twice.'],
  gained: ['Views gained', 'New views during the selected period, on every reel, old and new.'],
  reach: ['Reach', 'How many different accounts saw the reel at least once.'],
  day1: ['First-day views', 'Views in the reel’s first 24 hours. The fairest way to compare reels, because older reels have simply had more time to collect views.'],
  typical: ['Typical reel', 'The middle value of first-day views over your reels from the last 30 days: half did better, half did worse. Shown once at least 3 reels are a day old.'],
  vs: ['vs typical', 'This reel’s first-day views divided by the typical reel’s. 2.0× means twice as many; 0.5× means half.'],
  engagement: ['Engagement', 'Instagram: likes, comments, shares and saves divided by reach. TikTok: likes, comments and shares divided by views. The share of viewers who reacted.'],
  watch: ['Avg watch time', 'How long people watched the reel on average, per play. Instagram only; TikTok does not share it.'],
  followers: ['Followers', 'Accounts following you, with the change over the selected period.'],
  posted: ['Reels posted', 'Reels published during the selected period.'],
  trend: ['48h trend', 'Views over the last 48 hours, one point per hourly measurement.'],
};
const info = (key) =>
  GLOSSARY[key] ? `<span class="info" tabindex="0" role="note" aria-label="${esc(GLOSSARY[key][1])}" data-tip="${esc(GLOSSARY[key][1])}">i</span>` : '';

// ---------------- styles ----------------

const STYLE = `
.viz-root{color-scheme:light;--surface-0:#f4f4f2;--surface-1:#fcfcfb;--surface-2:#f0efeb;--line:#e4e3df;--text-primary:#0b0b0b;
--text-secondary:#52514e;--text-muted:#6f6e68;--ig:#2563EB;--tt:#eb6834;--track:#ecebe7;--focus:#2563EB;
--good:#0ca30c;--warning:#fab219;--serious:#ec835a;--critical:#d03b3b;--good-ink:#0a7a0a;--critical-ink:#b42c2c;--warning-ink:#8a5a00}
@media (prefers-color-scheme:dark){.viz-root{color-scheme:dark;--surface-0:#111110;--surface-1:#1a1a19;--surface-2:#222220;--line:#2e2e2c;
--text-primary:#f0efec;--text-secondary:#c3c2b7;--text-muted:#9a998f;--ig:#3987e5;--tt:#d95926;--track:#262624;--focus:#3987e5;
--good-ink:#3fc93f;--critical-ink:#ef7171;--warning-ink:#fab219}}
*{box-sizing:border-box}
body{margin:0;background:var(--surface-0);color:var(--text-primary);font:14px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
a{color:inherit}
main{max-width:1160px;margin:0 auto;padding:0 20px 64px}
.top{position:sticky;top:0;z-index:5;background:color-mix(in srgb,var(--surface-0) 92%,transparent);backdrop-filter:blur(6px);
border-bottom:1px solid var(--line);margin:0 -20px 20px;padding:12px 20px}
.top-row{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;max-width:1120px;margin:0 auto}
.brand{font-weight:700;font-size:16px;letter-spacing:-.01em;text-decoration:none;margin-right:8px}
nav.tabs{display:flex;gap:2px;flex-wrap:wrap}
nav.tabs a{padding:6px 11px;border-radius:8px;text-decoration:none;color:var(--text-secondary)}
nav.tabs a:hover{background:var(--surface-2);color:var(--text-primary)}
nav.tabs a[aria-current=page]{background:var(--surface-1);color:var(--text-primary);border:1px solid var(--line);font-weight:600}
.right{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.seg{display:inline-flex;border:1px solid var(--line);border-radius:9px;overflow:hidden;background:var(--surface-1)}
.seg a{padding:5px 10px;text-decoration:none;color:var(--text-secondary);font-size:13px;border-left:1px solid var(--line)}
.seg a:first-child{border-left:0}
.seg a[aria-current=true]{background:var(--text-primary);color:var(--surface-1)}
h1{font-size:22px;margin:0;letter-spacing:-.01em}
h2{font-size:15px;margin:0}
.sub{color:var(--text-secondary);font-size:13px}
.muted{color:var(--text-muted)}
.page-head{display:flex;justify-content:space-between;align-items:flex-end;gap:12px;flex-wrap:wrap;margin-bottom:16px}
.card{background:var(--surface-1);border:1px solid var(--line);border-radius:14px;padding:18px}
.card-head{display:flex;justify-content:space-between;align-items:baseline;gap:10px;flex-wrap:wrap;margin-bottom:10px}
.grid{display:grid;gap:14px}
.stack{display:grid;gap:14px}
.kpis{grid-template-columns:repeat(auto-fit,minmax(165px,1fr))}
.kpi .label{color:var(--text-secondary);font-size:12.5px;display:flex;align-items:center;gap:6px}
.kpi .value{font-size:28px;font-weight:650;letter-spacing:-.02em;margin-top:2px;font-variant-numeric:tabular-nums;line-height:1.2}
.kpi .note{color:var(--text-muted);font-size:12px;margin-top:3px}
.delta{font-size:12.5px;font-weight:600;font-variant-numeric:tabular-nums}
.delta.up{color:var(--good-ink)}.delta.down{color:var(--critical-ink)}.delta.flat{color:var(--text-muted)}
.two{grid-template-columns:1fr 1fr}
.wide{grid-template-columns:3fr 2fr}
@media (max-width:860px){.two,.wide{grid-template-columns:1fr}}
button,.btn{font:inherit;font-size:13px;border:1px solid var(--line);background:var(--surface-1);color:var(--text-primary);border-radius:8px;
padding:6px 11px;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;gap:6px}
button:hover,.btn:hover{border-color:var(--text-muted)}
:focus-visible{outline:2px solid var(--focus);outline-offset:2px}
.info{display:inline-grid;place-items:center;width:15px;height:15px;border-radius:50%;border:1px solid var(--text-muted);color:var(--text-muted);
font:600 10px/1 system-ui;cursor:help;flex:none}
.findings{list-style:none;margin:0;padding:0;display:grid;gap:10px}
.findings li{display:grid;grid-template-columns:22px 1fr;gap:8px;align-items:start;font-size:14.5px}
.findings .ico{width:22px;height:22px;border-radius:50%;display:grid;place-items:center;font-size:12px;font-weight:700;color:#fff}
.ico.good{background:var(--good)}.ico.info{background:var(--text-muted)}.ico.watch{background:var(--warning);color:#1a1a19}
.findings a{text-decoration:underline;text-decoration-color:var(--line);text-underline-offset:3px}
.plat{display:inline-flex;align-items:center;gap:6px;font-weight:600}
.dot-ig,.dot-tt{width:9px;height:9px;border-radius:50%;display:inline-block}
.dot-ig{background:var(--ig)}.dot-tt{background:var(--tt)}
.pstats{display:grid;grid-template-columns:repeat(2,1fr);gap:14px 18px;margin-top:12px}
.pstat .l{color:var(--text-secondary);font-size:12.5px;display:flex;gap:6px;align-items:center}
.pstat .v{font-size:22px;font-weight:650;font-variant-numeric:tabular-nums;letter-spacing:-.01em}
.legend{display:flex;gap:14px;flex-wrap:wrap;font-size:12.5px;color:var(--text-secondary)}
.legend span{display:inline-flex;align-items:center;gap:6px}
.chart{position:relative}
.chart svg{display:block;width:100%;height:auto;overflow:visible}
svg text{fill:var(--text-muted);font-size:11px;font-family:system-ui,sans-serif}
.grid-line{stroke:var(--line)}
.cross{stroke:var(--text-muted);stroke-dasharray:3 3;visibility:hidden}
.line-ig{fill:none;stroke:var(--ig);stroke-width:2}.line-tt{fill:none;stroke:var(--tt);stroke-width:2}
.area-ig{fill:var(--ig);opacity:.08}.area-tt{fill:var(--tt);opacity:.08}
.mark{stroke:var(--surface-1);stroke-width:2;visibility:hidden}
.bars{list-style:none;margin:6px 0 0;padding:0;display:grid;gap:6px;position:relative}
.bar{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(0,2fr) 58px;align-items:center;gap:10px;padding:3px 4px;border-radius:6px;text-decoration:none}
.bar:hover{background:var(--surface-2)}
.bar .name{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--text-secondary);font-size:13px}
.bar .track{display:block;height:14px;position:relative}
.bar .fill{display:block;height:100%;border-radius:0 4px 4px 0}
.fill.ig{background:var(--ig)}.fill.tt{background:var(--tt)}
.fill.dim{opacity:.45}
.bar .val{text-align:right;font-variant-numeric:tabular-nums;font-size:13px}
.typ-line{position:absolute;top:-4px;bottom:-4px;border-left:2px dashed var(--text-secondary)}
.typ-label{font-size:12px;color:var(--text-secondary);margin:2px 0 8px}
.badge{display:inline-flex;align-items:center;gap:4px;border-radius:999px;padding:1px 8px;font-size:12px;font-weight:600;white-space:nowrap;border:1px solid var(--line)}
.badge.above{color:var(--good-ink);border-color:color-mix(in srgb,var(--good) 45%,var(--line))}
.badge.below{color:var(--critical-ink);border-color:color-mix(in srgb,var(--critical) 40%,var(--line))}
.badge.typical,.badge.new,.badge.unknown{color:var(--text-secondary)}
.toolbar{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:8px}
.toolbar input{font:inherit;font-size:13px;padding:6px 10px;border:1px solid var(--line);border-radius:8px;background:var(--surface-0);
color:var(--text-primary);min-width:220px}
table{width:100%;border-collapse:collapse;font-variant-numeric:tabular-nums}
th,td{padding:8px 10px;border-bottom:1px solid var(--line);text-align:right;white-space:nowrap;vertical-align:middle}
th:first-child,td:first-child{text-align:left;white-space:normal}
th{font-weight:600;color:var(--text-secondary);font-size:12.5px;cursor:pointer;user-select:none;position:sticky;top:0;background:var(--surface-1)}
th[aria-sort=ascending]::after{content:" ▲"}th[aria-sort=descending]::after{content:" ▼"}
tbody tr:hover{background:var(--surface-2)}
.reel{display:flex;gap:10px;align-items:center;min-width:220px;max-width:340px}
.thumb{width:30px;height:48px;border-radius:5px;object-fit:cover;background:var(--track);flex:none}
.reel .t{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-decoration:none;font-weight:500}
.reel .t:hover{text-decoration:underline}
.reel .m{display:block;font-size:12px;color:var(--text-muted)}
.table-wrap{overflow:auto;max-height:640px;border-radius:8px}
.spark{display:block}
.spark path{fill:none;stroke:var(--text-muted);stroke-width:1.5}
.spark circle{fill:var(--ig)}
.empty{color:var(--text-muted);padding:14px 0}
.notice{border-left:3px solid var(--warning);padding:9px 12px;margin-bottom:14px;background:var(--surface-1);border-radius:6px;font-size:13px}
.notice.err{border-left-color:var(--critical)}
.health-pill{display:inline-flex;align-items:center;gap:6px;text-decoration:none;font-size:13px;padding:5px 10px;border-radius:999px;border:1px solid var(--line);background:var(--surface-1)}
.sdot{width:9px;height:9px;border-radius:50%;display:inline-block;flex:none}
.sdot.good{background:var(--good)}.sdot.warning{background:var(--warning)}.sdot.critical{background:var(--critical)}.sdot.off{background:var(--text-muted)}
.checks{list-style:none;margin:0;padding:0;display:grid;gap:0}
.checks li{display:grid;grid-template-columns:190px 1fr auto;gap:14px;align-items:start;padding:12px 0;border-bottom:1px solid var(--line)}
.checks li:last-child{border-bottom:0}
@media (max-width:700px){.checks li{grid-template-columns:1fr}}
.st{display:inline-flex;align-items:center;gap:7px;font-weight:600}
.st-label{font-size:11.5px;font-weight:600;text-transform:uppercase;letter-spacing:.04em}
.st-label.good{color:var(--good-ink)}.st-label.warning{color:var(--warning-ink)}.st-label.critical{color:var(--critical-ink)}.st-label.off{color:var(--text-muted)}
.log{list-style:none;margin:0;padding:0}
.log li{display:grid;grid-template-columns:120px 92px 1fr;gap:10px;padding:7px 0;border-bottom:1px solid var(--line);font-size:13px;align-items:baseline}
@media (max-width:700px){.log li{grid-template-columns:1fr}}
.lv{font-size:11.5px;font-weight:600;text-transform:uppercase;letter-spacing:.04em}
.lv-good{color:var(--good-ink)}.lv-error{color:var(--critical-ink)}.lv-warning{color:var(--warning-ink)}.lv-info{color:var(--text-muted)}
.queue{list-style:none;margin:0;padding:0}
.queue li{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--line);font-size:13px;flex-wrap:wrap}
.pill{border:1px solid var(--line);border-radius:999px;padding:1px 8px;font-size:12px;color:var(--text-secondary);white-space:nowrap}
details.glossary summary{cursor:pointer;font-weight:600}
details.glossary dl{display:grid;grid-template-columns:160px 1fr;gap:8px 16px;margin:12px 0 0}
details.glossary dt{font-weight:600}details.glossary dd{margin:0;color:var(--text-secondary)}
@media (max-width:700px){details.glossary dl{grid-template-columns:1fr}}
.caption{white-space:pre-wrap;color:var(--text-secondary);font-size:13.5px;max-height:220px;overflow:auto}
.reel-hero{display:grid;grid-template-columns:120px 1fr;gap:18px;align-items:start}
.reel-hero img{width:120px;height:192px;object-fit:cover;border-radius:10px;background:var(--track)}
@media (max-width:600px){.reel-hero{grid-template-columns:1fr}}
#tip{position:fixed;pointer-events:none;background:var(--text-primary);color:var(--surface-1);font-size:12px;line-height:1.45;padding:7px 9px;
border-radius:7px;white-space:pre-line;max-width:320px;display:none;z-index:20}
form.inline{display:inline}
.login{max-width:360px;margin:12vh auto}
.login input{width:100%;font:inherit;padding:9px 10px;border:1px solid var(--line);border-radius:8px;background:var(--surface-0);color:var(--text-primary);margin:10px 0}
.err{color:var(--critical-ink);font-size:13px}
`;

// ---------------- interactions: tooltips, crosshair, sort, search ----------------

const SCRIPT = `
(() => {
  const tip = document.getElementById('tip');
  const show = (text, x, y) => {
    tip.textContent = text; tip.style.display = 'block';
    const w = tip.offsetWidth, h = tip.offsetHeight;
    tip.style.left = Math.max(8, Math.min(x + 14, innerWidth - w - 8)) + 'px';
    tip.style.top = (y - h - 12 < 8 ? y + 18 : y - h - 12) + 'px';
  };
  const hide = () => { tip.style.display = 'none'; };
  document.addEventListener('mousemove', (e) => {
    if (e.target.closest('svg[data-series]')) return;
    const t = e.target.closest('[data-tip]');
    t ? show(t.getAttribute('data-tip'), e.clientX, e.clientY) : hide();
  });
  document.addEventListener('focusin', (e) => {
    const t = e.target.closest('[data-tip]');
    if (t) { const r = t.getBoundingClientRect(); show(t.getAttribute('data-tip'), r.left, r.top); }
  });
  document.addEventListener('focusout', hide);

  // Crosshair on line charts: nearest point in time on every series.
  document.querySelectorAll('svg[data-series]').forEach((svg) => {
    const series = JSON.parse(svg.dataset.series);
    const box = JSON.parse(svg.dataset.box);
    const cross = svg.querySelector('.cross');
    const marks = [...svg.querySelectorAll('.mark')];
    svg.addEventListener('mousemove', (e) => {
      const r = svg.getBoundingClientRect();
      const vx = ((e.clientX - r.left) / r.width) * box.w;
      if (vx < box.l || vx > box.w - box.r) { cross.style.visibility = 'hidden'; marks.forEach((m) => m.style.visibility = 'hidden'); hide(); return; }
      const t = box.t0 + ((vx - box.l) / (box.w - box.l - box.r)) * (box.t1 - box.t0);
      const lines = [];
      let label = '';
      series.forEach((s, i) => {
        let best = null;
        for (const p of s.pts) if (!best || Math.abs(p[0] - t) < Math.abs(best[0] - t)) best = p;
        if (!best) return;
        const x = box.l + ((best[0] - box.t0) / (box.t1 - box.t0 || 1)) * (box.w - box.l - box.r);
        const y = box.top + ((box.hi - best[1]) / (box.hi - box.lo || 1)) * (box.h - box.top - box.b);
        marks[i].setAttribute('cx', x); marks[i].setAttribute('cy', y); marks[i].style.visibility = 'visible';
        if (i === 0) { cross.setAttribute('x1', x); cross.setAttribute('x2', x); cross.style.visibility = 'visible';
          label = new Date(best[0]).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }); }
        lines.push(s.name + ': ' + Math.round(best[1]).toLocaleString('en-US') + (s.unit || ''));
      });
      show(label + '\\n' + lines.join('\\n'), e.clientX, e.clientY);
    });
    svg.addEventListener('mouseleave', () => { cross.style.visibility = 'hidden'; marks.forEach((m) => m.style.visibility = 'hidden'); hide(); });
  });

  // Sortable tables.
  document.querySelectorAll('table.sortable').forEach((table) => table.querySelectorAll('th').forEach((th) => {
    const sort = () => {
      const i = [...th.parentNode.children].indexOf(th), desc = th.getAttribute('aria-sort') !== 'descending';
      table.querySelectorAll('th').forEach((h) => h.removeAttribute('aria-sort'));
      th.setAttribute('aria-sort', desc ? 'descending' : 'ascending');
      const rows = [...table.tBodies[0].rows];
      rows.sort((a, b) => {
        const x = a.cells[i].dataset.v ?? '', y = b.cells[i].dataset.v ?? '';
        const nx = parseFloat(x), ny = parseFloat(y);
        const c = th.dataset.type === 'num' ? (isNaN(nx) ? -Infinity : nx) - (isNaN(ny) ? -Infinity : ny) : String(x).localeCompare(String(y));
        return desc ? -c : c;
      });
      rows.forEach((r) => table.tBodies[0].appendChild(r));
    };
    th.addEventListener('click', sort);
    th.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); sort(); } });
  }));

  // Search box filters table rows by their text.
  document.querySelectorAll('input[data-filter]').forEach((input) => {
    const table = document.getElementById(input.dataset.filter);
    const count = document.getElementById(input.dataset.filter + '-count');
    input.addEventListener('input', () => {
      const q = input.value.trim().toLowerCase();
      let shown = 0;
      [...table.tBodies[0].rows].forEach((r) => { const ok = !q || r.textContent.toLowerCase().includes(q); r.hidden = !ok; if (ok) shown++; });
      if (count) count.textContent = shown + ' shown';
    });
  });
})();
`;

// ---------------- layout ----------------

function page(title, body) {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex">
<title>${esc(title)}</title><style>${STYLE}</style></head><body class="viz-root">${body}
<div id="tip" role="tooltip"></div><script>${SCRIPT}</script></body></html>`;
}

const TABS = [
  ['overview', 'Overview', '/dashboard'],
  ['instagram', 'Instagram', '/dashboard/instagram'],
  ['tiktok', 'TikTok', '/dashboard/tiktok'],
  ['system', 'System', '/dashboard/system'],
];

const HEALTH_TEXT = { good: 'All systems OK', warning: 'Needs a look', critical: 'Something is broken' };

function layout({ title, active, range = null, path = '/dashboard', health = null, notice = '', tiktokEnabled = true, body }) {
  const tabs = TABS.filter(([id]) => id !== 'tiktok' || tiktokEnabled)
    .map(([id, label, href]) => `<a href="${href}${range && id !== 'system' ? `?range=${range}` : ''}"${id === active ? ' aria-current="page"' : ''}>${label}</a>`)
    .join('');
  const seg = range
    ? `<div class="seg" role="group" aria-label="Time range">${Object.entries(RANGES)
      .map(([k, r]) => `<a href="${path}?range=${k}"${k === range ? ' aria-current="true"' : ''} title="${esc(r.label)}">${esc(k === 'all' ? 'All' : k)}</a>`)
      .join('')}</div>`
    : '';
  const pill = health
    ? `<a class="health-pill" href="/dashboard/system"><span class="sdot ${health}"></span>${HEALTH_TEXT[health]}</a>`
    : '';
  return page(
    title,
    `<main><div class="top"><div class="top-row">
<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap"><a class="brand" href="/dashboard">homie · social</a><nav class="tabs" aria-label="Sections">${tabs}</nav></div>
<div class="right">${seg}${pill}
<form class="inline" method="post" action="/dashboard/refresh"><input type="hidden" name="back" value="${esc(path)}${range ? `?range=${range}` : ''}"><button type="submit" title="Collect stats from Instagram and TikTok now instead of waiting for the hourly run">↻ Refresh</button></form>
<a class="btn" href="/dashboard/logout">Sign out</a></div></div></div>
${notice ? `<div class="notice">${esc(notice)}</div>` : ''}${body}</main>`,
  );
}

export function renderLogin(error) {
  return page(
    'homie-social · sign in',
    `<main><form class="card login" method="post" action="/dashboard/login">
<h1>homie · social</h1><div class="sub">Admin dashboard</div>
<label for="key" class="sub" style="display:block;margin-top:16px">Admin key (ADMIN_TOKEN from your .env)</label>
<input id="key" name="key" type="password" autocomplete="current-password" required autofocus>
${error ? `<div class="err">${esc(error)}</div>` : ''}
<button type="submit">Sign in</button></form></main>`,
  );
}

// ---------------- building blocks ----------------

function delta(v, { suffix = '', period = '' } = {}) {
  if (typeof v !== 'number') return '';
  const cls = v > 0 ? 'up' : v < 0 ? 'down' : 'flat';
  const arrow = v > 0 ? '▲' : v < 0 ? '▼' : '■';
  return `<span class="delta ${cls}">${arrow} ${v > 0 ? '+' : v < 0 ? '−' : ''}${num(Math.abs(v))}${suffix}</span>${period ? ` <span class="muted">${esc(period)}</span>` : ''}`;
}
function pctDelta(change, period) {
  if (typeof change !== 'number') return '';
  const p = Math.round(change * 100);
  const cls = p > 0 ? 'up' : p < 0 ? 'down' : 'flat';
  return `<span class="delta ${cls}">${p > 0 ? '▲' : p < 0 ? '▼' : '■'} ${Math.abs(p)}%</span> <span class="muted">vs ${esc(period)} before</span>`;
}

function kpi({ label, value, note = '', key = null }) {
  return `<div class="card kpi"><div class="label">${esc(label)}${key ? info(key) : ''}</div><div class="value">${value}</div>${
    note ? `<div class="note">${note}</div>` : ''
  }</div>`;
}

function vsBadge(vs, ageMs) {
  if (!vs) return '<span class="badge unknown">–</span>';
  if (vs.kind === 'new') return `<span class="badge new" data-tip="Under 24 hours old. It is compared once its first day is over.">new · ${Math.max(1, Math.round(ageMs / HOUR))}h</span>`;
  if (vs.kind === 'unknown') return '<span class="badge unknown" data-tip="Not enough data: posted before stats collection started, or fewer than 3 reels to compare against.">–</span>';
  const r = vs.ratio.toFixed(1);
  if (vs.kind === 'above') return `<span class="badge above">▲ ${r}×</span>`;
  if (vs.kind === 'below') return `<span class="badge below">▼ ${r}×</span>`;
  return `<span class="badge typical">≈ ${r}×</span>`;
}

function sparkline(values, { w = 84, h = 24 } = {}) {
  const v = (values || []).filter((x) => typeof x === 'number');
  if (v.length < 2) return '<span class="muted">–</span>';
  const lo = Math.min(...v), hi = Math.max(...v);
  const x = (i) => (i * (w - 4)) / (v.length - 1) + 2;
  const y = (val) => (hi === lo ? h / 2 : h - 3 - ((val - lo) / (hi - lo)) * (h - 6));
  const d = v.map((val, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(val).toFixed(1)}`).join('');
  const gain = v.at(-1) - v[0];
  return `<svg class="spark" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="Views over 48 hours: +${gain}" data-tip="+${num(gain)} views in the last 48h"><path d="${d}"></path><circle cx="${x(v.length - 1)}" cy="${y(v.at(-1))}" r="2.5"></circle></svg>`;
}

// Multi-series time chart (one shared y-axis: views). series = [{ name, cls, pts: [{at, v}], unit? }]
function timeChart(series, { w = 640, h = 220, ariaLabel = 'Chart', emptyText = 'Not enough data yet.' } = {}) {
  const live = series.filter((s) => s.pts.length >= 2);
  if (!live.length) return `<div class="empty">${esc(emptyText)}</div>`;
  const l = 52, r = 104, top = 12, b = 26;
  const all = live.flatMap((s) => s.pts);
  const t0 = Math.min(...all.map((p) => +new Date(p.at)));
  const t1 = Math.max(...all.map((p) => +new Date(p.at)));
  let lo = Math.min(...all.map((p) => p.v)), hi = Math.max(...all.map((p) => p.v));
  if (lo === hi) { lo = Math.max(0, lo - 1); hi += 1; }
  const pad = (hi - lo) * 0.08; hi += pad; lo = Math.max(0, lo - pad);
  const X = (t) => l + ((t - t0) / (t1 - t0 || 1)) * (w - l - r);
  const Y = (v) => top + ((hi - v) / (hi - lo)) * (h - top - b);
  const ticks = [lo, (lo + hi) / 2, hi];
  const grid = ticks.map((v) => `<line class="grid-line" x1="${l}" x2="${w - r}" y1="${Y(v)}" y2="${Y(v)}"></line><text x="${l - 8}" y="${Y(v) + 4}" text-anchor="end">${compact(v)}</text>`).join('');
  const fmtT = (t) => new Date(t).toLocaleString('en-GB', { day: 'numeric', month: 'short', ...(t1 - t0 < 2 * DAY ? { hour: '2-digit', minute: '2-digit' } : {}) });
  const xLabels = `<text x="${l}" y="${h - 6}">${esc(fmtT(t0))}</text><text x="${w - r}" y="${h - 6}" text-anchor="end">${esc(fmtT(t1))}</text>`;
  const paths = live.map((s) => {
    const d = s.pts.map((p, i) => `${i ? 'L' : 'M'}${X(+new Date(p.at)).toFixed(1)},${Y(p.v).toFixed(1)}`).join('');
    const last = s.pts.at(-1);
    const area = live.length === 1 ? `<path class="area-${s.cls}" d="${d}L${X(+new Date(last.at)).toFixed(1)},${Y(lo)}L${X(+new Date(s.pts[0].at)).toFixed(1)},${Y(lo)}Z"></path>` : '';
    // Direct label at the line end (series name + latest value).
    return `${area}<path class="line-${s.cls}" d="${d}"></path><text x="${X(+new Date(last.at)) + 6}" y="${Y(last.v) + 4}" style="fill:var(--text-secondary)">${esc(s.name)} ${compact(last.v)}</text>`;
  }).join('');
  const data = live.map((s) => ({ name: s.name, unit: s.unit || '', pts: s.pts.map((p) => [+new Date(p.at), p.v]) }));
  const box = { w, h, l, r, top, b, t0, t1, lo, hi };
  const marks = live.map((s) => `<circle class="mark" r="4.5" style="fill:var(--${s.cls})"></circle>`).join('');
  return `<div class="chart"><svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(ariaLabel)}" data-series='${esc(JSON.stringify(data))}' data-box='${esc(JSON.stringify(box))}'>
${grid}${xLabels}${paths}<line class="cross" x1="0" x2="0" y1="${top}" y2="${h - b}"></line>${marks}</svg></div>`;
}

const reelHref = (row) => (row.platform === 'instagram' ? `/dashboard/reel/${encodeURIComponent(row.id)}` : row.permalink || '#');
const ext = (row) => (row.platform === 'instagram' ? '' : ' target="_blank" rel="noopener"');

// First-day views per reel against the typical-reel line: answers "which reels beat my usual?"
function day1Chart(p) {
  const cls = p.platform === 'instagram' ? 'ig' : 'tt';
  // The latest 15 reels with a finished first day, newest first: "how are my recent reels doing?"
  const rows = p.inRange.filter((r) => typeof r.day1 === 'number' && r.ageMs >= DAY).sort((a, b) => a.ageMs - b.ageMs).slice(0, 15);
  if (!rows.length) {
    return `<div class="empty">No reel in this period is a full day old yet with first-day data. ${p.inRange.length ? 'Check back tomorrow, or pick a longer range.' : ''}</div>`;
  }
  const max = Math.max(...rows.map((r) => r.day1), p.typical || 0, 1);
  const typPct = p.typical ? (p.typical / max) * 100 : null;
  return `${p.typical ? `<div class="typ-label">Dashed line = your typical reel (${num(p.typical)} first-day views). Faded bars fell short of it.</div>` : '<div class="typ-label">The typical-reel line appears once 3 reels are a day old.</div>'}
<ol class="bars">${rows
    .map((r) => {
      const tip = `${r.label}\nFirst-day views ${num(r.day1)}${r.vs?.ratio ? ` · ${r.vs.ratio.toFixed(1)}× typical` : ''}\nViews now ${num(r.views)}`;
      const dim = p.typical && r.day1 < p.typical ? ' dim' : '';
      return `<li><a class="bar" href="${reelHref(r)}"${ext(r)} data-tip="${esc(tip)}"><span class="name" dir="auto">${esc(r.label)}</span>
<span class="track"><span class="fill ${cls}${dim}" style="width:${((r.day1 / max) * 100).toFixed(1)}%"></span>${
        typPct !== null ? `<span class="typ-line" style="left:${typPct.toFixed(1)}%"></span>` : ''
      }</span><span class="val">${num(r.day1)}</span></a></li>`;
    })
    .join('')}</ol>`;
}

function reelTable(p, { id, nowMs }) {
  const ig = p.platform === 'instagram';
  const rows = p.rows;
  if (!rows.length) return `<div class="empty">No ${ig ? 'reels' : 'videos'} found yet.</div>`;
  const cols = ig
    ? [['Reel', 'text', null], ['Views', 'num', 'views'], ['First day', 'num', 'day1'], ['vs typical', 'num', 'vs'], ['Reach', 'num', 'reach'],
      ['Engagement', 'num', 'engagement'], ['Avg watch', 'num', 'watch'], ['48h trend', 'num', 'trend']]
    : [['Video', 'text', null], ['Views', 'num', 'views'], ['First day', 'num', 'day1'], ['vs typical', 'num', 'vs'], ['Likes', 'num', null],
      ['Comments', 'num', null], ['Shares', 'num', null], ['Engagement', 'num', 'engagement']];
  const head = cols.map(([label, type, key]) => `<th tabindex="0" data-type="${type}" scope="col">${label}${key ? ' ' + info(key) : ''}</th>`).join('');
  const body = rows
    .map((r) => {
      const thumb = r.thumb ? `<img class="thumb" src="${esc(r.thumb)}" alt="" loading="lazy" referrerpolicy="no-referrer">` : '<span class="thumb"></span>';
      const name = `<div class="reel">${ig ? thumb : ''}<div style="min-width:0"><a class="t" dir="auto" href="${reelHref(r)}"${ext(r)}>${esc(r.label)}</a><span class="m">${esc(rel(r.published, nowMs))}</span></div></div>`;
      const vsVal = r.vs?.ratio ?? (r.vs?.kind === 'new' ? -1 : -2);
      const cells = ig
        ? [
          `<td data-v="${esc(r.label)}">${name}</td>`,
          `<td data-v="${r.views ?? ''}">${num(r.views)}</td>`,
          `<td data-v="${r.day1 ?? ''}">${r.ageMs < DAY ? `<span class="muted">${num(r.day1)} so far</span>` : num(r.day1)}</td>`,
          `<td data-v="${vsVal}">${vsBadge(r.vs, r.ageMs)}</td>`,
          `<td data-v="${r.reach ?? ''}">${num(r.reach)}</td>`,
          `<td data-v="${r.engagement ?? ''}">${pct(r.engagement)}</td>`,
          `<td data-v="${r.avgWatchS ?? ''}">${secs(r.avgWatchS)}</td>`,
          `<td data-v="${r.spark ? r.spark.at(-1) - r.spark[0] : ''}">${sparkline(r.spark)}</td>`,
        ]
        : [
          `<td data-v="${esc(r.label)}">${name}</td>`,
          `<td data-v="${r.views ?? ''}">${num(r.views)}</td>`,
          `<td data-v="${r.day1 ?? ''}">${r.ageMs < DAY ? `<span class="muted">${num(r.day1)} so far</span>` : num(r.day1)}</td>`,
          `<td data-v="${vsVal}">${vsBadge(r.vs, r.ageMs)}</td>`,
          `<td data-v="${r.likes ?? ''}">${num(r.likes)}</td>`,
          `<td data-v="${r.comments ?? ''}">${num(r.comments)}</td>`,
          `<td data-v="${r.shares ?? ''}">${num(r.shares)}</td>`,
          `<td data-v="${r.engagement ?? ''}">${pct(r.engagement)}</td>`,
        ];
      return `<tr>${cells.join('')}</tr>`;
    })
    .join('');
  return `<div class="toolbar"><input type="search" placeholder="Search ${ig ? 'reels' : 'videos'} by caption…" data-filter="${id}" aria-label="Search">
<span class="muted" id="${id}-count">${rows.length} ${ig ? 'reels' : 'videos'}</span><span class="muted">· click a column to sort${ig ? ' · click a reel for its full story' : ''}</span></div>
<div class="table-wrap"><table id="${id}" class="sortable"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
}

function glossary() {
  return `<details class="card glossary"><summary>What do these numbers mean?</summary><dl>${Object.values(GLOSSARY)
    .map(([t, d]) => `<dt>${esc(t)}</dt><dd>${esc(d)}</dd>`)
    .join('')}</dl></details>`;
}

function findingsCard(items) {
  if (!items.length) return '';
  const ico = { good: '▲', info: 'i', watch: '!' };
  return `<section class="card"><div class="card-head"><h2>At a glance</h2><span class="sub">Plain-language summary of this period</span></div>
<ul class="findings">${items
    .map((f) => `<li><span class="ico ${f.tone}" aria-hidden="true">${ico[f.tone]}</span><span>${
      f.href ? `<a href="${esc(f.href)}">${esc(f.text)}</a>` : esc(f.text)
    }</span></li>`)
    .join('')}</ul></section>`;
}

const sinceText = (p) => (p.since ? `since ${new Date(p.since).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}, when collection began` : '');

function platformCard(p, range) {
  const ig = p.platform === 'instagram';
  const r = RANGES[range];
  const name = ig ? `Instagram${p.username ? ` · @${p.username}` : ''}` : `TikTok${p.name ? ` · ${p.name}` : ''}`;
  const gainedNote = p.gained === null ? '<span class="muted">collecting history</span>' : range === 'all' ? '<span class="muted">all time</span>' : p.since ? `<span class="muted">${esc(sinceText(p))}</span>` : pctDelta(p.gainedChange, r.short) || `<span class="muted">${esc(r.label)}</span>`;
  return `<div class="card"><div class="card-head"><span class="plat"><span class="dot-${ig ? 'ig' : 'tt'}"></span>${esc(name)}</span>
<a class="sub" href="/dashboard/${ig ? 'instagram' : 'tiktok'}?range=${range}">Details →</a></div>
<div class="pstats">
<div class="pstat"><div class="l">Views gained ${info('gained')}</div><div class="v">${num(p.gained)}</div><div class="note">${gainedNote}</div></div>
<div class="pstat"><div class="l">Followers ${info('followers')}</div><div class="v">${num(p.followers)}</div><div class="note">${delta(p.followersDelta, { period: range === 'all' ? '' : p.since ? sinceText(p).split(',')[0] : `in ${r.short}` }) || '<span class="muted">change shows after a day of data</span>'}</div></div>
<div class="pstat"><div class="l">Typical reel ${info('typical')}</div><div class="v">${p.typical === null ? '–' : num(p.typical)}</div><div class="note muted">${p.typical === null ? 'needs 3 reels a day old' : 'first-day views'}</div></div>
<div class="pstat"><div class="l">Engagement ${info('engagement')}</div><div class="v">${pct(p.engagement)}</div><div class="note muted">${p.posted} posted in ${esc(r.short)}</div></div>
</div></div>`;
}

// ---------------- pages ----------------

export function renderOverview({ ig, tt, range, findings, health, notice, tiktokEnabled, timeZone, nowMs = Date.now() }) {
  const r = RANGES[range];
  const series = [];
  if (ig) series.push({ name: 'Instagram', cls: 'ig', pts: ig.timeline.map((p) => ({ at: p.at, v: p.v })) });
  if (tt) series.push({ name: 'TikTok', cls: 'tt', pts: tt.timeline.map((p) => ({ at: p.at, v: p.v })) });
  const legend = series.length > 1 ? `<div class="legend">${series.map((s) => `<span><span class="dot-${s.cls}"></span>${s.name}</span>`).join('')}</div>` : '';

  // Top movers: views gained inside the range, both platforms.
  // Instagram has per-reel history, so any reel can count. TikTok only keeps totals, so its
  // videos count when posted inside the range (all their views were gained in it).
  const igMovers = ig ? ig.rows.filter((x) => typeof x.gained === 'number') : [];
  const ttMovers = tt ? tt.inRange.filter((x) => typeof x.views === 'number').map((x) => ({ ...x, gained: x.views })) : [];
  const top = [...igMovers, ...ttMovers].filter((x) => x.gained > 0).sort((a, b) => b.gained - a.gained).slice(0, 6);
  const topList = top.length
    ? `<ol class="bars">${top
      .map((x) => {
        const cls = x.platform === 'instagram' ? 'ig' : 'tt';
        const max = top[0].gained;
        return `<li><a class="bar" href="${reelHref(x)}"${ext(x)} data-tip="${esc(`${x.label}\n${num(x.gained)} views in the ${r.label}\nPosted ${rel(x.published, nowMs)}`)}"><span class="name" dir="auto"><span class="dot-${cls}"></span> ${esc(x.label)}</span>
<span class="track"><span class="fill ${cls}" style="width:${((x.gained / max) * 100).toFixed(1)}%"></span></span><span class="val">${num(x.gained)}</span></a></li>`;
      })
      .join('')}</ol>`
    : '<div class="empty">No views gained yet in this period.</div>';

  return layout({
    title: 'homie-social · overview',
    active: 'overview',
    range,
    path: '/dashboard',
    health,
    notice,
    tiktokEnabled,
    body: `<div class="page-head"><div><h1>Overview</h1><div class="sub">${esc(r.label[0].toUpperCase() + r.label.slice(1))} · stats refresh hourly</div></div></div>
<div class="stack">
${findingsCard(findings)}
<section class="grid two">${ig ? platformCard(ig, range) : ''}${tt ? platformCard(tt, range) : ''}</section>
<section class="grid wide">
<div class="card"><div class="card-head"><div><h2>Total views over time</h2><div class="sub">All reels added up, measured hourly · hover for exact numbers</div></div>${legend}</div>
${timeChart(series, { ariaLabel: 'Total views over time by platform', emptyText: 'The line appears after two hourly measurements.' })}</div>
<div class="card"><div class="card-head"><div><h2>Top reels this period</h2><div class="sub">By views gained in the ${esc(r.label)}</div></div></div>${topList}</div>
</section>
${glossary()}
</div>`,
  });
}

export function renderPlatform({ p, range, health, notice, tiktokEnabled, timeZone, nowMs = Date.now() }) {
  const ig = p.platform === 'instagram';
  const r = RANGES[range];
  const title = ig ? `Instagram${p.username ? ` · @${p.username}` : ''}` : `TikTok${p.name ? ` · ${p.name}` : ''}`;
  const updated = ig ? p.lastRun?.at : p.at;
  const err = ig ? p.lastError : p.error;
  const kpis = [
    kpi({ label: 'Views gained', key: 'gained', value: num(p.gained), note: p.gained === null ? 'collecting history for this period' : p.since && range !== 'all' ? esc(sinceText(p)) : pctDelta(p.gainedChange, r.short) || esc(r.label) }),
    kpi({ label: 'Total views', key: 'views', value: compact(p.totalViews), note: `across ${num(p.rows.length)} ${ig ? 'reels' : 'videos'}` }),
    kpi({ label: 'Followers', key: 'followers', value: num(p.followers), note: delta(p.followersDelta, { period: range === 'all' ? '' : p.since ? sinceText(p).split(',')[0] : `in ${r.short}` }) || 'change shows after a day of data' }),
    kpi({ label: 'Typical reel', key: 'typical', value: p.typical === null ? '–' : num(p.typical), note: p.typical === null ? 'needs 3 reels a day old' : 'first-day views (median)' }),
    kpi({ label: 'Engagement', key: 'engagement', value: pct(p.engagement), note: `${p.posted} posted in ${esc(r.short)}` }),
  ];
  if (ig) kpis.push(kpi({ label: 'Avg watch time', key: 'watch', value: secs(p.medianWatchS), note: 'typical reel in this period' }));
  else kpis.push(kpi({ label: 'Total likes', value: compact(p.totalLikes), note: 'on the whole account' }));
  const cls = ig ? 'ig' : 'tt';
  return layout({
    title: `homie-social · ${ig ? 'Instagram' : 'TikTok'}`,
    active: ig ? 'instagram' : 'tiktok',
    range,
    path: `/dashboard/${ig ? 'instagram' : 'tiktok'}`,
    health,
    notice,
    tiktokEnabled,
    body: `<div class="page-head"><div><h1><span class="dot-${cls}" style="width:12px;height:12px"></span> ${esc(title)}</h1>
<div class="sub">${esc(r.label[0].toUpperCase() + r.label.slice(1))} · updated ${esc(rel(updated, nowMs))}${ig ? '' : ' · TikTok shares views, likes, comments and shares (no reach or watch time)'}</div></div></div>
${err ? `<div class="notice err">Stats collection problem: ${esc(err)} · <a href="/dashboard/system">System</a></div>` : ''}
<div class="stack">
<section class="grid kpis">${kpis.join('')}</section>
<section class="grid two">
<div class="card"><div class="card-head"><div><h2>Which reels beat your usual? ${info('day1')}</h2><div class="sub">First-day views of your latest ${ig ? 'reels' : 'videos'} (newest at the top), against your typical reel</div></div></div>${day1Chart(p)}</div>
<div class="card"><div class="card-head"><div><h2>Total views over time</h2><div class="sub">All ${ig ? 'reels' : 'videos'} added up · hover for exact numbers</div></div></div>
${timeChart([{ name: 'Views', cls, pts: p.timeline }], { ariaLabel: 'Total views over time', emptyText: 'The line appears after two hourly measurements.' })}
<div class="card-head" style="margin-top:16px"><div><h2>Followers</h2></div></div>
${timeChart([{ name: 'Followers', cls, pts: p.followerSeries.map((x) => ({ at: x.at, v: x.v })) }], { h: 140, ariaLabel: 'Followers over time', emptyText: 'Follower history fills in hourly.' })}</div>
</section>
<section class="card"><div class="card-head"><div><h2>All ${ig ? 'reels' : 'videos'}</h2></div></div>${reelTable(p, { id: `${cls}-table`, nowMs })}</section>
${glossary()}
</div>`,
  });
}

export function renderReel({ d, health, notice, tiktokEnabled, timeZone, nowMs = Date.now() }) {
  const m = d.latest;
  const interactions = m.total_interactions ?? ['likes', 'comments', 'shares', 'saved'].reduce((s, k) => s + (m[k] || 0), 0);
  const story = [];
  if (d.vs.kind === 'new') story.push(`Posted ${rel(d.published, nowMs)}: still in its first day with ${num(m.views)} views so far. It gets compared with your typical reel once the first 24 hours are over.`);
  else if (d.vs.ratio != null) {
    const r = d.vs.ratio;
    story.push(`First day: ${num(d.day1)} views, ${r.toFixed(1)}× your typical reel (${num(d.typical)}). ${r >= 1.5 ? 'Clearly above your usual.' : r <= 0.67 ? 'Below your usual.' : 'About your usual.'}`);
  }
  if (typeof m.views === 'number' && typeof m.reach === 'number' && m.reach > 0) {
    story.push(`${num(m.reach)} different accounts saw it ${num(m.views)} times (${(m.views / m.reach).toFixed(1)} plays per account).`);
  }
  if (typeof m.ig_reels_avg_watch_time === 'number') story.push(`People watched it for ${(m.ig_reels_avg_watch_time / 1000).toFixed(1)} seconds on average.`);
  if (m.reach) story.push(`${num(interactions)} interactions from ${num(m.reach)} accounts reached: ${pct(interactions / m.reach)} engagement.`);
  if (d.rank) story.push(`Ranks #${d.rank} of ${d.of} reels by total views.`);
  const tiles = [
    ['Views', m.views, 'views'], ['Reach', m.reach, 'reach'], ['First-day views', d.day1, 'day1'], ['Likes', m.likes], ['Comments', m.comments],
    ['Shares', m.shares], ['Saves', m.saved], ['Avg watch', typeof m.ig_reels_avg_watch_time === 'number' ? secs(m.ig_reels_avg_watch_time / 1000) : '–', 'watch'],
  ];
  return layout({
    title: `homie-social · ${d.label}`,
    active: 'instagram',
    health,
    notice,
    tiktokEnabled,
    path: `/dashboard/reel/${d.id}`,
    body: `<div class="page-head"><div><div class="sub"><a href="/dashboard/instagram">← All Instagram reels</a></div><h1 dir="auto">${esc(d.label)}</h1>
<div class="sub">Posted ${esc(when(d.published, timeZone))} · measured ${esc(rel(d.measuredAt, nowMs))} · ${d.snapshots} hourly measurements</div></div>
${d.permalink ? `<a class="btn" href="${esc(d.permalink)}" target="_blank" rel="noopener">Open on Instagram ↗</a>` : ''}</div>
<div class="stack">
<section class="card reel-hero">${d.thumb ? `<img src="${esc(d.thumb)}" alt="" referrerpolicy="no-referrer">` : '<div></div>'}
<div><div class="card-head"><h2>The story so far</h2>${vsBadge(d.vs, d.ageMs)}</div><ul class="findings">${story
      .map((s) => `<li><span class="ico info" aria-hidden="true">i</span><span>${esc(s)}</span></li>`)
      .join('')}</ul></div></section>
<section class="grid kpis">${tiles.map(([label, v, key]) => kpi({ label, key, value: typeof v === 'string' ? v : num(v) })).join('')}</section>
<section class="card"><div class="card-head"><div><h2>Views over time</h2><div class="sub">Each hourly measurement since it was posted · hover for exact numbers</div></div></div>
${timeChart([{ name: 'Views', cls: 'ig', pts: d.viewsSeries }], { w: 1100, h: 280, ariaLabel: 'Views of this reel over time', emptyText: 'The line appears after two hourly measurements.' })}</section>
<section class="card"><h2 style="margin-bottom:8px">Caption</h2><div class="caption" dir="auto">${esc(d.caption)}</div></section>
</div>`,
  });
}

// ---- System ----

const TIKTOK_LABEL = { queued: 'queued', uploading: 'uploading', processing: 'processing', in_inbox: 'in drafts', failed: 'failed', skipped: 'skipped', off: 'off' };
const STATUS_TEXT = { good: 'OK', warning: 'Check', critical: 'Problem', off: 'Off' };

function tiktokCell(r, tiktok) {
  if (!tiktok?.connected) return '';
  const st = r.tiktok_status ?? null;
  const canSend = r.status === 'published' && [null, 'off', 'skipped', 'failed'].includes(st);
  const pill = st ? ` <span class="pill">TikTok ${esc(TIKTOK_LABEL[st] || st)}</span>` : '';
  const btn = canSend
    ? ` <form class="inline" method="post" action="/dashboard/tiktok/send/${esc(r.id)}"><button type="submit">${st === 'failed' ? 'Retry TikTok' : 'Send to TikTok'}</button></form>`
    : '';
  return pill + btn;
}

export function renderSystem({ h, events, level, queue, tiktok, notice, tiktokEnabled, timeZone, nowMs = Date.now() }) {
  const checks = h.checks
    .map(
      (c) => `<li><div class="st"><span class="sdot ${c.status}"></span>${esc(c.title)}</div>
<div><span class="st-label ${c.status}">${STATUS_TEXT[c.status]}</span> · ${esc(c.detail)}</div>
<div>${
        c.action?.href
          ? `<a class="btn" href="${esc(c.action.href)}">${esc(c.action.label)}</a>`
          : c.action?.post
            ? `<form class="inline" method="post" action="${esc(c.action.post)}"><button type="submit">${esc(c.action.label)}</button></form>`
            : ''
      }</div></li>`,
    )
    .join('');
  const filters = [['', 'All'], ['error', 'Errors'], ['warning', 'Warnings'], ['good', 'Successes']]
    .map(([k, l]) => `<a href="/dashboard/system${k ? `?level=${k}` : ''}"${(level || '') === k ? ' aria-current="true"' : ''}>${l}</a>`)
    .join('');
  const log = events.length
    ? `<ul class="log">${events
      .map((e) => `<li><span class="muted" title="${esc(when(e.at, timeZone))}">${esc(rel(e.at, nowMs))}</span><span><span class="lv lv-${esc(e.level)}">${esc(e.level)}</span> <span class="muted">${esc(e.source)}</span></span><span dir="auto">${esc(e.message)}</span></li>`)
      .join('')}</ul>`
    : `<div class="empty">${level ? 'Nothing at this level.' : 'Nothing logged yet. Approvals, publishes, failures and stats problems appear here as they happen.'}</div>`;
  const q = queue.length
    ? `<ul class="queue">${queue
      .map((r) => `<li><span dir="auto">${esc(r.title || r.id)}</span><span><span class="muted">${esc(rel(r.published_at || r.updated_at, nowMs))}</span> <span class="pill">${esc(r.status.replace('_', ' '))}</span>${tiktokCell(r, tiktok)}${
        r.error ? ` <span class="muted" data-tip="${esc(r.error)}">why?</span>` : ''
      }</span></li>`)
      .join('')}</ul>`
    : '<div class="empty">Nothing has gone through the publisher yet.</div>';
  return layout({
    title: 'homie-social · system',
    active: 'system',
    path: '/dashboard/system',
    health: h.overall,
    notice,
    tiktokEnabled,
    body: `<div class="page-head"><div><h1>System</h1><div class="sub">Is everything running? Checked ${esc(rel(h.checkedAt, nowMs))} · <a href="/dashboard/system">check again</a></div></div></div>
<div class="stack">
<section class="card"><div class="card-head"><h2>Health checks</h2><span class="health-pill"><span class="sdot ${h.overall}"></span>${HEALTH_TEXT[h.overall]}</span></div><ul class="checks">${checks}</ul></section>
<section class="grid two">
<div class="card"><div class="card-head"><div><h2>Activity</h2><div class="sub">Approvals, publishes, failures and stats problems · last 60</div></div><div class="seg">${filters}</div></div>${log}</div>
<div class="card" id="queue"><div class="card-head"><div><h2>Publishing queue</h2><div class="sub">Latest 15 from the Telegram approval flow</div></div></div>${q}</div>
</section>
</div>`,
  });
}
