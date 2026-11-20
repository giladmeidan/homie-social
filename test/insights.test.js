// Dashboard v2 end to end on a real SQLite database: collector -> store SQL -> insights -> pages.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sqliteAvailable, createTestD1 } from './d1-sqlite.js';
import { createD1Store } from '../src/store.js';
import { collectStats, refreshEveryMs } from '../src/stats.js';
import { igData, tiktokData, findings, reelDetail, median, compareToTypical, downsample } from '../src/insights.js';
import { healthChecks } from '../src/health.js';
import { renderOverview, renderPlatform, renderReel, renderSystem } from '../src/dashboard.js';

const skip = !sqliteAvailable && 'node:sqlite not available in this Node version';
const HOUR = 3600e3;
const T0 = Date.parse('2026-11-18T00:00:00Z');

// Fake Instagram: n reels posted 6 hours apart; views grow with age, reel 3 is a hit.
function fakeIg({ reels = 8, pageSize = 3 } = {}) {
  const media = Array.from({ length: reels }, (_, i) => ({
    id: `m${i}`,
    caption: i === 2 ? '<b>bold</b> caption\n#homie' : `רילס מספר ${i}\n\n#homie`,
    media_type: 'VIDEO',
    media_product_type: 'REELS',
    permalink: `https://ig/${i}`,
    timestamp: new Date(T0 + i * 6 * HOUR).toISOString().replace('.000Z', '+0000'),
    thumbnail_url: `https://cdn/${i}.jpg`,
  })).reverse(); // newest first, like Instagram
  let clock = T0;
  const ig = {
    usage: { calls: 0, peak: 12 },
    setClock(ms) { clock = ms; },
    async account() { return { username: 'homie.il', followers_count: 9 + Math.floor((clock - T0) / (24 * HOUR)), media_count: reels }; },
    async listMedia(limit, after) {
      ig.usage.calls++;
      const visible = media.filter((m) => Date.parse(m.timestamp) <= clock);
      const start = after ? Number(after) : 0;
      const page = visible.slice(start, start + pageSize);
      const next = start + pageSize < visible.length;
      return { data: page, paging: next ? { cursors: { after: String(start + pageSize) }, next: 'x' } : { cursors: {} } };
    },
    async mediaInsights(id) {
      ig.usage.calls++;
      const m = media.find((x) => x.id === id);
      const ageH = (clock - Date.parse(m.timestamp)) / HOUR;
      const boost = id === 'm3' ? 4 : 1;
      const views = Math.round(Math.min(ageH, 30) * 2 * boost);
      return { data: [
        { name: 'views', values: [{ value: views }] }, { name: 'reach', values: [{ value: Math.round(views * 0.7) }] },
        { name: 'likes', values: [{ value: Math.round(views / 10) }] }, { name: 'comments', values: [{ value: 0 }] },
        { name: 'shares', values: [{ value: 0 }] }, { name: 'saved', values: [{ value: 0 }] },
        { name: 'ig_reels_avg_watch_time', values: [{ value: 3000 + Number(id.slice(1)) * 500 }] },
      ] };
    },
  };
  return ig;
}

async function seeded() {
  const db = createTestD1('../schema.sql');
  const store = createD1Store(db);
  const ig = fakeIg();
  // Hourly collections for 72 hours.
  for (let h = 1; h <= 72; h++) {
    const ms = T0 + h * HOUR;
    ig.setClock(ms);
    await collectStats({ ig, store, now: () => new Date(ms) });
  }
  return { db, store, ig, now: () => new Date(T0 + 72 * HOUR) };
}

test('median, comparisons and downsampling', () => {
  assert.equal(median([5, 1, 3]), 3);
  assert.equal(median([1, 2, 3, 100]), 2.5);
  assert.equal(median([]), null);
  assert.equal(compareToTypical({ ageMs: HOUR, day1: 5 }, 10).kind, 'new');
  assert.equal(compareToTypical({ ageMs: 30 * HOUR, day1: 20 }, 10).kind, 'above');
  assert.equal(compareToTypical({ ageMs: 30 * HOUR, day1: 5 }, 10).kind, 'below');
  assert.equal(compareToTypical({ ageMs: 30 * HOUR, day1: 11 }, 10).kind, 'typical');
  const pts = Array.from({ length: 500 }, (_, i) => i);
  const d = downsample(pts, 50);
  assert.equal(d.length, 50);
  assert.equal(d[0], 0);
  assert.equal(d.at(-1), 499);
});

test('older reels are re-measured less often', () => {
  assert.equal(refreshEveryMs(HOUR), 0);
  assert.equal(refreshEveryMs(3 * 24 * HOUR), 6 * HOUR);
  assert.equal(refreshEveryMs(30 * 24 * HOUR), 24 * HOUR);
});

