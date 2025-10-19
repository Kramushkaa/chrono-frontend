import { authStorage, register, login, refresh, getProfile, logout, changePassword, updateProfile, AuthState, AuthUser } from '../auth';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock apiFetch
jest.mock('shared/api/api', () => ({
  apiFetch: jest.fn(),
}));

import { apiFetch } from 'shared/api/api';
const mockApiFetch = apiFetch as jest.MockedFunction<typeof apiFetch>;

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
  });

  describe('authStorage', () => {
    it('should load auth state from localStorage', () => {
      const mockState: AuthState = {
        user: { id: 1, email: 'test@test.com', role: 'user', email_verified: true },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockState));

      const result = authStorage.load();

      expect(localStorageMock.getItem).toHaveBeenCalledWith('auth');
      expect(result).toEqual(mockState);
    });

    it('should return default state when localStorage is empty', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = authStorage.load();

      expect(result).toEqual({
        user: null,
        accessToken: null,
        refreshToken: null,
      });
    });

    it('should return default state when localStorage has invalid JSON', () => {
      localStorageMock.getItem.mockReturnValue('invalid-json');

      const result = authStorage.load();

      expect(result).toEqual({
        user: null,
        accessToken: null,
        refreshToken: null,
      });
    });

    it('should save auth state to localStorage', () => {
      const mockState: AuthState = {
        user: { id: 1, email: 'test@test.com', role: 'user', email_verified: true },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      authStorage.save(mockState);

      expect(localStorageMock.setItem).toHaveBeenCalledWith('auth', JSON.stringify(mockState));
    });

    it('should clear auth state from localStorage', () => {
      authStorage.clear();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth');
    });
  });

  describe('register', () => {
    it('should successfully register a user', async () => {
      const mockResponse = { message: 'Registration successful' };
      mockApiFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const payload = {
        email: 'test@test.com',
        password: 'password123',
        username: 'testuser',
      };

      const result = await register(payload);

      expect(mockApiFetch).toHaveBeenCalledWith('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      expect(result).toEqual(mockResponse);
    });

    it('should throw error when registration fails', async () => {
      const mockResponse = { message: 'Email already exists' };
      mockApiFetch.mockResolvedValue({
        ok: false,
        json: async () => mockResponse,
      } as Response);

      const payload = {
        email: 'test@test.com',
        password: 'password123',
      };

      await expect(register(payload)).rejects.toThrow('Email already exists');
    });

    it('should handle network error during registration', async () => {
      mockApiFetch.mockRejectedValue(new Error('Network error'));

      const payload = {
        email: 'test@test.com',
        password: 'password123',
      };

      await expect(register(payload)).rejects.toThrow('Network error');
    });

    it('should handle timeout during registration', async () => {
      mockApiFetch.mockRejectedValue(new Error('Request timeout'));

      const payload = {
        email: 'test@test.com',
        password: 'password123',
        username: 'testuser',
      };

      await expect(register(payload)).rejects.toThrow('Request timeout');
    });
  });

  describe('login', () => {
    it('should successfully login and save state', async () => {
      const mockAuthData = {
        data: {
          user: { id: 1, email: 'test@test.com', role: 'user', email_verified: true },
          access_token: 'access-token',
          refresh_token: 'refresh-token',
        },
      };
      mockApiFetch.mockResolvedValue({
        ok: true,
        json: async () => mockAuthData,
      } as Response);

      const payload = {
        login: 'test@test.com',
        password: 'password123',
      };

      const result = await login(payload);

      expect(mockApiFetch).toHaveBeenCalledWith('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      expect(localStorageMock.setItem).toHaveBeenCalled();
      expect(result).toEqual({
        user: mockAuthData.data.user,
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
    });

    it('should throw error when login fails', async () => {
      mockApiFetch.mockResolvedValue({
        ok: false,
      } as Response);

      const payload = {
        login: 'test@test.com',
        password: 'wrongpassword',
      };

      await expect(login(payload)).rejects.toThrow('Login failed');
    });

    it('should handle network error during login', async () => {
      mockApiFetch.mockRejectedValue(new Error('Network error'));

      const payload = {
        login: 'test@test.com',
        password: 'password123',
      };

      await expect(login(payload)).rejects.toThrow('Network error');
    });

    it('should handle malformed response during login', async () => {
      mockApiFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ invalid: 'response' }), // Missing data field
      } as Response);

      const payload = {
        login: 'test@test.com',
        password: 'password123',
      };

      const result = await login(payload);

      // Should handle malformed response gracefully with null values
      expect(result).toEqual({
        user: null,
        accessToken: null,
        refreshToken: null,
      });
    });
  });

  describe('refresh', () => {
    it('should successfully refresh tokens', async () => {
      const currentState: AuthState = {
        user: { id: 1, email: 'test@test.com', role: 'user', email_verified: true },
        accessToken: 'old-access-token',
        refreshToken: 'refresh-token',
      };

      const mockAuthData = {
        data: {
          user: { id: 1, email: 'test@test.com', role: 'user', email_verified: true },
          access_token: 'new-access-token',
        },
      };
      mockApiFetch.mockResolvedValue({
        ok: true,
        json: async () => mockAuthData,
      } as Response);

      const result = await refresh(currentState);

      expect(mockApiFetch).toHaveBeenCalledWith('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: 'refresh-token' }),
      });
      expect(localStorageMock.setItem).toHaveBeenCalled();
      expect(result).toEqual({
        user: mockAuthData.data.user,
        accessToken: 'new-access-token',
        refreshToken: 'refresh-token',
      });
    });

    it('should throw error when no refresh token', async () => {
      const currentState: AuthState = {
        user: null,
        accessToken: null,
        refreshToken: null,
      };

      await expect(refresh(currentState)).rejects.toThrow('No refresh token');
    });

    it('should throw error when refresh fails', async () => {
      const currentState: AuthState = {
        user: { id: 1, email: 'test@test.com', role: 'user', email_verified: true },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      mockApiFetch.mockResolvedValue({
        ok: false,
      } as Response);

      await expect(refresh(currentState)).rejects.toThrow('Refresh failed');
    });
  });

  describe('getProfile', () => {
    it('should successfully fetch user profile', async () => {
      const mockProfile = { data: { user: { id: 1, email: 'test@test.com' } } };
      mockApiFetch.mockResolvedValue({
        ok: true,
        json: async () => mockProfile,
      } as Response);

      const result = await getProfile('access-token');

      expect(mockApiFetch).toHaveBeenCalledWith('/api/auth/profile', {
        headers: { 'Authorization': 'Bearer access-token' },
      });
      expect(result).toEqual(mockProfile);
    });

    it('should throw error when profile fetch fails', async () => {
      mockApiFetch.mockResolvedValue({
        ok: false,
      } as Response);

      await expect(getProfile('invalid-token')).rejects.toThrow('Profile fetch failed');
    });
  });

  describe('logout', () => {
    it('should successfully logout and clear storage', async () => {
      const currentState: AuthState = {
        user: { id: 1, email: 'test@test.com', role: 'user', email_verified: true },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      mockApiFetch.mockResolvedValue({
        ok: true,
      } as Response);

      await logout(currentState);

      expect(mockApiFetch).toHaveBeenCalledWith('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer access-token',
        },
        body: JSON.stringify({ refresh_token: 'refresh-token' }),
      });
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth');
    });

    it('should logout without access token', async () => {
      const currentState: AuthState = {
        user: null,
        accessToken: null,
        refreshToken: 'refresh-token',
      };

      mockApiFetch.mockResolvedValue({
        ok: true,
      } as Response);

      await logout(currentState);

      expect(mockApiFetch).toHaveBeenCalledWith('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: 'refresh-token' }),
      });
    });

    it('should throw error when logout fails', async () => {
      const currentState: AuthState = {
        user: { id: 1, email: 'test@test.com', role: 'user', email_verified: true },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      mockApiFetch.mockResolvedValue({
        ok: false,
      } as Response);

      await expect(logout(currentState)).rejects.toThrow('Logout failed');
    });
  });

  describe('updateProfile', () => {
    it('should successfully update user profile', async () => {
      const mockResponse = { message: 'Profile updated successfully' };
      mockApiFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const payload = {
        username: 'newusername',
        full_name: 'New User Name',
        avatar_url: 'https://example.com/avatar.jpg',
      };

      const result = await updateProfile('access-token', payload);

      expect(mockApiFetch).toHaveBeenCalledWith('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer access-token',
        },
        body: JSON.stringify(payload),
      });
      expect(result).toEqual(mockResponse);
    });

    it('should update profile with partial data', async () => {
      const mockResponse = { message: 'Profile updated successfully' };
      mockApiFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const payload = {
        username: 'updatedusername',
      };

      const result = await updateProfile('access-token', payload);

      expect(mockApiFetch).toHaveBeenCalledWith('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer access-token',
        },
        body: JSON.stringify(payload),
      });
      expect(result).toEqual(mockResponse);
    });

    it('should throw error when profile update fails', async () => {
      const mockError = { message: 'Username already taken' };
      mockApiFetch.mockResolvedValue({
        ok: false,
        json: async () => mockError,
      } as Response);

      const payload = {
        username: 'takenusername',
      };

      await expect(updateProfile('access-token', payload)).rejects.toThrow('Username already taken');
    });

    it('should handle network error in profile update', async () => {
      mockApiFetch.mockRejectedValue(new Error('Network error'));

      const payload = {
        username: 'testusername',
      };

      await expect(updateProfile('access-token', payload)).rejects.toThrow('Network error');
    });
  });

  describe('changePassword', () => {
    it('should successfully change password', async () => {
      mockApiFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ message: 'Password changed' }),
      } as Response);

      const payload = {
        current_password: 'oldpassword',
        new_password: 'newpassword',
      };

      const result = await changePassword('access-token', payload);

      expect(mockApiFetch).toHaveBeenCalledWith('/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer access-token',
        },
        body: JSON.stringify(payload),
      });
      expect(result).toEqual({ message: 'Password changed' });
    });

    it('should throw error when password change fails', async () => {
      const mockError = { message: 'Invalid current password' };
      mockApiFetch.mockResolvedValue({
        ok: false,
        json: async () => mockError,
      } as Response);

      const payload = {
        current_password: 'wrongpassword',
        new_password: 'newpassword',
      };

      await expect(changePassword('access-token', payload)).rejects.toThrow('Invalid current password');
    });

    it('should handle network error in password change', async () => {
      mockApiFetch.mockRejectedValue(new Error('Network error'));

      const payload = {
        current_password: 'oldpassword',
        new_password: 'newpassword',
      };

      await expect(changePassword('access-token', payload)).rejects.toThrow('Network error');
    });
  });
});
