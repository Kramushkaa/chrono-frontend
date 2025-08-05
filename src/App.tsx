import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Person } from './types'
import { getCategoryColor, getCategoryColorDark, getCategoryColorMuted } from './utils/categoryColors'
import { AppHeader } from './components/AppHeader'
import { Timeline } from './components/Timeline'
import { Tooltips } from './components/Tooltips'
import { MobilePersonPanel } from './components/MobilePersonPanel'
import { useTimelineData } from './hooks/useTimelineData'
import { 
  generateCenturyBoundaries,
  getFirstCountry
} from './utils/timelineUtils'
import './App.css'

function App() {
  const [hoveredPerson, setHoveredPerson] = useState<Person | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [showTooltip, setShowTooltip] = useState(false)
  const [hoveredAchievement, setHoveredAchievement] = useState<{ person: Person; year: number; index: number } | null>(null)
  const [achievementTooltipPosition, setAchievementTooltipPosition] = useState({ x: 0, y: 0 })
  const [showAchievementTooltip, setShowAchievementTooltip] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeAchievementMarker, setActiveAchievementMarker] = useState<{ personId: string; index: number } | null>(null)
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null)
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null)
  const [showControls, setShowControls] = useState(true)
  const [filters, setFilters] = useState(() => {
    const savedFilters = localStorage.getItem('chrononinja-filters');
    if (savedFilters) {
      const parsed = JSON.parse(savedFilters);
      return {
        categories: parsed.categories || [],
        countries: parsed.countries || [],
        timeRange: parsed.timeRange || { start: -800, end: 2000 },
        showAchievements: parsed.showAchievements !== undefined ? parsed.showAchievements : true,
        hideEmptyCenturies: parsed.hideEmptyCenturies !== undefined ? parsed.hideEmptyCenturies : false
      };
    }
    return {
      categories: [] as string[],
      countries: [] as string[],
      timeRange: { start: -800, end: 2000 },
      showAchievements: true,
      hideEmptyCenturies: false
    };
  })

  // Состояние для типа группировки
  const [groupingType, setGroupingType] = useState<'category' | 'country' | 'none'>(() => {
    const savedGrouping = localStorage.getItem('chrononinja-grouping');
    return savedGrouping as 'category' | 'country' | 'none' || 'category';
  })

  // Сохраняем фильтры в localStorage при изменении
  useEffect(() => {
    localStorage.setItem('chrononinja-filters', JSON.stringify(filters));
  }, [filters]);

  // Сохраняем тип группировки в localStorage при изменении
  useEffect(() => {
    localStorage.setItem('chrononinja-grouping', groupingType);
  }, [groupingType]);

  // Очищаем таймер при размонтировании компонента
  useEffect(() => {
    return () => {
      const timer = hoverTimerRef.current;
      if (timer) {
        clearTimeout(timer);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Используем кастомный хук для загрузки данных
  const { persons, allCategories, allCountries, isLoading } = useTimelineData(filters)

  // Состояние для полей ввода годов
  const [yearInputs, setYearInputs] = useState({
    start: filters.timeRange.start.toString(),
    end: filters.timeRange.end.toString()
  })

  // Состояния для интерактивной полоски диапазона
  const [isDraggingSlider, setIsDraggingSlider] = useState(false)
  const [draggedHandle, setDraggedHandle] = useState<'start' | 'end' | null>(null)
  const [sliderRect, setSliderRect] = useState<DOMRect | null>(null)



  // Функция для применения фильтра по году
  const applyYearFilter = useCallback((field: 'start' | 'end', value: string) => {
    const parsed = parseInt(value);
    const numValue = isNaN(parsed) ? (field === 'start' ? -800 : 2000) : parsed;
    setFilters(prev => ({
      ...prev,
      timeRange: { ...prev.timeRange, [field]: numValue }
    }))
  }, [])

  // Функция для обработки нажатия Enter
  const handleYearKeyPress = (field: 'start' | 'end', e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      applyYearFilter(field, e.currentTarget.value)
      // Переводим фокус на следующий элемент
      const inputs = e.currentTarget.parentElement?.parentElement?.querySelectorAll('input')
      if (inputs) {
        const currentIndex = Array.from(inputs).indexOf(e.currentTarget)
        const nextInput = inputs[currentIndex + 1] as HTMLInputElement
        if (nextInput) {
          nextInput.focus()
        }
      }
    }
  }

  // Функции для интерактивной полоски диапазона
  const handleSliderMouseDown = (e: React.MouseEvent | React.TouchEvent, handle: 'start' | 'end') => {
    e.preventDefault()
    setIsDraggingSlider(true)
    setDraggedHandle(handle)
    const sliderElement = e.currentTarget.parentElement?.parentElement
    if (sliderElement) {
      setSliderRect(sliderElement.getBoundingClientRect())
    }
  }

  const handleSliderMouseMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDraggingSlider || !draggedHandle || !sliderRect) return

    const rect = sliderRect
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const x = clientX - rect.left
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))
    
    // Преобразуем процент в год (от -800 до 2000)
    const totalRange = 2800 // 2000 - (-800)
    const year = Math.round(-800 + (percentage / 100) * totalRange)
    
    // Ограничиваем значения
    const startYear = parseYearValue(yearInputs.start, -800)
    const endYear = parseYearValue(yearInputs.end, 2000)
    
    let newYear = year
    if (draggedHandle === 'start') {
      newYear = Math.max(-800, Math.min(endYear - 100, year))
      setYearInputs(prev => ({ ...prev, start: newYear.toString() }))
      applyYearFilter('start', newYear.toString())
    } else {
      newYear = Math.max(startYear + 100, Math.min(2000, year))
      setYearInputs(prev => ({ ...prev, end: newYear.toString() }))
      applyYearFilter('end', newYear.toString())
    }
  }, [isDraggingSlider, draggedHandle, sliderRect, yearInputs, applyYearFilter])

  const handleSliderMouseUp = useCallback(() => {
    setIsDraggingSlider(false)
    setDraggedHandle(null)
    setSliderRect(null)
  }, [])

  const parseYearValue = (value: string, defaultValue: number): number => {
    const parsed = parseInt(value)
    return isNaN(parsed) ? defaultValue : parsed
  }

  // Добавляем обработчики событий мыши и touch
  useEffect(() => {
    if (isDraggingSlider) {
      document.addEventListener('mousemove', handleSliderMouseMove)
      document.addEventListener('mouseup', handleSliderMouseUp)
      document.addEventListener('touchmove', handleSliderMouseMove)
      document.addEventListener('touchend', handleSliderMouseUp)
      
      return () => {
        document.removeEventListener('mousemove', handleSliderMouseMove)
        document.removeEventListener('mouseup', handleSliderMouseUp)
        document.removeEventListener('touchmove', handleSliderMouseMove)
        document.removeEventListener('touchend', handleSliderMouseUp)
      }
    }
  }, [isDraggingSlider, handleSliderMouseMove, handleSliderMouseUp])

  // Функция для сброса всех фильтров
  const resetAllFilters = () => {
    setFilters({
      categories: [],
      countries: [],
      timeRange: { start: -800, end: 2000 },
      showAchievements: true,
      hideEmptyCenturies: false
    })
    setYearInputs({
      start: '-800',
      end: '2000'
    })
  }

    // Функция для получения приоритета категории
  const getCategoryPriority = (category: string) => {
    return allCategories.indexOf(category)
  }

  // Функция для получения цвета группы в зависимости от типа группировки
  const getGroupColor = (groupName: string) => {
    if (groupingType === 'category') {
      return getCategoryColor(groupName)
    } else if (groupingType === 'country') {
      // Для стран используем другой набор цветов
      const countryColors = [
        '#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6',
        '#1abc9c', '#e67e22', '#34495e', '#16a085', '#8e44ad',
        '#27ae60', '#2980b9', '#f1c40f', '#e74c3c', '#95a5a6'
      ]
      const index = allCountries.indexOf(groupName)
      return countryColors[index % countryColors.length]
    }
    return '#95a5a6' // серый цвет по умолчанию
  }

  // Функция для получения цвета группы (темный вариант)
  const getGroupColorDark = (groupName: string) => {
    if (groupingType === 'category') {
      return getCategoryColorDark(groupName)
    } else if (groupingType === 'country') {
      // Для стран используем темные варианты цветов
      const countryColorsDark = [
        '#c0392b', '#2980b9', '#27ae60', '#d68910', '#8e44ad',
        '#16a085', '#d35400', '#2c3e50', '#138d75', '#7d3c98',
        '#229954', '#1f618d', '#d4ac0f', '#c0392b', '#7f8c8d'
      ]
      const index = allCountries.indexOf(groupName)
      return countryColorsDark[index % countryColorsDark.length]
    }
    return '#7f8c8d' // темно-серый цвет по умолчанию
  }

  // Функция для получения цвета группы (приглушенный вариант)
  const getGroupColorMuted = (groupName: string) => {
    if (groupingType === 'category') {
      return getCategoryColorMuted(groupName)
    } else if (groupingType === 'country') {
      // Для стран используем приглушенные варианты цветов
      const countryColorsMuted = [
        '#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6',
        '#1abc9c', '#e67e22', '#34495e', '#16a085', '#8e44ad',
        '#27ae60', '#2980b9', '#f1c40f', '#e74c3c', '#95a5a6'
      ]
      const index = allCountries.indexOf(groupName)
      return countryColorsMuted[index % countryColorsMuted.length]
    }
    return '#95a5a6' // серый цвет по умолчанию
  }

  // Функция для получения значения группы для персонажа
  const getPersonGroup = (person: Person) => {
    if (groupingType === 'category') {
      return person.category
    } else if (groupingType === 'country') {
      return getFirstCountry(person.country)
    }
    return person.category // по умолчанию
  }

  // Функция фильтрации данных (теперь данные фильтруются на бэкенде, но сортировка остается)
  const sortedData = [...persons].sort((a, b) => {
    if (groupingType === 'category') {
      // Сначала сортируем по категориям
      const categoryDiff = getCategoryPriority(a.category) - getCategoryPriority(b.category)
      if (categoryDiff !== 0) {
        return categoryDiff
      }
    } else if (groupingType === 'country') {
      // Сначала сортируем по странам (берем первую страну из списка)
      const countryDiff = allCountries.indexOf(getFirstCountry(a.country)) - allCountries.indexOf(getFirstCountry(b.country))
      if (countryDiff !== 0) {
        return countryDiff
      }
    }
    // Затем по году рождения
    return a.birthYear - b.birthYear
  })

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
  }, [filters.hideEmptyCenturies, sortedData, filters.categories, filters.countries, filters.timeRange]);

  // Отслеживаем скролл
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      setIsScrolled(scrollTop > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Вычисляем реальный диапазон лет из отфильтрованных данных
  const minYear = Math.min(...sortedData.map(p => p.birthYear), filters.timeRange.start)
  const maxYear = Math.max(...sortedData.map(p => p.deathYear), filters.timeRange.end)
  const totalYears = maxYear - minYear

  // Настройки масштаба
  const pixelsPerYear = 3 // 3 пикселя на год
  const LEFT_PADDING_PX = 30 // отступ слева, чтобы крайняя левая подпись не упиралась в край
  const timelineWidth = totalYears * pixelsPerYear + LEFT_PADDING_PX

  // Генерируем границы веков
  // Если включена настройка скрытия пустых веков, используем только отфильтрованные данные
  const effectiveMinYear = filters.hideEmptyCenturies 
    ? Math.min(...sortedData.map(p => p.birthYear))
    : minYear
  const effectiveMaxYear = filters.hideEmptyCenturies 
    ? Math.max(...sortedData.map(p => p.deathYear))
    : maxYear
  
  const centuryBoundaries = generateCenturyBoundaries(effectiveMinYear, effectiveMaxYear)

  // Алгоритм размещения полосок на строках с полной группировкой по категориям
  const calculateRowPlacement = (people: Person[]) => {
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
  }

  // Получаем размещение по строкам
  const rowPlacement = calculateRowPlacement(sortedData)

  // Вычисляем общую высоту с учетом пустых строк
  const totalHeight = rowPlacement.reduce((height, row) => {
    return height + (row.length === 0 ? 20 : 70) // 20px для пустых строк, 70px для обычных (60px + 10px margin)
  }, 0)

  // Функция для создания разделителей категорий
    // Высота строки и отступ вниз для непустой строки
  const ROW_HEIGHT = 60;
  const ROW_MARGIN = 10; // margin-bottom, используется только для непустых строк
  const EMPTY_ROW_HEIGHT = 20;

  // Подсчитываем абсолютный top каждой строки, чтобы точно позиционировать разделители
  const rowTops: number[] = [];
  (() => {
    let acc = 0;
    rowPlacement.forEach(row => {
      rowTops.push(acc);
      if (row.length === 0) {
        acc += EMPTY_ROW_HEIGHT;
      } else {
        acc += ROW_HEIGHT + ROW_MARGIN;
      }
    });
  })();

  const createCategoryDividers = () => {
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
  };

  const categoryDividers = createCategoryDividers();

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
        getCategoryColor={getCategoryColor}
        sortedData={sortedData}
        handleSliderMouseDown={handleSliderMouseDown}
        isDraggingSlider={isDraggingSlider}
      />
      
      <div className="timeline-wrapper">
        <main className="timeline-container" id="timeline-viewport" role="region" aria-label="Область просмотра временной линии">
          <Timeline
          isLoading={isLoading}
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
          getPersonGroup={getPersonGroup}
          hoveredPerson={hoveredPerson}
          setHoveredPerson={setHoveredPerson}
          mousePosition={mousePosition}
          setMousePosition={setMousePosition}
          showTooltip={showTooltip}
          setShowTooltip={setShowTooltip}
          activeAchievementMarker={activeAchievementMarker}
          setActiveAchievementMarker={setActiveAchievementMarker}
          hoveredAchievement={hoveredAchievement}
          setHoveredAchievement={setHoveredAchievement}
          achievementTooltipPosition={achievementTooltipPosition}
          setAchievementTooltipPosition={setAchievementTooltipPosition}
          showAchievementTooltip={showAchievementTooltip}
          setShowAchievementTooltip={setShowAchievementTooltip}
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
          getPersonGroup={getPersonGroup}
          getCategoryColor={getCategoryColor}
        />
      </aside>
      
      {/* Мобильная панель с информацией о человеке */}
      <MobilePersonPanel
        selectedPerson={selectedPerson}
        onClose={() => setSelectedPerson(null)}
        getGroupColor={getGroupColor}
        getPersonGroup={getPersonGroup}
        getCategoryColor={getCategoryColor}
      />
    </div>
  )
}

export default App 