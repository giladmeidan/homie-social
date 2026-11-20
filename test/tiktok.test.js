import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createPipeline } from '../src/pipeline.js';
import { planChunks, chunkRanges, getTikTokToken, createTikTok, authorizeUrl } from '../src/tiktok.js';
import { createMemoryStore } from './memory-store.js';

const CHAT = '111';
const MB = 1024 * 1024;

function setup({ ttOverrides = {}, connected = true, size = 3 * MB } = {}) {
  const store = createMemoryStore();
  const sent = [];
  const ttCalls = [];
  let clock = new Date('2026-11-20T10:00:00Z');
  let ttStatus = 'SEND_TO_USER_INBOX';
  const tg = {
    async send(method, payload) {
      sent.push({ method, payload });
      return { message_id: sent.length };
    },
  };
  const ig = {
    async createReelContainer() { return { id: 'c1' }; },
    async containerStatus() { return { status_code: 'FINISHED' }; },
    async publish() { return { id: 'm1' }; },
    async permalink() { return { permalink: 'https://instagram.com/reel/x' }; },
  };
  const tt = {
    async initInboxUpload(n) {
      ttCalls.push(['init', n]);
      return { publish_id: 'p1', upload_url: 'https://up.example/u' };
    },
    async uploadChunk(url, bytes, start, end, total) {
      ttCalls.push(['chunk', start, end, total]);
    },
    async status(id) {
      ttCalls.push(['status', id]);
      return { status: ttStatus };
    },
    ...ttOverrides,
  };
  const media = {
    async size() { return size; },
    async read(key, offset, length) { return new ArrayBuffer(length); },
  };
  const pipeline = createPipeline({
    store, ig, tg, tt, media,
    chatId: CHAT,
    getBaseUrl: async () => 'https://w.example',
    now: () => clock,
    tiktokConnected: async () => connected,
  });
  const addReel = async (fields = {}) => {
    await store.createReel({
      id: 'r1', status: 'uploading', title: 'ריל 44', caption: 'שלום #homie', media_key: 'abc.mp4',
      scheduled_at: null, created_at: clock.toISOString(), ...fields,
    });
    await pipeline.submitForApproval('r1');
  };
  const press = (action) =>
    pipeline.handleTelegramUpdate({
      callback_query: { id: 'q', data: `${action}:r1`, message: { chat: { id: Number(CHAT) } } },
    });
  return {
    store, sent, ttCalls, pipeline, addReel, press,
    advance: (ms) => { clock = new Date(clock.getTime() + ms); },
    setStatus: (s) => { ttStatus = s; },
    reel: () => store.reels.get('r1'),
  };
}

test('nothing goes to TikTok before approval', async () => {
  const t = setup();
  await t.addReel();
  await t.pipeline.tick();
  assert.equal(t.ttCalls.length, 0);
  assert.equal(t.reel().tiktok_status ?? null, null);
});

test('approve queues TikTok; the next tick uploads; then the caption is sent for pasting', async () => {
  const t = setup();
  await t.addReel();
  await t.press('approve');
  assert.equal(t.reel().tiktok_status, 'queued');
  assert.ok(t.sent.some((m) => String(m.payload.text).includes('TikTok draft follows')));
  await t.pipeline.tick(); // Instagram publishes, TikTok uploads
  assert.equal(t.reel().status, 'published');
  assert.equal(t.reel().tiktok_status, 'processing');
  assert.deepEqual(t.ttCalls.slice(0, 2), [['init', 3 * MB], ['chunk', 0, 3 * MB - 1, 3 * MB]]);
  await t.pipeline.tick();
  assert.equal(t.reel().tiktok_status, 'in_inbox');
  assert.ok(t.sent.at(-2).payload.text.includes('TikTok inbox'));
  assert.equal(t.sent.at(-1).payload.text, 'שלום #homie');
});

test('repeated ticks upload to TikTok exactly once', async () => {
  const t = setup();
  await t.addReel();
  await t.press('approve');
  await Promise.all([t.pipeline.tick(), t.pipeline.tick()]);
  await t.pipeline.tick();
  await t.pipeline.tick();
  assert.equal(t.ttCalls.filter((c) => c[0] === 'init').length, 1);
  assert.equal(t.sent.filter((m) => String(m.payload.text).includes('TikTok inbox')).length, 1);
});

