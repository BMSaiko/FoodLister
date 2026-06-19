'use client';

import { useState } from 'react';
import { useAdminRestaurants } from '@/hooks/admin/useAdminRestaurants';
import RestaurantsTable from '@/components/admin/RestaurantsTable';

export default function AdminRestaurantsPage() {
  const [page, setPage] = useState(1);
  const { restaurants, total, loading, error } = useAdminRestaurants(page, 20);
  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>Restaurantes</h1>
      {error && <p className="text-red-500 text-sm">Erro: {error}</p>}
      <div className="rounded-xl border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        {loading ? <p className="p-6" style={{ color: 'var(--muted-foreground)' }}>A carregar...</p> : <RestaurantsTable restaurants={restaurants} />}
      </div>
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 rounded border text-sm disabled:opacity-50" style={{ borderColor: 'var(--border)' }}>Anterior</button>
          <span className="px-3 py-1 text-sm" style={{ color: 'var(--muted-foreground)' }}>{page} / {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 rounded border text-sm disabled:opacity-50" style={{ borderColor: 'var(--border)' }}>Próximo</button>
        </div>
      )}
    </div>
  );
}

