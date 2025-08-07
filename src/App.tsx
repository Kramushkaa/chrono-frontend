import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Person } from './types'
import { AppHeader } from './components/AppHeader'
import { Timeline } from './components/Timeline'
import { Tooltips } from './components/Tooltips'
import { MobilePersonPanel } from './components/MobilePersonPanel'
import { MainMenu } from './components/MainMenu'
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

function App() {
  const [currentPage, setCurrentPage] = useState<'menu' | 'timeline'>('menu')
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
  
  const { persons, allCategories, allCountries, isLoading } = useTimelineData(filters)

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



  const sortedData = sortGroupedData(persons, groupingType)

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
  const handleOpenTimeline = () => {
    setCurrentPage('timeline')
  }

  // Обработчик для возврата в меню
  const handleBackToMenu = () => {
    setCurrentPage('menu')
  }

  // Рендерим главное меню
  if (currentPage === 'menu') {
    return (
      <div className="app" id="chrononinja-app" role="main" aria-label="Chrono Ninja - Главное меню">
        <MainMenu onOpenTimeline={handleOpenTimeline} />
      </div>
    )
  }

  // Рендерим таймлайн
  return (
    <div className="app" id="chrononinja-app" role="main" aria-label="Chrono Ninja - Интерактивная временная линия исторических личностей">
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
          setHoveredPerson={(person) => {
            if (person) {
              handlePersonHover(person, mousePosition.x, mousePosition.y);
            } else {
              handlePersonHover(null, 0, 0);
            }
          }}
          mousePosition={mousePosition}
          setMousePosition={(position) => {
            if (hoveredPerson) {
              handlePersonHover(hoveredPerson, position.x, position.y);
            }
          }}
          showTooltip={showTooltip}
          setShowTooltip={(show) => {
            if (!show && hoveredPerson) {
              handlePersonHover(null, 0, 0);
            }
          }}
          activeAchievementMarker={activeAchievementMarker}
          setActiveAchievementMarker={setActiveAchievementMarker}
          hoveredAchievement={hoveredAchievement}
          setHoveredAchievement={(achievement) => {
            if (achievement) {
              handleAchievementHover(achievement, achievementTooltipPosition.x, achievementTooltipPosition.y);
            } else {
              handleAchievementHover(null, 0, 0);
            }
          }}
          achievementTooltipPosition={achievementTooltipPosition}
          setAchievementTooltipPosition={(position) => {
            if (hoveredAchievement) {
              handleAchievementHover(hoveredAchievement, position.x, position.y);
            }
          }}
          showAchievementTooltip={showAchievementTooltip}
          setShowAchievementTooltip={(show) => {
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
      
      <MobilePersonPanel
        selectedPerson={selectedPerson}
        onClose={() => setSelectedPerson(null)}
        getGroupColor={getGroupColor}
        getPersonGroup={(person) => getPersonGroup(person, groupingType)}
        getCategoryColor={getGroupColor}
      />
    </div>
  )
}

export default App 