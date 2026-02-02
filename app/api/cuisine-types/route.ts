import { NextRequest, NextResponse } from 'next/server';
import { getServerClient } from '@/libs/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const response = NextResponse.next();
  try {
    const supabase = await getServerClient(request, response);
    
    if (!supabase) {
      return NextResponse.json({ error: 'Failed to initialize database connection' }, { status: 500 });
    }
    
    // Fetch all cuisine types
    const { data, error } = await supabase
      .from('cuisine_types')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching cuisine types:', error);
      return NextResponse.json(
        { error: 'Failed to fetch cuisine types' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: data || [],
      total: data?.length || 0
    });
  } catch (error) {
    console.error('Server error fetching cuisine types:', error);
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
        { error: 'Cuisine type name is required' },
        { status: 400 }
      );
    }

    // Check if cuisine type already exists
    const { data: existingCuisine } = await supabase
      .from('cuisine_types')
      .select('id')
      .eq('name', name.trim())
      .single();

    if (existingCuisine) {
      return NextResponse.json(
        { error: 'Cuisine type with this name already exists' },
        { status: 409 }
      );
    }

    // Insert new cuisine type
    const { data, error } = await supabase
      .from('cuisine_types')
      .insert({
        name: name.trim(),
        description: description?.trim(),
        icon: icon?.trim()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating cuisine type:', error);
      return NextResponse.json(
        { error: 'Failed to create cuisine type' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data,
      message: 'Cuisine type created successfully'
    });
  } catch (error) {
    console.error('Server error creating cuisine type:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}