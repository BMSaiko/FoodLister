"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/auth/useAuth";
import Navbar from "@/components/ui/navigation/Navbar";
import RestaurantRoulette from "@/components/ui/RestaurantRoulette";
import RestaurantCard from "@/components/ui/RestaurantCard";
import { Shuffle, Sparkles, List, ChevronDown } from "lucide-react";

interface Restaurant {
  id: string;
  name: string;
  image_url?: string;
  images?: string[];
  rating?: number;
  price_per_person?: number;
  location?: string;
  cuisine_types: any[];
  visited: boolean;
  features?: any[];
  dietary_options?: any[];
  created_at?: string;
  updated_at?: string;
}

interface UserList {
  id: string;
  name: string;
  restaurant_count: number;
}

export default function RoulettePage() {
  const { user } = useAuth();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [userLists, setUserLists] = useState<UserList[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRoulette, setShowRoulette] = useState(false);
  const [source, setSource] = useState<"all" | string>("all");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Fetch all restaurants the user has access to
        const res = await fetch("/api/restaurants?limit=100");
        if (res.ok) {
          const data = await res.json();
          setRestaurants(data.restaurants || []);
        }
        // Fetch user lists for filter
        if (user) {
          const listsRes = await fetch("/api/lists?limit=50");
          if (listsRes.ok) {
            const listsData = await listsRes.json();
            setUserLists(listsData.lists || []);
          }
        }
      } catch (e) { console.error("Error fetching data:", e); }
      finally { setLoading(false); }
    }
    fetchData();
  }, [user]);

  const filteredRestaurants = source === "all"
    ? restaurants
    : restaurants; // Will be filtered when list selection is implemented

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--background)" }}>
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/15 mb-5">
            <Sparkles className="h-4 w-4 text-purple-400" />
            <span className="text-xs font-semibold text-purple-300 uppercase tracking-wider">Roleta</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-4">
            Roleta de Restaurantes
          </h1>
          <p className="text-lg text-white/40 max-w-xl mx-auto">
            Nao consegue decidir onde comer? Deixe a roleta escolher o restaurante perfeito para si.
          </p>
        </div>

        {/* Source selector */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
          <div className="flex items-center gap-3">
            <span className="text-sm text-white/50">Fonte:</span>
            <div className="flex gap-2">
              <button
                onClick={() => setSource("all")}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  source === "all"
                    ? "bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/25"
                    : "bg-white/[0.04] text-white/50 border border-white/[0.06] hover:bg-white/[0.08]"
                }`}
              >
                Todos ({restaurants.length})
              </button>
              {userLists.map(list => (
                <button
                  key={list.id}
                  onClick={() => setSource(list.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    source === list.id
                      ? "bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/25"
                      : "bg-white/[0.04] text-white/50 border border-white/[0.06] hover:bg-white/[0.08]"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <List className="h-3.5 w-3.5" />
                    {list.name.length > 20 ? list.name.slice(0, 20) + "..." : list.name}
                    <span className="text-white/25">({list.restaurant_count})</span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setShowRoulette(true)}
            disabled={filteredRestaurants.length === 0}
            className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-bold text-base transition-all duration-300 min-h-[48px] ${
              filteredRestaurants.length === 0
                ? "bg-white/[0.04] text-white/20 cursor-not-allowed"
                : "bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500 text-white hover:shadow-xl hover:shadow-purple-500/20 hover:scale-[1.02] active:scale-[0.98]"
            }`}
          >
            <Shuffle className="h-5 w-5" />
            <span>Girar Roleta</span>
          </button>
        </div>

        {/* Restaurant preview grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse h-64 rounded-2xl bg-white/[0.04]" />
            ))}
          </div>
        ) : filteredRestaurants.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎰</div>
            <h3 className="text-xl font-bold text-white/50 mb-2">Sem restaurantes</h3>
            <p className="text-white/30">Adicione restaurantes para comecec a usar a roleta.</p>
          </div>
        ) : (
          <div>
            <p className="text-sm text-white/30 mb-4">{filteredRestaurants.length} restaurantes disponiveis</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRestaurants.slice(0, 9).map(r => (
                <RestaurantCard key={r.id} restaurant={r as any} />
              ))}
            </div>
            {filteredRestaurants.length > 9 && (
              <p className="text-center text-sm text-white/20 mt-4">+{filteredRestaurants.length - 9} mais</p>
            )}
          </div>
        )}
      </div>

      {/* Roulette Modal */}
      {showRoulette && (
        <RestaurantRoulette
          restaurants={filteredRestaurants}
          onClose={() => setShowRoulette(false)}
        />
      )}
    </div>
  );
}
