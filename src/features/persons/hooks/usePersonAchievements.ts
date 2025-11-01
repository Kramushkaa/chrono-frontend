import { useMemo } from 'react'
import { useApiDataSimple } from 'shared/hooks/useApiData'
import { Person } from 'shared/types'

interface Achievement {
  year: number
  wikipedia_url?: string | null
}

export function usePersonAchievements(person: Person | null) {
  const { data: achievements, isLoading, error } = useApiDataSimple<Achievement>({
    endpoint: person ? `/api/persons/${person.id}/achievements` : '',
    enabled: !!person && (!person.achievementsWiki || person.achievementsWiki.length === 0),
    cacheKey: person ? `person-achievements:${person.id}` : undefined
  })

  // Обрабатываем данные достижений
  const achievementsWiki = useMemo(() => {
    if (person?.achievementsWiki && person.achievementsWiki.length > 0) {
      return person.achievementsWiki
    }
    
    if (!achievements) return null
    
    return achievements
      .slice()
      .sort((a: Achievement, b: Achievement) => (a.year ?? 0) - (b.year ?? 0))
      .map((a: Achievement) => (a.wikipedia_url && a.wikipedia_url.trim().length > 0 ? a.wikipedia_url : null))
  }, [person?.achievementsWiki, achievements])

  return {
    achievementsWiki,
    isLoading,
    error
  }
}



