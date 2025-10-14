import React from 'react'
import { UnifiedManageSection } from './UnifiedManageSection'
import type { MenuSelection } from '../hooks/useManageState'

interface PeriodsTabProps {
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
  periodsData: any
  periodsMineData: any
  searchPeriods: string
  setSearchPeriods: (query: string) => void
  filters: any
  setFilters: any
  periodsStatusFilters: Record<string, boolean>
  setPeriodsStatusFilters: (filters: Record<string, boolean>) => void
  listItemIdByDomainIdRef: React.MutableRefObject<Map<string, number>>
  handleDeleteListItem: (listItemId: number) => void
  addToList: any
}

export function PeriodsTab({
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
  periodsData,
  periodsMineData,
  searchPeriods,
  setSearchPeriods,
  filters,
  setFilters,
  periodsStatusFilters,
  setPeriodsStatusFilters,
  listItemIdByDomainIdRef,
  handleDeleteListItem,
  addToList,
}: PeriodsTabProps) {
  return (
    <div className="manage-page__periods-section" id="manage-periods-section">
      <UnifiedManageSection
        sidebarCollapsed={sidebarCollapsed}
        menuSelection={menuSelection}
        setMenuSelection={setMenuSelection}
        isModerator={isModerator}
        pendingCount={null}
        mineCount={mineCounts.periods}
        personLists={[
          ...(sharedList
            ? [
                {
                  id: sharedList.id,
                  title: `🔒 ${sharedList.title}`,
                  items_count: sharedList.periods_count ?? 0,
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
                  .filter((i) => i.type === 'period')
                  .map((i) => i.period)
                  .filter(Boolean),
                isLoading: listLoading,
                hasMore: false,
                loadMore: () => {},
              }
            : menuSelection === 'mine'
            ? periodsMineData
            : periodsData
        }
        searchQuery={searchPeriods}
        setSearchQuery={setSearchPeriods}
        categories={[]}
        countries={[]}
        filters={filters}
        setFilters={setFilters}
        statusFilters={periodsStatusFilters}
        setStatusFilters={setPeriodsStatusFilters}
        listLoading={listLoading}
        listItems={listItems}
        onDeleteListItem={handleDeleteListItem}
        getListItemIdByDisplayId={(id) => listItemIdByDomainIdRef.current.get(String(id))}
        onSelect={(period) => {
          // TODO: добавить обработку выбора периода
        }}
        onAddItem={(id) => addToList.openForPeriod(Number(id))}
        labelAll="Все периоды"
        itemType="period"
        emptyMessage="Периоды не найдены"
        loadingMessage="Загрузка периодов..."
      />
    </div>
  )
}

