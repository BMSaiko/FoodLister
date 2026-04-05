# API Endpoints Reference - FoodList

Complete reference of all API routes in the FoodList application.

---

## Base URL

```
Development: http://localhost:3000/api
Production: https://your-domain.vercel.app/api
```

---

## Authentication

All endpoints that modify data require authentication via Supabase session.

### Headers
```
Cookie: supabase-auth-token=...
```

---

## Endpoints

### Health Check

```
GET /api/health
```

**Response:** `200 OK`
```json
{ "status": "ok", "timestamp": "2026-04-05T17:00:00Z" }
```

---

### Restaurants

#### List Restaurants
```
GET /api/restaurants
```

**Query Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| page | number | | Page number (default: 1) |
| limit | number | | Items per page (default: 20, max: 100) |
| search | string | | Search by name |
| cuisine | string | | Filter by cuisine type |
| minRating | number | | Minimum rating |
| maxPrice | number | | Maximum price per person |
| sortBy | string | | Sort field (name, rating, created_at) |
| sortOrder | string | | Sort order (asc, desc) |

**Response:** `200 OK`
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

#### Get Restaurant by ID
```
GET /api/restaurants/[id]
```

**Response:** `200 OK`
```json
{
  "data": {
    "id": "...",
    "name": "...",
    "cuisine_types": ["Italian", "Pizza"],
    "dietary_options": ["Vegetarian"],
    "features": ["Outdoor Seating"],
    "reviews": [...],
    "review_count": 10,
    "avg_rating": 4.5
  }
}
```

#### Create Restaurant
```
POST /api/restaurants
```

**Body:**
```json
{
  "name": "Restaurant Name",
  "description": "...",
  "location": "...",
  "phone_numbers": ["+351..."],
  "cuisine_type_ids": ["uuid1", "uuid2"],
  "dietary_option_ids": ["uuid1"],
  "feature_ids": ["uuid1"],
  "price_per_person": 25.50,
  "menu_url": "https://...",
  "images": ["https://..."],
  "latitude": 38.7,
  "longitude": -9.1
}
```

**Response:** `201 Created`

#### Update Restaurant
```
PUT /api/restaurants/[id]
```

**Response:** `200 OK`

#### Delete Restaurant
```
DELETE /api/restaurants/[id]
```

**Response:** `204 No Content`

---

### Lists

#### Get User Lists
```
GET /api/lists
```

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| userId | string | Filter by user |
| search | string | Search by name |

**Response:** `200 OK`

#### Create List
```
POST /api/lists
```

**Body:**
```json
{
  "name": "My Favorite Places",
  "description": "...",
  "restaurant_ids": ["uuid1", "uuid2"]
}
```

**Response:** `201 Created`

#### Get List by ID
```
GET /api/lists/[id]
```

**Response:** `200 OK`

#### Update List
```
PUT /api/lists/[id]
```

**Response:** `200 OK`

#### Delete List
```
DELETE /api/lists/[id]
```

**Response:** `204 No Content`

#### Add Restaurant to List
```
POST /api/lists/[id]/restaurants
```

**Body:**
```json
{ "restaurant_id": "uuid" }
```

**Response:** `201 Created`

#### Remove Restaurant from List
```
DELETE /api/lists/[listId]/restaurants/[restaurantId]
```

**Response:** `204 No Content`

---

### Reviews

#### Get Restaurant Reviews
```
GET /api/reviews?restaurantId=uuid
```

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| restaurantId | string | Filter by restaurant |
| userId | string | Filter by user |
| page | number | Page number |
| limit | number | Items per page |

**Response:** `200 OK`

#### Create Review
```
POST /api/reviews
```

**Body:**
```json
{
  "restaurant_id": "uuid",
  "rating": 4.5,
  "comment": "Great food!",
  "amount_spent": 30.00
}
```

**Response:** `201 Created`

#### Update Review
```
PUT /api/reviews/[id]
```

**Response:** `200 OK`

#### Delete Review
```
DELETE /api/reviews/[id]
```

**Response:** `204 No Content`

---

### Users

#### Get User Profile
```
GET /api/users/[id]
```

**Response:** `200 OK`

#### Get Current User
```
GET /api/users/me
```

**Response:** `200 OK`

#### Update User Settings
```
PUT /api/users/settings
```

**Body:**
```json
{
  "display_name": "...",
  "bio": "...",
  "avatar_url": "...",
  "location": "...",
  "website": "...",
  "phone_number": "...",
  "public_profile": true
}
```

**Response:** `200 OK`

#### Search Users
```
GET /api/users/search?q=query
```

**Response:** `200 OK`

---

### Auth

#### Get Session
```
GET /api/auth/session
```

**Response:** `200 OK`
```json
{
  "user": { "id": "...", "email": "..." },
  "session": { "access_token": "...", "refresh_token": "..." }
}
```

---

### Upload

#### Upload Image
```
POST /api/upload
```

**Body:** `multipart/form-data`
| Field | Type | Description |
|-------|------|-------------|
| file | File | Image file |
| folder | string | Target folder (default: "foodlist") |

**Response:** `200 OK`
```json
{
  "url": "https://res.cloudinary.com/...",
  "public_id": "foodlist/xyz123"
}
```

---

### Cuisine Types

#### Get All Cuisine Types
```
GET /api/cuisine-types
```

**Response:** `200 OK`
```json
{
  "data": [
    { "id": "uuid", "name": "Italian", "icon": "pizza" }
  ]
}
```

---

### Features

#### Get All Features
```
GET /api/features
```

**Response:** `200 OK`

---

### Dietary Options

#### Get All Dietary Options
```
GET /api/dietary-options
```

**Response:** `200 OK`

---

### Notifications

#### Get Notifications
```
GET /api/notifications
```

**Response:** `200 OK`

#### Create Notification
```
POST /api/notifications/create
```

**Body:**
```json
{
  "user_id": "uuid",
  "type": "review",
  "message": "New review on..."
}
```

**Response:** `201 Created`

---

### Meals

#### Get Scheduled Meals
```
GET /api/meals/scheduled
```

**Response:** `200 OK`

#### Schedule Meal
```
POST /api/meals/schedule
```

**Body:**
```json
{
  "restaurant_id": "uuid",
  "date": "2026-04-10",
  "meal_type": "lunch",
  "participants": ["uuid1", "uuid2"]
}
```

**Response:** `201 Created`

#### Get Meal Participants
```
GET /api/meals/participants?mealId=uuid
```

**Response:** `200 OK`

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "error": "Error message",
  "details": "Optional details"
}
```

### Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 204 | Deleted |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 429 | Rate Limited |
| 500 | Internal Server Error |

---

## Rate Limiting

- **Limit:** 100 requests per 15 minutes per IP
- **Headers:**
  - `X-RateLimit-Limit: 100`
  - `X-RateLimit-Remaining: 95`
  - `X-RateLimit-Reset: 1617716800`

---

*Last updated: 2026-04-05*