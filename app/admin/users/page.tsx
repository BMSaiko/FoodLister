'use client';

import { useState } from 'react';
import { useAdminUsers } from '@/hooks/admin/useAdminUsers';
import UsersTable from '@/components/admin/UsersTable';

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const { users, total, loading, error, refresh } = useAdminUsers(page, 20, search);
  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>Utilizadores</h1>
        <div className="flex items-center gap-3">
          <input type="text" placeholder="Pesquisar..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-lg border text-sm" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }} />
        </div>
      </div>
      {error && <p className="text-red-500 text-sm">Erro: {error}</p>}
      <div className="rounded-xl border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        {loading ? <p className="p-6" style={{ color: 'var(--muted-foreground)' }}>A carregar...</p> : <UsersTable users={users} onRefresh={refresh} />}
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

