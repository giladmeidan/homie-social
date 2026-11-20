// TikTok numbers for the dashboard. TikTok's API gives account totals and per-video
// views, likes, comments and shares (no reach or watch time, unlike Instagram).
// Everything is kept in the kv table, so no database migration is needed.

import { COLLECT_EVERY_MS } from './stats.js';

const MAX_PAGES = 10; // 200 newest videos
const FOLLOWER_DAYS = 30;
const HISTORY_DAYS = 30;
const DAY = 24 * 60 * 60 * 1000;

const readJson = async (store, key, fallback) => {
  try {
    return JSON.parse((await store.kvGet(key)) || 'null') ?? fallback;
  } catch {
    return fallback;
  }
};

export async function collectTikTokStats({ tt, store, now = () => new Date() }) {
  const at = now().toISOString();
  const account = await tt.accountStats();
  const videos = [];
  let cursor;
  for (let page = 0; page < MAX_PAGES; page++) {
    const res = await tt.listVideos(cursor);
    videos.push(...(res.videos || []));
    if (!res.has_more || !res.cursor) break;
    cursor = res.cursor;
  }
  const snapshot = {
    at,
    account: {
      name: account.display_name || null,
      followers: account.follower_count ?? null,
      following: account.following_count ?? null,
      likes: account.likes_count ?? null,
      videos: account.video_count ?? null,
    },
    videos: videos.map((v) => ({
      id: v.id,
      title: v.title || v.video_description || '',
      url: v.share_url || null,
      posted: v.create_time ? new Date(v.create_time * 1000).toISOString() : null,
      duration: v.duration ?? null,
      views: v.view_count ?? null,
      likes: v.like_count ?? null,
      comments: v.comment_count ?? null,
      shares: v.share_count ?? null,
    })),
  };
  await store.kvSet('tiktok_stats', JSON.stringify(snapshot));

  // One follower point per day (the day's last reading), newest first, 30 days.
  if (typeof snapshot.account.followers === 'number') {
    const dayKey = at.slice(0, 10);
    const series = (await readJson(store, 'tiktok_followers', [])).filter((p) => p.day !== dayKey);
    series.unshift({ day: dayKey, followers: snapshot.account.followers });
    await store.kvSet('tiktok_followers', JSON.stringify(series.slice(0, FOLLOWER_DAYS)));
  }

  // Hourly totals for "views gained" and the views-over-time chart, oldest first, 30 days.
  const totalViews = snapshot.videos.reduce((sum, v) => sum + (v.views || 0), 0);
  const cutoff = new Date(now().getTime() - HISTORY_DAYS * DAY).toISOString();
  const history = (await readJson(store, 'tiktok_history', [])).filter((p) => p.at >= cutoff);
  history.push({ at, views: totalViews, followers: snapshot.account.followers });
  await store.kvSet('tiktok_history', JSON.stringify(history));

  // First-day views: kept updating while a video is under 24 hours old, then frozen.
  const day1 = await readJson(store, 'tiktok_day1', {});
  const nowMs = now().getTime();
  const keep = {};
  for (const v of snapshot.videos) {
    const age = v.posted ? nowMs - new Date(v.posted).getTime() : Infinity;
    if (age <= DAY && typeof v.views === 'number') keep[v.id] = { views: v.views, at };
    else if (day1[v.id]) keep[v.id] = day1[v.id];
  }
  await store.kvSet('tiktok_day1', JSON.stringify(keep));
  return { at, videos: snapshot.videos.length };
}

// Same rhythm as the Instagram collector: tries every minute, works at most once an hour.
export async function maybeCollectTikTokStats({ tt, store, now = () => new Date(), force = false }) {
  const last = await readJson(store, 'tiktok_stats_attempt', null);
  if (!force && last && now().getTime() - last < COLLECT_EVERY_MS) return 'waiting';
  await store.kvSet('tiktok_stats_attempt', JSON.stringify(now().getTime()));
  const previousError = (await store.kvGet('tiktok_stats_error')) || '';
  const log = (e) => (store.logEvent ? store.logEvent({ at: now().toISOString(), source: 'tiktok-stats', ...e }).catch(() => {}) : null);
  try {
    await collectTikTokStats({ tt, store, now });
    await store.kvSet('tiktok_stats_error', '');
    if (previousError) await log({ level: 'good', message: 'TikTok stats collection is working again' });
    return 'collected';
  } catch (err) {
    const msg =
      err.code === 'scope_not_authorized'
        ? 'TikTok stats need the new permissions. Click the TikTok button at the top and sign in again.'
        : err.message;
    await store.kvSet('tiktok_stats_error', msg);
    if (msg !== previousError) await log({ level: 'error', message: `TikTok stats collection failed: ${msg}` });
    return 'error';
  }
}
