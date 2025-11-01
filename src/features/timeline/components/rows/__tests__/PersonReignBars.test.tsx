import React from 'react'
import { render } from '@testing-library/react'
import { PersonReignBars } from '../PersonReignBars'
import { Person } from 'shared/types'

const mockGetAdjustedPosition = vi.fn((year: number) => year * 10)
const mockGetAdjustedWidth = vi.fn((startYear: number, endYear: number) => (endYear - startYear) * 10)

const mockPerson: Person = {
  id: '1',
  name: 'Тест Персона',
  birthYear: 1850,
  deathYear: 1920,
  reignStart: 1880,
  reignEnd: 1910,
  category: 'Правители',
  country: 'Россия',
}

describe('PersonReignBars', () => {
  const defaultProps = {
    person: mockPerson,
    getAdjustedPosition: mockGetAdjustedPosition,
    getAdjustedWidth: mockGetAdjustedWidth,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render without crashing', () => {
    render(<PersonReignBars {...defaultProps} />)
    
    const reignBar = document.querySelector('#reign-bar-1')
    expect(reignBar).toBeInTheDocument()
  })

  it('should render reign bar when person has reignStart and reignEnd', () => {
    render(<PersonReignBars {...defaultProps} />)
    
    const reignBar = document.querySelector('#reign-bar-1')
    expect(reignBar).toBeInTheDocument()
    expect(reignBar).toHaveClass('reign-bar')
    expect(reignBar).toHaveAttribute('role', 'presentation')
    expect(reignBar).toHaveAttribute('aria-label', 'Период правления: 1880 - 1910')
  })

  it('should call getAdjustedPosition and getAdjustedWidth for reign period', () => {
    render(<PersonReignBars {...defaultProps} />)
    
    expect(mockGetAdjustedPosition).toHaveBeenCalledWith(1880)
    expect(mockGetAdjustedWidth).toHaveBeenCalledWith(1880, 1910)
  })

  it('should render ruler periods when person has rulerPeriods array', () => {
    const personWithRulerPeriods = {
      ...mockPerson,
      rulerPeriods: [
        { startYear: 1875, endYear: 1885, countryName: 'Россия' },
        { startYear: 1890, endYear: 1900, countryName: 'Франция' },
      ],
    }
    
    render(
      <PersonReignBars 
        {...defaultProps} 
        person={personWithRulerPeriods}
      />
    )
    
    // Should render individual reign bars for each ruler period
    expect(document.querySelector('#reign-bar-1-0')).toBeInTheDocument()
    expect(document.querySelector('#reign-bar-1-1')).toBeInTheDocument()
    
    // Should not render the single reign bar
    expect(document.querySelector('#reign-bar-1')).not.toBeInTheDocument()
  })

  it('should render multiple ruler periods with correct attributes', () => {
    const personWithRulerPeriods = {
      ...mockPerson,
      rulerPeriods: [
        { startYear: 1875, endYear: 1885, countryName: 'Россия' },
        { startYear: 1890, endYear: 1900 },
      ],
    }
    
    render(
      <PersonReignBars 
        {...defaultProps} 
        person={personWithRulerPeriods}
      />
    )
    
    const firstReignBar = document.querySelector('#reign-bar-1-0')
    expect(firstReignBar).toHaveAttribute('aria-label', 'Период правления: 1875 - 1885, Россия')
    expect(firstReignBar).toHaveAttribute('title', '👑 1875–1885 • Россия')
    
    const secondReignBar = document.querySelector('#reign-bar-1-1')
    expect(secondReignBar).toHaveAttribute('aria-label', 'Период правления: 1890 - 1900')
    expect(secondReignBar).toHaveAttribute('title', '👑 1890–1900')
  })

  it('should return null when person has no reign data', () => {
    const personWithoutReign = {
      ...mockPerson,
      reignStart: undefined,
      reignEnd: undefined,
      rulerPeriods: undefined,
    }
    
    const { container } = render(
      <PersonReignBars 
        {...defaultProps} 
        person={personWithoutReign}
      />
    )
    
    expect(container.firstChild).toBeNull()
  })

  it('should return null when rulerPeriods is empty array', () => {
    const personWithEmptyRulerPeriods = {
      ...mockPerson,
      rulerPeriods: [],
      reignStart: undefined,
      reignEnd: undefined,
    }
    
    const { container } = render(
      <PersonReignBars 
        {...defaultProps} 
        person={personWithEmptyRulerPeriods}
      />
    )
    
    expect(container.firstChild).toBeNull()
  })

  it.skip('should apply correct styles to reign bar', () => {
    render(<PersonReignBars {...defaultProps} />)
    
    const reignBar = document.querySelector('#reign-bar-1') as HTMLElement
    expect(reignBar.style.position).toBe('absolute')
    expect(reignBar.style.backgroundColor).toBe('rgba(211, 47, 47, 0.25)')
    // Цвет может быть в формате rgb() или hex
    expect(reignBar.style.borderLeft).toMatch(/2px solid (rgb\(211, 47, 47\)|#D32F2F)/)
    expect(reignBar.style.borderRight).toMatch(/2px solid (rgb\(211, 47, 47\)|#D32F2F)/)
  })
})




