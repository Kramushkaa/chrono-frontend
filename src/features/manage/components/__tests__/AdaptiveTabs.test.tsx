import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AdaptiveTabs } from '../AdaptiveTabs';

// Mock the useMobileLayout hook
vi.mock('shared/hooks/useMobileLayout', () => ({
  useMobileLayout: vi.fn(() => ({ isMobile: false }))
}));

// Mock child components
vi.mock('../MobileTabs', () => ({
  MobileTabs: vi.fn(({ activeTab, setActiveTab }) => (
    <div data-testid="mobile-tabs">
      <button onClick={() => setActiveTab('persons')} data-testid="mobile-persons">Mobile Persons</button>
      <button onClick={() => setActiveTab('achievements')} data-testid="mobile-achievements">Mobile Achievements</button>
      <button onClick={() => setActiveTab('periods')} data-testid="mobile-periods">Mobile Periods</button>
      <div data-testid="mobile-active-tab">{activeTab}</div>
    </div>
  ))
}));

vi.mock('../DesktopTabs', () => ({
  DesktopTabs: vi.fn(({ activeTab, setActiveTab, onAddClick }) => (
    <div data-testid="desktop-tabs">
      <button onClick={() => setActiveTab('persons')} data-testid="desktop-persons">Desktop Persons</button>
      <button onClick={() => setActiveTab('achievements')} data-testid="desktop-achievements">Desktop Achievements</button>
      <button onClick={() => setActiveTab('periods')} data-testid="desktop-periods">Desktop Periods</button>
      <button onClick={onAddClick} data-testid="add-button">Add</button>
      <div data-testid="desktop-active-tab">{activeTab}</div>
    </div>
  ))
}));

import { useMobileLayout } from 'shared/hooks/useMobileLayout'

describe('AdaptiveTabs', () => {
  const mockUseMobileLayout = vi.mocked(useMobileLayout)
  
  const mockProps = {
    activeTab: 'persons' as const,
    setActiveTab: vi.fn(),
    sidebarCollapsed: false,
    setSidebarCollapsed: vi.fn(),
    isAuthenticated: true,
    userEmailVerified: true,
    onAddClick: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders DesktopTabs when not mobile', () => {
    mockUseMobileLayout.mockReturnValue({ isMobile: false });
    
    render(<AdaptiveTabs {...mockProps} />);
    
    expect(screen.getByTestId('desktop-tabs')).toBeInTheDocument();
    expect(screen.queryByTestId('mobile-tabs')).not.toBeInTheDocument();
  });

  it('renders MobileTabs when mobile', () => {
    mockUseMobileLayout.mockReturnValue({ isMobile: true });
    
    render(<AdaptiveTabs {...mockProps} />);
    
    expect(screen.getByTestId('mobile-tabs')).toBeInTheDocument();
    expect(screen.queryByTestId('desktop-tabs')).not.toBeInTheDocument();
  });

  it('passes all props to DesktopTabs when not mobile', () => {
    mockUseMobileLayout.mockReturnValue({ isMobile: false });
    
    render(<AdaptiveTabs {...mockProps} activeTab="achievements" />);
    
    expect(screen.getByTestId('desktop-active-tab')).toHaveTextContent('achievements');
  });

  it('passes all props to MobileTabs when mobile', () => {
    mockUseMobileLayout.mockReturnValue({ isMobile: true });
    
    render(<AdaptiveTabs {...mockProps} activeTab="periods" />);
    
    expect(screen.getByTestId('mobile-active-tab')).toHaveTextContent('periods');
  });

  it('handles tab switching in desktop mode', () => {
    mockUseMobileLayout.mockReturnValue({ isMobile: false });
    
    render(<AdaptiveTabs {...mockProps} />);
    
    const achievementsTab = screen.getByTestId('desktop-achievements');
    fireEvent.click(achievementsTab);
    
    expect(mockProps.setActiveTab).toHaveBeenCalledWith('achievements');
  });

  it('handles tab switching in mobile mode', () => {
    mockUseMobileLayout.mockReturnValue({ isMobile: true });
    
    render(<AdaptiveTabs {...mockProps} />);
    
    const periodsTab = screen.getByTestId('mobile-periods');
    fireEvent.click(periodsTab);
    
    expect(mockProps.setActiveTab).toHaveBeenCalledWith('periods');
  });

  it('handles add button click in desktop mode', () => {
    mockUseMobileLayout.mockReturnValue({ isMobile: false });
    
    render(<AdaptiveTabs {...mockProps} />);
    
    const addButton = screen.getByTestId('add-button');
    fireEvent.click(addButton);
    
    expect(mockProps.onAddClick).toHaveBeenCalled();
  });

  it('shows correct active tab in desktop mode', () => {
    mockUseMobileLayout.mockReturnValue({ isMobile: false });
    
    render(<AdaptiveTabs {...mockProps} activeTab="achievements" />);
    
    expect(screen.getByTestId('desktop-active-tab')).toHaveTextContent('achievements');
  });

  it('shows correct active tab in mobile mode', () => {
    mockUseMobileLayout.mockReturnValue({ isMobile: true });
    
    render(<AdaptiveTabs {...mockProps} activeTab="periods" />);
    
    expect(screen.getByTestId('mobile-active-tab')).toHaveTextContent('periods');
  });
});





