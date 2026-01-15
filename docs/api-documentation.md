# API Documentation

This document describes the API endpoints available in the FoodList application. The application primarily uses Supabase as the backend, so most data operations are handled through Supabase client queries rather than REST API endpoints.

## Overview

The FoodList application uses a hybrid architecture:
- **Frontend**: Next.js application with client-side data fetching
- **Backend**: Supabase (PostgreSQL database with real-time capabilities)
- **API Routes**: Minimal custom API routes, primarily for specific integrations

## Architecture

```
┌─────────────────┐    Supabase Client    ┌─────────────────┐
│   Next.js App   │◄────────────────────►│    Supabase      │
│   (Frontend)    │                       │   Database       │
└─────────────────┘                       └─────────────────┘
         │                                       │
         │                                       │
         ▼                                       ▼
┌─────────────────┐                     ┌─────────────────┐
│   API Routes    │                     │  Real-time       │
│   (Optional)    │                     │  Subscriptions   │
└─────────────────┘                     └─────────────────┘
```

## Available API Routes

### Places API

#### GET `/api/places/photo-wikimedia`

**Purpose**: Fetches Wikimedia photos for places (currently not implemented)

**Status**: Placeholder endpoint

**Parameters**: None

**Response**: TBD

**Usage**:
```javascript
// This endpoint is not currently implemented
fetch('/api/places/photo-wikimedia')
  .then(response => response.json())
  .then(data => console.log(data));
```

## Database Operations

While the application doesn't have many custom API routes, it performs extensive database operations through Supabase. Here are the main data operations:

### Restaurants

#### Fetch All Restaurants
```javascript
import { createClient } from '@/libs/supabase/client';

const supabase = createClient();

// Fetch restaurants with cuisine types
const { data, error } = await supabase
  .from('restaurants')
  .select(`
    *,
    cuisine_types:restaurant_cuisine_types(
      cuisine_type:cuisine_types(*)
    )
  `);
```

#### Create Restaurant
```javascript
const { data, error } = await supabase
  .from('restaurants')
  .insert({
    name: 'Restaurant Name',
    description: 'Description',
    location: 'Address',
    price_per_person: 25.50,
    rating: 4.5,
    creator: userId
  })
  .select();
```

#### Update Restaurant
```javascript
const { data, error } = await supabase
  .from('restaurants')
  .update({
    visited: true,
    rating: 4.8
  })
  .eq('id', restaurantId);
```

#### Delete Restaurant
```javascript
const { error } = await supabase
  .from('restaurants')
  .delete()
  .eq('id', restaurantId);
```

### Lists

#### Fetch All Lists
```javascript
const { data, error } = await supabase
  .from('lists')
  .select('*')
  .order('created_at', { ascending: false });
```

#### Create List
```javascript
const { data, error } = await supabase
  .from('lists')
  .insert({
    name: 'My Favorite Restaurants',
    description: 'A collection of my favorite places',
    creator: userId
  })
  .select();
```

#### Add Restaurant to List
```javascript
const { data, error } = await supabase
  .from('list_restaurants')
  .insert({
    list_id: listId,
    restaurant_id: restaurantId
  });
```

### Cuisine Types

#### Fetch All Cuisine Types
```javascript
const { data, error } = await supabase
  .from('cuisine_types')
  .select('*')
  .order('name');
```

#### Fetch Restaurants by Cuisine
```javascript
const { data, error } = await supabase
  .from('restaurants')
  .select(`
    *,
    cuisine_types:restaurant_cuisine_types(
      cuisine_type:cuisine_types(*)
    )
  `)
  .eq('restaurant_cuisine_types.cuisine_type_id', cuisineTypeId);
```

## Search and Filtering

### Text Search
```javascript
const { data, error } = await supabase
  .from('restaurants')
  .select('*')
  .ilike('name', `%${searchQuery}%`);
```

### Advanced Filtering
```javascript
let query = supabase.from('restaurants').select('*');

// Price filter
if (maxPrice) {
  query = query.lte('price_per_person', maxPrice);
}

// Rating filter
if (minRating) {
  query = query.gte('rating', minRating);
}

// Visit status filter
if (visitedOnly) {
  query = query.eq('visited', true);
}

const { data, error } = await query;
```

## Real-time Subscriptions

The application uses Supabase real-time capabilities for live updates:

### Restaurant Changes
```javascript
const subscription = supabase
  .channel('restaurants')
  .on('postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'restaurants'
    },
    (payload) => {
      console.log('Restaurant changed:', payload);
      // Update UI accordingly
    }
  )
  .subscribe();
```

### List Changes
```javascript
const subscription = supabase
  .channel('lists')
  .on('postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'lists'
    },
    (payload) => {
      console.log('List changed:', payload);
      // Update UI accordingly
    }
  )
  .subscribe();
```

## Error Handling

All Supabase operations return an error object that should be handled:

```javascript
const { data, error } = await supabase
  .from('restaurants')
  .select('*');

if (error) {
  console.error('Error fetching restaurants:', error);
  // Handle error (show toast, retry, etc.)
} else {
  // Process data
  setRestaurants(data);
}
```

## Authentication

The application uses Supabase Auth for user management:

### Sign Up
```javascript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password'
});
```

### Sign In
```javascript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
});
```

### Sign Out
```javascript
const { error } = await supabase.auth.signOut();
```

### Get Current User
```javascript
const { data: { user } } = await supabase.auth.getUser();
```

## File Uploads

### Image Upload to Imgur (via utility function)
```javascript
import { uploadToImgur } from '@/utils/imgurConverter';

const imageUrl = await uploadToImgur(imageFile);
```

## Google Maps Integration

### Extract Data from Google Maps URL
```javascript
import { extractGoogleMapsData } from '@/utils/googleMapsExtractor';

const restaurantData = extractGoogleMapsData(googleMapsUrl);
// Returns: { name, location, url }
```

## Rate Limiting

Supabase has built-in rate limiting, but additional client-side rate limiting may be implemented for:

- Search operations
- Bulk operations
- External API calls (Imgur, Google Maps parsing)

## Caching Strategy

The application uses:
- **Browser caching** for static assets
- **Supabase caching** for database queries
- **Service Worker** (if implemented) for offline functionality

## Future API Endpoints

Potential future API endpoints that could be added:

### Analytics
- `GET /api/analytics/restaurants` - Restaurant visit statistics
- `GET /api/analytics/cuisines` - Popular cuisine types

### Export
- `GET /api/export/restaurants` - Export restaurants as CSV/JSON
- `GET /api/export/lists` - Export lists with restaurant data

### Integrations
- `POST /api/integrations/google-places` - Google Places API integration
- `POST /api/integrations/foursquare` - Foursquare API integration

### Recommendations
- `GET /api/recommendations` - AI-powered restaurant recommendations

## Security Considerations

- All database operations use Row Level Security (RLS)
- API keys are stored as environment variables
- Authentication is required for data modifications
- Input validation is performed on the client and server
- SQL injection protection via Supabase parameterized queries

## Monitoring

For production deployments, consider monitoring:
- API response times
- Error rates
- Database query performance
- Real-time subscription connections

## Testing

API testing can be performed using:
- Supabase client in unit tests
- Integration tests with test database
- E2E tests with Cypress/Playwright

This documentation will be updated as new API endpoints are added to the application.