test('reject sends nothing to TikTok', async () => {
  const t = setup();
  await t.addReel();
  await t.press('reject');
  await t.pipeline.tick();
  assert.equal(t.ttCalls.length, 0);
});

test('a reel enqueued with --no-tiktok stays off TikTok', async () => {
  const t = setup();
  await t.addReel({ tiktok_status: 'off' });
  await t.press('approve');
  await t.pipeline.tick();
  assert.equal(t.reel().tiktok_status, 'off');
  assert.equal(t.ttCalls.length, 0);
  assert.equal(t.reel().status, 'published');
});

test('TikTok not connected: skipped with a note, Instagram still publishes', async () => {
  const t = setup({ connected: false });
  await t.addReel();
  await t.press('approve');
  await t.pipeline.tick();
  assert.equal(t.reel().tiktok_status, 'skipped');
  assert.ok(t.sent.some((m) => String(m.payload.text).includes('TikTok skipped')));
  assert.equal(t.reel().status, 'published');
});

test('a TikTok failure does not touch Instagram, and TikTok Retry recovers', async () => {
  let broken = true;
  const t = setup({
    ttOverrides: {
      async initInboxUpload() {
        if (broken) throw new Error('TikTok allows only 5 drafts');
        return { publish_id: 'p2', upload_url: 'https://up.example/u' };
      },
    },
  });
  await t.addReel();
  await t.press('approve');
  await t.pipeline.tick();
  assert.equal(t.reel().status, 'published');
  assert.equal(t.reel().tiktok_status, 'failed');
  const failMsg = t.sent.at(-1).payload;
  assert.ok(failMsg.text.includes('5 drafts'));
  assert.equal(failMsg.reply_markup.inline_keyboard[0][0].callback_data, 'ttretry:r1');
  broken = false;
  await t.press('ttretry');
  assert.equal(t.reel().tiktok_status, 'processing');
  await t.pipeline.tick();
  assert.equal(t.reel().tiktok_status, 'in_inbox');
});

test('TikTok processing FAILED is reported with the reason', async () => {
  const t = setup();
  t.setStatus('FAILED');
  await t.addReel();
  await t.press('approve');
  await t.pipeline.tick();
  await t.pipeline.tick();
  assert.equal(t.reel().tiktok_status, 'failed');
  assert.ok(t.reel().tiktok_error.includes('could not process'));
});

test('a scheduled reel goes to TikTok at its time, not at approval', async () => {
  const t = setup();
  await t.addReel({ scheduled_at: '2026-11-20T12:00:00.000Z' });
  await t.press('approve');
  await t.pipeline.tick();
  assert.equal(t.reel().tiktok_status, 'queued');
  assert.equal(t.ttCalls.length, 0);
  t.advance(2 * 60 * 60 * 1000 + 1000);
  await t.pipeline.tick();
  assert.equal(t.reel().tiktok_status, 'processing');
});

test('an interrupted TikTok upload is flagged, not silently repeated', async () => {
  const t = setup();
  await t.addReel();
  await t.press('approve');
  t.store.reels.get('r1').tiktok_status = 'uploading';
  t.store.reels.get('r1').tiktok_updated_at = '2026-11-20T10:00:00.000Z';
  t.advance(16 * 60 * 1000);
  await t.pipeline.tick();
  assert.equal(t.reel().tiktok_status, 'failed');
  assert.ok(t.reel().tiktok_error.includes('inbox'));
});

test('/queue shows the TikTok state', async () => {
  const t = setup();
  await t.addReel();
  await t.press('approve');
  await t.pipeline.handleTelegramUpdate({ message: { text: '/queue', chat: { id: Number(CHAT) } } });
  assert.ok(t.sent.at(-1).payload.text.includes('tiktok queued'));
});

