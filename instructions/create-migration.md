# Instructions: Create a Database Migration

Follow this step-by-step guide when creating a database migration.

---

## Step 1: Determine Migration Type

- **New table** - Creating a new table
- **Alter table** - Adding/modifying columns
- **New RLS policy** - Adding security policies
- **New index** - Adding indexes for performance
- **Seed data** - Adding initial data

---

## Step 2: Create the Migration File

```
supabase/migrations/YYYYMMDDHHMMSS_description.sql
```

**Naming convention:**
- Date format: `YYYYMMDDHHMMSS`
- Description: lowercase, underscores
- Examples: `20260405170000_create_bookmarks.sql`

---

## Step 3: Write the Migration

### New Table Template
```sql
-- Create table
CREATE TABLE IF NOT EXISTS table_name (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_table_name_user_id ON table_name(user_id);
CREATE INDEX idx_table_name_created_at ON table_name(created_at);

-- Enable RLS
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "table_name_select_policy"
  ON table_name FOR SELECT
  USING (true);

CREATE POLICY "table_name_insert_policy"
  ON table_name FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "table_name_update_policy"
  ON table_name FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "table_name_delete_policy"
  ON table_name FOR DELETE
  USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE TRIGGER update_table_name_updated_at
  BEFORE UPDATE ON table_name
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comment
COMMENT ON TABLE table_name IS 'Description of the table';
```

### Add Column Template
```sql
-- Add column
ALTER TABLE table_name
  ADD COLUMN IF NOT EXISTS column_name VARCHAR(255);

-- Add index if needed
CREATE INDEX IF NOT EXISTS idx_table_name_column ON table_name(column_name);

-- Add comment
COMMENT ON COLUMN table_name.column_name IS 'Description of the column';
```

### Add RLS Policy Template
```sql
-- Check if policy exists before creating
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'table_name' 
    AND policyname = 'table_name_new_policy'
  ) THEN
    CREATE POLICY "table_name_new_policy"
      ON table_name FOR ALL
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;
```

### Seed Data Template
```sql
-- Insert seed data (ignore duplicates)
INSERT INTO table_name (name, description) VALUES
  ('Option 1', 'Description 1'),
  ('Option 2', 'Description 2'),
  ('Option 3', 'Description 3')
ON CONFLICT (name) DO NOTHING;
```

---

## Step 4: Checklist

- [ ] Create migration file with proper naming
- [ ] Use `IF NOT EXISTS` for safety
- [ ] Add indexes for frequently queried columns
- [ ] Enable RLS and create policies
- [ ] Add `updated_at` trigger if table is mutable
- [ ] Test migration locally
- [ ] Update `types/database.ts` if needed
- [ ] Document changes in `docs/database-schema-reference.md`

---

## Step 5: Apply Migration

### Via Supabase Dashboard
1. Go to SQL Editor
2. Copy migration content
3. Execute and verify

### Via Supabase CLI
```bash
supabase db push
```

### Verify Migration
```sql
-- Check table exists
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'table_name';

-- Check columns
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'table_name';

-- Check policies
SELECT policyname, cmd FROM pg_policies 
WHERE tablename = 'table_name';
```

---

## Rollback

Always keep rollback SQL as comments at the end of the file:

```sql
-- ROLLBACK:
-- DROP TABLE IF EXISTS table_name CASCADE;
-- or
-- ALTER TABLE table_name DROP COLUMN IF EXISTS column_name;
```

---

## Common Patterns

### Junction Table (Many-to-Many)
```sql
CREATE TABLE IF NOT EXISTS table1_table2 (
  table1_id UUID NOT NULL REFERENCES table1(id) ON DELETE CASCADE,
  table2_id UUID NOT NULL REFERENCES table2(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (table1_id, table2_id)
);

-- No RLS needed for junction tables (inherited from parent tables)
```

### Full-Text Search Column
```sql
-- Add search vector column
ALTER TABLE table_name ADD COLUMN search_vector tsvector;

-- Create trigger function
CREATE OR REPLACE FUNCTION update_table_name_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_table_name_search_vector
  BEFORE INSERT OR UPDATE ON table_name
  FOR EACH ROW
  EXECUTE FUNCTION update_table_name_search_vector();

-- Create GIN index
CREATE INDEX idx_table_name_search ON table_name USING GIN(search_vector);
```

---

## Reference Files

- `agents/database-agent.md` - Database patterns
- `docs/database-schema-reference.md` - Current schema
- `supabase/database.sql` - Main schema file

---

*Last updated: 2026-04-05*