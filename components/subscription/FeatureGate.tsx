'use client';

import React from 'react';
import { Lock } from 'lucide-react';
import type { SubscriptionTier } from '@/libs/types';
import { hasFeatureAccess } from '@/libs/subscription';

interface FeatureGateProps {
  feature: string;
  currentTier: SubscriptionTier;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function FeatureGate({ feature, currentTier, children, fallback }: FeatureGateProps) {
  const hasAccess = hasFeatureAccess(feature, currentTier);

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="relative">
      <div className="opacity-50 pointer-events-none">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-black/5 rounded-[var(--radius-lg)]">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/90 rounded-full shadow-sm">
          <Lock className="h-4 w-4 text-foreground-muted" />
          <span className="text-xs font-medium text-foreground-secondary">Premium</span>
        </div>
      </div>
    </div>
  );
}
