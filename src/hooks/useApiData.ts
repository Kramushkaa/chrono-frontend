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
  const responseReceivedRef = useRef(false)

  // Стабильная сериализация queryParams (только если enabled)
  const queryParamsString = useMemo(() => {
    if (!enabled) {
      return ''
    }
    if (typeof queryParams !== 'object' || queryParams === null || Array.isArray(queryParams)) {
      return ''
    }
    // Сортируем ключи для стабильной сериализации
    const sortedEntries = Object.entries(queryParams)
      .filter(([_, value]) => value !== undefined && value !== null && value !== '')
      .sort(([a], [b]) => a.localeCompare(b))
    return JSON.stringify(sortedEntries)
  }, [queryParams, enabled])

  // Генерация ключа кэша
  const effectiveCacheKey = useMemo(() => {
    if (!enabled) {
      return ''
    }
    
    console.log('🔍 useApiData: effectiveCacheKey useMemo', { endpoint, enabled, queryParamsString });
    
    if (cacheKey) {
      return cacheKey
    }
    
    // Если нет параметров (пустой массив), используем только endpoint
    const key = queryParamsString && queryParamsString !== '[]' ? `${endpoint}?${queryParamsString}` : endpoint
    console.log('🔍 useApiData: generated effectiveCacheKey', { endpoint, key, queryParamsString });
    return key
  }, [endpoint, cacheKey, queryParamsString, enabled])

  // Функция загрузки данных
  const fetchData = useCallback(async (offset: number, isInitial = false) => {
    console.log('🔍 useApiData: fetchData called', { endpoint, offset, isInitial, enabled, loadingRef: loadingRef.current });
    if (!enabled || loadingRef.current) {
      console.log('🔍 useApiData: fetchData blocked', { enabled, loadingRef: loadingRef.current });
      return
    }

    console.log('🔍 useApiData: starting fetch', { endpoint, offset, isInitial });

    // Отменяем предыдущий запрос только если он еще выполняется и не получил ответ
    if (abortControllerRef.current && !abortControllerRef.current.signal.aborted && !responseReceivedRef.current) {
      console.log('🔍 useApiData: aborting previous request', { endpoint });
      abortControllerRef.current.abort()
    }

    const controller = new AbortController()
    abortControllerRef.current = controller
    loadingRef.current = true
    responseReceivedRef.current = false
    
    // Добавляем обработчик отмены
    controller.signal.addEventListener('abort', () => {
      console.log('🔍 useApiData: request aborted by signal', { endpoint, url: `${endpoint}?limit=${pageSize}&offset=${offset}` });
    });

    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      isInitialLoading: isInitial
    }))

    try {
      console.log('🔍 useApiData: checking cache', { effectiveCacheKey, isInitial, offset });
      // Проверяем кэш для первой страницы
      if (isInitial && offset === 0) {
        const cached = cacheRef.current.get(effectiveCacheKey)
        if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
          console.log('🔍 useApiData: using cached data', { cachedLength: cached.data.length });
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
      console.log('🔍 useApiData: making request', { url, endpoint, queryParams });
      
      const response = await apiFetch(url, { signal: controller.signal })
      console.log('🔍 useApiData: got response', { url, status: response.status, ok: response.ok, aborted: controller.signal.aborted });
      
      // Отмечаем, что ответ получен
      responseReceivedRef.current = true;
      
      if (controller.signal.aborted) {
        console.log('🔍 useApiData: request aborted after response', { url });
        return
      }

      console.log('🔍 useApiData: parsing response', { url, status: response.status });
      const data = await response.json().catch((error) => {
        console.log('🔍 useApiData: json parse error', { error, url });
        return { data: [] }
      })
      const rawItems = data?.data || []
      const transformedItems = transformData ? transformData(rawItems) : rawItems
      console.log('🔍 useApiData: received response', { endpoint, url, dataLength: rawItems.length, transformedLength: transformedItems.length, sampleItems: rawItems.slice(0, 2) });
      
      if (controller.signal.aborted) {
        console.log('🔍 useApiData: request aborted before state update', { url });
        return
      }


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
        console.log('🔍 useApiData: updating state', { endpoint, isInitial, newItemsLength: newItems.length, finalItemsLength: finalItems.length, hasMore });

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
  }, [state.hasMore, state.isLoading, fetchData])

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

  // Сброс при изменении конфигурации с задержкой
  useEffect(() => {
    console.log('🚨 useApiData: effectiveCacheKey changed', { endpoint, effectiveCacheKey, enabled });
    
    // Добавляем небольшую задержку для предотвращения множественных сбросов
    const timeoutId = setTimeout(() => {
      console.log('🚨 useApiData: executing reset after delay', { endpoint, effectiveCacheKey });
      // Очищаем кэш при изменении ключа
      cacheRef.current.clear()
      reset()
    }, 10); // Очень короткая задержка
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [effectiveCacheKey, reset, enabled, endpoint])

  // Начальная загрузка после сброса
  useEffect(() => {
    // Триггерим начальную загрузку, когда включено и состояние ожидает initial fetch
    if (enabled && state.isInitialLoading && !state.isLoading && !loadingRef.current) {
      fetchData(0, true)
    }
  }, [enabled, state.isInitialLoading, state.isLoading, effectiveCacheKey, fetchData])


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
