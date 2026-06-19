import { NextRequest, NextResponse } from 'next/server';
import { getServerClient } from '@/libs/supabase/server';
import { cancelSubscriptionAtPeriodEnd, cancelSubscriptionImmediately } from '@/libs/stripe';
import { getErrorMessage } from '@/types/api';
import type { ApiErrorType } from '@/types/api';

// PUT - Cancel subscription at period end
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const { id } = await params;

    // Get the subscription
    const { data: subscription, error: subError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (subError || !subscription) {
      const errorType = 'NOT_FOUND' as ApiErrorType;
      return NextResponse.json({ error: 'Subscription not found', code: errorType }, { status: 404 });
    }

    if (subscription.stripe_subscription_id) {
      await cancelSubscriptionAtPeriodEnd(subscription.stripe_subscription_id);
    }

    // Update local record
    const { data: updated, error: updateError } = await supabase
      .from('user_subscriptions')
      .update({
        cancel_at_period_end: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating subscription:', updateError);
      const errorType = 'DATABASE_ERROR' as ApiErrorType;
      return NextResponse.json({ error: getErrorMessage(errorType), code: errorType }, { status: 500 });
    }

    return NextResponse.json({ data: updated, message: 'Subscription will be canceled at period end' });
  } catch (error) {
    console.error('Error in subscriptions PUT:', error);
    const errorType = 'INTERNAL_ERROR' as ApiErrorType;
    return NextResponse.json({ error: getErrorMessage(errorType), code: errorType }, { status: 500 });
  }
}

// DELETE - Cancel subscription immediately
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const { id } = await params;

    // Get the subscription
    const { data: subscription, error: subError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (subError || !subscription) {
      const errorType = 'NOT_FOUND' as ApiErrorType;
      return NextResponse.json({ error: 'Subscription not found', code: errorType }, { status: 404 });
    }

    if (subscription.stripe_subscription_id) {
      await cancelSubscriptionImmediately(subscription.stripe_subscription_id);
    }

    // Update local record
    const { error: updateError } = await supabase
      .from('user_subscriptions')
      .update({
        status: 'canceled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateError) {
      console.error('Error canceling subscription:', updateError);
      const errorType = 'DATABASE_ERROR' as ApiErrorType;
      return NextResponse.json({ error: getErrorMessage(errorType), code: errorType }, { status: 500 });
    }

    // Downgrade user to free tier
    await supabase
      .from('profiles')
      .update({
        subscription_tier: 'free',
        subscription_expires_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    return NextResponse.json({ success: true, message: 'Subscription canceled' });
  } catch (error) {
    console.error('Error in subscriptions DELETE:', error);
    const errorType = 'INTERNAL_ERROR' as ApiErrorType;
    return NextResponse.json({ error: getErrorMessage(errorType), code: errorType }, { status: 500 });
  }
}
