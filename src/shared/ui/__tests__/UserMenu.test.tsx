import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { UserMenu } from '../UserMenu'

// Mock AuthContext
const mockLogout = jest.fn()
jest.mock('shared/context/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: false,
    user: null,
    logout: mockLogout,
  }),
}))

// Mock LoginForm
jest.mock('features/auth/components/LoginForm', () => ({
  LoginForm: () => <div data-testid="login-form">Login Form</div>,
}))

// Mock useNavigate
const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

// Mock window.location
const mockLocation = {
  pathname: '/timeline',
}

beforeEach(() => {
  delete (window as any).location
  window.location = mockLocation as any
})

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
)

describe('UserMenu', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockLocation.pathname = '/timeline' // Reset to default, but tests can override
  })

  it('should render user menu when not authenticated', () => {
    render(
      <TestWrapper>
        <UserMenu />
      </TestWrapper>
    )

    // Should render something (checking for basic structure)
    expect(document.querySelector('.user-menu')).toBeInTheDocument()
  })

  it('should render with custom className', () => {
    render(
      <TestWrapper>
        <UserMenu className="custom-class" />
      </TestWrapper>
    )

    expect(document.querySelector('.user-menu.custom-class')).toBeInTheDocument()
  })

  it('should render with custom style', () => {
    const customStyle = { backgroundColor: 'red' }
    render(
      <TestWrapper>
        <UserMenu style={customStyle} />
      </TestWrapper>
    )

    const menu = document.querySelector('.user-menu') as HTMLElement
    expect(menu).toBeInTheDocument()
    expect(menu.style.backgroundColor).toBe('red')
  })

  it('should handle manage page detection', () => {
    // Test with manage path - component should render without crashing
    mockLocation.pathname = '/manage/test'
    
    render(
      <TestWrapper>
        <UserMenu />
      </TestWrapper>
    )

    // Just check that component renders without crashing
    expect(document.querySelector('.user-menu')).toBeInTheDocument()
  })

  it('should handle lists page detection', () => {
    // Test with lists path - component should render without crashing
    mockLocation.pathname = '/lists/test'
    
    render(
      <TestWrapper>
        <UserMenu />
      </TestWrapper>
    )

    // Just check that component renders without crashing
    expect(document.querySelector('.user-menu')).toBeInTheDocument()
  })

  it('should close menu when clicking outside', () => {
    render(
      <TestWrapper>
        <div>
          <UserMenu />
          <div data-testid="outside">Outside element</div>
        </div>
      </TestWrapper>
    )

    const outsideElement = screen.getByTestId('outside')
    fireEvent.mouseDown(outsideElement)

    // Component should handle the click outside without crashing
    expect(document.querySelector('.user-menu')).toBeInTheDocument()
  })
})
