// Type definitions for the FoodList application
import type { ApiError } from '@/types/api';

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
  cuisine_types?: CuisineType[];
  features?: RestaurantFeature[];
  dietary_options?: DietaryOption[];
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
  is_public?: boolean;
  filters?: {
    cuisineTypes?: string[];
    priceRange?: [number, number];
    minRating?: number;
    features?: string[];
    dietaryOptions?: string[];
  };
}

export interface User {
  id: string;
  name: string;
  profileImage?: string;
  userIdCode?: string;
  user_id_code?: string;
  location?: string;
  bio?: string;
  publicProfile?: boolean;
  totalReviews?: number;
  totalLists?: number;
}

export interface UserProfile {
  id: string;
  user_id: string;
  user_id_code: string;
  display_name: string;
  bio?: string;
  avatar_url?: string;
  website?: string;
  location?: string;
  phone_number?: string;
  public_profile: boolean;
  total_reviews: number;
  total_lists: number;
  created_at: string;
  updated_at: string;
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
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Auth response type
 */
export interface AuthResponse {
  data: {
    user: AuthUser | null;
    session: SupabaseSession | null;
  } | null;
  error: ApiError | null;
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
  visited?: boolean;
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

export interface UserProfileCardProps {
  user: User;
  showStats?: boolean;
  className?: string;
  onClick?: () => void;
}

export interface UserSearchFilters {
  search?: string;
  location?: string;
  minReviews?: number;
  maxReviews?: number;
  minLists?: number;
  maxLists?: number;
  joinedAfter?: string;
  joinedBefore?: string;
  publicProfile?: boolean;
}

export interface UserSearchResult {
  user: User;
  relevance?: number;
}

export interface UserStats {
  total_reviews: number;
  total_lists: number;
  total_followers?: number;
  total_following?: number;
  joined_date: string;
  last_activity?: string;
}

// Hook return types
export interface UseVisitsDataReturn {
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
  signUp: (email: string, password: string, metadata?: Record<string, unknown>) => Promise<AuthResponse>;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signOut: () => Promise<{ error: ApiError | null }>;
  resetPassword: (email: string) => Promise<{ error: ApiError | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: ApiError | null }>;
  getAccessToken: () => Promise<string | null>;
}

export interface FiltersContextValue {
  clearTrigger: number;
  clearFilters: () => void;
}

// Verification types
export interface VerificationStatus {
  isVerified: boolean;
  emailConfirmed: boolean;
  verifiedAt: string | null;
  verificationMethod: 'email' | null;
}

export interface AccountSecurity {
  twoFactorEnabled: boolean;
  lastPasswordChange: string | null;
  activeSessions: number;
  lastLogin: string | null;
  loginAttempts: number;
  lockedUntil: string | null;
}

export interface UserAccount extends User {
  verification: VerificationStatus;
  security: AccountSecurity;
}

export interface VerificationRequest {
  userId: string;
  method: 'email';
  token: string;
  expiresAt: string;
  used: boolean;
}

// Activity feed types
export type ListActivityAction = 'restaurant_added' | 'restaurant_removed' | 'list_updated' | 'collaborator_added' | 'collaborator_removed' | 'list_duplicated';

export interface ListActivity {
  id: string;
  list_id: string;
  user_id: string;
  action: ListActivityAction;
  details: Record<string, any>;
  created_at: string;
}

export interface ListActivityWithUser extends ListActivity {
  profiles: {
    display_name: string | null;
    avatar_url: string | null;
  } | null;
}

// Admin Dashboard types
export interface DashboardStats {
  users: AdminUserStats;
  restaurants: AdminRestaurantStats;
  reviews: AdminReviewStats;
  lists: AdminListStats;
  meals: AdminMealStats;
  growth: AdminGrowthStats;
}

export interface AdminUserStats {
  total: number;
  active: number;
  newThisMonth: number;
  newThisWeek: number;
  admins: number;
  growthRate: number;
}

export interface AdminRestaurantStats {
  total: number;
  averageRating: number;
  newThisMonth: number;
  byCuisine: { cuisine: string; count: number }[];
}

export interface AdminReviewStats {
  total: number;
  averageRating: number;
  byRating: { rating: number; count: number }[];
  newThisMonth: number;
}

export interface AdminListStats {
  total: number;
  public: number;
  private: number;
  collaborative: number;
  totalItems: number;
}

export interface AdminMealStats {
  total: number;
  upcoming: number;
  thisMonth: number;
}

export interface AdminGrowthStats {
  users: { month: string; count: number }[];
  restaurants: { month: string; count: number }[];
  reviews: { month: string; count: number }[];
}

export interface RecentActivity {
  id: string;
  type: 'user_signup' | 'restaurant_created' | 'review_added' | 'list_created';
  description: string;
  timestamp: string;
  userId?: string;
  userName?: string;
}

export type AdminRoleType = 'super_admin' | 'moderator' | 'viewer';

export interface AdminUser {
  id: string;
  user_id: string;
  display_name: string | null;
  email?: string;
  avatar_url: string | null;
  user_id_code?: string;
  is_admin: boolean;
  is_verified: boolean;
  is_active?: boolean;
  total_reviews: number;
  total_lists: number;
  total_restaurants_added: number;
  created_at: string;
  last_sign_in_at?: string;
}

// Subscription types
export type SubscriptionTier = 'free' | 'premium' | 'pro';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string | null;
  priceMonthly: number;
  priceYearly: number | null;
  currency: string;
  features: string[];
  isActive: boolean;
  sortOrder: number;
}

export interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  stripeSubscriptionId: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  plan?: SubscriptionPlan;
}

export interface FeatureGate {
  feature: string;
  requiredTier: SubscriptionTier;
  currentTier: SubscriptionTier;
  hasAccess: boolean;
}

// Marketing AI types
export type MarketingCampaignStatus = 'draft' | 'active' | 'paused' | 'completed';
export type SocialPlatform = 'twitter' | 'instagram' | 'facebook' | 'linkedin' | 'tiktok' | 'youtube';
export type PostType = 'restaurant_promo' | 'list_digest' | 'review_highlight' | 'general';
export type PostStatus = 'draft' | 'scheduled' | 'publishing' | 'published' | 'failed';
export type WorkflowTrigger = 'new_restaurant' | 'new_review' | 'weekly_digest' | 'top_rated' | 'manual';

export interface MarketingCampaign {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  status: MarketingCampaignStatus;
  startDate: string | null;
  endDate: string | null;
  budget: number | null;
  targetPlatforms: string[];
  createdAt: string;
  updatedAt: string | null;
}

export interface SocialMediaPost {
  id: string;
  campaignId: string | null;
  restaurantId: string | null;
  listId: string | null;
  content: string;
  platform: SocialPlatform;
  postType: PostType;
  mediaUrls: string[];
  scheduledFor: string | null;
  publishedAt: string | null;
  status: PostStatus;
  externalPostId: string | null;
  engagementData: Record<string, number>;
  aiGenerated: boolean;
  aiPrompt: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface AiWorkflow {
  id: string;
  name: string;
  description: string | null;
  triggerType: WorkflowTrigger;
  isActive: boolean;
  platform: string;
  promptTemplate: string;
  scheduleCron: string | null;
  lastRunAt: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface ContentGenerationLog {
  id: string;
  workflowId: string | null;
  postId: string | null;
  prompt: string;
  aiResponse: string | null;
  status: 'pending' | 'success' | 'failed';
  errorMessage: string | null;
  tokensUsed: number | null;
  modelUsed: string;
  createdAt: string;
}
