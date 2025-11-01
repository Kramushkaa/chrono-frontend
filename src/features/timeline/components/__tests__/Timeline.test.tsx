import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { Timeline } from '../Timeline'
import { Person } from 'shared/types'

// Mock hooks
vi.mock('shared/hooks/useMobile', () => ({
  useMobile: () => false,
}))

// Mock overlay components
vi.mock('../overlays/TimelineBackgroundOverlay', () => ({
  TimelineBackgroundOverlay: () => <div data-testid="timeline-background" />,
}))

vi.mock('../overlays/ViewportCenturyLabelsOverlay', () => ({
  ViewportCenturyLabelsOverlay: () => <div data-testid="century-labels" />,
}))

vi.mock('../overlays/CategoryDividersOverlay', () => ({
  CategoryDividersOverlay: () => <div data-testid="category-dividers" />,
}))

vi.mock('../overlays/CenturyGridLinesOverlay', () => ({
  CenturyGridLinesOverlay: () => <div data-testid="grid-lines" />,
}))

vi.mock('../rows/PersonYearLabels', () => ({
  PersonYearLabels: () => <div data-testid="person-year-labels" />,
}))

vi.mock('../rows/PersonReignBars', () => ({
  PersonReignBars: () => <div data-testid="person-reign-bars" />,
}))

vi.mock('../rows/PersonLifeBar', () => ({
  PersonLifeBar: () => <div data-testid="person-life-bar" />,
}))

vi.mock('../rows/PersonAchievementMarkers', () => ({
  PersonAchievementMarkers: () => <div data-testid="achievement-markers" />,
}))

