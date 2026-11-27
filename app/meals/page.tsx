"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAuthUser } from '@/hooks/auth/useAuthUser';
import Navbar from "@/components/ui/navigation/Navbar";
import Link from "next/link";
import EmptyState from "@/components/ui/EmptyState";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useLanguage } from "@/contexts";
import ToviLoader from "@/components/loading/ToviLoader";
import Icon from '@/components/ui/icons/Icon';
import {
  normalizeMeal,
  filterByRole,
  groupAgenda,
  daysUntil,
  type AgendaMeal,
  type RoleFilter,
} from "@/libs/meals/agenda";

const TYPE_LABEL: Record<string, string> = { almoco: "Almoço", jantar: "Jantar", lanche: "Lanche" };

const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const at = (d: string) => new Date(`${d}T12:00:00`);
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function MealRow({ meal, today, past }: { meal: AgendaMeal; today: string; past: boolean }) {
  const { t } = useLanguage();
  const n = meal.date ? daysUntil(meal.date, today) : null;
  const soon = n !== null && n >= 0 && n <= 2;
  const soonLabel = n === 0 ? t("Hoje") : n === 1 ? t("Amanhã") : t("Em 2 dias");
  const showLocation = meal.location && meal.location !== meal.name;

  return (
    <div className="grid grid-cols-[48px_1fr] sm:grid-cols-[64px_1fr] gap-2 sm:gap-4 items-center py-3 border-t border-white/[0.06]">
      <div className="text-center leading-none">
        {meal.date ? (
          <>
            <small className="block text-[11px] uppercase tracking-[0.08em] font-semibold text-[var(--primary)]">
              {at(meal.date).toLocaleDateString("pt-PT", { month: "short" }).replace(".", "")}
            </small>
            <b className={`block text-2xl sm:text-3xl font-bold tracking-tight mt-1 mb-0.5 ${past ? "text-white/60" : "text-white"}`}>
              {at(meal.date).getDate()}
            </b>
            <em className="block not-italic text-[11px] text-white/45">
              {cap(at(meal.date).toLocaleDateString("pt-PT", { weekday: "long" }).slice(0, 3))}
            </em>
          </>
        ) : (
          <>
            <b className="block text-[22px] font-bold text-white/45">—</b>
            <em className="block not-italic text-[11px] text-white/45">{t("sem data")}</em>
          </>
        )}
      </div>

      <Link
        href={`/meals/${meal.id}`}
        className={`grid grid-cols-[56px_1fr_16px] sm:grid-cols-[72px_1fr_20px] gap-2.5 sm:gap-3.5 items-center min-w-0 p-2.5 rounded-[14px] border transition-colors ${
          soon
            ? "bg-amber-500/10 border-amber-500/30"
            : "border-transparent hover:bg-white/[0.03] hover:border-white/[0.08]"
        }`}
      >
        <div
          className={`relative w-14 h-14 sm:w-[72px] sm:h-[72px] rounded-xl overflow-hidden bg-gradient-to-br from-[#2a1c05] to-[#4a2f08] grid place-items-center text-amber-400 ${
            past ? "grayscale opacity-70" : ""
          }`}
        >
          {meal.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={meal.image} alt="" loading="lazy" className="w-full h-full object-cover" onError={(e) => e.currentTarget.remove()} />
          ) : (
            <Icon name="refeicoes" className="h-6 w-6 opacity-70" />
          )}
        </div>

        <div className="min-w-0 grid gap-1.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={`text-[11px] uppercase tracking-[0.06em] font-semibold px-2 py-0.5 rounded-full ${meal.role === "organized" ? "text-amber-400 bg-amber-500/10" : "text-white/60 bg-white/[0.06]"}`}>
              {meal.role === "organized" ? t("Organizas") : t("Participas")}
            </span>
            {meal.mealType && TYPE_LABEL[meal.mealType] && (
              <span className="text-[11px] uppercase tracking-[0.06em] font-semibold px-2 py-0.5 rounded-full text-white/60 bg-white/[0.06]">
                {t(TYPE_LABEL[meal.mealType])}
              </span>
            )}
            {soon && <span className="text-xs font-semibold text-amber-400">{soonLabel}</span>}
          </div>
          <h3 className={`font-semibold text-base tracking-tight line-clamp-2 break-words ${past ? "text-white/60" : "text-white/90"}`}>
            {meal.name || t("Restaurante")}
          </h3>
          <div className="flex flex-wrap gap-x-3.5 gap-y-1 text-[13px] text-white/45">
            {meal.time && (
              <span className="inline-flex items-center gap-1"><Icon name="horario" className="h-3.5 w-3.5" />{meal.time}</span>
            )}
            {showLocation && (
              <span className="inline-flex items-center gap-1 min-w-0"><Icon name="pin" className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{meal.location}</span></span>
            )}
            {meal.participants > 0 && (
              <span className="inline-flex items-center gap-1"><Icon name="utilizadores" className="h-3.5 w-3.5" />{meal.participants}</span>
            )}
          </div>
        </div>

        <Icon name="seta-dir" className="h-4 w-4 text-white/45" />
      </Link>
    </div>
  );
}

