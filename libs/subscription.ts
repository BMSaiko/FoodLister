import type { SubscriptionPlan, UserSubscription, SubscriptionTier, FeatureGate } from '@/libs/types';

/**
 * Feature gate configuration: maps features to required subscription tiers
 */
const FEATURE_GATE_MAP: Record<string, SubscriptionTier[]> = {
  // Free features
  'create_list': ['free', 'premium', 'pro'],
  'create_review': ['free', 'premium', 'pro'],
  'basic_filters': ['free', 'premium', 'pro'],
  'collaborate_lists': ['free', 'premium', 'pro'],

  // Premium features
  'unlimited_lists': ['premium', 'pro'],
  'advanced_filters': ['premium', 'pro'],
  'priority_support': ['premium', 'pro'],
  'no_ads': ['premium', 'pro'],

  // Pro features
  'ai_recommendations': ['pro'],
  'advanced_analytics': ['pro'],
  'collaborative_lists_large': ['pro'],
  'early_access': ['pro'],
  'dedicated_support': ['pro'],
};

/**
 * Tier hierarchy for comparison (higher = more access)
 */
const TIER_HIERARCHY: Record<SubscriptionTier, number> = {
  'free': 0,
  'premium': 1,
  'pro': 2,
};

/**
 * Check if a subscription tier has access to a feature
 */
export function hasFeatureAccess(feature: string, tier: SubscriptionTier): boolean {
  const allowedTiers = FEATURE_GATE_MAP[feature];
  if (!allowedTiers) {
    // Unknown features are accessible by default
    return true;
  }
  return allowedTiers.includes(tier);
}

/**
 * Create a FeatureGate object
 */
export function createFeatureGate(feature: string, currentTier: SubscriptionTier): FeatureGate {
  return {
    feature,
    requiredTier: getRequiredTier(feature),
    currentTier,
    hasAccess: hasFeatureAccess(feature, currentTier),
  };
}

/**
 * Get the minimum required tier for a feature
 */
export function getRequiredTier(feature: string): SubscriptionTier {
  const allowedTiers = FEATURE_GATE_MAP[feature];
  if (!allowedTiers || allowedTiers.length === 0) {
    return 'free';
  }
  // Return the lowest tier that has access
  const sortedTiers = [...allowedTiers].sort(
    (a, b) => (TIER_HIERARCHY[a] || 0) - (TIER_HIERARCHY[b] || 0)
  );
  return sortedTiers[0];
}

/**
 * Get features for a specific tier
 */
export function getFeaturesForTier(tier: SubscriptionTier): string[] {
  return Object.entries(FEATURE_GATE_MAP)
    .filter(([, tiers]) => tiers.includes(tier))
    .map(([feature]) => feature);
}

/**
 * Check if a subscription is active
 */
export function isSubscriptionActive(subscription: UserSubscription | null): boolean {
  if (!subscription) return false;
  return subscription.status === 'active' || subscription.status === 'trialing';
}

/**
 * Get the effective tier from a subscription
 */
export function getEffectiveTier(subscription: UserSubscription | null, currentTier: SubscriptionTier): SubscriptionTier {
  if (isSubscriptionActive(subscription)) {
    // If subscription is active, the user has at least the plan's tier
    return currentTier;
  }
  return 'free';
}

/**
 * Format price for display
 */
export function formatPrice(price: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(price);
}

/**
 * Get plan name by tier
 */
export function getPlanNameByTier(tier: SubscriptionTier): string {
  const names: Record<SubscriptionTier, string> = {
    'free': 'Free',
    'premium': 'Premium',
    'pro': 'Pro',
  };
  return names[tier];
}

export type { SubscriptionPlan, UserSubscription, SubscriptionTier, FeatureGate };
