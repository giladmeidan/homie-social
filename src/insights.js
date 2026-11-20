// Turns stored stats into what the dashboard shows: fair comparisons between reels,
// numbers for a chosen time range, and short findings in plain language.
// No platform calls here, only the store, so it is fully testable.

import { reelLabel, sumKnown } from './stats.js';

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

export const RANGES = {
  '24h': { ms: DAY, label: 'last 24 hours', short: '24h' },
  '7d': { ms: 7 * DAY, label: 'last 7 days', short: '7 days' },
  '30d': { ms: 30 * DAY, label: 'last 30 days', short: '30 days' },
  all: { ms: null, label: 'all time', short: 'all time' },
};
export const DEFAULT_RANGE = '7d';
export const parseRange = (q) => (RANGES[q] ? q : DEFAULT_RANGE);

// The middle value: half the reels did better, half worse. Robust to one viral outlier.
export function median(values) {
  const v = values.filter((x) => typeof x === 'number' && Number.isFinite(x)).sort((a, b) => a - b);
  if (!v.length) return null;
  const mid = Math.floor(v.length / 2);
  return v.length % 2 ? v[mid] : (v[mid - 1] + v[mid]) / 2;
}

const MIN_FOR_TYPICAL = 3; // fewer reels than this and "typical" means little

// "Typical" = median first-day views of reels at least a day old, posted in the last 30 days.
function typicalOf(rows, nowMs) {
  const pool = rows.filter(
    (r) => typeof r.day1 === 'number' && r.ageMs >= DAY && nowMs - new Date(r.published).getTime() <= 30 * DAY,
  );
  return pool.length >= MIN_FOR_TYPICAL ? median(pool.map((r) => r.day1)) : null;
}

// How a reel compares with the typical one, in words and as a ratio.
export function compareToTypical(row, typical) {
  if (row.ageMs < DAY) return { kind: 'new', ratio: null };
  if (typeof row.day1 !== 'number' || !typical) return { kind: 'unknown', ratio: null };
  const ratio = row.day1 / typical;
  const kind = ratio >= 1.5 ? 'above' : ratio <= 0.67 ? 'below' : 'typical';
  return { kind, ratio };
}

// Keeps at most `max` points, always keeping the first and last.
export function downsample(points, max = 120) {
  if (points.length <= max) return points;
  const step = (points.length - 1) / (max - 1);
  return Array.from({ length: max }, (_, i) => points[Math.round(i * step)]);
}

const pctChange = (now, before) => (typeof now === 'number' && typeof before === 'number' && before > 0 ? (now - before) / before : null);

// ---------------- Instagram ----------------

