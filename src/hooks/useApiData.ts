import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { apiFetch } from 'shared/api/api'

// Конфигурация кэширования
const CACHE_TTL_MS = 120000 // 2 минуты
const DEFAULT_PAGE_SIZE = 100

// Типы для кэша
interface CacheEntry<T> {
  ts: number
  data: T[]
  hasMore: boolean
}

// Конфигурация хука
export interface ApiDataConfig<T> {
  endpoint: string
  pageSize?: number
  enabled?: boolean
  cacheKey?: string
  transformData?: (data: any[]) => T[]
  dedupeBy?: (item: T) => string | number
  queryParams?: Record<string, string | number | boolean>
  onError?: (error: Error) => void
}

// Состояние хука
export interface ApiDataState<T> {
  items: T[]
  isLoading: boolean
  hasMore: boolean
  error: string | null
  isInitialLoading: boolean
}

// Действия хука
export interface ApiDataActions {
  loadMore: () => void
  reset: () => void
  refetch: () => void
}

// Основной хук
export function useApiData<T>(config: ApiDataConfig<T>): [ApiDataState<T>, ApiDataActions] {
  const {
    endpoint,
    pageSize = DEFAULT_PAGE_SIZE,
    enabled = true,
    cacheKey,
    transformData,
    dedupeBy,
    queryParams = {},
    onError
  } = config

  // Состояние
  const [state, setState] = useState<ApiDataState<T>>({
    items: [],
    isLoading: false,
    hasMore: true,
    error: null,
    isInitialLoading: true
  })

  // Рефы для управления запросами
  const abortControllerRef = useRef<AbortController | null>(null)
  const loadingRef = useRef(false)
  const offsetRef = useRef(0)
  const cacheRef = useRef<Map<string, CacheEntry<T>>>(new Map())

  // Генерация ключа кэша
  const effectiveCacheKey = useMemo(() => {
    if (!enabled) {
      return ''
    }
    
    if (cacheKey) {
      return cacheKey
    }
    
    // Проверяем, что queryParams - это объект
    if (typeof queryParams !== 'object' || queryParams === null || Array.isArray(queryParams)) {
      console.error('🔄 useApiData: queryParams is not an object!', { queryParams, type: typeof queryParams })
      return `${endpoint}?invalid-params`
    }
    
    const params = new URLSearchParams()
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, String(value))
      }
    })
    const paramsString = params.toString()
    const key = paramsString ? `${endpoint}?${paramsString}` : endpoint
    return key
  }, [endpoint, cacheKey, queryParams, enabled])

  // Функция загрузки данных
  const fetchData = useCallback(async (offset: number, isInitial = false) => {
    if (!enabled || loadingRef.current) return


    // Отменяем предыдущий запрос
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    const controller = new AbortController()
    abortControllerRef.current = controller
    loadingRef.current = true

    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      isInitialLoading: isInitial
    }))

    try {
      // Проверяем кэш для первой страницы
      if (isInitial && offset === 0) {
        const cached = cacheRef.current.get(effectiveCacheKey)
        if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
          setState(prev => ({
            ...prev,
            items: cached.data,
            hasMore: cached.hasMore,
            isLoading: false,
            isInitialLoading: false,
            error: null
          }))
          loadingRef.current = false
          return
        }
      }

      // Формируем параметры запроса
      const params = new URLSearchParams()
      params.set('limit', String(pageSize))
      params.set('offset', String(offset))
      
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.set(key, String(value))
        }
      })

      const url = `${endpoint}?${params.toString()}`
      
      const response = await apiFetch(url, { signal: controller.signal })
      
      if (controller.signal.aborted) return

      const data = await response.json().catch(() => ({ data: [] }))
      const rawItems = data?.data || []
      const transformedItems = transformData ? transformData(rawItems) : rawItems


      if (controller.signal.aborted) return

      // Дедупликация
      let finalItems = transformedItems
      if (dedupeBy && !isInitial) {
        setState(prev => {
          const existingKeys = new Set(prev.items.map(dedupeBy))
          const filteredItems = transformedItems.filter((item: T) => !existingKeys.has(dedupeBy(item)))
          
          const newItems = [...prev.items, ...filteredItems]
          const hasMore = filteredItems.length >= pageSize
          
          return {
            ...prev,
            items: newItems,
            hasMore,
            isLoading: false,
            isInitialLoading: false,
            error: null
          }
        })
      } else {
        // Обновляем состояние
        const newItems = isInitial ? finalItems : []
        const hasMore = finalItems.length >= pageSize

        setState(prev => ({
          ...prev,
          items: newItems,
          hasMore,
          isLoading: false,
          isInitialLoading: false,
          error: null
        }))
      }

      // Кэшируем первую страницу
      if (isInitial && offset === 0) {
        setState(prev => {
          cacheRef.current.set(effectiveCacheKey, {
            ts: Date.now(),
            data: prev.items,
            hasMore: prev.hasMore
          })
          return prev
        })
      }

      offsetRef.current = offset + finalItems.length

    } catch (error: any) {
      if (controller.signal.aborted) return

      const errorMessage = error?.message || 'Ошибка загрузки данных'
      
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
        isInitialLoading: false,
        hasMore: false
      }))

      if (onError) {
        onError(error)
      }
    } finally {
      loadingRef.current = false
    }
  }, [enabled, endpoint, pageSize, queryParams, effectiveCacheKey, transformData, dedupeBy, onError])

  // Загрузка дополнительных данных
  const loadMore = useCallback(() => {
    if (state.hasMore && !state.isLoading && !loadingRef.current) {
      fetchData(offsetRef.current, false)
    }
  }, [state.hasMore, state.isLoading])

  // Сброс данных
  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    
    setState({
      items: [],
      isLoading: false,
      hasMore: true,
      error: null,
      isInitialLoading: true
    })
    
    offsetRef.current = 0
    loadingRef.current = false
  }, [])

  // Повторная загрузка
  const refetch = useCallback(() => {
    reset()
    fetchData(0, true)
  }, [reset, fetchData])

  // Сброс при изменении конфигурации
  useEffect(() => {
    // Очищаем кэш при изменении ключа
    cacheRef.current.clear()
    reset()
  }, [effectiveCacheKey, reset])

  // Начальная загрузка после сброса
  useEffect(() => {
    if (enabled && !state.isLoading && !loadingRef.current) {
      fetchData(0, true)
    }
  }, [enabled, state.isLoading, effectiveCacheKey])


  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return [state, { loadMore, reset, refetch }]
}

// Хук для простого использования без пагинации
export function useApiDataSimple<T>(config: Omit<ApiDataConfig<T>, 'pageSize'>): {
  data: T[] | null
  isLoading: boolean
  error: string | null
  refetch: () => void
} {
  const [state, actions] = useApiData({
    ...config,
    pageSize: 1000 // Большой размер для получения всех данных
  })

  return {
    data: state.items.length > 0 ? state.items : null,
    isLoading: state.isInitialLoading,
    error: state.error,
    refetch: actions.refetch
  }
}

// Хук для кэшированных данных (только чтение)
export function useApiDataCached<T>(config: Omit<ApiDataConfig<T>, 'pageSize'>): {
  data: T[] | null
  isLoading: boolean
  error: string | null
} {
  const [state] = useApiData({
    ...config,
    pageSize: 1000,
    enabled: true
  })

  return {
    data: state.items.length > 0 ? state.items : null,
    isLoading: state.isInitialLoading,
    error: state.error
  }
}
