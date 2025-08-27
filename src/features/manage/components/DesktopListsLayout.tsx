import React from 'react'
import { LeftMenuSelection } from './LeftMenu'
import { LeftMenuLayout } from './LeftMenuLayout'
import { ListItemsView } from 'shared/ui/ListItemsView'

type Props = {
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

export function DesktopListsLayout(props: Props) {
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
    try {
      const res = await fetch(`/api/lists/${selectedListId}/items/${listItemId}`, { method: 'DELETE' })
      if (res.ok) {
        await loadUserLists()
        showToast('Удалено из списка', 'success')
      } else {
        showToast('Не удалось удалить', 'error')
      }
    } catch {
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
        if (sel.type === 'list') { 
          setMenuSelection(`list:${sel.listId!}` as any)
          setSelectedListId(sel.listId!)
        } else { 
          setMenuSelection(sel.type as any)
          setSelectedListId(null)
        }
      }}
      isModerator={isModerator}
      pendingCount={pendingCount}
      mineCount={mineCount}
      userLists={personLists}
      onAddList={() => { 
        if (!isAuthenticated) { 
          setShowAuthModal(true)
          return
        }
        setShowCreateList(true)
      }}
      labelAll="Все"
      readonlyListId={sharedList?.id}
      onCopySharedList={async (id) => {
        if (!isAuthenticated) { 
          showToast('Нужно войти', 'error')
          setShowAuthModal(true)
          return
        }
        
        try {
          const code = (new URLSearchParams(window.location.search)).get('share') || ''
          if (!code) { 
            showToast('Нет кода ссылки', 'error')
            return
          }
          
          const title = sharedList?.title || 'Импортированный список'
          const res = await fetch(`/api/lists/copy-from-share`, { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ code, title }) 
          })
          
          if (!res.ok) { 
            showToast('Не удалось скопировать', 'error')
            return
          }
          
          const data = await res.json()
          const newId = Number(data?.data?.id)
          const newTitle = String(data?.data?.title || title)
          
          await loadUserLists(true)
          
          if (Number.isFinite(newId) && newId > 0) {
            setSelectedListId(newId)
            setMenuSelection(`list:${newId}` as any)
          }
          
          showToast(`Список «${newTitle}» скопирован`, 'success')
        } catch {
          showToast('Не удалось скопировать', 'error')
        }
      }}
      onDeleteList={async (id) => {
        try {
          const res = await fetch(`/api/lists/${id}`, { method: 'DELETE' })
          if (res.ok) {
            if (selectedListId === id) { 
              setSelectedListId(null)
              setMenuSelection('all' as any)
            }
            await loadUserLists(true)
            showToast('Список удалён', 'success')
          } else {
            showToast('Не удалось удалить список', 'error')
          }
        } catch {
          showToast('Ошибка удаления списка', 'error')
        }
      }}
      onShareList={async (id) => {
        try {
          const res = await fetch(`/api/lists/${id}/share`, { method: 'POST' })
          if (res.ok) {
            const data = await res.json()
            const shareUrl = `${window.location.origin}${window.location.pathname}?share=${data.code}`
            await navigator.clipboard.writeText(shareUrl)
            showToast('Ссылка скопирована в буфер обмена', 'success')
          } else {
            showToast('Не удалось создать ссылку', 'error')
          }
        } catch {
          showToast('Ошибка создания ссылки', 'error')
        }
      }}
      onShowOnTimeline={async (id) => {
        const isShared = sharedList?.id === id
        const url = isShared 
          ? `/timeline?share=${encodeURIComponent(window.location.search)}`
          : `/timeline?list=${id}`
        
        window.open(url, '_blank')
        showToast('Открываю на таймлайне', 'info')
      }}
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
