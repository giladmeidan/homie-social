// Thin client for TikTok's Content Posting API in "upload" mode: the video lands in
// the account's TikTok inbox as a draft and is posted from the TikTok app.
// Upload mode cannot carry a caption; the caption is sent to Telegram for pasting.
//
// Direct (public) posting needs an app audit that TikTok does not grant to tools
// that post to your own account, so this is the free path.

const API = 'https://open.tiktokapis.com/v2';
// user.info.stats + video.list feed the dashboard; posting needs only the first two.
export const TIKTOK_SCOPES = 'user.info.basic,video.upload,user.info.stats,video.list';

const MB = 1024 * 1024;
const SINGLE_CHUNK_MAX = 64 * MB; // files up to this size go up in one request
const CHUNK = 10 * MB; // otherwise 10 MB chunks; the last one takes the remainder

export class TikTokError extends Error {
  constructor(message, code, status) {
    super(message);
    this.name = 'TikTokError';
    this.code = code;
    this.status = status;
  }
}

// Plain-language versions of the errors you can actually do something about.
const FRIENDLY = {
  spam_risk_too_many_pending_share:
    'TikTok allows only 5 drafts waiting in the inbox per 24 hours. Post or delete the waiting ones in the TikTok app, then tap Retry',
  access_token_invalid: 'the TikTok sign-in expired. Open /dashboard/tiktok/connect to sign in again',
  scope_not_authorized: 'the TikTok app was not given upload permission. Sign in again at /dashboard/tiktok/connect',
  rate_limit_exceeded: 'TikTok rate limit hit (6 requests a minute). Tap Retry in a minute',
  spam_risk_user_banned_from_posting: 'TikTok has blocked this account from posting',
};

async function readJson(res) {
  try {
    return await res.json();
  } catch {
    return {};
  }
}

function check(res, data) {
  const code = data?.error?.code;
  if (!res.ok || (code && code !== 'ok')) {
    const c = code || `http_${res.status}`;
    throw new TikTokError(FRIENDLY[c] || data?.error?.message || `TikTok HTTP ${res.status}`, c, res.status);
  }
  return data.data || {};
}

// How to split a file of `size` bytes. TikTok wants floor(size / chunk) chunks,
// with the remainder folded into the last one.
export function planChunks(size) {
  if (size <= SINGLE_CHUNK_MAX) return { chunkSize: size, count: 1 };
  return { chunkSize: CHUNK, count: Math.floor(size / CHUNK) };
}

export function chunkRanges(size) {
  const { chunkSize, count } = planChunks(size);
  const ranges = [];
  for (let i = 0; i < count; i++) {
    const start = i * chunkSize;
    const end = i === count - 1 ? size - 1 : start + chunkSize - 1;
    ranges.push({ start, end });
  }
  return ranges;
}

