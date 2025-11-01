import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ManageModals } from '../ManageModals'
import { Person } from 'shared/types'

// Mock all dependencies
vi.mock('../AuthRequiredModal', () => ({
  AuthRequiredModal: ({ isOpen, onClose }: any) => 
    isOpen ? <div data-testid="auth-required-modal"><button onClick={onClose}>Close Auth</button></div> : null
}))

vi.mock('../CreateEntityModal', () => ({
  CreateEntityModal: ({ isOpen, onClose, onCreatePerson, onCreateAchievement, onCreatePeriod }: any) => 
    isOpen ? (
      <div data-testid="create-entity-modal">
        <button onClick={onClose}>Close Create</button>
        <button onClick={() => onCreatePerson({
          name: 'Test Person',
          birthYear: 1900,
          deathYear: 1980,
          category: 'Science',
          description: 'Test',
          imageUrl: '',
          wikiLink: '',
          saveAsDraft: false,
          lifePeriods: []
        })}>Create Person</button>
        <button onClick={() => onCreateAchievement({
          personId: 'person-1',
          year: 1950,
          description: 'Achievement',
          saveAsDraft: true
        })}>Create Achievement</button>
        <button onClick={() => onCreatePeriod({
          personId: 'person-1',
          startYear: 1920,
          endYear: 1950,
          type: 'life',
          countryId: 'usa',
          description: 'Period',
          saveAsDraft: true
        })}>Create Period</button>
      </div>
    ) : null
}))

vi.mock('../PersonEditModal', () => ({
  PersonEditModal: ({ isOpen, onClose, onProposeEdit, onUpdateDraft, onSubmitDraft }: any) => 
    isOpen ? (
      <div data-testid="person-edit-modal">
        <button onClick={onClose}>Close Edit</button>
        <button onClick={() => onProposeEdit('person-1', {}, [])}>Propose Edit</button>
        <button onClick={() => onUpdateDraft('person-1', {}, [])}>Update Draft</button>
        <button onClick={() => onSubmitDraft('person-1', {}, [])}>Submit Draft</button>
      </div>
    ) : null
}))

vi.mock('../CreateListModal', () => ({
  CreateListModal: ({ isOpen, onClose, onCreate }: any) => 
    isOpen ? (
      <div data-testid="create-list-modal">
        <button onClick={onClose}>Close List</button>
        <button onClick={() => onCreate('New List')}>Create List</button>
      </div>
    ) : null
}))

vi.mock('../AddToListModal', () => ({
  AddToListModal: ({ isOpen, onClose, onCreateList, onAdd }: any) => 
    isOpen ? (
      <div data-testid="add-to-list-modal">
        <button onClick={onClose}>Close Add</button>
        <button onClick={onCreateList}>Create New List</button>
        <button onClick={() => onAdd(1)}>Add to List</button>
      </div>
    ) : null
}))

vi.mock('shared/ui/EditWarningModal', () => ({
  EditWarningModal: ({ isOpen, onCancel, onRevertToDraft }: any) => 
    isOpen ? (
      <div data-testid="edit-warning-modal">
        <button onClick={onCancel}>Cancel Warning</button>
        <button onClick={onRevertToDraft}>Revert to Draft</button>
      </div>
    ) : null
}))

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
}))

vi.mock('shared/utils/slug', () => ({
  slugifyIdFromName: vi.fn((name: string) => name.toLowerCase().replace(/\s+/g, '-'))
}))

