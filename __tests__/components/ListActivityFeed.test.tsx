import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import ListActivityFeed from '@/components/ui/lists/ListActivityFeed';

const mockFetch = jest.fn();
global.fetch = mockFetch;

const mockActivities = [
  {
    id: 'act-1', list_id: 'list-1', user_id: 'user-123',
    action: 'restaurant_added', details: { restaurant_name: 'Pasta Place' },
    created_at: new Date(Date.now() - 3600000).toISOString(),
    profiles: { display_name: 'John', avatar_url: null },
  },
  {
    id: 'act-2', list_id: 'list-1', user_id: 'user-456',
    action: 'collaborator_added', details: {},
    created_at: new Date(Date.now() - 86400000).toISOString(),
    profiles: { display_name: 'Jane', avatar_url: 'https://example.com/avatar.jpg' },
  },
  {
    id: 'act-3', list_id: 'list-1', user_id: 'user-789',
    action: 'list_updated', details: {},
    created_at: new Date(Date.now() - 172800000).toISOString(),
    profiles: null,
  },
];

describe('ListActivityFeed', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('renders activities after loading', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ activities: mockActivities, total: 3 }),
    });
    render(<ListActivityFeed listId="list-1" />);
    await waitFor(() => {
      expect(screen.getByText('John')).toBeInTheDocument();
      expect(screen.getByText('Jane')).toBeInTheDocument();
    });
    expect(screen.getByText('adicionou um restaurante')).toBeInTheDocument();
    expect(screen.getByText('adicionou um colaborador')).toBeInTheDocument();
    expect(screen.getByText('atualizou a lista')).toBeInTheDocument();
  });

  it('shows restaurant name in details', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ activities: [mockActivities[0]], total: 1 }),
    });
    render(<ListActivityFeed listId="list-1" />);
    await waitFor(() => {
      expect(screen.getByText('Pasta Place')).toBeInTheDocument();
    });
  });

  it('shows empty state when no activities', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ activities: [], total: 0 }),
    });
    render(<ListActivityFeed listId="list-1" />);
    await waitFor(() => {
      expect(screen.getByText('Sem atividade registada.')).toBeInTheDocument();
    });
  });

  it('shows error state on fetch failure', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });
    render(<ListActivityFeed listId="list-1" />);
    await waitFor(() => {
      expect(screen.getByText(/Erro ao carregar atividade/)).toBeInTheDocument();
    });
  });

  it('shows total count in header', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ activities: mockActivities, total: 3 }),
    });
    render(<ListActivityFeed listId="list-1" />);
    await waitFor(() => {
      expect(screen.getByText('(3)')).toBeInTheDocument();
    });
  });

  it('shows Utilizador for activities without profile', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ activities: [mockActivities[2]], total: 1 }),
    });
    render(<ListActivityFeed listId="list-1" />);
    await waitFor(() => {
      expect(screen.getByText('Utilizador')).toBeInTheDocument();
    });
  });
});
