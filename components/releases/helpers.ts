import type { ReleaseCategory, ReleaseNote } from '@/libs/releases/types';

export const CATEGORIES: { key: ReleaseCategory; label: string }[] = [
  { key: 'novo', label: 'Novo' },
  { key: 'melhorado', label: 'Melhorado' },
  { key: 'corrigido', label: 'Corrigido' },
];

/** Resumo sem migração: 1.º item de Novo, senão Melhorado, senão Corrigido. */
export function releaseSummary(note: ReleaseNote): string {
  for (const { key } of CATEGORIES) {
    if (note.items[key].length > 0) return note.items[key][0];
  }
  return '';
}

/** `2026-11-20` → `20 de novembro de 2026` (pt-PT); `null` → vazio. */
export function formatReleaseDate(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(`${iso}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('pt-PT', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(d);
}
