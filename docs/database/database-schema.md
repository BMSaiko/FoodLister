# Database Schema Documentation

This document describes the database schema for the FoodLister application, which uses Supabase (PostgreSQL) as the backend database.

## Overview

The FoodLister application uses a relational database with the following main entities:
- Restaurants
- Cuisine Types
- Dietary Options
- Restaurant Features
- Lists
- Reviews
- User Profiles
- User Stats
- Notifications
- Visits

## Tables

### Restaurants Table

**Table Name**: `restaurants`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | `uuid` | NO | `gen_random_uuid()` | Primary key |
| `name` | `text` | NO | - | Restaurant name |
| `description` | `text` | YES | - | Restaurant description |
| `image_url` | `text` | YES | - | URL of restaurant image |
| `price_per_person` | `numeric` | YES | - | Average price per person |
| `rating` | `numeric` | YES | - | Restaurant rating (1-5) |
| `location` | `text` | YES | - | Address/location string |
| `source_url` | `text` | YES | - | URL where restaurant was found |
| `creator` | `uuid` | YES | - | Foreign key to auth.users.id |
| `menu_url` | `text` | YES | - | **Deprecated**: Single link to online menu (use menu_links instead) |
| `menu_links` | `text[]` | YES | `'{}'::text[]` | Array of external links to restaurant menus (max 5) |
| `menu_images` | `text[]` | YES | `'{}'::text[]` | Array of URLs for uploaded menu images (max 10) |
| `phone_numbers` | `text[]` | YES | `'{}'::text[]` | Array of phone numbers for the restaurant |
| `latitude` | `double precision` | YES | - | Latitude coordinate |
| `longitude` | `double precision` | YES | - | Longitude coordinate |
| `created_at` | `timestamp with time zone` | NO | `now()` | Creation timestamp |
| `updated_at` | `timestamp with time zone` | NO | `now()` | Last update timestamp |

### Cuisine Types Table

**Table Name**: `cuisine_types`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | `uuid` | NO | `gen_random_uuid()` | Primary key |
| `name` | `text` | NO | - | Cuisine type name (e.g., "Italian", "Chinese") |
| `description` | `text` | YES | - | Description of cuisine type |
| `icon` | `text` | YES | - | Icon identifier or emoji |
| `created_at` | `timestamp with time zone` | NO | `now()` | Creation timestamp |

### Restaurant Cuisine Types Table (Junction)

**Table Name**: `restaurant_cuisine_types`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `restaurant_id` | `uuid` | NO | - | Foreign key to restaurants.id |
| `cuisine_type_id` | `uuid` | NO | - | Foreign key to cuisine_types.id |
| `created_at` | `timestamp with time zone` | NO | `now()` | Creation timestamp |

**Unique Constraint**: `(restaurant_id, cuisine_type_id)`

### Dietary Options Table

**Table Name**: `dietary_options`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | `uuid` | NO | `gen_random_uuid()` | Primary key |
| `name` | `text` | NO | - | Dietary option name (e.g., "Vegetarian", "Vegan") |
| `description` | `text` | YES | - | Description of dietary option |
| `icon` | `text` | YES | - | Icon identifier or emoji |
| `created_at` | `timestamp with time zone` | NO | `now()` | Creation timestamp |

### Restaurant Dietary Options Junction Table

**Table Name**: `restaurant_dietary_options_junction`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `restaurant_id` | `uuid` | NO | - | Foreign key to restaurants.id |
| `dietary_option_id` | `uuid` | NO | - | Foreign key to dietary_options.id |
| `created_at` | `timestamp with time zone` | NO | `now()` | Creation timestamp |

**Unique Constraint**: `(restaurant_id, dietary_option_id)`

### Restaurant Features Table

**Table Name**: `restaurant_features`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | `uuid` | NO | `gen_random_uuid()` | Primary key |
| `name` | `text` | NO | - | Feature name (e.g., "Outdoor Seating", "WiFi") |
| `description` | `text` | YES | - | Description of feature |
| `icon` | `text` | YES | - | Icon identifier or emoji |
| `created_at` | `timestamp with time zone` | NO | `now()` | Creation timestamp |

