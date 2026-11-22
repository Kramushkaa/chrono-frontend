import React from 'react'
import { render } from '@testing-library/react'
import { ManageSection } from '../ManageSection'

// Mock AdaptiveListsLayout
vi.mock('features/manage/components/AdaptiveListsLayout', () => ({
  AdaptiveListsLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="adaptive-lists-layout">{children}</div>
  ),
}))

describe('ManageSection', () => {
  const defaultProps = {
    sidebarCollapsed: false,
    menuSelection: 'persons' as const,
    setMenuSelection: vi.fn(),
    isAuthenticated: true,
    isModerator: false,
    personLists: [],
    selectedListId: null,
    setSelectedListId: vi.fn(),
    loadUserLists: vi.fn(),
    setShowAuthModal: vi.fn(),
    setShowCreateList: vi.fn(),
    showToast: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render without crashing', () => {
    render(
      <ManageSection {...defaultProps}>
        <div>Test content</div>
      </ManageSection>
    )
    
    // Component should render without throwing errors
    expect(true).toBe(true)
  })
})




