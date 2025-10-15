import { useCallback, useState } from 'react'

type PersonRef = { id: string }

type Params = {
  showToast: (m: string, t?: 'success' | 'error' | 'info') => void
  reloadLists: (force?: boolean) => Promise<void> | void
  getSelectedPerson: () => PersonRef | null
  apiFetch: (path: string, init?: RequestInit) => Promise<Response>
  apiData: <T = unknown>(path: string, init?: RequestInit) => Promise<T>
}

export function useAddToList({ showToast, reloadLists, getSelectedPerson, apiFetch, apiData }: Params) {
  const [isOpen, setIsOpen] = useState(false)
  const [pendingAddPersonId, setPendingAddPersonId] = useState<string | null>(null)
  const [pendingAddAchievementId, setPendingAddAchievementId] = useState<number | null>(null)
  const [pendingAddPeriodId, setPendingAddPeriodId] = useState<number | null>(null)
  const [includeLinked, setIncludeLinked] = useState(false)

  const openForPerson = useCallback((person: PersonRef) => {
    setPendingAddPersonId(person?.id || null)
    setPendingAddAchievementId(null)
    setPendingAddPeriodId(null)
    setIncludeLinked(false)
    setIsOpen(true)
  }, [])

  const openForAchievement = useCallback((achievementId: number) => {
    setPendingAddPeriodId(null)
    setPendingAddAchievementId(achievementId)
    setIncludeLinked(false)
    setIsOpen(true)
  }, [])

  const openForPeriod = useCallback((periodId: number) => {
    setPendingAddAchievementId(null)
    setPendingAddPeriodId(periodId)
    setIncludeLinked(false)
    setIsOpen(true)
  }, [])

  const close = useCallback(() => setIsOpen(false), [])

  const onAdd = useCallback(async (listId: number) => {
    const addingPeriodId = pendingAddPeriodId
    const addingAchievementId = pendingAddAchievementId
    const addingPersonId = pendingAddPersonId ?? getSelectedPerson()?.id ?? null
    if (!addingPersonId && !addingAchievementId && !addingPeriodId) return
    try {
      const payload = addingPeriodId
        ? { item_type: 'period', period_id: addingPeriodId }
        : addingAchievementId
        ? { item_type: 'achievement', achievement_id: addingAchievementId }
        : { item_type: 'person', person_id: addingPersonId! }
      const res = await apiFetch(`/api/lists/${listId}/items`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      })
      const data = await res.json().catch(() => null)
      if (res.ok) {
        if (data?.message === 'already_exists') showToast('Элемент уже есть в выбранном списке', 'info')
        else showToast('Добавлено в список', 'success')
        // If person and include-linked checked, bulk add achievements and periods
        if (addingPersonId && includeLinked) {
          try {
            const [achJson, perJson] = await Promise.all([
              apiData<Array<{ id: number }>>(`/api/persons/${encodeURIComponent(addingPersonId)}/achievements`),
              apiData<Array<{ id: number }>>(`/api/persons/${encodeURIComponent(addingPersonId)}/periods`)
            ])
            const achs: Array<{ id: number }> = Array.isArray(achJson) ? achJson : []
            const pers: Array<{ id: number }> = Array.isArray(perJson) ? perJson : []
            for (const a of achs) {
              await apiFetch(`/api/lists/${listId}/items`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ item_type: 'achievement', achievement_id: a.id }) })
            }
            for (const p of pers) {
              await apiFetch(`/api/lists/${listId}/items`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ item_type: 'period', period_id: p.id }) })
            }
            showToast('Связанные достижения и периоды добавлены', 'success')
          } catch {
            showToast('Не удалось добавить связанные элементы', 'error')
          }
        }
        close()
        setPendingAddPersonId(null)
        setPendingAddAchievementId(null)
        setPendingAddPeriodId(null)
        setIncludeLinked(false)
        await reloadLists?.(true)
      } else {
        const errorData = data as Record<string, unknown> | null
        const msg = (errorData && typeof errorData.message === 'string') ? errorData.message : 'Не удалось добавить в список'
        showToast(msg, 'error')
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Ошибка'
      showToast(errorMessage, 'error')
    }
  }, [pendingAddPersonId, pendingAddAchievementId, pendingAddPeriodId, getSelectedPerson, includeLinked, apiFetch, apiData, showToast, reloadLists, close])

  return {
    isOpen,
    openForPerson,
    openForAchievement,
    openForPeriod,
    close,
    includeLinked,
    setIncludeLinked,
    onAdd
  }
}


