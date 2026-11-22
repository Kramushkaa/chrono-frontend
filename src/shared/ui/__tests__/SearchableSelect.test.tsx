import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SearchableSelect, SelectOption } from '../SearchableSelect'

describe('SearchableSelect', () => {
  const mockOptions: SelectOption[] = [
    { label: 'Option 1', value: '1' },
    { label: 'Option 2', value: '2' },
    { label: 'Test Option', value: '3' }
  ]

  const defaultProps = {
    value: '',
    onChange: vi.fn(),
    options: mockOptions
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Mock scrollIntoView which is not available in JSDOM
    Element.prototype.scrollIntoView = vi.fn()
  })

  it('should render select component', () => {
    render(<SearchableSelect {...defaultProps} />)
    
    expect(screen.getByText('Выбрать...')).toBeInTheDocument()
  })

  it('should render with placeholder', () => {
    render(<SearchableSelect {...defaultProps} placeholder="Choose option" />)
    
    expect(screen.getByText('Choose option')).toBeInTheDocument()
  })

  it('should show selected option', () => {
    render(<SearchableSelect {...defaultProps} value="1" />)
    
    expect(screen.getByText('Option 1')).toBeInTheDocument()
  })

  it('should open dropdown on click', () => {
    render(<SearchableSelect {...defaultProps} />)
    
    const button = screen.getByText('Выбрать...')
    fireEvent.click(button)
    
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    expect(screen.getByText('Option 1')).toBeInTheDocument()
    expect(screen.getByText('Option 2')).toBeInTheDocument()
  })

  it('should filter options when searching', async () => {
    render(<SearchableSelect {...defaultProps} />)
    
    const button = screen.getByText('Выбрать...')
    fireEvent.click(button)
    
    const searchInput = screen.getByPlaceholderText('Поиск...')
    fireEvent.change(searchInput, { target: { value: 'Test' } })
    
    await waitFor(() => {
      expect(screen.getByText('Test Option')).toBeInTheDocument()
      expect(screen.queryByText('Option 1')).not.toBeInTheDocument()
    })
  })

  it('should call onChange when option is selected', () => {
    const mockOnChange = vi.fn()
    render(<SearchableSelect {...defaultProps} onChange={mockOnChange} />)
    
    const button = screen.getByText('Выбрать...')
    fireEvent.click(button)
    
    const option = screen.getByText('Option 1')
    fireEvent.click(option)
    
    expect(mockOnChange).toHaveBeenCalledWith('1', { label: 'Option 1', value: '1' })
  })

  it('should show clear button when value is selected', () => {
    render(<SearchableSelect {...defaultProps} value="1" allowClear={true} />)
    
    expect(screen.getByLabelText('Очистить выбор')).toBeInTheDocument()
  })

  it('should clear value when clear button is clicked', () => {
    const mockOnChange = vi.fn()
    render(<SearchableSelect {...defaultProps} value="1" onChange={mockOnChange} allowClear={true} />)
    
    const clearButton = screen.getByLabelText('Очистить выбор')
    fireEvent.click(clearButton)
    
    expect(mockOnChange).toHaveBeenCalledWith('')
  })

  it('should be disabled when disabled prop is true', () => {
    render(<SearchableSelect {...defaultProps} disabled={true} />)
    
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })

  it('should show loading state', () => {
    render(<SearchableSelect {...defaultProps} isLoading={true} />)
    
    const button = screen.getByText('Выбрать...')
    fireEvent.click(button)
    
    expect(screen.getByText('Загрузка...')).toBeInTheDocument()
  })

  it('should show no results message when no options match', async () => {
    render(<SearchableSelect {...defaultProps} />)
    
    const button = screen.getByText('Выбрать...')
    fireEvent.click(button)
    
    const searchInput = screen.getByPlaceholderText('Поиск...')
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } })
    
    await waitFor(() => {
      expect(screen.getByText('Ничего не найдено')).toBeInTheDocument()
    })
  })

  it('should handle keyboard navigation', () => {
    render(<SearchableSelect {...defaultProps} />)
    
    const button = screen.getByText('Выбрать...')
    fireEvent.click(button)
    
    const searchInput = screen.getByPlaceholderText('Поиск...')
    
    // Test ArrowDown
    fireEvent.keyDown(searchInput, { key: 'ArrowDown' })
    
    // Test Enter to select
    fireEvent.keyDown(searchInput, { key: 'Enter' })
    
    expect(defaultProps.onChange).toHaveBeenCalled()
  })

  it('should close on Escape key', () => {
    render(<SearchableSelect {...defaultProps} />)
    
    const button = screen.getByText('Выбрать...')
    fireEvent.click(button)
    
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    
    const searchInput = screen.getByPlaceholderText('Поиск...')
    fireEvent.keyDown(searchInput, { key: 'Escape' })
    
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('should call onSearchChange when searching', async () => {
    const mockOnSearchChange = vi.fn()
    render(<SearchableSelect {...defaultProps} onSearchChange={mockOnSearchChange} />)
    
    const button = screen.getByText('Выбрать...')
    fireEvent.click(button)
    
    const searchInput = screen.getByPlaceholderText('Поиск...')
    fireEvent.change(searchInput, { target: { value: 'test' } })
    
    await waitFor(() => {
      expect(mockOnSearchChange).toHaveBeenCalledWith('test')
    }, { timeout: 400 })
  })
})




