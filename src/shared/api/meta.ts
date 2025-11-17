import { apiFetch, apiData } from './core'
import { maybePercentDecode } from './core'
import { DTO_VERSION as DTO_VERSION_FE } from 'shared/dto/dtoDescriptors'
import { createHttpCacheStore } from './cacheUtils'

const CACHE_DEFAULT_TTL_MS = 300000 // 5 minutes
const META_CACHE = createHttpCacheStore()
const DTO_HEADER = 'X-DTO-Version'

const parseCacheControl = (header: string | null): number | null => {
  if (!header) return null
  const maxAgeMatch = header.match(/max-age=(\d+)/i)
  if (maxAgeMatch) {
    const seconds = Number(maxAgeMatch[1])
    if (!Number.isNaN(seconds)) {
      return seconds * 1000
    }
  }
  return null
}

const warnDtoMismatch = (backendVersion?: string | null) => {
  if (!backendVersion) return
  if (backendVersion === DTO_VERSION_FE) return
  // eslint-disable-next-line no-console
  console.warn(
    `[meta-cache] DTO version mismatch detected (FE=${DTO_VERSION_FE}, BE=${backendVersion}). Possible schema drift.`
  )
}

const extractPayload = async (res: Response): Promise<any> => {
  try {
    return await res.clone().json()
  } catch {
    const text = await res.text()
    try {
      return JSON.parse(text)
    } catch {
      return text
    }
  }
}

const unwrapData = <T>(payload: unknown): T => {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as { data: T }).data
  }

  return payload as T
}

async function fetchMetaWithCache<T>(
  key: string,
  path: string,
  transform: (raw: unknown) => T
): Promise<T> {
  const cached = META_CACHE.get<T>(key)
  if (cached) {
    return cached.value
  }

  const stale = META_CACHE.peek<T>(key)
  const requestHeaders: Record<string, string> = {}
  if (stale?.etag) {
    requestHeaders['If-None-Match'] = stale.etag
  }

  const res = await apiFetch(path, { headers: requestHeaders })

  if (res.status === 304 && stale) {
    const ttl = stale.ttlMs ?? CACHE_DEFAULT_TTL_MS
    META_CACHE.set(key, stale.value, {
      ttlMs: ttl,
      etag: stale.etag,
      version: stale.version,
    })
    if (stale.version) {
      warnDtoMismatch(stale.version)
    }
    return stale.value
  }

  const payload = await extractPayload(res)
  if (!res.ok) {
    const payloadObj =
      payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : undefined
    const message =
      (payloadObj?.message as string) ||
      (payloadObj?.error as string) ||
      (payloadObj?.error_message as string) ||
      `HTTP ${res.status}`
    throw new Error(typeof message === 'string' ? message : 'Meta request failed')
  }

  const value = transform(unwrapData(payload))
  const cacheControl = res.headers.get('Cache-Control')
  const ttlMs = parseCacheControl(cacheControl) ?? CACHE_DEFAULT_TTL_MS
  const etag = res.headers.get('ETag') ?? undefined
  const dtoVersion = res.headers.get(DTO_HEADER) ?? undefined

  META_CACHE.set(key, value, {
    ttlMs,
    etag,
    version: dtoVersion,
  })

  warnDtoMismatch(dtoVersion)

  return value
}

export const getCategories = async (): Promise<string[]> => {
  return fetchMetaWithCache<string[]>('/categories', '/api/categories', raw => {
    const values = Array.isArray(raw) ? (raw as string[]) : []
    return values.map(category => maybePercentDecode(category || ''))
  })
}

export const getCountries = async (): Promise<string[]> => {
  return fetchMetaWithCache<string[]>('/countries', '/api/countries', raw => {
    const rawItems = Array.isArray(raw) ? (raw as (string | null)[]) : []
    const allCountries = new Set<string>()
    rawItems.forEach(country => {
      const decodedCountry = maybePercentDecode(country || '')
      if (decodedCountry.includes('/')) {
        decodedCountry
          .split('/')
          .map(c => c.trim())
          .forEach(segment => {
            if (segment) allCountries.add(segment)
          })
      } else if (decodedCountry) {
        allCountries.add(decodedCountry)
      }
    })
    return Array.from(allCountries).sort()
  })
}

export type CountryOption = { id: number; name: string }

export async function getCountryOptions(): Promise<CountryOption[]> {
  const options = await fetchMetaWithCache<CountryOption[] | null>(
    '/countries/options',
    '/api/countries/options',
    raw => (Array.isArray(raw) ? (raw as CountryOption[]) : null)
  )

  if (options && options.length > 0) {
    return options
  }

  const names = await getCountries()
  return names.map((name, idx) => ({ id: idx + 1, name }))
}

export async function getDtoVersion(): Promise<string | null> {
  try {
    const payload = await apiData('/api/dto-version')
    const data = unwrapData<{ version?: string }>(payload)
    const version = data?.version
    return typeof version === 'string' ? version : null
  } catch {
    return null
  }
}




