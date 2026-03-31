-- V6__add_photos.sql

CREATE TABLE IF NOT EXISTS photos (
    id BIGSERIAL PRIMARY KEY,
    uploaded_by BIGINT NOT NULL REFERENCES users(id),
    caption VARCHAR(500),
    -- Base64 data URI: "data:image/jpeg;base64,/9j/..."
    -- TEXT type không giới hạn size trong PostgreSQL
    data TEXT NOT NULL,
    mime_type VARCHAR(50) NOT NULL DEFAULT 'image/jpeg',
    file_size  INT NOT NULL DEFAULT 0,   -- bytes trước khi encode
    taken_date DATE,                     -- ngày chụp (user nhập hoặc auto = today)
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_photos_taken_date  ON photos(taken_date DESC);
CREATE INDEX idx_photos_created_at  ON photos(created_at DESC);
CREATE INDEX idx_photos_uploaded_by ON photos(uploaded_by);
