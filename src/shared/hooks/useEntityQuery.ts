import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { apiData } from '../api/core'

export interface UseEntityQueryOptions<T, F = any> {
  /** API endpoint to fetch from */
  endpoint: string
  /** Query filters object */
  filters?: F
  /** Enable/disable the query */
  enabled?: boolean
  /** Transform function to process raw data */
  transform?: (data: any) => T[]
  /** Custom cache key (auto-generated if not provided) */
  cacheKey?: string
  /** Cache TTL in milliseconds (default: 60000) */
  cacheTime?: number
}

export interface UseEntityQueryResult<T> {
  /** Fetched and transformed data */
  data: T[]
  /** Loading state */
  isLoading: boolean
  /** Error object if request failed */
  error: Error | null
  /** Function to manually refetch data (bypasses cache) */
  refetch: () => void
}

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>()
const DEFAULT_CACHE_TIME = 60000 // 1 minute

/**
 * Universal hook for fetching entity data with caching and retry logic
 * 
 * Features:
 * - Automatic caching (60s default TTL)
 * - Request cancellation on unmount
 * - Optional data transformation
 * - Error handling
 * 
 * @example
 * ```typescript
 * const { data, isLoading, error, refetch } = useEntityQuery<Person>({
 *   endpoint: '/api/persons',
 *   filters: { category: 'scientists', limit: 100 },
 *   enabled: true,
 *   transform: (raw) => raw.map(transformPerson)
 * })
 * ```
 */
export function useEntityQuery<T = any, F = any>(
  options: UseEntityQueryOptions<T, F>
): UseEntityQueryResult<T> {
  const { endpoint, filters, enabled = true, transform, cacheKey, cacheTime = DEFAULT_CACHE_TIME } = options

  const [data, setData] = useState<T[]>([])
  const [isLoading, setIsLoading] = useState(enabled)
  const [error, setError] = useState<Error | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  
  // Store transform in ref to avoid triggering re-fetches
  const transformRef = useRef(transform)
  transformRef.current = transform

  // Generate cache key - memoize filter string
  const filterStr = useMemo(() => filters ? JSON.stringify(filters) : '', [filters])
  const currentCacheKey = cacheKey || `${endpoint}:${filterStr}`

  const fetchData = useCallback(async () => {
    if (!enabled) {
      setIsLoading(false)
      return
    }

    // Cancel previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Check cache first
    const cached = cache.get(currentCacheKey)
    if (cached && Date.now() - cached.timestamp < cacheTime) {
      setData(cached.data)
      setIsLoading(false)
      setError(null)
      return
    }

    abortControllerRef.current = new AbortController()

    try {
      setIsLoading(true)
      setError(null)

      // Build query string from filters
      const queryParams = new URLSearchParams()
      if (filters && typeof filters === 'object') {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            if (Array.isArray(value)) {
              queryParams.append(key, value.join(','))
            } else {
              queryParams.append(key, String(value))
            }
          }
        })
      }

      const queryString = queryParams.toString()
      const fullPath = `${endpoint}${queryString ? `?${queryString}` : ''}`

      // Use apiData which handles auth, retry, and proper URL construction
      const responseData = await apiData<any[]>(fullPath, {
        signal: abortControllerRef.current.signal,
      })

      // Transform data if transform function provided (use ref to get current)
      const transformedData = transformRef.current ? transformRef.current(responseData) : (responseData as T[])

      // Update cache
      cache.set(currentCacheKey, { data: transformedData, timestamp: Date.now() })

      setData(transformedData)
      setError(null)
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          // Request was cancelled, don't update state
          return
        }
        setError(err)
      } else {
        setError(new Error('Unknown error occurred'))
      }
    } finally {
      setIsLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, endpoint, currentCacheKey, cacheTime])

  useEffect(() => {
    fetchData()

    // Cleanup: abort request on unmount or when dependencies change
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [fetchData])

  const refetch = useCallback(() => {
    // Invalidate cache for this key
    cache.delete(currentCacheKey)
    fetchData()
  }, [fetchData, currentCacheKey])

  return {
    data,
    isLoading,
    error,
    refetch,
  }
}

// Utility to clear all cache
export function clearEntityQueryCache() {
  cache.clear()
}

// Utility to clear specific cache key
export function clearEntityQueryCacheKey(key: string) {
  cache.delete(key)
}

