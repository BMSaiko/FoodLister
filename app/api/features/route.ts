import { NextRequest, NextResponse } from 'next/server';
import { getPublicServerClient, getServerClient } from '@/libs/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = await getPublicServerClient();
    
    if (!supabase) {
      return NextResponse.json({ error: 'Failed to initialize database connection' }, { status: 500 });
    }
    
    // Fetch all restaurant features
    const { data, error } = await supabase
      .from('restaurant_features')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching features:', error);
      return NextResponse.json(
        { error: 'Failed to fetch features' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: data || [],
      total: data?.length || 0
    });
  } catch (error) {
    console.error('Server error fetching features:', error);
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
    
    // Check if user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, description, icon } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Feature name is required' },
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
      return NextResponse.json(
        { error: 'Feature with this name already exists' },
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
      return NextResponse.json(
        { error: 'Failed to create feature' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data,
      message: 'Feature created successfully'
    });
  } catch (error) {
    console.error('Server error creating feature:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}