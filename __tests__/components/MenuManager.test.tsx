import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href, ...props }: any) => (
    <a href={href} {...props}>{children}</a>
  );
});

// Mock react-toastify
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  X: () => <span data-testid="x-icon" />,
  Plus: () => <span data-testid="plus-icon" />,
  Link: () => <span data-testid="link-icon" />,
  Image: () => <span data-testid="image-icon" />,
  AlertCircle: () => <span data-testid="alert-circle-icon" />,
  Globe: () => <span data-testid="globe-icon" />,
  FileText: () => <span data-testid="file-text-icon" />,
}));

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} alt={props.alt} />,
}));

// Store callbacks to simulate uploads
let uploadedUrls: string[] = [];
let onImageUploadedCallback: ((url: string) => void) | null = null;

// Mock ImageUploader component
jest.mock('@/components/ui/RestaurantManagement/ImageUploader', () => {
  return function MockImageUploader({ onImageUploaded, maxFiles, disabled }: any) {
    // Store the callback for testing
    onImageUploadedCallback = onImageUploaded;
    
    return (
      <div data-testid="image-uploader">
        <span data-testid="max-files">{maxFiles}</span>
        <span data-testid="disabled">{disabled ? 'true' : 'false'}</span>
        <button 
          data-testid="upload-single" 
          onClick={() => onImageUploaded('https://cloudinary.com/test-image-1.jpg')}
        >
          Upload Single
        </button>
        <button 
          data-testid="upload-multiple" 
          onClick={() => {
            // Simulate multiple uploads in quick succession (the bug scenario)
            onImageUploaded('https://cloudinary.com/test-image-1.jpg');
            onImageUploaded('https://cloudinary.com/test-image-2.jpg');
            onImageUploaded('https://cloudinary.com/test-image-3.jpg');
          }}
        >
          Upload Multiple
        </button>
      </div>
    );
  };
});

// Import after mocks
const MenuManager = require('@/components/ui/RestaurantManagement/MenuManager').default;

