'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCampaigns } from '@/hooks/marketing/useCampaigns';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import { Megaphone, Plus, Pencil, Trash2, ArrowLeft } from 'lucide-react';
import type { Campaign, CampaignStatus } from '@/libs/marketing';

const STATUSES: CampaignStatus[] = ['draft', 'active', 'paused', 'completed'];
const STATUS_LABEL: Record<CampaignStatus, string> = {
  draft: 'Rascunho',
  active: 'Ativo',
  paused: 'Pausado',
  completed: 'Concluído',
};

interface ModalState {
  open: boolean;
  editing: Campaign | null;
}

export default function AdminCampaignsPage() {
  const { campaigns, loading, error, create, update, remove } = useCampaigns();
  const [modal, setModal] = useState<ModalState>({ open: false, editing: null });
  const [form, setForm] = useState({ name: '', description: '', status: 'draft' as CampaignStatus, budget: '' });
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setForm({ name: '', description: '', status: 'draft', budget: '' });
    setModal({ open: true, editing: null });
  };
  const openEdit = (c: Campaign) => {
    setForm({
      name: c.name,
      description: c.description || '',
      status: c.status,
      budget: c.budget != null ? String(c.budget) : '',
    });
    setModal({ open: true, editing: c });
  };

  const save = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      status: form.status,
      budget: form.budget ? Number(form.budget) : null,
    };
    if (modal.editing) await update(modal.editing.id, payload);
    else await create(payload);
    setSaving(false);
    setModal({ open: false, editing: null });
  };

  const onDelete = async (c: Campaign) => {
    if (typeof window !== 'undefined' && window.confirm(`Eliminar campanha "${c.name}"?`)) {
      await remove(c.id);
    }
  };

  return (
    <ErrorBoundary pageName="Campanhas">
      <div className="space-y-8 max-w-7xl mx-auto" style={{ animation: 'fadeUp 600ms ease forwards' }}>
        <div className="flex items-center justify-between">
          <div>
            <Link href="/admin/marketing" className="flex items-center gap-1 text-xs text-white/40 hover:text-amber-400 transition-colors mb-2">
              <ArrowLeft className="h-3 w-3" /> Marketing
            </Link>
            <h1 className="text-3xl font-bold text-white tracking-tight">Campanhas</h1>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-amber-500/10 ring-1 ring-amber-500/20 text-amber-300 text-sm font-medium hover:bg-amber-500/20 transition-colors duration-150"
          >
            <Plus className="h-4 w-4" /> Nova Campanha
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-500/10 ring-1 ring-red-500/20 text-red-400 text-sm">
            Erro: {error}
          </div>
        )}

        {loading ? (
          <p className="text-white/30 text-sm">A carregar...</p>
        ) : campaigns.length === 0 ? (
          <p className="text-white/30 text-sm">Sem campanhas ainda.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((c) => (
              <div key={c.id} className="group relative p-1.5 rounded-[2rem] transition-colors duration-150 hover:bg-white/[0.06]">
                <div className="absolute inset-0 rounded-[2rem] bg-white/[0.05] ring-1 ring-white/10 backdrop-blur-xl" />
                <div className="relative rounded-[calc(2rem-0.375rem)] p-6 bg-gradient-to-br from-[#0a0a0a] to-[#111111] shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center ring-1 ring-white/10">
                        <Megaphone className="h-4 w-4 text-amber-400" />
                      </div>
                      <p className="text-sm font-medium text-white/40 uppercase tracking-[0.15em]">{STATUS_LABEL[c.status]}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(c)} className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => onDelete(c)} className="p-2 rounded-lg hover:bg-red-500/10 text-white/50 hover:text-red-400 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-white">{c.name}</h3>
                  {c.description && <p className="text-sm text-white/40 mt-1">{c.description}</p>}
                  {c.budget != null && <p className="text-xs text-white/30 mt-3">Orçamento: €{c.budget}</p>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {modal.open && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={() => setModal({ open: false, editing: null })}
          >
            <div
              className="w-full max-w-md rounded-2xl bg-[#0a0a0a] ring-1 ring-white/10 p-6 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-white">{modal.editing ? 'Editar Campanha' : 'Nova Campanha'}</h3>
              <div className="space-y-3">
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Nome"
                  className="w-full px-3 py-2 rounded-lg bg-white/5 ring-1 ring-white/10 text-white text-sm placeholder:text-white/30 outline-none focus:ring-amber-500/40"
                />
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Descrição"
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 ring-1 ring-white/10 text-white text-sm placeholder:text-white/30 outline-none focus:ring-amber-500/40 resize-none"
                />
                <div className="flex gap-3">
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as CampaignStatus })}
                    className="flex-1 px-3 py-2 rounded-lg bg-white/5 ring-1 ring-white/10 text-white text-sm outline-none focus:ring-amber-500/40"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s} className="bg-[#0a0a0a]">
                        {STATUS_LABEL[s]}
                      </option>
                    ))}
                  </select>
                  <input
                    value={form.budget}
                    onChange={(e) => setForm({ ...form, budget: e.target.value })}
                    placeholder="Orçamento €"
                    type="number"
                    className="w-32 px-3 py-2 rounded-lg bg-white/5 ring-1 ring-white/10 text-white text-sm placeholder:text-white/30 outline-none focus:ring-amber-500/40"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setModal({ open: false, editing: null })}
                  className="px-4 py-2 rounded-lg text-white/60 text-sm hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={save}
                  disabled={saving || !form.name.trim()}
                  className="px-4 py-2 rounded-lg bg-amber-500/20 ring-1 ring-amber-500/30 text-amber-300 text-sm font-medium hover:bg-amber-500/30 disabled:opacity-40 transition-colors"
                >
                  {saving ? 'A guardar...' : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}
