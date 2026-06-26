-- Migration: Create exec_sql function for future migrations
-- Date: 2026-04-04

-- Create exec_sql function for dynamic SQL execution
CREATE OR REPLACE FUNCTION public.exec_sql(sql text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql;
END;
$$;

-- Restrict access to authenticated users only
REVOKE ALL ON FUNCTION public.exec_sql(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO authenticated;

COMMENT ON FUNCTION public.exec_sql(text) IS 'Execute dynamic SQL statements (SECURITY DEFINER)';