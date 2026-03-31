-- Fix Flyway Schema History - Run this on PostgreSQL database
-- This will reset the V1 migration checksum to allow Spring Boot to start

-- Delete the incorrect V1 record from flyway_schema_history
DELETE FROM flyway_schema_history WHERE version = 1;

-- The next time the application starts, Flyway will detect V1 as a new migration
-- and apply it correctly (or skip if the schema already exists with IF NOT EXISTS)
