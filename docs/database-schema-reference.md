# Database Schema Reference - FoodList

Complete reference of all database tables, relationships, and policies.

---

## Tables Overview

| Table | Purpose | Key Relations |
|-------|---------|---------------|
| `restaurants` | Core restaurant data | → auth.users (creator) |
| `lists` | User-created lists | → auth.users (creator) |
| `list_restaurants` | Junction: lists ↔ restaurants | → lists, → restaurants |
| `profiles` | User profiles | → auth.users |
| `reviews` | Restaurant reviews | → restaurants, → auth.users |
| `cuisine_types` | Cuisine type catalog | (many-to-many via restaurant_cuisine_types) |
| `restaurant_cuisine_types` | Junction: restaurants ↔ cuisine_types | → restaurants, → cuisine_types |
| `restaurant_features` | Feature catalog | (many-to-many via restaurant_restaurant_features) |
| `restaurant_restaurant_features` | Junction: restaurants ↔ features | → restaurants, → restaurant_features |
| `restaurant_dietary_options` | Dietary option catalog | (many-to-many via restaurant_dietary_options_junction) |
| `restaurant_dietary_options_junction` | Junction: restaurants ↔ dietary | → restaurants, → restaurant_dietary_options |
| `user_restaurant_visits` | User visit tracking | → auth.users, → restaurants |
| `filter_presets` | Saved filter presets | → auth.users |
| `user_search_index` | Full-text user search | → profiles |

---

## Table Details

### restaurants

Core restaurant information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Unique identifier |
| name | text | NOT NULL | Restaurant name |
| description | text | | Restaurant description |
| image_url | text | | Main image URL |
| price_per_person | numeric | | Average price per person |
| rating | numeric | CHECK (0-5) | Average rating |
| location | text | | Address/location |
| source_url | text | | Original source URL |
| creator | text | | Creator identifier |
| menu_url | text | | Menu URL |
| visited | boolean | DEFAULT false | Visited flag |
| phone_numbers | text[] | DEFAULT '{}' | Array of phone numbers |
| creator_id | uuid | FK → auth.users(id) | User who created |
| creator_name | text | | Creator display name |
| created_at | timestamptz | DEFAULT now() | Creation timestamp |
| images | text[] | DEFAULT '{}' | Array of image URLs |
| display_image_index | integer | DEFAULT -1, CHECK >= -1 | Selected image index |
| menu_links | text[] | DEFAULT '{}', max 5 | Menu link URLs |
| menu_images | text[] | DEFAULT '{}', max 10 | Menu image URLs |
| latitude | numeric | CHECK (-90 to 90) | GPS latitude |
| longitude | numeric | CHECK (-180 to 180) | GPS longitude |
| review_count | integer | DEFAULT 0 | Total reviews count |

**Indexes to create:**
```sql
CREATE INDEX idx_restaurants_name ON restaurants(name);
CREATE INDEX idx_restaurants_creator_id ON restaurants(creator_id);
CREATE INDEX idx_restaurants_location ON restaurants(location);
CREATE INDEX idx_restaurants_created_at ON restaurants(created_at);
```

---

### lists

User-created restaurant lists.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Unique identifier |
| name | text | NOT NULL | List name |
| description | text | | List description |
| created_at | timestamp | DEFAULT now() | Creation timestamp |
| creator | text | | Creator identifier |
| creator_id | uuid | FK → auth.users(id) | User who created |
| creator_name | text | | Creator display name |
| filters | jsonb | | Associated filters |

---

### list_restaurants

Junction table linking lists to restaurants.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| list_id | uuid | PK, FK → lists(id) | List reference |
| restaurant_id | uuid | PK, FK → restaurants(id) | Restaurant reference |

---

### profiles

User profile information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Unique identifier |
| user_id | uuid | NOT NULL, UNIQUE, FK → auth.users(id) | Auth user reference |
| display_name | text | | Display name |
| bio | text | | User bio |
| avatar_url | text | | Avatar image URL |
| website | text | | Personal website |
| location | text | | User location |
| created_at | timestamptz | DEFAULT now() | Creation timestamp |
| updated_at | timestamptz | DEFAULT now() | Last update timestamp |
| phone_number | text | | Phone number |
| user_id_code | varchar | UNIQUE | Profile URL code |
| public_profile | boolean | DEFAULT true | Profile visibility |
| total_restaurants_visited | integer | DEFAULT 0 | Stats |
| total_reviews | integer | DEFAULT 0 | Stats |
| total_lists | integer | DEFAULT 0 | Stats |
| total_restaurants_added | integer | DEFAULT 0 | Stats |

---

### reviews

Restaurant reviews by users.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Unique identifier |
| restaurant_id | uuid | NOT NULL, FK → restaurants(id) | Restaurant reference |
| user_id | uuid | NOT NULL, FK → auth.users(id) | User reference |
| rating | numeric | NOT NULL, CHECK (0.5-5.0) | Rating value |
| comment | text | | Review comment |
| created_at | timestamp | DEFAULT now() | Creation timestamp |
| updated_at | timestamp | DEFAULT now() | Last update timestamp |
| user_name | text | NOT NULL, DEFAULT 'Anonymous User' | Display name |
| amount_spent | numeric | | Amount spent |

---

### cuisine_types

Catalog of cuisine types.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Unique identifier |
| name | text | NOT NULL, UNIQUE | Cuisine name |
| description | text | | Description |
| icon | text | | Icon identifier |
| created_at | timestamptz | DEFAULT now() | Creation timestamp |

---

### restaurant_cuisine_types

