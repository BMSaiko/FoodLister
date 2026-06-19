# Database Schema Reference - FoodLister

Complete reference of all database tables, relationships, and policies.

---

## Tables Overview

| Table | Purpose | Key Relations |
|-------|---------|---------------|
| `restaurants` | Core restaurant data | → auth.users (creator) |
| `lists` | User-created lists | → auth.users (creator_id) |
| `list_restaurants` | Junction: lists ↔ restaurants | → lists, → restaurants |
| `cuisine_types` | Cuisine type catalog | (many-to-many via restaurant_cuisine_types) |
| `restaurant_cuisine_types` | Junction: restaurants ↔ cuisine_types | → restaurants, → cuisine_types |
| `dietary_options` | Dietary option catalog | (many-to-many via restaurant_dietary_options_junction) |
| `restaurant_dietary_options_junction` | Junction: restaurants ↔ dietary | → restaurants, → dietary_options |
| `restaurant_features` | Feature catalog | (many-to-many via restaurant_restaurant_features) |
| `restaurant_restaurant_features` | Junction: restaurants ↔ features | → restaurants, → restaurant_features |
| `reviews` | Restaurant reviews | → restaurants, → auth.users |
| `user_stats` | User statistics | → auth.users (unique) |
| `notifications` | User notifications | → auth.users |
| `scheduled_meals` | Scheduled meals | → auth.users, → restaurants |

---

## Table Details

### restaurants

Core restaurant information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Unique identifier |
| name | text | NOT NULL | Restaurant name |
| description | text | | Restaurant description |
| image_url | text | | Main image URL |
| price_per_person | numeric | CHECK (>0) | Average price per person |
| rating | numeric | CHECK (0-5) | Average rating |
| location | text | | Address/location |
| source_url | text | | Original source URL |
| creator | uuid | FK → auth.users(id) | User who created |
| menu_url | text | | **Deprecated** - use menu_links |
| menu_links | text[] | DEFAULT '{}', max 5 | Menu link URLs |
| menu_images | text[] | DEFAULT '{}', max 10 | Menu image URLs |
| phone_numbers | text[] | DEFAULT '{}' | Array of phone numbers |
| latitude | double precision | CHECK (-90 to 90) | GPS latitude |
| longitude | double precision | CHECK (-180 to 180) | GPS longitude |
| created_at | timestamptz | DEFAULT now() | Creation timestamp |
| updated_at | timestamptz | DEFAULT now() | Last update timestamp |

**Indexes to create:**
```sql
CREATE INDEX idx_restaurants_name ON restaurants USING gin(to_tsvector('english', name));
CREATE INDEX idx_restaurants_creator ON restaurants(creator);
CREATE INDEX idx_restaurants_visited ON restaurants(visited);
CREATE INDEX idx_restaurants_rating ON restaurants(rating);
CREATE INDEX idx_restaurants_price ON restaurants(price_per_person);
CREATE INDEX idx_restaurants_location ON restaurants(location);
```

---

### cuisine_types

Catalog of cuisine types.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Unique identifier |
| name | text | NOT NULL, UNIQUE | Cuisine name |
| description | text | | Description |
| icon | text | | Icon identifier or emoji |
| created_at | timestamptz | DEFAULT now() | Creation timestamp |

---

### restaurant_cuisine_types

Junction: restaurants ↔ cuisine_types.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| restaurant_id | uuid | PK, FK → restaurants(id) | Restaurant reference |
| cuisine_type_id | uuid | PK, FK → cuisine_types(id) | Cuisine type reference |
| created_at | timestamptz | DEFAULT now() | Creation timestamp |

**Unique Constraint**: `(restaurant_id, cuisine_type_id)`

---

### dietary_options

Catalog of dietary options.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Unique identifier |
| name | text | NOT NULL, UNIQUE | Option name |
| description | text | | Description |
| icon | text | | Icon identifier or emoji |
| created_at | timestamptz | DEFAULT now() | Creation timestamp |

---

### restaurant_dietary_options_junction

Junction: restaurants ↔ dietary options.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| restaurant_id | uuid | PK, FK → restaurants(id) | Restaurant reference |
| dietary_option_id | uuid | PK, FK → dietary_options(id) | Dietary option reference |
| created_at | timestamptz | DEFAULT now() | Creation timestamp |

**Unique Constraint**: `(restaurant_id, dietary_option_id)`

---

### restaurant_features

Catalog of restaurant features.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Unique identifier |
| name | text | NOT NULL | Feature name |
| description | text | | Description |
| icon | text | | Icon identifier or emoji |
| created_at | timestamptz | DEFAULT now() | Creation timestamp |

