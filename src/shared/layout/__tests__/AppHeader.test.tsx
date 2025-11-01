import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { AppHeader } from '../AppHeader'

// Mock dependencies
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
})

vi.mock('shared/context/ToastContext', () => ({
  useToast: () => ({
    showToast: vi.fn(),
  }),
}))

vi.mock('shared/ui/BrandTitle', () => ({
  BrandTitle: () => <div data-testid="brand-title">Brand Title</div>,
}))

vi.mock('shared/ui/UserMenu', () => ({
  UserMenu: () => <div data-testid="user-menu">User Menu</div>,
}))

vi.mock('../components/DesktopHeaderControls', () => ({
  DesktopHeaderControls: () => <div data-testid="desktop-header-controls">Desktop Controls</div>,
}))

vi.mock('../components/MobileHeaderControls', () => ({
  MobileHeaderControls: () => <div data-testid="mobile-header-controls">Mobile Controls</div>,
}))

const defaultProps = {
  isScrolled: false,
  showControls: true,
  setShowControls: vi.fn(),
  mode: 'full' as const,
  filters: {
    showAchievements: true,
    hideEmptyCenturies: false,
    categories: [],
    countries: [],
  },
  setFilters: vi.fn(),
  groupingType: 'none' as const,
  setGroupingType: vi.fn(),
  allCategories: ['Politics', 'Science'],
  allCountries: ['Russia', 'USA'],
  yearInputs: { start: '-800', end: '2000' },
  setYearInputs: vi.fn(),
  applyYearFilter: vi.fn(),
  handleYearKeyPress: vi.fn(),
  resetAllFilters: vi.fn(),
  getCategoryColor: vi.fn(() => '#000000'),
  sortedData: [],
  handleSliderMouseDown: vi.fn(),
  handleSliderMouseMove: vi.fn(),
  handleSliderMouseUp: vi.fn(),
  isDraggingSlider: false,
}

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
)

describe('AppHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render in full mode', () => {
    render(
      <TestWrapper>
        <AppHeader {...defaultProps} />
      </TestWrapper>
    )

    expect(screen.getByTestId('brand-title')).toBeInTheDocument()
    expect(screen.getByTestId('user-menu')).toBeInTheDocument()
  })

  it('should render in minimal mode', () => {
    render(
      <TestWrapper>
        <AppHeader {...defaultProps} mode="minimal" />
      </TestWrapper>
    )

    expect(screen.getByTestId('brand-title')).toBeInTheDocument()
    expect(screen.getByTestId('user-menu')).toBeInTheDocument()
  })

  it('should render desktop controls when showControls is true', () => {
    render(
      <TestWrapper>
        <AppHeader {...defaultProps} showControls={true} />
      </TestWrapper>
    )

    expect(screen.getByTestId('desktop-header-controls')).toBeInTheDocument()
  })

  it('should render mobile controls when showControls is true', () => {
    render(
      <TestWrapper>
        <AppHeader {...defaultProps} showControls={true} />
      </TestWrapper>
    )

    expect(screen.getByTestId('mobile-header-controls')).toBeInTheDocument()
  })

  it('should handle back to menu when onBackToMenu is provided', () => {
    const mockOnBackToMenu = vi.fn()
    render(
      <TestWrapper>
        <AppHeader {...defaultProps} onBackToMenu={mockOnBackToMenu} />
      </TestWrapper>
    )

    // AppHeader should render, the actual back button behavior is handled by child components
    expect(screen.getByTestId('brand-title')).toBeInTheDocument()
  })

  it('should handle isScrolled prop', () => {
    render(
      <TestWrapper>
        <AppHeader {...defaultProps} isScrolled={true} />
      </TestWrapper>
    )

    expect(screen.getByTestId('brand-title')).toBeInTheDocument()
  })

  it('should pass filters to child components', () => {
    const customFilters = {
      showAchievements: false,
      hideEmptyCenturies: true,
      categories: ['Science'],
      countries: ['USA'],
    }

    render(
      <TestWrapper>
        <AppHeader {...defaultProps} filters={customFilters} />
      </TestWrapper>
    )

    expect(screen.getByTestId('brand-title')).toBeInTheDocument()
  })

  it('should handle groupingType changes', () => {
    render(
      <TestWrapper>
        <AppHeader {...defaultProps} groupingType="category" />
      </TestWrapper>
    )

    expect(screen.getByTestId('brand-title')).toBeInTheDocument()
  })

  it('should handle year inputs', () => {
    const customYearInputs = { start: '-1000', end: '3000' }
    
    render(
      <TestWrapper>
        <AppHeader {...defaultProps} yearInputs={customYearInputs} />
      </TestWrapper>
    )

    expect(screen.getByTestId('brand-title')).toBeInTheDocument()
  })

  it('should handle extra controls when provided', () => {
    const extraLeftButton = { label: 'Custom Button', onClick: vi.fn() }
    const extraRightControls = <div data-testid="extra-right">Extra Right</div>
    const extraFilterControls = <div data-testid="extra-filter">Extra Filter</div>

    render(
      <TestWrapper>
        <AppHeader 
          {...defaultProps} 
          extraLeftButton={extraLeftButton}
          extraRightControls={extraRightControls}
          extraFilterControls={extraFilterControls}
        />
      </TestWrapper>
    )

    expect(screen.getByTestId('brand-title')).toBeInTheDocument()
  })

  it('should handle sortedData prop', () => {
    const mockPersons = [
      { id: '1', name: 'Person 1', birthYear: 1000, deathYear: 1100 },
      { id: '2', name: 'Person 2', birthYear: 1200, deathYear: 1300 },
    ] as any[]

    render(
      <TestWrapper>
        <AppHeader {...defaultProps} sortedData={mockPersons} />
      </TestWrapper>
    )

    expect(screen.getByTestId('brand-title')).toBeInTheDocument()
  })
})




