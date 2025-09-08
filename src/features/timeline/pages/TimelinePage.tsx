import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { useAuth } from 'shared/context/AuthContext'
import { useFilters } from '../../../shared/hooks/useFilters'
import { useTimelineData } from 'features/timeline/hooks/useTimelineData'
import { useSlider } from '../../../shared/hooks/useSlider'
import { useTooltip } from 'features/timeline/hooks/useTooltip'
import { useTimelineDrag } from 'features/timeline/hooks/useTimelineDrag'
import { generateCenturyBoundaries } from 'features/timeline/utils/timelineUtils'
import { getFirstCountry } from 'features/persons/utils/getFirstCountry'
import { getGroupColor, getGroupColorDark, getGroupColorMuted, getPersonGroup, sortGroupedData } from 'features/persons/utils/groupingUtils'
import { useListSelection } from 'features/timeline/hooks/useListSelection'
import { useLists } from 'features/manage/hooks/useLists'
import { apiData } from 'shared/api/api'
import { TimelineHeaderContainer } from 'features/timeline/containers/TimelineHeaderContainer'
import { SEO } from 'shared/ui/SEO'
import { Person } from 'shared/types'

const Timeline = React.lazy(() => import('features/timeline/components/Timeline').then(m => ({ default: m.Timeline })))
const Tooltips = React.lazy(() => import('features/timeline/components/Tooltips').then(m => ({ default: m.Tooltips })))
const PersonPanel = React.lazy(() => import('features/persons/components/PersonPanel').then(m => ({ default: m.PersonPanel })))

export default function TimelinePage() {
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
    achievementTooltipPosition,
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

  return (
    <div className="app" id="chrononinja-app" role="main" aria-label="Хронониндзя — Интерактивная временная линия исторических личностей">
      <SEO
        title="Хронониндзя — Временная линия исторических личностей"
        description="Исследуйте биографии и достижения исторических личностей на интерактивной линии времени. Фильтры по странам и категориям."
        canonical={typeof window !== 'undefined' ? window.location.origin + '/timeline' : undefined}
        image={typeof window !== 'undefined' ? window.location.origin + '/og-image.jpg' : undefined}
      />
      <React.Suspense fallback={<div className="loading-overlay" role="status" aria-live="polite"><div className="spinner" aria-hidden="true"></div><span>Загрузка...</span></div>}>
        <TimelineHeaderContainer
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
          onBackToMenu={() => window.history.replaceState(null, '', '/menu')}
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
              categoryDividers={[]}
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


