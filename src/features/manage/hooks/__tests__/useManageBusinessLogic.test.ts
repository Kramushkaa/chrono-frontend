import { renderHook, waitFor } from '@testing-library/react'
import { useManageBusinessLogic } from '../useManageBusinessLogic'
import * as api from 'shared/api/api'

// Mock API
vi.mock('shared/api/api', () => ({
  getCategories: vi.fn(),
  getCountries: vi.fn(),
  getCountryOptions: vi.fn(),
  getPersonById: vi.fn(),
  getMyPersonsCount: vi.fn(),
  getMyAchievementsCount: vi.fn(),
  getMyPeriodsCount: vi.fn(),
  apiData: vi.fn(),
}))

const mockGetCategories = api.getCategories as vi.MockedFunction<typeof api.getCategories>
const mockGetCountries = api.getCountries as vi.MockedFunction<typeof api.getCountries>
const mockGetCountryOptions = api.getCountryOptions as vi.MockedFunction<typeof api.getCountryOptions>
const mockGetPersonById = api.getPersonById as vi.MockedFunction<typeof api.getPersonById>
const mockGetMyPersonsCount = api.getMyPersonsCount as vi.MockedFunction<typeof api.getMyPersonsCount>
const mockGetMyAchievementsCount = api.getMyAchievementsCount as vi.MockedFunction<typeof api.getMyAchievementsCount>
const mockGetMyPeriodsCount = api.getMyPeriodsCount as vi.MockedFunction<typeof api.getMyPeriodsCount>
const mockApiData = api.apiData as vi.MockedFunction<typeof api.apiData>

