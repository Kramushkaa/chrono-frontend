import React from 'react'
import { AppHeader } from 'shared/layout/AppHeader'
import { ListSelector } from 'features/timeline/components/ListSelector'
import type { FiltersState, GroupingType } from 'shared/types'
import type { Person } from 'shared/types'

interface TimelineHeaderProps {
  isScrolled: boolean
  showControls: boolean
  setShowControls: (show: boolean) => void
  filters: FiltersState
  setFilters: (filters: FiltersState | ((prev: FiltersState) => FiltersState)) => void
  groupingType: GroupingType
  setGroupingType: (type: GroupingType) => void
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
  onBackToMenu: () => void
  // Timeline-specific props
  isAuthenticated: boolean
  personLists: Array<{ id: number; title: string; items_count?: number; readonly?: boolean }>
  selectedListId: number | null
  selectedListKey: string
  sharedListMeta: { code: string; title: string; listId?: number } | null
  onListChange: (v: string) => void
}

/**
 * Specialized header component for Timeline page
 * Handles timeline-specific features like list selection and time range controls
 */
export function TimelineHeader({
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
  handleSliderMouseMove,
  handleSliderMouseUp,
  isDraggingSlider,
  onBackToMenu,
  isAuthenticated,
  personLists,
  selectedListId,
  selectedListKey,
  sharedListMeta,
  onListChange,
}: TimelineHeaderProps) {
  return (
    <AppHeader
      isScrolled={isScrolled}
      showControls={showControls}
      setShowControls={setShowControls}
      mode="full"
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
      handleSliderMouseMove={handleSliderMouseMove}
      handleSliderMouseUp={handleSliderMouseUp}
      isDraggingSlider={isDraggingSlider}
      onBackToMenu={onBackToMenu}
      extraFilterControls={(
        <ListSelector
          isAuthenticated={isAuthenticated}
          personLists={personLists}
          selectedListId={selectedListId}
          selectedListKey={selectedListKey}
          sharedListMeta={sharedListMeta}
          onChange={onListChange}
        />
      )}
    />
  )
}



