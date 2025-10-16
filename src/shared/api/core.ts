import { authStorage } from '../../features/auth/services/auth'

// API configuration
const getApiConfig = () => {
  const isDevelopment = process.env.NODE_ENV === 'development'
  const isLocalBackend = process.env.REACT_APP_USE_LOCAL_BACKEND === 'true'
  
  const lsForcedApiUrl =
    typeof window !== 'undefined' && window.localStorage
      ? window.localStorage.getItem('FORCE_API_URL') || undefined
      : undefined
  const forcedApiUrl = lsForcedApiUrl || process.env.REACT_APP_FORCE_API_URL

  const LOCAL_BACKEND_URL = process.env.REACT_APP_LOCAL_BACKEND_URL || 'http://localhost:3001'
  const REMOTE_BACKEND_URL =
    process.env.REACT_APP_REMOTE_BACKEND_URL || 'https://chrono-back-kramushka.amvera.io'

  let apiUrl: string
  if (forcedApiUrl) {
    apiUrl = forcedApiUrl
  } else if (isDevelopment && isLocalBackend) {
    apiUrl = LOCAL_BACKEND_URL
  } else {
    apiUrl = process.env.REACT_APP_API_URL || REMOTE_BACKEND_URL
  }

  return {
    baseUrl: apiUrl,
    timeout: 10000,
    retries: 2,
  }
}

export const API_CONFIG = getApiConfig()
export const API_BASE_URL = API_CONFIG.baseUrl

/**
 * Low-level API request with retry logic and timeout
 * Retries failed requests with exponential backoff
 * 
 * @param url - Full URL to request
 * @param options - Fetch options
 * @returns Response object
 * @throws Error if all retries fail
 */
export const apiRequest = async (url: string, options: RequestInit = {}): Promise<Response> => {
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= API_CONFIG.retries; attempt++) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout)

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      return response
    } catch (error) {
      lastError = error as Error

      if (attempt < API_CONFIG.retries) {
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000))
      }
    }
  }

  throw lastError || new Error('API request failed after all retries')
}

/**
 * Auth-aware fetch with automatic 401 handling and token refresh
 * Adds Authorization header automatically if access token present
 * Refreshes token and retries request on 401 response
 */
let isRefreshing = false
let pendingRequests: Array<() => void> = []

async function refreshTokenIfNeeded(): Promise<void> {
  if (isRefreshing) {
    await new Promise<void>((resolve) => pendingRequests.push(resolve))
    return
  }
  isRefreshing = true
  try {
    const state = authStorage.load()
    if (!state.refreshToken) throw new Error('No refresh token')
    const res = await apiRequest(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: state.refreshToken }),
    })
    if (!res.ok) throw new Error('Refresh failed')
    const data = await res.json()
    const newState = {
      user: data?.data?.user || state.user,
      accessToken: data?.data?.access_token || null,
      refreshToken: data?.data?.refresh_token || state.refreshToken,
    }
    authStorage.save(newState)
  } finally {
    isRefreshing = false
    pendingRequests.forEach((resolve) => resolve())
    pendingRequests = []
  }
}

/**
 * Main API fetch function with auth and retry logic
 * 
 * Features:
 * - Automatic Authorization header injection
 * - 401 handling with token refresh
 * - Retry on 401 with new token
 * - Automatic logout on permanent 401
 * 
 * @param path - API path (e.g., '/api/persons')
 * @param init - Fetch options
 * @returns Response object
 * 
 * @example
 * ```typescript
 * const response = await apiFetch('/api/persons', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify(data)
 * })
 * ```
 */
