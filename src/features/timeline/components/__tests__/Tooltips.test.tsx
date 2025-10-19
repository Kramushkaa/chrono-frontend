import React from 'react'
import { render, screen } from '@testing-library/react'
import { Tooltips } from '../Tooltips'
import { Person } from 'shared/types'

// Mock useMobile hook
jest.mock('shared/hooks/useMobile', () => ({
  useMobile: jest.fn(() => false),
}))

import { useMobile } from 'shared/hooks/useMobile'
const mockUseMobile = useMobile as jest.MockedFunction<typeof useMobile>

describe('Tooltips', () => {
  const mockPerson: Person = {
    id: '1',
    name: 'Test Person',
    birthYear: 1800,
    deathYear: 1900,
    country: 'Russia',
    category: 'Politics',
    achievements: ['Achievement 1'],
    status: 'approved',
    description: null,
  }

  const defaultProps = {
    hoveredPerson: null,
    showTooltip: false,
    mousePosition: { x: 100, y: 200 },
    hoveredAchievement: null,
    showAchievementTooltip: false,
    getGroupColor: jest.fn(() => '#ff0000'),
    getPersonGroup: jest.fn(() => 'Politics'),
    getCategoryColor: jest.fn(() => '#00ff00'),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseMobile.mockReturnValue(false) // Reset to default
  })

  it('should render nothing when no tooltips are active', () => {
    render(<Tooltips {...defaultProps} />)
    
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('should render person tooltip when person is hovered', () => {
    render(
      <Tooltips 
        {...defaultProps} 
        hoveredPerson={mockPerson}
        showTooltip={true}
      />
    )
    
    expect(screen.getByRole('tooltip')).toBeInTheDocument()
    expect(screen.getByText('Test Person')).toBeInTheDocument()
  })

  it('should render achievement tooltip when achievement is hovered', () => {
    const hoveredAchievement = {
      person: mockPerson,
      year: 1850,
      index: 0,
    }

    render(
      <Tooltips 
        {...defaultProps} 
        hoveredAchievement={hoveredAchievement}
        showAchievementTooltip={true}
      />
    )
    
    const tooltip = screen.getByRole('tooltip')
    expect(tooltip).toBeInTheDocument()
    expect(tooltip).toHaveAttribute('aria-label', 'Достижение Test Person в 1850 году')
  })

  it('should handle mobile layout', () => {
    // Mock mobile view
    mockUseMobile.mockReturnValue(true)
    
    const hoveredAchievement = {
      person: mockPerson,
      year: 1850,
      index: 0,
    }

    render(
      <Tooltips 
        {...defaultProps} 
        hoveredAchievement={hoveredAchievement}
        showAchievementTooltip={true}
      />
    )
    
    const tooltip = screen.getByRole('tooltip')
    expect(tooltip).toBeInTheDocument()
  })

  it('should show person details in tooltip', () => {
    const personWithDetails = {
      ...mockPerson,
      category: 'Science',
      country: 'Germany',
    }

    render(
      <Tooltips 
        {...defaultProps} 
        hoveredPerson={personWithDetails}
        showTooltip={true}
      />
    )
    
    expect(screen.getByText('Test Person')).toBeInTheDocument()
    expect(screen.getByText('Science')).toBeInTheDocument()
    expect(screen.getByText(/Germany/)).toBeInTheDocument()
    expect(screen.getByText('1800 - 1900')).toBeInTheDocument()
  })

  it('should handle person without image', () => {
    const personWithoutImage = {
      ...mockPerson,
      imageUrl: undefined,
    }

    render(
      <Tooltips 
        {...defaultProps} 
        hoveredPerson={personWithoutImage}
        showTooltip={true}
      />
    )
    
    expect(screen.getByText('Test Person')).toBeInTheDocument()
    // Should render without image
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('should handle person with image', () => {
    const personWithImage = {
      ...mockPerson,
      imageUrl: 'https://example.com/image.jpg',
    }

    render(
      <Tooltips 
        {...defaultProps} 
        hoveredPerson={personWithImage}
        showTooltip={true}
      />
    )
    
    expect(screen.getByText('Test Person')).toBeInTheDocument()
    expect(screen.getByRole('img')).toBeInTheDocument()
    expect(screen.getByRole('img')).toHaveAttribute('src', 'https://example.com/image.jpg')
  })

  it('should handle achievement tooltip with person info', () => {
    const personWithImage = {
      ...mockPerson,
      imageUrl: 'https://example.com/image.jpg',
    }

    const hoveredAchievement = {
      person: personWithImage,
      year: 1850,
      index: 0,
    }

    render(
      <Tooltips 
        {...defaultProps} 
        hoveredAchievement={hoveredAchievement}
        showAchievementTooltip={true}
      />
    )
    
    const tooltip = screen.getByRole('tooltip')
    expect(tooltip).toBeInTheDocument()
    expect(screen.getByText('Test Person')).toBeInTheDocument()
    // The year is rendered with an emoji prefix: "🎯 1850"
    expect(screen.getByText(/1850/)).toBeInTheDocument()
  })

  it('should apply correct styling for desktop', () => {
    render(
      <Tooltips 
        {...defaultProps} 
        hoveredPerson={mockPerson}
        showTooltip={true}
      />
    )
    
    const tooltip = screen.getByRole('tooltip')
    expect(tooltip).toHaveStyle({
      position: 'fixed',
      left: '115px', // mousePosition.x + 15
      top: '190px',  // mousePosition.y - 10
    })
  })

  it('should handle null hoveredPerson gracefully', () => {
    render(
      <Tooltips 
        {...defaultProps} 
        hoveredPerson={null}
        showTooltip={true}
      />
    )
    
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('should handle null hoveredAchievement gracefully', () => {
    render(
      <Tooltips 
        {...defaultProps} 
        hoveredAchievement={null}
        showAchievementTooltip={true}
      />
    )
    
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })
})
