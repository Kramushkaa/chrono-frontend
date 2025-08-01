import React, { useState, useEffect, useRef } from 'react'
import { Person } from './types'
import { getPersons, getCategories, getCountries } from './services/api'
import { getCategoryColor, getCategoryColorDark, getCategoryColorMuted } from './utils/categoryColors'
import './App.css'

// Компонент выпадающего фильтра
const FilterDropdown = ({ 
  title, 
  items, 
  selectedItems, 
  onSelectionChange, 
  getItemColor,
  icon
}: {
  title: string
  items: string[]
  selectedItems: string[]
  onSelectionChange: (items: string[]) => void
  getItemColor?: (item: string) => string
  icon?: React.ReactNode
}) => {
  const isActive = selectedItems.length > 0
  
  return (
    <div className="filter-dropdown">
      <button 
        className={`filter-btn ${isActive ? 'active' : ''}`}
        style={{ minWidth: '150px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
      >
        {icon}
        {title} {isActive && `(${selectedItems.length})`}
      </button>
      <div className="filter-dropdown-content">
        <div style={{ padding: '0.5rem', borderBottom: '1px solid rgba(139, 69, 19, 0.3)' }}>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onSelectionChange(items)
            }}
            style={{
              padding: '0.25rem 0.5rem',
              marginRight: '0.5rem',
              background: '#27ae60',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.7rem'
            }}
          >
            Выбрать все
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onSelectionChange([])
            }}
            style={{
              padding: '0.25rem 0.5rem',
              background: '#e74c3c',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.7rem'
            }}
          >
            Снять все
          </button>
        </div>
        {items.map(item => (
          <label key={item} className="filter-checkbox" onClick={(e) => e.stopPropagation()}>
            <input
              type="checkbox"
              checked={selectedItems.includes(item)}
              onChange={(e) => {
                e.stopPropagation()
                if (e.target.checked) {
                  onSelectionChange([...selectedItems, item])
                } else {
                  onSelectionChange(selectedItems.filter(i => i !== item))
                }
              }}
            />
            <span style={{ 
              color: getItemColor ? getItemColor(item) : '#f4e4c1',
              fontWeight: getItemColor ? 'bold' : 'normal'
            }}>
              {item}
            </span>
          </label>
        ))}
      </div>
    </div>
  )
}