test('collector pages through all posts and records first-day views and totals', { skip }, async () => {
  const { db, store } = await seeded();
  const media = db.raw.prepare('SELECT COUNT(*) n FROM ig_media').get().n;
  assert.equal(media, 8, 'all pages read');
  const day1 = db.raw.prepare("SELECT day1_views FROM ig_media WHERE id='m0'").get().day1_views;
  assert.equal(day1, 48, 'views at the last hourly snapshot within 24h (24h * 2)');
  const hit = db.raw.prepare("SELECT day1_views FROM ig_media WHERE id='m3'").get().day1_views;
  assert.equal(hit, 192);
  const last = db.raw.prepare('SELECT total_views FROM account_stats ORDER BY captured_at DESC LIMIT 1').get().total_views;
  assert.equal(last, await store.sumLatestViews());
  assert.ok(last > 0);
  // Reels older than 48h are skipped on most runs.
  const snapsOld = db.raw.prepare("SELECT COUNT(*) n FROM media_stats WHERE media_id='m0'").get().n;
  assert.ok(snapsOld < 72 && snapsOld > 48, `m0 measured hourly for 48h then every 6h, got ${snapsOld}`);
});

test('instagram data: typical reel, fair comparison, gained in range, timeline', { skip }, async () => {
  const { store, now } = await seeded();
  const d = await igData(store, { now, range: '7d' });
  assert.equal(d.username, 'homie.il');
  assert.equal(d.rows.length, 8);
  assert.ok(d.typical > 0, 'typical computed from reels a day old');
  const hit = d.rows.find((r) => r.id === 'm3');
  assert.equal(hit.vs.kind, 'above');
  const earlier = await igData(store, { now: () => new Date(T0 + 50 * HOUR), range: '7d' });
  assert.equal(earlier.rows.find((r) => r.id === 'm7').vs.kind, 'new', 'a reel under 24h old is not compared yet');
  assert.ok(d.timeline.length > 10);
  assert.ok(d.gained > 0);
  assert.equal(d.zeroDeep, true);
  assert.ok(d.rows.find((r) => r.spark)?.spark.length > 1, 'sparklines filled');
  const day = await igData(store, { now, range: '24h' });
  assert.ok(day.gained < d.gained, '24h gains are a subset of 7d gains');
  assert.ok(typeof day.gainedChange === 'number', 'compared with the 24h before');
});

test('findings read like sentences and only state facts', { skip }, async () => {
  const { store, now } = await seeded();
  const ig = await igData(store, { now, range: '7d' });
  const f = findings({ ig, tt: null, range: '7d' });
  const text = f.map((x) => x.text).join('\n');
  assert.match(text, /Your reels got [\d,]+ views in the last 7 days/);
  assert.match(text, /Best reel: .* first day, [\d.]+× your typical reel/);
  assert.match(text, /watch a reel for [\d.]+ seconds/);
  assert.match(text, /No comments, shares or saves/);
});

test('reel detail tells the story of one reel', { skip }, async () => {
  const { store, now } = await seeded();
  const d = await reelDetail(store, 'm3', { now });
  assert.equal(d.day1, 192);
  assert.equal(d.vs.kind, 'above');
  assert.ok(d.viewsSeries.length > 5);
  const html = renderReel({ d, health: 'good', notice: '', tiktokEnabled: false, timeZone: 'UTC' });
  assert.match(html, /The story so far/);
  assert.match(html, /your typical reel/);
  assert.ok(!html.includes('<b>bold</b>'), 'caption is escaped');
  assert.equal(await reelDetail(store, 'nope', { now }), null);
});

test('tiktok data from history and first-day map', async () => {
  const kv = new Map();
  const store = { kvGet: async (k) => kv.get(k) ?? null, kvSet: async (k, v) => kv.set(k, v) };
  const at = (h) => new Date(T0 + h * HOUR).toISOString();
  kv.set('tiktok_stats', JSON.stringify({ at: at(72), account: { name: 'Homie', followers: 8, likes: 156 }, videos: [
    { id: 'v1', title: 'first', url: 'https://tt/1', posted: at(1), views: 300, likes: 10, comments: 1, shares: 0 },
    { id: 'v2', title: 'second', url: 'https://tt/2', posted: at(10), views: 90, likes: 5, comments: 0, shares: 0 },
    { id: 'v3', title: 'third', url: 'https://tt/3', posted: at(20), views: 60, likes: 2, comments: 0, shares: 1 },
    { id: 'v4', title: 'newest', url: 'https://tt/4', posted: at(70), views: 12, likes: 1, comments: 0, shares: 0 },
  ] }));
  kv.set('tiktok_history', JSON.stringify([{ at: at(1), views: 0, followers: 5 }, { at: at(48), views: 300, followers: 7 }, { at: at(72), views: 462, followers: 8 }]));
  kv.set('tiktok_day1', JSON.stringify({ v1: { views: 200 }, v2: { views: 50 }, v3: { views: 40 }, v4: { views: 12 } }));
  const t = await tiktokData(store, { now: () => new Date(T0 + 72 * HOUR), range: '24h' });
  assert.equal(t.typical, 50);
  assert.equal(t.rows.find((r) => r.id === 'v1').vs.kind, 'above');
  assert.equal(t.rows.find((r) => r.id === 'v4').vs.kind, 'new');
  assert.equal(t.gained, 162);
  assert.equal(t.followersDelta, 1);
  const html = renderPlatform({ p: t, range: '24h', health: 'good', notice: '', tiktokEnabled: true, timeZone: 'UTC' });
  assert.match(html, /Which reels beat your usual/);
  assert.match(html, /TikTok · Homie/);
});

