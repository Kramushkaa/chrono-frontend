import { LeftMenuSelection } from './LeftMenu'
import type { UserList, ListModerationStatus } from 'shared/types'
import { MobileListSelector } from './MobileListSelector'

type Props = {
  selectedKey: string
  onSelect: (sel: LeftMenuSelection) => void
  isModerator: boolean
  pendingCount?: number | null
  mineCount?: number | null
  userLists: Array<UserList & { readonly?: boolean }>
  onAddList: () => void
  labelAll?: string
  selectedListId?: number | null
  onDeleteList?: (id: number) => void
  onShareList?: (id: number) => void
  onShowOnTimeline?: (id: number) => void
  onExportList?: (id: number) => void
  readonlyListId?: number
  onCopySharedList?: (id: number) => void
  // Filter toggle
  filtersVisible?: boolean
  onToggleFilters?: () => void
  onAddElement?: () => void
}

export function MobileListsHeader({
  selectedKey,
  onSelect,
  isModerator,
  pendingCount,
  mineCount,
  userLists,
  onAddList,
  labelAll = 'Все',
  selectedListId,
  onDeleteList,
  onShareList,
  onShowOnTimeline,
  onExportList,
  readonlyListId,
  onCopySharedList,
  filtersVisible,
  onToggleFilters,
  onAddElement
}: Props) {
  const isListSelected = selectedKey.startsWith('list:')
  const currentList = isListSelected ? userLists.find(l => l.id === selectedListId) : null

  const statusLabel: Record<ListModerationStatus, string> = {
    draft: 'Черновик',
    pending: 'На модерации',
    published: 'Опубликован',
    rejected: 'Отклонён',
  }

  return (
    <div className="lists-mobile-header">
      {/* Селектор списков и кнопка фильтров на одной строке */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <MobileListSelector
            selectedKey={selectedKey}
            onSelect={onSelect}
            isModerator={isModerator}
            pendingCount={pendingCount}
            mineCount={mineCount}
            userLists={userLists}
            onAddList={onAddList}
            labelAll={labelAll}
          />
        </div>
        
        {/* Кнопка переключения фильтров */}
        <button
          onClick={onToggleFilters}
          className="lists-mobile-actions__action-button lists-mobile-filter-toggle"
          title={filtersVisible ? 'Скрыть фильтры' : 'Показать фильтры'}
          aria-pressed={!!filtersVisible}
          style={{ flexShrink: 0 }}
        >
          {filtersVisible ? '🔼' : '🔽'}
        </button>

        {/* Кнопка добавления элемента (всегда видна) */}
        {onAddElement && (
          <button
            onClick={onAddElement}
            className="lists-mobile-actions__action-button"
            title="Добавить элемент"
            style={{ flexShrink: 0 }}
          >
            ➕
          </button>
        )}
      </div>

      {/* Кнопки действий (только если выбран список) */}
      {isListSelected && currentList && (
        <div className="lists-mobile-actions" style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: '12px' }}>
          {/* Показать на таймлайне */}
          <button
            onClick={() => onShowOnTimeline?.(currentList.id)}
            className="lists-mobile-actions__action-button"
            title="Показать на таймлайне"
          >
            ⏱️
          </button>

          {/* Поделиться или скопировать */}
          {readonlyListId === currentList.id ? (
            <button
              onClick={() => onCopySharedList?.(currentList.id)}
              className="lists-mobile-actions__action-button"
              title="Скопировать себе"
            >
              📋
            </button>
          ) : (
            <button
              onClick={() => onShareList?.(currentList.id)}
              className="lists-mobile-actions__action-button"
              title="Поделиться"
            >
              🔗
            </button>
          )}

          {/* Экспорт списка (только для модераторов) */}
          {readonlyListId !== currentList.id && onExportList && (
            <button
              onClick={() => onExportList(currentList.id)}
              className="lists-mobile-actions__action-button"
              title="Экспорт списка"
            >
              📤
            </button>
          )}

          {/* Удалить (только для своих списков) */}
          {readonlyListId !== currentList.id && onDeleteList && (
            <button
              onClick={() => {
                const ok = window.confirm('Удалить список и все его элементы?')
                if (ok) onDeleteList(currentList.id)
              }}
              className="lists-mobile-actions__action-button lists-mobile-actions__action-button--danger"
              title="Удалить список"
            >
              🗑️
            </button>
          )}
        </div>
      )}

      {/* Информация о выбранном списке */}
      {isListSelected && currentList && (
        <div className="lists-mobile-list-info">
          <div className="lists-mobile-list-info__title">
            Список: <strong>{currentList.title}</strong>
          </div>
          <div className="lists-mobile-list-info__count">
            Элементов: {currentList.items_count || 0}
          </div>
          {!currentList.readonly && (
            <div className="lists-mobile-list-info__status" style={{ fontSize: 12, opacity: 0.8 }}>
              Статус: {statusLabel[currentList.moderation_status]}
            </div>
          )}
        </div>
      )}
    </div>
  )
}



