import React from 'react';
import { ManageSection } from 'shared/ui/ManageSection';
import { ItemsList } from 'shared/ui/ItemsList';
import { FilterDropdown } from 'shared/ui/FilterDropdown';

type ListItem = { id: number; title: string; items_count?: number; readonly?: boolean };

interface UnifiedManageSectionProps {
  // Sidebar
  sidebarCollapsed: boolean;
  menuSelection: string;
  setMenuSelection: (sel: any) => void;
  isModerator: boolean;
  pendingCount: number | null;
  mineCount: number | null;
  personLists: ListItem[];
  isAuthenticated: boolean;
  setShowAuthModal: (b: boolean) => void;
  setShowCreateList: (b: boolean) => void;
  setShowCreate?: (show: boolean) => void;
  createType?: 'person' | 'achievement' | 'period';
  setCreateType?: (type: 'person' | 'achievement' | 'period') => void;
  sharedList: { id: number; title: string; owner_user_id?: string } | null;
  selectedListId: number | null;
  setSelectedListId: (id: number | null) => void;
  loadUserLists: (force?: boolean) => Promise<void>;
  showToast: (m: string, t?: 'success' | 'error' | 'info') => void;

  // Unified data provider for current mode ("Все"/"Мои")
  data: {
    items: any[];
    isLoading: boolean;
    hasMore: boolean;
    loadMore: () => void;
  };

  // Search and filters
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  categories: string[];
  countries: string[];
  filters: any;
  setFilters: any;
  statusFilters: Record<string, boolean>;
  setStatusFilters: (filters: Record<string, boolean>) => void;

  // List mode
  listLoading: boolean;
  listItems: any[];
  setListItems?: (items: any[]) => void;
  onDeleteListItem?: (listItemId: number) => Promise<void> | void;
  getListItemIdByDisplayId?: (id: string | number) => number | undefined;

  // Actions
  onSelect: (item: any) => void;
  onPersonSelect?: (person: any) => void;
  onAddItem?: (id: string) => void;
  onAddForSelectedPerson?: () => void;

  // Labels
  labelAll?: string;
  itemType: 'person' | 'achievement' | 'period';
  emptyMessage?: string;
  loadingMessage?: string;
}

