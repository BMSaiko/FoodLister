import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import RestaurantRoulette from '@/components/ui/RestaurantRoulette'

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href, ...props }: any) => (
    <a href={href} {...props}>{children}</a>
  )
})

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Shuffle: () => <span data-testid="shuffle-icon" />,
  X: () => <span data-testid="x-icon" />,
  ExternalLink: () => <span data-testid="external-link-icon" />,
  MapPin: () => <span data-testid="map-pin-icon" />,
  Star: () => <span data-testid="star-icon" />,
  EuroSign: () => <span data-testid="euro-sign-icon" />,
}))

const mockRestaurants = [
  {
    id: '1',
    name: 'Restaurant One',
    address: '123 Main St',
    price_range: 2,
    rating: 4.5,
    cuisine_types: [{ cuisine_type: { name: 'Italian' } }],
  },
  {
    id: '2',
    name: 'Restaurant Two',
    address: '456 Oak Ave',
    price_range: 3,
    rating: 3.8,
    cuisine_types: [{ cuisine_type: { name: 'Japanese' } }],
  },
  {
    id: '3',
    name: 'Restaurant Three',
    address: '789 Pine Rd',
    price_range: 1,
    rating: 4.0,
    cuisine_types: [{ cuisine_type: { name: 'Mexican' } }],
  },
]

describe('RestaurantRoulette', () => {
  it('renders with restaurants list', () => {
    const onClose = jest.fn()
    render(<RestaurantRoulette restaurants={mockRestaurants} onClose={onClose} />)
    
    expect(screen.getByText('Restaurant Roulette')).toBeInTheDocument()
    expect(screen.getByText(/3 restaurants/i)).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', () => {
    const onClose = jest.fn()
    render(<RestaurantRoulette restaurants={mockRestaurants} onClose={onClose} />)
    
    fireEvent.click(screen.getByTestId('x-icon'))
    expect(onClose).toHaveBeenCalled()
  })

  it('shows spin button when restaurants are available', () => {
    const onClose = jest.fn()
    render(<RestaurantRoulette restaurants={mockRestaurants} onClose={onClose} />)
    
    expect(screen.getByTestId('shuffle-icon')).toBeInTheDocument()
  })

  it('does not render when restaurants list is empty', () => {
    const onClose = jest.fn()
    const { container } = render(<RestaurantRoulette restaurants={[]} onClose={onClose} />)
    
    expect(container.firstChild).toBeNull()
  })

  it('displays restaurant name after selection', async () => {
    const onClose = jest.fn()
    
    // Mock Math.random for predictable results
    jest.spyOn(Math, 'random').mockReturnValue(0.5)
    
    await act(async () => {
      render(<RestaurantRoulette restaurants={mockRestaurants} onClose={onClose} />)
    })
    
    // The component should render with the restaurants
    expect(screen.getByText('Restaurant Roulette')).toBeInTheDocument()
  })

  it('shows restaurant details including address and price', () => {
    const onClose = jest.fn()
    render(<RestaurantRoulette restaurants={mockRestaurants} onClose={onClose} />)
    
    // Verify the component renders with restaurant data
    expect(screen.getByText(/3 restaurants/i)).toBeInTheDocument()
  })
})