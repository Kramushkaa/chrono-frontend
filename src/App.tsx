import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
// import { ProtectedRoute } from './components/ProtectedRoute'
import { Person } from './types'
import { MainMenu } from './components/MainMenu'
import { AuthProvider } from './context'
// removed inline auth forms from menu; keep imports minimal
import { BackendInfo } from './components/BackendInfo'
import { useTimelineData } from './hooks/useTimelineData'
import { useFilters } from './hooks/useFilters'
import { useSlider } from './hooks/useSlider'
import { useTooltip } from './hooks/useTooltip'
import { useTimelineDrag } from './hooks/useTimelineDrag'
import { 
  generateCenturyBoundaries,
  getFirstCountry
} from './utils/timelineUtils'
import { 
  getGroupColor, 
  getGroupColorDark, 
  getGroupColorMuted, 
  getPersonGroup,
  sortGroupedData
} from './utils/groupingUtils'
import './App.css'
import { ToastProvider } from './context/ToastContext'
import { getDtoVersion, apiFetch, resolveListShare } from './services/api'
import { useAuth } from './context'
import { DTO_VERSION as DTO_VERSION_FE } from './dto'
import { Toasts } from './components/Toasts'
import { SEO } from './components/SEO'

// Lazy-loaded chunks to reduce initial JS on the menu route
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage'))
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'))
const RegisterPage = React.lazy(() => import('./pages/RegisterPage'))
const ManagePage = React.lazy(() => import('./pages/ManagePage'))
const Timeline = React.lazy(() => import('./components/Timeline').then(m => ({ default: m.Timeline })))
const PersonPanel = React.lazy(() => import('./components/PersonPanel').then(m => ({ default: m.PersonPanel })))
const Tooltips = React.lazy(() => import('./components/Tooltips').then(m => ({ default: m.Tooltips })))
const AppHeader = React.lazy(() => import('./components/AppHeader').then(m => ({ default: m.AppHeader })))

