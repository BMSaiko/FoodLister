import { logActivity } from '@/libs/activity';

describe('logActivity', () => {
  const mockInsert = jest.fn();
  const mockSupabase = {
    from: jest.fn().mockReturnValue({ insert: mockInsert }),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls supabase insert with correct data', async () => {
    mockInsert.mockResolvedValueOnce({ error: null });
    await logActivity(
      mockSupabase as any,
      'list-1',
      'user-1',
      'restaurant_added',
      { restaurant_id: 'rest-1', restaurant_name: 'Pasta Place' }
    );

    expect(mockSupabase.from).toHaveBeenCalledWith('list_activities');
    expect(mockInsert).toHaveBeenCalledWith({
      list_id: 'list-1',
      user_id: 'user-1',
      action: 'restaurant_added',
      details: { restaurant_id: 'rest-1', restaurant_name: 'Pasta Place' },
    });
  });

  it('does not throw on insert error', async () => {
    mockInsert.mockResolvedValueOnce({ error: { message: 'DB error' } });
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    await logActivity(
      mockSupabase as any,
      'list-1',
      'user-1',
      'list_updated',
      {}
    );

    expect(consoleSpy).toHaveBeenCalledWith('Error logging activity:', { message: 'DB error' });
    consoleSpy.mockRestore();
  });

  it('does not throw on exception', async () => {
    mockInsert.mockRejectedValueOnce(new Error('Network error'));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    await logActivity(
      mockSupabase as any,
      'list-1',
      'user-1',
      'list_updated',
      {}
    );

    expect(consoleSpy).toHaveBeenCalledWith('Failed to log activity:', expect.any(Error));
    consoleSpy.mockRestore();
  });

  it('inserts with empty details by default', async () => {
    mockInsert.mockResolvedValueOnce({ error: null });
    await logActivity(
      mockSupabase as any,
      'list-1',
      'user-1',
      'collaborator_added'
    );

    expect(mockInsert).toHaveBeenCalledWith({
      list_id: 'list-1',
      user_id: 'user-1',
      action: 'collaborator_added',
      details: {},
    });
  });

  it('logs all activity action types', async () => {
    mockInsert.mockResolvedValue({ error: null });
    const actions = [
      'restaurant_added',
      'restaurant_removed',
      'list_updated',
      'collaborator_added',
      'collaborator_removed',
      'list_duplicated',
    ] as const;

    for (const action of actions) {
      await logActivity(mockSupabase as any, 'list-1', 'user-1', action, {});
    }

    expect(mockInsert).toHaveBeenCalledTimes(6);
  });
});
