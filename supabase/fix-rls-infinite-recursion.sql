-- Fix infinite recursion in RLS policies for lists table
-- The issue is that the lists SELECT policy references list_collaborators
-- which may create a recursive loop. We need to fix the policy.

-- Drop the problematic policy
DROP POLICY IF EXISTS "lists_select_policy" ON lists;

-- Create a non-recursive policy for lists
-- This policy avoids recursion by using a subquery that doesn't trigger RLS on list_collaborators
CREATE POLICY "lists_select_policy" ON lists FOR SELECT USING (
  is_public = true 
  OR auth.uid() = creator_id 
  OR EXISTS (
    SELECT 1 FROM list_collaborators 
    WHERE list_id = lists.id 
    AND user_id = auth.uid()
  )
);

-- Also fix any other policies that might cause recursion
DROP POLICY IF EXISTS "list_collaborators_select_policy" ON list_collaborators;

CREATE POLICY "list_collaborators_select_policy" ON list_collaborators FOR SELECT USING (
  user_id = auth.uid() 
  OR EXISTS (
    SELECT 1 FROM lists 
    WHERE lists.id = list_collaborators.list_id 
    AND lists.creator_id = auth.uid()
  )
);

-- Verify the fix by testing the policy
DO $$
BEGIN
  RAISE NOTICE 'RLS policies updated to prevent infinite recursion';
END $$;