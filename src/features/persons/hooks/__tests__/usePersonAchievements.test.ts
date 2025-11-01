import { renderHook } from '@testing-library/react'
import { usePersonAchievements } from '../usePersonAchievements'
import { useApiDataSimple } from 'shared/hooks/useApiData'
import { Person } from 'shared/types'

// Mock useApiDataSimple hook
vi.mock('shared/hooks/useApiData', () => ({
  useApiDataSimple: vi.fn(),
}))

const mockUseApiDataSimple = useApiDataSimple as vi.MockedFunction<typeof useApiDataSimple>

describe('usePersonAchievements', () => {
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

  const mockPersonWithAchievements: Person = {
    ...mockPerson,
    id: '2',
    achievementsWiki: ['wiki_url_1', 'wiki_url_2'],
  }

  const mockAchievements = [
    { year: 1820, wikipedia_url: 'https://en.wikipedia.org/wiki/test1' },
    { year: 1810, wikipedia_url: null },
    { year: 1830, wikipedia_url: 'https://en.wikipedia.org/wiki/test3' },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return null achievements when no person provided', () => {
    mockUseApiDataSimple.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    })

    const { result } = renderHook(() => usePersonAchievements(null))

    expect(result.current.achievementsWiki).toBeNull()
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('should use existing achievementsWiki if available', () => {
    mockUseApiDataSimple.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    })

    const { result } = renderHook(() => usePersonAchievements(mockPersonWithAchievements))

    expect(result.current.achievementsWiki).toEqual(['wiki_url_1', 'wiki_url_2'])
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('should not fetch API data when person has achievementsWiki', () => {
    mockUseApiDataSimple.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    })

    renderHook(() => usePersonAchievements(mockPersonWithAchievements))

    expect(mockUseApiDataSimple).toHaveBeenCalledWith({
      endpoint: '/api/persons/2/achievements',
      enabled: false, // Should be false because person has achievementsWiki
      cacheKey: 'person-achievements:2',
    })
  })

  it('should fetch API data when person has no achievementsWiki', () => {
    mockUseApiDataSimple.mockReturnValue({
      data: mockAchievements,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    })

    renderHook(() => usePersonAchievements(mockPerson))

    expect(mockUseApiDataSimple).toHaveBeenCalledWith({
      endpoint: '/api/persons/1/achievements',
      enabled: true,
      cacheKey: 'person-achievements:1',
    })
  })

  it('should process and sort API achievements by year', () => {
    mockUseApiDataSimple.mockReturnValue({
      data: mockAchievements,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    })

    const { result } = renderHook(() => usePersonAchievements(mockPerson))

    // Should be sorted by year and only include non-null wikipedia_url
    expect(result.current.achievementsWiki).toEqual([
      null, // 1810 with null url
      'https://en.wikipedia.org/wiki/test1', // 1820
      'https://en.wikipedia.org/wiki/test3', // 1830
    ])
  })

  it('should return null when API returns no data', () => {
    mockUseApiDataSimple.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    })

    const { result } = renderHook(() => usePersonAchievements(mockPerson))

    expect(result.current.achievementsWiki).toBeNull()
    expect(result.current.isLoading).toBe(true)
  })

  it('should handle empty achievements array', () => {
    mockUseApiDataSimple.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    })

    const { result } = renderHook(() => usePersonAchievements(mockPerson))

    expect(result.current.achievementsWiki).toEqual([])
  })

  it('should filter out achievements with empty or whitespace only URLs', () => {
    const achievementsWithEmptyUrls = [
      { year: 1820, wikipedia_url: 'https://en.wikipedia.org/wiki/test1' },
      { year: 1810, wikipedia_url: '' },
      { year: 1830, wikipedia_url: '   ' },
      { year: 1840, wikipedia_url: null },
    ]

    mockUseApiDataSimple.mockReturnValue({
      data: achievementsWithEmptyUrls,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    })

    const { result } = renderHook(() => usePersonAchievements(mockPerson))

    expect(result.current.achievementsWiki).toEqual([
      null, // 1810 with empty string
      'https://en.wikipedia.org/wiki/test1', // 1820 with valid URL
      null, // 1830 with whitespace only
      null, // 1840 with null
    ])
  })

  it('should propagate loading state from API', () => {
    mockUseApiDataSimple.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    })

    const { result } = renderHook(() => usePersonAchievements(mockPerson))

    expect(result.current.isLoading).toBe(true)
    expect(result.current.error).toBeNull()
  })

  it('should propagate error state from API', () => {
    const apiError = 'Failed to fetch achievements'

    mockUseApiDataSimple.mockReturnValue({
      data: null,
      isLoading: false,
      error: apiError,
      refetch: vi.fn(),
    })

    const { result } = renderHook(() => usePersonAchievements(mockPerson))

    expect(result.current.error).toBe(apiError)
    expect(result.current.isLoading).toBe(false)
  })

  it('should handle person with empty achievementsWiki array', () => {
    const personWithEmptyAchievements: Person = {
      ...mockPerson,
      id: '3',
      achievementsWiki: [],
    }

    mockUseApiDataSimple.mockReturnValue({
      data: mockAchievements,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    })

    const { result } = renderHook(() => usePersonAchievements(personWithEmptyAchievements))

    // Should fetch from API since achievementsWiki is empty
    expect(mockUseApiDataSimple).toHaveBeenCalledWith({
      endpoint: '/api/persons/3/achievements',
      enabled: true,
      cacheKey: 'person-achievements:3',
    })

    expect(result.current.achievementsWiki).toEqual([
      null,
      'https://en.wikipedia.org/wiki/test1',
      'https://en.wikipedia.org/wiki/test3',
    ])
  })
})





