// Cloudflare Worker entry point: HTTP API, media hosting, Telegram webhook, cron.

import { createD1Store } from './store.js';
import { createInstagram, refreshLongLivedToken, hostForToken, isRefreshableToken } from './instagram.js';
import { createTelegram } from './telegram.js';
import { createPipeline, getAccessToken, maybeRefreshToken, CAPTION_MAX } from './pipeline.js';
import { collectStats, maybeCollectStats } from './stats.js';
import { renderLogin, renderOverview, renderPlatform, renderReel, renderSystem } from './dashboard.js';
import { igData, tiktokData, findings, reelDetail, parseRange } from './insights.js';
import { healthChecks } from './health.js';
import { TERMS, PRIVACY } from './legal.js';
import { maybeCollectTikTokStats } from './tiktok-stats.js';
import {
  createTikTok, authorizeUrl, exchangeCode, refreshTikTokToken, tokenRecord,
  loadTikTokToken, saveTikTokToken, getTikTokToken,
} from './tiktok.js';

const MEDIA_KEY = /^[a-f0-9]{32}\.mp4$/;
const fetchFn = (...args) => fetch(...args); // keep fetch bound to the global scope

const json = (body, status = 200) =>
  new Response(JSON.stringify(body, null, 2), { status, headers: { 'content-type': 'application/json' } });

