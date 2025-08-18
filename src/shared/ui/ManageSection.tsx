import React from 'react'
import { LeftMenuSelection } from 'features/manage/components/LeftMenu'
import { LeftMenuLayout } from 'features/manage/components/LeftMenuLayout'
import { ListItemsView } from './ListItemsView'
import { ListSummary } from './ListSummary'
import { deleteListItem, createAndCopyShareLink, openListOnTimeline } from '../utils/lists'
import { apiFetch } from '../api/api'

type ListItem = { id: number; title: string; items_count?: number; readonly?: boolean }

interface ManageSectionProps {
  // Sidebar
  sidebarCollapsed: boolean
  setSidebarCollapsed: (updater: (prev: boolean) => boolean) => void
  menuSelection: string
  setMenuSelection: (sel: any) => void
  isModerator: boolean
  pendingCount: number | null
  mineCount: number | null
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

  // Content
  children: React.ReactNode
  
  // List mode
  listLoading: boolean
  listItems: Array<{ key: string; listItemId: number; type: string; title: string; subtitle?: string }>
  filterType: 'person' | 'achievement' | 'period'
  
  // Actions
  onDeleteListItem?: (listItemId: number) => Promise<boolean>
}

export function ManageSection(props: ManageSectionProps) {
  const {
    sidebarCollapsed,
    setSidebarCollapsed,
    menuSelection,
    setMenuSelection,
    isModerator,
    pendingCount,
    mineCount,
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
    children,
    listLoading,
    listItems,
    filterType,
    onDeleteListItem
  } = props

  const handleDeleteListItem = async (listItemId: number) => {
    if (!selectedListId) return false
    
    if (onDeleteListItem) {
      return await onDeleteListItem(listItemId)
    }
    
    // Default delete behavior
    const ok = await deleteListItem(selectedListId, listItemId)
    if (ok) {
      await loadUserLists()
      showToast('Удалено из списка', 'success')
    } else {
      showToast('Не удалось удалить', 'error')
    }
    return ok
  }

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
      pendingCount={pendingCount}
      mineCount={mineCount}
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
      onShareList={async (id) => { await createAndCopyShareLink(id, showToast) }}
      onShowOnTimeline={async (id) => { await openListOnTimeline(id, sharedList?.id, showToast) }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {!(menuSelection as string).startsWith('list:') ? (
          children
        ) : (
          <>
            <ListSummary items={listItems} style={{ marginBottom: 8, fontSize: 12, opacity: 0.9 }} />
            <ListItemsView
              items={listItems}
              filterType={filterType}
              isLoading={listLoading}
              emptyText="Список пуст"
              onDelete={handleDeleteListItem}
            />
          </>
        )}
      </div>
    </LeftMenuLayout>
  )
}
