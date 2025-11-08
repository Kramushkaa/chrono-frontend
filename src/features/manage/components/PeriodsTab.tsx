import React from 'react'
import { UnifiedManageSection } from './UnifiedManageSection'
import type { MenuSelection } from '../hooks/useManageState'
import type { FiltersState, SetFilters, MixedListItem, Period, UserList } from 'shared/types'
import type { PeriodTile } from 'shared/hooks/usePeriods'

// PeriodItem from useManagePageData
interface PeriodItem {
  id: number
  name: string
  startYear: number
  endYear: number
  type: string
  description?: string
  person_id?: string
  country_id?: number
  status?: string
}

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

type PersonList = UserList & { readonly?: boolean }

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

// Period entity type - расширенный Period с дополнительными полями
interface PeriodEntity extends Period {
  id?: number
  name?: string
  description?: string
  person_id?: string
  country_id?: number
  status?: string
}

interface PeriodsDataState {
  items: PeriodEntity[] | PeriodTile[] | PeriodItem[]
  isLoading: boolean
  hasMore: boolean
  loadMore: () => void
}

interface PeriodsTabProps {
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
  periodsData: PeriodsDataState
  periodsMineData: PeriodsDataState
  searchPeriods: string
  setSearchPeriods: (query: string) => void
  filters: FiltersState
  setFilters: SetFilters
  periodsStatusFilters: Record<string, boolean>
  setPeriodsStatusFilters: (filters: Record<string, boolean>) => void
  listItemIdByDomainIdRef: React.MutableRefObject<Map<string, number>>
  handleDeleteListItem: (listItemId: number) => void
  addToList: AddToListActions
  currentUserId?: number | null
  onListUpdated?: (list: UserList) => void
  onOpenListPublication?: () => void
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
  currentUserId,
  onListUpdated,
  onOpenListPublication,
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
                  owner_user_id: sharedList.owner_user_id ? Number(sharedList.owner_user_id) : 0,
                  title: `🔒 ${sharedList.title}`,
                  created_at: '',
                  updated_at: '',
                  moderation_status: 'published',
                  public_description: '',
                  moderation_requested_at: null,
                  published_at: null,
                  moderated_by: null,
                  moderated_at: null,
                  moderation_comment: null,
                  public_slug: null,
                  items_count: sharedList.items_count ?? sharedList.periods_count ?? 0,
                  persons_count: sharedList.persons_count ?? 0,
                  achievements_count: sharedList.achievements_count ?? 0,
                  periods_count: sharedList.periods_count ?? sharedList.items_count ?? 0,
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
        currentUserId={currentUserId ?? undefined}
        onListUpdated={onListUpdated}
        onOpenListPublication={onOpenListPublication}
        data={
          (menuSelection as string).startsWith('list:')
            ? {
                items: listItems
                  .filter((i) => i.type === 'period')
                  .map((i) => i.period)
                  .filter((p) => p != null) as PeriodEntity[],
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
        onSelect={() => {
          // Period selection not implemented yet
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




