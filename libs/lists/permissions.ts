"use server";

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

type DbList = Database['public']['Tables']['lists']['Row'];

export type ListRole = 'owner' | 'editor' | 'viewer' | 'none';

export interface ListContext {
  list: DbList;
  role: ListRole;
}

/**
 * Resolve the current user's role for a list.
 * One query for list, second for collaborator row — avoids N+1 and RLS cycles.
 */
export async function getListRole(
  supabase: SupabaseClient,
  listId: string,
  userId: string
): Promise<ListRole> {
  // Fetch list to check ownership
  const { data: list } = await supabase
    .from('lists')
    .select('creator_id')
    .eq('id', listId)
    .single();

  if (!list) return 'none';
  if (list.creator_id === userId) return 'owner';

  // Check collaborator status
  const { data: collab } = await supabase
    .from('list_collaborators')
    .select('role')
    .eq('list_id', listId)
    .eq('user_id', userId)
    .single();

  return (collab?.role as ListRole) ?? 'none';
}
