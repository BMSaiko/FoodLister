"use client";

import React from "react";
import { useListActivities } from "@/hooks/lists/useListActivities";
import { Activity, Loader2, ChevronDown, User } from "lucide-react";
import type { ListActivityAction } from "@/libs/types";

interface ListActivityFeedProps {
  listId: string;
}

const ACTION_LABELS: Record<ListActivityAction, string> = {
  restaurant_added: "adicionou um restaurante",
  restaurant_removed: "removeu um restaurante",
  list_updated: "atualizou a lista",
  collaborator_added: "adicionou um colaborador",
  collaborator_removed: "removeu um colaborador",
  list_duplicated: "duplicou a lista",
};

function formatTimeAgo(dateString: string): string {
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
}

export default function ListActivityFeed({ listId }: ListActivityFeedProps) {
  const { activities, total, isLoading, error, hasMore, loadMore } = useListActivities(listId);

  if (error) {
    return (
      <div className="bg-[var(--card-bg)] rounded-xl shadow-[var(--card-shadow)] p-6">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="h-5 w-5 text-[var(--primary)]" />
          <h3 className="text-lg font-semibold text-[var(--gray-900)]">Atividade</h3>
        </div>
        <p className="text-[var(--error)] text-sm">Erro ao carregar atividade: {error}</p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--card-bg)] rounded-xl shadow-[var(--card-shadow)] p-6">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="h-5 w-5 text-[var(--primary)]" />
        <h3 className="text-lg font-semibold text-[var(--gray-900)]">
          Atividade {total > 0 && <span className="text-[var(--gray-500)] font-normal">({total})</span>}
        </h3>
      </div>

      {isLoading && activities.length === 0 ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-[var(--primary)]" />
        </div>
      ) : activities.length === 0 ? (
        <p className="text-[var(--gray-500)] text-sm text-center py-4">
          Sem atividade registada.
        </p>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex gap-3 p-3 bg-[var(--gray-50)] rounded-lg"
            >
              <div className="w-8 h-8 bg-[var(--primary-light)] rounded-full flex items-center justify-center flex-shrink-0">
                {activity.profiles?.avatar_url ? (
                  <img
                    src={activity.profiles.avatar_url}
                    alt={activity.profiles.display_name || ""}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-4 w-4 text-[var(--primary-dark)]" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-[var(--gray-900)]">
                    {activity.profiles?.display_name || "Utilizador"}
                  </span>
                  <span className="text-sm text-[var(--gray-600)]">
                    {ACTION_LABELS[activity.action]}
                  </span>
                </div>
                {activity.details?.restaurant_name && (
                  <p className="text-xs text-[var(--gray-500)] mt-0.5 truncate">
                    {activity.details.restaurant_name}
                  </p>
                )}
                <span className="text-xs text-[var(--gray-400)]">
                  {formatTimeAgo(activity.created_at)}
                </span>
              </div>
            </div>
          ))}

          {hasMore && (
            <button
              onClick={loadMore}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-2 text-sm text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  Carregar mais
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

