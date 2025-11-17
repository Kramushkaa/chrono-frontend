/**
 * Generic утилита для создания кеша счётчиков (count)
 * 
 * Создаёт простой кеш с возможностью инвалидации для подсчётов записей.
 * Используется для кеширования количества достижений, периодов и т.д.
 */

export interface CountCache {
  /**
   * Получить закешированное значение или вызвать fetcher для получения нового
   */
  get: (params?: Record<string, unknown>) => Promise<number>
  
  /**
   * Инвалидировать кеш (очистить сохранённое значение)
   */
  invalidate: () => void
}

/**
 * Создаёт кеш для функции подсчёта
 * 
 * @param fetcher - Функция, которая выполняет запрос для получения count
 * @returns Объект с методами get и invalidate
 * 
 * @example
 * const achievementsCountCache = createCountCache(
 *   (params) => api.get('/achievements/count', { params }).then(res => res.data.count)
 * )
 * 
 * // Использование
 * const count = await achievementsCountCache.get({ status: 'approved' })
 * 
 * // Инвалидация при изменении данных
 * achievementsCountCache.invalidate()
 */
export function createCountCache(
  fetcher: (params?: Record<string, unknown>) => Promise<number>
): CountCache {
  let cachedValue: number | null = null
  let cachedParams: string | null = null

  return {
    async get(params?: Record<string, unknown>): Promise<number> {
      // Создаём ключ для кеша на основе параметров
      const paramsKey = params ? JSON.stringify(params) : ''

      // Если есть закешированное значение с теми же параметрами - возвращаем его
      if (cachedValue !== null && cachedParams === paramsKey) {
        return cachedValue
      }

      // Иначе делаем запрос и кешируем результат
      const value = await fetcher(params)
      cachedValue = value
      cachedParams = paramsKey

      return value
    },

    invalidate(): void {
      cachedValue = null
      cachedParams = null
    },
  }
}

export interface HttpCacheEntry<T> {
  value: T
  expiresAt: number
  etag?: string
  version?: string
  ttlMs?: number
}

export interface HttpCacheStore {
  get<T>(key: string): HttpCacheEntry<T> | null
  peek<T>(key: string): HttpCacheEntry<T> | null
  set<T>(key: string, value: T, options: { ttlMs: number; etag?: string; version?: string }): void
  invalidate(key?: string): void
}

export function createHttpCacheStore(): HttpCacheStore {
  const store = new Map<string, HttpCacheEntry<unknown>>()

  const cleanup = (key: string, entry: HttpCacheEntry<unknown>) => {
    if (Date.now() > entry.expiresAt) {
      store.delete(key)
      return true
    }
    return false
  }

  return {
    get<T>(key: string): HttpCacheEntry<T> | null {
      const entry = store.get(key)
      if (!entry) return null
      if (cleanup(key, entry)) return null
      return entry as HttpCacheEntry<T>
    },
    peek<T>(key: string): HttpCacheEntry<T> | null {
      const entry = store.get(key)
      return (entry as HttpCacheEntry<T>) ?? null
    },
    set<T>(key: string, value: T, options: { ttlMs: number; etag?: string; version?: string }) {
      store.set(key, {
        value,
        expiresAt: Date.now() + options.ttlMs,
        etag: options.etag,
        version: options.version,
        ttlMs: options.ttlMs,
      })
    },
    invalidate(key?: string) {
      if (typeof key === 'string') {
        store.delete(key)
      } else {
        store.clear()
      }
    },
  }
}

