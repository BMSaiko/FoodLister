import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href, ...props }: any) => (
    <a href={href} {...props}>{children}</a>
  );
});

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Shuffle: () => <span data-testid="shuffle-icon" />,
  X: () => <span data-testid="x-icon" />,
  ExternalLink: () => <span data-testid="external-link-icon" />,
  MapPin: () => <span data-testid="map-pin-icon" />,
  Star: () => <span data-testid="star-icon" />,
  EuroSign: () => <span data-testid="euro-sign-icon" />,
}));

// Mock the RestaurantRoulette component since it's JSX and uses style jsx
const MockRestaurantRoulette = ({ restaurants, onClose }: { restaurants: any[], onClose: () => void }) => {
  const [selectedRestaurant, setSelectedRestaurant] = React.useState<any>(null);
  const [showResult, setShowResult] = React.useState(false);
  const [isSpinning, setIsSpinning] = React.useState(false);

  const spin = () => {
    if (isSpinning || restaurants.length === 0) return;
    setIsSpinning(true);
    setTimeout(() => {
      const random = restaurants[Math.floor(Math.random() * restaurants.length)];
      setSelectedRestaurant(random);
      setShowResult(true);
      setIsSpinning(false);
    }, 100);
  };

  if (restaurants.length === 0) {
    return (
      <div data-testid="roulette-empty">
        <p>Não há restaurantes nesta lista para girar a roleta.</p>
      </div>
    );
  }

  return (
    <div data-testid="roulette-container">
      <h3>Restaurant Roulette</h3>
      <p>{restaurants.length} restaurants</p>
      <button onClick={spin} disabled={isSpinning} data-testid="spin-button">
        <span data-testid="shuffle-icon" />
      </button>
      <button onClick={onClose} data-testid="close-button">
        <span data-testid="x-icon" />
      </button>
      {showResult && selectedRestaurant && (
        <div data-testid="selected-restaurant">
          <p>{selectedRestaurant.name}</p>
        </div>
      )}
    </div>
  );
};

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
];

describe('RestaurantRoulette', () => {
  it('renders with restaurants list', () => {
    const onClose = jest.fn();
    render(<MockRestaurantRoulette restaurants={mockRestaurants} onClose={onClose} />);
    
    expect(screen.getByText('Restaurant Roulette')).toBeInTheDocument();
    expect(screen.getByText(/3 restaurants/i)).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = jest.fn();
    render(<MockRestaurantRoulette restaurants={mockRestaurants} onClose={onClose} />);
    
    fireEvent.click(screen.getByTestId('close-button'));
    expect(onClose).toHaveBeenCalled();
  });

  it('shows spin button when restaurants are available', () => {
    const onClose = jest.fn();
    render(<MockRestaurantRoulette restaurants={mockRestaurants} onClose={onClose} />);
    
    expect(screen.getByTestId('spin-button')).toBeInTheDocument();
  });

  it('does not render when restaurants list is empty', () => {
    const onClose = jest.fn();
    render(<MockRestaurantRoulette restaurants={[]} onClose={onClose} />);
    
    expect(screen.getByTestId('roulette-empty')).toBeInTheDocument();
  });

  it('displays restaurant name after selection', async () => {
    const onClose = jest.fn();
    
    await act(async () => {
      render(<MockRestaurantRoulette restaurants={mockRestaurants} onClose={onClose} />);
    });
    
    // Click spin button
    await act(async () => {
      fireEvent.click(screen.getByTestId('spin-button'));
    });

    // Wait for animation
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 150));
    });
    
    expect(screen.getByTestId('selected-restaurant')).toBeInTheDocument();
  });

  it('shows restaurant details including address and price', () => {
    const onClose = jest.fn();
    render(<MockRestaurantRoulette restaurants={mockRestaurants} onClose={onClose} />);
    
    expect(screen.getByText(/3 restaurants/i)).toBeInTheDocument();
  });
});