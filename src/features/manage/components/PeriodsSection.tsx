import React from 'react'
import { LeftMenuSelection } from './LeftMenu'
import { LeftMenuLayout } from './LeftMenuLayout'
import { apiFetch } from 'shared/api/api'
import { useManageUI } from 'features/manage/context/ManageUIContext'

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
	periodsMode: 'all' | 'pending' | 'mine' | 'list'

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
		searchPeriods,
		setSearchPeriods,
		periodType,
		setPeriodType,
		periodItemsAll,
		periodsLoadingAll,
		periodsHasMoreAll,
		loadMorePeriodsAll,
		periodsMode,
		listLoading,
		listItems,
		setListItems
	} = props

  const manageUI = useManageUI()

	return (
		<LeftMenuLayout
			sidebarCollapsed={sidebarCollapsed}
			setSidebarCollapsed={setSidebarCollapsed}
			gridWhenOpen="240px 8px 1fr"
			gridWhenCollapsed="0px 8px 1fr"
			menuId="lists-sidebar"
			selectedKey={(menuSelection === 'pending' || menuSelection === 'mine') ? 'all' : menuSelection}
			onSelect={(sel: LeftMenuSelection) => {
				if (sel.type === 'list') { setMenuSelection(`list:${sel.listId!}` as any) }
				else { setMenuSelection(sel.type as any) }
			}}
			isModerator={isModerator}
			pendingCount={null}
			mineCount={null}
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
						Найдено: {periodItemsAll.length}{!periodsLoadingAll && periodsHasMoreAll ? '+' : ''}
					</div>
				</div>
				{periodsMode !== 'list' ? (
					<div
						role="region"
						aria-label="Периоды"
						style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: 6 }}
						onScroll={(e) => {
							const el = e.currentTarget as HTMLDivElement
							if (el.scrollTop + el.clientHeight >= el.scrollHeight - 40) {
								if (!periodsLoadingAll && periodsHasMoreAll) loadMorePeriodsAll()
							}
						}}
					>
						{periodsLoadingAll && periodItemsAll.length === 0 && <div>Загрузка...</div>}
						<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
							{periodItemsAll.map((p: any) => {
								const headerParts: string[] = []
								if (p.person_name) headerParts.push(p.person_name)
								if (p.country_name) headerParts.push(p.country_name)
								const header = headerParts.join(' • ')
								return (
									<div key={p.id} style={{ border: '1px solid rgba(139,69,19,0.4)', borderRadius: 8, padding: 12, background: 'rgba(44,24,16,0.85)', position: 'relative' }}>
										<div style={{ fontWeight: 'bold', marginBottom: 6 }}>{header || '—'}</div>
										<div style={{ fontSize: 12, opacity: 0.85, marginBottom: 6 }}>
											Тип: {p.period_type === 'ruler' ? 'Правление' : p.period_type === 'life' ? 'Жизнь' : p.period_type}
										</div>
										<div style={{ fontSize: 14 }}>Годы: {p.start_year} — {p.end_year ?? '—'}</div>
										<div style={{ position: 'absolute', top: 8, right: 8 }}>
                <button
									onClick={() => {
										if (!isAuthenticated || !emailVerified) { setShowAuthModal(true); return }
										manageUI.openAddPeriod(Number(p.id))
									}}
												title="Добавить в список"
											>＋</button>
										</div>
									</div>
								)
							})}
						</div>
						{!periodsLoadingAll && periodsHasMoreAll && (
							<div style={{ marginTop: 12 }}>
								<button onClick={() => loadMorePeriodsAll()} style={{ padding: '6px 12px' }}>Показать ещё</button>
							</div>
						)}
					</div>
				) : (
					<div role="region" aria-label="Содержимое списка (периоды)" style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: 6 }}>
						<div style={{ marginBottom: 8, fontSize: 12, opacity: 0.9 }}>
							{(() => {
								const pc = listItems.filter(i => i.type === 'person').length
								const ac = listItems.filter(i => i.type === 'achievement').length
								const prc = listItems.filter(i => i.type === 'period').length
								return `Личностей: ${pc} • Достижений: ${ac} • Периодов: ${prc}`
							})()}
						</div>
						{listLoading && listItems.filter(it => it.type === 'period').length === 0 && <div>Загрузка…</div>}
						{listItems.filter(it => it.type === 'period').map((it) => (
							<div key={it.key} style={{ padding: '6px 8px', borderBottom: '1px solid rgba(139,69,19,0.2)', display: 'flex', alignItems: 'center', gap: 8 }}>
								<div style={{ flex: 1 }}>
									<div style={{ fontWeight: 600 }}>{it.title}</div>
									{it.subtitle && <div style={{ fontSize: 12, opacity: 0.85 }}>{it.subtitle}</div>}
								</div>
								<button aria-label="Удалить из списка" title="Удалить" onClick={async () => {
									if (!selectedListId) return
									const id = it.listItemId
									try {
										const res = await apiFetch(`/api/lists/${selectedListId}/items/${id}`, { method: 'DELETE' })
										if (res.ok) {
											setListItems(prev => prev.filter(x => x.listItemId !== id))
											await loadUserLists()
											showToast('Удалено из списка', 'success')
										} else {
											showToast('Не удалось удалить', 'error')
										}
									} catch { showToast('Ошибка удаления', 'error') }
								}}>✕</button>
							</div>
						))}
						{!listLoading && listItems.filter(it => it.type === 'period').length === 0 && <div style={{ opacity: 0.8 }}>Список пуст</div>}
					</div>
				)}
			</div>
		</LeftMenuLayout>
	)
}