export async function igData(store, { now = () => new Date(), range = DEFAULT_RANGE } = {}) {
  const nowMs = now().getTime();
  const r = RANGES[range];
  const startIso = r.ms ? new Date(nowMs - r.ms).toISOString() : null;
  const prevStartIso = r.ms ? new Date(nowMs - 2 * r.ms).toISOString() : null;

  const [reels, account, first, startAcc, prevAcc, lastRun, lastError, series] = await Promise.all([
    store.latestReelStats(),
    store.latestAccountStats(),
    store.firstAccountStats(),
    startIso ? store.accountAsOf(startIso) : null,
    prevStartIso ? store.accountAsOf(prevStartIso) : null,
    store.kvGet('stats_last_run'),
    store.kvGet('stats_last_error'),
    store.accountSeries(startIso),
  ]);

  const rows = reels.map((x) => {
    const m = x.metrics ? JSON.parse(x.metrics) : {};
    const interactions = m.total_interactions ?? sumKnown([m.likes, m.comments, m.shares, m.saved]);
    return {
      id: x.id,
      platform: 'instagram',
      label: reelLabel(x.caption, x.title),
      caption: x.caption || '',
      permalink: x.permalink,
      thumb: x.thumbnail_url || null,
      published: x.timestamp,
      ageMs: x.timestamp ? nowMs - new Date(x.timestamp).getTime() : Infinity,
      measuredAt: x.captured_at || null,
      views: m.views ?? null,
      reach: m.reach ?? null,
      likes: m.likes ?? null,
      comments: m.comments ?? null,
      shares: m.shares ?? null,
      saved: m.saved ?? null,
      interactions,
      engagement: typeof interactions === 'number' && m.reach ? interactions / m.reach : null,
      avgWatchS: typeof m.ig_reels_avg_watch_time === 'number' ? m.ig_reels_avg_watch_time / 1000 : null,
      day1: typeof x.day1_views === 'number' ? x.day1_views : null,
    };
  });

  const typical = typicalOf(rows, nowMs);
  for (const row of rows) Object.assign(row, { vs: compareToTypical(row, typical) });

  // Views each reel gained inside the range (baseline = its views at the range start, 0 if posted later).
  const baseline = startIso ? await store.viewsAsOf(startIso) : {};
  for (const row of rows) {
    if (typeof row.views !== 'number') { row.gained = null; continue; }
    const postedInRange = !startIso || (row.published && new Date(row.published).toISOString() >= startIso);
    row.gained = postedInRange ? row.views : typeof baseline[row.id] === 'number' ? Math.max(0, row.views - baseline[row.id]) : null;
  }

  const inRange = rows.filter((x) => !startIso || (x.published && new Date(x.published).toISOString() >= startIso));
  const totalNow = account?.total_views ?? rows.reduce((s, x) => s + (x.views || 0), 0);
  // Coverage: the range reaches back before stats collection started.
  const coveredFrom = first?.captured_at || null;
  const rangeCovered = !startIso || (coveredFrom && coveredFrom <= startIso);
  const gained = !startIso
    ? totalNow
    : startAcc && typeof startAcc.total_views === 'number'
      ? totalNow - startAcc.total_views
      : rangeCovered ? null : rows.reduce((s, x) => s + (x.gained || 0), 0); // best effort since collection began
  const gainedPrev =
    startAcc && prevAcc && typeof startAcc.total_views === 'number' && typeof prevAcc.total_views === 'number'
      ? startAcc.total_views - prevAcc.total_views
      : null;

  const reachSum = inRange.reduce((s, x) => s + (x.reach || 0), 0);
  const interSum = inRange.reduce((s, x) => s + (x.interactions || 0), 0);
  const zeroDeep = inRange.length > 0 && inRange.every((x) => !x.comments && !x.shares && !x.saved);

  // Views-over-time: total views across all reels at each hourly collection.
  const timeline = downsample(series.filter((p) => typeof p.total_views === 'number').map((p) => ({ at: p.captured_at, v: p.total_views })));

  // 48-hour sparkline for each reel in the range (newest 60).
  const sparkIds = inRange.slice(0, 60).map((x) => x.id);
  const hist = await store.viewsHistory(sparkIds, new Date(nowMs - 48 * HOUR).toISOString());
  const byId = {};
  for (const h of hist) (byId[h.media_id] ||= []).push(h.views);
  for (const row of rows) row.spark = byId[row.id] || null;

  let summary = null;
  try { summary = lastRun ? JSON.parse(lastRun) : null; } catch { summary = null; }

  return {
    platform: 'instagram',
    username: account?.username || null,
    followers: account?.followers ?? null,
    // When the range reaches back before collection began, compare with the first measurement instead.
    followersDelta: (() => {
      const base = startAcc || (!rangeCovered ? first : null);
      return account && base && account.followers != null && base.followers != null ? account.followers - base.followers : null;
    })(),
    since: rangeCovered ? null : coveredFrom,
    followerSeries: series.filter((p) => p.followers != null).map((p) => ({ at: p.captured_at, v: p.followers })),
    totalViews: totalNow,
    gained,
    gainedChange: pctChange(gained, gainedPrev),
    rangeCovered,
    coveredFrom,
    posted: inRange.length,
    typical,
    medianWatchS: median(inRange.map((x) => x.avgWatchS)),
    engagement: reachSum ? interSum / reachSum : null,
    zeroDeep,
    rows,
    inRange,
    timeline,
    lastRun: summary,
    lastError: lastError || null,
  };
}

// ---------------- TikTok ----------------

const readJson = async (store, key, fallback) => {
  try {
    return JSON.parse((await store.kvGet(key)) || 'null') ?? fallback;
  } catch {
    return fallback;
  }
};

const atOrBefore = (history, iso) => {
  let hit = null;
  for (const p of history) if (p.at <= iso) hit = p;
  return hit;
};

