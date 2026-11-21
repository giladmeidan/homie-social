// D1 (SQLite) storage. test/memory-store.js implements the same interface.

const COLUMNS = [
  'status', 'title', 'caption', 'media_key', 'scheduled_at', 'approved_at', 'published_at',
  'container_id', 'ig_media_id', 'permalink', 'error', 'tg_message_id', 'updated_at',
  'tiktok_status', 'tiktok_publish_id', 'tiktok_error', 'tiktok_updated_at', 'beats',
  'reject_reason', 'reject_note',
];
const ACTIVE = ['approved', 'creating', 'processing', 'publishing'];
const TIKTOK_ACTIVE = ['queued', 'uploading', 'processing'];

function setClause(fields) {
  const keys = Object.keys(fields).filter((k) => COLUMNS.includes(k));
  return { sql: keys.map((k) => `${k} = ?`).join(', '), values: keys.map((k) => fields[k] ?? null) };
}

export function createD1Store(db) {
  return {
    async createReel(r) {
      const insert = (withBeats) => db
        .prepare(
          `INSERT INTO reels (id, status, title, caption, media_key, scheduled_at, created_at, updated_at, tiktok_status${withBeats ? ', beats' : ''})
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?${withBeats ? ', ?' : ''})`,
        )
        .bind(r.id, r.status, r.title ?? null, r.caption, r.media_key, r.scheduled_at ?? null, r.created_at, r.created_at,
          r.tiktok_status ?? null, ...(withBeats ? [r.beats ?? null] : []))
        .run();
      try {
        await insert(true);
      } catch (e) {
        // Database not migrated yet (npm run db:migrate:beats): never block publishing over the retention insight.
        if (!/beats/.test(String(e?.message))) throw e;
        await insert(false);
      }
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
    // Same compare-and-set, on the TikTok column.
    async tiktokTransition(id, from, to, fields = {}) {
      const s = setClause({ ...fields, tiktok_status: to });
      // "= NULL" never matches in SQL, so a reel that has not been near TikTok needs IS NULL.
      const stmt = from === null
        ? db.prepare(`UPDATE reels SET ${s.sql} WHERE id = ? AND tiktok_status IS NULL`).bind(...s.values, id)
        : db.prepare(`UPDATE reels SET ${s.sql} WHERE id = ? AND tiktok_status = ?`).bind(...s.values, id, from);
      const res = await stmt.run();
      return res.meta.changes === 1;
    },
    async listTikTokActive() {
      const marks = TIKTOK_ACTIVE.map(() => '?').join(', ');
      const { results } = await db
        .prepare(`SELECT * FROM reels WHERE tiktok_status IN (${marks}) ORDER BY created_at`)
        .bind(...TIKTOK_ACTIVE)
        .all();
      return results;
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
        .prepare('INSERT INTO account_stats (captured_at, username, followers, media_count, total_views) VALUES (?, ?, ?, ?, ?)')
        .bind(s.captured_at, s.username, s.followers, s.media_count, s.total_views ?? null)
        .run();
    },
    // Views at the latest snapshot within 24h of posting; called while a reel is under a day old.
    async setDay1(mediaId, views, at) {
      await db.prepare('UPDATE ig_media SET day1_views = ?, day1_at = ? WHERE id = ?').bind(views, at, mediaId).run();
    },
    // When each reel was last measured, so older reels can be refreshed less often.
    async lastSnapshotTimes() {
      const { results } = await db
        .prepare('SELECT media_id, MAX(captured_at) AS at FROM media_stats GROUP BY media_id')
        .all();
      return Object.fromEntries(results.map((r) => [r.media_id, r.at]));
    },
    // Latest known views of every reel, summed (reels not re-measured this hour keep their last value).
    async sumLatestViews() {
      const row = await db
        .prepare(
          `SELECT SUM(json_extract(s.metrics, '$.views')) AS total FROM media_stats s
           JOIN (SELECT media_id, MAX(captured_at) AS at FROM media_stats GROUP BY media_id) l
             ON l.media_id = s.media_id AND l.at = s.captured_at`,
        )
        .first();
      return row?.total ?? 0;
    },
    // Each reel's views at the last snapshot on or before `iso` (baseline for "gained since").
    async viewsAsOf(iso) {
      const { results } = await db
        .prepare(
          `SELECT media_id, json_extract(metrics, '$.views') AS views, MAX(captured_at) AS at
           FROM media_stats WHERE captured_at <= ? GROUP BY media_id`,
        )
        .bind(iso)
        .all();
      return Object.fromEntries(results.map((r) => [r.media_id, r.views]));
    },
    // Hourly account rows (followers, total views) since `iso`, oldest first.
    async accountSeries(sinceIso) {
      const { results } = await db
        .prepare(
          `SELECT captured_at, followers, total_views FROM account_stats
           WHERE captured_at >= ? ORDER BY captured_at`,
        )
        .bind(sinceIso || '0000')
        .all();
      return results;
    },
    // The account row at or just before `iso`.
    accountAsOf(iso) {
      return db.prepare('SELECT * FROM account_stats WHERE captured_at <= ? ORDER BY captured_at DESC LIMIT 1').bind(iso).first();
    },
    firstAccountStats() {
      return db.prepare('SELECT * FROM account_stats ORDER BY captured_at LIMIT 1').first();
    },
    // Views over time for a set of reels since `iso`: [{ media_id, captured_at, views }], oldest first.
    async viewsHistory(mediaIds, sinceIso) {
      if (!mediaIds.length) return [];
      const marks = mediaIds.map(() => '?').join(', ');
      const { results } = await db
        .prepare(
          `SELECT media_id, captured_at, json_extract(metrics, '$.views') AS views FROM media_stats
           WHERE media_id IN (${marks}) AND captured_at >= ? ORDER BY captured_at`,
        )
        .bind(...mediaIds, sinceIso || '0000')
        .all();
      return results;
    },
    async mediaById(id) {
      return db
        .prepare(
          `SELECT m.*, r.title, r.id AS reel_id FROM ig_media m LEFT JOIN reels r ON r.ig_media_id = m.id WHERE m.id = ?`,
        )
        .bind(id)
        .first();
    },
    async snapshotsFor(mediaId) {
      const { results } = await db
        .prepare('SELECT captured_at, metrics FROM media_stats WHERE media_id = ? ORDER BY captured_at')
        .bind(mediaId)
        .all();
      return results;
    },
    // ---- activity log ----
    async logEvent(e) {
      await db
        .prepare('INSERT INTO events (at, level, source, message, reel_id) VALUES (?, ?, ?, ?, ?)')
        .bind(e.at || new Date().toISOString(), e.level || 'info', e.source || 'system', String(e.message).slice(0, 500), e.reel_id ?? null)
        .run();
    },
    async listEvents(limit = 60, level = null) {
      const stmt = level
        ? db.prepare('SELECT * FROM events WHERE level = ? ORDER BY at DESC, id DESC LIMIT ?').bind(level, limit)
        : db.prepare('SELECT * FROM events ORDER BY at DESC, id DESC LIMIT ?').bind(limit);
      return (await stmt.all()).results;
    },
    async pruneEvents(beforeIso) {
      await db.prepare('DELETE FROM events WHERE at < ?').bind(beforeIso).run();
    },
    // ---- queue health ----
    async queueCounts() {
      const { results } = await db.prepare('SELECT status, COUNT(*) AS n, MIN(updated_at) AS oldest FROM reels GROUP BY status').all();
      return results;
    },
    async tiktokCounts() {
      const { results } = await db
        .prepare('SELECT tiktok_status AS status, COUNT(*) AS n FROM reels WHERE tiktok_status IS NOT NULL GROUP BY tiktok_status')
        .all();
      return results;
    },
    // Drafts that reached the TikTok inbox in the window (TikTok allows 5 waiting per 24h).
    async tiktokDraftsSince(iso) {
      const row = await db
        .prepare(`SELECT COUNT(*) AS n FROM reels WHERE tiktok_status = 'in_inbox' AND tiktok_updated_at >= ?`)
        .bind(iso)
        .first();
      return row?.n ?? 0;
    },
    async reelsWithStatus(status, limit = 20) {
      const { results } = await db
        .prepare('SELECT * FROM reels WHERE status = ? ORDER BY updated_at DESC LIMIT ?')
        .bind(status, limit)
        .all();
      return results;
    },
    // Uploads that never finished (the enqueue command was interrupted) become "abandoned".
    async abandonStuckUploads(beforeIso, nowIso) {
      const res = await db
        .prepare(`UPDATE reels SET status = 'abandoned', updated_at = ? WHERE status = 'uploading' AND updated_at < ?`)
        .bind(nowIso, beforeIso)
        .run();
      return res.meta.changes;
    },
    async pruneStats(beforeIso) {
      await db.prepare('DELETE FROM media_stats WHERE captured_at < ?').bind(beforeIso).run();
      await db.prepare('DELETE FROM account_stats WHERE captured_at < ?').bind(beforeIso).run();
      await db.prepare('DELETE FROM events WHERE at < ?').bind(beforeIso).run();
    },
    // Latest snapshot per reel, newest reel first; titles from the publisher where it posted the reel.
    async latestReelStats() {
      const q = (beatsCol) => db
        .prepare(
          `SELECT m.id, m.caption, m.permalink, m.timestamp, m.thumbnail_url, m.day1_views, s.metrics, s.captured_at, r.title, ${beatsCol} AS beats
           FROM ig_media m
           LEFT JOIN (
             SELECT media_id, metrics, MAX(captured_at) AS captured_at FROM media_stats GROUP BY media_id
           ) s ON s.media_id = m.id
           LEFT JOIN reels r ON r.ig_media_id = m.id
           WHERE m.product_type = 'REELS' OR m.media_type = 'VIDEO'
           ORDER BY m.timestamp DESC`,
        )
        .all();
      try {
        return (await q('r.beats')).results;
      } catch (e) {
        if (!/beats/.test(String(e?.message))) throw e;
        return (await q('NULL')).results; // not migrated yet
      }
    },
    // Backfill of reel structure (beats) for reels sent before it was recorded. Never overwrites.
    async setBeats({ id, title }, beats) {
      const res = id
        ? await db.prepare('UPDATE reels SET beats = ? WHERE id = ? AND beats IS NULL').bind(beats, id).run()
        : await db.prepare('UPDATE reels SET beats = ? WHERE title = ? AND beats IS NULL').bind(beats, title).run();
      return res.meta?.changes ?? 0;
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
