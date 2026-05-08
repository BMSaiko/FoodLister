import { NextRequest, NextResponse } from 'next/server';
import { getPublicServerClient, getServerClient } from '@/libs/supabase/server';
import { getErrorMessage } from '@/types/api';
import type { ApiErrorType } from '@/types/api';

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
    
    // Fetch all restaurant features
    const { data, error } = await supabase
      .from('restaurant_features')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching features:', error);
      const errorType = 'DATABASE_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: data || [],
      total: data?.length || 0
    });
    } catch (error) {
    console.error('Server error fetching features:', error);
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

    // Check if feature already exists
    const { data: existingFeature } = await supabase
      .from('restaurant_features')
      .select('id')
      .eq('name', name.trim())
      .single();

    if (existingFeature) {
      const errorType = 'VALIDATION_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 409 }
      );
    }

    // Insert new feature
    const { data, error } = await supabase
      .from('restaurant_features')
      .insert({
        name: name.trim(),
        description: description?.trim(),
        icon: icon?.trim()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating feature:', error);
      const errorType = 'DATABASE_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data,
      message: 'Feature created successfully'
    });
    } catch (error) {
    console.error('Server error creating feature:', error);
    const errorType = 'INTERNAL_ERROR' as ApiErrorType;
    return NextResponse.json(
      { error: getErrorMessage(errorType), code: errorType },
      { status: 500 }
    );
  }
}