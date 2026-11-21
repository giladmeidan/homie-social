// Insights for the reel task and the Sunday review, on a real SQLite database.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sqliteAvailable, createTestD1 } from './d1-sqlite.js';
import { createD1Store } from '../src/store.js';
import { collectStats } from '../src/stats.js';
import { insightsJson, weeklyText, maybeWeeklyReview, formatOf } from '../src/feedback.js';

const skip = !sqliteAvailable && 'node:sqlite not available in this Node version';
const HOUR = 3600e3;
const T0 = Date.parse('2026-11-18T00:00:00Z');

// Two Instagram reels 6 hours apart; m1 gets four times the views of m0.
function fakeIg() {
  const media = [0, 1].map((i) => ({
    id: `m${i}`, caption: `caption ${i}`, media_type: 'VIDEO', media_product_type: 'REELS',
    permalink: `https://ig/${i}`, timestamp: new Date(T0 + i * 6 * HOUR).toISOString().replace('.000Z', '+0000'),
  })).reverse();
  let clock = T0;
  return {
    usage: { calls: 0, peak: 1 },
    setClock(ms) { clock = ms; },
    async account() { return { username: 'homie.il', followers_count: 12, media_count: 2 }; },
    async listMedia() { return { data: media.filter((m) => Date.parse(m.timestamp) <= clock), paging: { cursors: {} } }; },
    async mediaInsights(id) {
      const m = media.find((x) => x.id === id);
      const ageH = (clock - Date.parse(m.timestamp)) / HOUR;
      const views = Math.round(Math.min(ageH, 30) * (id === 'm1' ? 8 : 2));
      return { data: [
        { name: 'views', values: [{ value: views }] }, { name: 'reach', values: [{ value: views }] },
        { name: 'likes', values: [{ value: 1 }] }, { name: 'comments', values: [{ value: 2 }] },
        { name: 'shares', values: [{ value: 3 }] }, { name: 'saved', values: [{ value: 1 }] },
        { name: 'ig_reels_avg_watch_time', values: [{ value: 5500 }] },
      ] };
    },
  };
}

async function seeded() {
  const db = createTestD1('../schema.sql');
  const store = createD1Store(db);
  const ig = fakeIg();
  for (let h = 1; h <= 60; h++) {
    ig.setClock(T0 + h * HOUR);
    await collectStats({ ig, store, now: () => new Date(T0 + h * HOUR) });
  }
  const reel = (id, title, status, extra = {}) => store.createReel({
    id, status, title, caption: `caption for ${id}`, media_key: `${id}.mp4`, created_at: new Date(T0 + 3600e3).toISOString(), ...extra,
  });
  await reel('a', 'ריל H27 · Pick one · איזו קומה', 'published');
  await store.updateReel('a', { ig_media_id: 'm1' });
  await reel('b', 'ריל H28 · Pain point · יש ממ״ד?', 'published');
  await store.updateReel('b', { ig_media_id: 'm0' });
  await reel('c', 'ריל H29 · Pick one · הלוח בכניסה', 'rejected');
  await store.updateReel('c', { reject_reason: 'cringe', reject_note: 'too sweet' });
  // The typical reel needs 3 reels a day old; pad with two more media rows of known first-day views.
  await db.prepare("INSERT INTO ig_media (id, caption, media_type, product_type, timestamp, day1_views) VALUES ('x1','x','VIDEO','REELS','2026-11-17T00:00:00+0000', 40), ('x2','x','VIDEO','REELS','2026-11-16T00:00:00+0000', 40)").run();
  return { store, now: () => new Date(T0 + 60 * HOUR) };
}

test('formatOf reads v2 formats, v1 pillars and the two series', () => {
  assert.equal(formatOf('ריל H27 · Pick one · איזו קומה'), 'Pick one');
  assert.equal(formatOf('ריל H14 · שוכרים חכם · מצלמים'), 'שוכרים חכם');
  assert.equal(formatOf('ריל 54 · דגלים אדומים · #8'), 'Red flags');
  assert.equal(formatOf('ריל 56 · קבוצת הדירה · פרק 8'), 'Group chat');
  assert.equal(formatOf(null), null);
});

test('insights: per reel, per format and rejections with reasons', { skip }, async () => {
  const { store, now } = await seeded();
  const d = await insightsJson(store, { now });
  assert.equal(d.reels.length, 3);
  const pick = d.reels.find((r) => r.title.includes('H27'));
  assert.equal(pick.format, 'Pick one');
  assert.ok(pick.instagram.day1 > 0);
  assert.ok(pick.instagram.vs_typical > 1);
  assert.equal(pick.instagram.shares_per_1000 > 0, true);
  const f = d.formats.find((x) => x.format === 'Pick one');
  assert.equal(f.made, 2);
  assert.equal(f.rejected, 1);
  assert.deepEqual(d.rejections.map((r) => [r.reason, r.note]), [['cringe', 'too sweet']]);
  assert.equal(d.accounts.instagram.followers, 12);
});

test('the Sunday review names the best reel, the formats and the rejections', { skip }, async () => {
  const { store, now } = await seeded();
  const text = weeklyText(await insightsJson(store, { now }), { now });
  assert.match(text, /Best: H27/);
  assert.match(text, /Pick one IG/);
  assert.match(text, /Rejected: 1 \(cringe 1\)/);
  assert.match(text, /Followers: IG 12/);
});

test('the review goes out once, on Sunday from 09:30 Israel time', { skip }, async () => {
  const { store } = await seeded();
  const said = [];
  const say = async (t) => { said.push(t); };
  // Sunday 22.11.2026 07:00 UTC = 09:00 Israel: too early
  assert.equal(await maybeWeeklyReview({ store, say, now: () => new Date('2026-11-22T07:00:00Z') }), false);
  assert.equal(await maybeWeeklyReview({ store, say, now: () => new Date('2026-11-22T07:31:00Z') }), true);
  assert.equal(await maybeWeeklyReview({ store, say, now: () => new Date('2026-11-22T07:32:00Z') }), false);
  // Monday: never
  assert.equal(await maybeWeeklyReview({ store, say, now: () => new Date('2026-11-23T08:00:00Z') }), false);
  assert.equal(said.length, 1);
});
