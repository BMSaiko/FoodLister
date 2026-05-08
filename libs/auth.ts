import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
type DbReview = Database['public']['Tables']['reviews']['Row'];
type DbList = Database['public']['Tables']['lists']['Row'];
type DbRestaurant = Database['public']['Tables']['restaurants']['Row'];
type DbListRestaurant = Database['public']['Tables']['list_restaurants']['Row'];

/**
 * Cria automaticamente um perfil para um usuário se não existir
 */
export async function ensureUserProfileExists(
  supabase: SupabaseClient,
  userId: string,
  userEmail?: string
): Promise<boolean> {
  try {
    // Validate inputs
    if (!userId) {
      console.error('ensureUserProfileExists: userId is required');
      return false;
    }

    // Verificar se o perfil já existe
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error checking existing profile:', checkError);
      return false;
    }

    // Se o perfil já existe, não precisamos criar
    if (existingProfile) {
      console.log(`Profile already exists for user ${userId}`);
      return true;
    }

    // Gerar user_id_code no formato FL000001
    const { data: maxCodeData } = await supabase
      .from('profiles')
      .select('user_id_code')
      .order('user_id_code', { ascending: false })
      .limit(1);

    let nextNumber = 1;
    if (maxCodeData && maxCodeData.length > 0) {
      const lastCode = maxCodeData[0].user_id_code;
      const lastNumber = parseInt(lastCode.replace('FL', ''), 10);
      nextNumber = lastNumber + 1;
    }

    const userCode = `FL${nextNumber.toString().padStart(6, '0')}`;

    // Criar o perfil usando service_role para contornar RLS policies
    // Primeiro, vamos tentar obter o token service_role
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (serviceRoleKey) {
      console.log(`Creating profile for user ${userId} using service role`);
      // Criar cliente com service_role para operações administrativas
      const { createClient } = await import('@supabase/supabase-js');
      const serviceSupabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey
      );

      const { error: insertError } = await serviceSupabase
        .from('profiles')
        .insert({
          user_id: userId,
          user_id_code: userCode,
          display_name: userEmail ? userEmail.split('@')[0] : 'Usuário',
          bio: 'Bem-vindo ao FoodList! Comece a explorar restaurantes e compartilhar suas experiências.',
          public_profile: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (insertError) {
        console.error('Error creating user profile with service role:', insertError);
        return false;
      }

      console.log(`Successfully created profile for user ${userId} using service role`);
      return true;
    } else {
      // Fallback: tentar criar com o cliente atual (pode falhar se não houver autenticação)
      console.warn('SUPABASE_SERVICE_ROLE_KEY not found, attempting profile creation with current client');
      
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          user_id: userId,
          user_id_code: userCode,
          display_name: userEmail ? userEmail.split('@')[0] : 'Usuário',
          bio: 'Bem-vindo ao FoodList! Comece a explorar restaurantes e compartilhar suas experiências.',
          public_profile: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (insertError) {
        console.error('Error creating user profile:', insertError);
        // Se for erro de RLS, registrar mas não falhar completamente
        if (insertError.code === '42501') {
          console.warn('Profile creation blocked by RLS policy - this is expected for unauthenticated contexts');
          return false;
        }
        return false;
      }

      console.log(`Successfully created profile for user ${userId} using current client`);
      return true;
    }

  } catch (error) {
    console.error('Error ensuring user profile exists:', error);
    return false;
  }
}

export interface AccessValidationResult {
  canAccess: boolean;
  accessLevel: 'OWNER' | 'PUBLIC' | 'PRIVATE' | 'NONE';
  reason?: string;
  targetUserId?: string;
}

export interface UserProfile {
  user_id: string;
  user_id_code: string;
  display_name: string;
  avatar_url: string;
  location: string;
  bio: string;
  website: string;
  phone_number: string;
  public_profile: boolean;
  created_at: string;
  updated_at: string;
  total_restaurants_visited: number;
  total_reviews: number;
  total_lists: number;
  total_restaurants_added: number;
}

/**
 * Valida o acesso a um perfil de usuário com base na autenticação e privacidade
 */
