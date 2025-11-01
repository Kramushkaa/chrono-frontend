import { renderHook } from '@testing-library/react'
import { useAchievements } from '../useAchievements'
import { usePeriods } from '../usePeriods'
import * as useApiDataModule from '../useApiData'

// Mock useApiData
vi.mock('../useApiData')

describe('Data Hooks', () => {
  const mockLoadMore = vi.fn()
  const mockReset = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    ;(useApiDataModule.useApiData as vi.Mock).mockReturnValue([
      { items: [], isLoading: false, hasMore: false },
      { loadMore: mockLoadMore, reset: mockReset },
    ])
  })

  describe('useAchievements', () => {
    it('should initialize with default params', () => {
      renderHook(() => useAchievements('', true))

      expect(useApiDataModule.useApiData).toHaveBeenCalledWith(
        expect.objectContaining({
          endpoint: '/api/achievements',
          enabled: true,
          queryParams: {},
          pageSize: 100,
        })
      )
    })

    it('should include search query in params', () => {
      renderHook(() => useAchievements('test search', true))

      expect(useApiDataModule.useApiData).toHaveBeenCalledWith(
        expect.objectContaining({
          queryParams: { q: 'test search' },
        })
      )
    })

    it('should trim search query', () => {
      renderHook(() => useAchievements('  test  ', true))

      expect(useApiDataModule.useApiData).toHaveBeenCalledWith(
        expect.objectContaining({
          queryParams: { q: 'test' },
        })
      )
    })

    it('should ignore empty query', () => {
      renderHook(() => useAchievements('   ', true))

      expect(useApiDataModule.useApiData).toHaveBeenCalledWith(
        expect.objectContaining({
          queryParams: {},
        })
      )
    })

    it('should return items and loading state', () => {
      const mockItems = [{ id: 1, title: 'Achievement' }]
      ;(useApiDataModule.useApiData as vi.Mock).mockReturnValue([
        { items: mockItems, isLoading: true, hasMore: true },
        { loadMore: mockLoadMore, reset: mockReset },
      ])

      const { result } = renderHook(() => useAchievements('', true))

      expect(result.current.items).toBe(mockItems)
      expect(result.current.isLoading).toBe(true)
      expect(result.current.hasMore).toBe(true)
    })

    it('should return actions', () => {
      const { result } = renderHook(() => useAchievements('', true))

      expect(result.current.loadMore).toBe(mockLoadMore)
      expect(result.current.reset).toBe(mockReset)
    })

    it('should pass enabled flag', () => {
      renderHook(() => useAchievements('test', false))

      expect(useApiDataModule.useApiData).toHaveBeenCalledWith(
        expect.objectContaining({
          enabled: false,
        })
      )
    })

    it('should have dedupeBy function', () => {
      renderHook(() => useAchievements('', true))

      const call = (useApiDataModule.useApiData as vi.Mock).mock.calls[0][0]
      expect(typeof call.dedupeBy).toBe('function')
      expect(call.dedupeBy({ id: 5 })).toBe(5)
    })
  })

  describe('usePeriods', () => {
    it('should initialize with default params', () => {
      renderHook(() => usePeriods({ query: '', type: '' }, true))

      expect(useApiDataModule.useApiData).toHaveBeenCalledWith(
        expect.objectContaining({
          endpoint: '/api/periods',
          enabled: true,
          queryParams: {},
          pageSize: 100,
        })
      )
    })

    it('should include search query in params', () => {
      renderHook(() => usePeriods({ query: 'test search', type: '' }, true))

      expect(useApiDataModule.useApiData).toHaveBeenCalledWith(
        expect.objectContaining({
          queryParams: { q: 'test search' },
        })
      )
    })

    it('should include type in params for life periods', () => {
      renderHook(() => usePeriods({ query: '', type: 'life' }, true))

      expect(useApiDataModule.useApiData).toHaveBeenCalledWith(
        expect.objectContaining({
          queryParams: { type: 'life' },
        })
      )
    })

    it('should include type in params for ruler periods', () => {
      renderHook(() => usePeriods({ query: '', type: 'ruler' }, true))

      expect(useApiDataModule.useApiData).toHaveBeenCalledWith(
        expect.objectContaining({
          queryParams: { type: 'ruler' },
        })
      )
    })

    it('should ignore invalid type', () => {
      renderHook(() => usePeriods({ query: '', type: 'invalid' as any }, true))

      expect(useApiDataModule.useApiData).toHaveBeenCalledWith(
        expect.objectContaining({
          queryParams: {},
        })
      )
    })

    it('should include both query and type', () => {
      renderHook(() => usePeriods({ query: 'test', type: 'life' }, true))

      expect(useApiDataModule.useApiData).toHaveBeenCalledWith(
        expect.objectContaining({
          queryParams: { q: 'test', type: 'life' },
        })
      )
    })

    it('should trim query', () => {
      renderHook(() => usePeriods({ query: '  test  ', type: '' }, true))

      expect(useApiDataModule.useApiData).toHaveBeenCalledWith(
        expect.objectContaining({
          queryParams: { q: 'test' },
        })
      )
    })

    it('should return items and loading state', () => {
      const mockItems = [{ id: 1, person_name: 'Person', start_year: 1900, end_year: 1950, period_type: 'life' }]
      ;(useApiDataModule.useApiData as vi.Mock).mockReturnValue([
        { items: mockItems, isLoading: true, hasMore: true },
        { loadMore: mockLoadMore, reset: mockReset },
      ])

      const { result } = renderHook(() => usePeriods({ query: '', type: '' }, true))

      expect(result.current.items).toBe(mockItems)
      expect(result.current.isLoading).toBe(true)
      expect(result.current.hasMore).toBe(true)
    })

    it('should return actions', () => {
      const { result } = renderHook(() => usePeriods({ query: '', type: '' }, true))

      expect(result.current.loadMore).toBe(mockLoadMore)
      expect(result.current.reset).toBe(mockReset)
    })

    it('should pass enabled flag', () => {
      renderHook(() => usePeriods({ query: 'test', type: 'life' }, false))

      expect(useApiDataModule.useApiData).toHaveBeenCalledWith(
        expect.objectContaining({
          enabled: false,
        })
      )
    })

    it('should have dedupeBy function', () => {
      renderHook(() => usePeriods({ query: '', type: '' }, true))

      const call = (useApiDataModule.useApiData as vi.Mock).mock.calls[0][0]
      expect(typeof call.dedupeBy).toBe('function')
      expect(call.dedupeBy({ id: 10 })).toBe(10)
    })
  })
})






