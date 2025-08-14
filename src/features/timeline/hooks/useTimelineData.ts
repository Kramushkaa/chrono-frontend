import { useState, useEffect, useMemo, useCallback } from 'react'
import { Person } from 'shared/types'
import { getPersons, getCategories, getCountries } from 'shared/api/api'

interface Filters {
  categories: string[]
  countries: string[]
  timeRange: { start: number; end: number }
  showAchievements: boolean
}

export const useTimelineData = (filters: Filters, enabled: boolean = true) => {
  const [persons, setPersons] = useState<Person[]>([])
  const [allCategories, setAllCategories] = useState<string[]>([])
  const [allCountries, setAllCountries] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(enabled)

  // Мемоизируем параметры фильтров для предотвращения лишних запросов
  const filtersToApply = useMemo(() => {
    const filtersToApply: {
      category?: string;
      country?: string;
      startYear: number;
      endYear: number;
    } = {
      startYear: filters.timeRange.start,
      endYear: filters.timeRange.end
    }
    
    if (filters.categories.length > 0) {
      filtersToApply.category = filters.categories.join(',')
    }
    if (filters.countries.length > 0) {
      filtersToApply.country = filters.countries.join(',')
    }
    
    return filtersToApply
  }, [filters.categories, filters.countries, filters.timeRange.start, filters.timeRange.end])

  // Загружаем список персон при изменении фильтров
  const fetchPersons = useCallback(async () => {
    if (!enabled) { setIsLoading(false); return }
    try {
      setIsLoading(true)
      const personsData = await getPersons(filtersToApply)
      setPersons(personsData)
    } catch (error) {
      console.error("Ошибка при загрузке данных:", error)
    } finally {
      setIsLoading(false)
    }
  }, [enabled, filtersToApply])

  // Загружаем категории и страны один раз при монтировании
  useEffect(() => {
    let aborted = false
    ;(async () => {
      try {
        const [categoriesData, countriesData] = await Promise.all([
          getCategories(),
          getCountries()
        ])
        if (!aborted) {
          setAllCategories(categoriesData)
          setAllCountries(countriesData)
        }
      } catch {}
    })()
    return () => { aborted = true }
  }, [])

  useEffect(() => { fetchPersons() }, [fetchPersons])

  return { persons, allCategories, allCountries, isLoading }
} 