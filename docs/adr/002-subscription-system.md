# ADR-002: Subscription System Design

## Status
Accepted

## Date
2026-06-13

## Context
FoodLister needs a monetization strategy to cover operational costs (Supabase, Cloudinary, hosting). A subscription model was chosen over ads to maintain user experience quality.

## Decision

### Tier Model
- **Free**: 5 lists, 20 restaurants, basic filters
- **Premium** (€4.99/mo): Unlimited lists/restaurants, advanced filters, priority support
- **Pro** (€9.99/mo): Everything in Premium + AI recommendations, large collaborative lists, analytics

### Technical Implementation
- **Stripe Checkout** for payment flow (not custom forms — reduces PCI compliance scope)
- **Webhook-driven subscription state** — Stripe webhooks update subscription status
- **Feature gating** via `<FeatureGate>` component with tier hierarchy
- **Subscription status** stored in `user_subscriptions` table + `subscription_tier` on `profiles`

### Feature Gate Map
Configurable in `libs/subscription.ts` — maps feature keys to allowed tiers:
```typescript
const FEATURE_GATE_MAP: Record<string, SubscriptionTier[]> = {
  'unlimited_lists': ['premium', 'pro'],
  'ai_recommendations': ['pro'],
  // ...
};
```

## Rationale
- Stripe Checkout offloads PCI compliance to Stripe
- Webhook-driven approach ensures subscription state is always in sync
- Feature gating is declarative and easy to modify
- Tier hierarchy (free < premium < pro) simplifies access checks

## Consequences
- ✅ PCI compliance handled by Stripe
- ✅ Subscription state synced via webhooks
- ✅ Easy to modify feature gates
- ⚠️ Requires Stripe account and product setup
- ⚠️ Webhook requires HTTPS endpoint (needs Vercel deployment or Stripe CLI for local dev)

## Related
- ADR-001: Architecture Overview
