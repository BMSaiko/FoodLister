-- Create subscription plans table
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price_monthly numeric NOT NULL,
  price_yearly numeric,
  currency text DEFAULT 'EUR',
  features text[],
  stripe_price_monthly_id text,
  stripe_price_yearly_id text,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT subscription_plans_pkey PRIMARY KEY (id)
);

COMMENT ON TABLE public.subscription_plans IS 'Available subscription plans';

-- Create user subscriptions table
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES public.subscription_plans(id),
  status text NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')),
  stripe_subscription_id text UNIQUE,
  stripe_customer_id text,
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  cancel_at_period_end boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone,
  CONSTRAINT user_subscriptions_pkey PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON public.user_subscriptions(status);

-- Add subscription fields to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS subscription_tier text DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium', 'pro')),
  ADD COLUMN IF NOT EXISTS subscription_expires_at timestamp with time zone;

-- Enable RLS
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies for subscription_plans (public read)
CREATE POLICY "Anyone can view active subscription plans"
  ON public.subscription_plans FOR SELECT
  USING (is_active = true);

-- Policies for user_subscriptions
CREATE POLICY "Users can view their own subscriptions"
  ON public.user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions"
  ON public.user_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions"
  ON public.user_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_user_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_subscriptions_updated_at();

-- Insert default plans
INSERT INTO public.subscription_plans (name, description, price_monthly, price_yearly, features, sort_order) VALUES
  ('Free', 'Plano gratuito para começar', 0, 0, ARRAY['5 lists', '20 restaurants', 'Basic filters'], 0),
  ('Premium', 'Para utilizadores que querem mais', 4.99, 49.99, ARRAY['Unlimited lists', 'Unlimited restaurants', 'Advanced filters', 'Priority support', 'No ads'], 1),
  ('Pro', 'Para power users e equipas', 9.99, 99.99, ARRAY['Everything in Premium', 'AI recommendations', 'Collaborative lists (10 members)', 'Advanced analytics', 'Early access', 'Dedicated support'], 2)
ON CONFLICT DO NOTHING;