### Restaurant Restaurant Features Table (Junction)

**Table Name**: `restaurant_restaurant_features`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `restaurant_id` | `uuid` | NO | - | Foreign key to restaurants.id |
| `feature_id` | `uuid` | NO | - | Foreign key to restaurant_features.id |
| `created_at` | `timestamp with time zone` | NO | `now()` | Creation timestamp |

**Unique Constraint**: `(restaurant_id, feature_id)`

### Lists Table

**Table Name**: `lists`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | `uuid` | NO | `gen_random_uuid()` | Primary key |
| `name` | `text` | NO | - | List name |
| `description` | `text` | YES | - | List description |
| `creator_id` | `uuid` | YES | - | UUID of user who created list (FK to auth.users) |
| `is_public` | `boolean` | NO | `true` | Whether list is publicly visible |
| `filters` | `jsonb` | YES | - | Saved filter configuration used to create list |
| `created_at` | `timestamp with time zone` | NO | `now()` | Creation timestamp |
| `updated_at` | `timestamp with time zone` | NO | `now()` | Last update timestamp |

### List Restaurants Table (Junction)

**Table Name**: `list_restaurants`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `list_id` | `uuid` | NO | - | Foreign key to lists.id |
| `restaurant_id` | `uuid` | NO | - | Foreign key to restaurants.id |
| `created_at` | `timestamp with time zone` | NO | `now()` | Creation timestamp |

**Unique Constraint**: `(list_id, restaurant_id)`

### Reviews Table

**Table Name**: `reviews`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | `uuid` | NO | `gen_random_uuid()` | Primary key |
| `restaurant_id` | `uuid` | NO | - | Foreign key to restaurants.id |
| `user_id` | `uuid` | NO | - | Foreign key to auth.users.id |
| `rating` | `numeric` | NO | - | Rating from 0.5 to 5.0 stars |
| `comment` | `text` | YES | - | Optional text comment for the review |
| `amount_spent` | `numeric` | YES | - | Amount spent during visit |
| `created_at` | `timestamp with time zone` | NO | `now()` | Creation timestamp |
| `updated_at` | `timestamp with time zone` | NO | `now()` | Last update timestamp |

### User Stats Table

**Table Name**: `user_stats`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | `uuid` | NO | `gen_random_uuid()` | Primary key |
| `user_id` | `uuid` | NO | - | Foreign key to auth.users.id (unique) |
| `restaurants_visited` | `integer` | NO | `0` | Number of restaurants visited |
| `lists_created` | `integer` | NO | `0` | Number of lists created |
| `reviews_written` | `integer` | NO | `0` | Number of reviews written |
| `total_visits` | `integer` | NO | `0` | Total number of visits |
| `created_at` | `timestamp with time zone` | NO | `now()` | Creation timestamp |
| `updated_at` | `timestamp with time zone` | NO | `now()` | Last update timestamp |

### Notifications Table

**Table Name**: `notifications`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | `uuid` | NO | `gen_random_uuid()` | Primary key |
| `user_id` | `uuid` | NO | - | Foreign key to auth.users.id |
| `type` | `text` | NO | - | Notification type (e.g., "review", "list_shared") |
| `message` | `text` | NO | - | Notification message |
| `read` | `boolean` | NO | `false` | Whether notification has been read |
| `related_id` | `uuid` | YES | - | ID of related entity (restaurant, list, review) |
| `created_at` | `timestamp with time zone` | NO | `now()` | Creation timestamp |

### Scheduled Meals Table

**Table Name**: `scheduled_meals`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | `uuid` | NO | `gen_random_uuid()` | Primary key |
| `user_id` | `uuid` | NO | - | Foreign key to auth.users.id |
| `restaurant_id` | `uuid` | NO | - | Foreign key to restaurants.id |
| `meal_date` | `date` | NO | - | Date of scheduled meal |
| `meal_type` | `text` | YES | - | Type of meal (e.g., "lunch", "dinner") |
| `participants` | `uuid[]` | YES | `'{}'::uuid[]` | Array of participant user IDs |
| `notes` | `text` | YES | - | Additional notes |
| `created_at` | `timestamp with time zone` | NO | `now()` | Creation timestamp |
| `updated_at` | `timestamp with time zone` | NO | `now()` | Last update timestamp |

