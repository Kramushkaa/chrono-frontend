import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Person } from '../types'
import { useFilters } from '../hooks/useFilters'
import { getGroupColor, getPersonGroup } from '../utils/groupingUtils'
import { useAchievements } from '../hooks/useAchievements'
import { usePeriods } from '../hooks/usePeriods'
import { PersonCard } from '../components/PersonCard'
import { usePersonsPaged } from '../hooks/usePersonsPaged'
import { getCategories, getCountries, addGenericAchievement, getCountryOptions, CountryOption, apiFetch, createListShareCode } from '../services/api'
import { AppHeader } from '../components/AppHeader'
import { useNavigate } from 'react-router-dom'
// FilterDropdown now used from PersonsList
import { SearchableSelect, SelectOption } from '../components/SearchableSelect'
import { PersonsList } from '../components/Manage/PersonsList'
import { PersonEditor } from '../components/Manage/PersonEditor'
import { CreateListModal } from '../components/Manage/CreateListModal'
import { LeftMenu, LeftMenuSelection } from '../components/Manage/LeftMenu'
import { AddToListModal } from '../components/Manage/AddToListModal'
import { adminUpsertPerson, getPersonById, proposePersonEdit, proposeNewPerson, addAchievement } from '../services/api'
import { useAuth } from '../context'
import { useToast } from '../context/ToastContext'
import { LoginForm } from '../components/Auth/LoginForm'
import { slugifyIdFromName } from '../utils/slug'
import { validateLifePeriodsClient } from '../utils/validation'
import { LifePeriodsEditor } from '../components/Persons/LifePeriodsEditor'

type Tab = 'persons' | 'achievements' | 'periods'

