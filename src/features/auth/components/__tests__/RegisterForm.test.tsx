import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

// Mock auth service BEFORE importing the component
// mockRegister is now accessed via mockAuthApi.register

jest.mock('features/auth/services/auth', () => ({
  register: jest.fn(),
  login: jest.fn(),
}))

import { RegisterForm } from '../RegisterForm'
import { ToastProvider } from 'shared/context/ToastContext'
import * as authApi from 'features/auth/services/auth'

const mockAuthApi = authApi as jest.Mocked<typeof authApi>

// Mock AuthContext properly
const mockLogin = jest.fn()
jest.mock('shared/context/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
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
    login: mockLogin,
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

describe('RegisterForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockLogin.mockClear()
  })

  it('should render registration form', () => {
    render(
      <TestWrapper>
        <RegisterForm />
      </TestWrapper>
    )
    
    expect(screen.getByText('Регистрация')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Пароль')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Логин')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Имя пользователя')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Зарегистрироваться' })).toBeInTheDocument()
  })

  it('should handle input changes', () => {
    render(
      <TestWrapper>
        <RegisterForm />
      </TestWrapper>
    )
    
    const emailInput = screen.getByPlaceholderText('Email')
    const passwordInput = screen.getByPlaceholderText('Пароль')
    const loginInput = screen.getByPlaceholderText('Логин')
    const userNameInput = screen.getByPlaceholderText('Имя пользователя')
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'Password123' } })
    fireEvent.change(loginInput, { target: { value: 'testuser' } })
    fireEvent.change(userNameInput, { target: { value: 'Test User' } })
    
    expect(emailInput).toHaveValue('test@example.com')
    expect(passwordInput).toHaveValue('Password123')
    expect(loginInput).toHaveValue('testuser')
    expect(userNameInput).toHaveValue('Test User')
  })

  it('should validate email format', async () => {
    // Setup the mock to prevent the api call during validation
    mockAuthApi.register.mockResolvedValue({})
    
    render(
      <TestWrapper>
        <RegisterForm />
      </TestWrapper>
    )
    
    const emailInput = screen.getByPlaceholderText('Email')
    const passwordInput = screen.getByPlaceholderText('Пароль')
    const form = emailInput.closest('form')
    
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
    fireEvent.change(passwordInput, { target: { value: 'Password123' } })
    fireEvent.submit(form!)
    
    // Validation should happen before the API call
    await waitFor(() => {
      expect(screen.getByText(/Некорректный email/)).toBeInTheDocument()
    })
  })

  it('should validate password requirements', async () => {
    mockAuthApi.register.mockResolvedValue({})
    
    render(
      <TestWrapper>
        <RegisterForm />
      </TestWrapper>
    )
    
    const emailInput = screen.getByPlaceholderText('Email')
    const passwordInput = screen.getByPlaceholderText('Пароль')
    const submitButton = screen.getByRole('button', { name: 'Зарегистрироваться' })
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'weak' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      const passwordErrors = screen.getAllByText(/Пароль: минимум 8 символов/)
      expect(passwordErrors.length).toBeGreaterThan(0)
    })
  })

  it('should validate login format when provided', async () => {
    mockAuthApi.register.mockResolvedValue({})
    
    render(
      <TestWrapper>
        <RegisterForm />
      </TestWrapper>
    )
    
    const emailInput = screen.getByPlaceholderText('Email')
    const passwordInput = screen.getByPlaceholderText('Пароль')
    const loginInput = screen.getByPlaceholderText('Логин')
    const submitButton = screen.getByRole('button', { name: 'Зарегистрироваться' })
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'Password123' } })
    fireEvent.change(loginInput, { target: { value: 'invalid login!' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/Логин: только латинские буквы/)).toBeInTheDocument()
    })
  })

  it('should show loading state during submission', async () => {
    mockAuthApi.register.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
    
    render(
      <TestWrapper>
        <RegisterForm />
      </TestWrapper>
    )
    
    const emailInput = screen.getByPlaceholderText('Email')
    const passwordInput = screen.getByPlaceholderText('Пароль')
    const submitButton = screen.getByRole('button', { name: 'Зарегистрироваться' })
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'Password123' } })
    fireEvent.click(submitButton)
    
    // Wait for loading state
    await waitFor(() => {
      expect(screen.getByText('Регистрируем...')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Регистрируем...' })).toBeDisabled()
    })
  })

  it('should call onSuccess when registration succeeds', async () => {
    const mockOnSuccess = jest.fn()
    mockAuthApi.register.mockResolvedValue({})
    
    render(
      <TestWrapper>
        <RegisterForm onSuccess={mockOnSuccess} />
      </TestWrapper>
    )
    
    const emailInput = screen.getByPlaceholderText('Email')
    const passwordInput = screen.getByPlaceholderText('Пароль')
    const submitButton = screen.getByRole('button', { name: 'Зарегистрироваться' })
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'Password123' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled()
    })
  })

  it('should show error on failed registration', async () => {
    mockAuthApi.register.mockRejectedValue(new Error('Email already exists'))
    
    render(
      <TestWrapper>
        <RegisterForm />
      </TestWrapper>
    )
    
    const emailInput = screen.getByPlaceholderText('Email')
    const passwordInput = screen.getByPlaceholderText('Пароль')
    const submitButton = screen.getByRole('button', { name: 'Зарегистрироваться' })
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'Password123' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/Email already exists/)).toBeInTheDocument()
    })
  })

  it('should require email and password fields', () => {
    render(
      <TestWrapper>
        <RegisterForm />
      </TestWrapper>
    )
    
    const emailInput = screen.getByPlaceholderText('Email')
    const passwordInput = screen.getByPlaceholderText('Пароль')
    
    expect(emailInput).toBeRequired()
    expect(passwordInput).toBeRequired()
  })

  it('should display password requirements', () => {
    render(
      <TestWrapper>
        <RegisterForm />
      </TestWrapper>
    )
    
    expect(screen.getByText(/Пароль: минимум 8 символов/)).toBeInTheDocument()
  })

  it('should handle multiple validation errors', async () => {
    mockAuthApi.register.mockResolvedValue({})
    
    render(
      <TestWrapper>
        <RegisterForm />
      </TestWrapper>
    )
    
    const emailInput = screen.getByPlaceholderText('Email')
    const passwordInput = screen.getByPlaceholderText('Пароль')
    const form = emailInput.closest('form')
    
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
    fireEvent.change(passwordInput, { target: { value: 'weak' } })
    fireEvent.submit(form!)
    
    await waitFor(() => {
      expect(screen.getByText(/Некорректный email/)).toBeInTheDocument()
      const passwordErrors = screen.getAllByText(/Пароль: минимум 8 символов/)
      expect(passwordErrors.length).toBeGreaterThan(0)
    })
  })
})
