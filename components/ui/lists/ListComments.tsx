"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/auth/useAuth";
import { MessageCircle, Send, Trash2, Loader2 } from "lucide-react";
import { toast } from "react-toastify";

interface Comment {
  id: string;
  list_id: string;
  user_id: string;
  comment: string;
  created_at: string;
  updated_at: string;
  profiles: {
    display_name: string | null;
    avatar_url: string | null;
  } | null;
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

  useEffect(() => {
    fetchComments();
  }, [listId]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/lists/${listId}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/lists/${listId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: newComment.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        setComments((prev) => [data.comment, ...prev]);
        setNewComment("");
        toast.success("Comentário adicionado!");
      } else {
        const error = await response.json();
        toast.error(error.error || "Erro ao adicionar comentário");
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
      toast.error("Erro ao adicionar comentário");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm("Tem certeza que deseja eliminar este comentário?")) return;

    try {
      const response = await fetch(`/api/lists/${listId}/comments?commentId=${commentId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
        toast.success("Comentário eliminado!");
      } else {
        const error = await response.json();
        toast.error(error.error || "Erro ao eliminar comentário");
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Erro ao eliminar comentário");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Agora mesmo";
    if (diffMins < 60) return `há ${diffMins}min`;
    if (diffHours < 24) return `há ${diffHours}h`;
    if (diffDays < 7) return `há ${diffDays}d`;
    return date.toLocaleDateString("pt-PT");
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <MessageCircle className="h-5 w-5 text-amber-500" />
          <h3 className="text-lg font-semibold text-gray-900">Comentários</h3>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse flex gap-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/4" />
                <div className="h-3 bg-gray-200 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle className="h-5 w-5 text-amber-500" />
        <h3 className="text-lg font-semibold text-gray-900">
          Comentários ({comments.length})
        </h3>
      </div>

      {/* Comment Form */}
      {user && (
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Adicionar comentário..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              disabled={submitting}
            />
            <button
              type="submit"
              disabled={submitting || !newComment.trim()}
              className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>
        </form>
      )}

      {/* Comments List */}
      {comments.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-4">
          {user
            ? "Ainda não há comentários. Seja o primeiro!"
            : "Faça login para comentar."}
        </p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="flex gap-3 p-3 bg-gray-50 rounded-lg"
            >
              <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-medium text-amber-600">
                  {comment.profiles?.display_name?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">
                    {comment.profiles?.display_name || "Utilizador"}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      {formatDate(comment.created_at)}
                    </span>
                    {user && user.id === comment.user_id && (
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        aria-label="Eliminar comentário"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-700 mt-1">{comment.comment}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}