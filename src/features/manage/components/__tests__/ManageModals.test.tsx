import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ManageModals } from '../ManageModals';

// Mock all modal components
jest.mock('../AuthRequiredModal', () => ({
  AuthRequiredModal: jest.fn(({ isOpen, onClose }) => (
    isOpen ? (
      <div data-testid="auth-required-modal">
        <button onClick={onClose} data-testid="close-auth-modal">Close</button>
      </div>
    ) : null
  ))
}));

jest.mock('../CreateEntityModal', () => ({
  CreateEntityModal: jest.fn(({ isOpen, onClose, type }) => (
    isOpen ? (
      <div data-testid="create-entity-modal">
        <div data-testid="modal-type">{type}</div>
        <button onClick={onClose} data-testid="close-create-modal">Close</button>
      </div>
    ) : null
  ))
}));

jest.mock('../PersonEditModal', () => ({
  PersonEditModal: jest.fn(({ isOpen, person }) => (
    isOpen ? (
      <div data-testid="person-edit-modal">
        <div data-testid="person-name">{person?.name}</div>
      </div>
    ) : null
  ))
}));

jest.mock('../CreateListModal', () => ({
  CreateListModal: jest.fn(({ isOpen, onClose }) => (
    isOpen ? (
      <div data-testid="create-list-modal">
        <button onClick={onClose} data-testid="close-list-modal">Close</button>
      </div>
    ) : null
  ))
}));

jest.mock('../AddToListModal', () => ({
  AddToListModal: jest.fn(({ isOpen, onClose }) => (
    isOpen ? (
      <div data-testid="add-to-list-modal">
        <button onClick={onClose} data-testid="close-add-modal">Close</button>
      </div>
    ) : null
  ))
}));

jest.mock('shared/ui/EditWarningModal', () => ({
  EditWarningModal: jest.fn(({ isOpen, personName, onRevertToDraft, onCancel }) => (
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
jest.mock('shared/api/api', () => ({
  apiFetch: jest.fn(),
  getPersonById: jest.fn(),
  proposePersonEdit: jest.fn(),
  updatePerson: jest.fn(),
  submitPersonDraft: jest.fn(),
  revertPersonToDraft: jest.fn(),
  createPersonDraft: jest.fn(),
  createAchievementDraft: jest.fn(),
  createPeriodDraft: jest.fn(),
  adminUpsertPerson: jest.fn(),
  proposeNewPerson: jest.fn(),
}));

jest.mock('shared/utils/slug', () => ({
  slugifyIdFromName: jest.fn(() => 'test-id'),
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
    setShowAuthModal: jest.fn(),
    showCreate: false,
    setShowCreate: jest.fn(),
    createType: 'person' as const,
    isEditing: false,
    setIsEditing: jest.fn(),
    showCreateList: false,
    setShowCreateList: jest.fn(),
    showEditWarning: false,
    setShowEditWarning: jest.fn(),
    isReverting: false,
    setIsReverting: jest.fn(),
    categories: ['category1', 'category2'],
    countryOptions: [{ value: 'US', label: 'United States' }],
    categorySelectOptions: [{ value: 'cat1', label: 'Category 1' }],
    countrySelectOptions: [{ value: 'US', label: 'United States' }],
    selected: mockPerson,
    setSelected: jest.fn(),
    lifePeriods: [],
    setLifePeriods: jest.fn(),
    editBirthYear: 1800,
    setEditBirthYear: jest.fn(),
    editDeathYear: 1850,
    setEditDeathYear: jest.fn(),
    editPersonCategory: 'test-category',
    setEditPersonCategory: jest.fn(),
    personLists: [{ id: 1, title: 'Test List' }],
    isAuthenticated: true,
    user: { id: '1', role: 'user', email_verified: true },
    isModerator: false,
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
    showToast: jest.fn(),
    resetPersons: jest.fn(),
    resetAchievements: jest.fn(),
    resetPeriods: jest.fn(),
    loadUserLists: jest.fn(),
    navigate: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<ManageModals {...mockProps} />);
    
    expect(screen.getByTestId('manage-page__modals')).toBeInTheDocument();
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