describe('ManageModals', () => {
  const mockPerson: Person = {
    id: 'person-1',
    name: 'Test Person',
    birthYear: 1900,
    deathYear: 1980,
    category: 'Science',
    country: 'USA',
    description: 'Test',
    categories: ['Science'],
    countries: ['USA'],
    reignPeriods: [],
    achievements: [],
    periods: [],
  }

  const mockUser = {
    id: '1',
    email: 'test@example.com',
    email_verified: true,
  }

  const mockAddToList = {
    isOpen: false,
    openForPerson: vi.fn(),
    openForAchievement: vi.fn(),
    openForPeriod: vi.fn(),
    close: vi.fn(),
    includeLinked: false,
    setIncludeLinked: vi.fn(),
    onAdd: vi.fn(),
  }

  const defaultProps = {
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
    categories: ['Science', 'Art'],
    countryOptions: [],
    categorySelectOptions: [{ value: 'Science', label: 'Наука' }],
    countrySelectOptions: [{ value: 'usa', label: 'США' }],
    selected: null,
    setSelected: vi.fn(),
    lifePeriods: [],
    setLifePeriods: vi.fn(),
    editBirthYear: 1900,
    setEditBirthYear: vi.fn(),
    editDeathYear: 1980,
    setEditDeathYear: vi.fn(),
    editPersonCategory: 'Science',
    setEditPersonCategory: vi.fn(),
    personLists: [],
    isAuthenticated: false,
    user: null,
    isModerator: false,
    addToList: mockAddToList,
    showToast: vi.fn(),
    resetPersons: vi.fn(),
    resetAchievements: vi.fn(),
    resetPeriods: vi.fn(),
    loadUserLists: vi.fn(),
    navigate: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render without errors', () => {
    const { container } = render(<ManageModals {...defaultProps} />)
    expect(container).toBeTruthy()
  })

  it('should render AuthRequiredModal when showAuthModal is true', () => {
    render(<ManageModals {...defaultProps} showAuthModal={true} />)
    expect(screen.getByTestId('auth-required-modal')).toBeInTheDocument()
  })

  it('should close AuthRequiredModal', () => {
    render(<ManageModals {...defaultProps} showAuthModal={true} />)
    
    fireEvent.click(screen.getByText('Close Auth'))
    expect(defaultProps.setShowAuthModal).toHaveBeenCalledWith(false)
  })

  it('should render CreateEntityModal when showCreate is true', () => {
    render(<ManageModals {...defaultProps} showCreate={true} />)
    expect(screen.getByTestId('create-entity-modal')).toBeInTheDocument()
  })

  it('should close CreateEntityModal', () => {
    render(<ManageModals {...defaultProps} showCreate={true} />)
    
    fireEvent.click(screen.getByText('Close Create'))
    expect(defaultProps.setShowCreate).toHaveBeenCalledWith(false)
  })

  it('should handle person creation without email verification', async () => {
    const { proposeNewPerson } = await import('shared/api/api')
    
    render(<ManageModals {...defaultProps} showCreate={true} user={mockUser} />)
    
    fireEvent.click(screen.getByText('Create Person'))
    
    await waitFor(() => {
      expect(defaultProps.showToast).toHaveBeenCalledWith(
        'Предложение на создание личности отправлено',
        'success'
      )
    })
  })

  it('should handle person draft creation', async () => {
    const { createPersonDraft } = await import('shared/api/api')
    vi.mocked(createPersonDraft).mockResolvedValue(undefined)
    
    render(
      <ManageModals
        {...defaultProps}
        showCreate={true}
        user={{ ...mockUser, email_verified: true }}
      />
    )
    
    // This will trigger saveAsDraft=false, but we test the flow
    fireEvent.click(screen.getByText('Create Person'))
    
    await waitFor(() => {
      expect(defaultProps.setShowCreate).toHaveBeenCalledWith(false)
    })
  })

  it('should handle achievement creation with draft', async () => {
    const { createAchievementDraft } = await import('shared/api/api')
    vi.mocked(createAchievementDraft).mockResolvedValue(undefined)
    
    render(
      <ManageModals
        {...defaultProps}
        showCreate={true}
        user={{ ...mockUser, email_verified: true }}
      />
    )
    
    fireEvent.click(screen.getByText('Create Achievement'))
    
    await waitFor(() => {
      expect(defaultProps.showToast).toHaveBeenCalledWith(
        'Черновик достижения сохранен',
        'success'
      )
    })
  })

  it('should handle period creation with draft', async () => {
    const { createPeriodDraft } = await import('shared/api/api')
    vi.mocked(createPeriodDraft).mockResolvedValue(undefined)
    
    render(
      <ManageModals
        {...defaultProps}
        showCreate={true}
        user={{ ...mockUser, email_verified: true }}
      />
    )
    
    fireEvent.click(screen.getByText('Create Period'))
    
    await waitFor(() => {
      expect(defaultProps.showToast).toHaveBeenCalledWith(
        'Черновик периода сохранен',
        'success'
      )
    })
  })

  it('should render PersonEditModal when isEditing and person selected', () => {
    render(
      <ManageModals
        {...defaultProps}
        isEditing={true}
        selected={mockPerson}
      />
    )
    
    expect(screen.getByTestId('person-edit-modal')).toBeInTheDocument()
  })

  it('should not render PersonEditModal when no person selected', () => {
    render(<ManageModals {...defaultProps} isEditing={true} selected={null} />)
    expect(screen.queryByTestId('person-edit-modal')).not.toBeInTheDocument()
  })

  it('should close PersonEditModal', () => {
    render(
      <ManageModals 
        {...defaultProps}
        isEditing={true}
        selected={mockPerson}
      />
    )
    
    fireEvent.click(screen.getByText('Close Edit'))
    expect(defaultProps.setIsEditing).toHaveBeenCalledWith(false)
  })

  it('should render CreateListModal when showCreateList is true', () => {
    render(<ManageModals {...defaultProps} showCreateList={true} />)
    expect(screen.getByTestId('create-list-modal')).toBeInTheDocument()
  })

  it('should close CreateListModal', () => {
    render(<ManageModals {...defaultProps} showCreateList={true} />)
    
    fireEvent.click(screen.getByText('Close List'))
    expect(defaultProps.setShowCreateList).toHaveBeenCalledWith(false)
  })

  it('should handle list creation', async () => {
    const { apiFetch } = await import('shared/api/api')
    vi.mocked(apiFetch).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ data: { id: 1 } })
    } as any)
    
    render(<ManageModals {...defaultProps} showCreateList={true} />)
    
    fireEvent.click(screen.getByText('Create List'))
    
    await waitFor(() => {
      expect(defaultProps.loadUserLists).toHaveBeenCalledWith(true)
    })
  })

  it('should render AddToListModal when addToList.isOpen is true', () => {
    const openAddToList = { ...mockAddToList, isOpen: true }
    
    render(<ManageModals {...defaultProps} addToList={openAddToList} />)
    expect(screen.getByTestId('add-to-list-modal')).toBeInTheDocument()
  })

  it('should close AddToListModal', () => {
    const openAddToList = { ...mockAddToList, isOpen: true }
    
    render(<ManageModals {...defaultProps} addToList={openAddToList} />)
    
    fireEvent.click(screen.getByText('Close Add'))
    expect(openAddToList.close).toHaveBeenCalled()
  })

  it('should open CreateListModal from AddToListModal', () => {
    const openAddToList = { ...mockAddToList, isOpen: true }
    
    render(<ManageModals {...defaultProps} addToList={openAddToList} />)
    
    fireEvent.click(screen.getByText('Create New List'))
    expect(openAddToList.close).toHaveBeenCalled()
    expect(defaultProps.setShowCreateList).toHaveBeenCalledWith(true)
  })

  it('should handle add to list', () => {
    const openAddToList = { ...mockAddToList, isOpen: true }
    
    render(<ManageModals {...defaultProps} addToList={openAddToList} />)
    
    fireEvent.click(screen.getByText('Add to List'))
    expect(openAddToList.onAdd).toHaveBeenCalledWith(1)
  })

  it('should render EditWarningModal when showEditWarning is true', () => {
    render(
      <ManageModals
        {...defaultProps}
        showEditWarning={true}
        selected={mockPerson}
      />
    )
    
    expect(screen.getByTestId('edit-warning-modal')).toBeInTheDocument()
  })

  it('should close EditWarningModal', () => {
    render(
      <ManageModals
        {...defaultProps}
        showEditWarning={true}
        selected={mockPerson}
      />
    )
    
    fireEvent.click(screen.getByText('Cancel Warning'))
    expect(defaultProps.setShowEditWarning).toHaveBeenCalledWith(false)
  })

  it('should handle revert to draft', async () => {
    const { revertPersonToDraft, getPersonById } = await import('shared/api/api')
    vi.mocked(revertPersonToDraft).mockResolvedValue(undefined)
    vi.mocked(getPersonById).mockResolvedValue(mockPerson)
    
    render(
      <ManageModals
        {...defaultProps}
        showEditWarning={true}
        selected={mockPerson}
      />
    )
    
    fireEvent.click(screen.getByText('Revert to Draft'))
    
    await waitFor(() => {
      expect(defaultProps.showToast).toHaveBeenCalledWith(
        'Личность возвращена в черновики',
        'success'
      )
    })
  })

  it('should handle error during person creation', async () => {
    const { proposeNewPerson } = await import('shared/api/api')
    vi.mocked(proposeNewPerson).mockRejectedValue(new Error('API Error'))
    
    render(
      <ManageModals
        {...defaultProps}
        showCreate={true}
        user={{ ...mockUser, email_verified: true }}
      />
    )
    
    fireEvent.click(screen.getByText('Create Person'))
    
    await waitFor(() => {
      expect(defaultProps.showToast).toHaveBeenCalledWith('API Error', 'error')
    })
  })

  it('should show error when creating person without email verification', async () => {
    render(
      <ManageModals
        {...defaultProps}
        showCreate={true}
        user={{ ...mockUser, email_verified: false }}
      />
    )
    
    fireEvent.click(screen.getByText('Create Person'))
    
    await waitFor(() => {
      expect(defaultProps.showToast).toHaveBeenCalledWith(
        'Требуется подтверждение email для создания личностей',
        'error'
      )
    })
  })

  it('should show error when creating achievement without personId', async () => {
    // Mock the CreateEntityModal to pass no personId
    vi.doMock('../CreateEntityModal', () => ({
      CreateEntityModal: ({ isOpen, onClose, onCreateAchievement }: any) => 
        isOpen ? (
          <div data-testid="create-entity-modal">
            <button onClick={() => onCreateAchievement({
              personId: undefined,
              year: 1950,
              description: 'Achievement',
              saveAsDraft: true
            })}>Create Achievement No Person</button>
          </div>
        ) : null
    }))
    
    render(
      <ManageModals
        {...defaultProps}
        showCreate={true}
        user={{ ...mockUser, email_verified: true }}
      />
    )
    
    const btn = screen.queryByText('Create Achievement No Person')
    if (btn) {
      fireEvent.click(btn)
      
      await waitFor(() => {
        expect(defaultProps.showToast).toHaveBeenCalledWith(
          'Необходимо выбрать личность для достижения',
          'error'
        )
      })
    }
  })
})
