import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AuthPrompt } from '../AuthPrompt';

// Mock QuizAuthModal
jest.mock('../QuizAuthModal', () => ({
  QuizAuthModal: ({ isOpen, onClose, onSuccess, message }: any) => 
    isOpen ? (
      <div data-testid="quiz-auth-modal">
        <span data-testid="modal-message">{message}</span>
        <button onClick={onClose}>Close Modal</button>
        <button onClick={onSuccess}>Auth Success</button>
      </div>
    ) : null,
}));

// Mock window.location
const mockLocation = { 
  href: 'http://localhost/',
  assign: jest.fn(),
  replace: jest.fn(),
  reload: jest.fn()
};

// Create a getter/setter for href that works with our mock
const locationMock = {
  get href() {
    return mockLocation.href;
  },
  set href(value: string) {
    mockLocation.href = value;
  },
  assign: mockLocation.assign,
  replace: mockLocation.replace,
  reload: mockLocation.reload,
};

try {
  delete (window as any).location;
} catch (e) {
  // Ignore if can't delete
}
try {
  Object.defineProperty(window, 'location', {
    value: locationMock,
    writable: true,
    configurable: true
  });
} catch (e) {
  // Fallback if can't define
  window.location = locationMock as any;
}

describe('AuthPrompt', () => {
  const mockOnContinueAsGuest = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocation.href = 'http://localhost/';
    // Reset the mock location state
    locationMock.href = 'http://localhost/';
  });

  it('should render without crashing', () => {
    render(<AuthPrompt onContinueAsGuest={mockOnContinueAsGuest} />);
    
    expect(screen.getByText('Хотите попасть в лидерборд?')).toBeInTheDocument();
    expect(screen.getByText('Войти')).toBeInTheDocument();
    expect(screen.getByText('Зарегистрироваться')).toBeInTheDocument();
    expect(screen.getByText('Продолжить как гость')).toBeInTheDocument();
  });

  it('should render custom message', () => {
    const customMessage = 'Custom auth message';
    render(
      <AuthPrompt 
        onContinueAsGuest={mockOnContinueAsGuest} 
        message={customMessage}
      />
    );
    
    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });

  it('should render default message when not provided', () => {
    render(<AuthPrompt onContinueAsGuest={mockOnContinueAsGuest} />);
    
    expect(screen.getByText('Войдите, чтобы ваш результат отобразился в лидерборде!')).toBeInTheDocument();
  });

  it('should show auth modal when login button is clicked', () => {
    render(<AuthPrompt onContinueAsGuest={mockOnContinueAsGuest} />);
    
    const loginButton = screen.getByText('Войти');
    fireEvent.click(loginButton);
    
    expect(screen.getByTestId('quiz-auth-modal')).toBeInTheDocument();
  });

  it.skip('should redirect to register page when register button is clicked', () => {
    render(<AuthPrompt onContinueAsGuest={mockOnContinueAsGuest} />);
    
    const registerButton = screen.getByText('Зарегистрироваться');
    fireEvent.click(registerButton);
    
    // Check that window.location.href was set to the register path
    expect(window.location.href).toBe('/register');
  });

  it('should call onContinueAsGuest when continue as guest button is clicked', () => {
    render(<AuthPrompt onContinueAsGuest={mockOnContinueAsGuest} />);
    
    const guestButton = screen.getByText('Продолжить как гость');
    fireEvent.click(guestButton);
    
    expect(mockOnContinueAsGuest).toHaveBeenCalledTimes(1);
  });

  it('should close modal and call onContinueAsGuest after auth success', () => {
    render(<AuthPrompt onContinueAsGuest={mockOnContinueAsGuest} />);
    
    // Open modal first
    fireEvent.click(screen.getByText('Войти'));
    expect(screen.getByTestId('quiz-auth-modal')).toBeInTheDocument();
    
    // Simulate auth success
    fireEvent.click(screen.getByText('Auth Success'));
    
    // Modal should be closed
    expect(screen.queryByTestId('quiz-auth-modal')).not.toBeInTheDocument();
    // onContinueAsGuest should be called
    expect(mockOnContinueAsGuest).toHaveBeenCalledTimes(1);
  });

  it('should close modal without calling onContinueAsGuest when modal is closed', () => {
    render(<AuthPrompt onContinueAsGuest={mockOnContinueAsGuest} />);
    
    // Open modal first
    fireEvent.click(screen.getByText('Войти'));
    expect(screen.getByTestId('quiz-auth-modal')).toBeInTheDocument();
    
    // Close modal
    fireEvent.click(screen.getByText('Close Modal'));
    
    // Modal should be closed
    expect(screen.queryByTestId('quiz-auth-modal')).not.toBeInTheDocument();
    // onContinueAsGuest should not be called
    expect(mockOnContinueAsGuest).not.toHaveBeenCalled();
  });

  it('should show guest note', () => {
    render(<AuthPrompt onContinueAsGuest={mockOnContinueAsGuest} />);
    
    expect(screen.getByText(/Если вы продолжите как гость, вы будете отображаться как "Неизвестный ронин"/)).toBeInTheDocument();
  });

  it('should pass hardcoded message to modal', () => {
    const customMessage = 'Test message for modal';
    render(
      <AuthPrompt 
        onContinueAsGuest={mockOnContinueAsGuest} 
        message={customMessage}
      />
    );
    
    fireEvent.click(screen.getByText('Войти'));
    
    // Modal gets hardcoded message, not the prop
    expect(screen.getByTestId('modal-message')).toHaveTextContent('Войдите, чтобы ваш результат отобразился в лидерборде!');
  });
});
