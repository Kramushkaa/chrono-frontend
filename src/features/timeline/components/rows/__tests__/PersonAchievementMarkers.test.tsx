import React from 'react'
import { render } from '@testing-library/react'
import { PersonAchievementMarkers } from '../PersonAchievementMarkers'
import { Person } from 'shared/types'

const mockGetAdjustedPosition = jest.fn((year: number) => year * 10)
const mockGetGroupColor = jest.fn(() => '#8B7355')
const mockGetGroupColorDark = jest.fn(() => '#6B5A3A')
const mockGetPersonGroup = jest.fn(() => 'Правители')
const mockSetActiveAchievementMarker = jest.fn()
const mockSetHoveredAchievement = jest.fn()
const mockSetShowAchievementTooltip = jest.fn()
const mockHandlePersonHover = jest.fn()
const mockHandleAchievementHover = jest.fn()

const mockHoverTimerRef = { current: null }

const mockPerson: Person = {
  id: '1',
  name: 'Тест Персона',
  birthYear: 1850,
  deathYear: 1920,
  category: 'Правители',
  country: 'Россия',
  achievementYears: [1880, 1890, 1900],
}

describe('PersonAchievementMarkers', () => {
  const defaultProps = {
    person: mockPerson,
    isMobile: false,
    showAchievements: true,
    hoveredPerson: null,
    getAdjustedPosition: mockGetAdjustedPosition,
    getGroupColor: mockGetGroupColor,
    getGroupColorDark: mockGetGroupColorDark,
    getPersonGroup: mockGetPersonGroup,
    activeAchievementMarker: null,
    setActiveAchievementMarker: mockSetActiveAchievementMarker,
    hoveredAchievement: null,
    setHoveredAchievement: mockSetHoveredAchievement,
    setShowAchievementTooltip: mockSetShowAchievementTooltip,
    hoverTimerRef: mockHoverTimerRef,
    handlePersonHover: mockHandlePersonHover,
    handleAchievementHover: mockHandleAchievementHover,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render without crashing', () => {
    render(<PersonAchievementMarkers {...defaultProps} />)
    
    // Should render achievement markers for each year
    expect(document.querySelector('#achievement-1-0')).toBeInTheDocument()
    expect(document.querySelector('#achievement-1-1')).toBeInTheDocument()
    expect(document.querySelector('#achievement-1-2')).toBeInTheDocument()
  })

  it('should return null when showAchievements is false', () => {
    const { container } = render(
      <PersonAchievementMarkers 
        {...defaultProps} 
        showAchievements={false}
      />
    )
    
    expect(container.firstChild).toBeNull()
  })

  it('should return null when person has no achievement years', () => {
    const personWithoutAchievements = {
      ...mockPerson,
      achievementYears: [],
    }
    
    const { container } = render(
      <PersonAchievementMarkers 
        {...defaultProps} 
        person={personWithoutAchievements}
      />
    )
    
    expect(container.firstChild).toBeNull()
  })

  it('should return null when person has undefined achievement years', () => {
    const personWithoutAchievements = {
      ...mockPerson,
      achievementYears: undefined,
    }
    
    const { container } = render(
      <PersonAchievementMarkers 
        {...defaultProps} 
        person={personWithoutAchievements}
      />
    )
    
    expect(container.firstChild).toBeNull()
  })

  it('should render achievement markers with correct attributes', () => {
    render(<PersonAchievementMarkers {...defaultProps} />)
    
    const firstMarker = document.querySelector('#achievement-1-0')
    expect(firstMarker).toBeInTheDocument()
    expect(firstMarker).toHaveClass('achievement-marker')
    expect(firstMarker).toHaveAttribute('role', 'button')
    expect(firstMarker).toHaveAttribute('tabIndex', '0')
    expect(firstMarker).toHaveAttribute('aria-label', 'Достижение 1 в 1880 году')
  })

  it('should call getAdjustedPosition for each achievement year', () => {
    render(<PersonAchievementMarkers {...defaultProps} />)
    
    expect(mockGetAdjustedPosition).toHaveBeenCalledWith(1880)
    expect(mockGetAdjustedPosition).toHaveBeenCalledWith(1890)
    expect(mockGetAdjustedPosition).toHaveBeenCalledWith(1900)
  })

  it('should filter out null and undefined achievement years', () => {
    const personWithMixedAchievements = {
      ...mockPerson,
      achievementYears: [1880, null, 1900, undefined, 1920],
    }
    
    render(
      <PersonAchievementMarkers 
        {...defaultProps} 
        person={personWithMixedAchievements}
      />
    )
    
    // Should only render markers for valid years
    expect(document.querySelector('#achievement-1-0')).toBeInTheDocument() // 1880
    expect(document.querySelector('#achievement-1-1')).toBeInTheDocument() // 1900
    expect(document.querySelector('#achievement-1-2')).toBeInTheDocument() // 1920
    
    // Should not have markers for null/undefined positions
    expect(document.querySelector('#achievement-1-3')).not.toBeInTheDocument()
  })

  it('should handle active achievement marker', () => {
    const activeMarker = { personId: '1', index: 1 }
    
    render(
      <PersonAchievementMarkers 
        {...defaultProps} 
        activeAchievementMarker={activeMarker}
      />
    )
    
    const secondMarker = document.querySelector('#achievement-1-1') as HTMLElement
    expect(secondMarker.style.zIndex).toBe('12')
  })

  it('should apply correct styles to achievement markers', () => {
    render(<PersonAchievementMarkers {...defaultProps} />)
    
    const firstMarker = document.querySelector('#achievement-1-0') as HTMLElement
    expect(firstMarker.style.position).toBe('absolute')
    expect(firstMarker.style.width).toBe('2px')
    expect(firstMarker.style.height).toBe('15px')
    expect(firstMarker.style.cursor).toBe('pointer')
  })

  it('should render achievement year labels', () => {
    render(<PersonAchievementMarkers {...defaultProps} />)
    
    const markers = document.querySelectorAll('.achievement-marker')
    markers.forEach(marker => {
      const label = marker.querySelector('.achievement-year-label')
      expect(label).toBeInTheDocument()
    })
  })

  it('should handle person with different achievement years format', () => {
    const personWithNumberArray = {
      ...mockPerson,
      achievementYears: [1880, 1890, 1900] as number[],
    }
    
    render(
      <PersonAchievementMarkers 
        {...defaultProps} 
        person={personWithNumberArray}
      />
    )
    
    expect(document.querySelector('#achievement-1-0')).toBeInTheDocument()
    expect(document.querySelector('#achievement-1-1')).toBeInTheDocument()
    expect(document.querySelector('#achievement-1-2')).toBeInTheDocument()
  })
})
