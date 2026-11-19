#!/usr/bin/env node
// Points the Telegram bot at the deployed Worker. Run once after the first deploy:
//   npm run telegram:webhook
// Needs HOMIE_SOCIAL_URL, TELEGRAM_BOT_TOKEN and TELEGRAM_WEBHOOK_SECRET in .env.

import { loadEnv } from './lib.mjs';

const env = loadEnv();
for (const key of ['HOMIE_SOCIAL_URL', 'TELEGRAM_BOT_TOKEN', 'TELEGRAM_WEBHOOK_SECRET']) {
  if (!env[key]) {
    console.error(`Error: set ${key} in .env`);
    process.exit(1);
  }
}

const res = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/setWebhook`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({
    url: `${env.HOMIE_SOCIAL_URL.replace(/\/$/, '')}/telegram/webhook`,
    secret_token: env.TELEGRAM_WEBHOOK_SECRET,
    allowed_updates: ['message', 'callback_query'],
  }),
});
const data = await res.json();
if (!data.ok) {
  console.error(`Telegram refused: ${data.description}`);
  process.exit(1);
}
console.log('Webhook set. Send /id to your bot to get the chat id.');
