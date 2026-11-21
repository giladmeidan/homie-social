import { test } from 'node:test';
import assert from 'node:assert/strict';
import { collectStats, maybeCollectStats, parseInsights, reelLabel, CORE_METRICS, REEL_METRICS, EXTRA_METRICS } from '../src/stats.js';
import { renderLogin } from '../src/dashboard.js';

// Minimal in-memory version of the stats part of the store.
function statsStore() {
  const media = new Map();
  const mediaStats = [];
  const accountStats = [];
  const kv = new Map();
  return {
    media, mediaStats, accountStats,
    async upsertMedia(m) { media.set(m.id, { ...m }); },
    async addMediaStats(id, at, metrics) { mediaStats.push({ media_id: id, captured_at: at, metrics: JSON.stringify(metrics) }); },
    async addAccountStats(s) { accountStats.push(s); },
    async pruneStats(before) {
      for (let i = mediaStats.length - 1; i >= 0; i--) if (mediaStats[i].captured_at < before) mediaStats.splice(i, 1);
    },
    async latestReelStats() {
      return [...media.values()]
        .filter((m) => m.media_product_type === 'REELS' || m.media_type === 'VIDEO')
        .map((m) => {
          const s = mediaStats.filter((x) => x.media_id === m.id).sort((a, b) => b.captured_at.localeCompare(a.captured_at))[0];
          return { id: m.id, caption: m.caption, permalink: m.permalink, timestamp: m.timestamp, metrics: s?.metrics, title: null };
        });
    },
    async latestAccountStats() { return accountStats.at(-1) || null; },
    async dailyFollowers() {
      return accountStats.map((s) => ({ day: s.captured_at.slice(0, 10), followers: s.followers })).reverse();
    },
    async listReels() { return [{ id: 'r1', title: 'ריל 10', status: 'published', updated_at: '2026-11-19T22:37:00Z', published_at: '2026-11-19T22:37:00Z' }]; },
    async kvGet(k) { return kv.has(k) ? kv.get(k) : null; },
    async kvSet(k, v) { kv.set(k, v); },
  };
}

function fakeIg({ rejectFullMetrics = false, rejectExtra = false } = {}) {
  const calls = [];
  return {
    calls,
    async account() { return { username: 'homie.il', followers_count: 120, media_count: 3 }; },
    async listMedia() {
      return {
        data: [
          { id: 'm1', caption: 'רולטה של שותפים 🎰\n\n#homie', media_type: 'VIDEO', media_product_type: 'REELS', permalink: 'https://ig/1', timestamp: '2026-11-19T22:37:00+0000' },
          { id: 'm2', caption: 'a photo', media_type: 'IMAGE', media_product_type: 'FEED', permalink: 'https://ig/2', timestamp: '2026-11-18T10:00:00+0000' },
        ],
      };
    },
    async mediaInsights(id, metrics) {
      calls.push(metrics);
      if (rejectFullMetrics && metrics.length > CORE_METRICS.length) throw new Error('(#100) metric not supported');
      if (rejectExtra && EXTRA_METRICS.some((m) => metrics.includes(m))) throw new Error('(#100) metric not supported');
      return {
        data: metrics.map((name) => ({ name, values: [{ value: name === 'ig_reels_avg_watch_time' ? 6400 : 10 }] })),
      };
    },
  };
}

test('parseInsights reads both value shapes', () => {
  assert.deepEqual(
    parseInsights({ data: [{ name: 'views', values: [{ value: 5 }] }, { name: 'reach', total_value: { value: 3 } }] }),
    { views: 5, reach: 3 },
  );
});

test('collects account stats and insights for reels only', async () => {
  const store = statsStore();
  const ig = fakeIg();
  const out = await collectStats({ ig, store, now: () => new Date('2026-11-20T00:00:00Z') });
  assert.equal(out.reels, 1);
  assert.equal(store.mediaStats.length, 1);
  assert.equal(store.accountStats[0].followers, 120);
  assert.equal(JSON.parse(store.mediaStats[0].metrics).views, 10);
});

test('falls back to core metrics when Instagram rejects a metric name', async () => {
  const store = statsStore();
  const ig = fakeIg({ rejectFullMetrics: true });
  await collectStats({ ig, store });
  assert.equal(ig.calls.length, 3);
  assert.deepEqual(ig.calls[2], CORE_METRICS);
  assert.equal(JSON.parse(store.mediaStats[0].metrics).views, 10);
});

test('asks for the skip rate; if Instagram rejects it, keeps watch time and stops asking', async () => {
  const ok = fakeIg();
  const s1 = statsStore();
  await collectStats({ ig: ok, store: s1 });
  assert.ok(ok.calls[0].includes('reels_skip_rate'));
  assert.equal(JSON.parse(s1.mediaStats[0].metrics).reels_skip_rate, 10);

  const ig = fakeIg({ rejectExtra: true });
  const store = statsStore();
  await collectStats({ ig, store });
  assert.deepEqual(ig.calls[1], REEL_METRICS);
  const m = JSON.parse(store.mediaStats[0].metrics);
  assert.equal(m.ig_reels_avg_watch_time, 6400);
  assert.equal(m.reels_skip_rate, undefined);
});

test('maybeCollectStats runs at most once an hour and records errors', async () => {
  const store = statsStore();
  let clock = new Date('2026-11-20T00:00:00Z');
  const ig = fakeIg();
  assert.equal(await maybeCollectStats({ ig, store, now: () => clock }), 'collected');
  clock = new Date('2026-11-20T00:30:00Z');
  assert.equal(await maybeCollectStats({ ig, store, now: () => clock }), 'waiting');
  clock = new Date('2026-11-20T01:01:00Z');
  const broken = { ...ig, account: async () => { throw new Error('token revoked'); } };
  assert.equal(await maybeCollectStats({ ig: broken, store, now: () => clock }), 'error');
  assert.equal(await store.kvGet('stats_last_error'), 'token revoked');
});

test('reelLabel prefers the title, then the caption first line without hashtags', () => {
  assert.equal(reelLabel('x', 'Reel 10'), 'Reel 10');
  assert.equal(reelLabel('\n#homie only tags\nsecond', null), 'only tags');
  assert.equal(reelLabel('', null), 'Untitled reel');
});

test('login page shows its error', () => {
  assert.ok(renderLogin('bad key').includes('bad key'));
});
