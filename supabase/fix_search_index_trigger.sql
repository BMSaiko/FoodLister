-- Fix the search index trigger function to use SECURITY DEFINER
-- This allows the trigger to bypass RLS policies when updating the search index

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

-- Grant necessary permissions for the function to work
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_search_index TO authenticated;

-- Test the function by updating a profile
-- UPDATE public.profiles SET display_name = display_name WHERE id = (SELECT id FROM public.profiles LIMIT 1);

-- Verify the function exists and has the correct security setting
SELECT proname, prosecdef FROM pg_proc WHERE proname = 'update_user_search_index';