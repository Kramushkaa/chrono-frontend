import React from 'react'
import { PersonsColumns } from './PersonsColumns'

type ListItem = { id: number; title: string; items_count?: number; readonly?: boolean }

interface PersonsSectionProps {
  // Sidebar
  sidebarCollapsed: boolean
  setSidebarCollapsed: (updater: (prev: boolean) => boolean) => void
  menuSelection: string
  setMenuSelection: (sel: any) => void
  isModerator: boolean
  personsPendingCount: number | null
  personsMineCount: number | null
  personLists: ListItem[]
  isAuthenticated: boolean
  setShowAuthModal: (b: boolean) => void
  setShowCreateList: (b: boolean) => void
  sharedList: { id: number; title: string; owner_user_id?: string } | null
  selectedListId: number | null
  setSelectedListId: (id: number | null) => void
  loadUserLists: (force?: boolean) => Promise<void>
  showToast: (m: string, t?: 'success' | 'error' | 'info') => void

  // Persons data/controls
  searchPersons: string
  setSearchPersons: (v: string) => void
  categories: string[]
  countries: string[]
  filters: any
  setFilters: any
  personsAll: any[]
  isPersonsLoadingAll: boolean
  personsHasMoreAll: boolean
  loadMorePersonsAll: () => void
  personsAlt: any[]
  personsAltLoading: boolean
  personsAltHasMore: boolean
  setPersonsAltOffset: (updater: (prev: number) => number) => void
  onSelect: (p: any) => void
  personsMode: 'all' | 'pending' | 'mine' | 'list'

  // List mode
  listLoading: boolean
  listItems: any[]
}

export function PersonsSection(props: PersonsSectionProps) {
  const {
    sidebarCollapsed,
    setSidebarCollapsed,
    menuSelection,
    setMenuSelection,
    isModerator,
    personsPendingCount,
    personsMineCount,
    personLists,
    isAuthenticated,
    setShowAuthModal,
    setShowCreateList,
    sharedList,
    selectedListId,
    setSelectedListId,
    loadUserLists,
    showToast,
    searchPersons,
    setSearchPersons,
    categories,
    countries,
    filters,
    setFilters,
    personsAll,
    isPersonsLoadingAll,
    personsHasMoreAll,
    loadMorePersonsAll,
    personsAlt,
    personsAltLoading,
    personsAltHasMore,
    setPersonsAltOffset,
    onSelect
  } = props

  return (
    <PersonsColumns
      sidebarCollapsed={sidebarCollapsed}
      setSidebarCollapsed={setSidebarCollapsed}
      menuSelection={menuSelection}
      setMenuSelection={setMenuSelection}
      isModerator={isModerator}
      personsPendingCount={personsPendingCount}
      personsMineCount={personsMineCount}
      personLists={personLists}
      isAuthenticated={isAuthenticated}
      setShowAuthModal={setShowAuthModal}
      setShowCreateList={setShowCreateList}
      sharedList={sharedList}
      selectedListId={selectedListId}
      setSelectedListId={setSelectedListId}
      loadUserLists={loadUserLists}
      showToast={showToast}
      personsMode={props.personsMode}
      searchPersons={searchPersons}
      setSearchPersons={setSearchPersons}
      categories={categories}
      countries={countries}
      filters={filters}
      setFilters={setFilters}
      personsAll={personsAll}
      isPersonsLoadingAll={isPersonsLoadingAll}
      personsHasMoreAll={personsHasMoreAll}
      loadMorePersonsAll={loadMorePersonsAll}
      personsAlt={personsAlt}
      personsAltLoading={personsAltLoading}
      personsAltHasMore={personsAltHasMore}
      setPersonsAltOffset={setPersonsAltOffset}
      onSelect={onSelect}
      listLoading={props.listLoading}
      listItems={props.listItems}
    />
  )
}


