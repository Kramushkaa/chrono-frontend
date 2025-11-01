import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ListSelector } from '../ListSelector';

describe('ListSelector', () => {
  const mockOnChange = vi.fn();
  
  const defaultProps = {
    isAuthenticated: false,
    personLists: [],
    selectedListId: null,
    selectedListKey: '',
    sharedListMeta: null,
    onChange: mockOnChange,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render without crashing', () => {
    render(<ListSelector {...defaultProps} />);
    
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByText('Все')).toBeInTheDocument();
  });

  it('should render person lists for authenticated user', () => {
    const personLists = [
      { id: 1, title: 'My List 1' },
      { id: 2, title: 'My List 2' },
    ];
    
    render(
      <ListSelector 
        {...defaultProps} 
        isAuthenticated={true}
        personLists={personLists}
      />
    );
    
    expect(screen.getByText('My List 1')).toBeInTheDocument();
    expect(screen.getByText('My List 2')).toBeInTheDocument();
  });

  it('should not render person lists for unauthenticated user', () => {
    const personLists = [
      { id: 1, title: 'My List 1' },
      { id: 2, title: 'My List 2' },
    ];
    
    render(
      <ListSelector 
        {...defaultProps} 
        isAuthenticated={false}
        personLists={personLists}
      />
    );
    
    expect(screen.queryByText('My List 1')).not.toBeInTheDocument();
    expect(screen.queryByText('My List 2')).not.toBeInTheDocument();
  });

  it('should render shared list option when sharedListMeta is provided', () => {
    const sharedListMeta = {
      code: 'shared123',
      title: 'Shared List',
      listId: 5,
    };
    
    render(
      <ListSelector 
        {...defaultProps} 
        sharedListMeta={sharedListMeta}
      />
    );
    
    expect(screen.getByText('🔒 Shared List')).toBeInTheDocument();
  });

  it('should set correct value when selectedListId is provided', () => {
    const personLists = [{ id: 3, title: 'List 3' }];
    render(
      <ListSelector 
        {...defaultProps} 
        selectedListId={3}
        isAuthenticated={true}
        personLists={personLists}
      />
    );
    
    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('list:3');
  });

  it('should set correct value when selectedListKey is provided', () => {
    const personLists = [{ id: 5, title: 'List 5' }];
    render(
      <ListSelector 
        {...defaultProps} 
        selectedListKey="list:5"
        isAuthenticated={true}
        personLists={personLists}
      />
    );
    
    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('list:5');
  });

  it('should prioritize selectedListKey over selectedListId', () => {
    const personLists = [{ id: 7, title: 'List 7' }];
    render(
      <ListSelector 
        {...defaultProps} 
        selectedListId={3}
        selectedListKey="list:7"
        isAuthenticated={true}
        personLists={personLists}
      />
    );
    
    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('list:7');
  });

  it('should call onChange when selection changes', () => {
    const personLists = [
      { id: 1, title: 'My List 1' },
    ];
    
    render(
      <ListSelector 
        {...defaultProps} 
        isAuthenticated={true}
        personLists={personLists}
      />
    );
    
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'list:1' } });
    
    expect(mockOnChange).toHaveBeenCalledWith('list:1');
  });

  it('should handle shared list selection', () => {
    const sharedListMeta = {
      code: 'shared123',
      title: 'Shared List',
    };
    
    render(
      <ListSelector 
        {...defaultProps} 
        sharedListMeta={sharedListMeta}
      />
    );
    
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'share:shared123' } });
    
    expect(mockOnChange).toHaveBeenCalledWith('share:shared123');
  });

  it('should handle "Все" option selection', () => {
    render(<ListSelector {...defaultProps} />);
    
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '' } });
    
    expect(mockOnChange).toHaveBeenCalledWith('');
  });

  it('should apply correct styling', () => {
    render(<ListSelector {...defaultProps} />);
    
    const select = screen.getByRole('combobox');
    expect(select).toHaveStyle('padding: 4px 8px');
    expect(select).toHaveStyle('min-width: 160px');
  });

  it('should render both shared list and person lists when authenticated', () => {
    const sharedListMeta = {
      code: 'shared123',
      title: 'Shared List',
    };
    const personLists = [
      { id: 1, title: 'My List 1' },
    ];
    
    render(
      <ListSelector 
        {...defaultProps} 
        isAuthenticated={true}
        sharedListMeta={sharedListMeta}
        personLists={personLists}
      />
    );
    
    expect(screen.getByText('🔒 Shared List')).toBeInTheDocument();
    expect(screen.getByText('My List 1')).toBeInTheDocument();
  });
});




