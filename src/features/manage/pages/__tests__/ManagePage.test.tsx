import React from 'react'
import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import ManagePage from '../ManagePage'

// Mock all the hooks and dependencies
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
})

vi.mock('shared/hooks/useFilters', () => ({
  useFilters: () => ({
    filters: {},
    setFilters: vi.fn(),
    groupingType: 'category',
    setGroupingType: vi.fn(),
    yearInputs: { min: '', max: '' },
    setYearInputs: vi.fn(),
    applyYearFilter: vi.fn(),
    handleYearKeyPress: vi.fn(),
    resetAllFilters: vi.fn(),
  }),
}))

vi.mock('features/persons/utils/groupingUtils', () => ({
  getGroupColor: vi.fn(() => '#000000'),
}))

vi.mock('shared/layout/headers/ManageHeader', () => ({
  ManageHeader: ({ children, ...props }: any) => (
    <div data-testid="manage-header" {...props}>
      {children}
    </div>
  ),
}))

vi.mock('features/manage/hooks/useLists', () => ({
  useLists: () => ({
    personLists: [],
    sharedList: null,
    loadUserLists: { current: vi.fn() },
  }),
}))

vi.mock('features/manage/hooks/useAddToList', () => ({
  useAddToList: () => ({
    openForAchievement: vi.fn(),
    openForPeriod: vi.fn(),
    openForPerson: vi.fn(),
    openForAchievement: vi.fn(),
  }),
}))

vi.mock('shared/context/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    isAuthenticated: false,
  }),
}))

vi.mock('shared/context/ToastContext', () => ({
  useToast: () => ({
    showToast: vi.fn(),
  }),
}))

vi.mock('features/manage/components/AdaptiveTabs', () => ({
  AdaptiveTabs: ({ children, ...props }: any) => (
    <div data-testid="adaptive-tabs" {...props}>
      {children}
    </div>
  ),
}))

vi.mock('features/manage/context/ManageUIContext', () => ({
  ManageUIProvider: ({ children, value }: any) => (
    <div data-testid="manage-ui-provider" data-value={JSON.stringify(value)}>
      {children}
    </div>
  ),
}))

vi.mock('../../hooks/useManagePageData', () => ({
  useManagePageData: () => ({
    personsAlt: [],
    personsAltLoading: false,
    personsAltInitialLoading: false,
    personsAltHasMore: false,
    loadMorePersonsAlt: vi.fn(),
    personsAll: [],
    isPersonsLoadingAll: false,
    personsHasMoreAll: false,
    loadMorePersonsAll: vi.fn(),
    searchPersons: '',
    setSearchPersons: vi.fn(),
    statusFilters: {},
    setStatusFilters: vi.fn(),
    achievementsData: [],
    achievementsMineData: [],
    searchAch: '',
    setSearchAch: vi.fn(),
    achStatusFilters: {},
    setAchStatusFilters: vi.fn(),
    periodsData: [],
    periodsMineData: [],
    searchPeriods: '',
    setSearchPeriods: vi.fn(),
    periodsStatusFilters: {},
    setPeriodsStatusFilters: vi.fn(),
    resetPersons: vi.fn(),
    resetAchievements: vi.fn(),
    resetPeriods: vi.fn(),
  }),
}))

vi.mock('../../hooks/useManageState', () => ({
  useManageState: () => ({
    activeTab: 'persons',
    setActiveTab: vi.fn(),
    sidebarCollapsed: false,
    setSidebarCollapsed: vi.fn(),
    isScrolled: false,
    showControls: false,
    setShowControls: vi.fn(),
    menuSelection: 'all',
    setMenuSelection: vi.fn(),
    selectedListId: null,
    setSelectedListId: vi.fn(),
    mineCounts: { persons: 0, achievements: 0, periods: 0 },
    setMineCounts: vi.fn(),
    countsLoadKeyRef: { current: 0 },
    countsLastTsRef: { current: 0 },
    fetchedDetailsIdsRef: { current: new Set() },
    lastSelectedRef: { current: null },
    listItems: [],
    setListItems: vi.fn(),
    listItemIdByDomainIdRef: { current: new Map() },
    listLoading: false,
    setListLoading: vi.fn(),
    selected: null,
    setSelected: vi.fn(),
    categories: [],
    setCategories: vi.fn(),
    countries: [],
    setCountries: vi.fn(),
    countryOptions: [],
    setCountryOptions: vi.fn(),
    lifePeriods: [],
    setLifePeriods: vi.fn(),
    editPersonCategory: '',
    setEditPersonCategory: vi.fn(),
    editBirthYear: '',
    setEditBirthYear: vi.fn(),
    editDeathYear: '',
    setEditDeathYear: vi.fn(),
    newLifePeriods: [],
    setNewLifePeriods: vi.fn(),
  }),
}))

