import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/libs/supabase/admin';
import { getServerClient } from '@/libs/supabase/server';
import type { ApiErrorType } from '@/types/api';
import { getErrorMessage } from '@/types/api';

/**
 * Save a push notification subscription for the current user.
 */
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
    const { subscription } = body;

    if (!subscription) {
      const errorType = 'VALIDATION_ERROR' as ApiErrorType;
      return NextResponse.json({ error: 'Subscription object required', code: errorType }, { status: 400 });
    }

    // Store subscription in notification_preferences or a dedicated table
    // For now, we store it as JSON in the preferences table
    await supabase
      .from('notification_preferences')
      .upsert({
        user_id: user.id,
        push_subscription: subscription,
      });

    return NextResponse.json({ success: true, message: 'Push subscription saved' });
  } catch (error) {
    console.error('Error saving push subscription:', error);
    const errorType = 'INTERNAL_ERROR' as ApiErrorType;
    return NextResponse.json({ error: getErrorMessage(errorType), code: errorType }, { status: 500 });
  }
}
