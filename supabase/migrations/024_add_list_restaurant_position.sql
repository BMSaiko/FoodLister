-- Migration: Add position column to list_restaurants for ordering
-- Date: 2026-04-04

-- Add position column with default value
ALTER TABLE public.list_restaurants
ADD COLUMN IF NOT EXISTS position integer NOT NULL DEFAULT 0;

-- Create index for faster ordering
CREATE INDEX IF NOT EXISTS idx_list_restaurants_position 
ON public.list_restaurants(list_id, position);

-- Update existing records to have sequential positions
DO $$
DECLARE
  list_record RECORD;
  restaurant_index integer;
BEGIN
  FOR list_record IN SELECT DISTINCT list_id FROM public.list_restaurants LOOP
    restaurant_index := 0;
    UPDATE public.list_restaurants 
    SET position = restaurant_index
    WHERE list_id = list_record.list_id;
    
    -- Update with sequential positions based on restaurant_id ordering
    UPDATE public.list_restaurants lr
    SET position = sub.new_position
    FROM (
      SELECT 
        list_id,
        restaurant_id,
        ROW_NUMBER() OVER (ORDER BY restaurant_id) - 1 as new_position
      FROM public.list_restaurants
      WHERE list_id = list_record.list_id
    ) sub
    WHERE lr.list_id = sub.list_id 
      AND lr.restaurant_id = sub.restaurant_id;
  END LOOP;
END $$;

COMMENT ON COLUMN public.list_restaurants.position IS 'Position of restaurant in the list for custom ordering';