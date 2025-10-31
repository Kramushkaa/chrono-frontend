import React, { useEffect, useRef } from 'react'
import { logPerformanceMark } from '../utils/performance'

interface UsePerformanceMonitorOptions {
  componentName: string
  enabled?: boolean
}

/**
 * Hook to monitor component render performance
 * Logs slow renders in development mode
 *
 * @example
 * function MyComponent() {
 *   usePerformanceMonitor({ componentName: 'MyComponent' })
 *   return <div>Content</div>
 * }
 */
export function usePerformanceMonitor({ componentName, enabled = true }: UsePerformanceMonitorOptions) {
  const renderCountRef = useRef(0)
  const lastRenderTimeRef = useRef(performance.now())
  const mountTimeRef = useRef<number | null>(null)

  useEffect(() => {
    // Record mount time on first render
    if (mountTimeRef.current === null) {
      mountTimeRef.current = performance.now()
    }
  }, [])

  useEffect(() => {
    if (!enabled || import.meta.env.MODE === 'production') {
      return
    }

    const now = performance.now()
    const duration = now - lastRenderTimeRef.current
    lastRenderTimeRef.current = now

    renderCountRef.current += 1
    const isMount = renderCountRef.current === 1

    // Log performance mark
    logPerformanceMark({
      component: componentName,
      phase: isMount ? 'mount' : 'update',
      duration,
      timestamp: now,
    })

    // Log render count for debugging
    if (renderCountRef.current % 10 === 0 && import.meta.env.MODE !== 'production') {
      console.log(`[Performance] ${componentName} rendered ${renderCountRef.current} times`)
    }
  })

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (import.meta.env.MODE !== 'production' && enabled) {
        const totalTime = mountTimeRef.current ? performance.now() - mountTimeRef.current : 0
        console.log(
          `[Performance] ${componentName} unmounted after ${renderCountRef.current} renders (${totalTime.toFixed(2)}ms total)`
        )
      }
    }
  }, [componentName, enabled])
}

/**
 * HOC to wrap component with performance monitoring
 *
 * @example
 * export default withPerformanceMonitor('MyComponent')(MyComponent)
 */
export function withPerformanceMonitor(componentName: string) {
  return function <P extends object>(Component: React.ComponentType<P>) {
    return function PerformanceMonitoredComponent(props: P) {
      usePerformanceMonitor({ componentName })
      return React.createElement(Component, props)
    }
  }
}