export default function MealsPage() {
  const { t } = useLanguage();
  usePageTitle(t("Refeições - FoodLister"));
  const { user, loading: authLoading } = useAuthUser();
  const [meals, setMeals] = useState<AgendaMeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [role, setRole] = useState<RoleFilter>("all");
  const [today, setToday] = useState<string>("");

  const fetchMeals = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/meals/scheduled?type=all&limit=50");
      if (!res.ok) throw new Error(String(res.status));
      const data = await res.json();
      const rows: any[] = data.meals || data.data || [];
      setMeals(rows.map((r) => normalizeMeal(r, user.id)));
    } catch (e) {
      console.error("Error fetching meals:", e);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { setToday(todayISO()); }, []);
  useEffect(() => { fetchMeals(); }, [fetchMeals]);

  const groups = useMemo(
    () => (today ? groupAgenda(filterByRole(meals, role), today) : []),
    [meals, role, today]
  );

  if (authLoading) return null;

  if (!user) {
    return (
      <div className="min-h-[100dvh] bg-[var(--background)]">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <p className="text-white/50">{t("Precisa de estar autenticado para ver as suas refeições.")}</p>
        </div>
      </div>
    );
  }

  const filters: { key: RoleFilter; label: string }[] = [
    { key: "all", label: t("Todas") },
    { key: "organized", label: t("Organizo") },
    { key: "participating", label: t("Participo") },
  ];

  return (
    <div className="min-h-[100dvh] bg-[var(--background)]">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-6">
        <div className="mb-2">
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">{t("Refeições")}</h1>
          <p className="text-white/50 mt-1 text-sm">{t("Gere as tuas refeições agendadas")}</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16" role="status">
            <ToviLoader size="sm" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center text-center gap-3 py-14" role="alert">
            <Icon name="erro-circulo" className="h-8 w-8 text-red-400" />
            <h2 className="text-lg font-semibold text-white">{t("Não foi possível carregar as refeições")}</h2>
            <p className="text-white/50 text-sm max-w-[36ch]">{t("Verifica a ligação e tenta de novo.")}</p>
            <button
              type="button"
              onClick={fetchMeals}
              className="inline-flex items-center justify-center min-h-11 px-5 rounded-xl bg-[var(--primary)] text-white text-sm font-medium hover:bg-[var(--primary-hover)] transition-colors"
            >
              {t("Tentar de novo")}
            </button>
          </div>
        ) : meals.length === 0 ? (
          <EmptyState
            mascot="a-pensar"
            title={t("Nenhuma refeição agendada")}
            description={t("Agenda uma refeição a partir de qualquer restaurante.")}
            action={<Link href="/restaurants" className="inline-flex items-center justify-center gap-2 px-5 rounded-xl bg-[var(--primary)] text-white text-sm font-medium hover:bg-[var(--primary-hover)] transition-colors">{t("Explorar Restaurantes")} <Icon name="seta-dir" className="h-4 w-4" /></Link>}
          />
        ) : (
          <>
            <div role="group" aria-label={t("Filtrar refeições")} className="inline-flex p-[3px] rounded-full bg-white/[0.05] border border-white/[0.06] mt-5 mb-2">
              {filters.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  aria-pressed={role === f.key}
                  onClick={() => setRole(f.key)}
                  className={`min-h-11 px-4 rounded-full text-sm transition-colors ${role === f.key ? "bg-[var(--primary)] text-black font-semibold" : "text-white/60 hover:text-white"}`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {groups.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-12 text-center">
                <p className="text-white/50 text-sm">{t("Nenhuma refeição nesta vista.")}</p>
                <button type="button" onClick={() => setRole("all")} className="inline-flex items-center justify-center min-h-11 px-5 rounded-xl bg-[var(--primary)] text-white text-sm font-medium hover:bg-[var(--primary-hover)] transition-colors">
                  {t("Ver todas")}
                </button>
              </div>
            ) : (
              groups.map((g) => (
                <section key={g.key}>
                  <h2 className="sticky top-14 z-[5] bg-[var(--background)] pt-3.5 pb-2 text-xs font-semibold uppercase tracking-[0.08em] text-white/45">
                    {g.kind === "past"
                      ? t("Passadas")
                      : g.kind === "undated"
                        ? t("Por agendar")
                        : cap(at(`${g.key}-01`).toLocaleDateString("pt-PT", { month: "long", year: "numeric" }))}
                  </h2>
                  {g.meals.map((m) => (
                    <MealRow key={m.id} meal={m} today={today} past={g.kind === "past"} />
                  ))}
                </section>
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
}
