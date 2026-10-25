"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { MapPin, Star, Trash2, List as ListIcon, LayoutGrid } from "./MockIcons";
import { toviSrc } from "@/utils/toviPlaceholder";

interface ListRestaurantViewProps {
  restaurants: any[];
  totalCount: number;
  canRemove?: boolean;
  onRemove?: (restaurantId: string) => Promise<void> | void;
}

type Layout = "list" | "tiles";
type Sort = "ord" | "nome" | "preco" | "rating";

const chipBase = "inline-flex min-h-[36px] flex-shrink-0 items-center rounded-full border px-3.5 text-[13px] transition-colors";
const field = "min-h-[44px] rounded-[10px] border border-white/[0.08] bg-white/[0.03] px-3.5 text-inherit";

function imageOf(r: any): string | null {
  const imgs: string[] | undefined = r.images;
  if (!imgs?.length) return null;
  const idx = r.display_image_index;
  return imgs[idx != null && idx >= 0 && idx < imgs.length ? idx : 0] || null;
}

function shortLoc(loc?: string): string {
  if (!loc) return "";
  const parts = loc.split(",").map((p) => p.trim()).filter(Boolean);
  return parts.slice(0, 2).join(", ");
}

function Thumb({ r }: { r: any }) {
  const src = imageOf(r);
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={r.name} loading="lazy" className="h-full w-full object-cover" />
  ) : (
    <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-[#0c0c0c]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={toviSrc(r.name || "")} alt="" aria-hidden="true" className="h-auto w-[min(56px,60%)]" />
    </div>
  );
}

