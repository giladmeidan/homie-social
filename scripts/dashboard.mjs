#!/usr/bin/env node
// Opens the dashboard and copies the admin key to the clipboard, ready to paste into the sign-in box.
//   npm run dashboard
import { execFileSync, spawn } from 'node:child_process';
import { loadEnv } from './lib.mjs';

const env = loadEnv();
if (!env.HOMIE_SOCIAL_URL || !env.ADMIN_TOKEN) {
  console.error('Error: set HOMIE_SOCIAL_URL and ADMIN_TOKEN in .env (scripts/setup-telegram.sh does this)');
  process.exit(1);
}
const url = `${env.HOMIE_SOCIAL_URL.replace(/\/$/, '')}/dashboard`;
try {
  execFileSync('pbcopy', { input: env.ADMIN_TOKEN });
  console.log('Admin key copied to the clipboard. Paste it into the sign-in box (only needed once per 30 days).');
} catch {
  console.log('Sign in with ADMIN_TOKEN from .env.');
}
spawn('open', [url], { stdio: 'ignore', detached: true }).unref();
console.log(url);