describe('Timeline', () => {
  const mockPerson: Person = {
    id: '1',
    name: 'Test Person',
    birthYear: 1800,
    deathYear: 1900,
    country: ['Russia'],
    category: 'Politics',
    achievements: ['Achievement 1'],
    status: 'approved',
  }

  const defaultProps = {
    isLoading: false,
    timelineWidth: 1000,
    totalHeight: 800,
    centuryBoundaries: [1800, 1900],
    minYear: 1800,
    pixelsPerYear: 5,
    LEFT_PADDING_PX: 100,
    rowPlacement: [[mockPerson]],
    filters: {
      showAchievements: true,
      hideEmptyCenturies: false,
    },
    groupingType: 'category' as const,
    categoryDividers: [{ category: 'Politics', top: 100 }],
    getGroupColor: vi.fn(() => '#ff0000'),
    getGroupColorDark: vi.fn(() => '#cc0000'),
    getGroupColorMuted: vi.fn(() => '#ffcccc'),
    getPersonGroup: vi.fn(() => 'Politics'),
    hoveredPerson: null,
    setHoveredPerson: vi.fn(),
    mousePosition: { x: 100, y: 200 },
    setMousePosition: vi.fn(),
    showTooltip: false,
    setShowTooltip: vi.fn(),
    handlePersonHover: vi.fn(),
    activeAchievementMarker: null,
    setActiveAchievementMarker: vi.fn(),
    hoveredAchievement: null,
    setHoveredAchievement: vi.fn(),
    showAchievementTooltip: false,
    setShowAchievementTooltip: vi.fn(),
    hoverTimerRef: { current: null },
    handleAchievementHover: vi.fn(),
    sortedData: [mockPerson],
    selectedPerson: null,
    setSelectedPerson: vi.fn(),
    timelineRef: React.createRef<HTMLDivElement>(),
    isDragging: false,
    isDraggingTimeline: false,
    handleMouseDown: vi.fn(),
    handleMouseMove: vi.fn(),
    handleMouseUp: vi.fn(),
    handleTouchStart: vi.fn(),
    handleTouchMove: vi.fn(),
    handleTouchEnd: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render timeline container', () => {
    render(<Timeline {...defaultProps} />)
    
    // Check that the main timeline container is rendered - use getElementById since role might be hidden
    const timelineContainer = document.getElementById('person-timeline')
    expect(timelineContainer).toBeInTheDocument()
    expect(timelineContainer).toHaveAttribute('role', 'list')
    expect(timelineContainer).toHaveAttribute('aria-label', 'Временные линии исторических личностей')
  })

  it('should render timeline overlays', () => {
    render(<Timeline {...defaultProps} />)
    
    expect(screen.getByTestId('timeline-background')).toBeInTheDocument()
    expect(screen.getByTestId('century-labels')).toBeInTheDocument()
    expect(screen.getByTestId('category-dividers')).toBeInTheDocument()
    expect(screen.getByTestId('grid-lines')).toBeInTheDocument()
  })

  it('should render person components', () => {
    render(<Timeline {...defaultProps} />)
    
    expect(screen.getByTestId('person-year-labels')).toBeInTheDocument()
    expect(screen.getByTestId('person-reign-bars')).toBeInTheDocument()
    expect(screen.getByTestId('person-life-bar')).toBeInTheDocument()
  })

  it('should render achievement markers when enabled', () => {
    render(<Timeline {...defaultProps} />)
    
    expect(screen.getByTestId('achievement-markers')).toBeInTheDocument()
  })

  it('should handle mouse events', () => {
    render(<Timeline {...defaultProps} />)
    
    const timelineContainer = document.getElementById('person-timeline')
    expect(timelineContainer).toBeInTheDocument()
    
    fireEvent.mouseDown(timelineContainer!)
    expect(defaultProps.handleMouseDown).toHaveBeenCalled()
    
    fireEvent.mouseMove(timelineContainer!)
    expect(defaultProps.handleMouseMove).toHaveBeenCalled()
    
    fireEvent.mouseUp(timelineContainer!)
    expect(defaultProps.handleMouseUp).toHaveBeenCalled()
  })

  it('should handle touch events', () => {
    render(<Timeline {...defaultProps} />)
    
    const timelineContainer = document.getElementById('person-timeline')
    expect(timelineContainer).toBeInTheDocument()
    
    fireEvent.touchStart(timelineContainer!)
    expect(defaultProps.handleTouchStart).toHaveBeenCalled()
    
    fireEvent.touchMove(timelineContainer!)
    expect(defaultProps.handleTouchMove).toHaveBeenCalled()
    
    fireEvent.touchEnd(timelineContainer!)
    expect(defaultProps.handleTouchEnd).toHaveBeenCalled()
  })

  it('should handle loading state', () => {
    render(<Timeline {...defaultProps} isLoading={true} />)
    
    // Component should still render in loading state
    const timelineContainer = document.getElementById('person-timeline')
    expect(timelineContainer).toBeInTheDocument()
  })

  it('should handle different grouping types', () => {
    const { rerender } = render(
      <Timeline {...defaultProps} groupingType="country" />
    )
    let timelineContainer = document.getElementById('person-timeline')
    expect(timelineContainer).toBeInTheDocument()
    
    rerender(<Timeline {...defaultProps} groupingType="none" />)
    timelineContainer = document.getElementById('person-timeline')
    expect(timelineContainer).toBeInTheDocument()
  })

  it('should handle empty row placement', () => {
    render(<Timeline {...defaultProps} rowPlacement={[]} />)
    
    // Should still render without crashing
    const timelineContainer = document.getElementById('person-timeline')
    expect(timelineContainer).toBeInTheDocument()
  })

  it('should handle filters changes', () => {
    const { rerender } = render(
      <Timeline 
        {...defaultProps} 
        filters={{ showAchievements: false, hideEmptyCenturies: true }} 
      />
    )
    
    let timelineContainer = document.getElementById('person-timeline')
    expect(timelineContainer).toBeInTheDocument()
    
    rerender(
      <Timeline 
        {...defaultProps} 
        filters={{ showAchievements: true, hideEmptyCenturies: false }} 
      />
    )
    
    timelineContainer = document.getElementById('person-timeline')
    expect(timelineContainer).toBeInTheDocument()
  })
})




