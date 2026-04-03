#!/usr/bin/env node

/**
 * Apply Review Count Migration Script
 * 
 * This script applies the review_count column migration to the restaurants table
 * to fix the "column restaurants.review_count does not exist" error.
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration - Update these with your Supabase project details
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SERVICE_ROLE_KEY';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || SUPABASE_URL.includes('YOUR_') || SUPABASE_SERVICE_ROLE_KEY.includes('YOUR_')) {
  console.error('❌ Please set your Supabase URL and Service Role Key in environment variables');
  console.error('   NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const migrationSQL = `
-- Add review_count column to restaurants table
ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;

-- Create function to update restaurant review count
CREATE OR REPLACE FUNCTION update_restaurant_review_count()
RETURNS TRIGGER AS $$
DECLARE
    restaurant_id_to_update UUID;
BEGIN
    -- Determine which restaurant to update based on the operation
    IF TG_OP = 'DELETE' THEN
        restaurant_id_to_update := OLD.restaurant_id;
    ELSE
        restaurant_id_to_update := NEW.restaurant_id;
    END IF;

    -- Update the review count for the restaurant
    UPDATE public.restaurants SET
        review_count = (
            SELECT COUNT(*) FROM public.reviews 
            WHERE restaurant_id = restaurant_id_to_update
        )
    WHERE id = restaurant_id_to_update;

    -- Return appropriate row based on operation
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_update_restaurant_review_count ON public.reviews;

-- Create trigger for reviews table to update review_count
CREATE TRIGGER trigger_update_restaurant_review_count
    AFTER INSERT OR UPDATE OR DELETE ON public.reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_restaurant_review_count();

-- Update existing restaurants with correct review counts
UPDATE public.restaurants SET
    review_count = (
        SELECT COUNT(*) FROM public.reviews 
        WHERE restaurant_id = restaurants.id
    );

-- Grant permissions
GRANT ALL ON FUNCTION update_restaurant_review_count() TO authenticated;
`;

async function applyMigration() {
  console.log('🚀 Applying review_count migration...');
  
  try {
    // Execute the migration SQL
    const { data, error } = await supabase.rpc('execute_sql', { 
      sql: migrationSQL 
    });
    
    if (error) {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    }
    
    console.log('✅ Migration applied successfully!');
    console.log('📝 Added review_count column to restaurants table');
    console.log('🔧 Created trigger to automatically update review counts');
    console.log('📊 Updated existing restaurants with correct review counts');
    
  } catch (error) {
    console.error('❌ Error applying migration:', error);
    process.exit(1);
  }
}

// Run the migration
applyMigration();