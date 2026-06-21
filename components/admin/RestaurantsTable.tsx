'use client';

import Link from 'next/link';

interface RestaurantsTableProps {
  restaurants: any[];
}

export default function RestaurantsTable({ restaurants }: RestaurantsTableProps) {
  if (!restaurants || restaurants.length === 0) {
    return (
      <div className="text-center py-12" style={{ color: 'var(--muted-foreground)' }}>
        Nenhum restaurante encontrado.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {restaurants.map((r) => (
        <div
          key={r.id}
          className="rounded-xl overflow-hidden border"
          style={{
            backgroundColor: '#0a0a0a',
            borderColor: 'rgba(255,255,255,0.08)',
          }}
        >
          {r.image_url && r.image_url.startsWith('http') ? (
            <img
              src={r.image_url}
              alt={r.name}
              className="w-full h-40 object-cover rounded-t-xl"
            />
          ) : (
            <div
              className="w-full h-40 flex items-center justify-center rounded-t-xl"
              style={{
                backgroundColor: '#1a1a1a',
                color: 'var(--muted-foreground)',
              }}
            >
              <span style={{ fontSize: '2rem', opacity: 0.3 }}>🍽</span>
            </div>
          )}

          <div className="p-4 flex flex-col gap-2">
            <Link
              href={`/restaurants/${r.id}`}
              className="text-base font-semibold hover:underline line-clamp-1"
              style={{ color: 'var(--foreground)' }}
            >
              {r.name}
            </Link>

            {r.description && (
              <p
                className="text-xs line-clamp-2"
                style={{ color: 'var(--muted-foreground)' }}
              >
                {r.description}
              </p>
            )}

            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: 'var(--foreground)' }}>
                ⭐ {r.rating != null ? r.rating.toFixed(1) : 'N/A'}
              </span>
              {r.price_per_person != null && (
                <span
                  className="text-sm font-medium px-2 py-0.5 rounded-md"
                  style={{
                    color: 'var(--foreground)',
                    backgroundColor: 'rgba(255,255,255,0.06)',
                  }}
                >
                  €{r.price_per_person}
                </span>
              )}
            </div>

            {r.location && (
              <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                <span>📍</span>
                <span className="line-clamp-1">{r.location}</span>
              </div>
            )}

            <div className="flex items-center justify-between mt-1 pt-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                {r.creator_name || '—'}
              </span>
              <div className="flex items-center gap-2">
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    color: 'var(--muted-foreground)',
                    backgroundColor: 'rgba(255,255,255,0.06)',
                  }}
                >
                  {r.review_count || 0} reviews
                </span>
                <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  {new Date(r.created_at).toLocaleDateString('pt-PT')}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
