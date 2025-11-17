import { useCallback, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { apiData } from '../api/core'

export interface UseEntityQueryOptions<T, F = Record<string, unknown>> {
  endpoint: string
  filters?: F
  enabled?: boolean
  transform?: (data: unknown[]) => T[]
  cacheKey?: string
  cacheTime?: number
}

export interface UseEntityQueryResult<T> {
  data: T[]
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

const DEFAULT_CACHE_TIME = 60_000

export function useEntityQuery<T, F = Record<string, unknown>>(
  options: UseEntityQueryOptions<T, F>
): UseEntityQueryResult<T> {
  const { endpoint, filters, enabled = true, transform, cacheKey, cacheTime = DEFAULT_CACHE_TIME } = options
  const queryClient = useQueryClient()
  const filterStr = useMemo(() => (filters ? JSON.stringify(filters) : ''), [filters])
  const queryKey = useMemo(() => [cacheKey || endpoint, filterStr], [cacheKey, endpoint, filterStr])

  const { data, isLoading, isFetching, error } = useQuery<T[]>({
    queryKey,
    enabled,
    staleTime: cacheTime,
    gcTime: cacheTime * 2,
    refetchOnWindowFocus: false,
    queryFn: async ({ signal }) => {
      const queryParams = new URLSearchParams()
      if (filters && typeof filters === 'object') {
        Object.entries(filters).forEach(([key, value]) => {
          if (value === undefined || value === null || value === '') return
          if (Array.isArray(value)) {
            queryParams.append(key, value.join(','))
          } else {
            queryParams.append(key, String(value))
          }
        })
      }

      const queryString = queryParams.toString()
      const fullPath = `${endpoint}${queryString ? `?${queryString}` : ''}`
      const responseData = await apiData<unknown[]>(fullPath, { signal })
      return transform ? transform(responseData) : (responseData as T[])
    },
  })

  const refetch = useCallback(() => {
    queryClient.invalidateQueries({ queryKey })
  }, [queryClient, queryKey])

  return {
    data: data ?? [],
    isLoading: isLoading || (isFetching && !data),
    error: (error as Error) ?? null,
    refetch,
  }
}




