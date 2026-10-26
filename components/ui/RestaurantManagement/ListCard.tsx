'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import type { List } from '@/libs/types';
import ListCardCover from '@/components/ui/lists/ListCardCover';
import Icon from '@/components/ui/icons/Icon';

interface ListCardProps {
  list: List & { restaurants?: any[] };
  restaurantCount?: number;
  isOwner?: boolean;
  isAdmin?: boolean;
  onDelete?: (listId: string) => void;
}

const actBtn =
  'w-11 h-11 rounded-full bg-black/70 border border-white/35 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/90 transition-colors';

const ListCard = ({ list, restaurantCount = 0, isAdmin = false, onDelete }: ListCardProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [liked, setLiked] = useState(false);

  const isPublic = list.is_public !== false;
  // ponytail: nested count can be number | {count} | [{count}] depending on client
  const lc = list.like_count;
  const baseLikes = Array.isArray(lc) ? (lc[0]?.count ?? 0) : (typeof lc === 'object' && lc ? (lc.count ?? 0) : (typeof lc === 'number' ? lc : 0));
  const [likeCount, setLikeCount] = useState(baseLikes);
  const tags = (list as any).tags as string[] | undefined;
  const preview = list.preview || [];
  const href = `/lists/${list.slug || list.id}`;
  const creator = list.creator_display_name || list.creator_name || list.creator;
  const createdDate = new Date(list.created_at).toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  const peekNames = preview.map((p) => p.name).join(' · ');

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/lists/${list.id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete');
      toast.success('Lista eliminada!');
      onDelete?.(list.id);
    } catch {
      toast.error('Erro ao eliminar lista');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLike = async () => {
    try {
      const res = await fetch(`/api/lists/${list.id}/like`, { method: 'POST' });
      if (res.status === 401) { toast.info('Inicia sessão para gostar de listas'); return; }
      if (!res.ok) throw new Error('like');
      const data = await res.json();
      setLiked(!!data.liked);
      setLikeCount(data.count ?? 0);
    } catch {
      toast.error('Erro ao gostar da lista');
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}${href}`;
    try {
      if (navigator.share) await navigator.share({ title: list.name, url });
      else { await navigator.clipboard.writeText(url); toast.success('Ligação copiada!'); }
    } catch { /* partilha cancelada */ }
  };

  return (
    <article className="group relative flex flex-col gap-3.5">
      <Link href={href} className="flex flex-col gap-3.5 rounded-2xl">
        <div className="relative transition-transform duration-300 group-hover:-translate-y-0.5">
          <ListCardCover name={list.name} photos={preview} total={restaurantCount} />
          {peekNames && (
            <div className="pointer-events-none absolute inset-0 rounded-2xl flex items-end p-3 text-xs leading-snug text-white bg-gradient-to-b from-transparent from-40% to-black/85 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity [@media(hover:none)]:hidden">
              {peekNames}{restaurantCount > preview.length ? ` · +${restaurantCount - preview.length}` : ''}
            </div>
          )}
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${isPublic ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
            {isPublic ? <Icon name="globo" className="w-3 h-3" /> : <Icon name="privado" className="w-3 h-3" />}
            {isPublic ? 'Pública' : 'Privada'}
          </span>
          <span className="text-xs text-[var(--foreground-muted)]">
            {restaurantCount} {restaurantCount === 1 ? 'restaurante' : 'restaurantes'}
          </span>
        </div>
        <h3 className="after:absolute after:inset-0 after:content-[''] text-lg font-bold tracking-tight leading-tight text-[var(--foreground)] line-clamp-2 group-hover:text-[var(--primary)] transition-colors">
          {list.name}
        </h3>
        {list.description && (
          <p className="-mt-1.5 text-[13px] text-[var(--foreground-secondary)] line-clamp-2">{list.description}</p>
        )}
      </Link>

      {tags && tags.length > 0 && (
        <div className="relative z-[6] flex flex-wrap gap-2.5 pointer-events-none">
          {tags.slice(0, 3).map((tag, i) => (
            <span key={i} className="text-xs font-medium text-amber-400">#{tag}</span>
          ))}
          {tags.length > 3 && <span className="text-xs text-[var(--foreground-muted)]">+{tags.length - 3}</span>}
        </div>
      )}

      <div className="relative z-[6] pt-3 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 text-xs text-[var(--foreground-muted)]">
        <div className="flex items-center gap-3">
          {creator && (
            <Link
              href={`/users/${list.creator_user_code || list.creator_id}`}
              className="inline-flex items-center gap-1 hover:text-[var(--primary)] hover:underline transition-colors"
              title={creator}
            >
              <Icon name="perfil" className="w-3 h-3" />
              <span className="truncate max-w-[110px]">{creator}</span>
            </Link>
          )}
          {likeCount > 0 && (
            <span className="inline-flex items-center gap-1 text-red-400/80">
              <Icon name="coracao" className="w-3 h-3 fill-current" /> {likeCount}
            </span>
          )}
        </div>
        <span>{createdDate}</span>
      </div>

      <div className="absolute z-[5] top-2.5 right-2.5 flex gap-1.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity [@media(hover:none)]:opacity-100">
        <button type="button" onClick={handleLike} aria-pressed={liked} aria-label={`Gostar de ${list.name}`} className={`${actBtn} ${liked ? 'text-red-400' : ''}`}>
          <Icon name="coracao" className={`w-[18px] h-[18px] ${liked ? 'fill-current' : ''}`} />
        </button>
        <button type="button" onClick={handleShare} aria-label={`Partilhar ${list.name}`} className={actBtn}>
          <Icon name="partilhar" className="w-[18px] h-[18px]" />
        </button>
        {isAdmin && (
          <button type="button" onClick={handleDelete} disabled={isDeleting} aria-label={`Eliminar lista ${list.name}`} className={actBtn}>
            <Icon name="apagar" className="w-[18px] h-[18px]" />
          </button>
        )}
      </div>
    </article>
  );
};

export default ListCard;
