import { NextRequest, NextResponse } from 'next/server';
import { getServerClient } from '@/libs/supabase/server';
import { getErrorMessage } from '@/types/api';
import type { ApiErrorType } from '@/types/api';
import { checkRateLimit } from '@/libs/rate-limit';
import { getUserMeals } from '@/libs/meals/service';

export async function GET(request: NextRequest) {
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

    // Get the authenticated user
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      const errorType = 'AUTHENTICATION_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 401 }
      );
    }

    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const { allowed, remaining } = checkRateLimit(`meals-scheduled-${ip}`, 30, 60_000);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests', code: 'RATE_LIMITED' },
        { status: 429, headers: { 'X-RateLimit-Remaining': String(remaining) } }
      );
    }

    // Parse query parameters
    const url = new URL(request.url);
    const typeParam = url.searchParams.get('type') || 'all';
    const type = (['organized', 'participating', 'all'].includes(typeParam) ? typeParam : 'all') as 'organized' | 'participating' | 'all';
    const targetUserId = url.searchParams.get('userId'); // Optional: fetch meals for a specific user
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Determine which user's meals to fetch
    const userId = targetUserId || user.id;

    // Parse search/filter params
    const searchQuery = url.searchParams.get('search') || '';
    const dateFrom = url.searchParams.get('dateFrom') || '';
    const dateTo = url.searchParams.get('dateTo') || '';
    const mealType = url.searchParams.get('mealType') || '';
    const restaurantName = url.searchParams.get('restaurantName') || '';

    // Use the service for the complex query
    const { data: meals, total: totalCount } = await getUserMeals(supabase, userId, type, {
      limit,
      offset,
    });

    // Apply additional search filters (not covered by service)
    let filteredMeals = meals;

    if (restaurantName) {
      const term = restaurantName.toLowerCase();
      filteredMeals = filteredMeals.filter((m: any) =>
        m.restaurant?.name?.toLowerCase().includes(term)
      );
    }

    if (mealType) {
      filteredMeals = filteredMeals.filter((m: any) => m.mealType === mealType);
    }

    if (dateFrom) {
      filteredMeals = filteredMeals.filter((m: any) => m.mealDate >= dateFrom);
    }

    if (dateTo) {
      filteredMeals = filteredMeals.filter((m: any) => m.mealDate <= dateTo);
    }

    return NextResponse.json({
      data: filteredMeals,
      total: totalCount,
      page,
      limit,
      hasMore: totalCount > (offset + filteredMeals.length)
    });

  } catch (error) {
    console.error('Error in fetch scheduled meals:', error);
    const errorType = 'INTERNAL_ERROR' as ApiErrorType;
    return NextResponse.json(
      { error: getErrorMessage(errorType), code: errorType },
      { status: 500 }
    );
  }
}