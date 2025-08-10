import { useEffect, useState, useMemo } from 'react'
import { apiFetch } from '../services/api'

export type AchievementTile = {
  id: number
  person_id?: string | null
  year: number
  description: string
  wikipedia_url?: string | null
  image_url?: string | null
  person_name?: string | null
  person_country?: string | null
}

export function useAchievements(query: string, enabled: boolean = true) {
  const [items, setItems] = useState<AchievementTile[]>([])
  const [isLoading, setIsLoading] = useState(enabled)
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  const q = useMemo(() => query.trim(), [query])

  useEffect(() => {
    setItems([])
    setOffset(0)
    setHasMore(true)
  }, [q])

  useEffect(() => {
    if (!enabled || !hasMore) return
    setIsLoading(true)
    const ctrl = new AbortController()
    const params = new URLSearchParams()
    if (q.length > 0) params.set('q', q)
    params.set('limit', '100')
    params.set('offset', String(offset))
    apiFetch(`/api/achievements?${params.toString()}`, { signal: ctrl.signal })
      .then(r => r.json())
      .then(data => {
        const arr: AchievementTile[] = data?.data || []
        setItems(prev => [...prev, ...arr])
        if (arr.length < 100) setHasMore(false)
      })
      .catch(() => {})
      .finally(() => setIsLoading(false))
    return () => ctrl.abort()
  }, [enabled, q, offset, hasMore])

  const loadMore = () => { if (!isLoading && hasMore) setOffset(o => o + 100) }

  return { items, isLoading, hasMore, loadMore }
}


