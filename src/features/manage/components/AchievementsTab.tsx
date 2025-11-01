import React from 'react'
import { UnifiedManageSection } from './UnifiedManageSection'
import type { MenuSelection } from '../hooks/useManageState'
import type { Achievement, FiltersState, SetFilters, MixedListItem } from 'shared/types'
import type { AchievementTile } from 'shared/hooks/useAchievements'

// Shared types
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

interface PersonList {
  id: number
  title: string
  items_count?: number
  readonly?: boolean
}

interface AddToListActions {
  isOpen: boolean
  openForPerson: (person: { id: string }) => void
  openForAchievement: (achievementId: number) => void
  openForPeriod: (periodId: number) => void
  close: () => void
  includeLinked: boolean
  setIncludeLinked: (value: boolean) => void
  onAdd: (listId: number) => Promise<void>
}

interface AchievementsDataState {
  items: Achievement[] | AchievementTile[]
  isLoading: boolean
  hasMore: boolean
  loadMore: () => void
}

interface AchievementsTabProps {
  sidebarCollapsed: boolean
  menuSelection: MenuSelection
  setMenuSelection: (selection: MenuSelection) => void
  isModerator: boolean
  mineCounts: { persons: number; achievements: number; periods: number }
  sharedList: SharedList | null
  personLists: PersonList[]
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
  listItems: MixedListItem[]
  listLoading: boolean
  achievementsData: AchievementsDataState
  achievementsMineData: AchievementsDataState
  searchAch: string
  setSearchAch: (query: string) => void
  filters: FiltersState
  setFilters: SetFilters
  achStatusFilters: Record<string, boolean>
  setAchStatusFilters: (filters: Record<string, boolean>) => void
  listItemIdByDomainIdRef: React.MutableRefObject<Map<string, number>>
  handleDeleteListItem: (listItemId: number) => void
  addToList: AddToListActions
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
                  .filter((a): a is Achievement => a != null),
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
        onSelect={() => {
          // Achievement selection not implemented yet
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




