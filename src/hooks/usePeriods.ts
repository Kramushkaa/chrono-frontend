import { useMemo } from 'react'
import { apiFetch } from '../services/api'
import { usePagedList } from './usePagedList'

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
  const { items, isLoading, hasMore, loadMore, reset } = usePagedList<PeriodTile>({
    enabled,
    queryKey: [q, t],
    pageSize: 100,
    dedupeBy: (i) => i.id,
    fetchPage: async (offset, pageSize, signal) => {
      const usp = new URLSearchParams()
      if (q.length > 0) usp.set('q', q)
      if (t === 'life' || t === 'ruler') usp.set('type', t)
      usp.set('limit', String(pageSize))
      usp.set('offset', String(offset))
      const res = await apiFetch(`/api/periods?${usp.toString()}`, { signal })
      const data = await res.json().catch(() => ({ data: [] }))
      const arr: PeriodTile[] = data?.data || []
      return arr
    }
  })
  return { items, isLoading, hasMore, loadMore, reset }
}


