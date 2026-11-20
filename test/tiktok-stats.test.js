import { test } from 'node:test';
import assert from 'node:assert/strict';
import { collectTikTokStats, maybeCollectTikTokStats } from '../src/tiktok-stats.js';
import { tiktokData } from '../src/insights.js';
import { TikTokError } from '../src/tiktok.js';
import { renderPlatform } from '../src/dashboard.js';
import { createMemoryStore } from './memory-store.js';

const fakeTT = (pages, account = { display_name: 'Homie', follower_count: 12, likes_count: 40, video_count: 3 }) => {
  const calls = [];
  return {
    calls,
    async accountStats() { return account; },
    async listVideos(cursor) {
      calls.push(cursor ?? null);
      return pages[calls.length - 1];
    },
  };
};

const vid = (id, views, extra = {}) => ({
  id, title: `video ${id}`, create_time: 1763600000, share_url: `https://tiktok.com/@homieil/video/${id}`,
  view_count: views, like_count: 5, comment_count: 1, share_count: 2, ...extra,
});

test('collects account totals and pages through videos', async () => {
  const store = createMemoryStore();
  const tt = fakeTT([
    { videos: [vid('a', 100), vid('b', 50)], has_more: true, cursor: 99 },
    { videos: [vid('c', 10)], has_more: false },
  ]);
  const r = await collectTikTokStats({ tt, store, now: () => new Date('2026-11-20T10:00:00Z') });
  assert.equal(r.videos, 3);
  assert.deepEqual(tt.calls, [null, 99]);
  const d = await tiktokData(store, { now: () => new Date('2026-11-20T10:00:00Z'), range: 'all' });
  assert.equal(d.followers, 12);
  assert.equal(d.totalViews, 160);
  assert.equal(d.totalLikes, 40);
  assert.equal(d.rows[0].permalink, 'https://tiktok.com/@homieil/video/a');
  // History and first-day views are recorded for the dashboard.
  const history = JSON.parse(await store.kvGet('tiktok_history'));
  assert.equal(history.at(-1).views, 160);
});

test('keeps one follower point per day', async () => {
  const store = createMemoryStore();
  const tt = fakeTT([{ videos: [], has_more: false }, { videos: [], has_more: false }, { videos: [], has_more: false }]);
  await collectTikTokStats({ tt, store, now: () => new Date('2026-11-20T10:00:00Z') });
  await collectTikTokStats({ tt, store, now: () => new Date('2026-11-20T11:00:00Z') });
  await collectTikTokStats({ tt, store, now: () => new Date('2026-11-21T10:00:00Z') });
  const series = JSON.parse(await store.kvGet('tiktok_followers'));
  assert.deepEqual(series.map((p) => p.day), ['2026-11-21', '2026-11-20']);
});

test('hourly gate, and a missing-permission error says how to fix it', async () => {
  const store = createMemoryStore();
  let t = new Date('2026-11-20T10:00:00Z');
  const tt = {
    async accountStats() { throw new TikTokError('no', 'scope_not_authorized', 401); },
    async listVideos() { return { videos: [] }; },
  };
  assert.equal(await maybeCollectTikTokStats({ tt, store, now: () => t }), 'error');
  assert.match(await store.kvGet('tiktok_stats_error'), /sign in again/);
  t = new Date(t.getTime() + 10 * 60 * 1000);
  assert.equal(await maybeCollectTikTokStats({ tt, store, now: () => t }), 'waiting');
  assert.equal(await maybeCollectTikTokStats({ tt, store, now: () => t, force: true }), 'error');
});

test('TikTok page renders its own table', async () => {
  const store = createMemoryStore();
  await collectTikTokStats({ tt: fakeTT([{ videos: [vid('a', 100)], has_more: false }]), store });
  const t = await tiktokData(store, { range: 'all' });
  const html = renderPlatform({ p: t, range: 'all', health: 'good', notice: '', tiktokEnabled: true, timeZone: 'UTC' });
  assert.ok(html.includes('All videos'));
  assert.equal((html.match(/class="sortable"/g) || []).length, 1);
});
