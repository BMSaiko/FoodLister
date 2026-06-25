"use client";

import React, { useState } from "react";

interface TruncateTextProps {
  text: string;
  maxLength?: number;
  className?: string;
}

export default function TruncateText({ text, maxLength = 150, className = "" }: TruncateTextProps) {
  const [expanded, setExpanded] = useState(false);

  if (text.length <= maxLength) {
    return <p className={className}>{text}</p>;
  }

  return (
    <p className={className}>
      {expanded ? text : `${text.slice(0, maxLength)}...`}
      <button
        onClick={() => setExpanded(!expanded)}
        className="ml-1 text-amber-400 hover:text-amber-300 font-medium transition-colors"
      >
        {expanded ? "Ver menos" : "Ver mais"}
      </button>
    </p>
  );
}
