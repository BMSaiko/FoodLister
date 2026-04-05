import { NextRequest, NextResponse } from 'next/server';
import { getServerClient } from '@/libs/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const response = new NextResponse();
    const supabase = await getServerClient(request, response) as any;

    if (!supabase) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the authenticated user
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse query parameters
    const url = new URL(request.url);
    const type = url.searchParams.get('type') || 'all'; // 'organized', 'participating', 'all'
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    let query = supabase
      .from('scheduled_meals')
      .select(`
        *,
        restaurants (
          id,
          name,
          location,
          description,
          images
        ),
        organizer:profiles!scheduled_meals_organizer_id_fkey (
          user_id,
          display_name,
          avatar_url,
          user_id_code
        ),
        meal_participants (
          id,
          user_id,
          status,
          profiles:profiles!meal_participants_user_id_fkey (
            user_id,
            display_name,
            avatar_url,
            user_id_code
          )
        )
      `, { count: 'exact' });

    // Get meal IDs for participant filter first
    let participantMealIds: string[] = [];
    if (type === 'participating' || type === 'all') {
      const { data: participantMeals } = await supabase
        .from('meal_participants')
        .select('scheduled_meal_id')
        .eq('user_id', user.id);
      
      participantMealIds = participantMeals?.map((m: any) => m.scheduled_meal_id) || [];
    }

    // Build the main query with proper filtering
    if (type === 'organized') {
      query = query.eq('organizer_id', user.id);
    } else if (type === 'participating') {
      query = query.in('id', participantMealIds);
    } else {
      // 'all' - show both organized and participating
      // Get distinct meal IDs combining organized and participating
      const allMealIds = new Set<string>();
      // We'll filter organized meals in the main query
      participantMealIds.forEach(id => allMealIds.add(id));
      
      // For 'all' type, we need to get organized meals separately
      const { data: organizedMeals } = await supabase
        .from('scheduled_meals')
        .select('id')
        .eq('organizer_id', user.id);
      
      organizedMeals?.forEach((m: any) => allMealIds.add(m.id));
      
      const uniqueMealIds = Array.from(allMealIds);
      if (uniqueMealIds.length > 0) {
        query = query.in('id', uniqueMealIds);
      } else {
        // No meals found, return empty
        return NextResponse.json({
          data: [],
          total: 0,
          page,
          limit,
          hasMore: false
        });
      }
    }

    // Get total count for pagination
    const { count: totalCount } = await query;

    // Order by date and time, then apply pagination
    const { data, error } = await query
      .order('meal_date', { ascending: true })
      .order('meal_time', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching scheduled meals:', error);
      return NextResponse.json(
        { error: 'Failed to fetch scheduled meals' },
        { status: 500 }
      );
    }

    // Transform data
    const meals = data?.map((meal: any) => ({
      id: meal.id,
      restaurantId: meal.restaurant_id,
      organizerId: meal.organizer_id,
      mealDate: meal.meal_date,
      mealTime: meal.meal_time,
      mealType: meal.meal_type,
      durationMinutes: meal.duration_minutes,
      googleCalendarLink: meal.google_calendar_link,
      createdAt: meal.created_at,
      restaurant: meal.restaurants ? {
        id: meal.restaurants.id,
        name: meal.restaurants.name,
        location: meal.restaurants.location,
        description: meal.restaurants.description,
        image: meal.restaurants.images?.[0] || null
      } : null,
      organizer: meal.organizer ? {
        userId: meal.organizer.user_id,
        displayName: meal.organizer.display_name,
        avatarUrl: meal.organizer.avatar_url,
        userIdCode: meal.organizer.user_id_code
      } : null,
      participants: meal.meal_participants?.map((p: any) => ({
        id: p.id,
        userId: p.user_id,
        status: p.status,
        profile: p.profiles ? {
          userId: p.profiles.user_id,
          displayName: p.profiles.display_name,
          avatarUrl: p.profiles.avatar_url,
          userIdCode: p.profiles.user_id_code
        } : null
      })) || [],
      isOrganizer: meal.organizer_id === user.id,
      participantStatus: meal.meal_participants?.find((p: any) => p.user_id === user.id)?.status || null
    })) || [];

    return NextResponse.json({
      data: meals,
      total: totalCount || 0,
      page,
      limit,
      hasMore: totalCount ? totalCount > (offset + limit) : false
    });

  } catch (error) {
    console.error('Error in fetch scheduled meals:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}