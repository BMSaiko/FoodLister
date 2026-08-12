/**
 * Mention helpers (T36) — parse @names, resolve display_name -> user_id, notify.
 * ponytail: display_name is not unique; we resolve by exact display_name match
 * (best-effort). user_id_code is unique but users type @display_name, not @FLxxxxxx.
 */
import { createNotification } from "@/libs/notifications/service";
import type { SupabaseClient, User } from "@supabase/supabase-js";

/** Extract distinct @mentions (display names) from text. Skips @FL###### codes. */
export function extractMentionNames(text: string): string[] {
  // ponytail: full display names may contain spaces; words joined by single space.
  const names = text.match(/@([\p{L}\p{N}_'\-.]+(?: [\p{L}\p{N}_'\-.]+)*)/gu) || [];
  return Array.from(new Set(
    names.map(n => n.slice(1).trim()).filter(n => n.length > 0 && !/^FL\d{6}$/i.test(n))
  ));
}

/** Resolve mention names to user ids via profiles.display_name (exact). */
export async function resolveMentionUsers(
  supabase: SupabaseClient,
  names: string[]
): Promise<{ user_id: string; name: string }[]> {
  if (names.length === 0) return [];
  const { data, error } = await supabase
    .from("profiles")
    .select("user_id, display_name")
    .in("display_name", names);
  if (error || !data) return [];
  return data
    .filter(p => p.display_name && names.includes(p.display_name))
    .map(p => ({ user_id: p.user_id, name: p.display_name as string }));
}

/**
 * Notify every mentioned user (except the author) once. Best-effort: failures
 * are swallowed (notification is non-critical).
 */
export async function notifyMentionedUsers(
  supabase: SupabaseClient,
  text: string,
  author: User,
  opts: { type: string; title: string; message: string; link?: string }
): Promise<void> {
  try {
    const names = extractMentionNames(text);
    if (names.length === 0) return;
    const users = await resolveMentionUsers(supabase, names);
    for (const u of users) {
      if (u.user_id === author.id) continue;
      createNotification({
        userId: u.user_id,
        type: opts.type,
        title: opts.title,
        message: opts.message,
        link: opts.link ?? null,
      }).catch(() => {});
    }
  } catch (e) {
    console.error("[mentions] notify failed:", e);
  }
}
