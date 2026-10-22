"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

const LEAVE_MS = 220;

export default function FadeLink({ href, children, ...props }) {
  const router = useRouter();
  const go = (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return router.push(href);
    document.documentElement.classList.add("auth-leaving");
    setTimeout(() => router.push(href), LEAVE_MS);
  };
  return <Link href={href} onClick={go} {...props}>{children}</Link>;
}
