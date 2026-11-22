import React from 'react'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { Breadcrumbs } from '../Breadcrumbs'

// Mock useLocation
const mockLocation = {
  pathname: '/timeline',
  search: '',
  hash: '',
  state: null
}

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return {
    ...actual,
    useLocation: () => mockLocation
  };
})

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
)

describe('Breadcrumbs', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render breadcrumbs for timeline page', () => {
    mockLocation.pathname = '/timeline'
    
    render(
      <TestWrapper>
        <Breadcrumbs />
      </TestWrapper>
    )
    
    expect(screen.getByText('Главная')).toBeInTheDocument()
    expect(screen.getByText('Таймлайн')).toBeInTheDocument()
    expect(screen.getByRole('navigation')).toHaveAttribute('aria-label', 'Хлебные крошки')
  })

  it('should not render breadcrumbs on home page', () => {
    mockLocation.pathname = '/'
    
    const { container } = render(
      <TestWrapper>
        <Breadcrumbs />
      </TestWrapper>
    )
    
    expect(container.firstChild).toBeNull()
  })

  it('should render breadcrumbs for menu page', () => {
    mockLocation.pathname = '/menu'
    
    render(
      <TestWrapper>
        <Breadcrumbs />
      </TestWrapper>
    )
    
    expect(screen.getByText('Главная')).toBeInTheDocument()
    expect(screen.getByText('Меню')).toBeInTheDocument()
  })

  it('should render breadcrumbs for register page', () => {
    mockLocation.pathname = '/register'
    
    render(
      <TestWrapper>
        <Breadcrumbs />
      </TestWrapper>
    )
    
    expect(screen.getByText('Главная')).toBeInTheDocument()
    expect(screen.getByText('Регистрация')).toBeInTheDocument()
  })

  it('should render breadcrumbs for profile page', () => {
    mockLocation.pathname = '/profile'
    
    render(
      <TestWrapper>
        <Breadcrumbs />
      </TestWrapper>
    )
    
    expect(screen.getByText('Главная')).toBeInTheDocument()
    expect(screen.getByText('Профиль')).toBeInTheDocument()
  })

  it('should render breadcrumbs for lists page', () => {
    mockLocation.pathname = '/lists'
    
    render(
      <TestWrapper>
        <Breadcrumbs />
      </TestWrapper>
    )
    
    expect(screen.getByText('Главная')).toBeInTheDocument()
    expect(screen.getByText('Списки')).toBeInTheDocument()
  })

  it('should handle unknown segments with capitalization', () => {
    mockLocation.pathname = '/some-unknown-page'
    
    render(
      <TestWrapper>
        <Breadcrumbs />
      </TestWrapper>
    )
    
    expect(screen.getByText('Главная')).toBeInTheDocument()
    expect(screen.getByText('Some-unknown-page')).toBeInTheDocument()
  })

  it('should have proper accessibility attributes', () => {
    mockLocation.pathname = '/timeline'
    
    render(
      <TestWrapper>
        <Breadcrumbs />
      </TestWrapper>
    )
    
    const nav = screen.getByRole('navigation')
    expect(nav).toHaveAttribute('aria-label', 'Хлебные крошки')
    
    const currentPage = screen.getByText('Таймлайн').closest('span')
    expect(currentPage).toHaveAttribute('aria-current', 'page')
  })
})




