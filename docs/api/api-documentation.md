# API Documentation

Complete reference for all FoodLister API endpoints.

## Architecture

```
┌─────────────────┐    Supabase Client    ┌─────────────────┐
│   Next.js App   │◄────────────────────►│    Supabase      │
│   (Frontend)    │                       │   Database       │
└─────────────────┘                       └─────────────────┘
         │                                       │
         │ API Routes                            │ RLS Policies
         ▼                                       │
┌─────────────────┐                     ┌─────────────────┐
│   API Routes    │                     │  Real-time       │
│   /api/*        │                     │  Subscriptions   │
└─────────────────┘                     └─────────────────┘
```

- **Base URL:** `/api/*` (relative)
- **Auth:** Supabase JWT via cookies
- **Error format:** `{ error: string, code: string }`
- **Caching:** Cache-Control headers per endpoint

---

## Authentication Endpoints

### `GET /api/auth/session`
Get current user session.

**Auth:** Optional

**Response:** `{ session, user }` or `{ session: null, user: null }`

---

## Health Check

### `GET /api/health`
Health check for monitoring.

**Auth:** Not required

**Response:** `{ status: "ok", timestamp, uptime, environment, version }`

---

## Reference Data

### Cuisine Types
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/cuisine-types` | No | List all cuisine types |
| POST | `/api/cuisine-types` | Yes | Create new cuisine type |

### Dietary Options *(cached 5min)*
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/dietary-options` | No | List all dietary options |
| POST | `/api/dietary-options` | Yes | Create new dietary option |

### Restaurant Features *(cached 5min)*
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/features` | No | List all features |
| POST | `/api/features` | Yes | Create new feature |

---

## Restaurants

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/restaurants` | No | List restaurants with filters |
| POST | `/api/restaurants` | Yes | Create restaurant |
| GET | `/api/restaurants/[id]` | No | Get restaurant details |
| PUT | `/api/restaurants/[id]` | Yes | Update restaurant |
| DELETE | `/api/restaurants/[id]` | Yes | Delete restaurant |
| GET | `/api/restaurants/nearby` | No | Find nearby restaurants |
| GET | `/api/restaurants/visits` | Yes | Get visit data |
| POST | `/api/restaurants/visits` | Yes | Record visits |
| PATCH | `/api/restaurants/[id]/visits` | Yes | Toggle visited status |

### GET /api/restaurants — Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `search` | string | Filter by name (case-insensitive) |
| `priceMin` | number | Minimum price per person |
| `priceMax` | number | Maximum price per person |
| `openNow` | "true" | Only show currently open restaurants |
| `sortBy` | "rating" \| "price" \| "name" \| "review_count" | Sort field |
| `sortDirection` | "asc" \| "desc" | Sort direction |

### GET /api/restaurants/nearby — Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `lat` | number | ✅ | Latitude |
| `lng` | number | ✅ | Longitude |
| `radius` | number | No | Radius in km (default: 10, max: 100) |
| `sortBy` | string | No | Sort by distance/rating/price/name |
| `sortDirection` | string | No | asc or desc |

---

## Lists

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/lists` | Optional | List lists (public + own) |
| POST | `/api/lists` | Yes | Create list |
| GET | `/api/lists/[id]` | Optional | Get list with restaurants |
| PUT | `/api/lists/[id]` | Yes | Update list |
| DELETE | `/api/lists/[id]` | Yes | Delete list |
| GET | `/api/lists/[id]/restaurants` | Optional | Get list restaurants |
| POST | `/api/lists/[id]/restaurants` | Yes | Add restaurant to list |
| DELETE | `/api/lists/[id]/restaurants/[rid]` | Yes | Remove restaurant |
| GET | `/api/lists/[id]/collaborators` | Optional | List collaborators |
| POST | `/api/lists/[id]/collaborators` | Yes | Add collaborator |
| DELETE | `/api/lists/[id]/collaborators` | Yes | Remove collaborator |
| POST | `/api/lists/[id]/comments` | Yes | Add comment |
| DELETE | `/api/lists/[id]/comments/[cid]` | Yes | Delete comment |
| GET | `/api/lists/[id]/activities` | Optional | Get activity feed |
| POST | `/api/lists/[id]/duplicate` | Yes | Duplicate list |

---

## Reviews

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/reviews` | No | Get reviews (by restaurant_id) |
| POST | `/api/reviews` | Yes | Create review |
| PUT | `/api/reviews/[id]` | Yes | Update review |
| DELETE | `/api/reviews/[id]` | Yes | Delete review |

