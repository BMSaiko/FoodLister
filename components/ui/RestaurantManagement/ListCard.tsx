'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Globe, Lock, Trash2, User, Tag } from 'lucide-react';
import { toast } from 'react-toastify';
import type { List } from '@/libs/types';
import ListCardCover from '@/components/ui/lists/ListCardCover';
import ListHoverPreview from '@/components/ui/lists/ListHoverPreview';

interface ListCardProps {
  list: List & { restaurants?: any[] };
  restaurantCount?: number;
  isOwner?: boolean;
  onDelete?: (listId: string) => void;
}

const ListCard = ({ list, restaurantCount = 0, isOwner = false, onDelete }: ListCardProps) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const isPublic = list.is_public !== false;
  const tags = (list as any).tags as string[] | undefined;
  const createdDate = new Date(list.created_at).toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

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

  return (
    <ListHoverPreview restaurants={list.restaurants || []}>
      <motion.article
        whileHover={{ y: -4 }}
        transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="group relative h-full"
      >
        <Link href={`/lists/${list.id}`} className="block h-full">
          <div className="rounded-2xl overflow-hidden bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.1] transition-all duration-150 h-full flex flex-col">
            {/* Cover */}
            <ListCardCover name={list.name} className="h-28 sm:h-32" />

            {/* Content */}
            <div className="p-4 sm:p-5 flex-1 flex flex-col">
              {/* Header */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-bold text-[var(--foreground)] line-clamp-1 group-hover:text-[var(--primary)] transition-colors">
                  {list.name}
                </h3>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium flex-shrink-0 ${
                  isPublic
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'bg-red-500/10 text-red-400'
                }`}>
                  {isPublic ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                  {isPublic ? 'Pública' : 'Privada'}
                </span>
              </div>

              {/* Description */}
              {list.description && (
                <p className="text-sm text-[var(--foreground-secondary)] line-clamp-2 mb-3 flex-1">
                  {list.description}
                </p>
              )}

              {/* Tags */}
              {tags && tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {tags.slice(0, 3).map((tag: string, i: number) => (
                    <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-medium">
                      <Tag className="w-2.5 h-2.5" />
                      {tag}
                    </span>
                  ))}
                  {tags.length > 3 && (
                    <span className="text-[10px] text-[var(--foreground-muted)] px-1">+{tags.length - 3}</span>
                  )}
                </div>
              )}

              {/* Footer */}
              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-[var(--foreground-muted)]">
                  <span className="bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full font-medium">
                    {restaurantCount} {restaurantCount === 1 ? 'restaurante' : 'restaurantes'}
                  </span>
                  <span>{createdDate}</span>
                </div>

                {list.creator && (
                  <div className="flex items-center gap-1 text-xs text-[var(--foreground-muted)]">
                    <User className="w-3 h-3" />
                    <span className="truncate max-w-[80px]">{list.creator}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Link>

        {/* Delete button */}
        {isOwner && (
          <button
            onClick={(e) => { e.preventDefault(); handleDelete(); }}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            title="Eliminar lista"
          >
            <Trash2 className="w-3.5 h-3.5 text-white/80" />
          </button>
        )}
      </motion.article>
    </ListHoverPreview>
  );
};

export default ListCard;
