# API Endpoints Reference - FoodLister

Complete reference of all API routes in the FoodLister application.

---

## Base URL

```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

---

## Authentication

Most endpoints support optional or required authentication via Supabase session cookies.

### Session Management
- **Cookie-based**: Supabase Auth stores session in cookies
- **Session endpoint**: `GET /api/auth/session` returns current session data

### Authentication Header (for API client)
```
Authorization: Bearer <jwt-token>
```

---

## Endpoints

### Health Check

#### `GET /api/health`
**Description**: Simple health check for monitoring and load balancers

**Authentication**: Not required

**Response:** `200 OK`
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

### Authentication

#### `GET /api/auth/session`
**Description**: Get current user session data

**Authentication**: Optional

**Response:** `200 OK`
```json
{
  "user": { "id": "...", "email": "...", "name": "..." },
  "session": { "access_token": "...", "refresh_token": "...", "expires_at": 1234567890 }
}
```

---

### Reference Data

#### `GET /api/cuisine-types`
**Description**: List all cuisine types

**Authentication**: Not required

**Response:** `200 OK`
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
**Description**: Create a new cuisine type

**Authentication**: Required

**Body:**
```json
{
  "name": "Japanese",
  "description": "Japanese cuisine",
  "icon": "🍣"
}
```

**Response:** `201 Created`

---

#### `GET /api/dietary-options`
**Description**: List all dietary options

**Authentication**: Not required

**Response:** `200 OK` - Array of dietary option objects

#### `POST /api/dietary-options`
**Description**: Create a new dietary option

**Authentication**: Required

**Response:** `201 Created`

---

#### `GET /api/features`
**Description**: List all restaurant features

**Authentication**: Not required

**Response:** `200 OK` - Array of feature objects

#### `POST /api/features`
**Description**: Create a new restaurant feature

**Authentication**: Required

**Response:** `201 Created`

---

### Lists

#### `GET /api/lists`
**Description**: Fetch lists with search filtering and restaurant counts

**Authentication**: Optional (affects which lists are returned)

**Query Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| search | string | No | Search by name (case-insensitive) |

**Response:** `200 OK`
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

**Caching**: `Cache-Control: public, s-maxage=60, stale-while-revalidate=120`

#### `POST /api/lists`
**Description**: Create a new list

**Authentication**: Required

**Body:**
```json
{
  "name": "My New List",
  "description": "List description",
  "is_public": true,
  "filters": null
}
```

**Response:** `201 Created` - Created list object

---

#### `GET /api/lists/[id]`
**Description**: Retrieve a specific list with all its restaurants

**Authentication**: Optional (private lists only visible to owner)

**Response:** `200 OK`
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

#### `PUT /api/lists/[id]`
**Description**: Update list details (name, description, public status)

**Authentication**: Required (only list owner)

**Body:**
```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "is_public": false
}
```

**Response:** `200 OK` - Updated list object

#### `PATCH /api/lists/[id]`
**Description**: Partially update list details

**Authentication**: Required (only list owner)

**Response:** `200 OK`

#### `DELETE /api/lists/[id]`
**Description**: Delete a list and its restaurant associations

**Authentication**: Required (only list owner)

**Response:** `204 No Content`

---

#### `GET /api/lists/[id]/restaurants`
**Description**: Get all restaurants in a specific list

**Authentication**: Optional (depends on list visibility)

**Response:** `200 OK` - Array of restaurant objects

#### `POST /api/lists/[id]/restaurants`
**Description**: Add a restaurant to a list

**Authentication**: Required (only list owner)

**Body:**
```json
{ "restaurant_id": "uuid" }
```

**Response:** `201 Created`

#### `DELETE /api/lists/[id]/restaurants/[restaurantId]`
**Description**: Remove a restaurant from a list

**Authentication**: Required (only list owner)

**Response:** `204 No Content`

---

#### `POST /api/lists/[id]/share`
**Description**: Share a list (generate share link or manage sharing)

**Authentication**: Required (only list owner)

**Response:** `200 OK`

---

### Restaurants

#### `GET /api/restaurants`
**Description**: Retrieve all restaurants with optional search filtering

**Authentication**: Not required (public data)

**Query Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| search | string | No | Search by name |

**Response:** `200 OK`
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
**Description**: Get a specific restaurant with all details

**Authentication**: Not required

**Response:** `200 OK` - Restaurant object with all relations

#### `PUT /api/restaurants/[id]`
**Description**: Update restaurant details

**Authentication**: Required (only creator or admin)

**Response:** `200 OK` - Updated restaurant object

#### `DELETE /api/restaurants/[id]`
**Description**: Delete a restaurant

**Authentication**: Required (only creator)

**Response:** `204 No Content`

---

#### `GET /api/restaurants/[id]/lists`
**Description**: Get all lists that contain this restaurant

**Authentication**: Optional

**Response:** `200 OK` - Array of list objects

---

#### `GET /api/restaurants/visits`
**Description**: Get visit data for multiple restaurants in a single request

**Authentication**: Required (via Authorization header)

**Request Body:**
```json
{
  "restaurantIds": ["uuid1", "uuid2", "uuid3"]
}
```

**Response:** `200 OK`
```json
{
  "uuid1": { "visited": true, "visitCount": 2 },
  "uuid2": { "visited": false, "visitCount": 0 }
}
```

#### `POST /api/restaurants/visits`
**Description**: Record visits for multiple restaurants

**Authentication**: Required

**Response:** `200 OK`

---

#### `GET /api/restaurants/[id]/visits`
**Description**: Get visit data for a specific restaurant

**Authentication**: Required

**Response:** `200 OK`
```json
{ "visited": true, "visitCount": 3 }
```

#### `POST /api/restaurants/[id]/visits`
**Description**: Record a visit to a restaurant (increments visit count)

**Authentication**: Required

**Response:** `200 OK`
```json
{ "visited": true, "visitCount": 2 }
```

#### `PATCH /api/restaurants/[id]/visits`
**Description**: Update visit status (toggle visited/unvisited or adjust count)

**Authentication**: Required

**Request Body** (one of):
```json
{"action": "toggle_visited"}
{"action": "remove_visit"}
```

**Response:** `200 OK`

---

### Reviews

#### `GET /api/reviews`
**Description**: Get all reviews for a specific restaurant

**Authentication**: Not required

**Query Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| restaurant_id | string | Yes | UUID of the restaurant |

**Response:** `200 OK`
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
      "user": { "id": "uuid", "name": "John Doe" }
    }
  ]
}
```

