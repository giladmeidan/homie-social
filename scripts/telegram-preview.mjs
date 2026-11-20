#!/usr/bin/env node
// Sends a video to the approval chat as a plain message (no Approve / Reject buttons).
// Used for reels that must not be posted, e.g. voice tests on the free ElevenLabs plan.
// usage: node scripts/telegram-preview.mjs <video.mp4> "<caption>"
import { readFileSync } from 'node:fs';
import { basename } from 'node:path';

const [file, caption = ''] = process.argv.slice(2);
const { TELEGRAM_BOT_TOKEN: token, TELEGRAM_CHAT_ID: chat } = process.env;
if (!file) { console.error('usage: telegram-preview.mjs <video> "<caption>"'); process.exit(2); }
if (!token || !chat) { console.error('TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID not set'); process.exit(1); }

const form = new FormData();
form.append('chat_id', chat);
form.append('caption', caption.slice(0, 1000));
form.append('supports_streaming', 'true');
form.append('video', new Blob([readFileSync(file)], { type: 'video/mp4' }), basename(file));
const res = await fetch(`https://api.telegram.org/bot${token}/sendVideo`, { method: 'POST', body: form });
const body = await res.json().catch(() => ({}));
if (!res.ok || !body.ok) { console.error('Telegram sendVideo failed:', res.status, JSON.stringify(body).slice(0, 300)); process.exit(1); }
console.log(`sent message ${body.result.message_id}`);
