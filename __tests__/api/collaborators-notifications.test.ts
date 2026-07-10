// T12.2 wiring test: adding a collaborator must fire a list_invite notification.
jest.mock('next/server', () => {
  function MockNextResponse(this: any) {}
  (MockNextResponse as any).json = (body: any, init?: { status?: number }) => ({
    status: init?.status || 200,
    json: () => Promise.resolve(body),
  });
  return { NextRequest: class {}, NextResponse: MockNextResponse };
});

const mockUser = { id: 'user-123', email: 'owner@example.com' };

const makeSupabase = () => {
  const finalByTable: Record<string, any> = {
    lists: { data: { creator_id: 'user-123' }, error: null },
    profiles: { data: { user_id: 'target-1', display_name: 'Target' }, error: null },
    list_collaborators: { data: { id: 'c1', user_id: 'target-1' }, error: null },
  };
  return {
    from: jest.fn((table: string) => {
      const final = finalByTable[table] || { data: null, error: null };
      const chain: any = {};
      ['select', 'insert', 'update', 'delete', 'eq', 'neq', 'order', 'range', 'in', 'maybeSingle'].forEach(
        (m) => { chain[m] = jest.fn(() => chain); }
      );
      chain.single = jest.fn(() => Promise.resolve(final));
      return chain;
    }),
    auth: { getUser: jest.fn(() => Promise.resolve({ data: { user: mockUser }, error: null })) },
  };
};

jest.mock('@/libs/supabase/server', () => ({
  getServerClient: jest.fn(async () => makeSupabase()),
}));

jest.mock('@/libs/activity', () => ({
  logActivity: jest.fn(() => Promise.resolve()),
}));

jest.mock('@/libs/notifications/service', () => ({
  createNotification: jest.fn(() => Promise.resolve({ success: true })),
}));

import { createNotification } from '@/libs/notifications/service';

describe('collaborators POST -> notification wiring (T12.2)', () => {
  beforeEach(() => jest.clearAllMocks());

  it('fires a list_invite notification to the added collaborator', async () => {
    const { POST } = await import('@/app/api/lists/[id]/collaborators/route');
    const request: any = { json: async () => ({ user_id: 'target-1', role: 'editor' }) };
    const res = await POST(request, { params: Promise.resolve({ id: 'list-1' }) } as any);

    expect(res.status).toBe(200);
    expect(createNotification).toHaveBeenCalledTimes(1);
    expect(createNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'target-1',
        type: 'list_invite',
        link: '/lists/list-1',
      })
    );
  });
});
