/**
 * Helper to generate common AppHeader props for Quiz pages
 * Reduces duplication across setup, active quiz, and results states
 */

export interface BaseHeaderProps {
  onBackToMenu: () => void
  extraRightControls?: React.ReactNode
}

export function getMinimalHeaderProps({ onBackToMenu, extraRightControls }: BaseHeaderProps) {
  return {
    isScrolled: false,
    showControls: false,
    setShowControls: () => {},
    mode: 'minimal' as const,
    filters: {
      categories: [],
      countries: [],
      showAchievements: true,
      hideEmptyCenturies: false,
    },
    setFilters: () => {},
    groupingType: 'none' as const,
    setGroupingType: () => {},
    allCategories: [],
    allCountries: [],
    yearInputs: { start: '-800', end: '2000' },
    setYearInputs: () => {},
    applyYearFilter: () => {},
    handleYearKeyPress: () => {},
    resetAllFilters: () => {},
    getCategoryColor: () => '',
    sortedData: [],
    handleSliderMouseDown: () => {},
    handleSliderMouseMove: () => {},
    handleSliderMouseUp: () => {},
    isDraggingSlider: false,
    onBackToMenu,
    extraRightControls,
  }
}

