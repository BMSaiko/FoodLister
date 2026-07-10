import { NextRequest, NextResponse } from 'next/server';
import { getServerClient } from '@/libs/supabase/server';
import { getErrorMessage } from '@/types/api';
import type { ApiErrorType } from '@/types/api';

export const dynamic = 'force-dynamic';

// PUT - Update a campaign (owner only)
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const response = new NextResponse();
    const supabase = (await getServerClient(request, response)) as any;
    if (!supabase) {
      return NextResponse.json({ error: getErrorMessage('AUTHENTICATION_ERROR'), code: 'AUTHENTICATION_ERROR' }, { status: 401 });
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: getErrorMessage('AUTHENTICATION_ERROR'), code: 'AUTHENTICATION_ERROR' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, status, startDate, endDate, budget, targetPlatforms } = body;

    const { data, error } = await supabase
      .from('marketing_campaigns')
      .update({
        name,
        description,
        status,
        start_date: startDate,
        end_date: endDate,
        budget,
        target_platforms: targetPlatforms,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating campaign:', error);
      return NextResponse.json({ error: getErrorMessage('DATABASE_ERROR' as ApiErrorType), code: 'DATABASE_ERROR' }, { status: 500 });
    }
    return NextResponse.json({ data, message: 'Campaign updated successfully' });
  } catch (error: any) {
    console.error('Campaign update error:', error?.message || error);
    return NextResponse.json({ error: error.message || 'Internal server error', code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

// DELETE - Delete a campaign (owner only)
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const response = new NextResponse();
    const supabase = (await getServerClient(request, response)) as any;
    if (!supabase) {
      return NextResponse.json({ error: getErrorMessage('AUTHENTICATION_ERROR'), code: 'AUTHENTICATION_ERROR' }, { status: 401 });
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: getErrorMessage('AUTHENTICATION_ERROR'), code: 'AUTHENTICATION_ERROR' }, { status: 401 });
    }

    const { error } = await supabase
      .from('marketing_campaigns')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting campaign:', error);
      return NextResponse.json({ error: getErrorMessage('DATABASE_ERROR' as ApiErrorType), code: 'DATABASE_ERROR' }, { status: 500 });
    }
    return NextResponse.json({ message: 'Campaign deleted successfully' });
  } catch (error: any) {
    console.error('Campaign delete error:', error?.message || error);
    return NextResponse.json({ error: error.message || 'Internal server error', code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
