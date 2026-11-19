CREATE TABLE IF NOT EXISTS reels (
  id            TEXT PRIMARY KEY,
  status        TEXT NOT NULL,
  title         TEXT,
  caption       TEXT NOT NULL,
  media_key     TEXT NOT NULL,
  scheduled_at  TEXT,
  created_at    TEXT NOT NULL,
  updated_at    TEXT NOT NULL,
  approved_at   TEXT,
  published_at  TEXT,
  container_id  TEXT,
  ig_media_id   TEXT,
  permalink     TEXT,
  error         TEXT,
  tg_message_id TEXT
);

CREATE INDEX IF NOT EXISTS reels_status ON reels (status);

CREATE TABLE IF NOT EXISTS kv (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- ---- stats (dashboard) ----
CREATE TABLE IF NOT EXISTS ig_media (
  id            TEXT PRIMARY KEY,
  caption       TEXT,
  media_type    TEXT,
  product_type  TEXT,
  permalink     TEXT,
  timestamp     TEXT,
  thumbnail_url TEXT
);

-- One row per reel per hourly collection; kept for 90 days.
CREATE TABLE IF NOT EXISTS media_stats (
  media_id    TEXT NOT NULL,
  captured_at TEXT NOT NULL,
  metrics     TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS media_stats_media ON media_stats (media_id, captured_at);

CREATE TABLE IF NOT EXISTS account_stats (
  captured_at TEXT NOT NULL,
  username    TEXT,
  followers   INTEGER,
  media_count INTEGER
);
CREATE INDEX IF NOT EXISTS account_stats_at ON account_stats (captured_at);
