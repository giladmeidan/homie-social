import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createPipeline, getAccessToken, maybeRefreshToken } from '../src/pipeline.js';
import { createInstagram, hostForToken, isRefreshableToken } from '../src/instagram.js';
import { findCaption } from '../scripts/lib.mjs';
import { createMemoryStore } from './memory-store.js';

const CHAT = '111';

function setup({ igOverrides = {} } = {}) {
  const store = createMemoryStore();
  const sent = [];
  const igCalls = [];
  let clock = new Date('2026-11-20T10:00:00Z');
  const tg = {
    async send(method, payload) {
      sent.push({ method, payload });
      return { message_id: sent.length };
    },
  };
  const ig = {
    async createReelContainer(args) {
      igCalls.push(['container', args]);
      return { id: 'c1' };
    },
    async containerStatus() {
      return { status_code: 'FINISHED' };
    },
    async publish(id) {
      igCalls.push(['publish', id]);
      return { id: 'm1' };
    },
    async permalink() {
      return { permalink: 'https://instagram.com/reel/x' };
    },
    ...igOverrides,
  };
  const pipeline = createPipeline({
    store,
    ig,
    tg,
    chatId: CHAT,
    getBaseUrl: async () => 'https://w.example',
    now: () => clock,
  });
  const addReel = async (fields = {}) => {
    await store.createReel({
      id: 'r1',
      status: 'uploading',
      title: 'ריל 44',
      caption: 'שלום',
      media_key: 'abc.mp4',
      scheduled_at: null,
      created_at: clock.toISOString(),
      ...fields,
    });
    await pipeline.submitForApproval('r1');
  };
  const press = (action, chatId = CHAT) =>
    pipeline.handleTelegramUpdate({
      callback_query: { id: 'q', data: `${action}:r1`, message: { chat: { id: Number(chatId) } } },
    });
  const type = (text, chatId = CHAT) =>
    pipeline.handleTelegramUpdate({ message: { text, chat: { id: Number(chatId) } } });
  return {
    store, sent, igCalls, pipeline, addReel, press, type,
    advance: (ms) => { clock = new Date(clock.getTime() + ms); },
    status: () => store.reels.get('r1').status,
  };
}

test('upload sends the video and the caption with buttons', async () => {
  const t = setup();
  await t.addReel();
  assert.equal(t.status(), 'pending_approval');
  assert.equal(t.sent[0].method, 'sendVideo');
  assert.equal(t.sent[0].payload.video, 'https://w.example/media/abc.mp4');
  assert.equal(t.sent[1].payload.text, 'שלום');
  assert.ok(t.sent[1].payload.reply_markup.inline_keyboard.length);
});

test('nothing reaches Instagram before approval', async () => {
  const t = setup();
  await t.addReel();
  await t.pipeline.tick();
  assert.equal(t.igCalls.length, 0);
  assert.equal(t.status(), 'pending_approval');
});

test('approve publishes: container, then publish on the next tick', async () => {
  const t = setup();
  await t.addReel();
  await t.press('approve');
  assert.equal(t.status(), 'processing');
  assert.deepEqual(t.igCalls[0], ['container', { videoUrl: 'https://w.example/media/abc.mp4', caption: 'שלום' }]);
  await t.pipeline.tick();
  assert.equal(t.status(), 'published');
  assert.equal(t.store.reels.get('r1').permalink, 'https://instagram.com/reel/x');
  assert.ok(t.sent.at(-1).payload.text.includes('Published'));
});

test('double approve and repeated ticks publish exactly once', async () => {
  const t = setup();
  await t.addReel();
  await Promise.all([t.press('approve'), t.press('approve')]);
  await Promise.all([t.pipeline.tick(), t.pipeline.tick()]);
  await t.pipeline.tick();
  assert.equal(t.igCalls.filter((c) => c[0] === 'container').length, 1);
  assert.equal(t.igCalls.filter((c) => c[0] === 'publish').length, 1);
});

test('reject posts nothing and cannot be approved afterwards', async () => {
  const t = setup();
  await t.addReel();
  await t.press('reject');
  await t.press('approve');
  await t.pipeline.tick();
  assert.equal(t.status(), 'rejected');
  assert.equal(t.igCalls.length, 0);
});

test('buttons from another chat are ignored', async () => {
  const t = setup();
  await t.addReel();
  await t.press('approve', '999');
  assert.equal(t.status(), 'pending_approval');
});

