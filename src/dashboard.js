// Server-rendered admin dashboard. No build step and no outside scripts: one HTML string.

const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const nf = new Intl.NumberFormat('en-US');
const num = (v) => (typeof v === 'number' ? nf.format(Math.round(v)) : '–');
const pct = (v) => (typeof v === 'number' ? `${(v * 100).toFixed(1)}%` : '–');
const secs = (v) => (typeof v === 'number' ? `${v.toFixed(1)}s` : '–');

function when(iso, timeZone) {
  if (!iso) return '–';
  return new Date(iso).toLocaleString('en-GB', { timeZone, day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}
function day(iso, timeZone) {
  if (!iso) return '–';
  return new Date(iso).toLocaleDateString('en-GB', { timeZone, day: 'numeric', month: 'short' });
}

const STYLE = `
.viz-root{color-scheme:light;--surface-0:#f4f4f2;--surface-1:#fcfcfb;--line:#e4e3df;--text-primary:#0b0b0b;
--text-secondary:#52514e;--text-muted:#77766f;--series-1:#2563EB;--track:#ecebe7;--focus:#2563EB}
@media (prefers-color-scheme:dark){.viz-root{color-scheme:dark;--surface-0:#111110;--surface-1:#1a1a19;--line:#2e2e2c;
--text-primary:#f0efec;--text-secondary:#c3c2b7;--text-muted:#9a998f;--series-1:#3987e5;--track:#262624;--focus:#3987e5}}
*{box-sizing:border-box}
body{margin:0;background:var(--surface-0);color:var(--text-primary);font:14px/1.45 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
main{max-width:1080px;margin:0 auto;padding:28px 20px 60px}
header{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-bottom:20px}
h1{font-size:20px;margin:0}
h2{font-size:15px;margin:0 0 4px}
.sub{color:var(--text-secondary);font-size:13px}
.muted{color:var(--text-muted)}
.card{background:var(--surface-1);border:1px solid var(--line);border-radius:12px;padding:18px}
.grid{display:grid;gap:14px}
.kpis{grid-template-columns:repeat(auto-fit,minmax(170px,1fr));margin-bottom:14px}
.kpi .label{color:var(--text-secondary);font-size:12.5px}
.kpi .value{font-size:28px;font-weight:650;letter-spacing:-.01em;margin-top:2px;font-variant-numeric:tabular-nums}
.kpi .note{color:var(--text-muted);font-size:12px;margin-top:2px}
.two{grid-template-columns:3fr 2fr;margin-bottom:14px}
@media (max-width:820px){.two{grid-template-columns:1fr}}
button,.btn{font:inherit;border:1px solid var(--line);background:var(--surface-1);color:var(--text-primary);border-radius:8px;
padding:7px 12px;cursor:pointer;text-decoration:none}
button:hover,.btn:hover{border-color:var(--text-muted)}
button:focus-visible,a:focus-visible,th:focus-visible{outline:2px solid var(--focus);outline-offset:2px}
.bars{list-style:none;margin:12px 0 0;padding:0;display:grid;gap:8px}
.bar{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,2fr) 64px;align-items:center;gap:10px;padding:2px 0;border-radius:6px}
.bar:hover{background:var(--track)}
.bar .name{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--text-secondary);font-size:13px}
.bar .track{display:block;height:14px;background:var(--track);border-radius:4px;overflow:hidden}
.bar .fill{display:block;height:100%;background:var(--series-1);border-radius:0 4px 4px 0}
.bar .val{text-align:right;font-variant-numeric:tabular-nums;font-size:13px}
svg text{fill:var(--text-muted);font-size:11px}
.axis{stroke:var(--line)}
.line{fill:none;stroke:var(--series-1);stroke-width:2}
.dot{fill:var(--series-1);stroke:var(--surface-1);stroke-width:2}
.hit{fill:transparent;cursor:default}
table{width:100%;border-collapse:collapse;font-variant-numeric:tabular-nums}
th,td{padding:8px 10px;border-bottom:1px solid var(--line);text-align:right;white-space:nowrap}
th:first-child,td:first-child{text-align:left;white-space:normal}
th{font-weight:600;color:var(--text-secondary);font-size:12.5px;cursor:pointer;user-select:none}
th[aria-sort=ascending]::after{content:" ▲"}th[aria-sort=descending]::after{content:" ▼"}
td a{color:inherit}
.reel-name{max-width:280px}
.table-wrap{overflow-x:auto;margin-top:10px}
.queue{list-style:none;margin:10px 0 0;padding:0}
.queue li{display:flex;justify-content:space-between;gap:10px;padding:7px 0;border-bottom:1px solid var(--line);font-size:13px}
.pill{border:1px solid var(--line);border-radius:999px;padding:1px 8px;font-size:12px;color:var(--text-secondary)}
.empty{color:var(--text-muted);padding:18px 0}
.warn{border-left:3px solid #b45309;padding:8px 12px;margin-bottom:14px;background:var(--surface-1);border-radius:6px;font-size:13px}
#tip{position:fixed;pointer-events:none;background:var(--text-primary);color:var(--surface-1);font-size:12px;padding:6px 8px;
border-radius:6px;white-space:pre;display:none;z-index:9}
form.inline{display:inline}
.login{max-width:360px;margin:12vh auto}
.login input{width:100%;font:inherit;padding:9px 10px;border:1px solid var(--line);border-radius:8px;background:var(--surface-0);
color:var(--text-primary);margin:10px 0}
.err{color:#b91c1c;font-size:13px}
`;

function page(title, body) {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex">
<title>${esc(title)}</title><style>${STYLE}</style></head><body class="viz-root">${body}</body></html>`;
}

export function renderLogin(error) {
  return page(
    'homie-social · sign in',
    `<main><form class="card login" method="post" action="/dashboard/login">
<h1>homie-social</h1><div class="sub">Admin dashboard</div>
<label for="key" class="sub" style="display:block;margin-top:16px">Admin key (ADMIN_TOKEN from your .env)</label>
<input id="key" name="key" type="password" autocomplete="current-password" required autofocus>
${error ? `<div class="err">${esc(error)}</div>` : ''}
<button type="submit">Sign in</button></form></main>`,
  );
}

function kpi(label, value, note) {
  return `<div class="card kpi"><div class="label">${esc(label)}</div><div class="value">${value}</div>${
    note ? `<div class="note">${note}</div>` : ''
  }</div>`;
}

function viewsChart(rows) {
  const top = rows.filter((r) => typeof r.views === 'number').sort((a, b) => b.views - a.views).slice(0, 12);
  if (!top.length) return '<div class="empty">No view counts yet. They appear after the first hourly collection.</div>';
  const max = Math.max(...top.map((r) => r.views), 1);
  return `<ol class="bars">${top
    .map((r) => {
      const tip = `${r.label}\nViews ${num(r.views)} · Reach ${num(r.reach)}\nLikes ${num(r.likes)} · Comments ${num(
        r.comments,
      )} · Shares ${num(r.shares)} · Saves ${num(r.saved)}`;
      return `<li class="bar" data-tip="${esc(tip)}"><span class="name" dir="auto">${esc(r.label)}</span>
<span class="track"><span class="fill" style="width:${((r.views / max) * 100).toFixed(1)}%"></span></span>
<span class="val">${num(r.views)}</span></li>`;
    })
    .join('')}</ol>`;
}

function followersChart(series, timeZone) {
  const pts = [...series].reverse(); // oldest first
  if (pts.length < 2) {
    return '<div class="empty">The follower trend fills in as daily snapshots collect (one point per day).</div>';
  }
  const W = 520, H = 170, L = 44, R = 12, T = 12, B = 26;
  const vals = pts.map((p) => p.followers);
  let lo = Math.min(...vals), hi = Math.max(...vals);
  if (lo === hi) { lo -= 1; hi += 1; }
  const x = (i) => L + (i * (W - L - R)) / (pts.length - 1);
  const y = (v) => T + ((hi - v) * (H - T - B)) / (hi - lo);
  const path = pts.map((p, i) => `${x(i).toFixed(1)},${y(p.followers).toFixed(1)}`).join(' ');
  const dots = pts
    .map((p, i) => {
      const tip = `${day(p.day + 'T12:00:00Z', timeZone)}\nFollowers ${num(p.followers)}`;
      return `<g data-tip="${esc(tip)}"><circle class="hit" cx="${x(i)}" cy="${y(p.followers)}" r="12"></circle>
<circle class="dot" cx="${x(i)}" cy="${y(p.followers)}" r="4"></circle></g>`;
    })
    .join('');
  return `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="Followers per day">
<line class="axis" x1="${L}" x2="${W - R}" y1="${y(hi)}" y2="${y(hi)}"></line>
<line class="axis" x1="${L}" x2="${W - R}" y1="${y(lo)}" y2="${y(lo)}"></line>
<text x="${L - 6}" y="${y(hi) + 4}" text-anchor="end">${num(hi)}</text>
<text x="${L - 6}" y="${y(lo) + 4}" text-anchor="end">${num(lo)}</text>
<text x="${L}" y="${H - 6}">${esc(day(pts[0].day + 'T12:00:00Z', timeZone))}</text>
<text x="${W - R}" y="${H - 6}" text-anchor="end">${esc(day(pts[pts.length - 1].day + 'T12:00:00Z', timeZone))}</text>
<polyline class="line" points="${path}"></polyline>${dots}</svg>`;
}

function reelTable(rows, timeZone) {
  if (!rows.length) return '<div class="empty">No reels found on the account yet.</div>';
  const cols = [
    ['Reel', null], ['Published', null], ['Views', 'views'], ['Reach', 'reach'], ['Likes', 'likes'],
    ['Comments', 'comments'], ['Shares', 'shares'], ['Saves', 'saved'], ['Avg watch', 'avg_watch_s'],
  ];
  const head = cols.map(([label], i) => `<th tabindex="0" data-col="${i}">${label}</th>`).join('');
  const body = rows
    .map((r) => {
      const cells = [
        `<td class="reel-name" dir="auto" data-v="${esc(r.label)}">${
          r.permalink ? `<a href="${esc(r.permalink)}" target="_blank" rel="noopener">${esc(r.label)}</a>` : esc(r.label)
        }</td>`,
        `<td data-v="${esc(r.published || '')}">${esc(day(r.published, timeZone))}</td>`,
        ...cols.slice(2).map(([, key]) => {
          const v = r[key];
          return `<td data-v="${typeof v === 'number' ? v : -1}">${key === 'avg_watch_s' ? secs(v) : num(v)}</td>`;
        }),
      ];
      return `<tr>${cells.join('')}</tr>`;
    })
    .join('');
  return `<div class="table-wrap"><table id="reels"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
}

function queueList(queue, timeZone) {
  if (!queue.length) return '<div class="empty">Nothing has gone through the publisher yet.</div>';
  return `<ul class="queue">${queue
    .map(
      (r) => `<li><span dir="auto">${esc(r.title || r.id)}</span><span><span class="muted">${esc(
        when(r.published_at || r.updated_at, timeZone),
      )}</span> <span class="pill">${esc(r.status.replace('_', ' '))}</span></span></li>`,
    )
    .join('')}</ul>`;
}

const SCRIPT = `
(() => {
  const tip = document.getElementById('tip');
  document.addEventListener('mousemove', (e) => {
    const t = e.target.closest('[data-tip]');
    if (!t) { tip.style.display = 'none'; return; }
    tip.textContent = t.getAttribute('data-tip');
    tip.style.display = 'block';
    const w = tip.offsetWidth, h = tip.offsetHeight;
    tip.style.left = Math.min(e.clientX + 14, innerWidth - w - 8) + 'px';
    tip.style.top = Math.max(8, e.clientY - h - 10) + 'px';
  });
  const table = document.getElementById('reels');
  if (!table) return;
  table.querySelectorAll('th').forEach((th) => {
    const sort = () => {
      const i = +th.dataset.col, desc = th.getAttribute('aria-sort') !== 'descending';
      table.querySelectorAll('th').forEach((h) => h.removeAttribute('aria-sort'));
      th.setAttribute('aria-sort', desc ? 'descending' : 'ascending');
      const rows = [...table.tBodies[0].rows];
      rows.sort((a, b) => {
        const x = a.cells[i].dataset.v, y = b.cells[i].dataset.v;
        const nx = parseFloat(x), ny = parseFloat(y);
        const c = !isNaN(nx) && !isNaN(ny) && i > 1 ? nx - ny : String(x).localeCompare(String(y));
        return desc ? -c : c;
      });
      rows.forEach((r) => table.tBodies[0].appendChild(r));
    };
    th.addEventListener('click', sort);
    th.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); sort(); } });
  });
})();
`;

export function renderDashboard(d, { timeZone = 'Asia/Jerusalem' } = {}) {
  const delta =
    typeof d.followersWeekDelta === 'number'
      ? `${d.followersWeekDelta >= 0 ? '+' : '−'}${num(Math.abs(d.followersWeekDelta))} in 7 days`
      : 'week-over-week appears after 7 days of data';
  const updated = d.lastRun ? `Stats updated ${esc(when(d.lastRun.at, timeZone))}` : 'Stats not collected yet';
  return page(
    'homie-social · dashboard',
    `<main>
<header><div><h1>${d.username ? '@' + esc(d.username) : 'homie-social'}</h1>
<div class="sub">${updated} · collected hourly</div></div>
<div><form class="inline" method="post" action="/dashboard/refresh"><button type="submit">Refresh stats now</button></form>
<a class="btn" href="/dashboard/logout">Sign out</a></div></header>
${d.lastError ? `<div class="warn">Last stats collection failed: ${esc(d.lastError)}</div>` : ''}
<section class="grid kpis">
${kpi('Followers', num(d.followers), delta)}
${kpi('Reel views', num(d.totalViews), `across ${num(d.reelCount)} reels`)}
${kpi('Avg views per reel', num(d.avgViews))}
${kpi('Engagement rate', pct(d.engagementRate), 'interactions ÷ reach')}
${kpi('Avg watch time', secs(d.avgWatchS), 'per view, averaged over reels')}
</section>
<section class="grid two">
<div class="card"><h2>Views by reel</h2><div class="sub">Top 12 · hover a bar for the rest of its numbers</div>${viewsChart(d.rows)}</div>
<div class="card"><h2>Followers</h2><div class="sub">Last 30 days, one point per day</div>${followersChart(d.followerSeries, timeZone)}</div>
</section>
<section class="card" style="margin-bottom:14px"><h2>All reels</h2><div class="sub">Click a column to sort · reel names link to Instagram</div>
${reelTable(d.rows, timeZone)}</section>
<section class="card"><h2>Publishing queue</h2><div class="sub">Latest 10 from the approval flow</div>${queueList(d.queue, timeZone)}</section>
</main><div id="tip" role="tooltip"></div><script>${SCRIPT}</script>`,
  );
}
