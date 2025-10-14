import { apiFetch, apiData, apiJson } from './core'
import type { LifePeriodItemDTO } from '../dto'
import { validateDto } from '../dto'

// Save life periods for person
export type LifePeriodInput = Pick<LifePeriodItemDTO, 'country_id' | 'start_year' | 'end_year'>

export async function saveLifePeriods(personId: string, periods: LifePeriodInput[]) {
  if (process.env.NODE_ENV !== 'production') {
    const pack = {
      periods: periods.map((p) => ({ country_id: p.country_id, start_year: p.start_year, end_year: p.end_year })),
    }
    const v = validateDto('LifePeriods', pack)
    // eslint-disable-next-line no-console
    if (!v.ok) console.warn('DTO validation failed (LifePeriods):', v.errors)
  }
  const data = await apiJson(`/api/persons/${encodeURIComponent(personId)}/life-periods`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ periods }),
  })
  return data
}

// Get count of user's periods
export async function getMyPeriodsCount(): Promise<number> {
  const payload = await apiData<{ count: number }>(`/api/periods/mine?count=true`)
  const c = payload?.count
  const n = Number(c)
  return Number.isFinite(n) ? n : 0
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

