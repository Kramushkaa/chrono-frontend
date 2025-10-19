import React from 'react'
import { render } from '@testing-library/react'
import { CenturyGridLinesOverlay } from '../CenturyGridLinesOverlay'

const mockGetAdjustedPosition = jest.fn((year: number) => year * 10)

const mockElements = [
  { type: 'century' as const, year: 1800 },
  { type: 'century' as const, year: 1900 },
  { type: 'gap' as const, startYear: 1850, endYear: 1860 },
]

describe('CenturyGridLinesOverlay', () => {
  const defaultProps = {
    elements: mockElements,
    getAdjustedPosition: mockGetAdjustedPosition,
    adjustedTimelineWidth: 1000,
    totalHeight: 500,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render without crashing', () => {
    render(<CenturyGridLinesOverlay {...defaultProps} />)
    
    // Should render the main container
    const container = document.querySelector('div')
    expect(container).toBeInTheDocument()
  })

  it('should render grid lines for century elements', () => {
    render(<CenturyGridLinesOverlay {...defaultProps} />)
    
    // Should render grid lines for century years
    expect(mockGetAdjustedPosition).toHaveBeenCalledWith(1800)
    expect(mockGetAdjustedPosition).toHaveBeenCalledWith(1900)
  })

  it('should render grid lines for gap elements', () => {
    render(<CenturyGridLinesOverlay {...defaultProps} />)
    
    // Should render grid lines for gap start years
    expect(mockGetAdjustedPosition).toHaveBeenCalledWith(1850)
  })

  it('should handle empty elements array', () => {
    render(
      <CenturyGridLinesOverlay 
        {...defaultProps} 
        elements={[]}
      />
    )
    
    const container = document.querySelector('div')
    expect(container).toBeInTheDocument()
  })

  it('should apply correct container styles', () => {
    render(<CenturyGridLinesOverlay {...defaultProps} />)
    
    const container = document.querySelector('div')
    expect(container).toBeInTheDocument()
    
    if (container) {
      expect(container.style.position).toBe('absolute')
      expect(container.style.width).toBe('1000px')
      expect(container.style.height).toBe('700px') // totalHeight + 200
    }
  })

  it('should handle mixed element types', () => {
    const mixedElements = [
      { type: 'century' as const, year: 1000 },
      { type: 'gap' as const, startYear: 1500, endYear: 1600, hiddenCenturies: [1550] },
      { type: 'century' as const, year: 2000 },
    ]
    
    render(
      <CenturyGridLinesOverlay 
        {...defaultProps} 
        elements={mixedElements}
      />
    )
    
    expect(mockGetAdjustedPosition).toHaveBeenCalledWith(1000)
    expect(mockGetAdjustedPosition).toHaveBeenCalledWith(1500)
    expect(mockGetAdjustedPosition).toHaveBeenCalledWith(2000)
  })

  it('should handle different timeline dimensions', () => {
    const customProps = {
      ...defaultProps,
      adjustedTimelineWidth: 2000,
      totalHeight: 1000,
    }
    
    render(<CenturyGridLinesOverlay {...customProps} />)
    
    const container = document.querySelector('div')
    expect(container).toBeInTheDocument()
    
    if (container) {
      expect(container.style.width).toBe('2000px')
      expect(container.style.height).toBe('1200px') // totalHeight + 200
    }
  })
})
