import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
// import { ProtectedRoute } from '@shared/ui/ProtectedRoute'
import { Person } from 'shared/types'
import { MainMenu } from 'shared/ui/MainMenu'
import { AuthProvider } from 'shared/context/AuthContext'
// removed inline auth forms from menu; keep imports minimal
import { BackendInfo } from 'shared/ui/BackendInfo'
import { useTimelineData } from 'features/timeline/hooks/useTimelineData'
import { useFilters } from './hooks/useFilters'
import { useSlider } from './hooks/useSlider'
import { useTooltip } from 'features/timeline/hooks/useTooltip'
import { useTimelineDrag } from 'features/timeline/hooks/useTimelineDrag'
import { 
  generateCenturyBoundaries,
  getFirstCountry
} from 'features/timeline/utils/timelineUtils'
import { 
  getGroupColor, 
  getGroupColorDark, 
  getGroupColorMuted, 
  getPersonGroup,
  sortGroupedData
} from 'features/persons/utils/groupingUtils'
import './App.css'
import { ToastProvider } from 'shared/context/ToastContext'
import { useToast } from 'shared/context/ToastContext'
import { apiData } from 'shared/api/api'
import { useLists } from 'features/manage/hooks/useLists'
import { useAuth } from 'shared/context/AuthContext'
import { DTO_VERSION as DTO_VERSION_FE } from './dto'
import { Toasts } from 'shared/ui/Toasts'
import { SEO } from 'shared/ui/SEO'
import { useDtoVersionWarning } from './hooks/useDtoVersionWarning'
import { useUnauthorizedToast } from './hooks/useUnauthorizedToast'
import { useAchievementTooltipDismiss } from './hooks/useAchievementTooltipDismiss'
import { useListSelection } from 'features/timeline/hooks/useListSelection'
import { TimelineHeaderContainer } from 'features/timeline/containers/TimelineHeaderContainer'

// Lazy-loaded chunks to reduce initial JS on the menu route
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage'))
const MenuPage = React.lazy(() => import('./pages/MenuPage'))
const ProfilePage = React.lazy(() => import('features/auth/pages/ProfilePage'))
const RegisterPage = React.lazy(() => import('features/auth/pages/RegisterPage'))
const ManagePage = React.lazy(() => import('features/manage/pages/ManagePage'))
const QuizPage = React.lazy(() => import('features/quiz/pages/QuizPage').then(m => ({ default: m.default })))
const TimelinePage = React.lazy(() => import('pages/TimelinePage').then(m => ({ default: m.default })))
const AppHeader = React.lazy(() => import('shared/layout/AppHeader').then(m => ({ default: m.AppHeader })))

function AppInner() {
  // auth state not needed here since forms removed from menu
  const navigate = useNavigate();
  const location = useLocation();
  const isMenu = location.pathname === '/' || location.pathname === '/menu';
  const isTimeline = location.pathname === '/timeline';
  const { isAuthenticated, user } = useAuth();
  const { showToast } = useToast();
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
  const { persons, allCategories, allCountries, isLoading } = useTimelineData(filters, isTimeline)

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



  // Sidebar lists (user-owned) — reuse shared hook
  const { personLists } = useLists({ isAuthenticated, userId: user?.id ? String(user.id) : null, apiData })
  // Centralized list selection management
  const {
    selectedListId,
    selectedListKey,
    listPersons,
    sharedListMeta,
    setSelectedListId,
    handleListChange
  } = useListSelection(isTimeline, isAuthenticated, user?.id ? String(user.id) : null)

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
        setFilters((prev: any) => ({
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
    // Yandex.Metrika SPA hits
    try {
      // @ts-ignore
      if (typeof window !== 'undefined' && typeof (window as any).ym === 'function') {
        const url = window.location.pathname + window.location.search + window.location.hash
        // @ts-ignore
        ;(window as any).ym(103755343, 'hit', url)
      }
    } catch {}
  }, [location.pathname, location.search, location.hash])

  useDtoVersionWarning(DTO_VERSION_FE)
  useUnauthorizedToast()
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      setIsScrolled(scrollTop > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useAchievementTooltipDismiss(showAchievementTooltip, handleAchievementHover)

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
    return <MenuPage />
  }

  // Рендерим таймлайн
  return (
    <TimelinePage />
  )
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <React.Suspense fallback={<div className="loading-overlay" role="status" aria-live="polite"><div className="spinner" aria-hidden="true"></div><span>Загрузка...</span></div>}>
          <Routes>
            <Route path="/" element={<Navigate to="/timeline" replace />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/timeline" element={<TimelinePage />} />
            <Route path="/quiz" element={<QuizPage />} />
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