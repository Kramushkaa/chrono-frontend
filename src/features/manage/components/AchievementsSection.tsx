import React from 'react'
import { ManageSection } from 'shared/ui/ManageSection'
import { SearchAndFilters } from 'shared/ui/SearchAndFilters'
import { ItemsList } from 'shared/ui/ItemsList'
import { ListItemsView } from 'shared/ui/ListItemsView'
import { FilterDropdown } from 'shared/ui/FilterDropdown'
import { deleteListItem } from 'shared/utils/lists'

type AchievementItem = any

type ListItem = { id: number; title: string; items_count?: number }

interface AchievementsSectionProps {
	// Sidebar
	sidebarCollapsed: boolean
	menuSelection: string
	setMenuSelection: (sel: any) => void
	isModerator: boolean
	achPendingCount: number | null
	achMineCount: number | null
	personLists: ListItem[]
	isAuthenticated: boolean
	setShowAuthModal: (b: boolean) => void
	setShowCreateList: (b: boolean) => void
	sharedList: { id: number; title: string; owner_user_id?: string } | null
	selectedListId: number | null
	setSelectedListId: (id: number | null) => void
	loadUserLists: (force?: boolean) => Promise<void>
	showToast: (m: string, t?: 'success' | 'error' | 'info') => void

	// Achievements data/controls
	searchAch: string
	setSearchAch: (v: string) => void
	achItemsAll: AchievementItem[]
	achLoadingAll: boolean
	hasMoreAll: boolean
	loadMoreAll: () => void
	achItemsAlt: AchievementItem[]
	achAltLoading: boolean
	achAltHasMore: boolean

	// Add to list (callbacks provided by parent)
	openAddAchievement: (id: number) => void
	openAddForSelectedPerson: () => void

	// List mode
	listLoading: boolean
	listItems: Array<{ key: string; listItemId: number; type: 'person' | 'achievement' | 'period'; title: string; subtitle?: string }>
	setListItems: (updater: (prev: any[]) => any[]) => void
	
	// Status filters for 'mine' mode
	statusFilters: Record<string, boolean>
	setStatusFilters: (filters: Record<string, boolean>) => void
}

export function AchievementsSection(props: AchievementsSectionProps) {
	const {
		sidebarCollapsed,
		menuSelection,
		setMenuSelection,
		isModerator,
		achPendingCount,
		achMineCount,
		personLists,
		isAuthenticated,
		setShowAuthModal,
		setShowCreateList,
		sharedList,
		selectedListId,
		setSelectedListId,
		loadUserLists,
		showToast,
		searchAch,
		setSearchAch,
		achItemsAll,
		achLoadingAll,
		hasMoreAll,
		loadMoreAll,
		achItemsAlt,
		achAltLoading,
		achAltHasMore,
    	listLoading,
    	listItems,
    	setListItems,
    	openAddAchievement,
    	statusFilters,
    	setStatusFilters
	} = props

	// Derive mode from menuSelection
	const modeIsList = (menuSelection as any as string).startsWith('list:')
	const modeIsAll = menuSelection === ('all' as any)
	const modeIsMine = menuSelection === ('mine' as any)

	return (
		<ManageSection
      sidebarCollapsed={sidebarCollapsed}
			menuSelection={menuSelection}
			setMenuSelection={setMenuSelection}
      isModerator={isModerator}
      pendingCount={achPendingCount}
      mineCount={achMineCount}
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
			filterType="achievement"
			onDeleteListItem={async (listItemId) => {
				if (!selectedListId) return
				const ok = await deleteListItem(selectedListId, listItemId)
				if (ok) { 
					setListItems(prev => prev.filter(x => x.listItemId !== listItemId))
            await loadUserLists(true)
					showToast('Удалено из списка', 'success')
				} else { 
					showToast('Не удалось удалить', 'error')
        }
      }}
		>
			{!modeIsList ? (
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

					<SearchAndFilters
						searchValue={searchAch}
						onSearchChange={setSearchAch}
						searchPlaceholder="Поиск по достижениям/имени/стране"
						foundCount={modeIsAll ? achItemsAll.length : achItemsAlt.length}
						hasMore={!(modeIsAll ? achLoadingAll : achAltLoading) && (modeIsAll ? hasMoreAll : achAltHasMore)}
						isLoading={modeIsAll ? achLoadingAll : achAltLoading}
					/>
					<ItemsList
						items={(modeIsAll ? achItemsAll : achItemsAlt).map((a: any) => {
							const title = (a as any).title || (a as any).person_name || (a as any).country_name || ''
							return {
								id: a.id,
								title: title || '—',
								year: a.year,
								description: a.description
							}
						})}
						isLoading={modeIsAll ? achLoadingAll : achAltLoading}
						hasMore={modeIsAll ? hasMoreAll : achAltHasMore}
						onLoadMore={() => {
							if (modeIsAll) {
								loadMoreAll()
							}
							// Note: mine mode pagination is handled by the parent component
						}}
						onAddToList={(id) => {
							if (!isAuthenticated) { 
								setShowAuthModal(true)
								return
							}
							openAddAchievement(Number(id))
						}}
						isAuthenticated={isAuthenticated}
						emailVerified={true}
						showAuthModal={() => setShowAuthModal(true)}
						showToast={showToast}
						emptyMessage={!achAltLoading && modeIsMine && achItemsAlt.length === 0 
							? "Здесь будут отображаться созданные или отредактированные вами элементы"
							: "Достижения не найдены"
						}
						loadingMessage="Загрузка..."
					/>
				</>
			) : (
				<ListItemsView
					items={listItems as any}
					filterType="achievement"
					isLoading={listLoading}
					emptyText="Список пуст"
					onDelete={async (listItemId) => {
						if (!selectedListId) return
						const ok = await deleteListItem(selectedListId, listItemId)
						if (ok) { setListItems(prev => prev.filter(x => x.listItemId !== listItemId)); await loadUserLists(true); showToast('Удалено из списка', 'success') }
						else { showToast('Не удалось удалить', 'error') }
					}}
				/>
			)}
		</ManageSection>
	)
}


