import { useState, useEffect, useMemo, useCallback } from 'react'
import { Person } from '../types'
import { getPersons, getCategories, getCountries } from '../services/api'

interface Filters {
  categories: string[]
  countries: string[]
  timeRange: { start: number; end: number }
  showAchievements: boolean
}

export const useTimelineData = (filters: Filters) => {
  const [persons, setPersons] = useState<Person[]>([])
  const [allCategories, setAllCategories] = useState<string[]>([])
  const [allCountries, setAllCountries] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

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

  // Мемоизируем функцию загрузки данных
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)

      // Загружаем персон с учетом фильтров
      const personsData = await getPersons(filtersToApply)
      setPersons(personsData)

      // Загружаем категории и страны только если они еще не загружены
      if (allCategories.length === 0 || allCountries.length === 0) {
        const [categoriesData, countriesData] = await Promise.all([
          getCategories(),
          getCountries()
        ])
        setAllCategories(categoriesData)
        setAllCountries(countriesData)
      }
    } catch (error) {
      console.error("Ошибка при загрузке данных:", error)
    } finally {
      setIsLoading(false)
    }
  }, [filtersToApply, allCategories.length, allCountries.length])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { persons, allCategories, allCountries, isLoading }
} 