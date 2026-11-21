// Copies GET /api/insights into content/insights.json, so the reel-making task (which cannot reach
// the Worker) reads the latest numbers and reject reasons from the repo.
// Run by .github/workflows/insights.yml. Locally: node scripts/pull-insights.mjs (uses .env).
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { loadEnv } from './lib.mjs';

const env = loadEnv();
const base = (env.HOMIE_SOCIAL_URL || '').replace(/\/$/, '');
if (!base || !env.ADMIN_TOKEN) {
  console.error('HOMIE_SOCIAL_URL and ADMIN_TOKEN are required');
  process.exit(1);
}
const res = await fetch(`${base}/api/insights`, {
  headers: { authorization: `Bearer ${env.ADMIN_TOKEN}`, 'user-agent': 'homie-social-insights' },
});
if (!res.ok) {
  console.error(`GET /api/insights failed: ${res.status} ${(await res.text()).slice(0, 300)}`);
  process.exit(1);
}
const data = await res.json();
const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'content', 'insights.json');
const text = JSON.stringify(data, null, 2) + '\n';
// Only the generated_at line changes when nothing else did; skip the write then, so no empty commits.
const strip = (t) => t.replace(/"generated_at": "[^"]*"/, '');
if (existsSync(out) && strip(readFileSync(out, 'utf8')) === strip(text)) {
  console.log('insights unchanged');
} else {
  writeFileSync(out, text);
  console.log(`wrote content/insights.json: ${data.reels.length} reels, ${data.formats.length} formats, ${data.rejections.length} rejections`);
}
