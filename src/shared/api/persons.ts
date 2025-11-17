import { apiData, apiFetch, maybePercentDecode } from './core'
import { createApiClient, buildQueryString } from './client'
import type { UpsertPersonDTO } from '../dto'
// import { validateDto } from '../dto' // Removed: not available in frontend (requires zod)
import type { Person } from '../types'
import { logger } from '../utils/logger'

// API response types
interface PersonApiResponse {
  id: string
  name: string
  birthYear: number
  deathYear: number
  category: string
  country: string
  description: string
  imageUrl?: string | null
  wikiLink?: string | null
  reignStart?: number | null
  reignEnd?: number | null
  rulerPeriods?: Array<{
    startYear?: number
    endYear?: number
    type?: string
    countryId?: number
    countryName?: string
    comment?: string | null
  }>
  periods?: Array<{
    startYear?: number
    start_year?: number
    endYear?: number
    end_year?: number
    type?: string
    period_type?: string
    countryId?: number
    country_id?: number
    countryName?: string
    country_name?: string
    comment?: string | null
    period_comment?: string | null
  }>
  achievementYears?: number[]
  achievements?: string[]
  achievements_wiki?: string[]
  achievementsWiki?: string[]
  status?: string
}

// Filter types
interface ApiFilters {
  category?: string
  country?: string
  startYear?: number
  endYear?: number
  limit?: number
  offset?: number
}

const personsClient = createApiClient({ basePath: '/api/persons' })

async function parseJsonResponse<T>(response: Response, defaultError: string): Promise<T> {
  let payload: any = null
  try {
    payload = await response.json()
  } catch {
    payload = null
  }

  if (!response.ok) {
    const message = payload?.message || payload?.error || defaultError
    throw new Error(message)
  }

  return (payload?.data ?? payload ?? null) as T
}

// Get persons with optional filters
export const getPersons = async (filters: ApiFilters = {}): Promise<Person[]> => {
  try {
    const withDefaultLimit: ApiFilters = { limit: 1000, ...filters }
    const queryString = buildQueryString(withDefaultLimit)
    const data = await personsClient.get<PersonApiResponse[]>(queryString ? `?${queryString}` : '')

    let transformedData = data.map((person): Person => ({
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
      rulerPeriods: Array.isArray(person.rulerPeriods) 
        ? person.rulerPeriods.filter((p): p is { startYear: number; endYear: number; countryId?: number; countryName?: string } => 
            typeof p.startYear === 'number' && typeof p.endYear === 'number'
          )
        : [],
      achievementYears: Array.isArray(person.achievementYears) ? person.achievementYears : undefined,
      achievements: Array.isArray(person.achievements)
        ? person.achievements.map((a: string) => maybePercentDecode(a || ''))
        : [],
      achievementsWiki: Array.isArray(person.achievements_wiki) ? person.achievements_wiki : [],
    }))

    // Client-side filtering for multiple countries
    if (filters.country) {
      const selectedCountries = filters.country.split(',').map((c: string) => c.trim())
      transformedData = transformedData.filter((person: Person) => {
        const personCountries = person.country.includes('/')
          ? person.country.split('/').map((c: string) => c.trim())
          : [person.country]
        return selectedCountries.some((selected: string) => personCountries.includes(selected))
      })
    }

    return transformedData
  } catch (error) {
    if (import.meta.env.MODE !== 'production') {
      console.error('Error fetching persons:', error)
    }
    throw error
  }
}

// Get person by ID
export async function getPersonById(id: string): Promise<Person | null> {
  try {
    const p = await personsClient.get<PersonApiResponse>(`/${encodeURIComponent(id)}`)
    const mapped: Person = {
      id: p.id,
      name: maybePercentDecode(p.name || ''),
      birthYear: p.birthYear,
      deathYear: p.deathYear,
      category: maybePercentDecode(p.category || ''),
      country: maybePercentDecode(p.country || ''),
      description: maybePercentDecode(p.description || ''),
      imageUrl: p.imageUrl || undefined,
      wikiLink: p.wikiLink || null,
      reignStart: p.reignStart || undefined,
      reignEnd: p.reignEnd || undefined,
      rulerPeriods: Array.isArray(p.rulerPeriods) 
        ? p.rulerPeriods.filter((pr): pr is { startYear: number; endYear: number; countryId?: number; countryName?: string } => 
            typeof pr.startYear === 'number' && typeof pr.endYear === 'number'
          )
        : [],
      periods: Array.isArray(p.periods)
        ? p.periods
            .map((pr) => ({
              startYear: pr.startYear ?? pr.start_year ?? 0,
              endYear: pr.endYear ?? pr.end_year ?? null,
              type: (pr.type ?? pr.period_type ?? 'other') as 'life' | 'ruler' | 'other',
              countryId: pr.countryId ?? pr.country_id,
              countryName: pr.countryName ?? pr.country_name,
              comment: pr.comment ?? pr.period_comment ?? null,
            }))
            .filter((pr) => typeof pr.startYear === 'number')
            .sort((a, b) => a.startYear - b.startYear)
        : [],
      achievementYears: Array.isArray(p.achievementYears) ? p.achievementYears : undefined,
      achievements: Array.isArray(p.achievements)
        ? p.achievements.map((a: string) => maybePercentDecode(a || ''))
        : [],
      achievementsWiki: Array.isArray(p.achievementsWiki) ? p.achievementsWiki : [],
      status: p.status as 'draft' | 'pending' | 'approved' | 'rejected' | undefined,
    }
    return mapped
  } catch {
    return null
  }
}

