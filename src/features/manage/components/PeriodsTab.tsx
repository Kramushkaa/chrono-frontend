import React, { useState } from 'react'
import { UnifiedManageSection } from './UnifiedManageSection'
import type { MenuSelection } from '../hooks/useManageState'
import type { FiltersState, SetFilters, MixedListItem, Period, UserList, ListModerationStatus } from 'shared/types'
import type { PeriodTile } from 'shared/hooks/usePeriods'
import type { PeriodEntity } from './PeriodEditModal'

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

// Period entity type теперь импортируется из PeriodEditModal

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
  setIsEditingPeriod?: (editing: boolean) => void
  setSelectedPeriod?: (period: PeriodEntity | null) => void
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
  setIsEditingPeriod,
  setSelectedPeriod,
}: PeriodsTabProps) {
  const normalizePeriod = (raw: PeriodEntity | any): PeriodEntity => {
    const startYear = raw.startYear ?? raw.start_year ?? raw.start ?? null
    const endYear = raw.endYear ?? raw.end_year ?? raw.end ?? null
    const countryId = raw.country_id ?? raw.countryId ?? null
    return {
      id: raw.id,
      name: raw.name ?? raw.title ?? '',
      startYear: typeof startYear === 'number' ? startYear : Number(startYear) || 0,
      endYear: typeof endYear === 'number' || endYear === null ? endYear : Number(endYear) || null,
      type:
        raw.type ??
        raw.period_type ??
        (raw.periodType === 'ruler' ? 'ruler' : 'life'),
      description: raw.description ?? raw.comment ?? '',
      comment: raw.comment ?? raw.description ?? '',
      person_id:
        raw.person_id ??
        raw.personId ??
        (raw.person?.id ?? null),
      country_id: countryId ?? undefined,
      countryId: countryId ?? undefined,
      status: raw.status,
    }
  }

  const handleEditPeriod = (payload: PeriodEntity | { period?: PeriodEntity }) => {
    const source = (payload as any)?.period ?? payload
    const period = normalizePeriod(source)
    if (setSelectedPeriod) {
      setSelectedPeriod(period)
    }
    if (setIsEditingPeriod) {
      setIsEditingPeriod(true)
    }
  }

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
                  moderation_status: 'published' as ListModerationStatus,
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
                } as UserList & { readonly: true },
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
        onEditItem={handleEditPeriod}
        labelAll="Все периоды"
        itemType="period"
        emptyMessage="Периоды не найдены"
        loadingMessage="Загрузка периодов..."
      />
    </div>
  )
}




