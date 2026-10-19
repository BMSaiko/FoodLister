"use client";

import React from "react";
import { motion } from "motion/react";
import ToviLoader from "./ToviLoader";

interface PageLoaderProps {
  variant?: "spinner" | "bar" | "skeleton";
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
}

const PageLoader: React.FC<PageLoaderProps> = ({
  variant = "spinner",
  size = "md",
  text,
  className = "",
}) => {
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
      <ToviLoader size={size} text={text} />
    </div>
  );
};

export default React.memo(PageLoader);
