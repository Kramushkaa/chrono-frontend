import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { DesktopTabs } from '../DesktopTabs'

describe('DesktopTabs', () => {
  const defaultProps = {
    activeTab: 'persons' as const,
    setActiveTab: vi.fn(),
    sidebarCollapsed: false,
    setSidebarCollapsed: vi.fn(),
    isAuthenticated: true,
    userEmailVerified: true,
    onAddClick: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render all tab buttons', () => {
    render(<DesktopTabs {...defaultProps} />)
    
    expect(screen.getByRole('tab', { name: 'Личности' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Достижения' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Периоды' })).toBeInTheDocument()
  })

  it('should show active tab correctly', () => {
    render(<DesktopTabs {...defaultProps} />)
    
    const personsTab = screen.getByRole('tab', { name: 'Личности' })
    expect(personsTab).toHaveAttribute('aria-selected', 'true')
    expect(personsTab).toHaveClass('manage-page__tab--active')
  })

  it('should call setActiveTab when tab is clicked', () => {
    render(<DesktopTabs {...defaultProps} />)
    
    const achievementsTab = screen.getByRole('tab', { name: 'Достижения' })
    fireEvent.click(achievementsTab)
    
    expect(defaultProps.setActiveTab).toHaveBeenCalledWith('achievements')
  })

  it('should render collapse button', () => {
    render(<DesktopTabs {...defaultProps} />)
    
    const collapseButton = screen.getByRole('button', { 
      name: /показать меню|скрыть меню/i 
    })
    expect(collapseButton).toBeInTheDocument()
  })

  it('should handle collapse button click', () => {
    render(<DesktopTabs {...defaultProps} />)
    
    const collapseButton = screen.getByRole('button', { 
      name: /показать меню|скрыть меню/i 
    })
    fireEvent.click(collapseButton)
    
    expect(defaultProps.setSidebarCollapsed).toHaveBeenCalledWith(true)
  })

  it('should show correct collapse button state', () => {
    const { rerender } = render(
      <DesktopTabs {...defaultProps} sidebarCollapsed={false} />
    )
    
    expect(screen.getByRole('button', { name: 'Скрыть меню' })).toBeInTheDocument()
    
    rerender(<DesktopTabs {...defaultProps} sidebarCollapsed={true} />)
    
    expect(screen.getByRole('button', { name: 'Показать меню' })).toBeInTheDocument()
  })

  it('should render add button', () => {
    render(<DesktopTabs {...defaultProps} />)
    
    const addButton = screen.getByRole('button', { name: 'Добавить' })
    expect(addButton).toBeInTheDocument()
  })

  it('should handle add button click', () => {
    render(<DesktopTabs {...defaultProps} />)
    
    const addButton = screen.getByRole('button', { name: 'Добавить' })
    fireEvent.click(addButton)
    
    expect(defaultProps.onAddClick).toHaveBeenCalled()
  })

  it('should disable add button when not authenticated', () => {
    render(
      <DesktopTabs 
        {...defaultProps} 
        isAuthenticated={false}
        userEmailVerified={true}
      />
    )
    
    const addButton = screen.getByRole('button', { name: 'Добавить' })
    expect(addButton).toBeDisabled()
    expect(addButton).toHaveAttribute('title', 'Требуется вход')
  })

  it('should disable add button when email not verified', () => {
    render(
      <DesktopTabs 
        {...defaultProps} 
        isAuthenticated={true}
        userEmailVerified={false}
      />
    )
    
    const addButton = screen.getByRole('button', { name: 'Добавить' })
    expect(addButton).toBeDisabled()
    expect(addButton).toHaveAttribute('title', 'Подтвердите email')
  })

  it('should enable add button when authenticated and email verified', () => {
    render(
      <DesktopTabs 
        {...defaultProps} 
        isAuthenticated={true}
        userEmailVerified={true}
      />
    )
    
    const addButton = screen.getByRole('button', { name: 'Добавить' })
    expect(addButton).not.toBeDisabled()
    expect(addButton).toHaveAttribute('title', 'Добавить')
  })

  it('should have proper accessibility attributes', () => {
    render(<DesktopTabs {...defaultProps} />)
    
    const tablist = screen.getByRole('tablist')
    expect(tablist).toHaveAttribute('aria-label', 'Вкладки управления')
    
    const personsTab = screen.getByRole('tab', { name: 'Личности' })
    expect(personsTab).toHaveAttribute('id', 'manage-tab-persons')
    
    const collapseButton = screen.getByRole('button', { 
      name: /показать меню|скрыть меню/i 
    })
    expect(collapseButton).toHaveAttribute('aria-pressed', 'false')
  })

  it('should handle different active tabs', () => {
    const { rerender } = render(
      <DesktopTabs {...defaultProps} activeTab="achievements" />
    )
    
    const achievementsTab = screen.getByRole('tab', { name: 'Достижения' })
    expect(achievementsTab).toHaveAttribute('aria-selected', 'true')
    
    rerender(<DesktopTabs {...defaultProps} activeTab="periods" />)
    
    const periodsTab = screen.getByRole('tab', { name: 'Периоды' })
    expect(periodsTab).toHaveAttribute('aria-selected', 'true')
  })
})




