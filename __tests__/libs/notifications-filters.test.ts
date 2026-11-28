import { matchesFilter, countFor } from '@/libs/notifications/filters';

const L = [
  { type: 'meal_invitation', read: false },
  { type: 'meal_reminder', read: true },
  { type: 'comment_reply', read: false },
  { type: 'like', read: true },
  { type: 'mention', read: true },
  { type: 'review_created', read: true },
  { type: 'list_invite', read: true },
  { type: 'list_update', read: true },
  { type: 'release', read: true },
  { type: 'system', read: false },
  { type: 'desconhecido', read: true },
];

describe('filtros de notificações', () => {
  it('agrupa por tipo', () => {
    expect(countFor(L, 'meals')).toBe(2);
    expect(countFor(L, 'social')).toBe(4);
    expect(countFor(L, 'lists')).toBe(2);
    expect(countFor(L, 'system')).toBe(2);
  });
  it('todas e não lidas', () => {
    expect(countFor(L, 'all')).toBe(11);
    expect(countFor(L, 'unread')).toBe(3);
  });
  it('tipo desconhecido só aparece em Todas', () => {
    expect(matchesFilter({ type: 'x', read: true }, 'system')).toBe(false);
    expect(matchesFilter({ type: 'x', read: true }, 'all')).toBe(true);
  });
});
