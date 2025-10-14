import { useCallback, useEffect, useRef, useState } from 'react'

// Extend window for cache
declare global {
  interface Window {
    __listsCache?: Map<string, { items: ListItem[]; ts: number }>
  }
}

type ListItem = { id: number; title: string; items_count?: number; readonly?: boolean }

type SharedList = {
  id: number;
  title: string;
  owner_user_id?: string;
  code: string;
  items_count?: number;
  persons_count?: number;
  achievements_count?: number;
  periods_count?: number;
} | null

type Params = {
  isAuthenticated: boolean
  userId?: string | number | null
  apiData: <T = any>(path: string, init?: RequestInit) => Promise<T>
}

export function useLists({ isAuthenticated, userId, apiData }: Params) {
  const [personLists, setPersonLists] = useState<ListItem[]>([])
  const [sharedList, setSharedList] = useState<SharedList>(null)

  const loadUserLists = useRef<(force?: boolean) => Promise<void>>(async () => {})
  const listsInFlightRef = useRef(false)
  const lastListsFetchTsRef = useRef(0)

  // In-memory cache per user
  const LISTS_CACHE_TTL_MS = 120000
  const listsCacheRef = useRef<Map<string, { items: ListItem[]; ts: number }>>(
    (typeof window !== 'undefined' && window.__listsCache) || new Map()
  )
  // Persist ref on window to share across hook instances
  useEffect(() => {
    if (typeof window !== 'undefined') window.__listsCache = listsCacheRef.current
  }, [])

  loadUserLists.current = useCallback(async (force?: boolean) => {
    if (!isAuthenticated) { setPersonLists([]); return }
    const now = Date.now()
    const key = userId != null ? String(userId) : ''
    // Serve from cache when available and fresh
    if (!force && key) {
      const cached = listsCacheRef.current.get(key)
      if (cached && now - cached.ts < LISTS_CACHE_TTL_MS) {
        setPersonLists(cached.items)
        return
      }
    }
    if (!force) {
      if (listsInFlightRef.current) return
      if (now - lastListsFetchTsRef.current < 1500) return
    }
    listsInFlightRef.current = true
    try {
      const items = await apiData<Array<{ id: number; title: string; items_count?: number }>>(`/api/lists`)
      const normalized: ListItem[] = Array.isArray(items) ? items : []
      setPersonLists(normalized)
      if (key) listsCacheRef.current.set(key, { items: normalized, ts: Date.now() })
      lastListsFetchTsRef.current = Date.now()
    } finally {
      listsInFlightRef.current = false
    }
  }, [isAuthenticated, apiData, userId])

  useEffect(() => {
    // Prefill from cache instantly to avoid UI flash
    if (isAuthenticated && userId != null) {
      const key = String(userId)
      const cached = listsCacheRef.current.get(key)
      if (cached) setPersonLists(cached.items)
    } else {
      setPersonLists([])
    }
    loadUserLists.current?.()
  }, [isAuthenticated, userId])

  // Detect shared list in URL and insert a readonly list item (non-editable) between sections
  useEffect(() => {
    const usp = new URLSearchParams(window.location.search)
    const code = usp.get('share')
    if (!code) { setSharedList(null); return }
    ;(async () => {
      try {
        const payload = await apiData<any>(`/api/list-shares/${encodeURIComponent(code)}`)
        const listId = Number(payload?.list_id)
        const title = String(payload?.title || '').trim() || 'Поделившийся список'
        const ownerId = payload?.owner_user_id != null ? String(payload.owner_user_id) : null
        const items = Array.isArray(payload?.items) ? payload.items as Array<{ item_type: string }> : []
        const itemsCount = items.length || undefined
        const personsCount = items.filter(i => i.item_type === 'person').length || undefined
        const achievementsCount = items.filter(i => i.item_type === 'achievement').length || undefined
        const periodsCount = items.filter(i => i.item_type === 'period').length || undefined
        if (Number.isFinite(listId) && listId > 0) {
          if (isAuthenticated && userId != null && String(userId) === ownerId) {
            setSharedList(null)
            const next = new URLSearchParams(window.location.search)
            next.delete('share')
            window.history.replaceState(null, '', `/lists${next.toString() ? `?${next.toString()}` : ''}`)
          } else {
            setSharedList({ id: listId, title, owner_user_id: ownerId || undefined, code, items_count: itemsCount, persons_count: personsCount, achievements_count: achievementsCount, periods_count: periodsCount })
          }
        } else setSharedList(null)
      } catch { setSharedList(null) }
    })()
  }, [isAuthenticated, userId, apiData])

  return { personLists, setPersonLists, sharedList, setSharedList, loadUserLists }
}


