import { apiData, apiJson } from './core'
import type {
  PaginationMeta,
  UserList,
  ModerationListSummary,
  ListModerationStatus,
  PublicListSummary,
  PublicListDetail,
} from '../types'

type ListPublicationRequestPayload = {
  description?: string
}

type ListUpdatePayload = {
  title?: string
  public_description?: string
}

type ListModerationActionPayload = {
  action: 'approve' | 'reject'
  comment?: string
  slug?: string
}

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

export async function updateList(
  listId: number,
  payload: ListUpdatePayload
): Promise<UserList> {
  return apiData<UserList>(`/api/lists/${listId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export async function requestListPublication(
  listId: number,
  payload: ListPublicationRequestPayload
): Promise<UserList> {
  return apiData<UserList>(`/api/lists/${listId}/publish-request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export async function reviewListPublication(
  listId: number,
  payload: ListModerationActionPayload
): Promise<UserList> {
  return apiData<UserList>(`/api/admin/lists/${listId}/review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export async function getListModerationQueue(params: {
  status?: ListModerationStatus
  limit?: number
  offset?: number
} = {}): Promise<{ data: ModerationListSummary[]; meta: PaginationMeta }> {
  const search = new URLSearchParams()
  if (params.status) search.set('status', params.status)
  if (typeof params.limit === 'number') search.set('limit', String(params.limit))
  if (typeof params.offset === 'number') search.set('offset', String(params.offset))

  const payload = await apiJson<{
    success: boolean
    data: ModerationListSummary[]
    meta: PaginationMeta
  }>(`/api/admin/lists/moderation${search.toString() ? `?${search.toString()}` : ''}`)

  return {
    data: payload?.data ?? [],
    meta: payload?.meta ?? { total: 0, limit: params.limit || 0, offset: params.offset || 0, hasMore: false },
  }
}

export async function getPublicLists(params: {
  limit?: number
  offset?: number
} = {}): Promise<{ data: PublicListSummary[]; meta: PaginationMeta }> {
  const search = new URLSearchParams()
  if (typeof params.limit === 'number') search.set('limit', String(params.limit))
  if (typeof params.offset === 'number') search.set('offset', String(params.offset))

  const payload = await apiJson<{
    success: boolean
    data: PublicListSummary[]
    meta: PaginationMeta
  }>(`/api/public/lists${search.toString() ? `?${search.toString()}` : ''}`)

  return {
    data: payload?.data ?? [],
    meta: payload?.meta ?? { total: 0, limit: params.limit || 0, offset: params.offset || 0, hasMore: false },
  }
}

export async function getPublicListDetail(slug: string): Promise<PublicListDetail> {
  return apiData<PublicListDetail>(`/api/public/lists/${encodeURIComponent(slug)}`)
}
