import { useEffect, useMemo, useRef } from 'react'
import { apiFetch } from 'shared/api/api'
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
  // Simple in-memory cache (key by q|t for first page)
  const CACHE_TTL_MS = 120000
  const cacheKey = `${q}|${t}`
  const cacheRef = useRef<Map<string, { ts: number; page0: PeriodTile[] }>>(
    (typeof window !== 'undefined' && (window as any).__periodsCache) || new Map()
  )
  useEffect(() => { if (typeof window !== 'undefined') (window as any).__periodsCache = cacheRef.current }, [])

  const { items, isLoading, hasMore, loadMore, reset } = usePagedList<PeriodTile>({
    enabled,
    queryKey: [q, t],
    pageSize: 100,
    dedupeBy: (i) => i.id,
    fetchPage: async (offset, pageSize, signal) => {
      if (offset === 0) {
        const cached = cacheRef.current.get(cacheKey)
        if (cached && Date.now() - cached.ts < CACHE_TTL_MS && cached.page0.length > 0) {
          return cached.page0
        }
      }
      const usp = new URLSearchParams()
      if (q.length > 0) usp.set('q', q)
      if (t === 'life' || t === 'ruler') usp.set('type', t)
      usp.set('limit', String(pageSize))
      usp.set('offset', String(offset))
      const res = await apiFetch(`/api/periods?${usp.toString()}`, { signal })
      const data = await res.json().catch(() => ({ data: [] }))
      const arr: PeriodTile[] = data?.data || []
      if (offset === 0) cacheRef.current.set(cacheKey, { ts: Date.now(), page0: arr })
      return arr
    }
  })
  return { items, isLoading, hasMore, loadMore, reset }
}