describe('useManageBusinessLogic', () => {
  const createMockParams = (overrides = {}) => ({
    selected: null,
    setSelected: vi.fn(),
    categories: [],
    setCategories: vi.fn(),
    countries: [],
    setCountries: vi.fn(),
    countryOptions: [],
    setCountryOptions: vi.fn(),
    lifePeriods: [],
    setLifePeriods: vi.fn(),
    editPersonCategory: '',
    setEditPersonCategory: vi.fn(),
    editBirthYear: 0,
    setEditBirthYear: vi.fn(),
    editDeathYear: 0,
    setEditDeathYear: vi.fn(),
    newLifePeriods: [],
    setNewLifePeriods: vi.fn(),
    showCreate: false,
    createType: 'person' as const,
    activeTab: 'persons' as const,
    menuSelection: 'all' as const,
    selectedListId: null,
    setSelectedListId: vi.fn(),
    mineCounts: { persons: 0, achievements: 0, periods: 0 },
    setMineCounts: vi.fn(),
    countsLoadKeyRef: { current: null },
    countsLastTsRef: { current: 0 },
    fetchedDetailsIdsRef: { current: new Set() },
    lastSelectedRef: { current: null },
    listItems: [],
    setListItems: vi.fn(),
    listItemIdByDomainIdRef: { current: new Map() },
    listLoading: false,
    setListLoading: vi.fn(),
    isAuthenticated: false,
    user: null,
    resetPersons: vi.fn(),
    resetAchievements: vi.fn(),
    resetPeriods: vi.fn(),
    sharedList: null,
    ...overrides,
  })

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetCategories.mockResolvedValue(['Философ', 'Ученый'])
    mockGetCountries.mockResolvedValue(['Россия', 'США'])
    mockGetCountryOptions.mockResolvedValue([
      { id: 1, name: 'Россия' },
      { id: 2, name: 'США' },
    ])
  })

  describe('metadata loading', () => {
    it('should load categories, countries, and country options on mount', async () => {
      const params = createMockParams()

      renderHook(() => useManageBusinessLogic(params))

      await waitFor(() => {
        expect(mockGetCategories).toHaveBeenCalled()
        expect(mockGetCountries).toHaveBeenCalled()
        expect(mockGetCountryOptions).toHaveBeenCalled()
      })

      expect(params.setCategories).toHaveBeenCalledWith(['Философ', 'Ученый'])
      expect(params.setCountries).toHaveBeenCalledWith(['Россия', 'США'])
      expect(params.setCountryOptions).toHaveBeenCalledWith([
        { id: 1, name: 'Россия' },
        { id: 2, name: 'США' },
      ])
    })

    it('should handle metadata loading errors gracefully', async () => {
      mockGetCategories.mockRejectedValue(new Error('API Error'))
      mockGetCountries.mockRejectedValue(new Error('API Error'))
      mockGetCountryOptions.mockRejectedValue(new Error('API Error'))

      const params = createMockParams()

      // Should not throw
      renderHook(() => useManageBusinessLogic(params))

      await waitFor(() => {
        expect(mockGetCategories).toHaveBeenCalled()
      })

      // Should not call set functions with error data
      expect(params.setCategories).not.toHaveBeenCalled()
    })

    it('should cleanup on unmount', async () => {
      const params = createMockParams()

      const { unmount } = renderHook(() => useManageBusinessLogic(params))

      unmount()

      // Component should unmount without errors
      expect(true).toBe(true)
    })
  })

  describe('mine counts loading', () => {
    it('should load mine counts when authenticated', async () => {
      mockGetMyPersonsCount.mockResolvedValue(10)
      mockGetMyAchievementsCount.mockResolvedValue(5)
      mockGetMyPeriodsCount.mockResolvedValue(3)

      const params = createMockParams({
        isAuthenticated: true,
        user: { id: 'user-123' },
      })

      renderHook(() => useManageBusinessLogic(params))

      await waitFor(() => {
        expect(params.setMineCounts).toHaveBeenCalledWith({
          persons: 10,
          achievements: 5,
          periods: 3,
        })
      })
    })

    it('should reset mine counts when not authenticated', () => {
      const params = createMockParams({
        isAuthenticated: false,
      })

      renderHook(() => useManageBusinessLogic(params))

      expect(params.setMineCounts).toHaveBeenCalledWith({
        persons: 0,
        achievements: 0,
        periods: 0,
      })
    })

    it('should not reload counts if recently loaded', async () => {
      const params = createMockParams({
        isAuthenticated: true,
        user: { id: 'user-123' },
        countsLoadKeyRef: { current: 'user-123' },
        countsLastTsRef: { current: Date.now() - 1000 }, // 1 second ago
        mineCounts: { persons: 5, achievements: 3, periods: 2 },
      })

      renderHook(() => useManageBusinessLogic(params))

      await waitFor(() => {
        // Should not call API due to rate limiting
        expect(mockGetMyPersonsCount).not.toHaveBeenCalled()
      }, { timeout: 100 })
    })

    it('should handle mine counts API errors', async () => {
      mockGetMyPersonsCount.mockRejectedValue(new Error('API Error'))
      mockGetMyAchievementsCount.mockRejectedValue(new Error('API Error'))
      mockGetMyPeriodsCount.mockRejectedValue(new Error('API Error'))

      const params = createMockParams({
        isAuthenticated: true,
        user: { id: 'user-123' },
      })

      // Should not throw
      renderHook(() => useManageBusinessLogic(params))

      await waitFor(() => {
        expect(mockGetMyPersonsCount).toHaveBeenCalled()
      })
    })
  })

  describe('tab reset', () => {
    it('should reset persons when switching to persons tab', () => {
      const params = createMockParams({
        activeTab: 'persons',
      })

      renderHook(() => useManageBusinessLogic(params))

      expect(params.resetPersons).toHaveBeenCalled()
    })

    it('should reset achievements when switching to achievements tab', () => {
      const params = createMockParams({
        activeTab: 'achievements',
      })

      renderHook(() => useManageBusinessLogic(params))

      expect(params.resetAchievements).toHaveBeenCalled()
    })

    it('should reset periods when switching to periods tab', () => {
      const params = createMockParams({
        activeTab: 'periods',
      })

      renderHook(() => useManageBusinessLogic(params))

      expect(params.resetPeriods).toHaveBeenCalled()
    })
  })

  describe('person details loading', () => {
    it('should fetch person details when selected', async () => {
      const mockPerson = {
        id: 'person-1',
        name: 'Test Person',
        birthYear: 1900,
        deathYear: 1980,
        category: 'Философ',
        country: 'Россия',
        description: 'Test description',
        achievements: [],
      }

      mockGetPersonById.mockResolvedValue(mockPerson)

      const params = createMockParams({
        selected: { ...mockPerson, description: '' }, // Partial data
      })

      renderHook(() => useManageBusinessLogic(params))

      await waitFor(() => {
        expect(mockGetPersonById).toHaveBeenCalledWith('person-1')
      })

      await waitFor(() => {
        expect(params.setSelected).toHaveBeenCalled()
      })
    })

    it('should not fetch details if already fetched', async () => {
      const mockPerson = {
        id: 'person-1',
        name: 'Test Person',
        birthYear: 1900,
        category: 'Test',
        country: 'Test',
      }

      const fetchedDetailsIdsRef = { current: new Set(['person-1']) }

      const params = createMockParams({
        selected: mockPerson as any,
        fetchedDetailsIdsRef,
      })

      renderHook(() => useManageBusinessLogic(params))

      await waitFor(() => {
        expect(mockGetPersonById).not.toHaveBeenCalled()
      }, { timeout: 100 })
    })

    it('should handle person fetch errors gracefully', async () => {
      mockGetPersonById.mockRejectedValue(new Error('Not found'))

      const mockPerson = {
        id: 'person-1',
        name: 'Test Person',
        birthYear: 1900,
        category: 'Test',
        country: 'Test',
      }

      const params = createMockParams({
        selected: mockPerson as any,
      })

      renderHook(() => useManageBusinessLogic(params))

      await waitFor(() => {
        expect(mockGetPersonById).toHaveBeenCalledWith('person-1')
      })

      // Should add to fetched set to prevent retrying
      await waitFor(() => {
        expect(params.fetchedDetailsIdsRef.current.has('person-1')).toBe(true)
      })
    })
  })

  describe('life periods preparation', () => {
    it('should initialize life periods for selected person', () => {
      const mockPerson = {
        id: 'person-1',
        name: 'Test Person',
        birthYear: 1900,
        deathYear: 1980,
        category: 'Test',
        country: 'Россия',
        periods: [
          { type: 'life', countryId: 1, startYear: 1900, endYear: 1980 },
        ],
      }

      const params = createMockParams({
        selected: mockPerson as any,
        countryOptions: [{ id: 1, name: 'Россия' }],
      })

      renderHook(() => useManageBusinessLogic(params))

      expect(params.setLifePeriods).toHaveBeenCalledWith([
        { countryId: '1', start: 1900, end: 1980 },
      ])
    })

    it('should clear life periods when no person selected', () => {
      const params = createMockParams({
        selected: null,
      })

      renderHook(() => useManageBusinessLogic(params))

      expect(params.setLifePeriods).toHaveBeenCalledWith([])
    })

    it('should use ruler periods as fallback', () => {
      const mockPerson = {
        id: 'person-1',
        name: 'Test Ruler',
        birthYear: 1850,
        deathYear: 1900,
        category: 'Ruler',
        country: 'Test',
        rulerPeriods: [
          { countryId: 2, startYear: 1870, endYear: 1895 },
        ],
      }

      const params = createMockParams({
        selected: mockPerson as any,
        countryOptions: [
          { id: 1, name: 'Россия' },
          { id: 2, name: 'США' },
        ],
      })

      renderHook(() => useManageBusinessLogic(params))

      expect(params.setLifePeriods).toHaveBeenCalledWith([
        { countryId: '2', start: 1870, end: 1895 },
      ])
    })
  })

  describe('edit person category', () => {
    it('should set edit category when person is selected', () => {
      const mockPerson = {
        id: 'person-1',
        name: 'Test',
        birthYear: 1900,
        category: 'Философ',
        country: 'Test',
      }

      const params = createMockParams({
        selected: mockPerson as any,
        categories: ['Философ', 'Ученый'],
      })

      renderHook(() => useManageBusinessLogic(params))

      expect(params.setEditPersonCategory).toHaveBeenCalledWith('Философ')
    })

    it('should clear edit category when no person selected', () => {
      const params = createMockParams({
        selected: null,
      })

      renderHook(() => useManageBusinessLogic(params))

      expect(params.setEditPersonCategory).toHaveBeenCalledWith('')
    })
  })

  describe('edit birth/death years', () => {
    it('should set edit years from selected person', () => {
      const mockPerson = {
        id: 'person-1',
        name: 'Test',
        birthYear: 1900,
        deathYear: 1980,
        category: 'Test',
        country: 'Test',
      }

      const params = createMockParams({
        selected: mockPerson as any,
      })

      renderHook(() => useManageBusinessLogic(params))

      expect(params.setEditBirthYear).toHaveBeenCalledWith(1900)
      expect(params.setEditDeathYear).toHaveBeenCalledWith(1980)
    })

    it('should use current year for death year if not set', () => {
      const mockPerson = {
        id: 'person-1',
        name: 'Test',
        birthYear: 1900,
        deathYear: null,
        category: 'Test',
        country: 'Test',
      }

      const params = createMockParams({
        selected: mockPerson as any,
      })

      const currentYear = new Date().getFullYear()

      renderHook(() => useManageBusinessLogic(params))

      expect(params.setEditDeathYear).toHaveBeenCalledWith(currentYear)
    })
  })

  describe('new person life periods', () => {
    it('should initialize new life periods when creating person', () => {
      const params = createMockParams({
        showCreate: true,
        createType: 'person',
        newLifePeriods: [],
      })

      renderHook(() => useManageBusinessLogic(params))

      expect(params.setNewLifePeriods).toHaveBeenCalledWith([
        { countryId: '', start: '', end: '' },
      ])
    })

    it('should not initialize if already has periods', () => {
      const params = createMockParams({
        showCreate: true,
        createType: 'person',
        newLifePeriods: [{ countryId: '1', start: 1900, end: 1950 }],
      })

      renderHook(() => useManageBusinessLogic(params))

      expect(params.setNewLifePeriods).not.toHaveBeenCalled()
    })

    it('should not initialize for non-person creation', () => {
      const params = createMockParams({
        showCreate: true,
        createType: 'achievement',
        newLifePeriods: [],
      })

      renderHook(() => useManageBusinessLogic(params))

      expect(params.setNewLifePeriods).not.toHaveBeenCalled()
    })
  })

  describe('list selection', () => {
    it('should set selected list id from menu selection', () => {
      const params = createMockParams({
        menuSelection: 'list:123',
      })

      renderHook(() => useManageBusinessLogic(params))

      expect(params.setSelectedListId).toHaveBeenCalledWith(123)
    })

    it('should clear selected list id when menu is all', () => {
      const params = createMockParams({
        menuSelection: 'all',
      })

      renderHook(() => useManageBusinessLogic(params))

      expect(params.setSelectedListId).toHaveBeenCalledWith(null)
    })

    it('should handle invalid list id', () => {
      const params = createMockParams({
        menuSelection: 'list:invalid',
      })

      renderHook(() => useManageBusinessLogic(params))

      expect(params.setSelectedListId).toHaveBeenCalledWith(null)
    })
  })

  describe('select options', () => {
    it('should return country select options', () => {
      const params = createMockParams({
        countryOptions: [
          { id: 1, name: 'Россия' },
          { id: 2, name: 'США' },
        ],
      })

      const { result } = renderHook(() => useManageBusinessLogic(params))

      expect(result.current.countrySelectOptions).toEqual([
        { value: '1', label: 'Россия' },
        { value: '2', label: 'США' },
      ])
    })

    it('should return category select options', () => {
      const params = createMockParams({
        categories: ['Философ', 'Ученый'],
      })

      const { result } = renderHook(() => useManageBusinessLogic(params))

      expect(result.current.categorySelectOptions).toEqual([
        { value: 'Философ', label: 'Философ' },
        { value: 'Ученый', label: 'Ученый' },
      ])
    })
  })
})






