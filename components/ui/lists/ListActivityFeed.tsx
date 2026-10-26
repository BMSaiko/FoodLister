"use client";

import React from "react";
import { useListActivities } from "@/hooks/lists/useListActivities";
import type { ListActivityAction } from "@/libs/types";
import ToviLoader from "@/components/loading/ToviLoader";
import ToviSpinner from '@/components/loading/ToviSpinner';
import Icon from '@/components/ui/icons/Icon';

interface ListActivityFeedProps {
  listId: string;
}

const ACTION_LABELS: Record<ListActivityAction, string> = {
  restaurant_added: "adicionou um restaurante",
  restaurant_removed: "removeu um restaurante",
  list_updated: "atualizou a lista",
  collaborator_added: "adicionou um colaborador",
  collaborator_removed: "removeu um colaborador",
  list_duplicated: "duplicou a lista" };

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

  const panel = "rounded-[14px] border border-white/[0.08] bg-[#0c0c0c] p-5";
  const heading = (
    <h3 className="mb-3 text-[13px] font-medium uppercase tracking-[0.08em] text-white/50">
      Atividade {total > 0 && <span className="normal-case tracking-normal">({total})</span>}
    </h3>
  );

  if (error) {
    return (
      <section className={panel}>
        {heading}
        <p className="text-sm text-red-400">Erro ao carregar atividade: {error}</p>
      </section>
    );
  }

  return (
    <section className={panel}>
      {heading}

      {isLoading && activities.length === 0 ? (
        <div className="flex items-center justify-center py-8">
          <ToviLoader size="sm" />
        </div>
      ) : activities.length === 0 ? (
        <p className="py-4 text-center text-sm text-white/50">Sem atividade registada.</p>
      ) : (
        <div>
          {activities.map((activity, i) => (
            <div
              key={activity.id}
              className={`flex gap-3 py-3 ${i === 0 ? "pt-0" : "border-t border-white/[0.08]"}`}
            >
              <div className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-amber-500/[0.18] text-xs text-amber-300">
                {activity.profiles?.avatar_url ? (
                  <img
                    src={activity.profiles.avatar_url}
                    alt={activity.profiles.display_name || ""}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  (activity.profiles?.display_name || "U").slice(0, 2).toUpperCase()
                )}
              </div>
              <div className="min-w-0 flex-1 text-sm">
                <div>
                  <b className="font-semibold">{activity.profiles?.display_name || "Utilizador"}</b>{" "}
                  {ACTION_LABELS[activity.action]}
                  {activity.details?.restaurant_name && (
                    <> <b className="font-semibold">{activity.details.restaurant_name}</b></>
                  )}
                </div>
                <div className="text-xs text-white/50">{formatTimeAgo(activity.created_at)}</div>
              </div>
            </div>
          ))}

          {hasMore && (
            <button
              onClick={loadMore}
              disabled={isLoading}
              className="mt-2 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-[10px] border border-white/[0.08] bg-white/[0.03] text-sm hover:bg-white/[0.07] disabled:opacity-50"
            >
              {isLoading ? (
                <ToviSpinner className="h-4 w-4" />
              ) : (
                <>
                  <Icon name="chevron-baixo" className="h-4 w-4" />
                  Carregar mais
                </>
              )}
            </button>
          )}
        </div>
      )}
    </section>
  );
}
