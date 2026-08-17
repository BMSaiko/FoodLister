// Feed logic puro — sem I/O, testável. Merge de 3 fontes (reviews/lists/follows)
// + profiles, filtro público, sort desc, paginação slice.
// ponytail: janela recente fixa por fonte; RPC/View no Postgres p/ true full-history.

export const SOURCE_LIMIT = 30;

interface RawProfile { user_id: string; display_name?: string | null; avatar_url?: string | null; user_id_code?: string | null; public_profile?: boolean | null; }

export interface FeedItem {
  id: string;
  type: "review" | "list" | "follow";
  actor: { name: string; avatar: string | null; user_id_code: string | null };
  text: string;
  link: string;
  createdAt: string;
}

export function buildFeedItems(
  reviews: any[],
  lists: any[],
  follows: any[],
  profileRows: RawProfile[],
  offset: number,
  limit: number
): { data: FeedItem[]; total: number; hasMore: boolean } {
  const profileMap = new Map(profileRows.map((p) => [p.user_id, p]));

  // ponytail: esconde só actor explicitamente privado; sem perfil = visível (legacy)
  const isPublic = (id: string) => (profileMap.get(id) as RawProfile | undefined)?.public_profile !== false;
  const actor = (id: string, fallback: string): FeedItem["actor"] => {
    const p = profileMap.get(id) as RawProfile | undefined;
    return { name: p?.display_name || fallback || "Utilizador", avatar: p?.avatar_url ?? null, user_id_code: p?.user_id_code ?? null };
  };

  const items: FeedItem[] = [];
  for (const r of reviews) {
    if (!isPublic(r.user_id)) continue;
    items.push({
      id: `review-${r.id}`, type: "review",
      actor: actor(r.user_id, r.user_name),
      text: `fez um review em ${r.restaurants?.name || "um restaurante"}`,
      link: `/restaurants/${r.restaurants?.slug || r.restaurants?.id || ""}`,
      createdAt: r.created_at,
    });
  }
  for (const l of lists) {
    if (!isPublic(l.creator_id)) continue;
    items.push({
      id: `list-${l.id}`, type: "list",
      actor: actor(l.creator_id, l.creator_name),
      text: `criou a lista ${l.name || ""}`,
      link: `/lists/${l.slug || l.id}`,
      createdAt: l.created_at,
    });
  }
  for (const f of follows) {
    if (!isPublic(f.follower_id)) continue;
    const target = profileMap.get(f.following_id) as RawProfile | undefined;
    items.push({
      id: `follow-${f.id}`, type: "follow",
      actor: actor(f.follower_id, ""),
      text: `começou a seguir ${target?.display_name || "outro utilizador"}`,
      link: `/users/${target?.user_id_code || f.following_id}`,
      createdAt: f.created_at,
    });
  }

  items.sort((a, b) => (b.createdAt < a.createdAt ? -1 : 1));
  return { data: items.slice(offset, offset + limit), total: items.length, hasMore: offset + limit < items.length };
}
