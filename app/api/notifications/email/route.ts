import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/libs/supabase/admin';
import type { ApiErrorType } from '@/types/api';
import { getErrorMessage } from '@/types/api';

/**
 * Send email notification via Supabase Auth or external email service.
 * This endpoint is called internally by other APIs to trigger email notifications.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, type, title, message } = body;

    if (!userId || !type || !title || !message) {
      const errorType = 'VALIDATION_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: 'Missing required fields: userId, type, title, message', code: errorType },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    if (!supabase) {
      const errorType = 'INTERNAL_ERROR' as ApiErrorType;
      return NextResponse.json({ error: 'Service unavailable', code: errorType }, { status: 500 });
    }

    // Get user email
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('user_id', userId)
      .single();

    // Get user auth email
    const { data: authUser } = await supabase.auth.admin.getUserById(userId);
    const email = authUser?.user?.email;

    if (!email) {
      return NextResponse.json({ error: 'User email not found' }, { status: 404 });
    }

    // For now, create an in-app notification as well
    await supabase.from('notifications').insert({
      user_id: userId,
      type: `${type}_email`,
      title,
      message,
      read: false,
    });

    // TODO: Integrate with email service (e.g., Resend, SendGrid, Supabase Edge Functions)
    // Example with Resend:
    // await resend.emails.send({
    //   from: 'noreply@foodlister.app',
    //   to: email,
    //   subject: title,
    //   html: `<p>Hello ${profile?.display_name},</p><p>${message}</p>`,
    // });

    return NextResponse.json({
      success: true,
      message: 'Notification created. Email integration pending.',
    });
  } catch (error) {
    console.error('Error sending email notification:', error);
    const errorType = 'INTERNAL_ERROR' as ApiErrorType;
    return NextResponse.json({ error: getErrorMessage(errorType), code: errorType }, { status: 500 });
  }
}
