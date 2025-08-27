import React from 'react'
import { useMobileLayout } from 'hooks/useMobileLayout'
import { MobileTabs } from './MobileTabs'
import { DesktopTabs } from './DesktopTabs'

type Props = {
  activeTab: 'persons' | 'achievements' | 'periods'
  setActiveTab: (tab: 'persons' | 'achievements' | 'periods') => void
  sidebarCollapsed: boolean
  setSidebarCollapsed: (collapsed: boolean) => void
  isAuthenticated: boolean
  userEmailVerified?: boolean
}

export function AdaptiveTabs(props: Props) {
  const { isMobile } = useMobileLayout()

  if (isMobile) {
    return <MobileTabs {...props} />
  }

  return <DesktopTabs {...props} />
}