test('large files are split with the remainder in the last chunk', () => {
  assert.deepEqual(planChunks(5 * MB), { chunkSize: 5 * MB, count: 1 });
  const size = 70 * MB + 123;
  const r = chunkRanges(size);
  assert.equal(r.length, 7);
  assert.equal(r[0].start, 0);
  assert.equal(r.at(-1).end, size - 1);
  for (let i = 1; i < r.length; i++) assert.equal(r[i].start, r[i - 1].end + 1);
});

test('token: used as is while fresh, refreshed when close to expiry', async () => {
  const store = createMemoryStore();
  let now = 1_000_000;
  const refreshCalls = [];
  const refresh = async (rt) => {
    refreshCalls.push(rt);
    return { access_token: 'a2', refresh_token: 'r2', expires_in: 86400, refresh_expires_in: 31536000, open_id: 'o' };
  };
  await assert.rejects(getTikTokToken({ store, refresh, now: () => now }), /not connected/);
  await store.kvSet('tiktok_token', JSON.stringify({
    access_token: 'a1', refresh_token: 'r1', expires_at: now + 5 * 60 * 60 * 1000, display_name: 'homie',
  }));
  assert.equal(await getTikTokToken({ store, refresh, now: () => now }), 'a1');
  now += 4.5 * 60 * 60 * 1000; // 30 minutes left
  assert.equal(await getTikTokToken({ store, refresh, now: () => now }), 'a2');
  assert.deepEqual(refreshCalls, ['r1']);
  const rec = JSON.parse(await store.kvGet('tiktok_token'));
  assert.equal(rec.refresh_token, 'r2');
  assert.equal(rec.display_name, 'homie');
});

test('client: init sends FILE_UPLOAD sizes; API errors become readable messages', async () => {
  const calls = [];
  const fetchFn = async (url, init) => {
    calls.push({ url, init });
    if (url.includes('init')) {
      return new Response(JSON.stringify({ data: { publish_id: 'p', upload_url: 'u' }, error: { code: 'ok' } }));
    }
    return new Response(JSON.stringify({ error: { code: 'spam_risk_too_many_pending_share', message: 'x' } }), { status: 403 });
  };
  const tt = createTikTok({ fetchFn, getToken: async () => 'tok' });
  const r = await tt.initInboxUpload(1000);
  assert.equal(r.publish_id, 'p');
  const body = JSON.parse(calls[0].init.body);
  assert.deepEqual(body.source_info, { source: 'FILE_UPLOAD', video_size: 1000, chunk_size: 1000, total_chunk_count: 1 });
  assert.equal(calls[0].init.headers.authorization, 'Bearer tok');
  await assert.rejects(tt.status('p'), /5 drafts/);
});

test('authorize URL asks for upload permission and carries the state', () => {
  const u = new URL(authorizeUrl({ clientKey: 'ck', redirectUri: 'https://w.example/tiktok/callback', state: 's1' }));
  assert.equal(u.searchParams.get('scope'), 'user.info.basic,video.upload,user.info.stats,video.list');
  assert.equal(u.searchParams.get('state'), 's1');
  assert.equal(u.searchParams.get('redirect_uri'), 'https://w.example/tiktok/callback');
});

test('a published reel can be sent to TikTok on its own, Instagram untouched', async () => {
  const t = setup();
  await t.addReel({ tiktok_status: 'off' });
  await t.press('approve');
  await t.pipeline.tick();
  assert.equal(t.reel().status, 'published');
  assert.equal(t.ttCalls.length, 0);
  assert.equal(await t.pipeline.sendToTikTok('r1'), 'Queued for TikTok');
  assert.equal(await t.pipeline.sendToTikTok('r1'), 'Already on its way to TikTok (queued)');
  await t.pipeline.tick();
  await t.pipeline.tick();
  assert.equal(t.reel().tiktok_status, 'in_inbox');
  assert.equal(t.reel().status, 'published');
  assert.equal(t.ttCalls.filter((c) => c[0] === 'init').length, 1);
});

test('only published reels can be sent to TikTok from the dashboard', async () => {
  const t = setup();
  await t.addReel();
  assert.equal(await t.pipeline.sendToTikTok('r1'), 'Only published reels can be sent this way');
});
