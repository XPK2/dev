-- V2__remove_media_table.sql
-- Remove media table and related indices

DROP TABLE IF EXISTS media CASCADE;
DROP INDEX IF EXISTS idx_media_uploaded_by;
DROP INDEX IF EXISTS idx_media_created_at;
