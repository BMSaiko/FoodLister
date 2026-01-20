# Database Schema Documentation

This document describes the database schema for the FoodList application, which uses Supabase (PostgreSQL) as the backend database.

## Overview

The FoodList application uses a relational database with the following main entities:
- Restaurants
- Cuisine Types
- Lists
- Users (managed by Supabase Auth)

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
| `creator` | `text` | YES | - | Name of person who added restaurant |
| `menu_url` | `text` | YES | - | Link to online menu |
| `phone_numbers` | `text[]` | YES | `'{}'::text[]` | Array of phone numbers for the restaurant |
| `visited` | `boolean` | NO | `false` | Whether restaurant has been visited |
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

### Lists Table

**Table Name**: `lists`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | `uuid` | NO | `gen_random_uuid()` | Primary key |
| `name` | `text` | NO | - | List name |
| `description` | `text` | YES | - | List description |
| `creator` | `text` | YES | - | Name of person who created list |
| `created_at` | `timestamp with time zone` | NO | `now()` | Creation timestamp |
| `updated_at` | `timestamp with time zone` | NO | `now()` | Last update timestamp |

### List Restaurants Table (Junction)

**Table Name**: `list_restaurants`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `list_id` | `uuid` | NO | - | Foreign key to lists.id |
| `restaurant_id` | `uuid` | NO | - | Foreign key to restaurants.id |
| `created_at` | `timestamp with time zone` | NO | `now()` | Creation timestamp |

### Profiles Table

**Table Name**: `profiles`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | `uuid` | NO | `gen_random_uuid()` | Primary key |
| `user_id` | `uuid` | NO | - | Foreign key to auth.users.id (unique) |
| `display_name` | `text` | YES | - | User's display name |
| `bio` | `text` | YES | - | User's biography |
| `avatar_url` | `text` | YES | - | URL of user's avatar image |
| `website` | `text` | YES | - | User's website URL |
| `location` | `text` | YES | - | User's location |
| `phone_number` | `text` | YES | - | User's phone number |
| `created_at` | `timestamp with time zone` | NO | `now()` | Creation timestamp |
| `updated_at` | `timestamp with time zone` | NO | `now()` | Last update timestamp |

### User Restaurant Visits Table

**Table Name**: `user_restaurant_visits`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | `uuid` | NO | `gen_random_uuid()` | Primary key |
| `user_id` | `uuid` | NO | - | Foreign key to auth.users.id |
| `restaurant_id` | `uuid` | NO | - | Foreign key to restaurants.id |
| `visit_count` | `integer` | NO | `0` | Number of times user visited this restaurant |
| `visited` | `boolean` | NO | `false` | Whether user has visited this restaurant at least once |
| `created_at` | `timestamp with time zone` | NO | `now()` | Creation timestamp |
| `updated_at` | `timestamp with time zone` | NO | `now()` | Last update timestamp |

### Reviews Table

**Table Name**: `reviews`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | `uuid` | NO | `gen_random_uuid()` | Primary key |
| `restaurant_id` | `uuid` | NO | - | Foreign key to restaurants.id |
| `user_id` | `uuid` | NO | - | Foreign key to auth.users.id |
| `rating` | `numeric` | NO | - | Rating from 0.5 to 5.0 stars |
| `comment` | `text` | YES | - | Optional text comment for the review |
| `user_name` | `text` | YES | - | User's name at time of review (for historical data) |
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
│ • source_url    │                │
│ • creator       │       ┌─────────────────┐
│ • menu_url      │       │ cuisine_types   │
│ • visited       │       │                 │
│ • created_at    │       │ • id (PK)       │
│ • updated_at    │       │ • name          │
└─────────────────┘       │ • description   │
         ▲                │ • icon          │
         │                │ • created_at    │
         │                └─────────────────┘
         │
         │
