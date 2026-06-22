import React, { useState, useMemo, useRef, useEffect } from "react";
import RestaurantCard from "@/components/ui/RestaurantCard";

interface ListRestaurantGridProps {
  restaurants: any[];
  visitsData: Record<string, any>;
  loadingVisits: boolean;
  onVisitsDataUpdate: (id: string, data: { visited: boolean; visit_count: number }) => void;
}

export default function ListRestaurantGrid({ restaurants, visitsData, loadingVisits, onVisitsDataUpdate }: ListRestaurantGridProps) {
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setIsVisible(true); }, { threshold: 0.05 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Extract unique cuisines
  const cuisines = useMemo(() => {
    const map = new Map<string, number>();
    restaurants.forEach(r => {
      (r.cuisine_types || []).forEach((c: any) => {
        const name = c.cuisine_type?.name || c.name || "Outro";
        map.set(name, (map.get(name) || 0) + 1);
      });
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [restaurants]);

  const filtered = useMemo(() => {
    if (!selectedCuisine) return restaurants;
    return restaurants.filter(r =>
      (r.cuisine_types || []).some((c: any) => (c.cuisine_type?.name || c.name) === selectedCuisine)
    );
  }, [restaurants, selectedCuisine]);

  if (restaurants.length === 0) {
    return (
      <div className="text-center py-16 rounded-3xl bg-white/[0.02] border border-white/[0.04]">
        <p className="text-lg text-white/40">Nao ha restaurantes nesta lista.</p>
      </div>
    );
  }

  return (
    <section ref={scrollRef} className="mb-8">
      <h2 className="text-xl md:text-2xl font-bold text-white mb-4">
        Restaurantes <span className="text-white/30 font-normal text-base">({filtered.length})</span>
      </h2>

      {/* Cuisine filter chips */}
      {cuisines.length > 0 && (
        <div className="flex gap-2 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-3 mb-4">
          <button
            onClick={() => setSelectedCuisine(null)}
            className={
              "flex-shrink-0 snap-start px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 " +
              (!selectedCuisine
                ? "bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/25"
                : "bg-white/[0.04] text-white/50 border border-white/[0.06] hover:bg-white/[0.08]")
            }
          >
            Todos
          </button>
          {cuisines.map(([name, count]) => (
            <button
              key={name}
              onClick={() => setSelectedCuisine(selectedCuisine === name ? null : name)}
              className={
                "flex-shrink-0 snap-start px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 " +
                (selectedCuisine === name
                  ? "bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/25"
                  : "bg-white/[0.04] text-white/50 border border-white/[0.06] hover:bg-white/[0.08]")
              }
            >
              {name} <span className="text-white/25 ml-1">{count}</span>
            </button>
          ))}
        </div>
      )}

      {/* Masonry Grid */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 transition-all duration-500 ${isVisible ? "opacity-100" : "opacity-0"}`}>
        {filtered.map((restaurant, i) => (
          <div
            key={restaurant.id}
            className="transition-all duration-500"
            style={{ transitionDelay: `${i * 50}ms` }}
          >
            <RestaurantCard
              restaurant={restaurant}
              variant={i === 0 && !selectedCuisine ? "large" : "small"}
              visitsData={visitsData[restaurant.id] || null}
              loadingVisits={loadingVisits}
              onVisitsDataUpdate={onVisitsDataUpdate}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
