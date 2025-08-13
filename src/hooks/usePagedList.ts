import { useEffect, useMemo, useRef, useState } from 'react'

type UsePagedListOptions<TItem> = {
  enabled?: boolean
  queryKey: any[]
  pageSize: number
  fetchPage: (offset: number, pageSize: number, signal: AbortSignal) => Promise<TItem[]>
  dedupeBy?: (item: TItem) => string | number
}

export function usePagedList<TItem>({ enabled = true, queryKey, pageSize, fetchPage, dedupeBy }: UsePagedListOptions<TItem>) {
  const [items, setItems] = useState<TItem[]>([])
  const [isLoading, setIsLoading] = useState(enabled)
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const loadingRef = useRef(false)
  const requestKeyRef = useRef<string>('')
  const fetchPageRef = useRef(fetchPage)
  const dedupeByRef = useRef(dedupeBy)

  useEffect(() => { fetchPageRef.current = fetchPage }, [fetchPage])
  useEffect(() => { dedupeByRef.current = dedupeBy }, [dedupeBy])

  const keyStr = useMemo(() => JSON.stringify(queryKey), [queryKey])

  useEffect(() => {
    setItems([])
    setOffset(0)
    setHasMore(true)
  }, [keyStr])

  useEffect(() => {
    if (!enabled || !hasMore) return
    setIsLoading(true)
    loadingRef.current = true
    const ctrl = new AbortController()
    const reqKey = `${keyStr}::${offset}`
    requestKeyRef.current = reqKey
    fetchPageRef.current(offset, pageSize, ctrl.signal)
      .then(arr => {
        if (requestKeyRef.current !== reqKey) return
        setItems(prev => {
          const keyFn = dedupeByRef.current
          if (!keyFn) return [...prev, ...arr]
          const existing = new Set(prev.map(keyFn))
          const toAdd = arr.filter(i => !existing.has(keyFn(i)))
          return [...prev, ...toAdd]
        })
        if (arr.length < pageSize) setHasMore(false)
      })
      .finally(() => { setIsLoading(false); loadingRef.current = false })
    return () => ctrl.abort()
  }, [enabled, keyStr, offset, hasMore, pageSize])

  const loadMore = () => {
    if (loadingRef.current || isLoading || !hasMore) return
    setOffset(o => o + pageSize)
  }

  return { items, isLoading, hasMore, loadMore, reset: () => { setItems([]); setOffset(0); setHasMore(true) } }
}


