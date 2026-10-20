'use client';

import React, { useEffect, useRef, useState, type ReactNode } from 'react';
import { StarIcon, CalendarIcon, ShareIcon, MoreIcon, EditIcon, TrashIcon } from '@/components/icons';

interface RestaurantActionsProps {
  onReview: () => void;
  onSchedule: () => void;
  onShare: () => void;
  /** só definido para dono/admin */
  onEdit?: () => void;
  /** só definido para admin */
  onDelete?: () => void;
  canDelete?: boolean;
  /** itens extra do menu «⋯» (adicionar a lista, denunciar) */
  menuExtra?: ReactNode;
  /** esconder «Avaliar» (utilizador sem sessão) */
  hideReview?: boolean;
}

const secondary =
  'flex items-center justify-center gap-2 min-h-[44px] rounded-full border border-white/[0.1] bg-white/[0.06] text-sm font-medium text-white/85 hover:bg-white/[0.12] transition-colors';

/**
 * Barra de ações do restaurante: ação principal (Avaliar), Agendar e Partilhar visíveis;
 * Editar, Eliminar e extras ficam no menu «⋯». Eliminar pede sempre confirmação.
 */
export default function RestaurantActions({
  onReview,
  onSchedule,
  onShare,
  onEdit,
  onDelete,
  canDelete,
  menuExtra,
  hideReview,
}: RestaurantActionsProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const showDelete = !!(canDelete && onDelete);

  return (
    <div ref={wrapRef} className="relative flex items-center gap-2">
      {!hideReview && (
        <button
          type="button"
          onClick={onReview}
          className="flex flex-1 items-center justify-center gap-2 min-h-[44px] rounded-full bg-amber-500 px-5 text-sm font-semibold text-black hover:bg-amber-400 transition-colors"
        >
          <StarIcon size={18} />
          Avaliar
        </button>
      )}
      <button type="button" onClick={onSchedule} className={`${secondary} flex-1 px-4`}>
        <CalendarIcon size={18} />
        Agendar
      </button>
      <button type="button" onClick={onShare} aria-label="Partilhar" className={`${secondary} w-11 flex-none`}>
        <ShareIcon size={18} />
      </button>
      <button
        type="button"
        aria-label="Mais ações"
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((o) => !o)}
        className={`${secondary} w-11 flex-none`}
      >
        <MoreIcon size={18} />
      </button>

      {menuOpen && (
        <div
          role="menu"
          aria-label="Mais ações"
          className="absolute bottom-full right-0 z-30 mb-2 w-60 rounded-2xl border border-white/[0.1] bg-[var(--card-bg,#151516)] p-1.5 shadow-2xl"
        >
          {onEdit && (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setMenuOpen(false);
                onEdit();
              }}
              className="flex w-full items-center gap-3 min-h-[44px] rounded-xl px-3 text-sm text-white/85 hover:bg-white/[0.06]"
            >
              <EditIcon size={18} />
              Editar
            </button>
          )}
          {menuExtra && <div className="px-1 py-0.5 [&>*]:w-full">{menuExtra}</div>}
          {showDelete && (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setMenuOpen(false);
                setConfirming(true);
              }}
              className="flex w-full items-center gap-3 min-h-[44px] rounded-xl px-3 text-sm text-red-400 hover:bg-red-500/10"
            >
              <TrashIcon size={18} />
              Eliminar
            </button>
          )}
        </div>
      )}

      {confirming && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-4">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="del-title"
            className="w-full max-w-sm rounded-2xl border border-white/[0.1] bg-[var(--card-bg,#151516)] p-5 shadow-2xl"
          >
            <h2 id="del-title" className="text-base font-semibold text-white">
              Eliminar este restaurante?
            </h2>
            <p className="mt-1 text-sm text-white/60">Esta ação não pode ser desfeita.</p>
            <div className="mt-4 flex gap-2">
              <button type="button" onClick={() => setConfirming(false)} className={`${secondary} flex-1 px-4`}>
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirming(false);
                  onDelete?.();
                }}
                className="flex flex-1 items-center justify-center min-h-[44px] rounded-full bg-red-500 px-4 text-sm font-semibold text-white hover:bg-red-400"
              >
                Eliminar restaurante
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
