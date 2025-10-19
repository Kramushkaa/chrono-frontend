import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AchievementsTab } from '../AchievementsTab';

// Mock UnifiedManageSection component
jest.mock('../UnifiedManageSection', () => ({
  UnifiedManageSection: jest.fn(({ 
    labelAll, 
    itemType, 
    emptyMessage, 
    loadingMessage,
    onAddItem,
    data,
    searchQuery,
    setSearchQuery,
    menuSelection,
    setMenuSelection
  }) => (
    <div data-testid="unified-manage-section">
      <div data-testid="label-all">{labelAll}</div>
      <div data-testid="item-type">{itemType}</div>
      <div data-testid="empty-message">{emptyMessage}</div>
      <div data-testid="loading-message">{loadingMessage}</div>
      <button onClick={() => onAddItem(123)} data-testid="add-item">Add Item</button>
      <input 
        value={searchQuery} 
        onChange={(e) => setSearchQuery(e.target.value)} 
        data-testid="search-input"
      />
      <button onClick={() => setMenuSelection('mine')} data-testid="mine-tab">Mine</button>
      <button onClick={() => setMenuSelection('all')} data-testid="all-tab">All</button>
      <div data-testid="data-items-count">{data.items.length}</div>
    </div>
  ))
}));

describe('AchievementsTab', () => {
  const mockProps = {
    sidebarCollapsed: false,
    menuSelection: 'all' as const,
    setMenuSelection: jest.fn(),
    isModerator: false,
    mineCounts: { persons: 0, achievements: 5, periods: 0 },
    sharedList: null,
    personLists: [],
    isAuthenticated: true,
    setShowAuthModal: jest.fn(),
    setShowCreateList: jest.fn(),
    setShowCreate: jest.fn(),
    createType: 'achievement' as const,
    setCreateType: jest.fn(),
    selectedListId: null,
    setSelectedListId: jest.fn(),
    loadUserLists: jest.fn(),
    showToast: jest.fn(),
    listItems: [],
    listLoading: false,
    achievementsData: {
      items: [
        { id: 1, name: 'Achievement 1', description: 'First achievement' },
        { id: 2, name: 'Achievement 2', description: 'Second achievement' }
      ],
      isLoading: false,
      hasMore: false,
      loadMore: jest.fn(),
    },
    achievementsMineData: {
      items: [],
      isLoading: false,
      hasMore: false,
      loadMore: jest.fn(),
    },
    searchAch: '',
    setSearchAch: jest.fn(),
    filters: { search: '', category: '', country: '', minYear: '', maxYear: '' },
    setFilters: jest.fn(),
    achStatusFilters: { showDraft: false, showPending: false, showApproved: true },
    setAchStatusFilters: jest.fn(),
    listItemIdByDomainIdRef: { current: new Map() },
    handleDeleteListItem: jest.fn(),
    addToList: {
      isOpen: false,
      openForPerson: jest.fn(),
      openForAchievement: jest.fn(),
      openForPeriod: jest.fn(),
      close: jest.fn(),
      includeLinked: false,
      setIncludeLinked: jest.fn(),
      onAdd: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<AchievementsTab {...mockProps} />);
    
    expect(screen.getByTestId('manage-achievements-section')).toBeInTheDocument();
    expect(screen.getByTestId('unified-manage-section')).toBeInTheDocument();
  });

  it('displays correct labels and messages', () => {
    render(<AchievementsTab {...mockProps} />);
    
    expect(screen.getByTestId('label-all')).toHaveTextContent('Все достижения');
    expect(screen.getByTestId('item-type')).toHaveTextContent('achievement');
    expect(screen.getByTestId('empty-message')).toHaveTextContent('Достижения не найдены');
    expect(screen.getByTestId('loading-message')).toHaveTextContent('Загрузка достижений...');
  });

  it('shows correct data count based on menu selection', () => {
    render(<AchievementsTab {...mockProps} />);
    
    // Default should show all achievements (2 items)
    expect(screen.getByTestId('data-items-count')).toHaveTextContent('2');
  });

  it('handles menu selection change', () => {
    render(<AchievementsTab {...mockProps} />);
    
    const mineTab = screen.getByTestId('mine-tab');
    fireEvent.click(mineTab);
    
    expect(mockProps.setMenuSelection).toHaveBeenCalledWith('mine');
  });

  it('handles search input change', () => {
    render(<AchievementsTab {...mockProps} />);
    
    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, { target: { value: 'test query' } });
    
    expect(mockProps.setSearchAch).toHaveBeenCalledWith('test query');
  });

  it('handles add item click', () => {
    render(<AchievementsTab {...mockProps} />);
    
    const addButton = screen.getByTestId('add-item');
    fireEvent.click(addButton);
    
    expect(mockProps.addToList.openForAchievement).toHaveBeenCalledWith(123);
  });

  it('shows mine achievements when menu selection is mine', () => {
    render(<AchievementsTab {...mockProps} menuSelection="mine" />);
    
    // When menuSelection is 'mine', should show mine achievements (0 items)
    expect(screen.getByTestId('data-items-count')).toHaveTextContent('0');
  });

  it('handles shared list correctly', () => {
    const sharedList = {
      id: 1,
      title: 'Shared List',
      achievements_count: 3,
    };
    
    render(<AchievementsTab {...mockProps} sharedList={sharedList} />);
    
    // The component should render with shared list data
    expect(screen.getByTestId('unified-manage-section')).toBeInTheDocument();
  });

  it('filters list items by type when menu selection starts with list:', () => {
    const listItems = [
      { type: 'achievement', achievement: { id: 1, name: 'Achievement 1' } },
      { type: 'period', period: { id: 1, name: 'Period 1' } },
    ];
    
    render(
      <AchievementsTab 
        {...mockProps} 
        menuSelection="list:1" 
        listItems={listItems}
      />
    );
    
    // Should show only achievement items from the list
    expect(screen.getByTestId('data-items-count')).toHaveTextContent('1');
  });
});
