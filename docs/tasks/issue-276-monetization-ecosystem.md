# Issue #276: Money - Criar ecosistema de monetização da webapp

**GitHub Issue Link:** https://github.com/BMSaiko/FoodLister/issues/276

**Status:** Pending

---

## Overview:

### Context
FoodLister is a Next.js 15 application with Supabase backend that helps users organize restaurant discoveries through lists, reviews, and collaborative features. Currently, the application operates on a fully free model with no monetization mechanisms in place.

### Why Needed
To sustain development and cover operational costs (Supabase, Cloudinary, hosting), FoodLister needs a monetization ecosystem. This will enable:
- Revenue generation to support ongoing development
- Premium features for power users
- Sustainable growth model
- Competitive positioning in the restaurant discovery market

### How It Fits Into the System
The monetization ecosystem will integrate seamlessly with the existing architecture:
- **Database**: New tables in Supabase for subscriptions, plans, and payment history
- **API Layer**: New endpoints for Stripe webhooks, subscription management
- **UI Components**: Paywall modals, subscription pages, plan comparison
- **Auth Integration**: Subscription status tied to user profiles
- **Feature Gating**: Conditional rendering based on subscription tier

---

## Types:

### Database Schema Changes:

#### 1.1 Create Subscription Plans Table:

```sql
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price_monthly numeric NOT NULL,
  price_yearly numeric,
  currency text DEFAULT 'USD',
  features text[], -- array of feature keys
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT subscription_plans_pkey PRIMARY KEY (id)
);

COMMENT ON TABLE public.subscription_plans IS 'Available subscription plans';
```

#### 1.2 Create User Subscriptions Table:

```sql
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
```

#### 1.3 Add Subscription Fields to Profiles:

```sql
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS subscription_tier text DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium', 'pro')),
  ADD COLUMN IF NOT EXISTS subscription_expires_at timestamp with time zone;
```

### TypeScript Type Updates:

**File**: `types/database.ts`

```typescript
// New tables
subscription_plans: {
  Row: {
    id: string;
    name: string;
    description: string | null;
    price_monthly: number;
    price_yearly: number | null;
    currency: string;
    features: string[] | null;
    is_active: boolean | null;
    sort_order: number | null;
    created_at: string;
  };
  Insert: { /* ... */ };
  Update: { /* ... */ };
}

user_subscriptions: {
  Row: {
    id: string;
    user_id: string;
    plan_id: string;
    status: 'active' | 'canceled' | 'past_due' | 'trialing';
    stripe_subscription_id: string | null;
    stripe_customer_id: string | null;
    current_period_start: string | null;
    current_period_end: string | null;
    cancel_at_period_end: boolean | null;
    created_at: string;
    updated_at: string | null;
  };
  Insert: { /* ... */ };
  Update: { /* ... */ };
}

// Update profiles
profiles: {
  Row: {
    // ... existing fields ...
    subscription_tier: 'free' | 'premium' | 'pro' | null;
    subscription_expires_at: string | null;
  };
  Insert: { /* ... */ };
  Update: { /* ... */ };
}
```

### New Type Definitions (libs/types.ts):

```typescript
export type SubscriptionTier = 'free' | 'premium' | 'pro';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string | null;
  priceMonthly: number;
  priceYearly: number | null;
  currency: string;
  features: string[];
  isActive: boolean;
  sortOrder: number;
}

export interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  stripeSubscriptionId: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  plan?: SubscriptionPlan;
}

export interface FeatureGate {
  feature: string;
  requiredTier: SubscriptionTier;
  currentTier: SubscriptionTier;
  hasAccess: boolean;
}
```

---

## Files:

### New Files to Create:

1. **`supabase/migrations/YYYYMMDDHHMMSS_create_subscription_tables.sql`** - Migration for subscription tables
2. **`app/pricing/page.tsx`** - Pricing page with plan comparison
3. **`app/subscribe/[planId]/page.tsx`** - Subscription checkout page
4. **`app/subscribe/success/page.tsx`** - Post-checkout success page
5. **`app/subscribe/canceled/page.tsx`** - Canceled checkout page
6. **`app/api/stripe/webhook/route.ts`** - Stripe webhook handler
7. **`app/api/subscriptions/route.ts`** - GET (user subscription), POST (create checkout)
8. **`app/api/subscriptions/[id]/route.ts`** - PUT (update), DELETE (cancel)
9. **`components/subscription/PricingCard.tsx`** - Plan card component
10. **`components/subscription/FeatureGate.tsx`** - Gating component
11. **`components/subscription/SubscriptionModal.tsx`** - Paywall modal
12. **`hooks/subscription/useSubscription.ts`** - Subscription hook
13. **`libs/stripe.ts`** - Stripe utilities
14. **`libs/subscription.ts`** - Subscription utilities
15. **`__tests__/api/subscriptions.test.ts`** - API tests
16. **`__tests__/components/subscription/PricingCard.test.tsx`** - Component tests
17. **`__tests__/hooks/subscription/useSubscription.test.ts`** - Hook tests

