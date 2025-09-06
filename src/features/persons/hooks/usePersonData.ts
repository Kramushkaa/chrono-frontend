import { useApiDataSimple } from 'hooks/useApiData'

interface Achievement {
  id: number
  year: number
  description: string
  wikipedia_url?: string | null
  image_url?: string | null
  title?: string | null
}

interface Period {
  id: number
  start_year: number
  end_year: number | null
  period_type: 'life' | 'ruler' | string
  country_id?: number | null
  country_name?: string | null
}

// Хук для загрузки достижений личности
export function usePersonAchievementsData(personId: string | null) {
  const { data: achievements, isLoading, error, refetch } = useApiDataSimple<Achievement>({
    endpoint: personId ? `/api/persons/${personId}/achievements` : '',
    enabled: !!personId,
    cacheKey: personId ? `person-achievements-data:${personId}` : undefined
  })

  return {
    achievements: achievements || [],
    isLoading,
    error,
    refetch
  }
}

// Хук для загрузки периодов личности
export function usePersonPeriodsData(personId: string | null) {
  const { data: periods, isLoading, error, refetch } = useApiDataSimple<Period>({
    endpoint: personId ? `/api/persons/${personId}/periods` : '',
    enabled: !!personId,
    cacheKey: personId ? `person-periods-data:${personId}` : undefined
  })

  return {
    periods: periods || [],
    isLoading,
    error,
    refetch
  }
}

// Хук для загрузки всех данных личности
export function usePersonAllData(personId: string | null) {
  const achievements = usePersonAchievementsData(personId)
  const periods = usePersonPeriodsData(personId)

  return {
    achievements: achievements.achievements,
    periods: periods.periods,
    isLoading: achievements.isLoading || periods.isLoading,
    error: achievements.error || periods.error,
    refetch: () => {
      achievements.refetch()
      periods.refetch()
    }
  }
}
