import React from "react";

export const DateBadge = ({ date, prefix = "" }: { date: string; prefix?: string }) => (
  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-white/[0.04] text-white/40 border border-white/[0.06]">
    {prefix}{new Date(date).toLocaleDateString("pt-PT")}
  </span>
);


export const ListIconBadge = ({ count }: { count: number }) => (
  <div className="flex flex-col items-center gap-1">
    <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
      <span className="text-lg font-bold text-amber-400">{count}</span>
    </div>
    <span className="text-[10px] text-amber-400/60 uppercase tracking-wider">Restaurantes</span>
  </div>
);

export const RestaurantCountBadge = ({ count }: { count: number }) => (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/15">
    {count} restaurante{count !== 1 ? "s" : ""}
  </span>
);
