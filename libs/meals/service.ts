import { getServerClient } from '@/libs/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { notifyMealInvitation } from '@/libs/notifications/service';

/**
 * Meal Service — centralizes meal CRUD logic.
 */

export interface CreateMealInput {
  restaurantId: string;
  organizerId: string;
  mealDate: string;
  mealTime: string;
  mealType: string;
  durationMinutes?: number;
  participantIds: string[];
  googleCalendarLink?: string;
}

export interface MealResult {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * Create a new scheduled meal and notify participants.
 * Combines meal creation + notification in a single flow.
 */
export async function createMealWithNotifications(input: CreateMealInput): Promise<MealResult> {
  const response = new NextResponse();
  const supabase = await getServerClient(
    {} as NextRequest,
    response
  ) as any;

  if (!supabase) {
    return { success: false, error: 'Authentication required' };
  }

  // Create the meal
  const { data: meal, error: mealError } = await supabase
    .from('scheduled_meals')
    .insert({
      restaurant_id: input.restaurantId,
      organizer_id: input.organizerId,
      meal_date: input.mealDate,
      meal_time: input.mealTime,
      meal_type: input.mealType,
      duration_minutes: input.durationMinutes ?? 60,
      google_calendar_link: input.googleCalendarLink ?? null,
    })
    .select()
    .single();

  if (mealError) {
    console.error('[MealService] Create error:', mealError);
    return { success: false, error: mealError.message };
  }

  // Add participants
  if (input.participantIds.length > 0) {
    const participants = input.participantIds.map(userId => ({
      scheduled_meal_id: meal.id,
      user_id: userId,
      status: 'pending',
    }));

    const { error: participantsError } = await supabase
      .from('meal_participants')
      .insert(participants);

    if (participantsError) {
      console.error('[MealService] Add participants error:', participantsError);
      // Meal was created but participants failed — still return success with warning
      return { success: true, data: meal, error: 'Meal created but some participants could not be added' };
    }

    // Notify participants (fire and forget — don't block response)
    const { data: restaurant } = await supabase
      .from('restaurants')
      .select('name')
      .eq('id', input.restaurantId)
      .single();

    notifyMealInvitation(
      input.participantIds,
      meal.id,
      restaurant?.name ?? 'Restaurante',
      input.mealDate
    ).catch(err => console.error('[MealService] Notification error:', err));
  }

  return { success: true, data: meal };
}

/**
 * Get meals for a user with proper filtering.
 */
export async function getUserMeals(
  supabase: any,
  userId: string,
  type: 'organized' | 'participating' | 'all' = 'all',
  options: { limit?: number; offset?: number } = {}
): Promise<{ data: any[]; total: number }> {
  const { limit = 20, offset = 0 } = options;

  // Get meal IDs for participant filter
  let participantMealIds: string[] = [];
  if (type === 'participating' || type === 'all') {
    const { data: participantMeals } = await supabase
      .from('meal_participants')
      .select('scheduled_meal_id')
      .eq('user_id', userId);
    participantMealIds = participantMeals?.map((m: any) => m.scheduled_meal_id) || [];
  }

  let query = supabase
    .from('scheduled_meals')
    .select(`
      *,
      restaurants (id, name, location, description, images),
      organizer:profiles!scheduled_meals_organizer_id_fkey (user_id, display_name, avatar_url, user_id_code),
      meal_participants (
        id, user_id, status,
        profiles:profiles!meal_participants_user_id_fkey (user_id, display_name, avatar_url, user_id_code)
      )
    `);

  if (type === 'organized') {
    query = query.eq('organizer_id', userId);
  } else if (type === 'participating') {
    query = query.in('id', participantMealIds);
  } else {
    // 'all' — organized + participating
    const { data: organizedMeals } = await supabase
      .from('scheduled_meals')
      .select('id')
      .eq('organizer_id', userId);
    const organizedIds = organizedMeals?.map((m: any) => m.id) || [];
    const allIds = [...new Set([...organizedIds, ...participantMealIds])];
    if (allIds.length > 0) {
      query = query.in('id', allIds);
    } else {
      return { data: [], total: 0 };
    }
  }

  const { data, count } = await query
    .order('meal_date', { ascending: true })
    .order('meal_time', { ascending: true })
    .range(offset, offset + limit - 1);

  return { data: data || [], total: count || 0 };
}
