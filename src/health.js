// Health checks for the System page. Each check is
//   { id, status: 'good'|'warning'|'critical'|'off', title, detail, action? }
// Live calls (Instagram quota, Telegram webhook) have short timeouts so a slow API never blocks the page.

const MIN = 60 * 1000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

export const withTimeout = (promise, ms = 4000) =>
  Promise.race([promise, new Promise((_, reject) => setTimeout(() => reject(new Error(`no answer in ${ms / 1000}s`)), ms))]);

export function ago(iso, nowMs) {
  if (!iso) return 'never';
  const d = nowMs - new Date(iso).getTime();
  if (d < MIN) return 'just now';
  if (d < HOUR) return `${Math.round(d / MIN)} min ago`;
  if (d < DAY) return `${Math.round(d / HOUR)} h ago`;
  return `${Math.round(d / DAY)} days ago`;
}

const parse = (s) => {
  try {
    return JSON.parse(s || 'null');
  } catch {
    return null;
  }
};

export async function healthChecks({
  store, ig, tg, env, now = () => new Date(), tiktokRecord = null, live = true,
}) {
  const nowMs = now().getTime();
  const nowIso = now().toISOString();
  const [heartbeat, igRun, igErr, ttStats, ttErr, counts, ttCounts, drafts, stuckUploads, failedReels, waiting] = await Promise.all([
    store.kvGet('cron_heartbeat'),
    store.kvGet('stats_last_run'),
    store.kvGet('stats_last_error'),
    store.kvGet('tiktok_stats'),
    store.kvGet('tiktok_stats_error'),
    store.queueCounts(),
    store.tiktokCounts(),
    store.tiktokDraftsSince(new Date(nowMs - DAY).toISOString()),
    store.reelsWithStatus('uploading', 20),
    store.reelsWithStatus('failed', 20),
    store.reelsWithStatus('pending_approval', 20),
  ]);
  const checks = [];

  // 1. The every-minute scheduled job (publishing, retries, stats all ride on it)
  const hbAge = heartbeat ? nowMs - new Date(heartbeat).getTime() : Infinity;
  checks.push({
    id: 'scheduler',
    title: 'Scheduler',
    status: hbAge < 3 * MIN ? 'good' : hbAge < 15 * MIN ? 'warning' : 'critical',
    detail:
      hbAge === Infinity
        ? 'No run recorded yet. It records itself on its first run after this deploy.'
        : `Last run ${ago(heartbeat, nowMs)}. It runs every minute and drives publishing, retries and stats.`,
  });

  // 2. Instagram stats collection
  const run = parse(igRun);
  const runAge = run?.at ? nowMs - new Date(run.at).getTime() : Infinity;
  let igStatus = igErr ? 'critical' : runAge < 90 * MIN ? 'good' : runAge < 3 * HOUR ? 'warning' : 'critical';
  if (!igErr && run?.failed) igStatus = 'warning';
  checks.push({
    id: 'ig-stats',
    title: 'Instagram stats',
    status: igStatus,
    detail: igErr
      ? `Last collection failed: ${igErr}`
      : run
        ? `Updated ${ago(run.at, nowMs)}: ${run.reels} reels measured${run.skipped ? `, ${run.skipped} older ones skipped until due` : ''}${
          run.failed ? `, ${run.failed} failed` : ''
        }. Runs hourly.`
        : 'Not collected yet.',
  });

  // 3. Instagram API: publishing quota + how much of Meta's call budget the stats run used
  const igCheck = { id: 'ig-api', title: 'Instagram connection', status: 'good', detail: '' };
  const parts = [];
  if (live) {
    try {
      const q = await withTimeout(ig.publishingLimit());
      const row = q?.data?.[0] || {};
      const used = row.quota_usage ?? null;
      const cap = row.config?.quota_total ?? 100;
      if (used !== null) {
        parts.push(`${used} of ${cap} API posts used in the last 24h`);
        if (used >= cap * 0.8) igCheck.status = 'warning';
      }
    } catch (err) {
      igCheck.status = 'critical';
      parts.push(`Instagram did not answer: ${err.message}`);
    }
  }
  if (run && typeof run.usage_peak === 'number') {
    parts.push(`last stats run used ${run.calls ?? '?'} calls, peaking at ${Math.round(run.usage_peak)}% of Meta's hourly budget`);
    if (run.usage_peak >= 75 && igCheck.status === 'good') igCheck.status = 'warning';
  }
  igCheck.detail = parts.length ? `${parts.join('; ')}.` : 'Token accepted by the last stats run.';
  checks.push(igCheck);

  // 4. TikTok
  if (env.tiktokConfigured) {
    const tt = { id: 'tiktok', title: 'TikTok', status: 'good', detail: '' };
    if (!tiktokRecord) {
      tt.status = 'warning';
      tt.detail = 'Not connected. Use Connect TikTok to send approved reels to TikTok drafts.';
      tt.action = { href: '/dashboard/tiktok/connect', label: 'Connect TikTok' };
    } else {
      const snap = parse(ttStats);
      const days = tiktokRecord.refresh_expires_at ? Math.floor((tiktokRecord.refresh_expires_at - nowMs) / DAY) : null;
      const bits = [`Signed in${tiktokRecord.display_name ? ` as ${tiktokRecord.display_name}` : ''}`];
      if (days !== null) bits.push(`sign-in renews itself; hard expiry in ${days} days`);
      bits.push(`${drafts} of 5 drafts sent in the last 24h (TikTok's limit)`);
      if (snap?.at) bits.push(`stats updated ${ago(snap.at, nowMs)}`);
      if (ttErr) {
        tt.status = 'critical';
        bits.push(`stats failed: ${ttErr}`);
      } else if (drafts >= 4 || (days !== null && days < 14)) {
        tt.status = 'warning';
      }
      tt.detail = `${bits.join('; ')}.`;
    }
    checks.push(tt);
  }

  // 5. Telegram approvals
  const tgCheck = { id: 'telegram', title: 'Telegram approvals', status: 'good', detail: '' };
  if (!env.TELEGRAM_CHAT_ID) {
    tgCheck.status = 'critical';
    tgCheck.detail = 'TELEGRAM_CHAT_ID is not set, so approval requests have nowhere to go.';
  } else if (live) {
    try {
      const info = await withTimeout(tg.send('getWebhookInfo', {}));
      const recentError = info.last_error_date && nowMs / 1000 - info.last_error_date < DAY;
      if (!info.url) {
        tgCheck.status = 'critical';
        tgCheck.detail = 'The bot has no webhook, so button taps are not received. Run npm run telegram:webhook.';
      } else if (recentError) {
        tgCheck.status = 'warning';
        tgCheck.detail = `Telegram reported a delivery error ${ago(new Date(info.last_error_date * 1000).toISOString(), nowMs)}: ${info.last_error_message}.`;
      } else {
        tgCheck.detail = `Connected. ${info.pending_update_count || 0} button taps waiting to be delivered.`;
      }
    } catch (err) {
      tgCheck.status = 'warning';
      tgCheck.detail = `Could not reach Telegram: ${err.message}`;
    }
  } else {
    tgCheck.detail = 'Chat configured.';
  }
  checks.push(tgCheck);

  // 6. Publishing queue
  const stale = stuckUploads.filter((r) => nowMs - new Date(r.updated_at).getTime() > HOUR);
  const oldestWait = waiting.map((r) => r.updated_at).sort()[0];
  const q = { id: 'queue', title: 'Publishing queue', status: 'good', detail: '' };
  const qbits = [];
  if (waiting.length) qbits.push(`${waiting.length} waiting for your approval (oldest ${ago(oldestWait, nowMs)})`);
  if (failedReels.length) {
    q.status = 'critical';
    qbits.push(`${failedReels.length} failed; tap Retry on its Telegram message`);
  }
  const ttFailed = ttCounts.find((c) => c.status === 'failed')?.n || 0;
  if (ttFailed) {
    if (q.status === 'good') q.status = 'warning';
    qbits.push(`${ttFailed} TikTok draft${ttFailed > 1 ? 's' : ''} failed`);
  }
  if (stale.length) {
    if (q.status === 'good') q.status = 'warning';
    qbits.push(`${stale.length} upload${stale.length > 1 ? 's' : ''} never finished`);
    q.action = { post: '/dashboard/system/clear-stuck', label: 'Clear unfinished uploads' };
  }
  if (waiting.length && nowMs - new Date(oldestWait).getTime() > DAY && q.status === 'good') q.status = 'warning';
  const published = counts.find((c) => c.status === 'published')?.n || 0;
  q.detail = qbits.length ? `${qbits.join('; ')}.` : `All clear. ${published} reels published through the approval flow.`;
  checks.push(q);

  return {
    checks,
    overall: checks.some((c) => c.status === 'critical') ? 'critical' : checks.some((c) => c.status === 'warning') ? 'warning' : 'good',
    counts,
    ttCounts,
    failedReels,
    waiting,
    stale,
    checkedAt: nowIso,
  };
}
