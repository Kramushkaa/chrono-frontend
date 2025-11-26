import React, { useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFilters } from '../../../shared/hooks/useFilters'
import { getGroupColor } from 'features/persons/utils/groupingUtils'
import { ManageHeader } from 'shared/layout/headers/ManageHeader'
import { useLists } from 'features/manage/hooks/useLists'
import { useAddToList } from 'features/manage/hooks/useAddToList'
import { useAuth } from 'shared/context/AuthContext'
import { useToast } from 'shared/context/ToastContext'
import { AdaptiveTabs } from 'features/manage/components/AdaptiveTabs'
import { ManageUIProvider } from 'features/manage/context/ManageUIContext'
import { useManagePageData } from '../hooks/useManagePageData'
import { useManageState } from '../hooks/useManageState'
import { useManageModals } from '../hooks/useManageModals'
import { useManageBusinessLogic } from '../hooks/useManageBusinessLogic'
import { PersonsTab } from '../components/PersonsTab'
import { AchievementsTab } from '../components/AchievementsTab'
import { PeriodsTab } from '../components/PeriodsTab'
import { ManageModals } from '../components/ManageModals'
import { apiFetch, apiData } from 'shared/api/core'
import '../styles/manage-page.css'
import { ContactFooter } from 'shared/ui/ContactFooter'
import { SEO } from 'shared/ui/SEO'
import type { UserList } from 'shared/types'
import { ListModerationModal } from '../components/ListModerationModal'
import { featureFlags } from 'shared/config/features'
import {
  ManageStateProvider,
  useManageCounts,
  useManageSidebar,
  useListSelection,
  usePersonEditorState,
} from '../context/ManageStateContext'

export default function ManagePage() {
  const manageState = useManageState()
  return (
    <ManageStateProvider value={manageState}>
      <ManagePageContent />
    </ManageStateProvider>
  )
}

