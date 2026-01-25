import { NextRequest, NextResponse } from 'next/server';
import { getServerClient } from '@/libs/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const response = new NextResponse();
    const supabase = await getServerClient(request, response);
    
    if (!supabase) {
      return NextResponse.json(
        { error: 'Failed to initialize Supabase client' },
        { status: 500 }
      );
    }
    
    // Get the authenticated user
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get session information
    const { data: session, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('Error fetching session:', sessionError);
      return NextResponse.json(
        { error: 'Failed to fetch session' },
        { status: 500 }
      );
    }

    // Return session data
    return NextResponse.json({
      access_token: session.session?.access_token || null,
      refresh_token: session.session?.refresh_token || null,
      expires_in: session.session?.expires_in || null,
      expires_at: session.session?.expires_at || null,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        app_metadata: user.app_metadata,
        user_metadata: user.user_metadata,
        created_at: user.created_at,
        updated_at: user.updated_at
      }
    });

  } catch (error) {
    console.error('Error in auth session GET:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}