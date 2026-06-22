import React from "react";

export const RatingBadge = ({ rating }: { rating: number }) => (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/15">
    {rating.toFixed(1)}
  </span>
);

export const PriceLevelBadge = ({ level }: { level: number }) => {
  const euro = String.fromCharCode(8364);
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-500/10 text-orange-400 border border-orange-500/15">
      {Array(level).fill(euro).join("")}
    </span>
  );
};

export const LocationBadge = ({ location }: { location: string }) => (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 truncate max-w-[150px]">
    {location}
  </span>
);

export const CuisineBadge = ({ name }: { name: string }) => (
  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/15">
    {name}
  </span>
);

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
