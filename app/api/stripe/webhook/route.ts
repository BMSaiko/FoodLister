import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/libs/supabase/admin';
import { getStripe, STRIPE_WEBHOOK_SECRET } from '@/libs/stripe';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const sig = request.headers.get('stripe-signature');

    if (!sig) {
      return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
    }

    if (!STRIPE_WEBHOOK_SECRET) {
      console.error('STRIPE_WEBHOOK_SECRET is not configured');
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    let event: Stripe.Event;
    try {
      event = getStripe().webhooks.constructEvent(body, sig, STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const supabase = createAdminClient();
    if (!supabase) {
      console.error('Failed to create admin client');
      return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        if (userId && subscriptionId) {
          // Get subscription details from Stripe
          const subscription = await getStripe().subscriptions.retrieve(subscriptionId) as any;
          const priceId = subscription.items?.data[0]?.price?.id;

          // Find the plan by price ID
          const { data: plan } = await supabase
            .from('subscription_plans')
            .select('*')
            .or(`stripe_price_monthly_id.eq.${priceId},stripe_price_yearly_id.eq.${priceId}`)
            .single();

          if (plan) {
            // Determine tier from plan name
            const tier = plan.name.toLowerCase().includes('pro') ? 'pro'
              : plan.name.toLowerCase().includes('premium') ? 'premium'
              : 'free';

            // Upsert subscription
            const sub = subscription as any;
            await supabase
              .from('user_subscriptions')
              .upsert({
                user_id: userId,
                plan_id: plan.id,
                status: sub.status === 'active' ? 'active' : 'trialing',
                stripe_subscription_id: subscriptionId,
                stripe_customer_id: customerId,
                current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
                current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
                cancel_at_period_end: sub.cancel_at_period_end,
              });

            // Update profile tier
            await supabase
              .from('profiles')
              .update({
                subscription_tier: tier,
                subscription_expires_at: new Date(subscription.current_period_end * 1000).toISOString(),
              })
              .eq('user_id', userId);
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as any;
        const customerId = sub.customer as string;

        // Find subscription by Stripe ID
        const { data: existingSub } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('stripe_subscription_id', sub.id)
          .maybeSingle();

        if (existingSub) {
          await supabase
            .from('user_subscriptions')
            .update({
              status: sub.status === 'active' ? 'active'
                : sub.status === 'canceled' ? 'canceled'
                : sub.status === 'past_due' ? 'past_due'
                : 'trialing',
              current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
              current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
              cancel_at_period_end: sub.cancel_at_period_end,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existingSub.id);

          // If canceled, downgrade to free
          if (sub.status === 'canceled') {
            await supabase
              .from('profiles')
              .update({
                subscription_tier: 'free',
                subscription_expires_at: new Date().toISOString(),
              })
              .eq('user_id', existingSub.user_id);
          }
        }
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        // Find and update subscription
        const { data: sub } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('stripe_customer_id', customerId)
          .maybeSingle();

        if (sub) {
          await supabase
            .from('user_subscriptions')
            .update({
              status: 'active',
              updated_at: new Date().toISOString(),
            })
            .eq('id', sub.id);
        }
        break;
      }

      default:
        console.log(`Unhandled webhook event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error in Stripe webhook:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

// Disable body parsing for webhook
export const config = {
  api: {
    bodyParser: false,
  },
};
