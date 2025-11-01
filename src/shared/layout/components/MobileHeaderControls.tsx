import React from 'react'
import { AchievementMarker } from 'features/timeline/components/AchievementMarker'
import { FilterDropdown } from 'shared/ui/FilterDropdown'
import { GroupingToggle } from 'shared/ui/GroupingToggle'
import { YearRangeSlider } from 'features/timeline/components/YearRangeSlider'
import { ToggleButton } from 'shared/ui/ToggleButton'

interface FiltersState {
  showAchievements: boolean
  hideEmptyCenturies: boolean
  categories: string[]
  countries: string[]
  timeRange: { start: number; end: number }
}

interface MobileHeaderControlsProps {
  showControls: boolean
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
  setYearInputs: (
    inputs: { start: string; end: string } | ((prev: { start: string; end: string }) => { start: string; end: string })
  ) => void
  applyYearFilter: (field: 'start' | 'end', value: string) => void
  handleYearKeyPress: (field: 'start' | 'end', e: React.KeyboardEvent<HTMLInputElement>) => void
  resetAllFilters: () => void
  getCategoryColor: (category: string) => string
  handleSliderMouseDown: (e: React.MouseEvent | React.TouchEvent, handle: 'start' | 'end') => void
  handleSliderMouseMove: (
    e: MouseEvent | TouchEvent,
    yearInputs: { start: string; end: string },
    applyYearFilter: (field: 'start' | 'end', value: string) => void,
    setYearInputs: (
      inputs: { start: string; end: string } | ((prev: { start: string; end: string }) => { start: string; end: string })
    ) => void
  ) => void
  handleSliderMouseUp: () => void
  isDraggingSlider: boolean
  extraFilterControls?: React.ReactNode
  handleHideEmptyCenturiesToggle: () => void
}

export function MobileHeaderControls({
  showControls,
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
  handleSliderMouseDown,
  handleSliderMouseMove,
  handleSliderMouseUp,
  isDraggingSlider,
  extraFilterControls,
  handleHideEmptyCenturiesToggle,
}: MobileHeaderControlsProps) {
  const hasActiveFilters =
    filters.categories.length > 0 || filters.countries.length > 0 || yearInputs.start !== '-800' || yearInputs.end !== '2000'

  return (
    <div
      className={`header-controls-mobile${showControls ? ' visible' : ''}`}
      id="header-controls-mobile"
      role="region"
      aria-label="Мобильные элементы управления"
    >
      <div className="header-controls-inner">
        {extraFilterControls && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>{extraFilterControls}</div>
        )}

        {/* Группа кнопок - в одной строке */}
        <div
          className="header-filters-group-mobile"
          role="toolbar"
          aria-label="Мобильные кнопки управления"
          style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}
        >
          <ToggleButton
            isActive={filters.showAchievements}
            onClick={() => setFilters((prev: FiltersState) => ({ ...prev, showAchievements: !prev.showAchievements }))}
            title={filters.showAchievements ? 'Скрыть маркеры достижений' : 'Показать маркеры достижений'}
            ariaLabel={filters.showAchievements ? 'Скрыть маркеры достижений' : 'Показать маркеры достижений'}
            width="44px"
            height="44px"
          >
            <AchievementMarker isActive={filters.showAchievements} />
          </ToggleButton>

          <ToggleButton
            isActive={filters.hideEmptyCenturies}
            onClick={handleHideEmptyCenturiesToggle}
            title={filters.hideEmptyCenturies ? 'Показать все века' : 'Скрыть пустые века'}
            ariaLabel={filters.hideEmptyCenturies ? 'Показать все века' : 'Скрыть пустые века'}
            width="52px"
            height="44px"
          >
            <span style={{ fontSize: '0.7rem', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
              {filters.hideEmptyCenturies ? '<||>' : '>|<'}
            </span>
          </ToggleButton>

          <GroupingToggle groupingType={groupingType} onGroupingChange={setGroupingType} />
        </div>

        {/* Фильтры на отдельной строке для мобильных */}
        <div
          className="header-filters-row"
          style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'center', marginTop: '0.5rem' }}
        >
          <FilterDropdown
            title="🎭"
            items={allCategories}
            selectedItems={filters.categories}
            onSelectionChange={(categories: string[]) => setFilters((prev: FiltersState) => ({ ...prev, categories }))}
            getItemColor={getCategoryColor}
            textLabel="Род деятельности"
          />
          <FilterDropdown
            title="🌍"
            items={allCountries}
            selectedItems={filters.countries}
            onSelectionChange={(countries: string[]) => setFilters((prev: FiltersState) => ({ ...prev, countries }))}
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
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
            opacity: hasActiveFilters ? 1 : 0,
            pointerEvents: hasActiveFilters ? 'auto' : 'none',
            transition: 'opacity 0.2s ease',
          }}
        >
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
              transition: 'all 0.2s ease',
            }}
            title="Сбросить все фильтры"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  )
}




