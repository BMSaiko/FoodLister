'use client';

import React from 'react';
import { Check, Star, Zap, Crown } from 'lucide-react';
import type { SubscriptionPlan, SubscriptionTier } from '@/libs/types';
import { formatPrice } from '@/libs/subscription';

interface PricingCardProps {
  plan: SubscriptionPlan;
  isCurrentPlan: boolean;
  isPopular?: boolean;
  onSubscribe: (planId: string, interval: 'monthly' | 'yearly') => void;
  loading?: boolean;
}

const TIER_ICONS: Record<string, React.ReactNode> = {
  'Free': <Star className="h-6 w-6" />,
  'Premium': <Zap className="h-6 w-6" />,
  'Pro': <Crown className="h-6 w-6" />,
};

const TIER_COLORS: Record<string, string> = {
  'Free': 'from-gray-400 to-gray-500',
  'Premium': 'from-primary to-primary-dark',
  'Pro': 'from-amber-400 to-orange-500',
};

export default function PricingCard({ plan, isCurrentPlan, isPopular, onSubscribe, loading }: PricingCardProps) {
  const icon = TIER_ICONS[plan.name] || <Star className="h-6 w-6" />;
  const gradient = TIER_COLORS[plan.name] || 'from-gray-400 to-gray-500';

  return (
    <div className={`relative card overflow-hidden transition-all duration-300 ${isPopular ? 'ring-2 ring-primary shadow-xl scale-105' : 'hover:shadow-lg'}`}>
      {isPopular && (
        <div className="absolute top-0 right-0 bg-primary text-black text-xs font-bold px-3 py-1 rounded-bl-lg">
          Mais Popular
        </div>
      )}

      <div className={`h-2 bg-gradient-to-r ${gradient}`} />

      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${gradient} flex items-center justify-center text-black`}>
            {icon}
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
            {plan.description && (
              <p className="text-sm text-foreground-secondary">{plan.description}</p>
            )}
          </div>
        </div>

        <div className="mb-6">
          {plan.priceMonthly === 0 ? (
            <div className="text-3xl font-bold text-foreground">Grátis</div>
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-foreground">
                {formatPrice(plan.priceMonthly)}
              </span>
              <span className="text-foreground-secondary">/mês</span>
            </div>
          )}
          {plan.priceYearly && plan.priceYearly > 0 && (
            <p className="text-sm text-foreground-secondary mt-1">
              ou {formatPrice(plan.priceYearly)}/ano (poupa {Math.round((1 - plan.priceYearly / (plan.priceMonthly * 12)) * 100)}%)
            </p>
          )}
        </div>

        {plan.features && plan.features.length > 0 && (
          <ul className="space-y-3 mb-6">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-start gap-3">
                <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm text-foreground-secondary">{feature}</span>
              </li>
            ))}
          </ul>
        )}

        {isCurrentPlan ? (
          <div className="w-full py-3 px-4 bg-primary-lighter text-primary-dark text-center font-semibold rounded-[var(--radius-lg)]">
            Plano Atual
          </div>
        ) : plan.priceMonthly === 0 ? (
          <div className="w-full py-3 px-4 bg-gray-100 text-foreground-secondary text-center font-semibold rounded-[var(--radius-lg)]">
            Plano Gratuito
          </div>
        ) : (
          <div className="space-y-2">
            <button
              onClick={() => onSubscribe(plan.id, 'monthly')}
              disabled={loading}
              className="w-full py-3 px-4 bg-primary text-black font-semibold rounded-[var(--radius-lg)] hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {loading ? 'A processar...' : 'Subscrever Mensal'}
            </button>
            {plan.priceYearly && (
              <button
                onClick={() => onSubscribe(plan.id, 'yearly')}
                disabled={loading}
                className="w-full py-3 px-4 bg-primary-lighter text-primary-dark font-semibold rounded-[var(--radius-lg)] hover:bg-primary-light transition-colors disabled:opacity-50"
              >
                {loading ? 'A processar...' : 'Subscrever Anual'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
