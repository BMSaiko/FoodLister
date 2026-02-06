# Fix for "column restaurants.review_count does not exist" Error

## Problem Description

The application was throwing a database error when trying to fetch restaurant data:

```
Error: column restaurants.review_count does not exist
```

This error occurred in the API endpoint `/api/restaurants/[id]/rating` when the code tried to select the `review_count` column from the `restaurants` table, but this column didn't exist in the database schema.

## Root Cause

The `restaurants` table in the database schema was missing the `review_count` column that was being referenced in several API endpoints and type definitions. The application expected this column to exist to efficiently track the number of reviews for each restaurant.

## Solution

### 1. Database Migration

Created a migration script that adds the missing `review_count` column and sets up automatic maintenance:

**File:** `supabase/migrations/20260206140946_add_review_count_to_restaurants.sql`

**What it does:**
- Adds `review_count` column to the `restaurants` table (integer, default 0)
- Creates a trigger function `update_restaurant_review_count()` that automatically updates the review count whenever reviews are added, updated, or deleted
- Creates a trigger `trigger_update_restaurant_review_count` on the `reviews` table to call the function
- Updates existing restaurants with their current review counts
- Grants necessary permissions

### 2. API Compatibility Fix

**File:** `app/api/restaurants/[id]/rating/route.ts`

Added backward compatibility to handle cases where the migration hasn't been applied yet:

```typescript
// If review_count column doesn't exist, fetch without it and calculate manually
if (fetchError && fetchError.code === '42703' && fetchError.message.includes('review_count')) {
  // Fallback logic to calculate review count manually
}
```

This ensures the application continues to work even before the migration is applied.

### 3. Migration Scripts

**Manual SQL Script:** `scripts/add-review-count-column.sql`
- Can be run directly in the Supabase SQL editor
- Contains all the migration SQL commands

**Node.js Script:** `scripts/apply-review-count-migration.js`
- Programmatic way to apply the migration
- Requires proper Supabase credentials

## How to Apply the Fix

### Option 1: Manual SQL (Recommended)

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `scripts/add-review-count-column.sql`
4. Execute the script

### Option 2: Using Supabase CLI

1. Ensure Supabase CLI is installed and configured
2. Run: `npx supabase migration up`
3. This will apply the migration from `supabase/migrations/20260206140946_add_review_count_to_restaurants.sql`

### Option 3: Using Node.js Script

1. Set environment variables:
   ```bash
   export NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
   export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
   ```
2. Run: `node scripts/apply-review-count-migration.js`

## What the Migration Does

1. **Adds the Column**: `ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;`

2. **Creates Automatic Maintenance**: 
   - Function that recalculates review count when reviews change
   - Trigger that calls the function on review insert/update/delete

3. **Populates Existing Data**:
   - Updates all existing restaurants with their current review counts

4. **Sets Permissions**:
   - Grants necessary access to the trigger function

## Benefits

- **Performance**: No need to count reviews on every request
- **Data Consistency**: Review counts are always accurate and up-to-date
- **Backward Compatibility**: Application works during migration
- **Automatic Maintenance**: No manual intervention needed

## Verification

After applying the migration, you can verify it worked by:

1. Checking that the column exists:
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'restaurants' AND column_name = 'review_count';
   ```

2. Testing the API endpoint that was previously failing

3. Verifying that review counts update automatically when reviews are added/removed

## Files Modified/Created

- `supabase/migrations/20260206140946_add_review_count_to_restaurants.sql` (created)
- `app/api/restaurants/[id]/rating/route.ts` (modified - added compatibility)
- `scripts/add-review-count-column.sql` (created)
- `scripts/apply-review-count-migration.js` (created)
- `docs/fix-review-count-error.md` (created - this file)

## Notes

- The migration uses `IF NOT EXISTS` clauses to prevent errors if run multiple times
- The trigger function handles all CRUD operations on reviews
- The API compatibility layer will be automatically bypassed once the column exists
- This fix maintains full backward compatibility with existing data