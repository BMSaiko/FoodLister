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

### Lists API

#### GET `/api/lists`

**Purpose**: Retrieves all lists with optional search filtering and restaurant counts

**Parameters**:
- `search` (optional): String to filter lists by name

**Response**:
```json
{
  "lists": [
    {
      "id": "uuid",
      "name": "My Favorite Restaurants",
      "description": "A collection of my favorite places",
      "creator": "user_id",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z",
      "restaurantCount": 5
    }
  ]
}
```

**Caching**: Includes cache headers for better performance

**Usage**:
```javascript
// Get all lists
fetch('/api/lists')
  .then(response => response.json())
  .then(data => console.log(data));

// Search lists
fetch('/api/lists?search=favorite')
  .then(response => response.json())
  .then(data => console.log(data));
```

#### GET `/api/lists/[id]`

**Purpose**: Retrieves a specific list with all its restaurants

**Parameters**: List ID in URL path

**Response**:
```json
{
  "list": {
    "id": "uuid",
    "name": "My Favorite Restaurants",
    "description": "A collection of my favorite places",
    "creator": "user_id",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z",
    "restaurants": [
      {
        "id": "uuid",
        "name": "Restaurant Name",
        "description": "Description",
        // ... other restaurant fields
      }
    ]
  }
}
```

**Caching**: Includes cache headers for better performance

**Usage**:
```javascript
fetch('/api/lists/123e4567-e89b-12d3-a456-426614174000')
  .then(response => response.json())
  .then(data => console.log(data));
```

### Restaurants API

#### GET `/api/restaurants`

**Purpose**: Retrieves all restaurants with optional search filtering, including cuisine types and review counts

**Parameters**:
- `search` (optional): String to filter restaurants by name

**Response**:
```json
{
  "restaurants": [
    {
      "id": "uuid",
      "name": "Restaurant Name",
      "description": "Description",
      "image_url": "https://...",
      "price_per_person": 25.50,
      "rating": 4.5,
      "location": "Address",
      "source_url": "https://...",
      "creator": "user_id",
      "menu_url": "https://...",
      "phone_numbers": ["+1234567890"],
      "visited": false,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z",
      "cuisine_types": [
        {
          "id": "uuid",
          "name": "Italian",
          "description": "Italian cuisine",
          "icon": "🍝",
          "created_at": "2024-01-01T00:00:00Z"
        }
      ],
      "review_count": 3
    }
  ]
}
```

**Usage**:
```javascript
// Get all restaurants
fetch('/api/restaurants')
  .then(response => response.json())
  .then(data => console.log(data));

// Search restaurants
fetch('/api/restaurants?search=italian')
  .then(response => response.json())
  .then(data => console.log(data));
```

### Reviews API

#### GET `/api/reviews`

**Purpose**: Retrieves all reviews for a specific restaurant

**Parameters**:
- `restaurant_id` (required): UUID of the restaurant

**Response**:
```json
{
  "reviews": [
    {
      "id": "uuid",
      "restaurant_id": "uuid",
      "user_id": "uuid",
      "rating": 5,
      "comment": "Excellent food and service!",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z",
      "user": {
        "id": "uuid",
        "name": "John Doe"
      }
    }
  ]
}
```

**Usage**:
```javascript
fetch('/api/reviews?restaurant_id=123e4567-e89b-12d3-a456-426614174000')
  .then(response => response.json())
  .then(data => console.log(data));
```

#### POST `/api/reviews`

**Purpose**: Creates a new review for a restaurant

**Authentication**: Required

**Request Body**:
```json
{
  "restaurant_id": "uuid",
  "rating": 4,
  "comment": "Great experience!"
}
```

**Response**: Created review object

**Usage**:
```javascript
fetch('/api/reviews', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    restaurant_id: '123e4567-e89b-12d3-a456-426614174000',
    rating: 4,
    comment: 'Great experience!'
  })
})
  .then(response => response.json())
  .then(data => console.log(data));
```

### Visits API

#### GET `/api/restaurants/visits`

**Purpose**: Retrieves visit data for multiple restaurants in a single request

**Authentication**: Required (via Authorization header)

