// libs/slug.ts — resolução de URLs amigáveis (T64).
// ponytail: só o mínimo — detetar se o param é UUID (mantém links antigos) vs slug.
export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function isUuid(id: string): boolean {
  return UUID_RE.test(id);
}

/** Resolve o param de URL (UUID ou slug) para o id real da lista. null se a list nao existe nao for encontrada ou o client faltar. */
export async function resolveListId(supabase: any, param: string): Promise<string | null> {
  if (!supabase) return null;
  if (isUuid(param)) return param;
  const { data } = await supabase.from('lists').select('id').eq('slug', param).maybeSingle();
  return data?.id ?? null;
}

/** Resolve o param de URL (UUID ou slug) para o id real do restaurante. null se nao existir ou o client faltar. */
export async function resolveRestaurantId(supabase: any, param: string): Promise<string | null> {
  if (!supabase) return null;
  if (isUuid(param)) return param;
  const { data } = await supabase.from('restaurants').select('id').eq('slug', param).maybeSingle();
  return data?.id ?? null;
}
