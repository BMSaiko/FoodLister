"use client";

import React, { useState, useCallback, useRef } from "react";
import { Search, X, Loader2, UserPlus } from "lucide-react";
import { getClient } from "@/libs/supabase/client";

interface SearchResult {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  user_id_code: string | null;
}

interface ParticipantsStepProps {
  participants: SearchResult[];
  onAdd: (user: SearchResult) => void;
  onRemove: (id: string) => void;
  currentUserId: string;
}

export default function ParticipantsStep({
  participants,
  onAdd,
  onRemove,
  currentUserId,
}: ParticipantsStepProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const searchFn = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); return; }
    setLoading(true);
    try {
      const supabase = getClient();
      const resp = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url, user_id_code")
        .neq("id", currentUserId)
        .limit(5);
      setResults(resp.data || []);
      setShowDropdown(true);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  const handleSearchChange = (value: string) => {
    setQuery(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (value.length >= 2) {
      searchTimeout.current = setTimeout(() => searchFn(value), 300);
    } else {
      setResults([]);
      setShowDropdown(false);
    }
  };

  const handleAdd = (user: SearchResult) => {
    onAdd(user);
    setQuery("");
    setResults([]);
    setShowDropdown(false);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs text-white/40 uppercase tracking-wider mb-2">
          Adicionar participantes
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => results.length > 0 && setShowDropdown(true)}
            placeholder="Pesquisar por nome ou codigo..."
            className="w-full pl-10 pr-4 py-2.5 bg-white/0.04 border border-white/0.08 rounded-xl text-sm text-white/90 placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-colors"
          />
          {loading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 animate-spin" />
          )}
          {showDropdown && results.length > 0 && (
            <div className="absolute z-10 top-full mt-1 w-full bg-#111 border border-white/0.08 rounded-xl overflow-hidden shadow-xl max-h-48 overflow-y-auto">
              {results.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleAdd(user)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-white/0.04 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                    <UserPlus className="h-3.5 w-3.5 text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/80 truncate">{user.display_name || "Sem nome"}</p>
                    {user.user_id_code && (
                      <p className="text-xs text-white/30">#{user.user_id_code}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {participants.length > 0 ? (
        <div className="space-y-2">
          <label className="block text-xs text-white/40 uppercase tracking-wider">
            Participantes ({participants.length})
          </label>
          <div className="flex flex-wrap gap-2">
            {participants.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-2 bg-white/0.06 rounded-full pl-1 pr-1 py-1"
              >
                <span className="text-xs text-white/70 pl-2 truncate max-w-30">
                  {p.display_name || p.user_id_code || p.id.slice(0, 8)}
                </span>
                <button
                  onClick={() => onRemove(p.id)}
                  className="w-5 h-5 rounded-full bg-white/0.06 flex items-center justify-center hover:bg-red-500/20 transition-colors group"
                >
                  <X className="h-3 w-3 text-white/40 group-hover:text-red-400 transition-colors" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-6">
          <p className="text-xs text-white/30">Adiciona amigos para esta refeicao</p>
        </div>
      )}
    </div>
  );
}