export async function tiktokData(store, { now = () => new Date(), range = DEFAULT_RANGE } = {}) {
  const nowMs = now().getTime();
  const r = RANGES[range];
  const startIso = r.ms ? new Date(nowMs - r.ms).toISOString() : null;
  const prevStartIso = r.ms ? new Date(nowMs - 2 * r.ms).toISOString() : null;
  const [snap, history, day1, error] = await Promise.all([
    readJson(store, 'tiktok_stats', null),
    readJson(store, 'tiktok_history', []),
    readJson(store, 'tiktok_day1', {}),
    store.kvGet('tiktok_stats_error'),
  ]);
  if (!snap) return null;
  const rows = (snap.videos || []).map((v) => {
    const engagementCount = sumKnown([v.likes, v.comments, v.shares]);
    return {
      id: v.id,
      platform: 'tiktok',
      label: reelLabel(v.title),
      caption: v.title || '',
      permalink: v.url,
      published: v.posted,
      ageMs: v.posted ? nowMs - new Date(v.posted).getTime() : Infinity,
      views: v.views ?? null,
      likes: v.likes ?? null,
      comments: v.comments ?? null,
      shares: v.shares ?? null,
      duration: v.duration ?? null,
      engagement: typeof engagementCount === 'number' && v.views ? engagementCount / v.views : null,
      day1: typeof day1[v.id]?.views === 'number' ? day1[v.id].views : null,
    };
  });
  const typical = typicalOf(rows, nowMs);
  for (const row of rows) row.vs = compareToTypical(row, typical);

  const totalNow = rows.reduce((s, x) => s + (x.views || 0), 0);
  const startPt = startIso ? atOrBefore(history, startIso) : null;
  const prevPt = prevStartIso ? atOrBefore(history, prevStartIso) : null;
  const coveredFrom = history[0]?.at || snap.at;
  const rangeCovered = !startIso || (coveredFrom && coveredFrom <= startIso);
  // Before history reaches the range start, count from the first point instead (shown as "since …").
  const basePt = startPt || (!rangeCovered ? history[0] : null);
  const gained = !startIso ? totalNow : basePt ? totalNow - basePt.views : null;
  const gainedPrev = startPt && prevPt ? startPt.views - prevPt.views : null;
  const inRange = rows.filter((x) => !startIso || (x.published && x.published >= startIso));
  const viewsSum = inRange.reduce((s, x) => s + (x.views || 0), 0);
  const engSum = inRange.reduce((s, x) => s + (sumKnown([x.likes, x.comments, x.shares]) || 0), 0);
  const followers = snap.account?.followers ?? null;

  return {
    platform: 'tiktok',
    at: snap.at,
    name: snap.account?.name || null,
    followers,
    followersDelta: basePt && followers != null && basePt.followers != null ? followers - basePt.followers : null,
    since: rangeCovered ? null : coveredFrom,
    followerSeries: history.filter((p) => (!startIso || p.at >= startIso) && p.followers != null).map((p) => ({ at: p.at, v: p.followers })),
    totalLikes: snap.account?.likes ?? null,
    totalViews: totalNow,
    gained,
    gainedChange: pctChange(gained, gainedPrev),
    rangeCovered,
    coveredFrom,
    posted: inRange.length,
    typical,
    engagement: viewsSum ? engSum / viewsSum : null,
    rows,
    inRange,
    timeline: downsample(history.filter((p) => !startIso || p.at >= startIso).map((p) => ({ at: p.at, v: p.views }))),
    error: error || null,
  };
}

// ---------------- Findings in plain language ----------------

const n0 = new Intl.NumberFormat('en-US');
const fmt = (v) => n0.format(Math.round(v));
const quote = (s) => `“${s}”`;
const platformName = { instagram: 'Instagram', tiktok: 'TikTok' };

