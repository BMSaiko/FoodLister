"use client";

import React from "react";
import Link from "next/link";
import { Share2, Shuffle, Edit, Copy, Trash2, MoreHorizontal, Filter } from "./MockIcons";
import { CreatorLink } from "@/components/ui/common/CreatorLink";
import ToviSpinner from "@/components/loading/ToviSpinner";
import { hashString, toviSrc } from "@/utils/toviPlaceholder";
import Icon from '@/components/ui/icons/Icon';

interface ListSidePanelProps {
  list: { id: string; name: string; description?: string };
  restaurants: any[];
  tags?: string[];
  isPublic?: boolean;
  creator?: string;
  creatorId?: string;
  createdAt: string;
  isOwner: boolean;
  canEdit: boolean;
  duplicating: boolean;
  deleting: boolean;
  avgRating?: number;
  avgPrice?: number;
  uniqueLocations?: number;
  showComments?: boolean;
  hasFilters: boolean;
  applyingFilters: boolean;
  onShare: () => void;
  onRoulette: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onApplyFilters: () => void;
  likeSlot?: React.ReactNode;
}

const iconBtn =
  "flex items-center justify-center w-11 h-11 rounded-[10px] border border-white/[0.08] bg-white/[0.03] text-white/80 hover:bg-white/[0.07] transition-colors duration-150";

const navBtn =
  "flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-[10px] border border-white/[0.08] bg-white/[0.03] text-sm text-white/80 hover:bg-white/[0.07] transition-colors duration-150";

const goTo = (id: string) => (e: React.MouseEvent) => {
  e.preventDefault();
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.getElementById(id)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
};

function cover(name: string) {
  const h = Math.abs(hashString(name) % 360);
  return `linear-gradient(135deg, hsl(${h},70%,15%), hsl(${(h + 60) % 360},60%,12%) 50%, hsl(${(h + 120) % 360},50%,10%))`;
}

