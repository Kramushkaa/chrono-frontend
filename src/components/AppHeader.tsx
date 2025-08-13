import React, { useCallback } from 'react'
import { useToast } from '../context/ToastContext'
import { AchievementMarker } from './AchievementMarker'
import { FilterDropdown } from './FilterDropdown'
import { GroupingToggle } from './GroupingToggle'
import { BrandTitle } from './BrandTitle'
import { YearRangeSlider } from './YearRangeSlider'
import { Person } from '../types'
import { UserMenu } from './UserMenu'

interface FiltersState {
  showAchievements: boolean
  hideEmptyCenturies: boolean
  categories: string[]
  countries: string[]
  timeRange: { start: number; end: number }
}

interface AppHeaderProps {
  isScrolled: boolean
  showControls: boolean
  setShowControls: (show: boolean) => void
  mode?: 'full' | 'minimal'
  filters: {
    showAchievements: boolean
    hideEmptyCenturies: boolean
    categories: string[]
    countries: string[]
  }
  setFilters: (filters: FiltersState | ((prev: FiltersState) => FiltersState)) => void
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
  sortedData: Person[]
  handleSliderMouseDown: (e: React.MouseEvent | React.TouchEvent, handle: 'start' | 'end') => void
  handleSliderMouseMove: (e: MouseEvent | TouchEvent, yearInputs: { start: string; end: string }, applyYearFilter: (field: 'start' | 'end', value: string) => void, setYearInputs: (inputs: { start: string; end: string } | ((prev: { start: string; end: string }) => { start: string; end: string })) => void) => void
  handleSliderMouseUp: () => void
  isDraggingSlider: boolean
  onBackToMenu?: () => void
  extraRightControls?: React.ReactNode
}