## Relationships

### Entity Relationship Diagram

```
┌─────────────────┐       ┌──────────────────────┐
│   restaurants   │       │  restaurant_cuisine_ │
│                 │       │       types          │
│ • id (PK)       │◄──────┤ • restaurant_id (FK) │
│ • name          │       │ • cuisine_type_id    │
│ • description   │       │ • created_at         │
│ • image_url     │       └──────────────────────┘
│ • price_per_person│                ▲
│ • rating        │                │
│ • location      │                │
│ • source_url    │       ┌─────────────────┐
│ • creator       │       │ cuisine_types   │
│ • menu_url      │       │                 │
│ • visited       │       │ • id (PK)       │
│ • created_at    │       │ • name          │
│ • updated_at    │       │ • description   │
│ └─────────────────┘       │ • icon          │
         ▲                │ • created_at    │
         │                └─────────────────┘
         │
┌─────────────────┐       ┌──────────────────────┐
│     lists       │       │   list_restaurants   │
│                 │       │                      │
│ • id (PK)       │◄──────┤ • list_id (FK)       │
│ • name          │       │ • restaurant_id (FK) │
│ • description   │       │ • created_at         │
│ • creator_id    │       └──────────────────────┘
│ • is_public     │
│ • filters       │
│ • created_at    │
│ • updated_at    │
└─────────────────┘

┌─────────────────┐       ┌──────────────────────┐
│  reviews        │       │restaurant_dietary_   │
│                 │       │options_junction      │
│ • id (PK)       │       │                      │
│ • restaurant_id │       │ • restaurant_id (FK) │
│ • user_id       │       │ • dietary_option_id  │
│ • rating        │       └──────────────────────┘
│ • comment       │                ▲
│ • amount_spent  │                │
│ • created_at    │       ┌─────────────────┐
│ • updated_at    │       │ dietary_options  │
└─────────────────┘       │                 │
                        │ • id (PK)       │
                        │ • name          │
                        │ • description   │
                        │ • icon          │
                        └─────────────────┘

┌─────────────────┐       ┌──────────────────────┐
│  user_stats     │       │restaurant_restaurant_│
│                 │       │features              │
│ • id (PK)       │       │                      │
│ • user_id (FK)  │       │ • restaurant_id (FK) │
│ • restaurants_  │       │ • feature_id (FK)   │
│ • lists_created │       └──────────────────────┘
│ • reviews_written│               ▲
│ • total_visits  │               │
│ • created_at    │       ┌─────────────────┐
│ • updated_at    │       │restaurant_      │
└─────────────────┘       │features        │
                        │                 │
                        │ • id (PK)       │
                        │ • name          │
                        │ • description   │
                        │ • icon          │
                        └─────────────────┘
```

### Relationships Summary

- **One-to-Many**: `restaurants` → `restaurant_cuisine_types` (one restaurant can have many cuisine types)
- **One-to-Many**: `cuisine_types` → `restaurant_cuisine_types` (one cuisine type can belong to many restaurants)
- **One-to-Many**: `restaurants` → `restaurant_dietary_options_junction` (one restaurant can have many dietary options)
- **One-to-Many**: `dietary_options` → `restaurant_dietary_options_junction`
- **One-to-Many**: `restaurants` → `restaurant_restaurant_features` (one restaurant can have many features)
- **One-to-Many**: `restaurant_features` → `restaurant_restaurant_features`
- **One-to-Many**: `lists` → `list_restaurants` (one list can contain many restaurants)
- **One-to-Many**: `restaurants` → `list_restaurants` (one restaurant can belong to many lists)
- **One-to-Many**: `restaurants` → `reviews` (one restaurant can have many reviews)
- **One-to-Many**: `auth.users` → `reviews` (one user can write many reviews)
- **One-to-One**: `auth.users` → `user_stats` (one user has one stats record)
- **One-to-Many**: `auth.users` → `notifications` (one user can have many notifications)
- **One-to-Many**: `auth.users` → `scheduled_meals` (one user can schedule many meals)
- **One-to-Many**: `restaurants` → `scheduled_meals` (one restaurant can have many scheduled meals)

