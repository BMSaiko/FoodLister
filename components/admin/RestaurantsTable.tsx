'use client';

interface RestaurantsTableProps {
  restaurants: any[];
}

export default function RestaurantsTable({ restaurants }: RestaurantsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
            <th className="text-left p-3" style={{ color: 'var(--muted-foreground)' }}>Nome</th>
            <th className="text-left p-3" style={{ color: 'var(--muted-foreground)' }}>Rating</th>
            <th className="text-left p-3" style={{ color: 'var(--muted-foreground)' }}>Reviews</th>
            <th className="text-left p-3" style={{ color: 'var(--muted-foreground)' }}>Criador</th>
            <th className="text-left p-3" style={{ color: 'var(--muted-foreground)' }}>Criado</th>
          </tr>
        </thead>
        <tbody>
          {restaurants.map(r => (
            <tr key={r.id} className="border-b" style={{ borderColor: 'var(--border)' }}>
              <td className="p-3 font-medium" style={{ color: 'var(--foreground)' }}>{r.name}</td>
              <td className="p-3" style={{ color: 'var(--foreground)' }}>⭐ {r.rating?.toFixed(1) || 'N/A'}</td>
              <td className="p-3" style={{ color: 'var(--foreground)' }}>{r.review_count || 0}</td>
              <td className="p-3" style={{ color: 'var(--muted-foreground)' }}>{r.creator_name || '—'}</td>
              <td className="p-3 text-xs" style={{ color: 'var(--muted-foreground)' }}>{new Date(r.created_at).toLocaleDateString('pt-PT')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

