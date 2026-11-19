#!/usr/bin/env node
// Tells the approval chat in Telegram when the render workflow could not send a reel.
// Needs TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID; RUN_URL links to the GitHub run.
import { readFileSync, existsSync } from 'node:fs';

const { TELEGRAM_BOT_TOKEN: token, TELEGRAM_CHAT_ID: chat, RUN_URL: runUrl = '' } = process.env;
if (!token || !chat) {
  console.log('TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID not set; skipping the Telegram alert.');
  process.exit(0);
}

const file = new URL('../build/results.json', import.meta.url);
const results = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : null;
const failed = results ? results.filter((r) => r.status === 'failed') : null;
if (failed && failed.length === 0) process.exit(0);

const lines = failed
  ? ['⚠️ Some reels were not sent for approval:', ...failed.map((r) => `• ${r.text}`)]
  : ['⚠️ The reel render workflow failed before it could render anything.'];
if (runUrl) lines.push('', `Log: ${runUrl}`);
lines.push('', 'Re-run with "Retry failed" in GitHub Actions after fixing the episode.');

const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ chat_id: chat, text: lines.join('\n'), disable_web_page_preview: true }),
});
if (!res.ok) console.error('Telegram alert failed:', res.status, await res.text());
