'use client';
import { useLanguage } from '@/contexts/LanguageContext';
import React, { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ef4444", "#ec4899", "#f97316", "#14b8a6"];

interface ListStatisticsProps {
  restaurants: any[];
}

export default function ListStatistics({ restaurants }: ListStatisticsProps) {
  const { t } = useLanguage();
  const stats = useMemo(() => {
    if (!restaurants.length) return null;
    const ratings = restaurants.filter(r => r.rating != null && (r.review_count ?? 0) > 0).map(r => r.rating);
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

  const box = "rounded-[10px] bg-white/[0.04] p-3";
  return (
    <section>
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        <div className={box}>
          <b className="block text-xl font-semibold">{stats.avgRating ? stats.avgRating.toFixed(1) : "—"}</b>
          <span className="text-xs text-white/50">{t('Rating médio')}</span>
        </div>
        <div className={box}>
          <b className="block text-xl font-semibold">{stats.avgPrice ? stats.avgPrice.toFixed(0) + " €" : "—"}</b>
          <span className="text-xs text-white/50">
            {t('Preço médio')}{stats.minPrice != null && stats.maxPrice != null && ` · ${stats.minPrice}–${stats.maxPrice} €`}
          </span>
        </div>
        <div className={box}>
          <b className="block text-xl font-semibold">{stats.uniqueLocations}</b>
          <span className="text-xs text-white/50">locais · {stats.totalRestaurants} restaurantes</span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        {stats.cuisineData.length > 0 && (
          <div>
            <div className="mb-2 text-xs text-white/50">Culinárias</div>
            <div className="flex items-center gap-4">
              <div className="h-28 w-28 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={stats.cuisineData} cx="50%" cy="50%" innerRadius={25} outerRadius={45} paddingAngle={3} dataKey="value" stroke="none">
                      {stats.cuisineData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: "#0c0c0c", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", fontSize: "12px" }}
                      itemStyle={{ color: "#fff" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-1.5">
                {stats.cuisineData.slice(0, 5).map((c, i) => (
                  <div key={c.name} className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="truncate text-xs text-white/70">{c.name}</span>
                    <span className="ml-auto text-xs text-white/50">{c.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {stats.priceRanges.length > 0 && (
          <div>
            <div className="mb-2 text-xs text-white/50">{t('Distribuicao de precos')}</div>
            <div className="space-y-2.5">
              {stats.priceRanges.map(r => {
                const pct = (r.count / stats.totalRestaurants) * 100;
                return (
                  <div key={r.label} className="flex items-center gap-3">
                    <span className="w-10 text-sm text-white/70">{r.label}</span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-[3px] bg-white/[0.07]">
                      <div className="h-full bg-amber-500" style={{ width: pct + "%" }} />
                    </div>
                    <span className="w-6 text-right text-xs text-white/50">{r.count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