---

## Users

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/users/me` | Yes | Get current user profile |
| PUT | `/api/users/me` | Yes | Update profile |
| GET | `/api/users/me/stats` | Yes | Get user statistics |
| GET | `/api/users/search` | Yes | Search users (q, location, filters) |
| GET | `/api/users/settings` | Yes | Get user settings |
| PUT | `/api/users/settings` | Yes | Update settings |

---

## Meals

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/meals/scheduled` | Yes | List scheduled meals |
| GET | `/api/meals/[id]` | Yes | Get meal details |
| PUT | `/api/meals/[id]` | Yes | Update meal |
| DELETE | `/api/meals/[id]` | Yes | Delete meal |
| POST | `/api/meals/participants` | Yes | Add participants |
| PATCH | `/api/meals/participants` | Yes | Update participant status |
| DELETE | `/api/meals/participants` | Yes | Remove participant |

---

## Notifications

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/notifications` | Yes | Get notifications (limit, unreadOnly) |
| PATCH | `/api/notifications` | Yes | Mark read / mark all read |
| DELETE | `/api/notifications` | Yes | Delete notification |
| GET | `/api/notifications/preferences` | Yes | Get preferences |
| PUT | `/api/notifications/preferences` | Yes | Update preferences |
| POST | `/api/notifications/email` | Yes | Trigger email notification |
| GET | `/api/notifications/push/vapid-key` | No | Get VAPID public key |
| POST | `/api/notifications/push/subscribe` | Yes | Save push subscription |

---

## Subscriptions (Stripe)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/subscriptions` | Yes | Get subscription + plans |
| POST | `/api/subscriptions` | Yes | Create Stripe checkout |
| PUT | `/api/subscriptions/[id]` | Yes | Cancel at period end |
| DELETE | `/api/subscriptions/[id]` | Yes | Cancel immediately |
| POST | `/api/stripe/webhook` | No | Stripe webhook handler |

### POST /api/subscriptions — Body
```json
{ "planId": "uuid", "interval": "monthly" | "yearly" }
```

### Response
```json
{ "url": "https://checkout.stripe.com/..." }
```

---

## Marketing AI

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/marketing/campaigns` | Yes | List campaigns |
| POST | `/api/marketing/campaigns` | Yes | Create campaign |
| GET | `/api/marketing/posts` | Yes | List posts |
| POST | `/api/marketing/posts` | Yes | Create post (with optional AI generation) |
| GET | `/api/marketing/workflows` | Yes | List AI workflows |
| POST | `/api/marketing/workflows` | Yes | Create workflow |

### POST /api/marketing/posts — AI Generation
```json
{
  "restaurantId": "uuid",
  "platform": "twitter",
  "postType": "restaurant_promo",
  "aiGenerate": true,
  "scheduledFor": "2026-06-15T12:00:00Z"
}
```

---

## Admin (Admin role required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Dashboard statistics |
| GET | `/api/admin/users` | List users (page, limit, search) |
| PUT | `/api/admin/users/[id]` | Update user (admin toggle) |
| GET | `/api/admin/restaurants` | List restaurants (page, limit) |
| DELETE | `/api/admin/restaurants/[id]` | Delete restaurant |
| GET | `/api/admin/reviews` | List reviews (page, limit) |
| DELETE | `/api/admin/reviews/[id]` | Delete review |

---

## Error Handling

All endpoints return standardized errors:

```json
{
  "error": "Human-readable message",
  "code": "ERROR_CODE"
}
```

### HTTP Status Codes
| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Internal Server Error |

### Common Error Codes
| Code | Description |
|------|-------------|
| `AUTHENTICATION_ERROR` | Invalid or missing credentials |
| `AUTHORIZATION_ERROR` | Insufficient permissions |
| `VALIDATION_ERROR` | Invalid request body |
| `NOT_FOUND` | Resource not found |
| `DATABASE_ERROR` | Database operation failed |
| `INTERNAL_ERROR` | Unexpected server error |

---

## Rate Limiting

- **Server-side:** Middleware rate limiter on all `/api/*` routes
- **Client-side:** `apiClient` limits to 10 requests/second
- **Retry:** Exponential backoff on 429 responses
