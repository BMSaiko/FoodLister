"use client";

import React, { useState, useRef, useCallback } from "react";

/**
 * MentionInput (T36) — textarea with @mention autocomplete.
 * Detects the @query before the caret, fetches /api/users/search, shows a
 * dropdown; picking one inserts "@name " and links to /users/{userIdCode}.
 * ponytail: single reusable textarea; generic autocomplete lib not added.
 */

interface MentionUser {
  id: string;
  name: string;
  profileImage?: string | null;
  userIdCode?: string | null;
}

interface MentionInputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  /** applied to the outer wrapper (e.g. flex-1 inside a flex row) */
  wrapperClassName?: string;
}

const findQuery = (text: string, caret: number): string | null => {
  const before = text.slice(0, caret);
  const at = before.lastIndexOf("@");
  if (at === -1) return null;
  const tail = before.slice(at + 1);
  // only trigger right after a word boundary / whitespace-start mention
  if (tail.includes(" ") || tail.includes("@")) return null;
  return tail;
};

export default function MentionInput({
  value,
  onChange,
  placeholder,
  rows = 3,
  required,
  disabled,
  className = "",
  wrapperClassName = "",
}: MentionInputProps) {
  const ref = useRef<HTMLTextAreaElement | null>(null);
  const [query, setQuery] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<MentionUser[]>([]);
  const [open, setOpen] = useState(false);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (!q.trim()) { setSuggestions([]); setOpen(false); return; }
    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(q)}&limit=6`);
      if (!res.ok) { setSuggestions([]); setOpen(false); return; }
      const json = await res.json();
      const list: MentionUser[] = Array.isArray(json.data) ? json.data : [];
      setSuggestions(list);
      setOpen(list.length > 0);
    } catch {
      setSuggestions([]); setOpen(false);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const v = e.target.value;
    onChange(v);
    const q = findQuery(v, e.target.selectionStart ?? v.length);
    setQuery(q);
    fetchSuggestions(q || "");
  };

  const insertMention = (u: MentionUser) => {
    if (query === null || !ref.current) return;
    const el = ref.current;
    const caret = el.selectionStart ?? value.length;
    const before = value.slice(0, caret);
    const at = before.lastIndexOf("@");
    const after = value.slice(caret);
    // replace "@tail" already typed, then append "@name "
    const prefix = at >= 0 ? before.slice(0, at) : before;
    const next = `${prefix}@${u.name} ${after}`;
    onChange(next);
    setOpen(false);
    setQuery(null);
    // restore caret after the mention
    requestAnimationFrame(() => {
      const pos = (prefix + `@${u.name} `).length;
      el.setSelectionRange(pos, pos);
      el.focus();
    });
  };

  const targetHref = (u: MentionUser) => u.userIdCode ? `/users/${u.userIdCode}` : `/users/${u.id}`;

  return (
    <div className={`relative ${wrapperClassName}`}>
      <textarea
        ref={ref}
        value={value}
        onChange={handleChange}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onFocus={() => { if (suggestions.length && query !== null) setOpen(true); }}
        placeholder={placeholder}
        rows={rows}
        required={required}
        disabled={disabled}
        className={className}
      />
      {open && suggestions.length > 0 && (
        <div className="absolute z-30 mt-1 w-full max-h-60 overflow-y-auto rounded-xl bg-[#1a1a1a] shadow-xl border border-white/[0.08]">
          {suggestions.map(u => (
            <a
              key={u.id}
              href={targetHref(u)}
              onMouseDown={(e) => { e.preventDefault(); insertMention(u); }}
              className="flex items-center gap-2 px-3 py-2 hover:bg-white/[0.06] transition-colors"
            >
              {u.profileImage ? (
                <img src={u.profileImage} alt="" className="w-6 h-6 rounded-full object-cover" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-xs font-semibold text-[var(--primary)]">
                  {(u.name || "?").charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-white/90 truncate">{u.name}</div>
                {u.userIdCode && <div className="text-xs text-white/40">{u.userIdCode}</div>}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
