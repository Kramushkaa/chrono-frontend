import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';
import type { AuthState, AuthUser } from '../../features/auth/services/auth';
import * as authApi from '../../features/auth/services/auth';

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  state: AuthState;
  login: (login: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const defaultState: AuthState = { user: null, accessToken: null, refreshToken: null };

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(() => authApi.authStorage.load());

  const login = useCallback(async (loginStr: string, password: string) => {
    const newState = await authApi.login({ login: loginStr, password });
    setState(newState);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout(state);
    } finally {
      setState(defaultState);
    }
  }, [state]);

  const refresh = useCallback(async () => {
    const newState = await authApi.refresh(state);
    setState(newState);
  }, [state]);

  const value: AuthContextValue = useMemo(() => ({
    user: state.user,
    isAuthenticated: Boolean(state.user && state.accessToken),
    state,
    login,
    logout,
    refresh,
  }), [state, login, logout, refresh]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}


