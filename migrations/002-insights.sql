-- Dashboard v2: first-day views per reel, total views per collection, activity log.
-- Run once: npm run db:migrate:insights   (a fresh database gets these from schema.sql)
ALTER TABLE ig_media ADD COLUMN day1_views INTEGER;
ALTER TABLE ig_media ADD COLUMN day1_at TEXT;
ALTER TABLE account_stats ADD COLUMN total_views INTEGER;

CREATE TABLE IF NOT EXISTS events (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  at      TEXT NOT NULL,
  level   TEXT NOT NULL,   -- good | info | warning | error
  source  TEXT NOT NULL,   -- publisher | tiktok | stats | tiktok-stats | system
  message TEXT NOT NULL,
  reel_id TEXT
);
CREATE INDEX IF NOT EXISTS events_at ON events (at);

-- Backfill first-day views from the hourly snapshots already collected:
-- the last snapshot taken within 24 hours of posting.
UPDATE ig_media SET
  day1_views = (
    SELECT json_extract(s.metrics, '$.views') FROM media_stats s
    WHERE s.media_id = ig_media.id
      AND s.captured_at <= strftime('%Y-%m-%dT%H:%M:%S', substr(ig_media.timestamp, 1, 19), '+24 hours')
    ORDER BY s.captured_at DESC LIMIT 1),
  day1_at = (
    SELECT s.captured_at FROM media_stats s
    WHERE s.media_id = ig_media.id
      AND s.captured_at <= strftime('%Y-%m-%dT%H:%M:%S', substr(ig_media.timestamp, 1, 19), '+24 hours')
    ORDER BY s.captured_at DESC LIMIT 1);
