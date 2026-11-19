// The reel lifecycle. Pure logic: every outside system (database, Instagram,
// Telegram, clock) is injected, so this file runs unchanged in tests.
//
// Statuses:
//   uploading -> pending_approval -> approved -> creating -> processing -> publishing -> published
//                                 \-> rejected          \-> failed (Retry puts it back to approved)

export const CAPTION_MAX = 2200; // Instagram's caption limit
const STUCK_MS = 10 * 60 * 1000; // creating/publishing longer than this = interrupted
const PROCESSING_TIMEOUT_MS = 30 * 60 * 1000;
const TOKEN_REFRESH_MS = 7 * 24 * 60 * 60 * 1000;
const TOKEN_RETRY_MS = 24 * 60 * 60 * 1000;

const approvalKeyboard = (id) => ({
  inline_keyboard: [
    [
      { text: '✅ Approve', callback_data: `approve:${id}` },
      { text: '✏️ Edit caption', callback_data: `edit:${id}` },
    ],
    [{ text: '❌ Reject', callback_data: `reject:${id}` }],
  ],
});

const retryKeyboard = (id) => ({
  inline_keyboard: [[{ text: '🔁 Retry', callback_data: `retry:${id}` }]],
});

export function createPipeline({
  store,
  ig,
  tg,
  chatId,
  getBaseUrl,
  now = () => new Date(),
  timeZone = 'Asia/Jerusalem',
}) {
  const iso = () => now().toISOString();
  const label = (r) => r.title || `reel ${r.id}`;
  const isDue = (r) => !r.scheduled_at || r.scheduled_at <= iso();
  const localTime = (isoString) =>
    new Date(isoString).toLocaleString('en-GB', { timeZone, dateStyle: 'medium', timeStyle: 'short' });

  // Every write stamps updated_at so stuck rows can be detected.
  const update = (id, fields) => store.updateReel(id, { ...fields, updated_at: iso() });
  const transition = (id, from, to, fields = {}) =>
    store.transition(id, from, to, { ...fields, updated_at: iso() });

  // Telegram being down must never corrupt reel state, so notifications never throw.
  async function say(text, extra = {}) {
    if (!chatId) return null;
    try {
      return await tg.send('sendMessage', { chat_id: chatId, text, ...extra });
    } catch (err) {
      console.error('telegram sendMessage failed:', err.message);
      return null;
    }
  }

  async function sendApprovalRequest(reel) {
    const msg = await say(reel.caption, { reply_markup: approvalKeyboard(reel.id) });
    if (msg?.message_id) await update(reel.id, { tg_message_id: String(msg.message_id) });
  }

  async function clearButtons(reel) {
    if (!chatId || !reel.tg_message_id) return;
    try {
      await tg.send('editMessageReplyMarkup', {
        chat_id: chatId,
        message_id: Number(reel.tg_message_id),
        reply_markup: { inline_keyboard: [] },
      });
    } catch (err) {
      console.error('telegram clear buttons failed:', err.message);
    }
  }

  // Called once the video file is stored. Sends the reel to Telegram for approval.
  async function submitForApproval(id) {
    if (!chatId) throw new Error('TELEGRAM_CHAT_ID is not set, so there is nowhere to send the approval request');
    const moved = await transition(id, 'uploading', 'pending_approval');
    if (!moved) return false;
    const reel = await store.getReel(id);
    const videoUrl = `${await getBaseUrl()}/media/${reel.media_key}`;
    const when = reel.scheduled_at
      ? `Scheduled for ${localTime(reel.scheduled_at)}`
      : 'Publishes right after approval';
    const header = `🎬 ${label(reel)}\n${when}`;
    try {
      await tg.send('sendVideo', { chat_id: chatId, video: videoUrl, caption: header });
    } catch (err) {
      // Telegram only fetches videos up to a size limit by URL; fall back to a link.
      await say(`${header}\n${videoUrl}`);
    }
    await sendApprovalRequest(reel);
    return true;
  }

  async function fail(id, from, message) {
    const moved = await transition(id, from, 'failed', { error: message });
    if (!moved) return;
    const reel = await store.getReel(id);
    await say(`⚠️ ${label(reel)} failed: ${message}`, { reply_markup: retryKeyboard(id) });
  }

  // approved -> creating -> processing. The conditional transition is the lock:
  // only one caller can win it, so a double tap or an overlapping cron run cannot
  // create two Instagram containers.
  async function startPublish(id) {
    const claimed = await transition(id, 'approved', 'creating');
    if (!claimed) return false;
    const reel = await store.getReel(id);
    try {
      const videoUrl = `${await getBaseUrl()}/media/${reel.media_key}`;
      const container = await ig.createReelContainer({ videoUrl, caption: reel.caption });
      await transition(id, 'creating', 'processing', { container_id: container.id, error: null });
      return true;
    } catch (err) {
      await fail(id, 'creating', `Instagram refused the upload: ${err.message}`);
      return false;
    }
  }

  async function checkProcessing(reel) {
    let status;
    try {
      status = await ig.containerStatus(reel.container_id);
    } catch (err) {
      console.error(`status check failed for ${reel.id}:`, err.message);
      status = { status_code: 'IN_PROGRESS' }; // transient; the timeout below still applies
    }
    if (status.status_code === 'FINISHED') {
      const claimed = await transition(reel.id, 'processing', 'publishing');
      if (!claimed) return;
      try {
        const published = await ig.publish(reel.container_id);
        let permalink = null;
        try {
          permalink = (await ig.permalink(published.id)).permalink || null;
        } catch (err) {
          console.error('permalink lookup failed:', err.message);
        }
        await transition(reel.id, 'publishing', 'published', {
          ig_media_id: published.id,
          permalink,
          published_at: iso(),
          error: null,
        });
        await say(`✅ Published: ${label(reel)}${permalink ? `\n${permalink}` : ''}`);
      } catch (err) {
        await fail(
          reel.id,
          'publishing',
          `publish call failed: ${err.message}. Check Instagram before retrying, it may have gone through.`,
        );
      }
      return;
    }
    if (status.status_code === 'ERROR' || status.status_code === 'EXPIRED') {
      await fail(reel.id, 'processing', `Instagram could not process the video (${status.status || status.status_code})`);
      return;
    }
    if (now() - new Date(reel.updated_at) > PROCESSING_TIMEOUT_MS) {
      await fail(reel.id, 'processing', 'Instagram was still processing the video after 30 minutes');
    }
  }

  // Runs every minute from the cron trigger.
  async function tick() {
    const active = await store.listActive();
    for (const reel of active) {
      try {
        if (reel.status === 'approved' && isDue(reel)) {
          await startPublish(reel.id);
        } else if (reel.status === 'processing') {
          await checkProcessing(reel);
        } else if (
          (reel.status === 'creating' || reel.status === 'publishing') &&
          now() - new Date(reel.updated_at) > STUCK_MS
        ) {
          await fail(reel.id, reel.status, 'the run was interrupted. Check Instagram before retrying, it may have gone through.');
        }
      } catch (err) {
        console.error(`tick failed for ${reel.id}:`, err.message);
      }
    }
  }

  async function approve(id) {
    const moved = await transition(id, 'pending_approval', 'approved', { approved_at: iso() });
    if (!moved) return 'Already handled';
    const reel = await store.getReel(id);
    await clearButtons(reel);
    if (isDue(reel)) {
      await say(`👍 Approved: ${label(reel)}. Sending to Instagram now.`);
      await startPublish(id);
    } else {
      await say(`👍 Approved: ${label(reel)}. It will publish on ${localTime(reel.scheduled_at)}.`);
    }
    return 'Approved';
  }

  async function reject(id) {
    const moved = await transition(id, 'pending_approval', 'rejected');
    if (!moved) return 'Already handled';
    const reel = await store.getReel(id);
    await clearButtons(reel);
    await say(`🗑 Rejected: ${label(reel)}. Nothing was posted.`);
    return 'Rejected';
  }

  async function retry(id) {
    const moved = await transition(id, 'failed', 'approved', { container_id: null });
    if (!moved) return 'Already handled';
    const reel = await store.getReel(id);
    await clearButtons(reel);
    if (isDue(reel)) await startPublish(id);
    return 'Retrying';
  }

  async function askForCaption(id) {
    const reel = await store.getReel(id);
    if (!reel || reel.status !== 'pending_approval') return 'Already handled';
    await store.kvSet('awaiting_caption', id);
    await say(`Send the new caption for ${label(reel)} as your next message, or /cancel.`);
    return 'Send the new caption';
  }

  async function replaceCaption(id, text) {
    const reel = await store.getReel(id);
    await store.kvSet('awaiting_caption', '');
    if (!reel || reel.status !== 'pending_approval') {
      await say('That reel is no longer waiting for approval, so the caption was not changed.');
      return;
    }
    if (text.length > CAPTION_MAX) {
      await say(`That caption is ${text.length} characters; Instagram allows ${CAPTION_MAX}. Nothing changed.`);
      return;
    }
    await clearButtons(reel);
    await update(id, { caption: text });
    await sendApprovalRequest({ ...reel, caption: text });
  }

  // Entry point for the Telegram webhook.
  async function handleTelegramUpdate(update_) {
    const cq = update_.callback_query;
    if (cq) {
      if (!chatId || String(cq.message?.chat?.id) !== String(chatId)) return;
      const [action, id] = String(cq.data || '').split(':');
      const actions = { approve, reject, retry, edit: askForCaption };
      let answer = 'Unknown action';
      if (actions[action] && id) answer = await actions[action](id);
      try {
        await tg.send('answerCallbackQuery', { callback_query_id: cq.id, text: answer });
      } catch (err) {
        console.error('answerCallbackQuery failed:', err.message);
      }
      return;
    }

    const msg = update_.message;
    if (!msg?.text) return;
    const text = msg.text.trim();

    // /id works from any chat: it is how the owner finds the chat id during setup.
    if (text === '/id') {
      try {
        await tg.send('sendMessage', { chat_id: msg.chat.id, text: `This chat's id is ${msg.chat.id}` });
      } catch (err) {
        console.error('telegram /id reply failed:', err.message);
      }
      return;
    }
    if (!chatId || String(msg.chat.id) !== String(chatId)) return;

    if (text === '/cancel') {
      await store.kvSet('awaiting_caption', '');
      await say('Cancelled. The caption is unchanged.');
      return;
    }
    if (text === '/queue') {
      const reels = await store.listReels(15);
      const lines = reels.map((r) => `${r.status} · ${label(r)}`);
      await say(lines.length ? lines.join('\n') : 'The queue is empty.');
      return;
    }
    const awaiting = await store.kvGet('awaiting_caption');
    if (awaiting && !text.startsWith('/')) await replaceCaption(awaiting, msg.text);
  }

  return { submitForApproval, startPublish, tick, approve, reject, retry, handleTelegramUpdate };
}

