import { renderHook, waitFor } from '@testing-library/react'
import { useManageBusinessLogic } from '../useManageBusinessLogic'
import * as meta from 'shared/api/meta'
import * as persons from 'shared/api/persons'
import * as achievements from 'shared/api/achievements'
import * as periods from 'shared/api/periods'
import * as core from 'shared/api/core'

const countsStub = {
  mineCounts: { persons: 0, achievements: 0, periods: 0 },
  setMineCounts: vi.fn(),
  countsLoadKeyRef: { current: null as string | null },
  countsLastTsRef: { current: 0 },
}

const selectionStub = {
  activeTab: 'persons' as const,
  setActiveTab: vi.fn(),
  menuSelection: 'all' as const,
  setMenuSelection: vi.fn(),
  selectedListId: null as number | null,
  setSelectedListId: vi.fn(),
  listItems: [] as any[],
  setListItems: vi.fn(),
  listItemIdByDomainIdRef: { current: new Map<string, number>() },
  listLoading: false,
  setListLoading: vi.fn(),
}

const personEditorStub = {
  selected: null,
  setSelected: vi.fn(),
  lastSelectedRef: { current: null },
  categories: [] as string[],
  setCategories: vi.fn(),
  countries: [] as string[],
  setCountries: vi.fn(),
  countryOptions: [] as any[],
  setCountryOptions: vi.fn(),
  lifePeriods: [] as any[],
  setLifePeriods: vi.fn(),
  editPersonCategory: '',
  setEditPersonCategory: vi.fn(),
  editBirthYear: 0,
  setEditBirthYear: vi.fn(),
  editDeathYear: 0,
  setEditDeathYear: vi.fn(),
  newLifePeriods: [] as any[],
  setNewLifePeriods: vi.fn(),
  fetchedDetailsIdsRef: { current: new Set<string>() },
}

vi.mock('../../context/ManageStateContext', () => ({
  useManageCounts: () => countsStub,
  useListSelection: () => selectionStub,
  usePersonEditorState: () => personEditorStub,
}))

vi.mock('shared/api/meta', () => ({
  getCategories: vi.fn(),
  getCountries: vi.fn(),
  getCountryOptions: vi.fn(),
}))
vi.mock('shared/api/persons', () => ({
  getPersonById: vi.fn(),
  getMyPersonsCount: vi.fn(),
}))
vi.mock('shared/api/achievements', () => ({
  getMyAchievementsCount: vi.fn(),
}))
vi.mock('shared/api/periods', () => ({
  getMyPeriodsCount: vi.fn(),
}))
vi.mock('shared/api/core', () => ({
  apiData: vi.fn(),
}))

const mockGetCategories = meta.getCategories as vi.MockedFunction<typeof meta.getCategories>
const mockGetCountries = meta.getCountries as vi.MockedFunction<typeof meta.getCountries>
const mockGetCountryOptions = meta.getCountryOptions as vi.MockedFunction<typeof meta.getCountryOptions>
const mockGetMyPersonsCount = persons.getMyPersonsCount as vi.MockedFunction<typeof persons.getMyPersonsCount>
const mockGetMyAchievementsCount =
  achievements.getMyAchievementsCount as vi.MockedFunction<typeof achievements.getMyAchievementsCount>
const mockGetMyPeriodsCount = periods.getMyPeriodsCount as vi.MockedFunction<typeof periods.getMyPeriodsCount>
const mockApiData = core.apiData as vi.MockedFunction<typeof core.apiData>

describe('useManageBusinessLogic', () => {
  const baseParams = {
    isAuthenticated: false,
    user: null,
    resetPersons: vi.fn(),
    resetAchievements: vi.fn(),
    resetPeriods: vi.fn(),
    sharedList: null,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    countsStub.setMineCounts.mockReset()
    selectionStub.setListItems.mockReset()
    selectionStub.setSelectedListId.mockReset()
    selectionStub.menuSelection = 'all'
    selectionStub.selectedListId = null
    personEditorStub.setCategories.mockReset()
    personEditorStub.setCountries.mockReset()
    personEditorStub.setCountryOptions.mockReset()
  })

  it('loads metadata on mount', async () => {
    mockGetCategories.mockResolvedValue(['Категория'])
    mockGetCountries.mockResolvedValue(['Страна'])
    mockGetCountryOptions.mockResolvedValue([{ id: 1, name: 'Россия' }])

    renderHook(() => useManageBusinessLogic(baseParams))

    await waitFor(() => {
      expect(personEditorStub.setCategories).toHaveBeenCalledWith(['Категория'])
      expect(personEditorStub.setCountries).toHaveBeenCalledWith(['Страна'])
      expect(personEditorStub.setCountryOptions).toHaveBeenCalledWith([{ id: 1, name: 'Россия' }])
    })
  })

  it('fetches counts when authenticated user present', async () => {
    mockGetMyPersonsCount.mockResolvedValue(3)
    mockGetMyAchievementsCount.mockResolvedValue(2)
    mockGetMyPeriodsCount.mockResolvedValue(1)

    renderHook(() =>
      useManageBusinessLogic({
        ...baseParams,
        isAuthenticated: true,
        user: { id: 42 } as any,
      })
    )

    await waitFor(() => {
      expect(countsStub.setMineCounts).toHaveBeenCalledWith({ persons: 3, achievements: 2, periods: 1 })
    })
  })

  it('loads list items when menuSelection points to list', async () => {
    selectionStub.menuSelection = 'list:1'
    selectionStub.selectedListId = 1
    mockApiData.mockResolvedValue([{ id: 10, item_type: 'person', person_id: 'abc' }])
    mockGetMyPersonsCount.mockResolvedValue(0)
    mockGetMyAchievementsCount.mockResolvedValue(0)
    mockGetMyPeriodsCount.mockResolvedValue(0)

    renderHook(() =>
      useManageBusinessLogic({
        ...baseParams,
        isAuthenticated: true,
        user: { id: 1 } as any,
      })
    )

    await waitFor(() => {
      expect(selectionStub.setListItems).toHaveBeenCalled()
    })
  })
})

