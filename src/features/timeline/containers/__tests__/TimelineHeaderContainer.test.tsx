import React from 'react';
import { render, screen } from '@testing-library/react';
import { TimelineHeaderContainer } from '../TimelineHeaderContainer';

// Mock AppHeader component
vi.mock('shared/layout/AppHeader', () => ({
  AppHeader: vi.fn(({ extraFilterControls, isScrolled, showControls }) => (
    <div data-testid="app-header">
      <div data-testid="header-scrolled">{isScrolled ? 'scrolled' : 'not-scrolled'}</div>
      <div data-testid="header-controls-visible">{showControls ? 'controls-visible' : 'controls-hidden'}</div>
      {extraFilterControls}
    </div>
  )),
}));

// Mock ListSelector component
vi.mock('features/timeline/components/ListSelector', () => ({
  ListSelector: vi.fn(({ isAuthenticated, personLists, selectedListKey }) => (
    <div data-testid="list-selector">
      <div data-testid="list-selector-auth">{isAuthenticated ? 'authenticated' : 'not-authenticated'}</div>
      <div data-testid="list-selector-count">{personLists.length} lists</div>
      <div data-testid="list-selector-selected">{selectedListKey}</div>
    </div>
  )),
}));

describe('TimelineHeaderContainer', () => {
  const mockProps = {
    isScrolled: false,
    showControls: true,
    setShowControls: vi.fn(),
    filters: {
      showAchievements: true,
      hideEmptyCenturies: false,
      categories: [],
      countries: [],
      timeRange: { start: -800, end: 2000 },
    },
    setFilters: vi.fn(),
    groupingType: 'category' as const,
    setGroupingType: vi.fn(),
    allCategories: ['Politics', 'Science'],
    allCountries: ['Russia', 'USA'],
    yearInputs: { start: '1800', end: '2000' },
    setYearInputs: vi.fn(),
    applyYearFilter: vi.fn(),
    handleYearKeyPress: vi.fn(),
    resetAllFilters: vi.fn(),
    getCategoryColor: vi.fn(() => '#ff0000'),
    sortedData: [],
    handleSliderMouseDown: vi.fn(),
    handleSliderMouseMove: vi.fn(),
    handleSliderMouseUp: vi.fn(),
    isDraggingSlider: false,
    onBackToMenu: vi.fn(),
    isAuthenticated: true,
    personLists: [
      { id: 1, title: 'List 1' },
      { id: 2, title: 'List 2' },
    ],
    selectedListId: 1,
    selectedListKey: 'list:1',
    sharedListMeta: null,
    onListChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<TimelineHeaderContainer {...mockProps} />);
    
    expect(screen.getByTestId('app-header')).toBeInTheDocument();
    expect(screen.getByTestId('list-selector')).toBeInTheDocument();
  });

  it('passes correct props to AppHeader', () => {
    render(<TimelineHeaderContainer {...mockProps} />);
    
    expect(screen.getByTestId('header-scrolled')).toHaveTextContent('not-scrolled');
    expect(screen.getByTestId('header-controls-visible')).toHaveTextContent('controls-visible');
  });

  it('reflects scrolled state', () => {
    render(<TimelineHeaderContainer {...mockProps} isScrolled={true} />);
    
    expect(screen.getByTestId('header-scrolled')).toHaveTextContent('scrolled');
  });

  it('reflects controls visibility state', () => {
    render(<TimelineHeaderContainer {...mockProps} showControls={false} />);
    
    expect(screen.getByTestId('header-controls-visible')).toHaveTextContent('controls-hidden');
  });

  it('passes correct props to ListSelector', () => {
    render(<TimelineHeaderContainer {...mockProps} />);
    
    expect(screen.getByTestId('list-selector-auth')).toHaveTextContent('authenticated');
    expect(screen.getByTestId('list-selector-count')).toHaveTextContent('2 lists');
    expect(screen.getByTestId('list-selector-selected')).toHaveTextContent('list:1');
  });

  it('handles unauthenticated state', () => {
    render(<TimelineHeaderContainer {...mockProps} isAuthenticated={false} />);
    
    expect(screen.getByTestId('list-selector-auth')).toHaveTextContent('not-authenticated');
  });

  it('handles empty person lists', () => {
    render(<TimelineHeaderContainer {...mockProps} personLists={[]} />);
    
    expect(screen.getByTestId('list-selector-count')).toHaveTextContent('0 lists');
  });

  it('handles shared list meta', () => {
    const sharedListMeta = { code: 'ABC123', title: 'Shared List' };
    render(<TimelineHeaderContainer {...mockProps} sharedListMeta={sharedListMeta} />);
    
    // The ListSelector should receive the shared list metadata
    expect(screen.getByTestId('list-selector')).toBeInTheDocument();
  });
});




