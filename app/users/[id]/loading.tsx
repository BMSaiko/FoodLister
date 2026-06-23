"use client";

import React from "react";
import { Star, List, UtensilsCrossed, User } from "lucide-react";

const ShimmerBlock = ({ className = "" }: { className?: string }) => (
  <div className={`bg-white/[0.04] rounded-lg animate-pulse ${className}`} />
);

const UserLoadingPage = () => {
  return (
    <div className="min-min-h-[100dvh] bg-[var(--background)]">
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <ShimmerBlock className="h-10 w-24 rounded-xl" />
            <ShimmerBlock className="h-10 w-32 rounded-xl" />
          </div>
          <ShimmerBlock className="h-8 w-64 mb-2 rounded-lg" />
          <ShimmerBlock className="h-4 w-96 rounded-lg" />
        </div>

        {/* Profile Header */}
        <div className="p-1.5 rounded-3xl bg-white/[0.02] border border-white/[0.06] mb-6">
          <div className="p-4 md:p-6 rounded-2xl bg-white/[0.03]">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1 flex flex-col lg:flex-row gap-4 lg:gap-6">
                {/* Avatar */}
                <div className="w-24 h-24 lg:w-28 lg:h-28 rounded-2xl bg-white/[0.04] animate-pulse flex items-center justify-center flex-shrink-0">
                  <User className="h-10 w-10 text-white/10" />
                </div>
                <div className="flex-1 min-w-0 space-y-3">
                  <ShimmerBlock className="h-8 w-48 rounded-lg" />
                  <div className="flex flex-wrap gap-2">
                    <ShimmerBlock className="h-6 w-24 rounded-full" />
                    <ShimmerBlock className="h-6 w-20 rounded-full" />
                    <ShimmerBlock className="h-6 w-28 rounded-full" />
                  </div>
                  <ShimmerBlock className="h-4 w-full rounded-lg" />
                  <ShimmerBlock className="h-4 w-3/4 rounded-lg" />
                </div>
              </div>
              {/* Stats */}
              <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="p-1.5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                    <div className="p-3 md:p-4 rounded-xl bg-white/[0.03] text-center">
                      <div className="w-8 h-8 mx-auto mb-2 rounded-lg bg-white/[0.04] animate-pulse" />
                      <ShimmerBlock className="h-6 w-12 mx-auto mb-1 rounded" />
                      <ShimmerBlock className="h-3 w-16 mx-auto rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Actions */}
            <div className="flex flex-wrap gap-2 mt-4">
              <ShimmerBlock className="h-10 w-28 rounded-xl" />
              <ShimmerBlock className="h-10 w-28 rounded-xl" />
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="p-1.5 rounded-3xl bg-white/[0.02] border border-white/[0.06]">
          <div className="rounded-2xl bg-white/[0.03] overflow-hidden">
            {/* Tab Navigation */}
            <div className="border-b border-white/[0.06]">
              <div className="flex overflow-x-auto">
                {[1, 2, 3, 4, 5].map(tab => (
                  <div key={tab} className="flex items-center gap-3 px-5 py-4">
                    <ShimmerBlock className="h-4 w-4 rounded" />
                    <ShimmerBlock className="h-4 w-16 rounded" />
                    <ShimmerBlock className="h-5 w-8 rounded-full" />
                  </div>
                ))}
              </div>
            </div>
            {/* Tab Content */}
            <div className="p-6">
              <div className="space-y-3">
                {[1, 2, 3].map(item => (
                  <div key={item} className="p-1.5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                    <div className="p-4 rounded-xl bg-white/[0.03] flex items-start gap-4">
                      <ShimmerBlock className="w-16 h-16 rounded-xl flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <ShimmerBlock className="h-4 w-32 rounded" />
                        <ShimmerBlock className="h-3 w-24 rounded" />
                        <ShimmerBlock className="h-3 w-full rounded" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserLoadingPage;
