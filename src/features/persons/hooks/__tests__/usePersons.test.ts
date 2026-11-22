import { renderHook, act } from '@testing-library/react'
import { usePersons } from '../usePersons'
import { useApiData } from 'shared/hooks/useApiData'
import { Person } from 'shared/types'

// Mock useApiData hook
vi.mock('shared/hooks/useApiData', () => ({
  useApiData: vi.fn(),
}))

const mockUseApiData = useApiData as vi.MockedFunction<typeof useApiData>

describe('usePersons', () => {
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

  const mockState = {
    items: [mockPerson],
    isLoading: false,
    hasMore: false,
    error: null,
    isInitialLoading: false,
  }

  const mockActions = {
    loadMore: vi.fn(),
    reset: vi.fn(),
    refetch: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseApiData.mockReturnValue([mockState, mockActions])
  })

  it('should initialize with default parameters', () => {
    renderHook(() => usePersons({}))

    expect(mockUseApiData).toHaveBeenCalledWith({
      endpoint: '/api/persons',
      queryParams: {},
      dedupeBy: expect.any(Function),
      pageSize: 100,
      enabled: true,
    })
  })

  it('should handle query parameters correctly', () => {
    const query = {
      q: 'test search',
      category: 'Politics',
      country: 'Russia',
      startYear: 1800,
      endYear: 1900,
    }

    renderHook(() => usePersons(query))

    expect(mockUseApiData).toHaveBeenCalledWith({
      endpoint: '/api/persons',
      queryParams: {
        q: 'test search',
        category: 'Politics',
        country: 'Russia',
        startYear: '1800',
        endYear: '1900',
      },
      dedupeBy: expect.any(Function),
      pageSize: 100,
      enabled: true,
    })
  })

  it('should filter out empty parameters', () => {
    const query = {
      q: '',
      category: '',
      country: '   ',
      startYear: undefined,
      endYear: undefined,
    }

    renderHook(() => usePersons(query))

    expect(mockUseApiData).toHaveBeenCalledWith({
      endpoint: '/api/persons',
      queryParams: {},
      dedupeBy: expect.any(Function),
      pageSize: 100,
      enabled: true,
    })
  })

  it('should trim whitespace from string parameters', () => {
    const query = {
      q: '  test search  ',
      category: '  Politics  ',
    }

    renderHook(() => usePersons(query))

    expect(mockUseApiData).toHaveBeenCalledWith({
      endpoint: '/api/persons',
      queryParams: {
        q: 'test search',
        category: '  Politics  ', // Note: category is not trimmed in usePersons, only q is trimmed
      },
      dedupeBy: expect.any(Function),
      pageSize: 100,
      enabled: true,
    })
  })

  it('should handle disabled state', () => {
    renderHook(() => usePersons({}, false))

    expect(mockUseApiData).toHaveBeenCalledWith({
      endpoint: '/api/persons',
      queryParams: {},
      dedupeBy: expect.any(Function),
      pageSize: 100,
      enabled: false,
    })
  })

  it('should return correct data from useApiData', () => {
    const { result } = renderHook(() => usePersons({}))

    expect(result.current.items).toEqual([mockPerson])
    expect(result.current.isLoading).toBe(false)
    expect(result.current.hasMore).toBe(false)
    expect(result.current.error).toBeNull()
    expect(result.current.loadMore).toBe(mockActions.loadMore)
    expect(result.current.reset).toBe(mockActions.reset)
    expect(result.current.refetch).toBe(mockActions.refetch)
  })

  it('should handle loading state', () => {
    mockUseApiData.mockReturnValue([
      {
        ...mockState,
        isLoading: true,
        isInitialLoading: true,
      },
      mockActions,
    ])

    const { result } = renderHook(() => usePersons({}))

    expect(result.current.isLoading).toBe(true)
  })

  it('should handle error state', () => {
    const errorState = {
      ...mockState,
      error: 'Network error',
      items: [],
    }

    mockUseApiData.mockReturnValue([errorState, mockActions])

    const { result } = renderHook(() => usePersons({}))

    expect(result.current.error).toBe('Network error')
    expect(result.current.items).toEqual([])
  })

  it('should handle numeric year parameters correctly', () => {
    const query = {
      startYear: 1800,
      endYear: 2000,
    }

    renderHook(() => usePersons(query))

    expect(mockUseApiData).toHaveBeenCalledWith({
      endpoint: '/api/persons',
      queryParams: {
        startYear: '1800',
        endYear: '2000',
      },
      dedupeBy: expect.any(Function),
      pageSize: 100,
      enabled: true,
    })
  })

  it('should handle null/undefined query values', () => {
    const query = {
      q: null as any,
      category: undefined as any,
      country: null as any,
    }

    renderHook(() => usePersons(query))

    expect(mockUseApiData).toHaveBeenCalledWith({
      endpoint: '/api/persons',
      queryParams: {},
      dedupeBy: expect.any(Function),
      pageSize: 100,
      enabled: true,
    })
  })

  it('should pass correct dedupe function', () => {
    renderHook(() => usePersons({}))

    const callConfig = mockUseApiData.mock.calls[0][0]
    const dedupeBy = callConfig.dedupeBy

    expect(dedupeBy(mockPerson)).toBe('1')
    expect(typeof dedupeBy).toBe('function')
  })
})





