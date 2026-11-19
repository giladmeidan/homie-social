// Thin client for the Instagram content publishing API.
// Two token kinds exist:
//   IGAA...  Instagram Login user token  -> graph.instagram.com, userId may be "me", expires in 60 days
//   EAA...   business / system-user token -> graph.facebook.com, userId must be the IG account id, can be non-expiring
// New Meta apps (late 2026) only get the second kind ("Unified login").

export function hostForToken(token) {
  return String(token || '').startsWith('EAA') ? 'graph.facebook.com' : 'graph.instagram.com';
}

// Only Instagram Login tokens can (and need to) be renewed.
export function isRefreshableToken(token) {
  return String(token || '').startsWith('IG');
}

export class InstagramError extends Error {
  constructor(message, details) {
    super(message);
    this.name = 'InstagramError';
    this.details = details;
  }
}

async function request(fetchFn, method, url, params) {
  const init = { method };
  if (method === 'GET') {
    url += `?${new URLSearchParams(params)}`;
  } else {
    init.body = new URLSearchParams(params);
  }
  const res = await fetchFn(url, init);
  let data = {};
  try {
    data = await res.json();
  } catch {
    // non-JSON body; handled below through res.ok
  }
  if (!res.ok || data.error) {
    const e = data.error || {};
    const message = e.error_user_msg || e.message || `HTTP ${res.status}`;
    throw new InstagramError(message, e);
  }
  return data;
}

// userId "me" only works with Instagram Login tokens; business tokens need the numeric IG account id.
export function createInstagram({ fetchFn, getToken, version = 'v25.0', userId = 'me', host = 'graph.instagram.com' }) {
  const base = `https://${host}/${version}`;
  const call = async (method, path, params = {}) =>
    request(fetchFn, method, `${base}/${path}`, { ...params, access_token: await getToken() });

  return {
    // Step 1: Instagram downloads the video from videoUrl and processes it.
    createReelContainer: ({ videoUrl, caption }) =>
      call('POST', `${userId}/media`, {
        media_type: 'REELS',
        video_url: videoUrl,
        caption,
        share_to_feed: 'true',
      }),
    // status_code: IN_PROGRESS | FINISHED | ERROR | EXPIRED | PUBLISHED
    containerStatus: (containerId) => call('GET', containerId, { fields: 'status_code,status' }),
    // Step 2: make the processed container live.
    publish: (containerId) => call('POST', `${userId}/media_publish`, { creation_id: containerId }),
    permalink: (mediaId) => call('GET', mediaId, { fields: 'permalink' }),
    whoAmI: () => call('GET', userId, { fields: 'id,username' }),
    // ---- stats ----
    account: () => call('GET', userId, { fields: 'username,followers_count,media_count' }),
    listMedia: (limit = 50) =>
      call('GET', `${userId}/media`, {
        fields: 'id,caption,media_type,media_product_type,permalink,timestamp,thumbnail_url',
        limit: String(limit),
      }),
    mediaInsights: (mediaId, metrics) => call('GET', `${mediaId}/insights`, { metric: metrics.join(',') }),
  };
}

// Renews a long-lived token for another 60 days. Returns { access_token, expires_in }.
export function refreshLongLivedToken(fetchFn, token) {
  return request(fetchFn, 'GET', 'https://graph.instagram.com/refresh_access_token', {
    grant_type: 'ig_refresh_token',
    access_token: token,
  });
}
