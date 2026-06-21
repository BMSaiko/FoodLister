'use client';

import Link from 'next/link';
import { Trash2 } from 'lucide-react';

interface ReviewsTableProps {
  reviews: any[];
  onDelete: (id: string) => Promise<boolean>;
}

export default function ReviewsTable({ reviews, onDelete }: ReviewsTableProps) {
  return (
    <div className="space-y-3">
      {reviews.map((r) => (
        <div
          key={r.id}
          className="flex items-start gap-4 p-4 rounded-xl border"
          style={{
            backgroundColor: '#0a0a0a',
            borderColor: 'rgba(255,255,255,0.08)',
          }}
        >
          {/* Left: Restaurant thumbnail */}
          <div className="flex-shrink-0">
            {r.restaurants?.image_url && r.restaurants.image_url.startsWith('http') ? (
              <img
                src={r.restaurants.image_url}
                alt={r.restaurants.name || 'Restaurant'}
                className="w-16 h-16 rounded-lg object-cover"
              />
            ) : (
              <div
                className="w-16 h-16 rounded-lg flex items-center justify-center text-xl"
                style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
              >
                🍽️
              </div>
            )}
          </div>

          {/* Middle: Review content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Link
                href={`/restaurants/${r.restaurant_id}`}
                className="font-medium hover:underline truncate"
                style={{ color: 'var(--foreground)' }}
              >
                {r.restaurants?.name || 'Restaurante'}
              </Link>
            </div>
            <p className="text-sm mb-1" style={{ color: 'var(--muted-foreground)' }}>
              {r.user_name || 'Anónimo'}
            </p>
            <p className="text-sm mb-1">{'⭐'.repeat(r.rating)}</p>
            <p className="text-sm break-words" style={{ color: 'var(--foreground)' }}>
              {r.comment || '—'}
            </p>
          </div>

          {/* Right: Date + Delete */}
          <div className="flex-shrink-0 flex flex-col items-end gap-2">
            <span className="text-xs whitespace-nowrap" style={{ color: 'var(--muted-foreground)' }}>
              {new Date(r.created_at).toLocaleDateString('pt-PT')}
            </span>
            <button
              onClick={() => onDelete(r.id)}
              className="p-1 rounded hover:bg-red-50 transition-colors"
              title="Apagar review"
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
