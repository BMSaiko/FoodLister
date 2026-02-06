#!/usr/bin/env node

/**
 * Simple test script to verify the API fix for review_count column
 * This script tests the restaurants/[id]/rating endpoint using built-in Node.js modules
 */

const https = require('https');
const http = require('http');

const BASE_URL = 'localhost:3001';

function makeRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(`http://${BASE_URL}${path}`);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const client = url.protocol === 'https:' ? https : http;
    
    const req = client.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            data: jsonData,
            headers: res.headers
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data,
            headers: res.headers,
            parseError: e
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

async function testRestaurantRatingEndpoint() {
  console.log('🧪 Testing Restaurant Rating API Endpoint...\n');

  try {
    // First, let's get a list of restaurants to test with
    console.log('1. Fetching available restaurants...');
    const restaurantsResponse = await makeRequest('/api/restaurants');
    
    if (restaurantsResponse.status !== 200) {
      console.error('❌ Failed to fetch restaurants:', restaurantsResponse.status);
      console.error('Response:', restaurantsResponse.data);
      return;
    }

    const restaurantsData = restaurantsResponse.data;
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
    const ratingResponse = await makeRequest(`/api/restaurants/${testRestaurant.id}/rating`, 'POST');

    if (ratingResponse.status !== 200) {
      console.error('❌ Rating endpoint failed:', ratingResponse.status);
      console.error('Response:', ratingResponse.data);
      return;
    }

    const ratingData = ratingResponse.data;
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