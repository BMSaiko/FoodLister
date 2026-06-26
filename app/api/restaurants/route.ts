// app/api/restaurants/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerClient, getPublicServerClient } from '@/libs/supabase/server';
import { getErrorMessage } from '@/types/api';
import type { ApiErrorType } from '@/types/api';
import { cacheOrSet } from '@/libs/cache';
import type { Database } from '@/types/database';
import type { RestaurantSortBy, SortDirection } from '@/libs/search';

type DbRestaurant = Database['public']['Tables']['restaurants']['Row'];

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
  created_at: string;
  updated_at: string;
  creator_id?: string;
  creator_name?: string;
  cuisine_types?: Array<{ id: string; name: string; icon?: string }>;
  features?: Array<{ id: string; name: string; icon?: string }>;
  dietary_options?: Array<{ id: string; name: string }>;
  review_count?: number;
  latitude?: number;
  longitude?: number;
  opening_hours?: string | null;
}

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

function isCurrentlyOpen(openingHours: string | null): boolean | null {
  if (!openingHours) return null;
  try {
    const hours = JSON.parse(openingHours);
    const now = new Date();
    const dayNames = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
    const today = dayNames[now.getDay()];
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const todayHours = hours[today];
    if (!todayHours || todayHours.length === 0) return false;
    for (const slot of todayHours) {
      const [openH, openM] = slot.open.split(':').map(Number);
      const [closeH, closeM] = slot.close.split(':').map(Number);
      if (currentTime >= openH * 60 + openM && currentTime <= closeH * 60 + closeM) return true;
    }
    return false;
  } catch { return null; }
}

