import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AdaptiveTabs } from '../AdaptiveTabs';

// Mock the useMobileLayout hook
jest.mock('shared/hooks/useMobileLayout', () => ({
  useMobileLayout: jest.fn(() => ({ isMobile: false }))
}));

// Mock child components
jest.mock('../MobileTabs', () => ({
  MobileTabs: jest.fn(({ activeTab, setActiveTab }) => (
    <div data-testid="mobile-tabs">
      <button onClick={() => setActiveTab('persons')} data-testid="mobile-persons">Mobile Persons</button>
      <button onClick={() => setActiveTab('achievements')} data-testid="mobile-achievements">Mobile Achievements</button>
      <button onClick={() => setActiveTab('periods')} data-testid="mobile-periods">Mobile Periods</button>
      <div data-testid="mobile-active-tab">{activeTab}</div>
    </div>
  ))
}));

jest.mock('../DesktopTabs', () => ({
  DesktopTabs: jest.fn(({ activeTab, setActiveTab, onAddClick }) => (
    <div data-testid="desktop-tabs">
      <button onClick={() => setActiveTab('persons')} data-testid="desktop-persons">Desktop Persons</button>
      <button onClick={() => setActiveTab('achievements')} data-testid="desktop-achievements">Desktop Achievements</button>
      <button onClick={() => setActiveTab('periods')} data-testid="desktop-periods">Desktop Periods</button>
      <button onClick={onAddClick} data-testid="add-button">Add</button>
      <div data-testid="desktop-active-tab">{activeTab}</div>
    </div>
  ))
}));

const { useMobileLayout } = require('shared/hooks/useMobileLayout');

describe('AdaptiveTabs', () => {
  const mockProps = {
    activeTab: 'persons' as const,
    setActiveTab: jest.fn(),
    sidebarCollapsed: false,
    setSidebarCollapsed: jest.fn(),
    isAuthenticated: true,
    userEmailVerified: true,
    onAddClick: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders DesktopTabs when not mobile', () => {
    useMobileLayout.mockReturnValue({ isMobile: false });
    
    render(<AdaptiveTabs {...mockProps} />);
    
    expect(screen.getByTestId('desktop-tabs')).toBeInTheDocument();
    expect(screen.queryByTestId('mobile-tabs')).not.toBeInTheDocument();
  });

  it('renders MobileTabs when mobile', () => {
    useMobileLayout.mockReturnValue({ isMobile: true });
    
    render(<AdaptiveTabs {...mockProps} />);
    
    expect(screen.getByTestId('mobile-tabs')).toBeInTheDocument();
    expect(screen.queryByTestId('desktop-tabs')).not.toBeInTheDocument();
  });

  it('passes all props to DesktopTabs when not mobile', () => {
    useMobileLayout.mockReturnValue({ isMobile: false });
    
    render(<AdaptiveTabs {...mockProps} activeTab="achievements" />);
    
    expect(screen.getByTestId('desktop-active-tab')).toHaveTextContent('achievements');
  });

  it('passes all props to MobileTabs when mobile', () => {
    useMobileLayout.mockReturnValue({ isMobile: true });
    
    render(<AdaptiveTabs {...mockProps} activeTab="periods" />);
    
    expect(screen.getByTestId('mobile-active-tab')).toHaveTextContent('periods');
  });

  it('handles tab switching in desktop mode', () => {
    useMobileLayout.mockReturnValue({ isMobile: false });
    
    render(<AdaptiveTabs {...mockProps} />);
    
    const achievementsTab = screen.getByTestId('desktop-achievements');
    fireEvent.click(achievementsTab);
    
    expect(mockProps.setActiveTab).toHaveBeenCalledWith('achievements');
  });

  it('handles tab switching in mobile mode', () => {
    useMobileLayout.mockReturnValue({ isMobile: true });
    
    render(<AdaptiveTabs {...mockProps} />);
    
    const periodsTab = screen.getByTestId('mobile-periods');
    fireEvent.click(periodsTab);
    
    expect(mockProps.setActiveTab).toHaveBeenCalledWith('periods');
  });

  it('handles add button click in desktop mode', () => {
    useMobileLayout.mockReturnValue({ isMobile: false });
    
    render(<AdaptiveTabs {...mockProps} />);
    
    const addButton = screen.getByTestId('add-button');
    fireEvent.click(addButton);
    
    expect(mockProps.onAddClick).toHaveBeenCalled();
  });

  it('shows correct active tab in desktop mode', () => {
    useMobileLayout.mockReturnValue({ isMobile: false });
    
    render(<AdaptiveTabs {...mockProps} activeTab="achievements" />);
    
    expect(screen.getByTestId('desktop-active-tab')).toHaveTextContent('achievements');
  });

  it('shows correct active tab in mobile mode', () => {
    useMobileLayout.mockReturnValue({ isMobile: true });
    
    render(<AdaptiveTabs {...mockProps} activeTab="periods" />);
    
    expect(screen.getByTestId('mobile-active-tab')).toHaveTextContent('periods');
  });
});
