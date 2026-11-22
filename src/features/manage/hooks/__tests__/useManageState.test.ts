import { renderHook, act } from '@testing-library/react'
import { useManageState } from '../useManageState'
import type { Person } from 'shared/types'

describe('useManageState', () => {
  const createHook = () => renderHook(() => useManageState())

  it('returns slice-based defaults', () => {
    const { result } = createHook()
    expect(result.current.sidebar.isScrolled).toBe(false)
    expect(result.current.sidebar.showControls).toBe(false)
    expect(result.current.sidebar.sidebarCollapsed).toBe(false)

    expect(result.current.selection.activeTab).toBe('persons')
    expect(result.current.selection.menuSelection).toBe('all')
    expect(result.current.selection.selectedListId).toBeNull()

    expect(result.current.counts.mineCounts).toEqual({ persons: 0, achievements: 0, periods: 0 })

    expect(result.current.personEditor.selected).toBeNull()
    expect(result.current.personEditor.categories).toEqual([])
    expect(result.current.personEditor.countries).toEqual([])
    expect(result.current.personEditor.countryOptions).toEqual([])
  })

  it('updates selection slice', () => {
    const { result } = createHook()

    act(() => {
      result.current.selection.setActiveTab('achievements')
      result.current.selection.setMenuSelection('mine')
      result.current.selection.setSelectedListId(42)
    })

    expect(result.current.selection.activeTab).toBe('achievements')
    expect(result.current.selection.menuSelection).toBe('mine')
    expect(result.current.selection.selectedListId).toBe(42)
  })

  it('updates sidebar controls', () => {
    const { result } = createHook()

    act(() => {
      result.current.sidebar.setShowControls(true)
      result.current.sidebar.setSidebarCollapsed(true)
    })

    expect(result.current.sidebar.showControls).toBe(true)
    expect(result.current.sidebar.sidebarCollapsed).toBe(true)
  })

  it('updates person editor selection', () => {
    const { result } = createHook()
    const mockPerson: Person = {
      id: '123',
      name: 'Test',
      birthYear: 1900,
      deathYear: 1980,
      category: 'Test',
      country: 'Country',
      description: 'Desc',
      achievements: [],
    }

    act(() => {
      result.current.personEditor.setSelected(mockPerson)
    })

    expect(result.current.personEditor.selected).toEqual(mockPerson)
    expect(result.current.personEditor.lastSelectedRef.current).toEqual(mockPerson)
  })

  it('updates counts slice', () => {
    const { result } = createHook()

    act(() => {
      result.current.counts.setMineCounts({ persons: 1, achievements: 2, periods: 3 })
    })

    expect(result.current.counts.mineCounts).toEqual({ persons: 1, achievements: 2, periods: 3 })
  })
})

