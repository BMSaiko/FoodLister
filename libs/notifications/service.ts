import { createClient } from '@supabase/supabase-js';

/**
 * Notification Service — centralizes all notification logic.
 * Used by API routes and server-side flows (e.g. meal creation).
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

// Service-role client for server-to-server calls (bypasses RLS)
const serviceClient = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

// ponytail: notification type -> coarse preference column. No key = default allow.
const NOTIFICATION_PREF_MAP: Record<string, string> = {
  meal_invitation: 'meal_invitations',
  meal_reminder: 'meal_invitations',
  list_invite: 'collaborator_updates',
  list_update: 'list_activity',
  system: 'system_updates',
};

// ponytail: single source of truth for preference enforcement (root-cause fix).
// Reads the user's row; missing row = defaults (all enabled). No pref key = allow.
async function isNotificationEnabled(userId: string, type: string): Promise<boolean> {
  const prefKey = NOTIFICATION_PREF_MAP[type];
  if (!prefKey || !serviceClient) return true;
  const { data } = await serviceClient
    .from('notification_preferences')
    .select(prefKey)
    .eq('user_id', userId)
    .single();
  if (!data) return true;
  return (data as unknown as Record<string, boolean>)[prefKey] !== false;
}

export interface CreateNotificationInput {
  userId: string;
  type: string;
  title: string;
  message: string;
  link?: string | null;
}

/**
 * Create a notification for a specific user.
 * Uses service role key — only called from trusted server contexts.
 */
export async function createNotification(input: CreateNotificationInput): Promise<{ success: boolean; error?: string }> {
  if (!serviceClient) {
    return { success: false, error: 'Service role not configured' };
  }

  // ponytail: one guard covers all callers (T12's 5 + future). Disabled -> swallow.
  if (!(await isNotificationEnabled(input.userId, input.type))) {
    return { success: true };
  }

  const { error } = await serviceClient
    .from('notifications')
    .insert({
      user_id: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      link: input.link ?? null,
    });

  if (error) {
    console.error('[NotificationService] Create error:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Create notifications for multiple users (batch).
 * More efficient than calling createNotification in a loop.
 */
export async function createNotificationsForUsers(
  userIds: string[],
  type: string,
  title: string,
  message: string,
  link?: string | null
): Promise<{ success: boolean; count: number; error?: string }> {
  if (!serviceClient || userIds.length === 0) {
    return { success: false, count: 0, error: 'Service role not configured or no users' };
  }

  // ponytail: respect per-user prefs (shared helper; batch-read ceiling if scale matters)
  const allowed = await Promise.all(
    userIds.map(async (id) => ((await isNotificationEnabled(id, type)) ? id : null))
  );
  const allowedIds = allowed.filter((id): id is string => id !== null);
  if (allowedIds.length === 0) {
    return { success: true, count: 0 };
  }

  const rows = allowedIds.map((userId) => ({
    user_id: userId,
    type,
    title,
    message,
    link: link ?? null,
  }));

  const { error } = await serviceClient
    .from('notifications')
    .insert(rows);

  if (error) {
    console.error('[NotificationService] Batch create error:', error);
    return { success: false, count: 0, error: error.message };
  }

  return { success: true, count: allowedIds.length };
}

/**
 * Send meal invitation notification to participants.
 * Convenience method that combines meal data + notification creation.
 */
export async function notifyMealInvitation(
  participantIds: string[],
  mealId: string,
  restaurantName: string,
  mealDate: string
): Promise<{ success: boolean; count: number }> {
  return createNotificationsForUsers(
    participantIds,
    'meal_invitation',
    `Convite: ${restaurantName}`,
    `Foste convidado para uma refeição em ${restaurantName} a ${mealDate}`,
    `/meals/${mealId}`
  );
}

/**
 * Send meal reminder notification.
 */
export async function notifyMealReminder(
  participantIds: string[],
  mealId: string,
  restaurantName: string,
  mealDate: string
): Promise<{ success: boolean; count: number }> {
  return createNotificationsForUsers(
    participantIds,
    'meal_reminder',
    `Lembrete: ${restaurantName}`,
    `A refeição em ${restaurantName} é amanhã às ${mealDate}`,
    `/meals/${mealId}`
  );
}

/**
 * Send list collaboration notification.
 */
export async function notifyListInvite(
  inviteeId: string,
  listName: string,
  inviterName: string,
  listId: string
): Promise<{ success: boolean }> {
  const result = await createNotification({
    userId: inviteeId,
    type: 'list_invite',
    title: `Convite para lista: ${listName}`,
    message: `${inviterName} convidou-te para colaborar na lista "${listName}"`,
    link: `/lists/${listId}`,
  });
  return { success: result.success };
}