Junction: restaurants ↔ cuisine_types.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| restaurant_id | uuid | NOT NULL, PK, FK → restaurants(id) | Restaurant reference |
| cuisine_type_id | uuid | NOT NULL, PK, FK → cuisine_types(id) | Cuisine type reference |
| created_at | timestamptz | DEFAULT now() | Creation timestamp |

---

### restaurant_features

Catalog of restaurant features.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Unique identifier |
| name | text | NOT NULL | Feature name |
| description | text | | Description |
| icon | text | | Icon identifier |
| created_at | timestamptz | DEFAULT now() | Creation timestamp |

---

### restaurant_restaurant_features

Junction: restaurants ↔ features.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Unique identifier |
| restaurant_id | uuid | NOT NULL, FK → restaurants(id) | Restaurant reference |
| feature_id | uuid | NOT NULL, FK → restaurant_features(id) | Feature reference |
| created_at | timestamptz | DEFAULT now() | Creation timestamp |

---

### restaurant_dietary_options

Catalog of dietary options.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Unique identifier |
| name | text | NOT NULL | Option name |
| description | text | | Description |
| icon | text | | Icon identifier |
| created_at | timestamptz | DEFAULT now() | Creation timestamp |

---

### restaurant_dietary_options_junction

Junction: restaurants ↔ dietary options.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Unique identifier |
| restaurant_id | uuid | NOT NULL, FK → restaurants(id) | Restaurant reference |
| dietary_option_id | uuid | NOT NULL, FK → restaurant_dietary_options(id) | Dietary option reference |
| created_at | timestamptz | DEFAULT now() | Creation timestamp |

---

### user_restaurant_visits

Track user visits to restaurants.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Unique identifier |
| user_id | uuid | NOT NULL, FK → auth.users(id) | User reference |
| restaurant_id | uuid | NOT NULL, FK → restaurants(id) | Restaurant reference |
| visit_count | integer | NOT NULL, DEFAULT 0 | Visit count |
| visited | boolean | NOT NULL, DEFAULT false | Visited flag |
| created_at | timestamptz | DEFAULT now() | Creation timestamp |
| updated_at | timestamptz | DEFAULT now() | Last update timestamp |

---

### filter_presets

Saved filter configurations.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Unique identifier |
| name | text | NOT NULL | Preset name |
| filters | jsonb | NOT NULL | Filter configuration |
| user_id | uuid | NOT NULL, FK → auth.users(id) | User reference |
| created_at | timestamptz | DEFAULT now() | Creation timestamp |
| updated_at | timestamptz | DEFAULT now() | Last update timestamp |

---

### user_search_index

Full-text search index for users.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Unique identifier |
| user_id | uuid | NOT NULL, UNIQUE, FK → profiles(user_id) | User reference |
| display_name | text | | Searchable name |
| location | text | | Searchable location |
| bio | text | | Searchable bio |
| search_vector | tsvector | | Full-text search vector |
| updated_at | timestamptz | DEFAULT now() | Last update timestamp |

---

## Entity Relationship Diagram

```
auth.users
    │
    ├──→ profiles (1:1)
    │       │
    │       └──→ user_search_index (1:1)
    │
    ├──→ restaurants (1:N) as creator
    │       │
    │       ├──→ list_restaurants (N:M) ←── lists
    │       │
    │       ├──→ restaurant_cuisine_types (N:M) ←── cuisine_types
    │       │
    │       ├──→ restaurant_restaurant_features (N:M) ←── restaurant_features
    │       │
    │       ├──→ restaurant_dietary_options_junction (N:M) ←── restaurant_dietary_options
    │       │
    │       ├──→ reviews (1:N) ←── auth.users
    │       │
    │       └──→ user_restaurant_visits (N:M) ←── auth.users
    │
    └──→ lists (1:N) as creator
            │
            └──→ list_restaurants (N:M) ←── restaurants
```

---

## Common Query Patterns

### Get restaurant with cuisine types
```sql
SELECT r.*, 
       array_agg(ct.name) as cuisine_types
FROM restaurants r
LEFT JOIN restaurant_cuisine_types rct ON r.id = rct.restaurant_id
LEFT JOIN cuisine_types ct ON rct.cuisine_type_id = ct.id
GROUP BY r.id;
```

### Get restaurant with reviews count and average
```sql
SELECT r.*, 
       COUNT(rev.id) as review_count,
       AVG(rev.rating) as avg_rating
FROM restaurants r
LEFT JOIN reviews rev ON r.id = rev.restaurant_id
GROUP BY r.id;
```

### Get user's lists with restaurant count
```sql
SELECT l.*, 
       COUNT(lr.restaurant_id) as restaurant_count
FROM lists l
LEFT JOIN list_restaurants lr ON l.id = lr.list_id
WHERE l.creator_id = $1
GROUP BY l.id;
```

### Search restaurants with filters
```sql
SELECT r.*
FROM restaurants r
WHERE r.name ILIKE $1
  AND (r.price_per_person <= $2 OR $2 IS NULL)
  AND (r.rating >= $3 OR $3 IS NULL)
ORDER BY r.name
LIMIT $4 OFFSET $5;
```

---

## TypeScript Types Reference

```typescript
// types/database.ts
export interface Database {
  public: {
    Tables: {
      restaurants: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          image_url: string | null;
          price_per_person: number | null;
          rating: number | null;
          location: string | null;
          creator_id: string | null;
          creator_name: string | null;
          created_at: string;
          phone_numbers: string[];
          images: string[];
          menu_links: string[];
          menu_images: string[];
          latitude: number | null;
          longitude: number | null;
          review_count: number;
        };
        Insert: Omit<Database['public']['Tables']['restaurants']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['restaurants']['Insert']>;
      };
      // ... other tables
    };
  };
}
```

---

*Last updated: 2026-04-05*