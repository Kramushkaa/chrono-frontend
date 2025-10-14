import React, { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from 'shared/context/AuthContext'
import { useFilters } from '../../../shared/hooks/useFilters'
import { useTimelineData } from 'features/timeline/hooks/useTimelineData'
import { useTimelineBounds } from 'features/timeline/hooks/useTimelineBounds'
import { useSlider } from '../../../shared/hooks/useSlider'
import { useTooltip } from 'features/timeline/hooks/useTooltip'
import { useTimelineDrag } from 'features/timeline/hooks/useTimelineDrag'
import { generateCenturyBoundaries } from 'features/timeline/utils/timelineUtils'
import { calculateRowPlacement } from 'features/timeline/utils/rowPlacement'
import { useCategoryDividers } from 'features/timeline/hooks/useCategoryDividers'
import { getGroupColor, getGroupColorDark, getGroupColorMuted, getPersonGroup, sortGroupedData } from 'features/persons/utils/groupingUtils'
import { useListSelection } from 'features/timeline/hooks/useListSelection'
import { useLists } from 'features/manage/hooks/useLists'
import { apiData } from 'shared/api/api'
import { TimelineHeader } from 'shared/layout/headers/TimelineHeader'
import { SEO } from 'shared/ui/SEO'
import type { Person } from 'shared/types'
import '../styles/timeline.css'

const Timeline = React.lazy(() => import('features/timeline/components/Timeline').then(m => ({ default: m.Timeline })))
const Tooltips = React.lazy(() => import('features/timeline/components/Tooltips').then(m => ({ default: m.Tooltips })))
const PersonPanel = React.lazy(() => import('features/persons/components/PersonPanel').then(m => ({ default: m.PersonPanel })))

export default function TimelinePage() {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth();

  const [isScrolled, setIsScrolled] = useState(false)
  const [activeAchievementMarker, setActiveAchievementMarker] = useState<{ personId: string; index: number } | null>(null)
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null)
  const [showControls, setShowControls] = useState(false)

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

  const { personLists } = useLists({ isAuthenticated, userId: user?.id ? String(user.id) : null, apiData })
  const {
    selectedListId,
    selectedListKey,
    listPersons,
    sharedListMeta,
    handleListChange
  } = useListSelection(true, isAuthenticated, user?.id ? String(user.id) : null)

  const { persons, allCategories, allCountries, isLoading } = useTimelineData(filters, true)

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
    showAchievementTooltip,
    hoverTimerRef,
    handlePersonHover,
    handleAchievementHover
  } = useTooltip()

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      setIsScrolled(scrollTop > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const effectivePersons = useMemo(() => (listPersons !== null ? listPersons : persons), [listPersons, persons])
  const sortedData = sortGroupedData(effectivePersons, groupingType)

  useEffect(() => {
    if (filters.hideEmptyCenturies && sortedData.length > 0) {
      const effectiveMinYear = Math.min(...sortedData.map(p => p.birthYear));
      const effectiveMaxYear = Math.max(...sortedData.map(p => p.deathYear ?? new Date().getFullYear()));

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

  // Calculate timeline bounds using optimized hook
  const { minYear, totalYears, effectiveMinYear, effectiveMaxYear } = useTimelineBounds(
    sortedData,
    filters.timeRange,
    filters.hideEmptyCenturies
  )

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

  // Calculate row placement using optimized utility
  const rowPlacement = useMemo(
    () => calculateRowPlacement(sortedData, groupingType, allCategories, allCountries),
    [sortedData, groupingType, allCategories, allCountries]
  )

  const totalHeight = useMemo(() =>
    rowPlacement.reduce((height, row) => {
      return height + (row.length === 0 ? 20 : 70)
    }, 0),
    [rowPlacement]
  )

  // Lock body scroll while timeline is mounted
  useEffect(() => {
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [])

  // Calculate category dividers using optimized hook
  const categoryDividers = useCategoryDividers(rowPlacement, groupingType)

  return (
    <div className="app" id="chrononinja-app" role="main" aria-label="Хронониндзя — Интерактивная временная линия исторических личностей">
      <SEO
        title="Хронониндзя — Временная линия исторических личностей"
        description="Исследуйте биографии и достижения исторических личностей на интерактивной линии времени. Фильтры по странам и категориям."
        canonical={typeof window !== 'undefined' ? window.location.origin + '/timeline' : undefined}
        image={typeof window !== 'undefined' ? window.location.origin + '/og-image.jpg' : undefined}
      />
             <React.Suspense fallback={<div className="loading-overlay" role="status" aria-live="polite"><div className="spinner" aria-hidden="true"></div><span>Загрузка...</span></div>}>
               <TimelineHeader
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
                 onBackToMenu={() => navigate('/menu')}
                 isAuthenticated={isAuthenticated}
                 personLists={personLists}
                 selectedListId={selectedListId}
                 selectedListKey={selectedListKey}
                 sharedListMeta={sharedListMeta}
                 onListChange={handleListChange}
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
                  handleAchievementHover(achievement, mousePosition.x, mousePosition.y);
                } else {
                  handleAchievementHover(null, 0, 0);
                }
              }}
              showAchievementTooltip={showAchievementTooltip}
              setShowAchievementTooltip={(show: boolean) => {
                if (!show && hoveredAchievement) {
                  handleAchievementHover(null, 0, 0);
                }
              }}
              handlePersonHover={handlePersonHover}
              handleAchievementHover={handleAchievementHover}
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


