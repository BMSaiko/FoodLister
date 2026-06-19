/**
 * Shared API types for FoodLister
 * Provides type safety for API requests and responses
 */

/**
 * Standard API error response
 */
export interface ApiError {
  error: string;
  details?: string;
  code?: string;
  status?: number;
}

/**
 * API error types for standardized error handling
 */
export type ApiErrorType = 
  | 'VALIDATION_ERROR'
  | 'AUTHENTICATION_ERROR'
  | 'AUTHORIZATION_ERROR'
  | 'NOT_FOUND'
  | 'DATABASE_ERROR'
  | 'INTERNAL_ERROR'
  | 'RATE_LIMIT_ERROR'
  | 'NETWORK_ERROR'
  | 'UNKNOWN_ERROR';

/**
 * Standard API success response
 */
export interface ApiSuccess<T> {
  data: T;
  message?: string;
}

/**
 * Union type for API responses
 */
export type ApiResponse<T> = ApiSuccess<T> | ApiError;

/**
 * Paginated response type
 */
export interface PaginatedData<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

/**
 * Type guard to check if response is an error
 */
export function isApiError(response: unknown): response is ApiError {
  return response !== null && 
         typeof response === 'object' && 
         'error' in response && 
         typeof (response as ApiError).error === 'string';
}

// Mapping of ApiErrorType to user-friendly messages
const ERROR_MESSAGES: Record<string, string> = {
  'INTERNAL_ERROR': 'An internal server error occurred. Please try again later.',
  'DATABASE_ERROR': 'A database error occurred. Please try again later.',
  'AUTHENTICATION_ERROR': 'Authentication is required to access this resource.',
  'AUTHORIZATION_ERROR': 'You do not have permission to perform this action.',
  'VALIDATION_ERROR': 'The provided data is invalid. Please check your input.',
  'NOT_FOUND': 'The requested resource was not found.',
  'RATE_LIMITED': 'Too many requests. Please wait a moment and try again.',
  'NETWORK_ERROR': 'A network error occurred. Please check your connection.',
};

/**
 * Extract error message from unknown error
 */
export function getErrorMessage(error: unknown): string {
  // Handle ApiErrorType strings
  if (typeof error === 'string' && error in ERROR_MESSAGES) {
    return ERROR_MESSAGES[error];
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: unknown }).message);
  }
  if (error && typeof error === 'object' && 'error' in error) {
    return String((error as { error: unknown }).error);
  }
  return 'An unknown error occurred';
}

/**
 * Common HTTP status codes
 */
export const HttpStatus = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  TOO_MANY_REQUESTS: 429,
} as const;

/**
 * Restaurant related types
 */
export interface RestaurantData {
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
  cuisine_types?: Array<{ id: string; name: string; icon?: string }>;
  review_count?: number;
  latitude?: number;
  longitude?: number;
  images?: string[];
  display_image_index?: number;
}

/**
 * List related types
 */
export interface ListData {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  creator?: string;
  creator_id?: string;
  creator_name?: string;
  filters?: Record<string, unknown>;
  is_public: boolean;
  tags?: string[];
  cover_image_url?: string;
  restaurantCount?: number;
}

/**
 * Review related types
 */
export interface ReviewData {
  id: string;
  restaurant_id: string;
  user_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  updated_at: string;
  user_name?: string;
  amount_spent?: number;
}

/**
 * User profile types
 */
export interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  website: string | null;
  location: string | null;
  public_profile: boolean;
  total_restaurants_visited: number;
  total_reviews: number;
  total_lists: number;
  total_restaurants_added: number;
}