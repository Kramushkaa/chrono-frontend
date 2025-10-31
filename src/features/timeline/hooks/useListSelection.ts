import { useEffect, useState, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { useToast } from 'shared/context/ToastContext'
import { apiData, resolveListShare } from 'shared/api/api'

type SharedListMeta = { code: string; title: string; listId?: number } | null

export function useListSelection(isTimeline: boolean, isAuthenticated: boolean, ownerUserId: string | null) {
  const location = useLocation()
  const { showToast } = useToast()

  const [selectedListId, setSelectedListId] = useState<number | null>(null)
  const [selectedListKey, setSelectedListKey] = useState<string>('')
  const [listPersons, setListPersons] = useState<any[] | null>(null)
  const [sharedListMeta, setSharedListMeta] = useState<SharedListMeta>(null)
  const lastShareMetaRef = (function(){
    // simple singleton per hook instance
    let store: SharedListMeta = null
    return {
      get: () => store,
      set: (v: SharedListMeta) => { store = v }
    }
  })()

  // Parse URL and load persons for share/ids/list
  useEffect(() => {
    if (!isTimeline) {
      setSelectedListId(null)
      setListPersons(null)
      setSharedListMeta(null)
      setSelectedListKey('')
      return
    }
    const usp = new URLSearchParams(window.location.search)
    const idsParam = usp.get('ids')
    const shareParam = usp.get('share')
    const listParam = usp.get('list') || shareParam
    const listId = listParam ? Number(listParam) : NaN
    ;(async () => {
      if (shareParam) {
        try {
          const resolved = await resolveListShare(shareParam)
          if (resolved?.owner_user_id && isAuthenticated && ownerUserId && ownerUserId === resolved.owner_user_id && resolved.list_id) {
            setSelectedListId(resolved.list_id)
            setSharedListMeta({ code: shareParam, title: resolved?.title || 'Список', listId: undefined })
            lastShareMetaRef.set({ code: shareParam, title: resolved?.title || 'Список', listId: undefined })
            setSelectedListKey(`list:${resolved.list_id}`)
            // Load persons for this list
            try {
              const items = await apiData<Array<{ item_type: string; person_id?: string }>>(`/api/lists/${resolved.list_id}/items`)
              const ids = items.filter(i => i.item_type === 'person' && i.person_id).map(i => i.person_id!)
              if (ids.length === 0) { setListPersons([]); return }
              const arr = await apiData<any[]>(`/api/persons/lookup/by-ids?ids=${ids.join(',')}`)
              setListPersons(arr)
            } catch (e: any) {
              showToast(e?.message || 'Не удалось загрузить содержимое списка', 'error')
              setListPersons([])
            }
            return
          }
          const items: Array<{ item_type: string; person_id?: string }> = resolved?.items || []
          const ids = items.filter(i => i.item_type === 'person' && i.person_id).map(i => i.person_id!)
          if (ids.length === 0) { setSelectedListId(null); setListPersons([]); return }
          const arr = await apiData<any[]>(`/api/persons/lookup/by-ids?ids=${ids.join(',')}`)
          setSelectedListId(null)
          setListPersons(arr)
          setSharedListMeta({ code: shareParam, title: resolved?.title || 'Список', listId: undefined })
          lastShareMetaRef.set({ code: shareParam, title: resolved?.title || 'Список', listId: undefined })
          setSelectedListKey(`share:${shareParam}`)
          return
        } catch (e: any) {
          showToast(e?.message || 'Не удалось загрузить общий список', 'error')
          setSelectedListId(null)
          setListPersons([])
          // keep previous meta if any
          const prev = lastShareMetaRef.get()
          setSharedListMeta(prev || null)
          setSelectedListKey('')
          return
        }
      }
      if (idsParam && idsParam.trim().length > 0) {
        try {
          const ids = idsParam.split(',').map(s => s.trim()).filter(Boolean)
          if (ids.length === 0) { setListPersons([]); setSelectedListId(null); return }
          const arr = await apiData<any[]>(`/api/persons/lookup/by-ids?ids=${ids.join(',')}`)
          setSelectedListId(null)
          setListPersons(arr)
        } catch (e: any) {
          showToast(e?.message || 'Не удалось загрузить выбранных личностей', 'error')
          setSelectedListId(null)
          setListPersons([])
        }
      } else if (Number.isFinite(listId) && listId > 0) {
        setSelectedListId(listId)
        try {
          const items = await apiData<Array<{ item_type: string; person_id?: string }>>(`/api/lists/${listId}/items`)
          const ids = items.filter(i => i.item_type === 'person' && i.person_id).map(i => i.person_id!)
          if (ids.length === 0) { setListPersons([]); return }
          const arr = await apiData<any[]>(`/api/persons/lookup/by-ids?ids=${ids.join(',')}`)
          setListPersons(arr)
        } catch (e: any) {
          showToast(e?.message || 'Не удалось загрузить содержимое списка', 'error')
          setListPersons([])
        }
        // keep pinned shared meta if previously known
        const prev = lastShareMetaRef.get()
        setSharedListMeta(prev || null)
        setSelectedListKey(`list:${listId}`)
      } else {
        setSelectedListId(null)
        setListPersons(null)
        // keep pinned shared meta if previously known
        const prev = lastShareMetaRef.get()
        setSharedListMeta(prev || null)
        setSelectedListKey('')
      }
    })()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTimeline, location.search, isAuthenticated, ownerUserId])

  const handleListChange = useCallback((v: string) => {
    if (!v) {
      setSelectedListId(null)
      setListPersons(null)
      // keep pinned shared meta; don't clear
      setSelectedListKey('')
      const usp = new URLSearchParams(window.location.search)
      usp.delete('list')
      // preserve share param if we have pinned meta
      const pinned = lastShareMetaRef.get()
      if (!pinned) usp.delete('share')
      window.history.replaceState(null, '', `/timeline${usp.toString() ? `?${usp.toString()}` : ''}`)
      return
    }
    if (v.startsWith('share:')) {
      const code = v.slice('share:'.length)
      const usp = new URLSearchParams(window.location.search)
      usp.set('share', code)
      usp.delete('list')
      window.history.replaceState(null, '', `/timeline?${usp.toString()}`)
      // The useEffect will handle loading via location.search change
      return
    }
    if (v.startsWith('list:')) {
      const id = Number(v.slice('list:'.length))
      if (Number.isFinite(id) && id > 0) {
        const usp = new URLSearchParams(window.location.search)
        usp.set('list', String(id))
        // preserve share param if we have pinned meta
        const prev = lastShareMetaRef.get()
        if (!prev) usp.delete('share')
        window.history.replaceState(null, '', `/timeline?${usp.toString()}`)
        // The useEffect will handle loading via location.search change
      }
    }
  }, [lastShareMetaRef])

  return {
    selectedListId,
    selectedListKey,
    listPersons,
    sharedListMeta,
    setSelectedListId,
    handleListChange
  }
}