test('a scheduled reel waits for its time after approval', async () => {
  const t = setup();
  await t.addReel({ scheduled_at: '2026-11-20T12:00:00.000Z' });
  await t.press('approve');
  await t.pipeline.tick();
  assert.equal(t.status(), 'approved');
  assert.equal(t.igCalls.length, 0);
  t.advance(2 * 60 * 60 * 1000 + 1000);
  await t.pipeline.tick();
  assert.equal(t.status(), 'processing');
});

test('edit caption replaces the text and asks for approval again', async () => {
  const t = setup();
  await t.addReel();
  await t.press('edit');
  await t.type('קפשן חדש');
  assert.equal(t.store.reels.get('r1').caption, 'קפשן חדש');
  assert.equal(t.status(), 'pending_approval');
  assert.equal(t.sent.at(-1).payload.text, 'קפשן חדש');
  await t.press('approve');
  assert.equal(t.igCalls[0][1].caption, 'קפשן חדש');
});

test('a normal message is not taken as a caption unless edit was pressed', async () => {
  const t = setup();
  await t.addReel();
  await t.type('סתם הודעה');
  assert.equal(t.store.reels.get('r1').caption, 'שלום');
});

test('Instagram processing error marks the reel failed, retry recovers', async () => {
  let broken = true;
  const t = setup({
    igOverrides: {
      async containerStatus() {
        return broken ? { status_code: 'ERROR', status: 'bad codec' } : { status_code: 'FINISHED' };
      },
    },
  });
  await t.addReel();
  await t.press('approve');
  await t.pipeline.tick();
  assert.equal(t.status(), 'failed');
  assert.ok(t.sent.at(-1).payload.text.includes('bad codec'));
  broken = false;
  await t.press('retry');
  await t.pipeline.tick();
  assert.equal(t.status(), 'published');
});

test('container creation failure is reported, not thrown', async () => {
  const t = setup({
    igOverrides: {
      async createReelContainer() {
        throw new Error('token expired');
      },
    },
  });
  await t.addReel();
  await t.press('approve');
  assert.equal(t.status(), 'failed');
  assert.ok(t.store.reels.get('r1').error.includes('token expired'));
});

test('a reel stuck mid-publish is flagged instead of silently retried', async () => {
  const t = setup();
  await t.addReel();
  await t.press('approve');
  t.store.reels.get('r1').status = 'publishing';
  t.advance(11 * 60 * 1000);
  await t.pipeline.tick();
  assert.equal(t.status(), 'failed');
  assert.equal(t.igCalls.filter((c) => c[0] === 'publish').length, 0);
});

test('processing that never finishes times out', async () => {
  const t = setup({ igOverrides: { async containerStatus() { return { status_code: 'IN_PROGRESS' }; } } });
  await t.addReel();
  await t.press('approve');
  await t.pipeline.tick();
  assert.equal(t.status(), 'processing');
  t.advance(31 * 60 * 1000);
  await t.pipeline.tick();
  assert.equal(t.status(), 'failed');
});

test('token: refreshes after a week and a new secret overrides the stored one', async () => {
  const store = createMemoryStore();
  let clock = new Date('2026-11-20T00:00:00Z');
  let refreshes = 0;
  const run = (seed) =>
    maybeRefreshToken({
      store,
      seedToken: seed,
      now: () => clock,
      refresh: async () => ({ access_token: `new${++refreshes}`, expires_in: 5184000 }),
    });
  assert.equal(await run('seed'), 'tracked');
  assert.equal(await run('seed'), 'fresh');
  clock = new Date('2026-11-28T00:00:00Z');
  assert.equal(await run('seed'), 'refreshed');
  assert.equal(await getAccessToken(store, 'seed'), 'new1');
  assert.equal(await run('seed'), 'fresh');
  assert.equal(await getAccessToken(store, 'other-seed'), 'other-seed');
});

test('token: a failed refresh is retried only after a day', async () => {
  const store = createMemoryStore();
  let clock = new Date('2026-11-20T00:00:00Z');
  let errors = 0;
  const run = () =>
    maybeRefreshToken({
      store,
      seedToken: 'seed',
      now: () => clock,
      refresh: async () => { throw new Error('nope'); },
      onError: async () => { errors++; },
    });
  await run();
  clock = new Date('2026-11-28T00:00:00Z');
  assert.equal(await run(), 'error');
  assert.equal(await run(), 'waiting');
  assert.equal(errors, 1);
  assert.equal(await getAccessToken(store, 'seed'), 'seed');
});

