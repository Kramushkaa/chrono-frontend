import React from 'react'
import { AppHeader } from 'shared/layout/AppHeader'
import { ListSelector } from 'features/timeline/components/ListSelector'

interface Props {
  // header state
  isScrolled: boolean
  showControls: boolean
  setShowControls: (v: boolean) => void

  // filters
  filters: any
  setFilters: any
  groupingType: 'category' | 'country' | 'none'
  setGroupingType: (v: 'category' | 'country' | 'none') => void
  allCategories: string[]
  allCountries: string[]
  yearInputs: { start: string; end: string }
  setYearInputs: (inputs: { start: string; end: string } | ((prev: { start: string; end: string }) => { start: string; end: string })) => void
  applyYearFilter: (field: 'start' | 'end', value: string) => void
  handleYearKeyPress: (field: 'start' | 'end', e: any) => void
  resetAllFilters: () => void
  getCategoryColor: (groupName: string) => string
  sortedData: any[]

  // slider
  handleSliderMouseDown: (e: React.MouseEvent | React.TouchEvent, handle: 'start' | 'end') => void
  handleSliderMouseMove: (e: MouseEvent | TouchEvent, yearInputs: { start: string; end: string }, applyYearFilter: (field: 'start' | 'end', value: string) => void, setYearInputs: (inputs: { start: string; end: string } | ((prev: { start: string; end: string }) => { start: string; end: string })) => void) => void
  handleSliderMouseUp: () => void
  isDraggingSlider: boolean

  // navigation
  onBackToMenu: () => void

  // list selector
  isAuthenticated: boolean
  personLists: Array<{ id: number; title: string }>
  selectedListId: number | null
  selectedListKey: string
  sharedListMeta: { code: string; title: string; listId?: number } | null
  onListChange: (value: string) => void
}

export function TimelineHeaderContainer(props: Props) {
  const {
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
    onListChange
  } = props

  return (
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


