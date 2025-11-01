import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Profile } from '../Profile';

// Mock context hooks
vi.mock('shared/context/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    state: {
      accessToken: 'mock-token',
      user: { id: 1, email: 'test@test.com', role: 'user', email_verified: false },
    },
    logout: vi.fn(),
  })),
}));

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(() => vi.fn()),
}));

vi.mock('shared/context/ToastContext', () => ({
  useToast: vi.fn(() => ({
    showToast: vi.fn(),
  })),
}));

// Mock auth service functions
vi.mock('features/auth/services/auth', () => ({
  getProfile: vi.fn(),
  updateProfile: vi.fn(),
  changePassword: vi.fn(),
}));

vi.mock('shared/api/api', () => ({
  apiFetch: vi.fn(),
}));

import { getProfile, updateProfile, changePassword } from 'features/auth/services/auth';
import { apiFetch } from 'shared/api/api';

const mockGetProfile = getProfile as vi.MockedFunction<typeof getProfile>;
const mockUpdateProfile = updateProfile as vi.MockedFunction<typeof updateProfile>;
const mockChangePassword = changePassword as vi.MockedFunction<typeof changePassword>;
const mockApiFetch = apiFetch as vi.MockedFunction<typeof apiFetch>;

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
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    mockGetProfile.mockImplementation(() => new Promise(() => {})); // Never resolves

    const { container } = render(<Profile />);
    
    // Component renders without errors
    expect(container.firstChild).toBeTruthy();
  });

  it('renders profile data after loading', async () => {
    mockGetProfile.mockResolvedValue({ data: { user: mockProfile } });

    render(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    // Email and other data appear in multiple places, so use getAllByText
    expect(screen.getAllByText('test@test.com').length).toBeGreaterThan(0);
    expect(screen.getByText('testuser')).toBeInTheDocument();
    expect(screen.getAllByText('Test User').length).toBeGreaterThan(0);
    expect(screen.getByText('user')).toBeInTheDocument();
    expect(screen.getAllByText(/Email не подтверждён/i).length).toBeGreaterThan(0);
  });

  it('renders error state when profile load fails', async () => {
    mockGetProfile.mockRejectedValue(new Error('Profile load failed'));

    render(<Profile />);

    await waitFor(() => {
      expect(screen.getByText(/Не удалось загрузить профиль/i)).toBeInTheDocument();
    });
  });

  it('shows email verification section when email is not verified', async () => {
    mockGetProfile.mockResolvedValue({ data: { user: mockProfile } });

    render(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('Подтверждение email')).toBeInTheDocument();
    });

    expect(screen.getByText(/Ваш email не подтверждён/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /отправить письмо повторно/i })).toBeInTheDocument();
  });

  it('handles email verification resend', async () => {
    mockGetProfile.mockResolvedValue({ data: { user: mockProfile } });
    mockApiFetch.mockResolvedValue({ ok: true } as Response);

    render(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('Подтверждение email')).toBeInTheDocument();
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
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    const editButton = screen.getByRole('button', { name: /✏️ редактировать/i });
    fireEvent.click(editButton);

    expect(screen.getByDisplayValue('testuser')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /отмена/i })).toBeInTheDocument();
  });

  it('cancels edit mode when cancel button is clicked', async () => {
    mockGetProfile.mockResolvedValue({ data: { user: mockProfile } });

    render(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    // Enter edit mode
    const editButton = screen.getByRole('button', { name: /✏️ редактировать/i });
    fireEvent.click(editButton);

    // Cancel edit mode
    const cancelButton = screen.getByRole('button', { name: /отмена/i });
    fireEvent.click(cancelButton);

    expect(screen.getByRole('button', { name: /✏️ редактировать/i })).toBeInTheDocument();
    expect(screen.queryByDisplayValue('testuser')).not.toBeInTheDocument();
  });

  it('updates profile when save button is clicked', async () => {
    mockGetProfile.mockResolvedValue({ data: { user: mockProfile } });
    mockUpdateProfile.mockResolvedValue({ data: { user: mockProfile } });

    render(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    // Enter edit mode
    const editButton = screen.getByRole('button', { name: /✏️ редактировать/i });
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
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    // Open password form by clicking the button
    const openPasswordFormButton = screen.getByRole('button', { name: /🔑 сменить пароль/i });
    fireEvent.click(openPasswordFormButton);

    // Wait for form to appear and fill password form
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/введите текущий пароль/i)).toBeInTheDocument();
    });

    const currentPasswordInput = screen.getByPlaceholderText(/введите текущий пароль/i);
    const newPasswordInput = screen.getByPlaceholderText(/минимум 8 символов/i);
    const confirmPasswordInput = screen.getByPlaceholderText(/повторите новый пароль/i);

    fireEvent.change(currentPasswordInput, { target: { value: 'oldpassword' } });
    fireEvent.change(newPasswordInput, { target: { value: 'newpassword123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'newpassword123' } });

    const savePasswordButton = screen.getByRole('button', { name: /сохранить новый пароль/i });
    fireEvent.click(savePasswordButton);

    await waitFor(() => {
      expect(mockChangePassword).toHaveBeenCalledWith('mock-token', {
        current_password: 'oldpassword',
        new_password: 'newpassword123',
      });
    });
  });

  it('validates password confirmation match', async () => {
    mockGetProfile.mockResolvedValue({ data: { user: mockProfile } });

    render(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    // Open password form
    const openPasswordFormButton = screen.getByRole('button', { name: /🔑 сменить пароль/i });
    fireEvent.click(openPasswordFormButton);

    // Wait for form to appear
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/введите текущий пароль/i)).toBeInTheDocument();
    });

    // Fill password form with mismatched passwords
    const currentPasswordInput = screen.getByPlaceholderText(/введите текущий пароль/i);
    const newPasswordInput = screen.getByPlaceholderText(/минимум 8 символов/i);
    const confirmPasswordInput = screen.getByPlaceholderText(/повторите новый пароль/i);

    fireEvent.change(currentPasswordInput, { target: { value: 'oldpassword' } });
    fireEvent.change(newPasswordInput, { target: { value: 'newpassword123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'differentpassword' } });

    const savePasswordButton = screen.getByRole('button', { name: /сохранить новый пароль/i });
    fireEvent.click(savePasswordButton);

    await waitFor(() => {
      expect(screen.getByText(/новые пароли не совпадают/i)).toBeInTheDocument();
    });

    expect(mockChangePassword).not.toHaveBeenCalled();
  });
});




