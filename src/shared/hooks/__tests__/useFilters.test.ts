import { renderHook, act } from '@testing-library/react'
import { useFilters } from '../useFilters'

describe('useFilters', () => {
  it('should initialize with default filters', () => {
    // Clear localStorage to ensure clean state
    localStorage.clear()
    
    const { result } = renderHook(() => useFilters())

    expect(result.current.filters).toEqual({
      showAchievements: true,
      hideEmptyCenturies: false,
      categories: [],
      countries: [],
      timeRange: { start: -800, end: 2000 },
    })
    expect(result.current.groupingType).toBe('category')
  })

  it('should update filters', () => {
    const { result } = renderHook(() => useFilters())

    act(() => {
      result.current.setFilters({
        ...result.current.filters,
        showAchievements: true,
        categories: ['scientists'],
      })
    })

    expect(result.current.filters.showAchievements).toBe(true)
    expect(result.current.filters.categories).toEqual(['scientists'])
  })

  it('should update grouping type', () => {
    const { result } = renderHook(() => useFilters())

    act(() => {
      result.current.setGroupingType('country')
    })

    expect(result.current.groupingType).toBe('country')
  })

  it('should apply year filter', () => {
    const { result } = renderHook(() => useFilters())

    act(() => {
      result.current.setYearInputs({ start: '1900', end: '2000' })
    })

    act(() => {
      result.current.applyYearFilter('start', '1900')
    })

    expect(result.current.filters.timeRange.start).toBe(1900)
  })

  it('should handle invalid year input', () => {
    localStorage.clear()
    const { result } = renderHook(() => useFilters())

    act(() => {
      result.current.applyYearFilter('start', 'invalid')
    })

    // Should not update timeRange with invalid value
    expect(result.current.filters.timeRange.start).toBe(-800)
  })

  it('should reset all filters', () => {
    localStorage.clear()
    const { result } = renderHook(() => useFilters())

    act(() => {
      result.current.setFilters({
        ...result.current.filters,
        showAchievements: false,
        categories: ['scientists'],
        countries: ['Russia'],
        timeRange: { start: 1900, end: 1950 },
      })
    })

    act(() => {
      result.current.resetAllFilters()
    })

    expect(result.current.filters).toEqual({
      showAchievements: true,
      hideEmptyCenturies: false,
      categories: [],
      countries: [],
      timeRange: { start: -800, end: 2000 },
    })
  })

  it('should handle year input changes', () => {
    const { result } = renderHook(() => useFilters())

    act(() => {
      result.current.setYearInputs({ start: '1500', end: '1800' })
    })

    expect(result.current.yearInputs).toEqual({ start: '1500', end: '1800' })
  })

  it('should handle key press on year input', () => {
    localStorage.clear()
    const { result } = renderHook(() => useFilters())

    act(() => {
      result.current.setYearInputs({ start: '1900', end: '2000' })
    })

    const mockEvent = {
      key: 'Enter',
      preventDefault: jest.fn(),
      currentTarget: { 
        value: '1900',
        parentElement: { parentElement: { querySelectorAll: jest.fn(() => []) } },
      },
    } as unknown as React.KeyboardEvent<HTMLInputElement>

    act(() => {
      result.current.handleYearKeyPress('start', mockEvent)
    })

    expect(result.current.filters.timeRange.start).toBe(1900)
  })
})