export default function ListSidePanel({
  list, restaurants, tags, isPublic, creator, creatorId, createdAt, isOwner, canEdit, duplicating, deleting,
  avgRating, avgPrice, uniqueLocations, showComments, hasFilters, applyingFilters,
  onShare, onRoulette, onDuplicate, onDelete, onApplyFilters, likeSlot,
}: ListSidePanelProps) {
  const hasItems = restaurants.length > 0;
  const total = restaurants.length;
  const ratedCount = restaurants.filter((r) => r.rating != null && (r.review_count ?? 0) > 0).length;
  const pricedCount = restaurants.filter((r) => r.price_per_person != null).length;
  const noImg = restaurants.filter((r) => !r.images?.length).length;
  const pct = (n: number) => (total ? Math.round((n / total) * 100) : 0);
  const stat = (value: React.ReactNode, label: string) => (
    <div className="rounded-[10px] bg-white/[0.04] p-3">
      <div className="text-xl font-semibold text-white/90">{value}</div>
      <div className="mt-1 text-xs leading-snug text-white/50">{label}</div>
    </div>
  );
  const bar = (label: string, n: number) => (
    <div className="mt-3.5 first:mt-0">
      <div className="mb-1.5 text-xs text-white/50">{label}</div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
        <i className="block h-full bg-amber-500" style={{ width: `${pct(n)}%` }} />
      </div>
    </div>
  );

  return (
    <aside className="grid gap-3.5">
      <div className="rounded-[14px] border border-white/[0.08] bg-[#0c0c0c] p-5">
        <div className="relative h-24 overflow-hidden rounded-[10px]" style={{ background: cover(list.name) }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={toviSrc(list.name)} alt="" aria-hidden="true" className="absolute bottom-1.5 right-[12%] h-[84%] w-auto" />
        </div>

        <div className="mt-3.5 mb-3 flex flex-wrap items-center gap-2.5 text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/35 bg-amber-500/10 px-2.5 py-0.5 text-amber-300">
            {isPublic ? <Icon name="globo" className="h-3 w-3" /> : <Icon name="privado" className="h-3 w-3" />}
            {isPublic ? "Pública" : "Privada"}
          </span>
          <span className="text-white/50">{restaurants.length} restaurante{restaurants.length !== 1 ? "s" : ""}</span>
        </div>

        <h1 className="text-[26px] lg:text-3xl font-semibold leading-[1.05] tracking-tight text-balance break-words">{list.name}</h1>
        {list.description && <p className="mt-2.5 text-white/50">{list.description}</p>}
        {tags && tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {tags.map((t) => (
              <span key={t} className="rounded-md bg-white/[0.06] px-2 py-0.5 text-xs text-white/60">#{t}</span>
            ))}
          </div>
        )}
        {creator && (
          <p className="mt-3 text-[13px] text-white/50">
            Criada por <span className="text-amber-300"><CreatorLink creatorId={creatorId} name={creator} /></span>
            <br />
            {new Date(createdAt).toLocaleDateString("pt-PT", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        )}

        <div className="mt-4 flex items-center gap-2.5">
          <button
            onClick={onRoulette}
            disabled={!hasItems}
            className="flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-[10px] bg-amber-500 px-4 text-sm font-semibold text-[#111] transition-colors hover:bg-amber-400 disabled:opacity-50"
          >
            <Shuffle className="h-4 w-4" /> Roleta
          </button>
          {isOwner && (
            <details className="relative">
              <summary className={`${iconBtn} cursor-pointer list-none [&::-webkit-details-marker]:hidden`} aria-label="Mais ações">
                <MoreHorizontal className="h-[18px] w-[18px]" />
              </summary>
              <div className="absolute right-0 top-12 z-20 min-w-[250px] rounded-xl border border-white/[0.08] bg-[#111] p-1.5 shadow-[0_12px_30px_rgba(0,0,0,.5)]">
                <button
                  onClick={onDuplicate}
                  disabled={duplicating}
                  className="flex min-h-[44px] w-full items-center gap-2.5 rounded-lg px-3 text-left text-sm hover:bg-white/[0.06] disabled:opacity-50"
                >
                  {duplicating ? <ToviSpinner className="h-4 w-4" /> : <Copy className="h-4 w-4" />} Duplicar lista
                </button>
                <hr className="my-1 border-white/[0.08]" />
                <button
                  onClick={onDelete}
                  disabled={deleting}
                  className="flex min-h-[44px] w-full items-center gap-2.5 rounded-lg px-3 text-left text-sm text-red-400 hover:bg-white/[0.06] disabled:opacity-50"
                >
                  {deleting ? <ToviSpinner className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />} Eliminar lista
                </button>
              </div>
            </details>
          )}
        </div>

        <div className="mt-2.5 flex items-center gap-2.5">
          {likeSlot}
          <button onClick={onShare} aria-label="Partilhar" className={iconBtn}>
            <Share2 className="h-[18px] w-[18px]" />
          </button>
          {canEdit && (
            <Link href={`/lists/${list.id}/edit`} aria-label="Editar" className={iconBtn}>
              <Edit className="h-[18px] w-[18px]" />
            </Link>
          )}
        </div>

        <nav aria-label="Ir para secção" className="mt-2.5 flex items-center gap-2.5">
          {showComments && (
            <a href="#comentarios" onClick={goTo("comentarios")} className={navBtn}>
              <Icon name="mensagem-q" className="h-4 w-4" /> Comentários
            </a>
          )}
          <a href="#atividade" onClick={goTo("atividade")} className={navBtn}>
            <Icon name="atividade" className="h-4 w-4" /> Atividade
          </a>
        </nav>
      </div>

      {hasItems && (
      <div className="rounded-[14px] border border-white/[0.08] bg-[#0c0c0c] p-5">
        <h2 className="mb-3 text-[13px] font-medium uppercase tracking-[0.08em] text-white/50">Estatísticas</h2>
        <div className="grid grid-cols-2 gap-2.5">
          {stat(avgRating ? avgRating.toFixed(1) : "—", `rating médio · ${ratedCount} com rating`)}
          {stat(avgPrice ? `${avgPrice.toFixed(1)} €` : "—", `preço médio · ${pricedCount} com preço`)}
          {stat(uniqueLocations ?? "—", "locais únicos")}
          {stat(noImg, "sem imagem")}
        </div>
        <div className="mt-3.5">
          {bar("Com preço", pricedCount)}
          {bar("Com imagem", total - noImg)}
        </div>
        {hasFilters && (
          <button
            onClick={onApplyFilters}
            disabled={applyingFilters}
            className="mt-3 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-[10px] border border-white/[0.08] bg-white/[0.03] text-sm hover:bg-white/[0.07] disabled:opacity-50"
          >
            {applyingFilters ? <ToviSpinner className="h-4 w-4" /> : <Filter className="h-4 w-4" />} Aplicar filtros da lista
          </button>
        )}
      </div>
      )}
    </aside>
  );
}
