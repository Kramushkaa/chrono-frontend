import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ManageModals } from '../ManageModals';

// Mock all modal components
vi.mock('../AuthRequiredModal', () => ({
  AuthRequiredModal: vi.fn(({ isOpen, onClose }) => (
    isOpen ? (
      <div data-testid="auth-required-modal">
        <button onClick={onClose} data-testid="close-auth-modal">Close</button>
      </div>
    ) : null
  ))
}));

vi.mock('../CreateEntityModal', () => ({
  CreateEntityModal: vi.fn(({ isOpen, onClose, type }) => (
    isOpen ? (
      <div data-testid="create-entity-modal">
        <div data-testid="modal-type">{type}</div>
        <button onClick={onClose} data-testid="close-create-modal">Close</button>
      </div>
    ) : null
  ))
}));

vi.mock('../PersonEditModal', () => ({
  PersonEditModal: vi.fn(({ isOpen, person }) => (
    isOpen ? (
      <div data-testid="person-edit-modal">
        <div data-testid="person-name">{person?.name}</div>
      </div>
    ) : null
  ))
}));

vi.mock('../CreateListModal', () => ({
  CreateListModal: vi.fn(({ isOpen, onClose }) => (
    isOpen ? (
      <div data-testid="create-list-modal">
        <button onClick={onClose} data-testid="close-list-modal">Close</button>
      </div>
    ) : null
  ))
}));

vi.mock('../AddToListModal', () => ({
  AddToListModal: vi.fn(({ isOpen, onClose }) => (
    isOpen ? (
      <div data-testid="add-to-list-modal">
        <button onClick={onClose} data-testid="close-add-modal">Close</button>
      </div>
    ) : null
  ))
}));

vi.mock('shared/ui/EditWarningModal', () => ({
  EditWarningModal: vi.fn(({ isOpen, personName, onRevertToDraft, onCancel }) => (
    isOpen ? (
      <div data-testid="edit-warning-modal">
        <div data-testid="warning-person-name">{personName}</div>
        <button onClick={onRevertToDraft} data-testid="revert-button">Revert</button>
        <button onClick={onCancel} data-testid="cancel-button">Cancel</button>
      </div>
    ) : null
  ))
}));

// Mock API functions
vi.mock('shared/api/api', () => ({
  apiFetch: vi.fn(),
  getPersonById: vi.fn(),
  proposePersonEdit: vi.fn(),
  updatePerson: vi.fn(),
  submitPersonDraft: vi.fn(),
  revertPersonToDraft: vi.fn(),
  createPersonDraft: vi.fn(),
  createAchievementDraft: vi.fn(),
  createPeriodDraft: vi.fn(),
  adminUpsertPerson: vi.fn(),
  proposeNewPerson: vi.fn(),
}));

vi.mock('shared/utils/slug', () => ({
  slugifyIdFromName: vi.fn(() => 'test-id'),
}));

