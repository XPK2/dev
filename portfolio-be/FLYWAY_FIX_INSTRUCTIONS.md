# Flyway Checksum Fix Guide

## Problem
The migration `V1__init_schema.sql` has a checksum mismatch between:
- Applied to database: `1018884179`
- Resolved locally: `-303924973`

This happens because the migration file was modified after it was already applied to the PostgreSQL database.

## Solution: Fix via PostgreSQL

If you have access to your PostgreSQL database, run these SQL commands:

```sql
-- Connect to your couple_db database
-- Then execute:

-- 1. Check current Flyway history
SELECT * FROM flyway_schema_history WHERE version = 1;

-- 2. Delete the mismatched record
DELETE FROM flyway_schema_history WHERE version = 1;

-- 3. Restart your application
-- Flyway will re-apply V1 with the correct checksum
```

## Step-by-Step for macOS/Docker

If using Docker Postgres:

```bash
# 1. Connect to the postgres container
docker exec -it couple-postgres psql -U couple_user -d couple_db

# 2. Inside psql, run:
DELETE FROM flyway_schema_history WHERE version = 1;

# 3. Exit psql (Ctrl+D or type \q)

# 4. Restart Spring Boot application
mvn spring-boot:run
```

## Alternative: Using pgAdmin

1. Open pgAdmin
2. Connect to your PostgreSQL server
3. Navigate to: couple_db > Schemas > public > Tables > flyway_schema_history
4. Select the row where `version = '1'`
5. Delete the row
6. Restart Spring Boot

## Current Configuration

The `application.yml` has been updated with:
```yaml
flyway:
  enabled: true
  baselineOnMigrate: true
  locations: classpath:db/migration
  outOfOrder: true
  cleanDisabled: true
```

This allows Flyway to:
- Apply migrations out of order (if needed)
- Prevent accidental database cleanup

## Why This Happened

During Phase 16, the media functionality was removed by:
1. Deleting the media package from Java code
2. Modifying `V1__init_schema.sql` to remove the media table

However, the PostgreSQL database already had `V1` recorded in its Flyway history with the original checksum. When the migration file was modified, Flyway detected a checksum mismatch and refused to proceed.

## Prevention for Future

When removing features from migrations:
- ✅ DO: Create a new migration file (V2, V3, etc.) 
- ✗ DON'T: Modify existing migration files that have been applied

That's why `V2__remove_media_table.sql` now exists as a separate migration file.
