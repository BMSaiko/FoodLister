'use client';

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface GrowthChartProps {
  data: {
    users: { month: string; count: number }[];
    restaurants: { month: string; count: number }[];
    reviews: { month: string; count: number }[];
  };
}

export default function GrowthChart({ data }: GrowthChartProps) {
  // Merge all data by month for the combined chart
  const months = data.users.map(u => u.month);
  const chartData = months.map(month => ({
    month: month.slice(5), // Show "MM" only
    Utilizadores: data.users.find(u => u.month === month)?.count || 0,
    Restaurantes: data.restaurants.find(r => r.month === month)?.count || 0,
    Reviews: data.reviews.find(r => r.month === month)?.count || 0,
  }));

  return (
    <div className="rounded-xl border p-6" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
      <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>Crescimento (12 meses)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
          <YAxis stroke="var(--muted-foreground)" fontSize={12} />
          <Tooltip contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px' }} />
          <Legend />
          <Line type="monotone" dataKey="Utilizadores" stroke="#f59e0b" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="Restaurantes" stroke="#22c55e" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="Reviews" stroke="#3b82f6" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

