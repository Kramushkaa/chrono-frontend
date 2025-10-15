import React from 'react'
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
import { apiFetch, apiData } from 'shared/api/api'
import '../styles/manage-page.css'
import { ContactFooter } from 'shared/ui/ContactFooter'
import { SEO } from 'shared/ui/SEO'

export default function ManagePage() {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const { showToast } = useToast()
  const isModerator = !!user && (user.role === 'admin' || user.role === 'moderator')

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

  // State management
  const state = useManageState()

  // Modals management
  const modals = useManageModals()

  // Data fetching
  const dataManager = useManagePageData(state.activeTab, state.menuSelection, isAuthenticated, filters)

  // Lists management
  const { personLists, sharedList, loadUserLists } = useLists({
    isAuthenticated,
    userId: user?.id ? String(user.id) : null,
    apiData,
  })

  const addToList = useAddToList({
    showToast,
    reloadLists: (force?: boolean) => loadUserLists.current?.(force),
    getSelectedPerson: () => (state.selected ? { id: state.selected.id } : null),
    apiFetch,
    apiData,
  })

  // Business logic (useEffects and computed values)
  const { countrySelectOptions, categorySelectOptions } = useManageBusinessLogic({
    selected: state.selected,
    setSelected: state.setSelected,
    categories: state.categories,
    setCategories: state.setCategories,
    countries: state.countries,
    setCountries: state.setCountries,
    countryOptions: state.countryOptions,
    setCountryOptions: state.setCountryOptions,
    lifePeriods: state.lifePeriods,
    setLifePeriods: state.setLifePeriods,
    editPersonCategory: state.editPersonCategory,
    setEditPersonCategory: state.setEditPersonCategory,
    editBirthYear: state.editBirthYear,
    setEditBirthYear: state.setEditBirthYear,
    editDeathYear: state.editDeathYear,
    setEditDeathYear: state.setEditDeathYear,
    newLifePeriods: state.newLifePeriods,
    setNewLifePeriods: state.setNewLifePeriods,
    showCreate: modals.showCreate,
    createType: modals.createType,
    activeTab: state.activeTab,
    menuSelection: state.menuSelection,
    selectedListId: state.selectedListId,
    setSelectedListId: state.setSelectedListId,
    mineCounts: state.mineCounts,
    setMineCounts: state.setMineCounts,
    countsLoadKeyRef: state.countsLoadKeyRef,
    countsLastTsRef: state.countsLastTsRef,
    fetchedDetailsIdsRef: state.fetchedDetailsIdsRef,
    lastSelectedRef: state.lastSelectedRef,
    listItems: state.listItems,
    setListItems: state.setListItems,
    listItemIdByDomainIdRef: state.listItemIdByDomainIdRef,
    listLoading: state.listLoading,
    setListLoading: state.setListLoading,
    isAuthenticated,
    user,
    resetPersons: dataManager.resetPersons,
    resetAchievements: dataManager.resetAchievements,
    resetPeriods: dataManager.resetPeriods,
    sharedList,
  })

  // Handler for deleting list item
  const handleDeleteListItem = async (listItemId: number) => {
    if (!state.selectedListId) return
    try {
      const ok = await apiFetch(`/api/lists/${state.selectedListId}/items/${listItemId}`, { method: 'DELETE' })
      if (ok.ok) {
        state.setListItems((prev) => prev.filter((x) => x.listItemId !== listItemId))
        await loadUserLists.current?.(true)
        showToast('Удалено из списка', 'success')
      } else {
        showToast('Не удалось удалить', 'error')
      }
    } catch (e) {
      showToast('Ошибка при удалении', 'error')
    }
  }

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
          isScrolled={state.isScrolled}
          showControls={state.showControls}
          setShowControls={state.setShowControls}
          filters={filters}
          setFilters={setFilters}
          groupingType={groupingType}
          setGroupingType={setGroupingType}
          allCategories={state.categories}
          allCountries={state.countries}
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
              if (state.selected) addToList.openForPerson(state.selected)
            },
          }}
        >
          <div className="manage-page__content">
            <AdaptiveTabs
              activeTab={state.activeTab}
              setActiveTab={state.setActiveTab}
              sidebarCollapsed={state.sidebarCollapsed}
              setSidebarCollapsed={state.setSidebarCollapsed}
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
                if (state.activeTab === 'persons') {
                  modals.setCreateType('person')
                } else if (state.activeTab === 'achievements') {
                  modals.setCreateType('achievement')
                } else if (state.activeTab === 'periods') {
                  modals.setCreateType('period')
                }
                modals.setShowCreate(true)
              }}
            />

            {state.activeTab === 'persons' && (
              <PersonsTab
                sidebarCollapsed={state.sidebarCollapsed}
                menuSelection={state.menuSelection}
                setMenuSelection={state.setMenuSelection}
                isModerator={isModerator}
                mineCounts={state.mineCounts}
                sharedList={sharedList}
                personLists={personLists}
                isAuthenticated={isAuthenticated}
                setShowAuthModal={modals.setShowAuthModal}
                setShowCreateList={modals.setShowCreateList}
                setShowCreate={modals.setShowCreate}
                createType={modals.createType}
                setCreateType={modals.setCreateType}
                selectedListId={state.selectedListId}
                setSelectedListId={state.setSelectedListId}
                loadUserLists={async (force?: boolean) => { await loadUserLists.current?.(force) }}
                showToast={showToast}
                listItems={state.listItems}
                listLoading={state.listLoading}
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
                categories={state.categories}
                countries={state.countries}
                filters={filters}
                setFilters={setFilters}
                statusFilters={dataManager.statusFilters}
                setStatusFilters={dataManager.setStatusFilters}
                listItemIdByDomainIdRef={state.listItemIdByDomainIdRef}
                handleDeleteListItem={handleDeleteListItem}
                selected={state.selected}
                setSelected={state.setSelected}
                addToList={addToList}
                user={user}
                setIsEditing={modals.setIsEditing}
                setShowEditWarning={modals.setShowEditWarning}
              />
            )}

            {state.activeTab === 'achievements' && (
              <AchievementsTab
                sidebarCollapsed={state.sidebarCollapsed}
                menuSelection={state.menuSelection}
                setMenuSelection={state.setMenuSelection}
                isModerator={isModerator}
                mineCounts={state.mineCounts}
                sharedList={sharedList}
                personLists={personLists}
                isAuthenticated={isAuthenticated}
                setShowAuthModal={modals.setShowAuthModal}
                setShowCreateList={modals.setShowCreateList}
                setShowCreate={modals.setShowCreate}
                createType={modals.createType}
                setCreateType={modals.setCreateType}
                selectedListId={state.selectedListId}
                setSelectedListId={state.setSelectedListId}
                loadUserLists={async (force?: boolean) => { await loadUserLists.current?.(force) }}
                showToast={showToast}
                listItems={state.listItems}
                listLoading={state.listLoading}
                achievementsData={dataManager.achievementsData}
                achievementsMineData={dataManager.achievementsMineData}
                searchAch={dataManager.searchAch}
                setSearchAch={dataManager.setSearchAch}
                filters={filters}
                setFilters={setFilters}
                achStatusFilters={dataManager.achStatusFilters}
                setAchStatusFilters={dataManager.setAchStatusFilters}
                listItemIdByDomainIdRef={state.listItemIdByDomainIdRef}
                handleDeleteListItem={handleDeleteListItem}
                addToList={addToList}
              />
            )}

            {state.activeTab === 'periods' && (
              <PeriodsTab
                sidebarCollapsed={state.sidebarCollapsed}
                menuSelection={state.menuSelection}
                setMenuSelection={state.setMenuSelection}
                isModerator={isModerator}
                mineCounts={state.mineCounts}
                sharedList={sharedList}
                personLists={personLists}
                isAuthenticated={isAuthenticated}
                setShowAuthModal={modals.setShowAuthModal}
                setShowCreateList={modals.setShowCreateList}
                setShowCreate={modals.setShowCreate}
                createType={modals.createType}
                setCreateType={modals.setCreateType}
                selectedListId={state.selectedListId}
                setSelectedListId={state.setSelectedListId}
                loadUserLists={async (force?: boolean) => { await loadUserLists.current?.(force) }}
                showToast={showToast}
                listItems={state.listItems}
                listLoading={state.listLoading}
                periodsData={dataManager.periodsData}
                periodsMineData={dataManager.periodsMineData}
                searchPeriods={dataManager.searchPeriods}
                setSearchPeriods={dataManager.setSearchPeriods}
                filters={filters}
                setFilters={setFilters}
                periodsStatusFilters={dataManager.periodsStatusFilters}
                setPeriodsStatusFilters={dataManager.setPeriodsStatusFilters}
                listItemIdByDomainIdRef={state.listItemIdByDomainIdRef}
                handleDeleteListItem={handleDeleteListItem}
                addToList={addToList}
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
              categories={state.categories}
              countryOptions={state.countryOptions}
              categorySelectOptions={categorySelectOptions}
              countrySelectOptions={countrySelectOptions}
              selected={state.selected}
              setSelected={state.setSelected}
              lifePeriods={state.lifePeriods}
              setLifePeriods={state.setLifePeriods}
              editBirthYear={state.editBirthYear}
              setEditBirthYear={state.setEditBirthYear}
              editDeathYear={state.editDeathYear}
              setEditDeathYear={state.setEditDeathYear}
              editPersonCategory={state.editPersonCategory}
              setEditPersonCategory={state.setEditPersonCategory}
              personLists={personLists}
              isAuthenticated={isAuthenticated}
              user={user}
              isModerator={isModerator}
              addToList={addToList}
              showToast={showToast}
              resetPersons={dataManager.resetPersons}
              resetAchievements={dataManager.resetAchievements}
              resetPeriods={dataManager.resetPeriods}
              loadUserLists={(force?: boolean) => loadUserLists.current?.(force)}
              navigate={navigate}
            />
          </div>
        </ManageUIProvider>
      </div>

      <div style={{ height: 56 }} />
      <ContactFooter fixed />
    </div>
  )
}
