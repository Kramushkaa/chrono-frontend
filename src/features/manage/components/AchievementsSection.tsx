import React from 'react'
import { LeftMenuSelection } from './LeftMenu'
import { LeftMenuLayout } from './LeftMenuLayout'
import { apiFetch, createListShareCode } from 'shared/api/api'
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
	achMode: 'all' | 'pending' | 'mine' | 'list'
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
		achMode,
		achItemsAll,
		achLoadingAll,
		hasMoreAll,
		loadMoreAll,
		achItemsAlt,
		achAltLoading,
		achAltHasMore,
    	setAchAltOffset,
	} = props

  const manageUI = useManageUI()

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
      onShareList={async (id) => {
        const code = await createListShareCode(id)
        if (!code) { showToast('Не удалось создать ссылку', 'error'); return }
        const url = `${window.location.origin}/lists?share=${encodeURIComponent(code)}`
        if (navigator.clipboard) navigator.clipboard.writeText(url).then(() => showToast('Ссылка скопирована', 'success')).catch(() => alert(url))
        else alert(url)
      }}
      onShowOnTimeline={async (id) => {
        const usp = new URLSearchParams(window.location.search)
        const shareCode = usp.get('share')
        if (sharedList?.id === id && shareCode) {
          window.location.href = `/timeline?share=${encodeURIComponent(shareCode)}`
          return
        }
        try {
          const code = await createListShareCode(id)
          if (!code) throw new Error('no_code')
          window.location.href = `/timeline?share=${encodeURIComponent(code)}`
        } catch {
          showToast('Не удалось открыть на таймлайне', 'error')
        }
      }}
		>
      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
				{achMode !== 'list' ? (
					<>
						<div role="region" aria-label="Фильтр достижений" style={{ marginBottom: 12 }}>
							<div style={{ marginBottom: 8 }}>
								<input value={searchAch} onChange={(e) => setSearchAch(e.target.value)} placeholder="Поиск по достижениям/имени/стране" style={{ width: '100%', padding: 6 }} />
							</div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>
                Найдено: {achMode==='all' ? achItemsAll.length : achItemsAlt.length}{!(achMode==='all' ? achLoadingAll : achAltLoading) && (achMode==='all' ? hasMoreAll : achAltHasMore) ? '+' : ''}
            </div>
          </div>
						<div
							role="region"
							aria-label="Достижения"
							style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: 6 }}
							onScroll={(e) => {
								const el = e.currentTarget as HTMLDivElement
								const isAll = achMode==='all'
								const loading = isAll ? achLoadingAll : achAltLoading
								const more = isAll ? hasMoreAll : achAltHasMore
								if (el.scrollTop + el.clientHeight >= el.scrollHeight - 40) {
									if (!loading && more) {
										if (isAll) loadMoreAll(); else setAchAltOffset(o => o + 100)
									}
								}
							}}
						>
							{(achMode==='all' ? achLoadingAll : achAltLoading) && (achMode==='all' ? achItemsAll.length === 0 : achItemsAlt.length === 0) && <div>Загрузка...</div>}
							<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
								{(achMode==='all' ? achItemsAll : achItemsAlt).map((a: any) => {
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
							{!(achMode==='all' ? achLoadingAll : achAltLoading) && (achMode==='all' ? hasMoreAll : achAltHasMore) && (
								<div style={{ marginTop: 12 }}>
									<button onClick={() => { if (achMode==='all') loadMoreAll(); else setAchAltOffset(o => o + 100) }} style={{ padding: '6px 12px' }}>Показать ещё</button>
								</div>
							)}
						</div>
					</>
				) : (
					// В режиме list UI остаётся в ManagePage (реестр уже реализован там)
					<div />
				)}
			</div>
		</LeftMenuLayout>
	)
}


