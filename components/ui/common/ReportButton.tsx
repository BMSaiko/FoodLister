'use client';
import { useState, useRef, useEffect } from 'react';
import { Flag } from 'lucide-react';
import { toast } from 'react-toastify';

const REASONS = [
  { value: 'closed', label: 'Fechado / Não existe' },
  { value: 'wrong_data', label: 'Dados errados' },
  { value: 'prices', label: 'Preços errados' },
  { value: 'spam', label: 'Spam' },
  { value: 'offensive', label: 'Conteúdo ofensivo' },
  { value: 'other', label: 'Outro' },
];

interface Props {
  targetType: 'restaurant' | 'review' | 'list' | 'profile';
  targetId: string;
  label?: string;
}

export default function ReportButton({ targetType, targetId, label }: Props) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const submit = async () => {
    if (!reason || busy) return;
    setBusy(true);
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_type: targetType, target_id: targetId, reason, details }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        toast.success('Report enviado. Obrigado!');
        setOpen(false); setReason(''); setDetails('');
      } else if (res.status === 409) {
        toast.info(data.error || 'Já reportaste este item.');
      } else {
        toast.error(data.error || 'Erro ao reportar.');
      }
    } catch {
      toast.error('Erro de rede ao reportar.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white/50 hover:text-amber-400 hover:bg-white/[0.04] rounded-lg transition-all duration-150"
        aria-label="Reportar"
      >
        <Flag className="h-3.5 w-3.5" />
        {label || 'Reportar'}
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-72 p-4 rounded-2xl border border-white/10 bg-[#0d0d0d] shadow-2xl shadow-black/50">
          <p className="text-sm font-semibold text-white mb-3">Reportar conteúdo</p>
          <div className="space-y-2">
            {REASONS.map(r => (
              <label key={r.value} className="flex items-center gap-2 text-xs text-white/70 cursor-pointer">
                <input
                  type="radio"
                  name="report-reason"
                  value={r.value}
                  checked={reason === r.value}
                  onChange={() => setReason(r.value)}
                  className="accent-amber-400"
                />
                {r.label}
              </label>
            ))}
          </div>
          <textarea
            value={details}
            onChange={e => setDetails(e.target.value)}
            placeholder="Detalhes (opcional)"
            rows={2}
            className="mt-3 w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white placeholder:text-white/25 focus:outline-none focus:border-amber-400/50 resize-none"
          />
          <button
            onClick={submit}
            disabled={!reason || busy}
            className="mt-3 w-full py-2 rounded-lg bg-amber-500 text-black text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-amber-400 transition-colors"
          >
            {busy ? 'A enviar...' : 'Enviar report'}
          </button>
        </div>
      )}
    </div>
  );
}
