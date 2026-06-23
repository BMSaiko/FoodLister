"use client";

import React from "react";
import { motion } from "motion/react";

interface PageLoaderProps {
  variant?: "spinner" | "bar" | "skeleton";
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
}

const sizeMap = {
  sm: 24,
  md: 36,
  lg: 48,
};

const PageLoader: React.FC<PageLoaderProps> = ({
  variant = "spinner",
  size = "md",
  text,
  className = "",
}) => {
  const px = sizeMap[size];

  if (variant === "bar") {
    return (
      <div
        className={`fixed top-0 left-0 right-0 z-[200] h-[2px] bg-transparent ${className}`}
        role="progressbar"
        aria-label="A carregar página"
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <motion.div
          className="h-full bg-[var(--primary)] origin-left"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.5, ease: [0.32, 0.72, 0, 1] }}
        />
      </div>
    );
  }

  if (variant === "skeleton") {
    return (
      <div className={`space-y-3 animate-pulse ${className}`}>
        <div className="h-8 w-3/4 rounded-lg bg-white/[0.04]" />
        <div className="h-4 w-1/2 rounded-lg bg-white/[0.03]" />
        <div className="h-4 w-5/6 rounded-lg bg-white/[0.03]" />
        <div className="h-32 w-full rounded-2xl bg-white/[0.02]" />
      </div>
    );
  }

  return (
    <div
      className={`fixed inset-0 z-[200] flex items-center justify-center bg-[#050505]/85 backdrop-blur-sm ${className}`}
      role="status"
      aria-label="A carregar página"
      aria-live="polite"
    >
      <motion.div
        className="relative flex items-center justify-center"
        style={{ width: px, height: px }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Outer ring — slow fade */}
        <div
          className="absolute inset-0 rounded-full border-[2.5px] border-white/[0.08]"
          style={{
            animation: "loader-spin 3s linear infinite",
          }}
        />
        {/* Inner ring — accent spin */}
        <div
          className="absolute rounded-full border-[2.5px] border-transparent"
          style={{
            inset: "15%",
            borderTopColor: "var(--primary)",
            borderRightColor: "var(--primary)",
            animation: "loader-spin 0.8s linear infinite",
          }}
        />
        {/* Glow pulse */}
        <div
          className="absolute rounded-full"
          style={{
            inset: "-20%",
            background: "radial-gradient(circle, var(--primary-rgb) 0%, transparent 70%)",
            opacity: 0.15,
            animation: "loader-pulse 2s ease-in-out infinite",
          }}
        />
      </motion.div>
      {text && (
        <motion.p
          className="absolute mt-[calc(2rem+24px)] text-xs text-white/40 font-mono tracking-wider"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
};

export default React.memo(PageLoader);