vi.mock('../../hooks/useManageModals', () => ({
  useManageModals: () => ({
    showAuthModal: false,
    setShowAuthModal: vi.fn(),
    showCreate: false,
    setShowCreate: vi.fn(),
    createType: 'person',
    setCreateType: vi.fn(),
    isEditing: false,
    setIsEditing: vi.fn(),
    showCreateList: false,
    setShowCreateList: vi.fn(),
    showEditWarning: false,
    setShowEditWarning: vi.fn(),
    isReverting: false,
    setIsReverting: vi.fn(),
  }),
}))

vi.mock('../../hooks/useManageBusinessLogic', () => ({
  useManageBusinessLogic: () => ({
    countrySelectOptions: [],
    categorySelectOptions: [],
  }),
}))

vi.mock('../../components/PersonsTab', () => ({
  PersonsTab: ({ children, ...props }: any) => (
    <div data-testid="persons-tab" {...props}>
      {children}
    </div>
  ),
}))

vi.mock('../../components/AchievementsTab', () => ({
  AchievementsTab: ({ children, ...props }: any) => (
    <div data-testid="achievements-tab" {...props}>
      {children}
    </div>
  ),
}))

vi.mock('../../components/PeriodsTab', () => ({
  PeriodsTab: ({ children, ...props }: any) => (
    <div data-testid="periods-tab" {...props}>
      {children}
    </div>
  ),
}))

vi.mock('../../components/ManageModals', () => ({
  ManageModals: ({ children, ...props }: any) => (
    <div data-testid="manage-modals" {...props}>
      {children}
    </div>
  ),
}))

vi.mock('shared/ui/ContactFooter', () => ({
  ContactFooter: ({ children, ...props }: any) => (
    <div data-testid="contact-footer" {...props}>
      {children}
    </div>
  ),
}))

vi.mock('shared/ui/SEO', () => ({
  SEO: ({ children, ...props }: any) => (
    <div data-testid="seo" {...props}>
      {children}
    </div>
  ),
}))

vi.mock('shared/api/api', () => ({
  apiFetch: vi.fn(),
  apiData: {},
}))

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('ManagePage', () => {
  beforeAll(() => {
    // Mock window.location only for this test suite
    const mockLocation = {
      href: 'http://localhost:3000',
      origin: 'http://localhost:3000',
      reload: vi.fn(),
    }
    try {
      delete (window as any).location
      Object.defineProperty(window, 'location', {
        value: mockLocation,
        writable: true,
        configurable: true,
      })
    } catch (e) {
      // Already defined, that's okay
    }
  })

  it('should render without crashing', () => {
    renderWithRouter(<ManagePage />)
    
    // Should render the main container
    const mainElement = document.querySelector('.app.manage-page')
    expect(mainElement).toBeInTheDocument()
    expect(mainElement).toHaveAttribute('id', 'chrononinja-manage')
    expect(mainElement).toHaveAttribute('role', 'main')
  })

  it('should render SEO component', () => {
    renderWithRouter(<ManagePage />)
    
    const seoElement = document.querySelector('[data-testid="seo"]')
    expect(seoElement).toBeInTheDocument()
  })

  it('should render ManageHeader', () => {
    renderWithRouter(<ManagePage />)
    
    const headerElement = document.querySelector('[data-testid="manage-header"]')
    expect(headerElement).toBeInTheDocument()
  })

  it('should render AdaptiveTabs', () => {
    renderWithRouter(<ManagePage />)
    
    const tabsElement = document.querySelector('[data-testid="adaptive-tabs"]')
    expect(tabsElement).toBeInTheDocument()
  })

  it('should render ManageUIProvider', () => {
    renderWithRouter(<ManagePage />)
    
    const providerElement = document.querySelector('[data-testid="manage-ui-provider"]')
    expect(providerElement).toBeInTheDocument()
  })

  it('should render ContactFooter', () => {
    renderWithRouter(<ManagePage />)
    
    const footerElement = document.querySelector('[data-testid="contact-footer"]')
    expect(footerElement).toBeInTheDocument()
  })

  it('should render ManageModals', () => {
    renderWithRouter(<ManagePage />)
    
    const modalsElement = document.querySelector('[data-testid="manage-modals"]')
    expect(modalsElement).toBeInTheDocument()
  })

  it('should render persons tab by default', () => {
    renderWithRouter(<ManagePage />)
    
    const personsTab = document.querySelector('[data-testid="persons-tab"]')
    expect(personsTab).toBeInTheDocument()
  })

  it('should have proper accessibility attributes', () => {
    renderWithRouter(<ManagePage />)
    
    const mainElement = document.querySelector('.app.manage-page')
    expect(mainElement).toHaveAttribute('aria-label', 'Управление контентом')
  })
})




