"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuthUser } from '@/hooks/auth/useAuthUser';
import Link from "next/link";
import { TooltipFast } from "@/components/ui/Tooltip";
import { toast } from "react-toastify";
import MentionText from "@/components/ui/common/MentionText";
import MentionInput from "@/components/ui/common/MentionInput";
import ToviSpinner from '@/components/loading/ToviSpinner';
import Icon from '@/components/ui/icons/Icon';

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
  /** T67: id of a comment to scroll to and highlight (from URL ?comment=) */
  highlightCommentId?: string;
}

export default function ListComments({ listId, isOwner, highlightCommentId }: ListCommentsProps) {
  const { user } = useAuthUser();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [saving, setSaving] = useState(false);
  const editRef = useRef<HTMLTextAreaElement>(null);
  const commentRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => { fetchComments(); }, [listId]);

  useEffect(() => {
    if (highlightCommentId && commentRefs.current[highlightCommentId]) {
      commentRefs.current[highlightCommentId]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlightCommentId, comments]);

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
        body: JSON.stringify({ comment: newComment.trim() }) });
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
        body: JSON.stringify({ commentId, comment: editText.trim() }) });
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
    if (mins < 60) return `há ${mins}min`;
    const hours = Math.floor(diff / 3600000);
    if (hours < 24) return `há ${hours}h`;
    const days = Math.floor(diff / 86400000);
    if (days < 7) return `há ${days}d`;
    return new Date(dateString).toLocaleDateString("pt-PT");
  };

  const wasEdited = (comment: Comment) => {
    return new Date(comment.updated_at).getTime() - new Date(comment.created_at).getTime() > 1000;
  };

  const panel = "rounded-[14px] border border-white/[0.08] bg-[#0c0c0c] p-5";
  const heading = (
    <h3 className="mb-3 text-[13px] font-medium uppercase tracking-[0.08em] text-white/50">
      Comentários{comments.length > 0 && <span className="normal-case tracking-normal"> ({comments.length})</span>}
    </h3>
  );
  const initials = (name?: string | null) => (name || "U").slice(0, 2).toUpperCase();

  if (loading) {
    return (
      <section className={panel} id="comentarios">
        {heading}
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse flex gap-3">
              <div className="w-8 h-8 bg-white/[0.04] rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 bg-white/[0.04] rounded w-1/4" />
                <div className="h-3 bg-white/[0.04] rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className={panel} id="comentarios">
      {heading}

      {comments.length === 0 ? (
        <p className="py-4 text-center text-sm text-white/50">
          {user ? "Ainda não há comentários. Seja o primeiro!" : "Faça login para comentar."}
        </p>
      ) : (
        <div>
          {comments.map((comment, i) => (
            <div
              key={comment.id}
              ref={(el) => { commentRefs.current[comment.id] = el; }}
              className={`group flex gap-3 py-3 ${i === 0 ? "pt-0" : "border-t border-white/[0.08]"} ${
                highlightCommentId === comment.id ? "rounded-[10px] bg-amber-500/10 ring-1 ring-amber-500/30 px-3" : ""
              }`}
            >
              <Link href={`/users/${comment.profiles?.user_id_code || comment.user_id}`} className="flex-shrink-0">
                {comment.profiles?.avatar_url ? (
                  <img src={comment.profiles.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover" />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/[0.18] text-xs text-amber-300">
                    {initials(comment.profiles?.display_name)}
                  </div>
                )}
              </Link>

              <div className="min-w-0 flex-1 text-sm">
                {editingId === comment.id ? (
                  <div className="space-y-2">
                    <textarea
                      ref={editRef}
                      value={editText}
                      onChange={e => setEditText(e.target.value)}
                      className="w-full resize-none rounded-[10px] border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white/85 focus:border-amber-500/40 focus:outline-none"
                      rows={2}
                      disabled={saving}
                    />
                    <div className="flex items-center justify-end gap-2">
                      <TooltipFast content="Cancelar">
                        <button
                          onClick={cancelEdit}
                          disabled={saving}
                          className="flex h-11 w-11 items-center justify-center rounded-[10px] text-white/50 hover:bg-white/[0.06]"
                          aria-label="Cancelar"
                        >
                          <Icon name="fechar" className="h-4 w-4" />
                        </button>
                      </TooltipFast>
                      <TooltipFast content="Guardar">
                        <button
                          onClick={() => handleEdit(comment.id)}
                          disabled={saving || !editText.trim()}
                          className="flex h-11 w-11 items-center justify-center rounded-[10px] text-amber-300 hover:bg-amber-500/10 disabled:opacity-30"
                          aria-label="Guardar"
                        >
                          {saving ? <ToviSpinner className="h-4 w-4" /> : <Icon name="visto" className="h-4 w-4" />}
                        </button>
                      </TooltipFast>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <Link href={`/users/${comment.profiles?.user_id_code || comment.user_id}`} className="truncate font-semibold hover:text-amber-300">
                          {comment.profiles?.display_name || "Utilizador"}
                        </Link>
                        <span className="flex-shrink-0 text-xs text-white/50">{formatDate(comment.created_at)}</span>
                        {wasEdited(comment) && (
                          <span className="flex-shrink-0 text-xs italic text-white/30">(editado)</span>
                        )}
                      </div>
                      <div className="flex flex-shrink-0 items-center">
                        {user?.id === comment.user_id && (
                          <TooltipFast content="Editar comentário">
                            <button
                              onClick={() => startEdit(comment)}
                              className="flex h-11 w-11 items-center justify-center rounded-[10px] text-white/40 hover:bg-amber-500/10 hover:text-amber-300"
                              aria-label="Editar comentário"
                            >
                              <Icon name="editar" className="h-4 w-4" />
                            </button>
                          </TooltipFast>
                        )}
                        {(user?.id === comment.user_id || isOwner) && (
                          <TooltipFast content="Eliminar comentário">
                            <button
                              onClick={() => handleDelete(comment.id)}
                              className="flex h-11 w-11 items-center justify-center rounded-[10px] text-white/40 hover:bg-red-500/10 hover:text-red-400"
                              aria-label="Eliminar comentário"
                            >
                              <Icon name="apagar" className="h-4 w-4" />
                            </button>
                          </TooltipFast>
                        )}
                      </div>
                    </div>
                    <MentionText text={comment.comment} className="whitespace-pre-wrap leading-relaxed" />
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {user && (
        <form onSubmit={handleSubmit} className="mt-2 flex gap-2">
          <MentionInput
            wrapperClassName="flex-1"
            value={newComment}
            onChange={setNewComment}
            placeholder="Escrever comentário… @ para mencionar"
            disabled={submitting}
            className="min-h-[44px] w-full rounded-[10px] border border-white/[0.08] bg-white/[0.03] px-3.5 text-sm text-white/85 placeholder:text-white/30 focus:border-amber-500/40 focus:outline-none"
          />
          <button
            type="submit"
            disabled={submitting || !newComment.trim()}
            className="flex min-h-[44px] items-center gap-2 rounded-[10px] bg-amber-500 px-4 text-sm font-semibold text-[#111] transition-colors hover:bg-amber-400 disabled:opacity-40"
          >
            {submitting ? <ToviSpinner className="h-4 w-4" /> : <Icon name="enviar" className="h-4 w-4" />}
            Enviar
          </button>
        </form>
      )}
    </section>
  );
}
