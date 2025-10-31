import React, { Profiler, ProfilerOnRenderCallback } from 'react'
import { logPerformanceMark } from '../utils/performance'

interface ProfilerWrapperProps {
  id: string
  children: React.ReactNode
  enabled?: boolean
}

/**
 * Wrapper component using React Profiler API
 * Tracks component render performance in development
 *
 * @example
 * <ProfilerWrapper id="TimelinePage">
 *   <TimelinePage />
 * </ProfilerWrapper>
 */
export function ProfilerWrapper({ id, children, enabled = true }: ProfilerWrapperProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onRender = (
    profilerId: any,
    phase: any,
    actualDuration: any,
    baseDuration: any,
    startTime: any,
    commitTime: any,
    interactions: any
  ) => {
    if (process.env.NODE_ENV !== 'production' && enabled) {
      // Log performance mark
      logPerformanceMark({
        component: profilerId,
        phase: phase as 'mount' | 'update' | 'nested-update',
        duration: actualDuration,
        timestamp: commitTime,
      })

      // Additional logging for significant differences
      const difference = actualDuration - baseDuration
      if (difference > 10 && process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.warn(
          `[Profiler] ${profilerId} took ${actualDuration.toFixed(2)}ms (${difference.toFixed(2)}ms slower than base)`
        )
      }

      // Log interactions if present
      if (interactions.size > 0 && process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.log(`[Profiler] ${profilerId} rendered with ${interactions.size} interaction(s)`)
      }
    }
  }

  // In production, just render children without profiling
  if (process.env.NODE_ENV === 'production' || !enabled) {
    return <>{children}</>
  }

  return (
    <Profiler id={id} onRender={onRender as ProfilerOnRenderCallback}>
      {children}
    </Profiler>
  )
}

/**
 * HOC to wrap component with profiler
 *
 * @example
 * export default withProfiler('MyComponent')(MyComponent)
 */
export function withProfiler(id: string, enabled = true) {
  return function <P extends object>(Component: React.ComponentType<P>) {
    return function ProfiledComponent(props: P) {
      return (
        <ProfilerWrapper id={id} enabled={enabled}>
          <Component {...props} />
        </ProfilerWrapper>
      )
    }
  }
}

