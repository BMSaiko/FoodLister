"use client";

import React from "react";
import Link from "next/link";

interface CreatorLinkProps {
  creatorId?: string | null;
  name: string;
}

/** Clickable creator name -> /users/[id]; plain text when no creatorId. */
export const CreatorLink = React.memo<CreatorLinkProps>(({ creatorId, name }) => {
  if (!creatorId) {
    return <span>{name}</span>;
  }
  return (
    <Link
      href={`/users/${creatorId}`}
      onClick={(e) => e.stopPropagation()}
      className="hover:text-[var(--primary)] hover:underline transition-colors"
    >
      {name}
    </Link>
  );
});
