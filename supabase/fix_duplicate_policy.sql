-- Fix duplicate policy error for user_search_index table
-- This script safely handles the policy creation to prevent duplicates

-- First, check if the policy already exists
DO $$
BEGIN
    -- Check if the policy exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'user_search_index' 
        AND policyname = 'Users can read search index'
    ) THEN
        RAISE NOTICE 'Policy "Users can read search index" already exists, skipping creation';
    ELSE
        -- Create the policy if it doesn't exist
        CREATE POLICY "Users can read search index" ON public.user_search_index
            FOR SELECT USING (auth.role() = 'authenticated');
        RAISE NOTICE 'Policy "Users can read search index" created successfully';
    END IF;
    
    -- Check if the second policy exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'user_search_index' 
        AND policyname = 'Users cannot modify search index'
    ) THEN
        RAISE NOTICE 'Policy "Users cannot modify search index" already exists, skipping creation';
    ELSE
        -- Create the second policy if it doesn't exist
        CREATE POLICY "Users cannot modify search index" ON public.user_search_index
            FOR ALL USING (false);
        RAISE NOTICE 'Policy "Users cannot modify search index" created successfully';
    END IF;
END $$;

-- Verify the policies exist
SELECT policyname, cmd, roles::text, qual::text 
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'user_search_index';
