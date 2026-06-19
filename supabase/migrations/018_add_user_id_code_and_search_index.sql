-- Migration: Add user ID code system and search index

-- Add user_id_code column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS user_id_code VARCHAR(10);

-- Add privacy and statistics columns to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS public_profile BOOLEAN DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_restaurants_visited INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_lists INTEGER DEFAULT 0;

-- Create sequence for user ID generation
CREATE SEQUENCE IF NOT EXISTS user_id_sequence START 1 INCREMENT 1;

-- Create function to generate user ID code
CREATE OR REPLACE FUNCTION generate_user_id_code()
RETURNS TRIGGER AS $$
DECLARE
    next_id INTEGER;
    user_code VARCHAR(10);
BEGIN
    -- Get next sequence value
    SELECT nextval('user_id_sequence') INTO next_id;
    
    -- Format as FL000001
    user_code := 'FL' || LPAD(next_id::TEXT, 6, '0');
    
    -- Update the new profile record
    NEW.user_id_code := user_code;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically generate user ID code
DROP TRIGGER IF EXISTS trigger_generate_user_id_code ON public.profiles;
CREATE TRIGGER trigger_generate_user_id_code
    BEFORE INSERT ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION generate_user_id_code();

-- Create user search index table
CREATE TABLE IF NOT EXISTS public.user_search_index (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    display_name TEXT,
    location TEXT,
    bio TEXT,
    search_vector TSVECTOR,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create function to update search index
CREATE OR REPLACE FUNCTION update_user_search_index()
RETURNS TRIGGER AS $$
BEGIN
    -- Delete existing index entry if updating
    DELETE FROM public.user_search_index WHERE user_id = NEW.user_id;
    
    -- Insert new search index entry
    INSERT INTO public.user_search_index (
        user_id,
        display_name,
        location,
        bio,
        search_vector
    ) VALUES (
        NEW.user_id,
        NEW.display_name,
        NEW.location,
        NEW.bio,
        to_tsvector('portuguese', 
            COALESCE(NEW.display_name, '') || ' ' || 
            COALESCE(NEW.location, '') || ' ' || 
            COALESCE(NEW.bio, '')
        )
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update search index
DROP TRIGGER IF EXISTS trigger_update_user_search_index ON public.profiles;
CREATE TRIGGER trigger_update_user_search_index
    AFTER INSERT OR UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_user_search_index();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id_code ON public.profiles(user_id_code);
CREATE INDEX IF NOT EXISTS idx_user_search_index_search_vector ON public.user_search_index USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_user_search_index_location ON public.user_search_index(location);
CREATE INDEX IF NOT EXISTS idx_user_search_index_display_name ON public.user_search_index(display_name);

-- Update RLS policies for new tables
ALTER TABLE public.user_search_index ENABLE ROW LEVEL SECURITY;

-- Create policy for user search index (read-only for authenticated users)
DO $$
BEGIN
    -- Check if the policy already exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'user_search_index' 
        AND policyname = 'Users can read search index'
    ) THEN
        CREATE POLICY "Users can read search index" ON public.user_search_index
            FOR SELECT USING (auth.role() = 'authenticated');
    END IF;
    
    -- Check if the second policy already exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'user_search_index' 
        AND policyname = 'Users cannot modify search index'
    ) THEN
        CREATE POLICY "Users cannot modify search index" ON public.user_search_index
            FOR ALL USING (false);
    END IF;
END $$;

-- Grant necessary permissions
GRANT USAGE ON SEQUENCE user_id_sequence TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.user_search_index TO authenticated;

-- Update existing profiles with user ID codes
-- This will only run for profiles that don't already have a user_id_code
DO $$
DECLARE
    profile_record RECORD;
    next_id INTEGER;
    user_code VARCHAR(10);
BEGIN
    FOR profile_record IN 
        SELECT id, user_id FROM public.profiles WHERE user_id_code IS NULL
    LOOP
        -- Get next sequence value
        SELECT nextval('user_id_sequence') INTO next_id;
        
        -- Format as FL000001
        user_code := 'FL' || LPAD(next_id::TEXT, 6, '0');
        
        -- Update profile
        UPDATE public.profiles 
        SET user_id_code = user_code 
        WHERE id = profile_record.id;
    END LOOP;
END $$;

-- Update existing search index entries
INSERT INTO public.user_search_index (user_id, display_name, location, bio, search_vector)
SELECT 
    p.user_id,
    p.display_name,
    p.location,
    p.bio,
    to_tsvector('portuguese', 
        COALESCE(p.display_name, '') || ' ' || 
        COALESCE(p.location, '') || ' ' || 
        COALESCE(p.bio, '')
    )
FROM public.profiles p
WHERE NOT EXISTS (
    SELECT 1 FROM public.user_search_index si WHERE si.user_id = p.user_id
);