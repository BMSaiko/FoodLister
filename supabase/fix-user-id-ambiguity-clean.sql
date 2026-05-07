-- Clean fix for "user_id is ambiguous" error
-- The problem: function parameters named user_id conflict with table column names

-- First, drop existing functions to start fresh
DROP FUNCTION IF EXISTS public.can_access_list(uuid, uuid) CASCADE;
DROP FUNCTION IF EXISTS public.is_list_collaborator(uuid, uuid) CASCADE;

-- Create function with parameters that CANNOT conflict with column names
-- Using p_ prefix to indicate "parameter"
CREATE OR REPLACE FUNCTION public.can_access_list(p_list_id uuid, p_user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.lists l
    WHERE l.id = p_list_id
    AND (
      l.is_public = true 
      OR l.creator_id = p_user_id
      OR EXISTS (
        SELECT 1 FROM public.list_collaborators lc
        WHERE lc.list_id = l.id
        AND lc.user_id = p_user_id
      )
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- Create helper function with non-conflicting parameter names
CREATE OR REPLACE FUNCTION public.is_list_collaborator(p_list_id uuid, p_user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.list_collaborators lc
    WHERE lc.list_id = p_list_id
    AND lc.user_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- Recreate the RLS policies using the new function
-- First disable RLS to avoid recursion during policy recreation
ALTER TABLE public.lists DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.list_collaborators DISABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS lists_select_policy ON public.lists;
DROP POLICY IF EXISTS lists_insert_policy ON public.lists;
DROP POLICY IF EXISTS lists_update_policy ON public.lists;
DROP POLICY IF EXISTS lists_delete_policy ON public.lists;
DROP POLICY IF EXISTS list_collaborators_select_policy ON public.list_collaborators;
DROP POLICY IF EXISTS list_collaborators_insert_policy ON public.list_collaborators;
DROP POLICY IF EXISTS list_collaborators_update_policy ON public.list_collaborators;
DROP POLICY IF EXISTS list_collaborators_delete_policy ON public.list_collaborators;

-- Re-enable RLS
ALTER TABLE public.lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.list_collaborators ENABLE ROW LEVEL SECURITY;

-- Create new policies using the fixed function
CREATE POLICY lists_select_policy ON public.lists FOR SELECT USING (
  is_public = true 
  OR auth.uid() = creator_id 
  OR public.can_access_list(id, auth.uid())
);

CREATE POLICY lists_insert_policy ON public.lists FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY lists_update_policy ON public.lists FOR UPDATE USING (auth.uid() = creator_id);
CREATE POLICY lists_delete_policy ON public.lists FOR DELETE USING (auth.uid() = creator_id);

CREATE POLICY list_collaborators_select_policy ON public.list_collaborators FOR SELECT USING (
  user_id = auth.uid()
  OR public.can_access_list(list_id, auth.uid())
);

CREATE POLICY list_collaborators_insert_policy ON public.list_collaborators FOR INSERT WITH CHECK (
  public.can_access_list(list_id, auth.uid())
);

CREATE POLICY list_collaborators_update_policy ON public.list_collaborators FOR UPDATE USING (
  public.can_access_list(list_id, auth.uid())
);

CREATE POLICY list_collaborators_delete_policy ON public.list_collaborators FOR DELETE USING (
  public.can_access_list(list_id, auth.uid())
);

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.can_access_list(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_list_collaborator(uuid, uuid) TO authenticated;

-- Verify the fix
DO $$
BEGIN
  RAISE NOTICE 'user_id ambiguity fix applied successfully - functions recreated with p_ prefix parameters';
END $$;