export default function ListRestaurantView({ restaurants, totalCount, canRemove = false, onRemove }: ListRestaurantViewProps) {
  const [cuisine, setCuisine] = useState<string | null>(null);
  const [layout, setLayout] = useState<Layout>("list");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("ord");

  const cuisines = useMemo(() => {
    const map = new Map<string, number>();
    restaurants.forEach((r) =>
      (r.cuisine_types || []).forEach((c: any) => {
        const name = c.cuisine_type?.name || c.name || "Outro";
        map.set(name, (map.get(name) || 0) + 1);
      })
    );
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [restaurants]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    let out = restaurants.filter(
      (r) =>
        (!cuisine || (r.cuisine_types || []).some((c: any) => (c.cuisine_type?.name || c.name) === cuisine)) &&
        (!q || `${r.name || ""} ${r.location || ""}`.toLowerCase().includes(q))
    );
    if (sort === "nome") out = [...out].sort((a, b) => (a.name || "").localeCompare(b.name || "", "pt"));
    if (sort === "preco") out = [...out].sort((a, b) => (a.price_per_person ?? 1e9) - (b.price_per_person ?? 1e9));
    if (sort === "rating") out = [...out].sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1));
    return out;
  }, [restaurants, cuisine, query, sort]);

  const removeBtn = (r: any, cls: string) =>
    canRemove && onRemove ? (
      <button
        type="button"
        aria-label={`Remover ${r.name}`}
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRemove(r.id); }}
        className={cls}
      >
        <Trash2 className="h-[18px] w-[18px]" />
      </button>
    ) : null;

  if (restaurants.length === 0) {
    return (
      <div className="rounded-[14px] border border-dashed border-white/[0.08] px-4 py-16 text-center text-white/50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/mascot/tovi-a-pensar.svg" alt="" aria-hidden="true" width={72} height={72} className="mx-auto mb-3" />
        <b className="mb-1.5 block text-[17px] text-white/90">Não há restaurantes nesta lista</b>
        Adiciona restaurantes a partir da página de cada restaurante.
        <div className="mt-5">
          <Link href="/restaurants" className="inline-flex min-h-[44px] items-center rounded-[10px] bg-amber-500 px-4 text-sm font-semibold text-[#111] hover:bg-amber-400">
            Explorar restaurantes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <section>
      {cuisines.length > 0 && (
        <div className="mb-3.5 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => setCuisine(null)}
            className={`${chipBase} ${!cuisine ? "border-amber-500/40 bg-amber-500/15 text-amber-300" : "border-white/[0.08] text-white/50"}`}
          >
            Todas
          </button>
          {cuisines.map(([name, count]) => (
            <button
              key={name}
              onClick={() => setCuisine(cuisine === name ? null : name)}
              className={`${chipBase} ${cuisine === name ? "border-amber-500/40 bg-amber-500/15 text-amber-300" : "border-white/[0.08] text-white/50"}`}
            >
              {name} <span className="ml-1.5 text-white/30">{count}</span>
            </button>
          ))}
        </div>
      )}

      <div className="mb-2.5 flex flex-wrap items-center gap-2.5">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Pesquisar por nome ou morada"
          aria-label="Pesquisar restaurantes"
          className={`${field} min-w-[180px] flex-1`}
        />
        <select aria-label="Ordenar" value={sort} onChange={(e) => setSort(e.target.value as Sort)} className={`${field} bg-[#111]`}>
          <option value="ord">Ordem da lista</option>
          <option value="nome">Nome</option>
          <option value="preco">Preço</option>
          <option value="rating">Rating</option>
        </select>
        <div className="inline-flex overflow-hidden rounded-[10px] border border-white/[0.08]" role="group" aria-label="Vista">
          {([["list", "Lista", ListIcon], ["tiles", "Mosaico", LayoutGrid]] as const).map(([k, label, Icon]) => (
            <button
              key={k}
              aria-label={label}
              aria-pressed={layout === k}
              onClick={() => setLayout(k)}
              className={`grid min-h-[44px] min-w-[44px] place-items-center ${layout === k ? "bg-amber-500/15 text-amber-300" : "text-white/50"}`}
            >
              <Icon className="h-[18px] w-[18px]" />
            </button>
          ))}
        </div>
      </div>

      <div className="mb-2.5 text-[13px] text-white/50" aria-live="polite">
        {visible.length} de {totalCount} restaurantes
      </div>

      {visible.length === 0 ? (
        <div className="rounded-[14px] border border-dashed border-white/[0.08] px-4 py-14 text-center text-white/50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/mascot/tovi-a-pensar.svg" alt="" aria-hidden="true" width={72} height={72} className="mx-auto mb-3" />
          <b className="mb-1.5 block text-[17px] text-white/90">Nenhum resultado</b>
          Tenta outro nome, morada ou cozinha.
          <div className="mt-4">
            <button
              onClick={() => { setQuery(""); setCuisine(null); }}
              className="min-h-[44px] rounded-[10px] border border-white/[0.08] bg-white/[0.03] px-4 text-sm hover:bg-white/[0.07]"
            >
              Limpar pesquisa
            </button>
          </div>
        </div>
      ) : layout === "list" ? (
        <div className="grid gap-2">
          {visible.map((r) => (
            <Link
              key={r.id}
              href={`/restaurants/${r.slug || r.id}`}
              className="relative grid grid-cols-[64px_1fr_auto] items-center gap-3 rounded-[14px] border border-white/[0.08] bg-[#0c0c0c] p-2 transition-colors hover:border-amber-500/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-500 sm:grid-cols-[76px_1fr_auto] sm:gap-3.5 sm:px-3 sm:py-2.5"
            >
              <div className="h-16 w-16 overflow-hidden rounded-[10px] sm:h-[76px] sm:w-[76px]"><Thumb r={r} /></div>
              <div className="grid min-w-0 gap-0.5">
                <div className="line-clamp-2 break-words font-semibold">{r.name}</div>
                <div className="line-clamp-1 flex items-center gap-1 text-[13px] text-white/50" title={r.location}>
                  <MapPin className="h-3.5 w-3.5 flex-none" /> {shortLoc(r.location)}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-white/[0.06] px-2 py-0.5 text-xs text-white/50">
                  {r.price_per_person ? `${r.price_per_person} €` : "sem preço"}
                </span>
                {r.rating ? (
                  <span className="inline-flex items-center gap-1 rounded-md bg-white/[0.06] px-2 py-0.5 text-xs text-white/50">
                    <Star className="h-3 w-3" /> {r.rating}
                  </span>
                ) : null}
                {removeBtn(r, "grid h-11 w-11 place-items-center rounded-[10px] text-red-400 hover:bg-white/[0.06]")}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          {visible.map((r) => (
            <Link
              key={r.id}
              href={`/restaurants/${r.slug || r.id}`}
              className="group relative block overflow-hidden rounded-[14px] border border-white/[0.08] bg-[#0c0c0c] transition-colors hover:border-amber-500/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-500"
            >
              <div className="aspect-square"><Thumb r={r} /></div>
              <div className="px-3 py-2.5">
                <div className="line-clamp-2 break-words font-semibold">{r.name}</div>
                <div className="line-clamp-1 text-[13px] text-white/50">
                  {shortLoc(r.location)} · {r.price_per_person ? `${r.price_per_person} €` : "sem preço"}
                </div>
              </div>
              {removeBtn(r, "absolute right-2 top-2 grid h-11 w-11 place-items-center rounded-[10px] bg-black/65 text-red-400 opacity-100 transition-opacity [@media(hover:hover)]:opacity-0 group-hover:opacity-100 focus-visible:opacity-100")}
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
