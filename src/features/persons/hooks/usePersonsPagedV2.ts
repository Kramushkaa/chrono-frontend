import { useMemo, useState, useCallback, useEffect } from 'react'
import { Person } from 'shared/types'
import { useApiData, useApiDataSimple } from 'hooks/useApiData'

interface UsePersonsPagedQuery {
  q?: string
  category?: string
  country?: string
  startYear?: number
  endYear?: number
}

export function usePersonsPagedV2(query: UsePersonsPagedQuery, enabled: boolean = true) {
  const [fallbackAll, setFallbackAll] = useState<Person[] | null>(null)
  
  // Создаем уникальный ключ для отслеживания изменений query
  const queryKey = JSON.stringify(query)
  
  // Сбрасываем fallback данные при изменении query
  useEffect(() => {
    setFallbackAll(null)
  }, [queryKey])

  // Формируем параметры запроса
  const queryParams = useMemo(() => {
    const params: Record<string, string> = {}
    if (query.q) params.q = query.q  // Используем q как параметр поиска
    if (query.category) params.category = query.category
    if (query.country) params.country = query.country
    if (typeof query.startYear === 'number') params.startYear = String(query.startYear)
    if (typeof query.endYear === 'number') params.endYear = String(query.endYear)
    return params
  }, [query])

  // Обработка ошибок с fallback логикой
  const handleError = useCallback(async (error: Error, endpoint: string) => {
    console.warn('API error, trying fallback:', error.message)
    
    try {
      // Пытаемся загрузить все данные и фильтровать на клиенте
      const fallbackResponse = await fetch(`${endpoint}?limit=10000`)
      if (!fallbackResponse.ok) return
      
      const fallbackData = await fallbackResponse.json().catch(() => [])
      const allPersons: Person[] = Array.isArray(fallbackData) ? fallbackData : (fallbackData.data || [])
      
      // Применяем фильтры на клиенте
      const filtered = allPersons.filter((person: Person) => {
        if (query.q) {
          const searchText = `${person.name} ${person.country} ${person.category}`.toLowerCase()
          if (!searchText.includes(query.q.toLowerCase())) return false
        }
        if (query.category && person.category !== query.category) return false
        if (query.country) {
          const personCountries = (person.country || '').split('/').map(s => s.trim())
          if (!personCountries.includes(query.country)) return false
        }
        return true
      }).sort((a: Person, b: Person) => a.name.localeCompare(b.name))
      
      setFallbackAll(filtered)
      return filtered
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError)
      return []
    }
  }, [query.q, query.category, query.country])

  // Используем универсальный хук
  const [state, actions] = useApiData<Person>({
    endpoint: '/api/persons',
    enabled: enabled && !fallbackAll,
    queryParams,
    pageSize: 50,
    dedupeBy: (person) => person.id,
    onError: (error) => {
      // Обрабатываем ошибку через fallback
      handleError(error, '/api/persons')
    }
  })

  // Если есть fallback данные, используем их
  if (fallbackAll) {
    return {
      items: fallbackAll,
      isLoading: false,
      hasMore: false,
      loadMore: () => {},
      reset: () => setFallbackAll(null)
    }
  }

  return {
    items: state.items,
    isLoading: state.isLoading,
    hasMore: state.hasMore,
    loadMore: actions.loadMore,
    reset: actions.reset
  }
}

// Хук для простого использования без сложной логики
export function usePersonsSimple(query: UsePersonsPagedQuery, enabled: boolean = true) {
  const queryParams = useMemo(() => {
    const params: Record<string, string> = {}
    if (query.q) params.q = query.q  // Используем q как параметр поиска
    if (query.category) params.category = query.category
    if (query.country) params.country = query.country
    if (typeof query.startYear === 'number') params.startYear = String(query.startYear)
    if (typeof query.endYear === 'number') params.endYear = String(query.endYear)
    return params
  }, [query])

  const { data, isLoading, error, refetch } = useApiDataSimple<Person>({
    endpoint: '/api/persons',
    enabled,
    queryParams
  })

  return {
    items: data || [],
    isLoading,
    error,
    refetch
  }
}
