'use client';

import Link from 'next/link';
import { UserPlus, UtensilsCrossed, Star, List } from 'lucide-react';

interface RecentActivityProps {
  activities: {
    type: 'user_signup' | 'restaurant_created' | 'review_added' | 'list_created';
    description: string;
    timestamp: string;
    userName?: string;
  }[];
}

const iconMap = {
  user_signup: UserPlus,
  restaurant_created: UtensilsCrossed,
  review_added: Star,
  list_created: List,
};

const colorMap = {
  user_signup: '#f59e0b',
  restaurant_created: '#22c55e',
  review_added: '#3b82f6',
  list_created: '#8b5cf6',
};

export default function RecentActivity({ activities }: RecentActivityProps) {
  if (!activities.length) {
    return (
      <div className="rounded-xl border p-6" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>Atividade Recente</h3>
        <p style={{ color: 'var(--muted-foreground)' }}>Sem atividade recente</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border p-6" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
      <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>Atividade Recente</h3>
      <div className="space-y-3">
        {activities.map((activity, i) => {
          const Icon = iconMap[activity.type];
          return (
            <div key={i} className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: `${colorMap[activity.type]}15` }}>
                <Icon className="h-4 w-4" style={{ color: colorMap[activity.type] }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate" style={{ color: 'var(--foreground)' }}>{activity.description}</p>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  {new Date(activity.timestamp).toLocaleDateString('pt-PT', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

