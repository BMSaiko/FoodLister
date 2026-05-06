-- ============================================
-- Fix RLS Infinite Recursion on lists table
-- ============================================

-- First, disable RLS temporarily to break any recursion cycles
ALTER TABLE lists DISABLE ROW LEVEL SECURITY;
ALTER TABLE list_collaborators DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies on lists and list_collaborators to start fresh
DROP POLICY IF EXISTS "lists_select_policy" ON lists;
DROP POLICY IF EXISTS "lists_insert_policy" ON lists;
DROP POLICY IF EXISTS "lists_update_policy" ON lists;
DROP POLICY IF EXISTS "lists_delete_policy" ON lists;
DROP POLICY IF EXISTS "list_collaborators_select_policy" ON list_collaborators;
DROP POLICY IF EXISTS "list_collaborators_insert_policy" ON list_collaborators;
DROP POLICY IF EXISTS "list_collaborators_update_policy" ON list_collaborators;
DROP POLICY IF EXISTS "list_collaborators_delete_policy" ON list_collaborators;

-- Re-enable RLS
ALTER TABLE lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE list_collaborators ENABLE ROW LEVEL SECURITY;

-- Create a SECURITY DEFINER function to check list access (bypasses RLS)
CREATE OR REPLACE FUNCTION can_access_list(list_id uuid, user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM lists
    WHERE id = list_id
    AND (
      is_public = true 
      OR creator_id = user_id
      OR EXISTS (
        SELECT 1 FROM list_collaborators
        WHERE list_collaborators.list_id = lists.id
        AND list_collaborators.user_id = user_id
      )
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create a SECURITY DEFINER function to check collaborator access (bypasses RLS)
CREATE OR REPLACE FUNCTION is_list_collaborator(list_id uuid, user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM list_collaborators
    WHERE list_collaborators.list_id = list_id
    AND list_collaborators.user_id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Now create NON-RECURSIVE policies using the security definer functions

-- Lists policies
CREATE POLICY "lists_select_policy" ON lists FOR SELECT USING (
  is_public = true 
  OR auth.uid() = creator_id 
  OR can_access_list(id, auth.uid())
);

CREATE POLICY "lists_insert_policy" ON lists FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "lists_update_policy" ON lists FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY "lists_delete_policy" ON lists FOR DELETE USING (auth.uid() = creator_id);

-- List collaborators policies (use security definer function to avoid recursion)
CREATE POLICY "list_collaborators_select_policy" ON list_collaborators FOR SELECT USING (
  user_id = auth.uid()
  OR can_access_list(list_id, auth.uid())
);

CREATE POLICY "list_collaborators_insert_policy" ON list_collaborators FOR INSERT WITH CHECK (
  can_access_list(list_id, auth.uid())
);

CREATE POLICY "list_collaborators_update_policy" ON list_collaborators FOR UPDATE USING (
  can_access_list(list_id, auth.uid())
);

CREATE POLICY "list_collaborators_delete_policy" ON list_collaborators FOR DELETE USING (
  can_access_list(list_id, auth.uid())
);

-- Grant execute permission on the helper functions
GRANT EXECUTE ON FUNCTION can_access_list(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION is_list_collaborator(uuid, uuid) TO authenticated;

-- Verify the fix
DO $$
BEGIN
  RAISE NOTICE 'RLS recursion fix applied successfully';
END $$;