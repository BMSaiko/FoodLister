// app/api/reviews/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getClient } from '@/libs/supabase/client';

export async function GET(request: NextRequest) {
  try {
    const supabase = getClient();
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurant_id');

    if (!restaurantId) {
      return NextResponse.json({ error: 'restaurant_id parameter is required' }, { status: 400 });
    }

    // First get the reviews
    const { data: reviewsData, error: reviewsError } = await supabase
      .from('reviews')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false });

    if (reviewsError) {
      console.error('Error fetching reviews:', reviewsError);

      // Check if the table doesn't exist (migration not run)
      if (reviewsError.code === '42P01') {
        return NextResponse.json({
          error: 'Reviews table not found. Please run the database migration first.',
          details: 'Execute supabase/migrations/003_add_reviews.sql in your Supabase SQL Editor'
        }, { status: 500 });
      }

      return NextResponse.json({ error: 'Failed to fetch reviews', details: reviewsError.message }, { status: 500 });
    }

    if (!reviewsData || reviewsData.length === 0) {
      return NextResponse.json({ reviews: [] });
    }

    // For now, return reviews with anonymous users since we can't easily query auth.users from client-side
    // In a production app, you'd want to create a server-side function or RPC to get user data
    const processedData = reviewsData.map(review => ({
      ...review,
      user: {
        id: review.user_id,
        name: 'User' // Placeholder - you'd need server-side auth admin access
      }
    }));

    return NextResponse.json({ reviews: processedData });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getClient();
    const body = await request.json();
    const { restaurant_id, rating, comment } = body;

    if (!restaurant_id || !rating) {
      return NextResponse.json(
        { error: 'restaurant_id and rating are required' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Check if user already has a review for this restaurant
    const { data: existingReview, error: checkError } = await supabase
      .from('reviews')
      .select('id')
      .eq('restaurant_id', restaurant_id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing review:', checkError);
      return NextResponse.json({ error: 'Failed to check existing review' }, { status: 500 });
    }

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this restaurant' },
        { status: 409 }
      );
    }

    // Create the review
    const { data, error } = await supabase
      .from('reviews')
      .insert({
        restaurant_id,
        user_id: user.id,
        rating,
        comment: comment || null
      })
      .select('*')
      .single();

    if (error) {
      console.error('Error creating review:', error);
      return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
    }

    // Transform user data (simplified for now)
    const processedData = {
      ...data,
      user: {
        id: user.id,
        name: user.user_metadata?.name ||
              user.user_metadata?.full_name ||
              user.email ||
              'Anonymous User'
      }
    };

    return NextResponse.json({ review: processedData }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
