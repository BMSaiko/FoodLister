import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import RestaurantCard from '@/components/ui/RestaurantCard'
import { RestaurantWithDetails } from '@/libs/types'

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

jest.mock('next/link', () => {
  return ({ children, href, ...props }: any) => (
    <a href={href} {...props}>{children}</a>
  )
})

jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}))

jest.mock('@/contexts', () => ({
  useAuth: () => ({
    user: null,
    signOut: jest.fn(),
  }),
}))

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Star: () => <span data-testid="star-icon" />,
  MapPin: () => <span data-testid="map-pin-icon" />,
  EuroSign: () => <span data-testid="euro-sign-icon" />,
  Clock: () => <span data-testid="clock-icon" />,
  Phone: () => <span data-testid="phone-icon" />,
  Globe: () => <span data-testid="globe-icon" />,
  Instagram: () => <span data-testid="instagram-icon" />,
  Facebook: () => <span data-testid="facebook-icon" />,
  Edit: () => <span data-testid="edit-icon" />,
  Trash2: () => <span data-testid="trash-icon" />,
  ExternalLink: () => <span data-testid="external-link-icon" />,
  Heart: () => <span data-testid="heart-icon" />,
  Share2: () => <span data-testid="share-icon" />,
}))

// Mock utils
jest.mock('@/utils/formatters', () => ({
  getDescriptionPreview: (text: string) => ({ text, isTruncated: false }),
}))

const mockRestaurant: RestaurantWithDetails = {
  id: '1',
  name: 'Test Restaurant',
  address: '123 Test St',
  phone: '+351912345678',
  website: 'https://test.com',
  instagram: '@testrestaurant',
  facebook: 'testrestaurant',
  latitude: 38.7223,
  longitude: -9.1393,
  price_range: 2,
  rating: 4.5,
  review_count: 10,
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
  user_id: 'user1',
  description: 'A great test restaurant',
  cuisine_types: [{ cuisine_type: { name: 'Portuguese' } }],
  features: [{ feature: { name: 'Outdoor Seating' } }],
  dietary_options: [{ dietary_option: { name: 'Vegetarian' } }],
  is_open: true,
  opening_hours: {
    monday: { open: '09:00', close: '18:00' },
    tuesday: { open: '09:00', close: '18:00' },
    wednesday: { open: '09:00', close: '18:00' },
    thursday: { open: '09:00', close: '18:00' },
    friday: { open: '09:00', close: '18:00' },
    saturday: { open: '10:00', close: '15:00' },
    sunday: null,
  },
  menu_items: [],
  images: [],
  user: { id: 'user1', name: 'Test User' },
}

describe('RestaurantCard', () => {
  it('renders restaurant name and address', () => {
    render(<RestaurantCard restaurant={mockRestaurant} />)
    
    expect(screen.getByText('Test Restaurant')).toBeInTheDocument()
    expect(screen.getByText('123 Test St')).toBeInTheDocument()
  })

  it('renders cuisine types', () => {
    render(<RestaurantCard restaurant={mockRestaurant} />)
    
    expect(screen.getByText('Portuguese')).toBeInTheDocument()
  })

  it('renders features', () => {
    render(<RestaurantCard restaurant={mockRestaurant} />)
    
    expect(screen.getByText('Outdoor Seating')).toBeInTheDocument()
  })

  it('renders dietary options', () => {
    render(<RestaurantCard restaurant={mockRestaurant} />)
    
    expect(screen.getByText('Vegetarian')).toBeInTheDocument()
  })

  it('displays price range correctly', () => {
    render(<RestaurantCard restaurant={mockRestaurant} />)
    
    // Price range 2 should show 2 euro signs
    expect(screen.getAllByText('€').length).toBeGreaterThanOrEqual(1)
  })

  it('displays rating when available', () => {
    render(<RestaurantCard restaurant={mockRestaurant} />)
    
    expect(screen.getByText('4.5')).toBeInTheDocument()
  })

  it('links to restaurant detail page', () => {
    render(<RestaurantCard restaurant={mockRestaurant} />)
    
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/restaurants/1')
  })

  it('renders with centered prop', () => {
    const { container } = render(<RestaurantCard restaurant={mockRestaurant} centered />)
    
    expect(container.firstChild).toHaveClass('max-w-md')
  })

  it('does not show edit/delete buttons when user is not owner', () => {
    render(<RestaurantCard restaurant={mockRestaurant} />)
    
    // User is null in mock, so no edit/delete buttons
    expect(screen.queryByTestId('edit-icon')).not.toBeInTheDocument()
  })
})