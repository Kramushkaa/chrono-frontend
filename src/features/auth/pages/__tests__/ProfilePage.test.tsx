import React from 'react';
import { render, screen } from '@testing-library/react';
import ProfilePage from '../ProfilePage';

// Mock all dependencies
jest.mock('shared/context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('shared/context/ToastContext', () => ({
  useToast: () => ({
    showToast: jest.fn(),
  }),
}));

jest.mock('features/auth/components/Profile', () => ({
  Profile: () => <div data-testid="profile-component">Profile Component</div>,
}));

jest.mock('features/auth/components/LoginForm', () => ({
  LoginForm: () => <div data-testid="login-form">Login Form</div>,
}));

jest.mock('features/auth/components/RegisterForm', () => ({
  RegisterForm: () => <div data-testid="register-form">Register Form</div>,
}));

jest.mock('shared/layout/AppHeader', () => ({
  AppHeader: () => <div data-testid="app-header">App Header</div>,
}));

jest.mock('shared/ui/Breadcrumbs', () => ({
  Breadcrumbs: () => <div data-testid="breadcrumbs">Breadcrumbs</div>,
}));

jest.mock('shared/ui/SEO', () => ({
  SEO: ({ title }: { title: string }) => <div data-testid="seo">{title}</div>,
}));

jest.mock('shared/hooks/useFilters', () => ({
  useFilters: () => ({
    filters: {},
    setFilters: jest.fn(),
    groupingType: 'none',
    setGroupingType: jest.fn(),
    yearInputs: { start: '1800', end: '2000' },
    setYearInputs: jest.fn(),
    applyYearFilter: jest.fn(),
    handleYearKeyPress: jest.fn(),
    resetAllFilters: jest.fn(),
  }),
}));

jest.mock('shared/api/api', () => ({
  apiFetch: jest.fn(),
  getCategories: jest.fn().mockResolvedValue(['Category1']),
  getCountries: jest.fn().mockResolvedValue(['Country1']),
}));

jest.mock('features/persons/utils/groupingUtils', () => ({
  getGroupColor: jest.fn(),
}));

// Mock window.location and window.history for the email verification logic
const mockLocation = {
  search: '',
  href: 'http://localhost/profile',
};
const mockHistory = {
  replaceState: jest.fn(),
};

// Try to mock window properties safely
try {
  delete (window as any).location;
  Object.defineProperty(window, 'location', {
    value: mockLocation,
    writable: true,
    configurable: true,
  });
} catch (e) {
  // Fallback if can't redefine
  (window as any).location = mockLocation;
}

try {
  Object.defineProperty(window, 'history', {
    value: mockHistory,
    writable: true,
    configurable: true,
  });
} catch (e) {
  (window as any).history = mockHistory;
}

describe('ProfilePage', () => {
  const mockUseAuth = jest.requireMock('shared/context/AuthContext').useAuth as jest.MockedFunction<any>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({ isAuthenticated: true, user: { id: 1 } });
  });

  it('should render without crashing', () => {
    render(<ProfilePage />);
    
    expect(screen.getByTestId('profile-component')).toBeInTheDocument();
    expect(screen.getByTestId('app-header')).toBeInTheDocument();
    expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument();
    expect(screen.getByTestId('seo')).toBeInTheDocument();
  });

  it('should render the page title', () => {
    render(<ProfilePage />);
    
    expect(screen.getByText('Личный кабинет')).toBeInTheDocument();
  });

  it('should render with proper accessibility attributes', () => {
    render(<ProfilePage />);
    
    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
    expect(main).toHaveAttribute('aria-label', 'Хронониндзя — Личный кабинет');
  });

  it('should show Profile component when authenticated', () => {
    render(<ProfilePage />);
    
    expect(screen.getByTestId('profile-component')).toBeInTheDocument();
    expect(screen.queryByTestId('login-form')).not.toBeInTheDocument();
    expect(screen.queryByTestId('register-form')).not.toBeInTheDocument();
  });

  it('should show login and register forms when not authenticated', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false });
    
    render(<ProfilePage />);
    
    expect(screen.getByTestId('login-form')).toBeInTheDocument();
    expect(screen.getByTestId('register-form')).toBeInTheDocument();
    expect(screen.queryByTestId('profile-component')).not.toBeInTheDocument();
    expect(screen.getByText(/Для регистрации используется подтверждение почты/)).toBeInTheDocument();
  });
});
