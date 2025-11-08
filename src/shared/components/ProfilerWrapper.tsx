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
  const onRender = ((...args: Parameters<ProfilerOnRenderCallback>) => {
    const [profilerId, phase, actualDuration, baseDuration, startTime, commitTime] = args
    if (import.meta.env.MODE !== 'production' && enabled) {
      // Log performance mark
      logPerformanceMark({
        component: profilerId,
        phase: (phase as any) as 'mount' | 'update' | 'nested-update',
        duration: actualDuration,
        timestamp: commitTime,
      })

      // Additional logging for significant differences
      const difference = actualDuration - baseDuration
      if (difference > 10 && import.meta.env.MODE !== 'production') {
        // eslint-disable-next-line no-console
        console.warn(
          `[Profiler] ${profilerId} took ${actualDuration.toFixed(2)}ms (${difference.toFixed(2)}ms slower than base)`
        )
      }

      // Interactions not available in current React types
    }
  }) as ProfilerOnRenderCallback

  // In production, just render children without profiling
  if (import.meta.env.MODE === 'production' || !enabled) {
    return <>{children}</>
  }

  return (
    <Profiler id={id} onRender={onRender}>
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




