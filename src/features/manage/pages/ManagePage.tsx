import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Person } from 'shared/types'
import { useFilters } from 'hooks/useFilters'
import { getGroupColor, getPersonGroup } from 'features/persons/utils/groupingUtils'
import { useAchievements } from 'hooks/useAchievements'
import { usePeriods } from 'hooks/usePeriods'
import { PersonCard } from 'features/persons/components/PersonCard'
import { usePersonsPaged } from 'features/persons/hooks/usePersonsPaged'
import { getCategories, getCountries, addGenericAchievement, getCountryOptions, CountryOption, apiFetch, apiData } from 'shared/api/api'
import { AppHeader } from 'shared/layout/AppHeader'
import { useNavigate } from 'react-router-dom'
// FilterDropdown now used from PersonsList
import { SelectOption } from 'shared/ui/SearchableSelect'
import { PersonEditModal } from '../components/PersonEditModal'
import { CreateListModal } from '../components/CreateListModal'
// import { LeftMenu, LeftMenuSelection } from '../components/LeftMenu'
import { AddToListModal } from '../components/AddToListModal'
import { EditWarningModal } from 'shared/ui/EditWarningModal'
import { adminUpsertPerson, getPersonById, proposePersonEdit, proposeNewPerson, addAchievement, createAchievementDraft, createPersonDraft, updatePerson, submitPersonDraft, revertPersonToDraft } from 'shared/api/api'
import { useLists } from 'features/manage/hooks/useLists'
import { useAddToList } from 'features/manage/hooks/useAddToList'
import { useAuth } from 'shared/context/AuthContext'
import { useToast } from 'shared/context/ToastContext'
// import { LoginForm } from '../../auth/components/LoginForm'
import { AuthRequiredModal } from 'features/manage/components/AuthRequiredModal'
import { CreateEntityModal } from 'features/manage/components/CreateEntityModal'
import { Breadcrumbs } from 'shared/ui/Breadcrumbs'
import { slugifyIdFromName } from 'shared/utils/slug'
// import { validateLifePeriodsClient } from '../../../utils/validation'
import { AchievementsSection } from 'features/manage/components/AchievementsSection'
import { PersonsSection } from 'features/manage/components/PersonsSection'
import { PeriodsSection } from 'features/manage/components/PeriodsSection'
import { ManageUIProvider } from 'features/manage/context/ManageUIContext'

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
  // Removed old mode variables - now using menuSelection directly
  const [statusFilters, setStatusFilters] = useState<Record<string, boolean>>({
    draft: false,
    pending: false,
    approved: false,
    rejected: false
  }) // Фильтры по статусам для 'mine' режима
  const [selectedListId, setSelectedListId] = useState<number | null>(null)
  type MenuSelection = 'all' | 'pending' | 'mine' | `list:${number}`
  const [menuSelection, setMenuSelection] = useState<MenuSelection>('all')
  // const { persons, isLoading } = useTimelineData(filters, true)
  const [searchPersons, setSearchPersons] = useState('')
  const [searchAch, setSearchAch] = useState('')
  const [searchPeriods, setSearchPeriods] = useState('')
  const [categories, setCategories] = useState<string[]>([])
  const [countries, setCountries] = useState<string[]>([])
  const { items: achItemsAll, isLoading: achLoadingAll, hasMore: hasMoreAll, loadMore: loadMoreAll } = useAchievements(searchAch, activeTab === 'achievements' && menuSelection === 'all')
  const [achItemsAlt, setAchItemsAlt] = useState<any[]>([])
  const [achAltLoading, setAchAltLoading] = useState(false)
  const [achAltHasMore, setAchAltHasMore] = useState(false)
  const [achAltOffset, setAchAltOffset] = useState(0)
  const [achPendingCount, setAchPendingCount] = useState<number | null>(null)
  const [achMineCount, setAchMineCount] = useState<number | null>(null)
  
  // Add periods mine count
  const [periodsMineCount, setPeriodsMineCount] = useState<number | null>(null)
  const [periodType, setPeriodType] = useState<'life' | 'ruler' | ''>('')
  const { items: periodItemsAll, isLoading: periodsLoadingAll, hasMore: periodsHasMoreAll, loadMore: loadMorePeriodsAll } = usePeriods({ query: searchPeriods, type: periodType }, activeTab === 'periods' && menuSelection === 'all')
  
  // Add support for periods 'mine' mode
  const [periodItemsMine, setPeriodItemsMine] = useState<any[]>([])
  const [periodsLoadingMine, setPeriodsLoadingMine] = useState(false)
  const [periodsHasMoreMine, setPeriodsHasMoreMine] = useState(false)
  const [periodsMineOffset, setPeriodsMineOffset] = useState(0)
  const [selected, setSelected] = useState<Person | null>(null)
  const lastSelectedRef = useRef<Person | null>(null)
  useEffect(() => { if (selected) lastSelectedRef.current = selected }, [selected])
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const isModerator = !!user && (user.role === 'admin' || user.role === 'moderator')
  const { showToast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [createType, setCreateType] = useState<'person' | 'achievement'>('person')
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showEditWarning, setShowEditWarning] = useState(false)
  const [isReverting, setIsReverting] = useState(false)
  // moved into CreateEntityModal
  const [countryOptions, setCountryOptions] = useState<CountryOption[]>([])
  // removed local query state for persons select
  // moved into CreateEntityModal
  const [personOptions, setPersonOptions] = useState<SelectOption[]>([])
  const [personsSelectLoading, setPersonsSelectLoading] = useState(false)
  // focus refs removed; handled in modal components
  const countrySelectOptions = useMemo(() => countryOptions.map(c => ({ value: String(c.id), label: c.name })), [countryOptions])
  const [newLifePeriods, setNewLifePeriods] = useState<Array<{ countryId: string; start: number | ''; end: number | '' }>>([])
  // moved into CreateEntityModal
  const categorySelectOptions = useMemo(() => categories.map(c => ({ value: c, label: c })), [categories])
  const [editPersonCategory, setEditPersonCategory] = useState<string>('')
  const [lifePeriods, setLifePeriods] = useState<Array<{ countryId: string; start: number | ''; end: number | '' }>>([])
  const [editBirthYear, setEditBirthYear] = useState<number>(0)
  const [editDeathYear, setEditDeathYear] = useState<number>(0)
  // moved into PersonEditModal
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

  // Focus handling moved to modals

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
    if (!selected) { setLifePeriods([]); return }
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
      // initial country id is inferred in modal on open
    } else {
      // initial country id is inferred in modal on open
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
    // validation handled in PersonEditModal
  }, [editBirthYear, editDeathYear, lifePeriods.length])

  // Creation form validation moved into CreateEntityModal

  const personsQuery = useMemo(() => ({
    q: searchPersons,
    category: filters.categories.length ? filters.categories.join(',') : undefined,
    country: filters.countries.length ? filters.countries.join(',') : undefined
  }), [searchPersons, filters.categories, filters.countries])
  const { items: personsAll, isLoading: isPersonsLoadingAll, hasMore: personsHasMoreAll, loadMore: loadMorePersonsAll } = usePersonsPaged(personsQuery, activeTab === 'persons' && menuSelection === 'all')
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
  const { personLists, sharedList, loadUserLists } = useLists({ isAuthenticated, userId: user?.id ? String(user.id) : null, apiData })
  const addToList = useAddToList({
    showToast,
    reloadLists: (force?: boolean) => loadUserLists.current?.(force),
    getSelectedPerson: () => selected ? { id: selected.id } : null,
    apiFetch,
    apiData
  })
  const [showCreateList, setShowCreateList] = useState(false)

  // Helper: client-side filter for persons in 'mine' mode (backend supports only status)
  const applyMinePersonsFilters = React.useCallback((items: Person[]): Person[] => {
    const decodeIfNeeded = (s: string | undefined | null) => {
      const v = (s ?? '').toString();
      if (/%[0-9A-Fa-f]{2}/.test(v)) {
        try { return decodeURIComponent(v) } catch { return v }
      }
      return v;
    };
    const q = searchPersons.trim().toLowerCase();
    const selectedCategories = filters.categories;
    const selectedCountries = filters.countries;
    return items.filter((p) => {
      const name = decodeIfNeeded((p as any).name).toLowerCase();
      const category = decodeIfNeeded((p as any).category).toLowerCase();
      const countryRaw = decodeIfNeeded((p as any).country).toLowerCase();
      const description = decodeIfNeeded((p as any).description).toLowerCase();
      // Search
      if (q.length > 0) {
        const haystack = `${name} ${category} ${countryRaw} ${description}`;
        if (!haystack.includes(q)) return false;
      }
      // Category filter (OR across selected)
      if (selectedCategories.length > 0) {
        const ok = selectedCategories.some((c: string) => category === c.toLowerCase());
        if (!ok) return false;
      }
      // Country filter: person country can be 'A/B/C'
      if (selectedCountries.length > 0) {
        const personCountries = countryRaw.includes('/') ? countryRaw.split('/').map(s => s.trim()) : [countryRaw];
        const ok = selectedCountries.some((c: string) => personCountries.includes(c.toLowerCase()));
        if (!ok) return false;
      }
      return true;
    });
  }, [searchPersons, filters.categories, filters.countries]);

  // Simplified content loading logic based on activeTab + menuSelection
  useEffect(() => {
    if (activeTab !== 'persons') return
    if (menuSelection === 'all' || (menuSelection as string).startsWith('list:')) return
    
    console.log('Loading persons in mode:', { activeTab, menuSelection, searchPersons, filters: { categories: filters.categories, countries: filters.countries, statusFilters } })
    
    // Сбрасываем состояние
    setPersonsAlt([])
    setPersonsAltHasMore(true)
    setPersonsAltOffset(0)
    setPersonsAltLoading(true)
    
    // Загружаем данные
    let aborted = false
    async function loadInitialData() {
      try {
        const params = new URLSearchParams({ limit: '50', offset: '0' })
        
        // Добавляем все фильтры для режима 'mine' (кроме status — он поддерживается бэкендом)
        if (menuSelection === 'mine') {
          // Фильтры по статусам — серверные
          const selectedStatuses = Object.entries(statusFilters)
            .filter(([_, checked]) => checked)
            .map(([status, _]) => status)
          if (selectedStatuses.length > 0) {
            params.set('status', selectedStatuses.join(','))
          }
        }
        
        const path = menuSelection === 'pending' ? '/api/admin/persons/moderation' : '/api/persons/mine'
        console.log('Loading persons from:', path, params.toString())
        
        const arr = await apiData<Person[]>(`${path}?${params.toString()}`)
        console.log('Received persons data:', arr?.length || 0)
        
        if (!aborted) {
          const normalized = menuSelection === 'mine' ? applyMinePersonsFilters(arr || []) : (arr || [])
          setPersonsAlt(normalized)
          // Если сервер вернул >= лимита, продолжаем пагинацию
          setPersonsAltHasMore((arr?.length || 0) >= 50)
          setPersonsAltLoading(false)
        }
      } catch (error) {
        console.error('Error loading persons:', error)
        if (!aborted) {
          setPersonsAlt([])
          setPersonsAltHasMore(false)
          setPersonsAltLoading(false)
        }
      }
    }
    
    loadInitialData()
    return () => { aborted = true }
  }, [activeTab, menuSelection, statusFilters, searchPersons, filters.categories, filters.countries, applyMinePersonsFilters])

  // Reset offset when filters change to reload data from beginning
  useEffect(() => {
    if (activeTab === 'persons' && menuSelection === 'mine') {
      console.log('Resetting persons offset due to filter change:', { searchPersons, filters: { categories: filters.categories, countries: filters.countries, statusFilters } })
      setPersonsAltOffset(0)
      setPersonsAlt([])
      setPersonsAltHasMore(true)
      setPersonsAltLoading(false)
    }
  }, [activeTab, menuSelection, searchPersons, filters.categories, filters.countries, statusFilters])
  
  // Reset offset for achievements when filters change
  useEffect(() => {
    if (activeTab === 'achievements' && menuSelection === 'mine') {
      console.log('Resetting achievements offset due to filter change:', { searchAch })
      setAchAltOffset(0)
      setAchItemsAlt([])
      setAchAltHasMore(true)
      setAchAltLoading(false)
    }
  }, [activeTab, menuSelection, searchAch])
  
  // Reset offset for periods when filters change
  useEffect(() => {
    if (activeTab === 'periods' && menuSelection === 'mine') {
      console.log('Resetting periods offset due to filter change:', { searchPeriods, periodType })
      setPeriodsMineOffset(0)
      setPeriodItemsMine([])
      setPeriodsHasMoreMine(true)
      setPeriodsLoadingMine(false)
    }
  }, [activeTab, menuSelection, searchPeriods, periodType])
  
  // Separate useEffect for loading more data (pagination)
  useEffect(() => {
    if (personsAltOffset === 0) return // Skip initial load (handled above)
    if (menuSelection === 'all' || (menuSelection as string).startsWith('list:') || !personsAltHasMore || personsAltLoading) return
    
    console.log('Loading more persons data:', { personsAltOffset, personsAltHasMore, personsAltLoading })
    
    let aborted = false
    async function loadMoreData() {
      setPersonsAltLoading(true)
      try {
        const params = new URLSearchParams({ limit: '50', offset: String(personsAltOffset) })
        
        // Только status передаём на бэкенд
        if (menuSelection === 'mine') {
          const selectedStatuses = Object.entries(statusFilters)
            .filter(([_, checked]) => checked)
            .map(([status, _]) => status)
          if (selectedStatuses.length > 0) {
            params.set('status', selectedStatuses.join(','))
          }
        }
        
        const path = menuSelection === 'pending' ? '/api/admin/persons/moderation' : '/api/persons/mine'
        const arr = await apiData<Person[]>(`${path}?${params.toString()}`)
        if (!aborted) {
          const normalized = menuSelection === 'mine' ? applyMinePersonsFilters(arr || []) : (arr || [])
          setPersonsAlt(prev => [...prev, ...normalized])
          setPersonsAltHasMore((arr?.length || 0) >= 50)
        }
      } catch (error) {
        console.error('Error loading more persons:', error)
        if (!aborted) setPersonsAltHasMore(false)
      } finally {
        if (!aborted) setPersonsAltLoading(false)
      }
    }
    
    loadMoreData()
    return () => { aborted = true }
  }, [personsAltOffset, menuSelection, statusFilters, applyMinePersonsFilters, personsAltHasMore, personsAltLoading])

  // Load selected list content (for both tabs + periods). Only loads when current tab is in 'list' mode
  useEffect(() => {
    let aborted = false
    ;(async () => {
      const listModeActive = (menuSelection as string).startsWith('list:')
      if (!listModeActive || !selectedListId) { setListItems([]); return }
      setListLoading(true)
      try {
        const items: Array<{ id: number; item_type: string; person_id?: string; achievement_id?: number; period_id?: number }> = await apiData(`/api/lists/${selectedListId}/items`)
        const personIds = items.filter(i => i.item_type === 'person' && i.person_id).map(i => i.person_id!)
        const achIds = items.filter(i => i.item_type === 'achievement' && typeof i.achievement_id === 'number').map(i => i.achievement_id!)
        const periodIds = items.filter(i => i.item_type === 'period' && typeof i.period_id === 'number').map(i => i.period_id!)
        // Fetch details in parallel
        const [personsData, achData, periodsData] = await Promise.all([
          personIds.length ? apiData<Person[]>(`/api/persons/lookup/by-ids?ids=${personIds.join(',')}`) : Promise.resolve([]),
          achIds.length ? apiData<any[]>(`/api/achievements/lookup/by-ids?ids=${achIds.join(',')}`) : Promise.resolve([]),
          periodIds.length ? apiData<any[]>(`/api/periods/lookup/by-ids?ids=${periodIds.join(',')}`) : Promise.resolve([])
        ])
        const periodsMap = new Map<number, any>()
        ;(Array.isArray(periodsData) ? periodsData : []).forEach((p: any) => periodsMap.set(p.id, p))
        const personsMap = new Map<string, Person>()
        ;(Array.isArray(personsData) ? personsData : []).forEach((p: Person) => personsMap.set(p.id, p))
        const achMap = new Map<number, any>()
        ;(Array.isArray(achData) ? achData : []).forEach((a: any) => achMap.set(a.id, a))
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
  }, [activeTab, menuSelection, selectedListId])

  // Preserve person card when switching to an empty list
  useEffect(() => {
    if ((menuSelection as string).startsWith('list:') && listItems.length === 0 && !listLoading && !selected && lastSelectedRef.current) {
      setSelected(lastSelectedRef.current)
    }
  }, [menuSelection, listItems.length, listLoading, selected])

  // Achievements: initial load on reset
  useEffect(() => {
    if (activeTab !== 'achievements') return
    if (menuSelection === 'all' || (menuSelection as string).startsWith('list:')) return
    
    console.log('Loading achievements in mode:', { activeTab, menuSelection, searchAch })
    setAchItemsAlt([])
    setAchAltHasMore(true)
    setAchAltOffset(0)
    setAchAltLoading(true)
    let aborted = false
    ;(async () => {
      try {
        const params = new URLSearchParams({ limit: '100', offset: '0' })
        if (menuSelection === 'mine' && searchAch.trim()) params.set('q', searchAch.trim())
        const path = menuSelection === 'pending' ? '/api/admin/achievements/pending' : '/api/achievements/mine'
        console.log('Loading achievements from:', path, params.toString())
        const arr = await apiData<any[]>(`${path}?${params.toString()}`)
        if (!aborted) {
          setAchItemsAlt(arr || [])
          setAchAltHasMore((arr?.length || 0) >= 100)
        }
      } catch (e) {
        if (!aborted) setAchAltHasMore(false)
      } finally {
        if (!aborted) setAchAltLoading(false)
      }
    })()
    return () => { aborted = true }
  }, [activeTab, menuSelection, searchAch])

  // Achievements: load more when offset increases
  useEffect(() => {
    if (activeTab !== 'achievements') return
    if (menuSelection === 'all' || (menuSelection as string).startsWith('list:')) return
    if (achAltOffset === 0) return
    if (!achAltHasMore || achAltLoading) return
    let aborted = false
    ;(async () => {
      setAchAltLoading(true)
      try {
        const params = new URLSearchParams({ limit: '100', offset: String(achAltOffset) })
        if (menuSelection === 'mine' && searchAch.trim()) params.set('q', searchAch.trim())
        const path = menuSelection === 'pending' ? '/api/admin/achievements/pending' : '/api/achievements/mine'
        console.log('Loading more achievements from:', path, params.toString())
        const arr = await apiData<any[]>(`${path}?${params.toString()}`)
        if (!aborted) {
          setAchItemsAlt(prev => [...prev, ...(arr || [])])
          setAchAltHasMore((arr?.length || 0) >= 100)
        }
      } catch (e) {
        if (!aborted) setAchAltHasMore(false)
      } finally {
        if (!aborted) setAchAltLoading(false)
      }
    })()
    return () => { aborted = true }
  }, [activeTab, menuSelection, achAltOffset, achAltHasMore, achAltLoading, searchAch])
  
  // Periods: initial load on reset
  useEffect(() => {
    if (activeTab !== 'periods') return
    if (menuSelection === 'all' || (menuSelection as string).startsWith('list:')) return
    
    console.log('Loading periods in mode:', { activeTab, menuSelection, searchPeriods, periodType })
    setPeriodItemsMine([])
    setPeriodsHasMoreMine(true)
    setPeriodsMineOffset(0)
    setPeriodsLoadingMine(true)
    let aborted = false
    ;(async () => {
      try {
        const params = new URLSearchParams({ limit: '100', offset: '0' })
        if (menuSelection === 'mine') {
          if (searchPeriods.trim()) params.set('q', searchPeriods.trim())
          if (periodType) params.set('type', periodType)
        }
        const path = menuSelection === 'mine' ? '/api/periods/mine' : '/api/admin/periods/pending'
        console.log('Loading periods from:', path, params.toString())
        const arr = await apiData<any[]>(`${path}?${params.toString()}`)
        if (!aborted) {
          setPeriodItemsMine(arr || [])
          setPeriodsHasMoreMine((arr?.length || 0) >= 100)
        }
      } catch (e) {
        if (!aborted) setPeriodsHasMoreMine(false)
      } finally {
        if (!aborted) setPeriodsLoadingMine(false)
      }
    })()
    return () => { aborted = true }
  }, [activeTab, menuSelection, searchPeriods, periodType])

  // Periods: load more when offset increases
  useEffect(() => {
    if (activeTab !== 'periods') return
    if (menuSelection === 'all' || (menuSelection as string).startsWith('list:')) return
    if (periodsMineOffset === 0) return
    if (!periodsHasMoreMine || periodsLoadingMine) return
    let aborted = false
    ;(async () => {
      setPeriodsLoadingMine(true)
      try {
        const params = new URLSearchParams({ limit: '100', offset: String(periodsMineOffset) })
        if (menuSelection === 'mine') {
          if (searchPeriods.trim()) params.set('q', searchPeriods.trim())
          if (periodType) params.set('type', periodType)
        }
        const path = menuSelection === 'mine' ? '/api/periods/mine' : '/api/admin/periods/pending'
        console.log('Loading more periods from:', path, params.toString())
        const arr = await apiData<any[]>(`${path}?${params.toString()}`)
        if (!aborted) {
          setPeriodItemsMine(prev => [...prev, ...(arr || [])])
          setPeriodsHasMoreMine((arr?.length || 0) >= 100)
        }
      } catch (e) {
        if (!aborted) setPeriodsHasMoreMine(false)
      } finally {
        if (!aborted) setPeriodsLoadingMine(false)
      }
    })()
    return () => { aborted = true }
  }, [activeTab, menuSelection, periodsMineOffset, periodsHasMoreMine, periodsLoadingMine, searchPeriods, periodType])

  // Detect shared list side effects kept minimal (handled in useLists)
  useEffect(() => {}, [sharedList])

  // Fetch counts for sidebar badges
  useEffect(() => {
    let aborted = false
    ;(async () => {
      try {
        if (isModerator) {
          const [pData, aData] = await Promise.all([
            apiData<any>('/api/admin/persons/moderation?count=true').catch(() => ({ count: 0 })),
            apiData<any>('/api/admin/achievements/pending?count=true').catch(() => ({ count: 0 }))
          ])
          if (!aborted) {
            setPersonsPendingCount(Number((pData as any)?.count || 0))
            setAchPendingCount(Number((aData as any)?.count || 0))
          }
        } else {
          setPersonsPendingCount(null)
          setAchPendingCount(null)
        }
      } catch {
        if (!aborted) { setPersonsPendingCount(0); setAchPendingCount(0) }
      }
      try {
        const data = await apiData<any>('/api/mine/counts').catch(() => ({ persons: 0, achievements: 0, periods: 0 }))
        if (!aborted) {
          setPersonsMineCount(Number((data as any)?.persons || 0))
          setAchMineCount(Number((data as any)?.achievements || 0))
          setPeriodsMineCount(Number((data as any)?.periods || 0))
        }
      } catch {
        if (!aborted) { setPersonsMineCount(0); setAchMineCount(0); setPeriodsMineCount(0) }
      }
    })()
    return () => { aborted = true }
  }, [isModerator, user?.id])

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Apply global menuSelection on tab switch
  useEffect(() => {
    const applySelection = (target: Tab) => {
      console.log('Applying selection:', { target, menuSelection })
      
      if ((menuSelection as string).startsWith('list:')) {
        const id = Number((menuSelection as string).split(':')[1])
        setSelectedListId(Number.isFinite(id) ? id : null)
      } else if (menuSelection === 'all') {
        setSelectedListId(null)
      } else if (menuSelection === 'pending' || menuSelection === 'mine') {
        setSelectedListId(null)
      }
      
      console.log('Applied selection result:', { 
        target, 
        menuSelection, 
        selectedListId: (menuSelection as string).startsWith('list:') ? Number((menuSelection as string).split(':')[1]) : null
      })
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
      <Breadcrumbs />
      <ManageUIProvider
        value={{
          openAddAchievement: (id: number) => addToList.openForAchievement(id),
          openAddPeriod: (id: number) => addToList.openForPeriod(id),
          openAddForSelectedPerson: () => { if (selected) addToList.openForPerson(selected) }
        }}
      >
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16, alignItems: 'start' }}>
            <PersonsSection
              sidebarCollapsed={sidebarCollapsed}
              setSidebarCollapsed={setSidebarCollapsed}
              menuSelection={menuSelection as any}
              setMenuSelection={setMenuSelection as any}
              isModerator={isModerator}
              personsPendingCount={personsPendingCount}
              personsMineCount={personsMineCount}
              personLists={[
                ...(sharedList ? [{ id: sharedList.id, title: `🔒 ${sharedList.title}`, items_count: undefined, readonly: true } as any] : []),
                ...(isAuthenticated ? personLists : [])
              ]}
              isAuthenticated={isAuthenticated}
              setShowAuthModal={setShowAuthModal}
              setShowCreateList={setShowCreateList}
              sharedList={sharedList}
              selectedListId={selectedListId}
              setSelectedListId={setSelectedListId}
              loadUserLists={(force?: boolean) => loadUserLists.current?.(force) as any}
              showToast={showToast}
              searchPersons={searchPersons}
              setSearchPersons={setSearchPersons}
              categories={categories}
              countries={countries}
              filters={filters as any}
              setFilters={setFilters as any}
              personsAll={personsAll}
              isPersonsLoadingAll={isPersonsLoadingAll}
              personsHasMoreAll={personsHasMoreAll}
              loadMorePersonsAll={loadMorePersonsAll}
              personsAlt={personsAlt}
              personsAltLoading={personsAltLoading}
              personsAltHasMore={personsAltHasMore}
              setPersonsAltOffset={setPersonsAltOffset}
              onSelect={(p) => setSelected(p)}
              personsMode={menuSelection === 'all' ? 'all' : menuSelection === 'mine' ? 'mine' : 'list'}
              statusFilters={statusFilters}
              setStatusFilters={setStatusFilters}
              listLoading={listLoading}
              listItems={listItems}
            />
            <div role="region" aria-label="Карточка личности" style={{ position: 'relative', zIndex: 2, minWidth: 0 }}>
              {selected ? (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <div style={{ fontWeight: 'bold', fontSize: 16 }}>Карточка</div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => { 
                          if (!isAuthenticated || !user?.email_verified) { 
                            setShowAuthModal(true); 
                            return; 
                          }
                          // Проверяем статус личности
                          if (selected?.status === 'pending') {
                            setShowEditWarning(true);
                            return;
                          }
                          setIsEditing(true);
                        }}>Редактировать</button>
                      <button onClick={() => { if (!isAuthenticated || !user?.email_verified) { setShowAuthModal(true); return } if (selected) addToList.openForPerson(selected) }}>Добавить в список</button>
                      </div>
                    </div>
                    <PersonCard
                      key={selected.id}
                      person={selected}
                      getGroupColor={getGroupColor}
                      getPersonGroup={(person) => getPersonGroup(person, 'category')}
                      getCategoryColor={getGroupColor}
                      onAddAchievement={(p) => {
                        if (!isAuthenticated || !user?.email_verified) { setShowAuthModal(true); return }
                        // prefill CreateEntityModal person selection
                        setPersonOptions(prev => {
                          const option = { value: p.id, label: `${p.name} — ${p.country}` }
                          const exists = prev.some(o => o.value === option.value)
                          return exists ? prev : [option, ...prev]
                        })
                        setCreateType('achievement')
                        setShowCreate(true)
                      }}
                    />
                </div>
              ) : (
                <div style={{ opacity: 0.8 }}>Выберите личность слева</div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'periods' && (
          <PeriodsSection
            sidebarCollapsed={sidebarCollapsed}
            setSidebarCollapsed={setSidebarCollapsed}
            menuSelection={menuSelection as any}
            setMenuSelection={setMenuSelection as any}
            isModerator={isModerator}
            personLists={[
              ...(sharedList ? [{ id: sharedList.id, title: `🔒 ${sharedList.title}`, items_count: undefined, readonly: true } as any] : []),
              ...(isAuthenticated ? personLists : [])
            ]}
            isAuthenticated={isAuthenticated}
            setShowAuthModal={setShowAuthModal}
            setShowCreateList={setShowCreateList}
            sharedList={sharedList}
            selectedListId={selectedListId}
            setSelectedListId={setSelectedListId}
            loadUserLists={(force?: boolean) => loadUserLists.current?.(force) as any}
            showToast={showToast}
            searchPeriods={searchPeriods}
            setSearchPeriods={setSearchPeriods}
            periodType={periodType}
            setPeriodType={setPeriodType}
            periodItemsAll={periodItemsAll as any}
            periodsLoadingAll={periodsLoadingAll}
            periodsHasMoreAll={periodsHasMoreAll}
            loadMorePeriodsAll={loadMorePeriodsAll}
            periodsMineCount={periodsMineCount}
            periodItemsMine={periodItemsMine}
            periodsLoadingMine={periodsLoadingMine}
            periodsHasMoreMine={periodsHasMoreMine}
            listLoading={listLoading}
            listItems={listItems}
            setListItems={setListItems as any}
            openAddPeriod={(id: number) => { addToList.openForPeriod(id) }}
          />
        )}

        {activeTab === 'achievements' && (
          <AchievementsSection
            sidebarCollapsed={sidebarCollapsed}
            setSidebarCollapsed={setSidebarCollapsed}
            menuSelection={menuSelection as any}
            setMenuSelection={setMenuSelection as any}
              isModerator={isModerator}
            achPendingCount={achPendingCount}
            achMineCount={achMineCount}
            personLists={isAuthenticated ? personLists : []}
            isAuthenticated={isAuthenticated}
            emailVerified={!!user?.email_verified}
            setShowAuthModal={setShowAuthModal}
            setShowCreateList={setShowCreateList}
            sharedList={sharedList}
            selectedListId={selectedListId}
            setSelectedListId={setSelectedListId}
            loadUserLists={(force?: boolean) => loadUserLists.current?.(force) as any}
            showToast={showToast}
            searchAch={searchAch}
            setSearchAch={setSearchAch}
            achItemsAll={achItemsAll as any}
            achLoadingAll={achLoadingAll}
            hasMoreAll={hasMoreAll}
            loadMoreAll={loadMoreAll}
            achItemsAlt={achItemsAlt}
            achAltLoading={achAltLoading}
            achAltHasMore={achAltHasMore}
            setAchAltOffset={setAchAltOffset}
            listLoading={listLoading}
            listItems={listItems}
            setListItems={setListItems as any}
            openAddAchievement={(id: number) => { addToList.openForAchievement(id) }}
            openAddForSelectedPerson={() => { if (selected) addToList.openForPerson(selected) }}
          />
        )}

        {showCreate && (
          <CreateEntityModal
            isOpen={showCreate}
            onClose={() => setShowCreate(false)}
            type={createType}
            categories={categories}
            countryOptions={countryOptions as any}
            onCreatePerson={async (payload) => {
              try {
                if (!user?.email_verified) { showToast('Требуется подтверждение email для создания личностей', 'error'); return }
                
                let id = slugifyIdFromName(payload.name)
              if (!id || id.length < 2) id = `person-${Date.now()}`
                
                const personPayload = { 
                  id, 
                  name: payload.name, 
                  birthYear: payload.birthYear, 
                  deathYear: payload.deathYear, 
                  category: payload.category, 
                  description: payload.description, 
                  imageUrl: payload.imageUrl, 
                  wikiLink: payload.wikiLink,
                  saveAsDraft: payload.saveAsDraft,
                  lifePeriods: payload.lifePeriods
                }
                
                if (payload.saveAsDraft) {
                  await createPersonDraft(personPayload)
                  showToast('Черновик личности сохранен', 'success')
                } else if (isModerator) {
                  const { saveAsDraft, ...personData } = personPayload
                  await adminUpsertPerson(personData)
                  // Модераторы по-прежнему используют отдельный API для периодов
                  if (payload.lifePeriods.length > 0) {
                    const normalized = payload.lifePeriods.map((lp: { countryId: string; start: number | ''; end: number | '' }) => ({ 
                      country_id: Number(lp.countryId), 
                      start_year: Number(lp.start), 
                      end_year: Number(lp.end) 
                    }))
                    await apiFetch(`/api/persons/${encodeURIComponent(id)}/life-periods`, { 
                      method: 'POST', 
                      headers: { 'Content-Type': 'application/json' }, 
                      body: JSON.stringify({ periods: normalized }) 
                    })
                  }
                  showToast('Личность создана', 'success')
                  setSearchPersons(personPayload.name)
                      } else {
                  const { saveAsDraft, ...personData } = personPayload
                  await proposeNewPerson(personData)
                  // Периоды теперь сохраняются прямо в proposeNewPerson, дополнительный вызов не нужен
                  showToast('Личность создана и отправлена на модерацию', 'success')
                }
                
                      setShowCreate(false)
                    } catch (e: any) {
                      showToast(e?.message || 'Ошибка', 'error')
                    }
                  }}
            
            personOptions={personOptions}
            personsSelectLoading={personsSelectLoading}
            onSearchPersons={async (q: string) => {
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
            onCreateAchievement={async ({ year, description, wikipedia_url, image_url, personId, countryId, saveAsDraft }: { year: number; description: string; wikipedia_url: string | null; image_url: string | null; personId?: string; countryId?: number | null; saveAsDraft?: boolean }) => {
              try {
                if (!user?.email_verified) { showToast('Требуется подтверждение email для создания достижений', 'error'); return }
                if (personId) {
                  if (saveAsDraft) {
                    await createAchievementDraft(personId, { year, description, wikipedia_url, image_url })
                    showToast('Черновик достижения сохранен', 'success')
                  } else {
                  await addAchievement(personId, { year, description, wikipedia_url, image_url })
                    showToast('Достижение создано и отправлено на модерацию', 'success')
                  }
                } else {
                  // Для глобальных достижений всё ещё нужны права модератора
                  if (!isModerator) { showToast('Создавать глобальные достижения могут только модераторы/админы', 'error'); return }
                  await addGenericAchievement({ year, description, wikipedia_url, image_url, country_id: countryId ?? null })
                  showToast('Глобальное достижение создано', 'success')
                }
                setShowCreate(false)
                if (!saveAsDraft) {
                setSearchAch(String(year))
                }
              } catch (e: any) {
                showToast(e?.message || 'Ошибка', 'error')
              }
            }}
          />
        )}

        <AuthRequiredModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          isAuthenticated={isAuthenticated}
          emailVerified={!!user?.email_verified}
          onGoToProfile={() => navigate('/profile')}
        />

        <PersonEditModal
          isOpen={isEditing && !!selected}
          onClose={() => setIsEditing(false)}
          person={selected as any}
          isModerator={isModerator}
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
          showToast={showToast}
          onPersonUpdated={(fresh: Person) => setSelected(fresh)}
          onProposeEdit={async (id: string, payload: any, next: Array<{ country_id: number; start_year: number; end_year: number }>) => {
            await proposePersonEdit(id, payload)
            const orig = (Array.isArray((selected as any)?.periods) ? (selected as any).periods : [])
              .filter((pr: any) => (pr.type || '').toLowerCase() === 'life' && pr.countryId)
              .map((pr: any) => ({ country_id: Number(pr.countryId), start_year: Number(pr.startYear), end_year: Number(pr.endYear) }))
              .sort((a: any, b: any) => a.start_year - b.start_year || a.end_year - b.end_year || a.country_id - b.country_id)
            const changed = JSON.stringify(orig) !== JSON.stringify(next)
            if (changed) {
              await apiFetch(`/api/persons/${encodeURIComponent(id)}/life-periods`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ periods: next }) })
            }
          }}
          onUpdateDraft={async (id: string, payload: any, next: Array<{ country_id: number; start_year: number; end_year: number }>) => {
            // Преобразуем периоды в формат frontend
            const lifePeriods = next.map(p => ({
              countryId: String(p.country_id),
              start: p.start_year,
              end: p.end_year
            }))
            
            // Обновляем персону с периодами
            await updatePerson(id, { ...payload, lifePeriods })
            const fresh = await getPersonById(id)

            if (fresh) setSelected(fresh as any)
          }}
          onSubmitDraft={async (id: string, payload: any, next: Array<{ country_id: number; start_year: number; end_year: number }>) => {
            // Сначала обновляем черновик с изменениями
            const lifePeriods = next.map(p => ({
              countryId: String(p.country_id),
              start: p.start_year,
              end: p.end_year
            }))
            await updatePerson(id, { ...payload, lifePeriods })
            
            // Затем отправляем на модерацию
            await submitPersonDraft(id)
            const fresh = await getPersonById(id)

            if (fresh) setSelected(fresh as any)
          }}
          onSuccess={async () => {
            // Дополнительно обновляем данные о личности после успешной операции
            if (selected) {
              const fresh = await getPersonById(selected.id)
              if (fresh) setSelected(fresh as any)
            }
          }}
        />

        <CreateListModal
          isOpen={showCreateList}
          onClose={() => setShowCreateList(false)}
          onCreate={async (title: string) => {
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
          isOpen={addToList.isOpen}
          onClose={() => addToList.close()}
          lists={isAuthenticated ? personLists : []}
          onCreateList={() => { addToList.close(); setShowCreateList(true) }}
          extraControls={selected ? (
            <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="checkbox" checked={addToList.includeLinked} onChange={(e) => addToList.setIncludeLinked(e.target.checked)} /> Добавить все связанные периоды и достижения
            </label>
          ) : null}
          onAdd={(listId: number) => addToList.onAdd(listId)}
        />

        <EditWarningModal
          isOpen={showEditWarning}
          personName={selected?.name || ''}
          onRevertToDraft={async () => {
            if (!selected || isReverting) return;
            
            setIsReverting(true);
            try {
              await revertPersonToDraft(selected.id);
              showToast('Личность возвращена в черновики', 'success');
              
              // Обновляем данные о личности
              const fresh = await getPersonById(selected.id);

              if (fresh) setSelected(fresh as any);
              
              setShowEditWarning(false);
            } catch (e: any) {
              showToast(e?.message || 'Ошибка при возврате в черновики', 'error');
            } finally {
              setIsReverting(false);
            }
          }}
          onCancel={() => setShowEditWarning(false)}
          isReverting={isReverting}
        />
      </div>
      </ManageUIProvider>
    </div>
  )
}


