'use client';

import { useState, useEffect, useCallback } from 'react';
import { Heart } from 'lucide-react';
import { useAuthUser } from '@/hooks/auth/useAuthUser';

// ponytail: like-only popularity. Toggle via /api/lists/[id]/like. No downvote.
export default function LikeButton({ listId }: { listId: string }) {
  const { user } = useAuthUser();
  const [count, setCount] = useState(0);
  const [liked, setLiked] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/lists/${listId}/like`, { credentials: 'include' });
      if (res.ok) { const d = await res.json(); setCount(d.count); setLiked(!!d.liked); }
    } catch { /* ignore */ }
  }, [listId]);

  useEffect(() => { load(); }, [load]);

  const toggle = async () => {
    if (!user) return;
    const res = await fetch(`/api/lists/${listId}/like`, { method: 'POST', credentials: 'include' });
    if (res.ok) { const d = await res.json(); setCount(d.count); setLiked(!!d.liked); }
  };

  return (
    <button
      onClick={toggle}
      disabled={!user}
      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-colors ${
        liked ? 'bg-red-500/15 text-red-400 ring-1 ring-red-500/30' : 'bg-white/5 text-white/60 ring-1 ring-white/10 hover:bg-white/10'
      } disabled:opacity-50`}
      title={user ? (liked ? 'Remover gosto' : 'Gosto nesta lista') : 'Entra para dar gosto'}
    >
      <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
      {count || ''}
    </button>
  );
}
