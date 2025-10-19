import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import RegisterPage from '../RegisterPage';

// Mock all the hooks and components
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

jest.mock('features/auth/components/RegisterForm', () => ({
  RegisterForm: ({ onSuccess }: { onSuccess: () => void }) => (
    <div data-testid="register-form">
      <button onClick={onSuccess}>Register</button>
    </div>
  ),
}));

jest.mock('shared/layout/AppHeader', () => ({
  AppHeader: (props: any) => <div data-testid="app-header">App Header</div>,
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
  getCategories: jest.fn().mockResolvedValue(['Category1']),
  getCountries: jest.fn().mockResolvedValue(['Country1']),
}));

jest.mock('features/persons/utils/groupingUtils', () => ({
  getGroupColor: jest.fn(),
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
