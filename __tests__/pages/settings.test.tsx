import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { jest } from '@jest/globals';

// Set up environment variables BEFORE any imports
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'fake-anon-key';

// Create a stable profile object to prevent infinite re-renders
const mockProfile = {
  id: 'user1',
  userIdCode: 'USR-001',
  name: 'Test User',
  profileImage: '',
  location: 'Lisbon',
  bio: 'Test bio',
  website: 'https://example.com',
  phoneNumber: '+351912345678',
  publicProfile: true,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
  stats: {
    totalRestaurantsVisited: 5,
    totalReviews: 10,
    totalLists: 3,
    totalRestaurantsAdded: 2,
    joinedDate: '2024-01-01',
  },
  recentReviews: [],
  recentLists: [],
  isOwnProfile: true,
};

// Mock modules BEFORE importing the component
jest.mock('@/libs/supabase/client', () => ({
  getClient: jest.fn(() => ({
    auth: {
      getSession: jest.fn(() => Promise.resolve({ data: { session: null }, error: null })),
      getUser: jest.fn(() => Promise.resolve({ data: { user: null }, error: null })),
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
      refreshSession: jest.fn(() => Promise.resolve({ data: { session: null } })),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(() => Promise.resolve({ data: null, error: null })),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      insert: jest.fn(() => Promise.resolve({ data: null, error: null })),
      update: jest.fn(() => Promise.resolve({ data: null, error: null })),
      delete: jest.fn(() => Promise.resolve({ data: null, error: null })),
    })),
  })),
  getServerClient: jest.fn(),
  getPublicServerClient: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/users/settings',
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock('next/link', () => {
  return ({ children, href, ...props }: any) => (
    <a href={href} {...props}>{children}</a>
  );
});

jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

jest.mock('@/hooks/auth/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'user1', email: 'test@example.com' },
    loading: false,
    getAccessToken: jest.fn(() => Promise.resolve('token')),
    signOut: jest.fn(),
  }),
}));

jest.mock('@/hooks/data/useSettings', () => ({
  useSettings: () => ({
    profile: mockProfile,
    loading: false,
    error: null,
    saveProfile: jest.fn(() => Promise.resolve(true)),
    uploadImage: jest.fn(() => Promise.resolve('https://example.com/image.jpg')),
    refreshProfile: jest.fn(),
  }),
}));

jest.mock('@/hooks/forms/useProfileForm', () => ({
  useProfileForm: () => ({}),
}));

jest.mock('@/hooks/forms/useProfileActions', () => ({
  useProfileActions: () => ({}),
}));

jest.mock('lucide-react', () => ({
  Mail: () => <span data-testid="mail-icon" />,
  Globe: () => <span data-testid="globe-icon" />,
  MapPin: () => <span data-testid="map-pin-icon" />,
  FileText: () => <span data-testid="file-text-icon" />,
  Camera: () => <span data-testid="camera-icon" />,
  Eye: () => <span data-testid="eye-icon" />,
  EyeOff: () => <span data-testid="eye-off-icon" />,
  Shield: () => <span data-testid="shield-icon" />,
  AlertCircle: () => <span data-testid="alert-circle-icon" />,
  CheckCircle: () => <span data-testid="check-circle-icon" />,
  Loader2: () => <span data-testid="loader-icon" />,
  User: () => <span data-testid="user-icon" />,
  Phone: () => <span data-testid="phone-icon" />,
}));

// Mock FormActions component to simplify testing
jest.mock('@/components/ui/common/FormActions', () => {
  return function MockFormActions({ onCancel, onSubmit, submitText, loading }: any) {
    return (
      <div data-testid="form-actions">
        <button data-testid="cancel-button" onClick={onCancel} disabled={loading}>
          Cancelar
        </button>
        <button data-testid="submit-button" onClick={onSubmit} disabled={loading}>
          {loading ? 'Salvando...' : submitText}
        </button>
      </div>
    );
  };
});

jest.mock('@/components/ui/navigation/Navbar', () => {
  return function MockNavbar() {
    return <div data-testid="navbar" />;
  };
});

jest.mock('@/components/ui/profile/UserProfileHeader', () => {
  return function MockUserProfileHeader() {
    return <div data-testid="user-profile-header" />;
  };
});

jest.mock('@/components/ui/common/ScrollToTopButton', () => {
  return function MockScrollToTopButton() {
    return <div data-testid="scroll-to-top-button" />;
  };
});

// Import the component AFTER all mocks
const SettingsPage = require('@/app/users/settings/page').default;

describe('SettingsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the settings page with form actions', () => {
    render(<SettingsPage />);
    expect(screen.getByText('Configurações da Conta')).toBeInTheDocument();
    expect(screen.getByTestId('form-actions')).toBeInTheDocument();
  });

  it('renders FormActions with correct submitText', () => {
    render(<SettingsPage />);
    const submitButton = screen.getByTestId('submit-button');
    expect(submitButton).toHaveTextContent('Salvar Alterações');
  });

  it('calls handleCancel when cancel button is clicked', () => {
    const mockBack = jest.fn();
    const useRouterMock = require('next/navigation').useRouter;
    (useRouterMock as jest.Mock).mockReturnValue({
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: mockBack,
    });
    
    render(<SettingsPage />);
    const cancelButton = screen.getByTestId('cancel-button');
    fireEvent.click(cancelButton);
    expect(mockBack).toHaveBeenCalled();
  });

  it('displays user profile information', () => {
    render(<SettingsPage />);
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('renders form fields', () => {
    render(<SettingsPage />);
    expect(screen.getByText('Nome de Exibição')).toBeInTheDocument();
    expect(screen.getByText('Endereço de Email')).toBeInTheDocument();
    expect(screen.getByText('Número de Telefone')).toBeInTheDocument();
    expect(screen.getByText('Localização')).toBeInTheDocument();
    expect(screen.getByText('Website')).toBeInTheDocument();
    expect(screen.getByText('Sobre Você')).toBeInTheDocument();
  });

  it('renders privacy settings section', () => {
    render(<SettingsPage />);
    expect(screen.getByText('Privacidade')).toBeInTheDocument();
    expect(screen.getByText('Privacidade do Perfil')).toBeInTheDocument();
  });

  it('has proper page padding for sticky buttons', () => {
    const { container } = render(<SettingsPage />);
    const pageDiv = container.querySelector('.pb-24');
    expect(pageDiv).toBeInTheDocument();
  });
});