import { apiData, apiFetch, maybePercentDecode } from './core'
import type { UpsertPersonDTO } from '../dto'
import { validateDto } from '../dto'
import type { Person } from '../types'

// Types
interface ApiFilters {
  category?: string
  country?: string
  startYear?: number
  endYear?: number
  limit?: number
  offset?: number
}

// Helper function to build query string from filters
const buildQueryString = (filters: ApiFilters): string => {
  const params = new URLSearchParams()

  if (filters.category) {
    params.append('category', filters.category)
  }
  if (filters.country) {
    params.append('country', filters.country)
  }
  if (filters.startYear !== undefined) {
    params.append('startYear', filters.startYear.toString())
  }
  if (filters.endYear !== undefined) {
    params.append('endYear', filters.endYear.toString())
  }
  if (filters.limit !== undefined) {
    params.append('limit', filters.limit.toString())
  }
  if (filters.offset !== undefined) {
    params.append('offset', filters.offset.toString())
  }

  return params.toString()
}

// Get persons with optional filters
export const getPersons = async (filters: ApiFilters = {}): Promise<Person[]> => {
  try {
    const withDefaultLimit: ApiFilters = { limit: 1000, ...filters }
    const queryString = buildQueryString(withDefaultLimit)
    const url = `/api/persons${queryString ? `?${queryString}` : ''}`
    const data = await apiData<any[]>(url)

    let transformedData = data.map((person) => ({
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
    if (process.env.NODE_ENV !== 'production') console.error('Error fetching persons:', error)
    throw error
  }
}

// Get person by ID
export async function getPersonById(id: string): Promise<Person | null> {
  try {
    const p = await apiData<any>(`/api/persons/${encodeURIComponent(id)}`)
    const mapped: any = {
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
      rulerPeriods: Array.isArray(p.rulerPeriods) ? p.rulerPeriods : [],
      periods: Array.isArray(p.periods)
        ? p.periods
            .map((pr: any) => ({
              startYear: pr.startYear ?? pr.start_year,
              endYear: pr.endYear ?? pr.end_year,
              type: pr.type ?? pr.period_type,
              countryId: pr.countryId ?? pr.country_id,
              countryName: pr.countryName ?? pr.country_name,
              comment: pr.comment ?? pr.period_comment ?? null,
            }))
            .sort((a: any, b: any) => (a.startYear ?? 0) - (b.startYear ?? 0))
        : [],
      achievementYears: Array.isArray(p.achievementYears) ? p.achievementYears : undefined,
      achievements: Array.isArray(p.achievements)
        ? p.achievements.map((a: string) => maybePercentDecode(a || ''))
        : [],
      achievementsWiki: Array.isArray(p.achievementsWiki) ? p.achievementsWiki : [],
      status: p.status,
    }
    return mapped
  } catch {
    return null
  }
}

// Admin: create or update person
type UpsertPersonPayload = UpsertPersonDTO

export async function adminUpsertPerson(payload: UpsertPersonPayload) {
  if (process.env.NODE_ENV !== 'production') {
    const v = validateDto('UpsertPerson', payload)
    // eslint-disable-next-line no-console
    if (!v.ok) console.warn('DTO validation failed (UpsertPerson):', v.errors)
  }
  const res = await apiFetch(`/api/admin/persons`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await res.json().catch(() => null)
  if (!res.ok) throw new Error(data?.message || 'Не удалось сохранить личность')
  return data
}

// Propose edit to existing person
export async function proposePersonEdit(personId: string, payload: Partial<UpsertPersonPayload>) {
  const res = await apiFetch(`/api/persons/${encodeURIComponent(personId)}/edits`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ payload }),
  })
  const data = await res.json().catch(() => null)
  if (!res.ok) throw new Error(data?.message || 'Не удалось отправить правку')
  return data
}

// Propose new person
export async function proposeNewPerson(payload: UpsertPersonPayload) {
  const res = await apiFetch(`/api/persons/propose`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await res.json().catch(() => null)
  if (!res.ok) throw new Error(data?.message || 'Не удалось предложить личность')
  return data
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
  const res = await apiFetch(`/api/persons/${personId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  const responseData = await res.json().catch(() => null)
  if (!res.ok) throw new Error(responseData?.message || 'Не удалось обновить личность')
  return responseData
}

// Person drafts
export async function getPersonDrafts(limit?: number, offset?: number) {
  const params = new URLSearchParams()
  if (limit) params.append('limit', limit.toString())
  if (offset) params.append('offset', offset.toString())

  const res = await apiFetch(`/api/persons/drafts?${params.toString()}`)
  const data = await res.json().catch(() => null)
  if (!res.ok) throw new Error(data?.message || 'Не удалось получить черновики личностей')
  return data
}

export async function submitPersonDraft(personId: string) {
  const res = await apiFetch(`/api/persons/${personId}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  })
  const data = await res.json().catch(() => null)
  if (!res.ok) throw new Error(data?.message || 'Не удалось отправить черновик на модерацию')
  return data
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
  lifePeriods: Array<{ countryId: string; start: number | ''; end: number | '' }>
}) {
  const res = await apiFetch(`/api/persons/propose`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, saveAsDraft: true }),
  })
  const responseData = await res.json().catch(() => null)
  if (!res.ok) throw new Error(responseData?.message || 'Не удалось создать черновик личности')
  return responseData
}

export async function revertPersonToDraft(personId: string) {
  const res = await apiFetch(`/api/persons/${personId}/revert-to-draft`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  })
  const responseData = await res.json().catch(() => null)
  if (!res.ok) throw new Error(responseData?.message || 'Не удалось вернуть личность в черновики')
  return responseData
}

// Count helpers
export async function getMyPersonsCount(): Promise<number> {
  const payload = await apiData<{ count: number }>(`/api/persons/mine?count=true`)
  const c = payload?.count
  const n = Number(c)
  return Number.isFinite(n) ? n : 0
}

