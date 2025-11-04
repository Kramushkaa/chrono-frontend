import React, { createContext, useContext, useMemo, useState, useRef, useEffect } from 'react'
import type { AuthState, AuthUser } from '../../features/auth/services/auth'
import * as authApi from '../../features/auth/services/auth'

// Optimized: Separate contexts for data and actions to prevent unnecessary re-renders
type AuthUserContextValue = {
  user: AuthUser | null
  isAuthenticated: boolean
  accessToken: string | null
}

type AuthActionsContextValue = {
  login: (login: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refresh: () => Promise<void>
  updateUser: (user: AuthUser) => void
}

// Legacy type for backward compatibility
type AuthContextValue = AuthUserContextValue & AuthActionsContextValue & { state: AuthState }

const defaultState: AuthState = { user: null, accessToken: null, refreshToken: null }

const AuthUserContext = createContext<AuthUserContextValue | undefined>(undefined)
const AuthActionsContext = createContext<AuthActionsContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(() => authApi.authStorage.load())
  const stateRef = useRef(state)

  // Keep ref in sync with state
  useEffect(() => {
    stateRef.current = state
  }, [state])

  // Listen for unauthorized events and clear auth state
  useEffect(() => {
    const handleUnauthorized = () => {
      setState(defaultState)
    }
    window.addEventListener('auth:unauthorized', handleUnauthorized as EventListener)
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized as EventListener)
    }
  }, [])

  // Actions are stable and memoized - don't cause re-renders
  const actions = useMemo<AuthActionsContextValue>(
    () => ({
      login: async (loginStr: string, password: string) => {
        const newState = await authApi.login({ login: loginStr, password })
        setState(newState)
      },
      logout: async () => {
        try {
          await authApi.logout(stateRef.current)
        } finally {
          setState(defaultState)
        }
      },
      refresh: async () => {
        try {
          const newState = await authApi.refresh(stateRef.current)
          setState(newState)
        } catch (error) {
          // If refresh fails, clear auth state
          setState(defaultState)
          throw error
        }
      },
      updateUser: (user: AuthUser) => {
        setState((prev) => ({ ...prev, user }))
      },
    }),
    []
  )

  // User data - only components using this will re-render on auth changes
  const userData = useMemo<AuthUserContextValue>(
    () => ({
      user: state.user,
      isAuthenticated: Boolean(state.user && state.accessToken),
      accessToken: state.accessToken,
    }),
    [state.user, state.accessToken]
  )

  return (
    <AuthActionsContext.Provider value={actions}>
      <AuthUserContext.Provider value={userData}>{children}</AuthUserContext.Provider>
    </AuthActionsContext.Provider>
  )
}

// Hook to get user data (causes re-render on auth changes)
export function useAuthUser(): AuthUserContextValue {
  const ctx = useContext(AuthUserContext)
  if (!ctx) throw new Error('useAuthUser must be used within AuthProvider')
  return ctx
}

// Hook to get auth actions (stable, doesn't cause re-renders)
export function useAuthActions(): AuthActionsContextValue {
  const ctx = useContext(AuthActionsContext)
  if (!ctx) throw new Error('useAuthActions must be used within AuthProvider')
  return ctx
}

// Combined hook for backward compatibility - use specific hooks where possible
export function useAuth(): AuthContextValue {
  const user = useAuthUser()
  const actions = useAuthActions()
  // Legacy: provide state for backward compatibility
  const state: AuthState = useMemo(
    () => ({
      user: user.user,
      accessToken: user.accessToken,
      refreshToken: null, // Not exposed in user context for security
    }),
    [user.user, user.accessToken]
  )
  return { ...user, ...actions, state }
}





