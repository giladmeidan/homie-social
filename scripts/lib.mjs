// Shared helpers for the local scripts.
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

// Reads KEY=value lines from .env in the repo root. Real environment variables win.
export function loadEnv() {
  const env = {};
  const file = join(root, '.env');
  if (existsSync(file)) {
    for (const line of readFileSync(file, 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  }
  return { ...env, ...process.env };
}

// Pulls one reel's entry out of captions-log.md.
// Entries look like:  ## ריל 44 · קבוצת הדירה · פרק 5 (ישיבת בית)
export function findCaption(markdown, reelNumber) {
  const sections = markdown.split(/^## /m).slice(1);
  for (const section of sections) {
    const newline = section.indexOf('\n');
    const heading = (newline === -1 ? section : section.slice(0, newline)).trim();
    const m = heading.match(/^ריל\s+(\d+)\b/);
    if (m && Number(m[1]) === Number(reelNumber)) {
      return { title: heading, caption: newline === -1 ? '' : section.slice(newline + 1).trim() };
    }
  }
  return null;
}
