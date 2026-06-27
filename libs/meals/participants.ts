import { getServerClient } from '@/libs/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Participant Service — manages meal participant operations.
 */

export interface ParticipantResult {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * Add participants to a meal.
 * Only the organizer can add participants.
 */
export async function addParticipants(
  mealId: string,
  organizerId: string,
  userIds: string[]
): Promise<ParticipantResult> {
  const response = new NextResponse();
  const supabase = await getServerClient({} as NextRequest, response) as any;

  if (!supabase) {
    return { success: false, error: 'Authentication required' };
  }

  // Verify organizer
  const { data: meal } = await supabase
    .from('scheduled_meals')
    .select('organizer_id')
    .eq('id', mealId)
    .single();

  if (!meal || meal.organizer_id !== organizerId) {
    return { success: false, error: 'Only organizer can add participants' };
  }

  // Filter out existing participants
  const { data: existing } = await supabase
    .from('meal_participants')
    .select('user_id')
    .eq('scheduled_meal_id', mealId);

  const existingIds = new Set(existing?.map((e: any) => e.user_id) || []);
  const newUserIds = userIds.filter(id => !existingIds.has(id));

  if (newUserIds.length === 0) {
    return { success: true, data: [] };
  }

  const rows = newUserIds.map(userId => ({
    scheduled_meal_id: mealId,
    user_id: userId,
    status: 'pending',
  }));

  const { data, error } = await supabase
    .from('meal_participants')
    .insert(rows)
    .select('*, profiles:profiles!meal_participants_user_id_fkey (user_id, display_name, avatar_url, user_id_code)');

  if (error) {
    console.error('[ParticipantService] Add error:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

/**
 * Update participant status (accept/decline).
 * Participants can update their own status; organizer can update any.
 */
export async function updateParticipantStatus(
  mealId: string,
  userId: string,
  status: 'pending' | 'accepted' | 'declined',
  participantId?: string
): Promise<ParticipantResult> {
  const response = new NextResponse();
  const supabase = await getServerClient({} as NextRequest, response) as any;

  if (!supabase) {
    return { success: false, error: 'Authentication required' };
  }

  let query = supabase
    .from('meal_participants')
    .update({ status })
    .eq('scheduled_meal_id', mealId);

  if (participantId) {
    // Organizer updating specific participant
    query = query.eq('id', participantId);
  } else {
    // User updating their own status
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query
    .select('*, profiles:profiles!meal_participants_user_id_fkey (user_id, display_name, avatar_url, user_id_code)')
    .single();

  if (error) {
    console.error('[ParticipantService] Update error:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

/**
 * Remove participant from a meal.
 */
export async function removeParticipant(
  mealId: string,
  userId: string,
  participantId?: string
): Promise<ParticipantResult> {
  const response = new NextResponse();
  const supabase = await getServerClient({} as NextRequest, response) as any;

  if (!supabase) {
    return { success: false, error: 'Authentication required' };
  }

  let query = supabase
    .from('meal_participants')
    .delete()
    .eq('scheduled_meal_id', mealId);

  if (participantId) {
    query = query.eq('id', participantId);
  } else {
    query = query.eq('user_id', userId);
  }

  const { error } = await query;

  if (error) {
    console.error('[ParticipantService] Remove error:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
