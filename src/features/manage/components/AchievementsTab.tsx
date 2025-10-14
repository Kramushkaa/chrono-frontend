import React from 'react'
import { UnifiedManageSection } from './UnifiedManageSection'
import type { MenuSelection } from '../hooks/useManageState'

interface AchievementsTabProps {
  sidebarCollapsed: boolean
  menuSelection: MenuSelection
  setMenuSelection: (selection: MenuSelection) => void
  isModerator: boolean
  mineCounts: { persons: number; achievements: number; periods: number }
  sharedList: any
  personLists: any[]
  isAuthenticated: boolean
  setShowAuthModal: (show: boolean) => void
  setShowCreateList: (show: boolean) => void
  setShowCreate: (show: boolean) => void
  createType: 'person' | 'achievement' | 'period'
  setCreateType: (type: 'person' | 'achievement' | 'period') => void
  selectedListId: number | null
  setSelectedListId: (id: number | null) => void
  loadUserLists: (force?: boolean) => Promise<void>
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void
  listItems: any[]
  listLoading: boolean
  achievementsData: any
  achievementsMineData: any
  searchAch: string
  setSearchAch: (query: string) => void
  filters: any
  setFilters: any
  achStatusFilters: Record<string, boolean>
  setAchStatusFilters: (filters: Record<string, boolean>) => void
  listItemIdByDomainIdRef: React.MutableRefObject<Map<string, number>>
  handleDeleteListItem: (listItemId: number) => void
  addToList: any
}

export function AchievementsTab({
  sidebarCollapsed,
  menuSelection,
  setMenuSelection,
  isModerator,
  mineCounts,
  sharedList,
  personLists,
  isAuthenticated,
  setShowAuthModal,
  setShowCreateList,
  setShowCreate,
  createType,
  setCreateType,
  selectedListId,
  setSelectedListId,
  loadUserLists,
  showToast,
  listItems,
  listLoading,
  achievementsData,
  achievementsMineData,
  searchAch,
  setSearchAch,
  filters,
  setFilters,
  achStatusFilters,
  setAchStatusFilters,
  listItemIdByDomainIdRef,
  handleDeleteListItem,
  addToList,
}: AchievementsTabProps) {
  return (
    <div className="manage-page__achievements-section" id="manage-achievements-section">
      <UnifiedManageSection
        sidebarCollapsed={sidebarCollapsed}
        menuSelection={menuSelection}
        setMenuSelection={setMenuSelection}
        isModerator={isModerator}
        pendingCount={null}
        mineCount={mineCounts.achievements}
        personLists={[
          ...(sharedList
            ? [
                {
                  id: sharedList.id,
                  title: `🔒 ${sharedList.title}`,
                  items_count: sharedList.achievements_count ?? 0,
                  readonly: true,
                },
              ]
            : []),
          ...(isAuthenticated ? personLists : []),
        ]}
        isAuthenticated={isAuthenticated}
        setShowAuthModal={setShowAuthModal}
        setShowCreateList={setShowCreateList}
        setShowCreate={setShowCreate}
        createType={createType}
        setCreateType={setCreateType}
        sharedList={sharedList}
        selectedListId={selectedListId}
        setSelectedListId={setSelectedListId}
        loadUserLists={loadUserLists}
        showToast={showToast}
        data={
          (menuSelection as string).startsWith('list:')
            ? {
                items: listItems
                  .filter((i) => i.type === 'achievement')
                  .map((i) => i.achievement)
                  .filter(Boolean),
                isLoading: listLoading,
                hasMore: false,
                loadMore: () => {},
              }
            : menuSelection === 'mine'
            ? achievementsMineData
            : achievementsData
        }
        searchQuery={searchAch}
        setSearchQuery={setSearchAch}
        categories={[]}
        countries={[]}
        filters={filters}
        setFilters={setFilters}
        statusFilters={achStatusFilters}
        setStatusFilters={setAchStatusFilters}
        listLoading={listLoading}
        listItems={listItems}
        onDeleteListItem={handleDeleteListItem}
        getListItemIdByDisplayId={(id) => listItemIdByDomainIdRef.current.get(String(id))}
        onSelect={(achievement) => {
          // TODO: добавить обработку выбора достижения
        }}
        onAddItem={(id) => addToList.openForAchievement(Number(id))}
        labelAll="Все достижения"
        itemType="achievement"
        emptyMessage="Достижения не найдены"
        loadingMessage="Загрузка достижений..."
      />
    </div>
  )
}

