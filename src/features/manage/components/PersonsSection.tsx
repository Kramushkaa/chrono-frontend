import React from 'react'
import { ManageSection } from 'shared/ui/ManageSection'
import { SearchAndFilters } from 'shared/ui/SearchAndFilters'
import { ItemsList } from 'shared/ui/ItemsList'
import { FilterDropdown } from 'shared/ui/FilterDropdown'
import { ListSummary } from 'shared/ui/ListSummary'
import { deleteListItem } from 'shared/utils/lists'

type ListItem = { id: number; title: string; items_count?: number; readonly?: boolean }

interface PersonsSectionProps {
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
  onSelect: (p: any) => void
  statusFilters: Record<string, boolean>
  setStatusFilters: (filters: Record<string, boolean>) => void

  // List mode
  listLoading: boolean
  listItems: Array<{ key: string; listItemId: number; type: 'person' | 'achievement' | 'period'; title: string; subtitle?: string; person?: any }>
}

export function PersonsSection(props: PersonsSectionProps) {
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
    onSelect,
    statusFilters,
    setStatusFilters,
    listLoading,
    listItems
  } = props

  // Derive mode from menuSelection
  const modeIsList = (menuSelection as any as string).startsWith('list:')
  const modeIsAll = menuSelection === ('all' as any)
  const modeIsMine = menuSelection === ('mine' as any)

  return (
    <ManageSection
      sidebarCollapsed={sidebarCollapsed}
      setSidebarCollapsed={setSidebarCollapsed}
      menuSelection={menuSelection}
      setMenuSelection={setMenuSelection}
      isModerator={isModerator}
      pendingCount={personsPendingCount}
      mineCount={personsMineCount}
      personLists={personLists}
      isAuthenticated={isAuthenticated}
      emailVerified={true}
      setShowAuthModal={setShowAuthModal}
      setShowCreateList={setShowCreateList}
      sharedList={sharedList}
      selectedListId={selectedListId}
      setSelectedListId={setSelectedListId}
      loadUserLists={loadUserLists}
      showToast={showToast}
      listLoading={listLoading}
      listItems={listItems}
      filterType="person"
      fullWidth={false}
      onDeleteListItem={async (listItemId) => {
        if (!selectedListId) return
        const ok = await deleteListItem(selectedListId, listItemId)
        if (ok) { 
          await loadUserLists()
          showToast('Удалено из списка', 'success')
        } else { 
          showToast('Не удалось удалить', 'error')
        }
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {!modeIsList ? (
          <>
            {/* Фильтр статусов для режима "mine" */}
            {modeIsMine && (
              <div style={{ marginBottom: 12, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <FilterDropdown
                  title="📋 Статус"
                  textLabel="Статус"
                  items={['🟡 Черновики', '🟠 На модерации', '🟢 Одобренные', '🔴 Отклоненные']}
                  selectedItems={Object.entries(statusFilters)
                    .filter(([_, checked]) => checked)
                    .map(([status, _]) => {
                      switch (status) {
                        case 'draft': return '🟡 Черновики'
                        case 'pending': return '🟠 На модерации'
                        case 'approved': return '🟢 Одобренные'
                        case 'rejected': return '🔴 Отклоненные'
                        default: return status
                      }
                    })}
                  onSelectionChange={(statuses) => {
                    const statusMap = {
                      '🟡 Черновики': 'draft',
                      '🟠 На модерации': 'pending',
                      '🟢 Одобренные': 'approved',
                      '🔴 Отклоненные': 'rejected'
                    }
                    const selectedKeys = statuses.map(s => statusMap[s as keyof typeof statusMap]).filter(Boolean)
                    const newFilters = {
                      draft: selectedKeys.includes('draft'),
                      pending: selectedKeys.includes('pending'),
                      approved: selectedKeys.includes('approved'),
                      rejected: selectedKeys.includes('rejected')
                    }
                    setStatusFilters(newFilters)
                  }}
                  getItemColor={(item) => {
                    if (item.includes('Черновики')) return '#ffc107'      // жёлтый
                    if (item.includes('модерации')) return '#fd7e14'      // оранжевый  
                    if (item.includes('Одобренные')) return '#28a745'     // зелёный
                    if (item.includes('Отклоненные')) return '#dc3545'    // красный
                    return '#f4e4c1'
                  }}
                />
              </div>
            )}

            <SearchAndFilters
              searchValue={searchPersons}
              onSearchChange={setSearchPersons}
              searchPlaceholder="Поиск по имени/стране"
              filters={[
                {
                  key: 'category',
                  label: 'Категория',
                  value: filters?.category || '',
                  options: [
                    { value: '', label: 'Все категории' },
                    ...categories.map(cat => ({ value: cat, label: cat }))
                  ],
                  onChange: (value: string) => setFilters((prev: any) => ({ ...prev, category: value }))
                },
                {
                  key: 'country',
                  label: 'Страна',
                  value: filters?.country || '',
                  options: [
                    { value: '', label: 'Все страны' },
                    ...countries.map(country => ({ value: country, label: country }))
                  ],
                  onChange: (value: string) => setFilters((prev: any) => ({ ...prev, country: value }))
                }
              ]}
              foundCount={modeIsAll ? personsAll.length : personsAlt.length}
              hasMore={!(modeIsAll ? isPersonsLoadingAll : personsAltLoading) && (modeIsAll ? personsHasMoreAll : personsAltHasMore)}
              isLoading={modeIsAll ? isPersonsLoadingAll : personsAltLoading}
            />

            <ItemsList
              items={(modeIsAll ? personsAll : personsAlt).map((p: any) => ({
                id: p.id,
                title: p.name || '—',
                subtitle: p.country_name || p.countryName || '',
                year: p.birth_year || p.birthYear || p.death_year || p.deathYear || '',
                description: p.description || ''
              }))}
              isLoading={modeIsAll ? isPersonsLoadingAll : personsAltLoading}
              hasMore={modeIsAll ? personsHasMoreAll : personsAltHasMore}
              onLoadMore={() => {
                if (modeIsAll) {
                  loadMorePersonsAll()
                }
                // Note: mine mode pagination is handled by the parent component
              }}
              onSelect={(id) => {
                const person = (modeIsAll ? personsAll : personsAlt).find(p => p.id === id)
                if (person) onSelect(person)
              }}
              emptyMessage={!personsAltLoading && modeIsMine && personsAlt.length === 0 
                ? "Здесь будут отображаться созданные или отредактированные вами элементы"
                : "Личности не найдены"
              }
              loadingMessage="Загрузка..."
            />
          </>
        ) : (
          <>
            <ListSummary items={listItems.filter(i => i.type === 'person')} style={{ marginBottom: 8, fontSize: 12, opacity: 0.9 }} />
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
                    const ok = await deleteListItem(selectedListId, id)
                    if (ok) { await loadUserLists(); showToast('Удалено из списка', 'success') }
                    else { showToast('Не удалось удалить', 'error') }
                  }}>✕</button>
                </div>
              ))}
              {!listLoading && listItems.filter(i => i.type === 'person').length === 0 && <div style={{ opacity: 0.8 }}>Список пуст</div>}
            </div>
          </>
        )}
      </div>
    </ManageSection>
  )
}


