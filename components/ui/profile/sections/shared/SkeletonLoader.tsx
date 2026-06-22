import React from "react";

interface SkeletonLoaderProps {
  type?: "review" | "list" | "restaurant";
  count?: number;
  className?: string;
}

const Shimmer = ({ className = "" }: { className?: string }) => (
  <div className={`bg-white/[0.04] rounded-lg animate-pulse ${className}`} />
);

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  type = "review", count = 3, className = "",
}) => {
  const renderSkeleton = (index: number) => {
    if (type === "review") {
      return (
        <div key={index} className={`p-1.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] ${className}`}>
          <div className="p-4 rounded-xl bg-white/[0.03] flex items-start gap-4">
            <Shimmer className="w-16 h-16 rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="flex gap-2">
                <Shimmer className="h-5 w-16 rounded" />
                <Shimmer className="h-5 w-20 rounded" />
              </div>
              <Shimmer className="h-3 w-full rounded" />
              <Shimmer className="h-3 w-3/4 rounded" />
            </div>
          </div>
        </div>
      );
    }

    if (type === "list") {
      return (
        <div key={index} className={`p-1.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] ${className}`}>
          <div className="p-4 rounded-xl bg-white/[0.03] flex items-center justify-between">
            <div className="flex-1 space-y-2">
              <Shimmer className="h-5 w-40 rounded" />
              <Shimmer className="h-3 w-24 rounded" />
            </div>
            <Shimmer className="h-8 w-20 rounded-lg" />
          </div>
        </div>
      );
    }

    // restaurant
    return (
      <div key={index} className={`p-1.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] ${className}`}>
        <div className="p-4 rounded-xl bg-white/[0.03] flex items-start gap-4">
          <Shimmer className="w-16 h-16 rounded-xl flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Shimmer className="h-5 w-32 rounded" />
            <Shimmer className="h-3 w-24 rounded" />
            <div className="flex gap-1.5">
              <Shimmer className="h-5 w-14 rounded-full" />
              <Shimmer className="h-5 w-14 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {Array.from({ length: count }, (_, i) => renderSkeleton(i))}
    </div>
  );
};
