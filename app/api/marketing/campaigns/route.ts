import { NextRequest, NextResponse } from 'next/server';
import { getServerClient } from '@/libs/supabase/server';
import { getErrorMessage } from '@/types/api';
import type { ApiErrorType } from '@/types/api';

// GET - List user's campaigns
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
      .from('marketing_campaigns')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching campaigns:', error);
      const errorType = 'DATABASE_ERROR' as ApiErrorType;
      return NextResponse.json({ error: getErrorMessage(errorType), code: errorType }, { status: 500 });
    }

    return NextResponse.json({ data: data || [] });
  } catch (error) {
    console.error('Error in campaigns GET:', error);
    const errorType = 'INTERNAL_ERROR' as ApiErrorType;
    return NextResponse.json({ error: getErrorMessage(errorType), code: errorType }, { status: 500 });
  }
}

// POST - Create a new campaign
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
    const { name, description, startDate, endDate, budget, targetPlatforms } = body;

    if (!name) {
      const errorType = 'VALIDATION_ERROR' as ApiErrorType;
      return NextResponse.json({ error: 'Campaign name is required', code: errorType }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('marketing_campaigns')
      .insert({
        user_id: user.id,
        name,
        description,
        start_date: startDate,
        end_date: endDate,
        budget,
        target_platforms: targetPlatforms,
        status: 'draft',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating campaign:', error);
      const errorType = 'DATABASE_ERROR' as ApiErrorType;
      return NextResponse.json({ error: getErrorMessage(errorType), code: errorType }, { status: 500 });
    }

    return NextResponse.json({ data, message: 'Campaign created successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error in campaigns POST:', error);
    const errorType = 'INTERNAL_ERROR' as ApiErrorType;
    return NextResponse.json({ error: getErrorMessage(errorType), code: errorType }, { status: 500 });
  }
}
