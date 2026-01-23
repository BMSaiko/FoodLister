// app/api/reviews/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getClient } from '@/libs/supabase/client';
import { getServerClient } from '@/libs/supabase/server';

// Helper function to update restaurant rating based on reviews
async function updateRestaurantRating(restaurantId: string) {
  const supabase = getClient();

  try {
    // Calculate average rating from all reviews for this restaurant
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('rating')
      .eq('restaurant_id', restaurantId);

    if (reviewsError) {
      console.error('Error fetching reviews for rating calculation:', reviewsError);
      return;
    }

    let averageRating = 0;
    if (reviews && reviews.length > 0) {
      const totalRating = (reviews as any[]).reduce((sum, review) => sum + review.rating, 0);
      averageRating = totalRating / reviews.length;
    }

    // Update the restaurant's rating
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
  try {
    const response = NextResponse.next();
    const supabase = await getServerClient(request, response);
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

    // Get unique user IDs to fetch their profile images from profiles table
    const userIds = [...new Set(reviewsData.map((review: any) => review.user_id))];

    // Fetch user profiles and emails
    const userProfiles = new Map();
    const userEmails = new Map();

    if (userIds.length > 0) {
      // Get profile data using the secure function
      const { data: profilesData, error: profilesError } = await (supabase as any)
        .rpc('get_user_profiles', { user_ids: userIds });

      if (!profilesError && profilesData) {
        profilesData.forEach((profile: any) => {
          userProfiles.set(profile.user_id, {
            displayName: profile.display_name || null,
            avatarUrl: profile.avatar_url || null
          });
        });
      }

      // Get user emails from auth.users
      const { data: usersData, error: usersError } = await supabase
        .from('auth.users')
        .select('id, email')
        .in('id', userIds);

      if (!usersError && usersData) {
        usersData.forEach((user: any) => {
          userEmails.set(user.id, user.email || null);
        });
      }

      // Note: Profiles should be created automatically via Supabase Auth hooks
      // No manual profile creation needed here to avoid conflicts

      // Ensure all users have an entry in the maps
      userIds.forEach(userId => {
        if (!userProfiles.has(userId)) {
          userProfiles.set(userId, {
            displayName: null,
            avatarUrl: null
          });
        }
        if (!userEmails.has(userId)) {
          userEmails.set(userId, null);
        }
      });
    }

    // Transform user data consistently across all endpoints
    const processedData = reviewsData.map((review: any) => {
      const profile = userProfiles.get(review.user_id) || { displayName: null, avatarUrl: null };
      const email = userEmails.get(review.user_id);
      const emailName = email ? email.split('@')[0] : null;

      return {
        ...review,
        user: {
          id: review.user_id,
          name: profile.displayName || review.user_name || emailName || 'Anonymous User',
          profileImage: profile.avatarUrl || null
        }
      };
    });

    return NextResponse.json({ reviews: processedData });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.next();
    const supabase = await getServerClient(request, response);
    const body = await request.json();
    const { restaurant_id, rating, comment, amount_spent } = body;

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

    if (amount_spent !== undefined && (amount_spent <= 0 || isNaN(amount_spent))) {
      return NextResponse.json(
        { error: 'Amount spent must be greater than 0' },
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

    // Get user's profile data from profiles table
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('display_name, avatar_url')
      .eq('user_id', user.id)
      .single();

    const userDisplayName = (!profileError && (userProfile as any)?.display_name) ? (userProfile as any).display_name : (user.email?.split('@')[0] || 'Anonymous User');
    const userProfileImage = (!profileError && (userProfile as any)?.avatar_url) ? (userProfile as any).avatar_url : null;

    // Create the review
    const { data, error } = await (supabase as any)
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
      return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
    }

    // Update restaurant rating after successful review creation
    await updateRestaurantRating(restaurant_id);

    // Transform user data using display_name from profiles table
    const processedData = {
      ...(data as any),
      user: {
        id: user.id,
        name: userDisplayName,
        profileImage: userProfileImage
      }
    };

    return NextResponse.json({ review: processedData }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