// Up to six short sentences. Each is { tone: 'good'|'info'|'watch', text, detail? }.
// Facts only: what happened and how it compares; no guesses about why.
export function findings({ ig, tt, range }) {
  const out = [];
  const r = RANGES[range];
  const platforms = [ig, tt].filter(Boolean);

  // 1. Momentum
  const gains = platforms.filter((p) => typeof p.gained === 'number');
  if (gains.length) {
    const total = gains.reduce((s, p) => s + p.gained, 0);
    const split = gains.length > 1 ? ` (${gains.map((p) => `${platformName[p.platform]} ${fmt(p.gained)}`).join(' · ')})` : '';
    const changes = gains.filter((p) => typeof p.gainedChange === 'number');
    let trend = '';
    if (range !== 'all' && changes.length === gains.length && changes.length) {
      const before = gains.reduce((s, p) => s + p.gained / (1 + p.gainedChange), 0);
      const c = before > 0 ? (total - before) / before : null;
      if (c !== null) trend = c >= 0 ? `, up ${Math.round(c * 100)}% on the ${r.short} before` : `, down ${Math.round(-c * 100)}% on the ${r.short} before`;
    }
    out.push({
      tone: 'info',
      text: `Your reels got ${fmt(total)} views in the ${r.label}${split}${trend}.`,
    });
  }

  // 2. Best performer, judged fairly by first-day views against the typical reel
  const candidates = platforms.flatMap((p) => p.inRange.filter((x) => x.vs?.ratio != null).map((x) => ({ ...x, typical: p.typical })));
  if (candidates.length) {
    const best = candidates.sort((a, b) => b.vs.ratio - a.vs.ratio)[0];
    if (best.vs.ratio >= 1.2) {
      out.push({
        tone: 'good',
        text: `Best reel: ${quote(best.label)} on ${platformName[best.platform]} with ${fmt(best.day1)} views on its first day, ${best.vs.ratio.toFixed(1)}× your typical reel (${fmt(best.typical)}).`,
        href: best.platform === 'instagram' ? `/dashboard/reel/${best.id}` : best.permalink,
      });
    }
  } else if (platforms.some((p) => p.inRange.some((x) => x.vs?.kind === 'new'))) {
    out.push({ tone: 'info', text: 'Reels from the last 24 hours are still collecting their first-day views, so they are not compared yet.' });
  }

  // 3. Watch time (Instagram only)
  if (ig && typeof ig.medianWatchS === 'number') {
    const longest = [...ig.inRange].filter((x) => typeof x.avgWatchS === 'number').sort((a, b) => b.avgWatchS - a.avgWatchS)[0];
    out.push({
      tone: 'info',
      text: `On Instagram, people watch a reel for ${ig.medianWatchS.toFixed(1)} seconds on average (typical reel).${
        longest ? ` Longest hold: ${quote(longest.label)} at ${longest.avgWatchS.toFixed(1)}s.` : ''
      }`,
      href: longest ? `/dashboard/reel/${longest.id}` : null,
    });
  }

  // 4. Interaction depth
  if (ig && ig.zeroDeep && ig.inRange.length >= 3) {
    out.push({ tone: 'watch', text: `No comments, shares or saves on Instagram in the ${r.label}; every interaction so far is a like.` });
  }

  // 5. Followers
  const fd = platforms.filter((p) => typeof p.followersDelta === 'number');
  if (fd.length) {
    const parts = fd.map((p) => `${p.followersDelta >= 0 ? '+' : '−'}${fmt(Math.abs(p.followersDelta))} on ${platformName[p.platform]}`);
    const anyGrowth = fd.some((p) => p.followersDelta > 0);
    out.push({ tone: anyGrowth ? 'good' : 'info', text: `Followers in the ${r.label}: ${parts.join(', ')}.` });
  }

  // 6. Posting volume
  const posted = platforms.map((p) => p.posted).reduce((a, b) => Math.max(a, b), 0);
  if (posted && r.ms) {
    const perDay = posted / (r.ms / DAY);
    out.push({
      tone: 'info',
      text: `${fmt(posted)} reels posted in the ${r.label}${perDay >= 1.5 ? ` (about ${fmt(perDay)} a day)` : ''}.`,
    });
  }

  // Coverage note
  const uncovered = platforms.filter((p) => !p.rangeCovered);
  if (uncovered.length && range !== 'all') {
    const since = uncovered.map((p) => p.coveredFrom).filter(Boolean).sort()[0];
    out.push({
      tone: 'watch',
      text: `Stats collection started ${since ? new Date(since).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'recently'}, so numbers for the ${r.label} only cover the time since then.`,
    });
  }
  return out;
}

// ---------------- One reel ----------------

export async function reelDetail(store, id, { now = () => new Date() } = {}) {
  const m = await store.mediaById(id);
  if (!m) return null;
  const snaps = await store.snapshotsFor(id);
  const nowMs = now().getTime();
  const points = snaps.map((s) => ({ at: s.captured_at, ...JSON.parse(s.metrics) }));
  const latest = points.at(-1) || {};
  // Typical reel for comparison, from the account's reels.
  const all = await igData(store, { now, range: '30d' });
  const row = all.rows.find((x) => x.id === id);
  return {
    id,
    label: reelLabel(m.caption, m.title),
    caption: m.caption || '',
    permalink: m.permalink,
    thumb: m.thumbnail_url,
    published: m.timestamp,
    ageMs: m.timestamp ? nowMs - new Date(m.timestamp).getTime() : null,
    latest,
    day1: m.day1_views ?? null,
    typical: all.typical,
    vs: row?.vs || { kind: 'unknown', ratio: null },
    viewsSeries: downsample(points.filter((p) => typeof p.views === 'number').map((p) => ({ at: p.at, v: p.views })), 200),
    measuredAt: latest.at || null,
    snapshots: points.length,
    rank: row ? all.rows.filter((x) => typeof x.views === 'number' && x.views > (row.views ?? 0)).length + 1 : null,
    of: all.rows.filter((x) => typeof x.views === 'number').length,
  };
}
