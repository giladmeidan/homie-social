#!/usr/bin/env node
// Sends a finished reel to the approval queue.
//
//   npm run enqueue -- path/to/reel.mp4 --reel 44
//   npm run enqueue -- path/to/reel.mp4 --caption-file caption.txt --title "Turtle ep 3"
//   npm run enqueue -- path/to/reel.mp4 --reel 44 --at "2026-11-21 19:00"
//   npm run enqueue -- path/to/reel.mp4 --reel 44 --no-tiktok     (Instagram only)
//
// --reel N reads the caption from captions-log.md (CAPTIONS_LOG in .env).
// --at is in this computer's local time. Without it the reel publishes right after approval.

import { readFileSync, statSync } from 'node:fs';
import { loadEnv, findCaption } from './lib.mjs';

function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--no-tiktok') out['no-tiktok'] = true;
    else if (a.startsWith('--')) out[a.slice(2)] = argv[++i];
    else out._.push(a);
  }
  return out;
}

function die(message) {
  console.error(`Error: ${message}`);
  process.exit(1);
}

const args = parseArgs(process.argv.slice(2));
const env = loadEnv();
const video = args._[0];

if (!video) die('give the path to the mp4. See the examples at the top of scripts/enqueue.mjs');
if (!env.HOMIE_SOCIAL_URL || !env.ADMIN_TOKEN) die('set HOMIE_SOCIAL_URL and ADMIN_TOKEN in .env');

let caption = args.caption;
let title = args.title;
if (args['caption-file']) caption = readFileSync(args['caption-file'], 'utf8');
if (args.reel) {
  if (!env.CAPTIONS_LOG) die('set CAPTIONS_LOG in .env to use --reel');
  const found = findCaption(readFileSync(env.CAPTIONS_LOG, 'utf8'), args.reel);
  if (!found) die(`no entry for reel ${args.reel} in ${env.CAPTIONS_LOG}`);
  caption = caption || found.caption;
  title = title || found.title;
}
if (!caption || !caption.trim()) die('no caption. Use --reel N, --caption "..." or --caption-file FILE');

let scheduledAt = null;
if (args.at) {
  const d = new Date(args.at);
  if (Number.isNaN(d.getTime())) die(`could not read --at "${args.at}". Use e.g. "2026-11-21 19:00"`);
  if (d <= new Date()) die('--at is in the past');
  scheduledAt = d.toISOString();
}

const size = statSync(video).size;
const base = env.HOMIE_SOCIAL_URL.replace(/\/$/, '');
const headers = { authorization: `Bearer ${env.ADMIN_TOKEN}` };

const created = await fetch(`${base}/api/reels`, {
  method: 'POST',
  headers: { ...headers, 'content-type': 'application/json' },
  body: JSON.stringify({
    caption: caption.trim(),
    title,
    scheduled_at: scheduledAt,
    ...(args['no-tiktok'] ? { tiktok: false } : {}),
  }),
});
const createdBody = await created.json().catch(() => ({}));
if (!created.ok) die(`could not create the reel: ${createdBody.error || created.status}`);

console.log(`Uploading ${(size / 1024 / 1024).toFixed(1)} MB...`);
const uploaded = await fetch(`${base}${createdBody.upload_path}`, {
  method: 'PUT',
  headers: { ...headers, 'content-type': 'video/mp4' },
  body: readFileSync(video),
});
const uploadedBody = await uploaded.json().catch(() => ({}));
if (!uploaded.ok) die(`upload failed: ${uploadedBody.error || uploaded.status}`);

console.log(`Queued as ${createdBody.id}. Check Telegram to approve it.`);