function ManagePageContent() {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const { showToast } = useToast()
  const isModerator = !!user && (user.role === 'admin' || user.role === 'moderator')
  const publicListsEnabled = featureFlags.publicLists

  const {
    filters,
    setFilters,
    groupingType,
    setGroupingType,
    yearInputs,
    setYearInputs,
    applyYearFilter,
    handleYearKeyPress,
    resetAllFilters,
  } = useFilters()

  const sidebar = useManageSidebar()
  const selection = useListSelection()
  const personEditor = usePersonEditorState()
  const counts = useManageCounts()

  // Modals management
  const modals = useManageModals()

  // Data fetching
  const dataManager = useManagePageData(selection.activeTab, selection.menuSelection, isAuthenticated, filters)

  // Lists management
  const { personLists, setPersonLists, sharedList, loadUserLists } = useLists({
    isAuthenticated,
    userId: user?.id ? String(user.id) : null,
    apiData,
  })

  const addToList = useAddToList({
    showToast,
    reloadLists: (force?: boolean) => loadUserLists.current?.(force),
    getSelectedPerson: () => (personEditor.selected ? { id: personEditor.selected.id } : null),
    apiFetch,
    apiData,
  })

  const currentUserId = user?.id ?? null

  const handleListMetaUpdate = useCallback(
    (updatedList: UserList) => {
      setPersonLists((prev) => prev.map((lst) => (lst.id === updatedList.id ? { ...lst, ...updatedList } : lst)))
    },
    [setPersonLists]
  )

  const [showListsModeration, setShowListsModeration] = React.useState(false)

  // Business logic (useEffects and computed values)
  const { countrySelectOptions, categorySelectOptions } = useManageBusinessLogic({
    isAuthenticated,
    user,
    resetPersons: dataManager.resetPersons,
    resetAchievements: dataManager.resetAchievements,
    resetPeriods: dataManager.resetPeriods,
    sharedList,
  })

  // Handler for deleting list item
  const handleDeleteListItem = useCallback(async (listItemId: number) => {
    if (!selection.selectedListId) return
    try {
      const ok = await apiFetch(`/api/lists/${selection.selectedListId}/items/${listItemId}`, { method: 'DELETE' })
      if (ok.ok) {
        selection.setListItems(prev => prev.filter(x => x.listItemId !== listItemId))
        await loadUserLists.current?.(true)
        showToast('Удалено из списка', 'success')
      } else {
        showToast('Не удалось удалить', 'error')
      }
    } catch (e) {
      showToast('Ошибка при удалении', 'error')
    }
  }, [selection.selectedListId, selection.setListItems, loadUserLists, showToast])

  return (
    <div
      className="app manage-page"
      id="chrononinja-manage"
      role="main"
      aria-label="Управление контентом"
    >
      <SEO
        title="Управление списками — Хронониндзя"
        description="Создавайте и управляйте своими списками исторических личностей, достижений и периодов."
        canonical={typeof window !== 'undefined' ? window.location.origin + '/lists' : undefined}
        image={typeof window !== 'undefined' ? window.location.origin + '/og-image.jpg' : undefined}
      />
      <React.Suspense fallback={<div />}>
        <ManageHeader
          isScrolled={sidebar.isScrolled}
          showControls={sidebar.showControls}
          setShowControls={sidebar.setShowControls}
          filters={filters}
          setFilters={setFilters}
          groupingType={groupingType}
          setGroupingType={setGroupingType}
          allCategories={personEditor.categories}
          allCountries={personEditor.countries}
          yearInputs={yearInputs}
          setYearInputs={setYearInputs}
          applyYearFilter={applyYearFilter}
          handleYearKeyPress={handleYearKeyPress}
          resetAllFilters={resetAllFilters}
          getCategoryColor={getGroupColor}
          sortedData={[]}
          handleSliderMouseDown={() => {}}
          handleSliderMouseMove={() => {}}
          handleSliderMouseUp={() => {}}
          isDraggingSlider={false}
          onBackToMenu={() => navigate('/menu')}
        />
      </React.Suspense>

      <div className="manage-wrapper">
        <ManageUIProvider
          value={{
            openAddAchievement: (id: number) => addToList.openForAchievement(id),
            openAddPeriod: (id: number) => addToList.openForPeriod(id),
            openAddForSelectedPerson: () => {
              if (personEditor.selected) addToList.openForPerson(personEditor.selected)
            },
          }}
        >
          <div className="manage-page__content">
            {isModerator && publicListsEnabled && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
                <button
                  onClick={() => setShowListsModeration(true)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 8,
                    border: '1px solid rgba(139,69,19,0.5)',
                    background: 'rgba(139,69,19,0.2)',
                    color: '#2c1810',
                    fontWeight: 600,
                  }}
                >
                  Модерация списков
                </button>
              </div>
            )}
            <AdaptiveTabs
              activeTab={selection.activeTab}
              setActiveTab={selection.setActiveTab}
              sidebarCollapsed={sidebar.sidebarCollapsed}
              setSidebarCollapsed={sidebar.setSidebarCollapsed}
              isAuthenticated={isAuthenticated}
              userEmailVerified={user?.email_verified}
              onAddClick={() => {
                if (!isAuthenticated) {
                  modals.setShowAuthModal(true)
                  return
                }
                if (!user?.email_verified) {
                  modals.setShowAuthModal(true)
                  return
                }
                if (selection.activeTab === 'persons') {
                  modals.setCreateType('person')
                } else if (selection.activeTab === 'achievements') {
                  modals.setCreateType('achievement')
                } else if (selection.activeTab === 'periods') {
                  modals.setCreateType('period')
                }
                modals.setShowCreate(true)
              }}
            />

            {selection.activeTab === 'persons' && (
              <PersonsTab
                sidebarCollapsed={sidebar.sidebarCollapsed}
                menuSelection={selection.menuSelection}
                setMenuSelection={selection.setMenuSelection}
                isModerator={isModerator}
                mineCounts={counts.mineCounts}
                sharedList={sharedList}
                personLists={personLists}
                isAuthenticated={isAuthenticated}
                setShowAuthModal={modals.setShowAuthModal}
                setShowCreateList={modals.setShowCreateList}
                setShowCreate={modals.setShowCreate}
                createType={modals.createType}
                setCreateType={modals.setCreateType}
                selectedListId={selection.selectedListId}
                setSelectedListId={selection.setSelectedListId}
                loadUserLists={async (force?: boolean) => { await loadUserLists.current?.(force) }}
                showToast={showToast}
                listItems={selection.listItems}
                listLoading={selection.listLoading}
                personsAlt={dataManager.personsAlt}
                personsAltLoading={dataManager.personsAltLoading}
                personsAltInitialLoading={dataManager.personsAltInitialLoading}
                personsAltHasMore={dataManager.personsAltHasMore}
                loadMorePersonsAlt={dataManager.loadMorePersonsAlt}
                personsAll={dataManager.personsAll}
                isPersonsLoadingAll={dataManager.isPersonsLoadingAll}
                personsHasMoreAll={dataManager.personsHasMoreAll}
                loadMorePersonsAll={dataManager.loadMorePersonsAll}
                searchPersons={dataManager.searchPersons}
                setSearchPersons={dataManager.setSearchPersons}
                categories={personEditor.categories}
                countries={personEditor.countries}
                filters={filters}
                setFilters={setFilters}
                statusFilters={dataManager.statusFilters}
                setStatusFilters={dataManager.setStatusFilters}
                listItemIdByDomainIdRef={selection.listItemIdByDomainIdRef}
                handleDeleteListItem={handleDeleteListItem}
                selected={personEditor.selected}
                setSelected={personEditor.setSelected}
                addToList={addToList}
                user={user}
                setIsEditing={modals.setIsEditing}
                setShowEditWarning={modals.setShowEditWarning}
                currentUserId={currentUserId}
                onListUpdated={handleListMetaUpdate}
                onOpenListPublication={
                  publicListsEnabled ? () => modals.setShowListPublication(true) : undefined
                }
              />
            )}

            {selection.activeTab === 'achievements' && (
              <AchievementsTab
                sidebarCollapsed={sidebar.sidebarCollapsed}
                menuSelection={selection.menuSelection}
                setMenuSelection={selection.setMenuSelection}
                isModerator={isModerator}
                mineCounts={counts.mineCounts}
                sharedList={sharedList}
                personLists={personLists}
                isAuthenticated={isAuthenticated}
                setShowAuthModal={modals.setShowAuthModal}
                setShowCreateList={modals.setShowCreateList}
                setShowCreate={modals.setShowCreate}
                createType={modals.createType}
                setCreateType={modals.setCreateType}
                selectedListId={selection.selectedListId}
                setSelectedListId={selection.setSelectedListId}
                loadUserLists={async (force?: boolean) => { await loadUserLists.current?.(force) }}
                showToast={showToast}
                listItems={selection.listItems}
                listLoading={selection.listLoading}
                achievementsData={dataManager.achievementsData}
                achievementsMineData={dataManager.achievementsMineData}
                searchAch={dataManager.searchAch}
                setSearchAch={dataManager.setSearchAch}
                filters={filters}
                setFilters={setFilters}
                achStatusFilters={dataManager.achStatusFilters}
                setAchStatusFilters={dataManager.setAchStatusFilters}
                listItemIdByDomainIdRef={selection.listItemIdByDomainIdRef}
                handleDeleteListItem={handleDeleteListItem}
                addToList={addToList}
                currentUserId={currentUserId}
                onListUpdated={handleListMetaUpdate}
                onOpenListPublication={
                  publicListsEnabled ? () => modals.setShowListPublication(true) : undefined
                }
                setIsEditingAchievement={modals.setIsEditingAchievement}
                setSelectedAchievement={modals.setSelectedAchievement}
              />
            )}

            {selection.activeTab === 'periods' && (
              <PeriodsTab
                sidebarCollapsed={sidebar.sidebarCollapsed}
                menuSelection={selection.menuSelection}
                setMenuSelection={selection.setMenuSelection}
                isModerator={isModerator}
                mineCounts={counts.mineCounts}
                sharedList={sharedList}
                personLists={personLists}
                isAuthenticated={isAuthenticated}
                setShowAuthModal={modals.setShowAuthModal}
                setShowCreateList={modals.setShowCreateList}
                setShowCreate={modals.setShowCreate}
                createType={modals.createType}
                setCreateType={modals.setCreateType}
                selectedListId={selection.selectedListId}
                setSelectedListId={selection.setSelectedListId}
                loadUserLists={async (force?: boolean) => { await loadUserLists.current?.(force) }}
                showToast={showToast}
                listItems={selection.listItems}
                listLoading={selection.listLoading}
                periodsData={dataManager.periodsData}
                periodsMineData={dataManager.periodsMineData}
                searchPeriods={dataManager.searchPeriods}
                setSearchPeriods={dataManager.setSearchPeriods}
                filters={filters}
                setFilters={setFilters}
                periodsStatusFilters={dataManager.periodsStatusFilters}
                setPeriodsStatusFilters={dataManager.setPeriodsStatusFilters}
                listItemIdByDomainIdRef={selection.listItemIdByDomainIdRef}
                handleDeleteListItem={handleDeleteListItem}
                addToList={addToList}
                currentUserId={currentUserId}
                onListUpdated={handleListMetaUpdate}
                onOpenListPublication={
                  publicListsEnabled ? () => modals.setShowListPublication(true) : undefined
                }
                setIsEditingPeriod={modals.setIsEditingPeriod}
                setSelectedPeriod={modals.setSelectedPeriod}
              />
            )}

            <ManageModals
              showAuthModal={modals.showAuthModal}
              setShowAuthModal={modals.setShowAuthModal}
              showCreate={modals.showCreate}
              setShowCreate={modals.setShowCreate}
              createType={modals.createType}
              isEditing={modals.isEditing}
              setIsEditing={modals.setIsEditing}
              showCreateList={modals.showCreateList}
              setShowCreateList={modals.setShowCreateList}
              showEditWarning={modals.showEditWarning}
              setShowEditWarning={modals.setShowEditWarning}
              isReverting={modals.isReverting}
              setIsReverting={modals.setIsReverting}
              showListPublication={publicListsEnabled ? modals.showListPublication : false}
              setShowListPublication={
                publicListsEnabled
                  ? modals.setShowListPublication
                  : (_show: boolean) => undefined
              }
              isEditingPeriod={modals.isEditingPeriod}
              setIsEditingPeriod={modals.setIsEditingPeriod}
              isEditingAchievement={modals.isEditingAchievement}
              setIsEditingAchievement={modals.setIsEditingAchievement}
              selectedPeriod={modals.selectedPeriod}
              setSelectedPeriod={modals.setSelectedPeriod}
              selectedAchievement={modals.selectedAchievement}
              setSelectedAchievement={modals.setSelectedAchievement}
              categories={personEditor.categories}
              countryOptions={personEditor.countryOptions}
              categorySelectOptions={categorySelectOptions}
              countrySelectOptions={countrySelectOptions}
              newLifePeriods={personEditor.newLifePeriods}
              setNewLifePeriods={personEditor.setNewLifePeriods}
              selected={personEditor.selected}
              setSelected={personEditor.setSelected}
              lifePeriods={personEditor.lifePeriods}
              setLifePeriods={personEditor.setLifePeriods}
              editBirthYear={personEditor.editBirthYear}
              setEditBirthYear={personEditor.setEditBirthYear}
              editDeathYear={personEditor.editDeathYear}
              setEditDeathYear={personEditor.setEditDeathYear}
              editPersonCategory={personEditor.editPersonCategory}
              setEditPersonCategory={personEditor.setEditPersonCategory}
              personLists={personLists}
              isAuthenticated={isAuthenticated}
              user={user}
              isModerator={isModerator}
              addToList={addToList}
              selectedListId={selection.selectedListId}
              currentUserId={currentUserId}
              showToast={showToast}
              resetPersons={dataManager.resetPersons}
              resetAchievements={dataManager.resetAchievements}
              resetPeriods={dataManager.resetPeriods}
              loadUserLists={(force?: boolean) => loadUserLists.current?.(force)}
              navigate={navigate}
              onListUpdated={handleListMetaUpdate}
            />
          </div>
        </ManageUIProvider>
      </div>

      <div style={{ height: 56 }} />
      <ContactFooter fixed />
      {publicListsEnabled && (
        <ListModerationModal
          isOpen={showListsModeration}
          onClose={() => setShowListsModeration(false)}
          showToast={showToast}
        />
      )}
    </div>
  )
}



