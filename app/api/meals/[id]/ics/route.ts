import { NextRequest, NextResponse } from 'next/server';
import { getServerClient } from '@/libs/supabase/server';
import { generateMealIcsContent } from '@/libs/ics-generator';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const response = new NextResponse();
    const supabase = await getServerClient(request, response) as any;

    if (!supabase) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: mealId } = await params;

    // Get meal details with restaurant and participants
    const { data: meal, error: mealError } = await supabase
      .from('scheduled_meals')
      .select(`
        *,
        restaurants (
          id,
          name,
          location,
          description
        ),
        organizer:profiles!scheduled_meals_organizer_id_fkey (
          user_id,
          display_name,
          user_id_code
        ),
        meal_participants (
          user_id,
          status,
          profiles:profiles!meal_participants_user_id_fkey (
            user_id,
            display_name
          )
        )
      `)
      .eq('id', mealId)
      .single();

    if (mealError || !meal) {
      return NextResponse.json(
        { error: 'Meal not found' },
        { status: 404 }
      );
    }

    // Check if user is organizer or participant
    const isOrganizer = meal.organizer_id === user.id;
    const isParticipant = meal.meal_participants?.some(
      (p: any) => p.user_id === user.id
    );

    if (!isOrganizer && !isParticipant) {
      return NextResponse.json(
        { error: 'You do not have access to this meal' },
        { status: 403 }
      );
    }

    // Generate ICS content
    const mealTypeLabels: Record<string, string> = {
      'pequeno-almoco': 'Pequeno Almoço',
      'almoco': 'Almoço',
      'brunch': 'Brunch',
      'lanche': 'Lanche',
      'jantar': 'Jantar',
      'ceia': 'Ceia'
    };

    const mealLabel = mealTypeLabels[meal.meal_type] || meal.meal_type;

    const attendees = meal.meal_participants
      ?.filter((p: any) => p.status === 'accepted' && p.profiles)
      .map((p: any) => ({
        name: p.profiles.display_name || 'Participante',
        email: `${p.user_id}@foodlister.local` // Placeholder email
      })) || [];

    const icsContent = generateMealIcsContent({
      restaurantName: meal.restaurants?.name || 'Restaurante',
      mealType: meal.meal_type,
      mealDate: meal.meal_date,
      mealTime: meal.meal_time,
      durationMinutes: meal.duration_minutes,
      organizerName: meal.organizer?.display_name || 'Organizador',
      organizerEmail: `${meal.organizer_id}@foodlister.local`, // Placeholder email
      location: meal.restaurants?.location || meal.restaurants?.name,
      description: meal.restaurants?.description || `${mealLabel} no restaurante ${meal.restaurants?.name}`,
      attendees
    });

    // Return ICS file
    return new NextResponse(icsContent, {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="refeicao-${meal.restaurants?.name?.toLowerCase().replace(/\s+/g, '-')}-${meal.meal_date}.ics"`
      }
    });

  } catch (error) {
    console.error('Error generating ICS:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}