// app/api/reviews/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getClient } from '@/libs/supabase/client';
import { getServerClient, getPublicServerClient } from '@/libs/supabase/server';
import { getErrorMessage } from '@/types/api';
import type { ApiErrorType } from '@/types/api';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/libs/supabase/types';
import { checkRateLimit } from '@/libs/rate-limit';

type DbClient = SupabaseClient<Database>;
// Database type is incomplete — use explicit query types
type ReviewRow = any;
type ProfileRow = any;

interface ProcessedReview extends ReviewRow {
  user: {
    id: string;
    name: string;
    profileImage: string | null;
    userIdCode: string | null;
  };
}

// Helper function to update restaurant rating based on reviews
async function updateRestaurantRating(restaurantId: string) {
  const supabase = getClient();

  try {
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('rating')
      .eq('restaurant_id', restaurantId) as any;

    if (reviewsError) {
      console.error('Error fetching reviews for rating calculation:', reviewsError);
      return;
    }

    let averageRating = 0;
    if (reviews && reviews.length > 0) {
      const totalRating = reviews.reduce((sum: number, review: any) => sum + review.rating, 0);
      averageRating = totalRating / reviews.length;
    }

    const { error: updateError } = await (supabase as any)
      .from('restaurants')
      .update({ rating: averageRating })
      .eq('id', restaurantId);

    if (updateError) {
      console.error('Error updating restaurant rating:', updateError);
    }
  } catch (error) {
    console.error('Error in updateRestaurantRating:', error);
  }
}

export async function GET(request: NextRequest) {
  // Rate limiting
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const { allowed, remaining } = checkRateLimit(`reviews-get-${ip}`, 30, 60_000);
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests', code: 'RATE_LIMITED' },
      { status: 429, headers: { 'X-RateLimit-Remaining': String(remaining) } }
    );
  }
  try {
    const supabase = await getPublicServerClient();
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurant_id');

    if (!restaurantId) {
      const errorType = 'VALIDATION_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 400 }
      );
    }

    if (!supabase) {
      const errorType = 'INTERNAL_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 500 }
      );
    }

    const { data: reviewsData, error: reviewsError } = await supabase
      .from('reviews')
      .select('id, restaurant_id, user_id, rating, comment, amount_spent, created_at, updated_at, user_name')
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false });

    if (reviewsError) {
      console.error('Error fetching reviews:', reviewsError);

      if (reviewsError.code === '42P01') {
        const errorType = 'DATABASE_ERROR' as ApiErrorType;
        return NextResponse.json({
          error: getErrorMessage(errorType),
          code: errorType,
          details: 'Execute supabase/migrations/003_add_reviews.sql in your Supabase SQL Editor'
        }, { status: 500 });
      }

      const errorType = 'DATABASE_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 500 }
      );
    }

    if (!reviewsData || reviewsData.length === 0) {
      return NextResponse.json({ reviews: [] });
    }

    const reviewsRows = reviewsData as ReviewRow[];

    const userIds = Array.from(new Set(reviewsRows.map((review) => review.user_id)));

    const userProfiles = new Map<string, { displayName: string | null; avatarUrl: string | null; userIdCode: string | null }>();

    if (userIds.length > 0) {
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url, user_id_code')
        .in('user_id', userIds);

      if (!profilesError && profilesData) {
        (profilesData as ProfileRow[]).forEach((profile) => {
          userProfiles.set(profile.user_id, {
            displayName: profile.display_name || null,
            avatarUrl: profile.avatar_url || null,
            userIdCode: profile.user_id_code || null
          });
        });
      }

      userIds.forEach((userId) => {
        if (!userProfiles.has(userId)) {
          userProfiles.set(userId, {
            displayName: null,
            avatarUrl: null,
            userIdCode: null
          });
        }
      });
    }

    const processedData: ProcessedReview[] = reviewsRows.map((review) => {
      const profile = userProfiles.get(review.user_id) || { displayName: null, avatarUrl: null, userIdCode: null };

      return {
        ...review,
        user: {
          id: review.user_id,
          name: profile.displayName || review.user_name || 'Anonymous User',
          profileImage: profile.avatarUrl || null,
          userIdCode: profile.userIdCode || null
        }
      };
    });

    return NextResponse.json({ reviews: processedData });
  } catch (error) {
    console.error('Unexpected error:', error);
    const errorType = 'INTERNAL_ERROR' as ApiErrorType;
    return NextResponse.json(
      { error: getErrorMessage(errorType), code: errorType },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Rate limiting
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const rateLimitResult = checkRateLimit(`reviews-post-${ip}`, 10, 60_000);
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: 'Too many requests', code: 'RATE_LIMITED' },
      { status: 429, headers: { 'X-RateLimit-Remaining': String(rateLimitResult.remaining) } }
    );
  }
  try {
    const response = NextResponse.next();
    const supabase = await getServerClient(request, response);
    const body: Record<string, unknown> = await request.json();
    const restaurant_id = body.restaurant_id as string | undefined;
    const rating = body.rating as number | undefined;
    const comment = body.comment as string | undefined;
    const amount_spent = body.amount_spent as number | undefined;

    if (!restaurant_id || !rating) {
      const errorType = 'VALIDATION_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      const errorType = 'VALIDATION_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 400 }
      );
    }

    if (amount_spent !== undefined && amount_spent !== null && (amount_spent <= 0 || isNaN(amount_spent))) {
      const errorType = 'VALIDATION_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 400 }
      );
    }

    if (!supabase) {
      const errorType = 'INTERNAL_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 500 }
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

    const { data: existingReview, error: checkError } = await supabase
      .from('reviews')
      .select('id')
      .eq('restaurant_id', restaurant_id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing review:', checkError);
      const errorType = 'DATABASE_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 500 }
      );
    }

    if (existingReview) {
      const errorType = 'CONFLICT' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 409 }
      );
    }

    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('display_name, avatar_url, user_id_code')
      .eq('user_id', user.id)
      .single();

    const profileRow = userProfile as ProfileRow | null;
    const userDisplayName = (!profileError && profileRow?.display_name)
      ? profileRow.display_name
      : (user.email?.split('@')[0] || 'Anonymous User');
    const userProfileImage = (!profileError && profileRow?.avatar_url) ? profileRow.avatar_url : null;
    const userUserIdCode = (!profileError && profileRow?.user_id_code) ? profileRow.user_id_code : null;

    const { data, error } = await (supabase as unknown as { from: (table: string) => { insert: (obj: Record<string, unknown>) => { select: (cols: string) => { single: () => Promise<{ data: ReviewRow | null; error: { code: string; message: string; details?: string; hint?: string } | null }> } } } })
      .from('reviews')
      .insert({
        restaurant_id,
        user_id: user.id,
        user_name: userDisplayName,
        rating,
        comment: comment || null,
        amount_spent: amount_spent || null
      })
      .select('*')
      .single();

    if (error) {
      console.error('Error creating review:', error);
      const errorType = 'DATABASE_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 500 }
      );
    }

    await updateRestaurantRating(restaurant_id);

    const reviewData = data as ReviewRow;
    const processedData: ProcessedReview = {
      ...reviewData,
      user: {
        id: user.id,
        name: userDisplayName,
        profileImage: userProfileImage,
        userIdCode: userUserIdCode
      }
    };

    return NextResponse.json({ review: processedData }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    const errorType = 'INTERNAL_ERROR' as ApiErrorType;
    return NextResponse.json(
      { error: getErrorMessage(errorType), code: errorType },
      { status: 500 }
    );
  }
}
