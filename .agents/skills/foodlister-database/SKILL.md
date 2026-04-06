---
name: foodlister-database
description: FoodLister database development patterns. Use when creating tables, writing SQL migrations, configuring RLS policies, optimizing queries, or working with Supabase database features. Covers PostgreSQL patterns, migration templates, RLS policies, full-text search, and query optimization. Triggers when working with supabase/, SQL files, database schema changes, or query optimization.
---

# FoodLister Database Patterns

Project-specific database patterns for FoodLister (PostgreSQL + Supabase).

## Core Rules

### Migration Structure
```
supabase/
+-- migrations/          # Versioned migrations
+-- database.sql         # Main schema
+-- create_reviews_table.sql
+-- fix_duplicate_policy.sql
+-- optimizations.sql
+-- seed_*.sql           # Seed data
```

### Naming Conventions
- **Tables**: plural, snake_case (`restaurants`, `user_lists`)
- **Columns**: snake_case (`created_at`, `user_id`, `restaurant_name`)
- **Indexes**: `idx_[table]_[columns]` (`idx_restaurants_name`)
- **Foreign Keys**: `[table]_[column]_fkey` (`user_lists_user_id_fkey`)
- **RLS Policies**: `[table]_[action]_policy` (`restaurants_select_policy`)

## Table Template

```sql
CREATE TABLE IF NOT EXISTS restaurants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(500) NOT NULL,
  phone VARCHAR(50),
  cuisine_type VARCHAR(100),
  rating DECIMAL(2, 1) DEFAULT 0,
  image_url TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_restaurants_name ON restaurants(name);
CREATE INDEX idx_restaurants_cuisine ON restaurants(cuisine_type);
CREATE INDEX idx_restaurants_user_id ON restaurants(user_id);

-- RLS
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "restaurants_select_policy" ON restaurants FOR SELECT USING (true);
CREATE POLICY "restaurants_insert_policy" ON restaurants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "restaurants_update_policy" ON restaurants FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "restaurants_delete_policy" ON restaurants FOR DELETE USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_restaurants_updated_at
  BEFORE UPDATE ON restaurants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## RLS Policy Patterns

### Public (read)
```sql
CREATE POLICY "table_select_policy" ON table_name FOR SELECT USING (true);
```

### Owner only
```sql
CREATE POLICY "table_owner_policy" ON table_name FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### Authenticated read, owner write
```sql
CREATE POLICY "table_select_authenticated" ON table_name FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "table_owner_write" ON table_name FOR INSERT/UPDATE/DELETE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

## Full-Text Search

```sql
-- Add search column
ALTER TABLE restaurants ADD COLUMN search_vector tsvector;

-- Trigger to update
CREATE OR REPLACE FUNCTION update_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.cuisine_type, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_restaurants_search_vector
  BEFORE INSERT OR UPDATE ON restaurants
  FOR EACH ROW
  EXECUTE FUNCTION update_search_vector();

-- Index
CREATE INDEX idx_restaurants_search ON restaurants USING GIN(search_vector);

-- Query
SELECT * FROM restaurants
WHERE search_vector @@ to_tsquery('english', 'italian & pizza');
```

## Migration Template

```sql
-- supabase/migrations/YYYYMMDDHHMMSS_create_table_name.sql
BEGIN;

CREATE TABLE IF NOT EXISTS table_name (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  -- columns...
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_table_name_column ON table_name(column);

-- RLS
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "table_name_select_policy" ON table_name FOR SELECT USING (true);
CREATE POLICY "table_name_insert_policy" ON table_name FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "table_name_update_policy" ON table_name FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "table_name_delete_policy" ON table_name FOR DELETE USING (auth.uid() = user_id);

COMMIT;

-- Down migration (rollback)
-- DROP TABLE IF EXISTS table_name CASCADE;
```

## Checklist for New Tables

- [ ] Define primary key (`uuid DEFAULT gen_random_uuid()`)
- [ ] Add `created_at TIMESTAMPTZ DEFAULT NOW()`
- [ ] Add `updated_at TIMESTAMPTZ DEFAULT NOW()`
- [ ] Define foreign keys with appropriate `ON DELETE`
- [ ] Create RLS policies (SELECT, INSERT, UPDATE, DELETE)
- [ ] Add indexes for frequently queried columns
- [ ] Add trigger for `updated_at`
- [ ] Create migration in `supabase/migrations/`
- [ ] Update `types/database.ts`
- [ ] Test queries manually

## Query Optimization

### Avoid
| Bad | Good |
|-----|------|
| `SELECT *` | `SELECT id, name, ...` |
| Uncorrelated subqueries | JOINs |
| `LIKE 'xterm-256color'` | Full-text search |
| Multiple queries | CTEs or JOINs |
| No WHERE on large tables | Specific filters |

## Common Errors to Avoid

1. Forgetting RLS policies � table becomes inaccessible
2. Duplicate policies � use `IF NOT EXISTS` or check first
3. Not creating indexes � slow queries on large tables
4. Foreign keys without ON DELETE � orphan records
5. Not using transactions for multiple operations
6. UUID vs BIGINT inconsistency � be consistent
7. Not testing migrations in staging
