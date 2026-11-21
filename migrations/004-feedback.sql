-- Reject reasons: why a reel was turned down, read by the reel-making task.
-- Run once: npm run db:migrate:feedback   (a fresh database gets these from schema.sql)
ALTER TABLE reels ADD COLUMN reject_reason TEXT;
ALTER TABLE reels ADD COLUMN reject_note TEXT;