export function createTikTok({ fetchFn, getToken }) {
  const post = async (path, body) => {
    const res = await fetchFn(`${API}/${path}`, {
      method: 'POST',
      headers: { authorization: `Bearer ${await getToken()}`, 'content-type': 'application/json; charset=UTF-8' },
      body: JSON.stringify(body),
    });
    return check(res, await readJson(res));
  };

  return {
    // Step 1: reserve an upload. Returns { publish_id, upload_url } (the URL lasts an hour).
    initInboxUpload: (size) => {
      const { chunkSize, count } = planChunks(size);
      return post('post/publish/inbox/video/init/', {
        source_info: { source: 'FILE_UPLOAD', video_size: size, chunk_size: chunkSize, total_chunk_count: count },
      });
    },
    // Step 2: send one chunk of the file.
    async uploadChunk(uploadUrl, bytes, start, end, total) {
      const res = await fetchFn(uploadUrl, {
        method: 'PUT',
        headers: {
          'content-type': 'video/mp4',
          'content-length': String(end - start + 1),
          'content-range': `bytes ${start}-${end}/${total}`,
        },
        body: bytes,
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new TikTokError(`TikTok refused the video chunk (HTTP ${res.status}) ${text.slice(0, 200)}`.trim(), 'upload_failed', res.status);
      }
    },
    // status: PROCESSING_UPLOAD | PROCESSING_DOWNLOAD | SEND_TO_USER_INBOX | PUBLISH_COMPLETE | FAILED
    status: (publishId) => post('post/publish/status/fetch/', { publish_id: publishId }),
    // Needs user.info.stats for the counts.
    async accountStats() {
      const fields = 'open_id,display_name,follower_count,following_count,likes_count,video_count';
      const res = await fetchFn(`${API}/user/info/?fields=${fields}`, {
        headers: { authorization: `Bearer ${await getToken()}` },
      });
      return check(res, await readJson(res)).user || {};
    },
    // Needs video.list. Public posts only, newest first; returns { videos, cursor, has_more }.
    async listVideos(cursor) {
      const fields = 'id,title,video_description,create_time,share_url,duration,view_count,like_count,comment_count,share_count';
      const res = await fetchFn(`${API}/video/list/?fields=${fields}`, {
        method: 'POST',
        headers: { authorization: `Bearer ${await getToken()}`, 'content-type': 'application/json; charset=UTF-8' },
        body: JSON.stringify(cursor ? { max_count: 20, cursor } : { max_count: 20 }),
      });
      return check(res, await readJson(res));
    },
    async userInfo() {
      const res = await fetchFn(`${API}/user/info/?fields=open_id,display_name`, {
        headers: { authorization: `Bearer ${await getToken()}` },
      });
      return check(res, await readJson(res)).user || {};
    },
  };
}

// ---- OAuth (Login Kit) ----

export function authorizeUrl({ clientKey, redirectUri, state }) {
  const q = new URLSearchParams({
    client_key: clientKey,
    scope: TIKTOK_SCOPES,
    response_type: 'code',
    redirect_uri: redirectUri,
    state,
  });
  return `https://www.tiktok.com/v2/auth/authorize/?${q}`;
}

async function tokenRequest(fetchFn, params) {
  const res = await fetchFn(`${API}/oauth/token/`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(params),
  });
  const data = await readJson(res);
  if (!res.ok || data.error || !data.access_token) {
    const code = typeof data.error === 'string' ? data.error : data.error?.code || `http_${res.status}`;
    throw new TikTokError(data.error_description || data.error?.message || `TikTok token request failed (${code})`, code, res.status);
  }
  return data;
}

// Turns a token response into what we store. Times are epoch ms.
export function tokenRecord(data, nowMs) {
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    open_id: data.open_id,
    scope: data.scope,
    expires_at: nowMs + Number(data.expires_in || 0) * 1000,
    refresh_expires_at: nowMs + Number(data.refresh_expires_in || 0) * 1000,
  };
}

export const exchangeCode = (fetchFn, { clientKey, clientSecret, code, redirectUri }) =>
  tokenRequest(fetchFn, {
    client_key: clientKey,
    client_secret: clientSecret,
    code,
    grant_type: 'authorization_code',
    redirect_uri: redirectUri,
  });

export const refreshTikTokToken = (fetchFn, { clientKey, clientSecret, refreshToken }) =>
  tokenRequest(fetchFn, {
    client_key: clientKey,
    client_secret: clientSecret,
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  });

// ---- stored token ----
// Access tokens last 24 hours, refresh tokens a year. The cron keeps the access token
// fresh, which also rolls the refresh token forward, so the sign-in never runs out.

const KEY = 'tiktok_token';
const REFRESH_AHEAD_MS = 60 * 60 * 1000;

export async function loadTikTokToken(store) {
  try {
    return JSON.parse((await store.kvGet(KEY)) || 'null');
  } catch {
    return null;
  }
}

export const saveTikTokToken = (store, rec) => store.kvSet(KEY, JSON.stringify(rec));

// Returns a usable access token, refreshing first if it is about to expire.
export async function getTikTokToken({ store, refresh, now = () => Date.now() }) {
  const rec = await loadTikTokToken(store);
  if (!rec) throw new TikTokError('TikTok is not connected. Open /dashboard/tiktok/connect', 'not_connected');
  if (rec.expires_at - now() > REFRESH_AHEAD_MS) return rec.access_token;
  const fresh = tokenRecord(await refresh(rec.refresh_token), now());
  await saveTikTokToken(store, { ...rec, ...fresh, display_name: rec.display_name });
  return fresh.access_token;
}
