// Pulls account + per-reel stats from Instagram into the database, and shapes them for the dashboard.

// Asked for first. If Instagram rejects one name (metric names change between API versions),
// the collector falls back to CORE_METRICS so one bad name never blanks the dashboard.
export const REEL_METRICS = [
  'views', 'reach', 'likes', 'comments', 'shares', 'saved', 'total_interactions', 'ig_reels_avg_watch_time',
];
export const CORE_METRICS = ['views', 'reach', 'likes', 'comments', 'shares', 'saved'];
// Newer metrics, asked for on top of REEL_METRICS. reels_skip_rate = % of plays that left in the
// first 3 seconds (feeds the retention estimate). If Instagram rejects them, the run stops asking.
export const EXTRA_METRICS = ['reels_skip_rate'];

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

async function reelInsights(ig, mediaId, run = { extra: true }) {
  if (run.extra) {
    try {
      return parseInsights(await ig.mediaInsights(mediaId, [...REEL_METRICS, ...EXTRA_METRICS]));
    } catch {
      run.extra = false; // not supported (or not for this token): don't pay for it on every reel
    }
  }
  try {
    return parseInsights(await ig.mediaInsights(mediaId, REEL_METRICS));
  } catch {
    return parseInsights(await ig.mediaInsights(mediaId, CORE_METRICS));
  }
}

const HOUR = 60 * 60 * 1000;
const MAX_MEDIA = 250; // newest posts read each run (5 pages of 50)
const PAGE = 50;

// How often a reel is re-measured, by age. New reels change fast; old ones barely move,
// and skipping them keeps the hourly run well inside Instagram's API budget.
export function refreshEveryMs(ageMs) {
  if (ageMs < 48 * HOUR) return 0; // every run
  if (ageMs < 14 * 24 * HOUR) return 6 * HOUR;
  return 24 * HOUR;
}

const ageOf = (m, nowMs) => (m.timestamp ? nowMs - new Date(m.timestamp).getTime() : Infinity);

async function listAllMedia(ig) {
  const media = [];
  let after = null;
  while (media.length < MAX_MEDIA) {
    const res = await ig.listMedia(PAGE, after);
    media.push(...(res.data || []));
    after = res.paging?.cursors?.after;
    if (!res.paging?.next || !after) break;
  }
  return media.slice(0, MAX_MEDIA);
}

export async function collectStats({ ig, store, now = () => new Date() }) {
  const at = now().toISOString();
  const nowMs = now().getTime();
  const account = await ig.account();
  const media = await listAllMedia(ig);
  const lastSeen = store.lastSnapshotTimes ? await store.lastSnapshotTimes() : {};
  let reels = 0;
  let skipped = 0;
  let failed = 0;
  const run = { extra: true };
  for (const m of media) {
    await store.upsertMedia(m);
    if (!isReel(m)) continue;
    const age = ageOf(m, nowMs);
    const last = lastSeen[m.id];
    if (last && nowMs - new Date(last).getTime() < refreshEveryMs(age) - 5 * 60 * 1000) {
      skipped++;
      continue;
    }
    try {
      const metrics = await reelInsights(ig, m.id, run);
      await store.addMediaStats(m.id, at, metrics);
      if (age <= 24 * HOUR && typeof metrics.views === 'number' && store.setDay1) {
        await store.setDay1(m.id, metrics.views, at);
      }
      reels++;
    } catch (err) {
      failed++;
      console.error(`insights failed for ${m.id}:`, err.message);
    }
  }
  const totalViews = store.sumLatestViews ? await store.sumLatestViews() : null;
  await store.addAccountStats({
    captured_at: at,
    username: account.username || null,
    followers: account.followers_count ?? null,
    media_count: account.media_count ?? null,
    total_views: totalViews,
  });
  await store.pruneStats(new Date(nowMs - 90 * 24 * HOUR).toISOString());
  const summary = { at, media: media.length, reels, skipped, failed, calls: ig.usage?.calls ?? null, usage_peak: ig.usage?.peak ?? null };
  await store.kvSet('stats_last_run', JSON.stringify(summary));
  return summary;
}

const logEvent = (store, e) => (store.logEvent ? store.logEvent(e).catch(() => {}) : Promise.resolve());

// Runs from the every-minute cron; does real work at most once an hour.
// Logs to the activity log only when something changes (a new error, or recovery), not every hour.
export async function maybeCollectStats({ ig, store, now = () => new Date() }) {
  let last = null;
  try {
    last = JSON.parse((await store.kvGet('stats_last_attempt')) || 'null');
  } catch {
    last = null;
  }
  if (last && now().getTime() - last < COLLECT_EVERY_MS) return 'waiting';
  await store.kvSet('stats_last_attempt', JSON.stringify(now().getTime()));
  const previousError = (await store.kvGet('stats_last_error')) || '';
  try {
    const summary = await collectStats({ ig, store, now });
    await store.kvSet('stats_last_error', '');
    if (previousError) {
      await logEvent(store, { at: now().toISOString(), level: 'good', source: 'stats', message: 'Instagram stats collection is working again' });
    }
    if (summary.failed) {
      await logEvent(store, {
        at: now().toISOString(), level: 'warning', source: 'stats',
        message: `Instagram stats: ${summary.failed} reel${summary.failed > 1 ? 's' : ''} could not be measured this hour`,
      });
    }
    return 'collected';
  } catch (err) {
    await store.kvSet('stats_last_error', err.message);
    if (err.message !== previousError) {
      await logEvent(store, { at: now().toISOString(), level: 'error', source: 'stats', message: `Instagram stats collection failed: ${err.message}` });
    }
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

export function sumKnown(values) {
  const nums = values.filter((v) => typeof v === 'number');
  return nums.length ? nums.reduce((a, b) => a + b, 0) : null;
}
