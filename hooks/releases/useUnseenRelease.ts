'use client';

import { useCallback, useEffect, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getClient } from '@/libs/supabase/client';
import { useAuthUser } from '@/hooks/auth/useAuthUser';
import { compareReleasesDesc } from '@/libs/releases/order';

export const SEEN_KEY = 'fl:release-seen';
const SEEN_EVENT = 'fl:release-seen-change';

export interface UnseenRelease {
  version: string;
  title: string;
}

function readSeen(): string | null {
  try {
    return localStorage.getItem(SEEN_KEY);
  } catch {
    return null;
  }
}

// Os tipos gerados não cobrem `notifications`: cliente sem tipos para esta tabela.
const untyped = () => getClient() as unknown as SupabaseClient;
const releaseLink = (version: string) => `/novidades/${version}`;

/** Última release ainda não vista neste dispositivo (null se vista, inexistente ou erro). */
export default function useUnseenRelease() {
  const [latest, setLatest] = useState<UnseenRelease | null>(null);
  const [seen, setSeen] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthUser();
  const userId = user?.id ?? null;

  useEffect(() => {
    let alive = true;
    setSeen(readSeen());
    const sync = (e: Event) => setSeen((e as CustomEvent<string>).detail ?? readSeen());
    window.addEventListener(SEEN_EVENT, sync);
    (async () => {
      try {
        const { data } = await getClient()
          .from('release_notes')
          .select('version, title, released_at')
          .order('released_at', { ascending: false })
          .limit(5);
        const newest = ((data ?? []) as Array<{ version: string; title: string; released_at: string }>).sort(
          compareReleasesDesc,
        )[0];
        if (alive) setLatest(newest ? { version: newest.version, title: newest.title } : null);
      } catch {
        if (alive) setLatest(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
      window.removeEventListener(SEEN_EVENT, sync);
    };
  }, []);

  // Autenticado: a notificação já lida na BD conta como vista (outro dispositivo).
  const latestVersion = latest?.version ?? null;
  useEffect(() => {
    if (!userId || !latestVersion) return;
    let alive = true;
    (async () => {
      try {
        const { data } = await untyped()
          .from('notifications')
          .select('read')
          .eq('user_id', userId)
          .eq('type', 'release')
          .eq('link', releaseLink(latestVersion))
          .maybeSingle();
        if (alive && data?.read) setSeen(latestVersion);
      } catch {
        /* sem estado na BD: vale o localStorage */
      }
    })();
    return () => {
      alive = false;
    };
  }, [userId, latestVersion]);

  const markSeen = useCallback((version: string) => {
    try {
      localStorage.setItem(SEEN_KEY, version);
    } catch {
      /* sem localStorage: vale só nesta sessão */
    }
    setSeen(version);
    window.dispatchEvent(new CustomEvent(SEEN_EVENT, { detail: version }));
    if (!userId) return;
    return (async () => {
      try {
        await untyped()
          .from('notifications')
          .update({ read: true })
          .eq('user_id', userId)
          .eq('type', 'release')
          .eq('link', releaseLink(version));
      } catch {
        /* melhor esforço: o localStorage já regista a visita */
      }
    })();
  }, [userId]);

  const release = latest && latest.version !== seen ? latest : null;
  return { release, loading, markSeen };
}
