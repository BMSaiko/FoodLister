# API Documentation

This document describes the API endpoints available in the FoodLister application. The application uses a hybrid approach with Next.js API routes for specific operations and Supabase client for direct database operations.

## Overview

The FoodLister application uses the following architecture:
- **Frontend**: Next.js 13+ with App Router
- **Backend**: Next.js API Routes + Supabase (PostgreSQL database with RLS)
- **Client**: Supabase client for direct database queries
- **API Routes**: Custom endpoints for complex operations, session management, and aggregations

## Architecture

```
┌─────────────────┐    Supabase Client    ┌─────────────────┐
│   Next.js App   │◄────────────────────►│    Supabase      │
│   (Frontend)    │                       │   Database       │
└─────────────────┘                       └─────────────────┘
         │                                       │
         │ API Routes                            │
         ▼                                       │
┌─────────────────┐                     ┌─────────────────┐
│   API Routes    │                     │  Real-time       │
│   /api/*        │                     │  Subscriptions   │
└─────────────────┘                     └─────────────────┘
```

## Base URL

All API routes are relative to the application base URL:
- Development: `http://localhost:3000/api/*`
- Production: `https://your-domain.com/api/*`

## Authentication

Most API routes support optional or required authentication:
- **Optional Auth**: Returns public data + user-specific data if authenticated
- **Required Auth**: Returns 401 if not authenticated
- **Session-based**: Uses cookies for session management (Supabase Auth)

### Session Endpoint
- **`GET /api/auth/session`** - Get current user session data (access token, refresh token, expiry, user info)

## API Endpoints

### Health Check

#### `GET /api/health`
**Purpose**: Simple health check for monitoring and load balancers

