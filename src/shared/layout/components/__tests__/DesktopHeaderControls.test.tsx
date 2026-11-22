import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DesktopHeaderControls } from '../DesktopHeaderControls';

// Mock all child components
vi.mock('features/timeline/components/AchievementMarker', () => ({
  AchievementMarker: vi.fn(() => <div data-testid="achievement-marker">Achievement Marker</div>),
}));

vi.mock('shared/ui/FilterDropdown', () => ({
  FilterDropdown: vi.fn(({ title, selectedItems, onSelectionChange }) => (
    <div data-testid={`filter-${title.toLowerCase()}`}>
      <span>{title}</span>
      <button onClick={() => onSelectionChange(['test'])} data-testid={`filter-${title.toLowerCase()}-button`}>
        Select {title}
      </button>
    </div>
  )),
}));

vi.mock('shared/ui/GroupingToggle', () => ({
  GroupingToggle: vi.fn(({ value, onChange, options }) => (
    <div data-testid="grouping-toggle">
      {options?.map((option: any) => (
        <button 
          key={option.value} 
          onClick={() => onChange(option.value)}
          data-testid={`grouping-${option.value}`}
        >
          {option.label}
        </button>
      )) || null}
    </div>
  )),
}));

vi.mock('features/timeline/components/YearRangeSlider', () => ({
  YearRangeSlider: vi.fn(() => <div data-testid="year-range-slider">Year Range Slider</div>),
}));

vi.mock('shared/ui/ToggleButton', () => ({
  ToggleButton: vi.fn(({ checked, onChange, onClick, label, children }) => (
    <button 
      onClick={onClick || (() => onChange?.(!checked))} 
      data-testid={label ? `toggle-${label.toLowerCase().replace(/\s+/g, '-')}` : 'toggle-button'}
    >
      {children || label || 'Toggle'}
    </button>
  )),
}));

describe('DesktopHeaderControls', () => {
  const mockProps = {
    filters: {
      showAchievements: true,
      hideEmptyCenturies: false,
      categories: [],
      countries: [],
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
    handleSliderMouseDown: vi.fn(),
    handleSliderMouseMove: vi.fn(),
    handleSliderMouseUp: vi.fn(),
    isDraggingSlider: false,
    handleHideEmptyCenturiesToggle: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<DesktopHeaderControls {...mockProps} />);
    
    expect(screen.getByTestId('achievement-marker')).toBeInTheDocument();
    expect(screen.getByTestId('year-range-slider')).toBeInTheDocument();
  });

  it('renders filter dropdowns for categories and countries', () => {
    render(<DesktopHeaderControls {...mockProps} />);
    
    // FilterDropdown использует emoji в title, не текст
    expect(screen.getByTestId('filter-🎭')).toBeInTheDocument();
    expect(screen.getByTestId('filter-🌍')).toBeInTheDocument();
  });

  it('renders grouping toggle', () => {
    render(<DesktopHeaderControls {...mockProps} />);
    
    expect(screen.getByTestId('grouping-toggle')).toBeInTheDocument();
  });

  it('handles category filter change', () => {
    render(<DesktopHeaderControls {...mockProps} />);
    
    const categoryButton = screen.getByTestId('filter-🎭-button');
    fireEvent.click(categoryButton);
    
    expect(mockProps.setFilters).toHaveBeenCalled();
  });

  it('handles country filter change', () => {
    render(<DesktopHeaderControls {...mockProps} />);
    
    const countryButton = screen.getByTestId('filter-🌍-button');
    fireEvent.click(countryButton);
    
    expect(mockProps.setFilters).toHaveBeenCalled();
  });

  it('renders toggle buttons', () => {
    render(<DesktopHeaderControls {...mockProps} />);
    
    // ToggleButton не получает label, проверяем что рендерятся children
    expect(screen.getByTestId('achievement-marker')).toBeInTheDocument();
    // Проверяем что есть несколько toggle buttons
    expect(screen.getAllByTestId('toggle-button').length).toBeGreaterThan(0);
  });

  it('handles toggle button clicks', () => {
    render(<DesktopHeaderControls {...mockProps} />);
    
    // Получаем все toggle buttons и кликаем первый (achievements)
    const toggleButtons = screen.getAllByTestId('toggle-button');
    fireEvent.click(toggleButtons[0]);
    
    expect(mockProps.setFilters).toHaveBeenCalled();
  });

  it('renders extra filter controls when provided', () => {
    const extraControls = <div data-testid="extra-controls">Extra Controls</div>;
    
    render(<DesktopHeaderControls {...mockProps} extraFilterControls={extraControls} />);
    
    expect(screen.getByTestId('extra-controls')).toBeInTheDocument();
  });
});