### Existing Files to Modify:

1. **`libs/api.ts`**
   - Add functions: `getSubscription(userId)`, `createCheckout(planId)`, `cancelSubscription()`
   - Update `getProfile` to return subscription_tier

2. **`contexts/AuthContext.tsx`**
   - Add subscription state to context
   - Add subscription status check on load

3. **`components/layouts/Navbar.jsx`**
   - Add link to `/pricing` page
   - Show subscription badge if premium/pro

4. **`types/database.ts`**
   - Add new tables: `subscription_plans`, `user_subscriptions`
   - Update `profiles` with subscription fields

5. **`libs/types.ts`**
   - Add interfaces: `SubscriptionPlan`, `UserSubscription`, `FeatureGate`

6. **Various feature components**
   - Wrap premium features with `<FeatureGate feature="feature_key">`

### Files to Delete:
- None

---

## Functions:

### New Functions:

1. **`GET /api/subscriptions`** - Get user's subscription
   - Location: `app/api/subscriptions/route.ts`
   - Returns: `UserSubscription | null`

2. **`POST /api/subscriptions`** - Create Stripe checkout session
   - Location: `app/api/subscriptions/route.ts`
   - Body: `{ plan_id: string, interval: 'monthly' | 'yearly' }`
   - Returns: `{ url: string }` (Stripe checkout URL)

3. **`PUT /api/subscriptions/[id]`** - Update subscription (cancel at period end)
   - Location: `app/api/subscriptions/[id]/route.ts`
   - Returns: `UserSubscription`

4. **`DELETE /api/subscriptions/[id]`** - Cancel subscription immediately
   - Location: `app/api/subscriptions/[id]/route.ts`
   - Returns: `{ success: boolean }`

5. **`POST /api/stripe/webhook`** - Handle Stripe webhooks
   - Location: `app/api/stripe/webhook/route.ts`
   - Handles: `checkout.session.completed`, `invoice.paid`, `customer.subscription.updated`, etc.

6. **`getSubscription(): Promise<UserSubscription | null>`**
   - Location: `libs/subscription.ts`
   - Purpose: Get current user's subscription
   - Returns: Promise with subscription or null

7. **`createCheckout(planId: string, interval: 'monthly' | 'yearly'): Promise<string>`**
   - Location: `libs/subscription.ts`
   - Purpose: Create Stripe checkout session
   - Returns: Promise with checkout URL

8. **`useSubscription()`**
   - Location: `hooks/subscription/useSubscription.ts`
   - Returns: `{ subscription, loading, error, createCheckout, cancelSubscription }`
   - Purpose: Hook for managing subscription

9. **`FeatureGate({ feature, children, fallback }: { feature: string, children: React.ReactNode, fallback?: React.ReactNode })`**
   - Location: `components/subscription/FeatureGate.tsx`
   - Purpose: Gate content based on subscription tier
   - Returns: JSX.Element (children or fallback)

### Modified Functions:

1. **`contexts/AuthContext.tsx - AuthProvider`**
   - Add: `subscription` state
   - Add: `checkSubscription()` function
   - Add: Load subscription on user login

---

## Classes:
- None (using hooks and functional components following project pattern)

---

## Dependencies:

### New Packages:
- **`stripe`**: `npm install stripe`
- **`@stripe/stripe-js`**: `npm install @stripe/stripe-js`
- **`next-stripe`** (optional, for easier integration): `npm install next-stripe`

