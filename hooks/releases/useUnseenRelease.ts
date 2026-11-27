'use client';

import { useCallback, useEffect, useState } from 'react';
import { getClient } from '@/libs/supabase/client';

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

/** Última release ainda não vista neste dispositivo (null se vista, inexistente ou erro). */
export default function useUnseenRelease() {
  const [latest, setLatest] = useState<UnseenRelease | null>(null);
  const [seen, setSeen] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setSeen(readSeen());
    const sync = (e: Event) => setSeen((e as CustomEvent<string>).detail ?? readSeen());
    window.addEventListener(SEEN_EVENT, sync);
    (async () => {
      try {
        const { data } = await getClient()
          .from('release_notes')
          .select('version, title')
          .order('released_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (alive) setLatest(data ?? null);
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

  const markSeen = useCallback((version: string) => {
    try {
      localStorage.setItem(SEEN_KEY, version);
    } catch {
      /* sem localStorage: vale só nesta sessão */
    }
    setSeen(version);
    window.dispatchEvent(new CustomEvent(SEEN_EVENT, { detail: version }));
  }, []);

  const release = latest && latest.version !== seen ? latest : null;
  return { release, loading, markSeen };
}
