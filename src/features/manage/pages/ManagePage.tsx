import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Person } from 'shared/types'
import { useFilters } from '../../../shared/hooks/useFilters'
import { getGroupColor, getPersonGroup } from 'features/persons/utils/groupingUtils'
import { PersonCard } from 'features/persons/components/PersonCard'
import { getCategories, getCountries, getCountryOptions, CountryOption, apiFetch, apiData, getMyPersonsCount, getMyAchievementsCount, getMyPeriodsCount } from 'shared/api/api'
import { AppHeader } from 'shared/layout/AppHeader'
import { useNavigate } from 'react-router-dom'
import { PersonEditModal } from '../components/PersonEditModal'
import { CreateListModal } from '../components/CreateListModal'
import { AddToListModal } from '../components/AddToListModal'
import { EditWarningModal } from 'shared/ui/EditWarningModal'
import { getPersonById, proposePersonEdit, updatePerson, submitPersonDraft, revertPersonToDraft, createPersonDraft, createAchievementDraft, createPeriodDraft, adminUpsertPerson, proposeNewPerson } from 'shared/api/api'
import { useLists } from 'features/manage/hooks/useLists'
import { useAddToList } from 'features/manage/hooks/useAddToList'
import { useAuth } from 'shared/context/AuthContext'
import { useToast } from 'shared/context/ToastContext'
import { AuthRequiredModal } from 'features/manage/components/AuthRequiredModal'
import { CreateEntityModal } from 'features/manage/components/CreateEntityModal'
import { AdaptiveTabs } from 'features/manage/components/AdaptiveTabs'
import { UnifiedManageSection } from 'features/manage/components/UnifiedManageSection'
import { ManageUIProvider } from 'features/manage/context/ManageUIContext'
import { useManagePageData } from '../hooks/useManagePageData'
import { slugifyIdFromName } from 'shared/utils/slug'
import '../styles/manage-page.css'
import { ContactFooter } from 'shared/ui/ContactFooter'

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
  const [selectedListId, setSelectedListId] = useState<number | null>(null)
  const [mineCounts, setMineCounts] = useState<{ persons: number; achievements: number; periods: number }>({ persons: 0, achievements: 0, periods: 0 })
  const countsLoadKeyRef = useRef<string | null>(null)
  const countsLastTsRef = useRef(0)
  
  type MenuSelection = 'all' | 'pending' | 'mine' | `list:${number}`
  const [menuSelection, setMenuSelection] = useState<MenuSelection>('all')
  
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const isModerator = !!user && (user.role === 'admin' || user.role === 'moderator')
  const { showToast } = useToast()
  
  // Используем новый хук для управления данными
  const {
    searchPersons,
    setSearchPersons,
    statusFilters,
    setStatusFilters,
    personsAll,
    isPersonsLoadingAll,
    personsHasMoreAll,
    loadMorePersonsAll,
    personsAlt,
    personsAltLoading,
    personsAltInitialLoading,
    personsAltHasMore,
    loadMorePersonsAlt,
    searchAch,
    setSearchAch,
    searchPeriods,
    setSearchPeriods,
    achStatusFilters,
    setAchStatusFilters,
    periodsStatusFilters,
    setPeriodsStatusFilters,
    achievementsData,
    periodsData,
    achievementsMineData,
    periodsMineData,
    resetPersons,
    resetAchievements,
    resetPeriods
  } = useManagePageData(activeTab, menuSelection, isAuthenticated, filters)

  // Убираем фолбэк: источник данных один — useManagePageData/useApiData

  // Состояния для модальных окон
  const [isEditing, setIsEditing] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [createType, setCreateType] = useState<'person' | 'achievement' | 'period'>('person')
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showEditWarning, setShowEditWarning] = useState(false)
  const [isReverting, setIsReverting] = useState(false)
  const [showCreateList, setShowCreateList] = useState(false)

  // Состояния для выбранной личности
  const [selected, setSelected] = useState<Person | null>(null)
  const lastSelectedRef = useRef<Person | null>(null)
  useEffect(() => { if (selected) lastSelectedRef.current = selected }, [selected])

  // Состояния для категорий и стран
  const [categories, setCategories] = useState<string[]>([])
  const [countries, setCountries] = useState<string[]>([])
  const [countryOptions, setCountryOptions] = useState<CountryOption[]>([])

  // Состояния для редактирования личности
  const [editPersonCategory, setEditPersonCategory] = useState<string>('')
  const [lifePeriods, setLifePeriods] = useState<Array<{ countryId: string; start: number | ''; end: number | '' }>>([])
  const [editBirthYear, setEditBirthYear] = useState<number>(0)
  const [editDeathYear, setEditDeathYear] = useState<number>(0)

  // Состояния для создания новой личности
  const [newLifePeriods, setNewLifePeriods] = useState<Array<{ countryId: string; start: number | ''; end: number | '' }>>([])

  // Списки пользователя
  const { personLists, sharedList, loadUserLists } = useLists({ isAuthenticated, userId: user?.id ? String(user.id) : null, apiData })
  const addToList = useAddToList({ 
    showToast,
    reloadLists: (force?: boolean) => loadUserLists.current?.(force),
    getSelectedPerson: () => selected ? { id: selected.id } : null,
    apiFetch,
    apiData
  })

  // Загрузка метаданных
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

  // Загрузка стабильных счётчиков "Мои" (без фильтров/пагинации)
  useEffect(() => {
    let cancelled = false
    if (!isAuthenticated || !user?.id) { setMineCounts({ persons: 0, achievements: 0, periods: 0 }); return }
    const key = String(user.id)
    const now = Date.now()
    // Лёгкая защита от частых вызовов в dev, но не блокируем загрузку, если счётчик еще не заполнен
    if (countsLoadKeyRef.current === key && now - countsLastTsRef.current < 1500) {
      const haveCounts = (mineCounts.persons > 0 || mineCounts.achievements > 0 || mineCounts.periods > 0)
      if (haveCounts) return
    }
    countsLoadKeyRef.current = key
    countsLastTsRef.current = now
    ;(async () => {
      try {
        const [pc, ac, prc] = await Promise.all([
          getMyPersonsCount().catch(() => 0),
          getMyAchievementsCount().catch(() => 0),
          getMyPeriodsCount().catch(() => 0)
        ])
        if (!cancelled) setMineCounts({ persons: pc, achievements: ac, periods: prc })
      } catch {}
    })()
    return () => { cancelled = true }
  }, [isAuthenticated, user?.id])

  // Сброс данных и триггер обновления при смене вкладки
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

  // Подготовка данных для редактирования личности
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
      let firstId = ''
      const parts = (selected.country || '').split('/').map(s => s.trim()).filter(Boolean)
      const match = countryOptions.find(c => parts.includes(c.name))
      if (match) firstId = String(match.id)
      else if (countryOptions.length > 0) firstId = String(countryOptions[0].id)
      if (firstId) initial.push({ countryId: firstId, start: selected.birthYear, end: selected.deathYear })
    }
    setLifePeriods(initial)
  }, [selected, countryOptions])

  useEffect(() => {
    if (!selected) { setEditPersonCategory(''); return }
    const match = categories.find(c => c === selected.category)
    setEditPersonCategory(match ? match : '')
  }, [selected, categories])

  useEffect(() => {
    if (!selected) { setEditBirthYear(0); setEditDeathYear(0); return }
    setEditBirthYear(selected.birthYear)
    setEditDeathYear(selected.deathYear)
  }, [selected])

  useEffect(() => {
    if (lifePeriods.length === 0) return
    setLifePeriods(prev => prev.map(lp => {
      const start = typeof lp.start === 'number' ? Math.max(lp.start, editBirthYear) : lp.start
      const end = typeof lp.end === 'number' ? Math.min(lp.end, editDeathYear) : lp.end
      return { ...lp, start, end }
    }))
  }, [editBirthYear, editDeathYear, lifePeriods.length])

  // Подготовка данных для создания новой личности
  useEffect(() => {
    if (showCreate && createType === 'person' && newLifePeriods.length === 0) {
      setNewLifePeriods([{ countryId: '', start: '', end: '' }])
    }
  }, [showCreate, createType, newLifePeriods.length])

  // Обработка выбора списка
  useEffect(() => {
    const applySelection = (target: Tab) => {
      if ((menuSelection as string).startsWith('list:')) {
        const id = Number((menuSelection as string).split(':')[1])
        setSelectedListId(Number.isFinite(id) ? id : null)
      } else if (menuSelection === 'all') {
        setSelectedListId(null)
      } else if (menuSelection === 'pending' || menuSelection === 'mine') {
        setSelectedListId(null)
      }
    }
    applySelection(activeTab)
  }, [activeTab, menuSelection])

  // Состояния для списков
  type MixedItem = { key: string; listItemId: number; type: 'person' | 'achievement' | 'period'; person?: Person | null; achievement?: any | null; periodId?: number | null; period?: any | null; title: string; subtitle?: string }
  const [listItems, setListItems] = useState<MixedItem[]>([])
  const listItemIdByDomainIdRef = useRef<Map<string, number>>(new Map())
  const [listLoading, setListLoading] = useState(false)

  // Подготовка опций для селектов
  const countrySelectOptions = useMemo(() => countryOptions.map(c => ({ value: String(c.id), label: c.name })), [countryOptions])
  const categorySelectOptions = useMemo(() => categories.map(c => ({ value: c, label: c })), [categories])

  // Для меню используем items_count, которое приходит с /api/lists (общий счётчик);
  // не загружаем элементы списков до явного выбора пользователем.

  // Функция удаления элемента из списка
  const handleDeleteListItem = async (listItemId: number) => {
    if (!selectedListId) return
    try {
      const ok = await apiFetch(`/api/lists/${selectedListId}/items/${listItemId}`, { method: 'DELETE' })
      if (ok.ok) { 
        setListItems(prev => prev.filter(x => x.listItemId !== listItemId))
        await loadUserLists.current?.(true)
        showToast('Удалено из списка', 'success')
      } else { 
        showToast('Не удалось удалить', 'error')
      }
    } catch (e) {
      showToast('Ошибка при удалении', 'error')
    }
  }

  // Загрузка содержимого списка
  useEffect(() => {
    let aborted = false
    ;(async () => {
      const listModeActive = (menuSelection as string).startsWith('list:')
      if (!listModeActive || !selectedListId) { setListItems([]); return }
      setListLoading(true)
      try {
        // Если выбран readonly-список, пришедший через share-код, берём его содержимое через публичный endpoint
        let items: Array<{ id: number; item_type: string; person_id?: string; achievement_id?: number; period_id?: number }>
        const readonlyShared = sharedList && sharedList.id === selectedListId && !!sharedList.code
        if (readonlyShared) {
          const resolved = await apiData<any>(`/api/list-shares/${encodeURIComponent(sharedList!.code)}`)
          items = (Array.isArray(resolved?.items) ? resolved.items : []).map((it: any, idx: number) => ({
            id: idx + 1,
            item_type: it.item_type,
            person_id: it.person_id,
            achievement_id: it.achievement_id,
            period_id: it.period_id
          }))
        } else {
          items = await apiData(`/api/lists/${selectedListId}/items`)
        }
        const personIds = items.filter(i => i.item_type === 'person' && i.person_id).map(i => i.person_id!)
        const achIds = items.filter(i => i.item_type === 'achievement' && typeof i.achievement_id === 'number').map(i => i.achievement_id!)
        const periodIds = items.filter(i => i.item_type === 'period' && typeof i.period_id === 'number').map(i => i.period_id!)
        
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
            return { key: `pr:${it.period_id}:${it.id}`, listItemId: it.id, type: 'period', person: null, achievement: null, periodId: it.period_id || null, period: pr, title: header || `Период #${it.period_id}`, subtitle: pr ? `${pr.period_type === 'ruler' ? 'Правление' : pr.period_type === 'life' ? 'Жизнь' : pr.period_type} — ${pr.start_year}—${pr.end_year ?? '—'}` : undefined }
          }
          return { key: `x:${it.id}`, listItemId: it.id, type: 'person', person: null, achievement: null, periodId: null, title: '—', subtitle: undefined }
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
    return () => { aborted = true }
  }, [activeTab, menuSelection, selectedListId])

  // Сохранение выбранной личности при переключении на пустой список
  useEffect(() => {
    if ((menuSelection as string).startsWith('list:') && listItems.length === 0 && !listLoading && !selected && lastSelectedRef.current) {
      setSelected(lastSelectedRef.current)
    }
  }, [menuSelection, listItems.length, listLoading, selected])

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  
  return (
    <div className="app manage-page" id="chrononinja-manage" role="main" aria-label="Управление контентом">
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
      <div className="manage-wrapper">
        <ManageUIProvider
          value={{
            openAddAchievement: (id: number) => addToList.openForAchievement(id),
            openAddPeriod: (id: number) => addToList.openForPeriod(id),
            openAddForSelectedPerson: () => { if (selected) addToList.openForPerson(selected) }
          }}
        >
          <div className="manage-page__content" style={{ padding: 16, paddingTop: 8 }}>
            <AdaptiveTabs
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              sidebarCollapsed={sidebarCollapsed}
              setSidebarCollapsed={setSidebarCollapsed}
        isAuthenticated={isAuthenticated}
        userEmailVerified={user?.email_verified}
              onAddClick={() => {
                if (!isAuthenticated) {
                  setShowAuthModal(true)
                  return
                }
                if (!user?.email_verified) {
                  setShowAuthModal(true)
                  return
                }
                if (activeTab === 'persons') {
                  setCreateType('person')
                } else if (activeTab === 'achievements') {
                  setCreateType('achievement')
                } else if (activeTab === 'periods') {
                  setCreateType('period')
                }
                setShowCreate(true)
              }}
            />

            {activeTab === 'persons' && (
              <div className="manage-page__persons-layout" id="manage-persons-layout" style={{ display: 'grid', gridTemplateColumns: 'minmax(480px, 1fr) 2fr', gap: 16, alignItems: 'start' }}>
                <div className="manage-page__persons-section" id="manage-persons-section" style={{ minWidth: 0, borderRight: '2px solid rgba(139,69,19,0.3)', paddingRight: 16 }}>
                  <UnifiedManageSection
                    sidebarCollapsed={sidebarCollapsed}
                    menuSelection={menuSelection as any}
                    setMenuSelection={setMenuSelection as any}
                    isModerator={isModerator}
                    pendingCount={null}
                    mineCount={(activeTab as string) === 'persons' ? mineCounts.persons : (activeTab as string) === 'achievements' ? mineCounts.achievements : mineCounts.periods}
                    personLists={[
                      ...(sharedList ? [{ id: sharedList.id, title: `🔒 ${sharedList.title}`, items_count: sharedList.persons_count ?? sharedList.items_count, readonly: true } as any] : []),
                      ...(isAuthenticated ? personLists : [])
                    ]}
                    isAuthenticated={isAuthenticated}
                    setShowAuthModal={setShowAuthModal}
                    setShowCreateList={setShowCreateList}
                    setShowCreate={setShowCreate}
                    createType={createType}
                    setCreateType={setCreateType}
                    sharedList={sharedList}
                    selectedListId={selectedListId}
                    setSelectedListId={setSelectedListId}
                    loadUserLists={(force?: boolean) => loadUserLists.current?.(force) as any}
                    showToast={showToast}
                    data={((menuSelection as string).startsWith('list:')) ? {
                      items: listItems.filter(i => i.type === 'person').map(i => i.person).filter(Boolean) as any[],
                      isLoading: listLoading,
                      hasMore: false,
                      loadMore: () => {}
                    } : (menuSelection === 'mine') ? {
                      items: personsAlt,
                      isLoading: personsAltLoading || personsAltInitialLoading,
                      hasMore: personsAltHasMore,
                      loadMore: loadMorePersonsAlt
                    } : {
                      items: personsAll,
                      isLoading: isPersonsLoadingAll,
                      hasMore: personsHasMoreAll,
                      loadMore: loadMorePersonsAll
                    }}
                    searchQuery={searchPersons}
                    setSearchQuery={setSearchPersons}
                    categories={categories}
                    countries={countries}
                    filters={filters as any}
                    setFilters={setFilters as any}
                    statusFilters={statusFilters}
                    setStatusFilters={setStatusFilters}
                    listLoading={listLoading}
                    listItems={listItems}
                    onDeleteListItem={handleDeleteListItem}
                    getListItemIdByDisplayId={(id) => listItemIdByDomainIdRef.current.get(String(id))}
                    onSelect={(p) => setSelected(p)}
                    onPersonSelect={(person) => setSelected(person)}
                    onAddItem={(id) => addToList.openForPerson({ id } as any)}
                    labelAll="Все личности"
                    itemType="person"
                    emptyMessage="Личности не найдены"
                    loadingMessage="Загрузка личностей..."
                  />
                </div>
                <div className="manage-page__person-card" id="manage-person-card" role="region" aria-label="Карточка личности" style={{ position: 'relative', zIndex: 2, minWidth: 0 }}>
                  {selected ? (
                    <div className="manage-page__person-card-content">
                      <div className="manage-page__person-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <div className="manage-page__person-card-title" style={{ fontWeight: 'bold', fontSize: 16 }}>Карточка</div>
                        <div className="manage-page__person-card-actions" style={{ display: 'flex', gap: 8 }}>
                          <button 
                            className="manage-page__person-card-edit-btn"
                            onClick={() => { 
                              if (!isAuthenticated || !user?.email_verified) { 
                                setShowAuthModal(true); 
                                return; 
                              }
                              if (selected?.status === 'pending') {
                                setShowEditWarning(true);
                                return;
                              }
                              setIsEditing(true);
                            }}
                          >
                            Редактировать
                          </button>
                          <button 
                            className="manage-page__person-card-add-btn"
                            onClick={() => { if (!isAuthenticated || !user?.email_verified) { setShowAuthModal(true); return } if (selected) addToList.openForPerson(selected) }}
                          >
                            Добавить в список
                          </button>
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
                          setCreateType('achievement')
                          setShowCreate(true)
                        }}
                      />
                    </div>
                  ) : (
                    <div className="manage-page__person-card-empty" style={{ opacity: 0.8 }}>Выберите личность слева</div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'achievements' && (
              <div className="manage-page__achievements-section" id="manage-achievements-section">
                <UnifiedManageSection
                  sidebarCollapsed={sidebarCollapsed}
                  menuSelection={menuSelection as any}
                  setMenuSelection={setMenuSelection as any}
                  isModerator={isModerator}
                  pendingCount={null}
                  mineCount={(activeTab as string) === 'persons' ? mineCounts.persons : (activeTab as string) === 'achievements' ? mineCounts.achievements : mineCounts.periods}
                  personLists={[
                    ...(sharedList ? [{ id: sharedList.id, title: `🔒 ${sharedList.title}`, items_count: sharedList.achievements_count ?? 0, readonly: true } as any] : []),
                    ...(isAuthenticated ? personLists : [])
                  ]}
                  isAuthenticated={isAuthenticated}
                  setShowAuthModal={setShowAuthModal}
                  setShowCreateList={setShowCreateList}
                  setShowCreate={setShowCreate}
                  createType={createType}
                  setCreateType={setCreateType}
                  sharedList={sharedList}
                  selectedListId={selectedListId}
                  setSelectedListId={setSelectedListId}
                  loadUserLists={(force?: boolean) => loadUserLists.current?.(force) as any}
                  showToast={showToast}
                  data={((menuSelection as string).startsWith('list:')) ? {
                    items: listItems.filter(i => i.type === 'achievement').map(i => i.achievement).filter(Boolean) as any[],
                    isLoading: listLoading,
                    hasMore: false,
                    loadMore: () => {}
                  } : (menuSelection === 'mine') ? achievementsMineData : achievementsData}
                  searchQuery={searchAch}
                  setSearchQuery={setSearchAch}
                  categories={[]} // TODO: добавить категории для достижений
                  countries={[]} // TODO: добавить страны для достижений
                  filters={filters as any}
                  setFilters={setFilters as any}
                  statusFilters={achStatusFilters}
                  setStatusFilters={setAchStatusFilters}
                  listLoading={listLoading}
                  listItems={listItems}
                  onDeleteListItem={handleDeleteListItem}
                  getListItemIdByDisplayId={(id) => listItemIdByDomainIdRef.current.get(String(id))}
                  onSelect={(achievement) => {
                    // TODO: добавить обработку выбора достижения
                  }}
                  onAddItem={(id) => addToList.openForAchievement(Number(id))}
                  labelAll="Все достижения"
                  itemType="achievement"
                  emptyMessage="Достижения не найдены"
                  loadingMessage="Загрузка достижений..."
                />
              </div>
            )}

            {activeTab === 'periods' && (
              <div className="manage-page__periods-section" id="manage-periods-section">
                <UnifiedManageSection
                  sidebarCollapsed={sidebarCollapsed}
                  menuSelection={menuSelection as any}
                  setMenuSelection={setMenuSelection as any}
                  isModerator={isModerator}
                  pendingCount={null}
                  mineCount={(activeTab as string) === 'persons' ? mineCounts.persons : (activeTab as string) === 'achievements' ? mineCounts.achievements : mineCounts.periods}
                  personLists={[
                    ...(sharedList ? [{ id: sharedList.id, title: `🔒 ${sharedList.title}`, items_count: sharedList.periods_count ?? 0, readonly: true } as any] : []),
                    ...(isAuthenticated ? personLists : [])
                  ]}
                  isAuthenticated={isAuthenticated}
                  setShowAuthModal={setShowAuthModal}
                  setShowCreateList={setShowCreateList}
                  setShowCreate={setShowCreate}
                  createType={createType}
                  setCreateType={setCreateType}
                  sharedList={sharedList}
                  selectedListId={selectedListId}
                  setSelectedListId={setSelectedListId}
                  loadUserLists={(force?: boolean) => loadUserLists.current?.(force) as any}
                  showToast={showToast}
                  data={((menuSelection as string).startsWith('list:')) ? {
                    items: listItems.filter(i => i.type === 'period').map(i => i.period).filter(Boolean) as any[],
                    isLoading: listLoading,
                    hasMore: false,
                    loadMore: () => {}
                  } : (menuSelection === 'mine') ? periodsMineData : periodsData}
                  searchQuery={searchPeriods}
                  setSearchQuery={setSearchPeriods}
                  categories={[]} // TODO: добавить категории для периодов
                  countries={[]} // TODO: добавить страны для периодов
                  filters={filters as any}
                  setFilters={setFilters as any}
                  statusFilters={periodsStatusFilters}
                  setStatusFilters={setPeriodsStatusFilters}
                  listLoading={listLoading}
                  listItems={listItems}
                  onDeleteListItem={handleDeleteListItem}
                  getListItemIdByDisplayId={(id) => listItemIdByDomainIdRef.current.get(String(id))}
                  onSelect={(period) => {
                    // TODO: добавить обработку выбора периода
                  }}
                  onAddItem={(id) => addToList.openForPeriod(Number(id))}
                  labelAll="Все периоды"
                  itemType="period"
                  emptyMessage="Периоды не найдены"
                  loadingMessage="Загрузка периодов..."
                />
              </div>
            )}
            
            {/* Модальные окна */}
            <div className="manage-page__modals">
              <AuthRequiredModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                isAuthenticated={isAuthenticated}
                emailVerified={!!user?.email_verified}
                onGoToProfile={() => navigate('/profile')}
              />

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
                      await adminUpsertPerson(personPayload)
                      showToast('Личность создана', 'success')
                    } else {
                      await proposeNewPerson(personPayload)
                      showToast('Предложение на создание личности отправлено', 'success')
                    }
                    
                    setShowCreate(false)
                    // TODO: добавить обновление данных
                  } catch (e: any) {
                    showToast(e?.message || 'Ошибка при создании личности', 'error')
                  }
                }}
                onCreateAchievement={async (payload) => {
                  try {
                    if (!user?.email_verified) { showToast('Требуется подтверждение email для создания достижений', 'error'); return }
                    
                    if (payload.saveAsDraft) {
                      if (!payload.personId) {
                        showToast('Необходимо выбрать личность для достижения', 'error')
                        return
                      }
                      await createAchievementDraft(payload.personId, payload)
                      showToast('Черновик достижения сохранен', 'success')
                    } else {
                      // TODO: добавить создание достижения
                      showToast('Создание достижений пока не реализовано', 'info')
                    }
                    
                    setShowCreate(false)
                    // TODO: добавить обновление данных
                  } catch (e: any) {
                    showToast(e?.message || 'Ошибка при создании достижения', 'error')
                  }
                }}
                onCreatePeriod={async (payload) => {
                  try {
                    if (!user?.email_verified) { showToast('Требуется подтверждение email для создания периодов', 'error'); return }
                    
                    if (payload.saveAsDraft) {
                      if (!payload.personId) {
                        showToast('Необходимо выбрать личность для периода', 'error')
                        return
                      }
                      await createPeriodDraft(payload.personId, {
                        start_year: payload.startYear,
                        end_year: payload.endYear,
                        period_type: payload.type,
                        country_id: payload.countryId,
                        comment: payload.description
                      })
                      showToast('Черновик периода сохранен', 'success')
                    } else {
                      // TODO: добавить создание периода
                      showToast('Создание периодов пока не реализовано', 'info')
                    }
                    
                    setShowCreate(false)
                    // TODO: добавить обновление данных
                  } catch (e: any) {
                    showToast(e?.message || 'Ошибка при создании периода', 'error')
                  }
                }}
                personOptions={[]}
                personsSelectLoading={false}
                onSearchPersons={async (q: string) => {}}
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
                  const lifePeriods = next.map(p => ({
                    countryId: String(p.country_id),
                    start: p.start_year,
                    end: p.end_year
                  }))
                  await updatePerson(id, { ...payload, lifePeriods })
                  const fresh = await getPersonById(id)
                  if (fresh) setSelected(fresh as any)
                }}
                onSubmitDraft={async (id: string, payload: any, next: Array<{ country_id: number; start_year: number; end_year: number }>) => {
                  const lifePeriods = next.map(p => ({
                    countryId: String(p.country_id),
                    start: p.start_year,
                    end: p.end_year
                  }))
                  await updatePerson(id, { ...payload, lifePeriods })
                  await submitPersonDraft(id)
                  const fresh = await getPersonById(id)
                  if (fresh) setSelected(fresh as any)
                }}
                onSuccess={async () => {
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
          </div>
        </ManageUIProvider>
      </div>
      <div style={{ height: 56 }} />
      <ContactFooter fixed />
    </div>
  )
}
