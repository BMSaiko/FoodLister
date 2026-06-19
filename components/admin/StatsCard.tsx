'use client';

import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: number;
  subtitle?: string;
}

export default function StatsCard({ title, value, icon: Icon, trend, subtitle }: StatsCardProps) {
  return (
    <div className="rounded-xl border p-6" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>{title}</p>
        {Icon && <Icon className="h-5 w-5" style={{ color: 'var(--primary)' }} />}
      </div>
      <div className="flex items-baseline gap-2">
        <p className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        {trend !== undefined && (
          <span className={`text-sm font-medium ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      {subtitle && (
        <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>{subtitle}</p>
      )}
    </div>
  );
}

