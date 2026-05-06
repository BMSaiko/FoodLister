-- Fix "user_id is ambiguous" error
-- The issue is that the can_access_list function parameter is named user_id,
-- which can conflict with table columns named user_id in SQL queries

-- Drop the existing function
DROP FUNCTION IF EXISTS can_access_list(uuid, uuid);
DROP FUNCTION IF EXISTS is_list_collaborator(uuid, uuid);

-- Recreate with parameter names that won't conflict (using p_ prefix)
CREATE OR REPLACE FUNCTION can_access_list(p_list_id uuid, p_user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM lists l
    WHERE l.id = p_list_id
    AND (
      l.is_public = true 
      OR l.creator_id = p_user_id
      OR EXISTS (
        SELECT 1 FROM list_collaborators lc
        WHERE lc.list_id = l.id
        AND lc.user_id = p_user_id
      )
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Recreate is_list_collaborator with non-conflicting parameter names
CREATE OR REPLACE FUNCTION is_list_collaborator(p_list_id uuid, p_user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM list_collaborators lc
    WHERE lc.list_id = p_list_id
    AND lc.user_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Update the RLS policies to use the new function parameter names (same call syntax)
-- Note: The function call syntax doesn't change, just the internal parameter names

-- Grant execute permission
GRANT EXECUTE ON FUNCTION can_access_list(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION is_list_collaborator(uuid, uuid) TO authenticated;

-- Verify the fix
DO $$
BEGIN
  RAISE NOTICE 'user_id ambiguity fix applied successfully';
END $$;