import { test } from 'node:test';
import assert from 'node:assert/strict';
import { phasesOf, expectedWatch, survivalAt, fitRates, retention, weakestLink, groupOf } from '../src/retention.js';

const beats = (dur, turn, endcard, extra = {}) => ({ dur, scenes: [['a', 0, turn], ['b', turn, dur]], endcard, wordmarks: [], ...extra });

test('phases come from the scene change and the end card', () => {
  assert.deepEqual(phasesOf(beats(20, 11.6, 17)), { dur: 20, hook: 3, payoff: 11.6, outro: 17 });
  // a 3-second hook scene is not the turn: the next scene change is
  const b = { dur: 18, scenes: [['a', 0, 3], ['b', 3, 12.4], ['c', 12.4, 18]], endcard: 15.5, wordmarks: [] };
  assert.equal(phasesOf(b).payoff, 12.4);
  // declared beats win; JSON strings are read
  assert.equal(phasesOf(JSON.stringify(beats(20, 11.6, 17, { declared: { payoff: 9 } }))).payoff, 9);
  // no end card: a late wordmark is the ending; an early one (brand header) is not
  assert.equal(phasesOf({ dur: 20, scenes: [], endcard: null, wordmarks: [11.5, 18] }).outro, 18);
  assert.equal(phasesOf({ dur: 20, scenes: [], endcard: null, wordmarks: [11.5] }).outro, 20);
  assert.equal(phasesOf(null), null);
  assert.equal(phasesOf({ dur: 2 }), null);
});

test('area under the curve is the average watch time', () => {
  const ph = { dur: 10, hook: 3, payoff: 6, outro: 9 };
  assert.ok(Math.abs(expectedWatch(ph, [0, 0, 0, 0]) - 10) < 1e-9);
  const H = [0.2, 0.1, 0.05, 0.3];
  let area = 0;
  for (let t = 0; t < 10; t += 0.001) area += survivalAt(t + 0.0005, ph, H) * 0.001;
  assert.ok(Math.abs(area - expectedWatch(ph, H)) < 1e-3);
});

// Synthetic reels from known rates: the fit should find which phase leaks fastest.
function synth(H, n = 14, { skip = true } = {}) {
  const rows = [];
  for (let i = 0; i < n; i++) {
    const dur = 10 + (i % 5) * 3;
    const turn = 4 + ((i * 7) % 9) * 0.6;
    const end = dur - 1.5;
    const b = beats(dur, Math.min(turn, end - 1), end);
    const ph = phasesOf(b);
    rows.push({
      id: `m${i}`, label: `r${i}`, views: 200 + i * 10, beats: b,
      avgWatchS: expectedWatch(ph, H),
      skipRate: skip ? (1 - survivalAt(3, ph, H)) * 100 : null,
      group: i % 2 ? 'A' : 'B',
    });
  }
  return rows;
}

test('the fit recovers a leaky buildup', () => {
  const r = retention(synth([0.12, 0.25, 0.04, 0.3]));
  assert.equal(r.ready, true);
  assert.equal(r.weakest.name, 'buildup');
  assert.ok(r.fitErrorS < 0.2, `fit error ${r.fitErrorS}`);
  const hook = r.phases.find((p) => p.name === 'hook');
  assert.ok(Math.abs(hook.lost - (1 - Math.exp(-0.36))) < 0.03);
  assert.ok(r.measuredSkip > 0.25 && r.measuredSkip < 0.35);
});

test('the fit recovers a leaky payoff, even without skip rates', () => {
  const r = retention(synth([0.1, 0.03, 0.2, 0.3], 14, { skip: false }));
  assert.equal(r.weakest.name, 'payoff');
  assert.equal(r.measuredSkip, null);
});

test('a hook that loses half the viewers is the weakest link', () => {
  const r = retention(synth([0.3, 0.2, 0.04, 0.3]));
  assert.equal(r.weakest.name, 'hook');
  assert.equal(r.weakest.reason, 'hook-half');
});

test('not enough reels: not ready, and says why', () => {
  const rows = synth([0.1, 0.1, 0.1, 0.1], 3);
  rows.push({ id: 'x', label: 'x', views: 50, avgWatchS: 5, beats: null });
  const r = retention(rows);
  assert.equal(r.ready, false);
  assert.equal(r.reels, 3);
  assert.equal(r.missingBeats, 1);
});

test('replays past the reel length are capped, not counted as retention', () => {
  const rows = synth([0.1, 0.1, 0.1, 0.1], 6);
  rows[0].avgWatchS = 40;
  const r = retention(rows);
  assert.equal(r.replayed, 1);
  assert.ok(r.phases.every((p) => p.end <= p.start + 1e-9));
});

test('per-group results need enough reels in the group', () => {
  const r = retention(synth([0.12, 0.25, 0.04, 0.3], 10));
  assert.deepEqual(r.byGroup.map((g) => g.group).sort(), ['A', 'B']);
  const small = retention(synth([0.12, 0.25, 0.04, 0.3], 6));
  assert.equal(small.byGroup.length, 0);
});

