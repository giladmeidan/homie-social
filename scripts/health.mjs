#!/usr/bin/env node
// Checks the deployed Worker: token kind (never the token), and whether Instagram accepts it.
//   npm run health
import { loadEnv } from './lib.mjs';

const env = loadEnv();
if (!env.HOMIE_SOCIAL_URL || !env.ADMIN_TOKEN) {
  console.error('Error: set HOMIE_SOCIAL_URL and ADMIN_TOKEN in .env (scripts/setup-telegram.sh does this)');
  process.exit(1);
}
const res = await fetch(`${env.HOMIE_SOCIAL_URL.replace(/\/$/, '')}/api/health`, {
  headers: { authorization: `Bearer ${env.ADMIN_TOKEN}` },
});
console.log(JSON.stringify(await res.json().catch(() => ({ status: res.status })), null, 2));
