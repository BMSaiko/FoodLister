import { NextRequest, NextResponse } from 'next/server';
import { getServerClient } from '@/libs/supabase/server';
import { getErrorMessage } from '@/types/api';
import type { ApiErrorType } from '@/types/api';
import { checkRateLimit } from '@/libs/rate-limit';

// Add participants to a meal
export async function POST(request: NextRequest) {
  try {
    const response = new NextResponse();
    const supabase = await getServerClient(request, response) as any;

    if (!supabase) {
      const errorType = 'AUTHENTICATION_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 401 }
      );
    }
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      const errorType = 'AUTHENTICATION_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 401 }
      );
    }

    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const { allowed, remaining } = checkRateLimit(`participants-${ip}`, 20, 60_000);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests', code: 'RATE_LIMITED' },
        { status: 429, headers: { 'X-RateLimit-Remaining': String(remaining) } }
      );
    }

    const body = await request.json();
    const { mealId, userIds } = body;

    if (!mealId || !userIds || !Array.isArray(userIds)) {
      const errorType = 'VALIDATION_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
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
      const errorType = 'AUTHORIZATION_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
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
      const errorType = 'DATABASE_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data,
      message: 'Participants added successfully'
    });

  } catch (error) {
    console.error('Error in add participants:', error);
    const errorType = 'INTERNAL_ERROR' as ApiErrorType;
    return NextResponse.json(
      { error: getErrorMessage(errorType), code: errorType },
      { status: 500 }
    );
  }
}


// ─── Helper: verify meal access ───
async function verifyMealAccess(supabase: any, mealId: string, userId: string) {
  const { data: meal, error } = await supabase
    .from('scheduled_meals')
    .select('organizer_id')
    .eq('id', mealId)
    .single();

  if (error || !meal) return { error: 'Meal not found', status: 404 };
  return {
    meal,
    isOrganizer: meal.organizer_id === userId,
  };
}

// ─── Helper: get participant record ───
async function getParticipant(supabase: any, mealId: string, userId: string) {
  return supabase
    .from('meal_participants')
    .select('*')
    .eq('scheduled_meal_id', mealId)
    .eq('user_id', userId)
    .maybeSingle();
}

// ─── Helper: build participant select ───
const PARTICIPANT_SELECT = `
  id,
  user_id,
  status,
  profiles:profiles!meal_participants_user_id_fkey (
    user_id,
    display_name,
    avatar_url,
    user_id_code
  )
`;

// ─── Helper: upsert participant status ───
async function upsertParticipant(supabase: any, mealId: string, userId: string, status: string) {
  const existing = await getParticipant(supabase, mealId, userId);
  if (existing.data) {
    return supabase
      .from('meal_participants')
      .update({ status })
      .eq('scheduled_meal_id', mealId)
      .eq('user_id', userId)
      .select(PARTICIPANT_SELECT)
      .single();
  }
  return supabase
    .from('meal_participants')
    .insert({ scheduled_meal_id: mealId, user_id: userId, status })
    .select(PARTICIPANT_SELECT)
    .single();
}

// Update participant status (accept/decline)
export async function PATCH(request: NextRequest) {
  try {
    const response = new NextResponse();
    const supabase = await getServerClient(request, response) as any;

    if (!supabase) {
      const errorType = 'AUTHENTICATION_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 401 }
      );
    }
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      const errorType = 'AUTHENTICATION_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { mealId, participantId, status } = body;
    
    if (!mealId || !status) {
      const errorType = 'VALIDATION_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 400 }
      );
    }

    // Validate status
    if (!['pending', 'accepted', 'declined'].includes(status)) {
      const errorType = 'VALIDATION_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
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
      const errorType = 'NOT_FOUND' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
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
          const errorType = 'DATABASE_ERROR' as ApiErrorType;
          return NextResponse.json(
            { error: getErrorMessage(errorType), code: errorType },
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
          const errorType = 'DATABASE_ERROR' as ApiErrorType;
          return NextResponse.json(
            { error: getErrorMessage(errorType), code: errorType },
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
      // Organizer updating their own participation status
      const { data: existingOrganizerParticipant } = await supabase
        .from('meal_participants')
        .select('*')
        .eq('scheduled_meal_id', mealId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingOrganizerParticipant) {
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
          console.error('Error updating organizer participant status:', error);
          const errorType = 'DATABASE_ERROR' as ApiErrorType;
          return NextResponse.json(
            { error: getErrorMessage(errorType), code: errorType },
            { status: 500 }
          );
        }

        return NextResponse.json({
          data,
          message: 'Participant status updated successfully'
        });
      } else {
        // Create new participant record for organizer
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
          console.error('Error creating organizer participant record:', error);
          const errorType = 'DATABASE_ERROR' as ApiErrorType;
          return NextResponse.json(
            { error: getErrorMessage(errorType), code: errorType },
            { status: 500 }
          );
        }

        return NextResponse.json({
          data,
          message: 'Participant status created successfully'
        });
      }
    }

  } catch (error) {
    console.error('Error in update participant status:', error);
    const errorType = 'INTERNAL_ERROR' as ApiErrorType;
    return NextResponse.json(
      { error: getErrorMessage(errorType), code: errorType },
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
      const errorType = 'AUTHENTICATION_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 401 }
      );
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      const errorType = 'AUTHENTICATION_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 401 }
      );
    }

    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const { allowed, remaining } = checkRateLimit(`participants-delete-${ip}`, 10, 60_000);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests', code: 'RATE_LIMITED' },
        { status: 429, headers: { 'X-RateLimit-Remaining': String(remaining) } }
      );
    }

    const url = new URL(request.url);
    const mealId = url.searchParams.get('mealId');
    const participantId = url.searchParams.get('participantId');
    
    if (!mealId) {
      const errorType = 'VALIDATION_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
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
      const errorType = 'NOT_FOUND' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
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
      const errorType = 'DATABASE_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Participant removed successfully'
    });

  } catch (error) {
    console.error('Error in remove participant:', error);
    const errorType = 'INTERNAL_ERROR' as ApiErrorType;
    return NextResponse.json(
      { error: getErrorMessage(errorType), code: errorType },
      { status: 500 }
    );
  }
}