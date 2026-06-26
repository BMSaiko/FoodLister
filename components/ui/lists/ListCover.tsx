import React from "react";
import { Share2, Shuffle, Edit, Copy, Trash2, Globe, Lock, RefreshCw } from "lucide-react";
import Link from "next/link";

interface ListCoverProps {
  name: string;
  description?: string;
  isPublic?: boolean;
  restaurantCount: number;
  creator?: string;
  isOwner: boolean;
  duplicating: boolean;
  deleting: boolean;
  onShare: () => void;
  onRoulette: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  listId: string;
}

export default function ListCover({
  name, description, isPublic, restaurantCount, creator, isOwner,
  duplicating, deleting, onShare, onRoulette, onDuplicate, onDelete, listId
}: ListCoverProps) {
  // Generate gradient from name hash
  const getGradient = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    const h1 = Math.abs(hash % 360);
    const h2 = (h1 + 60) % 360;
    const h3 = (h1 + 120) % 360;
    return `linear-gradient(135deg, hsl(${h1},60%,12%) 0%, hsl(${h2},50%,10%) 50%, hsl(${h3},40%,8%) 100%)`;
  };

  return (
    <section className="relative w-full h-[30dvh] md:h-[45dvh] lg:h-[50dvh] overflow-hidden rounded-3xl mb-6">
      {/* Background gradient */}
      <div className="absolute inset-0" style={{ background: getGradient(name) }} />
      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/30 to-transparent" />

      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8 lg:p-10">
        <div className="max-w-7xl mx-auto">
          {/* Top row: privacy badge + actions */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-wrap items-center justify-end gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-xl border ${
                isPublic
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  : "bg-red-500/10 border-red-500/20 text-red-400"
              }`}>
                {isPublic ? <><Globe className="h-3 w-3" />Pública</> : <><Lock className="h-3 w-3" />Privada</>}
              </span>
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-white/[0.06] border border-white/[0.1] text-white/70 backdrop-blur-xl">
                {restaurantCount} restaurante{restaurantCount !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={onShare} className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full bg-white/[0.06] backdrop-blur-xl border border-white/[0.1] text-white/80 hover:bg-white/[0.12] transition-colors duration-150 text-sm font-medium min-h-[44px] hover:scale-105">
                <Share2 className="h-4 w-4" /><span className="hidden sm:inline">Partilhar</span>
              </button>
              <button onClick={onRoulette} className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-colors duration-150 text-sm font-medium min-h-[44px] hover:scale-105">
                <Shuffle className="h-4 w-4" /><span className="hidden sm:inline">Roleta</span>
              </button>
              {isOwner && (
                <>
                  <Link href={`/lists/${listId}/edit`} className="flex items-center justify-center w-11 h-11 rounded-full bg-white/[0.06] backdrop-blur-xl border border-white/[0.1] text-white/80 hover:bg-white/[0.12] transition-colors duration-150 hover:scale-105">
                    <Edit className="h-4 w-4" />
                  </Link>
                  <button onClick={onDuplicate} disabled={duplicating} className="flex items-center justify-center w-11 h-11 rounded-full bg-white/[0.06] backdrop-blur-xl border border-white/[0.1] text-white/80 hover:bg-white/[0.12] transition-colors duration-150 hover:scale-105 disabled:opacity-50">
                    {duplicating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Copy className="h-4 w-4" />}
                  </button>
                  <button onClick={onDelete} disabled={deleting} className="flex items-center justify-center w-11 h-11 rounded-full bg-red-500/10 backdrop-blur-xl border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors duration-150 hover:scale-105 disabled:opacity-50">
                    {deleting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white tracking-tighter leading-[1.08] mb-3">
            {name}
          </h1>
          {description && (
            <p className="text-base md:text-lg text-white/55 max-w-2xl leading-relaxed">{description}</p>
          )}
          {creator && (
            <p className="text-sm text-white/35 mt-2">Criada por {creator}</p>
          )}
        </div>
      </div>
    </section>
  );
}
