import { useMemo } from 'react'
import { useApiData } from './useApiData'

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
  
  const [state, actions] = useApiData<AchievementTile>({
    endpoint: '/api/achievements',
    enabled,
    queryParams: q.length > 0 ? { q } : {},
    dedupeBy: (item) => item.id,
    pageSize: 100
  })

  return {
    items: state.items,
    isLoading: state.isLoading,
    hasMore: state.hasMore,
    loadMore: actions.loadMore
  }
}


