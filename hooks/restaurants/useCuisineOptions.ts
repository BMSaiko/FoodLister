"use client";

import { useEffect, useState } from "react";

export interface CuisineOption {
  id: string;
  name: string;
}

/** Cozinhas do filtro vêm de /api/cuisine-types (cache servidor 300s), não dos restaurantes carregados. */
export function useCuisineOptions(): CuisineOption[] {
  const [options, setOptions] = useState<CuisineOption[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/cuisine-types")
      .then((res) => (res.ok ? res.json() : null))
      .then((body) => {
        if (cancelled || !body || !Array.isArray(body.data)) return;
        setOptions(body.data.map((c: any) => ({ id: c.id, name: c.name })));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return options;
}