**Parameters**:
- `restaurantIds` (required): Array of restaurant UUIDs

**Request Body**:
```json
{
  "restaurantIds": [
    "uuid1",
    "uuid2",
    "uuid3"
  ]
}
```

**Response**:
```json
{
  "uuid1": {
    "visited": true,
    "visitCount": 2
  },
  "uuid2": {
    "visited": false,
    "visitCount": 0
  },
  "uuid3": {
    "visited": true,
    "visitCount": 1
  }
}
```

**Usage**:
```javascript
fetch('/api/restaurants/visits', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-jwt-token'
  },
  body: JSON.stringify({
    restaurantIds: ['uuid1', 'uuid2', 'uuid3']
  })
})
  .then(response => response.json())
  .then(data => console.log(data));
```

#### GET `/api/restaurants/[id]/visits`

**Purpose**: Retrieves visit data for a specific restaurant

**Authentication**: Required (via Authorization header)

**Parameters**: Restaurant ID in URL path

**Response**:
```json
{
  "visited": true,
  "visitCount": 3
}
```

**Usage**:
```javascript
fetch('/api/restaurants/123e4567-e89b-12d3-a456-426614174000/visits', {
  headers: {
    'Authorization': 'Bearer your-jwt-token'
  }
})
  .then(response => response.json())
  .then(data => console.log(data));
```

#### POST `/api/restaurants/[id]/visits`

**Purpose**: Records a visit to a restaurant (increments visit count)

**Authentication**: Required (via Authorization header)

**Parameters**: Restaurant ID in URL path

**Response**:
```json
{
  "visited": true,
  "visitCount": 2
}
```

**Usage**:
```javascript
fetch('/api/restaurants/123e4567-e89b-12d3-a456-426614174000/visits', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer your-jwt-token'
  }
})
  .then(response => response.json())
  .then(data => console.log(data));
```

#### PATCH `/api/restaurants/[id]/visits`

**Purpose**: Updates visit status for a restaurant (toggle visited/unvisited or adjust visit count)

**Authentication**: Required (via Authorization header)

**Parameters**: Restaurant ID in URL path

**Request Body** (one of):
```json
// Toggle visited status
{
  "action": "toggle_visited"
}

// Remove one visit
{
  "action": "remove_visit"
}
```

**Response**:
```json
{
  "visited": true,
  "visitCount": 1
}
```

**Usage**:
```javascript
// Toggle visited status
fetch('/api/restaurants/123e4567-e89b-12d3-a456-426614174000/visits', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-jwt-token'
  },
  body: JSON.stringify({
    action: 'toggle_visited'
  })
})
  .then(response => response.json())
  .then(data => console.log(data));

// Remove one visit
fetch('/api/restaurants/123e4567-e89b-12d3-a456-426614174000/visits', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-jwt-token'
  },
  body: JSON.stringify({
    action: 'remove_visit'
  })
})
  .then(response => response.json())
  .then(data => console.log(data));
```

#### GET `/api/reviews/[id]`

**Purpose**: Retrieves a specific review with user and restaurant details

**Parameters**: Review ID in URL path

**Response**: Single review object with expanded user and restaurant information

**Usage**:
```javascript
fetch('/api/reviews/123e4567-e89b-12d3-a456-426614174000')
  .then(response => response.json())
  .then(data => console.log(data));
```

#### PUT `/api/reviews/[id]`

**Purpose**: Updates an existing review (user can only update their own reviews)

**Authentication**: Required

**Request Body**:
```json
{
  "rating": 5,
  "comment": "Even better than I thought!"
}
```

**Response**: Updated review object

**Usage**:
```javascript
fetch('/api/reviews/123e4567-e89b-12d3-a456-426614174000', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    rating: 5,
    comment: 'Even better than I thought!'
  })
})
  .then(response => response.json())
  .then(data => console.log(data));
```

#### DELETE `/api/reviews/[id]`

**Purpose**: Deletes a review (user can only delete their own reviews)

**Authentication**: Required

**Response**: Success message

**Usage**:
```javascript
fetch('/api/reviews/123e4567-e89b-12d3-a456-426614174000', {
  method: 'DELETE'
})
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
