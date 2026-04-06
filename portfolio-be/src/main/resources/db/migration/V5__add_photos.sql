-- V5__add_photos.sql

CREATE TABLE IF NOT EXISTS photos (
    id BIGSERIAL PRIMARY KEY,
    uploaded_by BIGINT NOT NULL REFERENCES users(id),
    caption VARCHAR(500),
    -- Base64 data URI: "data:image/jpeg;base64,/9j/..."
    -- TEXT type has no size limit in PostgreSQL
    data TEXT NOT NULL,
    mime_type VARCHAR(50) NOT NULL DEFAULT 'image/jpeg',
    file_size  INT NOT NULL DEFAULT 0,   -- bytes before base64 encoding
    taken_date DATE,                     -- photo date (user-provided or defaults to today)
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_photos_taken_date  ON photos(taken_date DESC);
CREATE INDEX IF NOT EXISTS idx_photos_created_at  ON photos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_photos_uploaded_by ON photos(uploaded_by);
