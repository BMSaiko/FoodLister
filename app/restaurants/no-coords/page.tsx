"use client";

import React from "react";
import Navbar from "@/components/ui/navigation/Navbar";
import { MapPinOff } from "lucide-react";
import Link from "next/link";

interface NoCoordsRestaurant {
  id: string;
  name: string;
  location: string | null;
  creator_name: string | null;
}

export default function NoCoordsPage() {
  const [restaurants, setRestaurants] = React.useState<NoCoordsRestaurant[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetch("/api/restaurants/no-coords")
      .then((r) => r.json())
      .then((data) => {
        setRestaurants(data.restaurants || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <main className="min-h-[100dvh] bg-[var(--background)]">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <h1 className="text-2xl font-bold text-white/90 mb-2">
          Restaurantes sem coordenadas
        </h1>
        <p className="text-sm text-white/40 mb-6">
          Estes restaurantes existem na base de dados mas ainda não têm latitude/longitude.
          Adicionar coordenadas permite que apareçam no mapa mundial.
        </p>

        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 rounded-xl bg-white/[0.03] border border-white/[0.06] animate-pulse" />
            ))}
          </div>
        )}

        {error && (
          <p className="text-red-400 text-sm">Erro ao carregar: {error}</p>
        )}

        {!loading && !error && restaurants.length === 0 && (
          <div className="text-center py-12 text-white/30">
            Todos os restaurantes têm coordenadas! 🎉
          </div>
        )}

        {!loading && !error && restaurants.length > 0 && (
          <>
            <p className="text-sm text-white/30 mb-4">
              {restaurants.length} restaurante(s) sem coordenadas
            </p>
            <ul className="space-y-2">
              {restaurants.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]"
                >
                  <MapPinOff className="w-5 h-5 text-amber-400/50 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/restaurants/${r.id}`}
                      className="text-sm font-medium text-white/80 hover:text-amber-400 transition-colors"
                    >
                      {r.name}
                    </Link>
                    <p className="text-xs text-white/30 mt-0.5">
                      {r.location || "Sem localização"}
                      {r.creator_name && ` • adicionado por ${r.creator_name}`}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </main>
  );
}