test('health checks flag problems in plain words', { skip }, async () => {
  const { store, now } = await seeded();
  await store.createReel({ id: 'aa', status: 'uploading', caption: 'x', media_key: 'k', created_at: new Date(T0).toISOString() });
  await store.createReel({ id: 'bb', status: 'pending_approval', caption: 'y', media_key: 'k2', created_at: new Date(T0 + 71 * HOUR).toISOString() });
  await store.kvSet('cron_heartbeat', new Date(T0 + 72 * HOUR - 30e3).toISOString());
  const ig = { publishingLimit: async () => ({ data: [{ quota_usage: 14, config: { quota_total: 100 } }] }) };
  const tg = { send: async () => ({ url: 'https://w/telegram/webhook', pending_update_count: 0 }) };
  const h = await healthChecks({ store, ig, tg, env: { TELEGRAM_CHAT_ID: '1', tiktokConfigured: false }, now });
  const by = Object.fromEntries(h.checks.map((c) => [c.id, c]));
  assert.equal(by.scheduler.status, 'good');
  assert.match(by['ig-api'].detail, /14 of 100 API posts/);
  assert.equal(by.queue.status, 'warning');
  assert.match(by.queue.detail, /1 waiting for your approval/);
  assert.match(by.queue.detail, /1 upload never finished/);
  assert.equal(by.queue.action.post, '/dashboard/system/clear-stuck');
  const n = await store.abandonStuckUploads(new Date(T0 + 71 * HOUR).toISOString(), now().toISOString());
  assert.equal(n, 1);

  // A dead scheduler and a broken Instagram are critical.
  await store.kvSet('cron_heartbeat', new Date(T0).toISOString());
  const bad = { publishingLimit: async () => { throw new Error('Invalid OAuth access token'); } };
  const h2 = await healthChecks({ store, ig: bad, tg, env: { TELEGRAM_CHAT_ID: '1' }, now });
  assert.equal(h2.overall, 'critical');
  assert.equal(h2.checks.find((c) => c.id === 'scheduler').status, 'critical');
});

test('activity log and system page', { skip }, async () => {
  const { store, now } = await seeded();
  await store.logEvent({ at: now().toISOString(), level: 'good', source: 'publisher', message: 'Published on Instagram: <script>' });
  await store.logEvent({ at: now().toISOString(), level: 'error', source: 'stats', message: 'Instagram stats collection failed: boom' });
  const errors = await store.listEvents(10, 'error');
  assert.equal(errors.length, 1);
  const h = { checks: [{ id: 'x', title: 'Scheduler', status: 'good', detail: 'ok' }], overall: 'good', checkedAt: now().toISOString() };
  const html = renderSystem({ h, events: await store.listEvents(10), level: null, queue: [], tiktok: null, notice: '', tiktokEnabled: false, timeZone: 'UTC' });
  assert.match(html, /Health checks/);
  assert.match(html, /All systems OK/);
  assert.ok(!html.includes('<script>Published') && html.includes('&lt;script&gt;'));
});

test('overview renders for both platforms with the range switch', { skip }, async () => {
  const { store, now } = await seeded();
  const ig = await igData(store, { now, range: '7d' });
  const html = renderOverview({ ig, tt: null, range: '7d', findings: findings({ ig, tt: null, range: '7d' }), health: 'warning', notice: 'hi', tiktokEnabled: false, timeZone: 'UTC' });
  for (const s of ['At a glance', 'Total views over time', 'Top reels this period', 'What do these numbers mean?', 'Needs a look', '?range=24h']) {
    assert.ok(html.includes(s), s);
  }
  assert.ok(!html.includes('/dashboard/tiktok?'), 'TikTok tab hidden when not connected');
});

test('migration 002 upgrades an existing database and backfills first-day views', { skip }, async () => {
  const db = createTestD1('./fixtures/schema-before-002.sql');
  const ins = db.raw.prepare('INSERT INTO media_stats (media_id, captured_at, metrics) VALUES (?, ?, ?)');
  db.raw.prepare("INSERT INTO ig_media (id, timestamp, product_type) VALUES ('a', '2026-11-19T18:41:31+0000', 'REELS')").run();
  ins.run('a', '2026-11-19T22:44:23.331Z', '{"views":40}');
  ins.run('a', '2026-11-20T17:55:00.000Z', '{"views":80}');
  ins.run('a', '2026-11-20T19:56:00.000Z', '{"views":89}'); // after 24h: not first-day
  db.exec((await import('node:fs')).readFileSync(new URL('../migrations/002-insights.sql', import.meta.url), 'utf8'));
  const row = db.raw.prepare("SELECT day1_views FROM ig_media WHERE id='a'").get();
  assert.equal(row.day1_views, 80);
  db.raw.prepare("INSERT INTO events (at, level, source, message) VALUES ('x','info','system','ok')").run();
});
