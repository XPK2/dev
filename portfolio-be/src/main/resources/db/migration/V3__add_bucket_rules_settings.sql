-- V3__add_bucket_rules_settings.sql

-- Couple settings (anniversary date, names, avatars...)
CREATE TABLE IF NOT EXISTS couple_settings (
    id BIGINT PRIMARY KEY DEFAULT 1,
    start_date DATE NOT NULL DEFAULT '2025-12-24',
    user1_nickname VARCHAR(100) DEFAULT 'Huy',
    user2_nickname VARCHAR(100) DEFAULT 'Hà',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO couple_settings (id, start_date, user1_nickname, user2_nickname)
VALUES (1, '2025-12-24', 'Huy', 'Hà')
ON CONFLICT DO NOTHING;

-- Bucket list items
CREATE TABLE IF NOT EXISTS bucket_items (
    id BIGSERIAL PRIMARY KEY,
    text VARCHAR(500) NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_by BIGINT NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bucket_items_created_at ON bucket_items(created_at DESC);

-- Family rules
CREATE TABLE IF NOT EXISTS family_rules (
    id BIGSERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    created_by BIGINT NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_family_rules_order ON family_rules(display_order ASC);

-- Upcoming events
CREATE TABLE IF NOT EXISTS events (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    event_date DATE NOT NULL,
    emoji VARCHAR(10) DEFAULT '🎉',
    created_by BIGINT NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_events_date ON events(event_date ASC);

-- Seed default bucket list items
INSERT INTO bucket_items (text, completed, created_by) VALUES
    ('Travel to Da Lat together', true, 1),
    ('Cook a romantic dinner', true, 1),
    ('Watch sunset at the beach', false, 1),
    ('Wear matching clothes in public', false, 1),
    ('Late night movie date', false, 1),
    ('Surprise gifts for no reason', false, 1)
ON CONFLICT DO NOTHING;

-- Seed default family rules
INSERT INTO family_rules (content, display_order, created_by) VALUES
    ('Never go to sleep angry.', 1, 1),
    ('Always say I love you before leaving.', 2, 1),
    ('If one cooks, the other cleans the dishes.', 3, 1),
    ('Surprise each other at least once a month.', 4, 1),
    ('Honesty is our best policy, always.', 5, 1),
    ('No phones during our special dinner dates.', 6, 1)
ON CONFLICT DO NOTHING;

-- Seed upcoming events
INSERT INTO events (title, event_date, emoji, created_by) VALUES
    ('Valentine''s Day', '2027-02-14', '💝', 1),
    ('New Year', '2027-01-01', '🎊', 1),
    ('Christmas', '2026-12-24', '🎄', 1)
ON CONFLICT DO NOTHING;
