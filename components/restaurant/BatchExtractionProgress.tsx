// components/restaurant/BatchExtractionProgress.tsx
"use client";

import React from "react";
import { Loader } from "lucide-react";

interface BatchExtractionProgressProps {
  current: number;
  total: number;
}

export function BatchExtractionProgress({
  current,
  total,
}: BatchExtractionProgressProps) {
  const safeTotal = Math.max(total, 1);
  const pct = Math.min(100, Math.round((current / safeTotal) * 100));

  return (
    <div className="mt-4 p-4 bg-white/[0.02] border border-white/[0.04] rounded-xl">
      <div className="flex items-center gap-3 mb-3">
        <Loader className="h-5 w-5 animate-spin text-[var(--primary)]" />
        <span className="text-sm text-white/60">A obter endereços (1/s)...</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-white/[0.06] rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--primary)] rounded-full transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-sm text-white/50 whitespace-nowrap tabular-nums">
          {Math.min(current + 1, total)}/{total} ({pct}%)
        </span>
      </div>
    </div>
  );
}
