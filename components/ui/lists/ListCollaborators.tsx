"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Users, UserPlus, Trash2, Loader2, Search, X, Shield, Eye } from "lucide-react";
import { toast } from "react-toastify";

interface Collaborator {
  id: string;
  list_id: string;
  user_id: string;
  role: "editor" | "viewer";
  created_at: string;
  profiles: {
    display_name: string | null;
    avatar_url: string | null;
  } | null;
}

interface UserSuggestion {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  user_id_code: string | null;
}

interface ListCollaboratorsProps {
  listId: string;
  isOwner: boolean;
}

const USER_SEARCH_DEBOUNCE = 300;
const MIN_QUERY_LENGTH = 2;

export default function ListCollaborators({ listId, isOwner }: ListCollaboratorsProps) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserSuggestion | null>(null);
  const [role, setRole] = useState<"editor" | "viewer">("editor");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Autocomplete state
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<UserSuggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searching, setSearching] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchCollaborators();
  }, [listId]);

  const fetchCollaborators = async () => {
    try {
      const response = await fetch(`/api/lists/${listId}/collaborators`);
      if (response.ok) {
        const data = await response.json();
        setCollaborators(data.collaborators || []);
      }
    } catch (error) {
      console.error("Error fetching collaborators:", error);
    } finally {
      setLoading(false);
    }
  };

  // Debounced user search
  const searchUsers = useCallback(async (q: string) => {
    if (q.length < MIN_QUERY_LENGTH) { setSuggestions([]); setShowDropdown(false); return; }
    setSearching(true);
    try {
      const resp = await fetch(`/api/users/search?q=${encodeURIComponent(q)}&limit=8`);
      if (resp.ok) {
        const data = await resp.json();
        const items: UserSuggestion[] = data.data || [];
        setSuggestions(items);
        setShowDropdown(items.length > 0);
      } else {
        setSuggestions([]);
        setShowDropdown(false);
      }
    } catch {
      setSuggestions([]);
      setShowDropdown(false);
    } finally {
      setSearching(false);
    }
  }, []);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    setSelectedUser(null);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (value.length >= MIN_QUERY_LENGTH) {
      searchTimeout.current = setTimeout(() => searchUsers(value), USER_SEARCH_DEBOUNCE);
    } else {
      setSuggestions([]);
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

  const handleSelectUser = (user: UserSuggestion) => {
    if (collaborators.some((c) => c.user_id === user.user_id)) {
      toast.error("Utilizador já é colaborador");
      return;
    }
    setSelectedUser(user);
    setQuery(`${user.display_name || ""} #${user.user_id_code || ""}`.trim());
    setSuggestions([]);
    setShowDropdown(false);
  };

  const handleAddCollaborator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) {
      toast.error("Pesquisa e seleciona um utilizador");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/lists/${listId}/collaborators`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: selectedUser.user_id,
          role,
        }),
      });
      const data = await response.json();

      if (response.ok) {
        toast.success("Colaborador adicionado com sucesso!");
        setSelectedUser(null);
        setQuery("");
        fetchCollaborators();
      } else {
        toast.error(data.error || "Erro ao adicionar colaborador");
      }
    } catch (error) {
      console.error("Error adding collaborator:", error);
      toast.error("Erro ao adicionar colaborador");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClearSearch = () => {
    setQuery("");
    setSelectedUser(null);
    setSuggestions([]);
    setShowDropdown(false);
  };

  const handleRemoveCollaborator = async (userId: string) => {
    if (!confirm("Remover este colaborador?")) return;

    try {
      const response = await fetch(`/api/lists/${listId}/collaborators?userId=${userId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Colaborador removido com sucesso!");
        fetchCollaborators();
      } else {
        const data = await response.json();
        toast.error(data.error || "Erro ao remover colaborador");
      }
    } catch (error) {
      console.error("Error removing collaborator:", error);
      toast.error("Erro ao remover colaborador");
    }
  };

  const isAdded = (userId: string) => collaborators.some((c) => c.user_id === userId);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-lg font-semibold text-[var(--gray-800)]">
        <Users className="h-5 w-5" />
        <span>Colaboradores ({collaborators.length})</span>
      </div>

      {/* Add Collaborator Form */}
      {isOwner && (
        <form onSubmit={handleAddCollaborator} className="space-y-3">
          <div>
            <label className="block text-xs text-white/40 uppercase tracking-wider mb-2">
              Pesquisar utilizador
            </label>
            <div className="relative" ref={dropdownRef}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                onFocus={() => suggestions.length > 0 && collaborators.length === 0 ? setShowDropdown(true) : null}
                placeholder="Pesquisar por nome ou codigo FL000001..."
                className="w-full pl-10 pr-10 py-3 bg-white/[0.06] border border-white/[0.1] rounded-xl text-sm text-white/90 placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
              />
              {searching && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 animate-spin" />
              )}
              {!searching && query.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-white/10 transition-colors"
                  aria-label="Limpar pesquisa"
                >
                  <X className="h-3.5 w-3.5 text-white/40" />
                </button>
              )}

              {/* Suggestions dropdown */}
              {showDropdown && suggestions.length > 0 && (
                <div className="absolute z-20 top-full mt-2 w-full bg-[#111] border border-white/[0.1] rounded-xl overflow-hidden shadow-2xl shadow-black/50 max-h-56 overflow-y-auto">
                  {suggestions.map((user) => {
                    const added = isAdded(user.user_id);
                    return (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => !added && handleSelectUser(user)}
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
                            <span className="text-xs text-amber-400 font-medium">
                              {((user.display_name || user.user_id_code || "?")[0]).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white/85 truncate">
                            {user.display_name || user.user_id_code || user.user_id.slice(0, 8)}
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

              {/* No results */}
              {showDropdown && suggestions.length === 0 && query.length >= MIN_QUERY_LENGTH && !searching && (
                <div className="absolute z-20 top-full mt-2 w-full bg-[#111] border border-white/[0.1] rounded-xl p-4 text-center">
                  <p className="text-xs text-white/40">Nenhum utilizador encontrado</p>
                </div>
              )}
            </div>
          </div>

          {/* Selected user badge + role + submit */}
          {selectedUser && (
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 bg-white/[0.06] rounded-full pr-1 py-1">
                <div className="w-6 h-6 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <span className="text-[10px] text-amber-400 font-medium">
                    {((selectedUser.display_name || selectedUser.user_id_code || "?")[0]).toUpperCase()}
                  </span>
                </div>
                <span className="text-xs text-white/70 pl-1 truncate max-w-[140px]">
                  {selectedUser.display_name || selectedUser.user_id_code || selectedUser.user_id.slice(0, 8)}
                </span>
                {selectedUser.user_id_code && (
                  <span className="text-[10px] text-white/30">#{selectedUser.user_id_code}</span>
                )}
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="w-5 h-5 rounded-full bg-white/[0.06] flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                  <X className="h-3 w-3 text-white/40" />
                </button>
              </div>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as "editor" | "viewer")}
                className="px-3 py-2 bg-white/[0.06] border border-white/[0.1] rounded-xl text-sm text-white/80 focus:outline-none focus:ring-2 focus:ring-amber-500/50 disabled:opacity-50"
                disabled={submitting}
              >
                <option value="editor" className="bg-[#111]">Editor</option>
                <option value="viewer" className="bg-[#111]">Visualizador</option>
              </select>
              <button
                type="submit"
                disabled={submitting || !selectedUser}
                className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-xl hover:bg-[var(--primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <UserPlus className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">Adicionar</span>
              </button>
            </div>
          )}
        </form>
      )}

      {/* Collaborators List */}
      {collaborators.length === 0 ? (
        <p className="text-[var(--gray-500)] text-sm text-center py-4">
          Nenhum colaborador nesta lista
        </p>
      ) : (
        <div className="space-y-2">
          {collaborators.map((collab) => (
            <div
              key={collab.id}
              className="flex items-center justify-between p-3 bg-white/[0.04] rounded-xl border border-white/[0.06]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--primary-light)] flex items-center justify-center text-[var(--primary-dark)] font-semibold">
                  {collab.profiles?.display_name?.[0]?.toUpperCase() || "U"}
                </div>
                <div>
                  <p className="font-medium text-[var(--gray-800)]">
                    {collab.profiles?.display_name || "Utilizador"}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-[var(--gray-500)]">
                    {collab.role === "editor" ? (
                      <Shield className="h-3 w-3" />
                    ) : (
                      <Eye className="h-3 w-3" />
                    )}
                    <span className="capitalize">{collab.role}</span>
                  </div>
                </div>
              </div>
              {isOwner && (
                <button
                  onClick={() => handleRemoveCollaborator(collab.user_id)}
                  className="p-2 text-[var(--error)] hover:bg-red-500/10 rounded-lg transition-colors"
                  aria-label="Remover colaborador"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
