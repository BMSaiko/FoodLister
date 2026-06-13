import { NextRequest, NextResponse } from 'next/server';
import { getServerClient } from '@/libs/supabase/server';
import { getErrorMessage } from '@/types/api';
import type { ApiErrorType } from '@/types/api';
import { generateRestaurantPost, generateWeeklyDigest } from '@/libs/ai';

// GET - List user's posts
export async function GET(request: NextRequest) {
  try {
    const response = new NextResponse();
    const supabase = await getServerClient(request, response) as any;

    if (!supabase) {
      const errorType = 'AUTHENTICATION_ERROR' as ApiErrorType;
      return NextResponse.json({ error: getErrorMessage(errorType), code: errorType }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      const errorType = 'AUTHENTICATION_ERROR' as ApiErrorType;
      return NextResponse.json({ error: getErrorMessage(errorType), code: errorType }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('social_media_posts')
      .select('*')
      .eq('created_by', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching posts:', error);
      const errorType = 'DATABASE_ERROR' as ApiErrorType;
      return NextResponse.json({ error: getErrorMessage(errorType), code: errorType }, { status: 500 });
    }

    return NextResponse.json({ data: data || [] });
  } catch (error) {
    console.error('Error in posts GET:', error);
    const errorType = 'INTERNAL_ERROR' as ApiErrorType;
    return NextResponse.json({ error: getErrorMessage(errorType), code: errorType }, { status: 500 });
  }
}

// POST - Create a post (with optional AI generation)
export async function POST(request: NextRequest) {
  try {
    const response = new NextResponse();
    const supabase = await getServerClient(request, response) as any;

    if (!supabase) {
      const errorType = 'AUTHENTICATION_ERROR' as ApiErrorType;
      return NextResponse.json({ error: getErrorMessage(errorType), code: errorType }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      const errorType = 'AUTHENTICATION_ERROR' as ApiErrorType;
      return NextResponse.json({ error: getErrorMessage(errorType), code: errorType }, { status: 401 });
    }

    const body = await request.json();
    const { campaignId, restaurantId, listId, content, platform, postType, mediaUrls, scheduledFor, aiGenerate } = body;

    if (!platform || (!content && !aiGenerate)) {
      const errorType = 'VALIDATION_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: 'Platform and content (or aiGenerate) are required', code: errorType },
        { status: 400 }
      );
    }

    let finalContent = content;
    let aiPrompt = null;

    // AI content generation
    if (aiGenerate && restaurantId) {
      const { data: restaurant } = await supabase
        .from('restaurants')
        .select('name, rating, location')
        .eq('id', restaurantId)
        .single();

      if (restaurant) {
        const result = await generateRestaurantPost(
          restaurant.name,
          restaurant.rating,
          restaurant.location,
          platform,
          postType || 'restaurant_promo'
        );
        finalContent = result.content;
        aiPrompt = `Generate ${postType || 'restaurant_promo'} for ${restaurant.name} on ${platform}`;
      }
    }

    if (!finalContent) {
      const errorType = 'VALIDATION_ERROR' as ApiErrorType;
      return NextResponse.json({ error: 'Content could not be generated', code: errorType }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('social_media_posts')
      .insert({
        campaign_id: campaignId,
        restaurant_id: restaurantId,
        list_id: listId,
        content: finalContent,
        platform,
        post_type: postType || 'restaurant_promo',
        media_urls: mediaUrls,
        scheduled_for: scheduledFor,
        ai_generated: aiGenerate || false,
        ai_prompt: aiPrompt,
        created_by: user.id,
        status: scheduledFor ? 'scheduled' : 'draft',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating post:', error);
      const errorType = 'DATABASE_ERROR' as ApiErrorType;
      return NextResponse.json({ error: getErrorMessage(errorType), code: errorType }, { status: 500 });
    }

    return NextResponse.json({ data, message: 'Post created successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error in posts POST:', error);
    const errorType = 'INTERNAL_ERROR' as ApiErrorType;
    return NextResponse.json({ error: getErrorMessage(errorType), code: errorType }, { status: 500 });
  }
}