## Indexes

For optimal performance, the following indexes should be created:

```sql
-- Restaurants table indexes
CREATE INDEX idx_restaurants_name ON restaurants USING gin(to_tsvector('english', name));
CREATE INDEX idx_restaurants_creator ON restaurants(creator);
CREATE INDEX idx_restaurants_visited ON restaurants(visited);
CREATE INDEX idx_restaurants_rating ON restaurants(rating);
CREATE INDEX idx_restaurants_price ON restaurants(price_per_person);
CREATE INDEX idx_restaurants_location ON restaurants(location);

-- Cuisine types table indexes
CREATE INDEX idx_cuisine_types_name ON cuisine_types(name);

-- Junction table indexes
CREATE INDEX idx_restaurant_cuisine_types_restaurant_id ON restaurant_cuisine_types(restaurant_id);
CREATE INDEX idx_restaurant_cuisine_types_cuisine_type_id ON restaurant_cuisine_types(cuisine_type_id);
CREATE UNIQUE INDEX idx_restaurant_cuisine_types_unique ON restaurant_cuisine_types(restaurant_id, cuisine_type_id);

CREATE INDEX idx_restaurant_dietary_options_restaurant_id ON restaurant_dietary_options_junction(restaurant_id);
CREATE INDEX idx_restaurant_dietary_options_option_id ON restaurant_dietary_options_junction(dietary_option_id);
CREATE UNIQUE INDEX idx_restaurant_dietary_options_unique ON restaurant_dietary_options_junction(restaurant_id, dietary_option_id);

CREATE INDEX idx_restaurant_features_restaurant_id ON restaurant_restaurant_features(restaurant_id);
CREATE INDEX idx_restaurant_features_feature_id ON restaurant_restaurant_features(feature_id);
CREATE UNIQUE INDEX idx_restaurant_features_unique ON restaurant_restaurant_features(restaurant_id, feature_id);

CREATE INDEX idx_list_restaurants_list_id ON list_restaurants(list_id);
CREATE INDEX idx_list_restaurants_restaurant_id ON list_restaurants(restaurant_id);
CREATE UNIQUE INDEX idx_list_restaurants_unique ON list_restaurants(list_id, restaurant_id);

-- Lists indexes
CREATE INDEX idx_lists_creator_id ON lists(creator_id);
CREATE INDEX idx_lists_is_public ON lists(is_public);

-- Reviews indexes
CREATE INDEX idx_reviews_restaurant_id ON reviews(restaurant_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);

-- User stats indexes
CREATE UNIQUE INDEX idx_user_stats_user_id ON user_stats(user_id);

-- Notifications indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);

-- Scheduled meals indexes
CREATE INDEX idx_scheduled_meals_user_id ON scheduled_meals(user_id);
CREATE INDEX idx_scheduled_meals_restaurant_id ON scheduled_meals(restaurant_id);
CREATE INDEX idx_scheduled_meals_date ON scheduled_meals(meal_date);
```

## Row Level Security (RLS) Policies

The following RLS policies should be implemented for data security:

### Restaurants Table

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

### Lists Table

The lists table uses `is_public` column for visibility control:

```sql
-- Public lists are viewable by everyone, private lists only by creator
CREATE POLICY "Lists are viewable by everyone" ON lists
  FOR SELECT
  USING (is_public = true OR creator_id = auth.uid());

-- Users can create their own lists
CREATE POLICY "Users can create their own lists" ON lists
  FOR INSERT
  WITH CHECK (creator_id = auth.uid());

-- Users can update their own lists
CREATE POLICY "Users can update their own lists" ON lists
  FOR UPDATE
  USING (creator_id = auth.uid());

-- Users can delete their own lists
CREATE POLICY "Users can delete their own lists" ON lists
  FOR DELETE
  USING (creator_id = auth.uid());
```

