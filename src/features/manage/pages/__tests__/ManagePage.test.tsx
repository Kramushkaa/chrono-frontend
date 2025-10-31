import React from 'react'
import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import ManagePage from '../ManagePage'

// Mock all the hooks and dependencies
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}))

jest.mock('shared/hooks/useFilters', () => ({
  useFilters: () => ({
    filters: {},
    setFilters: jest.fn(),
    groupingType: 'category',
    setGroupingType: jest.fn(),
    yearInputs: { min: '', max: '' },
    setYearInputs: jest.fn(),
    applyYearFilter: jest.fn(),
    handleYearKeyPress: jest.fn(),
    resetAllFilters: jest.fn(),
  }),
}))

jest.mock('features/persons/utils/groupingUtils', () => ({
  getGroupColor: jest.fn(() => '#000000'),
}))

jest.mock('shared/layout/headers/ManageHeader', () => ({
  ManageHeader: ({ children, ...props }: any) => (
    <div data-testid="manage-header" {...props}>
      {children}
    </div>
  ),
}))

jest.mock('features/manage/hooks/useLists', () => ({
  useLists: () => ({
    personLists: [],
    sharedList: null,
    loadUserLists: { current: jest.fn() },
  }),
}))

jest.mock('features/manage/hooks/useAddToList', () => ({
  useAddToList: () => ({
    openForAchievement: jest.fn(),
    openForPeriod: jest.fn(),
    openForPerson: jest.fn(),
    openForAchievement: jest.fn(),
  }),
}))

jest.mock('shared/context/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    isAuthenticated: false,
  }),
}))

jest.mock('shared/context/ToastContext', () => ({
  useToast: () => ({
    showToast: jest.fn(),
  }),
}))

jest.mock('features/manage/components/AdaptiveTabs', () => ({
  AdaptiveTabs: ({ children, ...props }: any) => (
    <div data-testid="adaptive-tabs" {...props}>
      {children}
    </div>
  ),
}))

jest.mock('features/manage/context/ManageUIContext', () => ({
  ManageUIProvider: ({ children, value }: any) => (
    <div data-testid="manage-ui-provider" data-value={JSON.stringify(value)}>
      {children}
    </div>
  ),
}))

jest.mock('../hooks/useManagePageData', () => ({
  useManagePageData: () => ({
    personsAlt: [],
    personsAltLoading: false,
    personsAltInitialLoading: false,
    personsAltHasMore: false,
    loadMorePersonsAlt: jest.fn(),
    personsAll: [],
    isPersonsLoadingAll: false,
    personsHasMoreAll: false,
    loadMorePersonsAll: jest.fn(),
    searchPersons: '',
    setSearchPersons: jest.fn(),
    statusFilters: {},
    setStatusFilters: jest.fn(),
    achievementsData: [],
    achievementsMineData: [],
    searchAch: '',
    setSearchAch: jest.fn(),
    achStatusFilters: {},
    setAchStatusFilters: jest.fn(),
    periodsData: [],
    periodsMineData: [],
    searchPeriods: '',
    setSearchPeriods: jest.fn(),
    periodsStatusFilters: {},
    setPeriodsStatusFilters: jest.fn(),
    resetPersons: jest.fn(),
    resetAchievements: jest.fn(),
    resetPeriods: jest.fn(),
  }),
}))

jest.mock('../hooks/useManageState', () => ({
  useManageState: () => ({
    activeTab: 'persons',
    setActiveTab: jest.fn(),
    sidebarCollapsed: false,
    setSidebarCollapsed: jest.fn(),
    isScrolled: false,
    showControls: false,
    setShowControls: jest.fn(),
    menuSelection: 'all',
    setMenuSelection: jest.fn(),
    selectedListId: null,
    setSelectedListId: jest.fn(),
    mineCounts: { persons: 0, achievements: 0, periods: 0 },
    setMineCounts: jest.fn(),
    countsLoadKeyRef: { current: 0 },
    countsLastTsRef: { current: 0 },
    fetchedDetailsIdsRef: { current: new Set() },
    lastSelectedRef: { current: null },
    listItems: [],
    setListItems: jest.fn(),
    listItemIdByDomainIdRef: { current: new Map() },
    listLoading: false,
    setListLoading: jest.fn(),
    selected: null,
    setSelected: jest.fn(),
    categories: [],
    setCategories: jest.fn(),
    countries: [],
    setCountries: jest.fn(),
    countryOptions: [],
    setCountryOptions: jest.fn(),
    lifePeriods: [],
    setLifePeriods: jest.fn(),
    editPersonCategory: '',
    setEditPersonCategory: jest.fn(),
    editBirthYear: '',
    setEditBirthYear: jest.fn(),
    editDeathYear: '',
    setEditDeathYear: jest.fn(),
    newLifePeriods: [],
    setNewLifePeriods: jest.fn(),
  }),
}))

jest.mock('../hooks/useManageModals', () => ({
  useManageModals: () => ({
    showAuthModal: false,
    setShowAuthModal: jest.fn(),
    showCreate: false,
    setShowCreate: jest.fn(),
    createType: 'person',
    setCreateType: jest.fn(),
    isEditing: false,
    setIsEditing: jest.fn(),
    showCreateList: false,
    setShowCreateList: jest.fn(),
    showEditWarning: false,
    setShowEditWarning: jest.fn(),
    isReverting: false,
    setIsReverting: jest.fn(),
  }),
}))

jest.mock('../hooks/useManageBusinessLogic', () => ({
  useManageBusinessLogic: () => ({
    countrySelectOptions: [],
    categorySelectOptions: [],
  }),
}))

jest.mock('../components/PersonsTab', () => ({
  PersonsTab: ({ children, ...props }: any) => (
    <div data-testid="persons-tab" {...props}>
      {children}
    </div>
  ),
}))

jest.mock('../components/AchievementsTab', () => ({
  AchievementsTab: ({ children, ...props }: any) => (
    <div data-testid="achievements-tab" {...props}>
      {children}
    </div>
  ),
}))

jest.mock('../components/PeriodsTab', () => ({
  PeriodsTab: ({ children, ...props }: any) => (
    <div data-testid="periods-tab" {...props}>
      {children}
    </div>
  ),
}))

jest.mock('../components/ManageModals', () => ({
  ManageModals: ({ children, ...props }: any) => (
    <div data-testid="manage-modals" {...props}>
      {children}
    </div>
  ),
}))

jest.mock('shared/ui/ContactFooter', () => ({
  ContactFooter: ({ children, ...props }: any) => (
    <div data-testid="contact-footer" {...props}>
      {children}
    </div>
  ),
}))

jest.mock('shared/ui/SEO', () => ({
  SEO: ({ children, ...props }: any) => (
    <div data-testid="seo" {...props}>
      {children}
    </div>
  ),
}))

jest.mock('shared/api/api', () => ({
  apiFetch: jest.fn(),
  apiData: {},
}))

// Mock window.location
const mockLocation = {
  origin: 'http://localhost:3000',
}
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
})

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('ManagePage', () => {
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
