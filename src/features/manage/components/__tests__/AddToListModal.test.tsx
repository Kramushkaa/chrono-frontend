import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AddToListModal } from '../AddToListModal';

describe('AddToListModal', () => {
  const mockLists = [
    { id: 1, title: 'Test List 1', items_count: 5 },
    { id: 2, title: 'Test List 2', items_count: 3 },
  ];

  const mockProps = {
    isOpen: true,
    onClose: vi.fn(),
    lists: mockLists,
    onAdd: vi.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when isOpen is false', () => {
    render(<AddToListModal {...mockProps} isOpen={false} />);
    
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should render modal when isOpen is true', () => {
    render(<AddToListModal {...mockProps} />);
    
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Добавить в список')).toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    render(<AddToListModal {...mockProps} />);
    
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('should display list options', () => {
    render(<AddToListModal {...mockProps} />);
    
    expect(screen.getByText(/Test List 1/)).toBeInTheDocument();
    expect(screen.getByText(/Test List 2/)).toBeInTheDocument();
  });

  it('should close modal when close button is clicked', () => {
    render(<AddToListModal {...mockProps} />);
    
    const closeButton = screen.getByText('✕');
    fireEvent.click(closeButton);
    
    expect(mockProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('should close modal when cancel button is clicked', () => {
    render(<AddToListModal {...mockProps} />);
    
    const cancelButton = screen.getByText('Отмена');
    fireEvent.click(cancelButton);
    
    expect(mockProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('should disable add button when no list selected', () => {
    render(<AddToListModal {...mockProps} lists={[]} />);
    
    const addButton = screen.getByText('Добавить');
    expect(addButton).toBeDisabled();
  });

  it('should show "Создать список" button when onCreateList provided', () => {
    const mockOnCreateList = vi.fn();
    render(<AddToListModal {...mockProps} onCreateList={mockOnCreateList} />);
    
    const createButton = screen.getByText('Создать список');
    expect(createButton).toBeInTheDocument();
    
    fireEvent.click(createButton);
    expect(mockOnCreateList).toHaveBeenCalledTimes(1);
  });

  it('should not show "Создать список" button when onCreateList not provided', () => {
    render(<AddToListModal {...mockProps} />);
    
    expect(screen.queryByText('Создать список')).not.toBeInTheDocument();
  });

  it('should render extra controls when provided', () => {
    const extraControls = <div data-testid="extra-controls">Extra</div>;
    render(<AddToListModal {...mockProps} extraControls={extraControls} />);
    
    expect(screen.getByTestId('extra-controls')).toBeInTheDocument();
  });

  it('should show "Нет списков" when lists is empty', () => {
    render(<AddToListModal {...mockProps} lists={[]} />);
    
    expect(screen.getByText('Нет списков')).toBeInTheDocument();
  });

  it('should select first list by default when modal opens', () => {
    render(<AddToListModal {...mockProps} />);
    
    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('1');
  });
});





