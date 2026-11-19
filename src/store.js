// D1 (SQLite) storage. test/memory-store.js implements the same interface.

const COLUMNS = [
  'status', 'title', 'caption', 'media_key', 'scheduled_at', 'approved_at', 'published_at',
  'container_id', 'ig_media_id', 'permalink', 'error', 'tg_message_id', 'updated_at',
];
const ACTIVE = ['approved', 'creating', 'processing', 'publishing'];

function setClause(fields) {
  const keys = Object.keys(fields).filter((k) => COLUMNS.includes(k));
  return { sql: keys.map((k) => `${k} = ?`).join(', '), values: keys.map((k) => fields[k] ?? null) };
}

export function createD1Store(db) {
  return {
    async createReel(r) {
      await db
        .prepare(
          `INSERT INTO reels (id, status, title, caption, media_key, scheduled_at, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(r.id, r.status, r.title ?? null, r.caption, r.media_key, r.scheduled_at ?? null, r.created_at, r.created_at)
        .run();
    },
    getReel(id) {
      return db.prepare('SELECT * FROM reels WHERE id = ?').bind(id).first();
    },
    async updateReel(id, fields) {
      const s = setClause(fields);
      if (!s.sql) return;
      await db.prepare(`UPDATE reels SET ${s.sql} WHERE id = ?`).bind(...s.values, id).run();
    },
    // Atomic compare-and-set on status. Returns true only for the caller that won.
    async transition(id, from, to, fields = {}) {
      const s = setClause({ ...fields, status: to });
      const res = await db
        .prepare(`UPDATE reels SET ${s.sql} WHERE id = ? AND status = ?`)
        .bind(...s.values, id, from)
        .run();
      return res.meta.changes === 1;
    },
    async listActive() {
      const marks = ACTIVE.map(() => '?').join(', ');
      const { results } = await db
        .prepare(`SELECT * FROM reels WHERE status IN (${marks}) ORDER BY created_at`)
        .bind(...ACTIVE)
        .all();
      return results;
    },
    async listReels(limit = 50) {
      const { results } = await db.prepare('SELECT * FROM reels ORDER BY created_at DESC LIMIT ?').bind(limit).all();
      return results;
    },
    // ---- stats ----
    async upsertMedia(m) {
      await db
        .prepare(
          `INSERT INTO ig_media (id, caption, media_type, product_type, permalink, timestamp, thumbnail_url)
           VALUES (?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT(id) DO UPDATE SET caption = excluded.caption, permalink = excluded.permalink,
             thumbnail_url = excluded.thumbnail_url, product_type = excluded.product_type`,
        )
        .bind(m.id, m.caption ?? null, m.media_type ?? null, m.media_product_type ?? null, m.permalink ?? null,
          m.timestamp ?? null, m.thumbnail_url ?? null)
        .run();
    },
    async addMediaStats(mediaId, at, metrics) {
      await db
        .prepare('INSERT INTO media_stats (media_id, captured_at, metrics) VALUES (?, ?, ?)')
        .bind(mediaId, at, JSON.stringify(metrics))
        .run();
    },
    async addAccountStats(s) {
      await db
        .prepare('INSERT INTO account_stats (captured_at, username, followers, media_count) VALUES (?, ?, ?, ?)')
        .bind(s.captured_at, s.username, s.followers, s.media_count)
        .run();
    },
    async pruneStats(beforeIso) {
      await db.prepare('DELETE FROM media_stats WHERE captured_at < ?').bind(beforeIso).run();
      await db.prepare('DELETE FROM account_stats WHERE captured_at < ?').bind(beforeIso).run();
    },
    // Latest snapshot per reel, newest reel first; titles from the publisher where it posted the reel.
    async latestReelStats() {
      const { results } = await db
        .prepare(
          `SELECT m.id, m.caption, m.permalink, m.timestamp, s.metrics, r.title
           FROM ig_media m
           LEFT JOIN (
             SELECT media_id, metrics, MAX(captured_at) AS captured_at FROM media_stats GROUP BY media_id
           ) s ON s.media_id = m.id
           LEFT JOIN reels r ON r.ig_media_id = m.id
           WHERE m.product_type = 'REELS' OR m.media_type = 'VIDEO'
           ORDER BY m.timestamp DESC`,
        )
        .all();
      return results;
    },
    latestAccountStats() {
      return db.prepare('SELECT * FROM account_stats ORDER BY captured_at DESC LIMIT 1').first();
    },
    // One point per day (the day's last snapshot), newest first.
    async dailyFollowers(days) {
      const { results } = await db
        .prepare(
          `SELECT substr(captured_at, 1, 10) AS day, followers, MAX(captured_at) AS at
           FROM account_stats WHERE followers IS NOT NULL
           GROUP BY day ORDER BY day DESC LIMIT ?`,
        )
        .bind(days)
        .all();
      return results;
    },
    async kvGet(key) {
      const row = await db.prepare('SELECT value FROM kv WHERE key = ?').bind(key).first();
      return row ? row.value : null;
    },
    async kvSet(key, value) {
      await db
        .prepare('INSERT INTO kv (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value')
        .bind(key, value)
        .run();
    },
  };
}
