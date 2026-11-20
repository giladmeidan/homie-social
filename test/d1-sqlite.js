// A tiny D1 look-alike on Node's built-in SQLite, so tests run the real SQL from src/store.js.
// Returns null when node:sqlite is unavailable (Node < 22.5); tests then skip.
import { readFileSync } from 'node:fs';

let DatabaseSync = null;
try {
  process.removeAllListeners('warning'); // hide the "experimental" notice
  ({ DatabaseSync } = await import('node:sqlite'));
} catch {
  DatabaseSync = null;
}
export const sqliteAvailable = Boolean(DatabaseSync);

export function createTestD1(...sqlFiles) {
  const db = new DatabaseSync(':memory:');
  for (const f of sqlFiles) db.exec(readFileSync(new URL(f, import.meta.url), 'utf8'));
  const wrap = (sql, args = []) => ({
    bind: (...a) => wrap(sql, a),
    async first() {
      return db.prepare(sql).get(...args) ?? null;
    },
    async all() {
      return { results: db.prepare(sql).all(...args) };
    },
    async run() {
      const r = db.prepare(sql).run(...args);
      return { meta: { changes: Number(r.changes) } };
    },
  });
  return { prepare: (sql) => wrap(sql), exec: (sql) => db.exec(sql), raw: db };
}
