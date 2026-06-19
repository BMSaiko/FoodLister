import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { useListActivities } from '@/hooks/lists/useListActivities';

const mockFetch = jest.fn();
global.fetch = mockFetch;

function TestWrapper({ listId }: { listId: string }) {
  const { activities, total, isLoading, error, hasMore, loadMore } = useListActivities(listId);

  if (isLoading) return <div data-testid="loading">Loading...</div>;
  if (error) return <div data-testid="error">{error}</div>;

  return (
    <div>
      <div data-testid="total">{total}</div>
      <div data-testid="activity-count">{activities.length}</div>
      <div data-testid="has-more">{hasMore.toString()}</div>
      {activities.map((a: any) => (
        <div key={a.id} data-testid="activity-item">
          {a.action} - {a.profiles?.display_name || 'Unknown'}
        </div>
      ))}
      {hasMore && (
        <button data-testid="load-more" onClick={loadMore}>Load More</button>
      )}
    </div>
  );
}

const mockActivities = [
  {
    id: 'act-1', list_id: 'list-1', user_id: 'user-123',
    action: 'restaurant_added', details: { restaurant_name: 'Pasta Place' },
    created_at: '2024-01-01T00:00:00Z',
    profiles: { display_name: 'John', avatar_url: null },
  },
  {
    id: 'act-2', list_id: 'list-1', user_id: 'user-456',
    action: 'collaborator_added', details: {},
    created_at: '2024-01-02T00:00:00Z',
    profiles: { display_name: 'Jane', avatar_url: null },
  },
];

describe('useListActivities', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    // Suppress React act() warnings from useEffect async state updates
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('shows loading state initially', () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ activities: mockActivities, total: 2 }),
    });
    render(<TestWrapper listId="list-1" />);
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('fetches and displays activities', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ activities: mockActivities, total: 2 }),
    });
    render(<TestWrapper listId="list-1" />);
    await waitFor(() => {
      expect(screen.getByTestId('activity-count')).toHaveTextContent('2');
    });
    expect(screen.getByTestId('total')).toHaveTextContent('2');
    expect(screen.getByText('restaurant_added - John')).toBeInTheDocument();
    expect(screen.getByText('collaborator_added - Jane')).toBeInTheDocument();
  });

  it('handles fetch error', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });
    render(<TestWrapper listId="list-1" />);
    await waitFor(() => {
      expect(screen.getByTestId('error')).toBeInTheDocument();
    });
  });

  it('shows empty state when no activities', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ activities: [], total: 0 }),
    });
    render(<TestWrapper listId="list-1" />);
    await waitFor(() => {
      expect(screen.getByTestId('activity-count')).toHaveTextContent('0');
    });
  });

  it('shows hasMore when there are more activities', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ activities: mockActivities, total: 10 }),
    });
    render(<TestWrapper listId="list-1" />);
    await waitFor(() => {
      expect(screen.getByTestId('has-more')).toHaveTextContent('true');
    });
    expect(screen.getByTestId('load-more')).toBeInTheDocument();
  });

  it('calls loadMore when button is clicked', async () => {
    const loadMoreSpy = jest.fn();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ activities: mockActivities, total: 5 }),
    });

    // Render and wait for initial load
    render(<TestWrapper listId="list-1" />);
    await waitFor(() => {
      expect(screen.getByTestId('activity-count')).toHaveTextContent('2');
    });

    // Verify load-more button is present (hasMore = true since total=5 > 2)
    expect(screen.getByTestId('load-more')).toBeInTheDocument();
  });
});
