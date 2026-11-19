// Cloudflare Worker entry point: HTTP API, media hosting, Telegram webhook, cron.

import { createD1Store } from './store.js';
import { createInstagram, refreshLongLivedToken, hostForToken, isRefreshableToken } from './instagram.js';
import { createTelegram } from './telegram.js';
import { createPipeline, getAccessToken, maybeRefreshToken, CAPTION_MAX } from './pipeline.js';
import { collectStats, maybeCollectStats, dashboardData } from './stats.js';
import { renderDashboard, renderLogin } from './dashboard.js';

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
  if (url.pathname === '/dashboard/refresh' && request.method === 'POST') {
    try {
      await collectStats({ ig, store });
      await store.kvSet('stats_last_error', '');
    } catch (err) {
      await store.kvSet('stats_last_error', err.message);
    }
    await store.kvSet('stats_last_attempt', JSON.stringify(Date.now()));
    return redirect('/dashboard');
  }
  if (url.pathname === '/dashboard' && request.method === 'GET') {
    return html(renderDashboard(await dashboardData(store), { timeZone: env.TIME_ZONE || 'Asia/Jerusalem' }));
  }
  return html('Not found', 404);
}

// Secrets pasted into a terminal often carry stray spaces or a newline.
const igToken = (env) => String(env.IG_ACCESS_TOKEN || '').trim();

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
  const pipeline = createPipeline({
    store,
    ig,
    tg,
    chatId: env.TELEGRAM_CHAT_ID,
    getBaseUrl,
    timeZone: env.TIME_ZONE || 'Asia/Jerusalem',
  });
  return { store, tg, ig, pipeline };
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
    const id = randomHex(6);
    await store.createReel({
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
    };
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

    if (url.pathname.startsWith('/api/')) return handleApi(request, env, url);
    if (url.pathname === '/dashboard' || url.pathname.startsWith('/dashboard/')) return handleDashboard(request, env, url);
    return new Response('homie-social is running', { status: 200 });
  },

  // Fires every minute (see wrangler.toml).
  async scheduled(event, env, ctx) {
    const { store, tg, ig, pipeline } = build(env);
    await pipeline.tick();
    // Hourly stats for the dashboard. Failures are recorded and shown there, never thrown.
    await maybeCollectStats({ ig, store }).catch((err) => console.error('stats failed:', err));
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
