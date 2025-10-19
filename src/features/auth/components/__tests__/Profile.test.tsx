import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Profile } from '../Profile';

// Mock context hooks
jest.mock('shared/context/AuthContext', () => ({
  useAuth: jest.fn(() => ({
    state: {
      accessToken: 'mock-token',
      user: { id: 1, email: 'test@test.com', role: 'user', email_verified: false },
    },
    logout: jest.fn(),
  })),
}));

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(() => jest.fn()),
}));

jest.mock('shared/context/ToastContext', () => ({
  useToast: jest.fn(() => ({
    showToast: jest.fn(),
  })),
}));

// Mock auth service functions
jest.mock('features/auth/services/auth', () => ({
  getProfile: jest.fn(),
  updateProfile: jest.fn(),
  changePassword: jest.fn(),
}));

jest.mock('shared/api/api', () => ({
  apiFetch: jest.fn(),
}));

import { getProfile, updateProfile, changePassword } from 'features/auth/services/auth';
import { apiFetch } from 'shared/api/api';

const mockGetProfile = getProfile as jest.MockedFunction<typeof getProfile>;
const mockUpdateProfile = updateProfile as jest.MockedFunction<typeof updateProfile>;
const mockChangePassword = changePassword as jest.MockedFunction<typeof changePassword>;
const mockApiFetch = apiFetch as jest.MockedFunction<typeof apiFetch>;

describe('Profile', () => {
  const mockProfile = {
    id: 1,
    email: 'test@test.com',
    username: 'testuser',
    full_name: 'Test User',
    role: 'user',
    email_verified: false,
    avatar_url: 'http://example.com/avatar.jpg',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    mockGetProfile.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<Profile />);
    
    expect(screen.getByText('Загрузка профиля...')).toBeInTheDocument();
  });

  it('renders profile data after loading', async () => {
    mockGetProfile.mockResolvedValue({ data: { user: mockProfile } });

    render(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('Личный кабинет')).toBeInTheDocument();
    });

    expect(screen.getByText('test@test.com')).toBeInTheDocument();
    expect(screen.getByText('testuser')).toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('user')).toBeInTheDocument();
    expect(screen.getByText('нет')).toBeInTheDocument();
  });

  it('renders error state when profile load fails', async () => {
    mockGetProfile.mockRejectedValue(new Error('Profile load failed'));

    render(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('Не удалось загрузить профиль')).toBeInTheDocument();
    });
  });

  it('shows email verification section when email is not verified', async () => {
    mockGetProfile.mockResolvedValue({ data: { user: mockProfile } });

    render(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('Подтверждение почты')).toBeInTheDocument();
    });

    expect(screen.getByText('Ваш email не подтвержден. Пожалуйста, перейдите по ссылке из письма.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /отправить письмо повторно/i })).toBeInTheDocument();
  });

  it('handles email verification resend', async () => {
    mockGetProfile.mockResolvedValue({ data: { user: mockProfile } });
    mockApiFetch.mockResolvedValue({ ok: true } as Response);

    render(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('Подтверждение почты')).toBeInTheDocument();
    });

    const resendButton = screen.getByRole('button', { name: /отправить письмо повторно/i });
    fireEvent.click(resendButton);

    await waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledWith('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer mock-token' },
      });
    });
  });

  it('enters edit mode when edit button is clicked', async () => {
    mockGetProfile.mockResolvedValue({ data: { user: mockProfile } });

    render(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('Личный кабинет')).toBeInTheDocument();
    });

    const editButton = screen.getByRole('button', { name: /редактировать/i });
    fireEvent.click(editButton);

    expect(screen.getByDisplayValue('testuser')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /отмена/i })).toBeInTheDocument();
  });

  it('cancels edit mode when cancel button is clicked', async () => {
    mockGetProfile.mockResolvedValue({ data: { user: mockProfile } });

    render(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('Личный кабинет')).toBeInTheDocument();
    });

    // Enter edit mode
    const editButton = screen.getByRole('button', { name: /редактировать/i });
    fireEvent.click(editButton);

    // Cancel edit mode
    const cancelButton = screen.getByRole('button', { name: /отмена/i });
    fireEvent.click(cancelButton);

    expect(screen.getByRole('button', { name: /редактировать/i })).toBeInTheDocument();
    expect(screen.queryByDisplayValue('testuser')).not.toBeInTheDocument();
  });

  it('updates profile when save button is clicked', async () => {
    mockGetProfile.mockResolvedValue({ data: { user: mockProfile } });
    mockUpdateProfile.mockResolvedValue({ data: { user: mockProfile } });

    render(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('Личный кабинет')).toBeInTheDocument();
    });

    // Enter edit mode
    const editButton = screen.getByRole('button', { name: /редактировать/i });
    fireEvent.click(editButton);

    // Update values
    const usernameInput = screen.getByDisplayValue('testuser');
    fireEvent.change(usernameInput, { target: { value: 'newusername' } });

    // Save changes
    const saveButton = screen.getByRole('button', { name: /сохранить/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalledWith('mock-token', {
        username: 'newusername',
        full_name: 'Test User',
        avatar_url: 'http://example.com/avatar.jpg',
      });
    });
  });

  it('handles password change', async () => {
    mockGetProfile.mockResolvedValue({ data: { user: mockProfile } });
    mockChangePassword.mockResolvedValue({ message: 'Password changed' });

    render(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('Личный кабинет')).toBeInTheDocument();
    });

    // Find and fill password form
    const currentPasswordInput = screen.getByPlaceholderText(/текущий пароль/i);
    const newPasswordInput = screen.getByPlaceholderText(/новый пароль/i);
    const confirmPasswordInput = screen.getByPlaceholderText(/подтвердите новый пароль/i);

    fireEvent.change(currentPasswordInput, { target: { value: 'oldpassword' } });
    fireEvent.change(newPasswordInput, { target: { value: 'newpassword' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'newpassword' } });

    const changePasswordButton = screen.getByRole('button', { name: /сменить пароль/i });
    fireEvent.click(changePasswordButton);

    await waitFor(() => {
      expect(mockChangePassword).toHaveBeenCalledWith('mock-token', {
        currentPassword: 'oldpassword',
        newPassword: 'newpassword',
      });
    });
  });

  it('validates password confirmation match', async () => {
    mockGetProfile.mockResolvedValue({ data: { user: mockProfile } });

    render(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('Личный кабинет')).toBeInTheDocument();
    });

    // Fill password form with mismatched passwords
    const currentPasswordInput = screen.getByPlaceholderText(/текущий пароль/i);
    const newPasswordInput = screen.getByPlaceholderText(/новый пароль/i);
    const confirmPasswordInput = screen.getByPlaceholderText(/подтвердите новый пароль/i);

    fireEvent.change(currentPasswordInput, { target: { value: 'oldpassword' } });
    fireEvent.change(newPasswordInput, { target: { value: 'newpassword' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'differentpassword' } });

    const changePasswordButton = screen.getByRole('button', { name: /сменить пароль/i });
    fireEvent.click(changePasswordButton);

    await waitFor(() => {
      expect(screen.getByText(/пароли не совпадают/i)).toBeInTheDocument();
    });

    expect(mockChangePassword).not.toHaveBeenCalled();
  });
});
