// app/api/lists/[id]/restaurants/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerClient } from '@/libs/supabase/server';
import { getErrorMessage } from '@/types/api';
import { logActivity } from '@/libs/activity';
import type { ApiErrorType } from '@/types/api';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await getServerClient();
    if (!supabase) {
      const errorType = 'AUTHENTICATION_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 401 }
      );
    }

    const { id: listId } = await params;
    if (!listId) {
      const errorType = 'VALIDATION_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 400 }
      );
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      const errorType = 'AUTHENTICATION_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 401 }
      );
    }

    // Check list ownership or collaboration
    const { data: list } = await supabase
      .from('lists')
      .select('creator_id')
      .eq('id', listId)
      .single();

    if (!list) {
      const errorType = 'NOT_FOUND' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 404 }
      );
    }

    const isOwner = list.creator_id === user.id;
    const { data: collab } = await supabase
      .from('list_collaborators')
      .select('id')
      .eq('list_id', listId)
      .eq('user_id', user.id)
      .eq('role', 'editor')
      .single();

    if (!isOwner && !collab) {
      const errorType = 'AUTHORIZATION_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { restaurantId } = body;

    if (!restaurantId) {
      const errorType = 'VALIDATION_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 400 }
      );
    }

    // Verify restaurant exists
    const { data: restaurant } = await supabase
      .from('restaurants')
      .select('id, name')
      .eq('id', restaurantId)
      .single();

    if (!restaurant) {
      const errorType = 'NOT_FOUND' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 404 }
      );
    }

    // Get current max position
    const { data: maxPos } = await supabase
      .from('list_restaurants')
      .select('position')
      .eq('list_id', listId)
      .order('position', { ascending: false })
      .limit(1)
      .single();

    const nextPosition = maxPos ? (maxPos.position + 1) : 0;

    // Add restaurant to list
    const { error: insertError } = await supabase
      .from('list_restaurants')
      .insert({
        list_id: listId,
        restaurant_id: restaurantId,
        position: nextPosition,
      });

    if (insertError) {
      if (insertError.code === '23505') {
        const errorType = 'VALIDATION_ERROR' as ApiErrorType;
        return NextResponse.json(
          { error: 'Restaurant already in list', code: errorType },
          { status: 409 }
        );
      }
      console.error('Error adding restaurant to list:', insertError);
      const errorType = 'DATABASE_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 500 }
      );
    }

    // Log activity
    await logActivity(supabase, listId, user.id, 'restaurant_added', {
      restaurant_id: restaurantId,
      restaurant_name: restaurant.name,
    });

    return NextResponse.json(
      { success: true, message: 'Restaurant added to list' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    const errorType = 'INTERNAL_ERROR' as ApiErrorType;
    return NextResponse.json(
      { error: getErrorMessage(errorType), code: errorType },
      { status: 500 }
    );
  }
}
