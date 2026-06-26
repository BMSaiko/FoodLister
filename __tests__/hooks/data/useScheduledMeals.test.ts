import { renderHook, act, waitFor } from '@testing-library/react';
import { useScheduledMeals } from '@/hooks/data/useScheduledMeals';

const mockFetch = jest.fn();
global.fetch = mockFetch;

const mockMeals = [
  {
    id: 'meal-1',
    restaurantId: 'rest-1',
    organizerId: 'user-123',
    mealDate: '2025-01-15',
    mealTime: '19:00',
    mealType: 'jantar',
    durationMinutes: 120,
    googleCalendarLink: 'https://calendar.google.com/event?id=1',
    createdAt: '2025-01-01T00:00:00Z',
    restaurant: {
      id: 'rest-1',
      name: 'Restaurant A',
      location: 'Lisbon',
      description: 'Great food',
      image: null,
    },
    organizer: {
      userId: 'user-123',
      displayName: 'Test User',
      avatarUrl: null,
      userIdCode: 'USR-001',
    },
    participants: [],
    isOrganizer: true,
    participantStatus: null,
  },
];

console.error = jest.fn();

describe('useScheduledMeals', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('starts with loading false and empty meals', () => {
    const { result } = renderHook(() => useScheduledMeals({ enabled: false }));
    expect(result.current.meals).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it('fetches meals on mount when enabled', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        data: mockMeals,
        total: 1,
        page: 1,
        limit: 20,
        hasMore: false,
      }),
    });

    const { result } = renderHook(() => useScheduledMeals({ enabled: true }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.meals).toHaveLength(1);
    expect(result.current.meals[0].id).toBe('meal-1');
    expect(result.current.total).toBe(1);
    expect(result.current.hasMore).toBe(false);
  });

  it('handles fetch error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useScheduledMeals({ enabled: true }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Erro ao carregar refeições agendadas');
  });

  it('does not fetch when disabled', () => {
    const { result } = renderHook(() => useScheduledMeals({ enabled: false }));
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('filter by type organized', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        data: mockMeals,
        total: 1,
        page: 1,
        limit: 20,
        hasMore: false,
      }),
    });

    const { result } = renderHook(() =>
      useScheduledMeals({ enabled: true, type: 'organized' })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('type=organized')
    );
  });

  it('filter by type participating', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        data: [],
        total: 0,
        page: 1,
        limit: 20,
        hasMore: false,
      }),
    });

    const { result } = renderHook(() =>
      useScheduledMeals({ enabled: true, type: 'participating' })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('type=participating')
    );
  });

  it('loadMore fetches next page', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        data: mockMeals,
        total: 2,
        page: 1,
        limit: 1,
        hasMore: true,
      }),
    });

    const { result } = renderHook(() => useScheduledMeals({ enabled: true }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.hasMore).toBe(true);

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        data: [{ ...mockMeals[0], id: 'meal-2' }],
        total: 2,
        page: 2,
        limit: 1,
        hasMore: false,
      }),
    });

    act(() => {
      result.current.loadMore();
    });

    await waitFor(() => {
      expect(result.current.meals).toHaveLength(2);
    });
  });

  it('does not loadMore when already loading', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        data: mockMeals,
        total: 2,
        page: 1,
        limit: 1,
        hasMore: true,
      }),
    });

    const { result } = renderHook(() => useScheduledMeals({ enabled: true }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    mockFetch.mockImplementationOnce(() => new Promise(() => {}));
    act(() => {
      result.current.loadMore();
    });

    const callCountBefore = mockFetch.mock.calls.length;
    act(() => {
      result.current.loadMore();
    });

    expect(mockFetch.mock.calls.length).toBe(callCountBefore);
  });

  it('scheduleMeal posts to API and refreshes', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        data: mockMeals,
        total: 1,
        page: 1,
        limit: 20,
        hasMore: false,
      }),
    });

    const { result } = renderHook(() => useScheduledMeals({ enabled: true }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        data: { id: 'meal-new' },
      }),
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        data: mockMeals,
        total: 1,
        page: 1,
        limit: 20,
        hasMore: false,
      }),
    });

    let scheduleResult: any;
    await act(async () => {
      scheduleResult = await result.current.scheduleMeal({
        restaurantId: 'rest-1',
        mealDate: '2025-01-20',
        mealTime: '19:00',
        mealType: 'jantar',
        durationMinutes: 120,
      });
    });

    expect(scheduleResult).toBeDefined();
  });

  it('addParticipants posts to API and updates state', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        data: mockMeals,
        total: 1,
        page: 1,
        limit: 20,
        hasMore: false,
      }),
    });

    const { result } = renderHook(() => useScheduledMeals({ enabled: true }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        data: [{ id: 'part-1', userId: 'user-456', status: 'pending', profile: null }],
      }),
    });

    await act(async () => {
      await result.current.addParticipants('meal-1', ['user-456']);
    });

    expect(result.current.meals[0].participants).toHaveLength(1);
  });

  it('updateParticipantStatus patches and updates state', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        data: [{
          ...mockMeals[0],
          participants: [{ id: 'part-1', userId: 'user-123', status: 'pending', profile: null }],
          participantStatus: 'pending',
        }],
        total: 1,
        page: 1,
        limit: 20,
        hasMore: false,
      }),
    });

    const { result } = renderHook(() => useScheduledMeals({ enabled: true }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        data: { user_id: 'user-123' },
      }),
    });

    await act(async () => {
      await result.current.updateParticipantStatus('meal-1', 'accepted');
    });

    expect(result.current.meals[0].participantStatus).toBe('accepted');
  });

  it('searchUsers fetches users', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        data: [{ id: 'user-1', name: 'Test', profileImage: null, userIdCode: 'USR-001', location: null, bio: null, publicProfile: true, totalReviews: 0, totalLists: 0, createdAt: '2024-01-01' }],
      }),
    });

    const { result } = renderHook(() => useScheduledMeals({ enabled: false }));

    let searchResult: any;
    await act(async () => {
      searchResult = await result.current.searchUsers('test');
    });

    expect(searchResult).toHaveLength(1);
    expect(mockFetch).toHaveBeenCalledWith('/api/users/search?q=test');
  });

  it('searchUsers returns empty for empty query', async () => {
    const { result } = renderHook(() => useScheduledMeals({ enabled: false }));

    let searchResult: any;
    await act(async () => {
      searchResult = await result.current.searchUsers('');
    });

    expect(searchResult).toEqual([]);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('downloadIcs opens new window', () => {
    const mockOpen = jest.fn();
    global.open = mockOpen;

    const { result } = renderHook(() => useScheduledMeals({ enabled: false }));

    act(() => {
      result.current.downloadIcs('meal-1');
    });

    expect(mockOpen).toHaveBeenCalledWith('/api/meals/meal-1/ics', '_blank');
  });
});

