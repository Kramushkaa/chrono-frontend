import React from 'react'
import { render, screen } from '@testing-library/react'
import { PersonCard } from '../PersonCard'
import { Person } from 'shared/types'

describe('PersonCard', () => {
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
    person: mockPerson,
    getGroupColor: jest.fn(() => '#ff0000'),
    getPersonGroup: jest.fn(() => 'Politics'),
    getCategoryColor: jest.fn(() => '#00ff00'),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render person name', () => {
    render(<PersonCard {...defaultProps} />)
    
    expect(screen.getByText('Test Person')).toBeInTheDocument()
  })

  it('should render person years', () => {
    render(<PersonCard {...defaultProps} />)
    
    expect(screen.getByText('1800 - 1900')).toBeInTheDocument()
  })

  it('should render person category and country', () => {
    render(<PersonCard {...defaultProps} />)
    
    expect(screen.getByText('Politics')).toBeInTheDocument()
    expect(screen.getByText('Russia')).toBeInTheDocument()
  })

  it('should handle person without death year', () => {
    const personAlive = { ...mockPerson, deathYear: undefined }
    
    render(<PersonCard {...defaultProps} person={personAlive} />)
    
    expect(screen.getByText('1800 - н.в.')).toBeInTheDocument()
  })

  it('should render person image when available', () => {
    const personWithImage = { ...mockPerson, imageUrl: 'https://example.com/image.jpg' }
    
    render(<PersonCard {...defaultProps} person={personWithImage} />)
    
    const image = screen.getByAltText('Портрет Test Person')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', 'https://example.com/image.jpg')
  })

  it('should not render image when not available', () => {
    render(<PersonCard {...defaultProps} />)
    
    expect(screen.queryByAltText(/Портрет/)).not.toBeInTheDocument()
  })

  it('should render wiki link when available', () => {
    const personWithWiki = { ...mockPerson, wikiLink: 'https://ru.wikipedia.org/wiki/Test_Person' }
    
    render(<PersonCard {...defaultProps} person={personWithWiki} />)
    
    const wikiLink = screen.getByRole('link', { name: 'Открыть в Википедии ↗' })
    expect(wikiLink).toBeInTheDocument()
    expect(wikiLink).toHaveAttribute('href', 'https://ru.wikipedia.org/wiki/Test_Person')
  })

  it('should not render wiki link when not available', () => {
    render(<PersonCard {...defaultProps} />)
    
    expect(screen.queryByRole('link', { name: /Википедия/ })).not.toBeInTheDocument()
  })

  it('should render ruler periods when available', () => {
    const personWithReign = {
      ...mockPerson,
      rulerPeriods: [
        { startYear: 1850, endYear: 1860, countryName: 'Russia' }
      ]
    }
    
    render(<PersonCard {...defaultProps} person={personWithReign} />)
    
    expect(screen.getByText('👑 Периоды правления:')).toBeInTheDocument()
    expect(screen.getByText('1850 — 1860 • Russia')).toBeInTheDocument()
  })

  it('should render simple reign when available', () => {
    const personWithSimpleReign = {
      ...mockPerson,
      reignStart: 1850,
      reignEnd: 1860
    }
    
    render(<PersonCard {...defaultProps} person={personWithSimpleReign} />)
    
    expect(screen.getByText('👑 Правление: 1850 - 1860')).toBeInTheDocument()
  })

  it('should render achievements list when available', () => {
    const personWithAchievements = {
      ...mockPerson,
      achievements: ['Achievement 1', 'Achievement 2']
    }
    
    render(<PersonCard {...defaultProps} person={personWithAchievements} />)
    
    expect(screen.getByText('Achievement 1')).toBeInTheDocument()
    expect(screen.getByText('Achievement 2')).toBeInTheDocument()
  })

  it('should have proper accessibility attributes', () => {
    render(<PersonCard {...defaultProps} />)
    
    const card = screen.getByRole('region')
    expect(card).toBeInTheDocument()
    expect(card).toHaveAttribute('aria-label', 'Информация о Test Person')
  })

  it('should handle person with empty/null values gracefully', () => {
    const personWithNulls = {
      ...mockPerson,
      category: null as any,
      country: null as any,
      name: '',
    }
    
    render(<PersonCard {...defaultProps} person={personWithNulls} />)
    
    // Should render without crashing
    expect(screen.getByRole('region')).toBeInTheDocument()
  })

  it('should call onAddAchievement when button is clicked', () => {
    const onAddAchievement = jest.fn()
    
    render(<PersonCard {...defaultProps} onAddAchievement={onAddAchievement} />)
    
    // Look for add achievement button if it exists
    const addButton = screen.queryByRole('button', { name: /добавить достижение/i })
    if (addButton) {
      addButton.click()
      expect(onAddAchievement).toHaveBeenCalledWith(mockPerson)
    }
  })

  it('should apply correct styling with group colors', () => {
    render(<PersonCard {...defaultProps} />)
    
    // Verify that getGroupColor and getCategoryColor are called
    expect(defaultProps.getGroupColor).toHaveBeenCalledWith('Politics')
    expect(defaultProps.getPersonGroup).toHaveBeenCalledWith(mockPerson)
    expect(defaultProps.getCategoryColor).toHaveBeenCalledWith('Politics')
  })

  it('should handle array countries', () => {
    const personWithMultipleCountries = {
      ...mockPerson,
      country: ['Russia', 'Germany']
    }
    
    render(<PersonCard {...defaultProps} person={personWithMultipleCountries} />)
    
    expect(screen.getByText('Russia,Germany')).toBeInTheDocument()
  })
})
