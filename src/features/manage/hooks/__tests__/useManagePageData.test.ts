import { renderHook, act } from '@testing-library/react'
import { useManagePageData } from '../useManagePageData'

// Mock dependencies
vi.mock('shared/hooks/useAchievements')
vi.mock('shared/hooks/usePeriods')
vi.mock('features/persons/hooks/usePersons')
vi.mock('shared/hooks/useApiData')

import { useAchievements } from 'shared/hooks/useAchievements'
import { usePeriods } from 'shared/hooks/usePeriods'
import { usePersons } from 'features/persons/hooks/usePersons'
import { useApiData } from 'shared/hooks/useApiData'

const mockUseAchievements = useAchievements as vi.MockedFunction<typeof useAchievements>
const mockUsePeriods = usePeriods as vi.MockedFunction<typeof usePeriods>
const mockUsePersons = usePersons as vi.MockedFunction<typeof usePersons>
const mockUseApiData = useApiData as vi.MockedFunction<typeof useApiData>

describe('useManagePageData', () => {
  const mockFilters = {
    categories: [],
    countries: [],
    timeRange: { start: -800, end: 2000 },
    showAchievements: false,
  }

  beforeEach(() => {
    vi.clearAllMocks()

    // Default mocks for "all" mode
    mockUsePersons.mockReturnValue({
      items: [],
      isLoading: false,
      hasMore: false,
      loadMore: vi.fn(),
      reset: vi.fn(),
    })

    mockUseAchievements.mockReturnValue({
      items: [],
      isLoading: false,
      hasMore: false,
      loadMore: vi.fn(),
      reset: vi.fn(),
    })

    mockUsePeriods.mockReturnValue({
      items: [],
      isLoading: false,
      hasMore: false,
      loadMore: vi.fn(),
      reset: vi.fn(),
    })

    // Default mock for mine mode
    mockUseApiData.mockReturnValue([
      {
        items: [],
        isLoading: false,
        isInitialLoading: false,
        hasMore: false,
      },
      {
        loadMore: vi.fn(),
        reset: vi.fn(),
      },
    ])
  })

  describe('initialization', () => {
    it('should initialize with default search states', () => {
      const { result } = renderHook(() =>
        useManagePageData('persons', 'all', false, mockFilters)
      )

      expect(result.current.searchPersons).toBe('')
      expect(result.current.searchAch).toBe('')
      expect(result.current.searchPeriods).toBe('')
      expect(result.current.periodType).toBe('')
    })

    it('should initialize with default status filters', () => {
      const { result } = renderHook(() =>
        useManagePageData('persons', 'all', false, mockFilters)
      )

      expect(result.current.statusFilters).toEqual({
        draft: false,
        pending: false,
        approved: false,
        rejected: false,
      })
    })
  })

  describe('all mode', () => {
    it('should use persons hook when activeTab is persons and menuSelection is all', () => {
      const mockPersons = [
        { id: 'p1', name: 'Person 1', birthYear: 1900, category: 'Test', country: 'Test' },
      ]

      mockUsePersons.mockReturnValue({
        items: mockPersons as any,
        isLoading: false,
        hasMore: true,
        loadMore: vi.fn(),
        reset: vi.fn(),
      })

      const { result } = renderHook(() =>
        useManagePageData('persons', 'all', false, mockFilters)
      )

      expect(result.current.personsAll).toEqual(mockPersons)
      expect(result.current.isPersonsLoadingAll).toBe(false)
      expect(result.current.personsHasMoreAll).toBe(true)
      expect(mockUsePersons).toHaveBeenCalledWith(
        expect.objectContaining({ q: '' }),
        true
      )
    })

    it('should use achievements hook when activeTab is achievements and menuSelection is all', () => {
      const mockAchievements = [{ id: 1, title: 'Achievement 1', year: 2000 }]

      mockUseAchievements.mockReturnValue({
        items: mockAchievements as any,
        isLoading: true,
        hasMore: false,
        loadMore: vi.fn(),
        reset: vi.fn(),
      })

      const { result } = renderHook(() =>
        useManagePageData('achievements', 'all', false, mockFilters)
      )

      const achData = result.current.achievementsData
      expect(achData.items).toEqual(mockAchievements)
      expect(achData.isLoading).toBe(true)
      expect(achData.hasMore).toBe(false)
      expect(mockUseAchievements).toHaveBeenCalledWith('', true)
    })

    it('should use periods hook when activeTab is periods and menuSelection is all', () => {
      const mockPeriods = [
        { id: 1, name: 'Period 1', startYear: 1900, endYear: 1950, type: 'life' },
      ]

      mockUsePeriods.mockReturnValue({
        items: mockPeriods as any,
        isLoading: false,
        hasMore: true,
        loadMore: vi.fn(),
        reset: vi.fn(),
      })

      const { result } = renderHook(() =>
        useManagePageData('periods', 'all', false, mockFilters)
      )

      const periodsData = result.current.periodsData
      expect(periodsData.items).toEqual(mockPeriods)
      expect(periodsData.hasMore).toBe(true)
      expect(mockUsePeriods).toHaveBeenCalledWith(
        { query: '', type: '' },
        true
      )
    })

    it('should not enable hooks when not in all mode', () => {
      renderHook(() => useManagePageData('persons', 'mine', true, mockFilters))

      // Should call with enabled=false
      expect(mockUsePersons).toHaveBeenCalledWith(expect.anything(), false)
    })
  })

  describe('mine mode', () => {
    it('should enable mine data loading when authenticated and in mine mode', () => {
      const { result } = renderHook(() =>
        useManagePageData('persons', 'mine', true, mockFilters)
      )

      expect(result.current.enablePersonsMine).toBe(true)
      expect(mockUseApiData).toHaveBeenCalledWith(
        expect.objectContaining({
          endpoint: '/api/persons/mine',
          enabled: true,
        })
      )
    })

    it('should not enable mine data when not authenticated', () => {
      const { result } = renderHook(() =>
        useManagePageData('persons', 'mine', false, mockFilters)
      )

      expect(result.current.enablePersonsMine).toBe(false)
    })

    it('should return mine persons data when in mine mode', () => {
      const mockMinePersons = [
        { id: 'p1', name: 'My Person', birthYear: 1900, category: 'Test', country: 'Test' },
      ]

      mockUseApiData.mockReturnValue([
        {
          items: mockMinePersons,
          isLoading: false,
          isInitialLoading: false,
          hasMore: true,
        },
        {
          loadMore: vi.fn(),
          reset: vi.fn(),
        },
      ])

      const { result } = renderHook(() =>
        useManagePageData('persons', 'mine', true, mockFilters)
      )

      expect(result.current.personsAlt).toEqual(mockMinePersons)
      expect(result.current.personsAltLoading).toBe(false)
      expect(result.current.personsAltHasMore).toBe(true)
    })

    it('should enable achievements mine when in achievements tab and mine mode', () => {
      const { result } = renderHook(() =>
        useManagePageData('achievements', 'mine', true, mockFilters)
      )

      expect(result.current.enableAchievementsMine).toBe(true)
    })

    it('should enable periods mine when in periods tab and mine mode', () => {
      const { result } = renderHook(() =>
        useManagePageData('periods', 'mine', true, mockFilters)
      )

      expect(result.current.enablePeriodsMine).toBe(true)
    })

    it('should return mine achievements data', () => {
      const mockMineAch = [{ id: 1, title: 'My Achievement', year: 2000 }]

      mockUseApiData.mockReturnValue([
        {
          items: mockMineAch,
          isLoading: true,
          isInitialLoading: false,
          hasMore: false,
        },
        {
          loadMore: vi.fn(),
          reset: vi.fn(),
        },
      ])

      const { result } = renderHook(() =>
        useManagePageData('achievements', 'mine', true, mockFilters)
      )

      expect(result.current.achievementsMineData.items).toEqual(mockMineAch)
      expect(result.current.achievementsMineData.isLoading).toBe(true)
      expect(result.current.achievementsMineData.hasMore).toBe(false)
    })

    it('should return mine periods data', () => {
      const mockMinePeriods = [
        { id: 1, name: 'My Period', startYear: 1900, endYear: 1950, type: 'life' },
      ]

      mockUseApiData.mockReturnValue([
        {
          items: mockMinePeriods,
          isLoading: false,
          isInitialLoading: true,
          hasMore: true,
        },
        {
          loadMore: vi.fn(),
          reset: vi.fn(),
        },
      ])

      const { result } = renderHook(() =>
        useManagePageData('periods', 'mine', true, mockFilters)
      )

      expect(result.current.periodsMineData.items).toEqual(mockMinePeriods)
      expect(result.current.periodsMineData.isLoading).toBe(true) // isLoading || isInitialLoading
      expect(result.current.periodsMineData.hasMore).toBe(true)
    })
  })

  describe('search functionality', () => {
    it('should update searchPersons', () => {
      const { result } = renderHook(() =>
        useManagePageData('persons', 'all', false, mockFilters)
      )

      act(() => {
        result.current.setSearchPersons('test search')
      })

      expect(result.current.searchPersons).toBe('test search')
    })

    it('should update searchAch', () => {
      const { result } = renderHook(() =>
        useManagePageData('achievements', 'all', false, mockFilters)
      )

      act(() => {
        result.current.setSearchAch('achievement search')
      })

      expect(result.current.searchAch).toBe('achievement search')
    })

    it('should update searchPeriods', () => {
      const { result } = renderHook(() =>
        useManagePageData('periods', 'all', false, mockFilters)
      )

      act(() => {
        result.current.setSearchPeriods('period search')
      })

      expect(result.current.searchPeriods).toBe('period search')
    })

    it('should update periodType', () => {
      const { result } = renderHook(() =>
        useManagePageData('periods', 'all', false, mockFilters)
      )

      act(() => {
        result.current.setPeriodType('life')
      })

      expect(result.current.periodType).toBe('life')
    })

    it('should pass search query to persons hook', () => {
      const { result } = renderHook(() =>
        useManagePageData('persons', 'all', false, mockFilters)
      )

      act(() => {
        result.current.setSearchPersons('Einstein')
      })

      expect(mockUsePersons).toHaveBeenCalledWith(
        expect.objectContaining({ q: 'Einstein' }),
        true
      )
    })

    it('should pass filters to persons hook', () => {
      const filtersWithData = {
        categories: ['Философ', 'Ученый'],
        countries: ['Россия'],
        timeRange: { start: 1800, end: 1900 },
        showAchievements: false,
      }

      renderHook(() => useManagePageData('persons', 'all', false, filtersWithData))

      expect(mockUsePersons).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'Философ,Ученый',
          country: 'Россия',
        }),
        true
      )
    })

    it('should pass period type to periods hook', () => {
      const { result } = renderHook(() =>
        useManagePageData('periods', 'all', false, mockFilters)
      )

      act(() => {
        result.current.setPeriodType('ruler')
      })

      expect(mockUsePeriods).toHaveBeenCalledWith(
        { query: '', type: 'ruler' },
        true
      )
    })
  })

  describe('status filters', () => {
    it('should update statusFilters', () => {
      const { result } = renderHook(() =>
        useManagePageData('persons', 'mine', true, mockFilters)
      )

      act(() => {
        result.current.setStatusFilters({
          draft: true,
          pending: false,
          approved: true,
          rejected: false,
        })
      })

      expect(result.current.statusFilters).toEqual({
        draft: true,
        pending: false,
        approved: true,
        rejected: false,
      })
    })

    it('should update achStatusFilters', () => {
      const { result } = renderHook(() =>
        useManagePageData('achievements', 'mine', true, mockFilters)
      )

      act(() => {
        result.current.setAchStatusFilters({
          draft: false,
          pending: true,
          approved: false,
          rejected: true,
        })
      })

      expect(result.current.achStatusFilters.pending).toBe(true)
      expect(result.current.achStatusFilters.rejected).toBe(true)
    })

    it('should update periodsStatusFilters', () => {
      const { result } = renderHook(() =>
        useManagePageData('periods', 'mine', true, mockFilters)
      )

      act(() => {
        result.current.setPeriodsStatusFilters({
          draft: true,
          pending: true,
          approved: true,
          rejected: true,
        })
      })

      expect(result.current.periodsStatusFilters.draft).toBe(true)
    })
  })

  describe('getAchievementsData', () => {
    it('should return all achievements data in all mode', () => {
      const mockAch = [{ id: 1, title: 'Ach', year: 2000 }]

      mockUseAchievements.mockReturnValue({
        items: mockAch as any,
        isLoading: false,
        hasMore: true,
        loadMore: vi.fn(),
        reset: vi.fn(),
      })

      const { result } = renderHook(() =>
        useManagePageData('achievements', 'all', false, mockFilters)
      )

      expect(result.current.achievementsData.items).toEqual(mockAch)
    })

    it('should return mine achievements data in mine mode', () => {
      const mockMineAch = [{ id: 2, title: 'My Ach', year: 2020 }]

      mockUseApiData.mockReturnValue([
        { items: mockMineAch, isLoading: false, isInitialLoading: false, hasMore: false },
        { loadMore: vi.fn(), reset: vi.fn() },
      ])

      const { result } = renderHook(() =>
        useManagePageData('achievements', 'mine', true, mockFilters)
      )

      expect(result.current.achievementsData.items).toEqual(mockMineAch)
    })

    it('should return empty data in list mode', () => {
      const { result } = renderHook(() =>
        useManagePageData('achievements', 'list:123', true, mockFilters)
      )

      expect(result.current.achievementsData.items).toEqual([])
      expect(result.current.achievementsData.isLoading).toBe(false)
      expect(result.current.achievementsData.hasMore).toBe(false)
    })
  })

  describe('getPeriodsData', () => {
    it('should return all periods data in all mode', () => {
      const mockPeriods = [{ id: 1, name: 'Period', startYear: 1900, endYear: 1950, type: 'life' }]

      mockUsePeriods.mockReturnValue({
        items: mockPeriods as any,
        isLoading: true,
        hasMore: false,
        loadMore: vi.fn(),
        reset: vi.fn(),
      })

      const { result } = renderHook(() =>
        useManagePageData('periods', 'all', false, mockFilters)
      )

      expect(result.current.periodsData.items).toEqual(mockPeriods)
      expect(result.current.periodsData.isLoading).toBe(true)
    })

    it('should return mine periods data in mine mode', () => {
      const mockMinePeriods = [{ id: 2, name: 'My Period', startYear: 2000, endYear: 2020, type: 'ruler' }]

      mockUseApiData.mockReturnValue([
        { items: mockMinePeriods, isLoading: false, isInitialLoading: false, hasMore: true },
        { loadMore: vi.fn(), reset: vi.fn() },
      ])

      const { result } = renderHook(() =>
        useManagePageData('periods', 'mine', true, mockFilters)
      )

      expect(result.current.periodsData.items).toEqual(mockMinePeriods)
    })
  })

  describe('reset actions', () => {
    it('should expose reset actions', () => {
      const mockResetPersons = vi.fn()
      const mockResetAch = vi.fn()
      const mockResetPeriods = vi.fn()

      mockUseApiData.mockReturnValueOnce([
        { items: [], isLoading: false, isInitialLoading: false, hasMore: false },
        { loadMore: vi.fn(), reset: mockResetPersons },
      ])
      mockUseApiData.mockReturnValueOnce([
        { items: [], isLoading: false, isInitialLoading: false, hasMore: false },
        { loadMore: vi.fn(), reset: mockResetAch },
      ])
      mockUseApiData.mockReturnValueOnce([
        { items: [], isLoading: false, isInitialLoading: false, hasMore: false },
        { loadMore: vi.fn(), reset: mockResetPeriods },
      ])

      const { result } = renderHook(() =>
        useManagePageData('persons', 'mine', true, mockFilters)
      )

      result.current.resetPersons()
      result.current.resetAchievements()
      result.current.resetPeriods()

      expect(mockResetPersons).toHaveBeenCalled()
      expect(mockResetAch).toHaveBeenCalled()
      expect(mockResetPeriods).toHaveBeenCalled()
    })
  })
})






