-- Migration 055: Batch update list restaurant positions (N+1 fix)
-- Replaces per-row UPDATE loop in app/api/lists/[id]/route.ts with single RPC call
-- Author: HEIMDALL performance overhaul 2026-06-26

CREATE OR REPLACE FUNCTION update_list_restaurant_positions(
  p_list_id UUID,
  p_restaurant_ids UUID[]
)
RETURNS VOID AS $$
BEGIN
  -- Update positions for all restaurants in the list using array index
  UPDATE list_restaurants lr
  SET position = idx - 1
  FROM unnest(p_restaurant_ids) WITH ORDINALITY AS t(restaurant_id, idx)
  WHERE lr.list_id = p_list_id
    AND lr.restaurant_id = t.restaurant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verification (uncomment to test):
-- SELECT update_list_restaurant_positions(
--   'your-list-uuid'::UUID,
--   ARRAY['restaurant-uuid-1', 'restaurant-uuid-2']::UUID[]
-- );
