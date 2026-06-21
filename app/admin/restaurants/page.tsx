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
      <h1 className="text-2xl font-bold" style={{ color: 'rgba(255,255,255,0.85)' }}>Restaurantes</h1>
      {error && <p className="text-red-500 text-sm">Erro: {error}</p>}
      <input
        type="text"
        placeholder="Pesquisar restaurantes..."
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        className="w-full max-w-sm px-4 py-2 rounded-lg border text-sm mb-4"
        style={{ backgroundColor: '#0a0a0a', borderColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.85)' }}
      />
      <div className="rounded-xl border" style={{ backgroundColor: '#0a0a0a', borderColor: 'rgba(255,255,255,0.08)' }}>
        {loading ? <p className="p-6" style={{ color: 'rgba(255,255,255,0.4)' }}>A carregar...</p> : <RestaurantsTable restaurants={restaurants} />}
      </div>
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 rounded border text-sm disabled:opacity-50" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>Anterior</button>
          <span className="px-3 py-1 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>{page} / {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 rounded border text-sm disabled:opacity-50" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>Próximo</button>
        </div>
      )}
    </div>
  );
}

