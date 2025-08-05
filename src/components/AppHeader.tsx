import React from 'react'
import { AchievementMarker } from './AchievementMarker'
import { FilterDropdown } from './FilterDropdown'
import { GroupingToggle } from './GroupingToggle'

interface AppHeaderProps {
  isScrolled: boolean
  showControls: boolean
  setShowControls: (show: boolean) => void
  filters: {
    showAchievements: boolean
    hideEmptyCenturies: boolean
    categories: string[]
    countries: string[]
  }
  setFilters: (filters: any) => void
  groupingType: 'category' | 'country' | 'none'
  setGroupingType: (type: 'category' | 'country' | 'none') => void
  allCategories: string[]
  allCountries: string[]
  yearInputs: { start: string; end: string }
  setYearInputs: (inputs: { start: string; end: string } | ((prev: { start: string; end: string }) => { start: string; end: string })) => void
  applyYearFilter: (field: 'start' | 'end', value: string) => void
  handleYearKeyPress: (field: 'start' | 'end', e: React.KeyboardEvent<HTMLInputElement>) => void
  resetAllFilters: () => void
  getCategoryColor: (category: string) => string
  sortedData: any[]
  handleSliderMouseDown: (e: React.MouseEvent | React.TouchEvent, handle: 'start' | 'end') => void
  isDraggingSlider: boolean
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  isScrolled,
  showControls,
  setShowControls,
  filters,
  setFilters,
  groupingType,
  setGroupingType,
  allCategories,
  allCountries,
  yearInputs,
  setYearInputs,
  applyYearFilter,
  handleYearKeyPress,
  resetAllFilters,
  getCategoryColor,
  sortedData,
  handleSliderMouseDown,
  isDraggingSlider
}) => {
  // Вспомогательная функция для корректной обработки значений годов
  const parseYearValue = (value: string, defaultValue: number): number => {
    const parsed = parseInt(value);
    return isNaN(parsed) ? defaultValue : parsed;
  };



  return (
    <header 
      className={`app-header ${isScrolled ? 'scrolled' : ''}`}
      id="app-header"
      role="banner"
      aria-label="Заголовок приложения Chronoline"
      style={{
        padding: isScrolled ? '0.5rem 1rem' : '0.75rem 1rem',
        transition: 'all 0.3s ease'
      }}
    >
      <div className="header-row" role="navigation" aria-label="Основная навигация">
        <h1 className="header-title" id="app-title" style={{ 
          fontSize: isScrolled ? '1.5rem' : '1.8rem',
          margin: 0,
          transition: 'font-size 0.3s ease',
          fontWeight: 'bold',
          color: '#f4e4c1',
          flexShrink: 0
        }}>
          Chronoline
        </h1>
        
        {/* Кнопка-шестерёнка только на мобильных */}
        <button
          className="filters-toggle-btn"
          id="filters-toggle"
          aria-label={showControls ? 'Скрыть фильтры' : 'Показать фильтры'}
          aria-expanded={showControls}
          aria-controls="header-controls-mobile"
          onClick={() => setShowControls(!showControls)}
          style={{
            padding: '0.3rem 0.6rem',
            background: showControls ? '#cd853f' : 'rgba(244, 228, 193, 0.2)',
            border: `1px solid ${showControls ? 'rgba(205, 133, 63, 0.4)' : 'rgba(244, 228, 193, 0.3)'}`,
            borderRadius: '4px',
            color: '#f4e4c1',
            fontSize: '0.7rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            opacity: showControls ? 1 : 0.6
          }}
          title={showControls ? 'Скрыть фильтры' : 'Показать фильтры'}
        >
          ⚙️
        </button>

        {/* Фильтры для больших экранов - в одной строке с заголовком */}
        <div className="header-controls-desktop" role="toolbar" aria-label="Панель управления фильтрами">
          <div className="header-controls-inner">
            <div 
              className="header-marker-toggle" 
              id="achievements-toggle"
              role="button"
              aria-label={filters.showAchievements ? 'Скрыть маркеры достижений' : 'Показать маркеры достижений'}
              aria-pressed={filters.showAchievements}
              aria-describedby="achievements-toggle-description"
              tabIndex={0}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                background: filters.showAchievements ? '#cd853f' : 'rgba(244, 228, 193, 0.2)',
                border: `1px solid ${filters.showAchievements ? 'rgba(205, 133, 63, 0.4)' : 'rgba(244, 228, 193, 0.3)'}`,
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                opacity: filters.showAchievements ? 1 : 0.6
              }}
              onClick={() => setFilters((prev: any) => ({ ...prev, showAchievements: !prev.showAchievements }))}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setFilters((prev: any) => ({ ...prev, showAchievements: !prev.showAchievements }));
                }
              }}
              title={filters.showAchievements ? 'Скрыть маркеры достижений' : 'Показать маркеры достижений'}
              onMouseEnter={(e) => {
                if (!filters.showAchievements) {
                  e.currentTarget.style.background = 'rgba(205, 133, 63, 0.4)';
                  e.currentTarget.style.opacity = '0.8';
                }
              }}
              onMouseLeave={(e) => {
                if (!filters.showAchievements) {
                  e.currentTarget.style.background = 'rgba(244, 228, 193, 0.2)';
                  e.currentTarget.style.opacity = '0.6';
                }
              }}
            >
              <AchievementMarker isActive={filters.showAchievements} />
              <span id="achievements-toggle-description" className="sr-only">
                {filters.showAchievements ? 'Маркеры достижений включены' : 'Маркеры достижений выключены'}
              </span>
            </div>
            
            {/* Кнопка "Скрывать века" */}
            <div 
              className="header-century-toggle" 
              id="century-toggle"
              role="button"
              aria-label={filters.hideEmptyCenturies ? 'Показать все века' : 'Скрыть пустые века'}
              aria-pressed={filters.hideEmptyCenturies}
              tabIndex={0}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                width: '40px',
                height: '32px',
                borderRadius: '6px',
                background: filters.hideEmptyCenturies ? '#cd853f' : 'rgba(244, 228, 193, 0.2)',
                border: `1px solid ${filters.hideEmptyCenturies ? 'rgba(205, 133, 63, 0.4)' : 'rgba(244, 228, 193, 0.3)'}`,
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                opacity: filters.hideEmptyCenturies ? 1 : 0.6
              }}
              onClick={() => setFilters((prev: any) => ({ ...prev, hideEmptyCenturies: !prev.hideEmptyCenturies }))}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setFilters((prev: any) => ({ ...prev, hideEmptyCenturies: !prev.hideEmptyCenturies }));
                }
              }}
              title={filters.hideEmptyCenturies ? 'Показать все века' : 'Скрыть пустые века'}
              onMouseEnter={(e) => {
                if (!filters.hideEmptyCenturies) {
                  e.currentTarget.style.background = 'rgba(205, 133, 63, 0.4)';
                  e.currentTarget.style.opacity = '0.8';
                }
              }}
              onMouseLeave={(e) => {
                if (!filters.hideEmptyCenturies) {
                  e.currentTarget.style.background = 'rgba(244, 228, 193, 0.2)';
                  e.currentTarget.style.opacity = '0.6';
                }
              }}
            >
              <span style={{ fontSize: '0.7rem', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                {filters.hideEmptyCenturies ? '<||>' : '>|<'}
              </span>
            </div>
            
            <GroupingToggle 
              groupingType={groupingType}
              onGroupingChange={setGroupingType}
            />
            
            <div className="header-filters-group" id="filters-group" role="group" aria-label="Фильтры по категориям и странам" style={{ display: 'flex', gap: '0.3rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <FilterDropdown
                title="🎭"
                items={allCategories}
                selectedItems={filters.categories}
                onSelectionChange={(categories) => setFilters((prev: any) => ({ ...prev, categories }))}
                getItemColor={getCategoryColor}
                textLabel="Род деятельности"
              />
              <FilterDropdown
                title="🌍"
                items={allCountries}
                selectedItems={filters.countries}
                onSelectionChange={(countries) => setFilters((prev: any) => ({ ...prev, countries }))}
                textLabel="Страна"
              />
              <div className="year-range-container" role="group" aria-label="Диапазон лет" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem' }}>
                <div className="year-inputs" style={{ display: 'flex', gap: '0.2rem', alignItems: 'center' }}>
                  <label htmlFor="year-start" className="sr-only">Год начала</label>
                  <input
                    id="year-start"
                    type="number"
                    value={yearInputs.start}
                    onChange={(e) => setYearInputs((prev: any) => ({ ...prev, start: e.target.value }))}
                    onBlur={(e) => applyYearFilter('start', e.target.value)}
                    onKeyPress={(e) => handleYearKeyPress('start', e)}
                    placeholder="От"
                    aria-label="Год начала периода"
                    style={{
                      width: '50px',
                      padding: '0.2rem 0.3rem',
                      border: '1px solid rgba(139, 69, 19, 0.3)',
                      borderRadius: '3px',
                      background: 'rgba(44, 24, 16, 0.8)',
                      color: '#f4e4c1',
                      fontSize: '0.6rem',
                      textAlign: 'center',
                      WebkitAppearance: 'none',
                      MozAppearance: 'textfield'
                    }}
                  />
                  <span style={{ fontSize: '0.6rem', color: '#f4e4c1' }}>-</span>
                  <label htmlFor="year-end" className="sr-only">Год окончания</label>
                  <input
                    id="year-end"
                    type="number"
                    value={yearInputs.end}
                    onChange={(e) => setYearInputs((prev: any) => ({ ...prev, end: e.target.value }))}
                    onBlur={(e) => applyYearFilter('end', e.target.value)}
                    onKeyPress={(e) => handleYearKeyPress('end', e)}
                    placeholder="До"
                    aria-label="Год окончания периода"
                    style={{
                      width: '50px',
                      padding: '0.2rem 0.3rem',
                      border: '1px solid rgba(139, 69, 19, 0.3)',
                      borderRadius: '3px',
                      background: 'rgba(44, 24, 16, 0.8)',
                      color: '#f4e4c1',
                      fontSize: '0.6rem',
                      textAlign: 'center',
                      WebkitAppearance: 'none',
                      MozAppearance: 'textfield'
                    }}
                  />
                </div>
                
                {/* Интерактивная полоска диапазона */}
                <div 
                  className="year-range-slider"
                  id="year-range-slider"
                  role="slider"
                  aria-label="Диапазон лет"
                  aria-valuemin={-800}
                  aria-valuemax={2000}
                  aria-valuenow={parseYearValue(yearInputs.start, -800)}
                  aria-valuetext={`От ${yearInputs.start} до ${yearInputs.end}`}
                  style={{ 
                    width: '120px', 
                    height: '8px', 
                    background: 'rgba(244, 228, 193, 0.2)', 
                    borderRadius: '4px', 
                    position: 'relative',
                    cursor: 'pointer'
                  }}
                >
                  {/* Активная область полоски */}
                  <div 
                    className="year-range-slider-track"
                    id="year-range-slider-track"
                    style={{
                      height: '100%',
                      background: 'linear-gradient(90deg, #cd853f 0%, #daa520 100%)',
                      borderRadius: '4px',
                      position: 'absolute',
                      left: `${Math.max(0, Math.min(100, ((parseYearValue(yearInputs.start, -800) + 800) / 2800 * 100)))}%`,
                      width: `${Math.max(0, Math.min(100, ((parseYearValue(yearInputs.end, 2000) - parseYearValue(yearInputs.start, -800)) / 2800 * 100)))}%`,
                      transition: isDraggingSlider ? 'none' : 'all 0.3s ease'
                    }}
                  />
                  
                  {/* Ручка начала диапазона */}
                  <div 
                    className="year-range-slider-handle year-range-slider-handle-start"
                    id="year-range-slider-handle-start"
                    role="slider"
                    aria-label="Начало диапазона"
                    aria-valuenow={parseYearValue(yearInputs.start, -800)}
                    aria-valuemin={-800}
                    aria-valuemax={2000}
                    aria-valuetext={`Год начала: ${yearInputs.start}`}
                    tabIndex={0}
                    onMouseDown={(e) => handleSliderMouseDown(e, 'start')}
                    onTouchStart={(e) => {
                      e.preventDefault()
                      handleSliderMouseDown(e, 'start')
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                        e.preventDefault()
                        const currentStart = parseYearValue(yearInputs.start, -800)
                        const currentEnd = parseYearValue(yearInputs.end, 2000)
                        const step = e.shiftKey ? 100 : 10
                        let newStart = currentStart
                        
                        if (e.key === 'ArrowLeft') {
                          newStart = Math.max(-800, currentStart - step)
                        } else {
                          newStart = Math.min(currentEnd - 100, currentStart + step)
                        }
                        
                        setYearInputs(prev => ({ ...prev, start: newStart.toString() }))
                        applyYearFilter('start', newStart.toString())
                      }
                    }}
                    style={{
                      position: 'absolute',
                      top: '-2px',
                      left: `${Math.max(0, Math.min(100, ((parseYearValue(yearInputs.start, -800) + 800) / 2800 * 100)))}%`,
                      width: '12px',
                      height: '12px',
                      background: '#cd853f',
                      border: '2px solid #f4e4c1',
                      borderRadius: '50%',
                      cursor: 'grab',
                      transform: 'translateX(-50%)',
                      transition: isDraggingSlider ? 'none' : 'all 0.2s ease',
                      zIndex: 2
                    }}
                  />
                  
                  {/* Невидимая touch область для ручки начала (десктоп) */}
                  <div 
                    className="year-range-slider-touch-area year-range-slider-touch-area-start"
                    id="year-range-slider-touch-area-start-desktop"
                    onMouseDown={(e) => handleSliderMouseDown(e, 'start')}
                    style={{
                      position: 'absolute',
                      top: '-16px',
                      left: `${Math.max(0, Math.min(100, ((parseYearValue(yearInputs.start, -800) + 800) / 2800 * 100)))}%`,
                      width: '44px',
                      height: '44px',
                      background: 'transparent',
                      borderRadius: '50%',
                      transform: 'translateX(-50%)',
                      zIndex: 3,
                      pointerEvents: 'auto'
                    }}
                  />
                  
                  {/* Невидимая touch область для ручки начала */}
                  <div 
                    className="year-range-slider-touch-area year-range-slider-touch-area-start"
                    id="year-range-slider-touch-area-start"
                    onMouseDown={(e) => handleSliderMouseDown(e, 'start')}
                    onTouchStart={(e) => {
                      e.preventDefault()
                      handleSliderMouseDown(e, 'start')
                    }}
                    style={{
                      position: 'absolute',
                      top: '-16px',
                      left: `${Math.max(0, Math.min(100, ((parseYearValue(yearInputs.start, -800) + 800) / 2800 * 100)))}%`,
                      width: '44px',
                      height: '44px',
                      background: 'transparent',
                      borderRadius: '50%',
                      transform: 'translateX(-50%)',
                      zIndex: 3,
                      pointerEvents: 'auto'
                    }}
                  />
                  
                  {/* Ручка конца диапазона */}
                  <div 
                    className="year-range-slider-handle year-range-slider-handle-end"
                    id="year-range-slider-handle-end"
                    role="slider"
                    aria-label="Конец диапазона"
                    aria-valuenow={parseYearValue(yearInputs.end, 2000)}
                    aria-valuemin={-800}
                    aria-valuemax={2000}
                    aria-valuetext={`Год окончания: ${yearInputs.end}`}
                    tabIndex={0}
                    onMouseDown={(e) => handleSliderMouseDown(e, 'end')}
                    onTouchStart={(e) => {
                      e.preventDefault()
                      handleSliderMouseDown(e, 'end')
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                        e.preventDefault()
                        const currentStart = parseYearValue(yearInputs.start, -800)
                        const currentEnd = parseYearValue(yearInputs.end, 2000)
                        const step = e.shiftKey ? 100 : 10
                        let newEnd = currentEnd
                        
                        if (e.key === 'ArrowLeft') {
                          newEnd = Math.max(currentStart + 100, currentEnd - step)
                        } else {
                          newEnd = Math.min(2000, currentEnd + step)
                        }
                        
                        setYearInputs(prev => ({ ...prev, end: newEnd.toString() }))
                        applyYearFilter('end', newEnd.toString())
                      }
                    }}
                    style={{
                      position: 'absolute',
                      top: '-2px',
                      left: `${Math.max(0, Math.min(100, ((parseYearValue(yearInputs.end, 2000) + 800) / 2800 * 100)))}%`,
                      width: '12px',
                      height: '12px',
                      background: '#daa520',
                      border: '2px solid #f4e4c1',
                      borderRadius: '50%',
                      cursor: 'grab',
                      transform: 'translateX(-50%)',
                      transition: isDraggingSlider ? 'none' : 'all 0.2s ease',
                      zIndex: 2
                    }}
                  />
                  
                  {/* Невидимая touch область для ручки конца (десктоп) */}
                  <div 
                    className="year-range-slider-touch-area year-range-slider-touch-area-end"
                    id="year-range-slider-touch-area-end-desktop"
                    onMouseDown={(e) => handleSliderMouseDown(e, 'end')}
                    style={{
                      position: 'absolute',
                      top: '-16px',
                      left: `${Math.max(0, Math.min(100, ((parseYearValue(yearInputs.end, 2000) + 800) / 2800 * 100)))}%`,
                      width: '44px',
                      height: '44px',
                      background: 'transparent',
                      borderRadius: '50%',
                      transform: 'translateX(-50%)',
                      zIndex: 3,
                      pointerEvents: 'auto'
                    }}
                  />
                  
                  {/* Невидимая touch область для ручки конца */}
                  <div 
                    className="year-range-slider-touch-area year-range-slider-touch-area-end"
                    id="year-range-slider-touch-area-end"
                    onMouseDown={(e) => handleSliderMouseDown(e, 'end')}
                    onTouchStart={(e) => {
                      e.preventDefault()
                      handleSliderMouseDown(e, 'end')
                    }}
                    style={{
                      position: 'absolute',
                      top: '-16px',
                      left: `${Math.max(0, Math.min(100, ((parseYearValue(yearInputs.end, 2000) + 800) / 2800 * 100)))}%`,
                      width: '44px',
                      height: '44px',
                      background: 'transparent',
                      borderRadius: '50%',
                      transform: 'translateX(-50%)',
                      zIndex: 3,
                      pointerEvents: 'auto'
                    }}
                  />
                </div>
              </div>
              
              {(filters.categories.length > 0 || filters.countries.length > 0 || yearInputs.start !== '-800' || yearInputs.end !== '2000') && (
                <button
                  id="reset-filters"
                  className="reset-filters-btn"
                  onClick={resetAllFilters}
                  aria-label="Сбросить все фильтры"
                  style={{
                    padding: '0.2rem 0.4rem',
                    background: 'rgba(231, 76, 60, 0.2)',
                    border: '1px solid rgba(231, 76, 60, 0.4)',
                    borderRadius: '3px',
                    color: '#e74c3c',
                    fontSize: '0.6rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  title="Сбросить все фильтры"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Фильтры для мобильных - под заголовком */}
      <div className={`header-controls-mobile${showControls ? ' visible' : ''}`} id="header-controls-mobile" role="region" aria-label="Мобильные элементы управления">
        <div className="header-controls-inner">
          {/* Группа кнопок - в одной строке */}
          <div className="header-filters-group-mobile" role="toolbar" aria-label="Мобильные кнопки управления" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div 
              className="header-marker-toggle" 
              role="button"
              tabIndex={0}
              aria-label={filters.showAchievements ? 'Скрыть маркеры достижений' : 'Показать маркеры достижений'}
              aria-pressed={filters.showAchievements}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                width: '44px',
                height: '44px',
                borderRadius: '6px',
                background: filters.showAchievements ? '#cd853f' : 'rgba(244, 228, 193, 0.2)',
                border: `1px solid ${filters.showAchievements ? 'rgba(205, 133, 63, 0.4)' : 'rgba(244, 228, 193, 0.3)'}`,
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                opacity: filters.showAchievements ? 1 : 0.6
              }}
              onClick={() => setFilters((prev: any) => ({ ...prev, showAchievements: !prev.showAchievements }))}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setFilters((prev: any) => ({ ...prev, showAchievements: !prev.showAchievements }));
                }
              }}
              title={filters.showAchievements ? 'Скрыть маркеры достижений' : 'Показать маркеры достижений'}
              onMouseEnter={(e) => {
                if (!filters.showAchievements) {
                  e.currentTarget.style.background = 'rgba(205, 133, 63, 0.4)';
                  e.currentTarget.style.opacity = '0.8';
                }
              }}
              onMouseLeave={(e) => {
                if (!filters.showAchievements) {
                  e.currentTarget.style.background = 'rgba(244, 228, 193, 0.2)';
                  e.currentTarget.style.opacity = '0.6';
                }
              }}
            >
              <AchievementMarker isActive={filters.showAchievements} />
            </div>
            
            {/* Кнопка "Скрывать века" для мобильных */}
            <div 
              className="header-century-toggle" 
              role="button"
              tabIndex={0}
              aria-label={filters.hideEmptyCenturies ? 'Показать все века' : 'Скрыть пустые века'}
              aria-pressed={filters.hideEmptyCenturies}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                width: '52px',
                height: '44px',
                borderRadius: '6px',
                background: filters.hideEmptyCenturies ? '#cd853f' : 'rgba(244, 228, 193, 0.2)',
                border: `1px solid ${filters.hideEmptyCenturies ? 'rgba(205, 133, 63, 0.4)' : 'rgba(244, 228, 193, 0.3)'}`,
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                opacity: filters.hideEmptyCenturies ? 1 : 0.6
              }}
              onClick={() => setFilters((prev: any) => ({ ...prev, hideEmptyCenturies: !prev.hideEmptyCenturies }))}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setFilters((prev: any) => ({ ...prev, hideEmptyCenturies: !prev.hideEmptyCenturies }));
                }
              }}
              title={filters.hideEmptyCenturies ? 'Показать все века' : 'Скрыть пустые века'}
              onMouseEnter={(e) => {
                if (!filters.hideEmptyCenturies) {
                  e.currentTarget.style.background = 'rgba(205, 133, 63, 0.4)';
                  e.currentTarget.style.opacity = '0.8';
                }
              }}
              onMouseLeave={(e) => {
                if (!filters.hideEmptyCenturies) {
                  e.currentTarget.style.background = 'rgba(244, 228, 193, 0.2)';
                  e.currentTarget.style.opacity = '0.6';
                }
              }}
            >
              <span style={{ fontSize: '0.7rem', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                {filters.hideEmptyCenturies ? '<||>' : '>|<'}
              </span>
            </div>
            
            <GroupingToggle 
              groupingType={groupingType}
              onGroupingChange={setGroupingType}
            />
          </div>
          
          {/* Фильтры на отдельной строке для мобильных */}
          <div className="header-filters-row" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'center', marginTop: '0.5rem' }}>
            <FilterDropdown
              title="🎭"
              items={allCategories}
              selectedItems={filters.categories}
              onSelectionChange={(categories) => setFilters((prev: any) => ({ ...prev, categories }))}
              getItemColor={getCategoryColor}
              textLabel="Род деятельности"
            />
            <FilterDropdown
              title="🌍"
              items={allCountries}
              selectedItems={filters.countries}
              onSelectionChange={(countries) => setFilters((prev: any) => ({ ...prev, countries }))}
              textLabel="Страна"
            />
          </div>
          
          {/* Временной промежуток - на отдельной строке */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' }}>
            <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
              <input
                type="number"
                value={yearInputs.start}
                onChange={(e) => setYearInputs((prev: any) => ({ ...prev, start: e.target.value }))}
                onBlur={(e) => applyYearFilter('start', e.target.value)}
                onKeyPress={(e) => handleYearKeyPress('start', e)}
                placeholder="От"
                style={{
                  width: '60px',
                  padding: '0.4rem 0.5rem',
                  border: '1px solid rgba(139, 69, 19, 0.3)',
                  borderRadius: '4px',
                  background: 'rgba(44, 24, 16, 0.8)',
                  color: '#f4e4c1',
                  fontSize: '0.7rem',
                  textAlign: 'center',
                  WebkitAppearance: 'none',
                  MozAppearance: 'textfield'
                }}
              />
              <span style={{ fontSize: '0.7rem', color: '#f4e4c1' }}>-</span>
              <input
                type="number"
                value={yearInputs.end}
                onChange={(e) => setYearInputs((prev: any) => ({ ...prev, end: e.target.value }))}
                onBlur={(e) => applyYearFilter('end', e.target.value)}
                onKeyPress={(e) => handleYearKeyPress('end', e)}
                placeholder="До"
                style={{
                  width: '60px',
                  padding: '0.4rem 0.5rem',
                  border: '1px solid rgba(139, 69, 19, 0.3)',
                  borderRadius: '4px',
                  background: 'rgba(44, 24, 16, 0.8)',
                  color: '#f4e4c1',
                  fontSize: '0.7rem',
                  textAlign: 'center',
                  WebkitAppearance: 'none',
                  MozAppearance: 'textfield'
                }}
              />
            </div>
            
            {/* Интерактивная полоска диапазона для мобильных */}
            <div 
              className="year-range-slider year-range-slider-mobile"
              id="year-range-slider-mobile"
              role="slider"
              aria-label="Диапазон лет"
              aria-valuemin={-800}
              aria-valuemax={2000}
              aria-valuenow={parseYearValue(yearInputs.start, -800)}
              aria-valuetext={`От ${yearInputs.start} до ${yearInputs.end}`}
              style={{ 
                width: '140px', 
                height: '8px', 
                background: 'rgba(244, 228, 193, 0.2)', 
                borderRadius: '4px', 
                position: 'relative',
                cursor: 'pointer'
              }}
            >
              {/* Активная область полоски */}
              <div 
                className="year-range-slider-track"
                id="year-range-slider-track-mobile"
                style={{
                  height: '100%',
                  background: 'linear-gradient(90deg, #cd853f 0%, #daa520 100%)',
                  borderRadius: '4px',
                  position: 'absolute',
                  left: `${Math.max(0, Math.min(100, ((parseYearValue(yearInputs.start, -800) + 800) / 2800 * 100)))}%`,
                  width: `${Math.max(0, Math.min(100, ((parseYearValue(yearInputs.end, 2000) - parseYearValue(yearInputs.start, -800)) / 2800 * 100)))}%`,
                  transition: isDraggingSlider ? 'none' : 'all 0.3s ease'
                }}
              />
              
              {/* Ручка начала диапазона */}
              <div 
                className="year-range-slider-handle year-range-slider-handle-start"
                id="year-range-slider-handle-start-mobile"
                role="slider"
                aria-label="Начало диапазона"
                aria-valuenow={parseYearValue(yearInputs.start, -800)}
                aria-valuemin={-800}
                aria-valuemax={2000}
                aria-valuetext={`Год начала: ${yearInputs.start}`}
                tabIndex={0}
                onMouseDown={(e) => handleSliderMouseDown(e, 'start')}
                onTouchStart={(e) => {
                  e.preventDefault()
                  handleSliderMouseDown(e, 'start')
                }}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                    e.preventDefault()
                    const currentStart = parseYearValue(yearInputs.start, -800)
                    const currentEnd = parseYearValue(yearInputs.end, 2000)
                    const step = e.shiftKey ? 100 : 10
                    let newStart = currentStart
                    
                    if (e.key === 'ArrowLeft') {
                      newStart = Math.max(-800, currentStart - step)
                    } else {
                      newStart = Math.min(currentEnd - 100, currentStart + step)
                    }
                    
                    setYearInputs(prev => ({ ...prev, start: newStart.toString() }))
                    applyYearFilter('start', newStart.toString())
                  }
                }}
                                 style={{
                   position: 'absolute',
                   top: '-2px',
                   left: `${Math.max(0, Math.min(100, ((parseYearValue(yearInputs.start, -800) + 800) / 2800 * 100)))}%`,
                   width: '12px',
                   height: '12px',
                   background: '#cd853f',
                   border: '2px solid #f4e4c1',
                   borderRadius: '50%',
                   cursor: 'grab',
                   transform: 'translateX(-50%)',
                   transition: isDraggingSlider ? 'none' : 'all 0.2s ease',
                   zIndex: 2
                 }}
              />
              
              {/* Ручка конца диапазона */}
              <div 
                className="year-range-slider-handle year-range-slider-handle-end"
                id="year-range-slider-handle-end-mobile"
                role="slider"
                aria-label="Конец диапазона"
                aria-valuenow={parseYearValue(yearInputs.end, 2000)}
                aria-valuemin={-800}
                aria-valuemax={2000}
                aria-valuetext={`Год окончания: ${yearInputs.end}`}
                tabIndex={0}
                onMouseDown={(e) => handleSliderMouseDown(e, 'end')}
                onTouchStart={(e) => {
                  e.preventDefault()
                  handleSliderMouseDown(e, 'end')
                }}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                    e.preventDefault()
                    const currentStart = parseYearValue(yearInputs.start, -800)
                    const currentEnd = parseYearValue(yearInputs.end, 2000)
                    const step = e.shiftKey ? 100 : 10
                    let newEnd = currentEnd
                    
                    if (e.key === 'ArrowLeft') {
                      newEnd = Math.max(currentStart + 100, currentEnd - step)
                    } else {
                      newEnd = Math.min(2000, currentEnd + step)
                    }
                    
                    setYearInputs(prev => ({ ...prev, end: newEnd.toString() }))
                    applyYearFilter('end', newEnd.toString())
                  }
                }}
                                 style={{
                   position: 'absolute',
                   top: '-2px',
                   left: `${Math.max(0, Math.min(100, ((parseYearValue(yearInputs.end, 2000) + 800) / 2800 * 100)))}%`,
                   width: '12px',
                   height: '12px',
                   background: '#daa520',
                   border: '2px solid #f4e4c1',
                   borderRadius: '50%',
                   cursor: 'grab',
                   transform: 'translateX(-50%)',
                   transition: isDraggingSlider ? 'none' : 'all 0.2s ease',
                   zIndex: 2
                 }}
              />
            </div>
          </div>
          
          {/* Кнопка сброса - отдельно */}
          {(filters.categories.length > 0 || filters.countries.length > 0 || yearInputs.start !== '-800' || yearInputs.end !== '2000') && (
            <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
              <button
                onClick={resetAllFilters}
                style={{
                  padding: '0.4rem 0.6rem',
                  background: 'rgba(231, 76, 60, 0.2)',
                  border: '1px solid rgba(231, 76, 60, 0.4)',
                  borderRadius: '4px',
                  color: '#e74c3c',
                  fontSize: '0.7rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                title="Сбросить все фильтры"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
} 