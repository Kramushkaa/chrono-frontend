import React from 'react'
import { ManageSection } from 'shared/ui/ManageSection'
import { SearchAndFilters } from 'shared/ui/SearchAndFilters'
import { ItemsList } from 'shared/ui/ItemsList'
import { ListItemsView } from 'shared/ui/ListItemsView'
import { deleteListItem } from 'shared/utils/lists'

type ListItem = { id: number; title: string; items_count?: number; readonly?: boolean }

interface PeriodsSectionProps {
	// Sidebar
	sidebarCollapsed: boolean
	setSidebarCollapsed: (updater: (prev: boolean) => boolean) => void
	menuSelection: string
	setMenuSelection: (sel: any) => void
	isModerator: boolean
	personLists: ListItem[]
	isAuthenticated: boolean
	setShowAuthModal: (b: boolean) => void
	setShowCreateList: (b: boolean) => void
	sharedList: { id: number; title: string; owner_user_id?: string } | null
	selectedListId: number | null
	setSelectedListId: (id: number | null) => void
	loadUserLists: (force?: boolean) => Promise<void>
	showToast: (m: string, t?: 'success' | 'error' | 'info') => void

	// Periods data/controls
	searchPeriods: string
	setSearchPeriods: (v: string) => void
	periodType: 'life' | 'ruler' | ''
	setPeriodType: (v: 'life' | 'ruler' | '') => void
	periodItemsAll: any[]
	periodsLoadingAll: boolean
	periodsHasMoreAll: boolean
	loadMorePeriodsAll: () => void
	
	// Add support for periods 'mine' mode
	periodsMineCount: number | null
	periodItemsMine: any[]
	periodsLoadingMine: boolean
	periodsHasMoreMine: boolean

	// List mode
	listLoading: boolean
	listItems: Array<{ key: string; listItemId: number; type: 'person' | 'achievement' | 'period'; title: string; subtitle?: string }>
	setListItems: (updater: (prev: any[]) => any[]) => void
  openAddPeriod: (id: number) => void
}

export function PeriodsSection(props: PeriodsSectionProps) {
	const {
		sidebarCollapsed,
		setSidebarCollapsed,
		menuSelection,
		setMenuSelection,
		isModerator,
		periodsMineCount,
		personLists,
		isAuthenticated,
		setShowAuthModal,
		setShowCreateList,
		sharedList,
		selectedListId,
		setSelectedListId,
		loadUserLists,
		showToast,
		searchPeriods,
		setSearchPeriods,
		periodType,
		setPeriodType,
		periodItemsAll,
		periodsLoadingAll,
		periodsHasMoreAll,
		loadMorePeriodsAll,
		periodItemsMine,
		periodsLoadingMine,
		periodsHasMoreMine,
		listLoading,
		listItems,
		setListItems,
		openAddPeriod
	} = props

	return (
		<ManageSection
			sidebarCollapsed={sidebarCollapsed}
			setSidebarCollapsed={setSidebarCollapsed}
			menuSelection={menuSelection}
			setMenuSelection={setMenuSelection}
			isModerator={isModerator}
			pendingCount={null}
			mineCount={periodsMineCount}
			personLists={personLists}
			isAuthenticated={isAuthenticated}
			emailVerified={true}
			setShowAuthModal={setShowAuthModal}
			setShowCreateList={setShowCreateList}
			sharedList={sharedList}
			selectedListId={selectedListId}
			setSelectedListId={setSelectedListId}
			loadUserLists={loadUserLists}
			showToast={showToast}
			listLoading={listLoading}
			listItems={listItems}
			filterType="period"
			onDeleteListItem={async (listItemId) => {
				if (!selectedListId) return
				const ok = await deleteListItem(selectedListId, listItemId)
				if (ok) { 
					setListItems(prev => prev.filter(x => x.listItemId !== listItemId))
					await loadUserLists()
					showToast('Удалено из списка', 'success')
				} else { 
					showToast('Не удалось удалить', 'error')
				}
			}}
		>
			<div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
				{!(menuSelection as string).startsWith('list:') && (
					<SearchAndFilters
						searchValue={searchPeriods}
						onSearchChange={setSearchPeriods}
						searchPlaceholder="Поиск по имени/стране"
						filters={[
							{
								key: 'periodType',
								label: 'Тип периода',
								value: periodType,
								options: [
									{ value: '', label: 'Все типы' },
									{ value: 'ruler', label: 'Правление' },
									{ value: 'life', label: 'Жизнь' },
								],
								onChange: (value: string) => setPeriodType(value as 'life' | 'ruler' | '')
							}
						]}
						foundCount={menuSelection === 'all' ? periodItemsAll.length : periodItemsMine.length}
						hasMore={!(menuSelection === 'all' ? periodsLoadingAll : periodsLoadingMine) && (menuSelection === 'all' ? periodsHasMoreAll : periodsHasMoreMine)}
						isLoading={menuSelection === 'all' ? periodsLoadingAll : periodsLoadingMine}
					/>
				)}
				{!(menuSelection as string).startsWith('list:') ? (
					<ItemsList
						items={(menuSelection === 'all' ? periodItemsAll : periodItemsMine).map((p: any) => {
							const personName = p.person_name ?? p.personName ?? ''
							const countryName = p.country_name ?? p.countryName ?? ''
							const type = p.period_type ?? p.periodType
							const start = p.start_year ?? p.startYear
							const end = p.end_year ?? p.endYear
							const headerParts: string[] = []
							if (personName) headerParts.push(personName)
							if (countryName) headerParts.push(countryName)
							const header = headerParts.join(' • ')
							
							return {
								id: p.id ?? `${personName}-${start}-${end}`,
								title: header || '—',
								type: type === 'ruler' ? 'Правление' : type === 'life' ? 'Жизнь' : (type || '—'),
								startYear: start,
								endYear: end
							}
						})}
						isLoading={menuSelection === 'all' ? periodsLoadingAll : periodsLoadingMine}
						hasMore={menuSelection === 'all' ? periodsHasMoreAll : periodsHasMoreMine}
						onLoadMore={() => {
							if (menuSelection === 'all') {
								loadMorePeriodsAll()
							}
							// Note: mine mode pagination is handled by the parent component
						}}
						onAddToList={(id) => {
							if (!isAuthenticated) { 
								setShowAuthModal(true)
								return
							}
							openAddPeriod(Number(id))
						}}
						isAuthenticated={isAuthenticated}
						emailVerified={true}
						showAuthModal={() => setShowAuthModal(true)}
						showToast={showToast}
						emptyMessage={!periodsLoadingMine && menuSelection === 'mine' && periodItemsMine.length === 0 
							? "Здесь будут отображаться созданные или отредактированные вами элементы"
							: "Периоды не найдены"
						}
						loadingMessage="Загрузка..."
					/>
				) : (
					<ListItemsView
						items={listItems as any}
						filterType="period"
						isLoading={listLoading}
						emptyText="Список пуст"
						onDelete={async (listItemId) => {
							if (!selectedListId) return
							const ok = await deleteListItem(selectedListId, listItemId)
							if (ok) { setListItems(prev => prev.filter(x => x.listItemId !== listItemId)); await loadUserLists(); showToast('Удалено из списка', 'success') }
							else { showToast('Не удалось удалить', 'error') }
						}}
					/>
				)}
			</div>
		</ManageSection>
	)
}



