import { useState, useEffect } from 'react'
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)

        // Формируем параметры для запроса
        const filtersToApply: any = {}
        if (filters.categories.length > 0) {
          filtersToApply.category = filters.categories.join(',')
        }
        if (filters.countries.length > 0) {
          filtersToApply.country = filters.countries.join(',')
        }
        filtersToApply.startYear = filters.timeRange.start
        filtersToApply.endYear = filters.timeRange.end

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
    }

    fetchData()
  }, [filters, allCategories.length, allCountries.length])

  return { persons, allCategories, allCountries, isLoading }
} 