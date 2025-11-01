import { useMemo } from 'react'
import { useApiData } from './useApiData'

export type PeriodTile = {
  id: number
  person_id?: string | null
  person_name?: string | null
  country_id?: number | null
  country_name?: string | null
  start_year: number
  end_year: number | null
  period_type: 'life' | 'ruler' | string
}

export function usePeriods(params: { query: string; type?: 'life' | 'ruler' | '' }, enabled: boolean = true) {
  const q = useMemo(() => params.query.trim(), [params.query])
  const t = useMemo(() => (params.type || '').trim(), [params.type])
  
  const queryParams = useMemo(() => {
    const result: Record<string, string> = {}
    if (q.length > 0) result.q = q
    if (t === 'life' || t === 'ruler') result.type = t
    return result
  }, [q, t])
  
  const [state, actions] = useApiData<PeriodTile>({
    endpoint: '/api/periods',
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
    reset: actions.reset
  }
}





