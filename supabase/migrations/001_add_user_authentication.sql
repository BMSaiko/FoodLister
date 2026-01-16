-- Migration: Add user authentication support
-- This migration adds user authentication fields and updates RLS policies

-- Add user authentication columns to restaurants table
ALTER TABLE restaurants
ADD COLUMN creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN creator_name TEXT;

-- Add user authentication columns to lists table
ALTER TABLE lists
ADD COLUMN creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN creator_name TEXT;

-- Update existing records to set creator_name from creator field (if exists)
UPDATE restaurants SET creator_name = creator WHERE creator IS NOT NULL AND creator_name IS NULL;
UPDATE lists SET creator_name = creator WHERE creator IS NOT NULL AND creator_name IS NULL;

-- Create indexes for performance
CREATE INDEX idx_restaurants_creator_id ON restaurants(creator_id);
CREATE INDEX idx_lists_creator_id ON lists(creator_id);

-- Enable Row Level Security (RLS) on tables
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_cuisine_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE list_restaurants ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow read access to restaurants" ON restaurants;
DROP POLICY IF EXISTS "Allow insert access to restaurants" ON restaurants;
DROP POLICY IF EXISTS "Allow update access to own restaurants" ON restaurants;
DROP POLICY IF EXISTS "Allow delete access to own restaurants" ON restaurants;

DROP POLICY IF EXISTS "Allow read access to lists" ON lists;
DROP POLICY IF EXISTS "Allow insert access to lists" ON lists;
DROP POLICY IF EXISTS "Allow update access to own lists" ON lists;
DROP POLICY IF EXISTS "Allow delete access to own lists" ON lists;

-- Create new RLS policies for restaurants
CREATE POLICY "restaurants_select_policy" ON restaurants
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "restaurants_insert_policy" ON restaurants
FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = creator_id);

CREATE POLICY "restaurants_update_policy" ON restaurants
FOR UPDATE USING (auth.role() = 'authenticated' AND auth.uid() = creator_id);

CREATE POLICY "restaurants_delete_policy" ON restaurants
FOR DELETE USING (auth.role() = 'authenticated' AND auth.uid() = creator_id);

-- Create new RLS policies for lists
CREATE POLICY "lists_select_policy" ON lists
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "lists_insert_policy" ON lists
FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = creator_id);

CREATE POLICY "lists_update_policy" ON lists
FOR UPDATE USING (auth.role() = 'authenticated' AND auth.uid() = creator_id);

CREATE POLICY "lists_delete_policy" ON lists
FOR DELETE USING (auth.role() = 'authenticated' AND auth.uid() = creator_id);

-- Create RLS policies for junction tables (allow access to authenticated users)
CREATE POLICY "restaurant_cuisine_types_policy" ON restaurant_cuisine_types
FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "list_restaurants_policy" ON list_restaurants
FOR ALL USING (auth.role() = 'authenticated');

-- Create function to automatically set creator_id and creator_name on insert
CREATE OR REPLACE FUNCTION set_creator_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- Set creator_id to current user if not provided
  IF NEW.creator_id IS NULL THEN
    NEW.creator_id := auth.uid();
  END IF;

  -- Set creator_name from auth.users metadata if not provided
  IF NEW.creator_name IS NULL THEN
    SELECT COALESCE(raw_user_meta_data->>'name', raw_user_meta_data->>'full_name', email)
    INTO NEW.creator_name
    FROM auth.users
    WHERE id = NEW.creator_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers to automatically set creator fields
CREATE TRIGGER set_restaurant_creator_fields
  BEFORE INSERT ON restaurants
  FOR EACH ROW EXECUTE FUNCTION set_creator_fields();

CREATE TRIGGER set_list_creator_fields
  BEFORE INSERT ON lists
  FOR EACH ROW EXECUTE FUNCTION set_creator_fields();

-- Add comments for documentation
COMMENT ON COLUMN restaurants.creator_id IS 'UUID of the authenticated user who created this restaurant';
COMMENT ON COLUMN restaurants.creator_name IS 'Cached name of the creator for performance';
COMMENT ON COLUMN lists.creator_id IS 'UUID of the authenticated user who created this list';
COMMENT ON COLUMN lists.creator_name IS 'Cached name of the creator for performance';
