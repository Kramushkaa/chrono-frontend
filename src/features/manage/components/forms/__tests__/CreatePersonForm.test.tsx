import React from 'react'
import { render, screen } from '@testing-library/react'
import { CreatePersonForm } from '../CreatePersonForm'

// Mock the SearchableSelect component
vi.mock('shared/ui/SearchableSelect', () => ({
  SearchableSelect: ({ children, ...props }: any) => (
    <div data-testid="searchable-select" {...props}>
      {children}
    </div>
  ),
}))

// Mock LifePeriodsEditor
vi.mock('features/persons/components/LifePeriodsEditor', () => ({
  LifePeriodsEditor: ({ children, ...props }: any) => (
    <div data-testid="life-periods-editor" {...props}>
      {children}
    </div>
  ),
}))

// Mock DraftModerationButtons
vi.mock('shared/ui/DraftModerationButtons', () => ({
  DraftModerationButtons: ({ children, ...props }: any) => (
    <div data-testid="draft-moderation-buttons" {...props}>
      {children}
    </div>
  ),
}))

// Mock validation utility
vi.mock('shared/utils/validation', () => ({
  validateLifePeriodsClient: vi.fn(() => ({ ok: true, periodErrors: [] })),
}))

const mockCategories = ['Правители', 'Ученые', 'Художники']
const mockCountryOptions = [
  { id: 1, name: 'Россия' },
  { id: 2, name: 'Франция' },
  { id: 3, name: 'Англия' },
]

describe('CreatePersonForm', () => {
  const defaultProps = {
    categories: mockCategories,
    countryOptions: mockCountryOptions,
    onSubmit: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render without crashing', () => {
    render(<CreatePersonForm {...defaultProps} />)
    
    // Should render the form
    expect(document.querySelector('form')).toBeInTheDocument()
  })

  it('should render all required form elements', () => {
    render(<CreatePersonForm {...defaultProps} />)
    
    // Should render form fields
    expect(screen.getByRole('textbox', { name: /имя/i })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /описание/i })).toBeInTheDocument()
    expect(screen.getByRole('spinbutton', { name: /год рождения/i })).toBeInTheDocument()
    expect(screen.getByRole('spinbutton', { name: /год смерти/i })).toBeInTheDocument()
  })

  it('should render SearchableSelect components', () => {
    render(<CreatePersonForm {...defaultProps} />)
    
    // Should render SearchableSelect components for category and countries
    const searchableSelects = screen.getAllByTestId('searchable-select')
    expect(searchableSelects.length).toBeGreaterThan(0)
  })

  it('should not render LifePeriodsEditor initially', () => {
    render(<CreatePersonForm {...defaultProps} />)
    
    // LifePeriodsEditor should not be rendered initially since there are no periods
    expect(screen.queryByTestId('life-periods-editor')).not.toBeInTheDocument()
  })
  
  it('should render add country button', () => {
    render(<CreatePersonForm {...defaultProps} />)
    
    expect(screen.getByText('+ Добавить страну проживания')).toBeInTheDocument()
  })

  it('should render DraftModerationButtons', () => {
    render(<CreatePersonForm {...defaultProps} />)
    
    expect(screen.getByTestId('draft-moderation-buttons')).toBeInTheDocument()
  })

  it('should handle different categories', () => {
    const customCategories = ['Артисты', 'Писатели']
    render(
      <CreatePersonForm 
        {...defaultProps} 
        categories={customCategories}
      />
    )
    
    expect(document.querySelector('form')).toBeInTheDocument()
  })

  it('should handle different country options', () => {
    const customCountries = [{ id: 4, name: 'Германия' }]
    render(
      <CreatePersonForm 
        {...defaultProps} 
        countryOptions={customCountries}
      />
    )
    
    expect(document.querySelector('form')).toBeInTheDocument()
  })

  it('should render with empty categories', () => {
    render(
      <CreatePersonForm 
        {...defaultProps} 
        categories={[]}
      />
    )
    
    expect(document.querySelector('form')).toBeInTheDocument()
  })

  it('should render with empty country options', () => {
    render(
      <CreatePersonForm 
        {...defaultProps} 
        countryOptions={[]}
      />
    )
    
    expect(document.querySelector('form')).toBeInTheDocument()
  })
})