**Authentication**: Not required

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2026-01-15T10:30:00.000Z",
  "uptime": 12345.67,
  "environment": "production",
  "version": "1.0.0"
}
```

---

### Reference Data Endpoints

#### `GET /api/cuisine-types`
**Purpose**: List all cuisine types available in the system

**Authentication**: Not required

**Response**:
```json
[
  {
    "id": "uuid",
    "name": "Italian",
    "description": "Italian cuisine",
    "icon": "🍝",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

#### `POST /api/cuisine-types`
**Purpose**: Create a new cuisine type

**Authentication**: Required

**Request Body**:
```json
{
  "name": "Japanese",
  "description": "Japanese cuisine",
  "icon": "🍣"
}
```

---

#### `GET /api/dietary-options`
**Purpose**: List all dietary options available in the system

**Authentication**: Not required

**Response**: Array of dietary option objects

#### `POST /api/dietary-options`
**Purpose**: Create a new dietary option

**Authentication**: Required

---

#### `GET /api/features`
**Purpose**: List all restaurant features available in the system

**Authentication**: Not required

**Response**: Array of feature objects

#### `POST /api/features`
**Purpose**: Create a new restaurant feature

**Authentication**: Required

---

### Lists Endpoints

#### `GET /api/lists`
**Purpose**: Fetch lists with search filtering and restaurant counts

**Authentication**: Optional (affects which lists are returned)

**Parameters**:
- `search` (optional): String to filter lists by name (case-insensitive)

**Response**:
```json
{
  "lists": [
    {
      "id": "uuid",
      "name": "My Favorite Restaurants",
      "description": "A collection of my favorite places",
      "creator": "user_name",
      "creator_id": "user_uuid",
      "is_public": true,
      "filters": null,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z",
      "restaurantCount": 5
    }
  ]
}
```

**Security**:
- Authenticated users: See their own lists (public + private) + public lists from others
- Unauthenticated users: See only public lists

**Caching**: `Cache-Control: public, s-maxage=60, stale-while-revalidate=120`

#### `POST /api/lists`
**Purpose**: Create a new list

**Authentication**: Required

**Request Body**:
```json
{
  "name": "My New List",
  "description": "List description",
  "is_public": true,
  "filters": null
}
```

**Response**: Created list object

---

#### `GET /api/lists/[id]`
**Purpose**: Retrieve a specific list with all its restaurants, including cuisine types, features, and dietary options

**Authentication**: Optional (private lists only visible to owner)

**Parameters**: List ID in URL path

**Response**:
```json
{
  "list": {
    "id": "uuid",
    "name": "My Favorite Restaurants",
    "description": "A collection of my favorite places",
    "creator": "user_name",
    "creator_id": "user_uuid",
    "is_public": true,
    "filters": null,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z",
    "restaurants": [...]
  }
}
```

**Security**: Respects RLS policies - private lists only visible to owner

#### `PUT /api/lists/[id]`
**Purpose**: Update list details (name, description, public status)

**Authentication**: Required (only list owner)

**Request Body**:
```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "is_public": false
}
```

#### `PATCH /api/lists/[id]`
**Purpose**: Partially update list details

**Authentication**: Required (only list owner)

#### `DELETE /api/lists/[id]`
**Purpose**: Delete a list and its restaurant associations

**Authentication**: Required (only list owner)

---

#### `GET /api/lists/[id]/restaurants`
**Purpose**: Get all restaurants in a specific list

**Authentication**: Optional (depends on list visibility)

#### `POST /api/lists/[id]/restaurants`
**Purpose**: Add a restaurant to a list

**Authentication**: Required (only list owner)

**Request Body**:
```json
{
  "restaurant_id": "uuid"
}
```

#### `DELETE /api/lists/[id]/restaurants/[restaurantId]`
**Purpose**: Remove a restaurant from a list

**Authentication**: Required (only list owner)

---

#### `POST /api/lists/[id]/share`
**Purpose**: Share a list (generate share link or manage sharing)

**Authentication**: Required (only list owner)

---

### Restaurants Endpoints

#### `GET /api/restaurants`
**Purpose**: Retrieve all restaurants with optional search filtering, including cuisine types and review counts

**Authentication**: Not required (public data)

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
      "menu_links": ["https://menu1.pdf", "https://menu2.com"],
      "menu_images": ["https://cloudinary.com/image1.jpg"],
      "phone_numbers": ["+1234567890"],
      "visited": false,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z",
      "cuisine_types": [...],
      "review_count": 3
    }
  ]
}
```

---

#### `GET /api/restaurants/[id]`
**Purpose**: Get a specific restaurant with all details

**Authentication**: Not required

#### `PUT /api/restaurants/[id]`
**Purpose**: Update restaurant details

**Authentication**: Required (only creator or admin)

#### `DELETE /api/restaurants/[id]`
**Purpose**: Delete a restaurant

**Authentication**: Required (only creator)

---

#### `GET /api/restaurants/[id]/lists`
**Purpose**: Get all lists that contain this restaurant

**Authentication**: Optional

---

#### `GET /api/restaurants/visits`
**Purpose**: Get visit data for multiple restaurants in a single request

**Authentication**: Required (via Authorization header)

**Request Body**:
```json
{
  "restaurantIds": ["uuid1", "uuid2", "uuid3"]
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
  }
}
```

#### `POST /api/restaurants/visits`
**Purpose**: Record visits for multiple restaurants

**Authentication**: Required

---

#### `GET /api/restaurants/[id]/visits`
**Purpose**: Get visit data for a specific restaurant

**Authentication**: Required

**Response**:
```json
{
  "visited": true,
  "visitCount": 3
}
```

#### `POST /api/restaurants/[id]/visits`
**Purpose**: Record a visit to a restaurant (increments visit count)

**Authentication**: Required

**Response**:
```json
{
  "visited": true,
  "visitCount": 2
}
```

#### `PATCH /api/restaurants/[id]/visits`
**Purpose**: Update visit status (toggle visited/unvisited or adjust count)

**Authentication**: Required

**Request Body** (one of):
```json
{"action": "toggle_visited"}
{"action": "remove_visit"}
```

---

### Reviews Endpoints

#### `GET /api/reviews`
**Purpose**: Get all reviews for a specific restaurant

**Authentication**: Not required

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

#### `POST /api/reviews`
**Purpose**: Create a new review for a restaurant

**Authentication**: Required

**Request Body**:
```json
{
  "restaurant_id": "uuid",
  "rating": 4,
  "comment": "Great experience!"
}
```

---

#### `GET /api/reviews/[id]`
**Purpose**: Get a specific review with user and restaurant details

**Authentication**: Not required

#### `PUT /api/reviews/[id]`
**Purpose**: Update an existing review (user can only update their own)

**Authentication**: Required

#### `DELETE /api/reviews/[id]`
**Purpose**: Delete a review (user can only delete their own)

**Authentication**: Required

---

### User Endpoints

#### `GET /api/users/me`
**Purpose**: Get current user's profile and settings

**Authentication**: Required

**Response**:
```json
{
  "user": {
    "id": "uuid",
    "name": "User Name",
    "email": "user@example.com",
    "avatar_url": "https://...",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

#### `GET /api/users/me/lists`
**Purpose**: Get all lists created by the current user

**Authentication**: Required

#### `GET /api/users/me/stats`
**Purpose**: Get current user's statistics (restaurants visited, lists created, reviews written, etc.)

**Authentication**: Required

**Response**:
```json
{
  "restaurants_visited": 42,
  "lists_created": 5,
  "reviews_written": 12,
  "total_visits": 60
}
```

---

## Supabase Direct Operations

While the application has many API routes, it also performs direct database operations through the Supabase client for simpler CRUD operations.

### Restaurant Operations

#### Fetch Restaurants with Relations
```javascript
import { createClient } from '@/libs/supabase/client';

const supabase = createClient();

const { data, error } = await supabase
  .from('restaurants')
  .select(`
    *,
    cuisine_types:restaurant_cuisine_types(
      cuisine_type:cuisine_types(*)
    ),
    restaurant_restaurant_features(
      feature:restaurant_features(*)
    ),
    restaurant_dietary_options_junction(
      dietary_option:dietary_options(*)
    )
  `)
  .order('created_at', { ascending: false });
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
    creator: userId,
    menu_links: ['https://menu.pdf'],
    menu_images: ['https://cloudinary.com/image.jpg'],
    phone_numbers: ['+1234567890']
  })
  .select()
  .single();
```

---

### List Operations

#### Fetch User Lists
```javascript
const { data, error } = await supabase
  .from('lists')
  .select(`
    *,
    list_restaurants(count)
  `)
  .eq('creator_id', userId)
  .order('created_at', { ascending: false });
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

---

## Menu System

Restaurants can have multiple menu links and images stored in Cloudinary.

### Menu Fields
- **`menu_links`**: Array of external URLs (max 5 links) - PDFs, websites
- **`menu_images`**: Array of Cloudinary image URLs (max 10 images) - scanned menus, photos
- **`menu_url`**: Deprecated single URL field (maintained for backward compatibility)

### Menu Validation
- Maximum 5 external links per restaurant
- Maximum 10 uploaded images per restaurant
- Links must be valid HTTP/HTTPS URLs
- Images must be valid Cloudinary URLs

---

## Image Upload

### Cloudinary Integration
The application uses Cloudinary for image storage with the following utility:

```javascript
import { uploadToCloudinary } from '@/utils/cloudinaryConverter';

const imageUrl = await uploadToCloudinary(imageFile, {
  maxRetries: 3,
  delay: 1000
});
```

Features:
- Automatic URL optimization with transformations
- Retry logic with progressive delay
- Validation of Cloudinary URLs
- Public ID extraction for management

---

## Search and Filtering

### Text Search
```javascript
const { data, error } = await supabase
  .from('restaurants')
  .select('*')
  .ilike('name', `%${searchQuery}%`);
```

### Advanced Filtering with Hooks
The application provides `useRestaurants` hook with built-in filtering:

```javascript
import { useRestaurants } from '@/hooks/data';

const { restaurants, loading, error } = useRestaurants({
  search: 'italian',
  maxPrice: 50,
  minRating: 4.0,
  visitedOnly: true,
  cuisineTypes: ['uuid1', 'uuid2']
});
```

---

## Caching Strategy

### API Routes
- Health endpoint: No caching
- Reference data (cuisine-types, dietary-options, features): `Cache-Control: public, s-maxage=300`
- Lists: `Cache-Control: public, s-maxage=60, stale-while-revalidate=120`
- Restaurants: `Cache-Control: public, s-maxage=60, stale-while-revalidate=120`

### Client-side Caching
The `apiClient` in `libs/apiClient.ts` provides:
- Response caching with TTL support (default 5 minutes)
- Request deduplication to avoid duplicate simultaneous requests
- Cache invalidation methods: `invalidateCache()`, `clearCache()`

---

## Rate Limiting

### Server-side
- Middleware rate limiter in `middleware/rateLimiter.ts`
- API routes have built-in protection

### Client-side
The `apiClient` includes:
- Client-side rate limiter (max 10 requests/second)
- Configurable request timeout (default 30 seconds)
- Retry logic with exponential backoff

---

## Error Handling

All API routes return standardized error responses:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

---

## Security

### Row Level Security (RLS)
All database tables have RLS policies enabled:
- Users can only modify their own data
- Public data is readable by everyone
- Private lists only visible to owners
- Reviews can only be modified by their authors

### Authentication
- Supabase Auth with JWT tokens
- Session management via cookies
- API routes check authentication via `getUser()` from Supabase

---

## Testing API Endpoints

### Using fetch
```javascript
// Get all restaurants
const response = await fetch('/api/restaurants');
const data = await response.json();

// Create a list (authenticated)
const response = await fetch('/api/lists', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-jwt-token'
  },
  body: JSON.stringify({
    name: 'My List',
    is_public: true
  })
});
```

### Using apiClient
```javascript
import { apiClient } from '@/libs/apiClient';

// GET request
const data = await apiClient.get('/api/restaurants');

// POST request with auth
const data = await apiClient.post('/api/lists', {
  name: 'My List',
  is_public: true
}, { requireAuth: true });
```

---

## Real-time Subscriptions

The application can use Supabase real-time capabilities:

```javascript
const subscription = supabase
  .channel('restaurants')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'restaurants'
  }, (payload) => {
    console.log('Restaurant changed:', payload);
  })
  .subscribe();
```

---

## Monitoring and Analytics

The application includes:
- API monitoring via `utils/apiMonitor.ts`
- Performance monitoring via `utils/performanceMonitor.ts`
- Database monitoring via `utils/dbMonitor.ts`
- Analytics utilities via `utils/analytics.ts`

Use these for production monitoring and debugging.