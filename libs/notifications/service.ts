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
