'use client';

import Icon from '@/components/ui/icons/Icon';
import Link from 'next/link';

interface RecentActivityProps {
  activities: {
    type: 'user_signup' | 'restaurant_created' | 'review_added' | 'list_created';
    description: string;
    timestamp: string;
    userName?: string;
  }[];
}

const iconMap = {
  user_signup: 'utilizador-mais',
  restaurant_created: 'refeicoes',
  review_added: 'estrela',
  list_created: 'lista',
} as const;

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
          const icon = iconMap[activity.type];
          return (
            <div key={i} className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: `${colorMap[activity.type]}15` }}>
                <Icon name={icon} className="h-4 w-4" style={{ color: colorMap[activity.type] }} />
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

