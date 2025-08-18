import React from 'react'
import { LeftMenuLayout } from 'features/manage/components/LeftMenuLayout'
import { ListItemsView } from 'shared/ui/ListItemsView'
import { deleteListItem } from 'shared/utils/lists'
import { apiFetch } from 'shared/api/api'
import { LeftMenuSelection } from 'features/manage/components/LeftMenu'

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
	emailVerified: boolean
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
	periodsMineOffset: number
	setPeriodsMineOffset: (updater: (prev: number) => number) => void

	// List mode
	listLoading: boolean
	listItems: Array<{ key: string; listItemId: number; type: string; title: string; subtitle?: string }>
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
		setListItems
	} = props

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
			pendingCount={null}
			mineCount={periodsMineCount}
			userLists={personLists}
			onAddList={() => { if (!isAuthenticated) { setShowAuthModal(true); return } setShowCreateList(true) }}
			labelAll="Все"
			readonlyListId={sharedList?.id}
			onCopySharedList={async (id) => {
				if (!isAuthenticated) { showToast('Нужно войти', 'error'); setShowAuthModal(true); return }
				try {
					const code = (new URLSearchParams(window.location.search)).get('share') || ''
					if (!code) { showToast('Нет кода ссылки', 'error'); return }
					const title = sharedList?.title || 'Импортированный список'
					const res = await apiFetch(`/api/lists/copy-from-share`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code, title }) })
					if (!res.ok) { showToast('Не удалось скопировать', 'error'); return }
					const data = await res.json().catch(() => null) as any
					const newId = Number(data?.data?.id)
					const newTitle = String(data?.data?.title || title)
					await loadUserLists(true)
					if (Number.isFinite(newId) && newId > 0) {
						setSelectedListId(newId)
						setMenuSelection(`list:${newId}` as any)
					}
					showToast(`Список «${newTitle}» скопирован`, 'success')
				} catch { showToast('Не удалось скопировать', 'error') }
			}}
		>
			<div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
				{!(menuSelection as string).startsWith('list:') && (
					<div role="region" aria-label="Фильтр периодов" style={{ marginBottom: 12 }}>
						<div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
							<input value={searchPeriods} onChange={(e) => setSearchPeriods(e.target.value)} placeholder="Поиск по имени/стране" style={{ flex: '1 1 260px', minWidth: 260, padding: 6 }} />
							<select value={periodType} onChange={(e) => setPeriodType((e.target.value as any))} style={{ padding: 6 }}>
								<option value="">Все типы</option>
								<option value="ruler">Правление</option>
								<option value="life">Жизнь</option>
							</select>
						</div>
						<div style={{ fontSize: 12, opacity: 0.8 }}>
							Найдено: {menuSelection === 'all' ? periodItemsAll.length : periodItemsMine.length}{!(menuSelection === 'all' ? periodsLoadingAll : periodsLoadingMine) && (menuSelection === 'all' ? periodsHasMoreAll : periodsHasMoreMine) ? '+' : ''}
						</div>
					</div>
				)}
				{!(menuSelection as string).startsWith('list:') ? (
					<div
						role="region"
						aria-label="Периоды"
						style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: 6 }}
						onScroll={(e) => {
							const el = e.currentTarget as HTMLDivElement
							if (el.scrollTop + el.clientHeight >= el.scrollHeight - 40) {
								if (menuSelection === 'all') {
									if (!periodsLoadingAll && periodsHasMoreAll) loadMorePeriodsAll()
								}
								// Note: mine mode pagination is handled by the parent component
							}
						}}
					>
						{(menuSelection === 'all' ? periodsLoadingAll : periodsLoadingMine) && (menuSelection === 'all' ? periodItemsAll.length === 0 : periodItemsMine.length === 0) && <div>Загрузка...</div>}
						
						{/* Show informative message when no items in mine mode */}
						{!periodsLoadingMine && menuSelection === 'mine' && periodItemsMine.length === 0 && (
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
							{(menuSelection === 'all' ? periodItemsAll : periodItemsMine).map((p: any) => {
								const personName = p.person_name ?? p.personName ?? ''
								const countryName = p.country_name ?? p.countryName ?? ''
								const type = p.period_type ?? p.periodType
								const start = p.start_year ?? p.startYear
								const end = p.end_year ?? p.endYear
								const headerParts: string[] = []
								if (personName) headerParts.push(personName)
								if (countryName) headerParts.push(countryName)
								const header = headerParts.join(' • ')
								return (
									<div key={p.id ?? `${personName}-${start}-${end}`} style={{ border: '1px solid rgba(139,69,19,0.4)', borderRadius: 8, padding: 12, background: 'rgba(44,24,16,0.85)', position: 'relative' }}>
										<div style={{ fontWeight: 'bold', marginBottom: 6 }}>{header || '—'}</div>
										<div style={{ fontSize: 12, opacity: 0.85, marginBottom: 6 }}>
											Тип: {type === 'ruler' ? 'Правление' : type === 'life' ? 'Жизнь' : (type || '—')}
										</div>
										<div style={{ fontSize: 14 }}>Годы: {start ?? '—'} — {end ?? '—'}</div>
										<div style={{ position: 'absolute', top: 8, right: 8 }}>
                <button
											onClick={() => {
												if (!isAuthenticated) { setShowAuthModal(true); return }
												props.openAddPeriod(Number(p.id))
											}}
											title="Добавить в список"
										>
											＋</button>
										</div>
									</div>
								)
							})}
						</div>
						{!(menuSelection === 'all' ? periodsLoadingAll : periodsLoadingMine) && (menuSelection === 'all' ? periodsHasMoreAll : periodsHasMoreMine) && (
							<div style={{ marginTop: 12 }}>
								<button onClick={() => { 
									if (menuSelection === 'all') loadMorePeriodsAll()
									// Note: mine mode pagination is handled by the parent component
								}} style={{ padding: '6px 12px' }}>Показать ещё</button>
							</div>
						)}
					</div>
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
		</LeftMenuLayout>
	)
}



