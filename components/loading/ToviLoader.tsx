"use client";

import React, { useEffect, useState } from "react";

export const TOVI_MESSAGES = [
  "A pôr a mesa",
  "A escolher o melhor prato",
  "A abrir o teu diário",
  "A procurar sítios novos",
];

interface ToviLoaderProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  rotateMessages?: boolean;
  className?: string;
}

const sizeMap = { sm: 40, md: 96, lg: 160 };

const ToviLoader: React.FC<ToviLoaderProps> = ({
  size = "md",
  text,
  rotateMessages = false,
  className = "",
}) => {
  const px = sizeMap[size];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!rotateMessages || text) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % TOVI_MESSAGES.length), 2600);
    return () => clearInterval(id);
  }, [rotateMessages, text]);

  const label = text ?? (rotateMessages ? TOVI_MESSAGES[index] : undefined);

  return (
    <div
      className={`flex flex-col items-center gap-3 ${className}`}
      role="status"
      aria-live="polite"
      aria-label={label ?? "A carregar"}
    >
      <svg
        className={`tovi ${size === "sm" ? "tovi-compact" : ""}`}
        width={px}
        height={px}
        viewBox="0 0 120 120"
        aria-hidden="true"
      >
        <ellipse className="tovi-shadow" cx="60" cy="108" rx="36" ry="5" fill="#000" opacity=".35" />
        <g className="tovi-body">
          <g className="tovi-steam" fill="none" stroke="var(--tovi-light)" strokeWidth="2.4" strokeLinecap="round">
            <path d="M44 62c-4-5 4-8 0-13" />
            <path d="M60 58c-4-5 4-8 0-13" />
            <path d="M76 62c-4-5 4-8 0-13" />
          </g>
          <g className="tovi-pop">
            <path d="M60 60l3.6 7.8 8.4 1-6.2 5.8 1.7 8.4-7.5-4.2-7.5 4.2 1.7-8.4-6.2-5.8 8.4-1z" fill="var(--tovi-light)" />
          </g>
          <path d="M14 96h92" stroke="var(--tovi-plate)" strokeWidth="5" strokeLinecap="round" />
          <path d="M24 100h72" stroke="var(--tovi-plate)" strokeWidth="3" strokeLinecap="round" opacity=".5" />
          <g className="tovi-lid">
            <path d="M20 94a40 38 0 0 1 80 0Z" fill="var(--primary)" />
            <path d="M28 80a33 30 0 0 1 14-18" stroke="#fff" strokeOpacity=".5" strokeWidth="3.2" strokeLinecap="round" fill="none" />
            <circle cx="60" cy="52" r="5" fill="var(--tovi-light)" />
            <g fill="var(--tovi-ink)">
              <ellipse className="tovi-eye" cx="46" cy="76" rx="3.6" ry="5" />
              <ellipse className="tovi-eye" cx="74" cy="76" rx="3.6" ry="5" />
            </g>
            <ellipse cx="38" cy="85" rx="5" ry="3" fill="#ef4444" opacity=".35" />
            <ellipse cx="82" cy="85" rx="5" ry="3" fill="#ef4444" opacity=".35" />
            <path d="M54 83q6 6 12 0" stroke="var(--tovi-ink)" strokeWidth="3" strokeLinecap="round" fill="none" />
          </g>
        </g>
      </svg>
      {label && <p className="font-mono text-xs tracking-wider text-white/40">{label}</p>}
    </div>
  );
};

export default React.memo(ToviLoader);
