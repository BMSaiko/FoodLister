"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { Search, X, Loader2, UserPlus, Users } from "lucide-react";
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
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Search users by name or user_id_code
  const searchFn = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); return; }
    setLoading(true);
    try {
      const supabase = getClient();
      const resp = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url, user_id_code")
        .or("display_name.ilike.%" + q + "%,user_id_code.ilike.%" + q + "%")
        .neq("id", currentUserId)
        .limit(8);
      setResults(resp.data || []);
      setShowDropdown((resp.data || []).length > 0);
    } catch {
      setResults([]);
      setShowDropdown(false);
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  // Debounced search
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

  // Close dropdown on Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowDropdown(false);
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleAdd = (user: SearchResult) => {
    // Prevent duplicates
    if (participants.some((p) => p.id === user.id)) return;
    onAdd(user);
    setQuery("");
    setResults([]);
    setShowDropdown(false);
  };

  const isAdded = (userId: string) => participants.some((p) => p.id === userId);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs text-white/40 uppercase tracking-wider mb-2">
          Adicionar participantes
        </label>
        <div className="relative" ref={dropdownRef}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => results.length > 0 && setShowDropdown(true)}
            placeholder="Pesquisar por nome ou codigo..."
            className="w-full pl-10 pr-10 py-3 bg-white/[0.06] border border-white/[0.1] rounded-xl text-sm text-white/90 placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
          />
          {loading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 animate-spin" />
          )}
          {!loading && query.length > 0 && (
            <button
              onClick={() => { setQuery(""); setResults([]); setShowDropdown(false); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Limpar pesquisa"
            >
              <X className="h-3.5 w-3.5 text-white/40" />
            </button>
          )}

          {/* Results dropdown */}
          {showDropdown && results.length > 0 && (
            <div className="absolute z-20 top-full mt-2 w-full bg-[#111] border border-white/[0.1] rounded-xl overflow-hidden shadow-2xl shadow-black/50 max-h-56 overflow-y-auto">
              {results.map((user) => {
                const added = isAdded(user.id);
                return (
                  <button
                    key={user.id}
                    onClick={() => !added && handleAdd(user)}
                    disabled={added}
                    className={"w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors " +
                      (added
                        ? "opacity-40 cursor-not-allowed bg-white/[0.02]"
                        : "hover:bg-white/[0.06] cursor-pointer")}
                  >
                    <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <UserPlus className="h-4 w-4 text-amber-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white/85 truncate">
                        {user.display_name || "Sem nome"}
                      </p>
                      {user.user_id_code && (
                        <p className="text-xs text-white/35">#{user.user_id_code}</p>
                      )}
                    </div>
                    {added && (
                      <span className="text-[10px] text-emerald-400/70 font-medium">
                        Adicionado
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* No results message */}
          {showDropdown && results.length === 0 && query.length >= 2 && !loading && (
            <div className="absolute z-20 top-full mt-2 w-full bg-[#111] border border-white/[0.1] rounded-xl p-4 text-center">
              <p className="text-xs text-white/40">Nenhum utilizador encontrado</p>
            </div>
          )}
        </div>
      </div>

      {/* Participants list */}
      {participants.length > 0 ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs text-white/40 uppercase tracking-wider">
              Participantes ({participants.length})
            </label>
            <Users className="h-3.5 w-3.5 text-white/25" />
          </div>
          <div className="flex flex-wrap gap-2">
            {participants.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-2 bg-white/[0.06] rounded-full pr-1 py-1"
              >
                {p.avatar_url ? (
                  <img src={p.avatar_url} alt="" className="w-6 h-6 rounded-full object-cover" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-amber-500/10 flex items-center justify-center">
                    <span className="text-[10px] text-amber-400 font-medium">
                      {(p.display_name || "?")[0].toUpperCase()}
                    </span>
                  </div>
                )}
                <span className="text-xs text-white/70 pl-1 truncate max-w-[120px]">
                  {p.display_name || p.user_id_code || p.id.slice(0, 8)}
                </span>
                <button
                  onClick={() => onRemove(p.id)}
                  className="w-5 h-5 rounded-full bg-white/[0.06] flex items-center justify-center hover:bg-red-500/20 transition-colors group"
                  aria-label="Remover participante"
                >
                  <X className="h-3 w-3 text-white/40 group-hover:text-red-400 transition-colors" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 bg-white/[0.02] rounded-xl border border-dashed border-white/[0.08]">
          <Users className="h-8 w-8 text-white/10 mx-auto mb-2" />
          <p className="text-xs text-white/30">Adiciona amigos para esta refeição</p>
          <p className="text-[10px] text-white/20 mt-1">Pesquisa por nome ou codigo FL000001</p>
        </div>
      )}
    </div>
  );
}
