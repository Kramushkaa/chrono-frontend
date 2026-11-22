import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CreateListModal } from '../CreateListModal';

describe('CreateListModal', () => {
  const mockProps = {
    isOpen: true,
    onClose: vi.fn(),
    onCreate: vi.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    vi.clearAllMocks();
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

  it('should show error message when onCreate fails', async () => {
    const mockOnCreate = vi.fn().mockRejectedValue(new Error('Server error'));
    const props = { ...mockProps, onCreate: mockOnCreate };
    
    render(<CreateListModal {...props} />);
    
    const input = screen.getByPlaceholderText('Название списка');
    fireEvent.change(input, { target: { value: 'My List' } });
    
    const createButton = screen.getByText('Создать');
    fireEvent.click(createButton);
    
    // Wait for error to appear
    await screen.findByText('Server error');
    expect(screen.getByText('Server error')).toBeInTheDocument();
    
    // Modal should still be open
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('should call onError callback when onCreate fails', async () => {
    const mockOnError = vi.fn();
    const mockOnCreate = vi.fn().mockRejectedValue(new Error('Network error'));
    const props = { ...mockProps, onCreate: mockOnCreate, onError: mockOnError };
    
    render(<CreateListModal {...props} />);
    
    const input = screen.getByPlaceholderText('Название списка');
    fireEvent.change(input, { target: { value: 'My List' } });
    
    const createButton = screen.getByText('Создать');
    fireEvent.click(createButton);
    
    // Wait for error handling
    await screen.findByText('Network error');
    
    expect(mockOnError).toHaveBeenCalledWith('Network error');
  });

  it('should show validation error when trying to create with empty title', async () => {
    render(<CreateListModal {...mockProps} />);
    
    const input = screen.getByPlaceholderText('Название списка');
    fireEvent.change(input, { target: { value: '   ' } });
    
    // Try to click create button (it should be disabled)
    const createButton = screen.getByText('Создать');
    expect(createButton).toBeDisabled();
  });

  it('should clear error when user starts typing', async () => {
    const mockOnCreate = vi.fn().mockRejectedValue(new Error('Server error'));
    const props = { ...mockProps, onCreate: mockOnCreate };
    
    render(<CreateListModal {...props} />);
    
    const input = screen.getByPlaceholderText('Название списка');
    fireEvent.change(input, { target: { value: 'My List' } });
    
    const createButton = screen.getByText('Создать');
    fireEvent.click(createButton);
    
    // Wait for error to appear
    await screen.findByText('Server error');
    expect(screen.getByText('Server error')).toBeInTheDocument();
    
    // Start typing again
    fireEvent.change(input, { target: { value: 'My New List' } });
    
    // Error should be cleared
    expect(screen.queryByText('Server error')).not.toBeInTheDocument();
  });

  it('should show loading state while creating', async () => {
    const mockOnCreate = vi.fn(() => new Promise(resolve => setTimeout(resolve, 100)));
    const props = { ...mockProps, onCreate: mockOnCreate };
    
    render(<CreateListModal {...props} />);
    
    const input = screen.getByPlaceholderText('Название списка');
    fireEvent.change(input, { target: { value: 'My List' } });
    
    const createButton = screen.getByText('Создать');
    fireEvent.click(createButton);
    
    // Should show loading state
    expect(screen.getByText('Создание...')).toBeInTheDocument();
    expect(createButton).toBeDisabled();
  });
});