// Admin: create or update person
type UpsertPersonPayload = UpsertPersonDTO

export async function adminUpsertPerson(payload: UpsertPersonPayload) {
  const response = await apiFetch('/api/admin/persons', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return parseJsonResponse(response, 'Не удалось обновить данные личности')
}

// Propose edit to existing person
export async function proposePersonEdit(personId: string, payload: Partial<UpsertPersonPayload>) {
  const response = await apiFetch(`/api/persons/${encodeURIComponent(personId)}/edits`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ payload }),
  })
  return parseJsonResponse(response, 'Не удалось отправить правки')
}

// Propose new person
export async function proposeNewPerson(payload: UpsertPersonPayload) {
  const response = await apiFetch('/api/persons/propose', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return parseJsonResponse(response, 'Ошибка при создании личности')
}

// Update person
export async function updatePerson(
  personId: string,
  data: {
    name?: string
    birthYear?: number
    deathYear?: number
    category?: string
    description?: string
    imageUrl?: string | null
    wikiLink?: string | null
    lifePeriods?: Array<{ countryId: string; start: number | ''; end: number | '' }>
  }
) {
  const response = await apiFetch(`/api/persons/${encodeURIComponent(personId)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return parseJsonResponse(response, 'Не удалось обновить личность')
}

// Person drafts
export async function getPersonDrafts(limit?: number, offset?: number) {
  const params = new URLSearchParams()
  if (limit) params.append('limit', limit.toString())
  if (offset) params.append('offset', offset.toString())

  const response = await apiFetch(`/api/persons/drafts?${params.toString()}`)
  return parseJsonResponse(response, 'Не удалось получить черновики')
}

export async function submitPersonDraft(personId: string) {
  const response = await apiFetch(`/api/persons/${encodeURIComponent(personId)}/submit`, {
    method: 'POST',
  })
  return parseJsonResponse(response, 'Не удалось отправить на модерацию')
}

export async function createPersonDraft(data: {
  id: string
  name: string
  birthYear: number
  deathYear: number
  category: string
  description: string
  imageUrl: string | null
  wikiLink: string | null
  lifePeriods: Array<{ countryId: number; start: number; end: number }>
}) {
  const response = await apiFetch('/api/persons/propose', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, saveAsDraft: true }),
  })
  return parseJsonResponse(response, 'Не удалось создать черновик')
}

export async function revertPersonToDraft(personId: string) {
  const response = await apiFetch(`/api/persons/${encodeURIComponent(personId)}/revert-to-draft`, {
    method: 'POST',
  })
  return parseJsonResponse(response, 'Не удалось вернуть в черновик')
}

// Count helpers with caching
const COUNT_CACHE_VERSION = '1.0.0' // Increment to invalidate cache
let PERSONS_COUNT_CACHE: { count: number; ts: number; version: string } | null = null
const PERSONS_COUNT_TTL = 180000 // 3 minutes

// Export for testing
export function clearPersonsCountCache() {
  PERSONS_COUNT_CACHE = null
}

export async function getMyPersonsCount(): Promise<number> {
  const now = Date.now()
  
  // Return cached result if still valid and version matches
  if (PERSONS_COUNT_CACHE && 
      (now - PERSONS_COUNT_CACHE.ts) < PERSONS_COUNT_TTL &&
      PERSONS_COUNT_CACHE.version === COUNT_CACHE_VERSION) {
    return PERSONS_COUNT_CACHE.count
  }
  
  try {
    const payload = await apiData(`/api/persons/mine?count=true`)
    
    // Попробуем разные возможные форматы ответа
    let count: number | string | undefined
    
    if (payload && typeof payload === 'object') {
      // Случай 1: { count: number | string }
      if ('count' in payload) {
        count = payload.count as number | string
      }
      // Случай 2: { data: { count: number | string } } (если apiData не извлек data)
      else if ('data' in payload && payload.data && typeof payload.data === 'object' && 'count' in payload.data) {
        count = (payload.data as any).count as number | string
      }
    }
    
    // Преобразуем в число, если это строка
    const numCount = typeof count === 'string' ? Number(count) : count
    
    if (typeof numCount === 'number' && Number.isFinite(numCount)) {
      // Cache the result
      PERSONS_COUNT_CACHE = { count: numCount, ts: Date.now(), version: COUNT_CACHE_VERSION }
      return numCount
    }
    
    return 0
  } catch (error) {
    return 0
  }
}




