import React from 'react'
import { LeftMenuSelection } from './LeftMenu'
import { LeftMenuLayout } from './LeftMenuLayout'
import { apiFetch } from 'shared/api/api'
import { createAndCopyShareLink, openListOnTimeline, deleteListItem } from 'shared/utils/lists'
import { ListItemsView } from 'shared/ui/ListItemsView'
import { useManageUI } from 'features/manage/context/ManageUIContext'

type AchievementItem = any

type ListItem = { id: number; title: string; items_count?: number }

interface AchievementsSectionProps {
	// Sidebar
	sidebarCollapsed: boolean
	setSidebarCollapsed: (updater: (prev: boolean) => boolean) => void
	menuSelection: string
	setMenuSelection: (sel: any) => void
	isModerator: boolean
	achPendingCount: number | null
	achMineCount: number | null
	personLists: ListItem[]
	isAuthenticated: boolean
	emailVerified: boolean
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
	setAchAltOffset: (updater: (prev: number) => number) => void

	// Add to list (callbacks provided by parent)
	openAddAchievement: (id: number) => void
	openAddForSelectedPerson: () => void

	// List mode
	listLoading: boolean
	listItems: Array<{ key: string; listItemId: number; type: string; title: string; subtitle?: string }>
	setListItems: (updater: (prev: any[]) => any[]) => void
}

export function AchievementsSection(props: AchievementsSectionProps) {
	const {
		sidebarCollapsed,
		setSidebarCollapsed,
		menuSelection,
		setMenuSelection,
		isModerator,
		achPendingCount,
		achMineCount,
		personLists,
		isAuthenticated,
		emailVerified,
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
    	setAchAltOffset,
    	listLoading,
    	listItems,
    	setListItems,
	} = props

	const manageUI = useManageUI()

	// Derive mode from menuSelection
	const modeIsList = (menuSelection as any as string).startsWith('list:')
	const modeIsAll = menuSelection === ('all' as any)
	const modeIsMine = menuSelection === ('mine' as any)

	return (
		<LeftMenuLayout
			sidebarCollapsed={sidebarCollapsed}
			setSidebarCollapsed={setSidebarCollapsed}
			gridWhenOpen="240px 8px 1fr"
			gridWhenCollapsed="0px 8px 1fr"
			menuId="lists-sidebar"
			selectedKey={menuSelection}
			onSelect={(sel: LeftMenuSelection) => {
				if (sel.type === 'list') { setMenuSelection(`list:${sel.listId!}` as any) }
				else { setMenuSelection(sel.type as any) }
			}}
			isModerator={isModerator}
			pendingCount={achPendingCount}
			mineCount={achMineCount}
			userLists={isAuthenticated ? personLists : []}
			onAddList={() => { if (!isAuthenticated) { setShowAuthModal(true); return } setShowCreateList(true) }}
			labelAll="Все"
			onDeleteList={async (id) => {
				try {
					const res = await apiFetch(`/api/lists/${id}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' } })
					if (res.ok) {
						if (selectedListId === id) { setSelectedListId(null); setMenuSelection('all' as any) }
						await loadUserLists(true)
						showToast('Список удалён', 'success')
					} else showToast('Не удалось удалить список', 'error')
				} catch { showToast('Ошибка удаления списка', 'error') }
			}}
			onShareList={async (id) => { await createAndCopyShareLink(id, showToast) }}
			onShowOnTimeline={async (id) => { await openListOnTimeline(id, sharedList?.id, showToast) }}
		>
			<div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
				{!modeIsList ? (
					<>
						<div role="region" aria-label="Фильтр достижений" style={{ marginBottom: 12 }}>
							<div style={{ marginBottom: 8 }}>
								<input value={searchAch} onChange={(e) => setSearchAch(e.target.value)} placeholder="Поиск по достижениям/имени/стране" style={{ width: '100%', padding: 6 }} />
							</div>
							<div style={{ fontSize: 12, opacity: 0.8 }}>
								Найдено: {modeIsAll ? achItemsAll.length : achItemsAlt.length}{!(modeIsAll ? achLoadingAll : achAltLoading) && (modeIsAll ? hasMoreAll : achAltHasMore) ? '+' : ''}
							</div>
						</div>
						<div
							role="region"
							aria-label="Достижения"
							style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: 6 }}
							onScroll={(e) => {
								const el = e.currentTarget as HTMLDivElement
								const loading = modeIsAll ? achLoadingAll : achAltLoading
								const more = modeIsAll ? hasMoreAll : achAltHasMore
								if (el.scrollTop + el.clientHeight >= el.scrollHeight - 40) {
									if (!loading && more) {
										if (modeIsAll) loadMoreAll(); else setAchAltOffset(o => o + 100)
									}
								}
							}}
						>
							{(modeIsAll ? achLoadingAll : achAltLoading) && (modeIsAll ? achItemsAll.length === 0 : achItemsAlt.length === 0) && <div>Загрузка...</div>}
							{/* Show informative message when no items in mine mode */}
							{!achAltLoading && modeIsMine && achItemsAlt.length === 0 && (
								<div style={{ 
									textAlign: 'center', 
									padding: '40px 20px', 
									opacity: 0.7, 
									fontSize: 14,
									border: '1px dashed rgba(139,69,19,0.3)',
									borderRadius: 8,
									background: 'rgba(139,69,19,0.05)'
								}}>
									Здесь будут отображаться созданные или отредактированные вами элементы
								</div>
							)}
							<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
								{(modeIsAll ? achItemsAll : achItemsAlt).map((a: any) => {
									const title = (a as any).title || (a as any).person_name || (a as any).country_name || ''
									return (
										<div key={a.id} style={{ border: '1px solid rgba(139,69,19,0.4)', borderRadius: 8, padding: 12, background: 'rgba(44,24,16,0.85)', position: 'relative' }}>
											<div style={{ fontWeight: 'bold', marginBottom: 6 }}>{title || '—'}</div>
											<div style={{ fontSize: 12, opacity: 0.85, marginBottom: 6 }}>{a.year}</div>
											<div style={{ fontSize: 14 }}>{a.description}</div>
											<div style={{ position: 'absolute', top: 8, right: 8 }}>
												<button
													onClick={() => {
														if (!isAuthenticated) { setShowAuthModal(true); return }
														if (!emailVerified) { showToast('Требуется подтверждение email для добавления достижений', 'error'); return }
														manageUI.openAddAchievement(Number(a.id))
													}}
													title="Добавить в список"
												>＋</button>
											</div>
										</div>
								)
								})}
							</div>
							{!(modeIsAll ? achLoadingAll : achAltLoading) && (modeIsAll ? hasMoreAll : achAltHasMore) && (
								<div style={{ marginTop: 12 }}>
									<button onClick={() => { if (modeIsAll) loadMoreAll(); else setAchAltOffset(o => o + 100) }} style={{ padding: '6px 12px' }}>Показать ещё</button>
								</div>
							)}
						</div>
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
			</div>
		</LeftMenuLayout>
	)
}


