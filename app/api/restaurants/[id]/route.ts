// app/api/restaurants/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getClient } from '@/libs/supabase/client';
import { getServerClient } from '@/libs/supabase/server';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const response = NextResponse.next();
    const supabase = await getServerClient(request, response);
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'Restaurant ID is required' }, { status: 400 });
    }

    // Fetch restaurant details
    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .select('*')
      .eq('id', id)
      .single();

    if (restaurantError) {
      console.error('Error fetching restaurant:', restaurantError);

      // Check if the table doesn't exist (migration not run)
      if (restaurantError.code === '42P01') {
        return NextResponse.json({
          error: 'Restaurants table not found. Please run the database migration first.',
          details: 'Execute supabase/migrations/000_create_core_tables.sql in your Supabase SQL Editor'
        }, { status: 500 });
      }

      return NextResponse.json({ error: 'Failed to fetch restaurant', details: restaurantError.message }, { status: 500 });
    }

    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
    }

    return NextResponse.json({ restaurant });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const response = NextResponse.next();
    const supabase = await getServerClient(request, response);
    const { id } = await params;
    const body = await request.json();
    const { rating } = body;

    if (!id) {
      return NextResponse.json({ error: 'Restaurant ID is required' }, { status: 400 });
    }

    if (rating === undefined) {
      return NextResponse.json({ error: 'Rating is required' }, { status: 400 });
    }

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Check if user owns the restaurant or is an admin
    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .select('creator_id')
      .eq('id', id)
      .single();

    if (restaurantError) {
      console.error('Error checking restaurant ownership:', restaurantError);
      return NextResponse.json({ error: 'Failed to verify restaurant ownership' }, { status: 500 });
    }

    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
    }

    // Only allow rating updates (not ownership changes)
    const { data, error } = await supabase
      .from('restaurants')
      .update({
        rating: rating
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating restaurant rating:', error);
      return NextResponse.json({ error: 'Failed to update restaurant rating' }, { status: 500 });
    }

    return NextResponse.json({ restaurant: data });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const response = NextResponse.next();
    const supabase = await getServerClient(request, response);
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'Restaurant ID is required' }, { status: 400 });
    }

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Check if user owns the restaurant or is an admin
    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .select('creator_id')
      .eq('id', id)
      .single();

    if (restaurantError) {
      console.error('Error checking restaurant ownership:', restaurantError);
      return NextResponse.json({ error: 'Failed to verify restaurant ownership' }, { status: 500 });
    }

    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
    }

    // Only allow the creator to delete the restaurant
    if (restaurant.creator_id !== user.id) {
      return NextResponse.json({ error: 'You can only delete restaurants you created' }, { status: 403 });
    }

    // Delete the restaurant
    const { error } = await supabase
      .from('restaurants')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting restaurant:', error);
      return NextResponse.json({ error: 'Failed to delete restaurant' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Restaurant deleted successfully' });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}