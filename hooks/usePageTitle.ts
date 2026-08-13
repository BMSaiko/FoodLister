"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Set document.title for client components (can't export metadata/
 * generateMetadata). Re-asserts on navigation because Next re-applies the
 * root layout metadata.title (which would reset the tab title) after the
 * client-side route change. ponytail: microtask delays the write past Next'
 * metadata application.
 */
export function usePageTitle(title?: string | null) {
  const pathname = usePathname();
  useEffect(() => {
    if (!title) return;
    document.title = title;
    // ponytail: Next re-applies layout metadata.title on every navigation and
    // REPLACES the <title> node, so an observer attached to the title element
    // dies with it. Observe document.head (persists) + re-pin when anything
    // under it changes.
    const head = document.head;
    if (!head) return;
    const obs = new MutationObserver(() => {
      if (document.title !== title) document.title = title;
    });
    obs.observe(head, { childList: true, subtree: true, characterData: true });
    return () => obs.disconnect();
  }, [title, pathname]);
}
