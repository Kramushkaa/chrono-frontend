import { useEffect, useMemo, useState } from 'react'
import { Person } from '../types'
import { apiFetch } from '../services/api'
import { usePagedList } from './usePagedList'

export function usePersonsPaged(query: { q?: string; category?: string; country?: string; startYear?: number; endYear?: number }, enabled: boolean = true) {
  const [fallbackAll, setFallbackAll] = useState<Person[] | null>(null)

  const paramsStr = useMemo(() => {
    const p = new URLSearchParams()
    if (query.q) p.set('q', query.q)
    if (query.category) p.set('category', query.category)
    if (query.country) p.set('country', query.country)
    if (typeof query.startYear === 'number') p.set('startYear', String(query.startYear))
    if (typeof query.endYear === 'number') p.set('endYear', String(query.endYear))
    return p.toString()
  }, [query.q, query.category, query.country, query.startYear, query.endYear])

  useEffect(() => {
    setFallbackAll(null)
  }, [paramsStr])

  const { items, isLoading, hasMore, loadMore, reset } = usePagedList<Person>({
    enabled,
    queryKey: [paramsStr, fallbackAll ? 1 : 0],
    pageSize: 50,
    dedupeBy: (p) => p.id,
    fetchPage: async (offset, pageSize, signal) => {
      if (fallbackAll) {
        const slice = fallbackAll.slice(offset, offset + pageSize)
        return slice
      }
      const p = new URLSearchParams(paramsStr)
      p.set('limit', String(pageSize))
      p.set('offset', String(offset))
      const res = await apiFetch(`/api/persons?${p.toString()}`, { signal })
      if (!res.ok) {
        if (res.status === 404) {
          const fullRes = await apiFetch(`/api/persons`, { signal })
          const fullData = await fullRes.json().catch(() => [])
          const pqs = new URLSearchParams(paramsStr)
          const q = (pqs.get('q') || '').toLowerCase()
          const cat = pqs.get('category') || ''
          const country = pqs.get('country') || ''
          const all: Person[] = (fullData || [])
            .filter((p: Person) => {
              if (q && !`${p.name} ${p.country} ${p.category}`.toLowerCase().includes(q)) return false
              if (cat && p.category !== cat) return false
              if (country) {
                const split = (p.country || '').split('/').map(s => s.trim())
                if (!split.includes(country)) return false
              }
              return true
            })
            .sort((a: Person, b: Person) => a.name.localeCompare(b.name))
          setFallbackAll(all)
          return all.slice(0, pageSize)
        }
        return []
      }
      const data = await res.json().catch(() => ({ data: [] }))
      const arrRaw: any = (data && typeof data === 'object') ? (data.data ?? data.items ?? data.results ?? data) : []
      const arr: Person[] = Array.isArray(arrRaw) ? arrRaw : []
      return arr
    }
  })

  return { items, isLoading, hasMore, loadMore, reset }
}


