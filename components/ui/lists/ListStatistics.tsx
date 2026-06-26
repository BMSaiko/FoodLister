import React, { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Star, Euro, MapPin, XCircle, TrendingUp, UtensilsCrossed } from "lucide-react";

const COLORS = ["#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ef4444", "#ec4899", "#f97316", "#14b8a6"];

interface ListStatisticsProps {
  restaurants: any[];
}

export default function ListStatistics({ restaurants }: ListStatisticsProps) {
  const stats = useMemo(() => {
    if (!restaurants.length) return null;
    const ratings = restaurants.filter(r => r.rating != null).map(r => r.rating);
    const prices = restaurants.filter(r => r.price_per_person != null).map(r => r.price_per_person);
    const locations = [...new Set(restaurants.filter(r => r.location).map(r => r.location))];

    // Cuisine distribution
    const cuisineCount: Record<string, number> = {};
    restaurants.forEach(r => {
      (r.cuisine_types || []).forEach((c: any) => {
        const name = c.cuisine_type?.name || c.name || "Outro";
        cuisineCount[name] = (cuisineCount[name] || 0) + 1;
      });
    });
    const cuisineData = Object.entries(cuisineCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, value]) => ({ name, value }));

    // Price distribution
    const priceRanges = [
      { label: "€", min: 0, max: 15, count: 0 },
      { label: "€€", min: 15, max: 30, count: 0 },
      { label: "€€€", min: 30, max: 50, count: 0 },
      { label: "€€€€", min: 50, max: Infinity, count: 0 },
    ];
    prices.forEach(p => {
      const range = priceRanges.find(r => p >= r.min && p < r.max);
      if (range) range.count++;
    });

    return {
      avgRating: ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null,
      avgPrice: prices.length ? prices.reduce((a, b) => a + b, 0) / prices.length : null,
      minPrice: prices.length ? Math.min(...prices) : null,
      maxPrice: prices.length ? Math.max(...prices) : null,
      uniqueLocations: locations.length,
      totalRestaurants: restaurants.length,
      cuisineData,
      priceRanges: priceRanges.filter(r => r.count > 0),
    };
  }, [restaurants]);

  if (!stats) return null;

  return (
    <section className="mb-8">
      <h2 className="text-xl md:text-2xl font-bold text-white mb-5">Estatisticas</h2>

      {/* Top metrics row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <div className="p-1.5 rounded-3xl bg-white/[0.02] border border-white/[0.06]">
          <div className="p-3 sm:p-4 rounded-2xl bg-white/[0.03] h-full">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-amber-500/10 rounded-lg p-1.5"><Star className="h-4 w-4 text-amber-400" /></div>
              <span className="text-[10px] text-white/30 uppercase tracking-wider font-medium">Rating medio</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-amber-400">{stats.avgRating ? stats.avgRating.toFixed(1) : "—"}</div>
            <div className="flex items-center gap-0.5 mt-1">
              {Array(5).fill(0).map((_, i) => (
                <Star key={i} className={"h-3 w-3 " + (i < Math.round(stats.avgRating || 0) ? "text-amber-400 fill-current" : "text-white/15")} />
              ))}
            </div>
          </div>
        </div>

        <div className="p-1.5 rounded-3xl bg-white/[0.02] border border-white/[0.06]">
          <div className="p-3 sm:p-4 rounded-2xl bg-white/[0.03] h-full">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-orange-500/10 rounded-lg p-1.5"><Euro className="h-4 w-4 text-orange-400" /></div>
              <span className="text-[10px] text-white/30 uppercase tracking-wider font-medium">Preco medio</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-orange-400">{stats.avgPrice ? "€" + stats.avgPrice.toFixed(0) : "—"}</div>
            {stats.minPrice != null && stats.maxPrice != null && (
              <div className="text-xs text-white/30 mt-1 hidden sm:block">€{stats.minPrice} — €{stats.maxPrice}</div>
            )}
          </div>
        </div>

        <div className="p-1.5 rounded-3xl bg-white/[0.02] border border-white/[0.06]">
          <div className="p-3 sm:p-4 rounded-2xl bg-white/[0.03] h-full">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-emerald-500/10 rounded-lg p-1.5"><MapPin className="h-4 w-4 text-emerald-400" /></div>
              <span className="text-[10px] text-white/30 uppercase tracking-wider font-medium">Locais</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-emerald-400">{stats.uniqueLocations}</div>
            <div className="text-xs text-white/30 mt-1">{stats.totalRestaurants} restaurantes</div>
          </div>
        </div>


      </div>

      {/* Bottom row: charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Cuisine pie chart */}
        {stats.cuisineData.length > 0 && (
          <div className="p-1.5 rounded-3xl bg-white/[0.02] border border-white/[0.06]">
            <div className="p-4 rounded-2xl bg-white/[0.03]">
              <div className="flex items-center gap-2 mb-3">
                <UtensilsCrossed className="h-4 w-4 text-amber-400" />
                <span className="text-sm font-semibold text-white/75">Culinarias</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-28 h-28 flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={stats.cuisineData} cx="50%" cy="50%" innerRadius={25} outerRadius={45} paddingAngle={3} dataKey="value">
                        {stats.cuisineData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", fontSize: "12px" }}
                        itemStyle={{ color: "#fff" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-1.5">
                  {stats.cuisineData.slice(0, 5).map((c, i) => (
                    <div key={c.name} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-xs text-white/60 truncate">{c.name}</span>
                      <span className="text-xs text-white/30 ml-auto">{c.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Price distribution */}
        {stats.priceRanges.length > 0 && (
          <div className="p-1.5 rounded-3xl bg-white/[0.02] border border-white/[0.06]">
            <div className="p-4 rounded-2xl bg-white/[0.03]">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-4 w-4 text-orange-400" />
                <span className="text-sm font-semibold text-white/75">Distribuicao de precos</span>
              </div>
              <div className="space-y-2.5">
                {stats.priceRanges.map(r => {
                  const pct = (r.count / stats.totalRestaurants) * 100;
                  return (
                    <div key={r.label} className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-white/60 w-8">{r.label}</span>
                      <div className="flex-1 h-3 bg-white/[0.05] rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-orange-500/60 to-amber-500/40 rounded-full transition-all duration-500" style={{ width: pct + "%" }} />
                      </div>
                      <span className="text-xs text-white/30 w-6 text-right">{r.count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
