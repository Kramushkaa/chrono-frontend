import React from 'react'
import { LeftMenuSelection } from './LeftMenu'
import { MobileListsHeader } from './MobileListsHeader'
import { ListItemsView } from 'shared/ui/ListItemsView'

import { Person } from 'shared/types'
import { PersonPanel } from 'features/persons/components/PersonPanel'

type Props = {
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
  
  // Add to list functionality
  openAddForPerson?: (person: any) => void
  
  // External create action
  onAddElement?: () => void
  
  // Content to show when not viewing a list
  children: React.ReactNode
  

}

export function MobileListsLayout(props: Props) {
  const {
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
    onDeleteListItem,
    openAddForPerson,
    onAddElement
  } = props

  // Состояние для мобильной карточки личности
  const [selectedPerson, setSelectedPerson] = React.useState<Person | null>(null)
  const [filtersVisible, setFiltersVisible] = React.useState<boolean>(true)

  // Функции для работы с карточкой личности
  const handlePersonSelect = (person: Person) => {
    setSelectedPerson(person)
  }

  const handleClosePersonCard = () => {
    setSelectedPerson(null)
  }

    // Функции для получения цветов (временно упрощенные)
  const getGroupColor = (groupName: string) => {
    const colors: { [key: string]: string } = {
      'Правители': '#E57373',
      'Ученые': '#81C784',
      'Художники': '#64B5F6',
      'Писатели': '#FFB74D',
      'Военные': '#F06292',
      'default': '#8D6E63'
    }
    return colors[groupName] || colors.default
  }

  const getPersonGroup = (person: Person) => {
    return person.category || 'default'
  }

  const getCategoryColor = (category: string) => {
    return getGroupColor(category)
  }

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

  const handleDeleteList = async (id: number) => {
    try {
      const res = await fetch(`/api/lists/${id}`, { method: 'DELETE' })
      if (res.ok) {
        if (selectedListId === id) { 
          setSelectedListId(null)
          setMenuSelection('all')
        }
        await loadUserLists(true)
        showToast('Список удалён', 'success')
      } else {
        showToast('Не удалось удалить список', 'error')
      }
    } catch {
      showToast('Ошибка удаления списка', 'error')
    }
  }

  const handleShareList = async (id: number) => {
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
  }

  const handleShowOnTimeline = async (id: number) => {
    const isShared = sharedList?.id === id
    const url = isShared 
      ? `/timeline?share=${encodeURIComponent(window.location.search)}`
      : `/timeline?list=${id}`
    
    window.open(url, '_blank')
    showToast('Открываю на таймлайне', 'info')
  }

  const handleCopySharedList = async (id: number) => {
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
        setMenuSelection(`list:${newId}`)
      }
      
      showToast(`Список «${newTitle}» скопирован`, 'success')
    } catch {
      showToast('Не удалось скопировать', 'error')
    }
  }



  return (
    <div className="lists-mobile-layout">
      {/* Мобильный header */}
      <MobileListsHeader
        selectedKey={menuSelection}
        onSelect={(sel: LeftMenuSelection) => {
          if (sel.type === 'list') { 
            setMenuSelection(`list:${sel.listId!}`)
            setSelectedListId(sel.listId!)
          } else { 
            setMenuSelection(sel.type)
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
        selectedListId={selectedListId}
        onDeleteList={handleDeleteList}
        onShareList={handleShareList}
        onShowOnTimeline={handleShowOnTimeline}
        readonlyListId={sharedList?.id}
        onCopySharedList={handleCopySharedList}
        filtersVisible={filtersVisible}
        onToggleFilters={() => setFiltersVisible(v => !v)}
        onAddElement={onAddElement}
      />

      {/* Основной контент */}
      <div className={"lists-mobile-content" + (filtersVisible ? "" : " filters-hidden")}>
        {!(menuSelection as string).startsWith('list:') ? (
          // Показываем обычный контент (личности, достижения, периоды)
          React.Children.map(children, (child) => {
            if (React.isValidElement(child)) {
              // Если это фрагмент, обрабатываем его содержимое
              if (child.type === React.Fragment) {
                return React.cloneElement(child, {}, 
                  React.Children.map(child.props.children, (fragmentChild) => {
                    if (React.isValidElement(fragmentChild)) {
                      return React.cloneElement(fragmentChild as any, { 
                        onPersonSelect: handlePersonSelect
                      })
                    }
                    return fragmentChild
                  })
                )
              }
              // Если это обычный элемент, добавляем onPersonSelect
              return React.cloneElement(child as any, { 
                onPersonSelect: handlePersonSelect
              })
            }
            return child
          })
        ) : (
          // Показываем элементы списка
          <ListItemsView
            items={listItems || []}
            filterType={filterType || 'person'}
            isLoading={listLoading || false}
            emptyText="Список пуст"
            onDelete={handleDeleteListItem}
            onPersonSelect={handlePersonSelect}
          />
        )}
      </div>



      {/* Не-модальная панель личности (как в timeline) */}
      <PersonPanel
        selectedPerson={selectedPerson}
        onClose={handleClosePersonCard}
        getGroupColor={getGroupColor}
        getPersonGroup={getPersonGroup}
        getCategoryColor={getCategoryColor}
        openAddForPerson={openAddForPerson}
      />
    </div>
  )
}
