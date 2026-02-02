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
    
    // Fetch all dietary options
    const { data, error } = await supabase
      .from('restaurant_dietary_options')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching dietary options:', error);
      return NextResponse.json(
        { error: 'Failed to fetch dietary options' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: data || [],
      total: data?.length || 0
    });
  } catch (error) {
    console.error('Server error fetching dietary options:', error);
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
        { error: 'Dietary option name is required' },
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
      return NextResponse.json(
        { error: 'Dietary option with this name already exists' },
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
      return NextResponse.json(
        { error: 'Failed to create dietary option' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data,
      message: 'Dietary option created successfully'
    });
  } catch (error) {
    console.error('Server error creating dietary option:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}