import { useMemo } from 'react'
import { apiFetch } from '../services/api'
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
  const { items, isLoading, hasMore, loadMore } = usePagedList<AchievementTile>({
    enabled,
    queryKey: [q],
    pageSize: 100,
    dedupeBy: (i) => i.id,
    fetchPage: async (offset, pageSize, signal) => {
      const params = new URLSearchParams()
      if (q.length > 0) params.set('q', q)
      params.set('limit', String(pageSize))
      params.set('offset', String(offset))
      const res = await apiFetch(`/api/achievements?${params.toString()}`, { signal })
      const data = await res.json().catch(() => ({ data: [] }))
      const arr: AchievementTile[] = data?.data || []
      return arr
    }
  })
  return { items, isLoading, hasMore, loadMore }
}


