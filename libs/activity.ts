import type { ListActivityAction } from '@/libs/types';

/**
 * Logs an activity to the list_activities table.
 * This is a shared utility called from API routes after successful operations.
 */
export async function logActivity(
  supabase: any,
  listId: string,
  userId: string,
  action: ListActivityAction,
  details: Record<string, any> = {}
): Promise<void> {
  try {
    const { error } = await supabase
      .from('list_activities')
      .insert({
        list_id: listId,
        user_id: userId,
        action,
        details,
      });

    if (error) {
      console.error('Error logging activity:', error);
    }
  } catch (err) {
    console.error('Failed to log activity:', err);
  }
}