import { useEffect, useMemo, useRef } from 'react'
import { Person, MixedListItem } from 'shared/types'
import { AuthUser } from 'features/auth/services/auth'
import { getCategories, getCountries, getCountryOptions, getPersonById, getMyPersonsCount, getMyAchievementsCount, getMyPeriodsCount, CountryOption, apiData } from 'shared/api/api'
import type { LifePeriod } from './useManageState'

// Shared list type (from useLists)
type SharedList = {
  id: number
  title: string
  owner_user_id?: string
  code: string
  items_count?: number
  persons_count?: number
  achievements_count?: number
  periods_count?: number
}

interface ManageBusinessLogicParams {
  // State
  selected: Person | null
  setSelected: (person: Person | null | ((prev: Person | null) => Person | null)) => void
  categories: string[]
  setCategories: (categories: string[]) => void
  countries: string[]
  setCountries: (countries: string[]) => void
  countryOptions: CountryOption[]
  setCountryOptions: (options: CountryOption[]) => void
  lifePeriods: LifePeriod[]
  setLifePeriods: (periods: LifePeriod[] | ((prev: LifePeriod[]) => LifePeriod[])) => void
  editPersonCategory: string
  setEditPersonCategory: (category: string) => void
  editBirthYear: number
  setEditBirthYear: (year: number) => void
  editDeathYear: number
  setEditDeathYear: (year: number) => void
  newLifePeriods: LifePeriod[]
  setNewLifePeriods: (periods: LifePeriod[]) => void
  showCreate: boolean
  createType: 'person' | 'achievement' | 'period'
  activeTab: 'persons' | 'achievements' | 'periods'
  menuSelection: 'all' | 'pending' | 'mine' | `list:${number}`
  selectedListId: number | null
  setSelectedListId: (id: number | null) => void
  mineCounts: { persons: number; achievements: number; periods: number }
  setMineCounts: (counts: { persons: number; achievements: number; periods: number }) => void
  countsLoadKeyRef: React.MutableRefObject<string | null>
  countsLastTsRef: React.MutableRefObject<number>
  fetchedDetailsIdsRef: React.MutableRefObject<Set<string>>
  lastSelectedRef: React.MutableRefObject<Person | null>
  listItems: MixedListItem[]
  setListItems: (items: MixedListItem[]) => void
  listItemIdByDomainIdRef: React.MutableRefObject<Map<string, number>>
  listLoading: boolean
  setListLoading: (loading: boolean) => void
  
  // Props
  isAuthenticated: boolean
  user: AuthUser | null
  resetPersons: () => void
  resetAchievements: () => void
  resetPeriods: () => void
  sharedList: SharedList | null
}

// Helper functions for safe property access
function pickString(a: unknown, b: unknown): string {
  const aa = typeof a === 'string' ? a.trim() : ''
  const bb = typeof b === 'string' ? b.trim() : ''
  return aa.length > 0 ? aa : bb
}

function pickNumber(a: unknown, b: unknown): number {
  return typeof a === 'number' && !Number.isNaN(a) ? a : (typeof b === 'number' && !Number.isNaN(b) ? b : 0)
}

function pickArray<T>(a: unknown, b: unknown): T[] {
  return Array.isArray(a) && a.length > 0 ? a : (Array.isArray(b) ? b : [])
}

