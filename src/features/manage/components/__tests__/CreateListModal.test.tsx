import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CreateListModal } from '../CreateListModal';

describe('CreateListModal', () => {
  const mockProps = {
    isOpen: true,
    onClose: jest.fn(),
    onCreate: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not render when isOpen is false', () => {
    render(<CreateListModal {...mockProps} isOpen={false} />);
    
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should render modal when isOpen is true', () => {
    render(<CreateListModal {...mockProps} />);
    
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Новый список')).toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    render(<CreateListModal {...mockProps} />);
    
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('should render input field with placeholder', () => {
    render(<CreateListModal {...mockProps} />);
    
    const input = screen.getByPlaceholderText('Название списка');
    expect(input).toBeInTheDocument();
  });

  it('should update input value when typing', () => {
    render(<CreateListModal {...mockProps} />);
    
    const input = screen.getByPlaceholderText('Название списка') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'My New List' } });
    
    expect(input.value).toBe('My New List');
  });

  it('should close modal when close button is clicked', () => {
    render(<CreateListModal {...mockProps} />);
    
    const closeButton = screen.getByText('✕');
    fireEvent.click(closeButton);
    
    expect(mockProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('should close modal when cancel button is clicked', () => {
    render(<CreateListModal {...mockProps} />);
    
    const cancelButton = screen.getByText('Отмена');
    fireEvent.click(cancelButton);
    
    expect(mockProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('should disable create button when title is empty', () => {
    render(<CreateListModal {...mockProps} />);
    
    const createButton = screen.getByText('Создать');
    expect(createButton).toBeDisabled();
  });

  it('should enable create button when title is not empty', () => {
    render(<CreateListModal {...mockProps} />);
    
    const input = screen.getByPlaceholderText('Название списка');
    fireEvent.change(input, { target: { value: 'My List' } });
    
    const createButton = screen.getByText('Создать');
    expect(createButton).not.toBeDisabled();
  });

  it('should not submit when title is only whitespace', () => {
    render(<CreateListModal {...mockProps} />);
    
    const input = screen.getByPlaceholderText('Название списка');
    fireEvent.change(input, { target: { value: '   ' } });
    
    const createButton = screen.getByText('Создать');
    expect(createButton).toBeDisabled();
  });

  it('should clear input when modal closes', () => {
    const { rerender } = render(<CreateListModal {...mockProps} />);
    
    const input = screen.getByPlaceholderText('Название списка') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'My List' } });
    expect(input.value).toBe('My List');
    
    // Close modal
    rerender(<CreateListModal {...mockProps} isOpen={false} />);
    
    // Reopen modal
    rerender(<CreateListModal {...mockProps} isOpen={true} />);
    
    const newInput = screen.getByPlaceholderText('Название списка') as HTMLInputElement;
    expect(newInput.value).toBe('');
  });
});

