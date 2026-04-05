import { NextRequest, NextResponse } from 'next/server';
import { getServerClient } from '@/libs/supabase/server';

// Add participants to a meal
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

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { mealId, userIds } = body;

    if (!mealId || !userIds || !Array.isArray(userIds)) {
      return NextResponse.json(
        { error: 'Missing required fields: mealId, userIds' },
        { status: 400 }
      );
    }

    // Check if user is the organizer
    const { data: meal } = await supabase
      .from('scheduled_meals')
      .select('organizer_id')
      .eq('id', mealId)
      .single();

    if (!meal || meal.organizer_id !== user.id) {
      return NextResponse.json(
        { error: 'Only the organizer can add participants' },
        { status: 403 }
      );
    }

    // Add participants
    const participants = userIds.map((userId: string) => ({
      scheduled_meal_id: mealId,
      user_id: userId,
      status: 'pending'
    }));

    const { data, error } = await supabase
      .from('meal_participants')
      .insert(participants)
      .select(`
        id,
        user_id,
        status,
        profiles:profiles!meal_participants_user_id_fkey (
          user_id,
          display_name,
          avatar_url,
          user_id_code
        )
      `);

    if (error) {
      console.error('Error adding participants:', error);
      return NextResponse.json(
        { error: 'Failed to add participants' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data,
      message: 'Participants added successfully'
    });

  } catch (error) {
    console.error('Error in add participants:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update participant status (accept/decline)
export async function PATCH(request: NextRequest) {
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

    const body = await request.json();
    const { mealId, participantId, status } = body;

    if (!mealId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: mealId, status' },
        { status: 400 }
      );
    }

    // Validate status
    if (!['pending', 'accepted', 'declined'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be pending, accepted, or declined' },
        { status: 400 }
      );
    }

    // Check if user is the participant or the organizer
    const { data: meal } = await supabase
      .from('scheduled_meals')
      .select('organizer_id')
      .eq('id', mealId)
      .single();

    if (!meal) {
      return NextResponse.json(
        { error: 'Meal not found' },
        { status: 404 }
      );
    }

    // If user is not the organizer, they can only update their own status
    if (meal.organizer_id !== user.id) {
      // Check if participant record exists
      const { data: existingParticipant } = await supabase
        .from('meal_participants')
        .select('*')
        .eq('scheduled_meal_id', mealId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingParticipant) {
        // Update existing record
        const { data, error } = await supabase
          .from('meal_participants')
          .update({ status })
          .eq('scheduled_meal_id', mealId)
          .eq('user_id', user.id)
          .select(`
            id,
            user_id,
            status,
            profiles:profiles!meal_participants_user_id_fkey (
              user_id,
              display_name,
              avatar_url,
              user_id_code
            )
          `)
          .single();

        if (error) {
          console.error('Error updating participant status:', error);
          return NextResponse.json(
            { error: 'Failed to update participant status' },
            { status: 500 }
          );
        }

        return NextResponse.json({
          data,
          message: 'Participant status updated successfully'
        });
      } else {
        // Create new participant record (self-invite)
        const { data, error } = await supabase
          .from('meal_participants')
          .insert({
            scheduled_meal_id: mealId,
            user_id: user.id,
            status
          })
          .select(`
            id,
            user_id,
            status,
            profiles:profiles!meal_participants_user_id_fkey (
              user_id,
              display_name,
              avatar_url,
              user_id_code
            )
          `)
          .single();

        if (error) {
          console.error('Error creating participant record:', error);
          return NextResponse.json(
            { error: 'Failed to create participant record' },
            { status: 500 }
          );
        }

        return NextResponse.json({
          data,
          message: 'Participant status created successfully'
        });
      }
    } else if (participantId) {
      // Organizer can update specific participant
      const { data, error } = await supabase
        .from('meal_participants')
        .update({ status })
        .eq('id', participantId)
        .select(`
          id,
          user_id,
          status,
          profiles:profiles!meal_participants_user_id_fkey (
            user_id,
            display_name,
            avatar_url,
            user_id_code
          )
        `)
        .single();

      if (error) {
        console.error('Error updating participant status:', error);
        return NextResponse.json(
          { error: 'Failed to update participant status' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        data,
        message: 'Participant status updated successfully'
      });
    } else {
      return NextResponse.json(
        { error: 'participantId is required for organizer updates' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error in update participant status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Remove participant from a meal
export async function DELETE(request: NextRequest) {
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

    const url = new URL(request.url);
    const mealId = url.searchParams.get('mealId');
    const participantId = url.searchParams.get('participantId');

    if (!mealId) {
      return NextResponse.json(
        { error: 'Missing mealId parameter' },
        { status: 400 }
      );
    }

    // Check if user is the organizer
    const { data: meal } = await supabase
      .from('scheduled_meals')
      .select('organizer_id')
      .eq('id', mealId)
      .single();

    if (!meal) {
      return NextResponse.json(
        { error: 'Meal not found' },
        { status: 404 }
      );
    }

    // Build delete query
    let deleteQuery = supabase
      .from('meal_participants')
      .delete()
      .eq('scheduled_meal_id', mealId);

    // If user is not the organizer, they can only remove themselves
    if (meal.organizer_id !== user.id) {
      deleteQuery = deleteQuery.eq('user_id', user.id);
    } else if (participantId) {
      // Organizer can remove specific participant
      deleteQuery = deleteQuery.eq('id', participantId);
    }

    const { error } = await deleteQuery;

    if (error) {
      console.error('Error removing participant:', error);
      return NextResponse.json(
        { error: 'Failed to remove participant' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Participant removed successfully'
    });

  } catch (error) {
    console.error('Error in remove participant:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}