┌─────────────────┐       ┌──────────────────────┐
│     lists       │       │   list_restaurants   │
│                 │       │                      │
│ • id (PK)       │◄──────┤ • list_id (FK)       │
│ • name          │       │ • restaurant_id (FK) │
│ • description   │       │ • created_at         │
│ • creator       │       └──────────────────────┘
│ • created_at    │
│ • updated_at    │
└─────────────────┘
```

### Relationships Summary

- **One-to-Many**: `restaurants` → `restaurant_cuisine_types` (one restaurant can have many cuisine types)
- **One-to-Many**: `cuisine_types` → `restaurant_cuisine_types` (one cuisine type can belong to many restaurants)
- **One-to-Many**: `lists` → `list_restaurants` (one list can contain many restaurants)
- **One-to-Many**: `restaurants` → `list_restaurants` (one restaurant can belong to many lists)
- **One-to-Many**: `restaurants` → `reviews` (one restaurant can have many reviews)
- **One-to-Many**: `auth.users` → `reviews` (one user can write many reviews)

## Indexes

For optimal performance, the following indexes should be created:

```sql
-- Restaurants table indexes
CREATE INDEX idx_restaurants_name ON restaurants USING gin(to_tsvector('english', name));
CREATE INDEX idx_restaurants_creator ON restaurants(creator);
CREATE INDEX idx_restaurants_visited ON restaurants(visited);
CREATE INDEX idx_restaurants_rating ON restaurants(rating);
CREATE INDEX idx_restaurants_price ON restaurants(price_per_person);

-- Cuisine types table indexes
CREATE INDEX idx_cuisine_types_name ON cuisine_types(name);

-- Junction table indexes
CREATE INDEX idx_restaurant_cuisine_types_restaurant_id ON restaurant_cuisine_types(restaurant_id);
CREATE INDEX idx_restaurant_cuisine_types_cuisine_type_id ON restaurant_cuisine_types(cuisine_type_id);
CREATE UNIQUE INDEX idx_restaurant_cuisine_types_unique ON restaurant_cuisine_types(restaurant_id, cuisine_type_id);

CREATE INDEX idx_list_restaurants_list_id ON list_restaurants(list_id);
CREATE INDEX idx_list_restaurants_restaurant_id ON list_restaurants(restaurant_id);
CREATE UNIQUE INDEX idx_list_restaurants_unique ON list_restaurants(list_id, restaurant_id);
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

-- Allow users to update restaurants they created
CREATE POLICY "Allow update access to own restaurants" ON restaurants
FOR UPDATE USING (auth.uid()::text = creator);

-- Allow users to delete restaurants they created
CREATE POLICY "Allow delete access to own restaurants" ON restaurants
FOR DELETE USING (auth.uid()::text = creator);
```

### Lists Table
```sql
-- Allow authenticated users to read all lists
CREATE POLICY "Allow read access to lists" ON lists
FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to create lists
CREATE POLICY "Allow insert access to lists" ON lists
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow users to update lists they created
CREATE POLICY "Allow update access to own lists" ON lists
FOR UPDATE USING (auth.uid()::text = creator);

-- Allow users to delete lists they created
CREATE POLICY "Allow delete access to own lists" ON lists
FOR DELETE USING (auth.uid()::text = creator);
```

### User Restaurant Visits Table
```sql
-- Allow users to view their own visit records
CREATE POLICY "Users can view their own visits" ON user_restaurant_visits
    FOR SELECT USING (auth.uid() = user_id);

-- Allow users to insert visit records with their own user_id
CREATE POLICY "Users can insert their own visits" ON user_restaurant_visits
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own visit records
CREATE POLICY "Users can update their own visits" ON user_restaurant_visits
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own visit records
CREATE POLICY "Users can delete their own visits" ON user_restaurant_visits
    FOR DELETE USING (auth.uid() = user_id);

-- Allow service role to manage all visit records (for admin operations)
CREATE POLICY "Service role can manage all visits" ON user_restaurant_visits
    FOR ALL USING (auth.role() = 'service_role');
```

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

## Data Types and Constraints

### Check Constraints

```sql
-- Rating must be between 0 and 5
ALTER TABLE restaurants ADD CONSTRAINT check_rating_range
CHECK (rating >= 0 AND rating <= 5);

-- Price per person must be positive
ALTER TABLE restaurants ADD CONSTRAINT check_price_positive
CHECK (price_per_person > 0);
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

-- list_restaurants foreign keys
ALTER TABLE list_restaurants
ADD CONSTRAINT fk_list_restaurants_list
FOREIGN KEY (list_id) REFERENCES lists(id) ON DELETE CASCADE;

ALTER TABLE list_restaurants
ADD CONSTRAINT fk_list_restaurants_restaurant
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

This schema provides a solid foundation for the FoodList application with proper relationships, constraints, and security policies.
