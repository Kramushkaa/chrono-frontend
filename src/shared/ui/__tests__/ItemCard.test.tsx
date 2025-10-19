import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { ItemCard } from '../ItemCard'

describe('ItemCard', () => {
  const defaultProps = {
    id: '1',
    title: 'Test Item',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render with basic props', () => {
    render(<ItemCard {...defaultProps} />)
    
    expect(screen.getByText('Test Item')).toBeInTheDocument()
    // Don't check for fallback dash as it's only shown when title is falsy
  })

  it('should render with subtitle', () => {
    render(<ItemCard {...defaultProps} subtitle="Test Subtitle" />)
    
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument()
  })

  it('should render with description', () => {
    render(<ItemCard {...defaultProps} description="Test Description" />)
    
    expect(screen.getByText('Test Description')).toBeInTheDocument()
  })

  it('should render with year', () => {
    render(<ItemCard {...defaultProps} year={2023} />)
    
    expect(screen.getByText('2023')).toBeInTheDocument()
  })

  it('should render with start and end year', () => {
    render(<ItemCard {...defaultProps} startYear={1800} endYear={1900} />)
    
    expect(screen.getByText('1800 — 1900')).toBeInTheDocument()
  })

  it('should render with type', () => {
    render(<ItemCard {...defaultProps} type="Test Type" />)
    
    expect(screen.getByText('Test Type')).toBeInTheDocument()
  })

  it('should handle click events when onSelect is provided', () => {
    const onSelect = jest.fn()
    render(<ItemCard {...defaultProps} onSelect={onSelect} />)
    
    fireEvent.click(screen.getByText('Test Item').closest('div')!)
    expect(onSelect).toHaveBeenCalledTimes(1)
  })

  it('should handle person selection when onPersonSelect is provided', () => {
    const onPersonSelect = jest.fn()
    const person = { id: 1, name: 'Test Person' }
    render(<ItemCard {...defaultProps} person={person} onPersonSelect={onPersonSelect} />)
    
    fireEvent.click(screen.getByText('Test Item').closest('div')!)
    expect(onPersonSelect).toHaveBeenCalledWith(person)
  })

  it('should render add button when onAddToList is provided', () => {
    const onAddToList = jest.fn()
    render(<ItemCard {...defaultProps} onAddToList={onAddToList} isAuthenticated={true} emailVerified={true} />)
    
    const addButton = screen.getByTitle('Добавить в список')
    expect(addButton).toBeInTheDocument()
    expect(addButton).toHaveTextContent('＋')
  })

  it('should render remove button when in list mode', () => {
    const onRemoveFromList = jest.fn()
    render(<ItemCard {...defaultProps} onRemoveFromList={onRemoveFromList} isListMode={true} />)
    
    const removeButton = screen.getByTitle('Удалить из списка')
    expect(removeButton).toBeInTheDocument()
    expect(removeButton).toHaveTextContent('✕')
  })

  it('should disable add button when disabled prop is true', () => {
    const onAddToList = jest.fn()
    render(<ItemCard {...defaultProps} onAddToList={onAddToList} addButtonDisabled={true} />)
    
    const addButton = screen.getByTitle('Добавить в список')
    expect(addButton).toBeDisabled()
  })

  it('should show auth modal when not authenticated', () => {
    const showAuthModal = jest.fn()
    const onAddToList = jest.fn()
    render(
      <ItemCard 
        {...defaultProps} 
        onAddToList={onAddToList} 
        isAuthenticated={false} 
        showAuthModal={showAuthModal} 
      />
    )
    
    fireEvent.click(screen.getByTitle('Добавить в список'))
    expect(showAuthModal).toHaveBeenCalledTimes(1)
    expect(onAddToList).not.toHaveBeenCalled()
  })

  it('should show toast when email not verified', () => {
    const showToast = jest.fn()
    const onAddToList = jest.fn()
    render(
      <ItemCard 
        {...defaultProps} 
        onAddToList={onAddToList} 
        isAuthenticated={true} 
        emailVerified={false} 
        showToast={showToast} 
      />
    )
    
    fireEvent.click(screen.getByTitle('Добавить в список'))
    expect(showToast).toHaveBeenCalledWith('Требуется подтверждение email', 'error')
    expect(onAddToList).not.toHaveBeenCalled()
  })

  it('should call onAddToList when authenticated and email verified', () => {
    const onAddToList = jest.fn()
    render(
      <ItemCard 
        {...defaultProps} 
        onAddToList={onAddToList} 
        isAuthenticated={true} 
        emailVerified={true} 
      />
    )
    
    fireEvent.click(screen.getByTitle('Добавить в список'))
    expect(onAddToList).toHaveBeenCalledTimes(1)
  })

  it('should handle button click without propagating to parent', () => {
    const onSelect = jest.fn()
    const onAddToList = jest.fn()
    render(
      <ItemCard 
        {...defaultProps} 
        onSelect={onSelect} 
        onAddToList={onAddToList} 
        isAuthenticated={true} 
        emailVerified={true} 
      />
    )
    
    fireEvent.click(screen.getByTitle('Добавить в список'))
    expect(onAddToList).toHaveBeenCalledTimes(1)
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('should use custom button title', () => {
    render(<ItemCard {...defaultProps} onAddToList={jest.fn()} addButtonTitle="Custom Add" />)
    
    expect(screen.getByTitle('Custom Add')).toBeInTheDocument()
  })

  it('should handle null/undefined year gracefully', () => {
    render(<ItemCard {...defaultProps} year={null} />)
    
    // Should not render year section when year is null
    expect(screen.queryByText('null')).not.toBeInTheDocument()
  })

  it('should have proper cursor style when clickable', () => {
    const onSelect = jest.fn()
    render(<ItemCard {...defaultProps} onSelect={onSelect} />)
    
    const card = document.getElementById('item-card-1')!
    expect(card.style.cursor).toBe('pointer')
  })

  it('should have default cursor style when not clickable', () => {
    render(<ItemCard {...defaultProps} />)
    
    const card = document.getElementById('item-card-1')!
    expect(card.style.cursor).toBe('default')
  })
})
