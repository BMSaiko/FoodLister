"use client";

import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import RestaurantCard from "@/components/ui/RestaurantCard";
import { RestaurantWithDetails } from "@/libs/types";
import { EmptyState } from "@/components/ui/common/EmptyState";
import Skeleton from "@/components/ui/Skeleton";

interface RestaurantGridProps {
  restaurants: RestaurantWithDetails[];
  searchQuery?: string | null;
  /** pagination: load next page when the sentinel becomes visible */
  hasMore?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
}

export function RestaurantGrid({
  restaurants,
  searchQuery,
  hasMore,
  loadingMore,
  onLoadMore,
}: RestaurantGridProps) {
  // ponytail: IntersectionObserver sentinel at the end drives server pagination
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore || !onLoadMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) onLoadMore();
      },
      { rootMargin: "600px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, onLoadMore]);

  if (!restaurants || restaurants.length === 0) {
    return <EmptyState searchQuery={searchQuery || null} />;
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {restaurants.map((restaurant, index) => (
          <motion.div
            key={restaurant.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{
              duration: 0.5,
              delay: (index % 6) * 0.06,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <RestaurantCard restaurant={restaurant} />
          </motion.div>
        ))}
      </div>
      {hasMore && (
        <div ref={sentinelRef} aria-hidden="true" className="h-2" />
      )}
      {loadingMore && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} variant="restaurant-card" />
          ))}
        </div>
      )}
    </>
  );
}
