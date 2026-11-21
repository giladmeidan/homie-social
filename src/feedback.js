// What the reel-making task learns from: how each recent reel did, how each format is doing,
// and why reels were rejected. Served as JSON at GET /api/insights (a GitHub workflow copies it
// into the repo as content/insights.json, because the reel task cannot reach this Worker), and
// summed up in a short Telegram message every Sunday morning.
// No platform calls here, only the store, so it is fully testable.

import { igData, tiktokData, median } from './insights.js';
import { groupOf } from './retention.js';

const DAY = 24 * 60 * 60 * 1000;
const WINDOW_DAYS = 30;
const PAUSE_AFTER = 5; // a format under typical this many reels in a row is flagged for pausing

// The format (v2) or pillar (v1) from a title like "ריל H27 · Pick one · איזו קומה".
export const formatOf = (title) => groupOf(title) || (/דגל אדום|דגלים אדומים/.test(title || '') ? 'Red flags'
  : /קבוצת הדירה/.test(title || '') ? 'Group chat' : null);

// TikTok knows a video only by its caption, so reels are matched on their caption's first line.
const firstLine = (text) => {
  for (const line of String(text || '').split('\n')) {
    const norm = line.replace(/#\S+/g, '').replace(/[^\p{L}\p{N}]+/gu, '');
    if (norm) return norm.slice(0, 40);
  }
  return '';
};

const round = (x, d = 2) => (typeof x === 'number' && Number.isFinite(x) ? Math.round(x * 10 ** d) / 10 ** d : null);
const per1000 = (n, reach) => (typeof n === 'number' && reach ? round((n / reach) * 1000, 1) : null);

export async function insightsJson(store, { now = () => new Date() } = {}) {
  const nowMs = now().getTime();
  const since = new Date(nowMs - WINDOW_DAYS * DAY).toISOString();
  const [ig, tt, reels] = await Promise.all([
    igData(store, { now, range: '30d' }),
    tiktokData(store, { now, range: '30d' }).catch(() => null),
    store.listReels(300),
  ]);

  const igById = Object.fromEntries((ig?.rows || []).map((r) => [r.id, r]));
  const ttByLine = {};
  for (const r of tt?.rows || []) {
    const k = firstLine(r.caption);
    if (k && !ttByLine[k]) ttByLine[k] = r;
  }

  const rows = reels
    .filter((r) => r.created_at >= since)
    .map((r) => {
      const i = r.ig_media_id ? igById[r.ig_media_id] : null;
      const t = ttByLine[firstLine(r.caption)] || null;
      return {
        title: r.title || null,
        format: formatOf(r.title),
        status: r.status,
        created: r.created_at,
        reject_reason: r.reject_reason || null,
        reject_note: r.reject_note || null,
        instagram: i && {
          day1: i.day1,
          vs_typical: round(i.vs?.ratio),
          views: i.views,
          reach: i.reach,
          avg_watch_s: round(i.avgWatchS, 1),
          skip_rate: round(i.skipRate),
          shares_per_1000: per1000(i.shares, i.reach),
          saves_per_1000: per1000(i.saved, i.reach),
          comments_per_1000: per1000(i.comments, i.reach),
        },
        tiktok: t && {
          day1: t.day1,
          vs_typical: round(t.vs?.ratio),
          views: t.views,
          shares: t.shares,
          comments: t.comments,
        },
      };
    });

  // By format: medians of the per-reel comparisons, so one outlier cannot carry a format.
  const byFormat = {};
  for (const r of rows) {
    if (!r.format) continue;
    const f = (byFormat[r.format] ||= { format: r.format, made: 0, published: 0, rejected: 0, _ig: [], _tt: [], _watch: [], _skip: [], _streak: [] });
    f.made++;
    if (r.status === 'published') f.published++;
    if (r.status === 'rejected') f.rejected++;
    if (r.instagram?.vs_typical != null) f._ig.push(r.instagram.vs_typical);
    if (r.tiktok?.vs_typical != null) f._tt.push(r.tiktok.vs_typical);
    if (r.instagram?.avg_watch_s != null) f._watch.push(r.instagram.avg_watch_s);
    if (r.instagram?.skip_rate != null) f._skip.push(r.instagram.skip_rate);
    const best = Math.max(r.instagram?.vs_typical ?? -1, r.tiktok?.vs_typical ?? -1);
    if (best >= 0) f._streak.push({ at: r.created, under: best < 1 });
  }
  const formats = Object.values(byFormat).map((f) => {
    const streak = f._streak.sort((a, b) => (a.at < b.at ? 1 : -1));
    let under = 0;
    for (const s of streak) { if (!s.under) break; under++; }
    return {
      format: f.format,
      made: f.made,
      published: f.published,
      rejected: f.rejected,
      ig_vs_typical: round(median(f._ig)),
      tiktok_vs_typical: round(median(f._tt)),
      ig_avg_watch_s: round(median(f._watch), 1),
      ig_skip_rate: round(median(f._skip)),
      under_typical_in_a_row: under,
      flag: under >= PAUSE_AFTER ? `under typical ${under} reels in a row: consider pausing` : null,
    };
  }).sort((a, b) => (b.ig_vs_typical ?? b.tiktok_vs_typical ?? 0) - (a.ig_vs_typical ?? a.tiktok_vs_typical ?? 0));

  const rejections = rows
    .filter((r) => r.status === 'rejected')
    .map((r) => ({ title: r.title, format: r.format, reason: r.reject_reason, note: r.reject_note, created: r.created }));

  return {
    generated_at: now().toISOString(),
    window_days: WINDOW_DAYS,
    how_to_read: 'vs_typical = first-day views divided by the account\'s typical reel (1 = typical). '
      + 'Under about 100 views a reel, single-reel differences are mostly noise: trust formats, not reels.',
    accounts: {
      instagram: ig && { followers: ig.followers, typical_day1: ig.typical, median_watch_s: round(ig.medianWatchS, 1) },
      tiktok: tt && { followers: tt.followers, typical_day1: tt.typical },
    },
    formats,
    rejections,
    reels: rows,
  };
}

// ---- Sunday review ----

const label = (r) => (r.title || '').replace(/^ריל\s*/, '').slice(0, 60);
const score = (r) => Math.max(r.instagram?.vs_typical ?? -1, r.tiktok?.vs_typical ?? -1);
const fmtRatio = (x) => (x == null ? '–' : `${x.toFixed(1)}×`);

export function weeklyText(data, { now = () => new Date() } = {}) {
  const weekAgo = new Date(now().getTime() - 7 * DAY).toISOString();
  const week = data.reels.filter((r) => r.created >= weekAgo);
  const scored = week.filter((r) => score(r) >= 0).sort((a, b) => score(b) - score(a));
  const lines = ['📊 Weekly review'];
  if (!scored.length) {
    lines.push('No reel from this week has a full first day of numbers yet.');
  } else {
    const why = (r) => [
      r.instagram?.vs_typical != null ? `IG ${fmtRatio(r.instagram.vs_typical)}` : null,
      r.tiktok?.vs_typical != null ? `TikTok ${fmtRatio(r.tiktok.vs_typical)}` : null,
      r.instagram?.avg_watch_s != null ? `${r.instagram.avg_watch_s}s watch` : null,
    ].filter(Boolean).join(', ');
    lines.push(`Best: ${scored.slice(0, 2).map((r) => `${label(r)} (${why(r)})`).join(' · ')}`);
    if (scored.length > 3) lines.push(`Weakest: ${scored.slice(-2).map((r) => `${label(r)} (${why(r)})`).join(' · ')}`);
  }
  const fm = data.formats.filter((f) => f.ig_vs_typical != null || f.tiktok_vs_typical != null);
  if (fm.length) {
    lines.push(`Formats (30 days, vs typical): ${fm.map((f) => `${f.format} IG ${fmtRatio(f.ig_vs_typical)} / TT ${fmtRatio(f.tiktok_vs_typical)}`).join(' · ')}`);
  }
  const flags = data.formats.filter((f) => f.flag);
  if (flags.length) lines.push(`Pause? ${flags.map((f) => `${f.format}: ${f.flag}`).join(' · ')}`);
  const rej = week.filter((r) => r.status === 'rejected');
  if (rej.length) {
    const counts = {};
    for (const r of rej) counts[r.reject_reason || 'no reason'] = (counts[r.reject_reason || 'no reason'] || 0) + 1;
    lines.push(`Rejected: ${rej.length} (${Object.entries(counts).map(([k, v]) => `${k} ${v}`).join(', ')})`);
  }
  const a = data.accounts;
  lines.push(`Followers: IG ${a.instagram?.followers ?? '–'} · TikTok ${a.tiktok?.followers ?? '–'}`);
  return lines.join('\n');
}

// Sunday from 09:30 Israel time, once a week. Returns true when it sent the review.
export async function maybeWeeklyReview({ store, say, now = () => new Date(), timeZone = 'Asia/Jerusalem' }) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', { timeZone, weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
      .formatToParts(now()).map((p) => [p.type, p.value]),
  );
  if (parts.weekday !== 'Sun') return false;
  if (Number(parts.hour) * 60 + Number(parts.minute) < 9 * 60 + 30) return false;
  const today = `${parts.year}-${parts.month}-${parts.day}`;
  if ((await store.kvGet('weekly_review_sent')) === today) return false;
  await store.kvSet('weekly_review_sent', today); // claim first: the cron runs every minute
  const data = await insightsJson(store, { now });
  await say(weeklyText(data, { now }));
  return true;
}
