import { NextRequest, NextResponse } from 'next/server';
import { getServerClient } from '@/libs/supabase/server';

// GET a single scheduled meal
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const response = new NextResponse();
    const supabase = await getServerClient(request, response) as any;

    if (!supabase) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Fetch the meal with related data
    const { data: meal, error } = await supabase
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
      `)
      .eq('id', id)
      .single();

    if (error || !meal) {
      return NextResponse.json({ error: 'Meal not found' }, { status: 404 });
    }

    // Check if user has access (organizer or participant)
    const isOrganizer = meal.organizer_id === user.id;
    const isParticipant = meal.meal_participants?.some((p: any) => p.user_id === user.id);

    if (!isOrganizer && !isParticipant) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Transform data
    const transformedMeal = {
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
      isOrganizer,
      participantStatus: meal.meal_participants?.find((p: any) => p.user_id === user.id)?.status || null
    };

    return NextResponse.json({ data: transformedMeal });
  } catch (error) {
    console.error('Error fetching meal:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Update a scheduled meal (organizer only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const response = new NextResponse();
    const supabase = await getServerClient(request, response) as any;

    if (!supabase) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Check if the meal exists and user is the organizer
    const { data: meal } = await supabase
      .from('scheduled_meals')
      .select('organizer_id')
      .eq('id', id)
      .single();

    if (!meal) {
      return NextResponse.json({ error: 'Meal not found' }, { status: 404 });
    }

    if (meal.organizer_id !== user.id) {
      return NextResponse.json({ error: 'Only the organizer can update this meal' }, { status: 403 });
    }

    // Build update data
    const updateData: Record<string, any> = {};

    if (body.mealDate !== undefined) {
      // Validate date is not in the past
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const mealDate = new Date(body.mealDate + 'T00:00:00');
      if (mealDate < today) {
        return NextResponse.json({ error: 'Meal date cannot be in the past' }, { status: 400 });
      }
      updateData.meal_date = body.mealDate;
    }

    if (body.mealTime !== undefined) {
      // Validate time format
      const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
      if (!timeRegex.test(body.mealTime)) {
        return NextResponse.json({ error: 'Invalid time format. Use HH:MM' }, { status: 400 });
      }
      updateData.meal_time = body.mealTime;
    }

    if (body.mealType !== undefined) {
      const validTypes = ['pequeno-almoco', 'almoco', 'brunch', 'lanche', 'jantar', 'ceia'];
      if (!validTypes.includes(body.mealType)) {
        return NextResponse.json({ error: 'Invalid meal type' }, { status: 400 });
      }
      updateData.meal_type = body.mealType;
    }

    if (body.durationMinutes !== undefined) {
      if (body.durationMinutes < 15 || body.durationMinutes > 480) {
        return NextResponse.json({ error: 'Duration must be between 15 and 480 minutes' }, { status: 400 });
      }
      updateData.duration_minutes = body.durationMinutes;
    }

    // Update the meal
    const { data: updatedMeal, error: updateError } = await supabase
      .from('scheduled_meals')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating meal:', updateError);
      return NextResponse.json({ error: 'Failed to update meal' }, { status: 500 });
    }

    return NextResponse.json({ data: updatedMeal, message: 'Meal updated successfully' });
  } catch (error) {
    console.error('Error in PATCH /api/meals/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete a scheduled meal (organizer only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const response = new NextResponse();
    const supabase = await getServerClient(request, response) as any;

    if (!supabase) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Check if the meal exists and user is the organizer
    const { data: meal } = await supabase
      .from('scheduled_meals')
      .select('organizer_id')
      .eq('id', id)
      .single();

    if (!meal) {
      return NextResponse.json({ error: 'Meal not found' }, { status: 404 });
    }

    if (meal.organizer_id !== user.id) {
      return NextResponse.json({ error: 'Only the organizer can delete this meal' }, { status: 403 });
    }

    // Delete the meal (participants will be deleted by cascade)
    const { error: deleteError } = await supabase
      .from('scheduled_meals')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting meal:', deleteError);
      return NextResponse.json({ error: 'Failed to delete meal' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Meal deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/meals/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}