---

### restaurant_restaurant_features

Junction: restaurants ↔ features.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| restaurant_id | uuid | PK, FK → restaurants(id) | Restaurant reference |
| feature_id | uuid | PK, FK → restaurant_features(id) | Feature reference |
| created_at | timestamptz | DEFAULT now() | Creation timestamp |

**Unique Constraint**: `(restaurant_id, feature_id)`

---

### lists

User-created restaurant lists.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Unique identifier |
| name | text | NOT NULL | List name |
| description | text | | List description |
| creator_id | uuid | FK → auth.users(id) | User who created |
| is_public | boolean | DEFAULT true | Public visibility |
| filters | jsonb | | Saved filter configuration |
| created_at | timestamptz | DEFAULT now() | Creation timestamp |
| updated_at | timestamptz | DEFAULT now() | Last update timestamp |

**Indexes:**
```sql
CREATE INDEX idx_lists_creator_id ON lists(creator_id);
CREATE INDEX idx_lists_is_public ON lists(is_public);
```

---

### list_restaurants

Junction table linking lists to restaurants.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| list_id | uuid | PK, FK → lists(id) | List reference |
| restaurant_id | uuid | PK, FK → restaurants(id) | Restaurant reference |
| created_at | timestamptz | DEFAULT now() | Creation timestamp |

**Unique Constraint**: `(list_id, restaurant_id)`

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
| amount_spent | numeric | | Amount spent |
| created_at | timestamptz | DEFAULT now() | Creation timestamp |
| updated_at | timestamptz | DEFAULT now() | Last update timestamp |

**Indexes:**
```sql
CREATE INDEX idx_reviews_restaurant_id ON reviews(restaurant_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
```

---

### user_stats

User statistics (maintained by triggers).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Unique identifier |
| user_id | uuid | NOT NULL, UNIQUE, FK → auth.users(id) | User reference |
| restaurants_visited | integer | DEFAULT 0 | Number of restaurants visited |
| lists_created | integer | DEFAULT 0 | Number of lists created |
| reviews_written | integer | DEFAULT 0 | Number of reviews written |
| total_visits | integer | DEFAULT 0 | Total number of visits |
| created_at | timestamptz | DEFAULT now() | Creation timestamp |
| updated_at | timestamptz | DEFAULT now() | Last update timestamp |

**Indexes:**
```sql
CREATE UNIQUE INDEX idx_user_stats_user_id ON user_stats(user_id);
```

---

### notifications

User notifications.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Unique identifier |
| user_id | uuid | NOT NULL, FK → auth.users(id) | User reference |
| type | text | NOT NULL | Notification type |
| message | text | NOT NULL | Notification message |
| read | boolean | DEFAULT false | Read status |
| related_id | uuid | | Related entity ID |
| created_at | timestamptz | DEFAULT now() | Creation timestamp |

**Indexes:**
```sql
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
```

---

### scheduled_meals

Scheduled meals at restaurants.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Unique identifier |
| user_id | uuid | NOT NULL, FK → auth.users(id) | User reference |
| restaurant_id | uuid | NOT NULL, FK → restaurants(id) | Restaurant reference |
| meal_date | date | NOT NULL | Date of scheduled meal |
| meal_type | text | | Type of meal (lunch, dinner) |
| participants | uuid[] | DEFAULT '{}' | Array of participant user IDs |
| notes | text | | Additional notes |
| created_at | timestamptz | DEFAULT now() | Creation timestamp |
| updated_at | timestamptz | DEFAULT now() | Last update timestamp |

**Indexes:**
```sql
CREATE INDEX idx_scheduled_meals_user_id ON scheduled_meals(user_id);
CREATE INDEX idx_scheduled_meals_restaurant_id ON scheduled_meals(restaurant_id);
CREATE INDEX idx_scheduled_meals_date ON scheduled_meals(meal_date);
```

---

## Entity Relationship Diagram

```
auth.users
    │
    ├──→ restaurants (1:N) as creator
    │       │
    │       ├──→ restaurant_cuisine_types (N:M) ←── cuisine_types
    │       │
    │       ├──→ restaurant_dietary_options_junction (N:M) ←── dietary_options
    │       │
    │       ├──→ restaurant_restaurant_features (N:M) ←── restaurant_features
    │       │
    │       ├──→ list_restaurants (N:M) ←── lists ←── auth.users (creator_id)
    │       │
    │       ├──→ reviews (1:N) ←── auth.users
    │       │
    │       └──→ scheduled_meals (1:N)
    │
    ├──→ lists (1:N) as creator_id
    │
    ├──→ reviews (1:N)
    │
    ├──→ user_stats (1:1)
    │
    ├──→ notifications (1:N)
    │
    └──→ scheduled_meals (1:N)
```

