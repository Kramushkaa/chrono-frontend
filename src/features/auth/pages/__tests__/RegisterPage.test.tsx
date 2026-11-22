import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import RegisterPage from '../RegisterPage';

// Mock all the hooks and components
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

vi.mock('features/auth/components/RegisterForm', () => ({
  RegisterForm: ({ onSuccess }: { onSuccess: () => void }) => (
    <div data-testid="register-form">
      <button onClick={onSuccess}>Register</button>
    </div>
  ),
}));

vi.mock('shared/layout/AppHeader', () => ({
  AppHeader: (props: any) => <div data-testid="app-header">App Header</div>,
}));

vi.mock('shared/ui/Breadcrumbs', () => ({
  Breadcrumbs: () => <div data-testid="breadcrumbs">Breadcrumbs</div>,
}));

vi.mock('shared/ui/SEO', () => ({
  SEO: ({ title }: { title: string }) => <div data-testid="seo">{title}</div>,
}));

vi.mock('shared/hooks/useFilters', () => ({
  useFilters: () => ({
    filters: {},
    setFilters: vi.fn(),
    groupingType: 'none',
    setGroupingType: vi.fn(),
    yearInputs: { start: '1800', end: '2000' },
    setYearInputs: vi.fn(),
    applyYearFilter: vi.fn(),
    handleYearKeyPress: vi.fn(),
    resetAllFilters: vi.fn(),
  }),
}));

vi.mock('shared/api/api', () => ({
  getCategories: vi.fn().mockResolvedValue(['Category1']),
  getCountries: vi.fn().mockResolvedValue(['Country1']),
}));

vi.mock('features/persons/utils/groupingUtils', () => ({
  getGroupColor: vi.fn(),
}));

describe('RegisterPage', () => {
  const renderWithRouter = (component: React.ReactElement) => {
    return render(
      <BrowserRouter>
        {component}
      </BrowserRouter>
    );
  };

  it('should render without crashing', () => {
    renderWithRouter(<RegisterPage />);
    
    expect(screen.getByTestId('register-form')).toBeInTheDocument();
    expect(screen.getByTestId('app-header')).toBeInTheDocument();
    expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument();
    expect(screen.getByTestId('seo')).toBeInTheDocument();
  });

  it('should render the page title', () => {
    renderWithRouter(<RegisterPage />);
    
    expect(screen.getByText('Регистрация')).toBeInTheDocument();
  });

  it('should render with proper accessibility attributes', () => {
    renderWithRouter(<RegisterPage />);
    
    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
    expect(main).toHaveAttribute('aria-label', 'Хронониндзя — Регистрация');
  });
});




