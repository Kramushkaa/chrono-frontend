import React from 'react'
import { AppHeader } from 'shared/layout/AppHeader'
import type { FiltersState, GroupingType } from 'shared/types'
import type { Person } from 'shared/types'

interface ManageHeaderProps {
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
}

/**
 * Specialized header component for Manage page
 * Simplified version focused on content management features
 */
export function ManageHeader({
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
}: ManageHeaderProps) {
  return (
    <AppHeader
      isScrolled={isScrolled}
      showControls={showControls}
      setShowControls={setShowControls}
      mode="minimal"
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
    />
  )
}



