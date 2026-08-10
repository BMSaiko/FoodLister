import { getListRole } from '@/libs/lists/permissions';

// ponytail: locks admin-is-owner-equivalent behaviour in getListRole
describe('getListRole admin handling', () => {
  const baseClient = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns owner for an admin who is not the list creator', async () => {
    baseClient.single
      .mockResolvedValueOnce({ data: { creator_id: 'someone-else' } }) // list query
      .mockResolvedValueOnce({ data: { is_admin: true } });            // profile query
    const role = await getListRole(baseClient, 'list-1', 'admin-1');
    expect(role).toBe('owner');
  });

  it('returns none for a non-admin non-collaborator', async () => {
    baseClient.single
      .mockResolvedValueOnce({ data: { creator_id: 'someone-else' } }) // list query
      .mockResolvedValueOnce({ data: { is_admin: false } })            // profile query
      .mockResolvedValueOnce({ data: null });                          // collaborator query
    const role = await getListRole(baseClient, 'list-1', 'user-1');
    expect(role).toBe('none');
  });
});