export default function ManagePage() {
  const {
    filters,
    setFilters,
    groupingType,
    setGroupingType,
    yearInputs,
    setYearInputs,
    applyYearFilter,
    handleYearKeyPress,
    resetAllFilters
  } = useFilters()
  const [isScrolled] = useState(false)
  const [showControls, setShowControls] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('persons')
  type ViewMode = 'all' | 'pending' | 'mine' | 'list'
  const [personsMode, setPersonsMode] = useState<ViewMode>('all')
  const [selectedListId, setSelectedListId] = useState<number | null>(null)
  type AchViewMode = 'all' | 'pending' | 'mine' | 'list'
  const [achMode, setAchMode] = useState<AchViewMode>('all')
  type PeriodViewMode = 'all' | 'pending' | 'mine' | 'list'
  const [periodsMode, setPeriodsMode] = useState<PeriodViewMode>('all')
  type MenuSelection = 'all' | 'pending' | 'mine' | `list:${number}`
  const [menuSelection, setMenuSelection] = useState<MenuSelection>('all')
  // const { persons, isLoading } = useTimelineData(filters, true)
  const [searchPersons, setSearchPersons] = useState('')
  const [searchAch, setSearchAch] = useState('')
  const [searchPeriods, setSearchPeriods] = useState('')
  const [categories, setCategories] = useState<string[]>([])
  const [countries, setCountries] = useState<string[]>([])
  const { items: achItemsAll, isLoading: achLoadingAll, hasMore: hasMoreAll, loadMore: loadMoreAll } = useAchievements(searchAch, activeTab === 'achievements' && achMode === 'all')
  const [achItemsAlt, setAchItemsAlt] = useState<any[]>([])
  const [achAltLoading, setAchAltLoading] = useState(false)
  const [achAltHasMore, setAchAltHasMore] = useState(false)
  const [achAltOffset, setAchAltOffset] = useState(0)
  const [achPendingCount, setAchPendingCount] = useState<number | null>(null)
  const [achMineCount, setAchMineCount] = useState<number | null>(null)
  const [periodType, setPeriodType] = useState<'life' | 'ruler' | ''>('')
  const { items: periodItemsAll, isLoading: periodsLoadingAll, hasMore: periodsHasMoreAll, loadMore: loadMorePeriodsAll } = usePeriods({ query: searchPeriods, type: periodType }, activeTab === 'periods')
  const [selected, setSelected] = useState<Person | null>(null)
  const lastSelectedRef = useRef<Person | null>(null)
  useEffect(() => { if (selected) lastSelectedRef.current = selected }, [selected])
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const isModerator = !!user && (user.role === 'admin' || user.role === 'moderator')
  const { showToast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [createType, setCreateType] = useState<'person' | 'achievement'>('person')
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [achIsGlobal, setAchIsGlobal] = useState(false)
  const [achSelectedCountryId, setAchSelectedCountryId] = useState<string>('')
  const [countryOptions, setCountryOptions] = useState<CountryOption[]>([])
  // removed local query state for persons select
  const [achSelectedPersonId, setAchSelectedPersonId] = useState<string>('')
  const [personOptions, setPersonOptions] = useState<SelectOption[]>([])
  const [personsSelectLoading, setPersonsSelectLoading] = useState(false)
  const createModalRef = useRef<HTMLDivElement | null>(null)
  const authModalRef = useRef<HTMLDivElement | null>(null)
  const lastFocusedBeforeModalRef = useRef<HTMLElement | null>(null)
  const countrySelectOptions = useMemo(() => countryOptions.map(c => ({ value: String(c.id), label: c.name })), [countryOptions])
  const [newLifePeriods, setNewLifePeriods] = useState<Array<{ countryId: string; start: number | ''; end: number | '' }>>([])
  const [newBirthYear, setNewBirthYear] = useState<number | ''>('')
  const [newDeathYear, setNewDeathYear] = useState<number | ''>('')
  const [newYearErrors, setNewYearErrors] = useState<{ birth?: string; death?: string }>({})
  const [newPeriodsError, setNewPeriodsError] = useState<string | null>(null)
  const [editPersonCountryId, setEditPersonCountryId] = useState<string>('')
  const categorySelectOptions = useMemo(() => categories.map(c => ({ value: c, label: c })), [categories])
  const [newPersonCategory, setNewPersonCategory] = useState<string>('')
  const [editPersonCategory, setEditPersonCategory] = useState<string>('')
  const [lifePeriods, setLifePeriods] = useState<Array<{ countryId: string; start: number | ''; end: number | '' }>>([])
  const [editBirthYear, setEditBirthYear] = useState<number>(0)
  const [editDeathYear, setEditDeathYear] = useState<number>(0)
  const [yearErrors, setYearErrors] = useState<{ birth?: string; death?: string }>({})
  const [periodsError, setPeriodsError] = useState<string | null>(null)
  // stringifyCountriesFromPeriods no longer used
  // getCountriesLabel handled inside PersonsList

  // validation is imported from utils/validation

  // local slugify removed, using utils/slug

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
    return () => { mounted = false }
  }, [])

  // Focus trap helpers
  const trapFocus = (container: HTMLElement, e: React.KeyboardEvent) => {
    if (e.key !== 'Tab') return
    const focusable = container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    )
    const list = Array.from(focusable).filter(el => el.offsetParent !== null)
    if (list.length === 0) return
    const first = list[0]
    const last = list[list.length - 1]
    const active = document.activeElement as HTMLElement | null
    const shift = (e as any).shiftKey
    if (!shift && active === last) { e.preventDefault(); first.focus(); }
    else if (shift && active === first) { e.preventDefault(); last.focus(); }
  }

  // Manage focus on open/close create modal
  useEffect(() => {
    if (showCreate) {
      lastFocusedBeforeModalRef.current = document.activeElement as HTMLElement
      setTimeout(() => { createModalRef.current?.focus() }, 0)
    } else if (!showCreate && lastFocusedBeforeModalRef.current) {
      try { lastFocusedBeforeModalRef.current.focus() } catch {}
      lastFocusedBeforeModalRef.current = null
    }
  }, [showCreate])

  // Manage focus on open/close auth modal
  useEffect(() => {
    if (showAuthModal) {
      lastFocusedBeforeModalRef.current = document.activeElement as HTMLElement
      setTimeout(() => { authModalRef.current?.focus() }, 0)
    } else if (!showAuthModal && lastFocusedBeforeModalRef.current) {
      try { lastFocusedBeforeModalRef.current.focus() } catch {}
      lastFocusedBeforeModalRef.current = null
    }
  }, [showAuthModal])

  // Ensure person creation dialog starts with one empty period row (no country selected)
  useEffect(() => {
    if (showCreate && createType === 'person' && newLifePeriods.length === 0) {
      setNewLifePeriods([{ countryId: '', start: '', end: '' }])
    }
  }, [showCreate, createType, newLifePeriods.length])

  // When a person is selected, fetch full details once per id
  const fetchedDetailsIdsRef = useRef<Set<string>>(new Set())
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
        setSelected(prev => {
          if (prev && prev.id === id) {
            const pickString = (a?: string | null, b?: string | null) => {
              const aa = (a ?? '').toString()
              const bb = (b ?? '').toString()
              return aa.trim().length > 0 ? aa : bb
            }
            const pickNumber = (a?: number | null, b?: number | null) => (typeof a === 'number' && !Number.isNaN(a) ? a : (b as any))
            return {
              ...prev,
              id: prev.id,
              name: pickString((fresh as any).name, (prev as any).name),
              description: pickString((fresh as any).description, (prev as any).description),
              category: pickString((fresh as any).category, (prev as any).category),
              country: pickString((fresh as any).country, (prev as any).country),
              birthYear: pickNumber((fresh as any).birthYear, (prev as any).birthYear),
              deathYear: pickNumber((fresh as any).deathYear, (prev as any).deathYear),
              reignStart: pickNumber((fresh as any).reignStart, (prev as any).reignStart),
              reignEnd: pickNumber((fresh as any).reignEnd, (prev as any).reignEnd),
              imageUrl: pickString((fresh as any).imageUrl, (prev as any).imageUrl),
              wikiLink: pickString((fresh as any).wikiLink, (prev as any).wikiLink),
              achievements: Array.isArray((fresh as any).achievements) && (fresh as any).achievements.length > 0 ? (fresh as any).achievements : (prev as any).achievements,
              achievementsWiki: Array.isArray((fresh as any).achievementsWiki) && (fresh as any).achievementsWiki.length > 0 ? (fresh as any).achievementsWiki : (prev as any).achievementsWiki,
              achievementYear1: pickNumber((fresh as any).achievementYear1, (prev as any).achievementYear1),
              achievementYear2: pickNumber((fresh as any).achievementYear2, (prev as any).achievementYear2),
              achievementYear3: pickNumber((fresh as any).achievementYear3, (prev as any).achievementYear3),
              periods: (fresh as any).periods ?? (prev as any).periods,
              rulerPeriods: (fresh as any).rulerPeriods ?? (prev as any).rulerPeriods,
            } as any
          }
          return fresh
        })
      } catch {
        fetchedDetailsIdsRef.current.add(id) // avoid retry loop on error
      }
    })()
    return () => { aborted = true }
  }, [selected?.id])

  // Prefill edit countries/periods from server-provided periods (life), fallback to rulerPeriods, then single full-life
  useEffect(() => {
    if (!selected) { setEditPersonCountryId(''); setLifePeriods([]); return }
    const initial: Array<{ countryId: string; start: number | ''; end: number | '' }> = []
    const prs: any[] = Array.isArray((selected as any).periods) ? (selected as any).periods : []
    for (const pr of prs) {
      const t = (pr.type || '').toLowerCase()
      if (t === 'life' && pr.countryId) initial.push({ countryId: String(pr.countryId), start: pr.startYear, end: pr.endYear })
    }
    if (initial.length === 0 && Array.isArray((selected as any).rulerPeriods)) {
      for (const rp of (selected as any).rulerPeriods as any[]) {
        if (rp.countryId) initial.push({ countryId: String(rp.countryId), start: rp.startYear, end: rp.endYear })
      }
    }
    if (initial.length === 0) {
      // try match first by current country string, else pick first option
      let firstId = ''
      const parts = (selected.country || '').split('/').map(s => s.trim()).filter(Boolean)
      const match = countryOptions.find(c => parts.includes(c.name))
      if (match) firstId = String(match.id)
      else if (countryOptions.length > 0) firstId = String(countryOptions[0].id)
      if (firstId) initial.push({ countryId: firstId, start: selected.birthYear, end: selected.deathYear })
      setEditPersonCountryId(firstId)
    } else {
      setEditPersonCountryId(initial[0]?.countryId || '')
    }
    setLifePeriods(initial)
  }, [selected, countryOptions])

  useEffect(() => {
    if (!selected) { setEditPersonCategory(''); return }
    const match = categories.find(c => c === selected.category)
    setEditPersonCategory(match ? match : '')
  }, [selected, categories])

  // Keep editable birth/death years in sync with selected person
  useEffect(() => {
    if (!selected) { setEditBirthYear(0); setEditDeathYear(0); return }
    setEditBirthYear(selected.birthYear)
    setEditDeathYear(selected.deathYear)
  }, [selected])

  // Clamp life periods when editable lifespan changes
  useEffect(() => {
    if (lifePeriods.length === 0) return
    setLifePeriods(prev => prev.map(lp => {
      const start = typeof lp.start === 'number' ? Math.max(lp.start, editBirthYear) : lp.start
      const end = typeof lp.end === 'number' ? Math.min(lp.end, editDeathYear) : lp.end
      return { ...lp, start, end }
    }))
    // Inline validate years
    const errs: { birth?: string; death?: string } = {}
    if (!Number.isInteger(editBirthYear)) errs.birth = 'Введите целое число'
    if (!Number.isInteger(editDeathYear)) errs.death = 'Введите целое число'
    if (Number.isInteger(editBirthYear) && Number.isInteger(editDeathYear) && editBirthYear > editDeathYear) {
      errs.birth = 'Год рождения > года смерти'
      errs.death = 'Год смерти < года рождения'
    }
    setYearErrors(errs)
  }, [editBirthYear, editDeathYear, lifePeriods.length])

  // Inline validate create years
  useEffect(() => {
    const errs: { birth?: string; death?: string } = {}
    if (newBirthYear !== '' && !Number.isInteger(newBirthYear as number)) errs.birth = 'Введите целое число'
    if (newDeathYear !== '' && !Number.isInteger(newDeathYear as number)) errs.death = 'Введите целое число'
    if (typeof newBirthYear === 'number' && typeof newDeathYear === 'number' && newBirthYear > newDeathYear) {
      errs.birth = 'Год рождения > года смерти'
      errs.death = 'Год смерти < года рождения'
    }
    setNewYearErrors(errs)
  }, [newBirthYear, newDeathYear])

  // Clamp new life periods when create lifespan changes
  useEffect(() => {
    if (newLifePeriods.length === 0) return
    const by = typeof newBirthYear === 'number' ? newBirthYear : undefined
    const dy = typeof newDeathYear === 'number' ? newDeathYear : undefined
    if (by == null && dy == null) return
    setNewLifePeriods(prev => prev.map(lp => {
      const start = typeof lp.start === 'number' && by != null ? Math.max(lp.start, by) : lp.start
      const end = typeof lp.end === 'number' && dy != null ? Math.min(lp.end, dy) : lp.end
      return { ...lp, start, end }
    }))
  }, [newBirthYear, newDeathYear, newLifePeriods.length])

  const personsQuery = useMemo(() => ({
    q: searchPersons,
    category: filters.categories.length ? filters.categories.join(',') : undefined,
    country: filters.countries.length ? filters.countries.join(',') : undefined
  }), [searchPersons, filters.categories, filters.countries])
  const { items: personsAll, isLoading: isPersonsLoadingAll, hasMore: personsHasMoreAll, loadMore: loadMorePersonsAll } = usePersonsPaged(personsQuery, activeTab === 'persons' && personsMode === 'all')
  const [personsAlt, setPersonsAlt] = useState<Person[]>([])
  const [personsAltLoading, setPersonsAltLoading] = useState(false)
  const [personsAltHasMore, setPersonsAltHasMore] = useState(false)
  const [personsAltOffset, setPersonsAltOffset] = useState(0)
  const [personsPendingCount, setPersonsPendingCount] = useState<number | null>(null)
  const [personsMineCount, setPersonsMineCount] = useState<number | null>(null)
  // List content
  type MixedItem = { key: string; listItemId: number; type: 'person' | 'achievement' | 'period'; person?: Person | null; achievement?: any | null; periodId?: number | null; title: string; subtitle?: string }
  const [listItems, setListItems] = useState<MixedItem[]>([])
  const [listLoading, setListLoading] = useState(false)
  const [personLists, setPersonLists] = useState<Array<{ id: number; title: string; items_count?: number; readonly?: boolean }>>([])
  const [sharedList, setSharedList] = useState<{ id: number; title: string; owner_user_id?: string } | null>(null)
  // const [loadingListsFor, setLoadingListsFor] = useState<string | null>(null)
  const [showCreateList, setShowCreateList] = useState(false)
  const [showAddToList, setShowAddToList] = useState(false)
  const [pendingAddAchievementId, setPendingAddAchievementId] = useState<number | null>(null)
  const [pendingAddPeriodId, setPendingAddPeriodId] = useState<number | null>(null)
  const [includeLinked, setIncludeLinked] = useState(false)

  // Helpers to fetch alternative lists (pending/mine)
  useEffect(() => {
    if (activeTab !== 'persons') return
    if (personsMode === 'all' || personsMode === 'list') return
    setPersonsAlt([])
    setPersonsAltHasMore(true)
    setPersonsAltOffset(0)
  }, [activeTab, personsMode])
  useEffect(() => {
    let aborted = false
    async function loadChunk() {
      if (personsMode === 'all' || personsMode === 'list' || !personsAltHasMore || personsAltLoading) return
      setPersonsAltLoading(true)
      try {
        const params = new URLSearchParams({ limit: '50', offset: String(personsAltOffset) })
        const path = personsMode === 'pending' ? '/api/admin/persons/moderation' : '/api/persons/mine'
        const res = await apiFetch(`${path}?${params.toString()}`)
        const data = await res.json().catch(() => ({ data: [] }))
        const arr: Person[] = Array.isArray(data.data) ? data.data : []
        if (!aborted) {
          setPersonsAlt(prev => [...prev, ...arr])
          if (arr.length < 50) setPersonsAltHasMore(false)
        }
      } catch {
        if (!aborted) setPersonsAltHasMore(false)
      } finally {
        if (!aborted) setPersonsAltLoading(false)
      }
    }
    loadChunk()
    return () => { aborted = true }
  }, [activeTab, personsMode, personsAltOffset, personsAltHasMore, personsAltLoading])

  // Load selected list content (for both tabs + periods). Only loads when current tab is in 'list' mode
  useEffect(() => {
    let aborted = false
    ;(async () => {
      const listModeActive = (activeTab === 'persons' ? personsMode === 'list' : activeTab === 'achievements' ? achMode === 'list' : periodsMode === 'list')
      if (!listModeActive || !selectedListId) { setListItems([]); return }
      setListLoading(true)
      try {
        const res = await apiFetch(`/api/lists/${selectedListId}/items`)
        const data = await res.json().catch(() => ({ data: [] }))
        const items: Array<{ id: number; item_type: string; person_id?: string; achievement_id?: number; period_id?: number }> = Array.isArray(data.data) ? data.data : []
        const personIds = items.filter(i => i.item_type === 'person' && i.person_id).map(i => i.person_id!)
        const achIds = items.filter(i => i.item_type === 'achievement' && typeof i.achievement_id === 'number').map(i => i.achievement_id!)
        const periodIds = items.filter(i => i.item_type === 'period' && typeof i.period_id === 'number').map(i => i.period_id!)
        // Fetch details in parallel
        const [personsRes, achRes, periodsRes] = await Promise.all([
          personIds.length ? apiFetch(`/api/persons/lookup/by-ids?ids=${personIds.join(',')}`) : Promise.resolve({ ok: true, json: async () => ({ data: [] }) } as any),
          achIds.length ? apiFetch(`/api/achievements/lookup/by-ids?ids=${achIds.join(',')}`) : Promise.resolve({ ok: true, json: async () => ({ data: [] }) } as any),
          periodIds.length ? apiFetch(`/api/periods/lookup/by-ids?ids=${periodIds.join(',')}`) : Promise.resolve({ ok: true, json: async () => ({ data: [] }) } as any)
        ])
        let personsData = await (personsRes as any).json().catch(() => ({ data: [] }))
        // Fallback: some backends may not support by-ids; fetch one by one
        if ((personsRes as any)?.status === 404 && personIds.length === 1) {
          const single = await apiFetch(`/api/persons/${encodeURIComponent(personIds[0])}`)
          const singleData = await single.json().catch(() => ({ data: null }))
          personsData = { data: singleData?.data ? [singleData.data] : [] }
        }
        const achData = await (achRes as any).json().catch(() => ({ data: [] }))
        const periodsData = await (periodsRes as any).json().catch(() => ({ data: [] }))
        const periodsMap = new Map<number, any>()
        ;(Array.isArray(periodsData.data) ? periodsData.data : []).forEach((p: any) => periodsMap.set(p.id, p))
        const personsMap = new Map<string, Person>()
        ;(Array.isArray(personsData.data) ? personsData.data : []).forEach((p: Person) => personsMap.set(p.id, p))
        const achMap = new Map<number, any>()
        ;(Array.isArray(achData.data) ? achData.data : []).forEach((a: any) => achMap.set(a.id, a))
        const normalized: MixedItem[] = items.map((it) => {
          if (it.item_type === 'person' && it.person_id) {
            const p = personsMap.get(it.person_id) || null
            return { key: `p:${it.person_id}:${it.id}`, listItemId: it.id, type: 'person', person: p, achievement: null, periodId: null, title: p?.name || it.person_id, subtitle: p?.country }
          }
          if (it.item_type === 'achievement' && typeof it.achievement_id === 'number') {
            const a = achMap.get(it.achievement_id) || null
            return { key: `a:${it.achievement_id}:${it.id}`, listItemId: it.id, type: 'achievement', person: null, achievement: a, periodId: null, title: a?.title || 'Достижение', subtitle: a ? String(a.year) : undefined }
          }
          if (it.item_type === 'period' && typeof it.period_id === 'number') {
            const pr = periodsMap.get(it.period_id) || null
            const headerParts: string[] = []
            if (pr?.person_name) headerParts.push(pr.person_name)
            if (pr?.country_name) headerParts.push(pr.country_name)
            const header = headerParts.join(' • ')
            return { key: `pr:${it.period_id}:${it.id}`, listItemId: it.id, type: 'period', person: null, achievement: null, periodId: it.period_id || null, title: header || `Период #${it.period_id}`, subtitle: pr ? `${pr.period_type === 'ruler' ? 'Правление' : pr.period_type === 'life' ? 'Жизнь' : pr.period_type} — ${pr.start_year}—${pr.end_year ?? '—'}` : undefined }
          }
          // fallback
          return { key: `x:${it.id}`, listItemId: it.id, type: 'person', person: null, achievement: null, periodId: null, title: '—', subtitle: undefined }
        })
        if (!aborted) setListItems(normalized)
      } catch {
        if (!aborted) setListItems([])
      } finally {
        if (!aborted) setListLoading(false)
      }
    })()
    return () => { aborted = true }
  }, [activeTab, personsMode, achMode, periodsMode, selectedListId])

  // Preserve person card when switching to an empty list
  useEffect(() => {
    if (personsMode === 'list' && listItems.length === 0 && !listLoading && !selected && lastSelectedRef.current) {
      setSelected(lastSelectedRef.current)
    }
  }, [personsMode, listItems.length, listLoading, selected])

  useEffect(() => {
    if (activeTab !== 'achievements') return
    if (achMode === 'all') return
    setAchItemsAlt([])
    setAchAltHasMore(true)
    setAchAltOffset(0)
  }, [activeTab, achMode])
  useEffect(() => {
    let aborted = false
    async function loadChunk() {
      if (achMode === 'all' || !achAltHasMore || achAltLoading) return
      setAchAltLoading(true)
      try {
        const params = new URLSearchParams({ limit: '100', offset: String(achAltOffset) })
        const path = achMode === 'pending' ? '/api/admin/achievements/pending' : '/api/achievements/mine'
        const res = await apiFetch(`${path}?${params.toString()}`)
        const data = await res.json().catch(() => ({ data: [] }))
        const arr: any[] = Array.isArray(data.data) ? data.data : []
        if (!aborted) {
          setAchItemsAlt(prev => [...prev, ...arr])
          if (arr.length < 100) setAchAltHasMore(false)
        }
      } catch {
        if (!aborted) setAchAltHasMore(false)
      } finally {
        if (!aborted) setAchAltLoading(false)
      }
    }
    loadChunk()
    return () => { aborted = true }
  }, [activeTab, achMode, achAltOffset, achAltHasMore, achAltLoading])

  // Load user's lists for left menu (debounced and de-duplicated)
  const loadUserLists = useRef<(force?: boolean) => Promise<void>>(async () => {})
  const listsInFlightRef = useRef(false)
  const lastListsFetchTsRef = useRef(0)
  loadUserLists.current = async (force?: boolean) => {
    if (!isAuthenticated) { setPersonLists([]); return }
    const now = Date.now()
    if (!force) {
      if (listsInFlightRef.current) return
      if (now - lastListsFetchTsRef.current < 1500) return
    }
    listsInFlightRef.current = true
    try {
      const res = await apiFetch(`/api/lists`)
      const data = await res.json().catch(() => ({ data: [] }))
      setPersonLists(Array.isArray(data.data) ? data.data : [])
      lastListsFetchTsRef.current = Date.now()
    } catch {
      setPersonLists([])
    } finally {
      listsInFlightRef.current = false
    }
  }
  useEffect(() => {
    loadUserLists.current?.()
  }, [isAuthenticated, user?.id])

  // Detect shared list in URL and insert a readonly list item (non-editable) between sections
  useEffect(() => {
    const usp = new URLSearchParams(window.location.search)
    const code = usp.get('share')
    if (!code) { setSharedList(null); return }
    ;(async () => {
      try {
        const res = await apiFetch(`/api/list-shares/${encodeURIComponent(code)}`)
        const data = await res.json().catch(() => null)
        const listId = Number(data?.data?.list_id)
        const title = String(data?.data?.title || '').trim() || 'Поделившийся список'
        const ownerId = data?.data?.owner_user_id != null ? String(data.data.owner_user_id) : null
        if (Number.isFinite(listId) && listId > 0) {
          // If current user is owner, open their own list instead of inserting a readonly item
          if (isAuthenticated && user?.id && String(user.id) === ownerId) {
            setSharedList(null)
            setSelectedListId(listId)
            setMenuSelection(`list:${listId}` as any)
            const next = new URLSearchParams(window.location.search)
            next.delete('share')
            window.history.replaceState(null, '', `/lists${next.toString() ? `?${next.toString()}` : ''}`)
          } else {
            setSharedList({ id: listId, title, owner_user_id: ownerId || undefined })
          }
        } else setSharedList(null)
      } catch { setSharedList(null) }
    })()
  }, [isAuthenticated, user?.id])

  // Fetch counts for sidebar badges
  useEffect(() => {
    let aborted = false
    ;(async () => {
      try {
        if (isModerator) {
          const [pRes, aRes] = await Promise.all([
            apiFetch('/api/admin/persons/moderation?count=true'),
            apiFetch('/api/admin/achievements/pending?count=true')
          ])
          const pData = await pRes.json().catch(() => ({ data: { count: 0 } }))
          const aData = await aRes.json().catch(() => ({ data: { count: 0 } }))
          if (!aborted) {
            setPersonsPendingCount(Number(pData?.data?.count || 0))
            setAchPendingCount(Number(aData?.data?.count || 0))
          }
        } else {
          setPersonsPendingCount(null)
          setAchPendingCount(null)
        }
      } catch {
        if (!aborted) { setPersonsPendingCount(0); setAchPendingCount(0) }
      }
      try {
        const mine = await apiFetch('/api/mine/counts')
        const data = await mine.json().catch(() => ({ data: { persons: 0, achievements: 0, periods: 0 } }))
        if (!aborted) {
          setPersonsMineCount(Number(data?.data?.persons || 0))
          setAchMineCount(Number(data?.data?.achievements || 0))
        }
      } catch {
        if (!aborted) { setPersonsMineCount(0); setAchMineCount(0) }
      }
    })()
    return () => { aborted = true }
  }, [isModerator, user?.id])

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Apply global menuSelection on tab switch
  useEffect(() => {
    const applySelection = (target: Tab) => {
      if (menuSelection.startsWith && (menuSelection as string).startsWith('list:')) {
        const id = Number((menuSelection as string).split(':')[1])
        setSelectedListId(Number.isFinite(id) ? id : null)
        if (target === 'persons') setPersonsMode('list')
        else if (target === 'achievements') setAchMode('list')
        else setPeriodsMode('list')
      } else if (menuSelection === 'all') {
        setSelectedListId(null)
        if (target === 'persons') setPersonsMode('all')
        else if (target === 'achievements') setAchMode('all')
        else setPeriodsMode('all')
      } else if (menuSelection === 'pending' || menuSelection === 'mine') {
        setSelectedListId(null)
        if (target === 'persons') setPersonsMode(menuSelection)
        else if (target === 'achievements') setAchMode(menuSelection)
        else setPeriodsMode('all') // periods do not support pending/mine
      }
    }
    applySelection(activeTab)
  }, [activeTab, menuSelection])

  return (
    <div className="app" id="chrononinja-manage" role="main" aria-label="Управление контентом">
      <React.Suspense fallback={<div />}> 
        <AppHeader
          isScrolled={isScrolled}
          showControls={showControls}
          setShowControls={setShowControls}
          mode="minimal"
          filters={filters}
          setFilters={setFilters as any}
          groupingType={groupingType}
          setGroupingType={setGroupingType}
          allCategories={categories}
          allCountries={countries}
          yearInputs={yearInputs}
          setYearInputs={setYearInputs as any}
          applyYearFilter={applyYearFilter}
          handleYearKeyPress={handleYearKeyPress}
          resetAllFilters={resetAllFilters}
          getCategoryColor={getGroupColor}
          sortedData={[]}
          handleSliderMouseDown={() => {}}
          handleSliderMouseMove={() => {}}
          handleSliderMouseUp={() => {}}
          isDraggingSlider={false}
          onBackToMenu={() => navigate('/menu')}
        />
      </React.Suspense>
      <div style={{ padding: 16, paddingTop: 8 }}>
        <div style={{ display: 'flex', gap: 12, margin: '8px 0 16px', alignItems: 'center', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }} role="tablist" aria-label="Вкладки управления">
          <button role="tab" aria-selected={activeTab === 'persons'} onClick={() => setActiveTab('persons')} style={{ padding: '6px 12px' }}>Личности</button>
          <button role="tab" aria-selected={activeTab === 'achievements'} onClick={() => setActiveTab('achievements')} style={{ padding: '6px 12px' }}>Достижения</button>
          <button role="tab" aria-selected={activeTab === 'periods'} onClick={() => setActiveTab('periods')} style={{ padding: '6px 12px' }}>Периоды</button>
          <div style={{ marginLeft: 'auto', flex: '0 0 auto' }}>
            <button onClick={() => { if (!isAuthenticated || !user?.email_verified) { setShowAuthModal(true); return } setCreateType(activeTab === 'persons' ? 'person' : 'achievement'); setShowCreate(true) }} aria-label={activeTab === 'persons' ? 'Добавить личность' : 'Добавить достижение'}>
              Добавить
            </button>
          </div>
          {/* toggle moved to border handle */}
        </div>

        {activeTab === 'persons' && (
          <div style={{ display: 'grid', gridTemplateColumns: sidebarCollapsed ? '0px 8px 1fr 2fr' : '240px 8px 1fr 2fr', gap: 16, transition: 'grid-template-columns 0.2s ease' }}>
            <LeftMenu
              id="lists-sidebar"
              selectedKey={menuSelection}
              onSelect={(sel: LeftMenuSelection) => {
                if (sel.type === 'list') { setMenuSelection(`list:${sel.listId!}` as any) }
                else { setMenuSelection(sel.type as any) }
              }}
              isModerator={isModerator}
              pendingCount={personsPendingCount}
              mineCount={personsMineCount}
              userLists={[
                // Показать чужой список всем (в read-only виде)
                ...(sharedList ? [{ id: sharedList.id, title: `🔒 ${sharedList.title}`, items_count: undefined } as any] : []),
                // Пользовательские списки только для авторизованных
                ...(isAuthenticated ? personLists : [])
              ]}
              onAddList={() => { if (!isAuthenticated) { setShowAuthModal(true); return } setShowCreateList(true) }}
              labelAll="Все"
              readonlyListId={sharedList?.id}
              onCopySharedList={async (id) => {
                if (!isAuthenticated) { showToast('Нужно войти', 'error'); setShowAuthModal(true); return }
                try {
                  const code = (new URLSearchParams(window.location.search)).get('share') || ''
                  if (!code) { showToast('Нет кода ссылки', 'error'); return }
                  const title = sharedList?.title || 'Импортированный список'
                  const res = await apiFetch(`/api/lists/copy-from-share`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code, title }) })
                  if (!res.ok) { showToast('Не удалось скопировать', 'error'); return }
                  const data = await res.json().catch(() => null)
                  const newId = Number(data?.data?.id)
                  const newTitle = String(data?.data?.title || title)
                  await loadUserLists.current?.(true)
                  if (Number.isFinite(newId) && newId > 0) {
                    setSelectedListId(newId)
                    setMenuSelection(`list:${newId}` as any)
                  }
                  showToast(`Список «${newTitle}» скопирован`, 'success')
                } catch { showToast('Не удалось скопировать', 'error') }
              }}
              onDeleteList={async (id) => {
                try {
                  const res = await apiFetch(`/api/lists/${id}`, { method: 'DELETE' })
                  if (res.ok) {
                    if (selectedListId === id) { setSelectedListId(null); setMenuSelection('all' as any) }
                    await loadUserLists.current?.(true)
                    showToast('Список удалён', 'success')
                  } else showToast('Не удалось удалить список', 'error')
                } catch { showToast('Ошибка удаления списка', 'error') }
              }}
              onShareList={async (id) => {
                const code = await createListShareCode(id)
                if (!code) { showToast('Не удалось создать ссылку', 'error'); return }
                const url = `${window.location.origin}/lists?share=${encodeURIComponent(code)}`
                if (navigator.clipboard) navigator.clipboard.writeText(url).then(() => showToast('Ссылка скопирована', 'success')).catch(() => alert(url))
                else alert(url)
              }}
              onShowOnTimeline={async (id) => {
                const usp = new URLSearchParams(window.location.search)
                const shareCode = usp.get('share')
                if (sharedList?.id === id && shareCode) {
                  window.location.href = `/timeline?share=${encodeURIComponent(shareCode)}`
                  return
                }
                try {
                  const code = await createListShareCode(id)
                  if (!code) throw new Error('no_code')
                  window.location.href = `/timeline?share=${encodeURIComponent(code)}`
                } catch {
                  showToast('Не удалось открыть на таймлайне', 'error')
                }
              }}
            />
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setSidebarCollapsed(c => !c)}
                aria-pressed={sidebarCollapsed}
                aria-label={sidebarCollapsed ? 'Показать меню' : 'Скрыть меню'}
                title={sidebarCollapsed ? 'Показать меню' : 'Скрыть меню'}
                style={{ position: 'absolute', left: -8, top: 0, width: 16, height: 32 }}
              >{sidebarCollapsed ? '⟩' : '⟨'}</button>
            </div>
            <div>
              {personsMode !== 'list' ? (
            <PersonsList
              search={searchPersons}
              setSearch={setSearchPersons}
              categories={categories}
              countries={countries}
              filters={filters as any}
              setFilters={setFilters as any}
                  persons={personsMode==='all' ? personsAll : personsAlt}
                  isLoading={personsMode==='all' ? isPersonsLoadingAll : personsAltLoading}
                  hasMore={personsMode==='all' ? personsHasMoreAll : personsAltHasMore}
                  loadMore={() => {
                    if (personsMode==='all') loadMorePersonsAll(); else setPersonsAltOffset(o => o + 50)
                  }}
              onSelect={(p) => setSelected(p)}
            />
              ) : (
                <>
                  <div style={{ marginBottom: 8, fontSize: 12, opacity: 0.9 }}>
                    {(() => {
                      const pc = listItems.filter(i => i.type === 'person').length
                      const ac = listItems.filter(i => i.type === 'achievement').length
                      const prc = listItems.filter(i => i.type === 'period').length
                      return `Личностей: ${pc} • Достижений: ${ac} • Периодов: ${prc}`
                    })()}
                  </div>
                  <div role="region" aria-label="Содержимое списка" style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: 6 }}>
                    {listLoading && listItems.filter(i => i.type === 'person').length === 0 && <div>Загрузка…</div>}
                    {listItems.filter(i => i.type === 'person').map((it) => (
                      <div key={it.key} style={{ padding: '6px 8px', borderBottom: '1px solid rgba(139,69,19,0.2)', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, cursor: it.type==='person' ? 'pointer' : 'default' }} onClick={() => { if (it.type==='person' && it.person) setSelected(it.person) }}>
                <div style={{ fontWeight: 600 }}>{it.title}</div>
                          {it.subtitle && <div style={{ fontSize: 12, opacity: 0.85 }}>{it.subtitle}</div>}
                        </div>
                        <button aria-label="Удалить из списка" title="Удалить" onClick={async () => {
                          if (!selectedListId) return
                          const id = it.listItemId
                          try {
                            const res = await apiFetch(`/api/lists/${selectedListId}/items/${id}`, { method: 'DELETE' })
                            if (res.ok) {
                              setListItems(prev => prev.filter(x => x.listItemId !== id))
                              await loadUserLists.current?.()
                              showToast('Удалено из списка', 'success')
                            } else {
                              showToast('Не удалось удалить', 'error')
                            }
                          } catch { showToast('Ошибка удаления', 'error') }
                        }}>✕</button>
                      </div>
                    ))}
                    {!listLoading && listItems.filter(i => i.type === 'person').length === 0 && <div style={{ opacity: 0.8 }}>Список пуст</div>}
                  </div>
                </>
              )}
            </div>
            <div role="region" aria-label="Карточка личности" style={{ position: 'relative', zIndex: 2 }}>
              {selected ? (
                <div>
                  {!isEditing ? (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <div style={{ fontWeight: 'bold', fontSize: 16 }}>Карточка</div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => { if (!isAuthenticated || !user?.email_verified) { setShowAuthModal(true); return } setIsEditing(true) }}>Редактировать</button>
                        <button onClick={() => { if (!isAuthenticated || !user?.email_verified) { setShowAuthModal(true); return } setShowAddToList(true) }}>Добавить в список</button>
                      </div>
                    </div>
                      ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <div style={{ fontWeight: 'bold', fontSize: 16 }}>Редактирование</div>
                      <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={() => { setIsEditing(false); }}>Отмена</button>
                      </div>
                    </div>
                  )}

                  {!isEditing ? (
                    <PersonCard
                      key={selected.id}
                      person={selected}
                      getGroupColor={getGroupColor}
                      getPersonGroup={(person) => getPersonGroup(person, 'category')}
                      getCategoryColor={getGroupColor}
                      onAddAchievement={(p) => {
                        if (!isAuthenticated || !user?.email_verified) { setShowAuthModal(true); return }
                        setAchIsGlobal(false)
                        setAchSelectedCountryId('')
                        setAchSelectedPersonId(p.id)
                        setPersonOptions(prev => {
                          const option = { value: p.id, label: `${p.name} — ${p.country}` }
                          const exists = prev.some(o => o.value === option.value)
                          return exists ? prev : [option, ...prev]
                        })
                        setCreateType('achievement')
                        setShowCreate(true)
                      }}
                    />
                  ) : (
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault()
                        if (!selected) return
                        const form = e.currentTarget as HTMLFormElement
                        const fd = new FormData(form)
                        const payload = {
                          id: selected.id,
                          name: String(fd.get('name') || '').trim(),
                          birthYear: Number(editBirthYear),
                          deathYear: Number(editDeathYear),
                          category: editPersonCategory || String(fd.get('category') || selected.category),
                          country: (() => {
                            const chosen = countryOptions.find(c => String(c.id) === editPersonCountryId)?.name
                            return chosen || selected.country
                          })(),
                          description: String(fd.get('description') || selected.description),
                          imageUrl: String(fd.get('imageUrl') || selected.imageUrl || '') || null,
                          wikiLink: String(fd.get('wikiLink') || selected.wikiLink || '') || null,
                        }
                        // Basic client validation of years (inline)
                        const errs: { birth?: string; death?: string } = {}
                        if (!Number.isInteger(editBirthYear)) errs.birth = 'Введите целое число'
                        if (!Number.isInteger(editDeathYear)) errs.death = 'Введите целое число'
                        if (Number.isInteger(editBirthYear) && Number.isInteger(editDeathYear) && editBirthYear > editDeathYear) {
                          errs.birth = 'Год рождения > года смерти'
                          errs.death = 'Год смерти < года рождения'
                        }
                        setYearErrors(errs)
                        if (errs.birth || errs.death) return
                        // Client validation of life periods
                        if (lifePeriods.length > 0) {
                          const v = validateLifePeriodsClient(lifePeriods, payload.birthYear, payload.deathYear)
                          if (!v.ok) { setPeriodsError(v.message || 'Проверьте периоды'); return }
                          setPeriodsError(null)
                        }
                        setSaving(true)
                        try {
                          if (isModerator) {
                            await adminUpsertPerson(payload)
                            // Сохраняем периоды проживания, если заданы
                            if (lifePeriods.length > 0) {
                              const normalized = lifePeriods.map(lp => ({ country_id: Number(lp.countryId), start_year: Number(lp.start), end_year: Number(lp.end) }))
                              await apiFetch(`/api/persons/${encodeURIComponent(selected.id)}/life-periods`, {
                                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ periods: normalized })
                              })
                            }
                            const fresh = await getPersonById(selected.id)
                            if (fresh) setSelected(fresh)
                            showToast('Личность сохранена', 'success')
                          } else {
                            await proposePersonEdit(selected.id, payload)
                            // Если периоды изменились, отправляем их на согласование как pending
                            if (lifePeriods.length > 0) {
                              // Сравнение с текущими периодами персоны (type='life')
                              const orig = (Array.isArray((selected as any).periods) ? (selected as any).periods : [])
                                .filter((pr: any) => (pr.type || '').toLowerCase() === 'life' && pr.countryId)
                                .map((pr: any) => ({ country_id: Number(pr.countryId), start_year: Number(pr.startYear), end_year: Number(pr.endYear) }))
                                .sort((a: any, b: any) => a.start_year - b.start_year || a.end_year - b.end_year || a.country_id - b.country_id)
                              const next = lifePeriods
                                .map(lp => ({ country_id: Number(lp.countryId), start_year: Number(lp.start), end_year: Number(lp.end) }))
                                .sort((a, b) => a.start_year - b.start_year || a.end_year - b.end_year || a.country_id - b.country_id)
                              const changed = JSON.stringify(orig) !== JSON.stringify(next)
                              if (changed) {
                                await apiFetch(`/api/persons/${encodeURIComponent(selected.id)}/life-periods`, {
                                  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ periods: next })
                                })
                              }
                            }
                            showToast('Личность отправлена на модерацию', 'success')
                          }
                          setIsEditing(false)
                        } catch (e: any) {
                          showToast(e?.message || 'Ошибка сохранения', 'error')
                        } finally {
                          setSaving(false)
                        }
                      }}
                      style={{ display: 'grid', gap: 8 }}
                    >
                      <PersonEditor
                        person={selected}
                        editBirthYear={editBirthYear}
                        setEditBirthYear={setEditBirthYear}
                        editDeathYear={editDeathYear}
                        setEditDeathYear={setEditDeathYear}
                        editPersonCategory={editPersonCategory}
                        setEditPersonCategory={setEditPersonCategory}
                        categorySelectOptions={categorySelectOptions}
                        lifePeriods={lifePeriods as any}
                        setLifePeriods={setLifePeriods as any}
                        countrySelectOptions={countrySelectOptions}
                      />
                      {(yearErrors.birth || yearErrors.death) && (
                        <div style={{ color: '#ffaaaa', fontSize: 12 }}>
                          {yearErrors.birth && <div>Год рождения: {yearErrors.birth}</div>}
                          {yearErrors.death && <div>Год смерти: {yearErrors.death}</div>}
                        </div>
                      )}
                      {periodsError && (
                        <div style={{ color: '#ffaaaa', fontSize: 12 }}>{periodsError}</div>
                      )}
                      {/* Inline success/error banner removed; using toasts instead */}
                      <button
                        type="submit"
                        disabled={
                          saving || Boolean(yearErrors.birth || yearErrors.death || periodsError)
                        }
                      >
                        {saving ? 'Сохраняем…' : isModerator ? 'Сохранить (модератор)' : 'Отправить на модерацию'}
                      </button>
                    </form>
                  )}
                </div>
              ) : (
                <div style={{ opacity: 0.8 }}>Выберите личность слева</div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'periods' && (
          <div style={{ display: 'grid', gridTemplateColumns: sidebarCollapsed ? '0px 8px 1fr' : '240px 8px 1fr', gap: 16, transition: 'grid-template-columns 0.2s ease' }}>
            <LeftMenu
              id="lists-sidebar"
              selectedKey={menuSelection === 'pending' || menuSelection === 'mine' ? 'all' : menuSelection}
              onSelect={(sel: LeftMenuSelection) => {
                if (sel.type === 'list') { setMenuSelection(`list:${sel.listId!}` as any) }
                else { setMenuSelection(sel.type as any) }
              }}
              isModerator={isModerator}
              pendingCount={null}
              mineCount={null}
              userLists={[
                ...(sharedList ? [{ id: sharedList.id, title: `🔒 ${sharedList.title}`, items_count: undefined } as any] : []),
                ...(isAuthenticated ? personLists : [])
              ]}
              onAddList={() => { if (!isAuthenticated) { setShowAuthModal(true); return } setShowCreateList(true) }}
              labelAll="Все"
              readonlyListId={sharedList?.id}
              onCopySharedList={async (id) => {
                if (!isAuthenticated) { showToast('Нужно войти', 'error'); setShowAuthModal(true); return }
                try {
                  const code = (new URLSearchParams(window.location.search)).get('share') || ''
                  if (!code) { showToast('Нет кода ссылки', 'error'); return }
                  const title = sharedList?.title || 'Импортированный список'
                  const res = await apiFetch(`/api/lists/copy-from-share`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code, title }) })
                  if (!res.ok) { showToast('Не удалось скопировать', 'error'); return }
                  const data = await res.json().catch(() => null)
                  const newId = Number(data?.data?.id)
                  const newTitle = String(data?.data?.title || title)
                  await loadUserLists.current?.(true)
                  if (Number.isFinite(newId) && newId > 0) {
                    setSelectedListId(newId)
                    setMenuSelection(`list:${newId}` as any)
                  }
                  showToast(`Список «${newTitle}» скопирован`, 'success')
                } catch { showToast('Не удалось скопировать', 'error') }
              }}
            />
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setSidebarCollapsed(c => !c)}
                aria-pressed={sidebarCollapsed}
                aria-label={sidebarCollapsed ? 'Показать меню' : 'Скрыть меню'}
                title={sidebarCollapsed ? 'Показать меню' : 'Скрыть меню'}
                style={{ position: 'absolute', left: -8, top: 0, width: 16, height: 32 }}
              >{sidebarCollapsed ? '⟩' : '⟨'}</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <div role="region" aria-label="Фильтр периодов" style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
                  <input value={searchPeriods} onChange={(e) => setSearchPeriods(e.target.value)} placeholder="Поиск по имени/стране" style={{ flex: '1 1 260px', minWidth: 260, padding: 6 }} />
                  <select value={periodType} onChange={(e) => setPeriodType((e.target.value as any))} style={{ padding: 6 }}>
                    <option value="">Все типы</option>
                    <option value="ruler">Правление</option>
                    <option value="life">Жизнь</option>
                  </select>
                </div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>
                  Найдено: {periodItemsAll.length}{!periodsLoadingAll && periodsHasMoreAll ? '+' : ''}
                </div>
              </div>
              {periodsMode !== 'list' ? (
              <div
                role="region"
                aria-label="Периоды"
                style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: 6 }}
                onScroll={(e) => {
                  const el = e.currentTarget
                  if (el.scrollTop + el.clientHeight >= el.scrollHeight - 40) {
                    if (!periodsLoadingAll && periodsHasMoreAll) loadMorePeriodsAll()
                  }
                }}
              >
                {periodsLoadingAll && periodItemsAll.length === 0 && <div>Загрузка...</div>}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
                  {periodItemsAll.map((p: any) => {
                    const headerParts: string[] = []
                    if (p.person_name) headerParts.push(p.person_name)
                    if (p.country_name) headerParts.push(p.country_name)
                    const header = headerParts.join(' • ')
                    return (
                      <div key={p.id} style={{ border: '1px solid rgba(139,69,19,0.4)', borderRadius: 8, padding: 12, background: 'rgba(44,24,16,0.85)' }}>
                        <div style={{ fontWeight: 'bold', marginBottom: 6 }}>{header || '—'}</div>
                        <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 6 }}>
                          Тип: {p.period_type === 'ruler' ? 'Правление' : p.period_type === 'life' ? 'Жизнь' : p.period_type}
                        </div>
                        <div style={{ fontSize: 14 }}>Годы: {p.start_year} — {p.end_year ?? '—'}</div>
                        <div style={{ position: 'absolute', top: 8, right: 8 }}>
                          <button
                            onClick={() => {
                              if (!isAuthenticated || !user?.email_verified) { setShowAuthModal(true); return }
                              setPendingAddPeriodId(Number(p.id))
                              setShowAddToList(true)
                            }}
                            title="Добавить в список"
                          >＋</button>
                        </div>
                      </div>
                    )
                  })}
                </div>
                {!periodsLoadingAll && periodsHasMoreAll && (
                  <div style={{ marginTop: 12 }}>
                    <button onClick={() => loadMorePeriodsAll()} style={{ padding: '6px 12px' }}>Показать ещё</button>
                  </div>
                )}
              </div>
              ) : (
                <div role="region" aria-label="Содержимое списка (периоды)" style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: 6 }}>
                  <div style={{ marginBottom: 8, fontSize: 12, opacity: 0.9 }}>
                    {(() => {
                      const pc = listItems.filter(i => i.type === 'person').length
                      const ac = listItems.filter(i => i.type === 'achievement').length
                      const prc = listItems.filter(i => i.type === 'period').length
                      return `Личностей: ${pc} • Достижений: ${ac} • Периодов: ${prc}`
                    })()}
                  </div>
                  {listLoading && listItems.filter(it => it.type === 'period').length === 0 && <div>Загрузка…</div>}
                  {listItems.filter(it => it.type === 'period').map((it) => (
                    <div key={it.key} style={{ padding: '6px 8px', borderBottom: '1px solid rgba(139,69,19,0.2)', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600 }}>{it.title}</div>
                        {it.subtitle && <div style={{ fontSize: 12, opacity: 0.85 }}>{it.subtitle}</div>}
                      </div>
                      <button aria-label="Удалить из списка" title="Удалить" onClick={async () => {
                        if (!selectedListId) return
                        const id = it.listItemId
                        try {
                          const res = await apiFetch(`/api/lists/${selectedListId}/items/${id}`, { method: 'DELETE' })
                          if (res.ok) {
                            setListItems(prev => prev.filter(x => x.listItemId !== id))
                            await loadUserLists.current?.()
                            showToast('Удалено из списка', 'success')
                          } else {
                            showToast('Не удалось удалить', 'error')
                          }
                        } catch { showToast('Ошибка удаления', 'error') }
                      }}>✕</button>
                    </div>
                  ))}
                  {!listLoading && listItems.filter(it => it.type === 'period').length === 0 && <div style={{ opacity: 0.8 }}>Список пуст</div>}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div style={{ display: 'grid', gridTemplateColumns: sidebarCollapsed ? '0px 8px 1fr' : '240px 8px 1fr', gap: 16, transition: 'grid-template-columns 0.2s ease' }}>
            <LeftMenu
              id="lists-sidebar"
              selectedKey={menuSelection}
              onSelect={(sel: LeftMenuSelection) => {
                if (sel.type === 'list') { setMenuSelection(`list:${sel.listId!}` as any) }
                else { setMenuSelection(sel.type as any) }
              }}
              isModerator={isModerator}
              pendingCount={achPendingCount}
              mineCount={achMineCount}
              userLists={isAuthenticated ? personLists : []}
              onAddList={() => { if (!isAuthenticated) { setShowAuthModal(true); return } setShowCreateList(true) }}
              labelAll="Все"
              onDeleteList={async (id) => {
                try {
                  const res = await apiFetch(`/api/lists/${id}`, { method: 'DELETE' })
                  if (res.ok) {
                    if (selectedListId === id) { setSelectedListId(null); setMenuSelection('all' as any) }
                    await loadUserLists.current?.(true)
                    showToast('Список удалён', 'success')
                  } else showToast('Не удалось удалить список', 'error')
                } catch { showToast('Ошибка удаления списка', 'error') }
              }}
              onShareList={async (id) => {
                const code = await createListShareCode(id)
                if (!code) { showToast('Не удалось создать ссылку', 'error'); return }
                const url = `${window.location.origin}/lists?share=${encodeURIComponent(code)}`
                if (navigator.clipboard) navigator.clipboard.writeText(url).then(() => showToast('Ссылка скопирована', 'success')).catch(() => alert(url))
                else alert(url)
              }}
              onShowOnTimeline={async (id) => {
                const usp = new URLSearchParams(window.location.search)
                const shareCode = usp.get('share')
                if (sharedList?.id === id && shareCode) {
                  window.location.href = `/timeline?share=${encodeURIComponent(shareCode)}`
                  return
                }
                try {
                  const code = await createListShareCode(id)
                  if (!code) throw new Error('no_code')
                  window.location.href = `/timeline?share=${encodeURIComponent(code)}`
                } catch {
                  showToast('Не удалось открыть на таймлайне', 'error')
                }
              }}
            />
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setSidebarCollapsed(c => !c)}
                aria-pressed={sidebarCollapsed}
                aria-label={sidebarCollapsed ? 'Показать меню' : 'Скрыть меню'}
                title={sidebarCollapsed ? 'Показать меню' : 'Скрыть меню'}
                style={{ position: 'absolute', left: -8, top: 0, width: 16, height: 32 }}
              >{sidebarCollapsed ? '⟩' : '⟨'}</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              {achMode !== 'list' ? (
                <>
            <div role="region" aria-label="Фильтр достижений" style={{ marginBottom: 12 }}>
              <div style={{ marginBottom: 8 }}>
                <input value={searchAch} onChange={(e) => setSearchAch(e.target.value)} placeholder="Поиск по достижениям/имени/стране" style={{ width: '100%', padding: 6 }} />
              </div>
                    <div style={{ fontSize: 12, opacity: 0.8 }}>
                      Найдено: {achMode==='all' ? achItemsAll.length : achItemsAlt.length}{!(achMode==='all' ? achLoadingAll : achAltLoading) && (achMode==='all' ? hasMoreAll : achAltHasMore) ? '+' : ''}
                    </div>
            </div>
            <div
              role="region"
              aria-label="Достижения"
              style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: 6 }}
              onScroll={(e) => {
                const el = e.currentTarget
                if (el.scrollTop + el.clientHeight >= el.scrollHeight - 40) {
                        const isAll = achMode==='all'
                        const loading = isAll ? achLoadingAll : achAltLoading
                        const more = isAll ? hasMoreAll : achAltHasMore
                        if (!loading && more) {
                          if (isAll) loadMoreAll(); else setAchAltOffset(o => o + 100)
                  }
                }
              }}
            >
                    {(achMode==='all' ? achLoadingAll : achAltLoading) && (achMode==='all' ? achItemsAll.length === 0 : achItemsAlt.length === 0) && <div>Загрузка...</div>}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
                      {(achMode==='all' ? achItemsAll : achItemsAlt).map((a) => {
                  const title = (a as any).title || (a as any).person_name || (a as any).country_name || ''
                  return (
                          <div key={a.id} style={{ border: '1px solid rgba(139,69,19,0.4)', borderRadius: 8, padding: 12, background: 'rgba(44,24,16,0.85)', position: 'relative' }}>
                      <div style={{ fontWeight: 'bold', marginBottom: 6 }}>{title || '—'}</div>
                      <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 6 }}>{a.year}</div>
                      <div style={{ fontSize: 14 }}>{a.description}</div>
                            <div style={{ position: 'absolute', top: 8, right: 8 }}>
                              <button
                                onClick={() => {
                                  if (!isAuthenticated || !user?.email_verified) { setShowAuthModal(true); return }
                                  setPendingAddAchievementId(Number(a.id))
                                  setShowAddToList(true)
                                }}
                                title="Добавить в список"
                              >＋</button>
                            </div>
                    </div>
                  )
                })}
              </div>
                    {!(achMode==='all' ? achLoadingAll : achAltLoading) && (achMode==='all' ? hasMoreAll : achAltHasMore) && (
                <div style={{ marginTop: 12 }}>
                        <button onClick={() => { if (achMode==='all') loadMoreAll(); else setAchAltOffset(o => o + 100) }} style={{ padding: '6px 12px' }}>Показать ещё</button>
                </div>
              )}
            </div>
                </>
              ) : (
                <>
                  <div style={{ marginBottom: 8, fontSize: 12, opacity: 0.9 }}>
                    {(() => {
                      const pc = listItems.filter(i => i.type === 'person').length
                      const ac = listItems.filter(i => i.type === 'achievement').length
                      const prc = listItems.filter(i => i.type === 'period').length
                      return `Личностей: ${pc} • Достижений: ${ac} • Периодов: ${prc}`
                    })()}
                  </div>
                  <div role="region" aria-label="Содержимое списка (достижения)" style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: 6 }}>
                  {listLoading && listItems.length === 0 && <div>Загрузка…</div>}
                  {listItems.filter(it => it.type === 'achievement').map((it) => (
                    <div key={it.key} style={{ padding: '6px 8px', borderBottom: '1px solid rgba(139,69,19,0.2)', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600 }}>{it.title}</div>
                        {it.subtitle && <div style={{ fontSize: 12, opacity: 0.85 }}>{it.subtitle}</div>}
                        {it.achievement && (
                          <div style={{ fontSize: 12, opacity: 0.8 }}>{it.achievement.description}</div>
                        )}
                      </div>
                      <button aria-label="Удалить из списка" title="Удалить" onClick={async () => {
                        if (!selectedListId) return
                        const id = it.listItemId
                        try {
                          const res = await apiFetch(`/api/lists/${selectedListId}/items/${id}`, { method: 'DELETE' })
                          if (res.ok) {
                            setListItems(prev => prev.filter(x => x.listItemId !== id))
                            await loadUserLists.current?.()
                            showToast('Удалено из списка', 'success')
                          } else {
                            showToast('Не удалось удалить', 'error')
                          }
                        } catch { showToast('Ошибка удаления', 'error') }
                      }}>✕</button>
                    </div>
                  ))}
                  {!listLoading && listItems.filter(it => it.type === 'achievement').length === 0 && <div style={{ opacity: 0.8 }}>Список пуст</div>}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {showCreate && (
          <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }} onClick={() => setShowCreate(false)} onKeyDown={(e) => { if (e.key === 'Escape') setShowCreate(false) }}>
              <div
                ref={createModalRef}
                tabIndex={-1}
                style={{ background: 'rgba(44,24,16,0.95)', border: '1px solid rgba(139,69,19,0.4)', borderRadius: 8, padding: 16, minWidth: 360 }}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => { if (createModalRef.current) trapFocus(createModalRef.current, e) }}
              >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ fontWeight: 'bold' }}>{createType === 'person' ? 'Новая личность' : 'Новое достижение'}</div>
                <button onClick={() => setShowCreate(false)}>✕</button>
              </div>
                {createType === 'person' ? (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault()
                    const fd = new FormData(e.currentTarget as HTMLFormElement)
                    const name = String(fd.get('name') || '').trim()
                    let id = slugifyIdFromName(name)
                    const birthStr = String(fd.get('birthYear') || '').trim()
                    const deathStr = String(fd.get('deathYear') || '').trim()
                    const birthYear = Number(birthStr)
                    const deathYear = Number(deathStr)
                    const category = (newPersonCategory || String(fd.get('category') || '').trim())
                    const description = String(fd.get('description') || '').trim()
                    const imageUrl = String(fd.get('imageUrl') || '') || null
                    const wikiLink = String(fd.get('wikiLink') || '') || null
                    if (!name) { showToast('Введите имя', 'error'); return }
                    if (birthStr === '' || deathStr === '') {
                      setNewYearErrors({ birth: birthStr === '' ? 'Укажите год рождения' : undefined, death: deathStr === '' ? 'Укажите год смерти' : undefined })
                      return
                    }
                    if (!id || id.length < 2) {
                      id = `person-${Date.now()}`
                    }
                    const createErrs: { birth?: string; death?: string } = {}
                    if (!Number.isInteger(birthYear)) createErrs.birth = 'Введите целое число'
                    if (!Number.isInteger(deathYear)) createErrs.death = 'Введите целое число'
                    if (Number.isInteger(birthYear) && Number.isInteger(deathYear) && birthYear > deathYear) {
                      createErrs.birth = 'Год рождения > года смерти'
                      createErrs.death = 'Год смерти < года рождения'
                    }
                    setNewYearErrors(createErrs)
                    if (createErrs.birth || createErrs.death) return
                    const payload = { id, name, birthYear, deathYear, category, description, imageUrl, wikiLink }
                    // Validate life periods like in edit form
                    if (newLifePeriods.length > 0) {
                      const v = validateLifePeriodsClient(newLifePeriods, birthYear, deathYear)
                      if (!v.ok) { setNewPeriodsError(v.message || 'Проверьте периоды'); return }
                      setNewPeriodsError(null)
                    }
                    try {
                      if (isModerator) {
                        await adminUpsertPerson(payload)
                        if (newLifePeriods.length > 0) {
                          const normalized = newLifePeriods.map(lp => ({ country_id: Number(lp.countryId), start_year: Number(lp.start), end_year: Number(lp.end) }))
                          await apiFetch(`/api/persons/${encodeURIComponent(id)}/life-periods`, {
                            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ periods: normalized })
                          })
                        }
                      } else {
                        await proposeNewPerson(payload)
                        // Отправляем предложенные периоды вместе с личностью как pending
                        if (newLifePeriods.length > 0) {
                          const normalized = newLifePeriods.map(lp => ({ country_id: Number(lp.countryId), start_year: Number(lp.start), end_year: Number(lp.end) }))
                          await apiFetch(`/api/persons/${encodeURIComponent(id)}/life-periods`, {
                            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ periods: normalized })
                          })
                        }
                        showToast('Личность отправлена на модерацию', 'success')
                      }
                      setShowCreate(false)
                      if (isModerator) {
                        showToast('Личность создана', 'success')
                      }
                      setSearchPersons(payload.name)
                    } catch (e: any) {
                      showToast(e?.message || 'Ошибка', 'error')
                    }
                  }}
                  style={{ display: 'grid', gap: 8 }}
                >
                  <input name="name" placeholder="Имя" required />
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input name="birthYear" type="number" placeholder="Год рождения" required value={newBirthYear} onChange={(e) => setNewBirthYear(e.target.value === '' ? '' : Number(e.target.value))} />
                      <input name="deathYear" type="number" placeholder="Год смерти" required value={newDeathYear} onChange={(e) => setNewDeathYear(e.target.value === '' ? '' : Number(e.target.value))} />
                    </div>
                    {(newYearErrors.birth || newYearErrors.death) && (
                      <div style={{ color: '#ffaaaa', fontSize: 12, marginTop: 4 }}>
                        {newYearErrors.birth && <div>Год рождения: {newYearErrors.birth}</div>}
                        {newYearErrors.death && <div>Год смерти: {newYearErrors.death}</div>}
                      </div>
                    )}
                  <div>
                    <label style={{ display: 'block', marginBottom: 4, fontSize: 12, opacity: 0.9 }}>Род деятельности</label>
                    <SearchableSelect
                      placeholder="Выбрать род деятельности"
                      value={newPersonCategory}
                      options={categorySelectOptions}
                      onChange={(val) => setNewPersonCategory(val)}
                      locale="ru"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 4, fontSize: 12, opacity: 0.9 }}>Страны проживания</label>
                    <div style={{ marginTop: 8 }}>
                      <button type="button" onClick={() => {
                        const used = new Set(newLifePeriods.map(lp => lp.countryId))
                        const next = countrySelectOptions.find(opt => !used.has(opt.value))?.value || ''
                        const by = typeof newBirthYear === 'number' ? newBirthYear : 0
                        const dy = typeof newDeathYear === 'number' ? newDeathYear : 0
                        setNewLifePeriods(prev => [...prev, { countryId: next, start: by, end: dy }])
                      }}>+ Добавить страну проживания</button>
                    </div>
                    {newLifePeriods.length > 0 && (
                      <LifePeriodsEditor
                        periods={newLifePeriods}
                        onChange={setNewLifePeriods}
                        options={countrySelectOptions}
                        minYear={typeof newBirthYear === 'number' ? newBirthYear : undefined}
                        maxYear={typeof newDeathYear === 'number' ? newDeathYear : undefined}
                        disableDeleteWhenSingle
                      />
                    )}
                    {newPeriodsError && (
                      <div style={{ color: '#ffaaaa', fontSize: 12, marginTop: 4 }}>{newPeriodsError}</div>
                    )}
                  </div>
                  <input name="imageUrl" placeholder="URL изображения (необязательно)" />
                  <input name="wikiLink" placeholder="Ссылка на Википедию (необязательно)" />
                  <textarea name="description" placeholder="Описание" rows={6} />
                  <button type="submit" disabled={Boolean(newYearErrors.birth || newYearErrors.death || newPeriodsError)}>Сохранить</button>
                </form>
              ) : (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault()
                    const fd = new FormData(e.currentTarget as HTMLFormElement)
                    const year = Number(fd.get('year') || 0)
                    const description = String(fd.get('description') || '').trim()
                    const wikipedia_url = String(fd.get('wikipedia_url') || '') || null
                    const image_url = String(fd.get('image_url') || '') || null
                    try {
                      if (!isModerator) {
                        showToast('Создавать достижения могут модераторы/админы', 'error')
                        return
                      }
                      if (achSelectedPersonId) {
                         await addAchievement(achSelectedPersonId, { year, description, wikipedia_url, image_url })
                      } else {
                         // Generic achievement (global or by country)
                         const countryId = achSelectedCountryId ? Number(achSelectedCountryId) : null
                         await addGenericAchievement({ year, description, wikipedia_url, image_url, country_id: countryId })
                      }
                      setShowCreate(false)
                      setSearchAch(String(year))
                    } catch (e: any) {
                      showToast(e?.message || 'Ошибка', 'error')
                    }
                  }}
                  style={{ display: 'grid', gap: 8 }}
                >
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input type="checkbox" checked={achIsGlobal} disabled={!!achSelectedPersonId || !!achSelectedCountryId} onChange={(e) => { const v = e.target.checked; setAchIsGlobal(v); if (v) { setAchSelectedPersonId(''); setAchSelectedCountryId(''); } }} /> Глобальное событие
                  </label>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ flex: '1 1 260px', minWidth: 260 }}>
                      <SearchableSelect
                        placeholder="Выбрать личность"
                        value={achSelectedPersonId}
                        disabled={achIsGlobal || !!achSelectedCountryId}
                        options={personOptions}
                        isLoading={personsSelectLoading}
                        locale="ru"
                        onChange={(val) => { setAchSelectedPersonId(val); if (val) { setAchIsGlobal(false); setAchSelectedCountryId('') } }}
                        onSearchChange={async (q) => {
                          setPersonsSelectLoading(true)
                          try {
                            const qTrim = q.trim()
                            if (qTrim.length < 2) { setPersonOptions([]); return }
                            const params = new URLSearchParams({ q: qTrim, limit: '20', offset: '0' })
                            const res = await apiFetch(`/api/persons?` + params.toString())
                            const data = await res.json().catch(() => ({ data: [] }))
                            const items: Person[] = Array.isArray(data.data) ? data.data : []
                            setPersonOptions(items.map(p => ({ value: p.id, label: `${p.name} — ${p.country}` })))
                          } catch { setPersonOptions([]) }
                          finally { setPersonsSelectLoading(false) }
                      }}
                      />
                    </div>
                    <div style={{ flex: '1 1 260px', minWidth: 220 }}>
                      <SearchableSelect
                        placeholder="Выбрать страну"
                        value={achSelectedCountryId}
                        disabled={achIsGlobal || !!achSelectedPersonId}
                        options={countrySelectOptions}
                        locale="ru"
                        onChange={(val) => { setAchSelectedCountryId(val); if (val) { setAchIsGlobal(false); setAchSelectedPersonId('') } }}
                      />
                    </div>
                  </div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>
                    Можно выбрать только одно: «Глобальное событие», «Выбрать персону» или «Выбрать страну».
                  </div>
                  <input name="year" type="number" placeholder="Год" required />
                  <textarea name="description" placeholder="Описание" rows={4} required />
                  <input name="wikipedia_url" placeholder="Ссылка на Википедию (необязательно)" />
                  <input name="image_url" placeholder="URL изображения (необязательно)" />
                  <button type="submit">Сохранить</button>
                </form>
              )}
            </div>
          </div>
        )}

        {showAuthModal && (
          <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20000 }} onClick={() => setShowAuthModal(false)} onKeyDown={(e) => { if (e.key === 'Escape') setShowAuthModal(false) }}>
            <div
              ref={authModalRef}
              tabIndex={-1}
              style={{ position: 'relative', background: 'rgba(44,24,16,0.98)', border: '1px solid rgba(139,69,19,0.5)', borderRadius: 8, padding: 16, minWidth: 360, maxWidth: '90vw', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => { if (authModalRef.current) trapFocus(authModalRef.current, e) }}
            >
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 8, width: '100%' }}>
                <div style={{ fontWeight: 'bold' }}>Требуется авторизация</div>
                <button onClick={() => setShowAuthModal(false)} style={{ position: 'absolute', top: 8, right: 8 }}>✕</button>
              </div>
              <div style={{ marginBottom: 8, opacity: 0.9 }}>
                {isAuthenticated ? (
                  user?.email_verified ? 'Недостаточно прав' : 'Подтвердите email, чтобы продолжить редактирование.'
                ) : 'Изменять информацию могут только авторизованные пользователи.'}
              </div>
              {!isAuthenticated && <LoginForm onSuccess={() => setShowAuthModal(false)} />}
              {isAuthenticated && !user?.email_verified && (
                <div style={{ display: 'grid', gap: 8, width: '100%' }}>
                  <button onClick={() => { navigate('/profile') }}>Перейти в профиль</button>
                  <div style={{ fontSize: 12, opacity: 0.85 }}>
                    В профиле можно повторно отправить письмо для подтверждения.
                  </div>
                </div>
              )}
              <div style={{ marginTop: 8, display: 'flex', gap: 8, justifyContent: 'center', width: '100%' }}>
                {!isAuthenticated && <button onClick={() => { window.location.href = '/register' }}>Зарегистрироваться</button>}
              </div>
            </div>
          </div>
        )}

        <CreateListModal
          isOpen={showCreateList}
          onClose={() => setShowCreateList(false)}
          onCreate={async (title) => {
            try {
              const res = await apiFetch(`/api/lists`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title }) })
              const data = await res.json().catch(() => null)
              if (res.ok && data?.data) {
                await loadUserLists.current?.()
              }
            } catch {}
          }}
        />

        <AddToListModal
          isOpen={showAddToList}
          onClose={() => setShowAddToList(false)}
          lists={isAuthenticated ? personLists : []}
          onCreateList={() => { setShowAddToList(false); setShowCreateList(true) }}
          extraControls={selected ? (
            <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="checkbox" checked={includeLinked} onChange={(e) => setIncludeLinked(e.target.checked)} /> Добавить все связанные периоды и достижения
            </label>
          ) : null}
          onAdd={async (listId) => {
            const addingAchievementId = pendingAddAchievementId
            const addingPeriodId = pendingAddPeriodId
            const addingPerson = selected
            if (!addingPerson && !addingAchievementId && !addingPeriodId) return
            const include = includeLinked
            try {
              const payload = addingPeriodId
                ? { item_type: 'period', period_id: addingPeriodId }
                : addingAchievementId
                ? { item_type: 'achievement', achievement_id: addingAchievementId }
                : { item_type: 'person', person_id: addingPerson!.id }
              const res = await apiFetch(`/api/lists/${listId}/items`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
              })
              const data = await res.json().catch(() => null)
              if (res.ok) {
                if (data?.message === 'already_exists') {
                  showToast('Элемент уже есть в выбранном списке', 'info')
                } else {
                  showToast('Добавлено в список', 'success')
                }
                // If person and include-linked checked, bulk add achievements and periods
                if (addingPerson && include) {
                    try {
                      // fetch achievements
                      const [achRes, perRes] = await Promise.all([
                        apiFetch(`/api/persons/${encodeURIComponent(addingPerson.id)}/achievements`),
                        apiFetch(`/api/persons/${encodeURIComponent(addingPerson.id)}/periods`)
                      ])
                      const achJson = await achRes.json().catch(() => ({ data: [] }))
                      const perJson = await perRes.json().catch(() => ({ data: [] }))
                      const achs: Array<{ id: number }> = Array.isArray(achJson.data) ? achJson.data : []
                      const pers: Array<{ id: number }> = Array.isArray(perJson.data) ? perJson.data : []
                      // sequential to keep server load low
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
                setShowAddToList(false)
                setPendingAddAchievementId(null)
                setPendingAddPeriodId(null)
                setIncludeLinked(false)
                await loadUserLists.current?.()
              } else {
                const msg = (data && data.message) ? data.message : 'Не удалось добавить в список'
                showToast(msg, 'error')
              }
            } catch (e: any) {
              showToast(e?.message || 'Ошибка', 'error')
            }
          }}
        />
      </div>
    </div>
  )
}