export async function validateProfileAccess(
  supabase: SupabaseClient,
  targetUserIdOrCode: string,
  currentUserId?: string | null
): Promise<AccessValidationResult> {
  try {
    // 1. Verificar se o ID é user_id_code ou UUID
    const isUserCode = /^[A-Z]{2}\d{6}$/.test(targetUserIdOrCode);

    // 2. Buscar o perfil
    let profileQuery = supabase
      .from('profiles')
      .select('user_id, user_id_code, public_profile')
      .single();

    if (isUserCode) {
      profileQuery = (profileQuery as any).eq('user_id_code', targetUserIdOrCode);
    } else {
      profileQuery = (profileQuery as any).eq('user_id', targetUserIdOrCode);
    }

    const { data: profile, error: profileError } = await profileQuery;

    if (profileError || !profile) {
      return {
        canAccess: false,
        accessLevel: 'NONE',
        reason: 'PROFILE_NOT_FOUND'
      };
    }

    const targetUserId = profile.user_id;

    // 3. Verificar se é o próprio dono
    if (currentUserId && currentUserId === targetUserId) {
      return {
        canAccess: true,
        accessLevel: 'OWNER',
        targetUserId
      };
    }

    // 4. Verificar se o perfil é público
    if (profile.public_profile) {
      return {
        canAccess: true,
        accessLevel: currentUserId ? 'PRIVATE' : 'PUBLIC',
        targetUserId
      };
    }

    // 5. Perfil privado e não é o dono
    return {
      canAccess: false,
      accessLevel: 'NONE',
      reason: 'PRIVATE_PROFILE',
      targetUserId
    };

  } catch (error) {
    console.error('Error validating profile access:', error);
    return {
      canAccess: false,
      accessLevel: 'NONE',
      reason: 'VALIDATION_ERROR'
    };
  }
}

/**
 * Busca dados do perfil com base no nível de acesso
 */
export async function getUserProfileData(
  supabase: SupabaseClient,
  targetUserId: string,
  accessLevel: 'OWNER' | 'PUBLIC' | 'PRIVATE'
): Promise<UserProfile | null> {
  try {
    // Query base para todos os níveis de acesso
    let query = supabase
      .from('profiles')
      .select(`
        user_id,
        user_id_code,
        display_name,
        avatar_url,
        location,
        bio,
        website,
        phone_number,
        public_profile,
        created_at,
        updated_at,
        total_restaurants_visited,
        total_reviews,
        total_lists,
        total_restaurants_added
      `)
      .eq('user_id', targetUserId)
      .single();

    const { data: profile, error } = await query;

    if (error || !profile) {
      return null;
    }

    return {
      user_id: profile.user_id,
      user_id_code: profile.user_id_code,
      display_name: profile.display_name,
      avatar_url: profile.avatar_url,
      location: profile.location,
      bio: profile.bio,
      website: profile.website,
      phone_number: profile.phone_number || '',
      public_profile: profile.public_profile,
      created_at: profile.created_at,
      updated_at: profile.updated_at,
      total_restaurants_visited: profile.total_restaurants_visited || 0,
      total_reviews: profile.total_reviews || 0,
      total_lists: profile.total_lists || 0,
      total_restaurants_added: profile.total_restaurants_added || 0
    };

  } catch (error) {
    console.error('Error fetching user profile data:', error);
    return null;
  }
}

/**
 * Busca avaliações com base no nível de acesso
 */
export async function getUserReviewsData(
  supabase: SupabaseClient,
  targetUserId: string,
  accessLevel: 'OWNER' | 'PUBLIC' | 'PRIVATE',
  page: number = 1,
  limit: number = 10
): Promise<{ data: Array<DbReview & { restaurants: DbRestaurant | null }>; total: number; hasMore: boolean }> {
  try {
    const offset = (page - 1) * limit;

    // Query para avaliações
    const { data: reviewsData, error: reviewsError } = await supabase
      .from('reviews')
      .select(`
        id,
        rating,
        comment,
        amount_spent,
        created_at,
        restaurants (
          id,
          name,
          image_url,
          rating,
          location
        )
      `)
      .eq('user_id', targetUserId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Contagem total
    const { count } = await supabase
      .from('reviews')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', targetUserId);

    if (reviewsError) {
      console.error('Error fetching user reviews:', reviewsError);
      return { data: [], total: 0, hasMore: false };
    }

    // Type for the query result (only fields we're selecting)
    type ReviewQueryResult = {
      id: string;
      rating: number;
      comment: string | null;
      amount_spent: number | null;
      created_at: string;
      restaurants: Array<{
        id: string;
        name: string;
        image_url: string | null;
        rating: number;
        location: string;
      }> | null;
    };

    const reviews = (reviewsData as unknown as Array<ReviewQueryResult>)?.map((review) => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      amountSpent: review.amount_spent,
      createdAt: review.created_at,
      restaurant: review.restaurants && review.restaurants.length > 0 ? {
        id: review.restaurants[0].id,
        name: review.restaurants[0].name,
        imageUrl: review.restaurants[0].image_url,
        rating: review.restaurants[0].rating,
        location: review.restaurants[0].location
      } : null
    })) || [];

    return {
      data: reviews,
      total: count || 0,
      hasMore: count ? count > (offset + limit) : false
    };

  } catch (error) {
    console.error('Error fetching user reviews data:', error);
    return { data: [], total: 0, hasMore: false };
  }
}

