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

interface DesktopHeaderControlsProps {
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

export function DesktopHeaderControls({
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
}: DesktopHeaderControlsProps) {
  const hasActiveFilters =
    filters.categories.length > 0 || filters.countries.length > 0 || yearInputs.start !== '-800' || yearInputs.end !== '2000'

  return (
    <div className="header-controls-desktop" role="toolbar" aria-label="Панель управления фильтрами">
      <div className="header-controls-inner">
        {extraFilterControls && (
          <div style={{ display: 'flex', alignItems: 'center', marginRight: '0.5rem' }}>{extraFilterControls}</div>
        )}

        <ToggleButton
          id="achievements-toggle"
          isActive={filters.showAchievements}
          onClick={() => setFilters((prev: FiltersState) => ({ ...prev, showAchievements: !prev.showAchievements }))}
          title={filters.showAchievements ? 'Скрыть маркеры достижений' : 'Показать маркеры достижений'}
          ariaLabel={filters.showAchievements ? 'Скрыть маркеры достижений' : 'Показать маркеры достижений'}
          ariaDescribedBy="achievements-toggle-description"
        >
          <AchievementMarker isActive={filters.showAchievements} />
          <span id="achievements-toggle-description" className="sr-only">
            {filters.showAchievements ? 'Маркеры достижений включены' : 'Маркеры достижений выключены'}
          </span>
        </ToggleButton>

        <ToggleButton
          id="century-toggle"
          isActive={filters.hideEmptyCenturies}
          onClick={handleHideEmptyCenturiesToggle}
          title={filters.hideEmptyCenturies ? 'Показать все века' : 'Скрыть пустые века'}
          ariaLabel={filters.hideEmptyCenturies ? 'Показать все века' : 'Скрыть пустые века'}
          width="40px"
        >
          <span style={{ fontSize: '0.7rem', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
            {filters.hideEmptyCenturies ? '<||>' : '>|<'}
          </span>
        </ToggleButton>

        <GroupingToggle groupingType={groupingType} onGroupingChange={setGroupingType} />

        <div
          className="header-filters-group"
          id="filters-group"
          role="group"
          aria-label="Фильтры по категориям и странам"
          style={{ display: 'flex', gap: '0.3rem', alignItems: 'center', flexWrap: 'wrap' }}
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
              opacity: hasActiveFilters ? 1 : 0,
              pointerEvents: hasActiveFilters ? 'auto' : 'none',
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