export function useManageBusinessLogic(params: ManageBusinessLogicParams) {
  // Ref для отслеживания отмены запроса
  const cancelledRef = useRef(false)
  
  const {
    selected,
    setSelected,
    categories,
    setCategories,
    // countries - unused
    // setCountries - used in useEffect
    setCountries,
    countryOptions,
    setCountryOptions,
    lifePeriods,
    setLifePeriods,
    // editPersonCategory - unused
    setEditPersonCategory,
    editBirthYear,
    setEditBirthYear,
    editDeathYear,
    setEditDeathYear,
    newLifePeriods,
    setNewLifePeriods,
    showCreate,
    createType,
    activeTab,
    menuSelection,
    selectedListId,
    setSelectedListId,
    mineCounts, // eslint-disable-line @typescript-eslint/no-unused-vars -- используется в интерфейсе для совместимости
    setMineCounts,
    countsLoadKeyRef,
    countsLastTsRef,
    fetchedDetailsIdsRef,
    lastSelectedRef,
    listItems,
    setListItems,
    listItemIdByDomainIdRef,
    listLoading,
    setListLoading,
    isAuthenticated,
    user,
    resetPersons,
    resetAchievements,
    resetPeriods,
    sharedList,
  } = params

  // Загрузка метаданных - выполняем только один раз при монтировании
  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const [cats, cntrs, cntrOpts] = await Promise.all([getCategories(), getCountries(), getCountryOptions()])
        if (!mounted) return
        setCategories(cats || [])
        setCountries(cntrs || [])
        setCountryOptions(cntrOpts || [])
      } catch {}
    })()
    return () => {
      mounted = false
    }
    // Убираем зависимости setState функций - они стабильны в React
  }, [])

  // Стабилизируем значения для предотвращения лишних вызовов useEffect
  const userId = useMemo(() => user?.id, [user?.id])
  const authStatus = useMemo(() => isAuthenticated, [isAuthenticated])

  // Загрузка стабильных счётчиков "Мои"
  useEffect(() => {
    // Сбрасываем флаг отмены при каждом запуске
    cancelledRef.current = false
    
    if (!authStatus || !userId) {
      setMineCounts({ persons: 0, achievements: 0, periods: 0 })
      // Сбрасываем ключи при logout
      countsLoadKeyRef.current = null
      countsLastTsRef.current = 0
      return
    }
    
    const key = String(userId)
    const now = Date.now()
    
    // Простая логика rate limiting: загружаем только если это новый пользователь или прошло достаточно времени
    const shouldLoad = countsLoadKeyRef.current !== key || (now - countsLastTsRef.current >= 18000) // 18 секунд
    
    if (!shouldLoad) {
      return
    }
    
    // Обновляем ключи перед загрузкой
    countsLoadKeyRef.current = key
    countsLastTsRef.current = now
    
    ;(async () => {
      try {
        const [pc, ac, prc] = await Promise.all([
          getMyPersonsCount().catch(() => 0),
          getMyAchievementsCount().catch(() => 0),
          getMyPeriodsCount().catch(() => 0),
        ])
        
        if (!cancelledRef.current) {
          setMineCounts({ persons: pc, achievements: ac, periods: prc })
        }
      } catch (error) {
        // Silent fail - don't spam console
      }
    })()
    
    return () => {
      cancelledRef.current = true
    }
  }, [authStatus, userId])

  // Сброс данных при смене вкладки
  useEffect(() => {
    if (activeTab === 'persons') {
      resetPersons()
    } else if (activeTab === 'achievements') {
      resetAchievements()
    } else if (activeTab === 'periods') {
      resetPeriods()
    }
  }, [activeTab, resetPersons, resetAchievements, resetPeriods])

  // Обработка выбранной личности
  useEffect(() => {
    const id = selected?.id
    if (!id) return
    if (fetchedDetailsIdsRef.current.has(id)) return
    let aborted = false
    ;(async () => {
      try {
        const fresh = await getPersonById(id)
        if (aborted || !fresh) return
        fetchedDetailsIdsRef.current.add(id)
        setSelected((prev) => {
          if (prev && prev.id === id && fresh) {
            return {
              ...prev,
              id: prev.id,
              name: pickString(fresh.name, prev.name),
              description: pickString(fresh.description, prev.description),
              category: pickString(fresh.category, prev.category),
              country: pickString(fresh.country, prev.country),
              birthYear: pickNumber(fresh.birthYear, prev.birthYear),
              deathYear: pickNumber(fresh.deathYear, prev.deathYear),
              reignStart: pickNumber(fresh.reignStart, prev.reignStart),
              reignEnd: pickNumber(fresh.reignEnd, prev.reignEnd),
              imageUrl: pickString(fresh.imageUrl, prev.imageUrl),
              wikiLink: pickString(fresh.wikiLink, prev.wikiLink),
              achievements: pickArray<string>(fresh.achievements, prev.achievements),
              achievementsWiki: pickArray<string | null>(fresh.achievementsWiki, prev.achievementsWiki),
              achievementYears: fresh.achievementYears ?? prev.achievementYears,
              periods: fresh.periods ?? prev.periods,
              rulerPeriods: fresh.rulerPeriods ?? prev.rulerPeriods,
            } as Person
          }
          return fresh || prev
        })
      } catch {
        fetchedDetailsIdsRef.current.add(id)
      }
    })()
    return () => {
      aborted = true
    }
  }, [selected?.id, setSelected])

  // Подготовка данных для редактирования личности
  useEffect(() => {
    if (!selected) {
      setLifePeriods([])
      return
    }
    const initial: Array<{ countryId: string; start: number | ''; end: number | '' }> = []
    const prs = Array.isArray(selected.periods) ? selected.periods : []
    for (const pr of prs) {
      const t = (pr.type || '').toLowerCase()
      if (t === 'life' && pr.countryId)
        initial.push({ countryId: String(pr.countryId), start: pr.startYear, end: pr.endYear ?? '' })
    }
    if (initial.length === 0 && Array.isArray(selected.rulerPeriods)) {
      for (const rp of selected.rulerPeriods) {
        if (rp.countryId) initial.push({ countryId: String(rp.countryId), start: rp.startYear, end: rp.endYear })
      }
    }
    if (initial.length === 0) {
      let firstId = ''
      const parts = (selected.country || '')
        .split('/')
        .map((s) => s.trim())
        .filter(Boolean)
      const match = countryOptions.find((c) => parts.includes(c.name))
      if (match) firstId = String(match.id)
      else if (countryOptions.length > 0) firstId = String(countryOptions[0].id)
      if (firstId)
        initial.push({
          countryId: firstId,
          start: selected.birthYear,
          end: selected.deathYear ?? new Date().getFullYear(),
        })
    }
    setLifePeriods(initial)
  }, [selected, countryOptions, setLifePeriods])

  useEffect(() => {
    if (!selected) {
      setEditPersonCategory('')
      return
    }
    const match = categories.find((c) => c === selected.category)
    setEditPersonCategory(match ? match : '')
  }, [selected, categories, setEditPersonCategory])

  useEffect(() => {
    if (!selected) {
      setEditBirthYear(0)
      setEditDeathYear(0)
      return
    }
    setEditBirthYear(selected.birthYear)
    setEditDeathYear(selected.deathYear ?? new Date().getFullYear())
  }, [selected, setEditBirthYear, setEditDeathYear])

  useEffect(() => {
    if (lifePeriods.length === 0) return
    setLifePeriods((prev) =>
      prev.map((lp) => {
        const start = typeof lp.start === 'number' ? Math.max(lp.start, editBirthYear) : lp.start
        const end = typeof lp.end === 'number' ? Math.min(lp.end, editDeathYear) : lp.end
        return { ...lp, start, end }
      })
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editBirthYear, editDeathYear])

  // Подготовка данных для создания новой личности
  useEffect(() => {
    if (showCreate && createType === 'person' && newLifePeriods.length === 0) {
      setNewLifePeriods([{ countryId: '', start: '', end: '' }])
    }
  }, [showCreate, createType, newLifePeriods.length, setNewLifePeriods])

  // Обработка выбора списка
  useEffect(() => {
    if ((menuSelection as string).startsWith('list:')) {
      const id = Number((menuSelection as string).split(':')[1])
      setSelectedListId(Number.isFinite(id) ? id : null)
    } else if (menuSelection === 'all') {
      setSelectedListId(null)
    } else if (menuSelection === 'pending' || menuSelection === 'mine') {
      setSelectedListId(null)
    }
  }, [activeTab, menuSelection, setSelectedListId])

  // Загрузка содержимого списка
  useEffect(() => {
    let aborted = false
    ;(async () => {
      const listModeActive = (menuSelection as string).startsWith('list:')
      if (!listModeActive || !selectedListId) {
        setListItems([])
        return
      }
      setListLoading(true)
      try {
        let items: Array<{ id: number; item_type: string; person_id?: string; achievement_id?: number; period_id?: number }>
        const readonlyShared = sharedList && sharedList.id === selectedListId && !!sharedList.code
        if (readonlyShared && sharedList?.code) {
          const resolved = await apiData<any>(`/api/list-shares/${encodeURIComponent(sharedList.code)}`)
          items = (Array.isArray(resolved?.items) ? resolved.items : []).map((it: any, idx: number) => ({
            id: idx + 1,
            item_type: it.item_type,
            person_id: it.person_id,
            achievement_id: it.achievement_id,
            period_id: it.period_id,
          }))
        } else {
          items = await apiData(`/api/lists/${selectedListId}/items`)
        }
        const personIds = items.filter((i) => i.item_type === 'person' && i.person_id).map((i) => i.person_id!)
        const achIds = items
          .filter((i) => i.item_type === 'achievement' && typeof i.achievement_id === 'number')
          .map((i) => i.achievement_id!)
        const periodIds = items.filter((i) => i.item_type === 'period' && typeof i.period_id === 'number').map((i) => i.period_id!)

        const [personsData, achData, periodsData] = await Promise.all([
          personIds.length ? apiData<Person[]>(`/api/persons/lookup/by-ids?ids=${personIds.join(',')}`) : Promise.resolve([]),
          achIds.length ? apiData<any[]>(`/api/achievements/lookup/by-ids?ids=${achIds.join(',')}`) : Promise.resolve([]),
          periodIds.length ? apiData<any[]>(`/api/periods/lookup/by-ids?ids=${periodIds.join(',')}`) : Promise.resolve([]),
        ])

        const periodsMap = new Map<number, any>()
        ;(Array.isArray(periodsData) ? periodsData : []).forEach((p: any) => periodsMap.set(p.id, p))
        const personsMap = new Map<string, Person>()
        ;(Array.isArray(personsData) ? personsData : []).forEach((p: Person) => personsMap.set(p.id, p))
        const achMap = new Map<number, any>()
        ;(Array.isArray(achData) ? achData : []).forEach((a: any) => achMap.set(a.id, a))

        const normalized: any[] = items.map((it) => {
          if (it.item_type === 'person' && it.person_id) {
            const p = personsMap.get(it.person_id) || null
            return {
              key: `p:${it.person_id}:${it.id}`,
              listItemId: it.id,
              type: 'person',
              person: p,
              achievement: null,
              periodId: null,
              title: p?.name || it.person_id,
              subtitle: p?.country,
            }
          }
          if (it.item_type === 'achievement' && typeof it.achievement_id === 'number') {
            const a = achMap.get(it.achievement_id) || null
            return {
              key: `a:${it.achievement_id}:${it.id}`,
              listItemId: it.id,
              type: 'achievement',
              person: null,
              achievement: a,
              periodId: null,
              title: a?.title || 'Достижение',
              subtitle: a ? String(a.year) : undefined,
            }
          }
          if (it.item_type === 'period' && typeof it.period_id === 'number') {
            const pr = periodsMap.get(it.period_id) || null
            const headerParts: string[] = []
            if (pr?.person_name) headerParts.push(pr.person_name)
            if (pr?.country_name) headerParts.push(pr.country_name)
            const header = headerParts.join(' • ')
            return {
              key: `pr:${it.period_id}:${it.id}`,
              listItemId: it.id,
              type: 'period',
              person: null,
              achievement: null,
              periodId: it.period_id || null,
              period: pr,
              title: header || `Период #${it.period_id}`,
              subtitle: pr
                ? `${pr.period_type === 'ruler' ? 'Правление' : pr.period_type === 'life' ? 'Жизнь' : pr.period_type} — ${pr.start_year}—${pr.end_year ?? '—'}`
                : undefined,
            }
          }
          return {
            key: `x:${it.id}`,
            listItemId: it.id,
            type: 'person',
            person: null,
            achievement: null,
            periodId: null,
            title: '—',
            subtitle: undefined,
          }
        })
        if (!aborted) {
          setListItems(normalized)
          const m = new Map<string, number>()
          for (const it of normalized) {
            if (it.type === 'person' && it.person?.id) m.set(String(it.person.id), it.listItemId)
            if (it.type === 'achievement' && it.achievement?.id != null) m.set(String(it.achievement.id), it.listItemId)
            if (it.type === 'period' && it.periodId != null) m.set(String(it.periodId), it.listItemId)
          }
          listItemIdByDomainIdRef.current = m
        }
      } catch {
        if (!aborted) setListItems([])
      } finally {
        if (!aborted) setListLoading(false)
      }
    })()
    return () => {
      aborted = true
    }
  }, [activeTab, menuSelection, selectedListId, sharedList, setListItems, listItemIdByDomainIdRef, setListLoading])

  // Сохранение выбранной личности при переключении на пустой список
  useEffect(() => {
    if (
      (menuSelection as string).startsWith('list:') &&
      listItems.length === 0 &&
      !listLoading &&
      !selected &&
      lastSelectedRef.current
    ) {
      setSelected(lastSelectedRef.current)
    }
  }, [menuSelection, listItems.length, listLoading, selected, setSelected])

  // Подготовка опций для селектов
  const countrySelectOptions = useMemo(
    () => countryOptions.map((c) => ({ value: String(c.id), label: c.name })),
    [countryOptions]
  )
  const categorySelectOptions = useMemo(() => categories.map((c) => ({ value: c, label: c })), [categories])

  return {
    countrySelectOptions,
    categorySelectOptions,
  }
}