/**
 * Busca listas com base no nível de acesso
 */
export async function getUserListsData(
  supabase: SupabaseClient,
  targetUserId: string,
  accessLevel: 'OWNER' | 'PUBLIC' | 'PRIVATE',
  page: number = 1,
  limit: number = 10
): Promise<{ data: Array<DbList & { list_restaurants: DbListRestaurant[] | null }>; total: number; hasMore: boolean }> {
  try {
    const offset = (page - 1) * limit;

    // Query para listas
    const { data: listsData, error: listsError } = await supabase
      .from('lists')
      .select(`
        id,
        name,
        description,
        created_at,
        list_restaurants (
          restaurant_id
        )
      `)
      .eq('creator_id', targetUserId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Contagem total
    const { count } = await supabase
      .from('lists')
      .select('id', { count: 'exact', head: true })
      .eq('creator_id', targetUserId);

    if (listsError) {
      console.error('Error fetching user lists:', listsError);
      return { data: [], total: 0, hasMore: false };
    }

    const lists = (listsData as Array<DbList & { list_restaurants: DbListRestaurant[] | null }>)?.map((list) => ({
      id: list.id,
      name: list.name,
      description: list.description,
      createdAt: list.created_at,
      restaurantCount: list.list_restaurants?.length || 0
    })) || [];

    return {
      data: lists,
      total: count || 0,
      hasMore: count ? count > (offset + limit) : false
    };

  } catch (error) {
    console.error('Error fetching user lists data:', error);
    return { data: [], total: 0, hasMore: false };
  }
}

/**
 * Busca restaurantes criados pelo usuário (sempre público)
 */
export async function getUserRestaurantsData(
  supabase: SupabaseClient,
  targetUserId: string,
  page: number = 1,
  limit: number = 10
): Promise<{ data: Array<DbRestaurant & { 
  cuisine_types: Array<{ name: string }> | null;
  restaurant_dietary_options_junction: Array<{ restaurant_dietary_options: { name: string } | null }> | null;
  restaurant_restaurant_features: Array<{ restaurant_features: { name: string } | null }> | null;
}>; total: number; hasMore: boolean }> {
  try {
    const offset = (page - 1) * limit;

    // Query para restaurantes
    const { data: restaurantsData, error: restaurantsError } = await supabase
      .from('restaurants')
      .select(`
        id,
        name,
        description,
        image_url,
        location,
        price_per_person,
        rating,
        opening_hours,
        website,
        phone,
        menu,
        created_at,
        updated_at,
        cuisine_types (
          name
        ),
        restaurant_dietary_options_junction (
          restaurant_dietary_options (
            name
          )
        ),
        restaurant_restaurant_features (
          restaurant_features (
            name
          )
        )
      `)
      .eq('creator_id', targetUserId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Contagem total
    const { count } = await supabase
      .from('restaurants')
      .select('id', { count: 'exact', head: true })
      .eq('creator_id', targetUserId);

    if (restaurantsError) {
      console.error('Error fetching user restaurants:', restaurantsError);
      return { data: [], total: 0, hasMore: false };
    }

    const restaurants = (restaurantsData as Array<DbRestaurant & { 
      cuisine_types: Array<{ name: string }> | null;
      restaurant_dietary_options_junction: Array<{ restaurant_dietary_options: { name: string } | null }> | null;
      restaurant_restaurant_features: Array<{ restaurant_features: { name: string } | null }> | null;
    }>)?.map((restaurant) => ({
      id: restaurant.id,
      name: restaurant.name,
      description: restaurant.description,
      imageUrl: restaurant.image_url,
      location: restaurant.location,
      priceLevel: restaurant.price_per_person,
      rating: restaurant.rating,
      openingHours: restaurant.opening_hours,
      website: restaurant.website,
      phone: restaurant.phone,
      menu: restaurant.menu,
      createdAt: restaurant.created_at,
      updatedAt: restaurant.updated_at,
      cuisineTypes: restaurant.cuisine_types?.map((ct: { name: string }) => ct.name).filter(Boolean) || [],
      dietaryOptions: restaurant.restaurant_dietary_options_junction?.map((junction: { restaurant_dietary_options: { name: string } | null }) => junction.restaurant_dietary_options?.name).filter(Boolean) || [],
      features: restaurant.restaurant_restaurant_features?.map((junction: { restaurant_features: { name: string } | null }) => junction.restaurant_features?.name).filter(Boolean) || []
    })) || [];

    return {
      data: restaurants,
      total: count || 0,
      hasMore: count ? count > (offset + limit) : false
    };

  } catch (error) {
    console.error('Error fetching user restaurants data:', error);
    return { data: [], total: 0, hasMore: false };
  }
}