'use client';

import { useState } from 'react';
import { useAdminRestaurants } from '@/hooks/admin/useAdminRestaurants';
import RestaurantsTable from '@/components/admin/RestaurantsTable';

export default function AdminRestaurantsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const { restaurants, total, loading, error } = useAdminRestaurants(page, 20, search);
  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Restaurantes</h1>
      {error && <p className="text-red-400 text-sm">Erro: {error}</p>}
      <input
        type="text"
        placeholder="Pesquisar restaurantes..."
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        className="w-full max-w-sm px-4 py-2 rounded-lg border text-sm mb-4 bg-card border-white/10 text-foreground placeholder:text-foreground-muted"
      />
      <div className="rounded-xl border border-white/10 bg-card">
        {loading ? <p className="p-6 text-foreground-muted">A carregar...</p> : <RestaurantsTable restaurants={restaurants} />}
      </div>
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 rounded border text-sm disabled:opacity-50 border-white/10 text-foreground-muted hover:text-foreground">Anterior</button>
          <span className="px-3 py-1 text-sm text-foreground-muted">{page} / {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 rounded border text-sm disabled:opacity-50 border-white/10 text-foreground-muted hover:text-foreground">Próximo</button>
        </div>
      )}
    </div>
  );
}
