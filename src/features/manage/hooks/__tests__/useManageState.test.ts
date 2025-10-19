import { renderHook, act } from '@testing-library/react'
import { useManageState } from '../useManageState'
import type { Person } from 'shared/types'

describe('useManageState', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useManageState())

    expect(result.current.isScrolled).toBe(false)
    expect(result.current.showControls).toBe(false)
    expect(result.current.activeTab).toBe('persons')
    expect(result.current.selectedListId).toBe(null)
    expect(result.current.mineCounts).toEqual({
      persons: 0,
      achievements: 0,
      periods: 0
    })
    expect(result.current.menuSelection).toBe('all')
    expect(result.current.selected).toBe(null)
    expect(result.current.categories).toEqual([])
    expect(result.current.countries).toEqual([])
    expect(result.current.countryOptions).toEqual([])
    expect(result.current.sidebarCollapsed).toBe(false)
  })

  it('should update activeTab state', () => {
    const { result } = renderHook(() => useManageState())

    act(() => {
      result.current.setActiveTab('achievements')
    })

    expect(result.current.activeTab).toBe('achievements')

    act(() => {
      result.current.setActiveTab('periods')
    })

    expect(result.current.activeTab).toBe('periods')
  })

  it('should update menuSelection state', () => {
    const { result } = renderHook(() => useManageState())

    act(() => {
      result.current.setMenuSelection('mine')
    })

    expect(result.current.menuSelection).toBe('mine')

    act(() => {
      result.current.setMenuSelection('list:123')
    })

    expect(result.current.menuSelection).toBe('list:123')
  })

  it('should update selected person and persist in ref', () => {
    const { result } = renderHook(() => useManageState())
    
    const mockPerson: Person = {
      id: 'person-1',
      name: 'Test Person',
      birthYear: 1900,
      deathYear: 1980,
      category: 'Test',
      country: 'Test Country',
      description: 'Test description',
      achievements: []
    }

    act(() => {
      result.current.setSelected(mockPerson)
    })

    expect(result.current.selected).toEqual(mockPerson)
    expect(result.current.lastSelectedRef.current).toEqual(mockPerson)
  })

  it('should update selected person with function updater', () => {
    const { result } = renderHook(() => useManageState())
    
    const mockPerson: Person = {
      id: 'person-1',
      name: 'Test Person',
      birthYear: 1900,
      deathYear: 1980,
      category: 'Test',
      country: 'Test Country',
      description: 'Test description',
      achievements: []
    }

    act(() => {
      result.current.setSelected(mockPerson)
    })

    act(() => {
      result.current.setSelected((prev) => 
        prev ? { ...prev, name: 'Updated Name' } : null
      )
    })

    expect(result.current.selected?.name).toBe('Updated Name')
    expect(result.current.lastSelectedRef.current?.name).toBe('Updated Name')
  })

  it('should update categories state', () => {
    const { result } = renderHook(() => useManageState())

    const categories = ['Философ', 'Ученый', 'Художник']

    act(() => {
      result.current.setCategories(categories)
    })

    expect(result.current.categories).toEqual(categories)
  })

  it('should update countries state', () => {
    const { result } = renderHook(() => useManageState())

    const countries = ['Россия', 'США', 'Франция']

    act(() => {
      result.current.setCountries(countries)
    })

    expect(result.current.countries).toEqual(countries)
  })

  it('should update countryOptions state', () => {
    const { result } = renderHook(() => useManageState())

    const options = [
      { id: 1, name: 'Россия' },
      { id: 2, name: 'США' }
    ]

    act(() => {
      result.current.setCountryOptions(options)
    })

    expect(result.current.countryOptions).toEqual(options)
  })

  it('should update life periods state', () => {
    const { result } = renderHook(() => useManageState())

    const periods = [
      { countryId: '1', start: 1900, end: 1950 },
      { countryId: '2', start: 1950, end: 1980 }
    ]

    act(() => {
      result.current.setLifePeriods(periods)
    })

    expect(result.current.lifePeriods).toEqual(periods)
  })

  it('should update editBirthYear and editDeathYear', () => {
    const { result } = renderHook(() => useManageState())

    act(() => {
      result.current.setEditBirthYear(1900)
      result.current.setEditDeathYear(1980)
    })

    expect(result.current.editBirthYear).toBe(1900)
    expect(result.current.editDeathYear).toBe(1980)
  })

  it('should update newLifePeriods state', () => {
    const { result } = renderHook(() => useManageState())

    const periods = [{ countryId: '1', start: '', end: '' }]

    act(() => {
      result.current.setNewLifePeriods(periods)
    })

    expect(result.current.newLifePeriods).toEqual(periods)
  })

  it('should update selectedListId state', () => {
    const { result } = renderHook(() => useManageState())

    act(() => {
      result.current.setSelectedListId(42)
    })

    expect(result.current.selectedListId).toBe(42)
  })

  it('should update mineCounts state', () => {
    const { result } = renderHook(() => useManageState())

    const counts = { persons: 10, achievements: 5, periods: 3 }

    act(() => {
      result.current.setMineCounts(counts)
    })

    expect(result.current.mineCounts).toEqual(counts)
  })

  it('should update listItems state', () => {
    const { result } = renderHook(() => useManageState())

    const items = [
      {
        key: 'p:1:1',
        listItemId: 1,
        type: 'person' as const,
        title: 'Test Person',
        subtitle: 'Test Country'
      }
    ]

    act(() => {
      result.current.setListItems(items)
    })

    expect(result.current.listItems).toEqual(items)
  })

  it('should update listLoading state', () => {
    const { result } = renderHook(() => useManageState())

    act(() => {
      result.current.setListLoading(true)
    })

    expect(result.current.listLoading).toBe(true)
  })

  it('should update sidebarCollapsed state', () => {
    const { result } = renderHook(() => useManageState())

    act(() => {
      result.current.setSidebarCollapsed(true)
    })

    expect(result.current.sidebarCollapsed).toBe(true)
  })

  it('should have refs initialized with proper values', () => {
    const { result } = renderHook(() => useManageState())

    expect(result.current.countsLoadKeyRef.current).toBe(null)
    expect(result.current.countsLastTsRef.current).toBe(0)
    expect(result.current.lastSelectedRef.current).toBe(null)
    expect(result.current.listItemIdByDomainIdRef.current).toBeInstanceOf(Map)
    expect(result.current.fetchedDetailsIdsRef.current).toBeInstanceOf(Set)
  })

  it('should update editPersonCategory state', () => {
    const { result } = renderHook(() => useManageState())

    act(() => {
      result.current.setEditPersonCategory('Философ')
    })

    expect(result.current.editPersonCategory).toBe('Философ')
  })

  it('should update showControls state', () => {
    const { result } = renderHook(() => useManageState())

    act(() => {
      result.current.setShowControls(true)
    })

    expect(result.current.showControls).toBe(true)
  })
})

