import { renderHook, waitFor } from '@testing-library/react'
import { useTimelineData } from '../useTimelineData'
import * as api from '../../../../shared/api/api'

vi.mock('../../../../shared/api/api', () => ({
  getCategories: vi.fn(),
  getCountries: vi.fn(),
}))

vi.mock('../../../../shared/hooks/useEntityQuery', () => ({
  useEntityQuery: vi.fn(),
}))

import { useEntityQuery } from '../../../../shared/hooks/useEntityQuery'

const mockUseEntityQuery = useEntityQuery as vi.MockedFunction<typeof useEntityQuery>
const mockGetCategories = api.getCategories as vi.MockedFunction<typeof api.getCategories>
const mockGetCountries = api.getCountries as vi.MockedFunction<typeof api.getCountries>

describe('useTimelineData', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mockUseEntityQuery.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    })

    mockGetCategories.mockResolvedValue(['Философ', 'Художник'])
    mockGetCountries.mockResolvedValue(['Россия', 'Франция'])
  })

  it('should build filters correctly with all parameters', () => {
    const filters = {
      categories: ['Философ', 'Художник'],
      countries: ['Россия', 'Франция'],
      timeRange: { start: 1700, end: 1800 },
      showAchievements: true,
    }

    renderHook(() => useTimelineData(filters))

    expect(mockUseEntityQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        endpoint: '/api/persons',
        filters: expect.objectContaining({
          category: 'Философ,Художник',
          country: 'Россия,Франция',
          startYear: 1700,
          endYear: 1800,
          limit: 1000,
        }),
        enabled: true,
      })
    )
  })

  it('should build filters without categories', () => {
    const filters = {
      categories: [],
      countries: ['Россия'],
      timeRange: { start: -800, end: 2000 },
      showAchievements: false,
    }

    renderHook(() => useTimelineData(filters))

    const call = mockUseEntityQuery.mock.calls[0][0]
    expect(call.filters).not.toHaveProperty('category')
    expect(call.filters.country).toBe('Россия')
  })

  it('should build filters without countries', () => {
    const filters = {
      categories: ['Философ'],
      countries: [],
      timeRange: { start: -800, end: 2000 },
      showAchievements: false,
    }

    renderHook(() => useTimelineData(filters))

    const call = mockUseEntityQuery.mock.calls[0][0]
    expect(call.filters.category).toBe('Философ')
    expect(call.filters).not.toHaveProperty('country')
  })

  it('should respect enabled parameter', () => {
    const filters = {
      categories: [],
      countries: [],
      timeRange: { start: -800, end: 2000 },
      showAchievements: false,
    }

    renderHook(() => useTimelineData(filters, false))

    expect(mockUseEntityQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: false,
      })
    )
  })

  it('should load metadata on mount', async () => {
    const filters = {
      categories: [],
      countries: [],
      timeRange: { start: -800, end: 2000 },
      showAchievements: false,
    }

    renderHook(() => useTimelineData(filters))

    await waitFor(() => {
      expect(mockGetCategories).toHaveBeenCalled()
      expect(mockGetCountries).toHaveBeenCalled()
    })
  })

  it('should set metadata from API', async () => {
    mockGetCategories.mockResolvedValue(['Cat1', 'Cat2'])
    mockGetCountries.mockResolvedValue(['Country1', 'Country2'])

    const filters = {
      categories: [],
      countries: [],
      timeRange: { start: -800, end: 2000 },
      showAchievements: false,
    }

    const { result } = renderHook(() => useTimelineData(filters))

    await waitFor(() => {
      expect(result.current.allCategories).toEqual(['Cat1', 'Cat2'])
      expect(result.current.allCountries).toEqual(['Country1', 'Country2'])
    })
  })

  it('should handle metadata loading errors gracefully', async () => {
    mockGetCategories.mockRejectedValue(new Error('Failed'))
    mockGetCountries.mockRejectedValue(new Error('Failed'))

    const filters = {
      categories: [],
      countries: [],
      timeRange: { start: -800, end: 2000 },
      showAchievements: false,
    }

    const { result } = renderHook(() => useTimelineData(filters))

    await waitFor(() => {
      expect(result.current.allCategories).toEqual([])
      expect(result.current.allCountries).toEqual([])
    })
  })

  it('should return loading state', () => {
    mockUseEntityQuery.mockReturnValue({
      data: [],
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    })

    const filters = {
      categories: [],
      countries: [],
      timeRange: { start: -800, end: 2000 },
      showAchievements: false,
    }

    const { result } = renderHook(() => useTimelineData(filters))

    expect(result.current.isLoading).toBe(true)
  })

  it('should return persons data', () => {
    const mockPersons = [
      {
        id: 'person-1',
        name: 'Test',
        birthYear: 1900,
        deathYear: 1950,
      },
    ]

    mockUseEntityQuery.mockReturnValue({
      data: mockPersons,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    })

    const filters = {
      categories: [],
      countries: [],
      timeRange: { start: -800, end: 2000 },
      showAchievements: false,
    }

    const { result } = renderHook(() => useTimelineData(filters))

    expect(result.current.persons).toEqual(mockPersons)
  })
})