#### `POST /api/reviews`
**Description**: Create a new review for a restaurant

**Authentication**: Required

**Body:**
```json
{
  "restaurant_id": "uuid",
  "rating": 4,
  "comment": "Great experience!"
}
```

**Response:** `201 Created` - Created review object

---

#### `GET /api/reviews/[id]`
**Description**: Get a specific review with user and restaurant details

**Authentication**: Not required

**Response:** `200 OK` - Review object with relations

#### `PUT /api/reviews/[id]`
**Description**: Update an existing review (user can only update their own)

**Authentication**: Required

**Response:** `200 OK` - Updated review object

#### `DELETE /api/reviews/[id]`
**Description**: Delete a review (user can only delete their own)

**Authentication**: Required

**Response:** `204 No Content`

---

### Users

#### `GET /api/users/me`
**Description**: Get current user's profile and settings

**Authentication**: Required

**Response:** `200 OK`
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
**Description**: Get all lists created by the current user

**Authentication**: Required

**Response:** `200 OK` - Array of list objects

#### `GET /api/users/me/stats`
**Description**: Get current user's statistics

**Authentication**: Required

**Response:** `200 OK`
```json
{
  "restaurants_visited": 42,
  "lists_created": 5,
  "reviews_written": 12,
  "total_visits": 60
}
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

### Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 204 | No Content (Deleted) |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 429 | Rate Limited |
| 500 | Internal Server Error |

---

## Rate Limiting

### Server-side
- Middleware rate limiter in `middleware/rateLimiter.ts`
- Configurable limits per endpoint

### Client-side
- `apiClient` in `libs/apiClient.ts` includes:
  - Client-side rate limiter (max 10 requests/second)
  - Configurable request timeout (default 30 seconds)
  - Retry logic with exponential backoff

---

## Caching

### API Routes Cache Headers

| Endpoint | Cache-Control |
|----------|---------------|
| `/api/health` | No caching |
| `/api/cuisine-types` | `public, s-maxage=300` |
| `/api/dietary-options` | `public, s-maxage=300` |
| `/api/features` | `public, s-maxage=300` |
| `/api/lists` | `public, s-maxage=60, stale-while-revalidate=120` |
| `/api/restaurants` | `public, s-maxage=60, stale-while-revalidate=120` |

### Client-side Cache
The `apiClient` provides:
- Response caching with TTL support (default 5 minutes)
- Request deduplication
- Cache invalidation: `invalidateCache()`, `clearCache()`

---

## Security

### Row Level Security (RLS)
All database tables have RLS policies:
- Users can only modify their own data
- Public data readable by everyone
- Private lists only visible to owners
- Reviews only modifiable by authors

### Authentication
- Supabase Auth with JWT tokens
- Session management via cookies
- API routes use `getUser()` for authentication

---

*Last updated: 2026-05-07*