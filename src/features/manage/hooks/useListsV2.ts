import { useState, useEffect, useRef, useCallback } from 'react'
import { useApiDataSimple } from 'hooks/useApiData'

type ListItem = { id: number; title: string; items_count?: number }
type SharedList = { id: number; title: string; readonly: boolean; ownerId?: string } | null

interface UseListsParams {
  isAuthenticated: boolean
  userId?: string | number | null
}

export function useListsV2({ isAuthenticated, userId }: UseListsParams) {
  const [sharedList, setSharedList] = useState<SharedList>(null)
  const sharedListCodeRef = useRef<string | null>(null)

  // Загрузка списков пользователя
  const { 
    data: personLists, 
    isLoading: listsLoading, 
    error: listsError, 
    refetch: loadUserLists 
  } = useApiDataSimple<ListItem>({
    endpoint: '/api/lists',
    enabled: isAuthenticated,
    cacheKey: `lists:${userId}`,
    transformData: (data) => Array.isArray(data) ? data : []
  })

  // Загрузка общего списка из URL
  const { data: sharedListData } = useApiDataSimple<{ list_id: number; title: string; owner_user_id?: number }>({
    endpoint: sharedListCodeRef.current ? `/api/list-shares/${sharedListCodeRef.current}` : '',
    enabled: !!sharedListCodeRef.current,
    cacheKey: `shared-list:${sharedListCodeRef.current}`,
    transformData: (data) => Array.isArray(data) ? data[0] : data
  })

  // Обработка общего списка
  useEffect(() => {
    if (!sharedListData || !Array.isArray(sharedListData) || sharedListData.length === 0) {
      setSharedList(null)
      return
    }

    const data = sharedListData[0] as any
    const listId = Number(data.list_id)
    const title = String(data.title || '').trim() || 'Поделившийся список'
    const ownerId = data.owner_user_id != null ? String(data.owner_user_id) : undefined

    if (listId > 0) {
      setSharedList({
        id: listId,
        title,
        readonly: true,
        ownerId
      })
    } else {
      setSharedList(null)
    }
  }, [sharedListData])

  // Функция для установки кода общего списка
  const setSharedListCode = useCallback((code: string | null) => {
    sharedListCodeRef.current = code
  }, [])

  // Функция для сброса общего списка
  const clearSharedList = useCallback(() => {
    setSharedList(null)
    sharedListCodeRef.current = null
  }, [])

  return {
    personLists: personLists || [],
    isLoading: listsLoading,
    error: listsError,
    sharedList,
    setSharedList,
    loadUserLists,
    setSharedListCode,
    clearSharedList
  }
}
