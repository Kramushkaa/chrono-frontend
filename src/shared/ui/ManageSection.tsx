import React from 'react'
import { AdaptiveListsLayout } from 'features/manage/components/AdaptiveListsLayout'

interface ManageSectionProps {
  // Core layout and navigation
  sidebarCollapsed: boolean
  menuSelection: string
  setMenuSelection: (sel: string) => void
  
  // User authentication
  isAuthenticated: boolean
  isModerator: boolean
  pendingCount?: number | null
  mineCount?: number | null
  
  // Lists management
  personLists: any[]
  sharedList?: any
  selectedListId: number | null
  setSelectedListId: (id: number | null) => void
  loadUserLists: (force?: boolean) => Promise<void>
  
  // Modal controls
  setShowAuthModal: (show: boolean) => void
  setShowCreateList: (show: boolean) => void
  
  // List operations (only for user-defined lists)
  listItems?: any[]
  filterType?: 'person' | 'achievement' | 'period'
  listLoading?: boolean
  onDeleteListItem?: (listItemId: number) => Promise<void> | void
  
  // Utilities
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void
  onAddElement?: () => void
  
  children: React.ReactNode
}

export function ManageSection(props: ManageSectionProps) {
  const {
    sidebarCollapsed,
    menuSelection,
    setMenuSelection,
    isModerator,
    pendingCount,
    mineCount,
    personLists,
    isAuthenticated,
    setShowAuthModal,
    setShowCreateList,
    sharedList,
    selectedListId,
    setSelectedListId,
    loadUserLists,
    showToast,
    children,
    listLoading,
    listItems,
    filterType,
    onDeleteListItem,
    onAddElement
  } = props



  return (
    <AdaptiveListsLayout
      sidebarCollapsed={sidebarCollapsed}
      menuSelection={menuSelection}
      setMenuSelection={setMenuSelection}
      isModerator={isModerator}
      pendingCount={pendingCount}
      mineCount={mineCount}
      personLists={personLists}
      isAuthenticated={isAuthenticated}
      setShowAuthModal={setShowAuthModal}
      setShowCreateList={setShowCreateList}
      sharedList={sharedList}
      selectedListId={selectedListId}
      setSelectedListId={setSelectedListId}
      loadUserLists={loadUserLists}
      showToast={showToast}
      listLoading={listLoading}
      listItems={listItems}
      filterType={filterType}
      onDeleteListItem={onDeleteListItem}
      onAddElement={onAddElement}
    >
      {children}
    </AdaptiveListsLayout>
  )
}
