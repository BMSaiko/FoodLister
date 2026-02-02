// Type definitions for the FoodList application

// Basic entities
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
  latitude?: number;
  longitude?: number;
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
  images?: string[];
  display_image_index?: number;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// Auth types
export interface AuthSession {
  session: {
    access_token: string;
    refresh_token: string;
    expires_at: number;
    user: AuthUser;
  } | null;
  user: AuthUser | null;
}

export interface AuthUser {
  id: string;
  email?: string;
  email_confirmed_at?: string;
  created_at?: string;
  updated_at?: string;
  user_metadata: {
    display_name?: string;
    avatar_url?: string;
    website?: string;
    location?: string;
    phone_number?: string;
  };
}

// Supabase Session type compatibility
export interface SupabaseSession {
  access_token: string;
  refresh_token: string;
  expires_at: number | undefined;
  user: AuthUser;
}

// Supabase Session from @supabase/supabase-js - properly typed
export interface SupabaseAuthSession {
  access_token: string;
  refresh_token: string;
  expires_at?: number;
  user: AuthUser;
}

// Database operation types
export interface DatabaseError {
  code: string;
  message: string;
  details?: string;
  hint?: string;
}

// Visit tracking types
export interface VisitData {
  visited: boolean;
  visit_count: number;
  last_visit?: string;
}

// Restaurant visits data structure - maps restaurant IDs to visit data
export interface RestaurantVisitsData {
  [restaurantId: string]: VisitData;
}

// Filter types
export interface RestaurantFilters {
  search?: string;
  cuisine_types?: string[];
  features?: string[];
  dietary_options?: string[];
  price_range?: {
    min?: number;
    max?: number;
  };
  rating_range?: {
    min?: number;
    max?: number;
  };
  location?: {
    city?: string;
    distance?: number; // in km
    coordinates?: { lat: number; lng: number };
  };
  visit_count?: { min?: number; max?: number };
  visited?: boolean;
  not_visited?: boolean;
}

// Restaurant feature types
export interface RestaurantFeature {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  created_at: string;
}

// Dietary option types
export interface DietaryOption {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  created_at: string;
}

// Enhanced restaurant with features and dietary options
export interface RestaurantWithDetails extends Restaurant {
  cuisine_types: CuisineType[];
  features: RestaurantFeature[];
  dietary_options: DietaryOption[];
  reviews?: Review[];
  review_count?: number;
  images?: string[];
  display_image_index?: number;
}

// Form validation types
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// Component prop types
export interface RestaurantCardProps {
  restaurant: RestaurantWithDetails;
  onVisitToggle?: (restaurantId: string, visited: boolean) => void;
  onReviewSubmit?: (review: ReviewFormData) => void;
  className?: string;
  centered?: boolean;
}

export interface ReviewFormProps {
  restaurantId: string;
  onReviewSubmitted: (review: Review) => void;
  onCancel?: () => void;
  isEditing?: boolean;
  initialReview?: Review;
}

// Hook return types
export interface UseVisitsDataReturn {
  visitsData: Record<string, VisitData>;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export interface UseRestaurantsReturn {
  restaurants: RestaurantWithDetails[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// API client types
export interface SecureApiCallOptions {
  retries?: number;
  timeout?: number;
  headers?: Record<string, string>;
}

// Context types
export interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  signUp: (email: string, password: string, metadata?: Record<string, any>) => Promise<{ data: any; error: any }>;
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signOut: () => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (newPassword: string) => Promise<{ error: any }>;
  getAccessToken: () => Promise<string | null>;
}

export interface FiltersContextValue {
  clearTrigger: number;
  clearFilters: () => void;
}
