import { render, screen, fireEvent } from '@testing-library/react'
import { PersonPanel } from '../PersonPanel'
import { Person } from 'shared/types'

// Mock dependencies
vi.mock('../hooks/usePersonAchievements', () => ({
  usePersonAchievements: () => ({
    achievementsWiki: ['http://wiki.com/achievement1', 'http://wiki.com/achievement2']
  })
}))

vi.mock('shared/ui/PersonStructuredData', () => ({
  PersonStructuredData: () => <div data-testid="person-structured-data" />
}))

vi.mock('shared/utils/formatters', () => ({
  formatYear: (year: number | null | undefined) => year ?? ''
}))

describe('PersonPanel', () => {
  const mockOnClose = vi.fn()
  const mockGetGroupColor = vi.fn((group: string) => '#FF0000')
  const mockGetPersonGroup = vi.fn(() => 'Правители')
  const mockGetCategoryColor = vi.fn(() => '#00FF00')
  const mockOpenAddForPerson = vi.fn()

  const basePerson: Person = {
    id: 'person-1',
    name: 'Test Person',
    birthYear: 1900,
    deathYear: 1980,
    category: 'Science',
    country: 'USA',
    description: 'Test description',
    categories: ['Science'],
    countries: ['USA'],
    reignPeriods: [],
    achievements: [],
  }

  const defaultProps = {
    selectedPerson: basePerson,
    onClose: mockOnClose,
    getGroupColor: mockGetGroupColor,
    getPersonGroup: mockGetPersonGroup,
    getCategoryColor: mockGetCategoryColor,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return null when no person is selected', () => {
    const { container } = render(
      <PersonPanel {...defaultProps} selectedPerson={null} />
    )

    expect(container.firstChild).toBeNull()
  })

  it('should render PersonStructuredData', () => {
    render(<PersonPanel {...defaultProps} />)

    expect(screen.getByTestId('person-structured-data')).toBeInTheDocument()
  })

  it('should render person name', () => {
    render(<PersonPanel {...defaultProps} />)

    expect(screen.getByText('Test Person')).toBeInTheDocument()
  })

  it('should render person years', () => {
    render(<PersonPanel {...defaultProps} />)

    expect(screen.getByText('1900 - 1980')).toBeInTheDocument()
  })

  it('should render category and country', () => {
    render(<PersonPanel {...defaultProps} />)

    expect(screen.getByText('Science')).toBeInTheDocument()
    expect(screen.getByText('USA')).toBeInTheDocument()
  })

  it('should render description', () => {
    render(<PersonPanel {...defaultProps} />)

    expect(screen.getByText('Test description')).toBeInTheDocument()
  })

  it('should call onClose when close button is clicked', () => {
    render(<PersonPanel {...defaultProps} />)

    const closeBtn = screen.getByLabelText('Закрыть панель')
    fireEvent.click(closeBtn)

    expect(mockOnClose).toHaveBeenCalled()
  })

  it('should call onClose when Escape key is pressed on close button', () => {
    render(<PersonPanel {...defaultProps} />)

    const closeBtn = screen.getByLabelText('Закрыть панель')
    fireEvent.keyDown(closeBtn, { key: 'Escape' })

    expect(mockOnClose).toHaveBeenCalled()
  })

  it('should not call onClose for other keys', () => {
    render(<PersonPanel {...defaultProps} />)

    const closeBtn = screen.getByLabelText('Закрыть панель')
    fireEvent.keyDown(closeBtn, { key: 'Enter' })

    expect(mockOnClose).not.toHaveBeenCalled()
  })

  it('should render image when imageUrl is provided', () => {
    const personWithImage = {
      ...basePerson,
      imageUrl: 'http://example.com/image.jpg'
    }

    render(<PersonPanel {...defaultProps} selectedPerson={personWithImage} />)

    const img = screen.getByAltText('Портрет Test Person')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', 'http://example.com/image.jpg')
  })

  it('should not render image when imageUrl is not provided', () => {
    render(<PersonPanel {...defaultProps} />)

    expect(screen.queryByAltText(/Портрет/)).not.toBeInTheDocument()
  })

  it('should hide image on error', () => {
    const personWithImage = {
      ...basePerson,
      imageUrl: 'http://example.com/broken.jpg'
    }

    render(<PersonPanel {...defaultProps} selectedPerson={personWithImage} />)

    const img = screen.getByAltText('Портрет Test Person') as HTMLImageElement
    
    // Trigger error event
    fireEvent.error(img)

    expect(img.style.display).toBe('none')
  })

  it('should render wiki link when provided', () => {
    const personWithWiki = {
      ...basePerson,
      wikiLink: 'http://en.wikipedia.org/wiki/Test_Person'
    }

    render(<PersonPanel {...defaultProps} selectedPerson={personWithWiki} />)

    const link = screen.getByText('Открыть в Википедии ↗')
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', 'http://en.wikipedia.org/wiki/Test_Person')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('should not render wiki link when not provided', () => {
    render(<PersonPanel {...defaultProps} />)

    expect(screen.queryByText(/Открыть в Википедии/)).not.toBeInTheDocument()
  })

  it('should render rulerPeriods when provided as array', () => {
    const personWithRulerPeriods = {
      ...basePerson,
      rulerPeriods: [
        { startYear: 1920, endYear: 1940, countryName: 'Country A' },
        { startYear: 1940, endYear: 1960, countryName: 'Country B' }
      ]
    }

    render(<PersonPanel {...defaultProps} selectedPerson={personWithRulerPeriods} />)

    expect(screen.getByText('👑 Периоды правления:')).toBeInTheDocument()
    expect(screen.getByText(/1920 — 1940.*Country A/)).toBeInTheDocument()
    expect(screen.getByText(/1940 — 1960.*Country B/)).toBeInTheDocument()
  })

  it('should render rulerPeriods without countryName', () => {
    const personWithRulerPeriods = {
      ...basePerson,
      rulerPeriods: [
        { startYear: 1920, endYear: 1940 }
      ]
    }

    render(<PersonPanel {...defaultProps} selectedPerson={personWithRulerPeriods} />)

    expect(screen.getByText('1920 — 1940')).toBeInTheDocument()
  })

  it('should render reignStart/reignEnd when rulerPeriods is empty', () => {
    const personWithReign = {
      ...basePerson,
      reignStart: 1920,
      reignEnd: 1950
    }

    render(<PersonPanel {...defaultProps} selectedPerson={personWithReign} />)

    expect(screen.getByText(/👑 Правление: 1920 - 1950/)).toBeInTheDocument()
  })

  it('should not render reign info when neither rulerPeriods nor reignStart/End exist', () => {
    render(<PersonPanel {...defaultProps} />)

    expect(screen.queryByText(/👑/)).not.toBeInTheDocument()
  })

  it('should prioritize rulerPeriods over reignStart/End', () => {
    const personWithBoth = {
      ...basePerson,
      rulerPeriods: [{ startYear: 1920, endYear: 1940 }],
      reignStart: 1930,
      reignEnd: 1950
    }

    render(<PersonPanel {...defaultProps} selectedPerson={personWithBoth} />)

    expect(screen.getByText('👑 Периоды правления:')).toBeInTheDocument()
    expect(screen.getByText('1920 — 1940')).toBeInTheDocument()
    expect(screen.queryByText('1930 - 1950')).not.toBeInTheDocument()
  })

  it('should render achievements when provided', () => {
    const personWithAchievements = {
      ...basePerson,
      achievements: ['Achievement 1', 'Achievement 2'],
      achievementYears: [1930, 1940]
    }

    render(<PersonPanel {...defaultProps} selectedPerson={personWithAchievements} />)

    expect(screen.getByText('🎯 Ключевые достижения:')).toBeInTheDocument()
    expect(screen.getByText('Achievement 1')).toBeInTheDocument()
    expect(screen.getByText('Achievement 2')).toBeInTheDocument()
    expect(screen.getByText('1930 г.')).toBeInTheDocument()
    expect(screen.getByText('1940 г.')).toBeInTheDocument()
  })

  it('should not render achievements section when empty', () => {
    render(<PersonPanel {...defaultProps} />)

    expect(screen.queryByText(/Ключевые достижения/)).not.toBeInTheDocument()
  })

  it('should render achievement wiki links when available', () => {
    const personWithAchievements = {
      ...basePerson,
      achievements: ['Achievement 1'],
      achievementYears: [1930],
      achievementsWiki: ['http://wiki.com/achievement1']
    }

    render(<PersonPanel {...defaultProps} selectedPerson={personWithAchievements} />)

    const wikiLinks = screen.getAllByText('↗')
    expect(wikiLinks.length).toBeGreaterThan(0)
  })

  it.skip('should use hook achievements wiki when not in person data', () => {
    const personWithAchievements = {
      ...basePerson,
      achievements: ['Achievement 1', 'Achievement 2'],
      achievementYears: [1930, 1940],
      achievementsWiki: undefined
      // No achievementsWiki in person data, should use hook data
    }

    render(<PersonPanel {...defaultProps} selectedPerson={personWithAchievements} />)

    // Verify achievements are rendered
    expect(screen.getByText('Achievement 1')).toBeInTheDocument()
    expect(screen.getByText('Achievement 2')).toBeInTheDocument()
    
    // Hook provides wiki links, check if any links are rendered
    const links = screen.queryAllByRole('link')
    // Should have wiki links from hook (mocked to return 2 links)
    expect(links.length).toBeGreaterThan(0)
  })

  it('should handle achievements without years', () => {
    const personWithAchievements = {
      ...basePerson,
      achievements: ['Achievement 1']
      // No achievementYears
    }

    render(<PersonPanel {...defaultProps} selectedPerson={personWithAchievements} />)

    expect(screen.getByText('Achievement 1')).toBeInTheDocument()
    expect(screen.getByText(/г\./)).toBeInTheDocument() // Year text with "г."
  })

  it('should render add to list button when openAddForPerson is provided', () => {
    render(<PersonPanel {...defaultProps} openAddForPerson={mockOpenAddForPerson} />)

    const addBtn = screen.getByTitle('Добавить в список')
    expect(addBtn).toBeInTheDocument()
  })

  it('should not render add to list button when openAddForPerson is not provided', () => {
    render(<PersonPanel {...defaultProps} />)

    expect(screen.queryByTitle('Добавить в список')).not.toBeInTheDocument()
  })

  it('should call openAddForPerson when add button is clicked', () => {
    render(<PersonPanel {...defaultProps} openAddForPerson={mockOpenAddForPerson} />)

    const addBtn = screen.getByTitle('Добавить в список')
    fireEvent.click(addBtn)

    expect(mockOpenAddForPerson).toHaveBeenCalledWith(basePerson)
  })

  it('should have proper dialog accessibility attributes', () => {
    render(<PersonPanel {...defaultProps} />)

    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-label', 'Информация о Test Person')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
  })

  it('should call getGroupColor and getPersonGroup for styling', () => {
    render(<PersonPanel {...defaultProps} />)

    expect(mockGetPersonGroup).toHaveBeenCalledWith(basePerson)
    expect(mockGetGroupColor).toHaveBeenCalled()
  })

  it('should call getCategoryColor for category styling', () => {
    render(<PersonPanel {...defaultProps} />)

    expect(mockGetCategoryColor).toHaveBeenCalledWith('Science')
  })
})

