import React from 'react'
import { render } from '@testing-library/react'
import { PersonYearLabels } from '../PersonYearLabels'
import { Person } from 'shared/types'

const mockGetAdjustedPosition = jest.fn((year: number) => year * 10)

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

describe('PersonYearLabels', () => {
  const defaultProps = {
    person: mockPerson,
    getAdjustedPosition: mockGetAdjustedPosition,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render without crashing', () => {
    render(<PersonYearLabels {...defaultProps} />)
    
    expect(document.querySelector('#birth-year-1')).toBeInTheDocument()
    expect(document.querySelector('#death-year-1')).toBeInTheDocument()
  })

  it('should render birth year label', () => {
    render(<PersonYearLabels {...defaultProps} />)
    
    const birthYearLabel = document.querySelector('#birth-year-1')
    expect(birthYearLabel).toBeInTheDocument()
    expect(birthYearLabel).toHaveTextContent('1850')
    expect(birthYearLabel).toHaveAttribute('aria-label', 'Год рождения: 1850')
  })

  it('should render death year label', () => {
    render(<PersonYearLabels {...defaultProps} />)
    
    const deathYearLabel = document.querySelector('#death-year-1')
    expect(deathYearLabel).toBeInTheDocument()
    expect(deathYearLabel).toHaveTextContent('1920')
    expect(deathYearLabel).toHaveAttribute('aria-label', 'Год смерти: 1920')
  })

  it('should render reign start label when person has reignStart', () => {
    render(<PersonYearLabels {...defaultProps} />)
    
    const reignStartLabel = document.querySelector('#reign-start-1')
    expect(reignStartLabel).toBeInTheDocument()
    expect(reignStartLabel).toHaveTextContent('👑 1880')
    expect(reignStartLabel).toHaveAttribute('aria-label', 'Начало правления: 1880')
  })

  it('should render reign end label when person has reignEnd', () => {
    render(<PersonYearLabels {...defaultProps} />)
    
    const reignEndLabel = document.querySelector('#reign-end-1')
    expect(reignEndLabel).toBeInTheDocument()
    expect(reignEndLabel).toHaveTextContent('1910')
    expect(reignEndLabel).toHaveAttribute('aria-label', 'Конец правления: 1910')
  })

  it('should not render reign labels when person has no reign dates', () => {
    const personWithoutReign = {
      ...mockPerson,
      reignStart: undefined,
      reignEnd: undefined,
    }
    
    render(
      <PersonYearLabels 
        {...defaultProps} 
        person={personWithoutReign}
      />
    )
    
    expect(document.querySelector('#reign-start-1')).not.toBeInTheDocument()
    expect(document.querySelector('#reign-end-1')).not.toBeInTheDocument()
  })

  it('should call getAdjustedPosition for all year positions', () => {
    render(<PersonYearLabels {...defaultProps} />)
    
    expect(mockGetAdjustedPosition).toHaveBeenCalledWith(1850) // birthYear
    expect(mockGetAdjustedPosition).toHaveBeenCalledWith(1920) // deathYear
    expect(mockGetAdjustedPosition).toHaveBeenCalledWith(1880) // reignStart
    expect(mockGetAdjustedPosition).toHaveBeenCalledWith(1910) // reignEnd
  })

  it('should handle person without death year', () => {
    const personWithoutDeathYear = {
      ...mockPerson,
      deathYear: null,
    }
    
    render(
      <PersonYearLabels 
        {...defaultProps} 
        person={personWithoutDeathYear}
      />
    )
    
    const deathYearLabel = document.querySelector('#death-year-1')
    expect(deathYearLabel).toBeInTheDocument()
    // Should use current year when deathYear is null
    expect(mockGetAdjustedPosition).toHaveBeenCalledWith(expect.any(Number))
  })

  it('should apply correct styles to labels', () => {
    render(<PersonYearLabels {...defaultProps} />)
    
    const birthYearLabel = document.querySelector('#birth-year-1') as HTMLElement
    const deathYearLabel = document.querySelector('#death-year-1') as HTMLElement
    const reignStartLabel = document.querySelector('#reign-start-1') as HTMLElement
    
    expect(birthYearLabel.style.position).toBe('absolute')
    expect(birthYearLabel.style.fontSize).toBe('11px')
    
    expect(deathYearLabel.style.position).toBe('absolute')
    expect(deathYearLabel.style.fontSize).toBe('11px')
    
    expect(reignStartLabel.style.color).toBe('#E57373')
    expect(reignStartLabel.style.fontWeight).toBe('bold')
  })
})
