"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/auth/useAuth";
import Link from "next/link";
import { MessageCircle, Send, Trash2, Pencil, Check, X, Loader2 } from "lucide-react";
import { toast } from "react-toastify";

interface Comment {
  id: string;
  list_id: string;
  user_id: string;
  comment: string;
  created_at: string;
  updated_at: string;
  profiles: { display_name: string | null; avatar_url: string | null; user_id_code: string | null } | null;
}

interface ListCommentsProps {
  listId: string;
  isOwner: boolean;
}

export default function ListComments({ listId, isOwner }: ListCommentsProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [saving, setSaving] = useState(false);
  const editRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { fetchComments(); }, [listId]);

  useEffect(() => {
    if (editingId && editRef.current) {
      editRef.current.focus();
    }
  }, [editingId]);

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/lists/${listId}/comments`);
      if (res.ok) setComments((await res.json()).comments || []);
    } catch (e) { console.error("Error fetching comments:", e); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/lists/${listId}/comments`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: newComment.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setComments(prev => [data.comment, ...prev]);
        setNewComment("");
        toast.success("Comentario adicionado!");
      } else {
        const err = await res.json();
        toast.error(err.error || "Erro ao adicionar comentario");
      }
    } catch { toast.error("Erro ao adicionar comentario"); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm("Tem certeza que deseja eliminar este comentario?")) return;
    try {
      const res = await fetch(`/api/lists/${listId}/comments?commentId=${commentId}`, { method: "DELETE" });
      if (res.ok) { setComments(prev => prev.filter(c => c.id !== commentId)); toast.success("Comentario eliminado!"); }
      else { const err = await res.json(); toast.error(err.error || "Erro ao eliminar"); }
    } catch { toast.error("Erro ao eliminar comentario"); }
  };

  const startEdit = (comment: Comment) => {
    setEditingId(comment.id);
    setEditText(comment.comment);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  const handleEdit = async (commentId: string) => {
    if (!editText.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/lists/${listId}/comments`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId, comment: editText.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setComments(prev => prev.map(c => c.id === commentId ? data.comment : c));
        setEditingId(null);
        setEditText("");
        toast.success("Comentario editado!");
      } else {
        const err = await res.json();
        toast.error(err.error || "Erro ao editar comentario");
      }
    } catch { toast.error("Erro ao editar comentario"); }
    finally { setSaving(false); }
  };

  const formatDate = (dateString: string) => {
    const diff = Date.now() - new Date(dateString).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Agora mesmo";
    if (mins < 60) return `ha ${mins}min`;
    const hours = Math.floor(diff / 3600000);
    if (hours < 24) return `ha ${hours}h`;
    const days = Math.floor(diff / 86400000);
    if (days < 7) return `ha ${days}d`;
    return new Date(dateString).toLocaleDateString("pt-PT");
  };

  const wasEdited = (comment: Comment) => {
    return new Date(comment.updated_at).getTime() - new Date(comment.created_at).getTime() > 1000;
  };

  if (loading) {
    return (
      <div className="p-5 rounded-3xl bg-white/[0.02] border border-white/[0.06]">
        <div className="flex items-center gap-2 mb-5">
          <MessageCircle className="h-5 w-5 text-amber-400/50" />
          <h3 className="text-lg font-semibold text-white/50">Comentarios</h3>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse flex gap-3">
              <div className="w-9 h-9 bg-white/[0.04] rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 bg-white/[0.04] rounded w-1/4" />
                <div className="h-3 bg-white/[0.04] rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-1.5 rounded-3xl bg-white/[0.02] border border-white/[0.06]">
      <div className="p-4 md:p-6 rounded-2xl bg-white/[0.03]">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="bg-amber-500/10 rounded-xl p-2"><MessageCircle className="h-5 w-5 text-amber-400" /></div>
            <div>
              <h3 className="text-lg font-semibold text-white/85">Comentarios</h3>
              <p className="text-xs text-white/30">{comments.length} comentario{comments.length !== 1 ? "s" : ""}</p>
            </div>
          </div>
        </div>

        {/* Comment Form */}
        {user && (
          <form onSubmit={handleSubmit} className="mb-6">
            <div className="p-1 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
              <div className="flex gap-2 p-2 rounded-xl bg-white/[0.03]">
                <input
                  type="text"
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  placeholder="Adicionar comentario..."
                  className="flex-1 px-4 py-2.5 bg-transparent text-white/85 placeholder:text-white/25 text-sm rounded-xl focus:outline-none"
                  disabled={submitting}
                />
                <button
                  type="submit"
                  disabled={submitting || !newComment.trim()}
                  className="px-4 py-2.5 bg-amber-500 text-black rounded-xl hover:bg-amber-400 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-semibold transition-all duration-200 min-h-[44px] hover:scale-105 disabled:hover:scale-100"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  <span className="hidden sm:inline">Enviar</span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Comments List */}
        {comments.length === 0 ? (
          <div className="text-center py-10">
            <MessageCircle className="h-12 w-12 text-white/[0.06] mx-auto mb-3" />
            <p className="text-sm text-white/30">
              {user ? "Ainda nao ha comentarios. Seja o primeiro!" : "Faca login para comentar."}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {comments.map(comment => (
              <div key={comment.id} className="group flex gap-3 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-200">
                {/* Avatar - clickable */}
                <Link href={`/users/${comment.profiles?.user_id_code || comment.user_id}`} className="flex-shrink-0">
                  {comment.profiles?.avatar_url ? (
                    <img src={comment.profiles.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover ring-2 ring-white/[0.06] hover:ring-amber-500/30 transition-all duration-150" />
                  ) : (
                    <div className="w-9 h-9 bg-amber-500/10 rounded-full flex items-center justify-center ring-1 ring-amber-500/15 hover:ring-amber-500/30 transition-all duration-150">
                      <span className="text-xs font-semibold text-amber-400">
                        {(comment.profiles?.display_name || "U").charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </Link>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {editingId === comment.id ? (
                    /* Edit Mode */
                    <div className="space-y-2">
                      <textarea
                        ref={editRef}
                        value={editText}
                        onChange={e => setEditText(e.target.value)}
                        className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white/85 placeholder:text-white/25 focus:outline-none focus:border-amber-500/40 resize-none"
                        rows={2}
                        disabled={saving}
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={cancelEdit}
                          disabled={saving}
                          className="p-1.5 text-white/40 hover:text-white/60 hover:bg-white/[0.04] rounded-lg transition-all duration-150"
                          aria-label="Cancelar"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleEdit(comment.id)}
                          disabled={saving || !editText.trim()}
                          className="p-1.5 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 rounded-lg transition-all duration-150 disabled:opacity-30"
                          aria-label="Guardar"
                        >
                          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* View Mode */
                    <>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <Link href={`/users/${comment.profiles?.user_id_code || comment.user_id}`} className="text-sm font-semibold text-white/80 truncate hover:text-amber-400 transition-colors duration-150">
                            {comment.profiles?.display_name || "Utilizador"}
                          </Link>
                          <span className="text-[11px] text-white/25 flex-shrink-0">{formatDate(comment.created_at)}</span>
                          {wasEdited(comment) && (
                            <span className="text-[10px] text-white/15 italic flex-shrink-0">(editado)</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {user?.id === comment.user_id && (
                            <button
                              onClick={() => startEdit(comment)}
                              className="p-1 text-white/20 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-all duration-150 opacity-0 group-hover:opacity-100"
                              aria-label="Editar comentario"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                          )}
                          {(user?.id === comment.user_id || isOwner) && (
                            <button
                              onClick={() => handleDelete(comment.id)}
                              className="p-1 text-white/20 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-150 opacity-0 group-hover:opacity-100"
                              aria-label="Eliminar comentario"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-white/50 leading-relaxed mt-0.5">{comment.comment}</p>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
