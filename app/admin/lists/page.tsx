'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePageTitle } from "@/hooks/usePageTitle";

export default function AdminListsPage() {
  usePageTitle("Admin · Listas - FoodLister");
  const [lists, setLists] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const limit = 20;

  const fetchLists = useCallback(async (p: number, s: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), limit: String(limit) });
      if (s) params.set('search', s);
      const res = await fetch(`/api/admin/lists?${params}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch');
      const { data, total: t } = await res.json();
      setLists(data);
      setTotal(t);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchLists(1, search), 250);
    return () => clearTimeout(t);
  }, [search, fetchLists]);

  const handleDelete = async (l: any) => {
    if (!confirm(`Eliminar lista "${l.name}"? Esta ação não pode ser revertida.`)) return;
    const res = await fetch(`/api/lists/${l.id}`, { method: 'DELETE', credentials: 'include' });
    if (res.ok) { fetchLists(page, search); } else { alert('Não foi possível eliminar a lista.'); }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Listas</h1>
      {error && <p className="text-red-400 text-sm">Erro: {error}</p>}
      <input
        type="text"
        placeholder="Pesquisar listas..."
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        className="w-full max-w-sm px-4 py-2 rounded-lg border text-sm mb-4 bg-[var(--card-bg)] border-white/10 text-foreground placeholder:text-foreground-muted"
      />
      <div className="rounded-xl border border-white/10 bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-foreground-muted border-b border-white/10">
              <th className="p-3">Nome</th>
              <th className="p-3">Criador</th>
              <th className="p-3">Visibilidade</th>
              <th className="p-3">Data</th>
              <th className="p-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="p-6 text-foreground-muted" colSpan={5}>A carregar...</td></tr>
            ) : lists.length === 0 ? (
              <tr><td className="p-6 text-foreground-muted" colSpan={5}>Nenhuma lista encontrada.</td></tr>
            ) : lists.map((l) => (
              <tr key={l.id} className="border-b border-white/5">
                <td className="p-3">
                  <Link href={`/lists/${l.id}`} className="font-medium hover:underline" style={{ color: 'var(--foreground)' }}>{l.name}</Link>
                </td>
                <td className="p-3 text-foreground-muted">{l.creator_name || '—'}</td>
                <td className="p-3">{l.is_public ? <span className="text-emerald-400">Pública</span> : <span className="text-amber-400">Privada</span>}</td>
                <td className="p-3 text-foreground-muted">{new Date(l.created_at).toLocaleDateString('pt-PT')}</td>
                <td className="p-3 flex gap-2">
                  <Link href={`/lists/${l.id}/edit?from=admin`} className="text-xs px-2 py-1 rounded border border-white/10 hover:bg-white/5">Editar</Link>
                  <button onClick={() => handleDelete(l)} className="text-xs px-2 py-1 rounded border border-white/10 text-red-400 hover:bg-red-500/15">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button disabled={page <= 1} onClick={() => { setPage(p => p - 1); fetchLists(page - 1, search); }} className="px-3 py-1 rounded border text-sm disabled:opacity-50 border-white/10 text-foreground-muted hover:text-foreground">Anterior</button>
          <span className="px-3 py-1 text-sm text-foreground-muted">{page} / {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => { setPage(p => p + 1); fetchLists(page + 1, search); }} className="px-3 py-1 rounded border text-sm disabled:opacity-50 border-white/10 text-foreground-muted hover:text-foreground">Próximo</button>
        </div>
      )}
    </div>
  );
}
