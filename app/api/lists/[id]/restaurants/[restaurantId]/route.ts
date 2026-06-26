// app/api/lists/[id]/restaurants/[restaurantId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerClient } from '@/libs/supabase/server';
import { getErrorMessage } from '@/types/api';
import { logActivity } from '@/libs/activity';
import type { ApiErrorType } from '@/types/api';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; restaurantId: string }> }
) {
  try {
    const supabase = await getServerClient(request, new NextResponse());
    if (!supabase) {
      const errorType = 'AUTHENTICATION_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 401 }
      );
    }

    const { id: listId, restaurantId } = await params;
    if (!listId || !restaurantId) {
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

    // Get restaurant name before deleting for activity log
    const { data: restaurant } = await supabase
      .from('restaurants')
      .select('id, name')
      .eq('id', restaurantId)
      .single();

    // Remove restaurant from list
    const { error: deleteError } = await supabase
      .from('list_restaurants')
      .delete()
      .eq('list_id', listId)
      .eq('restaurant_id', restaurantId);

    if (deleteError) {
      console.error('Error removing restaurant from list:', deleteError);
      const errorType = 'DATABASE_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 500 }
      );
    }

    // Log activity
    await logActivity(supabase, listId, user.id, 'restaurant_removed', {
      restaurant_id: restaurantId,
      restaurant_name: restaurant?.name || 'Unknown',
    });

    return NextResponse.json({
      success: true,
      message: 'Restaurant removed from list',
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    const errorType = 'INTERNAL_ERROR' as ApiErrorType;
    return NextResponse.json(
      { error: getErrorMessage(errorType), code: errorType },
      { status: 500 }
    );
  }
}
