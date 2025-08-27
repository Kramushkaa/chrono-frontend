import React from 'react'
import { AdaptiveListsLayout } from 'features/manage/components/AdaptiveListsLayout'

interface ManageSectionProps {
  // Layout control
  sidebarCollapsed: boolean
  
  // Menu state
  menuSelection: string
  setMenuSelection: (sel: string) => void
  
  // User info
  isAuthenticated: boolean
  isModerator: boolean
  pendingCount?: number | null
  mineCount?: number | null
  
  // Lists
  personLists: any[]
  sharedList?: any
  selectedListId: number | null
  setSelectedListId: (id: number | null) => void
  loadUserLists: (force?: boolean) => Promise<void>
  
  // Modals
  setShowAuthModal: (show: boolean) => void
  setShowCreateList: (show: boolean) => void
  setShowCreate?: (show: boolean) => void
  createType?: 'person' | 'achievement' | 'period'
  setCreateType?: (type: 'person' | 'achievement' | 'period') => void
  
  // List items (for user-defined lists)
  listItems?: any[]
  filterType?: 'person' | 'achievement' | 'period'
  listLoading?: boolean
  onDeleteListItem?: (listItemId: number) => Promise<void> | void
  
  // Add to list functionality
  openAddForPerson?: (person: any) => void
  
  // Utilities
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void
  
  // Create modal trigger
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
