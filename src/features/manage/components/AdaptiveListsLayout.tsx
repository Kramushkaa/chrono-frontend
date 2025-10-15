import React from 'react'
import { useMobileLayout } from 'shared/hooks/useMobileLayout'
import { MobileListsLayout } from './MobileListsLayout'
import { DesktopListsLayout } from './DesktopListsLayout'
import type { MenuSelection } from '../hooks/useManageState'
import type { MixedListItem } from 'shared/types'

// Shared types
interface PersonList {
  id: number
  title: string
  items_count?: number
  readonly?: boolean
}

interface SharedList {
  id: number
  title: string
  owner_user_id?: string
  code?: string
  items_count?: number
  persons_count?: number
  achievements_count?: number
  periods_count?: number
}

type Props = {
  // Layout control
  sidebarCollapsed: boolean
  
  // Menu state
  menuSelection: MenuSelection
  setMenuSelection: (sel: MenuSelection) => void
  
  // User info
  isAuthenticated: boolean
  isModerator: boolean
  pendingCount?: number | null
  mineCount?: number | null
  
  // Lists
  personLists: PersonList[]
  sharedList?: SharedList | null
  selectedListId: number | null
  setSelectedListId: (id: number | null) => void
  loadUserLists: (force?: boolean) => Promise<void>
  
  // Modals
  setShowAuthModal: (show: boolean) => void
  setShowCreateList: (show: boolean) => void
  
  // List items (for user-defined lists)
  listItems?: MixedListItem[]
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
