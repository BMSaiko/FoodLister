import { NextRequest, NextResponse } from 'next/server';
import { getPublicServerClient, getServerClient } from '@/libs/supabase/server';
import { getErrorMessage } from '@/types/api';
import type { ApiErrorType } from '@/types/api';
import { cacheOrSet } from '@/libs/cache';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = await getPublicServerClient();
    
    if (!supabase) {
      const errorType = 'DATABASE_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 500 }
      );
    }
    
    // Fetch all dietary options (cached for 5 minutes)
    const data = await cacheOrSet('dietary-options:all', async () => {
      const { data, error } = await supabase
        .from('restaurant_dietary_options')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      return data;
    }, 300);

    return NextResponse.json({
      data: data || [],
      total: data?.length || 0
    });
    } catch (error) {
    console.error('Server error fetching dietary options:', error);
    const errorType = 'INTERNAL_ERROR' as ApiErrorType;
    return NextResponse.json(
      { error: getErrorMessage(errorType), code: errorType },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const response = NextResponse.next();
  try {
    const supabase = await getServerClient(request, response);
    
    if (!supabase) {
      const errorType = 'DATABASE_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 500 }
      );
    }
    
    // Check if user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      const errorType = 'AUTHENTICATION_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, description, icon } = body;

    // Validate required fields
    if (!name) {
      const errorType = 'VALIDATION_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 400 }
      );
    }

    // Check if dietary option already exists
    const { data: existingOption } = await supabase
      .from('restaurant_dietary_options')
      .select('id')
      .eq('name', name.trim())
      .single();

    if (existingOption) {
      const errorType = 'VALIDATION_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 409 }
      );
    }

    // Insert new dietary option
    const { data, error } = await supabase
      .from('restaurant_dietary_options')
      .insert({
        name: name.trim(),
        description: description?.trim(),
        icon: icon?.trim()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating dietary option:', error);
      const errorType = 'DATABASE_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data,
      message: 'Dietary option created successfully'
    });
    } catch (error) {
    console.error('Server error creating dietary option:', error);
    const errorType = 'INTERNAL_ERROR' as ApiErrorType;
    return NextResponse.json(
      { error: getErrorMessage(errorType), code: errorType },
      { status: 500 }
    );
  }
}