**Note**: The `is_public` column controls visibility. Private lists (`is_public = false`) are only visible to their creator.

### Reviews Table

```sql
-- Allow anyone to read reviews (for public display)
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

### User Stats Table

```sql
-- Users can view their own stats
CREATE POLICY "Users can view their own stats" ON user_stats
FOR SELECT USING (user_id = auth.uid());

-- Service role can manage all stats (for triggers)
CREATE POLICY "Service role can manage stats" ON user_stats
FOR ALL USING (auth.role() = 'service_role');
```

### Notifications Table

```sql
-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications" ON notifications
FOR SELECT USING (user_id = auth.uid());

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications" ON notifications
FOR UPDATE USING (user_id = auth.uid());

-- Service role can create notifications
CREATE POLICY "Service role can create notifications" ON notifications
FOR INSERT WITH CHECK (auth.role() = 'service_role');
```

### Scheduled Meals Table

```sql
-- Users can manage their own scheduled meals
CREATE POLICY "Users can manage their own meals" ON scheduled_meals
FOR ALL USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());
```

## Menu System

The FoodLister application supports a comprehensive menu system allowing restaurants to have multiple external links and uploaded images.

### Menu Links (`menu_links`)

- **Type**: `text[]` (PostgreSQL text array)
- **Maximum**: 5 external links per restaurant
- **Purpose**: Store URLs to external menu pages (PDFs, websites, etc.)
- **Validation**: URLs must be valid HTTP/HTTPS links
- **Usage**: Displayed as clickable links in restaurant details

### Menu Images (`menu_images`)

- **Type**: `text[]` (PostgreSQL text array)
- **Maximum**: 10 uploaded images per restaurant
- **Purpose**: Store Cloudinary URLs for uploaded menu images
- **Validation**: URLs must point to valid image files
- **Usage**: Displayed in responsive carousel with modal viewer

### Migration from Legacy `menu_url`

The `menu_url` field is deprecated in favor of the new array-based system:
- **Old**: Single URL stored as text
- **New**: Multiple URLs stored as arrays
- **Migration**: Existing `menu_url` values can be migrated to `menu_links[0]`

## Data Types and Constraints

### Check Constraints

```sql
-- Rating must be between 0 and 5
ALTER TABLE restaurants ADD CONSTRAINT check_rating_range
CHECK (rating >= 0 AND rating <= 5);

-- Price per person must be positive
ALTER TABLE restaurants ADD CONSTRAINT check_price_positive
CHECK (price_per_person > 0);

-- Review rating must be between 0.5 and 5
ALTER TABLE reviews ADD CONSTRAINT check_review_rating_range
CHECK (rating >= 0.5 AND rating <= 5);
```

### Foreign Key Constraints

All foreign key relationships are properly defined with CASCADE delete behavior where appropriate:

```sql
-- restaurant_cuisine_types foreign keys
ALTER TABLE restaurant_cuisine_types
ADD CONSTRAINT fk_restaurant_cuisine_types_restaurant
FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE;

ALTER TABLE restaurant_cuisine_types
ADD CONSTRAINT fk_restaurant_cuisine_types_cuisine_type
FOREIGN KEY (cuisine_type_id) REFERENCES cuisine_types(id) ON DELETE CASCADE;

-- restaurant_dietary_options_junction foreign keys
ALTER TABLE restaurant_dietary_options_junction
ADD CONSTRAINT fk_restaurant_dietary_options_restaurant
FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE;

ALTER TABLE restaurant_dietary_options_junction
ADD CONSTRAINT fk_restaurant_dietary_options_option
FOREIGN KEY (dietary_option_id) REFERENCES dietary_options(id) ON DELETE CASCADE;

-- restaurant_restaurant_features foreign keys
ALTER TABLE restaurant_restaurant_features
ADD CONSTRAINT fk_restaurant_features_restaurant
FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE;

