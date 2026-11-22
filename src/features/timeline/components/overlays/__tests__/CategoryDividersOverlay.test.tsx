import React from 'react'
import { render } from '@testing-library/react'
import { CategoryDividersOverlay } from '../CategoryDividersOverlay'

const mockGetGroupColor = vi.fn((category: string) => {
  const colors: Record<string, string> = {
    'Правители': '#3b82f6',
    'Ученые': '#10b981',
    'Художники': '#f59e0b',
  }
  return colors[category] || '#6b7280'
})

const mockDividers = [
  { category: 'Правители', top: 100 },
  { category: 'Ученые', top: 250 },
  { category: 'Художники', top: 400 },
]

describe('CategoryDividersOverlay', () => {
  const defaultProps = {
    dividers: mockDividers,
    getGroupColor: mockGetGroupColor,
    adjustedTimelineWidth: 1000,
    totalHeight: 500,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render without crashing', () => {
    render(<CategoryDividersOverlay {...defaultProps} />)
    
    // Should render the main container
    const container = document.querySelector('.category-dividers')
    expect(container).toBeInTheDocument()
  })

  it('should render all dividers', () => {
    render(<CategoryDividersOverlay {...defaultProps} />)
    
    // Should render all divider elements
    const dividers = document.querySelectorAll('.category-divider')
    expect(dividers).toHaveLength(mockDividers.length)
  })

  it('should render category labels', () => {
    render(<CategoryDividersOverlay {...defaultProps} />)
    
    // Should render category labels
    expect(document.querySelector('#category-label-Правители')).toBeInTheDocument()
    expect(document.querySelector('#category-label-Ученые')).toBeInTheDocument()
    expect(document.querySelector('#category-label-Художники')).toBeInTheDocument()
  })

  it('should call getGroupColor for each category', () => {
    render(<CategoryDividersOverlay {...defaultProps} />)
    
    expect(mockGetGroupColor).toHaveBeenCalledWith('Правители')
    expect(mockGetGroupColor).toHaveBeenCalledWith('Ученые')
    expect(mockGetGroupColor).toHaveBeenCalledWith('Художники')
  })

  it('should handle empty dividers array', () => {
    render(
      <CategoryDividersOverlay 
        {...defaultProps} 
        dividers={[]}
      />
    )
    
    const container = document.querySelector('.category-dividers')
    expect(container).toBeInTheDocument()
    
    const dividers = document.querySelectorAll('.category-divider')
    expect(dividers).toHaveLength(0)
  })

  it('should apply correct styles to container', () => {
    render(<CategoryDividersOverlay {...defaultProps} />)
    
    const container = document.querySelector('.category-dividers') as HTMLElement
    expect(container).toBeInTheDocument()
    
    const styles = window.getComputedStyle(container)
    expect(container.style.position).toBe('absolute')
    expect(container.style.width).toBe('1000px')
  })

  it('should have proper accessibility attributes', () => {
    render(<CategoryDividersOverlay {...defaultProps} />)
    
    const container = document.querySelector('.category-dividers')
    expect(container).toHaveAttribute('role', 'presentation')
    expect(container).toHaveAttribute('aria-hidden', 'true')
    
    const firstDivider = document.querySelector('.category-divider')
    expect(firstDivider).toHaveAttribute('role', 'separator')
  })

  it('should position labels with scrollLeft offset', () => {
    const scrollLeft = 150
    render(<CategoryDividersOverlay {...defaultProps} scrollLeft={scrollLeft} />)
    
    const label = document.querySelector('#category-label-Правители') as HTMLElement
    expect(label).toBeInTheDocument()
    expect(label.style.left).toBe(`${scrollLeft + 20}px`)
  })

  it('should default to scrollLeft of 0 when not provided', () => {
    render(<CategoryDividersOverlay {...defaultProps} />)
    
    const label = document.querySelector('#category-label-Правители') as HTMLElement
    expect(label).toBeInTheDocument()
    expect(label.style.left).toBe('20px')
  })
})




