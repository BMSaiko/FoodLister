/**
 * Meal Service — centralizes meal CRUD logic.
 */

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
