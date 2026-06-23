"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence } from "motion/react";
import PageLoader from "./PageLoader";

interface LoadingContextValue {
  showLoading: (text?: string) => void;
  hideLoading: () => void;
  isLoading: boolean;
}

const LoadingContext = createContext<LoadingContextValue | null>(null);

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState<string | undefined>();
  const pathname = usePathname();
  const loadingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const unblockTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showLoading = useCallback((text?: string) => {
    setLoadingText(text);
    setLoading(true);
    if (loadingTimeout.current) clearTimeout(loadingTimeout.current);
    loadingTimeout.current = setTimeout(() => {
      setLoading(false);
      setLoadingText(undefined);
    }, 8000);
  }, []);

  const hideLoading = useCallback(() => {
    if (loadingTimeout.current) clearTimeout(loadingTimeout.current);
    setLoading(false);
    setLoadingText(undefined);
  }, []);

  // Auto-show on pathname change
  useEffect(() => {
    showLoading(undefined);
    if (unblockTimeout.current) clearTimeout(unblockTimeout.current);
    unblockTimeout.current = setTimeout(() => {
      hideLoading();
    }, 300);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Auto-hide on new content rendered
  useEffect(() => {
    if (loading) {
      const observer = new MutationObserver(() => {
        if (unblockTimeout.current) clearTimeout(unblockTimeout.current);
        unblockTimeout.current = setTimeout(() => {
          hideLoading();
        }, 400);
      });
      observer.observe(document.body, { childList: true, subtree: true });
      return () => observer.disconnect();
    }
  }, [loading, hideLoading]);

  // Safety: force hide after 8s
  useEffect(() => {
    if (loading && loadingTimeout.current) {
      clearTimeout(loadingTimeout.current);
      loadingTimeout.current = setTimeout(() => {
        hideLoading();
      }, 8000);
    }
    return () => {
      if (loadingTimeout.current) clearTimeout(loadingTimeout.current);
    };
  }, [loading, hideLoading]);

  // Set aria-busy on main content
  useEffect(() => {
    const main = document.querySelector("main");
    if (main) {
      if (loading) {
        main.setAttribute("aria-busy", "true");
      } else {
        main.removeAttribute("aria-busy");
      }
    }
  }, [loading]);

  return (
    <LoadingContext.Provider value={{ showLoading, hideLoading, isLoading: loading }}>
      {children}
      <AnimatePresence>
        {loading && <PageLoader key="global-loader" text={loadingText} />}
      </AnimatePresence>
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within LoadingProvider");
  }
  return context;
};

export default LoadingProvider;
