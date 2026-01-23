// Type definitions for the FoodList application

export interface Restaurant {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  price_per_person?: number;
  rating?: number;
  location?: string;
  source_url?: string;
  creator?: string;
  menu_url?: string;
  menu_links?: string[];
  menu_images?: string[];
  phone_numbers?: string[];
  visited: boolean;
  created_at: string;
  updated_at: string;
  creator_id?: string;
  creator_name?: string;
}

export interface CuisineType {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  created_at: string;
}

export interface List {
  id: string;
  name: string;
  description?: string;
  creator?: string;
  created_at: string;
  updated_at: string;
  creator_id?: string;
  creator_name?: string;
}

export interface User {
  id: string;
  name: string;
  profileImage?: string;
}

export interface Review {
  id: string;
  restaurant_id: string;
  user_id: string;
  rating: number;
  comment?: string;
  amount_spent?: number;
  created_at: string;
  updated_at: string;
  user: User;
}

export interface ReviewFormData {
  rating: number;
  comment?: string;
  amount_spent?: number;
}

export interface RestaurantWithDetails extends Restaurant {
  cuisine_types: CuisineType[];
  reviews?: Review[];
  review_count?: number;
}
