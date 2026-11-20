-- Adds the TikTok columns to a database created before TikTok support.
-- Run once: npm run db:migrate:tiktok   (a fresh database gets them from schema.sql)
ALTER TABLE reels ADD COLUMN tiktok_status TEXT;
ALTER TABLE reels ADD COLUMN tiktok_publish_id TEXT;
ALTER TABLE reels ADD COLUMN tiktok_error TEXT;
ALTER TABLE reels ADD COLUMN tiktok_updated_at TEXT;
CREATE INDEX IF NOT EXISTS reels_tiktok_status ON reels (tiktok_status);
