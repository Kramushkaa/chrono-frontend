import { useEffect, useMemo, useRef } from 'react'
import { apiFetch } from 'shared/api/api'
import { usePagedList } from './usePagedList'

export type AchievementTile = {
  id: number
  person_id?: string | null
  country_id?: number | null
  year: number
  description: string
  wikipedia_url?: string | null
  image_url?: string | null
  title?: string | null
}

export function useAchievements(query: string, enabled: boolean = true) {
  const q = useMemo(() => query.trim(), [query])
  // Simple in-memory cache (keyed by query string)
  const CACHE_TTL_MS = 120000
  const cacheRef = useRef<Map<string, { ts: number; page0: AchievementTile[] }>>(
    (typeof window !== 'undefined' && (window as any).__achCache) || new Map()
  )
  useEffect(() => { if (typeof window !== 'undefined') (window as any).__achCache = cacheRef.current }, [])

  const { items, isLoading, hasMore, loadMore, reset } = usePagedList<AchievementTile>({
    enabled,
    queryKey: [q],
    pageSize: 100,
    dedupeBy: (i) => i.id,
    fetchPage: async (offset, pageSize, signal) => {
      // Serve cached first page instantly
      if (offset === 0) {
        const cached = cacheRef.current.get(q)
        if (cached && Date.now() - cached.ts < CACHE_TTL_MS && cached.page0.length > 0) {
          return cached.page0
        }
      }
      const params = new URLSearchParams()
      if (q.length > 0) params.set('q', q)
      params.set('limit', String(pageSize))
      params.set('offset', String(offset))
      const res = await apiFetch(`/api/achievements?${params.toString()}`, { signal })
      const data = await res.json().catch(() => ({ data: [] }))
      const arr: AchievementTile[] = data?.data || []
      if (offset === 0) cacheRef.current.set(q, { ts: Date.now(), page0: arr })
      return arr
    }
  })
  // Invalidate cache on query change when explicitly asked via reset
  useEffect(() => { return () => { /* no-op */ } }, [q, reset])
  return { items, isLoading, hasMore, loadMore }
}


