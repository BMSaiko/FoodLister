"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

interface DailySeriesChartProps {
  data: { date: string; event: string; count: number }[];
}

export default function DailySeriesChart({ data }: DailySeriesChartProps) {
  if (!data || data.length === 0) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-card p-5">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-white/40 mb-4">Eventos por dia (30d)</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" fontSize={10} tickFormatter={(d: string) => d.slice(5)} />
          <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} />
          <Tooltip
            contentStyle={{ backgroundColor: "rgba(10,10,10,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "white" }}
          />
          <Bar dataKey="count" fill="#f59e0b" radius={[4,4,0,0]} name="Eventos" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
