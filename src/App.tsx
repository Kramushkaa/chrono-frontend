import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Person } from './types'
import { AppHeader } from './components/AppHeader'
import { Timeline } from './components/Timeline'
import { Tooltips } from './components/Tooltips'
import { MobilePersonPanel } from './components/MobilePersonPanel'
import { useTimelineData } from './hooks/useTimelineData'
import { useFilters } from './hooks/useFilters'
import { useSlider } from './hooks/useSlider'
import { useTooltip } from './hooks/useTooltip'
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
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeAchievementMarker, setActiveAchievementMarker] = useState<{ personId: string; index: number } | null>(null)
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null)
  const [showControls, setShowControls] = useState(true)

  // Используем кастомные хуки
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
    if (isDraggingSlider) {
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
    }
  }, [isDraggingSlider, handleSliderMouseMove, handleSliderMouseUp, yearInputs, applyYearFilter, setYearInputs, setFilters])



  // Функция фильтрации данных (теперь данные фильтруются на бэкенде, но сортировка остается)
  const sortedData = sortGroupedData(persons, groupingType)

  // Автоматически обновляем диапазон дат при изменении настройки скрытия пустых веков
  useEffect(() => {
    if (filters.hideEmptyCenturies && sortedData.length > 0) {
      // Вычисляем эффективный диапазон на основе отфильтрованных данных
      const effectiveMinYear = Math.min(...sortedData.map(p => p.birthYear));
      const effectiveMaxYear = Math.max(...sortedData.map(p => p.deathYear));
      
      // Проверяем, есть ли активные фильтры (категории или страны)
      const hasActiveFilters = filters.categories.length > 0 || filters.countries.length > 0;
      
      let newTimeRange = { ...filters.timeRange };
      
      if (hasActiveFilters) {
        // Если есть активные фильтры, сужаем диапазон до отфильтрованных данных
        newTimeRange = {
          start: Math.max(filters.timeRange.start, effectiveMinYear),
          end: Math.min(filters.timeRange.end, effectiveMaxYear)
        };
      } else {
        // Если нет активных фильтров, НЕ сужаем диапазон
        // Пользователь может хотеть видеть данные за пределами текущего диапазона
        newTimeRange = filters.timeRange;
      }
      
      // Обновляем только если диапазон изменился
      if (newTimeRange.start !== filters.timeRange.start || newTimeRange.end !== filters.timeRange.end) {
        setFilters(prev => ({
          ...prev,
          timeRange: newTimeRange
        }));
        
        // Обновляем поля ввода
        setYearInputs({
          start: newTimeRange.start.toString(),
          end: newTimeRange.end.toString()
        });
      }
    }
  }, [filters.hideEmptyCenturies, sortedData, filters.categories, filters.countries, filters.timeRange, setFilters, setYearInputs]);

  // Отслеживаем скролл
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      setIsScrolled(scrollTop > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Обработчик для закрытия achievement tooltip на мобильных
  useEffect(() => {
    const handleCloseAchievementTooltip = () => {
      handleAchievementHover(null, 0, 0);
    };

    const handleClickOutside = (event: Event) => {
      // Проверяем, что клик был вне tooltip'а и вне маркеров достижений
      const target = event.target as Element;
      const tooltip = document.getElementById('achievement-tooltip');
      const isClickInsideTooltip = tooltip?.contains(target);
      const isClickOnMarker = target.closest('.achievement-marker');
      
      // Добавляем небольшую задержку для touch событий, чтобы избежать случайного закрытия
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

  // Мемоизируем вычисления диапазона лет
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

  // Настройки масштаба
  const pixelsPerYear = 3 // 3 пикселя на год
  const LEFT_PADDING_PX = 30 // отступ слева, чтобы крайняя левая подпись не упиралась в край
  const timelineWidth = totalYears * pixelsPerYear + LEFT_PADDING_PX

  // Мемоизируем границы веков
  const centuryBoundaries = useMemo(() => 
    generateCenturyBoundaries(effectiveMinYear, effectiveMaxYear),
    [effectiveMinYear, effectiveMaxYear]
  )

  // Мемоизируем алгоритм размещения полосок на строках
  const calculateRowPlacement = useCallback((people: Person[]) => {
    const rows: Person[][] = []
    
    if (groupingType === 'none') {
      // Без группировки - просто размещаем всех в строки
      const allRows: Person[][] = []
      
      people.forEach(person => {
        let placed = false
        
        // Проверяем каждую существующую строку
        for (let rowIndex = 0; rowIndex < allRows.length; rowIndex++) {
          const row = allRows[rowIndex]
          let canPlaceInRow = true
          
          // Проверяем, не пересекается ли с кем-то в этой строке
          for (const existingPerson of row) {
            const BUFFER = 20; // минимальный зазор между персонами
            if (
              person.birthYear - BUFFER <= existingPerson.deathYear &&
              person.deathYear + BUFFER >= existingPerson.birthYear
            ) {
              canPlaceInRow = false
              break
            }
          }
          
          // Если можно разместить в этой строке
          if (canPlaceInRow) {
            allRows[rowIndex].push(person)
            placed = true
            break
          }
        }
        
        // Если не удалось разместить в существующих строках, создаем новую
        if (!placed) {
          allRows.push([person])
        }
      })
      
      return allRows
    }
    
    // Группировка по категориям или странам
    const groupField = groupingType === 'category' ? 'category' : 'country'
    const allGroups = groupingType === 'category' ? allCategories : allCountries
    const groups: { [key: string]: Person[] } = {}
    
    // Группируем людей по выбранному полю
    people.forEach(person => {
      let groupValue: string
      if (groupField === 'country') {
        // Для стран берем первую из списка, если есть несколько через "/"
        groupValue = getFirstCountry(person.country)
      } else {
        groupValue = person[groupField]
      }
      
      if (!groups[groupValue]) {
        groups[groupValue] = []
      }
      groups[groupValue].push(person)
    })
    
    // Обрабатываем каждую группу в заданном порядке
    allGroups.forEach(groupValue => {
      if (groups[groupValue]) {
        const groupPeople = groups[groupValue]
        const groupRows: Person[][] = []
        
        // Размещаем людей данной группы в отдельные строки
        groupPeople.forEach(person => {
          let placed = false
          
          // Проверяем каждую существующую строку для этой группы
          for (let rowIndex = 0; rowIndex < groupRows.length; rowIndex++) {
            const row = groupRows[rowIndex]
            let canPlaceInRow = true
            
            // Проверяем, не пересекается ли с кем-то в этой строке
            for (const existingPerson of row) {
              const BUFFER = 20; // минимальный зазор между персонами
              if (
                person.birthYear - BUFFER <= existingPerson.deathYear &&
                person.deathYear + BUFFER >= existingPerson.birthYear
              ) {
                canPlaceInRow = false
                break
              }
            }
            
            // Если можно разместить в этой строке
            if (canPlaceInRow) {
              groupRows[rowIndex].push(person)
              placed = true
              break
            }
          }
          
          // Если не удалось разместить в существующих строках, создаем новую
          if (!placed) {
            groupRows.push([person])
          }
        })
        
        // Добавляем строки данной группы к общему списку
        rows.push(...groupRows)
        
        // Добавляем пустую строку для визуального разделения (кроме последней группы)
        if (groupValue !== allGroups[allGroups.length - 1]) {
          rows.push([])
        }
      }
    })
    
    return rows
  }, [groupingType, allCategories, allCountries])

  // Мемоизируем размещение по строкам
  const rowPlacement = useMemo(() => 
    calculateRowPlacement(sortedData),
    [calculateRowPlacement, sortedData]
  )

  // Мемоизируем общую высоту
  const totalHeight = useMemo(() => 
    rowPlacement.reduce((height, row) => {
      return height + (row.length === 0 ? 20 : 70) // 20px для пустых строк, 70px для обычных (60px + 10px margin)
    }, 0),
    [rowPlacement]
  )

  // Функция для создания разделителей категорий
    // Высота строки и отступ вниз для непустой строки
  const ROW_HEIGHT = 60;
  const ROW_MARGIN = 10; // margin-bottom, используется только для непустых строк
  const EMPTY_ROW_HEIGHT = 20;

  // Мемоизируем вычисление позиций строк
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
      return []; // Без группировки нет разделителей
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
          // Для стран берем первую из списка
          currentGroupValue = getFirstCountry(firstPersonInRow.country);
        } else {
          currentGroupValue = firstPersonInRow.category;
        }
        
        if (currentGroupValue !== currentGroup) {
          if (currentGroup !== '') {
            // закрываем предыдущую группу
            dividers.push({ category: currentGroup, top: rowTops[rowIndex] - 5 });
          }
          currentGroup = currentGroupValue;
        }
      }
    });

    // Добавляем разделитель для последней группы
    if (currentGroup !== '') {
      dividers.push({ category: currentGroup, top: rowTops[rowPlacement.length - 1] - 5 });
    }

    return dividers;
  }, [groupingType, rowPlacement, rowTops]);

  const categoryDividers = useMemo(() => createCategoryDividers(), [createCategoryDividers]);

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
      />
      
      <div className="timeline-wrapper">
        {/* Загрузка только для области timeline */}
        {isLoading && (
          <div className="loading-overlay" role="status" aria-live="polite">
            <div className="spinner" aria-hidden="true"></div>
            <span>Загрузка данных...</span>
          </div>
        )}
        
        <main className="timeline-container" id="timeline-viewport" role="region" aria-label="Область просмотра временной линии">
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
              // Используем текущую позицию мыши из состояния
              handlePersonHover(person, mousePosition.x, mousePosition.y);
            } else {
              handlePersonHover(null, 0, 0);
            }
          }}
          mousePosition={mousePosition}
          setMousePosition={(position) => {
            // Обновляем позицию мыши
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
              // Используем текущую позицию мыши из состояния
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
      
      {/* Мобильная панель с информацией о человеке */}
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