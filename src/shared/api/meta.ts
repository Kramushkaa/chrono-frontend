import { apiData } from './core'
import { maybePercentDecode } from './core'

const CACHE_TTL_MS = 300000 // 5 minutes

// Get all categories
let CACHED_CATEGORIES: { items: string[]; ts: number } | null = null

export const getCategories = async (): Promise<string[]> => {
  if (CACHED_CATEGORIES && Date.now() - CACHED_CATEGORIES.ts < CACHE_TTL_MS) {
    return CACHED_CATEGORIES.items
  }
  const raw = await apiData<string[]>(`/api/categories`)
  const items = raw.map((category: string) => maybePercentDecode(category || ''))
  CACHED_CATEGORIES = { items, ts: Date.now() }
  return items
}

// Get all countries
let CACHED_COUNTRIES: { items: string[]; ts: number } | null = null
export const getCountries = async (): Promise<string[]> => {
  if (CACHED_COUNTRIES && Date.now() - CACHED_COUNTRIES.ts < CACHE_TTL_MS) {
    return CACHED_COUNTRIES.items
  }
  const raw = await apiData<(string | null)[]>(`/api/countries`)
  const allCountries = new Set<string>()
  raw.forEach((country: string | null) => {
    const decodedCountry = maybePercentDecode(country || '')
    if (decodedCountry.includes('/')) {
      const countries = decodedCountry.split('/').map((c) => c.trim())
      countries.forEach((c) => {
        if (c) allCountries.add(c)
      })
    } else {
      allCountries.add(decodedCountry)
    }
  })
  const list = Array.from(allCountries).sort()
  CACHED_COUNTRIES = { items: list, ts: Date.now() }
  return list
}

// Country options with IDs
export type CountryOption = { id: number; name: string }
let CACHED_COUNTRY_OPTIONS: { items: CountryOption[]; ts: number } | null = null

export async function getCountryOptions(): Promise<CountryOption[]> {
  if (CACHED_COUNTRY_OPTIONS && Date.now() - CACHED_COUNTRY_OPTIONS.ts < CACHE_TTL_MS) {
    return CACHED_COUNTRY_OPTIONS.items
  }
  try {
    const items = await apiData<CountryOption[]>(`/api/countries/options`)
    if (Array.isArray(items) && items.length > 0) {
      CACHED_COUNTRY_OPTIONS = { items, ts: Date.now() }
      return items
    }
  } catch {}
  // Fallback: build options from names
  const names = await getCountries()
  const mapped = names.map((name, idx) => ({ id: idx + 1, name }))
  CACHED_COUNTRY_OPTIONS = { items: mapped, ts: Date.now() }
  return mapped
}

// DTO version check
export async function getDtoVersion(): Promise<string | null> {
  try {
    const data = await apiData<{ version?: string }>(`/api/dto-version`)
    const v = data?.version
    return typeof v === 'string' ? v : null
  } catch {
    return null
  }
}

