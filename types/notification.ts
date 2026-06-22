export type NotificationType =
  | 'meal_invitation'
  | 'meal_reminder'
  | 'review_created'
  | 'comment_reply'
  | 'list_invite'
  | 'list_update'
  | 'restaurant_visit'
  | 'system';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType | string;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationFilter {
  unreadOnly?: boolean;
  types?: NotificationType[];
  limit?: number;
  offset?: number;
}

export interface NotificationActionResult {
  success: boolean;
  error?: string;
}

export const NOTIFICATION_TYPE_CONFIG: Record<NotificationType, { label: string; color: string }> = {
  meal_invitation: { label: 'Convite para refeição', color: '#f59e0b' },
  meal_reminder: { label: 'Lembrete de refeição', color: '#f97316' },
  review_created: { label: 'Novo review', color: '#eab308' },
  comment_reply: { label: 'Resposta a comentário', color: '#3b82f6' },
  list_invite: { label: 'Convite para lista', color: '#22c55e' },
  list_update: { label: 'Lista atualizada', color: '#14b8a6' },
  restaurant_visit: { label: 'Visita registada', color: '#a855f7' },
  system: { label: 'Sistema', color: 'rgba(255,255,255,0.5)' },
};