// Компонент панели фильтров
const FilterPanel = ({ 
  filters, 
  setFilters, 
  allCategories, 
  allCountries 
}: {
  filters: {
    categories: string[]
    countries: string[]
    timeRange: { start: number; end: number }
    showAchievements: boolean
  }
  setFilters: React.Dispatch<React.SetStateAction<{
    categories: string[]
    countries: string[]
    timeRange: { start: number; end: number }
    showAchievements: boolean
  }>>
  allCategories: string[]
  allCountries: string[]
}) => {
  // Состояние для полей ввода годов
  const [yearInputs, setYearInputs] = useState({
    start: filters.timeRange.start.toString(),
    end: filters.timeRange.end.toString()
  })

  // Функция для применения фильтра по году
  const applyYearFilter = (field: 'start' | 'end', value: string) => {
    const numValue = parseInt(value) || (field === 'start' ? -800 : 2000)
    setFilters(prev => ({
      ...prev,
      timeRange: { ...prev.timeRange, [field]: numValue }
    }))
  }

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

  // Функция для сброса всех фильтров
  const resetAllFilters = () => {
    setFilters({
      categories: [],
      countries: [],
      timeRange: { start: -800, end: 2000 },
      showAchievements: true
    })
    setYearInputs({
      start: '-800',
      end: '2000'
    })
  }

  return (
    <div className="filters-panel" style={{
      background: 'none',
      border: 'none',
      boxShadow: 'none',
      padding: 0,
      display: 'flex',
      gap: '1rem',
      alignItems: 'center',
      flexWrap: 'wrap',
      marginLeft: 'auto',
      zIndex: 10001
    }}>
      <FilterDropdown
        title="Род деятельности"
        items={allCategories}
        selectedItems={filters.categories}
        onSelectionChange={(categories) => setFilters(prev => ({ ...prev, categories }))}
        getItemColor={getCategoryColor}
        icon={
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        }
      />
      <FilterDropdown
        title="Страна происхождения"
        items={allCountries}
        selectedItems={filters.countries}
        onSelectionChange={(countries) => setFilters(prev => ({ ...prev, countries }))}
        icon={
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        }
      />
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <div>
          <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.25rem', color: '#f4e4c1' }}>
            От:
          </label>
          <input
            type="number"
            value={yearInputs.start}
            onChange={(e) => setYearInputs(prev => ({ ...prev, start: e.target.value }))}
            onBlur={(e) => applyYearFilter('start', e.target.value)}
            onKeyPress={(e) => handleYearKeyPress('start', e)}
            style={{
              width: '80px',
              padding: '0.5rem',
              border: '2px solid #8b4513',
              borderRadius: '4px',
              background: 'rgba(44, 24, 16, 0.8)',
              color: '#f4e4c1',
              fontSize: '0.8rem'
            }}
          />
        </div>
        <div>
          <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.25rem', color: '#f4e4c1' }}>
            До:
          </label>
          <input
            type="number"
            value={yearInputs.end}
            onChange={(e) => setYearInputs(prev => ({ ...prev, end: e.target.value }))}
            onBlur={(e) => applyYearFilter('end', e.target.value)}
            onKeyPress={(e) => handleYearKeyPress('end', e)}
            style={{
              width: '80px',
              padding: '0.5rem',
              border: '2px solid #8b4513',
              borderRadius: '4px',
              background: 'rgba(44, 24, 16, 0.8)',
              color: '#f4e4c1',
              fontSize: '0.8rem'
            }}
          />
        </div>
        <button
          onClick={resetAllFilters}
          className="filter-btn"
          style={{ background: 'linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%)', fontSize: '0.8rem', padding: '0.5rem 1rem' }}
        >
          Сбросить
        </button>
        
        {/* Переключатель маркеров достижений */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          padding: '0.5rem',
          borderRadius: '4px',
          background: filters.showAchievements ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)',
          border: `1px solid ${filters.showAchievements ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`,
          transition: 'all 0.2s ease'
        }}>
          <label style={{ 
            fontSize: '0.8rem', 
            color: '#f4e4c1',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer',
            margin: 0
          }}>
            <input
              type="checkbox"
              checked={filters.showAchievements}
              onChange={(e) => setFilters(prev => ({ ...prev, showAchievements: e.target.checked }))}
              style={{ 
                width: '16px', 
                height: '16px',
                cursor: 'pointer',
                accentColor: '#f4e4c1'
              }}
            />
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ opacity: filters.showAchievements ? 1 : 0.5 }}>
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            <span>Маркеры достижений</span>
          </label>
        </div>
      </div>
    </div>
  )
}

