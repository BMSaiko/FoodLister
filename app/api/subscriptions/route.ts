import { NextRequest, NextResponse } from 'next/server';
import { getServerClient } from '@/libs/supabase/server';
import {
  createStripeCustomer,
  createCheckoutSession,
} from '@/libs/stripe';
import { getErrorMessage } from '@/types/api';
import type { ApiErrorType } from '@/types/api';

// GET - Get user's subscription and available plans
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

    // Get user's subscription
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        plan:subscription_plans(*)
      `)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle();

    // Get available plans
    const { data: plans } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    return NextResponse.json({
      subscription: subscription || null,
      plans: plans || [],
    });
  } catch (error) {
    console.error('Error in subscriptions GET:', error);
    const errorType = 'INTERNAL_ERROR' as ApiErrorType;
    return NextResponse.json({ error: getErrorMessage(errorType), code: errorType }, { status: 500 });
  }
}

// POST - Create Stripe checkout session
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
    const { planId, interval } = body;

    if (!planId || !interval) {
      const errorType = 'VALIDATION_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: 'planId and interval are required', code: errorType },
        { status: 400 }
      );
    }

    // Get the plan
    const { data: plan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .eq('is_active', true)
      .single();

    if (planError || !plan) {
      const errorType = 'NOT_FOUND' as ApiErrorType;
      return NextResponse.json({ error: 'Plan not found', code: errorType }, { status: 404 });
    }

    // Get or create Stripe customer
    let stripeCustomerId: string;
    const { data: existingSub } = await supabase
      .from('user_subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (existingSub?.stripe_customer_id) {
      stripeCustomerId = existingSub.stripe_customer_id;
    } else {
      stripeCustomerId = await createStripeCustomer(
        user.email!,
        user.user_metadata?.display_name || user.user_metadata?.name
      );
    }

    // Determine which price ID to use
    const priceId = interval === 'yearly' ? plan.stripe_price_yearly_id : plan.stripe_price_monthly_id;

    if (!priceId) {
      const errorType = 'INTERNAL_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: 'Stripe price not configured for this plan', code: errorType },
        { status: 500 }
      );
    }

    // Create checkout session
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const checkoutUrl = await createCheckoutSession(
      stripeCustomerId,
      priceId,
      `${baseUrl}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
      `${baseUrl}/subscribe/canceled`,
      user.id
    );

    return NextResponse.json({ url: checkoutUrl });
  } catch (error) {
    console.error('Error in subscriptions POST:', error);
    const errorType = 'INTERNAL_ERROR' as ApiErrorType;
    return NextResponse.json({ error: getErrorMessage(errorType), code: errorType }, { status: 500 });
  }
}
