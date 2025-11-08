import React from 'react';
import { ManageSection } from 'shared/ui/ManageSection';
import { ItemsList } from 'shared/ui/ItemsList';
import { SearchAndFilters } from 'features/manage/components/SearchAndFilters';
import { adaptToItemCard } from 'features/manage/utils/itemAdapters';
import type { Person, Achievement, Period, FiltersState, SetFilters, MixedListItem, UserList } from 'shared/types';
import type { MenuSelection } from '../hooks/useManageState';
import type { AchievementTile } from 'shared/hooks/useAchievements';
import type { PeriodTile } from 'shared/hooks/usePeriods';


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

// Union type РґР»СЏ РІСЃРµС… РІРѕР·РјРѕР¶РЅС‹С… item С‚РёРїРѕРІ (РёСЃРїРѕР»СЊР·СѓРµРј Р±Р°Р·РѕРІС‹Рµ С‚РёРїС‹ + СЂР°СЃС€РёСЂРµРЅРёСЏ + СѓРїСЂРѕС‰РµРЅРЅС‹Рµ РІРµСЂСЃРёРё)
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
  personLists: Array<UserList & { readonly?: boolean }>;
  isAuthenticated: boolean;
  setShowAuthModal: (b: boolean) => void;
  setShowCreateList: (b: boolean) => void;
  sharedList: { id: number; title: string; owner_user_id?: string } | null;
  selectedListId: number | null;
  setSelectedListId: (id: number | null) => void;
  loadUserLists: (force?: boolean) => Promise<void>;
  showToast: (m: string, t?: 'success' | 'error' | 'info') => void;
  currentUserId?: number;
  onListUpdated?: (list: UserList) => void;
  onOpenListPublication?: () => void;

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
  currentUserId,
  onListUpdated,
  onOpenListPublication,
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
  labelAll = 'Р’СЃРµ',
  emptyMessage = 'Р­Р»РµРјРµРЅС‚С‹ РЅРµ РЅР°Р№РґРµРЅС‹',
  loadingMessage = 'Р—Р°РіСЂСѓР·РєР°...'
}: UnifiedManageSectionProps) {
  const modeIsMine = menuSelection === 'mine';
  const modeIsList = menuSelection.startsWith('list:');
  
  const selectedList = modeIsList
    ? personLists.find((lst) => lst.id === selectedListId)
    : undefined;

  // Р›РѕРіРё РґР»СЏ РѕС‚Р»Р°РґРєРё СѓР±СЂР°РЅС‹


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
        {modeIsList && selectedList && !selectedList.readonly && (
          <div style={{ marginBottom: 16 }}>
            <button
              onClick={() => onOpenListPublication?.()}
              style={{
                padding: '10px 16px',
                borderRadius: 8,
                border: '1px solid rgba(139,69,19,0.5)',
                background: 'rgba(139,69,19,0.2)',
                color: '#f7f2eb',
                fontWeight: 600,
                cursor: 'pointer',
                width: '100%',
              }}
            >
              📋 Редактировать / Опубликовать список
            </button>
          </div>
        )}
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
              ? "Р—РґРµСЃСЊ Р±СѓРґСѓС‚ РѕС‚РѕР±СЂР°Р¶Р°С‚СЊСЃСЏ СЃРѕР·РґР°РЅРЅС‹Рµ РёР»Рё РѕС‚СЂРµРґР°РєС‚РёСЂРѕРІР°РЅРЅС‹Рµ РІР°РјРё СЌР»РµРјРµРЅС‚С‹"
              : emptyMessage
            }
            loadingMessage={loadingMessage}
            gridMinWidth={200}
          />
      </>
    </ManageSection>
  );
}