test('instagram client sends the documented calls and surfaces API errors', async () => {
  const calls = [];
  const fetchFn = async (url, init) => {
    calls.push({ url, method: init.method, body: init.body ? Object.fromEntries(init.body) : null });
    if (url.includes('media_publish')) {
      return { ok: false, status: 400, json: async () => ({ error: { message: 'rate limited' } }) };
    }
    return { ok: true, status: 200, json: async () => ({ id: 'c9' }) };
  };
  const ig = createInstagram({ fetchFn, getToken: async () => 'TOK' });
  await ig.createReelContainer({ videoUrl: 'https://v/x.mp4', caption: 'hi' });
  assert.equal(calls[0].url, 'https://graph.instagram.com/v25.0/me/media');
  assert.deepEqual(calls[0].body, {
    media_type: 'REELS', video_url: 'https://v/x.mp4', caption: 'hi', share_to_feed: 'true', access_token: 'TOK',
  });
  await ig.containerStatus('c9');
  assert.ok(calls[1].url.startsWith('https://graph.instagram.com/v25.0/c9?fields=status_code'));
  await assert.rejects(() => ig.publish('c9'), /rate limited/);
});

test('business tokens go to graph.facebook.com with the account id and are not refreshed', async () => {
  assert.equal(hostForToken('EAAxyz'), 'graph.facebook.com');
  assert.equal(hostForToken('IGAAxyz'), 'graph.instagram.com');
  assert.equal(isRefreshableToken('EAAxyz'), false);
  assert.equal(isRefreshableToken('IGAAxyz'), true);
  const urls = [];
  const fetchFn = async (url) => {
    urls.push(url);
    return { ok: true, status: 200, json: async () => ({ id: 'c1' }) };
  };
  const ig = createInstagram({ fetchFn, getToken: async () => 'EAAx', host: hostForToken('EAAx'), userId: '17841412250945873' });
  await ig.createReelContainer({ videoUrl: 'https://v/x.mp4', caption: 'hi' });
  await ig.publish('c1');
  assert.equal(urls[0], 'https://graph.facebook.com/v25.0/17841412250945873/media');
  assert.equal(urls[1], 'https://graph.facebook.com/v25.0/17841412250945873/media_publish');
});

test('findCaption reads one entry from the captions log', () => {
  const md = [
    '# homie', 'intro', '',
    '## ריל 44 · קבוצת הדירה · פרק 5', '', 'שורה א', '', '#homie #הומי', '',
    '## ריל 4 · משהו', '', 'אחר', '',
  ].join('\n');
  assert.deepEqual(findCaption(md, 44), { title: 'ריל 44 · קבוצת הדירה · פרק 5', caption: 'שורה א\n\n#homie #הומי' });
  assert.equal(findCaption(md, 4).caption, 'אחר');
  assert.equal(findCaption(md, 7), null);
});

test('reject asks why; the reason and a note are saved with the reel', async () => {
  const t = setup();
  await t.addReel();
  await t.press('reject');
  const ask = t.sent.filter((m) => m.method === 'sendMessage').at(-1).payload;
  const codes = ask.reply_markup.inline_keyboard.flat().map((b) => b.callback_data);
  assert.ok(codes.includes('why:r1:cringe'));
  assert.ok(codes.every((c) => Buffer.byteLength(c) <= 64));
  await t.pipeline.handleTelegramUpdate({ callback_query: { id: 'q', data: 'why:r1:cringe', message: { chat: { id: Number(CHAT) } } } });
  assert.equal(t.store.reels.get('r1').reject_reason, 'cringe');
  await t.type('too sweet, nobody talks like that');
  assert.equal(t.store.reels.get('r1').reject_note, 'too sweet, nobody talks like that');
  // The next message is not taken as a note.
  await t.type('hello');
  assert.equal(t.store.reels.get('r1').reject_note, 'too sweet, nobody talks like that');
});

test('a reason for a reel that was not rejected is ignored', async () => {
  const t = setup();
  await t.addReel();
  await t.pipeline.handleTelegramUpdate({ callback_query: { id: 'q', data: 'why:r1:boring', message: { chat: { id: Number(CHAT) } } } });
  assert.equal(t.store.reels.get('r1').reject_reason, undefined);
  assert.equal(t.status(), 'pending_approval');
});

test('/skip ends the note prompt without saving anything', async () => {
  const t = setup();
  await t.addReel();
  await t.press('reject');
  await t.pipeline.handleTelegramUpdate({ callback_query: { id: 'q', data: 'why:r1:target', message: { chat: { id: Number(CHAT) } } } });
  await t.type('/skip');
  await t.type('this is not a note');
  assert.equal(t.store.reels.get('r1').reject_reason, 'target');
  assert.equal(t.store.reels.get('r1').reject_note, undefined);
});
