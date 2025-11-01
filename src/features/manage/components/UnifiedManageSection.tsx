import React from 'react';
import { ManageSection } from 'shared/ui/ManageSection';
import { ItemsList } from 'shared/ui/ItemsList';
import { SearchAndFilters } from 'features/manage/components/SearchAndFilters';
import { adaptToItemCard } from 'features/manage/utils/itemAdapters';
import type { Person, Achievement, Period, FiltersState, SetFilters, MixedListItem } from 'shared/types';
import type { MenuSelection } from '../hooks/useManageState';
import type { AchievementTile } from 'shared/hooks/useAchievements';
import type { PeriodTile } from 'shared/hooks/usePeriods';

type ListItem = { id: number; title: string; items_count?: number; readonly?: boolean };

// Period item type from useManagePageData
interface PeriodItem {
  id: number
  name: string
  startYear: number
  endYear: number
  type: string
  description?: string
  person_id?: string
  country_id?: number
  status?: string
}

// Union type для всех возможных item типов (используем базовые типы + расширения + упрощенные версии)
type PeriodExtended = Period & { id?: number; name?: string; description?: string; person_id?: string; status?: string }
type ManagedItem = Person | Achievement | AchievementTile | PeriodExtended | PeriodTile | PeriodItem;

interface UnifiedManageSectionProps {
  // Layout management (passed to ManageSection)
  sidebarCollapsed: boolean;
  menuSelection: MenuSelection;
  setMenuSelection: (sel: MenuSelection) => void;
  isModerator: boolean;
  pendingCount: number | null;
  mineCount: number | null;
  personLists: ListItem[];
  isAuthenticated: boolean;
  setShowAuthModal: (b: boolean) => void;
  setShowCreateList: (b: boolean) => void;
  sharedList: { id: number; title: string; owner_user_id?: string } | null;
  selectedListId: number | null;
  setSelectedListId: (id: number | null) => void;
  loadUserLists: (force?: boolean) => Promise<void>;
  showToast: (m: string, t?: 'success' | 'error' | 'info') => void;

  // Core data and functionality
  data: {
    items: ManagedItem[];
    isLoading: boolean;
    hasMore: boolean;
    loadMore: () => void;
  };
  itemType: 'person' | 'achievement' | 'period';

  // Search and filters
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  categories: string[];
  countries: string[];
  filters: FiltersState;
  setFilters: SetFilters;
  statusFilters: Record<string, boolean>;
  setStatusFilters: (filters: Record<string, boolean>) => void;

  // List operations (for custom lists)
  listLoading: boolean;
  listItems: MixedListItem[];
  onDeleteListItem?: (listItemId: number) => Promise<void> | void;
  getListItemIdByDisplayId?: (id: string | number) => number | undefined;

  // Item actions
  onSelect: (item: ManagedItem) => void;
  onPersonSelect?: (person: Person) => void;
  onAddItem?: (id: string) => void;

  // Create new item
  setShowCreate?: (show: boolean) => void;
  createType?: 'person' | 'achievement' | 'period';
  setCreateType?: (type: 'person' | 'achievement' | 'period') => void;

  // Display customization
  labelAll?: string;
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
  sharedList,
  selectedListId,
  setSelectedListId,
  loadUserLists,
  showToast,
  data,
  itemType,
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
  onDeleteListItem,
  getListItemIdByDisplayId,
  onSelect,
  onPersonSelect,
  onAddItem,
  setShowCreate,
  createType,
  setCreateType,
  labelAll = 'Все',
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
      listItems={listItems}
      filterType={itemType}
      listLoading={listLoading}
      onDeleteListItem={onDeleteListItem}
      showToast={showToast}
      onAddElement={() => setShowCreate?.(true)}
    >
      <>
        <SearchAndFilters
          itemType={itemType}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          categories={categories}
          countries={countries}
          filters={filters}
          setFilters={setFilters}
          statusFilters={statusFilters}
          setStatusFilters={setStatusFilters}
          showStatusFilter={modeIsMine && !modeIsList}
          showPersonFilters={itemType === 'person' && !modeIsList}
          totalCount={data.items.length}
          isLoading={data.isLoading}
          hasMore={data.hasMore}
        />
          <ItemsList
            items={data.items.map((item) => adaptToItemCard(item, itemType))}
            isLoading={(modeIsList ? listLoading : data.isLoading)}
            hasMore={(modeIsList ? false : data.hasMore)}
            onLoadMore={(modeIsList ? () => {} : data.loadMore)}
            onSelect={(id) => {
              const item = data.items.find((p) => String(p.id) === String(id))
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



