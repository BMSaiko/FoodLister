import { NextRequest, NextResponse } from 'next/server';
import { getServerClient, getPublicServerClient } from '@/libs/supabase/server';
import { getErrorMessage } from '@/types/api';
import type { ApiErrorType } from '@/types/api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      const errorType = 'VALIDATION_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 400 }
      );
    }

    const supabase = await getServerClient(request, new NextResponse());
    const client = supabase || (await getPublicServerClient());

    if (!client) {
      const errorType = 'INTERNAL_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const { data: activities, error: activitiesError, count } = await client
      .from('list_activities')
      .select(
        '*, profiles:user_id (display_name, avatar_url)',
        { count: 'exact' }
      )
      .eq('list_id', id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (activitiesError) {
      console.error('Error fetching activities:', activitiesError);
      const errorType = 'DATABASE_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 500 }
      );
    }

    const response = NextResponse.json({
      activities: activities || [],
      total: count || 0,
      limit,
      offset,
    });
    response.headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60');
    return response;
  } catch (error) {
    console.error('Unexpected error:', error);
    const errorType = 'INTERNAL_ERROR' as ApiErrorType;
    return NextResponse.json(
      { error: getErrorMessage(errorType), code: errorType },
      { status: 500 }
    );
  }
}