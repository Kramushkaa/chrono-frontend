import React from 'react'
import { useMobileLayout } from 'hooks/useMobileLayout'
import { MobileListsLayout } from './MobileListsLayout'
import { DesktopListsLayout } from './DesktopListsLayout'

type Props = {
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
  
  // List items (for user-defined lists)
  listItems?: any[]
  filterType?: 'person' | 'achievement' | 'period'
  listLoading?: boolean
  onDeleteListItem?: (listItemId: number) => Promise<void> | void
  
  // Utilities
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void
  
  // Create modal trigger
  onAddElement?: () => void
  
  children: React.ReactNode
  

}

export function AdaptiveListsLayout(props: Props) {
  const { isMobile } = useMobileLayout()

  if (isMobile) {
    return <MobileListsLayout {...props} />
  }

  return <DesktopListsLayout {...props} />
}
