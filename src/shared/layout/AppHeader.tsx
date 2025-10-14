import React, { useCallback } from 'react'
import { useToast } from 'shared/context/ToastContext'
import { BrandTitle } from 'shared/ui/BrandTitle'
import { UserMenu } from 'shared/ui/UserMenu'
import { DesktopHeaderControls } from './components/DesktopHeaderControls'
import { MobileHeaderControls } from './components/MobileHeaderControls'
import { Person } from 'shared/types'

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
  extraFilterControls?: React.ReactNode
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
  extraRightControls,
  extraFilterControls
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
        
        {extraRightControls && (
          <div style={{ marginLeft: '0.5rem' }}>
            {extraRightControls}
          </div>
        )}

        {mode === 'full' && (
          <DesktopHeaderControls
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
            handleSliderMouseDown={handleSliderMouseDown}
            handleSliderMouseMove={handleSliderMouseMove}
            handleSliderMouseUp={handleSliderMouseUp}
            isDraggingSlider={isDraggingSlider}
            extraFilterControls={extraFilterControls}
            handleHideEmptyCenturiesToggle={handleHideEmptyCenturiesToggle}
          />
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

        {/* Профиль и, опционально, кнопка "Назад в меню" справа */}
        {onBackToMenu && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginLeft: 'auto' }}>
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
              Меню
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
                const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent('Изучаю исторические личности с Хронониндзя!')}&url=${encodeURIComponent(window.location.href)}`;
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
      </div>

      {mode === 'full' && (
        <MobileHeaderControls
          showControls={showControls}
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
          handleSliderMouseDown={handleSliderMouseDown}
          handleSliderMouseMove={handleSliderMouseMove}
          handleSliderMouseUp={handleSliderMouseUp}
          isDraggingSlider={isDraggingSlider}
          extraFilterControls={extraFilterControls}
          handleHideEmptyCenturiesToggle={handleHideEmptyCenturiesToggle}
        />
      )}
    </header>
  )
})