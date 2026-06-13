import { NextRequest, NextResponse } from 'next/server';
import { getServerClient } from '@/libs/supabase/server';
import { getErrorMessage } from '@/types/api';
import type { ApiErrorType } from '@/types/api';

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
      .from('notification_preferences')
      .select('email_notifications, push_notifications, meal_invitations, collaborator_updates, list_activity, system_updates, weekly_digest')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching notification preferences:', error);
      const errorType = 'DATABASE_ERROR' as ApiErrorType;
      return NextResponse.json({ error: getErrorMessage(errorType), code: errorType }, { status: 500 });
    }

    // Return defaults if no preferences exist yet
    if (!data || error?.code === 'PGRST116') {
      return NextResponse.json({
        data: {
          email_notifications: true,
          push_notifications: false,
          meal_invitations: true,
          collaborator_updates: true,
          list_activity: true,
          system_updates: true,
          weekly_digest: false,
        }
      });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in notification preferences GET:', error);
    const errorType = 'INTERNAL_ERROR' as ApiErrorType;
    return NextResponse.json({ error: getErrorMessage(errorType), code: errorType }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
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

    // Upsert preferences
    const { data, error } = await supabase
      .from('notification_preferences')
      .upsert({
        user_id: user.id,
        email_notifications: body.email_notifications,
        push_notifications: body.push_notifications,
        meal_invitations: body.meal_invitations,
        collaborator_updates: body.collaborator_updates,
        list_activity: body.list_activity,
        system_updates: body.system_updates,
        weekly_digest: body.weekly_digest,
      })
      .select()
      .single();

    if (error) {
      console.error('Error upserting notification preferences:', error);
      const errorType = 'DATABASE_ERROR' as ApiErrorType;
      return NextResponse.json({ error: getErrorMessage(errorType), code: errorType }, { status: 500 });
    }

    return NextResponse.json({ data, message: 'Preferências atualizadas com sucesso' });
  } catch (error) {
    console.error('Error in notification preferences PUT:', error);
    const errorType = 'INTERNAL_ERROR' as ApiErrorType;
    return NextResponse.json({ error: getErrorMessage(errorType), code: errorType }, { status: 500 });
  }
}
