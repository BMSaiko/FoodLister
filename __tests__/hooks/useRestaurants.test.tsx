import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { useRestaurants } from '@/hooks/data/useRestaurants'

// Mock fetch
const mockFetch = jest.fn()
global.fetch = mockFetch

// Mock sessionStorage
const mockSessionStorage: { [key: string]: string } = {}
Object.defineProperty(global, 'sessionStorage', {
  value: {
    getItem: jest.fn((key: string) => mockSessionStorage[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      mockSessionStorage[key] = value
    }),
    removeItem: jest.fn((key: string) => {
      delete mockSessionStorage[key]
    }),
    clear: jest.fn(() => {
      Object.keys(mockSessionStorage).forEach(key => delete mockSessionStorage[key])
    }),
  },
  writable: true,
})

// Test wrapper component
function TestWrapper({ searchQuery, savedState }: { searchQuery: string | null; savedState?: any }) {
  const { restaurants, loading, error, hasMore } = useRestaurants(searchQuery, savedState)
  
  if (loading) return <div data-testid="loading">Loading...</div>
  if (error) return <div data-testid="error">{error}</div>
  
  return (
    <div>
      <div data-testid="restaurant-count">{restaurants.length}</div>
      {restaurants.map((r: any) => (
        <div key={r.id} data-testid="restaurant-item">
          {r.name}
        </div>
      ))}
      <div data-testid="has-more">{hasMore.toString()}</div>
    </div>
  )
}

const mockRestaurants = [
  { id: '1', name: 'Restaurant A', visited: false, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: '2', name: 'Restaurant B', visited: true, created_at: '2024-01-02', updated_at: '2024-01-02' },
]

describe('useRestaurants', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    Object.keys(mockSessionStorage).forEach(key => delete mockSessionStorage[key])
  })

  it('shows loading state initially', () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ restaurants: mockRestaurants }),
    })

    render(<TestWrapper searchQuery={null} />)
    expect(screen.getByTestId('loading')).toBeInTheDocument()
  })

  it('fetches and displays restaurants', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ restaurants: mockRestaurants }),
    })

    render(<TestWrapper searchQuery={null} />)

    await waitFor(() => {
      expect(screen.getByTestId('restaurant-count')).toHaveTextContent('2')
    })

    expect(screen.getByText('Restaurant A')).toBeInTheDocument()
    expect(screen.getByText('Restaurant B')).toBeInTheDocument()
  })

  it('handles search query parameter', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ restaurants: [mockRestaurants[0]] }),
    })

    render(<TestWrapper searchQuery="Restaurant A" />)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('search=Restaurant+A')
      )
    })
  })

  it('handles fetch error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      text: () => Promise.resolve('Server error'),
    })

    render(<TestWrapper searchQuery={null} />)

    await waitFor(() => {
      expect(screen.getByTestId('error')).toBeInTheDocument()
    })
  })

  it('handles invalid JSON response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.reject(new Error('Invalid JSON')),
    })

    render(<TestWrapper searchQuery={null} />)

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Invalid JSON response: Invalid JSON')
    })
  })

  it('handles missing restaurants in response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: [] }),
    })

    render(<TestWrapper searchQuery={null} />)

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Invalid response structure')
    })
  })

  it('uses saved state when available', () => {
    const savedState = {
      restaurants: mockRestaurants,
      hasMore: false,
      searchQuery: null,
      timestamp: Date.now(),
    }

    render(<TestWrapper searchQuery={null} savedState={savedState} />)

    // Should not show loading since we have saved state
    expect(screen.queryByTestId('loading')).not.toBeInTheDocument()
    expect(screen.getByTestId('restaurant-count')).toHaveTextContent('2')
  })

  it('returns hasMore as false', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ restaurants: mockRestaurants }),
    })

    render(<TestWrapper searchQuery={null} />)

    await waitFor(() => {
      expect(screen.getByTestId('has-more')).toHaveTextContent('false')
    })
  })
})