import React from 'react'
import { render, screen } from '@testing-library/react'
import { CreatePeriodForm } from '../CreatePeriodForm'

// Mock the SearchableSelect component
jest.mock('shared/ui/SearchableSelect', () => ({
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

describe('CreatePeriodForm', () => {
  const defaultProps = {
    countryOptions: mockCountryOptions,
    personOptions: mockPersonOptions,
    personsSelectLoading: false,
    onSearchPersons: jest.fn(),
    onSubmit: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render without crashing', () => {
    render(<CreatePeriodForm {...defaultProps} />)
    
    expect(document.querySelector('form')).toBeInTheDocument()
  })

  it('should render all required form elements', () => {
    render(<CreatePeriodForm {...defaultProps} />)
    
    // Should render form fields
    expect(screen.getByRole('textbox', { name: /название/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/год начала/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/год окончания/i)).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /описание/i })).toBeInTheDocument()
  })

  it('should render type selection', () => {
    render(<CreatePeriodForm {...defaultProps} />)
    
    // Should render radio buttons or select for period type
    expect(screen.getByText(/тип периода/i)).toBeInTheDocument()
  })

  it('should render SearchableSelect components', () => {
    render(<CreatePeriodForm {...defaultProps} />)
    
    const searchableSelects = screen.getAllByTestId('searchable-select')
    expect(searchableSelects.length).toBeGreaterThan(0)
  })

  it('should handle different country options', () => {
    const customCountries = [{ id: 3, name: 'Германия' }]
    render(
      <CreatePeriodForm 
        {...defaultProps} 
        countryOptions={customCountries}
      />
    )
    
    expect(document.querySelector('form')).toBeInTheDocument()
  })

  it('should handle different person options', () => {
    const customPersons = [{ value: '3', label: 'Екатерина II' }]
    render(
      <CreatePeriodForm 
        {...defaultProps} 
        personOptions={customPersons}
      />
    )
    
    expect(document.querySelector('form')).toBeInTheDocument()
  })

  it('should handle loading state', () => {
    render(
      <CreatePeriodForm 
        {...defaultProps} 
        personsSelectLoading={true}
      />
    )
    
    expect(document.querySelector('form')).toBeInTheDocument()
  })

  it('should handle empty country options', () => {
    render(
      <CreatePeriodForm 
        {...defaultProps} 
        countryOptions={[]}
      />
    )
    
    expect(document.querySelector('form')).toBeInTheDocument()
  })

  it('should handle empty person options', () => {
    render(
      <CreatePeriodForm 
        {...defaultProps} 
        personOptions={[]}
      />
    )
    
    expect(document.querySelector('form')).toBeInTheDocument()
  })

  it('should render submit buttons', () => {
    render(<CreatePeriodForm {...defaultProps} />)
    
    // Should render submit buttons for draft and normal save
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
  })
})