describe('MenuManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    uploadedUrls = [];
    onImageUploadedCallback = null;
  });

  const defaultProps = {
    menuLinks: [],
    menuImages: [],
    onMenuLinksChange: jest.fn(),
    onMenuImagesChange: jest.fn(),
    disabled: false,
  };

  it('renders MenuManager component', () => {
    render(<MenuManager {...defaultProps} />);
    
    expect(screen.getByText('Links Externos')).toBeInTheDocument();
    expect(screen.getByText('Imagens do Menu')).toBeInTheDocument();
  });

  it('adds a single image correctly', async () => {
    const onMenuImagesChange = jest.fn();
    render(
      <MenuManager 
        {...defaultProps} 
        onMenuImagesChange={onMenuImagesChange}
      />
    );

    // Switch to images tab
    fireEvent.click(screen.getByText('Imagens do Menu'));

    // Upload a single image
    fireEvent.click(screen.getByTestId('upload-single'));

    // Wait for the useEffect callback
    await waitFor(() => {
      expect(onMenuImagesChange).toHaveBeenCalledWith(['https://cloudinary.com/test-image-1.jpg']);
    });
  });

  it('adds multiple images correctly (bug fix verification)', async () => {
    const onMenuImagesChange = jest.fn();
    render(
      <MenuManager 
        {...defaultProps} 
        onMenuImagesChange={onMenuImagesChange}
      />
    );

    // Switch to images tab
    fireEvent.click(screen.getByText('Imagens do Menu'));

    // Upload multiple images (simulating the bug scenario)
    fireEvent.click(screen.getByTestId('upload-multiple'));

    // With React batching, onMenuImagesChange should be called once with all 3 images
    await waitFor(() => {
      expect(onMenuImagesChange).toHaveBeenCalledWith([
        'https://cloudinary.com/test-image-1.jpg',
        'https://cloudinary.com/test-image-2.jpg',
        'https://cloudinary.com/test-image-3.jpg'
      ]);
    });
  });

  it('displays uploaded images in the grid', async () => {
    const menuImages = [
      'https://cloudinary.com/image-1.jpg',
      'https://cloudinary.com/image-2.jpg',
    ];
    
    render(
      <MenuManager 
        {...defaultProps} 
        menuImages={menuImages}
      />
    );

    // Switch to images tab
    fireEvent.click(screen.getByText('Imagens do Menu'));

    // Check that images are displayed
    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(2);
  });

  it('respects maximum limit of 10 images', async () => {
    const menuImages = Array(10).fill(null).map((_, i) => `https://cloudinary.com/image-${i}.jpg`);
    
    render(
      <MenuManager 
        {...defaultProps} 
        menuImages={menuImages}
      />
    );

    // Switch to images tab
    fireEvent.click(screen.getByText('Imagens do Menu'));

    // ImageUploader should NOT be rendered when we have 10 images
    expect(screen.queryByTestId('image-uploader')).not.toBeInTheDocument();
    
    // Badge should show 10/10
    expect(screen.getByText('10/10')).toBeInTheDocument();
  });

  it('handles image removal correctly', async () => {
    const onMenuImagesChange = jest.fn();
    const menuImages = [
      'https://cloudinary.com/image-1.jpg',
      'https://cloudinary.com/image-2.jpg',
      'https://cloudinary.com/image-3.jpg',
    ];
    
    render(
      <MenuManager 
        {...defaultProps} 
        menuImages={menuImages}
        onMenuImagesChange={onMenuImagesChange}
      />
    );

    // Switch to images tab
    fireEvent.click(screen.getByText('Imagens do Menu'));

    // Find and click remove button for the second image (index 1)
    const removeButtons = screen.getAllByTitle('Remover imagem');
    fireEvent.click(removeButtons[1]);

    // Should remove the second image
    expect(onMenuImagesChange).toHaveBeenCalledWith([
      'https://cloudinary.com/image-1.jpg',
      'https://cloudinary.com/image-3.jpg',
    ]);
  });

  it('handles link management correctly', async () => {
    const onMenuLinksChange = jest.fn();
    render(
      <MenuManager 
        {...defaultProps} 
        onMenuLinksChange={onMenuLinksChange}
      />
    );

    // Should be on links tab by default
    const input = screen.getByPlaceholderText('https://exemplo.com/menu');
    const addButton = screen.getByText('Adicionar Link');

    // Add a link
    fireEvent.change(input, { target: { value: 'https://example.com/menu1' } });
    fireEvent.click(addButton);

    expect(onMenuLinksChange).toHaveBeenCalledWith(['https://example.com/menu1']);
  });

  it('prevents duplicate links', async () => {
    // Create a wrapper component that manages menuLinks state
    const Wrapper = () => {
      const [menuLinks, setMenuLinks] = React.useState<string[]>([]);
      return (
        <MenuManager 
          {...defaultProps} 
          menuLinks={menuLinks}
          onMenuLinksChange={(links) => setMenuLinks(links)}
        />
      );
    };

    render(<Wrapper />);

    // Should be on links tab by default
    const input = screen.getByPlaceholderText('https://exemplo.com/menu') as HTMLInputElement;
    const addButton = screen.getByText('Adicionar Link');

    // Add a link
    fireEvent.change(input, { target: { value: 'https://example.com/menu1' } });
    fireEvent.click(addButton);

    // Wait for the link to appear in the document
    await waitFor(() => {
      expect(screen.getByText('https://example.com/menu1')).toBeInTheDocument();
    });

    // Try to add the same link again
    fireEvent.click(addButton);

    // Error message should appear - use findByText for async rendering
    const errorMessage = await screen.findByText('Este link já foi adicionado');
    expect(errorMessage).toBeInTheDocument();
  });

  it('shows correct image count in tab badge', async () => {
    const menuImages = [
      'https://cloudinary.com/image-1.jpg',
      'https://cloudinary.com/image-2.jpg',
    ];
    
    render(
      <MenuManager 
        {...defaultProps} 
        menuImages={menuImages}
      />
    );

    // Check the badge shows 2/10
    expect(screen.getByText('2/10')).toBeInTheDocument();
  });
});