export async function apiFetch(path: string, init: RequestInit = {}) {
  const url = `${API_BASE_URL}${path}`
  const state = authStorage.load()
  const headers = new Headers(init.headers || {})
  if (state.accessToken && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${state.accessToken}`)
  }
  
  try {
    const res = await apiRequest(url, { ...init, headers })
    if (res.status !== 401) return res
    
    // Try refresh and retry once
    await refreshTokenIfNeeded()
    const refreshed = authStorage.load()
    const retryHeaders = new Headers(init.headers || {})
    if (refreshed.accessToken) retryHeaders.set('Authorization', `Bearer ${refreshed.accessToken}`)
    const retryRes = await apiRequest(url, { ...init, headers: retryHeaders })
    
    if (retryRes.status === 401) {
      try {
        authStorage.clear()
      } catch {}
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        try {
          window.dispatchEvent(new CustomEvent('auth:unauthorized', { detail: { path } }))
        } catch {}
      }
    }
    return retryRes
  } catch (e) {
    throw e
  }
}

// Unified JSON parsing helpers and API response types
export type ApiErrorPayload = { message?: string; error?: string; error_message?: string } & Record<string, unknown>
export type ApiError = Error & { status?: number; payload?: ApiErrorPayload }

// Standard API response wrapper
export interface ApiResponse<T> {
  data: T
  message?: string
  status?: string
}

// Type guard to check if response is wrapped
export function isWrappedResponse<T>(payload: unknown): payload is ApiResponse<T> {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'data' in payload
  )
}

async function parseResponseJson<T = unknown>(res: Response): Promise<T> {
  let body: unknown = null
  try {
    body = await (res.clone ? res.clone().json() : res.json())
  } catch {
    try {
      const text = await res.text()
      try {
        body = JSON.parse(text)
      } catch {
        body = { message: text } as ApiErrorPayload
      }
    } catch {}
  }
  if (!res.ok) {
    const payload = (body || {}) as ApiErrorPayload
    const message = (payload && (payload.message || payload.error || payload.error_message)) || `HTTP ${res.status}`
    const err: ApiError = new Error(typeof message === 'string' ? message : 'Request failed')
    err.status = res.status
    err.payload = payload
    throw err
  }
  return body as T
}

/**
 * Fetch and parse JSON response
 * Handles errors and throws with proper error messages
 * 
 * @param path - API path
 * @param init - Fetch options
 * @returns Parsed JSON response
 */
export async function apiJson<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await apiFetch(path, init)
  return parseResponseJson(res)
}

/**
 * Fetch and extract data from standard API response format
 * Handles both { data: T } and direct T responses
 * 
 * @param path - API path
 * @param init - Fetch options
 * @returns Extracted data
 */
export async function apiData<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  const payload = await apiJson<{ data?: T } | T>(path, init)
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as { data: T }).data
  }
  return payload as T
}

// Test connection to backend
export const testBackendConnection = async (): Promise<boolean> => {
  try {
    const response = await apiRequest(`${API_BASE_URL}/api/health`)
    return response.ok
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') console.error('Backend connection test failed:', error)
    return false
  }
}

// Get backend info
export const getBackendInfo = () => {
  return {
    baseUrl: API_BASE_URL,
    isLocal: API_BASE_URL.includes('localhost'),
    config: API_CONFIG,
  }
}

// Export utilities for backend switching
export const getApiCandidates = () => {
  const LOCAL_BACKEND_URL = process.env.REACT_APP_LOCAL_BACKEND_URL || 'http://localhost:3001'
  const REMOTE_BACKEND_URL =
    process.env.REACT_APP_REMOTE_BACKEND_URL || 'https://chrono-back-kramushka.amvera.io'
  const current = API_BASE_URL
  return { local: LOCAL_BACKEND_URL, remote: REMOTE_BACKEND_URL, current }
}

export const applyBackendOverride = (url?: string) => {
  if (typeof window === 'undefined' || !window.localStorage) return
  if (url && url.trim().length > 0) {
    window.localStorage.setItem('FORCE_API_URL', url.trim())
  } else {
    window.localStorage.removeItem('FORCE_API_URL')
  }
  window.location.reload()
}

// Text normalization utility
export const maybePercentDecode = (input: unknown): string => {
  if (typeof input !== 'string') return ''
  if (!/%[0-9A-Fa-f]{2}/.test(input)) return input
  try {
    return decodeURIComponent(input)
  } catch {
    return input
  }
}

