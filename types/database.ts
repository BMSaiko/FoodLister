/**
 * Database types for FoodLister
 * These types provide type safety for database operations
 */

export interface Database {
  public: {
    Tables: {
       profiles: {
         Row: {
           id: string;
           user_id: string;
           display_name: string | null;
           bio: string | null;
           avatar_url: string | null;
           website: string | null;
           location: string | null;
           created_at: string;
           updated_at: string;
           phone_number: string | null;
           user_id_code: string | null;
           public_profile: boolean;
            total_reviews: number;
           total_lists: number;
           total_restaurants_added: number;
           is_verified: boolean;
           verified_at: string | null;
           verification_method: string | null;
           login_attempts: number;
           locked_until: string | null;
           is_admin: boolean;
           subscription_tier: 'free' | 'premium' | 'pro';
           subscription_expires_at: string | null;
         };
         Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'id'>;
         Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
       };
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
          phone_numbers: string[];
          creator_id: string | null;
          creator_name: string | null;
          created_at: string;
          updated_at: string;
          images: string[];
          display_image_index: number;
          menu_links: string[];
          menu_images: string[];
          latitude: number | null;
          longitude: number | null;
          review_count: number;
          opening_hours: string | null;
          website: string | null;
          phone: string | null;
          menu: string | null;
        };
        Insert: Omit<Database['public']['Tables']['restaurants']['Row'], 'id' | 'created_at' | 'phone_numbers' | 'images' | 'display_image_index' | 'menu_links' | 'menu_images' | 'review_count'>;
        Update: Partial<Database['public']['Tables']['restaurants']['Insert']>;
      };
      lists: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          created_at: string;
          creator: string | null;
          creator_id: string | null;
          creator_name: string | null;
          filters: Record<string, unknown> | null;
          is_public: boolean;
          tags: string[];
          cover_image_url: string | null;
        };
        Insert: Omit<Database['public']['Tables']['lists']['Row'], 'id' | 'created_at' | 'tags'>;
        Update: Partial<Database['public']['Tables']['lists']['Insert']>;
      };
      list_restaurants: {
        Row: {
          list_id: string;
          restaurant_id: string;
          position: number;
        };
        Insert: Database['public']['Tables']['list_restaurants']['Row'];
        Update: Partial<Database['public']['Tables']['list_restaurants']['Row']>;
      };
      list_comments: {
        Row: {
          id: string;
          list_id: string;
          user_id: string;
          comment: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['list_comments']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['list_comments']['Insert']>;
      };
      list_collaborators: {
        Row: {
          id: string;
          list_id: string;
          user_id: string;
          role: 'editor' | 'viewer';
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['list_collaborators']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['list_collaborators']['Insert']>;
      };
      list_activities: {
        Row: {
          id: string;
          list_id: string;
          user_id: string;
          action: string;
          details: Record<string, unknown> | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['list_activities']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['list_activities']['Insert']>;
      };
      reviews: {
        Row: {
          id: string;
          restaurant_id: string;
          user_id: string;
          rating: number;
          comment: string | null;
          created_at: string;
          updated_at: string;
          user_name: string;
          amount_spent: number | null;
        };
        Insert: Omit<Database['public']['Tables']['reviews']['Row'], 'id' | 'created_at' | 'updated_at' | 'user_name'>;
        Update: Partial<Database['public']['Tables']['reviews']['Insert']>;
      };
      cuisine_types: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          icon: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['cuisine_types']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['cuisine_types']['Insert']>;
      };
      restaurant_cuisine_types: {
        Row: {
          restaurant_id: string;
          cuisine_type_id: string;
          created_at: string;
        };
        Insert: Database['public']['Tables']['restaurant_cuisine_types']['Row'];
        Update: Partial<Database['public']['Tables']['restaurant_cuisine_types']['Row']>;
      };
      restaurant_dietary_options: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          icon: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['restaurant_dietary_options']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['restaurant_dietary_options']['Insert']>;
      };
      restaurant_dietary_options_junction: {
        Row: {
          id: string;
          restaurant_id: string;
          dietary_option_id: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['restaurant_dietary_options_junction']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['restaurant_dietary_options_junction']['Insert']>;
      };
      restaurant_features: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          icon: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['restaurant_features']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['restaurant_features']['Insert']>;
      };
      restaurant_restaurant_features: {
        Row: {
          id: string;
          restaurant_id: string;
          feature_id: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['restaurant_restaurant_features']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['restaurant_restaurant_features']['Insert']>;
      };
      scheduled_meals: {
        Row: {
          id: string;
          restaurant_id: string;
          organizer_id: string;
          meal_date: string;
          meal_time: string;
          meal_type: string;
          duration_minutes: number;
          google_calendar_link: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['scheduled_meals']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['scheduled_meals']['Insert']>;
      };
      meal_participants: {
        Row: {
          id: string;
          scheduled_meal_id: string;
          user_id: string;
          status: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['meal_participants']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['meal_participants']['Insert']>;
      };
      admin_roles: {
        Row: { id: string; user_id: string; role: 'super_admin' | 'moderator' | 'viewer'; created_at: string; };
        Insert: { id?: string; user_id: string; role: 'super_admin' | 'moderator' | 'viewer'; };
        Update: Partial<{ role: 'super_admin' | 'moderator' | 'viewer' }>;
      };
      subscription_plans: {
        Row: { id: string; name: string; description: string | null; price_monthly: number; price_yearly: number | null; currency: string; features: string[] | null; stripe_price_monthly_id: string | null; stripe_price_yearly_id: string | null; is_active: boolean; sort_order: number; created_at: string; };
        Insert: { id?: string; name: string; description?: string | null; price_monthly: number; price_yearly?: number | null; currency?: string; features?: string[] | null; stripe_price_monthly_id?: string | null; stripe_price_yearly_id?: string | null; is_active?: boolean; sort_order?: number; };
        Update: Partial<{ name?: string; description?: string | null; price_monthly?: number; price_yearly?: number | null; currency?: string; features?: string[] | null; is_active?: boolean; sort_order?: number; }>;
      };
      user_subscriptions: {
        Row: { id: string; user_id: string; plan_id: string; status: 'active' | 'canceled' | 'past_due' | 'trialing'; stripe_subscription_id: string | null; stripe_customer_id: string | null; current_period_start: string | null; current_period_end: string | null; cancel_at_period_end: boolean; created_at: string; updated_at: string | null; };
        Insert: { id?: string; user_id: string; plan_id: string; status: 'active' | 'canceled' | 'past_due' | 'trialing'; stripe_subscription_id?: string | null; stripe_customer_id?: string | null; current_period_start?: string | null; current_period_end?: string | null; cancel_at_period_end?: boolean; };
        Update: Partial<{ status?: 'active' | 'canceled' | 'past_due' | 'trialing'; cancel_at_period_end?: boolean; current_period_end?: string | null; }>;
      };
      marketing_campaigns: {
        Row: { id: string; user_id: string; name: string; description: string | null; status: 'draft' | 'active' | 'paused' | 'completed'; start_date: string | null; end_date: string | null; budget: number | null; target_platforms: string[] | null; created_at: string; updated_at: string | null; };
        Insert: { id?: string; user_id: string; name: string; description?: string | null; status?: 'draft' | 'active' | 'paused' | 'completed'; start_date?: string | null; end_date?: string | null; budget?: number | null; target_platforms?: string[] | null; };
        Update: Partial<{ name?: string; description?: string | null; status?: 'draft' | 'active' | 'paused' | 'completed'; start_date?: string | null; end_date?: string | null; budget?: number | null; target_platforms?: string[] | null; }>;
      };
      social_media_posts: {
        Row: { id: string; campaign_id: string | null; restaurant_id: string | null; list_id: string | null; content: string; platform: 'twitter' | 'instagram' | 'facebook' | 'linkedin' | 'tiktok' | 'youtube'; post_type: 'restaurant_promo' | 'list_digest' | 'review_highlight' | 'general'; media_urls: string[] | null; scheduled_for: string | null; published_at: string | null; status: 'draft' | 'scheduled' | 'publishing' | 'published' | 'failed'; external_post_id: string | null; engagement_data: any; ai_generated: boolean | null; ai_prompt: string | null; created_by: string; created_at: string; updated_at: string | null; };
        Insert: { id?: string; campaign_id?: string | null; restaurant_id?: string | null; list_id?: string | null; content: string; platform: 'twitter' | 'instagram' | 'facebook' | 'linkedin' | 'tiktok' | 'youtube'; post_type?: 'restaurant_promo' | 'list_digest' | 'review_highlight' | 'general'; media_urls?: string[] | null; scheduled_for?: string | null; status?: 'draft' | 'scheduled' | 'publishing' | 'published' | 'failed'; ai_generated?: boolean; ai_prompt?: string | null; created_by: string; };
        Update: Partial<{ content?: string; status?: 'draft' | 'scheduled' | 'publishing' | 'published' | 'failed'; scheduled_for?: string | null; }>;
      };
      ai_workflows: {
        Row: { id: string; name: string; description: string | null; trigger_type: 'new_restaurant' | 'new_review' | 'weekly_digest' | 'top_rated' | 'manual'; is_active: boolean | null; platform: string; prompt_template: string; schedule_cron: string | null; last_run_at: string | null; created_by: string; created_at: string; updated_at: string | null; };
        Insert: { id?: string; name: string; description?: string | null; trigger_type: 'new_restaurant' | 'new_review' | 'weekly_digest' | 'top_rated' | 'manual'; platform: string; prompt_template: string; schedule_cron?: string | null; created_by: string; };
        Update: Partial<{ name?: string; description?: string | null; trigger_type?: 'new_restaurant' | 'new_review' | 'weekly_digest' | 'top_rated' | 'manual'; is_active?: boolean; platform?: string; prompt_template?: string; schedule_cron?: string | null; }>;
      };
      content_generation_logs: {
        Row: { id: string; workflow_id: string | null; post_id: string | null; prompt: string; ai_response: string | null; status: 'pending' | 'success' | 'failed'; error_message: string | null; tokens_used: number | null; model_used: string | null; created_at: string; };
        Insert: { id?: string; workflow_id?: string | null; post_id?: string | null; prompt: string; ai_response?: string | null; status?: 'pending' | 'success' | 'failed'; error_message?: string | null; tokens_used?: number | null; model_used?: string; };
        Update: Partial<{ status?: 'pending' | 'success' | 'failed'; error_message?: string | null; }>;
      };
    };
  };
}

// Convenience type exports
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Restaurant = Database['public']['Tables']['restaurants']['Row'];
export type List = Database['public']['Tables']['lists']['Row'];
export type ListRestaurant = Database['public']['Tables']['list_restaurants']['Row'];
export type ListComment = Database['public']['Tables']['list_comments']['Row'];
export type ListCollaborator = Database['public']['Tables']['list_collaborators']['Row'];
export type Review = Database['public']['Tables']['reviews']['Row'];
export type CuisineType = Database['public']['Tables']['cuisine_types']['Row'];
export type RestaurantCuisineType = Database['public']['Tables']['restaurant_cuisine_types']['Row'];
export type RestaurantDietaryOption = Database['public']['Tables']['restaurant_dietary_options']['Row'];
export type RestaurantDietaryOptionJunction = Database['public']['Tables']['restaurant_dietary_options_junction']['Row'];
export type RestaurantFeature = Database['public']['Tables']['restaurant_features']['Row'];
export type RestaurantRestaurantFeature = Database['public']['Tables']['restaurant_restaurant_features']['Row'];

// API response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Form types
export interface ListFormData {
  name: string;
  description: string;
  isPublic: boolean;
  tags: string[];
  cover_image_url: string;
}

export interface RestaurantFormData {
  name: string;
  description?: string;
  image_url?: string;
  price_per_person?: number;
  rating?: number;
  location?: string;
  source_url?: string;
  menu_url?: string;
  phone_numbers?: string[];
  latitude?: number;
  longitude?: number;
}