import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { MinimalHeader } from '../MinimalHeader'

// Mock useNavigate
const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

// Mock BrandTitle
jest.mock('shared/ui/BrandTitle', () => ({
  BrandTitle: () => <div data-testid="brand-title">Brand Title</div>,
}))

// Mock UserMenu
jest.mock('shared/ui/UserMenu', () => ({
  UserMenu: () => <div data-testid="user-menu">User Menu</div>,
}))

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
)

describe('MinimalHeader', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render minimal header', () => {
    render(
      <TestWrapper>
        <MinimalHeader />
      </TestWrapper>
    )

    expect(screen.getByText('← Меню')).toBeInTheDocument()
    expect(screen.getByTestId('brand-title')).toBeInTheDocument()
    expect(screen.getByTestId('user-menu')).toBeInTheDocument()
  })

  it('should render with title', () => {
    render(
      <TestWrapper>
        <MinimalHeader title="Test Title" />
      </TestWrapper>
    )

    expect(screen.getByText('Test Title')).toBeInTheDocument()
  })

  it('should handle back to menu button click', () => {
    render(
      <TestWrapper>
        <MinimalHeader />
      </TestWrapper>
    )

    const menuButton = screen.getByText('← Меню')
    fireEvent.click(menuButton)

    expect(mockNavigate).toHaveBeenCalledWith('/menu')
  })

  it('should call onBackToMenu when provided', () => {
    const mockOnBackToMenu = jest.fn()
    render(
      <TestWrapper>
        <MinimalHeader onBackToMenu={mockOnBackToMenu} />
      </TestWrapper>
    )

    const menuButton = screen.getByText('← Меню')
    fireEvent.click(menuButton)

    expect(mockOnBackToMenu).toHaveBeenCalledTimes(1)
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('should render extra left button', () => {
    const extraLeftButton = {
      label: 'Extra Button',
      onClick: jest.fn(),
    }

    render(
      <TestWrapper>
        <MinimalHeader extraLeftButton={extraLeftButton} />
      </TestWrapper>
    )

    const button = screen.getByText('Extra Button')
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('title', 'Extra Button')

    fireEvent.click(button)
    expect(extraLeftButton.onClick).toHaveBeenCalledTimes(1)
  })

  it('should render extra right controls', () => {
    const extraRightControls = <div data-testid="extra-controls">Extra Controls</div>

    render(
      <TestWrapper>
        <MinimalHeader extraRightControls={extraRightControls} />
      </TestWrapper>
    )

    expect(screen.getByTestId('extra-controls')).toBeInTheDocument()
  })

  it('should have proper header structure', () => {
    render(
      <TestWrapper>
        <MinimalHeader title="Test Title" />
      </TestWrapper>
    )

    const header = screen.getByRole('banner')
    expect(header).toHaveClass('app-header', 'app-header--minimal')
    
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toBeInTheDocument()
  })

  it('should have proper button attributes', () => {
    render(
      <TestWrapper>
        <MinimalHeader />
      </TestWrapper>
    )

    const menuButton = screen.getByText('← Меню')
    expect(menuButton).toHaveAttribute('title', 'Вернуться в меню')
    expect(menuButton).toHaveClass('app-header__back-button')
  })
})
