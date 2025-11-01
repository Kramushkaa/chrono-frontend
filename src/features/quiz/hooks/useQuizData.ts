import { useState, useEffect, useMemo } from 'react'
import { Person } from 'shared/types'
import { useEntityQuery } from 'shared/hooks/useEntityQuery'
import { getCategories, getCountries } from 'shared/api/api'

interface QuizFilters {
  categories: string[]
  countries: string[]
  timeRange: { start: number; end: number }
  showAchievements: boolean
}

export const useQuizData = (filters: QuizFilters, enabled: boolean = true) => {
  const [allCategories, setAllCategories] = useState<string[]>([])
  const [allCountries, setAllCountries] = useState<string[]>([])

  // Мемоизируем параметры фильтров для предотвращения лишних запросов
  const filtersToApply = useMemo(() => {
    const result: {
      category?: string
      country?: string
      startYear: number
      endYear: number
      limit: number
    } = {
      startYear: filters.timeRange.start,
      endYear: filters.timeRange.end,
      limit: 1000,
    }

    if (filters.categories.length > 0) {
      result.category = filters.categories.join(',')
    }

    if (filters.countries.length > 0) {
      result.country = filters.countries.join(',')
    }

    return result
  }, [filters.categories, filters.countries, filters.timeRange.start, filters.timeRange.end])

  // Используем useEntityQuery для загрузки персон
  const { data: persons, isLoading } = useEntityQuery<Person>({
    endpoint: '/api/persons',
    filters: filtersToApply,
    enabled,
    transform: (data: any[]) => {
      const maybePercentDecode = (input: unknown): string => {
        if (typeof input !== 'string') return ''
        if (!/%[0-9A-Fa-f]{2}/.test(input)) return input
        try {
          return decodeURIComponent(input)
        } catch {
          return input
        }
      }

      return data.map((person: any) => ({
        id: person.id,
        name: maybePercentDecode(person.name || ''),
        birthYear: person.birthYear,
        deathYear: person.deathYear,
        category: maybePercentDecode(person.category || ''),
        country: maybePercentDecode(person.country || ''),
        description: maybePercentDecode(person.description || ''),
        imageUrl: person.imageUrl,
        wikiLink: person.wikiLink || null,
        reignStart: person.reignStart,
        reignEnd: person.reignEnd,
        rulerPeriods: Array.isArray(person.rulerPeriods) ? person.rulerPeriods : [],
        achievementYears: Array.isArray(person.achievementYears) ? person.achievementYears : undefined,
        achievements: Array.isArray(person.achievements)
          ? person.achievements.map((a: string) => maybePercentDecode(a || ''))
          : [],
        achievementsWiki: Array.isArray(person.achievements_wiki) ? person.achievements_wiki : [],
      }))
    },
  })

  // Загружаем категории и страны один раз при монтировании
  useEffect(() => {
    let aborted = false
    ;(async () => {
      try {
        const [categoriesData, countriesData] = await Promise.all([getCategories(), getCountries()])
        if (!aborted) {
          setAllCategories(categoriesData)
          setAllCountries(countriesData)
        }
      } catch {
        if (!aborted) {
          setAllCategories([])
          setAllCountries([])
        }
      }
    })()
    return () => {
      aborted = true
    }
  }, [])

  return {
    persons,
    allCategories,
    allCountries,
    isLoading,
  }
}



