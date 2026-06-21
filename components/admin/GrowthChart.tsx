'use client';

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface GrowthChartProps {
  data: {
    users: { month: string; count: number }[];
    restaurants: { month: string; count: number }[];
    reviews: { month: string; count: number }[];
  };
}

export default function GrowthChart({ data }: GrowthChartProps) {
  const months = data.users.map(u => u.month);
  const chartData = months.map(month => ({
    month: month.slice(5),
    Utilizadores: data.users.find(u => u.month === month)?.count || 0,
    Restaurantes: data.restaurants.find(r => r.month === month)?.count || 0,
    Reviews: data.reviews.find(r => r.month === month)?.count || 0,
  }));

  return (
    <div
      className="group relative p-1.5 rounded-[2rem] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
      style={{ animation: 'fadeUp 800ms ease forwards', opacity: 0, animationDelay: '400ms' }}
    >
      {/* Outer Shell */}
      <div className="absolute inset-0 rounded-[2rem] bg-white/[0.05] ring-1 ring-white/10 backdrop-blur-xl" />

      {/* Inner Core */}
      <div className="relative rounded-[calc(2rem-0.375rem)] p-6 bg-gradient-to-br from-[#0a0a0a] to-[#111111] shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
        <h3 className="text-sm font-medium uppercase tracking-[0.15em] text-white/40 mb-6">Crescimento (12 meses)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorRestaurants" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorReviews" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" fontSize={11} />
            <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(10,10,10,0.9)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                backdropFilter: 'blur(12px)',
                color: 'white',
              }}
            />
            <Area type="monotone" dataKey="Utilizadores" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorUsers)" />
            <Area type="monotone" dataKey="Restaurantes" stroke="#22c55e" strokeWidth={2} fillOpacity={1} fill="url(#colorRestaurants)" />
            <Area type="monotone" dataKey="Reviews" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorReviews)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
