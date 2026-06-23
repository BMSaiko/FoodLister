"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/auth/useAuth";
import Navbar from "@/components/ui/navigation/Navbar";
import Link from "next/link";
import { Calendar, Clock, Users, MapPin, ArrowRight, Loader2, UtensilsCrossed } from "lucide-react";

export default function MealsPage() {
  const { user, loading: authLoading } = useAuth();
  const [meals, setMeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMeals() {
      if (!user) { setLoading(false); return; }
      try {
        const res = await fetch("/api/meals/scheduled?type=all&limit=50");
        if (res.ok) {
          const data = await res.json();
          setMeals(data.meals || data.data || []);
        }
      } catch (e) { console.error("Error fetching meals:", e); }
      finally { setLoading(false); }
    }
    fetchMeals();
  }, [user]);

  if (authLoading) return null;

  if (!user) {
    return (
      <div className="min-min-h-[100dvh] bg-[var(--background)]">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <p className="text-white/50">Precisa de estar autenticado para ver as suas refeicoes.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-min-h-[100dvh] bg-[var(--background)]">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Refeicoes</h1>
          <p className="text-white/35 mt-1 text-sm">Gere as tuas refeicoes agendadas</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
          </div>
        ) : meals.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/[0.03] flex items-center justify-center">
              <UtensilsCrossed className="h-8 w-8 text-white/15" />
            </div>
            <h3 className="text-lg font-semibold text-white/60 mb-2">Nenhuma refeicao agendada</h3>
            <p className="text-sm text-white/30 mb-4">Agenda uma refeicao a partir de qualquer restaurante.</p>
            <Link href="/restaurants" className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-500/15 text-purple-400 rounded-xl hover:bg-purple-500/25 transition-colors text-sm font-medium">
              Explorar Restaurantes <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {meals.map((meal) => (
              <Link
                key={meal.id}
                href={`/meals/${meal.id}`}
                className="block p-1.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:scale-[1.01] transition-colors"
              >
                <div className="p-4 rounded-xl bg-white/[0.03] flex items-center gap-4">
                  {/* Date badge */}
                  <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-purple-500/10 flex flex-col items-center justify-center">
                    <span className="text-xs text-purple-400/70 uppercase font-medium">
                      {new Date(meal.meal_date || meal.created_at).toLocaleDateString("pt-PT", { month: "short" })}
                    </span>
                    <span className="text-lg font-bold text-purple-400">
                      {new Date(meal.meal_date || meal.created_at).getDate()}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white/85 text-sm truncate">
                      {meal.restaurant?.name || meal.restaurant_name || "Restaurante"}
                    </h3>
                    <div className="flex items-center gap-3 mt-1 text-xs text-white/35">
                      {meal.meal_time && (
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{meal.meal_time}</span>
                      )}
                      {meal.restaurant?.location && meal.restaurant.location !== meal.restaurant?.name && (
                        <span className="flex items-center gap-1 truncate"><MapPin className="h-3 w-3" />{meal.restaurant.location}</span>
                      )}
                      {meal.participant_count > 0 && (
                        <span className="flex items-center gap-1"><Users className="h-3 w-3" />{meal.participant_count}</span>
                      )}
                    </div>
                  </div>

                  <ArrowRight className="h-4 w-4 text-white/20 flex-shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
