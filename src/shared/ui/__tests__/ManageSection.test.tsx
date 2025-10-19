import React from 'react'
import { render } from '@testing-library/react'
import { ManageSection } from '../ManageSection'

// Mock AdaptiveListsLayout
jest.mock('features/manage/components/AdaptiveListsLayout', () => ({
  AdaptiveListsLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="adaptive-lists-layout">{children}</div>
  ),
}))

describe('ManageSection', () => {
  const defaultProps = {
    sidebarCollapsed: false,
    menuSelection: 'persons' as const,
    setMenuSelection: jest.fn(),
    isAuthenticated: true,
    isModerator: false,
    personLists: [],
    selectedListId: null,
    setSelectedListId: jest.fn(),
    loadUserLists: jest.fn(),
    setShowAuthModal: jest.fn(),
    setShowCreateList: jest.fn(),
    showToast: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
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