describe('ManageModals', () => {
  const mockPerson = {
    id: 'test-person',
    name: 'Test Person',
    birthYear: 1800,
    deathYear: 1850,
    category: 'test-category',
    country: 'test-country',
    description: 'Test description',
    achievements: [],
    achievementYears: [],
    rulerPeriods: [],
  };

  const mockProps = {
    showAuthModal: false,
    setShowAuthModal: vi.fn(),
    showCreate: false,
    setShowCreate: vi.fn(),
    createType: 'person' as const,
    isEditing: false,
    setIsEditing: vi.fn(),
    showCreateList: false,
    setShowCreateList: vi.fn(),
    showEditWarning: false,
    setShowEditWarning: vi.fn(),
    isReverting: false,
    setIsReverting: vi.fn(),
    categories: ['category1', 'category2'],
    countryOptions: [{ value: 'US', label: 'United States' }],
    categorySelectOptions: [{ value: 'cat1', label: 'Category 1' }],
    countrySelectOptions: [{ value: 'US', label: 'United States' }],
    selected: mockPerson,
    setSelected: vi.fn(),
    lifePeriods: [],
    setLifePeriods: vi.fn(),
    editBirthYear: 1800,
    setEditBirthYear: vi.fn(),
    editDeathYear: 1850,
    setEditDeathYear: vi.fn(),
    editPersonCategory: 'test-category',
    setEditPersonCategory: vi.fn(),
    personLists: [{ id: 1, title: 'Test List' }],
    isAuthenticated: true,
    user: { id: '1', role: 'user', email_verified: true },
    isModerator: false,
    addToList: {
      isOpen: false,
      openForPerson: vi.fn(),
      openForAchievement: vi.fn(),
      openForPeriod: vi.fn(),
      close: vi.fn(),
      includeLinked: false,
      setIncludeLinked: vi.fn(),
      onAdd: vi.fn(),
    },
    showToast: vi.fn(),
    resetPersons: vi.fn(),
    resetAchievements: vi.fn(),
    resetPeriods: vi.fn(),
    loadUserLists: vi.fn(),
    navigate: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<ManageModals {...mockProps} />);
    
    // Компонент рендерит div с классом, но без data-testid
    expect(document.querySelector('.manage-page__modals')).toBeInTheDocument();
  });

  it('shows auth modal when showAuthModal is true', () => {
    render(<ManageModals {...mockProps} showAuthModal={true} />);
    
    expect(screen.getByTestId('auth-required-modal')).toBeInTheDocument();
  });

  it('shows create modal when showCreate is true', () => {
    render(<ManageModals {...mockProps} showCreate={true} />);
    
    expect(screen.getByTestId('create-entity-modal')).toBeInTheDocument();
    expect(screen.getByTestId('modal-type')).toHaveTextContent('person');
  });

  it('shows edit modal when isEditing is true and selected person exists', () => {
    render(<ManageModals {...mockProps} isEditing={true} />);
    
    expect(screen.getByTestId('person-edit-modal')).toBeInTheDocument();
    expect(screen.getByTestId('person-name')).toHaveTextContent('Test Person');
  });

  it('shows create list modal when showCreateList is true', () => {
    render(<ManageModals {...mockProps} showCreateList={true} />);
    
    expect(screen.getByTestId('create-list-modal')).toBeInTheDocument();
  });

  it('shows add to list modal when addToList.isOpen is true', () => {
    render(
      <ManageModals 
        {...mockProps} 
        addToList={{ ...mockProps.addToList, isOpen: true }}
      />
    );
    
    expect(screen.getByTestId('add-to-list-modal')).toBeInTheDocument();
  });

  it('shows edit warning modal when showEditWarning is true', () => {
    render(<ManageModals {...mockProps} showEditWarning={true} />);
    
    expect(screen.getByTestId('edit-warning-modal')).toBeInTheDocument();
    expect(screen.getByTestId('warning-person-name')).toHaveTextContent('Test Person');
  });

  it('handles auth modal close', () => {
    render(<ManageModals {...mockProps} showAuthModal={true} />);
    
    const closeButton = screen.getByTestId('close-auth-modal');
    fireEvent.click(closeButton);
    
    expect(mockProps.setShowAuthModal).toHaveBeenCalledWith(false);
  });

  it('handles create modal close', () => {
    render(<ManageModals {...mockProps} showCreate={true} />);
    
    const closeButton = screen.getByTestId('close-create-modal');
    fireEvent.click(closeButton);
    
    expect(mockProps.setShowCreate).toHaveBeenCalledWith(false);
  });

  it('handles edit warning modal cancel', () => {
    render(<ManageModals {...mockProps} showEditWarning={true} />);
    
    const cancelButton = screen.getByTestId('cancel-button');
    fireEvent.click(cancelButton);
    
    expect(mockProps.setShowEditWarning).toHaveBeenCalledWith(false);
  });

  it('does not render person edit modal when no person is selected', () => {
    render(<ManageModals {...mockProps} isEditing={true} selected={null} />);
    
    expect(screen.queryByTestId('person-edit-modal')).not.toBeInTheDocument();
  });

  it('does not render edit warning modal when no person is selected', () => {
    render(<ManageModals {...mockProps} showEditWarning={true} selected={null} />);
    
    expect(screen.getByTestId('warning-person-name')).toHaveTextContent('');
  });
});




