"use client";

import React, { useState } from "react";
import MentionText from "@/components/ui/common/MentionText";

interface TruncateTextProps {
  text: string;
  maxLength?: number;
  className?: string;
  /** T36: highlight @mentions in the text */
  highlightMentions?: boolean;
}

const render = (t: string, highlight?: boolean, cls?: string) =>
  highlight ? (
    <MentionText text={t} className={cls} />
  ) : (
    <span className={cls}>{t}</span>
  );

export default function TruncateText({ text, maxLength = 150, className = "", highlightMentions }: TruncateTextProps) {
  const [expanded, setExpanded] = useState(false);

  if (text.length <= maxLength) {
    return <p className={`${className} whitespace-pre-wrap`}>{render(text, highlightMentions)}</p>;
  }

  return (
    <p className={`${className} whitespace-pre-wrap`}>
      {render(expanded ? text : `${text.slice(0, maxLength)}...`, highlightMentions)}
      <button
        onClick={() => setExpanded(!expanded)}
        className="ml-1 text-amber-400 hover:text-amber-300 font-medium transition-colors"
      >
        {expanded ? "Ver menos" : "Ver mais"}
      </button>
    </p>
  );
}
