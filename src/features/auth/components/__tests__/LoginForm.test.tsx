import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { LoginForm } from '../LoginForm'
import { ToastProvider } from 'shared/context/ToastContext'

// Mock authApi
const mockLogin = jest.fn()
jest.mock('features/auth/services/auth', () => ({
  login: mockLogin,
}))

// Mock AuthContext properly including useAuth hook
const mockLoginContext = jest.fn().mockResolvedValue({})
jest.mock('shared/context/AuthContext', () => ({
  useAuth: () => ({
    login: mockLoginContext,
    logout: jest.fn(),
    refresh: jest.fn(),
    updateUser: jest.fn(),
  }),
  useAuthUser: () => ({
    user: null,
    isAuth: false,
    isLoading: false,
  }),
  useAuthActions: () => ({
    login: mockLoginContext,
    logout: jest.fn(),
    refresh: jest.fn(),
    updateUser: jest.fn(),
  }),
}))

// Mock useToast
jest.mock('shared/context/ToastContext', () => ({
  ...jest.requireActual('shared/context/ToastContext'),
  useToast: () => ({
    showToast: jest.fn(),
  }),
  ToastProvider: ({ children }: { children: React.ReactNode }) => children,
}))

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ToastProvider>
    {children}
  </ToastProvider>
)

describe('LoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render login form', () => {
    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    )
    
    expect(screen.getByText('Вход')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Логин или Email')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Пароль')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Войти' })).toBeInTheDocument()
  })

  it('should handle input changes', () => {
    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    )
    
    const loginInput = screen.getByPlaceholderText('Логин или Email')
    const passwordInput = screen.getByPlaceholderText('Пароль')
    
    fireEvent.change(loginInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    
    expect(loginInput).toHaveValue('test@example.com')
    expect(passwordInput).toHaveValue('password123')
  })

  it('should call onSuccess when provided and login succeeds', async () => {
    const mockOnSuccess = jest.fn()
    mockLoginContext.mockResolvedValue({})
    
    render(
      <TestWrapper>
        <LoginForm onSuccess={mockOnSuccess} />
      </TestWrapper>
    )
    
    const loginInput = screen.getByPlaceholderText('Логин или Email')
    const passwordInput = screen.getByPlaceholderText('Пароль')
    const submitButton = screen.getByRole('button', { name: 'Войти' })
    
    fireEvent.change(loginInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled()
    })
  })

  it('should show loading state during submission', async () => {
    mockLoginContext.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
    
    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    )
    
    const loginInput = screen.getByPlaceholderText('Логин или Email')
    const passwordInput = screen.getByPlaceholderText('Пароль')
    const submitButton = screen.getByRole('button', { name: 'Войти' })
    
    fireEvent.change(loginInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)
    
    expect(screen.getByText('Входим...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Входим...' })).toBeDisabled()
  })

  it('should show error on failed login', async () => {
    mockLoginContext.mockRejectedValue(new Error('Invalid credentials'))
    
    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    )
    
    const loginInput = screen.getByPlaceholderText('Логин или Email')
    const passwordInput = screen.getByPlaceholderText('Пароль')
    const submitButton = screen.getByRole('button', { name: 'Войти' })
    
    fireEvent.change(loginInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Неверный логин или пароль')).toBeInTheDocument()
    })
  })

  it('should require both fields to be filled', () => {
    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    )
    
    const loginInput = screen.getByPlaceholderText('Логин или Email')
    const passwordInput = screen.getByPlaceholderText('Пароль')
    
    expect(loginInput).toBeRequired()
    expect(passwordInput).toBeRequired()
  })

  it('should submit form on Enter key', () => {
    mockLoginContext.mockResolvedValue({})
    
    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    )
    
    // Find form by element tag since it doesn't have role="form"
    const form = document.querySelector('form')
    if (form) {
      fireEvent.submit(form)
    }
    
    expect(mockLoginContext).toHaveBeenCalled()
  })

  it('should not call onSuccess when not provided', async () => {
    mockLoginContext.mockResolvedValue({})
    
    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    )
    
    const loginInput = screen.getByPlaceholderText('Логин или Email')
    const passwordInput = screen.getByPlaceholderText('Пароль')
    const submitButton = screen.getByRole('button', { name: 'Войти' })
    
    fireEvent.change(loginInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(mockLoginContext).toHaveBeenCalledWith('test@example.com', 'password123')
    })
  })
})