test('weakest link: buildup and payoff within 15% is a tie', () => {
  const p = (name, perSecond, lost = 0.1, seconds = 5) => ({ name, perSecond, lost, seconds });
  const w = weakestLink([p('hook', 0.12, 0.3, 3), p('buildup', 0.1), p('payoff', 0.092), p('ending', 0.3)]);
  assert.equal(w.name, 'buildup');
  assert.equal(w.tie, 'payoff');
  // a hook that leaks more than twice as fast per second is called out
  assert.equal(weakestLink([p('hook', 0.3, 0.45, 3), p('buildup', 0.1), p('payoff', 0.05), p('ending', 0.3)]).name, 'hook');
});

test('group comes from the hourly reel title', () => {
  assert.equal(groupOf('ריל H14 · שוכרים חכם · מצלמים ביום הכניסה'), 'שוכרים חכם');
  assert.equal(groupOf('Red flags ep 3'), null);
  assert.equal(groupOf(null), null);
});

test('fitRates is quick enough for a Worker request', () => {
  const rows = synth([0.12, 0.25, 0.04, 0.3], 40);
  const t = performance.now();
  retention(rows);
  assert.ok(performance.now() - t < 200);
});

// ---- end to end on real SQL: stored structure + Instagram stats -> dashboard card ----
import { sqliteAvailable, createTestD1 } from './d1-sqlite.js';
import { createD1Store } from '../src/store.js';
import { igData, findings } from '../src/insights.js';
import { renderPlatform } from '../src/dashboard.js';

const noSql = !sqliteAvailable && 'node:sqlite not available in this Node version';

test('stored beats + watch time + skip rate -> weakest link on the Instagram page', { skip: noSql }, async () => {
  const store = createD1Store(createTestD1('../schema.sql'));
  const now = Date.parse('2026-11-21T12:00:00Z');
  const H = [0.12, 0.25, 0.04, 0.3];
  for (let i = 0; i < 8; i++) {
    const dur = 10 + (i % 4) * 3;
    const turn = 4 + i * 0.7;
    const b = beats(dur, turn, dur - 1.5);
    const ph = phasesOf(b);
    const id = `r${i}`;
    await store.createReel({ id, status: 'published', title: `ריל H${i + 1} · העיר · נושא ${i}`, caption: 'c', media_key: 'k', created_at: '2026-11-20T00:00:00Z',
      beats: i === 7 ? null : JSON.stringify(b) });
    await store.updateReel(id, { ig_media_id: `m${i}` });
    await store.upsertMedia({ id: `m${i}`, caption: `c${i}`, media_type: 'VIDEO', media_product_type: 'REELS', permalink: 'p', timestamp: new Date(now - (i + 2) * 3600e3).toISOString() });
    await store.addMediaStats(`m${i}`, new Date(now - 3600e3).toISOString(), {
      views: 300, reach: 200, ig_reels_avg_watch_time: Math.round(expectedWatch(ph, H) * 1000), reels_skip_rate: (1 - survivalAt(3, ph, H)) * 100,
    });
  }
  // backfill fills a missing structure by id, never overwrites
  assert.equal(await store.setBeats({ id: 'r7' }, JSON.stringify(beats(19, 9, 17.5))), 1);
  assert.equal(await store.setBeats({ id: 'r7' }, JSON.stringify(beats(30, 9, 28))), 0);
  await store.addMediaStats('m7', new Date(now - 3600e3).toISOString(), {
    views: 300, ig_reels_avg_watch_time: Math.round(expectedWatch(phasesOf(beats(19, 9, 17.5)), H) * 1000), reels_skip_rate: 30,
  });

  const ig = await igData(store, { now: () => new Date(now), range: '7d' });
  assert.equal(ig.retention.ready, true);
  assert.equal(ig.retention.reels, 8);
  assert.equal(ig.retention.weakest.name, 'buildup');
  assert.equal(ig.retention.byGroup[0].group, 'העיר');
  // second read comes from the cache, same answer
  const again = await igData(store, { now: () => new Date(now), range: '7d' });
  assert.deepEqual(again.retention.weakest, ig.retention.weakest);
  assert.ok(await store.kvGet('retention_cache'));

  const html = renderPlatform({ p: ig, range: '7d', health: 'good', notice: '', tiktokEnabled: true, timeZone: 'UTC' });
  assert.match(html, /Where viewers drop off/);
  assert.match(html, /Weakest link: buildup/);
  assert.match(html, /data-retention=/);
  assert.match(html, /Skip rate/);
  const f = findings({ ig, tt: null, range: '7d' });
  assert.ok(f.some((x) => /Weakest link on Instagram: the buildup/.test(x.text)));
});

test('migration 003 adds the beats column to an existing database', { skip: noSql }, () => {
  const db = createTestD1('./fixtures/schema-before-002.sql', '../migrations/002-insights.sql', '../migrations/003-beats.sql');
  const cols = db.raw.prepare('PRAGMA table_info(reels)').all().map((c) => c.name);
  assert.ok(cols.includes('beats'));
});

test('a database without the beats column still enqueues and shows stats', { skip: noSql }, async () => {
  const store = createD1Store(createTestD1('./fixtures/schema-before-002.sql', '../migrations/002-insights.sql'));
  await store.createReel({ id: 'aa11', status: 'uploading', title: 't', caption: 'c', media_key: 'k', created_at: '2026-11-21T00:00:00Z', beats: '{"dur":10}' });
  assert.equal((await store.getReel('aa11')).status, 'uploading');
  assert.deepEqual(await store.latestReelStats(), []);
});
