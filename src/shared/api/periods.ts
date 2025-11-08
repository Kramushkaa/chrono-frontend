import { apiFetch, apiData, apiJson } from './core'
import type { LifePeriodItemDTO } from '../dto'
import { validateDto } from '../dto'
import { createCountCache } from './cacheUtils'
import { logger } from '../utils/logger'

// Save life periods for person
export type LifePeriodInput = Pick<LifePeriodItemDTO, 'country_id' | 'start_year' | 'end_year'>

export async function saveLifePeriods(personId: string, periods: LifePeriodInput[]) {
  if (import.meta.env.MODE !== 'production') {
    const pack = {
      periods: periods.map((p) => ({ country_id: p.country_id, start_year: p.start_year, end_year: p.end_year })),
    }
    const v = validateDto('LifePeriods', pack)
    if (!v.ok) {
      logger.warn('DTO validation failed (LifePeriods)', { errors: v.errors, pack })
    }
  }
  const data = await apiJson(`/api/persons/${encodeURIComponent(personId)}/life-periods`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ periods }),
  })
  return data
}

// Get count of user's periods with caching
const periodsCountCache = createCountCache(async () => {
  try {
    const payload = await apiData(`/api/periods/mine?count=true`)
    
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
      return numCount
    }
    
    return 0
  } catch (error) {
    return 0
  }
})

// Export for testing and manual invalidation
export function clearPeriodsCountCache() {
  periodsCountCache.invalidate()
}

export async function getMyPeriodsCount(): Promise<number> {
  return periodsCountCache.get()
}

// Period drafts
export async function getPeriodDrafts(limit?: number, offset?: number) {
  const params = new URLSearchParams()
  if (limit) params.append('limit', limit.toString())
  if (offset) params.append('offset', offset.toString())

  const res = await apiFetch(`/api/periods/drafts?${params.toString()}`)
  const data = await res.json().catch(() => null)
  if (!res.ok) throw new Error(data?.message || 'Не удалось получить черновики периодов')
  return data
}

export async function updatePeriod(
  periodId: number,
  data: {
    start_year?: number
    end_year?: number
    period_type?: string
    country_id?: number | null
    comment?: string | null
  }
) {
  const res = await apiFetch(`/api/periods/${periodId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  const responseData = await res.json().catch(() => null)
  if (!res.ok) throw new Error(responseData?.message || 'Не удалось обновить период')
  return responseData
}

export async function submitPeriodDraft(periodId: number) {
  const res = await apiFetch(`/api/periods/${periodId}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  })
  const data = await res.json().catch(() => null)
  if (!res.ok) throw new Error(data?.message || 'Не удалось отправить черновик на модерацию')
  return data
}

export async function createPeriodDraft(
  personId: string,
  data: { start_year: number; end_year: number; period_type: string; country_id?: number | null; comment?: string | null }
) {
  const res = await apiFetch(`/api/persons/${personId}/periods`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, saveAsDraft: true }),
  })
  const responseData = await res.json().catch(() => null)
  if (!res.ok) throw new Error(responseData?.message || 'Не удалось создать черновик периода')
  return responseData
}




