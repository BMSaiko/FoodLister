import { NextRequest, NextResponse } from 'next/server';
import { getServerClient } from '@/libs/supabase/server';
import { generateGoogleCalendarUrl } from '@/utils/googleCalendar';

export async function POST(request: NextRequest) {
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

    // Parse request body
    const body = await request.json();
    const {
      restaurantId,
      mealDate,
      mealTime,
      mealType,
      durationMinutes,
      participantUserIds
    } = body;

    // Validate required fields
    if (!restaurantId || !mealDate || !mealTime || !mealType) {
      return NextResponse.json(
        { error: 'Missing required fields: restaurantId, mealDate, mealTime, mealType' },
        { status: 400 }
      );
    }

    // Validate duration
    const duration = durationMinutes || 120;
    if (duration < 30 || duration > 480) {
      return NextResponse.json(
        { error: 'Duration must be between 30 and 480 minutes' },
        { status: 400 }
      );
    }

    // Validate date is not in the past
    const mealDateTime = new Date(`${mealDate}T${mealTime}`);
    const now = new Date();
    now.setMinutes(0, 0, 0);
    if (mealDateTime < now) {
      return NextResponse.json(
        { error: 'Cannot schedule meals in the past' },
        { status: 400 }
      );
    }

    // Get restaurant details
    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .select('id, name, location, description')
      .eq('id', restaurantId)
      .single();

    if (restaurantError || !restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      );
    }

    // Get organizer profile
    const { data: organizerProfile } = await supabase
      .from('profiles')
      .select('display_name, user_id_code')
      .eq('user_id', user.id)
      .single();

    // Create the scheduled meal
    const { data: scheduledMeal, error: mealError } = await supabase
      .from('scheduled_meals')
      .insert({
        restaurant_id: restaurantId,
        organizer_id: user.id,
        meal_date: mealDate,
        meal_time: mealTime,
        meal_type: mealType,
        duration_minutes: duration
      })
      .select()
      .single();

    if (mealError) {
      console.error('Error creating scheduled meal:', mealError);
      return NextResponse.json(
        { error: 'Failed to create scheduled meal' },
        { status: 500 }
      );
    }

    // Add participants if provided
    if (participantUserIds && participantUserIds.length > 0) {
      const participantRecords = participantUserIds.map((userId: string) => ({
        scheduled_meal_id: scheduledMeal.id,
        user_id: userId,
        status: 'pending'
      }));

      const { error: participantsError } = await supabase
        .from('meal_participants')
        .insert(participantRecords);

      if (participantsError) {
        console.error('Error adding participants:', participantsError);
        // Don't fail the whole request, just log the error
      }
    }

    // Generate Google Calendar URL
    const mealTypeLabels: Record<string, string> = {
      'pequeno-almoco': 'Pequeno Almoço',
      'almoco': 'Almoço',
      'brunch': 'Brunch',
      'lanche': 'Lanche',
      'jantar': 'Jantar',
      'ceia': 'Ceia'
    };

    const mealLabel = mealTypeLabels[mealType] || mealType;
    const endTime = new Date(mealDateTime.getTime() + duration * 60 * 1000);

    const calendarUrl = generateGoogleCalendarUrl({
      title: `${mealLabel} em ${restaurant.name}`,
      startDate: mealDateTime,
      endDate: endTime,
      description: `${mealLabel} reservado no restaurante ${restaurant.name}.\n\nOrganizado por ${organizerProfile?.display_name || 'FoodLister'}`,
      location: restaurant.location || restaurant.name
    });

    // Update the meal with the Google Calendar link
    await supabase
      .from('scheduled_meals')
      .update({ google_calendar_link: calendarUrl })
      .eq('id', scheduledMeal.id);

    return NextResponse.json({
      data: {
        ...scheduledMeal,
        restaurant: {
          name: restaurant.name,
          location: restaurant.location
        },
        googleCalendarLink: calendarUrl
      },
      message: 'Meal scheduled successfully'
    });

  } catch (error) {
    console.error('Error in schedule meal:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}