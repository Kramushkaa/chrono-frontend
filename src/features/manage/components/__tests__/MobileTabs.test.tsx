import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { MobileTabs } from '../MobileTabs'

describe('MobileTabs', () => {
  const defaultProps = {
    activeTab: 'persons' as const,
    setActiveTab: jest.fn(),
    isAuthenticated: true,
    userEmailVerified: true,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render all tab buttons', () => {
    render(<MobileTabs {...defaultProps} />)
    
    expect(screen.getByRole('button', { name: 'Личности' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Достижения' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Периоды' })).toBeInTheDocument()
  })

  it('should show active tab correctly', () => {
    render(<MobileTabs {...defaultProps} />)
    
    const personsTab = screen.getByRole('button', { name: 'Личности' })
    expect(personsTab).toHaveClass('mobile-tabs__tab--active')
  })

  it('should call setActiveTab when tab is clicked', () => {
    render(<MobileTabs {...defaultProps} />)
    
    const achievementsTab = screen.getByRole('button', { name: 'Достижения' })
    fireEvent.click(achievementsTab)
    
    expect(defaultProps.setActiveTab).toHaveBeenCalledWith('achievements')
  })

  it('should handle different active tabs', () => {
    const { rerender } = render(
      <MobileTabs {...defaultProps} activeTab="achievements" />
    )
    
    const achievementsTab = screen.getByRole('button', { name: 'Достижения' })
    expect(achievementsTab).toHaveClass('mobile-tabs__tab--active')
    
    // Other tabs should not be active
    const personsTab = screen.getByRole('button', { name: 'Личности' })
    expect(personsTab).not.toHaveClass('mobile-tabs__tab--active')
    
    rerender(<MobileTabs {...defaultProps} activeTab="periods" />)
    
    const periodsTab = screen.getByRole('button', { name: 'Периоды' })
    expect(periodsTab).toHaveClass('mobile-tabs__tab--active')
  })

  it('should handle all tab clicks', () => {
    render(<MobileTabs {...defaultProps} />)
    
    const personsTab = screen.getByRole('button', { name: 'Личности' })
    const achievementsTab = screen.getByRole('button', { name: 'Достижения' })
    const periodsTab = screen.getByRole('button', { name: 'Периоды' })
    
    fireEvent.click(personsTab)
    expect(defaultProps.setActiveTab).toHaveBeenCalledWith('persons')
    
    fireEvent.click(achievementsTab)
    expect(defaultProps.setActiveTab).toHaveBeenCalledWith('achievements')
    
    fireEvent.click(periodsTab)
    expect(defaultProps.setActiveTab).toHaveBeenCalledWith('periods')
  })

  it('should render container with correct class', () => {
    render(<MobileTabs {...defaultProps} />)
    
    const container = screen.getByText('Личности').closest('.mobile-tabs__container')
    expect(container).toBeInTheDocument()
  })

  it('should render main wrapper with correct class', () => {
    render(<MobileTabs {...defaultProps} />)
    
    const wrapper = screen.getByText('Личности').closest('.mobile-tabs')
    expect(wrapper).toBeInTheDocument()
  })

  it('should handle authentication props (they are passed but not used in rendering)', () => {
    render(
      <MobileTabs 
        {...defaultProps} 
        isAuthenticated={false}
        userEmailVerified={false}
      />
    )
    
    // Component should still render regardless of auth state
    expect(screen.getByRole('button', { name: 'Личности' })).toBeInTheDocument()
  })
})
