/**
 * Performance monitoring utilities for development
 * Helps identify slow renders and performance bottlenecks
 */

const SLOW_RENDER_THRESHOLD = 16 // milliseconds (60fps = 16.67ms per frame)

interface PerformanceMark {
  component: string
  phase: 'mount' | 'update' | 'nested-update'
  duration: number
  timestamp: number
}

// Store performance marks in memory (dev only)
const performanceMarks: PerformanceMark[] = []
const MAX_MARKS = 100

/**
 * Log performance mark
 */
export function logPerformanceMark(mark: PerformanceMark) {
  if (import.meta.env.MODE !== 'production') {
    performanceMarks.push(mark)

    // Keep only last N marks
    if (performanceMarks.length > MAX_MARKS) {
      performanceMarks.shift()
    }

    // Log slow renders
    if (mark.duration > SLOW_RENDER_THRESHOLD && import.meta.env.MODE !== 'production') {
      console.warn(
        `[Performance] Slow ${mark.phase} detected in ${mark.component}: ${mark.duration.toFixed(2)}ms`
      )
    }
  }
}

/**
 * Get all performance marks
 */
export function getPerformanceMarks(): PerformanceMark[] {
  return [...performanceMarks]
}

/**
 * Clear performance marks
 */
export function clearPerformanceMarks() {
  performanceMarks.length = 0
}

/**
 * Get performance statistics
 */
export function getPerformanceStats() {
  if (performanceMarks.length === 0) {
    return null
  }

  const durations = performanceMarks.map((m) => m.duration)
  const avg = durations.reduce((sum, d) => sum + d, 0) / durations.length
  const max = Math.max(...durations)
  const min = Math.min(...durations)
  const slowRenders = performanceMarks.filter((m) => m.duration > SLOW_RENDER_THRESHOLD)

  return {
    totalMarks: performanceMarks.length,
    averageDuration: avg.toFixed(2),
    maxDuration: max.toFixed(2),
    minDuration: min.toFixed(2),
    slowRenders: slowRenders.length,
    slowRenderPercentage: ((slowRenders.length / performanceMarks.length) * 100).toFixed(1),
  }
}

/**
 * Measure function execution time
 */
export function measureExecution<T>(name: string, fn: () => T): T {
  if (import.meta.env.MODE !== 'production') {
    const start = performance.now()
    const result = fn()
    const duration = performance.now() - start

    if (duration > 5) {
      // Log if > 5ms
      console.log(`[Performance] ${name} took ${duration.toFixed(2)}ms`)
    }

    return result
  }

  return fn()
}

/**
 * Measure async function execution time
 */
export async function measureExecutionAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
  if (import.meta.env.MODE !== 'production') {
    const start = performance.now()
    const result = await fn()
    const duration = performance.now() - start

    if (duration > 100) {
      // Log if > 100ms
      console.log(`[Performance] ${name} took ${duration.toFixed(2)}ms`)
    }

    return result
  }

  return fn()
}

/**
 * Print performance report to console
 */
export function printPerformanceReport() {
  if (import.meta.env.MODE !== 'production') {
    const stats = getPerformanceStats()
    if (!stats) {
      console.log('[Performance] No performance data collected yet')
      return
    }

    console.group('📊 Performance Report')
    console.log(`Total renders tracked: ${stats.totalMarks}`)
    console.log(`Average duration: ${stats.averageDuration}ms`)
    console.log(`Min duration: ${stats.minDuration}ms`)
    console.log(`Max duration: ${stats.maxDuration}ms`)
    console.log(`Slow renders (>${SLOW_RENDER_THRESHOLD}ms): ${stats.slowRenders} (${stats.slowRenderPercentage}%)`)

    if (performanceMarks.length > 0) {
      console.group('Recent renders')
      const recent = performanceMarks.slice(-10).reverse()
      recent.forEach((mark) => {
        const emoji = mark.duration > SLOW_RENDER_THRESHOLD ? '🐌' : '✅'
        console.log(`${emoji} ${mark.component} [${mark.phase}]: ${mark.duration.toFixed(2)}ms`)
      })
      console.groupEnd()
    }

    console.groupEnd()
  }
}

// Extend window for dev tools
declare global {
  interface Window {
    __performanceUtils?: {
      getMarks: typeof getPerformanceMarks
      getStats: typeof getPerformanceStats
      printReport: typeof printPerformanceReport
      clear: typeof clearPerformanceMarks
    }
  }
}

// Expose to window for easy access in dev tools
if (typeof window !== 'undefined' && import.meta.env.MODE !== 'production') {
  window.__performanceUtils = {
    getMarks: getPerformanceMarks,
    getStats: getPerformanceStats,
    printReport: printPerformanceReport,
    clear: clearPerformanceMarks,
  }
}

