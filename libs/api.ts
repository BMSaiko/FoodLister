/**
 * API Type Definitions and Constants
 * Centralized API endpoints, methods, and type definitions
 */

import { 
  RestaurantWithDetails, 
  List, 
  Review, 
  RestaurantFilters,
  PaginatedResponse
} from './types';

// ==================== API Endpoints ====================

export const API_ENDPOINTS = {
  // Restaurants
  restaurants: '/api/restaurants',
  restaurant: (id: string) => `/api/restaurants/${id}`,
  restaurantVisits: (id: string) => `/api/restaurants/${id}/visits`,
  restaurantReviews: (id: string) => `/api/restaurants/${id}/reviews`,
  
  // Lists
  lists: '/api/lists',
  list: (id: string) => `/api/lists/${id}`,
  
  // Reviews
  reviews: '/api/reviews',
  review: (id: string) => `/api/reviews/${id}`,
  
  // Users
  users: '/api/users',
  userProfile: (id: string) => `/api/users/${id}/profile`,
  userStats: (id: string) => `/api/users/${id}/stats`,
  
  // Filters and options
  cuisineTypes: '/api/cuisine-types',
  dietaryOptions: '/api/dietary-options',
  features: '/api/features'
} as const;

// ==================== HTTP Methods ====================

export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE'
} as const;

export type HttpMethod = typeof HTTP_METHODS[keyof typeof HTTP_METHODS];

// ==================== Request/Response Types ====================

export interface ApiRequestOptions {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: unknown;
  token?: string;
  signal?: AbortSignal;
}

export interface ApiErrorResponse {
  error: string;
  message?: string;
  code?: string;
  details?: string;
}

// ==================== Restaurant API Types ====================

export interface CreateRestaurantRequest {
  name: string;
  description?: string;
  images?: string[];
  display_image_index?: number;
  location?: string;
  source_url?: string;
  menu_links?: string[];
  menu_images?: string[];
  phone_numbers?: string[];
  latitude?: number;
  longitude?: number;
  cuisine_type_ids?: string[];
  feature_ids?: string[];
  dietary_option_ids?: string[];
}

export interface UpdateRestaurantRequest extends Partial<CreateRestaurantRequest> {
  id: string;
}

export interface RestaurantListResponse extends PaginatedResponse<RestaurantWithDetails> {}

export interface RestaurantVisitRequest {
  action: 'toggle_visited' | 'add_visit' | 'remove_visit';
}

export interface RestaurantVisitResponse {
  visited: boolean;
  last_visit?: string;
}

// ==================== List API Types ====================

export interface CreateListRequest {
  name: string;
  description?: string;
  is_public?: boolean;
  restaurant_ids?: string[];
}

export interface UpdateListRequest extends Partial<CreateListRequest> {
  id: string;
}

export interface ListWithRestaurants extends List {
  restaurants: RestaurantWithDetails[];
  restaurant_count: number;
}

// ==================== Review API Types ====================

export interface CreateReviewRequest {
  restaurant_id: string;
  rating: number;
  comment?: string;
  amount_spent?: number;
}

export interface UpdateReviewRequest extends Partial<CreateReviewRequest> {
  id: string;
}

export interface ReviewListResponse extends PaginatedResponse<Review> {}

// ==================== User API Types ====================

export interface UpdateProfileRequest {
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  website?: string;
  location?: string;
  phone_number?: string;
  public_profile?: boolean;
}

export interface UserStatsResponse {
  total_reviews: number;
  total_lists: number;
  total_followers: number;
  total_following: number;
  joined_date: string;
  last_activity: string;
}

// ==================== Filter API Types ====================

export interface FilterOption {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  count?: number;
}

export interface FilterResponse {
  cuisineTypes: FilterOption[];
  features: FilterOption[];
  dietaryOptions: FilterOption[];
}

// ==================== Search API Types ====================

export interface SearchRequest {
  query: string;
  filters?: RestaurantFilters;
  page?: number;
  limit?: number;
  sort?: 'relevance' | 'rating' | 'name' | 'created_at';
  order?: 'asc' | 'desc';
}

export interface SearchResponse<T> extends PaginatedResponse<T> {
  query: string;
  suggestions?: string[];
}

// ==================== API Helper Functions ====================

/**
 * Creates authorization headers
 */
export function createAuthHeaders(token?: string): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

/**
 * Builds query string from parameters
 */
export function buildQueryString(params: Record<string, string | number | boolean | undefined>): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach(v => searchParams.append(key, String(v)));
      } else {
        searchParams.append(key, String(value));
      }
    }
  });
  
  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

/**
 * Builds restaurant filter query parameters
 */
export function buildRestaurantFilterParams(filters: RestaurantFilters): Record<string, string | undefined> {
  const params: Record<string, string | undefined> = {};
  
  if (filters.search) params.search = filters.search;
  if (filters.cuisine_types?.length) params.cuisine_types = filters.cuisine_types.join(',');
  if (filters.features?.length) params.features = filters.features.join(',');
  if (filters.dietary_options?.length) params.dietary_options = filters.dietary_options.join(',');
  if (filters.price_range?.min !== undefined) params.price_min = String(filters.price_range.min);
  if (filters.price_range?.max !== undefined) params.price_max = String(filters.price_range.max);
  if (filters.rating_range?.min !== undefined) params.rating_min = String(filters.rating_range.min);
  if (filters.rating_range?.max !== undefined) params.rating_max = String(filters.rating_range.max);
  if (filters.visited !== undefined) params.visited = String(filters.visited);
  
  return params;
}

/**
 * Checks if an error is an authentication error
 */
export function isAuthError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  
  const err = error as { code?: unknown; message?: unknown };
  const authErrorCodes = ['401', 'PGRST301', 'session_expired'];
  const authErrorMessages = ['invalid token', 'expired', 'not authenticated'];
  
  const code = typeof err.code === 'string' ? err.code : '';
  const message = typeof err.message === 'string' ? err.message.toLowerCase() : '';
  
  return (
    authErrorCodes.includes(code) ||
    authErrorMessages.some(msg => message.includes(msg))
  );
}

/**
 * Checks if an error is a rate limit error
 */
export function isRateLimitError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const err = error as { code?: unknown; status?: unknown };
  return err.code === '429' || err.status === 429;
}
