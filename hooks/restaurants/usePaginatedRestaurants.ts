"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { RestaurantWithDetails } from "@/libs/types";
import { shuffleArray } from "@/utils/random";
import { useAuthUser } from "@/hooks/auth/useAuthUser";

export const PAGE_SIZE = 21;

export interface RestaurantQueryFilters {
  cuisines: string[];
  priceMin: number | null;
  priceMax: number | null;
  ratingMin: number | null;
  location: string;
}

interface UsePaginatedRestaurantsOptions {
  searchQuery?: string | null;
  /** filtros enviados ao servidor; mudar reinicia na página 1 */
  filters?: Partial<RestaurantQueryFilters>;
  /** "random" pede ordem estável ao servidor e baralha só a 1.ª página */
  sortBy?: string;
  sortDirection?: string;
}

interface UsePaginatedRestaurantsReturn {
  restaurants: RestaurantWithDetails[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasNext: boolean;
  total: number;
  loadMore: () => void;
  refetch: () => void;
}

export function buildRestaurantParams(
  page: number,
  searchQuery: string | null,
  filters: Partial<RestaurantQueryFilters>,
  sortBy: string,
  sortDirection: string
): URLSearchParams {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(PAGE_SIZE));
  params.set("sort_by", sortBy === "random" ? "name" : sortBy);
  params.set("sort_direction", sortDirection);
  if (searchQuery) params.set("search", searchQuery);
  if (filters.cuisines?.length) params.set("cuisines", filters.cuisines.join(","));
  if (filters.priceMin != null) params.set("price_min", String(filters.priceMin));
  if (filters.priceMax != null) params.set("price_max", String(filters.priceMax));
  if (filters.ratingMin != null) params.set("rating_min", String(filters.ratingMin));
  if (filters.location?.trim()) params.set("location", filters.location.trim());
  return params;
}

/** Feed paginado 21/página; pesquisa, filtros e ordenação são do servidor (nunca limit=all). */
export function usePaginatedRestaurants(
  options: UsePaginatedRestaurantsOptions | null
): UsePaginatedRestaurantsReturn {
  const { user } = useAuthUser();
  const searchQuery = options?.searchQuery ?? null;
  const sortBy = options?.sortBy ?? "name";
  const sortDirection = options?.sortDirection ?? "asc";
  const filters = options?.filters;
  // chave estável: o objeto de filtros muda de identidade a cada render do pai
  const filtersKey = JSON.stringify(filters ?? {});

  const nextPageRef = useRef(1);
  const requestIdRef = useRef(0);
  const [restaurants, setRestaurants] = useState<RestaurantWithDetails[]>([]);
  const [hasNext, setHasNext] = useState(false);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPage = useCallback(async (pageNumber: number, append: boolean) => {
    const requestId = ++requestIdRef.current;
    append ? setLoadingMore(true) : setLoading(true);
    setError(null);
    try {
      const params = buildRestaurantParams(pageNumber, searchQuery, JSON.parse(filtersKey), sortBy, sortDirection);
      const response = await fetch(`/api/restaurants?${params.toString()}`);
      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        throw new Error(`API error ${response.status}: ${errorText}`);
      }
      const data = await response.json();
      if (requestId !== requestIdRef.current) return; // resposta de filtros antigos
      const items: RestaurantWithDetails[] = Array.isArray(data.restaurants) ? data.restaurants : [];
      // ponytail: baralhar só a 1.ª página (não o append) para o feed vir em ordem nova a cada carga
      const pageItems = append || sortBy !== "random" ? items : shuffleArray(items, user?.id);
      setRestaurants(prev => (append ? [...prev, ...items] : pageItems));
      setHasNext(Boolean(data.pagination?.hasNext));
      setTotal(typeof data.pagination?.total === "number" ? data.pagination.total : 0);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setError(err instanceof Error ? err.message : "Unknown error");
      if (!append) setRestaurants([]);
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  }, [searchQuery, filtersKey, sortBy, sortDirection, user?.id]);

  // Reinicia na página 1 quando pesquisa, filtros ou ordenação mudam
  useEffect(() => {
    nextPageRef.current = 1;
    fetchPage(1, false);
    // ponytail: user?.id fica de fora para não refazer o feed quando a sessão resolve
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, filtersKey, sortBy, sortDirection]);

  const loadMore = useCallback(() => {
    if (loading || loadingMore || !hasNext) return;
    nextPageRef.current += 1;
    fetchPage(nextPageRef.current, true);
  }, [loading, loadingMore, hasNext, fetchPage]);

  const refetch = useCallback(() => {
    nextPageRef.current = 1;
    fetchPage(1, false);
  }, [fetchPage]);

  return { restaurants, loading, loadingMore, error, hasNext, total, loadMore, refetch };
}
