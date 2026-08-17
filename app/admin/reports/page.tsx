'use client';
import { useEffect, useState, useCallback } from 'react';
import { usePageTitle } from '@/hooks/usePageTitle';

interface Report {
  id: string;
  target_type: string;
  target: string;
  reason: string;
  details: string | null;
  status: string;
  created_at: string;
  profiles: { display_name?: string } | null;
}

const TYPE_LABEL: Record<string, string> = {
  restaurant: 'Restaurante',
  review: 'Review',
  list: 'Lista',
  profile: 'Perfil',
};

const REASON_LABEL: Record<string, string> = {
  closed: 'Fechado / Não existe',
  wrong_data: 'Dados errados',
  prices: 'Preços errados',
  spam: 'Spam',
  offensive: 'Conteúdo ofensivo',
  other: 'Outro',
};

export default function AdminReportsPage() {
  usePageTitle('Admin · Reports - FoodLister');
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (status = 'pending') => {
    setLoading(true); setError(null);
    try {
      const res = await fetch('/api/admin/reports?status=' + status, { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Erro ao carregar.'); return; }
      setReports(data.data || []);
    } catch { setError('Erro de rede.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const act = async (id: string, status: string) => {
    const res = await fetch('/api/admin/reports/' + id, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) load();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Reports</h1>
      {error && <p className="text-red-400 text-sm">Erro: {error}</p>}
      <div className="rounded-xl border border-white/10 bg-card">
        {loading ? (
          <p className="p-6 text-foreground-muted">A carregar...</p>
        ) : reports.length === 0 ? (
          <p className="p-6 text-foreground-muted">Sem reports pendentes.</p>
        ) : (
          <div className="divide-y divide-white/5">
            {reports.map(r => (
              <div key={r.id} className="p-4 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    {TYPE_LABEL[r.target_type] || r.target_type}
                    <span className="text-foreground-muted font-normal"> · </span>
                    <span className="text-amber-400">{r.target || '?'}</span>
                  </p>
                  <p className="text-xs text-foreground-muted mt-1">
                    Motivo: {REASON_LABEL[r.reason] || r.reason}
                    {r.profiles?.display_name ? ` · por ${r.profiles.display_name}` : ''}
                  </p>
                  {r.details && <p className="text-xs text-foreground/80 mt-1">{r.details}</p>}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => act(r.id, 'resolved')} className="px-3 py-1.5 rounded-lg bg-emerald-500/90 text-black text-xs font-semibold hover:bg-emerald-400">Resolver</button>
                  <button onClick={() => act(r.id, 'dismissed')} className="px-3 py-1.5 rounded-lg border border-white/10 text-foreground-muted text-xs hover:text-foreground">Descartar</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
