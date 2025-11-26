import React, { useState } from 'react'
import { UnifiedManageSection } from './UnifiedManageSection'
import type { MenuSelection } from '../hooks/useManageState'
import type { Achievement, FiltersState, SetFilters, MixedListItem, UserList, ListModerationStatus } from 'shared/types'
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
  currentUserId?: number | null
  onListUpdated?: (list: UserList) => void
  onOpenListPublication?: () => void
  setIsEditingAchievement?: (editing: boolean) => void
  setSelectedAchievement?: (achievement: Achievement | null) => void
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
  currentUserId,
  onListUpdated,
  onOpenListPublication,
  setIsEditingAchievement,
  setSelectedAchievement,
}: AchievementsTabProps) {
  const normalizeAchievement = (raw: Achievement | AchievementTile): Achievement => {
    const tile = raw as AchievementTile
    return {
      id: raw.id,
      year: raw.year ?? tile.year ?? 0,
      description: raw.description ?? tile.title ?? '',
      wikipedia_url:
        ('wikipedia_url' in raw ? raw.wikipedia_url : null) ??
        (raw as any).wikipediaUrl ??
        null,
      image_url:
        ('image_url' in raw ? raw.image_url : null) ??
        (raw as any).imageUrl ??
        null,
      person_id:
        raw.person_id ??
        (raw as any).personId ??
        tile.person_id ??
        (tile as any).person?.id ??
        null,
      country_id:
        (raw as any).country_id ??
        (raw as any).countryId ??
        null,
      status: raw.status,
    }
  }

  const handleEditAchievement = (payload: Achievement | AchievementTile | { achievement?: Achievement }) => {
    const source = (payload as any)?.achievement ?? payload;
    const achievementData = normalizeAchievement(source as Achievement | AchievementTile)
    if (setSelectedAchievement) {
      setSelectedAchievement(achievementData)
    }
    if (setIsEditingAchievement) {
      setIsEditingAchievement(true)
    }
  }

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
                  items_count: sharedList.items_count ?? sharedList.achievements_count ?? 0,
                  persons_count: sharedList.persons_count ?? 0,
                  achievements_count: sharedList.achievements_count ?? sharedList.items_count ?? 0,
                  periods_count: sharedList.periods_count ?? 0,
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
        onEditItem={handleEditAchievement}
        labelAll="Все достижения"
        itemType="achievement"
        emptyMessage="Достижения не найдены"
        loadingMessage="Загрузка достижений..."
      />
    </div>
  )
}




