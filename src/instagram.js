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

// Meta reports how much of the API budget is used in these response headers (JSON, percentages).
const USAGE_HEADERS = ['x-business-use-case-usage', 'x-app-usage'];

// Highest percentage found anywhere in a usage header, e.g. {"call_count":12,"total_time":3} -> 12.
export function peakUsage(headerValue) {
  if (!headerValue) return null;
  let peak = null;
  const walk = (v) => {
    if (typeof v === 'number') peak = Math.max(peak ?? 0, v);
    else if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === 'object') {
      for (const [k, x] of Object.entries(v)) if (k !== 'type' && k !== 'estimated_time_to_regain_access') walk(x);
    }
  };
  try {
    walk(JSON.parse(headerValue));
  } catch {
    return null;
  }
  return peak;
}

async function request(fetchFn, method, url, params, onUsage) {
  const init = { method };
  if (method === 'GET') {
    url += `?${new URLSearchParams(params)}`;
  } else {
    init.body = new URLSearchParams(params);
  }
  const res = await fetchFn(url, init);
  if (onUsage && res.headers?.get) {
    for (const h of USAGE_HEADERS) {
      const pct = peakUsage(res.headers.get(h));
      if (pct !== null) onUsage(pct);
    }
  }
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
  // Counts calls and remembers the highest API-usage percentage Meta reported, for the System page.
  const usage = { calls: 0, peak: null };
  const call = async (method, path, params = {}) => {
    usage.calls++;
    return request(fetchFn, method, `${base}/${path}`, { ...params, access_token: await getToken() }, (pct) => {
      usage.peak = Math.max(usage.peak ?? 0, pct);
    });
  };

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
    // One page of the account's posts, newest first. Pass the returned paging.cursors.after to get the next.
    listMedia: (limit = 50, after = null) =>
      call('GET', `${userId}/media`, {
        fields: 'id,caption,media_type,media_product_type,permalink,timestamp,thumbnail_url',
        limit: String(limit),
        ...(after ? { after } : {}),
      }),
    // How many API posts were published in the last 24 hours, against the account's cap.
    publishingLimit: () => call('GET', `${userId}/content_publishing_limit`, { fields: 'quota_usage,config' }),
    usage,
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