function App() {

  const [hoveredPerson, setHoveredPerson] = useState<Person | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [showTooltip, setShowTooltip] = useState(false)
  const [hoveredAchievement, setHoveredAchievement] = useState<{ person: Person; year: number; index: number } | null>(null)
  const [achievementTooltipPosition, setAchievementTooltipPosition] = useState({ x: 0, y: 0 })
  const [showAchievementTooltip, setShowAchievementTooltip] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeAchievementMarker, setActiveAchievementMarker] = useState<{ personId: string; index: number } | null>(null)
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null)
  const [filters, setFilters] = useState(() => {
    const savedFilters = localStorage.getItem('chronoline-filters');
    if (savedFilters) {
      const parsed = JSON.parse(savedFilters);
      return {
        categories: parsed.categories || [],
        countries: parsed.countries || [],
        timeRange: parsed.timeRange || { start: -800, end: 2000 },
        showAchievements: parsed.showAchievements !== undefined ? parsed.showAchievements : true
      };
    }
    return {
      categories: [] as string[],
      countries: [] as string[],
      timeRange: { start: -800, end: 2000 },
      showAchievements: true
    };
  })

  // Сохраняем фильтры в localStorage при изменении
  useEffect(() => {
    localStorage.setItem('chronoline-filters', JSON.stringify(filters));
  }, [filters]);

  // Очищаем таймер при размонтировании компонента
  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
      }
    };
  }, []);
  const [persons, setPersons] = useState<Person[]>([])
  const [allCategories, setAllCategories] = useState<string[]>([])
  const [allCountries, setAllCountries] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true);


  // Единый useEffect для загрузки и фильтрации данных
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Формируем параметры для запроса
        const filtersToApply: any = {};
        if (filters.categories.length > 0) {
          filtersToApply.category = filters.categories.join(',');
        }
        if (filters.countries.length > 0) {
          filtersToApply.country = filters.countries.join(',');
        }
        filtersToApply.startYear = filters.timeRange.start;
        filtersToApply.endYear = filters.timeRange.end;

        // Загружаем персон с учетом фильтров
        const personsData = await getPersons(filtersToApply);
        setPersons(personsData);

        // Загружаем категории и страны только если они еще не загружены
        if (allCategories.length === 0 || allCountries.length === 0) {
          const [categoriesData, countriesData] = await Promise.all([
            getCategories(),
            getCountries()
          ]);
          setAllCategories(categoriesData);
          setAllCountries(countriesData);
        }
      } catch (error) {
        console.error("Ошибка при загрузке данных:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [filters, allCategories.length, allCountries.length]); // Перезагружаем данные при изменении фильтров

    // Функция для получения приоритета категории
  const getCategoryPriority = (category: string) => {
    // Используем все категории из API, а не только жестко заданные
    return allCategories.indexOf(category)
  }

  // Функция фильтрации данных (теперь данные фильтруются на бэкенде, но сортировка остается)
  const sortedData = [...persons].sort((a, b) => {
    // Сначала сортируем по категориям
    const categoryDiff = getCategoryPriority(a.category) - getCategoryPriority(b.category)
    if (categoryDiff !== 0) {
      return categoryDiff
    }
    // Затем по году рождения
    return a.birthYear - b.birthYear
  })

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

  // Функция для вычисления позиции в пикселях
  const getPosition = (year: number) => {
    return LEFT_PADDING_PX + (year - minYear) * pixelsPerYear
  }

  // Функция для вычисления ширины полоски в пикселях
  const getWidth = (birthYear: number, deathYear: number) => {
    return (deathYear - birthYear) * pixelsPerYear
  }

  // Генерируем границы веков
  const generateCenturyBoundaries = () => {
    const boundaries = []
    const startCentury = Math.floor(minYear / 100) * 100
    const endCentury = Math.ceil(maxYear / 100) * 100
    
    for (let year = startCentury; year <= endCentury; year += 100) {
      // Включаем границу, если она попадает в диапазон данных или является границей века
      if (year <= maxYear) {
        boundaries.push(year)
      }
    }
    return boundaries
  }

  const centuryBoundaries = generateCenturyBoundaries()

  // Функция для получения цвета века
  const getCenturyColor = (year: number) => {
    const colors = [
      'rgba(255, 107, 107, 0.1)', // Светло-красный
      'rgba(78, 205, 196, 0.1)', // Светло-голубой
      'rgba(150, 206, 180, 0.1)', // Светло-зеленый
      'rgba(255, 234, 167, 0.1)', // Светло-оранжевый
      'rgba(221, 160, 221, 0.1)', // Светло-фиолетовый
      'rgba(120, 219, 255, 0.1)', // Светло-бирюзовый
      'rgba(255, 255, 229, 0.1)', // Светло-желтый
      'rgba(255, 229, 240, 0.1)', // Светло-розовый
    ]
    
    const centuryIndex = Math.floor((year - minYear) / 100)
    return colors[centuryIndex % colors.length]
  }

  // Функция для конвертации в римские цифры
  const toRomanNumeral = (num: number): string => {
    const romanNumerals = [
      { value: 1000, numeral: 'M' },
      { value: 900, numeral: 'CM' },
      { value: 500, numeral: 'D' },
      { value: 400, numeral: 'CD' },
      { value: 100, numeral: 'C' },
      { value: 90, numeral: 'XC' },
      { value: 50, numeral: 'L' },
      { value: 40, numeral: 'XL' },
      { value: 10, numeral: 'X' },
      { value: 9, numeral: 'IX' },
      { value: 5, numeral: 'V' },
      { value: 4, numeral: 'IV' },
      { value: 1, numeral: 'I' }
    ]

    let result = ''
    let remaining = Math.abs(num)

    for (const { value, numeral } of romanNumerals) {
      while (remaining >= value) {
        result += numeral
        remaining -= value
      }
    }

    return num < 0 ? `-${result}` : result
  }

  // Функция для получения номера века
  const getCenturyNumber = (year: number): number => {
    if (year < 0) {
      // Для отрицательных лет: -1 до -100 = 1 век до н.э., -101 до -200 = 2 век до н.э.
      return Math.floor((Math.abs(year) - 1) / 100) + 1
    } else if (year === 0) {
      // Год 0 не существует в исторической хронологии
      return 1
    } else {
      // Для положительных лет: 1-100 = 1 век, 101-200 = 2 век и т.д.
      return Math.floor((year - 1) / 100) + 1
    }
  }

  // Алгоритм размещения полосок на строках с полной группировкой по категориям
  const calculateRowPlacement = (people: Person[]) => {
    const rows: Person[][] = []
    const categoryGroups: { [key: string]: Person[] } = {}
    
    // Группируем людей по категориям
    people.forEach(person => {
      if (!categoryGroups[person.category]) {
        categoryGroups[person.category] = []
      }
      categoryGroups[person.category].push(person)
    })
    
    // Обрабатываем каждую категорию в заданном порядке
    allCategories.forEach(category => {
      if (categoryGroups[category]) {
        const categoryPeople = categoryGroups[category]
        const categoryRows: Person[][] = []
        
        // Размещаем людей данной категории в отдельные строки
        categoryPeople.forEach(person => {
          let placed = false
          
          // Проверяем каждую существующую строку для этой категории
          for (let rowIndex = 0; rowIndex < categoryRows.length; rowIndex++) {
            const row = categoryRows[rowIndex]
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
              categoryRows[rowIndex].push(person)
              placed = true
              break
            }
          }
          
          // Если не удалось разместить в существующих строках, создаем новую
          if (!placed) {
            categoryRows.push([person])
          }
        })
        
        // Добавляем строки данной категории к общему списку
        rows.push(...categoryRows)
        
        // Добавляем пустую строку для визуального разделения (кроме последней категории)
        if (category !== allCategories[allCategories.length - 1]) {
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
    const dividers: { category: string; top: number }[] = [];
    let currentCategory = '';

    rowPlacement.forEach((row, rowIndex) => {
      if (row.length > 0) {
        const firstPersonInRow = row[0];
        if (firstPersonInRow.category !== currentCategory) {
          if (currentCategory !== '') {
            // закрываем предыдущую категорию
            dividers.push({ category: currentCategory, top: rowTops[rowIndex] - 5 });
          }
          currentCategory = firstPersonInRow.category;
        }
      }
    });

    // Добавляем разделитель для последней категории
    if (currentCategory !== '') {
      dividers.push({ category: currentCategory, top: rowTops[rowPlacement.length - 1] - 5 });
    }

    return dividers;
  };

  const categoryDividers = createCategoryDividers();



  return (
    <div className="app">
      <header 
        className={`app-header ${isScrolled ? 'scrolled' : ''}`}
        style={{
          padding: isScrolled ? '0.5rem 1.5rem' : '1rem 1.5rem',
          transition: 'all 0.3s ease'
        }}
      >
        <div style={{ 
          display: 'flex', 
          alignItems: 'flex-start', 
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem',
          position: 'relative'
        }}>
          <div>
            <h1 style={{ 
              fontSize: isScrolled ? '1.5rem' : '2rem',
              margin: 0,
              transition: 'font-size 0.3s ease'
            }}>
              Chronoline
            </h1>
            {!isScrolled && (
              <p style={{ 
                fontSize: '0.9rem', 
                opacity: 0.8, 
                margin: '0.25rem 0 0 0',
                transition: 'opacity 0.3s ease'
              }}>
                Временные линии исторических личностей
              </p>
            )}
          </div>

          {/* Фильтры прямо в шапке */}
          <FilterPanel
            filters={filters}
            setFilters={setFilters}
            allCategories={allCategories}
            allCountries={allCountries}
          />
        </div>
      </header>
      
      <main className="app-main">
        {isLoading && (
          <div className="loading-overlay">
            <div className="spinner"></div>
            <span>Загрузка данных...</span>
          </div>
        )}
        {/* Временная линия на весь экран */}
        <div className="timeline-container" style={{ 
          position: 'relative', 
          height: 'calc(100vh - 140px)',
          overflow: 'auto',
          padding: '1rem 0 2rem 0'
        }}>

          {/* Разноцветная заливка веков */}
          <div style={{
            position: 'absolute',
            top: '0',
            left: '0',
            width: `${timelineWidth}px`,
            height: `${totalHeight + 200}px`,
            pointerEvents: 'none',
            zIndex: 1
          }}>
            {centuryBoundaries.map((year, index) => {
              const nextYear = centuryBoundaries[index + 1] || (year + 100)
              const startPos = getPosition(year)
              const endPos = getPosition(nextYear)
              const width = endPos - startPos

              // Вычисляем век на основе центра года в столетии
              const centerYear = year + 50
              const centuryNumber = getCenturyNumber(centerYear)
              // Для отрицательных веков добавляем знак минус
              const isNegativeCentury = year < 0
              const romanNumeral = isNegativeCentury ? `-${toRomanNumeral(Math.abs(centuryNumber))}` : toRomanNumeral(centuryNumber)
              
              return (
                <div key={`century-bg-${year}`} style={{
                  position: 'absolute',
                  left: `${startPos}px`,
                  width: `${width}px`,
                  height: '100%',
                  background: getCenturyColor(year),
                  opacity: 0.3,
                  zIndex: 1
                }}>
                  {/* Римская цифра века в центре */}
                  <div className="century-label" style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    color: 'rgba(244, 228, 193, 0.6)',
                    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
                    pointerEvents: 'none',
                    zIndex: 2,
                    fontFamily: 'serif'
                  }}>
                    {romanNumeral}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Границы веков на всю высоту */}
          <div style={{
            position: 'absolute',
            top: '0',
            left: '0',
            width: `${timelineWidth}px`,
            height: `${totalHeight + 200}px`,
            pointerEvents: 'none',
            zIndex: 5
          }}>
            {centuryBoundaries.map((year) => (
              <div key={`century-line-${year}`} style={{
                position: 'absolute',
                left: `${getPosition(year)}px`,
                width: '2px',
                height: '100%',
                background: 'linear-gradient(to bottom, #cd853f 0%, #cd853f 20%, rgba(205, 133, 63, 0.3) 100%)',
                zIndex: 5
              }} />
            ))}
          </div>

          {/* Разделители категорий */}
          <div style={{
            position: 'absolute',
            top: '0',
            left: '0',
            width: `${timelineWidth}px`,
            height: `${totalHeight + 200}px`,
            pointerEvents: 'none',
            zIndex: 8
          }}>
            {categoryDividers.map((divider) => (
              <div key={`category-divider-${divider.category}`} style={{
                position: 'absolute',
                top: `${divider.top}px`,
                left: '0',
                width: '100%',
                height: '10px',
                background: `linear-gradient(to right, transparent 0%, ${getCategoryColor(divider.category)} 20%, ${getCategoryColor(divider.category)} 80%, transparent 100%)`,
                opacity: 0.6,
                zIndex: 8
              }}>
                <div className="category-label" style={{
                  position: 'absolute',
                  left: '20px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: getCategoryColor(divider.category),
                  color: 'white',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '0.7rem',
                  fontWeight: 'bold',
                  whiteSpace: 'nowrap',
                  zIndex: 9
                }}>
                  {divider.category}
                </div>
              </div>
            ))}
          </div>

          {/* Полоски жизни */}
          <div style={{ 
            position: 'relative',
            width: `${timelineWidth}px`,
            height: `${totalHeight + 60}px`,
            zIndex: 10
          }}>
            {rowPlacement.map((row, rowIndex) => (
              <div key={rowIndex} style={{
                position: 'relative',
                height: row.length === 0 ? '20px' : '60px',
                marginBottom: row.length === 0 ? '0px' : '10px'
              }}>
                {row.map((person) => (
                  <React.Fragment key={person.id}>
                    {/* Годы жизни и правления над полоской */}
                    <span style={{
                      position: 'absolute',
                      left: `${getPosition(person.birthYear)}px`,
                      top: 0,
                      fontSize: '11px',
                      color: 'rgba(244, 228, 193, 0.6)',
                      fontStyle: 'italic',
                      fontWeight: 400,
                      transform: 'translateX(-100%) translateY(-10px)'
                    }}>{person.birthYear}</span>

                    {person.reignStart && (
                      <span className="reign-label" style={{
                        position: 'absolute',
                        left: `${getPosition(person.reignStart)}px`,
                        top: 0,
                        fontSize: '11px',
                        color: '#E57373', // Темно-красный
                        fontStyle: 'italic',
                        fontWeight: 'bold',
                        transform: 'translateX(-100%) translateY(-22px)'
                      }}>👑 {person.reignStart}</span>
                    )}

                    {person.reignEnd && (
                      <span className="reign-label" style={{
                        position: 'absolute',
                        left: `${getPosition(person.reignEnd)}px`,
                        top: 0,
                        fontSize: '11px',
                        color: '#E57373', // Темно-красный
                        fontStyle: 'italic',
                        fontWeight: 'bold',
                        transform: 'translateY(-22px)'
                      }}>{person.reignEnd}</span>
                    )}
                    
                    <span style={{
                      position: 'absolute',
                      left: `${getPosition(person.deathYear)}px`,
                      top: 0,
                      fontSize: '11px',
                      color: 'rgba(244, 228, 193, 0.6)',
                      fontStyle: 'italic',
                      fontWeight: 400,
                      transform: 'translateY(-10px)'
                    }}>{person.deathYear}</span>

                    {/* Маркеры ключевых достижений */}
                    {filters.showAchievements && [person.achievementYear1, person.achievementYear2, person.achievementYear3]
                      .filter(year => year !== undefined && year !== null)
                      .map((year, index) => {
                        return (
                          <div key={index} style={{
                            position: 'absolute',
                            left: `${getPosition(year as number)}px`,
                            top: '-4px',
                            width: '2px',
                            height: '15px',
                            backgroundColor: getCategoryColorDark(person.category),
                            zIndex: activeAchievementMarker?.personId === person.id && activeAchievementMarker?.index === index ? 10 : 3,
                            transform: 'translateX(-50%)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = getCategoryColor(person.category);
                            e.currentTarget.style.boxShadow = `0 0 3px ${getCategoryColor(person.category)}`;
                            // Находим span внутри и обновляем его стили
                            const span = e.currentTarget.querySelector('span');
                            if (span) {
                              span.style.backgroundColor = 'rgba(44, 24, 16, 0.95)';
                              span.style.borderColor = getCategoryColor(person.category);
                              span.style.color = getCategoryColor(person.category);
                              span.style.fontSize = '9px';
                              span.style.padding = '2px 4px';
                              span.style.borderRadius = '3px';
                            }
                            
                            // Устанавливаем активный маркер
                            setActiveAchievementMarker({ personId: person.id, index });
                            
                            // Очищаем предыдущий таймер если он есть
                            if (hoverTimerRef.current) {
                              clearTimeout(hoverTimerRef.current);
                            }
                            
                            // Запускаем таймер для показа tooltip
                            hoverTimerRef.current = setTimeout(() => {
                              setHoveredAchievement({ person, year: year as number, index });
                              setAchievementTooltipPosition({ x: e.clientX, y: e.clientY });
                              setShowAchievementTooltip(true);
                            }, 500);
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = getCategoryColorDark(person.category);
                            e.currentTarget.style.boxShadow = 'none';
                            // Возвращаем стили span к исходным
                            const span = e.currentTarget.querySelector('span');
                            if (span) {
                              span.style.backgroundColor = 'rgba(44, 24, 16, 0.9)';
                              span.style.borderColor = getCategoryColorDark(person.category);
                              span.style.color = getCategoryColorDark(person.category);
                              span.style.fontSize = '8px';
                              span.style.padding = '1px 3px';
                              span.style.borderRadius = '2px';
                            }
                            
                            // Сбрасываем активный маркер
                            setActiveAchievementMarker(null);
                            
                            // Очищаем таймер и скрываем tooltip
                            if (hoverTimerRef.current) {
                              clearTimeout(hoverTimerRef.current);
                              hoverTimerRef.current = null;
                            }
                            setShowAchievementTooltip(false);
                            setHoveredAchievement(null);
                          }}
                          onMouseMove={(e) => {
                            setAchievementTooltipPosition({ x: e.clientX, y: e.clientY });
                          }}
                          onMouseOut={(e) => {
                            // Дополнительная проверка на случай, если onMouseLeave не сработал
                            if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                              setActiveAchievementMarker(null);
                              if (hoverTimerRef.current) {
                                clearTimeout(hoverTimerRef.current);
                                hoverTimerRef.current = null;
                              }
                              setShowAchievementTooltip(false);
                              setHoveredAchievement(null);
                            }
                          }}
                          >
                            <span style={{
                              position: 'absolute',
                              top: '-12px',
                              left: '50%',
                              transform: 'translateX(-50%)',
                              fontSize: '8px',
                              color: getCategoryColorDark(person.category),
                              fontWeight: 'bold',
                              whiteSpace: 'nowrap',
                              backgroundColor: 'rgba(44, 24, 16, 0.9)',
                              padding: '1px 3px',
                              borderRadius: '2px',
                              border: `1px solid ${getCategoryColorDark(person.category)}`,
                              transition: 'all 0.2s ease'
                            }}>
                              {year}
                            </span>
                          </div>
                        );
                      })}

                    {/* полоса правления */}
                    {person.reignStart && person.reignEnd && (
                      <div style={{
                        position: 'absolute',
                        top: '-15px',
                        left: `${getPosition(person.reignStart)}px`,
                        width: `${getWidth(person.reignStart, person.reignEnd)}px`,
                        height: '65px',
                        backgroundColor: 'rgba(211, 47, 47, 0.25)',
                        pointerEvents: 'none',
                        borderLeft: '2px solid #D32F2F',
                        borderRight: '2px solid #D32F2F',
                        borderRadius: '3px',
                        zIndex: 1
                      }} />
                    )}

                    <div
                      className="life-bar"
                      style={{
                        position: 'absolute',
                        top: '10px',
                        left: `${getPosition(person.birthYear)}px`,
                        width: `${getWidth(person.birthYear, person.deathYear)}px`,
                        height: '40px',
                        background: `linear-gradient(135deg, ${getCategoryColorMuted(person.category)} 0%, #6a5a3a 100%)`,
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0 12px',
                        color: 'white',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        minWidth: '60px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        border: '1.5px solid #a8926a',
                        opacity: 1,
                        zIndex: 5
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)'
                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.4)'
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)'
                        setHoveredPerson(person)
                        setMousePosition({ x: e.clientX, y: e.clientY })
                        setTimeout(() => setShowTooltip(true), 300)
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0) scale(1)'
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)'
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
                        setHoveredPerson(null)
                        setShowTooltip(false)
                      }}
                      onMouseMove={(e) => {
                        setMousePosition({ x: e.clientX, y: e.clientY })
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
                        <span>{person.name}</span>
                      </div>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Всплывающее окно с информацией */}
      {hoveredPerson && showTooltip && (
        <div className="tooltip" style={{ 
          position: 'fixed',
          left: `${mousePosition.x + 15}px`,
          top: `${mousePosition.y - 10}px`,
          padding: '1rem',
          zIndex: 1000,
          maxWidth: '300px',
          minWidth: '250px',
          color: '#f4e4c1',
          pointerEvents: 'none',
          opacity: 0,
          transform: 'translateY(10px) scale(0.95)',
          animation: 'tooltipFadeIn 0.2s ease-out forwards'
        }}>
          {/* Фотография человека, если есть */}
          {hoveredPerson.imageUrl && (
            <div style={{ 
              marginBottom: '0.75rem',
              textAlign: 'center'
            }}>
              <img 
                src={hoveredPerson.imageUrl} 
                alt={hoveredPerson.name}
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: `2px solid ${getCategoryColor(hoveredPerson.category)}`,
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
                }}
                onError={(e) => {
                  // Скрываем изображение если оно не загрузилось
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}
          
          <h3 style={{ 
            margin: '0 0 0.5rem 0', 
            color: getCategoryColor(hoveredPerson.category),
            fontSize: '1.1rem',
            fontWeight: 'bold'
          }}>
            {hoveredPerson.name}
          </h3>
          
          <div style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>
            <p style={{ margin: '0.25rem 0', fontWeight: 'bold' }}>
              {hoveredPerson.birthYear} - {hoveredPerson.deathYear}
            </p>
            <p style={{ margin: '0.25rem 0' }}>
              <span style={{ color: getCategoryColor(hoveredPerson.category), fontWeight: 'bold' }}>
                {hoveredPerson.category}
              </span> • {hoveredPerson.country}
            </p>
            <p style={{ margin: '0.5rem 0', fontStyle: 'italic', opacity: 0.8 }}>
              {hoveredPerson.description}
            </p>
            
            {/* Ключевые достижения по годам */}
            {filters.showAchievements && ([hoveredPerson.achievementYear1, hoveredPerson.achievementYear2, hoveredPerson.achievementYear3]
              .filter(year => year !== undefined && year !== null).length > 0) && (
              <div style={{ marginTop: '0.5rem' }}>
                <strong style={{ fontSize: '0.8rem', color: getCategoryColor(hoveredPerson.category) }}>
                  🎯 Ключевые достижения:
                </strong>
                <div style={{ 
                  margin: '0.25rem 0 0 0',
                  fontSize: '0.8rem'
                }}>
                  {[hoveredPerson.achievementYear1, hoveredPerson.achievementYear2, hoveredPerson.achievementYear3]
                    .filter(year => year !== undefined && year !== null)
                    .map((year, index) => (
                      <div key={index} style={{ 
                        marginBottom: '0.1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <span style={{ 
                          color: getCategoryColor(hoveredPerson.category),
                          fontWeight: 'bold',
                          fontSize: '0.75rem'
                        }}>
                          {year}
                        </span>
                        <span style={{ fontSize: '0.75rem' }}>
                          {hoveredPerson.achievements[index] || 'Ключевое достижение'}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}


          </div>
        </div>
      )}

      {/* Всплывающее окно для достижений */}
      {hoveredAchievement && showAchievementTooltip && (
        <div className="achievement-tooltip" style={{ 
          position: 'fixed',
          left: `${achievementTooltipPosition.x + 15}px`,
          top: `${achievementTooltipPosition.y - 10}px`,
          padding: '0.75rem',
          zIndex: 1001,
          maxWidth: '250px',
          minWidth: '200px',
          color: '#f4e4c1',
          pointerEvents: 'none',
          opacity: 0,
          transform: 'translateY(10px) scale(0.95)',
          animation: 'tooltipFadeIn 0.2s ease-out forwards',
          backgroundColor: 'rgba(44, 24, 16, 0.95)',
          borderRadius: '6px',
          border: `2px solid ${getCategoryColor(hoveredAchievement.person.category)}`,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
        }}>
          <div style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>
            {/* Фотография человека, если есть */}
            {hoveredAchievement.person.imageUrl && (
              <div style={{ 
                marginBottom: '0.5rem',
                textAlign: 'center'
              }}>
                <img 
                  src={hoveredAchievement.person.imageUrl} 
                  alt={hoveredAchievement.person.name}
                  style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: `2px solid ${getCategoryColor(hoveredAchievement.person.category)}`,
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)'
                  }}
                  onError={(e) => {
                    // Скрываем изображение если оно не загрузилось
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
            
            <h4 style={{ 
              margin: '0 0 0.5rem 0', 
              color: getCategoryColor(hoveredAchievement.person.category),
              fontSize: '1rem',
              fontWeight: 'bold'
            }}>
              {hoveredAchievement.person.name}
            </h4>
            
            <p style={{ 
              margin: '0.25rem 0', 
              fontWeight: 'bold',
              color: getCategoryColor(hoveredAchievement.person.category),
              fontSize: '0.9rem'
            }}>
              🎯 {hoveredAchievement.year}
            </p>
            
            <p style={{ 
              margin: '0.25rem 0', 
              fontSize: '0.8rem',
              fontStyle: 'italic'
            }}>
              {hoveredAchievement.person.achievements[hoveredAchievement.index] || 'Ключевое достижение'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default App 