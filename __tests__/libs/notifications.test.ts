import type { CreateNotificationInput } from '@/libs/notifications/service';

let prefsRow: any = null;
const insertMock = jest.fn(() => Promise.resolve({ error: null }));
const mockClient: any = {
  from: jest.fn((table: string) => {
    if (table === 'notification_preferences') {
      return {
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ data: prefsRow, error: null })),
          })),
        })),
      };
    }
    return { insert: insertMock };
  }),
};

jest.mock('@supabase/supabase-js', () => ({ createClient: jest.fn(() => mockClient) }));

let createNotification: (input: CreateNotificationInput) => Promise<{ success: boolean; error?: string }>;

beforeAll(async () => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key';
  await jest.isolateModulesAsync(async () => {
    const mod = await import('@/libs/notifications/service');
    createNotification = mod.createNotification;
  });
});

const base: CreateNotificationInput = { userId: 'u1', type: 'meal_invitation', title: 't', message: 'm' };

it('skips insert when preference disabled', async () => {
  prefsRow = { meal_invitations: false };
  insertMock.mockClear();
  const r = await createNotification(base);
  expect(r.success).toBe(true);
  expect(insertMock).not.toHaveBeenCalled();
});

it('inserts when preference enabled', async () => {
  prefsRow = { meal_invitations: true };
  insertMock.mockClear();
  await createNotification(base);
  expect(insertMock).toHaveBeenCalledTimes(1);
});

it('default-allow when no prefs row', async () => {
  prefsRow = null;
  insertMock.mockClear();
  await createNotification(base);
  expect(insertMock).toHaveBeenCalledTimes(1);
});

it('types without a pref key are always allowed', async () => {
  prefsRow = null;
  insertMock.mockClear();
  await createNotification({ ...base, type: 'review_created' });
  expect(insertMock).toHaveBeenCalledTimes(1);
});
