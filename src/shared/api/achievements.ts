import { apiFetch, apiData } from './core'
import { validateDto } from '../dto'

// Add achievement to person
export async function addAchievement(
  personId: string,
  payload: { year: number; description: string; wikipedia_url?: string | null; image_url?: string | null }
) {
  if (process.env.NODE_ENV !== 'production') {
    const v = validateDto('AchievementPerson', payload)
    // eslint-disable-next-line no-console
    if (!v.ok) console.warn('DTO validation failed (AchievementPerson):', v.errors)
  }
  const res = await apiFetch(`/api/persons/${encodeURIComponent(personId)}/achievements`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await res.json().catch(() => null)
  if (!res.ok) throw new Error(data?.message || 'Не удалось создать достижение')
  return data
}

// Get user's achievements
export async function getMyAchievements(limit?: number, offset?: number) {
  const params = new URLSearchParams()
  if (limit) params.append('limit', limit.toString())
  if (offset) params.append('offset', offset.toString())

  const res = await apiFetch(`/api/achievements/mine?${params.toString()}`)
  const data = await res.json().catch(() => null)
  if (!res.ok) throw new Error(data?.message || 'Не удалось получить достижения')
  return data
}

// Get count of user's achievements with caching
let ACHIEVEMENTS_COUNT_CACHE: { count: number; ts: number } | null = null
const ACHIEVEMENTS_COUNT_TTL = 180000 // 3 minutes

export async function getMyAchievementsCount(): Promise<number> {
  const now = Date.now()
  
  // Return cached result if still valid
  if (ACHIEVEMENTS_COUNT_CACHE && (now - ACHIEVEMENTS_COUNT_CACHE.ts) < ACHIEVEMENTS_COUNT_TTL) {
    return ACHIEVEMENTS_COUNT_CACHE.count
  }
  
  try {
    const payload = await apiData(`/api/achievements/mine?count=true`)
    
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
      ACHIEVEMENTS_COUNT_CACHE = { count: numCount, ts: Date.now() }
      return numCount
    }
    
    return 0
  } catch (error) {
    return 0
  }
}

// Get pending achievements (for moderators)
export async function getPendingAchievements(limit?: number, offset?: number) {
  const params = new URLSearchParams()
  if (limit) params.append('limit', limit.toString())
  if (offset) params.append('offset', offset.toString())

  const res = await apiFetch(`/api/admin/achievements/pending?${params.toString()}`)
  const data = await res.json().catch(() => null)
  if (!res.ok) throw new Error(data?.message || 'Не удалось получить pending достижения')
  return data
}

// Review achievement (approve/reject) - for moderators
export async function reviewAchievement(achievementId: number, action: 'approve' | 'reject', comment?: string) {
  const res = await apiFetch(`/api/admin/achievements/${achievementId}/review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, comment }),
  })
  const data = await res.json().catch(() => null)
  if (!res.ok) throw new Error(data?.message || 'Не удалось обработать достижение')
  return data
}

// Create generic achievement (not bound to person)
export async function addGenericAchievement(payload: {
  year: number
  description: string
  wikipedia_url?: string | null
  image_url?: string | null
  country_id?: number | null
}) {
  if (process.env.NODE_ENV !== 'production') {
    const v = validateDto('AchievementGeneric', payload)
    // eslint-disable-next-line no-console
    if (!v.ok) console.warn('DTO validation failed (AchievementGeneric):', v.errors)
  }
  const res = await apiFetch(`/api/achievements`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await res.json().catch(() => null)
  if (!res.ok) throw new Error(data?.message || 'Не удалось создать достижение')
  return data
}

// Achievement drafts
export async function getAchievementDrafts(limit?: number, offset?: number) {
  const params = new URLSearchParams()
  if (limit) params.append('limit', limit.toString())
  if (offset) params.append('offset', offset.toString())

  const res = await apiFetch(`/api/achievements/drafts?${params.toString()}`)
  const data = await res.json().catch(() => null)
  if (!res.ok) throw new Error(data?.message || 'Не удалось получить черновики достижений')
  return data
}

export async function updateAchievement(
  achievementId: number,
  data: { year?: number; description?: string; wikipedia_url?: string | null; image_url?: string | null }
) {
  const res = await apiFetch(`/api/achievements/${achievementId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  const responseData = await res.json().catch(() => null)
  if (!res.ok) throw new Error(responseData?.message || 'Не удалось обновить достижение')
  return responseData
}

export async function submitAchievementDraft(achievementId: number) {
  const res = await apiFetch(`/api/achievements/${achievementId}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  })
  const data = await res.json().catch(() => null)
  if (!res.ok) throw new Error(data?.message || 'Не удалось отправить черновик на модерацию')
  return data
}

export async function createAchievementDraft(
  personId: string,
  data: { year: number; description: string; wikipedia_url?: string | null; image_url?: string | null }
) {
  const res = await apiFetch(`/api/persons/${personId}/achievements`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, saveAsDraft: true }),
  })
  const responseData = await res.json().catch(() => null)
  if (!res.ok) throw new Error(responseData?.message || 'Не удалось создать черновик достижения')
  return responseData
}

