/**
 * API Type Definitions and Constants
 * Centralized API endpoints, methods, and type definitions
 */

import { 
  Restaurant, 
  RestaurantWithDetails, 
  List, 
  Review, 
  UserProfile,
  CuisineType,
  DietaryOption,
  RestaurantFeature,
  RestaurantFilters,
  PaginatedResponse,
  ApiResponse 
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
  
  // Auth
  auth: {
    signIn: '/api/auth/signin',
    signUp: '/api/auth/signup',
    signOut: '/api/auth/signout',
    resetPassword: '/api/auth/reset-password',
    updatePassword: '/api/auth/update-password',
    session: '/api/auth/session'
  },
  
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
  body?: any;
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
  image_url?: string;
  images?: any[];
  display_image_index?: number;
  location?: string;
  source_url?: string;
  menu_links?: any[];
  menu_images?: any[];
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
  visit_count: number;
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
  total_restaurants_visited: number;
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
export function buildQueryString(params: Record<string, any>): string {
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
export function buildRestaurantFilterParams(filters: RestaurantFilters): Record<string, any> {
  const params: Record<string, any> = {};
  
  if (filters.search) params.search = filters.search;
  if (filters.cuisine_types?.length) params.cuisine_types = filters.cuisine_types.join(',');
  if (filters.features?.length) params.features = filters.features.join(',');
  if (filters.dietary_options?.length) params.dietary_options = filters.dietary_options.join(',');
  if (filters.price_range?.min !== undefined) params.price_min = filters.price_range.min;
  if (filters.price_range?.max !== undefined) params.price_max = filters.price_range.max;
  if (filters.rating_range?.min !== undefined) params.rating_min = filters.rating_range.min;
  if (filters.rating_range?.max !== undefined) params.rating_max = filters.rating_range.max;
  if (filters.visited !== undefined) params.visited = filters.visited;
  if (filters.not_visited !== undefined) params.not_visited = filters.not_visited;
  
  return params;
}

/**
 * Checks if an error is an authentication error
 */
export function isAuthError(error: any): boolean {
  if (!error) return false;
  
  const authErrorCodes = ['401', 'PGRST301', 'session_expired'];
  const authErrorMessages = ['invalid token', 'expired', 'not authenticated'];
  
  return (
    authErrorCodes.includes(error?.code) ||
    authErrorMessages.some(msg => error?.message?.toLowerCase().includes(msg))
  );
}

/**
 * Checks if an error is a rate limit error
 */
export function isRateLimitError(error: any): boolean {
  return error?.code === '429' || error?.status === 429;
}

/**
 * Creates a retry delay promise
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Wraps a fetch call with retry logic
 */
export async function fetchWithRetry<T>(
  url: string,
  options: ApiRequestOptions = {},
  retries: number = 3,
  delayMs: number = 1000
): Promise<ApiResponse<T>> {
  let lastError: any;
  
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        method: options.method || HTTP_METHODS.GET,
        headers: createAuthHeaders(options.token),
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: options.signal
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw { 
          code: String(response.status), 
          message: data.error || data.message || 'Request failed' 
        };
      }
      
      return { data };
    } catch (error: any) {
      lastError = error;
      
      // Don't retry auth errors
      if (isAuthError(error)) {
        return { data: null as any, error: error.message || 'Authentication failed' };
      }
      
      // Wait before retrying (exponential backoff)
      if (i < retries - 1) {
        await delay(delayMs * Math.pow(2, i));
      }
    }
  }
  
  return { 
    data: null as any, 
    error: lastError?.message || 'Request failed after retries' 
  };
}