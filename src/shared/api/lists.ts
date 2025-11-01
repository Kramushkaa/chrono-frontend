import { apiData } from './core'

// List sharing helpers
export async function createListShareCode(listId: number): Promise<string | null> {
  try {
    const data = await apiData<{ code?: string }>(`/api/lists/${listId}/share`, { method: 'POST' })
    return data?.code || null
  } catch {
    return null
  }
}

export async function resolveListShare(code: string): Promise<{
  title: string
  list_id?: number
  owner_user_id?: string
  items: Array<{ item_type: string; person_id?: string; achievement_id?: number; period_id?: number }>
} | null> {
  try {
    const payload = await apiData<any>(`/api/list-shares/${encodeURIComponent(code)}`)
    const title = payload?.title || ''
    const list_id = Number(payload?.list_id)
    const owner_user_id = payload?.owner_user_id != null ? String(payload.owner_user_id) : undefined
    const items = Array.isArray(payload?.items) ? payload.items : []
    return { title, list_id: Number.isFinite(list_id) ? list_id : undefined, owner_user_id, items }
  } catch {
    return null
  }
}