ALTER TABLE restaurant_restaurant_features
ADD CONSTRAINT fk_restaurant_features_feature
FOREIGN KEY (feature_id) REFERENCES restaurant_features(id) ON DELETE CASCADE;

-- list_restaurants foreign keys
ALTER TABLE list_restaurants
ADD CONSTRAINT fk_list_restaurants_list
FOREIGN KEY (list_id) REFERENCES lists(id) ON DELETE CASCADE;

ALTER TABLE list_restaurants
ADD CONSTRAINT fk_list_restaurants_restaurant
FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE;

-- reviews foreign keys
ALTER TABLE reviews
ADD CONSTRAINT fk_reviews_restaurant
FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE;

ALTER TABLE reviews
ADD CONSTRAINT fk_reviews_user
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- user_stats foreign key
ALTER TABLE user_stats
ADD CONSTRAINT fk_user_stats_user
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- notifications foreign key
ALTER TABLE notifications
ADD CONSTRAINT fk_notifications_user
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- scheduled_meals foreign keys
ALTER TABLE scheduled_meals
ADD CONSTRAINT fk_scheduled_meals_user
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE scheduled_meals
ADD CONSTRAINT fk_scheduled_meals_restaurant
FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE;
```

## Sample Data

### Cuisine Types

```sql
INSERT INTO cuisine_types (name, description, icon) VALUES
('Italian', 'Italian cuisine', '🍝'),
('Chinese', 'Chinese cuisine', '🥡'),
('Mexican', 'Mexican cuisine', '🌮'),
('Japanese', 'Japanese cuisine', '🍱'),
('French', 'French cuisine', '🥖'),
('Indian', 'Indian cuisine', '🍛'),
('Thai', 'Thai cuisine', '🍜'),
('American', 'American cuisine', '🍔'),
('Mediterranean', 'Mediterranean cuisine', '🫒'),
('Korean', 'Korean cuisine', '🍲');
```

### Dietary Options

```sql
INSERT INTO dietary_options (name, description, icon) VALUES
('Vegetarian', 'No meat products', '🥗'),
('Vegan', 'No animal products', '🌱'),
('Gluten-Free', 'No gluten-containing ingredients', '🌾'),
('Halal', 'Prepared according to Islamic law', '☪️'),
('Kosher', 'Prepared according to Jewish law', '✡️');
```

### Restaurant Features

```sql
INSERT INTO restaurant_features (name, description, icon) VALUES
('Outdoor Seating', 'Seating available outdoors', '🪑'),
('WiFi', 'Free WiFi available', '📶'),
('Parking', 'Parking available', '🅿️'),
('Delivery', 'Delivery service available', '🛵'),
('Takeout', 'Takeout available', '🥡'),
('Reservations', 'Reservations accepted', '📅');
```

## Data Isolation and Security

### User Data Isolation

The FoodLister application implements strict user data isolation using Supabase Row Level Security (RLS) policies. Each user can only access their own data:

#### User Restaurant Visits
- **Isolation**: Each user sees only their own restaurant visit records
- **Implementation**: RLS policies filter by `auth.uid() = user_id`
- **Privacy**: Users cannot see or modify other users' visit history

#### Restaurants and Lists
- **Shared Access**: All authenticated users can view all restaurants and lists
- **Creation Rights**: Users can only modify content they created
- **Public Discovery**: Restaurant discovery is social within the authenticated user community

### Security Implementation

All data access is protected by RLS policies that automatically filter queries based on the authenticated user context. The application uses JWT tokens to establish user sessions, and all API calls include proper authentication headers.

### Data Consistency

The application maintains data consistency through:
- **Unique constraints** on user-specific data (e.g., one visit record per user per restaurant)
- **Foreign key relationships** with CASCADE deletes
- **Atomic operations** for data updates
- **Proper error handling** for failed operations
- **Database triggers** for maintaining derived data (e.g., user_stats)

## Database Triggers

### User Stats Triggers

The `user_stats` table is automatically maintained by database triggers:

```sql
-- Trigger to create user_stats on user creation
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

This schema provides a solid foundation for the FoodLister application with proper relationships, constraints, and security policies.