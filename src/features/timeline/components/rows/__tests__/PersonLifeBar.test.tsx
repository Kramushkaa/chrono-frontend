import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import { PersonLifeBar } from '../PersonLifeBar'
import { Person } from 'shared/types'

const mockGetAdjustedPosition = vi.fn((year: number) => year * 10)
const mockGetAdjustedWidth = vi.fn((startYear: number, endYear: number) => (endYear - startYear) * 10)
const mockGetGroupColorMuted = vi.fn(() => '#8B7355')
const mockGetPersonGroup = vi.fn(() => 'Правители')
const mockHandlePersonHover = vi.fn()
const mockScheduleMousePosition = vi.fn()
const mockSetSelectedPerson = vi.fn()
const mockSetHoveredPerson = vi.fn()
const mockSetShowTooltip = vi.fn()
const mockSetShowAchievementTooltip = vi.fn()
const mockSetHoveredAchievement = vi.fn()
const mockSetActiveAchievementMarker = vi.fn()

const mockPerson: Person = {
  id: '1',
  name: 'Тест Личность',
  birthYear: 1850,
  deathYear: 1920,
  category: 'Правители',
  country: 'Россия',
}

describe('PersonLifeBar', () => {
  const defaultProps = {
    person: mockPerson,
    isMobile: false,
    selectedPerson: null,
    hoveredPerson: null,
    isDragging: false,
    isDraggingTimeline: false,
    hoveredAchievement: null,
    getAdjustedPosition: mockGetAdjustedPosition,
    getAdjustedWidth: mockGetAdjustedWidth,
    getGroupColorMuted: mockGetGroupColorMuted,
    getPersonGroup: mockGetPersonGroup,
    handlePersonHover: mockHandlePersonHover,
    scheduleMousePosition: mockScheduleMousePosition,
    setSelectedPerson: mockSetSelectedPerson,
    setHoveredPerson: mockSetHoveredPerson,
    setShowTooltip: mockSetShowTooltip,
    setShowAchievementTooltip: mockSetShowAchievementTooltip,
    setHoveredAchievement: mockSetHoveredAchievement,
    setActiveAchievementMarker: mockSetActiveAchievementMarker,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render without crashing', () => {
    render(<PersonLifeBar {...defaultProps} />)
    
    const lifeBar = document.querySelector('#life-bar-1')
    expect(lifeBar).toBeInTheDocument()
    expect(lifeBar).toHaveClass('life-bar')
  })

  it('should render person name', () => {
    render(<PersonLifeBar {...defaultProps} />)
    
    const lifeBar = document.querySelector('#life-bar-1')
    expect(lifeBar).toHaveTextContent('Тест Личность')
  })

  it('should have correct accessibility attributes', () => {
    render(<PersonLifeBar {...defaultProps} />)
    
    const lifeBar = document.querySelector('#life-bar-1')
    expect(lifeBar).toHaveAttribute('role', 'button')
    expect(lifeBar).toHaveAttribute('tabIndex', '0')
    expect(lifeBar).toHaveAttribute('aria-label', 'Тест Личность, 1850 - 1920, Правители')
  })

  it('should call position and width calculation functions', () => {
    render(<PersonLifeBar {...defaultProps} />)
    
    expect(mockGetAdjustedPosition).toHaveBeenCalledWith(1850)
    expect(mockGetAdjustedWidth).toHaveBeenCalledWith(1850, 1920)
    expect(mockGetGroupColorMuted).toHaveBeenCalledWith('Правители')
    expect(mockGetPersonGroup).toHaveBeenCalledWith(mockPerson)
  })

  it('should apply selected styling when person is selected', () => {
    render(
      <PersonLifeBar 
        {...defaultProps} 
        selectedPerson={mockPerson}
      />
    )
    
    const lifeBar = document.querySelector('#life-bar-1') as HTMLElement
    expect(lifeBar.style.opacity).toBe('0.8')
    expect(lifeBar.style.transform).toBe('scale(1.05)')
  })

  it('should handle mouse enter events on desktop', () => {
    render(<PersonLifeBar {...defaultProps} />)
    
    const lifeBar = document.querySelector('#life-bar-1') as HTMLElement
    
    fireEvent.mouseEnter(lifeBar)
    
    expect(mockHandlePersonHover).toHaveBeenCalledWith(mockPerson, expect.any(Number), expect.any(Number))
  })

  it('should handle click events', () => {
    render(<PersonLifeBar {...defaultProps} />)
    
    const lifeBar = document.querySelector('#life-bar-1')
    
    fireEvent.click(lifeBar!)
    
    expect(mockSetSelectedPerson).toHaveBeenCalledWith(mockPerson)
  })

  it('should not handle click when dragging', () => {
    render(<PersonLifeBar {...defaultProps} isDragging={true} />)
    
    const lifeBar = document.querySelector('#life-bar-1')
    
    fireEvent.click(lifeBar!)
    
    expect(mockSetSelectedPerson).not.toHaveBeenCalled()
  })

  it('should not handle click when dragging timeline', () => {
    render(<PersonLifeBar {...defaultProps} isDraggingTimeline={true} />)
    
    const lifeBar = document.querySelector('#life-bar-1')
    
    fireEvent.click(lifeBar!)
    
    expect(mockSetSelectedPerson).not.toHaveBeenCalled()
  })

  it('should handle keyboard events', () => {
    // На desktop keyboard события должны показывать tooltip, а не выбирать личность
    render(<PersonLifeBar {...defaultProps} isMobile={false} />)
    
    const lifeBar = document.querySelector('#life-bar-1')
    
    fireEvent.keyDown(lifeBar!, { key: 'Enter' })
    expect(mockSetHoveredPerson).toHaveBeenCalledWith(mockPerson)
    expect(mockSetShowTooltip).toHaveBeenCalledWith(true)
    
    vi.clearAllMocks()
    
    fireEvent.keyDown(lifeBar!, { key: ' ' })
    expect(mockSetHoveredPerson).toHaveBeenCalledWith(mockPerson)
    expect(mockSetShowTooltip).toHaveBeenCalledWith(true)
  })

  it('should handle keyboard events differently on mobile', () => {
    render(<PersonLifeBar {...defaultProps} isMobile={true} />)
    
    const lifeBar = document.querySelector('#life-bar-1')
    
    fireEvent.keyDown(lifeBar!, { key: 'Enter' })
    expect(mockSetSelectedPerson).toHaveBeenCalledWith(mockPerson)
    expect(mockSetHoveredPerson).not.toHaveBeenCalled()
  })

  it('should handle keyboard events on desktop with tooltip', () => {
    render(<PersonLifeBar {...defaultProps} isMobile={false} />)
    
    const lifeBar = document.querySelector('#life-bar-1')
    
    fireEvent.keyDown(lifeBar!, { key: 'Enter' })
    expect(mockSetHoveredPerson).toHaveBeenCalledWith(mockPerson)
    expect(mockSetShowTooltip).toHaveBeenCalledWith(true)
  })

  it('should handle touch events on mobile', () => {
    const hoveredAchievement = {
      person: mockPerson,
      year: 1900,
      index: 0,
    }
    
    render(
      <PersonLifeBar 
        {...defaultProps} 
        isMobile={true}
        hoveredAchievement={hoveredAchievement}
      />
    )
    
    const lifeBar = document.querySelector('#life-bar-1')
    
    fireEvent.touchStart(lifeBar!)
    
    expect(mockSetShowAchievementTooltip).toHaveBeenCalledWith(false)
    expect(mockSetHoveredAchievement).toHaveBeenCalledWith(null)
    expect(mockSetActiveAchievementMarker).toHaveBeenCalledWith(null)
  })

  it('should handle mouse leave events', () => {
    render(<PersonLifeBar {...defaultProps} />)
    
    const lifeBar = document.querySelector('#life-bar-1') as HTMLElement
    
    fireEvent.mouseLeave(lifeBar)
    
    expect(mockHandlePersonHover).toHaveBeenCalledWith(null, 0, 0)
  })

  it('should handle mouse move when hovered', () => {
    render(
      <PersonLifeBar 
        {...defaultProps} 
        hoveredPerson={mockPerson}
      />
    )
    
    const lifeBar = document.querySelector('#life-bar-1')
    
    fireEvent.mouseMove(lifeBar!)
    
    expect(mockScheduleMousePosition).toHaveBeenCalledWith(expect.any(Number), expect.any(Number))
  })

  it('should handle person without death year', () => {
    const personWithoutDeathYear = {
      ...mockPerson,
      deathYear: null,
    }
    
    render(<PersonLifeBar {...defaultProps} person={personWithoutDeathYear} />)
    
    // Should still call getAdjustedWidth with current year
    expect(mockGetAdjustedWidth).toHaveBeenCalledWith(1850, expect.any(Number))
  })
})




