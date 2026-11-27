import type { SupabaseClient } from '@supabase/supabase-js';
import type { ReleaseItems, ReleaseNote } from './types';

export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 50;

interface ReleaseRow {
  version: string;
  released_at: string;
  title: string;
  items: ReleaseItems;
}

export interface ReleasePage {
  releases: ReleaseNote[];
  page: number;
  hasMore: boolean;
}

const COLUMNS = 'version, released_at, title, items';

const toNote = (row: ReleaseRow): ReleaseNote => ({
  version: row.version,
  releasedAt: row.released_at,
  title: row.title,
  items: row.items,
});

/** Lê uma página de releases (mais recente primeiro); pede `limit + 1` linhas para saber se há mais. */
export async function listReleases(
  client: Pick<SupabaseClient, 'from'>,
  page: number,
  limit: number,
): Promise<ReleasePage> {
  const from = (page - 1) * limit;
  const { data, error } = await client
    .from('release_notes')
    .select(COLUMNS)
    .order('released_at', { ascending: false })
    .range(from, from + limit);
  if (error) throw error;
  const rows = (data ?? []) as ReleaseRow[];
  return { releases: rows.slice(0, limit).map(toNote), page, hasMore: rows.length > limit };
}

/** Lê uma release pela versão (sem prefixo `v`); `null` se não existir. */
export async function getRelease(
  client: Pick<SupabaseClient, 'from'>,
  version: string,
): Promise<ReleaseNote | null> {
  const { data, error } = await client.from('release_notes').select(COLUMNS).eq('version', version).maybeSingle();
  if (error) throw error;
  return data ? toNote(data as ReleaseRow) : null;
}
