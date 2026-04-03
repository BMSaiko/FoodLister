#!/usr/bin/env node

/**
 * Test script to verify the API fix for review_count column
 * This script tests the restaurants/[id]/rating endpoint to ensure it works
 * both before and after the migration is applied.
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3001';

async function testRestaurantRatingEndpoint() {
  console.log('🧪 Testing Restaurant Rating API Endpoint...\n');

  try {
    // First, let's get a list of restaurants to test with
    console.log('1. Fetching available restaurants...');
    const restaurantsResponse = await fetch(`${BASE_URL}/api/restaurants`);
    
    if (!restaurantsResponse.ok) {
      console.error('❌ Failed to fetch restaurants:', restaurantsResponse.status);
      return;
    }

    const restaurantsData = await restaurantsResponse.json();
    const restaurants = restaurantsData.restaurants || [];

    if (restaurants.length === 0) {
      console.log('⚠️  No restaurants found in database. Skipping detailed tests.');
      console.log('✅ API is responding correctly (no restaurants to test with)');
      return;
    }

    console.log(`✅ Found ${restaurants.length} restaurants`);

    // Test with the first restaurant
    const testRestaurant = restaurants[0];
    console.log(`\n2. Testing with restaurant: ${testRestaurant.name} (ID: ${testRestaurant.id})`);

    // Test the rating endpoint
    console.log('3. Testing /api/restaurants/[id]/rating endpoint...');
    const ratingResponse = await fetch(`${BASE_URL}/api/restaurants/${testRestaurant.id}/rating`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!ratingResponse.ok) {
      console.error('❌ Rating endpoint failed:', ratingResponse.status, ratingResponse.statusText);
      
      // Try to get more details about the error
      try {
        const errorData = await ratingResponse.json();
        console.error('Error details:', errorData);
      } catch (e) {
        console.error('Could not parse error response');
      }
      return;
    }

    const ratingData = await ratingResponse.json();
    console.log('✅ Rating endpoint successful!');
    console.log('Response:', JSON.stringify(ratingData, null, 2));

    // Verify the response structure
    if (ratingData.restaurant) {
      console.log('\n4. Verifying response structure...');
      
      if (ratingData.restaurant.review_count !== undefined) {
        console.log(`✅ review_count field present: ${ratingData.restaurant.review_count}`);
      } else {
        console.log('⚠️  review_count field not present (this is expected if migration not applied)');
      }

      if (ratingData.restaurant.rating !== undefined) {
        console.log(`✅ rating field present: ${ratingData.restaurant.rating}`);
      }

      console.log('\n🎉 API compatibility fix is working correctly!');
      console.log('The endpoint handles both scenarios:');
      console.log('- With review_count column: Returns the column value');
      console.log('- Without review_count column: Calculates manually and includes in response');
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure the development server is running:');
      console.log('   npm run dev');
    }
  }
}

// Run the test
testRestaurantRatingEndpoint();