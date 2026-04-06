-- V4__add_spin_places.sql

CREATE TABLE IF NOT EXISTS spin_places (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(20) NOT NULL DEFAULT 'food',   -- 'food' | 'drink'
    address VARCHAR(500),
    created_by BIGINT NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_spin_places_category ON spin_places(category);

-- Seed default places
INSERT INTO spin_places (name, category, address, created_by) VALUES
    ('Bún bò Huế Mẹ Tôi', 'food', 'Hà Nội', 1),
    ('Phở Thìn Lò Đúc', 'food', '13 Lò Đúc, Hà Nội', 1),
    ('Bánh mì Phượng', 'food', 'Hà Nội', 1),
    ('Cơm tấm Sài Gòn', 'food', 'Hà Nội', 1),
    ('Lẩu nấm Ashima', 'food', 'Hà Nội', 1),
    ('Bắp rang bơ + Netflix', 'food', 'Nhà mình 🏠', 1),
    ('The Coffee House', 'drink', 'Hà Nội', 1),
    ('Phúc Long', 'drink', 'Hà Nội', 1),
    ('Cộng Cà Phê', 'drink', 'Hà Nội', 1),
    ('Trà sữa Gong Cha', 'drink', 'Hà Nội', 1),
    ('Highlands Coffee', 'drink', 'Hà Nội', 1),
    ('Kem Tràng Tiền', 'drink', '35 Tràng Tiền, HN', 1)
ON CONFLICT DO NOTHING;
