// app/api/restaurants/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerClient, getPublicServerClient } from '@/libs/supabase/server';

interface Restaurant {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  price_per_person?: number;
  rating?: number;
  location?: string;
  source_url?: string;
  creator?: string;
  menu_url?: string;
  menu_links?: string[];
  menu_images?: string[];
  phone_numbers?: string[];
  visited: boolean;
  created_at: string;
  updated_at: string;
  creator_id?: string;
  creator_name?: string;
  cuisine_types?: any[];
  review_count?: number;
  latitude?: number;
  longitude?: number;
}

// Valida se as coordenadas são válidas
function isValidCoordinates(latitude: number, longitude: number): boolean {
  return (
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    !isNaN(latitude) &&
    !isNaN(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

export async function GET(request: NextRequest) {
  const response = NextResponse.next();
  try {
    const supabase = await getServerClient(request, response);
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    // For unauthenticated requests, use public client that can access all restaurants
    let client = supabase;
    if (!supabase) {
      // Create a public client for unauthenticated access
      const publicClient = await getPublicServerClient();
      if (!publicClient) {
        return NextResponse.json({ error: 'Failed to initialize database connection' }, { status: 500 });
      }
      client = publicClient;
    }

    if (!client) {
      return NextResponse.json({ error: 'Failed to initialize database connection' }, { status: 500 });
    }

    let query = client
      .from('restaurants')
      .select(`
        *,
        cuisine_types:restaurant_cuisine_types(
          cuisine_type:cuisine_types(*)
        ),
        reviews:reviews(count)
      `, { count: 'exact' })
      .order('rating', { ascending: false })
      .order('created_at', { ascending: false });

    // Add search filter if provided
    if (search && search.trim()) {
      query = query.ilike('name', `%${search.trim()}%`);
    }

    const { data: restaurantsData, error: restaurantsError, count: totalCount } = await query;

    if (restaurantsError) {
      console.error('Error fetching restaurants:', restaurantsError);
      return NextResponse.json({ error: 'Failed to fetch restaurants' }, { status: 500 });
    }

    // Transform data for easier client consumption
    const restaurants: Restaurant[] = (restaurantsData || []).map((restaurant: any) => ({
      ...restaurant,
      cuisine_types: restaurant.cuisine_types
        ? restaurant.cuisine_types.map((relation: any) => relation.cuisine_type)
        : [],
      review_count: restaurant.reviews?.[0]?.count || 0
    }));

    return NextResponse.json(
      {
        restaurants
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (error) {
    console.error('Unexpected error in restaurants API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const response = NextResponse.next();
  try {
    const supabase = await getServerClient(request, response);

    if (!supabase) {
      return NextResponse.json({ error: 'Failed to initialize database connection' }, { status: 500 });
    }

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      description,
      image_url,
      images,
      display_image_index,
      location,
      source_url,
      menu_links,
      menu_images,
      phone_numbers,
      latitude,
      longitude
    } = body;

    // Basic validation
    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: 'Restaurant name is required' }, { status: 400 });
    }

    // Validate coordinates if provided
    let validatedLatitude = null;
    let validatedLongitude = null;

    if (latitude !== undefined && longitude !== undefined) {
      if (!isValidCoordinates(latitude, longitude)) {
        return NextResponse.json({ error: 'Invalid coordinates provided' }, { status: 400 });
      }
      validatedLatitude = latitude;
      validatedLongitude = longitude;
    } else if (latitude !== undefined || longitude !== undefined) {
      return NextResponse.json({ error: 'Both latitude and longitude must be provided together' }, { status: 400 });
    }

    // Get user display name from profiles table or email
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('user_id', user.id)
      .single();

    const displayName = (!profileError && profileData?.display_name) ? profileData.display_name : user.email;

    // Create the restaurant with coordinates validation
    const { data: restaurantData, error: restaurantError } = await supabase
      .from('restaurants')
      .insert({
        name: name.trim(),
        description: description || null,
        image_url: image_url || null,
        images: images || [],
        display_image_index: display_image_index || -1,
        location: location || null,
        source_url: source_url || null,
        menu_links: menu_links || [],
        menu_images: menu_images || [],
        phone_numbers: phone_numbers || [],
        latitude: validatedLatitude,
        longitude: validatedLongitude,
        creator_id: user.id,
        creator_name: displayName
      })
      .select()
      .single();

    if (restaurantError) {
      console.error('Error creating restaurant:', restaurantError);
      return NextResponse.json({ error: 'Failed to create restaurant' }, { status: 500 });
    }

    return NextResponse.json({ restaurant: restaurantData }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error in restaurant creation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