// ---- Instagram access token ----
// The long-lived token lasts 60 days and can be renewed once it is a day old.
// The record remembers which secret it grew from ("seed"), so setting a brand-new
// IG_ACCESS_TOKEN secret always wins over a stored token.

export async function getAccessToken(store, seedToken) {
  const raw = await store.kvGet('ig_token');
  if (raw) {
    try {
      const rec = JSON.parse(raw);
      if (rec.seed === seedToken && rec.token) return rec.token;
    } catch {
      // fall through to the seed
    }
  }
  return seedToken;
}

export async function maybeRefreshToken({ store, seedToken, refresh, now = () => new Date(), onError }) {
  if (!seedToken) return 'no-token';
  let rec = null;
  try {
    rec = JSON.parse((await store.kvGet('ig_token')) || 'null');
  } catch {
    rec = null;
  }
  const nowMs = now().getTime();
  if (!rec || rec.seed !== seedToken) {
    rec = { seed: seedToken, token: seedToken, since: nowMs, last_attempt: 0 };
    await store.kvSet('ig_token', JSON.stringify(rec));
    return 'tracked';
  }
  if (nowMs - rec.since < TOKEN_REFRESH_MS) return 'fresh';
  if (nowMs - (rec.last_attempt || 0) < TOKEN_RETRY_MS) return 'waiting';
  rec.last_attempt = nowMs;
  await store.kvSet('ig_token', JSON.stringify(rec));
  try {
    const result = await refresh(rec.token);
    rec.token = result.access_token;
    rec.since = nowMs;
    rec.expires_at = nowMs + result.expires_in * 1000;
    await store.kvSet('ig_token', JSON.stringify(rec));
    return 'refreshed';
  } catch (err) {
    if (onError) await onError(err);
    return 'error';
  }
}
