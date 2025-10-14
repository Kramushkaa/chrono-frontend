import { useMemo } from 'react'
import type { Person } from 'shared/types'

interface TimeRange {
  start: number
  end: number
}

interface TimelineBounds {
  minYear: number
  maxYear: number
  totalYears: number
  effectiveMinYear: number
  effectiveMaxYear: number
}

/**
 * Calculate timeline bounds based on sorted data and time range
 * Optimized with useMemo
 */
export function useTimelineBounds(
  sortedData: Person[],
  timeRange: TimeRange,
  hideEmptyCenturies: boolean
): TimelineBounds {
  return useMemo(() => {
    const currentYear = new Date().getFullYear()

    if (sortedData.length === 0) {
      return {
        minYear: timeRange.start,
        maxYear: timeRange.end,
        totalYears: timeRange.end - timeRange.start,
        effectiveMinYear: timeRange.start,
        effectiveMaxYear: timeRange.end,
      }
    }

    const minYear = Math.min(...sortedData.map((p) => p.birthYear), timeRange.start)
    const maxYear = Math.max(...sortedData.map((p) => p.deathYear ?? currentYear), timeRange.end)
    const totalYears = maxYear - minYear

    const effectiveMinYear = hideEmptyCenturies
      ? Math.min(...sortedData.map((p) => p.birthYear))
      : minYear

    const effectiveMaxYear = hideEmptyCenturies
      ? Math.max(...sortedData.map((p) => p.deathYear ?? currentYear))
      : maxYear

    return {
      minYear,
      maxYear,
      totalYears,
      effectiveMinYear,
      effectiveMaxYear,
    }
  }, [sortedData, timeRange.start, timeRange.end, hideEmptyCenturies])
}

