import { renderHook, waitFor } from '@testing-library/react'
import { useQuizData } from '../useQuizData'
import * as api from '../../../../shared/api/api'

jest.mock('../../../../shared/api/api', () => ({
  getCategories: jest.fn(),
  getCountries: jest.fn(),
}))

jest.mock('../../../../shared/hooks/useEntityQuery', () => ({
  useEntityQuery: jest.fn(),
}))

import { useEntityQuery } from '../../../../shared/hooks/useEntityQuery'

const mockUseEntityQuery = useEntityQuery as jest.MockedFunction<typeof useEntityQuery>
const mockGetCategories = api.getCategories as jest.MockedFunction<typeof api.getCategories>
const mockGetCountries = api.getCountries as jest.MockedFunction<typeof api.getCountries>

describe('useQuizData', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    // Default mocks
    mockUseEntityQuery.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    })

    mockGetCategories.mockResolvedValue(['Философ', 'Ученый'])
    mockGetCountries.mockResolvedValue(['Россия', 'США'])
  })

  it('should initialize with loading state', () => {
    mockUseEntityQuery.mockReturnValue({
      data: [],
      isLoading: true,
      error: null,
      refetch: jest.fn(),
    })

    const filters = {
      categories: [],
      countries: [],
      timeRange: { start: -800, end: 2000 },
      showAchievements: false,
    }

    const { result } = renderHook(() => useQuizData(filters))

    expect(result.current.isLoading).toBe(true)
  })

  it('should build query filters correctly', () => {
    const filters = {
      categories: ['Философ', 'Ученый'],
      countries: ['Россия'],
      timeRange: { start: 1800, end: 1900 },
      showAchievements: true,
    }

    renderHook(() => useQuizData(filters))

    expect(mockUseEntityQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        endpoint: '/api/persons',
        filters: expect.objectContaining({
          category: 'Философ,Ученый',
          country: 'Россия',
          startYear: 1800,
          endYear: 1900,
          limit: 1000,
        }),
        enabled: true,
      })
    )
  })

  it('should not include category filter if empty', () => {
    const filters = {
      categories: [],
      countries: ['Россия'],
      timeRange: { start: -800, end: 2000 },
      showAchievements: false,
    }

    renderHook(() => useQuizData(filters))

    const call = mockUseEntityQuery.mock.calls[0][0]
    expect(call.filters).not.toHaveProperty('category')
    expect(call.filters.country).toBe('Россия')
  })

  it('should respect enabled parameter', () => {
    const filters = {
      categories: [],
      countries: [],
      timeRange: { start: -800, end: 2000 },
      showAchievements: false,
    }

    renderHook(() => useQuizData(filters, false))

    expect(mockUseEntityQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: false,
      })
    )
  })

  it('should load categories and countries on mount', async () => {
    const filters = {
      categories: [],
      countries: [],
      timeRange: { start: -800, end: 2000 },
      showAchievements: false,
    }

    renderHook(() => useQuizData(filters))

    await waitFor(() => {
      expect(mockGetCategories).toHaveBeenCalled()
      expect(mockGetCountries).toHaveBeenCalled()
    })
  })

  it('should handle errors loading metadata', async () => {
    mockGetCategories.mockRejectedValue(new Error('Failed to load categories'))
    mockGetCountries.mockRejectedValue(new Error('Failed to load countries'))

    const filters = {
      categories: [],
      countries: [],
      timeRange: { start: -800, end: 2000 },
      showAchievements: false,
    }

    const { result } = renderHook(() => useQuizData(filters))

    // Should not crash on error
    await waitFor(() => {
      expect(result.current.allCategories).toEqual([])
      expect(result.current.allCountries).toEqual([])
    })
  })

  it('should return persons data', () => {
    const mockPersons = [
      { id: 'person-1', name: 'Test Person', birthYear: 1900, deathYear: 1950 },
    ]

    mockUseEntityQuery.mockReturnValue({
      data: mockPersons,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    })

    const filters = {
      categories: [],
      countries: [],
      timeRange: { start: -800, end: 2000 },
      showAchievements: false,
    }

    const { result } = renderHook(() => useQuizData(filters))

    expect(result.current.persons).toEqual(mockPersons)
  })
})