---

## Row Level Security (RLS) Policies

### restaurants
```sql
-- Allow authenticated users to read all restaurants
CREATE POLICY "Allow read access to restaurants" ON restaurants
FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert restaurants
CREATE POLICY "Allow insert access to restaurants" ON restaurants
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow users to update their own restaurants
CREATE POLICY "Allow update access to own restaurants" ON restaurants
FOR UPDATE USING (creator = auth.uid()::text);

-- Allow users to delete their own restaurants
CREATE POLICY "Allow delete access to own restaurants" ON restaurants
FOR DELETE USING (creator = auth.uid()::text);
```

### lists
```sql
-- Public lists are viewable by everyone, private lists only by creator
CREATE POLICY "Lists are viewable by everyone" ON lists
FOR SELECT USING (is_public = true OR creator_id = auth.uid());

-- Users can create their own lists
CREATE POLICY "Users can create their own lists" ON lists
FOR INSERT WITH CHECK (creator_id = auth.uid());

-- Users can update their own lists
CREATE POLICY "Users can update their own lists" ON lists
FOR UPDATE USING (creator_id = auth.uid());

-- Users can delete their own lists
CREATE POLICY "Users can delete their own lists" ON lists
FOR DELETE USING (creator_id = auth.uid());
```

### reviews
```sql
-- Allow anyone to read reviews
CREATE POLICY "reviews_select_policy" ON reviews
FOR SELECT USING (true);

-- Allow authenticated users to insert their own reviews
CREATE POLICY "reviews_insert_policy" ON reviews
FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

-- Allow users to update their own reviews
CREATE POLICY "reviews_update_policy" ON reviews
FOR UPDATE USING (auth.role() = 'authenticated' AND auth.uid() = user_id);

-- Allow users to delete their own reviews
CREATE POLICY "reviews_delete_policy" ON reviews
FOR DELETE USING (auth.role() = 'authenticated' AND auth.uid() = user_id);
```

### user_stats
```sql
-- Users can view their own stats
CREATE POLICY "Users can view their own stats" ON user_stats
FOR SELECT USING (user_id = auth.uid());

-- Service role can manage all stats
CREATE POLICY "Service role can manage stats" ON user_stats
FOR ALL USING (auth.role() = 'service_role');
```

### notifications
```sql
-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications" ON notifications
FOR SELECT USING (user_id = auth.uid());

-- Users can update their own notifications
CREATE POLICY "Users can update their own notifications" ON notifications
FOR UPDATE USING (user_id = auth.uid());

-- Service role can create notifications
CREATE POLICY "Service role can create notifications" ON notifications
FOR INSERT WITH CHECK (auth.role() = 'service_role');
```

### scheduled_meals
```sql
-- Users can manage their own scheduled meals
CREATE POLICY "Users can manage their own meals" ON scheduled_meals
FOR ALL USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());
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

### Get user stats
```sql
SELECT *
FROM user_stats
WHERE user_id = $1;
```

### Get user notifications (unread first)
```sql
SELECT *
FROM notifications
WHERE user_id = $1
ORDER BY read ASC, created_at DESC
LIMIT $2;
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
          source_url: string | null;
          creator: string | null;
          menu_url: string | null;
          menu_links: string[];
          menu_images: string[];
          phone_numbers: string[];
          latitude: number | null;
          longitude: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['restaurants']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['restaurants']['Insert']>;
      };
      lists: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          creator_id: string | null;
          is_public: boolean;
          filters: any | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['lists']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['lists']['Insert']>;
      };
      reviews: {
        Row: {
          id: string;
          restaurant_id: string;
          user_id: string;
          rating: number;
          comment: string | null;
          amount_spent: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['reviews']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['reviews']['Insert']>;
      };
      user_stats: {
        Row: {
          id: string;
          user_id: string;
          restaurants_visited: number;
          lists_created: number;
          reviews_written: number;
          total_visits: number;
          created_at: string;
          updated_at: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          message: string;
          read: boolean;
          related_id: string | null;
          created_at: string;
        };
      };
      scheduled_meals: {
        Row: {
          id: string;
          user_id: string;
          restaurant_id: string;
          meal_date: string;
          meal_type: string | null;
          participants: string[];
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      // ... other tables
    };
  };
}
```

---

## Database Triggers

### User Stats Trigger

Automatically creates user_stats record on user creation:

```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_stats (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

---

*Last updated: 2026-05-07*