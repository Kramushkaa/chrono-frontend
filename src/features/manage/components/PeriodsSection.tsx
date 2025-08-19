import React from 'react'
import { ManageSection } from 'shared/ui/ManageSection'
import { ItemsList } from 'shared/ui/ItemsList'

import { FilterDropdown } from 'shared/ui/FilterDropdown'
import { deleteListItem } from 'shared/utils/lists'

type ListItem = { id: number; title: string; items_count?: number; readonly?: boolean }

interface PeriodsSectionProps {
	// Sidebar
	sidebarCollapsed: boolean
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
  
  // Status filters for 'mine' mode
	statusFilters: Record<string, boolean>
	setStatusFilters: (filters: Record<string, boolean>) => void
}

export function PeriodsSection(props: PeriodsSectionProps) {
	const {
		sidebarCollapsed,
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
		openAddPeriod,
		statusFilters,
		setStatusFilters
	} = props

	// Derive mode from menuSelection
	const modeIsList = (menuSelection as any as string).startsWith('list:')
	const modeIsAll = menuSelection === ('all' as any)
	const modeIsMine = menuSelection === ('mine' as any)

	// Local UI state for period type dropdown selection to fully reuse FilterDropdown logic
	const [selectedPeriodTypes, setSelectedPeriodTypes] = React.useState<string[]>(() => {
		if (periodType === 'ruler') return ['Правление']
		if (periodType === 'life') return ['Жизнь']
		return []
	})

	// Keep local selection in sync if parent periodType changes externally
	React.useEffect(() => {
		if (periodType === 'ruler') {
			setSelectedPeriodTypes(['Правление'])
		} else if (periodType === 'life') {
			setSelectedPeriodTypes(['Жизнь'])
		} else {
			// Если сверху пришёл сброс (все типы), не очищаем визуальные галочки,
			// если пользователь явно выбрал оба варианта — сохраняем обе отметки.
			setSelectedPeriodTypes(prev => (prev.length === 2 ? prev : []))
		}
	}, [periodType])

	return (
		<ManageSection
			sidebarCollapsed={sidebarCollapsed}
			menuSelection={menuSelection}
			setMenuSelection={setMenuSelection}
			isModerator={isModerator}
			pendingCount={null}
			mineCount={periodsMineCount}
			personLists={personLists}
			isAuthenticated={isAuthenticated}
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
			{!modeIsList && (
				<>
					{modeIsMine && (
						<div style={{ marginBottom: 12, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
							<FilterDropdown
								title="📋 Статус"
								textLabel="Статус"
								items={['🟡 Черновики', '🟠 На модерации', '🟢 Одобренные', '🔴 Отклоненные']}
								selectedItems={Object.entries(statusFilters)
									.filter(([_, checked]) => checked)
									.map(([status, _]) => {
										switch (status) {
											case 'draft': return '🟡 Черновики'
											case 'pending': return '🟠 На модерации'
											case 'approved': return '🟢 Одобренные'
											case 'rejected': return '🔴 Отклоненные'
											default: return status
										}
									})}
								onSelectionChange={(statuses) => {
									const statusMap = {
										'🟡 Черновики': 'draft',
										'🟠 На модерации': 'pending',
										'🟢 Одобренные': 'approved',
										'🔴 Отклоненные': 'rejected'
									}
									const selectedKeys = statuses.map(s => statusMap[s as keyof typeof statusMap]).filter(Boolean)
									const newFilters = {
										draft: selectedKeys.includes('draft'),
										pending: selectedKeys.includes('pending'),
										approved: selectedKeys.includes('approved'),
										rejected: selectedKeys.includes('rejected')
									}
									setStatusFilters(newFilters)
								}}
								getItemColor={(item) => {
									if (item.includes('Черновики')) return '#ffc107'      // жёлтый
									if (item.includes('модерации')) return '#fd7e14'      // оранжевый  
									if (item.includes('Одобренные')) return '#28a745'     // зелёный
									if (item.includes('Отклоненные')) return '#dc3545'    // красный
									return '#f4e4c1'
								}}
							/>
						</div>
					)}

					<div className="search-and-filters" role="region" aria-label="Фильтр и поиск" style={{ marginBottom: 12 }}>
						<div className="search-and-filters__controls" style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
							<input
								className="search-and-filters__input"
								value={searchPeriods}
								onChange={(e) => setSearchPeriods(e.target.value)}
								placeholder="Поиск по имени/стране"
								style={{ flex: '1 1 180px', minWidth: 180, maxWidth: '100%', padding: 6 }}
							/>
							<FilterDropdown
								title="🕰"
								textLabel="Тип периода"
								items={[ 'Правление', 'Жизнь' ]}
								selectedItems={selectedPeriodTypes}
								onSelectionChange={(selected) => {
									const next = Array.isArray(selected) ? (selected as string[]) : []
									setSelectedPeriodTypes(next)
									// При двух выбранных вариантах оставляем визуальные галочки и сбрасываем periodType (все типы)
									if (next.length === 2) { setPeriodType(''); return }
									if (next.length === 1) { setPeriodType(next[0] === 'Правление' ? 'ruler' : 'life'); return }
									setPeriodType('')
								}}
								getItemColor={() => '#f4e4c1'}
							/>
						</div>
						<div className="search-and-filters__count" style={{ fontSize: 12, opacity: 0.8 }}>
							Найдено: {modeIsAll ? periodItemsAll.length : periodItemsMine.length}{!(modeIsAll ? periodsLoadingAll : periodsLoadingMine) && (modeIsAll ? periodsHasMoreAll : periodsHasMoreMine) ? '+' : ''}
						</div>
					</div>
					
					<ItemsList
						items={(modeIsAll ? periodItemsAll : periodItemsMine).map((p: any) => {
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
						isLoading={modeIsAll ? periodsLoadingAll : periodsLoadingMine}
						hasMore={modeIsAll ? periodsHasMoreAll : periodsHasMoreMine}
						onLoadMore={() => {
							if (modeIsAll) {
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
						emptyMessage={!periodsLoadingMine && modeIsMine && periodItemsMine.length === 0 
							? "Здесь будут отображаться созданные или отредактированные вами элементы"
							: "Периоды не найдены"
						}
						loadingMessage="Загрузка..."
					/>
				</>
			)}
		</ManageSection>
	)
}



