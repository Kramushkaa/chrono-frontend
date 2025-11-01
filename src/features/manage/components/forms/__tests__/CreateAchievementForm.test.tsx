import React from 'react'
import { render, screen } from '@testing-library/react'
import { CreateAchievementForm } from '../CreateAchievementForm'

// Mock the SearchableSelect component
vi.mock('shared/ui/SearchableSelect', () => ({
  SearchableSelect: ({ children, ...props }: any) => (
    <div data-testid="searchable-select" {...props}>
      {children}
    </div>
  ),
  SelectOption: ({ children, ...props }: any) => (
    <div data-testid="select-option" {...props}>
      {children}
    </div>
  ),
}))

const mockCountryOptions = [
  { id: 1, name: 'Россия' },
  { id: 2, name: 'Франция' },
]

const mockPersonOptions = [
  { value: '1', label: 'Иван Грозный' },
  { value: '2', label: 'Петр I' },
]

describe('CreateAchievementForm', () => {
  const defaultProps = {
    countryOptions: mockCountryOptions,
    personOptions: mockPersonOptions,
    personsSelectLoading: false,
    onSearchPersons: vi.fn(),
    onSubmit: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render without crashing', () => {
    render(<CreateAchievementForm {...defaultProps} />)
    
    expect(document.querySelector('form')).toBeInTheDocument()
  })

  it('should render all required form elements', () => {
    render(<CreateAchievementForm {...defaultProps} />)
    
    // Should render form fields
    expect(screen.getByRole('spinbutton', { name: /год/i })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /описание/i })).toBeInTheDocument()
  })

  it('should render SearchableSelect components', () => {
    render(<CreateAchievementForm {...defaultProps} />)
    
    const searchableSelects = screen.getAllByTestId('searchable-select')
    expect(searchableSelects.length).toBeGreaterThan(0)
  })

  it('should handle different country options', () => {
    const customCountries = [{ id: 3, name: 'Германия' }]
    render(
      <CreateAchievementForm 
        {...defaultProps} 
        countryOptions={customCountries}
      />
    )
    
    expect(document.querySelector('form')).toBeInTheDocument()
  })

  it('should handle different person options', () => {
    const customPersons = [{ value: '3', label: 'Екатерина II' }]
    render(
      <CreateAchievementForm 
        {...defaultProps} 
        personOptions={customPersons}
      />
    )
    
    expect(document.querySelector('form')).toBeInTheDocument()
  })

  it('should handle loading state', () => {
    render(
      <CreateAchievementForm 
        {...defaultProps} 
        personsSelectLoading={true}
      />
    )
    
    expect(document.querySelector('form')).toBeInTheDocument()
  })

  it('should handle empty country options', () => {
    render(
      <CreateAchievementForm 
        {...defaultProps} 
        countryOptions={[]}
      />
    )
    
    expect(document.querySelector('form')).toBeInTheDocument()
  })

  it('should handle empty person options', () => {
    render(
      <CreateAchievementForm 
        {...defaultProps} 
        personOptions={[]}
      />
    )
    
    expect(document.querySelector('form')).toBeInTheDocument()
  })
})




