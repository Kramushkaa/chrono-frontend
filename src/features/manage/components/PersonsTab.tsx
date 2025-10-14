import React from 'react'
import { Person } from 'shared/types'
import { getGroupColor, getPersonGroup } from 'features/persons/utils/groupingUtils'
import { PersonCard } from 'features/persons/components/PersonCard'
import { UnifiedManageSection } from './UnifiedManageSection'
import type { MenuSelection } from '../hooks/useManageState'

interface PersonsTabProps {
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
  personsAlt: any[]
  personsAltLoading: boolean
  personsAltInitialLoading: boolean
  personsAltHasMore: boolean
  loadMorePersonsAlt: () => void
  personsAll: any[]
  isPersonsLoadingAll: boolean
  personsHasMoreAll: boolean
  loadMorePersonsAll: () => void
  searchPersons: string
  setSearchPersons: (query: string) => void
  categories: string[]
  countries: string[]
  filters: any
  setFilters: any
  statusFilters: Record<string, boolean>
  setStatusFilters: (filters: Record<string, boolean>) => void
  listItemIdByDomainIdRef: React.MutableRefObject<Map<string, number>>
  handleDeleteListItem: (listItemId: number) => void
  selected: Person | null
  setSelected: (person: Person | null) => void
  addToList: any
  user: any
  setIsEditing: (editing: boolean) => void
  setShowEditWarning: (show: boolean) => void
}

export function PersonsTab({
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
  personsAlt,
  personsAltLoading,
  personsAltInitialLoading,
  personsAltHasMore,
  loadMorePersonsAlt,
  personsAll,
  isPersonsLoadingAll,
  personsHasMoreAll,
  loadMorePersonsAll,
  searchPersons,
  setSearchPersons,
  categories,
  countries,
  filters,
  setFilters,
  statusFilters,
  setStatusFilters,
  listItemIdByDomainIdRef,
  handleDeleteListItem,
  selected,
  setSelected,
  addToList,
  user,
  setIsEditing,
  setShowEditWarning,
}: PersonsTabProps) {
  return (
    <div className="manage-page__persons-layout" id="manage-persons-layout">
      <div className="manage-page__persons-section" id="manage-persons-section">
        <UnifiedManageSection
          sidebarCollapsed={sidebarCollapsed}
          menuSelection={menuSelection}
          setMenuSelection={setMenuSelection}
          isModerator={isModerator}
          pendingCount={null}
          mineCount={mineCounts.persons}
          personLists={[
            ...(sharedList
              ? [
                  {
                    id: sharedList.id,
                    title: `🔒 ${sharedList.title}`,
                    items_count: sharedList.persons_count ?? sharedList.items_count,
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
                    .filter((i) => i.type === 'person')
                    .map((i) => i.person)
                    .filter(Boolean) as Person[],
                  isLoading: listLoading,
                  hasMore: false,
                  loadMore: () => {},
                }
              : menuSelection === 'mine'
              ? {
                  items: personsAlt,
                  isLoading: personsAltLoading || personsAltInitialLoading,
                  hasMore: personsAltHasMore,
                  loadMore: loadMorePersonsAlt,
                }
              : {
                  items: personsAll,
                  isLoading: isPersonsLoadingAll,
                  hasMore: personsHasMoreAll,
                  loadMore: loadMorePersonsAll,
                }
          }
          searchQuery={searchPersons}
          setSearchQuery={setSearchPersons}
          categories={categories}
          countries={countries}
          filters={filters}
          setFilters={setFilters}
          statusFilters={statusFilters}
          setStatusFilters={setStatusFilters}
          listLoading={listLoading}
          listItems={listItems}
          onDeleteListItem={handleDeleteListItem}
          getListItemIdByDisplayId={(id) => listItemIdByDomainIdRef.current.get(String(id))}
          onSelect={(p) => setSelected(p)}
          onPersonSelect={(person) => setSelected(person)}
          onAddItem={(id) => addToList.openForPerson({ id } as Person)}
          labelAll="Все личности"
          itemType="person"
          emptyMessage="Личности не найдены"
          loadingMessage="Загрузка личностей..."
        />
      </div>
      <div className="manage-page__person-card" id="manage-person-card" role="region" aria-label="Карточка личности">
        {selected ? (
          <div className="manage-page__person-card-content">
            <div className="manage-page__person-card-header">
              <div className="manage-page__person-card-title">Карточка</div>
              <div className="manage-page__person-card-actions">
                <button
                  className="manage-page__person-card-edit-btn"
                  onClick={() => {
                    if (!isAuthenticated || !user?.email_verified) {
                      setShowAuthModal(true)
                      return
                    }
                    if (selected?.status === 'pending') {
                      setShowEditWarning(true)
                      return
                    }
                    setIsEditing(true)
                  }}
                >
                  Редактировать
                </button>
                <button
                  className="manage-page__person-card-add-btn"
                  onClick={() => {
                    if (!isAuthenticated || !user?.email_verified) {
                      setShowAuthModal(true)
                      return
                    }
                    if (selected) addToList.openForPerson(selected)
                  }}
                >
                  Добавить в список
                </button>
              </div>
            </div>
            <PersonCard
              key={selected.id}
              person={selected}
              getGroupColor={getGroupColor}
              getPersonGroup={(person) => getPersonGroup(person, 'category')}
              getCategoryColor={getGroupColor}
              onAddAchievement={(p) => {
                if (!isAuthenticated || !user?.email_verified) {
                  setShowAuthModal(true)
                  return
                }
                setCreateType('achievement')
                setShowCreate(true)
              }}
            />
          </div>
        ) : (
          <div className="manage-page__person-card-empty">Выберите личность слева</div>
        )}
      </div>
    </div>
  )
}

