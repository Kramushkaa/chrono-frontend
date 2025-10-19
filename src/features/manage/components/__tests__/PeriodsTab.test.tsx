import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PeriodsTab } from '../PeriodsTab';

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
      <button onClick={() => onAddItem(456)} data-testid="add-item">Add Item</button>
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

describe('PeriodsTab', () => {
  const mockProps = {
    sidebarCollapsed: false,
    menuSelection: 'all' as const,
    setMenuSelection: jest.fn(),
    isModerator: false,
    mineCounts: { persons: 0, achievements: 0, periods: 3 },
    sharedList: null,
    personLists: [],
    isAuthenticated: true,
    setShowAuthModal: jest.fn(),
    setShowCreateList: jest.fn(),
    setShowCreate: jest.fn(),
    createType: 'period' as const,
    setCreateType: jest.fn(),
    selectedListId: null,
    setSelectedListId: jest.fn(),
    loadUserLists: jest.fn(),
    showToast: jest.fn(),
    listItems: [],
    listLoading: false,
    periodsData: {
      items: [
        { id: 1, name: 'Period 1', startYear: 1800, endYear: 1850, type: 'rule' },
        { id: 2, name: 'Period 2', startYear: 1850, endYear: 1900, type: 'war' }
      ],
      isLoading: false,
      hasMore: false,
      loadMore: jest.fn(),
    },
    periodsMineData: {
      items: [],
      isLoading: false,
      hasMore: false,
      loadMore: jest.fn(),
    },
    searchPeriods: '',
    setSearchPeriods: jest.fn(),
    filters: { search: '', category: '', country: '', minYear: '', maxYear: '' },
    setFilters: jest.fn(),
    periodsStatusFilters: { showDraft: false, showPending: false, showApproved: true },
    setPeriodsStatusFilters: jest.fn(),
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
    render(<PeriodsTab {...mockProps} />);
    
    expect(screen.getByTestId('manage-periods-section')).toBeInTheDocument();
    expect(screen.getByTestId('unified-manage-section')).toBeInTheDocument();
  });

  it('displays correct labels and messages', () => {
    render(<PeriodsTab {...mockProps} />);
    
    expect(screen.getByTestId('label-all')).toHaveTextContent('Все периоды');
    expect(screen.getByTestId('item-type')).toHaveTextContent('period');
    expect(screen.getByTestId('empty-message')).toHaveTextContent('Периоды не найдены');
    expect(screen.getByTestId('loading-message')).toHaveTextContent('Загрузка периодов...');
  });

  it('shows correct data count based on menu selection', () => {
    render(<PeriodsTab {...mockProps} />);
    
    // Default should show all periods (2 items)
    expect(screen.getByTestId('data-items-count')).toHaveTextContent('2');
  });

  it('handles menu selection change', () => {
    render(<PeriodsTab {...mockProps} />);
    
    const mineTab = screen.getByTestId('mine-tab');
    fireEvent.click(mineTab);
    
    expect(mockProps.setMenuSelection).toHaveBeenCalledWith('mine');
  });

  it('handles search input change', () => {
    render(<PeriodsTab {...mockProps} />);
    
    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, { target: { value: 'war period' } });
    
    expect(mockProps.setSearchPeriods).toHaveBeenCalledWith('war period');
  });

  it('handles add item click', () => {
    render(<PeriodsTab {...mockProps} />);
    
    const addButton = screen.getByTestId('add-item');
    fireEvent.click(addButton);
    
    expect(mockProps.addToList.openForPeriod).toHaveBeenCalledWith(456);
  });

  it('shows mine periods when menu selection is mine', () => {
    render(<PeriodsTab {...mockProps} menuSelection="mine" />);
    
    // When menuSelection is 'mine', should show mine periods (0 items)
    expect(screen.getByTestId('data-items-count')).toHaveTextContent('0');
  });

  it('handles shared list correctly', () => {
    const sharedList = {
      id: 1,
      title: 'Shared List',
      periods_count: 2,
    };
    
    render(<PeriodsTab {...mockProps} sharedList={sharedList} />);
    
    // The component should render with shared list data
    expect(screen.getByTestId('unified-manage-section')).toBeInTheDocument();
  });

  it('filters list items by type when menu selection starts with list:', () => {
    const listItems = [
      { type: 'period', period: { id: 1, name: 'Period 1' } },
      { type: 'achievement', achievement: { id: 1, name: 'Achievement 1' } },
    ];
    
    render(
      <PeriodsTab 
        {...mockProps} 
        menuSelection="list:1" 
        listItems={listItems}
      />
    );
    
    // Should show only period items from the list
    expect(screen.getByTestId('data-items-count')).toHaveTextContent('1');
  });
});
