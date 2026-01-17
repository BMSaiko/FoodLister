#!/usr/bin/env node

/**
 * Migration script to associate existing BMS user data
 * Run with: node scripts/migrate-bms-user.js
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role key for admin operations

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateBMSUser() {
  try {
    console.log('🔍 Finding user with email "1221514@isep.ipp.pt"...');

    // Find the user
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers();

    if (userError) {
      throw new Error(`Failed to list users: ${userError.message}`);
    }

    const bmsUser = userData.users.find(user => user.email === '1221514@isep.ipp.pt');

    if (!bmsUser) {
      console.error('❌ User with email "1221514@isep.ipp.pt" not found!');
      console.log('📝 Please create the user account first, then run this script again.');
      process.exit(1);
    }

    const userId = bmsUser.id;
    console.log(`✅ Found user: ${bmsUser.email} (ID: ${userId})`);

    // Count existing BMS data
    console.log('📊 Counting existing BMS data...');

    const { count: restaurantCount, error: restaurantCountError } = await supabase
      .from('restaurants')
      .select('*', { count: 'exact', head: true })
      .eq('creator', 'BMS');

    if (restaurantCountError) {
      throw new Error(`Failed to count restaurants: ${restaurantCountError.message}`);
    }

    const { count: listCount, error: listCountError } = await supabase
      .from('lists')
      .select('*', { count: 'exact', head: true })
      .eq('creator', 'BMS');

    if (listCountError) {
      throw new Error(`Failed to count lists: ${listCountError.message}`);
    }

    console.log(`📈 Found ${restaurantCount} restaurants and ${listCount} lists created by "BMS"`);

    if (restaurantCount === 0 && listCount === 0) {
      console.log('ℹ️  No data to migrate. All BMS data may already be associated.');
      return;
    }

    // Set user display name to "BMS" if not already set
    const displayName = 'BMS';

    console.log(`👤 Setting display name to: "${displayName}"`);

    // Update user metadata
    const { error: updateError } = await supabase.auth.admin.updateUserById(bmsUser.id, {
      user_metadata: {
        name: displayName,
        ...bmsUser.raw_user_meta_data
      }
    });

    if (updateError) {
      throw new Error(`Failed to update user metadata: ${updateError.message}`);
    }

    console.log(`✅ User display name updated to: "${displayName}"`);

    // Migrate restaurants
    if (restaurantCount > 0) {
      console.log('🍽️  Migrating restaurants...');

      const { data: updatedRestaurants, error: restaurantError } = await supabase
        .from('restaurants')
        .update({
          creator_id: userId,
          creator_name: displayName
        })
        .eq('creator', 'BMS')
        .select('id, name');

      if (restaurantError) {
        throw new Error(`Failed to migrate restaurants: ${restaurantError.message}`);
      }

      console.log(`✅ Migrated ${updatedRestaurants.length} restaurants`);
    }

    // Migrate lists
    if (listCount > 0) {
      console.log('📋 Migrating lists...');

      const { data: updatedLists, error: listError } = await supabase
        .from('lists')
        .update({
          creator_id: userId,
          creator_name: displayName
        })
        .eq('creator', 'BMS')
        .select('id, name');

      if (listError) {
        throw new Error(`Failed to migrate lists: ${listError.message}`);
      }

      console.log(`✅ Migrated ${updatedLists.length} lists`);
    }

    // Verification
    console.log('🔍 Verifying migration...');

    const { count: finalRestaurantCount, error: verifyRestaurantError } = await supabase
      .from('restaurants')
      .select('*', { count: 'exact', head: true })
      .eq('creator_id', userId);

    const { count: finalListCount, error: verifyListError } = await supabase
      .from('lists')
      .select('*', { count: 'exact', head: true })
      .eq('creator_id', userId);

    if (verifyRestaurantError || verifyListError) {
      console.warn('⚠️  Could not verify migration counts');
    } else {
      console.log(`🎉 Migration completed successfully!`);
      console.log(`   User ${bmsUser.email} now owns:`);
      console.log(`   - ${finalRestaurantCount} restaurants`);
      console.log(`   - ${finalListCount} lists`);
    }

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Run the migration
migrateBMSUser();
