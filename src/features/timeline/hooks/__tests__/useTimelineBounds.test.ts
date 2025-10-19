import { renderHook } from '@testing-library/react'
import { useTimelineBounds } from '../useTimelineBounds'
import type { Person } from 'shared/types'

describe('useTimelineBounds', () => {
  const mockTimeRange = { start: -800, end: 2000 }
  
  const createMockPerson = (birthYear: number, deathYear?: number): Person => ({
    id: `person-${birthYear}`,
    name: 'Test Person',
    birthYear,
    deathYear: deathYear ?? null,
    category: 'Test',
    country: 'Test',
    description: 'Test',
    achievements: [],
  })

  it('should return time range bounds when no data', () => {
    const { result } = renderHook(() =>
      useTimelineBounds([], mockTimeRange, false)
    )

    expect(result.current).toEqual({
      minYear: -800,
      maxYear: 2000,
      totalYears: 2800,
      effectiveMinYear: -800,
      effectiveMaxYear: 2000,
    })
  })

  it('should calculate bounds from sorted data', () => {
    const persons = [
      createMockPerson(1900, 1980),
      createMockPerson(1850, 1920),
      createMockPerson(1920, 2000),
    ]

    const { result } = renderHook(() =>
      useTimelineBounds(persons, mockTimeRange, false)
    )

    expect(result.current.minYear).toBe(-800) // From timeRange
    expect(result.current.maxYear).toBe(2000) // From timeRange
    expect(result.current.effectiveMinYear).toBe(-800)
    expect(result.current.effectiveMaxYear).toBe(2000)
  })

  it('should use current year for persons without deathYear', () => {
    const currentYear = new Date().getFullYear()
    const persons = [
      createMockPerson(1990), // No death year (still alive)
    ]

    const { result } = renderHook(() =>
      useTimelineBounds(persons, mockTimeRange, false)
    )

    expect(result.current.maxYear).toBeGreaterThanOrEqual(currentYear)
  })

  it('should hide empty centuries when hideEmptyCenturies is true', () => {
    const persons = [
      createMockPerson(1800, 1850),
      createMockPerson(1900, 1950),
    ]

    const { result } = renderHook(() =>
      useTimelineBounds(persons, { start: 1500, end: 2000 }, true)
    )

    // Effective bounds should be based on data, not timeRange
    expect(result.current.effectiveMinYear).toBe(1800)
    expect(result.current.effectiveMaxYear).toBe(1950)
    // But min/max should still include timeRange
    expect(result.current.minYear).toBeLessThanOrEqual(1500)
  })

  it('should not hide empty centuries when hideEmptyCenturies is false', () => {
    const persons = [
      createMockPerson(1800, 1850),
      createMockPerson(1900, 1950),
    ]

    const { result } = renderHook(() =>
      useTimelineBounds(persons, { start: 1500, end: 2000 }, false)
    )

    expect(result.current.effectiveMinYear).toBe(result.current.minYear)
    expect(result.current.effectiveMaxYear).toBe(result.current.maxYear)
  })

  it('should calculate totalYears correctly', () => {
    const persons = [
      createMockPerson(1900, 2000),
    ]

    const { result } = renderHook(() =>
      useTimelineBounds(persons, mockTimeRange, false)
    )

    expect(result.current.totalYears).toBe(result.current.maxYear - result.current.minYear)
  })

  it('should handle negative years (BC)', () => {
    const persons = [
      createMockPerson(-500, -400),
      createMockPerson(-300, -200),
    ]

    const { result } = renderHook(() =>
      useTimelineBounds(persons, { start: -1000, end: 0 }, false)
    )

    expect(result.current.minYear).toBe(-1000)
    expect(result.current.effectiveMinYear).toBe(-1000)
  })

  it('should memoize result and not recalculate on same inputs', () => {
    const persons = [createMockPerson(1900, 1950)]
    
    const { result, rerender } = renderHook(
      ({ data, range, hide }) => useTimelineBounds(data, range, hide),
      {
        initialProps: {
          data: persons,
          range: mockTimeRange,
          hide: false,
        },
      }
    )

    const firstResult = result.current

    // Rerender with same props
    rerender({ data: persons, range: mockTimeRange, hide: false })

    // Should return same object reference (memoized)
    expect(result.current).toBe(firstResult)
  })

  it('should recalculate when inputs change', () => {
    const persons1 = [createMockPerson(1900, 1950)]
    const persons2 = [createMockPerson(1800, 1850)]
    
    const { result, rerender } = renderHook(
      ({ data, range, hide }) => useTimelineBounds(data, range, hide),
      {
        initialProps: {
          data: persons1,
          range: mockTimeRange,
          hide: false,
        },
      }
    )

    const firstResult = result.current

    // Rerender with different data
    rerender({ data: persons2, range: mockTimeRange, hide: false })

    // Should return different object (recalculated)
    expect(result.current).not.toBe(firstResult)
  })

  it('should handle persons with same birth and death years', () => {
    const persons = [
      createMockPerson(1900, 1900), // Died in birth year
    ]

    const { result } = renderHook(() =>
      useTimelineBounds(persons, mockTimeRange, true)
    )

    expect(result.current.effectiveMinYear).toBe(1900)
    expect(result.current.effectiveMaxYear).toBe(1900)
  })

  it('should extend bounds beyond timeRange if data requires', () => {
    const persons = [
      createMockPerson(500, 600), // Outside initial timeRange
      createMockPerson(2500, 2600), // Outside initial timeRange
    ]

    const { result } = renderHook(() =>
      useTimelineBounds(persons, { start: 1000, end: 2000 }, false)
    )

    expect(result.current.minYear).toBeLessThanOrEqual(500)
    expect(result.current.maxYear).toBeGreaterThanOrEqual(2600)
  })
})

