import { useState, useEffect, useMemo } from 'react'
import { Person } from 'shared/types'
import { getPersons, getCategories, getCountries } from 'shared/api/api'

interface QuizFilters {
  categories: string[]
  countries: string[]
  timeRange: { start: number; end: number }
  showAchievements: boolean
}

export const useQuizData = (filters: QuizFilters, enabled: boolean = true) => {
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

  // Загрузка данных
  const loadData = async () => {
    if (!enabled) return

    try {
      setIsLoading(true)
      
      // Загружаем все данные параллельно
      const [personsData, categoriesData, countriesData] = await Promise.all([
        getPersons(filtersToApply),
        getCategories(),
        getCountries()
      ])

      setPersons(personsData)
      setAllCategories(categoriesData)
      setAllCountries(countriesData)
    } catch (error) {
      console.error('Ошибка загрузки данных для игры:', error)
      // В случае ошибки устанавливаем пустые массивы
      setPersons([])
      setAllCategories([])
      setAllCountries([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [enabled, filtersToApply]) // eslint-disable-line react-hooks/exhaustive-deps

  return {
    persons,
    allCategories,
    allCountries,
    isLoading
  }
}
