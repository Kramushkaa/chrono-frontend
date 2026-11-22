import { render, screen, fireEvent } from '@testing-library/react'
import { PersonEditor } from '../PersonEditor'
import { Person } from 'shared/types'

// Mock dependencies
vi.mock('shared/ui/SearchableSelect', () => ({
  SearchableSelect: ({ placeholder, value, onChange }: any) => (
    <div data-testid="searchable-select">
      <input
        data-testid={`select-${placeholder}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  ),
}))

vi.mock('features/persons/components/LifePeriodsEditor', () => ({
  LifePeriodsEditor: ({ periods, onChange, options, minYear, maxYear, periodErrors }: any) => (
    <div data-testid="life-periods-editor">
      <div>Periods: {periods.length}</div>
      <div>Min: {minYear}, Max: {maxYear}</div>
      {periodErrors && periodErrors.length > 0 && (
        <div>Errors: {periodErrors.filter((e: string) => e).length}</div>
      )}
      <button onClick={() => onChange([])}>Clear Periods</button>
    </div>
  ),
}))

describe('PersonEditor', () => {
  const mockPerson: Person = {
    id: 'person-1',
    name: 'Test Person',
    birthYear: 1900,
    deathYear: 1980,
    category: 'Science',
    country: 'USA',
    imageUrl: 'http://example.com/image.jpg',
    wikiLink: 'http://en.wikipedia.org/wiki/Test_Person',
    description: 'Test description',
    categories: ['Science'],
    countries: ['USA'],
    reignPeriods: [],
    achievements: [],
  }

  const mockSetEditBirthYear = vi.fn()
  const mockSetEditDeathYear = vi.fn()
  const mockSetEditPersonCategory = vi.fn()
  const mockSetLifePeriods = vi.fn()

  const categoryOptions = [
    { value: 'Science', label: 'Наука' },
    { value: 'Art', label: 'Искусство' },
  ]

  const countryOptions = [
    { value: 'USA', label: 'США' },
    { value: 'Russia', label: 'Россия' },
  ]

  const defaultProps = {
    person: mockPerson,
    editBirthYear: 1900,
    setEditBirthYear: mockSetEditBirthYear,
    editDeathYear: 1980,
    setEditDeathYear: mockSetEditDeathYear,
    editPersonCategory: 'Science',
    setEditPersonCategory: mockSetEditPersonCategory,
    categorySelectOptions: categoryOptions,
    lifePeriods: [],
    setLifePeriods: mockSetLifePeriods,
    countrySelectOptions: countryOptions,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render all form fields', () => {
    render(<PersonEditor {...defaultProps} />)

    expect(screen.getByPlaceholderText('Имя')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Год рождения')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Год смерти')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('URL изображения')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Ссылка на Википедию')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Описание')).toBeInTheDocument()
  })

  it('should render name field with default value', () => {
    render(<PersonEditor {...defaultProps} />)

    const nameInput = screen.getByPlaceholderText('Имя') as HTMLInputElement
    expect(nameInput.value).toBe('Test Person')
  })

  it('should render birth year field with value', () => {
    render(<PersonEditor {...defaultProps} />)

    const birthYearInput = screen.getByPlaceholderText('Год рождения') as HTMLInputElement
    expect(birthYearInput.value).toBe('1900')
  })

  it('should render death year field with value', () => {
    render(<PersonEditor {...defaultProps} />)

    const deathYearInput = screen.getByPlaceholderText('Год смерти') as HTMLInputElement
    expect(deathYearInput.value).toBe('1980')
  })

  it('should call setEditBirthYear when birth year changes', () => {
    render(<PersonEditor {...defaultProps} />)

    const birthYearInput = screen.getByPlaceholderText('Год рождения')
    fireEvent.change(birthYearInput, { target: { value: '1910' } })

    expect(mockSetEditBirthYear).toHaveBeenCalledWith(1910)
  })

  it('should call setEditDeathYear when death year changes', () => {
    render(<PersonEditor {...defaultProps} />)

    const deathYearInput = screen.getByPlaceholderText('Год смерти')
    fireEvent.change(deathYearInput, { target: { value: '1990' } })

    expect(mockSetEditDeathYear).toHaveBeenCalledWith(1990)
  })

  it('should render category select', () => {
    render(<PersonEditor {...defaultProps} />)

    expect(screen.getByText('Род деятельности')).toBeInTheDocument()
    expect(screen.getByTestId('searchable-select')).toBeInTheDocument()
  })

  it('should call setEditPersonCategory when category changes', () => {
    render(<PersonEditor {...defaultProps} />)

    const categorySelect = screen.getByTestId('select-Выбрать род деятельности')
    fireEvent.change(categorySelect, { target: { value: 'Art' } })

    expect(mockSetEditPersonCategory).toHaveBeenCalledWith('Art')
  })

  it('should render country section', () => {
    render(<PersonEditor {...defaultProps} />)

    expect(screen.getByText('Страны проживания')).toBeInTheDocument()
    expect(screen.getByText('+ Добавить страну проживания')).toBeInTheDocument()
  })

  it('should add country period when add button is clicked', () => {
    render(<PersonEditor {...defaultProps} />)

    const addButton = screen.getByText('+ Добавить страну проживания')
    fireEvent.click(addButton)

    expect(mockSetLifePeriods).toHaveBeenCalledWith([
      { countryId: 'USA', start: 1900, end: 1980 }
    ])
  })

  it('should use current edit years when adding country period', () => {
    render(
      <PersonEditor
        {...defaultProps}
        editBirthYear={1920}
        editDeathYear={1995}
      />
    )

    const addButton = screen.getByText('+ Добавить страну проживания')
    fireEvent.click(addButton)

    expect(mockSetLifePeriods).toHaveBeenCalledWith([
      { countryId: 'USA', start: 1920, end: 1995 }
    ])
  })

  it('should preserve existing periods when adding new one', () => {
    const existingPeriods = [
      { countryId: 'Russia', start: 1900, end: 1950 }
    ]

    render(
      <PersonEditor
        {...defaultProps}
        lifePeriods={existingPeriods}
      />
    )

    const addButton = screen.getByText('+ Добавить страну проживания')
    fireEvent.click(addButton)

    expect(mockSetLifePeriods).toHaveBeenCalledWith([
      { countryId: 'Russia', start: 1900, end: 1950 },
      { countryId: 'USA', start: 1900, end: 1980 }
    ])
  })

  it('should render LifePeriodsEditor when periods exist', () => {
    const periods = [
      { countryId: 'USA', start: 1900, end: 1980 }
    ]

    render(
      <PersonEditor
        {...defaultProps}
        lifePeriods={periods}
      />
    )

    expect(screen.getByTestId('life-periods-editor')).toBeInTheDocument()
    expect(screen.getByText('Periods: 1')).toBeInTheDocument()
    expect(screen.getByText('Min: 1900, Max: 1980')).toBeInTheDocument()
  })

  it('should not render LifePeriodsEditor when no periods', () => {
    render(<PersonEditor {...defaultProps} lifePeriods={[]} />)

    expect(screen.queryByTestId('life-periods-editor')).not.toBeInTheDocument()
  })

  it('should pass correct props to LifePeriodsEditor', () => {
    const periods = [
      { countryId: 'USA', start: 1900, end: 1950 },
      { countryId: 'Russia', start: 1950, end: 1980 }
    ]

    render(
      <PersonEditor
        {...defaultProps}
        lifePeriods={periods}
        editBirthYear={1900}
        editDeathYear={1980}
      />
    )

    expect(screen.getByText('Periods: 2')).toBeInTheDocument()
    expect(screen.getByText('Min: 1900, Max: 1980')).toBeInTheDocument()
  })

  it('should render image URL field with default value', () => {
    render(<PersonEditor {...defaultProps} />)

    const imageInput = screen.getByPlaceholderText('URL изображения') as HTMLInputElement
    expect(imageInput.value).toBe('http://example.com/image.jpg')
  })

  it('should render empty image URL when not provided', () => {
    const personWithoutImage = { ...mockPerson, imageUrl: undefined }

    render(<PersonEditor {...defaultProps} person={personWithoutImage} />)

    const imageInput = screen.getByPlaceholderText('URL изображения') as HTMLInputElement
    expect(imageInput.value).toBe('')
  })

  it('should render wiki link field with default value', () => {
    render(<PersonEditor {...defaultProps} />)

    const wikiInput = screen.getByPlaceholderText('Ссылка на Википедию') as HTMLInputElement
    expect(wikiInput.value).toBe('http://en.wikipedia.org/wiki/Test_Person')
  })

  it('should render empty wiki link when not provided', () => {
    const personWithoutWiki = { ...mockPerson, wikiLink: undefined }

    render(<PersonEditor {...defaultProps} person={personWithoutWiki} />)

    const wikiInput = screen.getByPlaceholderText('Ссылка на Википедию') as HTMLInputElement
    expect(wikiInput.value).toBe('')
  })

  it('should render description field with default value', () => {
    render(<PersonEditor {...defaultProps} />)

    const descriptionInput = screen.getByPlaceholderText('Описание') as HTMLTextAreaElement
    expect(descriptionInput.value).toBe('Test description')
  })

  it('should render empty description when not provided', () => {
    const personWithoutDesc = { ...mockPerson, description: undefined }

    render(<PersonEditor {...defaultProps} person={personWithoutDesc} />)

    const descriptionInput = screen.getByPlaceholderText('Описание') as HTMLTextAreaElement
    expect(descriptionInput.value).toBe('')
  })

  it('should render description textarea with 6 rows', () => {
    render(<PersonEditor {...defaultProps} />)

    const descriptionInput = screen.getByPlaceholderText('Описание') as HTMLTextAreaElement
    expect(descriptionInput.rows).toBe(6)
  })

  it('should mark required fields with required attribute', () => {
    render(<PersonEditor {...defaultProps} />)

    expect(screen.getByPlaceholderText('Имя')).toHaveAttribute('required')
    expect(screen.getByPlaceholderText('Год рождения')).toHaveAttribute('required')
    expect(screen.getByPlaceholderText('Год смерти')).toHaveAttribute('required')
  })

  it('should not mark optional fields as required', () => {
    render(<PersonEditor {...defaultProps} />)

    expect(screen.getByPlaceholderText('URL изображения')).not.toHaveAttribute('required')
    expect(screen.getByPlaceholderText('Ссылка на Википедию')).not.toHaveAttribute('required')
    expect(screen.getByPlaceholderText('Описание')).not.toHaveAttribute('required')
  })

  it('should handle empty country options', () => {
    render(
      <PersonEditor
        {...defaultProps}
        countrySelectOptions={[]}
      />
    )

    const addButton = screen.getByText('+ Добавить страну проживания')
    fireEvent.click(addButton)

    expect(mockSetLifePeriods).toHaveBeenCalledWith([
      { countryId: '', start: 1900, end: 1980 }
    ])
  })
})