export function UnifiedManageSection({
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
  setShowCreate,
  createType,
  setCreateType,
  sharedList,
  selectedListId,
  setSelectedListId,
  loadUserLists,
  showToast,
  data,
  searchQuery,
  setSearchQuery,
  categories,
  countries,
  filters,
  setFilters,
  statusFilters,
  setStatusFilters,
  listLoading,
  listItems,
  setListItems,
  onDeleteListItem,
  getListItemIdByDisplayId,
  onSelect,
  onPersonSelect,
  onAddItem,
  onAddForSelectedPerson,
  labelAll = 'Все',
  itemType,
  emptyMessage = 'Элементы не найдены',
  loadingMessage = 'Загрузка...'
}: UnifiedManageSectionProps) {
  const modeIsMine = menuSelection === 'mine';
  const modeIsList = menuSelection.startsWith('list:');
  
  // Логи для отладки убраны


  return (
    <ManageSection
      sidebarCollapsed={sidebarCollapsed}
      menuSelection={menuSelection}
      setMenuSelection={setMenuSelection}
      isAuthenticated={isAuthenticated}
      isModerator={isModerator}
      pendingCount={pendingCount}
      mineCount={mineCount}
      personLists={personLists}
      sharedList={sharedList}
      selectedListId={selectedListId}
      setSelectedListId={setSelectedListId}
      loadUserLists={loadUserLists}
      setShowAuthModal={setShowAuthModal}
      setShowCreateList={setShowCreateList}
      setShowCreate={setShowCreate}
      createType={createType}
      setCreateType={setCreateType}
      listItems={listItems}
      filterType={itemType}
      listLoading={listLoading}
      onDeleteListItem={onDeleteListItem}
      showToast={showToast}
      onAddElement={() => setShowCreate?.(true)}
    >
      <>
        {modeIsMine && !modeIsList && (
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

        <div className="search-and-filters" role="region" aria-label="Фильтр и поиск" style={{ marginBottom: 12 }}>
          <div className="search-and-filters__controls" style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              id={`${itemType}-search-input`}
              className="search-and-filters__input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={itemType === 'person' ? 'Поиск по имени/стране' : 
                         itemType === 'achievement' ? 'Поиск по достижениям/имени/стране' : 
                         'Поиск по имени/стране'}
            />
            
            {/* Фильтры по категориям и странам только для личностей */}
            {itemType === 'person' && !modeIsList && (
              <>
                <FilterDropdown
                  title="🎭"
                  textLabel="Род деятельности"
                  items={categories}
                  selectedItems={filters?.categories || []}
                  onSelectionChange={(categories: string[]) => setFilters((prev: any) => ({ ...prev, categories }))}
                  getItemColor={() => '#f4e4c1'}
                />
                
                <FilterDropdown
                  title="🌍"
                  textLabel="Страна"
                  items={countries}
                  selectedItems={filters?.countries || []}
                  onSelectionChange={(countries: string[]) => setFilters((prev: any) => ({ ...prev, countries }))}
                  getItemColor={() => '#f4e4c1'}
                />
              </>
            )}
            
            <div className="search-and-filters__count" style={{ fontSize: 12, opacity: 0.8 }}>
              Найдено: {data.items.length}{!data.isLoading && data.hasMore ? '+' : ''}
            </div>
          </div>
        </div>

          <ItemsList
            items={(data.items as any[]).map((item: any) => {
              if (itemType === 'person') {
                return {
                  id: item.id,
                  title: item.name || '—',
                  subtitle: item.country || item.country_name || item.countryName || '',
                  startYear: item.birthYear ?? item.birth_year,
                  endYear: item.deathYear ?? item.death_year,
                  type: item.category || '',
                  person: item
                }
              } else if (itemType === 'achievement') {
                const title = item.title || item.person_name || item.country_name || ''
                return {
                  id: item.id,
                  title: title || '—',
                  year: item.year,
                  description: item.description,
                  achievement: item
                }
              } else {
                const personName = item.person_name ?? item.personName ?? ''
                const countryName = item.country_name ?? item.countryName ?? ''
                const type = item.period_type ?? item.periodType
                const start = item.start_year ?? item.startYear
                const end = item.end_year ?? item.endYear
                const headerParts: string[] = []
                if (personName) headerParts.push(personName)
                if (countryName) headerParts.push(countryName)
                const header = headerParts.join(' • ')
                return {
                  id: item.id ?? `${personName}-${start}-${end}`,
                  title: header || '—',
                  type: type === 'ruler' ? 'Правление' : type === 'life' ? 'Жизнь' : (type || '—'),
                  startYear: start,
                  endYear: end,
                  period: item
                }
              }
            })}
            isLoading={(modeIsList ? listLoading : data.isLoading)}
            hasMore={(modeIsList ? false : data.hasMore)}
            onLoadMore={(modeIsList ? () => {} : data.loadMore)}
            onSelect={(id) => {
              const item = (data.items as any[]).find((p: any) => String(p.id) === String(id))
              if (item) onSelect(item)
            }}
            onPersonSelect={onPersonSelect}
            onAddToList={!modeIsList ? (id) => {
              if (!isAuthenticated) { 
                setShowAuthModal(true)
                return
              }
              onAddItem?.(String(id))
            } : undefined}
            onRemoveFromList={modeIsList ? async (id) => {
              if (onDeleteListItem) {
                const listItemId = (typeof getListItemIdByDisplayId === 'function') ? getListItemIdByDisplayId(id) : undefined
                if (typeof listItemId === 'number') {
                  await onDeleteListItem(listItemId)
                }
              }
            } : undefined}
            isAuthenticated={isAuthenticated}
            emailVerified={true}
            showAuthModal={() => setShowAuthModal(true)}
            showToast={showToast}
            isListMode={modeIsList}
            emptyMessage={!modeIsList && modeIsMine && !data.isLoading && data.items.length === 0 
              ? "Здесь будут отображаться созданные или отредактированные вами элементы"
              : emptyMessage
            }
            loadingMessage={loadingMessage}
            gridMinWidth={200}
          />
      </>
    </ManageSection>
  );
}
