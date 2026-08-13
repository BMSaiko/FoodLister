/**
 * Resolve user_id_code (FL000001) + the real creator display name for a set
 * of restaurants/lists. Single helper used by the routes feeding CreatorLink —
 * ponytail: one `in()` query instead of a profiles join per row (no FK to
 * profiles). Also fixes rows whose creator_name is an email (legacy create
 * path fell back to `profile.display_name || user.email`).
 */
export async function attachCreatorCodes(
  client: any,
  rows: Array<{ creator_id?: string | null }>
): Promise<void> {
  const ids = Array.from(
    new Set((rows as any[]).map((r) => r.creator_id).filter(Boolean))
  ) as string[];
  if (ids.length === 0) return;
  const { data } = await client
    .from("profiles")
    .select("user_id, user_id_code, display_name")
    .in("user_id", ids);
  const byId = new Map<string, any>((data || []).map((p: any) => [p.user_id, p]));
  for (const r of rows) {
    const prof = r.creator_id ? byId.get(r.creator_id) : null;
    (r as any).creator_user_code = prof?.user_id_code ?? null;
    // prefer the live profile display_name over a legacy email snapshot
    (r as any).creator_display_name = prof?.display_name || (r as any).creator_name || null;
  }
}
