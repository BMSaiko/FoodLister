"use client";

import React, { useState, useEffect } from "react";
import { Users, UserPlus, Trash2, Loader2, Mail, Shield, Eye } from "lucide-react";
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

interface ListCollaboratorsProps {
  listId: string;
  isOwner: boolean;
}

export default function ListCollaborators({ listId, isOwner }: ListCollaboratorsProps) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"editor" | "viewer">("editor");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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

  const handleAddCollaborator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/lists/${listId}/collaborators`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), role }),
      });
      const data = await response.json();

      if (response.ok) {
        toast.success("Colaborador adicionado com sucesso!");
        setEmail("");
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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
        <Users className="h-5 w-5" />
        <span>Colaboradores ({collaborators.length})</span>
      </div>

      {/* Add Collaborator Form */}
      {isOwner && (
        <form onSubmit={handleAddCollaborator} className="flex gap-2 items-end">
          <div className="flex-1">
            <label className="block text-sm text-gray-600 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="utilizador@exemplo.com"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                disabled={submitting}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Função</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "editor" | "viewer")}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              disabled={submitting}
            >
              <option value="editor">Editor</option>
              <option value="viewer">Visualizador</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={submitting || !email.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <UserPlus className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">Adicionar</span>
          </button>
        </form>
      )}

      {/* Collaborators List */}
      {collaborators.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-4">
          Nenhum colaborador nesta lista
        </p>
      ) : (
        <div className="space-y-2">
          {collaborators.map((collab) => (
            <div
              key={collab.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-semibold">
                  {collab.profiles?.display_name?.[0]?.toUpperCase() || "U"}
                </div>
                <div>
                  <p className="font-medium text-gray-800">
                    {collab.profiles?.display_name || "Utilizador"}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
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
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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