function AppInner() {
  // auth state not needed here since forms removed from menu
  const navigate = useNavigate();
  const location = useLocation();
  const isMenu = location.pathname === '/' || location.pathname === '/menu';
  const isTimeline = location.pathname === '/timeline';
  const { isAuthenticated, user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeAchievementMarker, setActiveAchievementMarker] = useState<{ personId: string; index: number } | null>(null)
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null)
  const [showControls, setShowControls] = useState(true)

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
  
  // Disable global persons fetch when a specific list is selected
  const [selectedListId, setSelectedListId] = useState<number | null>(null)
  const [selectedListKey, setSelectedListKey] = useState<string>('')
  const { persons, allCategories, allCountries, isLoading } = useTimelineData(filters, isTimeline && !selectedListId)

  const { 
    isDraggingSlider, 
    handleSliderMouseDown, 
    handleSliderMouseMove, 
    handleSliderMouseUp 
  } = useSlider()
  
  const { 
    hoveredPerson, 
    mousePosition, 
    showTooltip, 
    hoveredAchievement, 
    achievementTooltipPosition, 
    showAchievementTooltip, 
    hoverTimerRef, 
    handlePersonHover, 
    handleAchievementHover 
  } = useTooltip()







  // Добавляем обработчики событий мыши и touch
  useEffect(() => {
    if (!isDraggingSlider) return

    const handleMouseMove = (e: MouseEvent | TouchEvent) => 
      handleSliderMouseMove(e, yearInputs, applyYearFilter, setYearInputs)
    
    const handleMouseUp = () => handleSliderMouseUp()
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('touchmove', handleMouseMove)
    document.addEventListener('touchend', handleMouseUp)
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('touchmove', handleMouseMove)
      document.removeEventListener('touchend', handleMouseUp)
    }
  }, [isDraggingSlider, handleSliderMouseMove, handleSliderMouseUp, yearInputs, applyYearFilter, setYearInputs])



  // Sidebar lists (user-owned)
  const [personLists, setPersonLists] = useState<Array<{ id: number; title: string; items_count?: number }>>([])
  const listsInFlightRef = useRef(false)
  const lastListsFetchTsRef = useRef(0)
  const loadUserLists = useRef<(force?: boolean) => Promise<void>>(async () => {})
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
  useEffect(() => { loadUserLists.current?.() }, [isAuthenticated, user?.id])

  // Optional list persons (from /timeline?ids=p1,p2 or /timeline?list=ID) — include approved + pending + draft
  const [listPersons, setListPersons] = useState<any[] | null>(null)
  const [sharedListMeta, setSharedListMeta] = useState<{ code: string; title: string; listId?: number } | null>(null)
  useEffect(() => {
    if (!isTimeline) return
    const usp = new URLSearchParams(window.location.search)
    const idsParam = usp.get('ids')
    const shareParam = usp.get('share')
    const listParam = usp.get('list') || shareParam
    const listId = listParam ? Number(listParam) : NaN
    ;(async () => {
      if (shareParam) {
        try {
          const resolved = await resolveListShare(shareParam)
          if (resolved?.owner_user_id && isAuthenticated && user?.id && String(user.id) === resolved.owner_user_id && resolved.list_id) {
            // If shared list is own, open as owned list to enable full interactions
            setSelectedListId(resolved.list_id)
            setListPersons(null)
            setSharedListMeta(null)
            setSelectedListKey(`list:${resolved.list_id}`)
            return
          }
          const items: Array<{ item_type: string; person_id?: string }> = resolved?.items || []
          const ids = items.filter(i => i.item_type === 'person' && i.person_id).map(i => i.person_id!)
          if (ids.length === 0) { setSelectedListId(null); setListPersons([]); return }
          const prsRes = await apiFetch(`/api/persons/lookup/by-ids?ids=${ids.join(',')}`)
          const prsData = await prsRes.json().catch(() => ({ data: [] }))
          const arr = Array.isArray(prsData.data) ? prsData.data : []
          setSelectedListId(null)
          setListPersons(arr)
          setSharedListMeta({ code: shareParam, title: resolved?.title || 'Список', listId: undefined })
          setSelectedListKey(`share:${shareParam}`)
          return
        } catch {
          setSelectedListId(null)
          setListPersons([])
          setSharedListMeta(null)
          setSelectedListKey('')
          return
        }
      }
      if (idsParam && idsParam.trim().length > 0) {
        // Public share by explicit ids (no auth required)
        try {
          const ids = idsParam.split(',').map(s => s.trim()).filter(Boolean)
          if (ids.length === 0) { setListPersons([]); setSelectedListId(null); return }
          const prsRes = await apiFetch(`/api/persons/lookup/by-ids?ids=${ids.join(',')}`)
          const prsData = await prsRes.json().catch(() => ({ data: [] }))
          const arr = Array.isArray(prsData.data) ? prsData.data : []
          setSelectedListId(null)
          setListPersons(arr)
        } catch { setSelectedListId(null); setListPersons([]) }
      } else if (Number.isFinite(listId) && listId > 0) {
        setSelectedListId(listId)
        try {
          // Load list items (auth required)
          const res = await apiFetch(`/api/lists/${listId}/items`)
          const data = await res.json().catch(() => ({ data: [] }))
          const items: Array<{ item_type: string; person_id?: string }> = Array.isArray(data.data) ? data.data : []
          const ids = items.filter(i => i.item_type === 'person' && i.person_id).map(i => i.person_id!)
          if (ids.length === 0) { setListPersons([]); return }
          // Load persons by ids (no approval filter)
          const prsRes = await apiFetch(`/api/persons/lookup/by-ids?ids=${ids.join(',')}`)
          const prsData = await prsRes.json().catch(() => ({ data: [] }))
          const arr = Array.isArray(prsData.data) ? prsData.data : []
          setListPersons(arr)
        } catch { setListPersons([]) }
        setSharedListMeta(null)
        setSelectedListKey(`list:${listId}`)
      } else {
        setSelectedListId(null)
        setListPersons(null)
        setSharedListMeta(null)
        setSelectedListKey('')
      }
    })()
  }, [isTimeline, location.search])
  // When user picks a list from the UI
  useEffect(() => {
    if (!selectedListId) return
    ;(async () => {
      try {
        const res = await apiFetch(`/api/lists/${selectedListId}/items`)
        const data = await res.json().catch(() => ({ data: [] }))
        const items: Array<{ item_type: string; person_id?: string }> = Array.isArray(data.data) ? data.data : []
        const ids = items.filter(i => i.item_type === 'person' && i.person_id).map(i => i.person_id!)
        if (ids.length === 0) { setListPersons([]); return }
        const prsRes = await apiFetch(`/api/persons/lookup/by-ids?ids=${ids.join(',')}`)
        const prsData = await prsRes.json().catch(() => ({ data: [] }))
        const arr = Array.isArray(prsData.data) ? prsData.data : []
        setListPersons(arr)
      } catch { setListPersons([]) }
    })()
  }, [selectedListId])

  const effectivePersons = useMemo(() => (listPersons !== null ? listPersons : persons), [listPersons, persons])
  const sortedData = sortGroupedData(effectivePersons as any, groupingType)

  useEffect(() => {
    if (filters.hideEmptyCenturies && sortedData.length > 0) {
      const effectiveMinYear = Math.min(...sortedData.map(p => p.birthYear));
      const effectiveMaxYear = Math.max(...sortedData.map(p => p.deathYear));
      
      const hasActiveFilters = filters.categories.length > 0 || filters.countries.length > 0;
      
      let newTimeRange = { ...filters.timeRange };
      
      if (hasActiveFilters) {
        newTimeRange = {
          start: Math.max(filters.timeRange.start, effectiveMinYear),
          end: Math.min(filters.timeRange.end, effectiveMaxYear)
        };
      } else {
        newTimeRange = filters.timeRange;
      }
      
      if (newTimeRange.start !== filters.timeRange.start || newTimeRange.end !== filters.timeRange.end) {
        setFilters(prev => ({
          ...prev,
          timeRange: newTimeRange
        }));
        
        setYearInputs({
          start: newTimeRange.start.toString(),
          end: newTimeRange.end.toString()
        });
      }
    }
  }, [filters.hideEmptyCenturies, sortedData, filters.categories, filters.countries, filters.timeRange, setFilters, setYearInputs]);

  useEffect(() => {
    // DTO drift detection (non-blocking)
    (async () => {
      try {
        const v = await getDtoVersion()
        if (v && v !== DTO_VERSION_FE) {
          console.warn(`DTO version mismatch: FE=${DTO_VERSION_FE}, BE=${v}`)
        }
      } catch {}
    })()
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      setIsScrolled(scrollTop > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleCloseAchievementTooltip = () => {
      handleAchievementHover(null, 0, 0);
    };

    const handleClickOutside = (event: Event) => {
      const target = event.target as Element;
      const tooltip = document.getElementById('achievement-tooltip');
      const isClickInsideTooltip = tooltip?.contains(target);
      const isClickOnMarker = target.closest('.achievement-marker');
      
      if (!isClickInsideTooltip && !isClickOnMarker && showAchievementTooltip) {
        if (event.type === 'touchstart') {
          setTimeout(() => {
            handleAchievementHover(null, 0, 0);
          }, 100);
        } else {
          handleAchievementHover(null, 0, 0);
        }
      }
    };

    window.addEventListener('closeAchievementTooltip', handleCloseAchievementTooltip);
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    
    return () => {
      window.removeEventListener('closeAchievementTooltip', handleCloseAchievementTooltip);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [handleAchievementHover, showAchievementTooltip]);

  const { minYear, totalYears, effectiveMinYear, effectiveMaxYear } = useMemo(() => {
    const minYear = Math.min(...sortedData.map(p => p.birthYear), filters.timeRange.start)
    const maxYear = Math.max(...sortedData.map(p => p.deathYear), filters.timeRange.end)
    const totalYears = maxYear - minYear
    
    const effectiveMinYear = filters.hideEmptyCenturies 
      ? Math.min(...sortedData.map(p => p.birthYear))
      : minYear
    const effectiveMaxYear = filters.hideEmptyCenturies 
      ? Math.max(...sortedData.map(p => p.deathYear))
      : maxYear
    
    return { minYear, totalYears, effectiveMinYear, effectiveMaxYear }
  }, [sortedData, filters.timeRange.start, filters.timeRange.end, filters.hideEmptyCenturies])

  const pixelsPerYear = 3
  const LEFT_PADDING_PX = 30
  const timelineWidth = totalYears * pixelsPerYear + LEFT_PADDING_PX

  const {
    timelineRef,
    isDragging,
    isDraggingTimeline,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd
  } = useTimelineDrag({
    timelineWidth,
    containerWidth: window.innerWidth
  })

  const centuryBoundaries = useMemo(() => 
    generateCenturyBoundaries(effectiveMinYear, effectiveMaxYear),
    [effectiveMinYear, effectiveMaxYear]
  )

  const calculateRowPlacement = useCallback((people: Person[]) => {
    const rows: Person[][] = []
    
    if (groupingType === 'none') {
      const allRows: Person[][] = []
      
      people.forEach(person => {
        let placed = false
        
        for (let rowIndex = 0; rowIndex < allRows.length; rowIndex++) {
          const row = allRows[rowIndex]
          let canPlaceInRow = true
          
          for (const existingPerson of row) {
            const BUFFER = 20;
            if (
              person.birthYear - BUFFER <= existingPerson.deathYear &&
              person.deathYear + BUFFER >= existingPerson.birthYear
            ) {
              canPlaceInRow = false
              break
            }
          }
          
          if (canPlaceInRow) {
            allRows[rowIndex].push(person)
            placed = true
            break
          }
        }
        
        if (!placed) {
          allRows.push([person])
        }
      })
      
      return allRows
    }
    
    const groupField = groupingType === 'category' ? 'category' : 'country'
    const allGroups = groupingType === 'category' ? allCategories : allCountries
    const groups: { [key: string]: Person[] } = {}
    
    people.forEach(person => {
      let groupValue: string
      if (groupField === 'country') {
        groupValue = getFirstCountry(person.country)
      } else {
        groupValue = person[groupField]
      }
      
      if (!groups[groupValue]) {
        groups[groupValue] = []
      }
      groups[groupValue].push(person)
    })
    
    allGroups.forEach(groupValue => {
      if (groups[groupValue]) {
        const groupPeople = groups[groupValue]
        const groupRows: Person[][] = []
        
        groupPeople.forEach(person => {
          let placed = false
          
          for (let rowIndex = 0; rowIndex < groupRows.length; rowIndex++) {
            const row = groupRows[rowIndex]
            let canPlaceInRow = true
            
            for (const existingPerson of row) {
              const BUFFER = 20;
              if (
                person.birthYear - BUFFER <= existingPerson.deathYear &&
                person.deathYear + BUFFER >= existingPerson.birthYear
              ) {
                canPlaceInRow = false
                break
              }
            }
            
            if (canPlaceInRow) {
              groupRows[rowIndex].push(person)
              placed = true
              break
            }
          }
          
          if (!placed) {
            groupRows.push([person])
          }
        })
        
        rows.push(...groupRows)
        
        if (groupValue !== allGroups[allGroups.length - 1]) {
          rows.push([])
        }
      }
    })
    
    return rows
  }, [groupingType, allCategories, allCountries])

  const rowPlacement = useMemo(() => 
    calculateRowPlacement(sortedData),
    [calculateRowPlacement, sortedData]
  )

  const totalHeight = useMemo(() => 
    rowPlacement.reduce((height, row) => {
      return height + (row.length === 0 ? 20 : 70)
    }, 0),
    [rowPlacement]
  )

  const ROW_HEIGHT = 60;
  const ROW_MARGIN = 10;
  const EMPTY_ROW_HEIGHT = 20;

  const rowTops = useMemo(() => {
    const tops: number[] = [];
    let acc = 0;
    rowPlacement.forEach(row => {
      tops.push(acc);
      if (row.length === 0) {
        acc += EMPTY_ROW_HEIGHT;
      } else {
        acc += ROW_HEIGHT + ROW_MARGIN;
      }
    });
    return tops;
  }, [rowPlacement]);

  const createCategoryDividers = useCallback(() => {
    if (groupingType === 'none') {
      return [];
    }

    const dividers: { category: string; top: number }[] = [];
    let currentGroup = '';

    rowPlacement.forEach((row, rowIndex) => {
      if (row.length > 0) {
        const firstPersonInRow = row[0];
        let currentGroupValue: string;
        
        if (groupingType === 'category') {
          currentGroupValue = firstPersonInRow.category;
        } else if (groupingType === 'country') {
          currentGroupValue = getFirstCountry(firstPersonInRow.country);
        } else {
          currentGroupValue = firstPersonInRow.category;
        }
        
        if (currentGroupValue !== currentGroup) {
          if (currentGroup !== '') {
            dividers.push({ category: currentGroup, top: rowTops[rowIndex] - 5 });
          }
          currentGroup = currentGroupValue;
        }
      }
    });

    if (currentGroup !== '') {
      dividers.push({ category: currentGroup, top: rowTops[rowPlacement.length - 1] - 5 });
    }

    return dividers;
  }, [groupingType, rowPlacement, rowTops]);

  const categoryDividers = useMemo(() => createCategoryDividers(), [createCategoryDividers]);

  // Обработчик для открытия таймлайна
  const handleOpenTimeline = () => navigate('/timeline')

  // Обработчик для возврата в меню
  const handleBackToMenu = () => navigate('/menu')

  // Рендерим главное меню
  if (isMenu) {
    return (
      <div className="app" id="chrononinja-app" role="main" aria-label="Хронониндзя — Главное меню">
        <MainMenu onOpenTimeline={handleOpenTimeline} />
        {/* Убрали прямые формы с меню – используем dropdown UserMenu */}
      </div>
    )
  }

  // Рендерим таймлайн
  return (
    <div className="app" id="chrononinja-app" role="main" aria-label="Хронониндзя — Интерактивная временная линия исторических личностей">
      <SEO
        title="Хронониндзя — Временная линия исторических личностей"
        description="Исследуйте биографии и достижения исторических личностей на интерактивной линии времени. Фильтры по странам и категориям."
        canonical={typeof window !== 'undefined' ? window.location.origin + '/timeline' : undefined}
        image={typeof window !== 'undefined' ? window.location.origin + '/og-image.jpg' : undefined}
      />
      <React.Suspense fallback={<div className="loading-overlay" role="status" aria-live="polite"><div className="spinner" aria-hidden="true"></div><span>Загрузка...</span></div>}>
        <AppHeader
          isScrolled={isScrolled}
          showControls={showControls}
          setShowControls={setShowControls}
          filters={filters}
          setFilters={setFilters}
          groupingType={groupingType}
          setGroupingType={setGroupingType}
          allCategories={allCategories}
          allCountries={allCountries}
          yearInputs={yearInputs}
          setYearInputs={setYearInputs}
          applyYearFilter={applyYearFilter}
          handleYearKeyPress={handleYearKeyPress}
          resetAllFilters={resetAllFilters}
          getCategoryColor={getGroupColor}
          sortedData={sortedData}
          handleSliderMouseDown={handleSliderMouseDown}
          handleSliderMouseMove={handleSliderMouseMove}
          handleSliderMouseUp={handleSliderMouseUp}
          isDraggingSlider={isDraggingSlider}
          onBackToMenu={handleBackToMenu}
          extraFilterControls={(
            <select
              value={selectedListKey || (selectedListId ? `list:${selectedListId}` : '')}
              onChange={(e) => {
                const v = e.target.value
                if (!v) {
                  setSelectedListId(null)
                  setListPersons(null)
                  setSharedListMeta(null)
                  setSelectedListKey('')
                  const usp = new URLSearchParams(window.location.search)
                  usp.delete('list'); usp.delete('share')
                  window.history.replaceState(null, '', `/timeline${usp.toString() ? `?${usp.toString()}` : ''}`)
                } else {
                  if (v.startsWith('share:')) {
                    const code = v.slice('share:'.length)
                    setSelectedListId(null)
                    setSelectedListKey(v)
                    const usp = new URLSearchParams(window.location.search)
                    usp.set('share', code)
                    usp.delete('list')
                    window.history.replaceState(null, '', `/timeline?${usp.toString()}`)
                  } else if (v.startsWith('list:')) {
                    const id = Number(v.slice('list:'.length))
                    if (Number.isFinite(id) && id > 0) {
                      setSelectedListId(id)
                      setSelectedListKey(`list:${id}`)
                      setSharedListMeta(null)
                      const usp = new URLSearchParams(window.location.search)
                      usp.set('list', String(id))
                      usp.delete('share')
                      window.history.replaceState(null, '', `/timeline?${usp.toString()}`)
                    }
                  }
                }
              }}
              style={{ padding: '4px 8px', minWidth: 160 }}
            >
              <option value="">Все</option>
              {sharedListMeta ? (
                <option value={`share:${sharedListMeta.code}`}>🔒 {sharedListMeta.title}</option>
              ) : null}
              {isAuthenticated ? personLists.map(l => (
                <option key={l.id} value={`list:${l.id}`}>{l.title}</option>
              )) : null}
            </select>
          )}
        />

        <div className="timeline-wrapper">
          <main 
            ref={timelineRef}
            className={`timeline-container ${isDragging ? 'dragging' : ''}`}
            id="timeline-viewport" 
            role="region" 
            aria-label="Область просмотра временной линии"
          >
            {isLoading && (
              <div className="loading-overlay" role="status" aria-live="polite">
                <div className="spinner" aria-hidden="true"></div>
                <span>Загрузка данных...</span>
              </div>
            )}
            <Timeline
              isLoading={false}
              timelineWidth={timelineWidth}
              totalHeight={totalHeight}
              centuryBoundaries={centuryBoundaries}
              minYear={minYear}
              pixelsPerYear={pixelsPerYear}
              LEFT_PADDING_PX={LEFT_PADDING_PX}
              rowPlacement={rowPlacement}
              filters={filters}
              groupingType={groupingType}
              categoryDividers={categoryDividers}
              getGroupColor={getGroupColor}
              getGroupColorDark={getGroupColorDark}
              getGroupColorMuted={getGroupColorMuted}
              getPersonGroup={(person) => getPersonGroup(person, groupingType)}
              hoveredPerson={hoveredPerson}
              setHoveredPerson={(person: Person | null) => {
                if (person) {
                  handlePersonHover(person, mousePosition.x, mousePosition.y);
                } else {
                  handlePersonHover(null, 0, 0);
                }
              }}
              mousePosition={mousePosition}
              setMousePosition={(position: { x: number; y: number }) => {
                if (hoveredPerson) {
                  handlePersonHover(hoveredPerson, position.x, position.y);
                }
              }}
              showTooltip={showTooltip}
              setShowTooltip={(show: boolean) => {
                if (!show && hoveredPerson) {
                  handlePersonHover(null, 0, 0);
                }
              }}
              activeAchievementMarker={activeAchievementMarker}
              setActiveAchievementMarker={setActiveAchievementMarker}
              hoveredAchievement={hoveredAchievement}
              setHoveredAchievement={(achievement: { person: Person; year: number; index: number } | null) => {
                if (achievement) {
                  handleAchievementHover(achievement, achievementTooltipPosition.x, achievementTooltipPosition.y);
                } else {
                  handleAchievementHover(null, 0, 0);
                }
              }}
              achievementTooltipPosition={achievementTooltipPosition}
              setAchievementTooltipPosition={(position: { x: number; y: number }) => {
                if (hoveredAchievement) {
                  handleAchievementHover(hoveredAchievement, position.x, position.y);
                }
              }}
              showAchievementTooltip={showAchievementTooltip}
              setShowAchievementTooltip={(show: boolean) => {
                if (!show && hoveredAchievement) {
                  handleAchievementHover(null, 0, 0);
                }
              }}
              handlePersonHover={handlePersonHover}
              hoverTimerRef={hoverTimerRef}
              sortedData={sortedData}
              selectedPerson={selectedPerson}
              setSelectedPerson={setSelectedPerson}
              timelineRef={timelineRef}
              isDragging={isDragging}
              isDraggingTimeline={isDraggingTimeline}
              handleMouseDown={handleMouseDown}
              handleMouseMove={handleMouseMove}
              handleMouseUp={handleMouseUp}
              handleTouchStart={handleTouchStart}
              handleTouchMove={handleTouchMove}
              handleTouchEnd={handleTouchEnd}
            />
          </main>
        </div>

        <aside className="tooltips-container" id="tooltips-aside" aria-label="Информационные подсказки">
          <Tooltips
            hoveredPerson={hoveredPerson}
            showTooltip={showTooltip}
            mousePosition={mousePosition}
            hoveredAchievement={hoveredAchievement}
            showAchievementTooltip={showAchievementTooltip}
            achievementTooltipPosition={achievementTooltipPosition}
            getGroupColor={getGroupColor}
            getPersonGroup={(person) => getPersonGroup(person, groupingType)}
            getCategoryColor={getGroupColor}
          />
        </aside>

        <PersonPanel
          selectedPerson={selectedPerson}
          onClose={() => setSelectedPerson(null)}
          getGroupColor={getGroupColor}
          getPersonGroup={(person) => getPersonGroup(person, groupingType)}
          getCategoryColor={getGroupColor}
        />
      </React.Suspense>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <React.Suspense fallback={<div className="loading-overlay" role="status" aria-live="polite"><div className="spinner" aria-hidden="true"></div><span>Загрузка...</span></div>}>
          <Routes>
            <Route path="/" element={<Navigate to="/menu" replace />} />
            <Route path="/menu" element={<AppInner />} />
            <Route path="/timeline" element={<AppInner />} />
            <Route path="/lists" element={<ManagePage />} />
            <Route path="/manage" element={<Navigate to="/lists" replace />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          <BackendInfo />
          <Toasts />
        </React.Suspense>
      </ToastProvider>
    </AuthProvider>
  );
}