### Environment Variables (`.env.local.example`):
```
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Version Changes:
- No mandatory version changes for existing packages

---

## Testing:

### New Test Files:

1. **`__tests__/api/subscriptions.test.ts`**
   - Test GET (get subscription)
   - Test POST (create checkout)
   - Test webhook handling
   - Mock Stripe SDK

2. **`__tests__/components/subscription/PricingCard.test.tsx`**
   - Test rendering of plan cards
   - Test "Subscribe" button click
   - Test current plan highlighting

3. **`__tests__/components/subscription/FeatureGate.test.tsx`**
   - Test with free tier (no access)
   - Test with premium tier (has access)
   - Test fallback rendering

4. **`__tests__/hooks/subscription/useSubscription.test.ts`**
   - Test hook with active subscription
   - Test hook with no subscription
   - Test createCheckout
   - Mock API

### Existing Test Modifications:
- Update AuthContext tests to cover subscription state
- Update profile tests to cover subscription_tier

---

## Implementation Order:

1. **Database Migration**
   - Create migration `supabase/migrations/YYYYMMDDHHMMSS_create_subscription_tables.sql`
   - Create `subscription_plans` table
   - Create `user_subscriptions` table
   - Add fields to `profiles`
   - Add RLS policies
   - Run migration on Supabase

2. **Update Types**
   - Update `types/database.ts` with new tables
   - Add interfaces to `libs/types.ts`
   - Verify types with `npm run build`

3. **Setup Stripe**
   - Create Stripe account
   - Add environment variables to `.env.local.example`
   - Create products and prices in Stripe dashboard
   - Note: Never edit `.env.local` - only `.env.local.example`

4. **Create Stripe Utilities**
   - Create `libs/stripe.ts`
   - Implement webhook handler logic
   - Test in isolation

5. **Create API Routes**
   - Create `app/api/subscriptions/route.ts`
   - Create `app/api/subscriptions/[id]/route.ts`
   - Create `app/api/stripe/webhook/route.ts`
   - Implement authentication and authorization
   - Test in isolation

6. **Create API Functions**
   - Add functions to `libs/subscription.ts`
   - Follow pattern of existing functions in `libs/api.ts`

7. **Create Custom Hook**
   - Create `hooks/subscription/useSubscription.ts`
   - Follow pattern of existing hooks
   - Test hook in isolation

8. **Create UI Components**
   - Create `PricingCard.tsx` (plan display)
   - Create `FeatureGate.tsx` (access control)
   - Create `SubscriptionModal.tsx` (paywall)
   - Use Tailwind CSS and design system

9. **Create Pages**
   - Create `app/pricing/page.tsx` (plan comparison)
   - Create `app/subscribe/[planId]/page.tsx` (checkout)
   - Create success and canceled pages
   - Add meta tags SEO

10. **Update Navigation**
    - Modify `components/layouts/Navbar.jsx`
    - Add link to `/pricing`
    - Show subscription badge

11. **Implement Feature Gating**
    - Identify premium features
    - Wrap with `<FeatureGate>`
    - Examples: Advanced filters, unlimited lists, priority support

12. **Testing**
    - Create tests for API routes
    - Create tests for new components
    - Create tests for hook
    - Update existing tests
    - Run `npm test`

13. **Final Validation**
    - Run `npm run lint` - 0 errors
    - Run `npm run build` - exit code 0
    - Run `npm test` - all tests pass
    - Commit: `feat(payment): add subscription system with Stripe`

---

## Pricing Strategy:

### Free Tier (Current):
- Create up to 5 lists
- Add up to 20 restaurants
- Basic filters
- Community support

### Premium Tier ($4.99/month or $49.99/year):
- Unlimited lists
- Unlimited restaurants
- Advanced filters (fuzzy search, etc.)
- Priority support
- No ads (if applicable)

### Pro Tier ($9.99/month or $99.99/year):
- Everything in Premium
- AI-powered recommendations (Issue #21)
- Collaborative lists with up to 10 members
- Advanced analytics
- Early access to new features
- Dedicated support

---

## Acceptance Criteria Checklist:

- [ ] Subscription tables created in database
- [ ] Stripe integration functional (checkout, webhooks)
- [ ] Pricing page created (`/pricing`)
- [ ] Plan comparison cards with features
- [ ] Checkout flow working (Stripe)
- [ ] Webhook handling for subscription events
- [ ] Feature gating implemented for premium features
- [ ] Subscription status shown in profile/Navbar
- [ ] User can cancel subscription
- [ ] Design responsive (mobile and desktop)
- [ ] Unit tests for new functionalities
- [ ] Documentation updated (memory-bank/)