function randomHex(bytes) {
  const buf = crypto.getRandomValues(new Uint8Array(bytes));
  return [...buf].map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Compares hashes so the comparison time does not leak how much of the secret matched.
async function secretsMatch(given, expected) {
  if (!given || !expected) return false;
  const enc = new TextEncoder();
  const [a, b] = await Promise.all([
    crypto.subtle.digest('SHA-256', enc.encode(given)),
    crypto.subtle.digest('SHA-256', enc.encode(expected)),
  ]);
  const x = new Uint8Array(a);
  const y = new Uint8Array(b);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}

async function sha256Hex(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

// ---- dashboard auth: a cookie holding a hash of ADMIN_TOKEN (never the key itself) ----
const COOKIE = 'hs_admin';
const html = (body, status = 200, headers = {}) =>
  new Response(body, {
    status,
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', ...headers },
  });
const redirect = (to, headers = {}) => new Response(null, { status: 303, headers: { location: to, ...headers } });

async function dashboardAuthed(request, env) {
  if (!env.ADMIN_TOKEN) return false;
  const cookie = request.headers.get('cookie') || '';
  const m = cookie.match(new RegExp(`(?:^|;\\s*)${COOKIE}=([a-f0-9]{64})`));
  return Boolean(m) && secretsMatch(m[1], await sha256Hex(env.ADMIN_TOKEN));
}

async function handleDashboard(request, env, url) {
  if (url.pathname === '/dashboard/login' && request.method === 'POST') {
    const form = await request.formData().catch(() => null);
    const key = String(form?.get('key') || '').trim();
    if (!(await secretsMatch(key, env.ADMIN_TOKEN))) return html(renderLogin('That key is not right.'), 401);
    const value = await sha256Hex(env.ADMIN_TOKEN);
    return redirect('/dashboard', {
      'set-cookie': `${COOKIE}=${value}; Path=/dashboard; HttpOnly; Secure; SameSite=Strict; Max-Age=2592000`,
    });
  }
  if (url.pathname === '/dashboard/logout') {
    return redirect('/dashboard', { 'set-cookie': `${COOKIE}=; Path=/dashboard; HttpOnly; Secure; SameSite=Strict; Max-Age=0` });
  }
  if (!(await dashboardAuthed(request, env))) return html(renderLogin(), 401);

  const { store, ig } = build(env);
  // Starts the TikTok sign-in. The callback cannot rely on this cookie (TikTok redirects
  // cross-site, and the cookie is SameSite=Strict), so a one-time state value carries the trust.
  if (url.pathname === '/dashboard/tiktok/connect' && request.method === 'GET') {
    if (!tiktokConfigured(env)) {
      return html('Set the TIKTOK_CLIENT_KEY and TIKTOK_CLIENT_SECRET secrets first (see README).', 400);
    }
    const state = randomHex(16);
    await store.kvSet('tiktok_oauth_state', JSON.stringify({ state, at: Date.now() }));
    return redirect(authorizeUrl({ clientKey: env.TIKTOK_CLIENT_KEY.trim(), redirectUri: tiktokRedirectUri(env, url), state }));
  }
  const sendTo = url.pathname.match(/^\/dashboard\/tiktok\/send\/([a-f0-9]+)$/);
  if (sendTo && request.method === 'POST') {
    const { pipeline } = build(env);
    const result = await pipeline.sendToTikTok(sendTo[1]);
    await store.kvSet('dashboard_notice', result);
    return redirect('/dashboard/system#queue');
  }
  if (url.pathname === '/dashboard/refresh' && request.method === 'POST') {
    const form = await request.formData().catch(() => null);
    const back = String(form?.get('back') || '/dashboard');
    const { tt } = build(env);
    if (tt && (await loadTikTokToken(store))) await maybeCollectTikTokStats({ tt, store, force: true });
    try {
      const sum = await collectStats({ ig, store });
      await store.kvSet('stats_last_error', '');
      await store.kvSet('dashboard_notice', `Stats refreshed: ${sum.reels} Instagram reels measured${sum.failed ? `, ${sum.failed} failed` : ''}.`);
    } catch (err) {
      await store.kvSet('stats_last_error', err.message);
      await store.logEvent({ level: 'error', source: 'stats', message: `Manual refresh failed: ${err.message}` }).catch(() => {});
    }
    await store.kvSet('stats_last_attempt', JSON.stringify(Date.now()));
    // Only ever redirect back inside the dashboard.
    return redirect(/^\/dashboard(\/[a-z0-9/_-]*)?(\?range=[a-z0-9]+)?$/i.test(back) ? back : '/dashboard');
  }
  if (url.pathname === '/dashboard/system/clear-stuck' && request.method === 'POST') {
    const n = await store.abandonStuckUploads(new Date(Date.now() - 60 * 60 * 1000).toISOString(), new Date().toISOString());
    if (n) await store.logEvent({ level: 'info', source: 'system', message: `Cleared ${n} unfinished upload${n > 1 ? 's' : ''}` });
    await store.kvSet('dashboard_notice', n ? `Cleared ${n} unfinished upload${n > 1 ? 's' : ''}.` : 'Nothing to clear.');
    return redirect('/dashboard/system');
  }
  if (request.method !== 'GET') return html('Not found', 404);

  // ---- pages ----
  const timeZone = env.TIME_ZONE || 'Asia/Jerusalem';
  const ttRec = tiktokConfigured(env) ? await loadTikTokToken(store) : null;
  const tiktokEnabled = Boolean(ttRec);
  const notice = (await store.kvGet('dashboard_notice')) || '';
  if (notice) await store.kvSet('dashboard_notice', '');
  const { tg } = build(env);
  const healthOf = (live) =>
    healthChecks({ store, ig, tg, env: { ...env, tiktokConfigured: tiktokConfigured(env) }, tiktokRecord: ttRec, live });
  const common = async () => ({ health: (await healthOf(false)).overall, notice, tiktokEnabled, timeZone });

  if (url.pathname === '/dashboard') {
    const range = parseRange(url.searchParams.get('range'));
    const [igD, ttD] = await Promise.all([igData(store, { range }), ttRec ? tiktokData(store, { range }) : null]);
    return html(renderOverview({ ig: igD, tt: ttD, range, findings: findings({ ig: igD, tt: ttD, range }), ...(await common()) }));
  }
  if (url.pathname === '/dashboard/instagram') {
    const range = parseRange(url.searchParams.get('range'));
    return html(renderPlatform({ p: await igData(store, { range }), range, ...(await common()) }));
  }
  if (url.pathname === '/dashboard/tiktok') {
    const range = parseRange(url.searchParams.get('range'));
    const p = ttRec ? await tiktokData(store, { range }) : null;
    if (!p) return redirect(ttRec ? '/dashboard' : '/dashboard/system');
    return html(renderPlatform({ p, range, ...(await common()) }));
  }
  const reelPage = url.pathname.match(/^\/dashboard\/reel\/([0-9A-Za-z_]+)$/);
  if (reelPage) {
    const d = await reelDetail(store, reelPage[1]);
    if (!d) return html('That reel is not in the stats yet. <a href="/dashboard/instagram">Back</a>', 404);
    return html(renderReel({ d, ...(await common()) }));
  }
  if (url.pathname === '/dashboard/system') {
    const level = ['error', 'warning', 'good', 'info'].includes(url.searchParams.get('level')) ? url.searchParams.get('level') : null;
    const [h, events, queue] = await Promise.all([healthOf(true), store.listEvents(60, level), store.listReels(15)]);
    return html(
      renderSystem({
        h, events, level, queue, notice, tiktokEnabled, timeZone,
        tiktok: { configured: tiktokConfigured(env), connected: Boolean(ttRec), name: ttRec?.display_name || null },
      }),
    );
  }
  return html('Not found', 404);
}

// Secrets pasted into a terminal often carry stray spaces or a newline.
const igToken = (env) => String(env.IG_ACCESS_TOKEN || '').trim();

// ---- TikTok ----
const tiktokConfigured = (env) => Boolean(String(env.TIKTOK_CLIENT_KEY || '').trim() && String(env.TIKTOK_CLIENT_SECRET || '').trim());
// Must match the Redirect URI registered in the TikTok developer app exactly.
const tiktokRedirectUri = (env, url) => `${(env.PUBLIC_BASE_URL || url.origin).replace(/\/$/, '')}/tiktok/callback`;
const tiktokRefresher = (env) => (refreshToken) =>
  refreshTikTokToken(fetchFn, {
    clientKey: env.TIKTOK_CLIENT_KEY.trim(),
    clientSecret: env.TIKTOK_CLIENT_SECRET.trim(),
    refreshToken,
  });

// R2 access for the TikTok upload, which sends the file in byte ranges.
const r2Media = (env) => ({
  async size(key) {
    return (await env.MEDIA.head(key))?.size || 0;
  },
  async read(key, offset, length) {
    const obj = await env.MEDIA.get(key, { range: { offset, length } });
    if (!obj) throw new Error('the video file is missing from storage');
    return obj.arrayBuffer();
  },
});

async function handleTikTokCallback(env, url) {
  const store = createD1Store(env.DB);
  const fail = (msg) => html(`<p>TikTok was not connected: ${msg.replace(/[<>&]/g, '')}</p><p><a href="/dashboard">Back to the dashboard</a></p>`, 400);
  if (!tiktokConfigured(env)) return fail('the TikTok secrets are not set.');
  if (url.searchParams.get('error')) return fail(url.searchParams.get('error_description') || url.searchParams.get('error'));
  let saved = null;
  try {
    saved = JSON.parse((await store.kvGet('tiktok_oauth_state')) || 'null');
  } catch {
    saved = null;
  }
  await store.kvSet('tiktok_oauth_state', ''); // one use only
  const state = url.searchParams.get('state') || '';
  if (!saved || !(await secretsMatch(state, saved.state)) || Date.now() - saved.at > 10 * 60 * 1000) {
    return fail('the sign-in link expired or was not started from the dashboard. Start again from /dashboard/tiktok/connect.');
  }
  const code = url.searchParams.get('code');
  if (!code) return fail('TikTok did not send a code.');
  try {
    const data = await exchangeCode(fetchFn, {
      clientKey: env.TIKTOK_CLIENT_KEY.trim(),
      clientSecret: env.TIKTOK_CLIENT_SECRET.trim(),
      code,
      redirectUri: tiktokRedirectUri(env, url),
    });
    if (!String(data.scope || '').includes('video.upload')) {
      return fail('upload permission (video.upload) was not granted. Add it to the TikTok app and approve it on the sign-in screen.');
    }
    const rec = tokenRecord(data, Date.now());
    await saveTikTokToken(store, rec);
    let name = null;
    try {
      const tt = createTikTok({ fetchFn, getToken: async () => rec.access_token });
      name = (await tt.userInfo()).display_name || null;
    } catch (err) {
      console.error('tiktok user info failed:', err.message);
    }
    await saveTikTokToken(store, { ...rec, display_name: name });
    await store.logEvent({ level: 'good', source: 'tiktok', message: `TikTok connected${name ? ` as ${name}` : ''}` }).catch(() => {});
    if (env.TELEGRAM_CHAT_ID) {
      const tg = createTelegram({ fetchFn, botToken: env.TELEGRAM_BOT_TOKEN });
      await tg
        .send('sendMessage', { chat_id: env.TELEGRAM_CHAT_ID, text: `🎵 TikTok connected${name ? ` as ${name}` : ''}. Approved reels now also go to your TikTok drafts.` })
        .catch(() => {});
    }
    return html(`<p>TikTok connected${name ? ` as <b>${name.replace(/[<>&]/g, '')}</b>` : ''}.</p><p><a href="/dashboard">Back to the dashboard</a></p>`);
  } catch (err) {
    return fail(err.message);
  }
}

function build(env) {
  const store = createD1Store(env.DB);
  const tg = createTelegram({ fetchFn, botToken: env.TELEGRAM_BOT_TOKEN });
  const ig = createInstagram({
    fetchFn,
    getToken: () => getAccessToken(store, igToken(env)),
    version: env.IG_API_VERSION || 'v25.0',
    userId: env.IG_USER_ID || 'me',
    host: hostForToken(igToken(env)),
  });
  const getBaseUrl = async () => env.PUBLIC_BASE_URL || (await store.kvGet('base_url'));
  const tt = tiktokConfigured(env)
    ? createTikTok({ fetchFn, getToken: () => getTikTokToken({ store, refresh: tiktokRefresher(env) }) })
    : null;
  const pipeline = createPipeline({
    store,
    ig,
    tg,
    chatId: env.TELEGRAM_CHAT_ID,
    getBaseUrl,
    timeZone: env.TIME_ZONE || 'Asia/Jerusalem',
    tt,
    media: r2Media(env),
    tiktokConnected: async () => Boolean(await loadTikTokToken(store)),
  });
  return { store, tg, ig, tt, pipeline };
}

async function serveMedia(request, env, key) {
  if (!MEDIA_KEY.test(key)) return new Response('Not found', { status: 404 });
  if (request.method === 'HEAD') {
    const head = await env.MEDIA.head(key);
    if (!head) return new Response('Not found', { status: 404 });
    return new Response(null, {
      headers: { 'content-type': 'video/mp4', 'content-length': String(head.size), 'accept-ranges': 'bytes' },
    });
  }
  const wantsRange = request.headers.has('range');
  const obj = await env.MEDIA.get(key, wantsRange ? { range: request.headers } : undefined);
  if (!obj) return new Response('Not found', { status: 404 });
  const headers = new Headers({ 'content-type': 'video/mp4', 'accept-ranges': 'bytes', etag: obj.httpEtag });
  if (wantsRange && obj.range) {
    const offset = obj.range.offset ?? obj.size - obj.range.suffix;
    const length = obj.range.length ?? obj.size - offset;
    headers.set('content-range', `bytes ${offset}-${offset + length - 1}/${obj.size}`);
    headers.set('content-length', String(length));
    return new Response(obj.body, { status: 206, headers });
  }
  headers.set('content-length', String(obj.size));
  return new Response(obj.body, { headers });
}

// A reel's structure from its episode (see content/engine/beats.py), stored as JSON. Anything odd -> null.
function cleanBeats(b) {
  if (!b || typeof b !== 'object' || Array.isArray(b)) return null;
  const n = (v) => (typeof v === 'number' && Number.isFinite(v) && v >= 0 && v < 600 ? Math.round(v * 1000) / 1000 : null);
  const dur = n(b.dur);
  if (!dur) return null;
  const out = {
    dur,
    scenes: (Array.isArray(b.scenes) ? b.scenes : []).slice(0, 20)
      .filter((x) => Array.isArray(x) && n(x[1]) !== null && n(x[2]) !== null)
      .map((x) => [String(x[0]).slice(0, 20), n(x[1]), n(x[2])]),
    endcard: n(b.endcard),
    wordmarks: (Array.isArray(b.wordmarks) ? b.wordmarks : []).map(n).filter((x) => x !== null).slice(0, 10),
    stretch: n(b.stretch),
  };
  if (b.declared && typeof b.declared === 'object') {
    const d = { payoff: n(b.declared.payoff), outro: n(b.declared.outro) };
    if (d.payoff !== null || d.outro !== null) out.declared = d;
  }
  return JSON.stringify(out);
}

async function handleApi(request, env, url) {
  const auth = request.headers.get('authorization') || '';
  if (!(await secretsMatch(auth.replace(/^Bearer\s+/i, ''), env.ADMIN_TOKEN))) {
    return json({ error: 'unauthorized' }, 401);
  }
  const { store, pipeline } = build(env);

  // Step 1 of enqueueing: register the reel, get back where to upload the video.
  if (request.method === 'POST' && url.pathname === '/api/reels') {
    const body = await request.json().catch(() => null);
    const caption = typeof body?.caption === 'string' ? body.caption.trim() : '';
    if (!caption) return json({ error: 'caption is required' }, 400);
    if (caption.length > CAPTION_MAX) {
      return json({ error: `caption is ${caption.length} characters; Instagram allows ${CAPTION_MAX}` }, 400);
    }
    let scheduledAt = null;
    if (body.scheduled_at) {
      const d = new Date(body.scheduled_at);
      if (Number.isNaN(d.getTime())) return json({ error: 'scheduled_at is not a valid date' }, 400);
      scheduledAt = d.toISOString();
    }
    const beats = cleanBeats(body.beats);
    const id = randomHex(6);
    await store.createReel({
      beats,
      tiktok_status: body.tiktok === false ? 'off' : null,
      id,
      status: 'uploading',
      title: typeof body.title === 'string' ? body.title.slice(0, 200) : null,
      caption,
      media_key: `${randomHex(16)}.mp4`,
      scheduled_at: scheduledAt,
      created_at: new Date().toISOString(),
    });
    return json({ id, upload_path: `/api/reels/${id}/video` }, 201);
  }

  // Backfill of reel structure for reels sent before it was recorded: { items: [{ id?, title?, beats }] }.
  if (request.method === 'POST' && url.pathname === '/api/beats') {
    const body = await request.json().catch(() => null);
    const items = Array.isArray(body?.items) ? body.items.slice(0, 500) : null;
    if (!items) return json({ error: 'items is required' }, 400);
    let updated = 0;
    let skipped = 0;
    for (const it of items) {
      const beats = cleanBeats(it?.beats);
      const id = typeof it?.id === 'string' && /^[a-f0-9]{6,32}$/.test(it.id) ? it.id : null;
      const title = typeof it?.title === 'string' && it.title ? it.title.slice(0, 200) : null;
      if ((!id && !title) || !beats) { skipped++; continue; }
      updated += await store.setBeats({ id, title }, beats);
    }
    return json({ updated, skipped });
  }

  // Step 2: the raw mp4 as the request body. Triggers the Telegram approval message.
  const upload = url.pathname.match(/^\/api\/reels\/([a-f0-9]+)\/video$/);
  if (request.method === 'PUT' && upload) {
    const reel = await store.getReel(upload[1]);
    if (!reel) return json({ error: 'no such reel' }, 404);
    if (reel.status !== 'uploading') return json({ error: `reel is already ${reel.status}` }, 409);
    if (!request.body) return json({ error: 'empty body' }, 400);
    await env.MEDIA.put(reel.media_key, request.body, { httpMetadata: { contentType: 'video/mp4' } });
    if (!env.PUBLIC_BASE_URL) await store.kvSet('base_url', url.origin);
    try {
      await pipeline.submitForApproval(reel.id);
    } catch (err) {
      return json({ error: err.message }, 500);
    }
    return json({ id: reel.id, status: 'pending_approval' });
  }

  // Shows which kind of Instagram token is set (never the token itself) and whether Instagram accepts it.
  if (request.method === 'GET' && url.pathname === '/api/health') {
    const token = igToken(env);
    const kind = token.startsWith('EAA') ? 'business (EAA)' : token.startsWith('IG') ? 'instagram-login (IG)' : token ? 'unrecognised' : 'missing';
    const out = {
      token_kind: kind,
      token_length: token.length,
      raw_had_whitespace: String(env.IG_ACCESS_TOKEN || '') !== token,
      api_host: hostForToken(token),
      ig_user_id: env.IG_USER_ID || 'me',
      telegram_chat_set: Boolean(env.TELEGRAM_CHAT_ID),
      tiktok_secrets_set: tiktokConfigured(env),
    };
    const ttRec = await loadTikTokToken(createD1Store(env.DB));
    out.tiktok_connected = Boolean(ttRec);
    if (ttRec) {
      out.tiktok_account = ttRec.display_name || null;
      out.tiktok_signin_expires = new Date(ttRec.refresh_expires_at).toISOString();
    }
    try {
      const { ig } = build(env);
      out.instagram = await ig.whoAmI();
    } catch (err) {
      out.instagram_error = err.message;
    }
    return json(out);
  }

  if (request.method === 'GET' && url.pathname === '/api/reels') {
    return json({ reels: await store.listReels(100) });
  }
  return json({ error: 'not found' }, 404);
}

async function keepTikTokFresh(env, store, tg) {
  if (!(await loadTikTokToken(store))) return;
  try {
    await getTikTokToken({ store, refresh: tiktokRefresher(env) });
  } catch (err) {
    // Tell the owner at most once a day.
    const last = Number((await store.kvGet('tiktok_refresh_alert')) || 0);
    if (Date.now() - last < 24 * 60 * 60 * 1000) return;
    await store.kvSet('tiktok_refresh_alert', String(Date.now()));
    if (!env.TELEGRAM_CHAT_ID) return;
    await tg
      .send('sendMessage', {
        chat_id: env.TELEGRAM_CHAT_ID,
        text: `⚠️ Could not renew the TikTok sign-in: ${err.message}. If this keeps happening, open /dashboard/tiktok/connect and sign in again.`,
      })
      .catch(() => {});
  }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/media/') && (request.method === 'GET' || request.method === 'HEAD')) {
      return serveMedia(request, env, url.pathname.slice('/media/'.length));
    }

    if (url.pathname === '/telegram/webhook' && request.method === 'POST') {
      const given = request.headers.get('x-telegram-bot-api-secret-token');
      if (!(await secretsMatch(given, env.TELEGRAM_WEBHOOK_SECRET))) {
        return new Response('forbidden', { status: 403 });
      }
      const update = await request.json().catch(() => null);
      if (update) {
        const { pipeline } = build(env);
        // Answer Telegram immediately; do the work after, so it never retries the update.
        ctx.waitUntil(
          pipeline.handleTelegramUpdate(update).catch((err) => console.error('telegram update failed:', err)),
        );
      }
      return new Response('ok');
    }

    if (url.pathname === '/terms') return html(TERMS);
    if (url.pathname === '/privacy') return html(PRIVACY);
    if (url.pathname === '/tiktok/callback' && request.method === 'GET') return handleTikTokCallback(env, url);
    if (url.pathname.startsWith('/api/')) return handleApi(request, env, url);
    if (url.pathname === '/dashboard' || url.pathname.startsWith('/dashboard/')) return handleDashboard(request, env, url);
    return new Response('homie-social is running', { status: 200 });
  },

  // Fires every minute (see wrangler.toml).
  async scheduled(event, env, ctx) {
    const { store, tg, ig, pipeline } = build(env);
    // Heartbeat for the System page: proves the every-minute job is running.
    await store.kvSet('cron_heartbeat', new Date().toISOString()).catch(() => {});
    await pipeline.tick();
    // Hourly stats for the dashboard. Failures are recorded and shown there, never thrown.
    await maybeCollectStats({ ig, store }).catch((err) => console.error('stats failed:', err));
    // Keeps the 24-hour TikTok token fresh, which also rolls the yearly refresh token forward.
    if (tiktokConfigured(env)) await keepTikTokFresh(env, store, tg);
    // Hourly TikTok stats, only once TikTok is connected.
    const { tt } = build(env);
    if (tt && (await loadTikTokToken(store))) {
      await maybeCollectTikTokStats({ tt, store }).catch((err) => console.error('tiktok stats failed:', err));
    }
    // Business (system-user) tokens don't expire and have no refresh endpoint.
    if (!isRefreshableToken(igToken(env))) return;
    await maybeRefreshToken({
      store,
      seedToken: igToken(env),
      refresh: (token) => refreshLongLivedToken(fetchFn, token),
      onError: async (err) => {
        if (!env.TELEGRAM_CHAT_ID) return;
        await tg
          .send('sendMessage', {
            chat_id: env.TELEGRAM_CHAT_ID,
            text: `⚠️ Could not renew the Instagram token: ${err.message}. If this keeps happening, generate a new one and set IG_ACCESS_TOKEN again.`,
          })
          .catch(() => {});
      },
    });
  },
};
