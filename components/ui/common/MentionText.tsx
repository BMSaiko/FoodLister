"use client";

import React, { useCallback } from "react";
import { useRouter } from "next/navigation";

/**
 * MentionText — renders @mentions highlighted and clickable (T36).
 * Clicking an @name resolves the user via /api/users/search (reuse) and
 * navigates to /users/{userIdCode}.
 */
const MENTION_RE = /(@[\p{L}\p{N}_'\-.]+(?: [\p{L}\p{N}_'\-.]+)*)/gu;

export default function MentionText({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const router = useRouter();

  const goToProfile = useCallback(async (name: string) => {
    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(name)}&limit=5`);
      if (!res.ok) return;
      const json = await res.json();
      const list: any[] = Array.isArray(json.data) ? json.data : [];
      // prefer exact display_name match, else first
      const hit = list.find(u => u.name?.toLowerCase() === name.toLowerCase()) || list[0];
      if (hit?.userIdCode) router.push(`/users/${hit.userIdCode}`);
      else if (hit?.id) router.push(`/users/${hit.id}`);
    } catch { /* best-effort */ }
  }, [router]);

  if (!text) return null;
  const parts = text.split(MENTION_RE);
  return (
    <span className={className}>
      {parts.map((part, i) =>
        part.startsWith("@") && part.length > 1 ? (
          <button
            key={i}
            type="button"
            onClick={() => goToProfile(part.slice(1))}
            className="text-amber-400 font-medium hover:text-amber-300 hover:underline cursor-pointer"
          >
            {part}
          </button>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
}
