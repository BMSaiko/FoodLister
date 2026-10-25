"use client";

import { useEffect, useRef, useState } from "react";
import RestaurantCard from "@/components/ui/RestaurantCard";
import { RestaurantWithDetails } from "@/libs/types";
import { EmptyState } from "@/components/ui/common/EmptyState";
import Skeleton from "@/components/ui/Skeleton";

interface RestaurantGridProps {
  restaurants: RestaurantWithDetails[];
  searchQuery?: string | null;
  /** pagination: load next page when the sentinel becomes visible */
  hasMore?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
}

// 12 = mmc(1,2,3,4 colunas): cada bloco acaba sempre numa linha cheia, sem buracos ao mudar o nº de colunas
const CHUNK_SIZE = 12;
const GRID_CLASS = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4";

/**
 * Janela de renderização: cada bloco de 12 longe do ecrã troca os cartões por um espaço
 * com a altura medida, mantendo o DOM em poucos blocos (<=~60 cartões).
 */
function GridChunk({ restaurants }: { restaurants: RestaurantWithDetails[] }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const heightRef = useRef(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[entries.length - 1];
        if (entry.isIntersecting) setVisible(true);
        else {
          if (entry.boundingClientRect.height > 0) heightRef.current = entry.boundingClientRect.height;
          setVisible(false);
        }
      },
      { rootMargin: "800px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (!visible && heightRef.current > 0) {
    return <div ref={ref} aria-hidden="true" style={{ height: heightRef.current }} />;
  }
  return (
    <div ref={ref} className={GRID_CLASS}>
      {restaurants.map((restaurant) => (
        <div key={restaurant.id} className="h-full">
          <RestaurantCard restaurant={restaurant} />
        </div>
      ))}
    </div>
  );
}

export function RestaurantGrid({
  restaurants,
  searchQuery,
  hasMore,
  loadingMore,
  onLoadMore,
}: RestaurantGridProps) {
  // ponytail: IntersectionObserver sentinel at the end drives server pagination
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore || !onLoadMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) onLoadMore();
      },
      { rootMargin: "600px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, onLoadMore]);

  if (!restaurants || restaurants.length === 0) {
    return <EmptyState searchQuery={searchQuery || null} />;
  }

  const chunks: RestaurantWithDetails[][] = [];
  for (let i = 0; i < restaurants.length; i += CHUNK_SIZE) chunks.push(restaurants.slice(i, i + CHUNK_SIZE));

  return (
    <>
      <div className="space-y-4">
        {chunks.map((chunk) => (
          <GridChunk key={chunk[0].id} restaurants={chunk} />
        ))}
      </div>
      {hasMore && (
        <div ref={sentinelRef} aria-hidden="true" className="h-2" />
      )}
      {loadingMore && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="restaurant-card" />
          ))}
        </div>
      )}
    </>
  );
}