export async function GET(request: NextRequest) {
  const response = NextResponse.next();
  try {
    const supabase = await getServerClient(request, response);
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const openNowParam = searchParams.get('open_now');
    const priceMin = searchParams.get('price_min');
    const priceMax = searchParams.get('price_max');
    const sortByParam = (searchParams.get('sort_by') || 'name') as RestaurantSortBy;
    const sortDirectionParam = (searchParams.get('sort_direction') || 'asc') as SortDirection;
    let client = supabase;
    if (!supabase) {
      const publicClient = await getPublicServerClient();
      if (!publicClient) {
        const errorType = 'INTERNAL_ERROR' as ApiErrorType;
        return NextResponse.json({ error: getErrorMessage(errorType), code: errorType }, { status: 500 });
      }
      client = publicClient;
    }
    if (!client) {
      const errorType = 'INTERNAL_ERROR' as ApiErrorType;
      return NextResponse.json({ error: getErrorMessage(errorType), code: errorType }, { status: 500 });
    }
    const baseColumns =
      'id, name, description, image_url, price_per_person, rating, location, ' +
      'source_url, creator, menu_url, menu_links, menu_images, phone_numbers, ' +
      'created_at, creator_id, creator_name, latitude, ' +
      'longitude, images, display_image_index, ' +
      'cuisine_types:restaurant_cuisine_types(cuisine_type:cuisine_types(id, name, icon)), ' +
      'features:restaurant_restaurant_features(feature:restaurant_features(id, name, icon)), ' +
      'dietary_options:restaurant_dietary_options_junction(dietary_option:restaurant_dietary_options(id, name, icon)), ' +
      'reviews:reviews(count)';
    // Try with new columns first; fall back to base columns if migration 050 not yet applied
    let query = client.from('restaurants').select(baseColumns + ', updated_at, opening_hours', { count: 'exact' });
    if (search && search.trim()) query = query.ilike('name', '%' + search.trim() + '%');
    if (priceMin !== null) { const v = parseFloat(priceMin); if (!isNaN(v) && v >= 0) query = query.gte('price_per_person', v); }
    if (priceMax !== null) { const v = parseFloat(priceMax); if (!isNaN(v) && v >= 0) query = query.lte('price_per_person', v); }
    const sortColMap: Record<string, string> = { rating: 'rating', price: 'price_per_person', name: 'name', review_count: 'review_count' };
    query = query.order(sortColMap[sortByParam] || 'name', { ascending: sortDirectionParam !== 'desc' });
    let { data: restaurantsData, error: restaurantsError } = await query;
    // Fallback: retry without updated_at/opening_hours if migration 050 not applied
    if (restaurantsError && restaurantsError.code === '42703') {
      console.warn('Missing column in restaurants (migration 050 not applied), retrying without it:', restaurantsError.message);
      const fallbackQuery = client.from('restaurants').select(baseColumns, { count: 'exact' });
      if (search && search.trim()) fallbackQuery.ilike('name', '%' + search.trim() + '%');
      if (priceMin !== null) { const v = parseFloat(priceMin); if (!isNaN(v) && v >= 0) fallbackQuery.gte('price_per_person', v); }
      if (priceMax !== null) { const v = parseFloat(priceMax); if (!isNaN(v) && v >= 0) fallbackQuery.lte('price_per_person', v); }
      const sortColMapFallback: Record<string, string> = { rating: 'rating', price: 'price_per_person', name: 'name' };
      fallbackQuery.order(sortColMapFallback[sortByParam] || 'name', { ascending: sortDirectionParam !== 'desc' });
      const fallbackResult = await fallbackQuery;
      restaurantsData = fallbackResult.data;
      restaurantsError = fallbackResult.error;
    }
    if (restaurantsError) {
      console.error('Error fetching restaurants:', restaurantsError);
      const errorType = 'DATABASE_ERROR' as ApiErrorType;
      return NextResponse.json({ error: getErrorMessage(errorType), code: errorType }, { status: 500 });
    }
    let restaurants: Restaurant[] = (restaurantsData || []).map((r: any) => ({
      id: r.id, name: r.name, description: r.description, image_url: r.image_url,
      price_per_person: r.price_per_person, rating: r.rating, location: r.location,
      source_url: r.source_url, creator: r.creator, menu_url: r.menu_url,
      menu_links: r.menu_links || [], menu_images: r.menu_images || [],
      phone_numbers: r.phone_numbers || [],
      created_at: r.created_at, updated_at: r.updated_at || r.created_at,
      creator_id: r.creator_id, creator_name: r.creator_name,
      cuisine_types: r.cuisine_types?.map((x: any) => x.cuisine_type).filter(Boolean) || [],
      features: r.features?.map((x: any) => x.feature).filter(Boolean) || [],
      dietary_options: r.dietary_options?.map((x: any) => x.dietary_option).filter(Boolean) || [],
      review_count: r.reviews?.[0]?.count || 0,
      latitude: r.latitude, longitude: r.longitude, opening_hours: r.opening_hours || null,
    }));
    if (openNowParam === 'true') {
      restaurants = restaurants.filter((r) => r.opening_hours && isCurrentlyOpen(r.opening_hours) === true);
    } else if (openNowParam === 'false') {
      restaurants = restaurants.filter((r) => r.opening_hours && isCurrentlyOpen(r.opening_hours) === false);
    }
    return NextResponse.json(
      { restaurants, meta: { count: restaurants.length, filters: {
        search: search || null, open_now: openNowParam,
        price_min: priceMin ? parseFloat(priceMin) : null,
        price_max: priceMax ? parseFloat(priceMax) : null,
        sort_by: sortByParam, sort_direction: sortDirectionParam,
      }}},
      { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } }
    );
  } catch (error) {
    console.error('Unexpected error in restaurants API:', error);
    const errorType = 'INTERNAL_ERROR' as ApiErrorType;
    return NextResponse.json({ error: getErrorMessage(errorType), code: errorType }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const response = NextResponse.next();
  try {
    const supabase = await getServerClient(request, response);
    if (!supabase) {
      const errorType = 'INTERNAL_ERROR' as ApiErrorType;
      return NextResponse.json({ error: getErrorMessage(errorType), code: errorType }, { status: 500 });
    }
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      const errorType = 'AUTHENTICATION_ERROR' as ApiErrorType;
      return NextResponse.json({ error: getErrorMessage(errorType), code: errorType }, { status: 401 });
    }
    const body = await request.json();
    const { name, description, image_url, images, display_image_index, location,
      source_url, menu_links, menu_images, phone_numbers, latitude, longitude, opening_hours } = body;
    if (!name || name.trim().length === 0) {
      const errorType = 'VALIDATION_ERROR' as ApiErrorType;
      return NextResponse.json({ error: getErrorMessage(errorType), code: errorType }, { status: 400 });
    }
    let validatedLatitude = null;
    let validatedLongitude = null;
    if (latitude !== undefined && longitude !== undefined) {
      if (!isValidCoordinates(latitude, longitude)) {
        const errorType = 'VALIDATION_ERROR' as ApiErrorType;
        return NextResponse.json({ error: getErrorMessage(errorType), code: errorType }, { status: 400 });
      }
      validatedLatitude = latitude;
      validatedLongitude = longitude;
    } else if (latitude !== undefined || longitude !== undefined) {
      const errorType = 'VALIDATION_ERROR' as ApiErrorType;
      return NextResponse.json({ error: getErrorMessage(errorType), code: errorType }, { status: 400 });
    }
    const { data: profileData, error: profileError } = await supabase
      .from('profiles').select('display_name').eq('user_id', user.id).single();
    const displayName = (!profileError && profileData?.display_name) ? profileData.display_name : user.email;
    const { data: restaurantData, error: restaurantError } = await supabase
      .from('restaurants').insert({
        name: name.trim(), description: description || null, image_url: image_url || null,
        images: images || [], display_image_index: display_image_index || -1,
        location: location || null, source_url: source_url || null,
        menu_links: menu_links || [], menu_images: menu_images || [],
        phone_numbers: phone_numbers || [], latitude: validatedLatitude,
        longitude: validatedLongitude, opening_hours: opening_hours || null,
        creator_id: user.id, creator_name: displayName,
      }).select().single();
    if (restaurantError) {
      console.error('Error creating restaurant:', restaurantError);
      const errorType = 'DATABASE_ERROR' as ApiErrorType;
      return NextResponse.json({ error: getErrorMessage(errorType), code: errorType }, { status: 500 });
    }
    return NextResponse.json({ restaurant: restaurantData }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error in restaurant creation:', error);
    const errorType = 'INTERNAL_ERROR' as ApiErrorType;
    return NextResponse.json({ error: getErrorMessage(errorType), code: errorType }, { status: 500 });
  }
}
