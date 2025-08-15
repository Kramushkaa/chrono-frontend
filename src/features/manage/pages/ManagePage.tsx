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
import { adminUpsertPerson, getPersonById, proposePersonEdit, proposeNewPerson, addAchievement } from 'shared/api/api'
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
  const [showCreate, setShowCreate] = useState(false)
  const [createType, setCreateType] = useState<'person' | 'achievement'>('person')
  const [showAuthModal, setShowAuthModal] = useState(false)
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
  const { personLists, sharedList, loadUserLists } = useLists({ isAuthenticated, userId: user?.id ? String(user.id) : null, apiData })
  const addToList = useAddToList({
    showToast,
    reloadLists: (force?: boolean) => loadUserLists.current?.(force),
    getSelectedPerson: () => selected ? { id: selected.id } : null,
    apiFetch,
    apiData
  })
  const [showCreateList, setShowCreateList] = useState(false)

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
        const arr = await apiData<Person[]>(`${path}?${params.toString()}`)
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
        const arr = await apiData<any[]>(`${path}?${params.toString()}`)
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
              personsMode={personsMode}
              listLoading={listLoading}
              listItems={listItems}
            />
            <div role="region" aria-label="Карточка личности" style={{ position: 'relative', zIndex: 2, minWidth: 0 }}>
              {selected ? (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <div style={{ fontWeight: 'bold', fontSize: 16 }}>Карточка</div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => { if (!isAuthenticated || !user?.email_verified) { setShowAuthModal(true); return } setIsEditing(true) }}>Редактировать</button>
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
            emailVerified={!!user?.email_verified}
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
            periodsMode={periodsMode}
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
            setShowAuthModal={setShowAuthModal}
            setShowCreateList={setShowCreateList}
            sharedList={sharedList}
            selectedListId={selectedListId}
            setSelectedListId={setSelectedListId}
            loadUserLists={(force?: boolean) => loadUserLists.current?.(force) as any}
            showToast={showToast}
            searchAch={searchAch}
            setSearchAch={setSearchAch}
            achMode={achMode}
            achItemsAll={achItemsAll as any}
            achLoadingAll={achLoadingAll}
            hasMoreAll={hasMoreAll}
            loadMoreAll={loadMoreAll}
            achItemsAlt={achItemsAlt}
            achAltLoading={achAltLoading}
            achAltHasMore={achAltHasMore}
            setAchAltOffset={setAchAltOffset}
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
            onCreatePerson={async ({ id: _ignored, name, birthYear, deathYear, category, description, imageUrl, wikiLink, lifePeriods }: { id: string; name: string; birthYear: number; deathYear: number; category: string; description: string; imageUrl: string | null; wikiLink: string | null; lifePeriods: Array<{ countryId: string; start: number | ''; end: number | '' }> }) => {
                    let id = slugifyIdFromName(name)
              if (!id || id.length < 2) id = `person-${Date.now()}`
                    const payload = { id, name, birthYear, deathYear, category, description, imageUrl, wikiLink }
                    try {
                      if (isModerator) {
                        await adminUpsertPerson(payload)
                  if (lifePeriods.length > 0) {
                    const normalized = lifePeriods.map((lp: { countryId: string; start: number | ''; end: number | '' }) => ({ country_id: Number(lp.countryId), start_year: Number(lp.start), end_year: Number(lp.end) }))
                    await apiFetch(`/api/persons/${encodeURIComponent(id)}/life-periods`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ periods: normalized }) })
                        }
                      } else {
                        await proposeNewPerson(payload)
                  if (lifePeriods.length > 0) {
                    const normalized = lifePeriods.map((lp: { countryId: string; start: number | ''; end: number | '' }) => ({ country_id: Number(lp.countryId), start_year: Number(lp.start), end_year: Number(lp.end) }))
                    await apiFetch(`/api/persons/${encodeURIComponent(id)}/life-periods`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ periods: normalized }) })
                        }
                        showToast('Личность отправлена на модерацию', 'success')
                      }
                      setShowCreate(false)
                if (isModerator) showToast('Личность создана', 'success')
                      setSearchPersons(payload.name)
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
            onCreateAchievement={async ({ year, description, wikipedia_url, image_url, personId, countryId }: { year: number; description: string; wikipedia_url: string | null; image_url: string | null; personId?: string; countryId?: number | null }) => {
              try {
                if (!isModerator) { showToast('Создавать достижения могут модераторы/админы', 'error'); return }
                if (personId) {
                  await addAchievement(personId, { year, description, wikipedia_url, image_url })
                } else {
                  await addGenericAchievement({ year, description, wikipedia_url, image_url, country_id: countryId ?? null })
                }
                setShowCreate(false)
                setSearchAch(String(year))
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
      </div>
      </ManageUIProvider>
    </div>
  )
}


