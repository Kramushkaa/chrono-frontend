import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PersonsTab } from '../PersonsTab';
import { Person } from 'shared/types';

// Mock dependencies
jest.mock('../UnifiedManageSection', () => ({
  UnifiedManageSection: ({ onSelect, onPersonSelect, itemType, emptyMessage }: any) => (
    <div data-testid="unified-manage-section">
      <button onClick={() => onSelect && onSelect(mockPerson)}>
        Select Person
      </button>
      <button onClick={() => onPersonSelect && onPersonSelect(mockPerson)}>
        Select Person Direct
      </button>
      <span data-testid="item-type">{itemType}</span>
      <span data-testid="empty-message">{emptyMessage}</span>
    </div>
  ),
}));

jest.mock('features/persons/components/PersonCard', () => ({
  PersonCard: ({ person, onAddAchievement }: any) => (
    <div data-testid="person-card">
      <span data-testid="person-name">{person.name}</span>
      <button onClick={() => onAddAchievement && onAddAchievement(person)}>
        Add Achievement
      </button>
    </div>
  ),
}));

jest.mock('features/persons/utils/groupingUtils', () => ({
  getGroupColor: jest.fn(() => '#000'),
  getPersonGroup: jest.fn(() => 'category'),
}));

const mockPerson: Person = {
  id: '1',
  name: 'Test Person',
  birthYear: 1800,
  deathYear: 1900,
  category: 'philosopher',
  country: 'Russia',
  status: 'approved',
};

const defaultProps = {
  sidebarCollapsed: false,
  menuSelection: 'all' as const,
  setMenuSelection: jest.fn(),
  isModerator: false,
  mineCounts: { persons: 5, achievements: 3, periods: 2 },
  sharedList: null,
  personLists: [
    { id: 1, title: 'My List', items_count: 10 }
  ],
  isAuthenticated: true,
  setShowAuthModal: jest.fn(),
  setShowCreateList: jest.fn(),
  setShowCreate: jest.fn(),
  createType: 'person' as const,
  setCreateType: jest.fn(),
  selectedListId: null,
  setSelectedListId: jest.fn(),
  loadUserLists: jest.fn(),
  showToast: jest.fn(),
  listItems: [],
  listLoading: false,
  personsAlt: [mockPerson],
  personsAltLoading: false,
  personsAltInitialLoading: false,
  personsAltHasMore: false,
  loadMorePersonsAlt: jest.fn(),
  personsAll: [mockPerson],
  isPersonsLoadingAll: false,
  personsHasMoreAll: false,
  loadMorePersonsAll: jest.fn(),
  searchPersons: '',
  setSearchPersons: jest.fn(),
  categories: ['philosopher', 'scientist'],
  countries: ['Russia', 'France'],
  filters: { category: [], country: [], timeRange: { start: -800, end: 2000 } },
  setFilters: jest.fn(),
  statusFilters: {},
  setStatusFilters: jest.fn(),
  listItemIdByDomainIdRef: { current: new Map() },
  handleDeleteListItem: jest.fn(),
  selected: null,
  setSelected: jest.fn(),
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
  user: { email_verified: true } as any,
  setIsEditing: jest.fn(),
  setShowEditWarning: jest.fn(),
};

describe('PersonsTab', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render without crashing', () => {
    render(<PersonsTab {...defaultProps} />);
    
    expect(screen.getByTestId('unified-manage-section')).toBeInTheDocument();
    expect(screen.getByTestId('item-type')).toHaveTextContent('person');
    expect(screen.getByTestId('empty-message')).toHaveTextContent('Личности не найдены');
  });

  it('should show empty message when no person is selected', () => {
    render(<PersonsTab {...defaultProps} />);
    
    expect(screen.getByText('Выберите личность слева')).toBeInTheDocument();
  });

  it('should render person card when person is selected', () => {
    render(<PersonsTab {...defaultProps} selected={mockPerson} />);
    
    expect(screen.getByTestId('person-card')).toBeInTheDocument();
    expect(screen.getByTestId('person-name')).toHaveTextContent('Test Person');
    expect(screen.getByText('Карточка')).toBeInTheDocument();
    expect(screen.getByText('Редактировать')).toBeInTheDocument();
    expect(screen.getByText('Добавить в список')).toBeInTheDocument();
  });

  it('should handle edit button click for authenticated user', () => {
    const setIsEditing = jest.fn();
    render(
      <PersonsTab 
        {...defaultProps} 
        selected={mockPerson}
        setIsEditing={setIsEditing}
        isAuthenticated={true}
        user={{ email_verified: true } as any}
      />
    );
    
    fireEvent.click(screen.getByText('Редактировать'));
    expect(setIsEditing).toHaveBeenCalledWith(true);
  });

  it('should show auth modal for unauthenticated user on edit', () => {
    const setShowAuthModal = jest.fn();
    render(
      <PersonsTab 
        {...defaultProps} 
        selected={mockPerson}
        setShowAuthModal={setShowAuthModal}
        isAuthenticated={false}
        user={null}
      />
    );
    
    fireEvent.click(screen.getByText('Редактировать'));
    expect(setShowAuthModal).toHaveBeenCalledWith(true);
  });

  it('should handle add to list button click', () => {
    const mockOpenForPerson = jest.fn();
    render(
      <PersonsTab 
        {...defaultProps} 
        selected={mockPerson}
        addToList={{
          ...defaultProps.addToList,
          openForPerson: mockOpenForPerson,
        }}
        isAuthenticated={true}
        user={{ email_verified: true } as any}
      />
    );
    
    fireEvent.click(screen.getByText('Добавить в список'));
    expect(mockOpenForPerson).toHaveBeenCalledWith(mockPerson);
  });

  it('should show edit warning for pending person', () => {
    const setShowEditWarning = jest.fn();
    const pendingPerson = { ...mockPerson, status: 'pending' };
    
    render(
      <PersonsTab 
        {...defaultProps} 
        selected={pendingPerson}
        setShowEditWarning={setShowEditWarning}
        isAuthenticated={true}
        user={{ email_verified: true } as any}
      />
    );
    
    fireEvent.click(screen.getByText('Редактировать'));
    expect(setShowEditWarning).toHaveBeenCalledWith(true);
  });

  it('should handle add achievement from person card', () => {
    const setShowCreate = jest.fn();
    const setCreateType = jest.fn();
    
    render(
      <PersonsTab 
        {...defaultProps} 
        selected={mockPerson}
        setShowCreate={setShowCreate}
        setCreateType={setCreateType}
        isAuthenticated={true}
        user={{ email_verified: true } as any}
      />
    );
    
    fireEvent.click(screen.getByText('Add Achievement'));
    expect(setCreateType).toHaveBeenCalledWith('achievement');
    expect(setShowCreate).toHaveBeenCalledWith(true);
  });

  it('should pass correct props to UnifiedManageSection', () => {
    render(<PersonsTab {...defaultProps} />);
    
    const section = screen.getByTestId('unified-manage-section');
    expect(section).toBeInTheDocument();
    
    // Verify that the correct menu selection and data structure is passed
    expect(screen.getByTestId('item-type')).toHaveTextContent('person');
  });
});
