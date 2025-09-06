import { useMemo } from 'react'
import { useApiData } from './useApiData'
import { Person } from 'shared/types'

interface UsePersonsQuery {
  q?: string
  category?: string
  country?: string
  startYear?: number
  endYear?: number
}

export function usePersons(query: UsePersonsQuery, enabled: boolean = true) {
  // Формируем параметры запроса
  const queryParams = useMemo(() => {
    const params: Record<string, string> = {}
    if (query.q) params.q = query.q
    if (query.category) params.category = query.category
    if (query.country) params.country = query.country
    if (typeof query.startYear === 'number') params.startYear = String(query.startYear)
    if (typeof query.endYear === 'number') params.endYear = String(query.endYear)
    return params
  }, [query.q, query.category, query.country, query.startYear, query.endYear])
  
  const [state, actions] = useApiData<Person>({
    endpoint: '/api/persons',
    enabled,
    queryParams,
    dedupeBy: (item) => item.id,
    pageSize: 100
  })

  return {
    items: state.items,
    isLoading: state.isLoading,
    hasMore: state.hasMore,
    loadMore: actions.loadMore,
    error: state.error,
    reset: actions.reset,
    refetch: actions.refetch
  }
}
