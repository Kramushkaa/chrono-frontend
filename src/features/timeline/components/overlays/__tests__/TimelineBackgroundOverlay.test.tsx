import React from 'react'
import { render } from '@testing-library/react'
import { TimelineBackgroundOverlay } from '../TimelineBackgroundOverlay'

const mockGetAdjustedPosition = vi.fn((year: number) => year * 10)

const mockElements = [
  { type: 'century' as const, year: 1800 },
  { type: 'century' as const, year: 1900 },
  { type: 'gap' as const, startYear: 1850, endYear: 1860 },
]

describe('TimelineBackgroundOverlay', () => {
  const defaultProps = {
    elements: mockElements,
    getAdjustedPosition: mockGetAdjustedPosition,
    adjustedTimelineWidth: 1000,
    totalHeight: 500,
    minYear: 1000,
    pixelsPerYear: 5,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render without crashing', () => {
    render(<TimelineBackgroundOverlay {...defaultProps} />)
    
    // Should render the main container
    const container = document.querySelector('.timeline-background')
    expect(container).toBeInTheDocument()
  })

  it('should render century backgrounds', () => {
    render(<TimelineBackgroundOverlay {...defaultProps} />)
    
    // Should render century background elements
    const centuryBackground = document.querySelector('#century-1800')
    expect(centuryBackground).toBeInTheDocument()
    expect(centuryBackground).toHaveClass('century-background')
  })

  it('should render gap backgrounds', () => {
    render(<TimelineBackgroundOverlay {...defaultProps} />)
    
    // Should call getAdjustedPosition for gap elements
    expect(mockGetAdjustedPosition).toHaveBeenCalledWith(1850)
  })

  it('should handle empty elements array', () => {
    render(
      <TimelineBackgroundOverlay 
        {...defaultProps} 
        elements={[]}
      />
    )
    
    const container = document.querySelector('.timeline-background')
    expect(container).toBeInTheDocument()
  })

  it('should apply correct container styles', () => {
    render(<TimelineBackgroundOverlay {...defaultProps} />)
    
    const container = document.querySelector('.timeline-background')
    expect(container).toBeInTheDocument()
    
    if (container) {
      expect(container.style.position).toBe('absolute')
      expect(container.style.width).toBe('1000px')
      expect(container.style.height).toBe('700px') // totalHeight + 200
    }
  })

  it('should have proper accessibility attributes', () => {
    render(<TimelineBackgroundOverlay {...defaultProps} />)
    
    const container = document.querySelector('.timeline-background')
    expect(container).toHaveAttribute('role', 'presentation')
    expect(container).toHaveAttribute('aria-hidden', 'true')
    
    const centuryBackground = document.querySelector('#century-1800')
    expect(centuryBackground).toHaveAttribute('role', 'presentation')
    expect(centuryBackground).toHaveAttribute('aria-label')
  })

  it('should handle different timeline dimensions', () => {
    const customProps = {
      ...defaultProps,
      adjustedTimelineWidth: 2000,
      totalHeight: 1000,
      pixelsPerYear: 10,
    }
    
    render(<TimelineBackgroundOverlay {...customProps} />)
    
    const container = document.querySelector('.timeline-background')
    expect(container).toBeInTheDocument()
    
    if (container) {
      expect(container.style.width).toBe('2000px')
      expect(container.style.height).toBe('1200px') // totalHeight + 200
    }
  })

  it('should handle negative century years', () => {
    const negativeElements = [
      { type: 'century' as const, year: -100 },
    ]
    
    render(
      <TimelineBackgroundOverlay 
        {...defaultProps} 
        elements={negativeElements}
      />
    )
    
    const container = document.querySelector('.timeline-background')
    expect(container).toBeInTheDocument()
  })
})




