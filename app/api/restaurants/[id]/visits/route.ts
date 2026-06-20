import { NextRequest, NextResponse } from 'next/server';
import { getServerClient } from '@/libs/supabase/server';
import { getErrorMessage } from '@/types/api';
import type { ApiErrorType } from '@/types/api';
import type { Database } from '@/libs/supabase/client';

type UserRestaurantVisitRow = Database['public']['Tables']['user_restaurant_visits']['Row'];
type UserRestaurantVisitUpdate = Database['public']['Tables']['user_restaurant_visits']['Update'];

interface VisitResponse {
  visited: boolean;
  visit_count: number;
}

function visitRowToResponse(row: UserRestaurantVisitRow | null): VisitResponse {
  return {
    visited: row ? row.visited : false,
    visit_count: row ? row.visit_count : 0,
  };
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await getServerClient(request, undefined);

    if (!supabase) {
      const errorType = 'INTERNAL_ERROR' as ApiErrorType;
      return NextResponse.json({ error: getErrorMessage(errorType), code: errorType }, { status: 500 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      const errorType = 'AUTHENTICATION_ERROR' as ApiErrorType;
      return NextResponse.json({ error: getErrorMessage(errorType), code: errorType }, { status: 401 });
    }

    const { id: restaurantId } = await params;

    const { data: visitData, error: visitError } = await supabase
      .from('user_restaurant_visits')
      .select('*')
      .eq('user_id', user.id)
      .eq('restaurant_id', restaurantId)
      .single();

    if (visitError && visitError.code !== 'PGRST116') {
      console.error('Error fetching visit data:', visitError);
      const errorType = 'DATABASE_ERROR' as ApiErrorType;
      return NextResponse.json({ error: getErrorMessage(errorType), code: errorType }, { status: 500 });
    }

    return NextResponse.json(visitRowToResponse(visitData as UserRestaurantVisitRow | null));
  } catch (error) {
    console.error('Unexpected error:', error);
    const errorType = 'INTERNAL_ERROR' as ApiErrorType;
    return NextResponse.json({ error: getErrorMessage(errorType), code: errorType }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await getServerClient(request, undefined);

    if (!supabase) {
      const errorType = 'INTERNAL_ERROR' as ApiErrorType;
      return NextResponse.json({ error: getErrorMessage(errorType), code: errorType }, { status: 500 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      const errorType = 'AUTHENTICATION_ERROR' as ApiErrorType;
      return NextResponse.json({ error: getErrorMessage(errorType), code: errorType }, { status: 401 });
    }

    const { id: restaurantId } = await params;

    const { data: existingVisit, error: checkError } = await supabase
      .from('user_restaurant_visits')
      .select('*')
      .eq('user_id', user.id)
      .eq('restaurant_id', restaurantId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing visit:', checkError);
      const errorType = 'DATABASE_ERROR' as ApiErrorType;
      return NextResponse.json({ error: getErrorMessage(errorType), code: errorType }, { status: 500 });
    }

    const existingVisitRow = existingVisit as UserRestaurantVisitRow | null;

    if (existingVisitRow) {
      const { data: updatedVisit, error: updateError } = await supabase
        .from('user_restaurant_visits')
        .update({
          visited: true,
          visit_count: existingVisitRow.visit_count + 1,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('restaurant_id', restaurantId)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating visit:', updateError);
        const errorType = 'DATABASE_ERROR' as ApiErrorType;
        return NextResponse.json({ error: getErrorMessage(errorType), code: errorType }, { status: 500 });
      }

      const updatedRow = updatedVisit as UserRestaurantVisitRow;
      return NextResponse.json({
        visited: true,
        visit_count: updatedRow.visit_count
      });
    } else {
      const { data: newVisit, error: insertError } = await supabase
        .from('user_restaurant_visits')
        .insert({
          user_id: user.id,
          restaurant_id: restaurantId,
          visited: true,
          visit_count: 1
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating visit:', insertError);
        const errorType = 'DATABASE_ERROR' as ApiErrorType;
        return NextResponse.json({ error: getErrorMessage(errorType), code: errorType }, { status: 500 });
      }

      return NextResponse.json({
        visited: true,
        visit_count: 1
      });
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    const errorType = 'INTERNAL_ERROR' as ApiErrorType;
    return NextResponse.json({ error: getErrorMessage(errorType), code: errorType }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await getServerClient(request, undefined);

    if (!supabase) {
      const errorType = 'INTERNAL_ERROR' as ApiErrorType;
      return NextResponse.json({ error: getErrorMessage(errorType), code: errorType }, { status: 500 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      const errorType = 'AUTHENTICATION_ERROR' as ApiErrorType;
      return NextResponse.json({ error: getErrorMessage(errorType), code: errorType }, { status: 401 });
    }

    const { id: restaurantId } = await params;
    const body: Record<string, unknown> = await request.json();
    const action = body.action as string;

    if (action === 'toggle_visited') {
      const { data: existingVisit, error: checkError } = await supabase
        .from('user_restaurant_visits')
        .select('*')
        .eq('user_id', user.id)
        .eq('restaurant_id', restaurantId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing visit:', checkError);
        const errorType = 'DATABASE_ERROR' as ApiErrorType;
        return NextResponse.json({ error: getErrorMessage(errorType), code: errorType }, { status: 500 });
      }

      const existingVisitRow = existingVisit as UserRestaurantVisitRow | null;

      if (existingVisitRow) {
        const currentVisited = existingVisitRow.visited;
        const currentVisitCount = existingVisitRow.visit_count;
        const newVisitedStatus = !currentVisited;

        const updateData: UserRestaurantVisitUpdate = {
          visited: newVisitedStatus,
          updated_at: new Date().toISOString()
        };

        if (newVisitedStatus && currentVisitCount === 0) {
          updateData.visit_count = 1;
        }

        const { data: updatedVisit, error: updateError } = await supabase
          .from('user_restaurant_visits')
          .update(updateData)
          .eq('user_id', user.id)
          .eq('restaurant_id', restaurantId)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating visit status:', updateError);
          const errorType = 'DATABASE_ERROR' as ApiErrorType;
          return NextResponse.json({ error: getErrorMessage(errorType), code: errorType }, { status: 500 });
        }

        const updatedRow = updatedVisit as UserRestaurantVisitRow;
        return NextResponse.json({
          visited: newVisitedStatus,
          visit_count: updatedRow.visit_count
        });
      } else {
        const { data: newVisit, error: insertError } = await supabase
          .from('user_restaurant_visits')
          .insert({
            user_id: user.id,
            restaurant_id: restaurantId,
            visited: true,
            visit_count: 1
          })
          .select()
          .single();

        if (insertError) {
          console.error('Error creating visit:', insertError);
          const errorType = 'DATABASE_ERROR' as ApiErrorType;
          return NextResponse.json({ error: getErrorMessage(errorType), code: errorType }, { status: 500 });
        }

        return NextResponse.json({
          visited: true,
          visit_count: 1
        });
      }
    }

    if (action === 'remove_visit') {
      const { data: existingVisit, error: checkError } = await supabase
        .from('user_restaurant_visits')
        .select('*')
        .eq('user_id', user.id)
        .eq('restaurant_id', restaurantId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing visit:', checkError);
        const errorType = 'DATABASE_ERROR' as ApiErrorType;
        return NextResponse.json({ error: getErrorMessage(errorType), code: errorType }, { status: 500 });
      }

      const existingVisitRow = existingVisit as UserRestaurantVisitRow | null;

      if (existingVisitRow) {
        const currentVisitCount = existingVisitRow.visit_count;

        if (currentVisitCount > 0) {
          const newVisitCount = currentVisitCount - 1;
          const shouldMarkUnvisited = newVisitCount === 0;

          const { data: updatedVisit, error: updateError } = await supabase
            .from('user_restaurant_visits')
            .update({
              visit_count: newVisitCount,
              visited: shouldMarkUnvisited ? false : existingVisitRow.visited,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', user.id)
            .eq('restaurant_id', restaurantId)
            .select()
            .single();

          if (updateError) {
            console.error('Error removing visit:', updateError);
            const errorType = 'DATABASE_ERROR' as ApiErrorType;
            return NextResponse.json({ error: getErrorMessage(errorType), code: errorType }, { status: 500 });
          }

          const updatedRow = updatedVisit as UserRestaurantVisitRow;
          return NextResponse.json({
            visited: shouldMarkUnvisited ? false : existingVisitRow.visited,
            visit_count: updatedRow.visit_count
          });
        } else {
          const errorType = 'VALIDATION_ERROR' as ApiErrorType;
          return NextResponse.json({ error: getErrorMessage(errorType), code: errorType }, { status: 400 });
        }
      } else {
        const errorType = 'NOT_FOUND' as ApiErrorType;
        return NextResponse.json({ error: getErrorMessage(errorType), code: errorType }, { status: 404 });
      }
    }

    const errorType = 'VALIDATION_ERROR' as ApiErrorType;
    return NextResponse.json({ error: getErrorMessage(errorType), code: errorType }, { status: 400 });
  } catch (error) {
    console.error('Unexpected error:', error);
    const errorType = 'INTERNAL_ERROR' as ApiErrorType;
    return NextResponse.json({ error: getErrorMessage(errorType), code: errorType }, { status: 500 });
  }
}
