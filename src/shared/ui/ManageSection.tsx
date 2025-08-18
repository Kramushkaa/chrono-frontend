import React from 'react'
import { LeftMenuSelection } from 'features/manage/components/LeftMenu'
import { LeftMenuLayout } from 'features/manage/components/LeftMenuLayout'
import { ListItemsView } from './ListItemsView'
import { deleteListItem, createAndCopyShareLink, openListOnTimeline } from '../utils/lists'
import { apiFetch } from '../api/api'

interface ManageSectionProps {
  // Layout control
  sidebarCollapsed: boolean
  
  // Menu state
  menuSelection: string
  setMenuSelection: (sel: string) => void
  
  // User info
  isAuthenticated: boolean
  isModerator: boolean
  pendingCount?: number | null
  mineCount?: number | null
  
  // Lists
  personLists: any[]
  sharedList?: any
  selectedListId: number | null
  setSelectedListId: (id: number | null) => void
  loadUserLists: (force?: boolean) => Promise<void>
  
  // Modals
  setShowAuthModal: (show: boolean) => void
  setShowCreateList: (show: boolean) => void
  
  // List items (for user-defined lists)
  listItems?: any[]
  filterType?: 'person' | 'achievement' | 'period'
  listLoading?: boolean
  onDeleteListItem?: (listItemId: number) => Promise<void> | void
  
  // Utilities
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void
  
  children: React.ReactNode
}

export function ManageSection(props: ManageSectionProps) {
  const {
    sidebarCollapsed,
    menuSelection,
    setMenuSelection,
    isModerator,
    pendingCount,
    mineCount,
    personLists,
    isAuthenticated,
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
    if (!selectedListId) return
    
    if (onDeleteListItem) {
      await onDeleteListItem(listItemId)
      return
    }
    
    // Default delete behavior
    const ok = await deleteListItem(selectedListId, listItemId)
    if (ok) {
      await loadUserLists()
      showToast('Удалено из списка', 'success')
    } else {
      showToast('Не удалось удалить', 'error')
    }
  }

  return (
    <LeftMenuLayout
      sidebarCollapsed={sidebarCollapsed}
      gridWhenOpen={"240px 1fr"}
      gridWhenCollapsed={"0px 1fr"}
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
      {!(menuSelection as string).startsWith('list:') ? (
        children
      ) : (
        <ListItemsView
          items={listItems || []}
          filterType={filterType || 'person'}
          isLoading={listLoading || false}
          emptyText="Список пуст"
          onDelete={handleDeleteListItem}
        />
      )}
    </LeftMenuLayout>
  )
}
