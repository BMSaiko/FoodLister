import type { Notification, NotificationType } from '@/types/notification';

export type FilterKey = 'all' | 'unread' | 'meals' | 'social' | 'lists' | 'system';

export const FILTER_GROUPS: { key: FilterKey; label: string; types?: NotificationType[] }[] = [
  { key: 'all', label: 'Todas' },
  { key: 'unread', label: 'Não lidas' },
  { key: 'meals', label: 'Refeições', types: ['meal_invitation', 'meal_reminder'] },
  { key: 'social', label: 'Social', types: ['comment_reply', 'like', 'mention', 'review_created'] },
  { key: 'lists', label: 'Listas', types: ['list_invite', 'list_update'] },
  { key: 'system', label: 'Sistema', types: ['system', 'release'] },
];

export function matchesFilter(n: Pick<Notification, 'type' | 'read'>, key: FilterKey): boolean {
  if (key === 'all') return true;
  if (key === 'unread') return !n.read;
  const group = FILTER_GROUPS.find((g) => g.key === key);
  return !!group?.types?.includes(n.type as NotificationType);
}

export function countFor(list: Pick<Notification, 'type' | 'read'>[], key: FilterKey): number {
  return list.filter((n) => matchesFilter(n, key)).length;
}
