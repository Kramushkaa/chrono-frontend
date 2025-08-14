import React from 'react'
import { LeftMenuSelection } from './LeftMenu'
import { LeftMenuLayout } from './LeftMenuLayout'
import { PersonsList } from './PersonsList'
import { apiFetch, createListShareCode } from 'shared/api/api'

type ListItem = { id: number; title: string; items_count?: number; readonly?: boolean }

interface PersonsColumnsProps {
  // Grid siblings (this component returns three siblings for the grid):
  // 1) LeftMenu, 2) Sidebar toggle, 3) Persons list/content

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
  personsMode: 'all' | 'pending' | 'mine' | 'list'
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

  // List mode data
  listLoading: boolean
  listItems: Array<{ key: string; listItemId: number; type: string; person?: any; title: string; subtitle?: string }>
}

export function PersonsColumns(props: PersonsColumnsProps) {
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
    personsMode,
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
    onSelect,
    listLoading,
    listItems
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
      pendingCount={personsPendingCount}
      mineCount={personsMineCount}
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
      onDeleteList={async (id) => {
        try {
          const res = await apiFetch(`/api/lists/${id}`, { method: 'DELETE' })
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
      <div>
        {personsMode !== 'list' ? (
          <PersonsList
            search={searchPersons}
            setSearch={setSearchPersons}
            categories={categories}
            countries={countries}
            filters={filters}
            setFilters={setFilters}
            persons={personsMode==='all' ? personsAll : personsAlt}
            isLoading={personsMode==='all' ? isPersonsLoadingAll : personsAltLoading}
            hasMore={personsMode==='all' ? personsHasMoreAll : personsAltHasMore}
            loadMore={() => {
              if (personsMode==='all') loadMorePersonsAll(); else setPersonsAltOffset(o => o + 50)
            }}
            onSelect={onSelect}
          />
        ) : (
          <>
            <div style={{ marginBottom: 8, fontSize: 12, opacity: 0.9 }}>
              {(() => {
                const pc = listItems.filter(i => i.type === 'person').length
                const ac = listItems.filter(i => i.type === 'achievement').length
                const prc = listItems.filter(i => i.type === 'period').length
                return `Личностей: ${pc} • Достижений: ${ac} • Периодов: ${prc}`
              })()}
            </div>
            <div role="region" aria-label="Содержимое списка" style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: 6 }}>
              {listLoading && listItems.filter(i => i.type === 'person').length === 0 && <div>Загрузка…</div>}
              {listItems.filter(i => i.type === 'person').map((it) => (
                <div key={it.key} style={{ padding: '6px 8px', borderBottom: '1px solid rgba(139,69,19,0.2)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ flex: 1, cursor: it.type==='person' ? 'pointer' : 'default' }} onClick={() => { if (it.type==='person' && (it as any).person) onSelect((it as any).person) }}>
                    <div style={{ fontWeight: 600 }}>{it.title}</div>
                    {it.subtitle && <div style={{ fontSize: 12, opacity: 0.85 }}>{it.subtitle}</div>}
                  </div>
                  <button aria-label="Удалить из списка" title="Удалить" onClick={async () => {
                    if (!selectedListId) return
                    const id = it.listItemId
                    try {
                      const res = await apiFetch(`/api/lists/${selectedListId}/items/${id}`, { method: 'DELETE' })
                      if (res.ok) {
                        await loadUserLists()
                        showToast('Удалено из списка', 'success')
                      } else {
                        showToast('Не удалось удалить', 'error')
                      }
                    } catch { showToast('Ошибка удаления', 'error') }
                  }}>✕</button>
                </div>
              ))}
              {!listLoading && listItems.filter(i => i.type === 'person').length === 0 && <div style={{ opacity: 0.8 }}>Список пуст</div>}
            </div>
          </>
        )}
      </div>
    </LeftMenuLayout>
  )
}