export const AppHeader: React.FC<AppHeaderProps> = React.memo(({
  isScrolled,
  showControls,
  setShowControls,
  mode = 'full',
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
  handleSliderMouseMove,
  handleSliderMouseUp,
  isDraggingSlider,
  onBackToMenu,
  extraRightControls
}) => {

  const { showToast } = useToast()

  // Функция для переключения фильтра "Показать все века" с сбросом дат
  const handleHideEmptyCenturiesToggle = useCallback(() => {
    const newHideEmptyCenturies = !filters.hideEmptyCenturies;
    
    // Если включаем "Показать все века" (hideEmptyCenturies = false), сбрасываем диапазон дат
    if (!newHideEmptyCenturies) {
      setYearInputs({ start: '-800', end: '2000' });
      applyYearFilter('start', '-800');
      applyYearFilter('end', '2000');
    }
    
    setFilters((prev: FiltersState) => ({ ...prev, hideEmptyCenturies: newHideEmptyCenturies }));
  }, [filters.hideEmptyCenturies, setFilters, setYearInputs, applyYearFilter]);





  return (
    <header 
      className={`app-header ${isScrolled ? 'scrolled' : ''}`}
      id="app-header"
      role="banner"
              aria-label="Заголовок приложения Хронониндзя"
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
          <BrandTitle asLink />
        </h1>
        
        {/* Кнопка "Назад в меню" и профиль рядом с ней */}
        {onBackToMenu && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginLeft: '0.25rem' }}>
            <button
              onClick={onBackToMenu}
              style={{
                padding: '0.4rem 0.8rem',
                background: 'rgba(205, 133, 63, 0.2)',
                border: '1px solid rgba(205, 133, 63, 0.4)',
                borderRadius: '6px',
                color: '#cd853f',
                fontSize: '0.8rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontWeight: 'bold'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(205, 133, 63, 0.3)'
                e.currentTarget.style.borderColor = 'rgba(205, 133, 63, 0.6)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(205, 133, 63, 0.2)'
                e.currentTarget.style.borderColor = 'rgba(205, 133, 63, 0.4)'
              }}
              title="Вернуться в главное меню"
              aria-label="Вернуться в главное меню"
            >
              ← Меню
            </button>
            <UserMenu />
          </div>
        )}

        {/* Профиль справа, если нет кнопки назад */}
        {!onBackToMenu && (
          <div style={{ marginLeft: 'auto' }}>
            <UserMenu />
          </div>
        )}

        {extraRightControls && (
          <div style={{ marginLeft: '0.5rem' }}>
            {extraRightControls}
          </div>
        )}
        {mode === 'full' && (
        <div className="share-buttons" style={{
          display: 'none',
          gap: '0.5rem',
          alignItems: 'center',
          marginLeft: 'auto',
          marginRight: '1rem'
        }}>
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: 'Хронониндзя — Временные линии исторических личностей',
                  text: 'Изучайте биографии и достижения выдающихся личностей разных эпох',
                  url: window.location.href
                });
              } else {
                // Fallback для браузеров без Web Share API
                navigator.clipboard.writeText(window.location.href);
                showToast('Ссылка скопирована в буфер обмена', 'info')
              }
            }}
            style={{
              padding: '0.4rem 0.6rem',
              background: 'rgba(52, 152, 219, 0.2)',
              border: '1px solid rgba(52, 152, 219, 0.4)',
              borderRadius: '4px',
              color: '#3498db',
              fontSize: '0.7rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
            title="Поделиться"
            aria-label="Поделиться ссылкой на приложение"
          >
            📤 Поделиться
          </button>
          
          <button
            onClick={() => {
              const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent('Изучаю исторические личности с Хроно ниндзя!')}&url=${encodeURIComponent(window.location.href)}`;
              window.open(url, '_blank');
            }}
            style={{
              padding: '0.4rem 0.6rem',
              background: 'rgba(29, 161, 242, 0.2)',
              border: '1px solid rgba(29, 161, 242, 0.4)',
              borderRadius: '4px',
              color: '#1da1f2',
              fontSize: '0.7rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            title="Поделиться в Twitter"
            aria-label="Поделиться в Twitter"
          >
            🐦
          </button>
          
          <button
            onClick={() => {
              const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
              window.open(url, '_blank');
            }}
            style={{
              padding: '0.4rem 0.6rem',
              background: 'rgba(66, 103, 178, 0.2)',
              border: '1px solid rgba(66, 103, 178, 0.4)',
              borderRadius: '4px',
              color: '#4267b2',
              fontSize: '0.7rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            title="Поделиться в Facebook"
            aria-label="Поделиться в Facebook"
          >
            📘
          </button>
        </div>
        )}
        
        {mode === 'full' && (
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
        )}

        {mode === 'full' && (
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
              onClick={() => setFilters((prev: FiltersState) => ({ ...prev, showAchievements: !prev.showAchievements }))}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setFilters((prev: FiltersState) => ({ ...prev, showAchievements: !prev.showAchievements }));
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
              onClick={handleHideEmptyCenturiesToggle}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleHideEmptyCenturiesToggle();
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
                onSelectionChange={(categories) => setFilters((prev: FiltersState) => ({ ...prev, categories }))}
                getItemColor={getCategoryColor}
                textLabel="Род деятельности"
              />
              <FilterDropdown
                title="🌍"
                items={allCountries}
                selectedItems={filters.countries}
                onSelectionChange={(countries) => setFilters((prev: FiltersState) => ({ ...prev, countries }))}
                textLabel="Страна"
              />
              <YearRangeSlider
                yearInputs={yearInputs}
                setYearInputs={setYearInputs}
                applyYearFilter={applyYearFilter}
                handleYearKeyPress={handleYearKeyPress}
                handleSliderMouseDown={handleSliderMouseDown}
                handleSliderMouseMove={handleSliderMouseMove}
                handleSliderMouseUp={handleSliderMouseUp}
                isDraggingSlider={isDraggingSlider}
                isMobile={false}
              />
              
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
                  transition: 'all 0.2s ease',
                  opacity: (filters.categories.length > 0 || filters.countries.length > 0 || yearInputs.start !== '-800' || yearInputs.end !== '2000') ? 1 : 0,
                  pointerEvents: (filters.categories.length > 0 || filters.countries.length > 0 || yearInputs.start !== '-800' || yearInputs.end !== '2000') ? 'auto' : 'none'
                }}
                title="Сбросить все фильтры"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
        )}
      </div>

      {mode === 'full' && (
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
              onClick={() => setFilters((prev: FiltersState) => ({ ...prev, showAchievements: !prev.showAchievements }))}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setFilters((prev: FiltersState) => ({ ...prev, showAchievements: !prev.showAchievements }));
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
              onClick={handleHideEmptyCenturiesToggle}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleHideEmptyCenturiesToggle();
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
              onSelectionChange={(categories) => setFilters((prev: FiltersState) => ({ ...prev, categories }))}
              getItemColor={getCategoryColor}
              textLabel="Род деятельности"
            />
            <FilterDropdown
              title="🌍"
              items={allCountries}
              selectedItems={filters.countries}
              onSelectionChange={(countries) => setFilters((prev: FiltersState) => ({ ...prev, countries }))}
              textLabel="Страна"
            />
          </div>
          
          {/* Временной промежуток - на отдельной строке */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' }}>
            <YearRangeSlider
              yearInputs={yearInputs}
              setYearInputs={setYearInputs}
              applyYearFilter={applyYearFilter}
              handleYearKeyPress={handleYearKeyPress}
              handleSliderMouseDown={handleSliderMouseDown}
              handleSliderMouseMove={handleSliderMouseMove}
              handleSliderMouseUp={handleSliderMouseUp}
              isDraggingSlider={isDraggingSlider}
              isMobile={true}
            />
          </div>
          
          {/* Кнопка сброса - отдельно */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            width: '100%',
            opacity: (filters.categories.length > 0 || filters.countries.length > 0 || yearInputs.start !== '-800' || yearInputs.end !== '2000') ? 1 : 0,
            pointerEvents: (filters.categories.length > 0 || filters.countries.length > 0 || yearInputs.start !== '-800' || yearInputs.end !== '2000') ? 'auto' : 'none',
            transition: 'opacity 0.2s ease'
          }}>
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
        </div>
      </div>
      )}
    </header>
  )
})