// Pulls account + per-reel stats from Instagram into the database, and shapes them for the dashboard.

// Asked for first. If Instagram rejects one name (metric names change between API versions),
// the collector falls back to CORE_METRICS so one bad name never blanks the dashboard.
export const REEL_METRICS = [
  'views', 'reach', 'likes', 'comments', 'shares', 'saved', 'total_interactions', 'ig_reels_avg_watch_time',
];
export const CORE_METRICS = ['views', 'reach', 'likes', 'comments', 'shares', 'saved'];

export const COLLECT_EVERY_MS = 60 * 60 * 1000;
const isReel = (m) => m.media_product_type === 'REELS' || m.media_type === 'VIDEO';

// Insights rows come back as { name, values: [{ value }] } or { name, total_value: { value } }.
export function parseInsights(response) {
  const out = {};
  for (const row of response?.data || []) {
    const v = row.values?.[0]?.value ?? row.total_value?.value;
    if (typeof v === 'number') out[row.name] = v;
  }
  return out;
}

async function reelInsights(ig, mediaId) {
  try {
    return parseInsights(await ig.mediaInsights(mediaId, REEL_METRICS));
  } catch {
    return parseInsights(await ig.mediaInsights(mediaId, CORE_METRICS));
  }
}

export async function collectStats({ ig, store, now = () => new Date() }) {
  const at = now().toISOString();
  const account = await ig.account();
  await store.addAccountStats({
    captured_at: at,
    username: account.username || null,
    followers: account.followers_count ?? null,
    media_count: account.media_count ?? null,
  });
  const media = (await ig.listMedia(50)).data || [];
  let reels = 0;
  let failed = 0;
  for (const m of media) {
    await store.upsertMedia(m);
    if (!isReel(m)) continue;
    try {
      await store.addMediaStats(m.id, at, await reelInsights(ig, m.id));
      reels++;
    } catch (err) {
      failed++;
      console.error(`insights failed for ${m.id}:`, err.message);
    }
  }
  await store.pruneStats(new Date(now().getTime() - 90 * 24 * 60 * 60 * 1000).toISOString());
  const summary = { at, media: media.length, reels, failed };
  await store.kvSet('stats_last_run', JSON.stringify(summary));
  return summary;
}

// Runs from the every-minute cron; does real work at most once an hour.
export async function maybeCollectStats({ ig, store, now = () => new Date() }) {
  let last = null;
  try {
    last = JSON.parse((await store.kvGet('stats_last_attempt')) || 'null');
  } catch {
    last = null;
  }
  if (last && now().getTime() - last < COLLECT_EVERY_MS) return 'waiting';
  await store.kvSet('stats_last_attempt', JSON.stringify(now().getTime()));
  try {
    await collectStats({ ig, store, now });
    await store.kvSet('stats_last_error', '');
    return 'collected';
  } catch (err) {
    await store.kvSet('stats_last_error', err.message);
    return 'error';
  }
}

// A short readable name for a reel: the pipeline title if it came through the publisher,
// otherwise the caption's first line without hashtags.
export function reelLabel(caption, title) {
  if (title) return title;
  const first = String(caption || '').split('\n').find((l) => l.trim()) || 'Untitled reel';
  const clean = first.replace(/#\S+/g, '').trim() || 'Untitled reel';
  return clean.length > 60 ? `${clean.slice(0, 57)}…` : clean;
}

export async function dashboardData(store, now = () => new Date()) {
  const [reels, account, followerSeries, queue, lastRun, lastError] = await Promise.all([
    store.latestReelStats(),
    store.latestAccountStats(),
    store.dailyFollowers(30),
    store.listReels(10),
    store.kvGet('stats_last_run'),
    store.kvGet('stats_last_error'),
  ]);
  const rows = reels.map((r) => {
    const m = r.metrics ? JSON.parse(r.metrics) : {};
    return {
      id: r.id,
      label: reelLabel(r.caption, r.title),
      caption: r.caption || '',
      permalink: r.permalink,
      published: r.timestamp,
      views: m.views ?? null,
      reach: m.reach ?? null,
      likes: m.likes ?? null,
      comments: m.comments ?? null,
      shares: m.shares ?? null,
      saved: m.saved ?? null,
      interactions: m.total_interactions ?? sumKnown([m.likes, m.comments, m.shares, m.saved]),
      avg_watch_s: typeof m.ig_reels_avg_watch_time === 'number' ? m.ig_reels_avg_watch_time / 1000 : null,
    };
  });
  const withViews = rows.filter((r) => typeof r.views === 'number');
  const totalViews = withViews.reduce((s, r) => s + r.views, 0);
  const totalReach = rows.reduce((s, r) => s + (r.reach || 0), 0);
  const totalInteractions = rows.reduce((s, r) => s + (r.interactions || 0), 0);
  const watch = rows.filter((r) => typeof r.avg_watch_s === 'number');
  const weekAgo = followerSeries.find((p) => new Date(p.day) <= new Date(now().getTime() - 7 * 864e5));
  return {
    username: account?.username || null,
    followers: account?.followers ?? null,
    followersWeekDelta:
      account?.followers != null && weekAgo?.followers != null ? account.followers - weekAgo.followers : null,
    reelCount: rows.length,
    totalViews,
    avgViews: withViews.length ? Math.round(totalViews / withViews.length) : null,
    engagementRate: totalReach ? totalInteractions / totalReach : null,
    avgWatchS: watch.length ? watch.reduce((s, r) => s + r.avg_watch_s, 0) / watch.length : null,
    rows,
    followerSeries,
    queue,
    lastRun: lastRun ? JSON.parse(lastRun) : null,
    lastError: lastError || null,
  };
}

function sumKnown(values) {
  const nums = values.filter((v) => typeof v === 'number');
  return nums.length ? nums.reduce((a, b) => a + b, 0) : null;
}
