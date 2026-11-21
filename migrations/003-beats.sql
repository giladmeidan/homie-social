-- Retention insight: each reel's structure (scene changes, end card) saved at render time.
-- Run once: npm run db:migrate:beats   (a fresh database gets this from schema.sql)
ALTER TABLE reels ADD COLUMN beats TEXT;
