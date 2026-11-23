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
 * Format price for display
 */
export function formatPrice(price: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(price);
}

export type { SubscriptionPlan, UserSubscription, SubscriptionTier, FeatureGate };
