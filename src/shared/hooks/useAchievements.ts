import { useMemo } from 'react'
import { useApiData } from './useApiData'

export interface AchievementTile {
  id: number
  person_id?: string | null
  person_name?: string | null
  year?: number | null
  title?: string | null
  status?: string | null
}

export function useAchievements(query: string, enabled: boolean = true) {
  const q = useMemo(() => (query || '').trim(), [query])

  const queryParams = useMemo(() => {
    const result: Record<string, string> = {}
    if (q.length > 0) result.q = q
    return result
  }, [q])

  const [state, actions] = useApiData<AchievementTile>({
    endpoint: '/api/achievements',
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





