"use client";

interface FunnelChartProps {
  data: { step: string; users: number }[];
}

const STEP_LABELS: Record<string, string> = {
  search_performed: "Pesquisa",
  filter_applied: "Filtro",
  restaurant_added_to_list: "Guardar",
  review_created: "Review",
};

const COLORS = ["#f59e0b", "#22c55e", "#3b82f6", "#a855f7"];

export default function FunnelChart({ data }: FunnelChartProps) {
  const rows = (data || []).map((d, i) => ({ ...d, label: STEP_LABELS[d.step] || d.step, color: COLORS[i % COLORS.length] }));
  const max = Math.max(1, ...rows.map((r) => r.users || 0));

  return (
    <div className="rounded-xl border border-white/10 bg-card p-5">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-white/40 mb-4">
        Funil de conversão (30d) · utilizadores únicos
      </h3>
      {rows.length === 0 || rows.every((r) => !r.users) ? (
        <p className="text-sm text-foreground-muted">Sem eventos neste período. Após pesquisar, filtrar, guardar ou avaliar, aqui aparece o funil.</p>
      ) : (
        <div className="space-y-3">
          {rows.map((r) => (
            <div key={r.step}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-foreground-muted">{r.label}</span>
                <span className="text-foreground">{r.users}</span>
              </div>
              <div className="h-2.5 rounded-full bg-white/[0.06] overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${(r.users / max) * 100}%`, backgroundColor: r.color }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
